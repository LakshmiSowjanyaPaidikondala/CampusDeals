const { db } = require('../config/db');

/**
 * Generate incremental serial number for orders
 */
const generateSerialNo = () => {
    try {
        // Get the highest existing serial number
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
        // Fallback if query fails
        const timestamp = Date.now();
        return `ORD-${timestamp.toString().slice(-3).padStart(3, '0')}`;
    }
};

/**
 * Generate incremental product ID
 */
const generateProductId = () => {
    try {
        // Get the highest existing product_id
        const lastProduct = db.prepare(`
            SELECT product_id FROM products 
            ORDER BY product_id DESC 
            LIMIT 1
        `).get();
        
        let nextId = 1;
        if (lastProduct && lastProduct.product_id) {
            nextId = lastProduct.product_id + 1;
        }
        
        return nextId;
    } catch (error) {
        console.error('Error generating product ID:', error);
        // Fallback to timestamp-based ID if query fails
        return Date.now();
    }
};

/**
 * Generate incremental product code per product type
 */
const generateProductCode = (productName) => {
    try {
        const productCodePrefix = {
            'drafter': 'DFT',
            'white_lab_coat': 'WLC',
            'brown_lab_coat': 'BLC',
            'calculator': 'CALC',
            'chartbox': 'CHB'
        };

        const prefix = productCodePrefix[productName];
        
        // Get the highest existing product code for this specific product type
        const lastProduct = db.prepare(`
            SELECT product_code FROM products 
            WHERE product_code LIKE '${prefix}-%' 
            ORDER BY CAST(SUBSTR(product_code, LENGTH('${prefix}') + 2) AS INTEGER) DESC
            LIMIT 1
        `).get();
        
        let nextNumber = 1;
        if (lastProduct && lastProduct.product_code) {
            const match = lastProduct.product_code.match(new RegExp(`${prefix}-(\\d+)`));
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        
        return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating product code:', error);
        // Fallback if query fails
        const productCodePrefix = {
            'drafter': 'DFT',
            'white_lab_coat': 'WLC',
            'brown_lab_coat': 'BLC',
            'calculator': 'CALC',
            'chartbox': 'CHB'
        };
        const prefix = productCodePrefix[productName] || 'PRD';
        return `${prefix}-001`;
    }
};

/**
 * Create a new buy order from cart items
 * @route POST /api/orders/buy
 * @access Private (buyer role)
 */
const createBuyOrder = async (req, res) => {
    try {
        const { cart_items, payment_method } = req.body;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Validate buyer role
        if (user_role !== 'buyer') {
            return res.status(403).json({
                success: false,
                message: 'Only buyers can create buy orders'
            });
        }

        // Validate required fields - cart_items is mandatory for order creation
        if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart items array is required and cannot be empty. Orders must reference cart table.'
            });
        }

        if (!payment_method || !['cash', 'upi'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Payment method must be either cash or upi'
            });
        }

        // Validate each cart item and calculate total
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of cart_items) {
            const { cart_id, product_id, quantity } = item;

            // Each item must have cart_id to reference cart table
            if (!cart_id || !product_id || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Each cart item must have cart_id, product_id, and quantity to reference cart table'
                });
            }

            // Verify cart item exists and belongs to user (mandatory cart table reference)
            const cartItem = db.prepare(`
                SELECT c.cart_id, c.product_id, c.quantity as cart_quantity,
                       p.product_name, p.product_variant, p.product_price, 
                       p.quantity as stock_quantity, p.product_code, p.product_images
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.cart_id = ? AND c.product_id = ?
            `).get(cart_id, product_id);

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: `Cart item with ID ${cart_id} not found or doesn't belong to you. Order must reference existing cart items.`
                });
            }

            if (cartItem.stock_quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${cartItem.product_name}. Only ${cartItem.stock_quantity} items available`
                });
            }

            const itemTotal = cartItem.product_price * quantity;
            totalAmount += itemTotal;

            validatedItems.push({
                cart_id,
                product_id,
                quantity,
                product_name: cartItem.product_name,
                product_variant: cartItem.product_variant,
                product_price: cartItem.product_price,
                itemTotal
            });
        }

        // Create orders in transaction
        const transaction = db.transaction(() => {
            const createdOrders = [];

            for (const item of validatedItems) {
                // Generate serial number for each order
                const serial_no = generateSerialNo();

                // Insert order
                const insertOrder = db.prepare(`
                    INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status)
                    VALUES (?, ?, ?, ?, ?, 'pending')
                `);
                
                const orderResult = insertOrder.run(user_id, serial_no, item.product_id, item.itemTotal, payment_method);
                
                // Update product stock
                const updateStock = db.prepare(`
                    UPDATE products 
                    SET quantity = quantity - ?
                    WHERE product_id = ?
                `);
                
                updateStock.run(item.quantity, item.product_id);

                // Remove item from cart
                const removeFromCart = db.prepare(`
                    DELETE FROM cart 
                    WHERE cart_id = ?
                `);
                
                removeFromCart.run(item.cart_id);

                createdOrders.push({
                    order_id: orderResult.lastInsertRowid,
                    serial_no: serial_no,
                    product_name: item.product_name,
                    product_variant: item.product_variant,
                    quantity: item.quantity,
                    product_price: item.product_price,
                    total_amount: item.itemTotal,
                    payment_method: payment_method,
                    status: 'pending'
                });
            }

            return createdOrders;
        });

        const result = transaction();

        res.status(201).json({
            success: true,
            message: 'Buy orders created successfully',
            data: {
                orders: result,
                total_orders: result.length,
                grand_total: totalAmount,
                payment_method: payment_method
            }
        });

    } catch (error) {
        console.error('Error creating buy order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Create a new sell order (when someone wants to sell their product)
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

        // Validate product name and variant according to schema constraints
        const validProductNames = ['drafter', 'white_lab_coat', 'brown_lab_coat', 'calculator', 'chartbox'];
        const validVariants = {
            'drafter': ['premium_drafter', 'standard_drafter', 'budget_drafter'],
            'white_lab_coat': ['S', 'M', 'L', 'XL', 'XXL'],
            'brown_lab_coat': ['S', 'M', 'L', 'XL', 'XXL'],
            'calculator': ['MS', 'ES', 'ES-Plus'],
            'chartbox': ['chart holder']
        };

        if (!validProductNames.includes(product_name)) {
            return res.status(400).json({
                success: false,
                message: `Invalid product name. Must be one of: ${validProductNames.join(', ')}`
            });
        }

        if (!validVariants[product_name].includes(product_variant)) {
            return res.status(400).json({
                success: false,
                message: `Invalid variant for ${product_name}. Must be one of: ${validVariants[product_name].join(', ')}`
            });
        }

        // Check if seller already has this exact product (same name, variant, and price)
        const existingProduct = db.prepare(`
            SELECT p.product_id, p.quantity, p.product_code
            FROM products p
            JOIN orders o ON p.product_id = o.product_id
            WHERE o.user_id = ? 
            AND p.product_name = ? 
            AND p.product_variant = ? 
            AND p.product_price = ?
            AND COALESCE(p.product_images, '') = COALESCE(?, '')
            ORDER BY p.product_id DESC
            LIMIT 1
        `).get(user_id, product_name, product_variant, product_price, product_images || '');

        let productResult, orderResult;
        let product_code, serial_no, generated_product_id;

        // Begin transaction
        const transaction = db.transaction(() => {
            if (existingProduct) {
                // Update existing product quantity
                const updateProduct = db.prepare(`
                    UPDATE products 
                    SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = ?
                `);
                
                updateProduct.run(quantity, existingProduct.product_id);
                
                product_code = existingProduct.product_code;
                generated_product_id = existingProduct.product_id;
                productResult = { lastInsertRowid: existingProduct.product_id };
                
                // Update the existing order's total amount
                const updateOrder = db.prepare(`
                    UPDATE orders 
                    SET total_amount = total_amount + ?
                    WHERE product_id = ? AND user_id = ?
                `);
                
                updateOrder.run(product_price * quantity, existingProduct.product_id, user_id);
                
                // Get the updated order details
                const orderDetails = db.prepare(`
                    SELECT order_id, serial_no FROM orders 
                    WHERE product_id = ? AND user_id = ?
                    ORDER BY order_id DESC LIMIT 1
                `).get(existingProduct.product_id, user_id);
                
                orderResult = { lastInsertRowid: orderDetails.order_id };
                serial_no = orderDetails.serial_no;
            } else {
                // Generate new product ID and code
                generated_product_id = generateProductId();
                product_code = generateProductCode(product_name);
                
                // Create new product with auto-generated ID
                const insertProduct = db.prepare(`
                    INSERT INTO products (product_id, product_name, product_variant, product_code, product_price, product_images, quantity)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                
                productResult = insertProduct.run(generated_product_id, product_name, product_variant, product_code, product_price, product_images || null, quantity);
                
                // Create new sell order
                serial_no = generateSerialNo();
                
                const insertOrder = db.prepare(`
                    INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status)
                    VALUES (?, ?, ?, ?, 'cash', 'pending')
                `);
                
                orderResult = insertOrder.run(user_id, serial_no, generated_product_id, product_price * quantity);
            }

            return { productResult, orderResult, generated_product_id };
        });

        const result = transaction();

        // Get the final product details using the generated product ID
        const finalProduct = db.prepare(`
            SELECT product_id, product_name, product_variant, product_code, product_price, quantity, product_images
            FROM products 
            WHERE product_id = ?
        `).get(result.generated_product_id);

        const finalOrder = db.prepare(`
            SELECT total_amount FROM orders 
            WHERE order_id = ?
        `).get(orderResult.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: existingProduct ? 
                'Product quantity updated and sell order modified successfully' : 
                'New sell order created successfully',
            data: {
                order_id: orderResult.lastInsertRowid,
                product_id: result.generated_product_id,  // Auto-generated product ID
                serial_no: serial_no,
                product_name: finalProduct.product_name,
                product_variant: finalProduct.product_variant,
                product_code: finalProduct.product_code,
                product_price: finalProduct.product_price,
                quantity: finalProduct.quantity,
                total_amount: finalOrder.total_amount,
                status: 'pending',
                is_update: !!existingProduct,
                auto_generated_id: true  // Flag to indicate ID was auto-generated
            }
        });

    } catch (error) {
        console.error('Error creating sell order:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all buy orders for the authenticated user
 * @route GET /api/orders/buy
 * @access Private
 */
const getBuyOrders = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { status, page = 1, limit = 10 } = req.query;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build query with optional status filter
        let query = `
            SELECT 
                o.order_id,
                o.serial_no,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                p.product_name,
                p.product_variant,
                p.product_code,
                p.product_price,
                p.product_images
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.user_id = ?
        `;

        const params = [user_id];

        if (status) {
            query += ` AND o.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const orders = db.prepare(query).all(...params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
        const countParams = [user_id];

        if (status) {
            countQuery += ` AND status = ?`;
            countParams.push(status);
        }

        const totalCount = db.prepare(countQuery).get(...countParams).total;

        res.json({
            success: true,
            message: 'Buy orders retrieved successfully',
            data: {
                orders: orders,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalCount / limit),
                    total_orders: totalCount,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching buy orders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all sell orders for the authenticated seller
 * @route GET /api/orders/sell
 * @access Private (seller role)
 */
const getSellOrders = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const user_role = req.user.role;
        const { status, page = 1, limit = 10 } = req.query;

        // Validate seller role
        if (user_role !== 'seller') {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can view sell orders'
            });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build query with optional status filter
        let query = `
            SELECT 
                o.order_id,
                o.serial_no,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                p.product_name,
                p.product_variant,
                p.product_code,
                p.product_price,
                p.product_images,
                p.quantity as available_quantity
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.user_id = ?
        `;

        const params = [user_id];

        if (status) {
            query += ` AND o.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        const orders = db.prepare(query).all(...params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
        const countParams = [user_id];

        if (status) {
            countQuery += ` AND status = ?`;
            countParams.push(status);
        }

        const totalCount = db.prepare(countQuery).get(...countParams).total;

        res.json({
            success: true,
            message: 'Sell orders retrieved successfully',
            data: {
                orders: orders,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalCount / limit),
                    total_orders: totalCount,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching sell orders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get order details by order ID
 * @route GET /api/orders/:orderId
 * @access Private
 */
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user_id = req.user.userId;
        const user_role = req.user.role;

        // Get order details
        const order = db.prepare(`
            SELECT 
                o.order_id,
                o.user_id,
                o.serial_no,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                p.product_name,
                p.product_variant,
                p.product_code,
                p.product_price,
                p.product_images,
                p.quantity as available_quantity,
                u.user_name,
                u.user_email,
                u.user_phone
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

        // Check if user has permission to view this order
        if (user_role !== 'admin' && order.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this order'
            });
        }

        res.json({
            success: true,
            message: 'Order details retrieved successfully',
            data: order
        });

    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createBuyOrder,
    createSellOrder,
    getBuyOrders,
    getSellOrders,
    getOrderById
};