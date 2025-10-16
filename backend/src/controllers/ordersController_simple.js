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
 * Create buy order directly from cart using cart_id foreign key
 * @route POST /api/orders/buy
 * @access Private (buyer role)
 */
const createBuyOrder = async (req, res) => {
    try {
        const { cart_id, payment_method } = req.body;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Validate buyer role
        if (user_role !== 'buyer') {
            return res.status(403).json({
                success: false,
                message: 'Only buyers can create buy orders'
            });
        }

        // Validate required fields
        if (!cart_id) {
            return res.status(400).json({
                success: false,
                message: 'cart_id is required to link order with cart'
            });
        }

        // Verify cart belongs to the user
        if (cart_id !== user_id) {
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
            // Get all items from the cart
            const cartItems = db.prepare(`
                SELECT c.cart_id, c.product_id, c.quantity, 
                       p.product_name, p.product_variant, p.product_price
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = ?
            `).all(cart_id);

            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            const createdOrders = [];

            for (const cartItem of cartItems) {
                const { product_id, quantity, product_name, product_variant, product_price } = cartItem;

                // Find available sell orders for this product (FIFO - oldest first)
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
                let allocatedQuantity = 0;

                // Allocate from available sell orders using FIFO
                for (const sellOrder of availableSellOrders) {
                    if (remainingQuantity <= 0) break;

                    const currentAllocation = Math.min(remainingQuantity, sellOrder.quantity);
                    allocatedQuantity += currentAllocation;

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

                // Calculate total amount for this order
                const totalAmount = quantity * product_price;

                // Generate unique serial number
                const serialNo = generateSerialNo();

                // Create buy order linked to cart using cart_id foreign key
                const insertResult = db.prepare(`
                    INSERT INTO orders (
                        user_id, serial_no, order_type, product_id, quantity, 
                        cart_id, total_amount, payment_method, status
                    ) VALUES (?, ?, 'buy', ?, ?, ?, ?, ?, 'pending')
                `).run(user_id, serialNo, product_id, quantity, cart_id, totalAmount, payment_method);

                createdOrders.push({
                    order_id: insertResult.lastInsertRowid,
                    serial_no: serialNo,
                    product_name: product_name,
                    product_variant: product_variant,
                    quantity: quantity,
                    allocated_quantity: allocatedQuantity,
                    cart_id: cart_id,
                    total_amount: totalAmount,
                    payment_method: payment_method,
                    status: 'pending'
                });
            }

            // Clear the cart after creating orders
            db.prepare(`DELETE FROM cart WHERE cart_id = ?`).run(cart_id);

            return createdOrders;
        });

        const result = transaction();
        
        res.status(201).json({
            success: true,
            message: 'Buy order created successfully from cart',
            data: {
                buyer_id: user_id,
                cart_id: cart_id,
                total_orders: result.length,
                orders: result
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
 * Create sell order
 * @route POST /api/orders/sell
 * @access Private (seller role)
 */
const createSellOrder = async (req, res) => {
    try {
        const { product_name, product_variant, product_price, quantity, product_images } = req.body;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Validate seller role
        if (user_role !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can create sell orders'
            });
        }

        // Validate required fields
        if (!product_name || !product_variant || !product_price || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product name, variant, price, and quantity are required'
            });
        }

        // Find or create product
        let product = db.prepare(`
            SELECT product_id FROM products 
            WHERE product_name = ? AND product_variant = ?
        `).get(product_name, product_variant);

        let product_id;
        if (!product) {
            // Create new product
            const newProduct = db.prepare(`
                INSERT INTO products (product_name, product_variant, product_price, product_images, quantity)
                VALUES (?, ?, ?, ?, 0)
            `).run(product_name, product_variant, product_price, product_images || '');
            product_id = newProduct.lastInsertRowid;
        } else {
            product_id = product.product_id;
        }

        // Calculate total amount
        const total_amount = product_price * quantity;

        // Generate serial number
        const serial_no = generateSerialNo();

        // Create sell order (cart_id is NULL for sell orders)
        const insertResult = db.prepare(`
            INSERT INTO orders (
                user_id, serial_no, order_type, product_id, quantity, 
                cart_id, total_amount, payment_method, status
            ) VALUES (?, ?, 'sell', ?, ?, NULL, ?, 'cash', 'pending')
        `).run(user_id, serial_no, product_id, quantity, total_amount);

        res.status(201).json({
            success: true,
            message: 'Sell order created successfully',
            data: {
                order_id: insertResult.lastInsertRowid,
                serial_no: serial_no,
                order_type: 'sell',
                product_name: product_name,
                product_variant: product_variant,
                quantity: quantity,
                total_amount: total_amount,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Create sell order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create sell order'
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
        const { status, page = 1, limit = 10 } = req.query;

        let whereClause = 'WHERE o.user_id = ? AND o.order_type = \'buy\'';
        let queryParams = [user_id];

        if (status) {
            whereClause += ' AND o.status = ?';
            queryParams.push(status);
        }

        const offset = (page - 1) * limit;

        // Get orders with cart information
        const orders = db.prepare(`
            SELECT o.order_id, o.serial_no, o.order_type, o.quantity, o.cart_id,
                   o.total_amount, o.payment_method, o.status, o.created_at,
                   p.product_name, p.product_variant, p.product_price
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `).all(...queryParams, limit, offset);

        // Get total count
        const totalCount = db.prepare(`
            SELECT COUNT(*) as total
            FROM orders o
            ${whereClause}
        `).get(...queryParams);

        res.json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalCount.total / limit),
                    total_orders: totalCount.total,
                    orders_per_page: parseInt(limit)
                }
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
        const { status, page = 1, limit = 10 } = req.query;

        let whereClause = 'WHERE o.user_id = ? AND o.order_type = \'sell\'';
        let queryParams = [user_id];

        if (status) {
            whereClause += ' AND o.status = ?';
            queryParams.push(status);
        }

        const offset = (page - 1) * limit;

        const orders = db.prepare(`
            SELECT o.order_id, o.serial_no, o.order_type, o.quantity,
                   o.total_amount, o.payment_method, o.status, o.created_at,
                   p.product_name, p.product_variant, p.product_price
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `).all(...queryParams, limit, offset);

        const totalCount = db.prepare(`
            SELECT COUNT(*) as total
            FROM orders o
            ${whereClause}
        `).get(...queryParams);

        res.json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalCount.total / limit),
                    total_orders: totalCount.total,
                    orders_per_page: parseInt(limit)
                }
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