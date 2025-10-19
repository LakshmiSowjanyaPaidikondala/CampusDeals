const { db, run, query } = require('../config/db');
const { generateToken, generateTokenPair, hashPassword, comparePassword } = require('../utils/auth');
const { blacklistToken } = require('../utils/tokenBlacklist');
const { validateRefreshToken, revokeRefreshToken, revokeUserRefreshTokens } = require('../utils/refreshToken');
const { 
  validateEmail, 
  validatePassword, 
  validateRequiredFields, 
  checkUserExists, 
  getUserByEmail,
  sanitizeUserInput 
} = require('../utils/validation');

// Enhanced User Registration/Signup
const signup = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    
    const {
      user_name,
      user_email,
      user_password,
      user_phone,
      user_studyyear,
      user_branch,
      user_section,
      user_residency,
      payment_received = 0,
      amount_given = 0
    } = sanitizedData;

    // Validate required fields
    const requiredFields = ['user_name', 'user_email', 'user_password'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Missing required fields',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields
      });
    }

    // Validate email format
    if (!validateEmail(user_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid email address',
        field: 'user_email'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Password validation failed',
        details: passwordValidation.message,
        field: 'user_password'
      });
    }

    // Check if user already exists
    const userExistence = checkUserExists(user_email);
    if (userExistence.exists) {
      return res.status(409).json({ 
        success: false,
        message: '❌ User with this email already exists',
        suggestion: 'Please login instead or use a different email address',
        field: 'user_email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(user_password);

    // Insert new user without role (will be assigned dynamically based on first action)
    const [result] = run(
      `INSERT INTO users 
       (user_name, user_email, user_password, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_name,
        user_email,
        hashedPassword,
        user_phone,
        user_studyyear,
        user_branch,
        user_section,
        user_residency,
        payment_received,
        amount_given
      ]
    );

    // Generate token pair (access + refresh) - role will be NULL initially
    const tokenPair = await generateTokenPair(result.insertId, user_email, null);
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Failed to generate authentication tokens',
        error: tokenPair.error
      });
    }

    res.status(201).json({
      success: true,
      message: '✅ User registered successfully',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenExpiry: {
        accessToken: tokenPair.accessTokenExpiresIn,
        refreshToken: tokenPair.refreshTokenExpiresIn
      },
      user: {
        userId: result.insertId,
        name: user_name,
        email: user_email,
        role: null
      },
      instructions: {
        message: 'Save both tokens for authentication. Your role will be assigned automatically based on your first action (buy or sell).',
        accessToken: 'Short-lived token for API requests',
        refreshToken: 'Short-lived token for getting new access tokens (15 minutes)',
        usage: 'Include access token in Authorization header as: Bearer YOUR_ACCESS_TOKEN'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Enhanced User Login with Database Validation
const login = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    const { user_email, user_password } = sanitizedData;

    // Validate required fields
    const requiredFields = ['user_email', 'user_password'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Email and password are required',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields
      });
    }

    // Validate email format
    if (!validateEmail(user_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid email address',
        field: 'user_email'
      });
    }

    // Check if user exists in database
    const userExistence = checkUserExists(user_email);
    if (!userExistence.exists) {
      return res.status(404).json({ 
        success: false,
        message: '❌ User not found',
        suggestion: 'Please sign up first if you don\'t have an account',
        action: 'signup_required'
      });
    }

    // Get user details for authentication
    const user = getUserByEmail(user_email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '❌ User not found',
        suggestion: 'Please sign up first if you don\'t have an account',
        action: 'signup_required'
      });
    }

    // Validate password
    const isPasswordValid = await comparePassword(user_password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: '❌ Invalid password',
        suggestion: 'Please check your password and try again',
        field: 'user_password'
      });
    }

    // Generate token pair for successful login
    const tokenPair = await generateTokenPair(user.user_id, user.user_email, user.role);
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Failed to generate authentication tokens',
        error: tokenPair.error
      });
    }

    res.json({
      success: true,
      message: '✅ Login successful',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenExpiry: {
        accessToken: tokenPair.accessTokenExpiresIn,
        refreshToken: tokenPair.refreshTokenExpiresIn
      },
      user: {
        userId: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: user.role
      },
      permissions: {
        canBuy: true,
        canSell: ['seller', 'admin'].includes(user.role),
        canAdmin: user.role === 'admin'
      },
      instructions: {
        message: 'You can now access buy/sell features',
        accessToken: 'Use for API requests (expires in 15 minutes)',
        refreshToken: 'Use to get new access tokens (expires in 15 minutes)',
        usage: 'Include access token in Authorization header as: Bearer YOUR_ACCESS_TOKEN'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Get current user profile (protected route)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = query(
      `SELECT user_id, user_name, user_email, role, user_phone, user_studyyear, 
       user_branch, user_section, user_residency, payment_received, amount_given 
       FROM Users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '❌ User not found' 
      });
    }

    const user = users[0];

    res.json({
      success: true,
      message: '✅ Profile retrieved successfully',
      user: user,
      permissions: {
        canBuy: true,
        canSell: ['seller', 'admin'].includes(user.role),
        canAdmin: user.role === 'admin'
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Validate user for buy/sell operations
const validateUserForTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { operation } = req.body; // 'buy' or 'sell'

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: '❌ User not found',
        action: 'login_required'
      });
    }

    // Check permissions based on operation
    let canPerformOperation = false;
    let message = '';

    if (operation === 'buy') {
      canPerformOperation = true;
      message = '✅ User authorized for buying';
    } else if (operation === 'sell') {
      canPerformOperation = ['seller', 'admin'].includes(user.role);
      message = canPerformOperation 
        ? '✅ User authorized for selling' 
        : '❌ User not authorized for selling. Seller or admin role required.';
    } else {
      return res.status(400).json({ 
        success: false,
        message: '❌ Invalid operation. Must be "buy" or "sell"'
      });
    }

    res.json({
      success: true,
      authorized: canPerformOperation,
      message: message,
      user: {
        userId: user.user_id,
        name: user.user_name,
        role: user.role
      },
      operation: operation,
      permissions: {
        canBuy: true,
        canSell: ['seller', 'admin'].includes(user.role),
        canAdmin: user.role === 'admin'
      }
    });

  } catch (error) {
    console.error('Transaction validation error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error during validation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Logout functionality with token blacklisting and refresh token revocation
const logout = async (req, res) => {
  try {
    // Get user info from the authenticated request
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const token = req.token; // Access token attached by auth middleware
    const { refreshToken } = req.body; // Refresh token from request body
    
    // Blacklist the current access token to prevent reuse
    if (token) {
      blacklistToken(token);
    }
    
    // Revoke the refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    // Optionally revoke all refresh tokens for this user (more secure)
    if (userId) {
      await revokeUserRefreshTokens(userId);
    }
    
    console.log(`🚪 User logout: ${userEmail || 'Unknown'} (ID: ${userId || 'Unknown'})`);
    
    res.status(200).json({
      success: true,
      message: '✅ Logout successful',
      data: {
        userId: userId,
        email: userEmail,
        loggedOutAt: new Date().toISOString(),
        accessTokenInvalidated: !!token,
        refreshTokenRevoked: !!refreshToken,
        instruction: 'Both tokens have been invalidated. Please remove from client storage.'
      }
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '❌ Refresh token is required'
      });
    }
    
    // Validate the refresh token
    const validation = await validateRefreshToken(refreshToken);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid or expired refresh token',
        error: validation.message
      });
    }
    
    // Generate new token pair
    const tokenPair = await generateTokenPair(
      validation.userId, 
      validation.email, 
      validation.role
    );
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Failed to generate new tokens',
        error: tokenPair.error
      });
    }
    
    // Revoke the old refresh token
    await revokeRefreshToken(refreshToken);
    
    res.json({
      success: true,
      message: '✅ Tokens refreshed successfully',
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenExpiry: {
        accessToken: tokenPair.accessTokenExpiresIn,
        refreshToken: tokenPair.refreshTokenExpiresIn
      },
      user: {
        userId: validation.userId,
        email: validation.email,
        role: validation.role
      },
      instructions: {
        message: 'Use new tokens for future requests',
        note: 'Old refresh token has been revoked'
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Internal server error during token refresh',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshAccessToken,
  getProfile,
  validateUserForTransaction,
  // Keep backward compatibility
  register: signup
};
