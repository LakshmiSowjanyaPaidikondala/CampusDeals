const express = require('express');
const router = express.Router();
const { 
    addToSellCart, 
    getSellCartItems, 
    updateSellCartItem, 
    removeFromSellCart, 
    clearSellCart,
    batchUpdateSellCartItems,
    batchRemoveSellCartItems
} = require('../controllers/sellCartController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/cart/sell/add
 * @desc    Add item to sell cart
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number (optional, default: 1) }
 */
router.post('/add', authenticateToken, addToSellCart);

/**
 * @route   GET /api/cart/sell
 * @desc    Get user's sell cart items with total cost
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, getSellCartItems);

/**
 * @route   PUT /api/cart/sell/update
 * @desc    Update sell cart item quantity
 * @access  Private (requires authentication)
 * @body    { product_id: number, quantity: number }
 */
router.put('/update', authenticateToken, updateSellCartItem);

/**
 * @route   PUT /api/cart/sell/batch-update
 * @desc    Update multiple sell cart items at once
 * @access  Private (requires authentication)
 * @body    { items: [{product_id: number, quantity: number}, ...] }
 */
router.put('/batch-update', authenticateToken, batchUpdateSellCartItems);

/**
 * @route   DELETE /api/cart/sell/remove/:productId
 * @desc    Remove specific item from sell cart
 * @access  Private (requires authentication)
 * @params  productId: product ID to remove from sell cart
 */
router.delete('/remove/:productId', authenticateToken, removeFromSellCart);

/**
 * @route   DELETE /api/cart/sell/batch-remove
 * @desc    Remove multiple items from sell cart at once
 * @access  Private (requires authentication)
 * @body    { product_ids: [number, number, ...] }
 */
router.delete('/batch-remove', authenticateToken, batchRemoveSellCartItems);

/**
 * @route   DELETE /api/cart/sell/clear
 * @desc    Clear entire sell cart for user
 * @access  Private (requires authentication)
 */
router.delete('/clear', authenticateToken, clearSellCart);

module.exports = router;