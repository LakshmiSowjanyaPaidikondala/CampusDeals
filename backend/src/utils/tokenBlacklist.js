/**
 * Token Blacklist Utility
 * Simple in-memory token blacklist for JWT logout functionality
 * In production, consider using Redis or database storage
 */

// In-memory set to store blacklisted tokens
const blacklistedTokens = new Set();

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 */
const blacklistToken = (token) => {
  if (token) {
    blacklistedTokens.add(token);
    console.log(`🚫 Token blacklisted: ${token.substring(0, 20)}...`);
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

/**
 * Get count of blacklisted tokens (for monitoring)
 * @returns {number} - Number of blacklisted tokens
 */
const getBlacklistedTokenCount = () => {
  return blacklistedTokens.size;
};

/**
 * Clear expired tokens from blacklist (manual cleanup)
 * In a real implementation, this should be automated based on JWT expiration
 */
const clearExpiredTokens = () => {
  // Since we don't decode tokens here, this would need to be implemented
  // with proper JWT expiration checking in a production environment
  console.log('⚠️  Manual token cleanup needed - implement with JWT expiration logic');
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  getBlacklistedTokenCount,
  clearExpiredTokens
};