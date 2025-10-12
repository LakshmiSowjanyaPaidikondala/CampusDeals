/**
 * Centralized Error Handling Middleware
 * Handles all application errors in a consistent way
 */

const config = require('../config/environment');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle different types of errors
 */
const handleDatabaseError = (err) => {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return new AppError('Duplicate entry found', 409);
  }
  
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return new AppError('Referenced record not found', 400);
  }
  
  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    return new AppError('Invalid data provided', 400);
  }
  
  return new AppError('Database operation failed', 500);
};

const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }
  
  return new AppError('Authentication failed', 401);
};

const handleValidationError = (err) => {
  const message = Object.values(err.errors).map(val => val.message).join('. ');
  return new AppError(`Validation Error: ${message}`, 400);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      timestamp: err.timestamp,
      stack: err.stack,
      details: err
    }
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        timestamp: err.timestamp
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('❌ Unexpected Error:', err);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong!',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error details
  console.error(`❌ Error ${err.statusCode}: ${err.message}`);
  console.error(`📍 Route: ${req.method} ${req.originalUrl}`);
  
  if (config.server.environment === 'development') {
    console.error(`🔍 Stack: ${err.stack}`);
  }
  
  let error = { ...err };
  error.message = err.message;
  
  // Handle specific error types
  if (err.code && err.code.startsWith('SQLITE_')) {
    error = handleDatabaseError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid data format', 400);
  } else if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON format', 400);
  }
  
  // Send appropriate error response
  if (config.server.environment === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors middleware
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
  notFoundHandler
};