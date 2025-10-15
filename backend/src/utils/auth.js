const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateRefreshToken, storeRefreshToken } = require('./refreshToken');

// Generate JWT access token (short-lived)
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } // Short-lived access token
  );
};

// Generate both access and refresh tokens
const generateTokenPair = async (userId, email, role) => {
  try {
    // Generate short-lived access token
    const accessToken = generateToken(userId, email, role);
    
    // Generate long-lived refresh token
    const refreshTokenData = generateRefreshToken(userId, email, role);
    
    // Store refresh token in database
    const storeResult = await storeRefreshToken(
      userId, 
      refreshTokenData.refreshToken, 
      refreshTokenData.expiresAt
    );
    
    if (!storeResult.success) {
      throw new Error('Failed to store refresh token');
    }
    
    return {
      success: true,
      accessToken,
      refreshToken: refreshTokenData.refreshToken,
      accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshTokenExpiresIn: '15m'
    };
  } catch (error) {
    console.error('Error generating token pair:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  generateTokenPair,
  hashPassword,
  comparePassword,
  verifyToken
};
