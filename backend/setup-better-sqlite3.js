// setup-better-sqlite3.js
// PowerShell-compatible database setup for better-sqlite3

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Database file path
const dbPath = path.join(__dirname, 'database/campusdeals.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function setupDatabase() {
  let db;
  
  try {
    console.log('🗃️  Setting up Better-SQLite3 database...');
    
    // Try to close any existing connections first
    try {
      if (fs.existsSync(dbPath)) {
        console.log('📁 Database file exists, attempting to clear data...');
        
        // Try to connect and clear data instead of deleting file
        db = new Database(dbPath);
        console.log('🔄 Connected to existing database');
        
        // Clear existing data safely
        console.log('🧹 Clearing existing data...');
        db.exec('PRAGMA foreign_keys = OFF');
        db.exec('DROP TABLE IF EXISTS orders');
        db.exec('DROP TABLE IF EXISTS cart');  
        db.exec('DROP TABLE IF EXISTS products');
        db.exec('DROP TABLE IF EXISTS users');
        db.exec('PRAGMA foreign_keys = ON');
        console.log('✅ Existing data cleared');
        
        db.close();
      }
    } catch (clearError) {
      console.log('⚠️  Could not clear existing data, creating new database...');
      if (db) {
        try { db.close(); } catch (e) {}
      }
      
      // If we can't clear, try to delete the file
      try {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log('🗑️  Deleted existing database file');
        }
      } catch (deleteError) {
        console.log('⚠️  Could not delete database file (it may be in use)');
        console.log('💡 Please stop your application server and try again');
        throw new Error('Database file is locked. Please stop your application and try again.');
      }
    }
    
    // Create new database connection
    db = new Database(dbPath, { verbose: console.log });
    console.log('✅ Created database connection');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'src/models/schema_better_sqlite3.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('📋 Executing schema...');
      db.exec(schemaSql);
      console.log('✅ Schema executed successfully');
    } else {
      throw new Error('Schema file not found: ' + schemaPath);
    }
    
    // Read and execute seed data file
    const seedPath = path.join(__dirname, 'src/models/seed_data_better_sqlite3.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('🌱 Inserting seed data...');
      db.exec(seedSql);
      console.log('✅ Seed data inserted successfully');
    } else {
      throw new Error('Seed data file not found: ' + seedPath);
    }
    
    // Verify data was inserted
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    const cartCount = db.prepare('SELECT COUNT(*) as count FROM cart').get();
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    
    console.log('📊 Database Statistics:');
    console.log(`   👥 Users: ${userCount.count}`);
    console.log(`   📦 Products: ${productCount.count}`);
    console.log(`   🛒 Cart items: ${cartCount.count}`);
    console.log(`   📋 Orders: ${orderCount.count}`);
    
    // Show sample products
    console.log('\\n🛍️  Sample Products:');
    const products = db.prepare('SELECT product_name, product_variant, product_price, quantity FROM products LIMIT 5').all();
    products.forEach(product => {
      console.log(`   - ${product.product_name} (${product.product_variant}): ₹${product.product_price} (Stock: ${product.quantity})`);
    });
    
    console.log('\\n🎉 Database setup completed successfully!');
    console.log(`📁 Database location: ${dbPath}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

function clearProductData() {
  let db;
  
  try {
    console.log('🧹 Clearing existing product data...');
    
    if (!fs.existsSync(dbPath)) {
      console.log('⚠️  Database does not exist yet');
      return;
    }
    
    db = new Database(dbPath);
    
    // Clear related tables first (foreign key constraints)
    db.prepare('DELETE FROM cart').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM products').run();
    
    console.log('✅ Product data cleared successfully');
    
  } catch (error) {
    console.error('❌ Failed to clear product data:', error.message);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearProductData();
    break;
  case 'setup':
  case undefined:
    setupDatabase();
    break;
  default:
    console.log('Usage:');
    console.log('  node setup-better-sqlite3.js        # Full setup (schema + seed data)');
    console.log('  node setup-better-sqlite3.js setup  # Full setup (schema + seed data)');
    console.log('  node setup-better-sqlite3.js clear  # Clear product data only');
}