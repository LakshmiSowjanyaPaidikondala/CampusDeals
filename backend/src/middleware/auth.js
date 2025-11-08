const { verifyToken } = require('../utils/auth');
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');
const { db } = require('../config/db');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '❌ Access token required' });
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ 
      message: '❌ Token has been invalidated. Please login again.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Add user info to request object
    req.token = token; // Store token for potential blacklisting
    next();
  } catch (error) {
    return res.status(403).json({ message: '❌ Invalid or expired token' });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '❌ User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `❌ Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Conditional auth middleware - only require auth if admin exists
const conditionalAuth = (req, res, next) => {
  try {
    console.log('🔍 Conditional auth middleware - checking admin existence...');
    
    // Check if any admin exists in the database
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins').get();
    console.log(`📊 Admin count: ${adminExists.count}`);
    
    if (adminExists.count === 0) {
      // No admin exists, skip authentication
      // Remove any provided Authorization header to ensure the first
      // admin is created without accepting or relying on an access token
      // (protects against accidentally using an existing token during
      // initial bootstrap).
      if (req.headers) {
        delete req.headers['authorization'];
        delete req.headers['Authorization'];
      }
      console.log('🔓 No admin exists - allowing access without authentication (authorization header ignored)');
      return next();
    }
    
    // Admin exists, require authentication
    console.log('🔐 Admin exists - requiring authentication');
    return authenticateToken(req, res, next);
  } catch (error) {
    console.error('❌ Error checking admin existence:', error);
    return res.status(500).json({ 
      success: false,
      message: '❌ Server error during authentication check' 
    });
  }
};

// Admin-only authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: '❌ Admin access token required' 
    });
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ 
      success: false,
      message: '❌ Token has been invalidated. Please login again.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if the token belongs to an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: '❌ Admin access required. Only admin users can access this endpoint.',
        userRole: decoded.role
      });
    }
    
    // Verify admin still exists in database
    const admin = db.prepare('SELECT admin_id, admin_email FROM admins WHERE admin_id = ?').get(decoded.userId);
    
    if (!admin) {
      return res.status(403).json({ 
        success: false,
        message: '❌ Admin account not found. Access denied.' 
      });
    }
    
    req.user = decoded; // Add admin info to request object
    req.token = token; // Store token for potential blacklisting
    req.admin = admin; // Store admin database info
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: '❌ Invalid or expired admin token',
      error: error.message 
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  conditionalAuth,
  authenticateAdmin,
  // Conditional role-based authorization middleware:
  // - If no admins exist in the DB, allow the request (bootstrap scenario)
  // - If admins exist, require a valid access token and that the token's role
  //   is one of the allowed roles passed to this middleware
  conditionalAuthorizeRoles: (...roles) => {
    return (req, res, next) => {
      try {
        // Check if any admin exists
        const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins').get();
        if (!adminExists || adminExists.count === 0) {
          // Bootstrap - allow creating first admin without authentication
          return next();
        }

        // Admins exist - require a token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
          return res.status(401).json({
            success: false,
            message: '❌ Access token required to register new admins'
          });
        }

        // Check blacklist
        if (isTokenBlacklisted(token)) {
          return res.status(401).json({
            success: false,
            message: '❌ Token has been invalidated. Please login again.'
          });
        }

        // Verify token
        let decoded;
        try {
          decoded = verifyToken(token);
        } catch (err) {
          return res.status(403).json({ success: false, message: '❌ Invalid or expired token' });
        }

        // Check role
        if (!decoded || !roles.includes(decoded.role)) {
          return res.status(403).json({
            success: false,
            message: `❌ Access denied. Required roles: ${roles.join(', ')}`,
            userRole: decoded ? decoded.role : null
          });
        }

        // Attach user info and proceed
        req.user = decoded;
        req.token = token;
        return next();
      } catch (error) {
        console.error('❌ Error in conditionalAuthorizeRoles:', error);
        return res.status(500).json({ success: false, message: '❌ Server error during authorization check' });
      }
    };
  }
};
