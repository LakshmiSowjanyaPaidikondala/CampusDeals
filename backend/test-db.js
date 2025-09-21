require('dotenv').config();
const { db, query, run } = require('./src/config/db');

function testDatabase() {
  try {
    console.log('🧪 Testing SQLite database connection...');
    
    // Test basic query
    console.log('Testing basic query...');
    
    // First, let's manually create the users table if it doesn't exist
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      user_email TEXT UNIQUE NOT NULL,
      user_password TEXT NOT NULL,
      role TEXT CHECK(role IN ('buyer','seller','admin')) DEFAULT 'buyer',
      user_phone TEXT,
      user_studyyear TEXT,
      user_branch TEXT,
      user_section TEXT,
      user_residency TEXT,
      payment_received REAL DEFAULT 0,
      amount_given REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Users table created/verified');

    // Test insert
    console.log('Testing user insert...');
    const [result] = run(
      `INSERT OR IGNORE INTO users (user_name, user_email, user_password, role) VALUES (?, ?, ?, ?)`,
      ['Test User', 'test@example.com', 'hashed_password', 'buyer']
    );
    
    console.log('✅ Insert result:', result);

    // Test query
    console.log('Testing user query...');
    const [users] = query('SELECT * FROM users WHERE user_email = ?', ['test@example.com']);
    console.log('✅ Query result:', users);

    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();