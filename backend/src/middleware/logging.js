/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring
 */

const config = require('../config/environment');

/**
 * Simple request logger
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details
  console.log(`📥 ${timestamp} - ${req.method} ${req.originalUrl}`);
  
  if (config.server.environment === 'development') {
    // Log additional details in development
    if (req.headers.authorization) {
      console.log(`🔑 Auth: Bearer token present`);
    }
    
    if (Object.keys(req.query).length > 0) {
      console.log(`🔍 Query:`, req.query);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
      // Don't log sensitive information
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.user_password) sanitizedBody.user_password = '[HIDDEN]';
      
      console.log(`📦 Body:`, sanitizedBody);
    }
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`📤 ${statusColor} ${res.statusCode} - ${duration}ms`);
    
    if (res.statusCode >= 400) {
      console.log(`❌ Error response for ${req.method} ${req.originalUrl}`);
    }
  });
  
  next();
};

/**
 * API Response time middleware
 */
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

module.exports = {
  requestLogger,
  responseTime
};