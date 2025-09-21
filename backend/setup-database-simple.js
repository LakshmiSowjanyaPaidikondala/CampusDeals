require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { db } = require('./src/config/db');

async function execSQLFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  for (const statement of statements) {
    await new Promise((resolve, reject) => {
      db.run(statement, (err) => {
        if (err) {
          // Ignore "table doesn't exist" errors for DROP statements
          if (err.message.includes('no such table') && statement.includes('DROP TABLE')) {
            console.log('⚠️  Table does not exist (ignored):', statement.substring(0, 30) + '...');
            resolve();
          } else {
            console.error('❌ Error executing:', statement.substring(0, 50) + '...');
            console.error('Error:', err.message);
            reject(err);
          }
        } else {
          console.log('✅', statement.substring(0, 50) + '...');
          resolve();
        }
      });
    });
  }
}

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing SQLite database...');

    // Create tables
    await execSQLFile(path.join(__dirname, 'src/models/schema_sqlite.sql'));
    console.log('✅ Database schema created successfully');

    // Insert seed data
    await execSQLFile(path.join(__dirname, 'src/models/seed_data_sqlite.sql'));
    console.log('✅ Database seeded successfully');

    // Verify data
    const userCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const productCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`📊 Database contains: ${userCount} users, ${productCount} products`);
    console.log('🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🏁 Setup complete! You can now start the server.');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };