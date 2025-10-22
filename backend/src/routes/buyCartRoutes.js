const express = require('express');
const router = express.Router();
const { 
    addToBuyCart, 
    getBuyCartItems, 
    updateBuyCartItem, 
    removeFromBuyCart, 
    clearBuyCart,
    batchUpdateBuyCartItems,
    batchRemoveBuyCartItems
} = require('../controllers/buyCartController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/cart/buy/add
 * @desc    Add item to buy cart
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number (optional, default: 1) }
 */
router.post('/add', authenticateToken, addToBuyCart);

/**
 * @route   GET /api/cart/buy
 * @desc    Get user's buy cart items with total cost
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, getBuyCartItems);

/**
 * @route   PUT /api/cart/buy/update
 * @desc    Update buy cart item quantity
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number }
 */
router.put('/update', authenticateToken, updateBuyCartItem);

/**
 * @route   PUT /api/cart/buy/batch-update
 * @desc    Update multiple buy cart items at once
 * @access  Private (requires authentication)
 * @body    { items: [{product_id: number, quantity: number}, ...] }
 */
router.put('/batch-update', authenticateToken, batchUpdateBuyCartItems);

/**
 * @route   DELETE /api/cart/buy/remove/:productId
 * @desc    Remove specific item from buy cart
 * @access  Private (requires authentication)
 * @params  productId: product ID to remove from buy cart
 */
router.delete('/remove/:productId', authenticateToken, removeFromBuyCart);

/**
 * @route   DELETE /api/cart/buy/batch-remove
 * @desc    Remove multiple items from buy cart at once
 * @access  Private (requires authentication)
 * @body    { product_ids: [number, number, ...] }
 */
router.delete('/batch-remove', authenticateToken, batchRemoveBuyCartItems);

/**
 * @route   DELETE /api/cart/buy/clear
 * @desc    Clear entire buy cart for user
 * @access  Private (requires authentication)
 */
router.delete('/clear', authenticateToken, clearBuyCart);

module.exports = router;