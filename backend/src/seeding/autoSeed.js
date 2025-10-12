// Auto-Seeding Database Module
// This file handles automatic database seeding when the application starts

const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Ensure database tables exist by running the schema
 */
const ensureTablesExist = () => {
    try {
        // Read and execute the schema file
        const schemaPath = path.join(__dirname, '../models/schema_better_sqlite3.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🔧 Setting up database schema...');
        
        // Execute the entire schema as one operation
        db.exec(schemaSql);
        
        console.log('✅ Database tables ensured');
        
    } catch (error) {
        console.error('❌ Failed to create database tables:', error.message);
        throw error;
    }
};

/**
 * Auto-seed database with sample data
 * Runs automatically when the application starts
 */
const autoSeedDatabase = () => {
    try {
        console.log('\n🌱 AUTO-SEEDING DATABASE...');
        console.log('================================');

        // First, ensure tables exist
        ensureTablesExist();

        // Pre-check if seeding is needed at all (with error handling)
        let userCount = { count: 0 };
        let productCount = { count: 0 };
        
        try {
            userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
        } catch (error) {
            console.log('📊 Tables created, starting fresh seeding...');
        }
        
        // If both users and products exist, skip seeding entirely
        if (userCount.count >= 5 && productCount.count > 0) {
            console.log(`📊 Database already populated: ${userCount.count} users, ${productCount.count} products`);
            console.log('✅ Auto-seeding skipped - data already exists');
            return;
        }

        console.log('🔍 Checking data requirements...');
        console.log(`📊 Current data: ${userCount.count} users, ${productCount.count} products`);

        // Start transaction for optimal performance
        const transaction = db.transaction(() => {
            
            // Check if users already exist
            console.log(`📊 Current users: ${userCount.count}`);
            
            // Only insert users if table is empty or has few users
            if (userCount.count < 5) {
                console.log('👥 Inserting sample users...');
                
                // Insert Users (Buyers, Sellers, and Admin)
                // Password is 'password123' hashed with bcrypt rounds=12
                const insertUser = db.prepare(`
                    INSERT INTO users 
                    (user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                
                // Buyers
                insertUser.run('Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00);
                insertUser.run('Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00);
                insertUser.run('Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00);
                insertUser.run('Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00);
                insertUser.run('Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00);
                
                // Sellers
                insertUser.run('Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00);
                insertUser.run('Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00);
                insertUser.run('Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00);
                insertUser.run('Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00);
                insertUser.run('Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00);
                
                // Admin user
                insertUser.run('Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00);
                
                console.log('✅ Sample users inserted');
            } else {
                console.log('ℹ️ Users already exist, skipping user insertion');
            }
            
            // Check if products already exist
            console.log(`📊 Current products: ${productCount.count}`);
            
            // Insert products (this will use our updated product code format)
            if (productCount.count === 0) {
                console.log('📦 Inserting sample products...');
                
                const insertProduct = db.prepare(`
                    INSERT INTO products 
                    (product_name, product_variant, product_code, product_price, product_images, quantity)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                // Drafters with updated format
                insertProduct.run('drafter', 'premium_drafter', 'DFT-P', 400.00, 'Drafter.jpeg', 15);
                insertProduct.run('drafter', 'standard_drafter', 'DFT-S', 350.00, 'Drafter.jpeg', 25);
                insertProduct.run('drafter', 'budget_drafter', 'DFT-B', 300.00, 'Drafter.jpeg', 30);
                
                // White Lab Coats
                insertProduct.run('white_lab_coat', 'S', 'WLC-S', 230.00, 'Chemical.jpeg', 12);
                insertProduct.run('white_lab_coat', 'M', 'WLC-M', 230.00, 'Chemical.jpeg', 20);
                insertProduct.run('white_lab_coat', 'L', 'WLC-L', 230.00, 'Chemical.jpeg', 18);
                insertProduct.run('white_lab_coat', 'XL', 'WLC-XL', 230.00, 'Chemical.jpeg', 10);
                insertProduct.run('white_lab_coat', 'XXL', 'WLC-XXL', 230.00, 'Chemical.jpeg', 5);
                
                // Brown Lab Coats
                insertProduct.run('brown_lab_coat', 'S', 'BLC-S', 230.00, 'Mechanical.jpeg', 8);
                insertProduct.run('brown_lab_coat', 'M', 'BLC-M', 230.00, 'Mechanical.jpeg', 15);
                insertProduct.run('brown_lab_coat', 'L', 'BLC-L', 230.00, 'Mechanical.jpeg', 12);
                insertProduct.run('brown_lab_coat', 'XL', 'BLC-XL', 230.00, 'Mechanical.jpeg', 7);
                insertProduct.run('brown_lab_coat', 'XXL', 'BLC-XXL', 230.00, 'Mechanical.jpeg', 3);
                
                // Calculators
                insertProduct.run('calculator', 'MS', 'CALC-MS', 950.00, 'Calci.jpg', 20);
                insertProduct.run('calculator', 'ES', 'CALC-ES', 950.00, 'Calci.jpg', 25);
                insertProduct.run('calculator', 'ES-Plus', 'CALC-ES-Plus', 1000.00, 'Calci.jpg', 15);
                
                // ChartBox
                insertProduct.run('chartbox', 'chart holder', 'CRT', 60.00, 'chart holder.jpg', 20);
                
                console.log('✅ Sample products inserted');
            } else {
                console.log('ℹ️ Products already exist, skipping product insertion');
            }
            
            return { success: true };
        });
        
        // Execute transaction
        const result = transaction();
        
        if (result.success) {
            // Display final counts
            const finalCounts = {
                users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
                products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
                cart: db.prepare('SELECT COUNT(*) as count FROM cart').get(),
                orders: db.prepare('SELECT COUNT(*) as count FROM orders').get()
            };
            
            console.log('✅ Auto-seeding completed successfully');
            console.log(`📊 Database Status: ${finalCounts.users.count} users, ${finalCounts.products.count} products, ${finalCounts.cart.count} cart items, ${finalCounts.orders.count} orders`);
            
            // Show test credentials only if new users were added
            if (finalCounts.users.count <= 11) {
                console.log('🔑 Test Credentials: ravi@example.com, priya@example.com / password123');
            }
        }
        
    } catch (error) {
        console.error('❌ Auto-seeding failed:', error.message);
        // Don't exit the application, just log the error
        console.error('⚠️ Application will continue without sample data');
    }
};

/**
 * Manual seeding function for development purposes (standalone)
 */
const manualSeed = () => {
    console.log('🛠️ MANUAL DATABASE SEEDING');
    console.log('==========================');
    
    try {
        // First, ensure tables exist
        ensureTablesExist();
        
        // Pre-check if seeding is needed (with error handling)
        let userCount = { count: 0 };
        let productCount = { count: 0 };
        
        try {
            userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
            productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
        } catch (error) {
            console.log('📊 Tables created, starting fresh seeding...');
        }
        
        console.log('🔍 Checking current data status...');
        console.log(`📊 Current data: ${userCount.count} users, ${productCount.count} products`);
        
        // Check if both data types already exist
        if (userCount.count >= 5 && productCount.count > 0) {
            console.log('ℹ️ Database already contains sufficient data');
            console.log('💡 Use "node seed.js reset" first if you want to refresh the data');
            return;
        }
        
        const transaction = db.transaction(() => {
            
            // Check and seed users
            console.log(`📊 Current users: ${userCount.count}`);
            
            if (userCount.count === 0) {
                console.log('👥 Inserting sample users...');
                
                const insertUser = db.prepare(`
                    INSERT INTO users (name, email, mobile, password, role, branch) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                // Pre-hashed password: password123
                const hashedPassword = '$2b$10$rDjN0k5k5R5R5R5R5R5R5OeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK';
                
                insertUser.run('Ravi Kumar', 'ravi@example.com', '9876543210', hashedPassword, 'buy', 'CSE');
                insertUser.run('Priya Sharma', 'priya@example.com', '9876543211', hashedPassword, 'sell', 'ECE');
                insertUser.run('Amit Singh', 'amit@example.com', '9876543212', hashedPassword, 'buy', 'ME');
                insertUser.run('Sneha Patel', 'sneha@example.com', '9876543213', hashedPassword, 'sell', 'CSE');
                insertUser.run('Vikram Reddy', 'vikram@example.com', '9876543214', hashedPassword, 'buy', 'ECE');
                insertUser.run('Anita Verma', 'anita@example.com', '9876543215', hashedPassword, 'sell', 'ME');
                insertUser.run('Rajesh Gupta', 'rajesh@example.com', '9876543216', hashedPassword, 'buy', 'CSE');
                insertUser.run('Pooja Jain', 'pooja@example.com', '9876543217', hashedPassword, 'sell', 'ECE');
                insertUser.run('Suresh Yadav', 'suresh@example.com', '9876543218', hashedPassword, 'buy', 'ME');
                insertUser.run('Kavita Nair', 'kavita@example.com', '9876543219', hashedPassword, 'sell', 'CSE');
                insertUser.run('Rohit Agarwal', 'rohit@example.com', '9876543220', hashedPassword, 'buy', 'ECE');
                
                console.log('✅ Sample users inserted');
            } else {
                console.log('ℹ️ Users already exist, skipping user insertion');
            }
            
            // Check and seed products
            console.log(`📊 Current products: ${productCount.count}`);
            
            if (productCount.count === 0) {
                console.log('📦 Inserting sample products...');
                
                const insertProduct = db.prepare(`
                    INSERT INTO products 
                    (product_name, product_variant, product_code, product_price, product_images, quantity)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                // Drafters with updated format
                insertProduct.run('drafter', 'premium_drafter', 'DFT-001', 400.00, 'Drafter.jpeg', 15);
                insertProduct.run('drafter', 'standard_drafter', 'DFT-002', 350.00, 'Drafter.jpeg', 25);
                insertProduct.run('drafter', 'budget_drafter', 'DFT-003', 300.00, 'Drafter.jpeg', 30);
                
                // White Lab Coats
                insertProduct.run('white_lab_coat', 'S', 'WLC-001', 230.00, 'Chemical.jpeg', 12);
                insertProduct.run('white_lab_coat', 'M', 'WLC-002', 230.00, 'Chemical.jpeg', 20);
                insertProduct.run('white_lab_coat', 'L', 'WLC-003', 230.00, 'Chemical.jpeg', 18);
                insertProduct.run('white_lab_coat', 'XL', 'WLC-004', 230.00, 'Chemical.jpeg', 10);
                insertProduct.run('white_lab_coat', 'XXL', 'WLC-005', 230.00, 'Chemical.jpeg', 5);
                
                // Brown Lab Coats
                insertProduct.run('brown_lab_coat', 'S', 'BLC-001', 230.00, 'Mechanical.jpeg', 8);
                insertProduct.run('brown_lab_coat', 'M', 'BLC-002', 230.00, 'Mechanical.jpeg', 15);
                insertProduct.run('brown_lab_coat', 'L', 'BLC-003', 230.00, 'Mechanical.jpeg', 12);
                insertProduct.run('brown_lab_coat', 'XL', 'BLC-004', 230.00, 'Mechanical.jpeg', 7);
                insertProduct.run('brown_lab_coat', 'XXL', 'BLC-005', 230.00, 'Mechanical.jpeg', 3);
                
                // Calculators
                insertProduct.run('calculator', 'MS', 'CALC-001', 950.00, 'Calci.jpg', 20);
                insertProduct.run('calculator', 'ES', 'CALC-002', 950.00, 'Calci.jpg', 25);
                insertProduct.run('calculator', 'ES-Plus', 'CALC-003', 950.00, 'Calci.jpg', 15);
                
                // ChartBox
                insertProduct.run('chartbox', 'chart holder', 'CHB-001', 60.00, 'chart holder.jpg', 20);
                
                console.log('✅ Sample products inserted');
            } else {
                console.log('ℹ️ Products already exist, skipping product insertion');
            }
            
            return { success: true };
        });
        
        // Execute transaction
        const result = transaction();
        
        if (result.success) {
            // Display final counts
            const finalCounts = {
                users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
                products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
                cart: db.prepare('SELECT COUNT(*) as count FROM cart').get(),
                orders: db.prepare('SELECT COUNT(*) as count FROM orders').get()
            };
            
            console.log('✅ Manual seeding completed successfully');
            console.log(`📊 Database Status: ${finalCounts.users.count} users, ${finalCounts.products.count} products, ${finalCounts.cart.count} cart items, ${finalCounts.orders.count} orders`);
        }
        
    } catch (error) {
        console.error('❌ Manual seeding failed:', error.message);
        process.exit(1);
    }
};

module.exports = {
    autoSeedDatabase,
    manualSeed
};