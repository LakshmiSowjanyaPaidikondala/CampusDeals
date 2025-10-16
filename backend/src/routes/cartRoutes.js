const express = require('express');
const router = express.Router();
const { 
    addToCart, 
    getCartItems, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    batchUpdateCartItems,
    batchRemoveCartItems
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number (optional, default: 1) }
 */
router.post('/add', authenticateToken, addToCart);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart items with total cost
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, getCartItems);

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number }
 */
router.put('/update', authenticateToken, updateCartItem);

/**
 * @route   PUT /api/cart/batch-update
 * @desc    Update multiple cart items at once
 * @access  Private (requires authentication)
 * @body    { items: [{product_id: number, quantity: number}, ...] }
 */
router.put('/batch-update', authenticateToken, batchUpdateCartItems);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove specific item from cart
 * @access  Private (requires authentication)
 * @params  productId: product ID to remove from cart
 */
router.delete('/remove/:productId', authenticateToken, removeFromCart);

/**
 * @route   DELETE /api/cart/batch-remove
 * @desc    Remove multiple items from cart at once
 * @access  Private (requires authentication)
 * @body    { product_ids: [number, number, ...] }
 */
router.delete('/batch-remove', authenticateToken, batchRemoveCartItems);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart for user
 * @access  Private (requires authentication)
 */
router.delete('/clear', authenticateToken, clearCart);

module.exports = router;