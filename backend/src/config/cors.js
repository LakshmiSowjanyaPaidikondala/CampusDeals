/**
 * CORS Configuration
 * Cross-Origin Resource Sharing settings
 */

const config = require('./environment');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (config.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Forwarded-For'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  maxAge: 86400 // 24 hours
};

// In development, allow all origins for easier testing
if (config.server.environment === 'development') {
  corsOptions.origin = true;
  console.log('🔓 CORS: Development mode - allowing all origins');
} else {
  console.log('🔒 CORS: Production mode - restricted origins:', config.cors.origins);
}

module.exports = corsOptions;