const { authenticateToken } = require('./auth');
const { getUserById } = require('../utils/validation');

// Middleware to ensure user is authenticated before buy/sell operations
const requireAuth = (operation) => {
  return (req, res, next) => {
    // First check if user has valid token
    authenticateToken(req, res, (err) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: '❌ Authentication required',
          suggestion: 'Please login first to access buy/sell features',
          action: 'login_required',
          operation: operation
        });
      }

      try {
        // Verify user still exists in database
        const user = getUserById(req.user.userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: '❌ User account not found',
            suggestion: 'Please signup or contact support',
            action: 'signup_required',
            operation: operation
          });
        }

        // Check operation-specific permissions
        if (operation === 'sell') {
          if (!['seller', 'admin'].includes(user.role)) {
            return res.status(403).json({
              success: false,
              message: '❌ Insufficient permissions for selling',
              suggestion: 'Only sellers and admins can sell products',
              currentRole: user.role,
              requiredRoles: ['seller', 'admin'],
              operation: operation
            });
          }
        }

        // Add user info to request for downstream handlers
        req.userProfile = user;
        next();

      } catch (error) {
        console.error(`Error in ${operation} middleware:`, error);
        return res.status(500).json({
          success: false,
          message: '❌ Internal server error during authentication',
          operation: operation,
          error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
      }
    });
  };
};

// Specific middleware for buy operations
const requireAuthForBuy = requireAuth('buy');

// Specific middleware for sell operations  
const requireAuthForSell = requireAuth('sell');

// General middleware for any transaction
const requireAuthForTransaction = async (req, res, next) => {
  const operation = req.body.operation || req.query.operation || 'general';
  return requireAuth(operation)(req, res, next);
};

// Middleware to validate transaction data
const validateTransactionData = (requiredFields) => {
  return (req, res, next) => {
    const missing = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missing.push(field);
      }
    });
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Missing required transaction data',
        missingFields: missing,
        requiredFields: requiredFields
      });
    }
    
    next();
  };
};

module.exports = {
  requireAuth,
  requireAuthForBuy,
  requireAuthForSell,
  requireAuthForTransaction,
  validateTransactionData
};
