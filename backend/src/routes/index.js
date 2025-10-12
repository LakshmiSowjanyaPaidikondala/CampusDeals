/**
 * Routes Index
 * Central export for all application routes
 */

const express = require('express');
const router = express.Router();

// Import API routes
const apiRoutes = require('./api');

// Mount API routes
router.use('/api', apiRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CampusDeals Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      docs: '/api/docs'
    }
  });
});

module.exports = router;