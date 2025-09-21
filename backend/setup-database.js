require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { db } = require('./src/config/db');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing SQLite database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'src/models/schema_clean.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Better SQL statement splitting that handles multi-line statements
    const statements = schemaSQL
      .replace(/\r\n/g, '\n') // Normalize line endings
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt + ';'); // Re-add semicolon
    
    for (const statement of statements) {
      if (statement.trim() === ';') continue; // Skip empty statements
      
      await new Promise((resolve, reject) => {
        db.run(statement, (err) => {
          if (err) {
            console.error('Error executing statement:', statement.substring(0, 100) + '...');
            console.error('Error details:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('✅ Database schema created successfully');

    // Read and execute seed data
    const seedPath = path.join(__dirname, 'src/models/seed_data_sqlite.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    const seedStatements = seedSQL
      .replace(/\r\n/g, '\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt + ';');
    
    for (const statement of seedStatements) {
      if (statement.trim() === ';') continue;
      
      await new Promise((resolve, reject) => {
        db.run(statement, (err) => {
          if (err) {
            console.error('Error executing seed statement:', statement.substring(0, 100) + '...');
            console.error('Error details:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('✅ Database seeded successfully');
    console.log('🎉 Database initialization complete!');
    
    // Verify seeding by counting records
    const countUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    const countProducts = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`📊 Database contains: ${countUsers} users, ${countProducts} products`);
    
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
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };