/**
 * Refresh Token Management Utility
 * Handles JWT-based refresh token generation (NO database storage)
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a secure JWT refresh token (not stored in database)
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {Object} - Contains refresh token and expiry
 */
const generateRefreshToken = (userId, email, role) => {
  const config = require('../config/environment');
  
  // Create JWT refresh token
  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: '15m' } // 15 minutes expiry
  );
  
  // Set expiry time (15 minutes from now)
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + (15 * 60 * 1000));
  
  return {
    refreshToken,
    expiresAt: expiresAt.toISOString(),
    payload: { userId, email, role }
  };
};

module.exports = {
  generateRefreshToken
};