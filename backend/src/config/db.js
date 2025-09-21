// src/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/campusdeals.db');

// Ensure database directory exists
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create SQLite connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Helper function to promisify database operations
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve([rows, { insertId: this?.lastID, affectedRows: this?.changes }]);
      }
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
      }
    });
  });
};

// Export both the raw database and helper functions
module.exports = {
  db,
  query: dbQuery,
  run: dbRun
};
