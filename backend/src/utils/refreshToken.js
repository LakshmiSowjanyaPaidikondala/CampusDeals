/**
 * Refresh Token Management Utility
 * Handles refresh token generation, validation, and storage
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { run, query } = require('../config/db');

/**
 * Generate a secure refresh token
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {Object} - Contains refresh token and expiry
 */
const generateRefreshToken = (userId, email, role) => {
  // Create a unique refresh token using crypto
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  // Set expiry time (3 hours from now)
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + (3 * 60 * 60 * 1000));
  
  return {
    refreshToken,
    expiresAt: expiresAt.toISOString(),
    payload: { userId, email, role }
  };
};

/**
 * Store refresh token in database
 * @param {number} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @param {string} expiresAt - Expiry date
 * @returns {Object} - Database operation result
 */
const storeRefreshToken = async (userId, refreshToken, expiresAt) => {
  try {
    // First, remove any existing refresh tokens for this user (one token per user)
    await revokeUserRefreshTokens(userId);
    
    // Store new refresh token
    const result = run(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, refreshToken, expiresAt]
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Error storing refresh token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate refresh token from database
 * @param {string} refreshToken - Refresh token to validate
 * @returns {Object} - Validation result with user data
 */
const validateRefreshToken = async (refreshToken) => {
  try {
    const [tokens] = query(
      `SELECT rt.*, u.user_email, u.role 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.user_id 
       WHERE rt.token = ? AND rt.expires_at > CURRENT_TIMESTAMP AND rt.revoked = 0`,
      [refreshToken]
    );
    
    if (tokens.length === 0) {
      return { valid: false, message: 'Invalid or expired refresh token' };
    }
    
    const token = tokens[0];
    
    return {
      valid: true,
      userId: token.user_id,
      email: token.user_email,
      role: token.role,
      tokenId: token.id
    };
  } catch (error) {
    console.error('Error validating refresh token:', error);
    return { valid: false, message: 'Token validation failed', error: error.message };
  }
};

/**
 * Revoke a specific refresh token
 * @param {string} refreshToken - Token to revoke
 * @returns {Object} - Revocation result
 */
const revokeRefreshToken = async (refreshToken) => {
  try {
    const result = run(
      'UPDATE refresh_tokens SET revoked = 1, revoked_at = CURRENT_TIMESTAMP WHERE token = ?',
      [refreshToken]
    );
    
    return { success: result.changes > 0, changes: result.changes };
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Revoke all refresh tokens for a user
 * @param {number} userId - User ID
 * @returns {Object} - Revocation result
 */
const revokeUserRefreshTokens = async (userId) => {
  try {
    const result = run(
      'UPDATE refresh_tokens SET revoked = 1, revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked = 0',
      [userId]
    );
    
    return { success: true, revokedCount: result.changes };
  } catch (error) {
    console.error('Error revoking user refresh tokens:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clean up expired refresh tokens
 * @returns {Object} - Cleanup result
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = run(
      'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP OR revoked = 1'
    );
    
    return { success: true, deletedCount: result.changes };
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get refresh token statistics for a user
 * @param {number} userId - User ID
 * @returns {Object} - Token statistics
 */
const getUserTokenStats = async (userId) => {
  try {
    const [stats] = query(
      `SELECT 
        COUNT(*) as total_tokens,
        COUNT(CASE WHEN revoked = 0 AND expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_tokens,
        COUNT(CASE WHEN revoked = 1 THEN 1 END) as revoked_tokens,
        COUNT(CASE WHEN expires_at <= CURRENT_TIMESTAMP THEN 1 END) as expired_tokens,
        MAX(created_at) as last_token_created
       FROM refresh_tokens 
       WHERE user_id = ?`,
      [userId]
    );
    
    return { success: true, stats: stats[0] };
  } catch (error) {
    console.error('Error getting token stats:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeUserRefreshTokens,
  cleanupExpiredTokens,
  getUserTokenStats
};