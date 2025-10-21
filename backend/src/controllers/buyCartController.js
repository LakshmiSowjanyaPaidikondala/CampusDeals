const { db } = require('../config/db');

/**
 * Add item to buy cart
 * POST /api/cart/buy/add
 */
const addToBuyCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.userId; // From JWT token middleware
        
        // Validate required fields
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }
        
        // Check if product exists and get product details
        const product = db.prepare(`
            SELECT product_id, product_name, product_variant, product_price
            FROM products 
            WHERE product_id = ?
        `).get(product_id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if item already exists in buy cart for this user (cart_id = user_id)
        const existingCartItem = db.prepare(`
            SELECT cart_id, quantity 
            FROM buy_cart 
            WHERE cart_id = ? AND product_id = ?
        `).get(user_id, product_id);
        
        let result;
        
        if (existingCartItem) {
            // Update quantity if item already exists
            const newQuantity = existingCartItem.quantity + quantity;
            
            result = db.prepare(`
                UPDATE buy_cart 
                SET quantity = ?, created_at = CURRENT_TIMESTAMP
                WHERE cart_id = ? AND product_id = ?
            `).run(newQuantity, user_id, product_id);
            
            console.log(`Updated buy cart item for user ${user_id}, product ${product_id}, new quantity: ${newQuantity}`);
        } else {
            // Add new item to buy cart (cart_id = user_id)
            result = db.prepare(`
                INSERT INTO buy_cart (cart_id, product_id, quantity)
                VALUES (?, ?, ?)
            `).run(user_id, product_id, quantity);
            
            console.log(`Added new buy cart item for user ${user_id}, product ${product_id}, quantity: ${quantity}`);
        }
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add item to buy cart'
            });
        }
        
        // Calculate total price for this item
        const itemTotal = product.product_price * quantity;
        
        res.status(200).json({
            success: true,
            message: `${product.product_name} (${product.product_variant}) added to buy cart successfully`,
            data: {
                item_id: product.product_id,
                product_name: product.product_name,
                product_variant: product.product_variant,
                quantity_added: quantity,
                price_per_item: product.product_price,
                item_total: parseFloat(itemTotal.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Add to buy cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get user's buy cart items
 * GET /api/cart/buy
 */
const getBuyCartItems = (req, res) => {
    try {
        const user_id = parseInt(req.user.userId); // Ensure it's an integer
        
        console.log(`Getting buy cart items for user ${user_id} (type: ${typeof user_id})`);
        
        // Validate user_id
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        
        // Get all buy cart items with product details (cart_id = user_id)
        const cartItems = db.prepare(`
            SELECT 
                c.cart_id,
                c.product_id,
                c.quantity,
                c.created_at,
                p.product_name,
                p.product_variant,
                p.product_code,
                p.product_price,
                p.product_images,
                (c.quantity * p.product_price) as item_total
            FROM buy_cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ?
            ORDER BY c.created_at DESC
        `).all(user_id);
        
        console.log(`Found ${cartItems.length} buy cart items for user ${user_id}`);
        
        if (cartItems.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Your buy cart is empty',
                data: {
                    items: [],
                    total_items: 0,
                    total_cost: 0
                }
            });
        }
        
        // Calculate total cost
        const totalCost = cartItems.reduce((sum, item) => {
            const itemTotal = item.item_total || 0;
            return sum + (typeof itemTotal === 'number' ? itemTotal : parseFloat(itemTotal) || 0);
        }, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        // Format response data
        const formattedItems = cartItems.map(item => {
            const itemTotal = item.item_total || 0;
            const productPrice = item.product_price || 0;
            const quantity = item.quantity || 0;
            
            const calculatedTotal = typeof itemTotal === 'number' && itemTotal > 0 
                ? itemTotal 
                : (productPrice * quantity);
            
            return {
                cart_id: item.cart_id,
                product_id: item.product_id,
                product_name: item.product_name || '',
                product_variant: item.product_variant || '',
                product_code: item.product_code || '',
                product_images: item.product_images || '',
                quantity: quantity,
                price_per_item: typeof productPrice === 'number' ? productPrice : parseFloat(productPrice) || 0,
                item_total: parseFloat(calculatedTotal.toFixed(2)),
                added_at: item.created_at
            };
        });
        
        console.log(`Retrieved ${cartItems.length} buy cart items for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: 'Buy cart items retrieved successfully',
            data: {
                items: formattedItems,
                total_items: totalItems,
                total_cost: parseFloat(totalCost.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Get buy cart items error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update buy cart item quantity
 * PUT /api/cart/buy/update
 */
const updateBuyCartItem = (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const user_id = req.user.userId;
        
        // Validate required fields
        if (!product_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and quantity are required'
            });
        }
        
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }
        
        // Check if buy cart item exists (cart_id = user_id)
        const cartItem = db.prepare(`
            SELECT c.cart_id, c.product_id, p.product_name, p.product_variant, p.product_price
            FROM buy_cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ? AND c.product_id = ?
        `).get(user_id, product_id);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Buy cart item not found'
            });
        }
        
        // Update quantity
        const result = db.prepare(`
            UPDATE buy_cart 
            SET quantity = ?, created_at = CURRENT_TIMESTAMP
            WHERE cart_id = ? AND product_id = ?
        `).run(quantity, user_id, product_id);
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update buy cart item'
            });
        }
        
        const itemTotal = cartItem.product_price * quantity;
        
        console.log(`Updated buy cart item product ${product_id} quantity to ${quantity} for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: 'Buy cart item updated successfully',
            data: {
                product_id,
                product_name: cartItem.product_name,
                product_variant: cartItem.product_variant,
                quantity,
                price_per_item: cartItem.product_price,
                item_total: parseFloat(itemTotal.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Update buy cart item error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Remove item from buy cart
 * DELETE /api/cart/buy/remove/:productId
 */
const removeFromBuyCart = (req, res) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.userId;
        
        // Check if buy cart item exists (cart_id = user_id)
        const cartItem = db.prepare(`
            SELECT c.cart_id, p.product_name, p.product_variant
            FROM buy_cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ? AND c.product_id = ?
        `).get(user_id, productId);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Buy cart item not found'
            });
        }
        
        // Remove item
        const result = db.prepare(`
            DELETE FROM buy_cart 
            WHERE cart_id = ? AND product_id = ?
        `).run(user_id, productId);
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove item from buy cart'
            });
        }
        
        console.log(`Removed buy cart item ${productId} for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: `${cartItem.product_name} (${cartItem.product_variant}) removed from buy cart successfully`
        });
        
    } catch (error) {
        console.error('Remove from buy cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Clear entire buy cart
 * DELETE /api/cart/buy/clear
 */
const clearBuyCart = (req, res) => {
    try {
        const user_id = req.user.userId;
        
        // Get current buy cart items count before clearing
        const currentItems = db.prepare(`
            SELECT COUNT(*) as count FROM buy_cart WHERE cart_id = ?
        `).get(user_id);
        
        if (currentItems.count === 0) {
            return res.status(200).json({
                success: true,
                message: 'Buy cart is already empty'
            });
        }
        
        // Remove all buy cart items for user (cart_id = user_id)
        const result = db.prepare(`
            DELETE FROM buy_cart 
            WHERE cart_id = ?
        `).run(user_id);
        
        console.log(`Cleared ${result.changes} items from buy cart for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: `Buy cart cleared successfully. ${result.changes} items removed.`,
            data: {
                itemsRemoved: result.changes,
                clearedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Clear buy cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Batch update multiple buy cart items
 * PUT /api/cart/buy/batch-update
 */
const batchUpdateBuyCartItems = (req, res) => {
    try {
        const { items } = req.body; // Array of {product_id, quantity}
        const user_id = req.user.userId;
        
        // Validate input
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required and must not be empty'
            });
        }
        
        // Validate each item
        for (const item of items) {
            if (!item.product_id || !item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have valid product_id and positive quantity'
                });
            }
        }
        
        const results = [];
        const errors = [];
        
        // Process each item
        for (const item of items) {
            try {
                // Check if buy cart item exists
                const cartItem = db.prepare(`
                    SELECT c.cart_id, c.product_id, p.product_name, p.product_variant, p.product_price
                    FROM buy_cart c
                    INNER JOIN products p ON c.product_id = p.product_id
                    WHERE c.cart_id = ? AND c.product_id = ?
                `).get(user_id, item.product_id);
                
                if (!cartItem) {
                    errors.push({
                        product_id: item.product_id,
                        error: 'Buy cart item not found'
                    });
                    continue;
                }
                
                // Update quantity
                const result = db.prepare(`
                    UPDATE buy_cart 
                    SET quantity = ?, created_at = CURRENT_TIMESTAMP
                    WHERE cart_id = ? AND product_id = ?
                `).run(item.quantity, user_id, item.product_id);
                
                if (result.changes > 0) {
                    results.push({
                        product_id: item.product_id,
                        product_name: cartItem.product_name,
                        quantity: item.quantity,
                        success: true
                    });
                }
                
            } catch (itemError) {
                errors.push({
                    product_id: item.product_id,
                    error: itemError.message
                });
            }
        }
        
        console.log(`Batch updated ${results.length} buy cart items for user ${user_id}, ${errors.length} errors`);
        
        const responseStatus = errors.length === 0 ? 200 : (results.length > 0 ? 207 : 400); // 207 = Multi-Status
        
        res.status(responseStatus).json({
            success: results.length > 0,
            message: `Batch update completed. ${results.length} items updated, ${errors.length} errors.`,
            data: {
                updated: results,
                errors: errors,
                summary: {
                    totalItems: items.length,
                    successful: results.length,
                    failed: errors.length
                }
            }
        });
        
    } catch (error) {
        console.error('Batch update buy cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during batch update'
        });
    }
};

