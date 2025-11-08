const { db, run, query } = require('../config/db');
const { generateToken, generateTokenPair, hashPassword, comparePassword } = require('../utils/auth');
const { blacklistToken } = require('../utils/tokenBlacklist');
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
    const { refreshToken } = req.body; // Refresh token from request body (but not stored in DB)
    
    // Blacklist the current access token to prevent reuse
    if (token) {
      blacklistToken(token);
    }
    
    // Note: Refresh tokens are JWT-based and not stored in database
    // They will naturally expire after 15 minutes
    
    console.log(`🚪 User logout: ${userEmail || 'Unknown'} (ID: ${userId || 'Unknown'})`);
    
    res.status(200).json({
      success: true,
      message: '✅ Logout successful',
      data: {
        userId: userId,
        email: userEmail,
        loggedOutAt: new Date().toISOString(),
        accessTokenInvalidated: !!token,
        refreshTokenNote: 'JWT refresh token will expire naturally (not stored in database)',
        instruction: 'Remove both tokens from client storage. Access token is blacklisted, refresh token will expire in 15 minutes.'
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
    
    // Validate the JWT refresh token
    const config = require('../config/environment');
    const secret = config.jwt && config.jwt.secret ? config.jwt.secret : process.env.JWT_SECRET;
    
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, secret);
      
      // Check if it's actually a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid or expired refresh token',
        error: jwtError.message
      });
    }
    
    // Generate new token pair
    const tokenPair = await generateTokenPair(
      decoded.userId, 
      decoded.email, 
      decoded.role
    );
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Failed to generate new tokens',
        error: tokenPair.error
      });
    }
    
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
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      instructions: {
        message: 'Use new tokens for future requests',
        note: 'JWT-based tokens (not stored in database)'
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

// Admin Login - dedicated endpoint for admin authentication
const adminLogin = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    const { admin_email, admin_password } = sanitizedData;

    // Validate required fields
    const requiredFields = ['admin_email', 'admin_password'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Admin email and password are required',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields
      });
    }

    // Validate email format
    if (!validateEmail(admin_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid admin email address',
        field: 'admin_email'
      });
    }

    // Check if admin exists in database
    const [admins] = query('SELECT * FROM admins WHERE admin_email = ?', [admin_email]);
    
    if (admins.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: '❌ Admin not found',
        suggestion: 'Please check your admin email address',
        action: 'admin_not_found'
      });
    }

    const admin = admins[0];

    // Validate password
    const isPasswordValid = await comparePassword(admin_password, admin.admin_password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: '❌ Invalid admin password',
        suggestion: 'Please check your password and try again',
        field: 'admin_password'
      });
    }

    // Generate token pair specifically for admin with their actual role
    const tokenPair = await generateTokenPair(admin.admin_id, admin.admin_email, admin.role);
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Error generating admin authentication tokens',
        error: tokenPair.error
      });
    }

    // Return successful admin login response
    res.json({
      success: true,
      message: '✅ Admin login successful',
      admin: {
        admin_id: admin.admin_id,
        admin_name: admin.admin_name,
        admin_email: admin.admin_email,
        admin_phone: admin.admin_phone,
        admin_studyyear: admin.admin_studyyear,
        admin_branch: admin.admin_branch,
        admin_section: admin.admin_section,
        admin_residency: admin.admin_residency,
        role: admin.role
      },
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenExpiry: {
        accessToken: tokenPair.accessTokenExpiresIn,
        refreshToken: tokenPair.refreshTokenExpiresIn
      },
      instructions: {
        message: 'Use accessToken for admin API requests',
        header: 'Authorization: Bearer ACCESS_TOKEN',
        note: 'This token is specifically for admin operations'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Admin login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Admin Registration - dedicated endpoint for admin registration
const adminRegister = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    
    const {
      admin_name,
      admin_email,
      admin_password,
      admin_phone,
      admin_studyyear,
      admin_branch,
      admin_section,
      admin_residency
    } = sanitizedData;

    // Validate required fields
    const requiredFields = ['admin_name', 'admin_email', 'admin_password'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Missing required fields for admin registration',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields
      });
    }

    // Validate email format
    if (!validateEmail(admin_email)) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Please provide a valid admin email address',
        field: 'admin_email'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(admin_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Admin password validation failed',
        details: passwordValidation.message,
        field: 'admin_password'
      });
    }

    // Check if admin already exists
    const [existingAdmins] = query(
      'SELECT admin_id FROM admins WHERE admin_email = ?',
      [admin_email]
    );
    
    if (existingAdmins.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: '❌ Admin with this email already exists',
        suggestion: 'Please use admin login instead or use a different email address',
        field: 'admin_email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(admin_password);

    // Insert new admin
    const [result] = run(
      `INSERT INTO admins 
       (admin_name, admin_email, admin_password, admin_phone, admin_studyyear, admin_branch, admin_section, admin_residency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_name,
        admin_email,
        hashedPassword,
        admin_phone,
        admin_studyyear,
        admin_branch,
        admin_section,
        admin_residency
      ]
    );

    // Generate token pair specifically for admin with default 'admin' role
    const tokenPair = await generateTokenPair(result.insertId, admin_email, 'admin');
    
    if (!tokenPair.success) {
      return res.status(500).json({
        success: false,
        message: '❌ Error generating admin authentication tokens',
        error: tokenPair.error
      });
    }

    // Get the created admin (excluding password)
    const [newAdmin] = query(`
      SELECT 
        admin_id, 
        admin_name, 
        admin_email, 
        admin_phone, 
        admin_studyyear, 
        admin_branch, 
        admin_section, 
        admin_residency,
        role,
        created_at,
        updated_at
      FROM admins 
      WHERE admin_id = ?
    `, [result.insertId]);

    // Return successful admin registration response
    res.status(201).json({
      success: true,
      message: '✅ Admin registered successfully',
      admin: newAdmin[0],
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenExpiry: {
        accessToken: tokenPair.accessTokenExpiresIn,
        refreshToken: tokenPair.refreshTokenExpiresIn
      },
      instructions: {
        message: 'Admin account created and logged in automatically',
        usage: 'Use accessToken for admin API requests',
        header: 'Authorization: Bearer ACCESS_TOKEN',
        note: 'This token is specifically for admin operations'
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Admin registration failed',
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
  adminLogin,
  adminRegister,
  // Keep backward compatibility
  register: signup
};
