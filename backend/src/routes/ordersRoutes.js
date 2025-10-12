const express = require('express');
const router = express.Router();
const { 
    createBuyOrder, 
    createSellOrder,
    getBuyOrders,
    getSellOrders,
    getOrderById
} = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/orders/buy
 * @desc    Create a new buy order (for buyers purchasing products)
 * @access  Private (buyer role)
 * @body    { 
 *            product_id: number, 
 *            quantity: number (optional, default: 1), 
 *            payment_method: string ('cash' | 'upi'),
 *            total_amount: number
 *          }
 */
router.post('/buy', authenticateToken, createBuyOrder);

/**
 * @route   POST /api/orders/sell
 * @desc    Create a new sell order (for sellers listing products for sale)
 * @access  Private (seller role)
 * @body    { 
 *            product_name: string,
 *            product_variant: string,
 *            product_price: number,
 *            quantity: number,
 *            product_images: string (optional)
 *          }
 */
router.post('/sell', authenticateToken, createSellOrder);

/**
 * @route   GET /api/orders/buy
 * @desc    Get all buy orders for the authenticated user
 * @access  Private
 * @query   status: string (optional) - filter by order status
 *          page: number (optional, default: 1) - page number for pagination
 *          limit: number (optional, default: 10) - items per page
 */
router.get('/buy', authenticateToken, getBuyOrders);

/**
 * @route   GET /api/orders/sell
 * @desc    Get all sell orders for the authenticated seller
 * @access  Private (seller role)
 * @query   status: string (optional) - filter by order status
 *          page: number (optional, default: 1) - page number for pagination
 *          limit: number (optional, default: 10) - items per page
 */
router.get('/sell', authenticateToken, getSellOrders);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order details by order ID
 * @access  Private (owner or admin)
 * @params  orderId: order ID
 */
router.get('/:orderId', authenticateToken, getOrderById);

module.exports = router;