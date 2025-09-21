require('dotenv').config();
const { db } = require('./src/config/db');

async function setupTables() {
  try {
    console.log('🚀 Setting up all database tables...');

    // Create users table
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
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
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Users table created');
          resolve();
        }
      });
    });

    // Create products table
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT CHECK(product_name IN ('drafter','white_lab_coat','brown_lab_coat','calculator')) NOT NULL,
        product_variant TEXT CHECK(product_variant IN ('premium_drafter','standard_drafter','budget_drafter', 'S','M','L','XL','XXL', 'MS','ES','ES-Plus')) NOT NULL,
        product_code TEXT UNIQUE,
        product_price REAL NOT NULL,
        product_images TEXT,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Products table created');
          resolve();
        }
      });
    });

    // Create cart table
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS cart (
        cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Cart table created');
          resolve();
        }
      });
    });

    // Create orders table
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        serial_no TEXT UNIQUE NOT NULL,
        product_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT CHECK(payment_method IN ('cash','upi')) NOT NULL,
        status TEXT CHECK(status IN ('pending','completed','cancelled')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        cart_user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        FOREIGN KEY (cart_user_id) REFERENCES cart(user_id) ON DELETE SET NULL
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Orders table created');
          resolve();
        }
      });
    });

    // Insert sample products
    console.log('📦 Adding sample products...');
    
    const sampleProducts = [
      ['drafter', 'premium_drafter', 'DFT-P001', 2500.00, 'images/drafter_premium.jpg', 15],
      ['drafter', 'standard_drafter', 'DFT-S001', 1800.00, 'images/drafter_standard.jpg', 25],
      ['drafter', 'budget_drafter', 'DFT-B001', 1200.00, 'images/drafter_budget.jpg', 30],
      ['white_lab_coat', 'S', 'WLC-S001', 450.00, 'images/white_labcoat_s.jpg', 12],
      ['white_lab_coat', 'M', 'WLC-M001', 450.00, 'images/white_labcoat_m.jpg', 20],
      ['white_lab_coat', 'L', 'WLC-L001', 450.00, 'images/white_labcoat_l.jpg', 18],
      ['calculator', 'MS', 'CALC-MS001', 1200.00, 'images/calculator_ms.jpg', 20],
      ['calculator', 'ES', 'CALC-ES001', 800.00, 'images/calculator_es.jpg', 25]
    ];

    for (const product of sampleProducts) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO products 
          (product_name, product_variant, product_code, product_price, product_images, quantity) 
          VALUES (?, ?, ?, ?, ?, ?)`, product, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('✅ Sample products added');
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupTables();