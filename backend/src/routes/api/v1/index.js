/**
 * API v1 Routes Index
 * Aggregates all v1 API routes
 */

const express = require('express');
const router = express.Router();

// Import v1 route modules
const authRoutes = require('../../authRoutes');
const userRoutes = require('../../userRoutes');
const productRoutes = require('../../productRoutes');
const cartRoutes = require('../../cartRoutes');
const orderRoutes = require('../../ordersRoutes');

// Health check for API v1
router.get('/health', (req, res) => {
  res.json({
    success: true,
    version: 'v1',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;