const { db } = require('../config/db');

/**
 * Generate incremental serial number for orders
 */
const generateSerialNo = () => {
    try {
        const lastOrder = db.prepare(`
            SELECT serial_no FROM orders 
            WHERE serial_no LIKE 'ORD-%' 
            ORDER BY order_id DESC 
            LIMIT 1
        `).get();
        
        let nextNumber = 1;
        if (lastOrder && lastOrder.serial_no) {
            const match = lastOrder.serial_no.match(/ORD-(\d{3})/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        
        return `ORD-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        const timestamp = Date.now();
        return `ORD-${timestamp.toString().slice(-3).padStart(3, '0')}`;
    }
};

/**
 * Generate serial numbers for items based on product code and quantity
 * Format: <product_code><3-digit-sequence>
 * Example: DFT-P001, DFT-P002, etc.
 */
const generateItemSerialNumbers = (productCode, quantity) => {
    const serialNumbers = [];
    
    // Get the highest existing serial number for this product code
    const maxSerial = db.prepare(`
        SELECT serial_number 
        FROM serial_allocations 
        WHERE product_code = ?
        ORDER BY serial_number DESC
        LIMIT 1
    `).get(productCode);
    
    // Extract the numeric part and start from the next number
    let startNumber = 1;
    if (maxSerial) {
        const numericPart = maxSerial.serial_number.replace(productCode, '');
        startNumber = parseInt(numericPart) + 1;
    }
    
    // Generate the required quantity of serial numbers
    for (let i = 0; i < quantity; i++) {
        const serialNumber = `${productCode}${(startNumber + i).toString().padStart(3, '0')}`;
        serialNumbers.push(serialNumber);
    }
    
    return serialNumbers;
};

/**
 * Allocate available serial numbers for buy orders
 * Finds the lowest available serial numbers for each product in ascending order
 * @param {string} productCode - The product code (e.g., 'DFT-P')
 * @param {number} quantity - Number of serials needed
 * @param {number} buyOrderId - The buy order ID for allocation tracking
 * @returns {array} Array of allocated serial numbers
 */
const allocateSerialNumbers = (productCode, quantity, buyOrderId) => {
    // Find available serial numbers in ascending order
    const availableSerials = db.prepare(`
        SELECT serial_number 
        FROM serial_allocations 
        WHERE product_code = ? AND buy_order_id IS NULL
        ORDER BY serial_number ASC
        LIMIT ?
    `).all(productCode, quantity);

    if (availableSerials.length < quantity) {
        throw new Error(`Insufficient stock: Only ${availableSerials.length} units available for product code ${productCode}, but ${quantity} requested`);
    }

    // Update allocations to mark these serials as allocated
    const updateAllocation = db.prepare(`
        UPDATE serial_allocations 
        SET buy_order_id = ?, allocated_at = CURRENT_TIMESTAMP
        WHERE serial_number = ?
    `);

    const allocatedSerials = [];
    for (const serial of availableSerials) {
        updateAllocation.run(buyOrderId, serial.serial_number);
        allocatedSerials.push(serial.serial_number);
    }

    return allocatedSerials;
};

/**
 * Create buy order directly from cart using cart_id foreign key
 * @route POST /api/orders/buy
 * @access Private (buyer role)
 */
const createBuyOrder = async (req, res) => {
    try {
        const { cart_id, payment_method } = req.body;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Validate required fields
        if (!cart_id) {
            return res.status(400).json({
                success: false,
                message: 'cart_id is required to link order with cart'
            });
        }

        // Verify cart belongs to the user by checking if cart has items for this user
        const cartCheck = db.prepare(`
            SELECT COUNT(*) as count FROM cart WHERE cart_id = ?
        `).get(parseInt(cart_id));

        if (!cartCheck || cartCheck.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart is empty or does not exist'
            });
        }

        // Verify cart_id matches user_id (cart_id should be the user's ID)
        if (parseInt(cart_id) !== parseInt(user_id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to cart'
            });
        }

        if (!payment_method || !['cash', 'upi'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Payment method must be either cash or upi'
            });
        }

        const transaction = db.transaction(() => {
            // Dynamic role assignment - auto-assign "buyer" role if user has no role or different role
            if (user_role !== 'buyer') {
                const updateUserRole = db.prepare(`
                    UPDATE users 
                    SET role = 'buyer', updated_at = CURRENT_TIMESTAMP 
                    WHERE user_id = ?
                `);
                updateUserRole.run(user_id);
                
                console.log(`🏷️  Auto-assigned 'buyer' role to user ${user_id} (previous role: ${user_role || 'NULL'})`);
            }

            // Get all items from the cart
            const cartItems = db.prepare(`
                SELECT c.cart_id, c.product_id, c.quantity, 
                       p.product_name, p.product_variant, p.product_price, p.product_code
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = ?
            `).all(cart_id);

            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Calculate total amount and total quantity for the entire order
            let orderTotalAmount = 0;
            let totalQuantity = 0;
            const orderItems = [];

            // FIRST: Validate stock availability BEFORE processing the order
            const checkStock = db.prepare(`
                SELECT quantity, product_code FROM products WHERE product_id = ?
            `);

            for (const cartItem of cartItems) {
                const { product_id, quantity, product_code } = cartItem;
                const currentStock = checkStock.get(product_id);
                
                if (!currentStock) {
                    throw new Error(`Product not found: ${product_code || product_id}`);
                }
                
                if (currentStock.quantity < quantity) {
                    throw new Error(`Insufficient stock available for product ${currentStock.product_code} (requested: ${quantity}, available: ${currentStock.quantity})`);
                }
            }

            // Process each cart item and calculate totals after validation passes
            for (const cartItem of cartItems) {
                const { product_id, quantity, product_name, product_variant, product_price, product_code } = cartItem;
                const itemTotal = quantity * product_price;
                orderTotalAmount += itemTotal;
                totalQuantity += quantity; // Sum of all quantities

                orderItems.push({
                    product_id,
                    product_name,
                    product_variant,
                    product_code,
                    quantity,
                    price_per_item: product_price,
                    item_total: itemTotal
                });
            }

            // Process FIFO allocation for sellers (existing logic)
            for (const cartItem of cartItems) {
                const { product_id, quantity } = cartItem;

                // Handle FIFO allocation for sellers (existing logic)
                const availableSellOrders = db.prepare(`
                    SELECT order_id, user_id, quantity, total_amount, created_at
                    FROM orders 
                    WHERE product_id = ? 
                      AND order_type = 'sell' 
                      AND status = 'pending' 
                      AND quantity > 0
                    ORDER BY created_at ASC
                `).all(product_id);

                let remainingQuantity = quantity;

                // Allocate from available sell orders using FIFO
                for (const sellOrder of availableSellOrders) {
                    if (remainingQuantity <= 0) break;

                    const currentAllocation = Math.min(remainingQuantity, sellOrder.quantity);

                    // Update sell order quantity
                    const newSellQuantity = sellOrder.quantity - currentAllocation;
                    const newSellStatus = newSellQuantity === 0 ? 'completed' : 'pending';
                    
                    db.prepare(`
                        UPDATE orders 
                        SET quantity = ?, status = ? 
                        WHERE order_id = ?
                    `).run(newSellQuantity, newSellStatus, sellOrder.order_id);

                    remainingQuantity -= currentAllocation;
                }
            }

            // Generate unique serial number for the single order
            const serialNo = generateSerialNo();

            // Create ONE buy order for the entire cart (use first product_id for compatibility)
            const insertResult = db.prepare(`
                INSERT INTO orders (
                    user_id, serial_no, order_type, product_id, quantity, 
                    cart_id, total_amount, payment_method, status
                ) VALUES (?, ?, 'buy', ?, ?, ?, ?, ?, 'pending')
            `).run(user_id, serialNo, orderItems[0].product_id, totalQuantity, cart_id, orderTotalAmount, payment_method);

            const orderId = insertResult.lastInsertRowid;

            // Update product quantities - DECREASE for buy orders (buyer consumes inventory)
            const updateProductQuantity = db.prepare(`
                UPDATE products 
                SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ?
            `);

            // Insert all items into order_items table with allocated serial numbers
            const insertOrderItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, quantity, price_per_item, item_total, serial_numbers)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const item of orderItems) {
                // Decrease product quantity in inventory
                updateProductQuantity.run(item.quantity, item.product_id);

                // Allocate serial numbers for this item
                const allocatedSerials = allocateSerialNumbers(item.product_code, item.quantity, orderId);
                
                // Add allocated serials to the item for response
                item.serial_numbers = allocatedSerials;

                insertOrderItem.run(
                    orderId, 
                    item.product_id, 
                    item.quantity, 
                    item.price_per_item, 
                    item.item_total,
                    JSON.stringify(allocatedSerials) // Store as JSON string
                );
            }

            // Clear the cart after creating order
            db.prepare(`DELETE FROM cart WHERE cart_id = ?`).run(cart_id);

            return {
                order_id: orderId,
                serial_no: serialNo,
                total_amount: orderTotalAmount,
                payment_method: payment_method,
                status: 'pending',
                items: orderItems,
                total_items: totalQuantity
            };
        });

        const result = transaction();
        
        res.status(201).json({
            success: true,
            message: 'Buy order created successfully from cart',
            data: {
                buyer_id: user_id,
                cart_id: cart_id,
                order: result
            }
        });
    } catch (error) {
        console.error('Create buy order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create buy order'
        });
    }
};

/**
 * Create sell order from cart
 * @route POST /api/orders/sell
 * @access Private (seller role)
 */
const createSellOrder = async (req, res) => {
    try {
        const { cart_id, payment_method = 'cash' } = req.body;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Validate required fields
        if (!cart_id) {
            return res.status(400).json({
                success: false,
                message: 'cart_id is required to link sell order with cart'
            });
        }

        // Verify cart belongs to the seller by checking if cart has items for this user
        const cartCheck = db.prepare(`
            SELECT COUNT(*) as count FROM cart WHERE cart_id = ?
        `).get(parseInt(cart_id));

        if (!cartCheck || cartCheck.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart is empty or does not exist'
            });
        }

        // Verify cart_id matches user_id (cart_id should be the seller's ID)
        if (parseInt(cart_id) !== parseInt(user_id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to cart'
            });
        }

        if (!payment_method || !['cash', 'upi'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Payment method must be either cash or upi'
            });
        }

        const transaction = db.transaction(() => {
            // Dynamic role assignment - auto-assign "seller" role if user has no role or different role
            if (user_role !== 'seller') {
                const updateUserRole = db.prepare(`
                    UPDATE users 
                    SET role = 'seller', updated_at = CURRENT_TIMESTAMP 
                    WHERE user_id = ?
                `);
                updateUserRole.run(user_id);
                
                console.log(`🏷️  Auto-assigned 'seller' role to user ${user_id} (previous role: ${user_role || 'NULL'})`);
            }
            // Get all items from the seller's cart with product codes
            const cartItems = db.prepare(`
                SELECT c.cart_id, c.product_id, c.quantity, 
                       p.product_name, p.product_variant, p.product_price, p.product_code
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = ?
            `).all(cart_id);

            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Calculate total amount and total quantity for the entire order
            let orderTotalAmount = 0;
            let totalQuantity = 0;
            const orderItems = [];

            // Process each cart item and calculate totals
            for (const cartItem of cartItems) {
                const { product_id, quantity, product_name, product_variant, product_price, product_code } = cartItem;
                const itemTotal = quantity * product_price;
                orderTotalAmount += itemTotal;
                totalQuantity += quantity; // Sum of all quantities

                // Generate serial numbers for this item based on quantity
                const serialNumbers = generateItemSerialNumbers(product_code, quantity);

                orderItems.push({
                    product_id,
                    product_name,
                    product_variant,
                    quantity,
                    price_per_item: product_price,
                    item_total: itemTotal,
                    serial_numbers: serialNumbers
                });
            }

            // Generate unique serial number for the single order
            const serialNo = generateSerialNo();

            // Create ONE sell order for the entire cart (use first product_id for compatibility)
            const insertResult = db.prepare(`
                INSERT INTO orders (
                    user_id, serial_no, order_type, product_id, quantity, 
                    cart_id, total_amount, payment_method, status
                ) VALUES (?, ?, 'sell', ?, ?, ?, ?, ?, 'pending')
            `).run(user_id, serialNo, orderItems[0].product_id, totalQuantity, cart_id, orderTotalAmount, payment_method);

            const orderId = insertResult.lastInsertRowid;

            // Update product quantities - INCREASE for sell orders (seller adds inventory)
            const updateProductQuantity = db.prepare(`
                UPDATE products 
                SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ?
            `);

            // Insert all items into order_items table with serial numbers
            const insertOrderItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, quantity, price_per_item, item_total, serial_numbers)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            // Insert serial number allocations for tracking
            const insertSerialAllocation = db.prepare(`
                INSERT INTO serial_allocations (product_code, serial_number, sell_order_id)
                VALUES (?, ?, ?)
            `);

            for (const item of orderItems) {
                // Increase product quantity in inventory
                updateProductQuantity.run(item.quantity, item.product_id);

                insertOrderItem.run(
                    orderId, 
                    item.product_id, 
                    item.quantity, 
                    item.price_per_item, 
                    item.item_total,
                    JSON.stringify(item.serial_numbers) // Store as JSON string
                );

                // Insert each serial number into allocation table as available
                for (const serialNumber of item.serial_numbers) {
                    const productCode = serialNumber.replace(/\d{3}$/, ''); // Extract product code
                    insertSerialAllocation.run(productCode, serialNumber, orderId);
                }
            }

            // Clear the cart after creating order
            db.prepare(`DELETE FROM cart WHERE cart_id = ?`).run(cart_id);

            return {
                order_id: orderId,
                serial_no: serialNo,
                total_amount: orderTotalAmount,
                payment_method: payment_method,
                status: 'pending',
                items: orderItems,
                total_items: totalQuantity
            };
        });

        const result = transaction();
        
        res.status(201).json({
            success: true,
            message: 'Sell order created successfully from cart',
            data: {
                seller_id: user_id,
                order: result
            }
        });
    } catch (error) {
        console.error('Create sell order error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create sell order'
        });
    }
};

/**
 * Get buy orders for authenticated user
 * @route GET /api/orders/buy
 * @access Private (buyer role)
 */
const getBuyOrders = async (req, res) => {
    try {
        const user_id = req.user.userId;
    const { status } = req.query;

        let whereClause = 'WHERE o.user_id = ?';
        let queryParams = [user_id];

        if (status) {
            whereClause += ' AND o.status = ?';
            queryParams.push(status);
        }


        // Get buy orders with their items from order_items table
        const orders = db.prepare(`
            SELECT o.order_id, o.serial_no, o.quantity as total_items, o.cart_id,
                   o.total_amount, o.payment_method, o.status, o.created_at
            FROM orders o
            ${whereClause}
            AND (o.order_type = 'buy' OR o.order_type IS NULL)
            ORDER BY o.created_at DESC
        `).all(...queryParams);

        // For each order, get its items from order_items table
        const ordersWithItems = orders.map(order => {
            const orderItems = db.prepare(`
                SELECT oi.product_id, oi.quantity, oi.price_per_item, oi.item_total, oi.serial_numbers,
                       p.product_name, p.product_variant
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
                ORDER BY oi.created_at
            `).all(order.order_id);

            // Parse serial_numbers from JSON string (allocated serials for buy orders)
            const itemsWithSerialNumbers = orderItems.map(item => ({
                ...item,
                serial_numbers: item.serial_numbers ? JSON.parse(item.serial_numbers) : []
            }));

            return {
                ...order,
                items: itemsWithSerialNumbers
            };
        });


        res.json({
            success: true,
            data: {
                orders: ordersWithItems
            }
        });
    } catch (error) {
        console.error('Get buy orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve buy orders'
        });
    }
};

/**
 * Get sell orders for authenticated user
 * @route GET /api/orders/sell
 * @access Private (seller role)
 */
const getSellOrders = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { status } = req.query;

        let whereClause = 'WHERE o.user_id = ?';
        let queryParams = [user_id];

        if (status) {
            whereClause += ' AND o.status = ?';
            queryParams.push(status);
        }

        // Get sell orders with their items from order_items table
        const orders = db.prepare(`
            SELECT o.order_id, o.serial_no, o.quantity as total_items, o.cart_id,
                   o.total_amount, o.payment_method, o.status, o.created_at
            FROM orders o
            ${whereClause}
            AND o.order_type = 'sell'
            ORDER BY o.created_at DESC
        `).all(...queryParams);

        // For each order, get its items from order_items table
        const ordersWithItems = orders.map(order => {
            const orderItems = db.prepare(`
                SELECT oi.product_id, oi.quantity, oi.price_per_item, oi.item_total, oi.serial_numbers,
                       p.product_name, p.product_variant
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = ?
                ORDER BY oi.created_at
            `).all(order.order_id);

            // Parse serial_numbers from JSON string and add to each item
            const itemsWithSerialNumbers = orderItems.map(item => ({
                ...item,
                serial_numbers: item.serial_numbers ? JSON.parse(item.serial_numbers) : []
            }));

            return {
                ...order,
                items: itemsWithSerialNumbers
            };
        });

        res.json({
            success: true,
            data: {
                orders: ordersWithItems
            }
        });
    } catch (error) {
        console.error('Get sell orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve sell orders'
        });
    }
};

/**
 * Get specific order by ID
 * @route GET /api/orders/:orderId
 * @access Private
 */
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        const order = db.prepare(`
            SELECT o.order_id, o.serial_no, o.order_type, o.quantity, o.cart_id,
                   o.total_amount, o.payment_method, o.status, o.created_at,
                   o.user_id, p.product_name, p.product_variant, p.product_price,
                   u.user_name, u.user_email
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            JOIN users u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `).get(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization (users can only see their own orders, admins can see all)
        if (user_role !== 'admin' && order.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order'
        });
    }
};

/**
 * Update buy order
 * @route PUT /api/orders/buy/:orderId
 * @access Private (buyer role)
 */
const updateBuyOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user_id = req.user.userId;
        const updates = req.body;

        // Verify order exists and belongs to user
        const existingOrder = db.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND user_id = ? AND order_type = 'buy'
        `).get(orderId, user_id);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Buy order not found or unauthorized'
            });
        }

        // Build update query dynamically
        const allowedFields = ['status', 'payment_method', 'quantity'];
        const updateFields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(orderId);

        const updateQuery = `
            UPDATE orders 
            SET ${updateFields.join(', ')} 
            WHERE order_id = ?
        `;

        db.prepare(updateQuery).run(...values);

        // Get updated order
        const updatedOrder = db.prepare(`
            SELECT o.*, p.product_name, p.product_variant 
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.order_id = ?
        `).get(orderId);

        res.json({
            success: true,
            message: 'Buy order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update buy order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update buy order'
        });
    }
};

/**
 * Update sell order
 * @route PUT /api/orders/sell/:orderId
 * @access Private (seller role)
 */
const updateSellOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user_id = req.user.userId;
        const updates = req.body;

        // Verify order exists and belongs to user
        const existingOrder = db.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND user_id = ? AND order_type = 'sell'
        `).get(orderId, user_id);

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Sell order not found or unauthorized'
            });
        }

        // Build update query dynamically
        const allowedFields = ['status', 'quantity', 'total_amount'];
        const updateFields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(orderId);

        const updateQuery = `
            UPDATE orders 
            SET ${updateFields.join(', ')} 
            WHERE order_id = ?
        `;

        db.prepare(updateQuery).run(...values);

        // Get updated order
        const updatedOrder = db.prepare(`
            SELECT o.*, p.product_name, p.product_variant 
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.order_id = ?
        `).get(orderId);

        res.json({
            success: true,
            message: 'Sell order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update sell order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update sell order'
        });
    }
};

module.exports = {
    createBuyOrder,
    createSellOrder,
    getBuyOrders,
    getSellOrders,
    getOrderById,
    updateBuyOrder,
    updateSellOrder
};