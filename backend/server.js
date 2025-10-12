#!/usr/bin/env node
/**
 * CampusDeals Backend Server
 * Main server entry point - handles server startup and graceful shutdown
 */

require('dotenv').config();
const app = require('./src/app');
const { autoSeedDatabase } = require('./src/seeding');

// Get port from environment
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting CampusDeals Backend Server...');
    console.log('=' .repeat(45));
    
    // Auto-seed database with sample data
    await autoSeedDatabase();
    
    // Start the HTTP server
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🚀 Server also accessible on http://${HOST}:${PORT}`);
      console.log('🌐 CORS enabled for frontend origins');
      console.log('✅ CampusDeals Backend is ready!');
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };