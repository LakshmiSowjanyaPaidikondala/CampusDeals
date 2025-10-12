/**
 * API Routes Index
 * Central routing for all API versions
 */

const express = require('express');
const router = express.Router();

// Import API versions
const v1Routes = require('./v1');

// API Root information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CampusDeals API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    availableVersions: {
      v1: '/api/v1'
    },
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// Mount API versions
router.use('/v1', v1Routes);

// Default to v1 for backward compatibility
router.use('/auth', v1Routes);
router.use('/users', v1Routes);
router.use('/products', v1Routes);
router.use('/cart', v1Routes);
router.use('/orders', v1Routes);

// Global API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    versions: {
      node: process.version,
      app: '1.0.0'
    }
  });
});

module.exports = router;