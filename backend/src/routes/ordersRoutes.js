 const express = require('express');
const router = express.Router();
const { 
    createBuyOrder, 
    createSellOrder,
    getBuyOrders,
    getSellOrders,
    getOrderById,
    updateBuyOrder,
    updateSellOrder
} = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/orders/buy
 * @desc    Create a new buy order (for buyers purchasing products from cart)
 * @access  Private (buyer role)
 * @body    { 
 *            cart_id: number,
 *            payment_method: string ('cash' | 'upi') (optional, default: 'cash')
 *          }
 */
router.post('/buy', authenticateToken, createBuyOrder);

/**
 * @route   POST /api/orders/sell
 * @desc    Create sell orders from cart (for sellers listing products for sale)
 * @access  Private (seller role)
 * @body    { 
 *            cart_id: number,
 *            payment_method: string ('cash' | 'upi') (optional, default: 'cash')
 *          }
 */
router.post('/sell', authenticateToken, createSellOrder);

/**
 * @route   GET /api/orders/buy
 * @desc    Get all buy orders for the authenticated user
 * @access  Private
 * @query   status: string (optional) - filter by order status
 */
router.get('/buy', authenticateToken, getBuyOrders);

/**
 * @route   PUT /api/orders/buy/:orderId
 * @desc    Update a buy order
 * @access  Private (buyer or admin)
 * @body    { status?, quantity?, payment_method? }
 */
router.put('/buy/:orderId', authenticateToken, updateBuyOrder);

/**
 * @route   GET /api/orders/sell
 * @desc    Get all sell orders for the authenticated seller
 * @access  Private (seller role)
 * @query   status: string (optional) - filter by order status
 */
router.get('/sell', authenticateToken, getSellOrders);

/**
 * @route   PUT /api/orders/sell/:orderId
 * @desc    Update a sell order
 * @access  Private (seller or admin)
 * @body    { status?, quantity?, total_amount? }
 */
router.put('/sell/:orderId', authenticateToken, updateSellOrder);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order details by order ID
 * @access  Private (owner or admin)
 * @params  orderId: order ID
 */
router.get('/:orderId', authenticateToken, getOrderById);

module.exports = router;