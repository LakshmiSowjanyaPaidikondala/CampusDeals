const { db } = require('../config/db');

const addToCart = async (req, res) => {
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
        const product = db.get(`
            SELECT product_id, product_name, product_variant, product_price, quantity as stock_quantity
            FROM products 
            WHERE product_id = ?
        `, [product_id]);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if enough stock is available
        if (product.stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${product.stock_quantity} items available`
            });
        }
        
        // Check if item already exists in cart for this user
        const existingCartItem = db.get(`
            SELECT cart_id, quantity 
            FROM cart 
            WHERE user_id = ? AND product_id = ?
        `, [user_id, product_id]);
        
        let result;
        
        if (existingCartItem) {
            // Update quantity if item already exists
            const newQuantity = existingCartItem.quantity + quantity;
            
            // Check if total quantity exceeds stock
            if (newQuantity > product.stock_quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} items. Total would be ${newQuantity}, but only ${product.stock_quantity} items available`
                });
            }
            
            result = db.run(`
                UPDATE cart 
                SET quantity = ?, created_at = CURRENT_TIMESTAMP
                WHERE cart_id = ?
            `, [newQuantity, existingCartItem.cart_id]);
            
            console.log(`Updated cart item for user ${user_id}, product ${product_id}, new quantity: ${newQuantity}`);
        } else {
            // Add new item to cart
            result = db.run(`
                INSERT INTO cart (user_id, product_id, quantity)
                VALUES (?, ?, ?)
            `, [user_id, product_id, quantity]);
            
            console.log(`Added new cart item for user ${user_id}, product ${product_id}, quantity: ${quantity}`);
        }
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add item to cart'
            });
        }
        
        // Calculate total price for this item
        const itemTotal = product.product_price * quantity;
        
        res.status(200).json({
            success: true,
            message: `${product.product_name} (${product.product_variant}) added successfully`,
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
        console.error('Add to cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get user's cart items
 * GET /api/cart
 */
const getCartItems = (req, res) => {
    try {
        const user_id = parseInt(req.user.userId); // Ensure it's an integer
        
        console.log(`Getting cart items for user ${user_id} (type: ${typeof user_id})`);
        
        // Validate user_id
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        
        // Get all cart items with product details
        const cartItems = db.prepare(`
            SELECT 
                c.cart_id,
                c.user_id,
                c.product_id,
                c.quantity,
                c.created_at,
                p.product_name,
                p.product_variant,
                p.product_code,
                p.product_price,
                p.product_images,
                (c.quantity * p.product_price) as item_total
            FROM cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `).all(user_id);
        
        console.log(`Found ${cartItems.length} cart items for user ${user_id}`);
        
        // Debug: Log first item structure if exists
        if (cartItems.length > 0) {
            console.log('Sample cart item:', {
                cart_id: cartItems[0].cart_id,
                product_price: cartItems[0].product_price,
                quantity: cartItems[0].quantity,
                item_total: cartItems[0].item_total,
                item_total_type: typeof cartItems[0].item_total
            });
        }
        
        if (cartItems.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Your cart is empty',
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
            // Ensure all values are properly handled
            const itemTotal = item.item_total || 0;
            const productPrice = item.product_price || 0;
            const quantity = item.quantity || 0;
            
            // Calculate item total if it's not properly calculated in SQL
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
        
        console.log(`Retrieved ${cartItems.length} cart items for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: 'Cart items retrieved successfully',
            data: {
                items: formattedItems,
                total_items: totalItems,
                total_cost: parseFloat(totalCost.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Get cart items error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update cart item quantity
 * PUT /api/cart/update
 */
const updateCartItem = (req, res) => {
    try {
        const { cart_id, quantity } = req.body;
        const user_id = req.user.userId;
        
        // Validate required fields
        if (!cart_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Cart ID and quantity are required'
            });
        }
        
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }
        
        // Check if cart item exists and belongs to user
        const cartItem = db.get(`
            SELECT c.cart_id, c.product_id, p.product_name, p.product_variant, p.product_price, p.quantity as stock_quantity
            FROM cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ? AND c.user_id = ?
        `, [cart_id, user_id]);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        // Check stock availability
        if (quantity > cartItem.stock_quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${cartItem.stock_quantity} items available`
            });
        }
        
        // Update quantity
        const result = db.run(`
            UPDATE cart 
            SET quantity = ?, created_at = CURRENT_TIMESTAMP
            WHERE cart_id = ?
        `, [quantity, cart_id]);
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update cart item'
            });
        }
        
        const itemTotal = cartItem.product_price * quantity;
        
        console.log(`Updated cart item ${cart_id} quantity to ${quantity}`);
        
        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: {
                cart_id,
                product_name: cartItem.product_name,
                product_variant: cartItem.product_variant,
                quantity,
                price_per_item: cartItem.product_price,
                item_total: parseFloat(itemTotal.toFixed(2))
            }
        });
        
    } catch (error) {
        console.error('Update cart item error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Remove item from cart
 * DELETE /api/cart/remove/:cartId
 */
const removeFromCart = (req, res) => {
    try {
        const { cartId } = req.params;
        const user_id = req.user.userId;
        
        // Check if cart item exists and belongs to user
        const cartItem = db.get(`
            SELECT c.cart_id, p.product_name, p.product_variant
            FROM cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.cart_id = ? AND c.user_id = ?
        `, [cartId, user_id]);
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        // Remove item
        const result = db.run(`
            DELETE FROM cart 
            WHERE cart_id = ?
        `, [cartId]);
        
        if (result.changes === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to remove item from cart'
            });
        }
        
        console.log(`Removed cart item ${cartId} for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: `${cartItem.product_name} (${cartItem.product_variant}) removed from cart successfully`
        });
        
    } catch (error) {
        console.error('Remove from cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 */
const clearCart = (req, res) => {
    try {
        const user_id = req.user.userId;
        
        // Remove all cart items for user
        const result = db.run(`
            DELETE FROM cart 
            WHERE user_id = ?
        `, [user_id]);
        
        console.log(`Cleared ${result.changes} items from cart for user ${user_id}`);
        
        res.status(200).json({
            success: true,
            message: `Cart cleared successfully. ${result.changes} items removed.`
        });
        
    } catch (error) {
        console.error('Clear cart error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    addToCart,
    getCartItems,
    updateCartItem,
    removeFromCart,
    clearCart
};