/**
 * Batch remove multiple buy cart items
 * DELETE /api/cart/buy/batch-remove
 */
const batchRemoveBuyCartItems = (req, res) => {
    try {
        const { product_ids } = req.body; // Array of product IDs
        const user_id = req.user.userId;
        
        // Validate input
        if (!Array.isArray(product_ids) || product_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'product_ids array is required and must not be empty'
            });
        }
        
        const results = [];
        const errors = [];
        
        // Process each product ID
        for (const product_id of product_ids) {
            try {
                // Check if buy cart item exists
                const cartItem = db.prepare(`
                    SELECT c.cart_id, p.product_name, p.product_variant
                    FROM buy_cart c
                    INNER JOIN products p ON c.product_id = p.product_id
                    WHERE c.cart_id = ? AND c.product_id = ?
                `).get(user_id, product_id);
                
                if (!cartItem) {
                    errors.push({
                        product_id: product_id,
                        error: 'Buy cart item not found'
                    });
                    continue;
                }
                
                // Remove item
                const result = db.prepare(`
                    DELETE FROM buy_cart 
                    WHERE cart_id = ? AND product_id = ?
                `).run(user_id, product_id);
                
                if (result.changes > 0) {
                    results.push({
                        product_id: product_id,
                        product_name: cartItem.product_name,
                        product_variant: cartItem.product_variant,
                        success: true
                    });
                }
                
            } catch (itemError) {
                errors.push({
                    product_id: product_id,
                    error: itemError.message
                });
            }
        }
        
        console.log(`Batch removed ${results.length} buy cart items for user ${user_id}, ${errors.length} errors`);
        
        const responseStatus = errors.length === 0 ? 200 : (results.length > 0 ? 207 : 400);
        
        res.status(responseStatus).json({
            success: results.length > 0,
            message: `Batch removal completed. ${results.length} items removed, ${errors.length} errors.`,
            data: {
                removed: results,
                errors: errors,
                summary: {
                    totalItems: product_ids.length,
                    successful: results.length,
                    failed: errors.length
                }
            }
        });
        
    } catch (error) {
        console.error('Batch remove buy cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during batch removal'
        });
    }
};

module.exports = {
    addToBuyCart,
    getBuyCartItems,
    updateBuyCartItem,
    removeFromBuyCart,
    clearBuyCart,
    batchUpdateBuyCartItems,
    batchRemoveBuyCartItems
};