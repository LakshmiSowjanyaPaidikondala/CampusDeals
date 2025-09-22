// quick-reset.js
// Quick database reset without deleting the file

require('dotenv').config();
const { db } = require('./src/config/db');
const fs = require('fs');
const path = require('path');

function quickReset() {
  try {
    console.log('🔄 Quick database reset...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    db.exec('PRAGMA foreign_keys = OFF');
    
    // Drop tables in correct order
    db.exec('DROP TABLE IF EXISTS orders');
    db.exec('DROP TABLE IF EXISTS cart');  
    db.exec('DROP TABLE IF EXISTS products');
    db.exec('DROP TABLE IF EXISTS users');
    
    db.exec('PRAGMA foreign_keys = ON');
    console.log('✅ Tables dropped');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'src/models/schema_better_sqlite3.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📋 Creating tables...');
    db.exec(schemaSql);
    console.log('✅ Tables created');
    
    // Read and execute seed data
    console.log('🌱 Inserting seed data...');
    
    // Insert users first
    const insertUser = db.prepare(`INSERT INTO users 
      (user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    const users = [
      ['Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00],
      ['Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00],
      ['Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00],
      ['Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00],
      ['Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00],
      ['Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00],
      ['Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00],
      ['Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00],
      ['Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00],
      ['Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00],
      ['Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00]
    ];
    
    users.forEach(user => insertUser.run(...user));
    console.log('✅ Users inserted');
    
    // Insert products
    const insertProduct = db.prepare(`INSERT INTO products 
      (product_name, product_variant, product_code, product_price, product_images, quantity)
      VALUES (?, ?, ?, ?, ?, ?)`);
    
    const products = [
      // Drafters
      ['drafter', 'premium_drafter', 'DFT-P001', 400.00, '/images/Drafter.jpeg', 15],
      ['drafter', 'standard_drafter', 'DFT-S001', 350.00, '/images/Drafter.jpeg', 25],
      ['drafter', 'budget_drafter', 'DFT-B001', 300.00, '/images/Drafter.jpeg', 30],
      
      // White Lab Coats
      ['white_lab_coat', 'S', 'WLC-S001', 230.00, '/images/Chemical.jpeg', 12],
      ['white_lab_coat', 'M', 'WLC-M001', 230.00, '/images/Chemical.jpeg', 20],
      ['white_lab_coat', 'L', 'WLC-L001', 230.00, '/images/Chemical.jpeg', 18],
      ['white_lab_coat', 'XL', 'WLC-XL001', 230.00, '/images/Chemical.jpeg', 10],
      ['white_lab_coat', 'XXL', 'WLC-XXL001', 230.00, '/images/Chemical.jpeg', 5],
      
      // Brown Lab Coats
      ['brown_lab_coat', 'S', 'BLC-S001', 230.00, '/images/Mechanical.jpeg', 8],
      ['brown_lab_coat', 'M', 'BLC-M001', 230.00, '/images/Mechanical.jpeg', 15],
      ['brown_lab_coat', 'L', 'BLC-L001', 230.00, '/images/Mechanical.jpeg', 12],
      ['brown_lab_coat', 'XL', 'BLC-XL001', 230.00, '/images/Mechanical.jpeg', 7],
      ['brown_lab_coat', 'XXL', 'BLC-XXL001', 230.00, '/images/Mechanical.jpeg', 3],
      
      // Calculators
      ['calculator', 'MS', 'CALC-MS001', 950.00, '/images/Calci.jpg', 20],
      ['calculator', 'ES', 'CALC-ES001', 950.00, '/images/Calci.jpg', 25],
      ['calculator', 'ES-Plus', 'CALC-ESP001', 950.00, '/images/Calci.jpg', 15],
      
      // ChartBox
      ['chartbox', 'chart holder', 'CHART-MS001', 60.00, '/images/chart holder.jpg', 20]
    ];
    
    products.forEach(product => insertProduct.run(...product));
    console.log('✅ Products inserted');
    
    // Insert sample cart data
    const insertCart = db.prepare(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`);
    const cartData = [
      [1, 1, 1], // Ravi Kumar buying premium drafter
      [2, 4, 2], // Anjali Sharma buying 2 white lab coats (S)
      [3, 14, 1], // Mohit Verma buying MS calculator
      [4, 6, 1], // Sneha Patel buying white lab coat (L)
      [5, 2, 1]  // Arjun Reddy buying standard drafter
    ];
    
    cartData.forEach(cart => insertCart.run(...cart));
    console.log('✅ Cart data inserted');
    
    // Insert sample order data
    const insertOrder = db.prepare(`INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)`);
    const orderData = [
      [1, 'ORD-001-2024', 1, 2500.00, 'upi', 'completed'],
      [2, 'ORD-002-2024', 4, 900.00, 'cash', 'pending'],
      [3, 'ORD-003-2024', 14, 1200.00, 'upi', 'completed'],
      [4, 'ORD-004-2024', 6, 450.00, 'cash', 'pending'],
      [5, 'ORD-005-2024', 2, 1800.00, 'upi', 'completed']
    ];
    
    orderData.forEach(order => insertOrder.run(...order));
    console.log('✅ Order data inserted');
    
    // Verify data
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    
    console.log('📊 Database Statistics:');
    console.log(`   👥 Users: ${userCount.count}`);
    console.log(`   📦 Products: ${productCount.count}`);
    
    console.log('🎉 Quick reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick reset failed:', error.message);
    throw error;
  }
}

// Run the quick reset
quickReset();