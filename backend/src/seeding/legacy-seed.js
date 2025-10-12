// Clean Better-SQLite3 Seed Data
// This file populates the database with sample users and products

const { db } = require('./src/config/db');

console.log('🌱 SEEDING DATABASE WITH SAMPLE DATA');
console.log('=====================================');

try {
    // Start transaction for optimal performance
    const transaction = db.transaction(() => {
        
        // Check if users already exist
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
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
            
            console.log('✅ Users inserted successfully');
        } else {
            console.log('ℹ️ Users already exist, skipping user insertion');
        }
        
        // Check if products already exist
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
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
            
            console.log('✅ Products inserted successfully');
        } else {
            console.log('ℹ️ Products already exist, skipping product insertion');
        }
        
        return { success: true };
    });
    
    // Execute transaction
    const result = transaction();
    
    if (result.success) {
        console.log('\n✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        
        // Display final counts
        const finalCounts = {
            users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
            products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
            cart: db.prepare('SELECT COUNT(*) as count FROM cart').get(),
            orders: db.prepare('SELECT COUNT(*) as count FROM orders').get()
        };
        
        console.log('\n📊 FINAL DATABASE STATUS:');
        console.log(`   👥 Users: ${finalCounts.users.count}`);
        console.log(`   📦 Products: ${finalCounts.products.count}`);
        console.log(`   🛒 Cart items: ${finalCounts.cart.count}`);
        console.log(`   📋 Orders: ${finalCounts.orders.count}`);
        
        console.log('\n🎯 READY FOR TESTING:');
        console.log('   ✅ Sample users available (buyers, sellers, admin)');
        console.log('   ✅ Sample products with consistent codes');
        console.log('   ✅ Clean cart and orders tables');
        console.log('   ✅ Updated product code format (DFT-001, WLC-001, etc.)');
        
        console.log('\n🔑 TEST CREDENTIALS:');
        console.log('   Buyer: ravi@example.com / password123');
        console.log('   Seller: priya@example.com / password123');
        console.log('   Admin: admin@campusdeals.com / password123');
    }
    
} catch (error) {
    console.error('❌ ERROR during database seeding:', error.message);
    console.error('   Transaction rolled back automatically');
    process.exit(1);
}