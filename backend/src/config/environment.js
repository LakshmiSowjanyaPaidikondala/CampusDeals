/**
 * Environment Configuration
 * Centralized environment variable management
 */

// Load environment variables
require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Database Configuration
  database: {
    path: process.env.DB_PATH || './database/campusdeals.db',
    verbose: process.env.NODE_ENV === 'development'
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'campusdeals_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // Short-lived access token
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '15m' // Short-lived refresh token
  },
  
  // CORS Configuration
  cors: {
    origins: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : [])
    ],
    credentials: true
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000 // 15 minutes
  },
  
  // Application Configuration
  app: {
    name: 'CampusDeals Backend',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Backend API for CampusDeals application'
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  
  // Pagination Configuration
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 50,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100
  }
};

// Validate required environment variables
const requiredEnvVars = [];

if (config.server.environment === 'production') {
  requiredEnvVars.push('JWT_SECRET');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

module.exports = config;