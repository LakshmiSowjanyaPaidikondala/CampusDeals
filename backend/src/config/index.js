/**
 * Configuration Index
 * Central export for all configuration modules
 */

module.exports = {
  environment: require('./environment'),
  database: require('./db'),
  cors: require('./cors')
};