// src/config/db.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./environment');

// Database file path
const dbPath = config.database.path || path.join(__dirname, '../../database/campusdeals.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create better-sqlite3 connection
let db;
try {
  // Use verbose logging based on config
  const verboseLogging = config.database.verbose ? console.log : null;
  db = new Database(dbPath, { verbose: verboseLogging });
  console.log('Connected to SQLite database');
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Set WAL mode for better performance
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.error('Error opening SQLite database:', err.message);
  process.exit(1);
}

// Helper function for SELECT queries (returns array of rows)
const dbQuery = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(params);
    return [rows, { affectedRows: rows.length }];
  } catch (error) {
    throw error;
  }
};

// Helper function for INSERT/UPDATE/DELETE operations
const dbRun = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    return [{ insertId: result.lastInsertRowid, affectedRows: result.changes }];
  } catch (error) {
    throw error;
  }
};

// Helper function to get a single row
const dbGet = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const row = stmt.get(params);
    return row;
  } catch (error) {
    throw error;
  }
};

// Helper function for transactions
const dbTransaction = (callback) => {
  const transaction = db.transaction(callback);
  return transaction;
};

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

// Export database instance and helper functions
module.exports = {
  db,
  query: dbQuery,
  run: dbRun,
  get: dbGet,
  transaction: dbTransaction
};
