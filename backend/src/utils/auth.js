const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateRefreshToken } = require('./refreshToken');
const config = require('../config/environment');

// Generate JWT access token (short-lived)
const generateToken = (userId, email, role) => {
  // Use centralized config which already provides a safe default for the JWT secret
  const secret = config.jwt && config.jwt.secret ? config.jwt.secret : process.env.JWT_SECRET;
  const expiresIn = (config.jwt && config.jwt.expiresIn) || process.env.JWT_EXPIRES_IN || '15m';

  return jwt.sign(
    { userId, email, role },
    secret,
    { expiresIn }
  );
};

// Generate both access and refresh tokens
const generateTokenPair = async (userId, email, role) => {
  try {
    // Generate short-lived access token
    const accessToken = generateToken(userId, email, role);
    
    // Generate refresh token (but don't store it)
    const refreshTokenData = generateRefreshToken(userId, email, role);
    
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
  const secret = config.jwt && config.jwt.secret ? config.jwt.secret : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  generateTokenPair,
  hashPassword,
  comparePassword,
  verifyToken
};
