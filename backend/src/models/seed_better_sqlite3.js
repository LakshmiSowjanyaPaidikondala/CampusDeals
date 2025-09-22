/**
 * Better-SQLite3 Optimized Database Seeding Script
 * Utilizes prepared statements and transactions for maximum performance
 * Compatible with better-sqlite3@12.2.0
 */

const Database = require('better-sqlite3');
const path = require('path');

class BetterSQLiteSeeder {
    constructor(dbPath) {
        this.db = new Database(dbPath);
        
        // Enable WAL mode for better concurrency
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('synchronous = NORMAL');
        this.db.pragma('cache_size = 10000');
        this.db.pragma('temp_store = MEMORY');
        
        // Prepare statements for optimal performance
        this.prepareStatements();
    }

    prepareStatements() {
        this.insertUser = this.db.prepare(`
            INSERT INTO users 
            (user_name, user_email, user_password, role, user_phone, user_studyyear, 
             user_branch, user_section, user_residency, payment_received, amount_given)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        this.insertProduct = this.db.prepare(`
            INSERT INTO products 
            (product_name, product_variant, product_code, product_price, product_images, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        this.insertCartItem = this.db.prepare(`
            INSERT INTO cart (user_id, product_id, quantity) 
            VALUES (?, ?, ?)
        `);

        this.insertOrder = this.db.prepare(`
            INSERT INTO orders (user_id, serial_no, product_id, total_amount, payment_method, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
    }

    seedUsers() {
        const users = [
            // Buyers
            ['Ravi Kumar', 'ravi@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876543210', '2nd Year', 'CSE', 'A', 'Hostel', 0.00, 0.00],
            ['Anjali Sharma', 'anjali@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876501234', '3rd Year', 'ECE', 'B', 'Day Scholar', 0.00, 0.00],
            ['Mohit Verma', 'mohit@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9123456789', '1st Year', 'ME', 'C', 'Hostel', 0.00, 0.00],
            ['Sneha Patel', 'sneha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9988776655', '2nd Year', 'EEE', 'A', 'Day Scholar', 0.00, 0.00],
            ['Arjun Reddy', 'arjun@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'buyer', '9876123456', '4th Year', 'CIVIL', 'B', 'Hostel', 0.00, 0.00],
            
            // Sellers
            ['Priya Singh', 'priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9123987654', '3rd Year', 'CSE', 'C', 'Day Scholar', 500.00, 300.00],
            ['Karan Malhotra', 'karan@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '2nd Year', 'ECE', 'A', 'Hostel', 1000.00, 700.00],
            ['Neha Gupta', 'neha@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9234567890', '4th Year', 'ME', 'B', 'Day Scholar', 300.00, 200.00],
            ['Rahul Das', 'rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9345678901', '3rd Year', 'CIVIL', 'C', 'Hostel', 800.00, 500.00],
            ['Simran Kaur', 'simran@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'seller', '9876012345', '1st Year', 'CSE', 'A', 'Day Scholar', 200.00, 100.00],
            
            // Admin
            ['Admin User', 'admin@campusdeals.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6', 'admin', '9999999999', 'Admin', 'Admin', 'Admin', 'Admin', 0.00, 0.00]
        ];

        console.log('Seeding users...');
        users.forEach((user, index) => {
            const result = this.insertUser.run(...user);
            if (index === 0 || (index + 1) % 5 === 0) {
                console.log(`  Inserted ${index + 1} users...`);
            }
        });
        console.log(`✅ Inserted ${users.length} users successfully`);
    }

    seedProducts() {
        const products = [
            // Drafters
            ['drafter', 'premium_drafter', 'DFT-P001', 2500.00, 'images/drafter_premium.jpg', 15],
            ['drafter', 'standard_drafter', 'DFT-S001', 1800.00, 'images/drafter_standard.jpg', 25],
            ['drafter', 'budget_drafter', 'DFT-B001', 1200.00, 'images/drafter_budget.jpg', 30],

            // White Lab Coats
            ['white_lab_coat', 'S', 'WLC-S001', 450.00, 'images/white_labcoat_s.jpg', 12],
            ['white_lab_coat', 'M', 'WLC-M001', 450.00, 'images/white_labcoat_m.jpg', 20],
            ['white_lab_coat', 'L', 'WLC-L001', 450.00, 'images/white_labcoat_l.jpg', 18],
            ['white_lab_coat', 'XL', 'WLC-XL001', 450.00, 'images/white_labcoat_xl.jpg', 10],
            ['white_lab_coat', 'XXL', 'WLC-XXL001', 450.00, 'images/white_labcoat_xxl.jpg', 5],

            // Brown Lab Coats
            ['brown_lab_coat', 'S', 'BLC-S001', 500.00, 'images/brown_labcoat_s.jpg', 8],
            ['brown_lab_coat', 'M', 'BLC-M001', 500.00, 'images/brown_labcoat_m.jpg', 15],
            ['brown_lab_coat', 'L', 'BLC-L001', 500.00, 'images/brown_labcoat_l.jpg', 12],
            ['brown_lab_coat', 'XL', 'BLC-XL001', 500.00, 'images/brown_labcoat_xl.jpg', 7],
            ['brown_lab_coat', 'XXL', 'BLC-XXL001', 500.00, 'images/brown_labcoat_xxl.jpg', 3],

            // Calculators
            ['calculator', 'MS', 'CALC-MS001', 1200.00, 'images/calculator_ms.jpg', 20],
            ['calculator', 'ES', 'CALC-ES001', 800.00, 'images/calculator_es.jpg', 25],
            ['calculator', 'ES-Plus', 'CALC-ESP001', 1500.00, 'images/calculator_es_plus.jpg', 15]
        ];

        console.log('Seeding products...');
        products.forEach((product, index) => {
            const result = this.insertProduct.run(...product);
            if (index === 0 || (index + 1) % 5 === 0 || index === products.length - 1) {
                console.log(`  Inserted ${index + 1} products...`);
            }
        });
        console.log(`✅ Inserted ${products.length} products successfully`);
    }

    seedSampleData() {
        // Sample cart items
        const cartItems = [
            [1, 1, 1], // Ravi Kumar buying premium drafter
            [2, 4, 2], // Anjali Sharma buying 2 white lab coats (S)
            [3, 14, 1], // Mohit Verma buying MS calculator
            [4, 6, 1], // Sneha Patel buying white lab coat (L)
            [5, 2, 1]  // Arjun Reddy buying standard drafter
        ];

        console.log('Seeding sample cart items...');
        cartItems.forEach((item) => {
            this.insertCartItem.run(...item);
        });
        console.log(`✅ Inserted ${cartItems.length} cart items successfully`);

        // Sample orders
        const orders = [
            [1, 'ORD-001-2024', 1, 2500.00, 'upi', 'completed'],
            [2, 'ORD-002-2024', 4, 900.00, 'cash', 'pending'],
            [3, 'ORD-003-2024', 14, 1200.00, 'upi', 'completed'],
            [4, 'ORD-004-2024', 6, 450.00, 'cash', 'pending'],
            [5, 'ORD-005-2024', 2, 1800.00, 'upi', 'completed']
        ];

        console.log('Seeding sample orders...');
        orders.forEach((order) => {
            this.insertOrder.run(...order);
        });
        console.log(`✅ Inserted ${orders.length} orders successfully`);
    }

    /**
     * Run complete seeding process with transaction
     */
    seedDatabase(includeSamples = true) {
        console.log('🚀 Starting Better-SQLite3 database seeding...\n');
        
        const startTime = Date.now();
        
        // Use transaction for atomic seeding
        const seedTransaction = this.db.transaction(() => {
            this.seedUsers();
            this.seedProducts();
            
            if (includeSamples) {
                this.seedSampleData();
            }
        });

        try {
            seedTransaction();
            
            // Update database statistics
            console.log('\n📊 Updating database statistics...');
            this.db.exec('ANALYZE');
            
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log(`\n✅ Database seeding completed successfully in ${duration}s`);
            console.log('📈 Database statistics updated for optimal query planning');
            
        } catch (error) {
            console.error('❌ Error during database seeding:', error.message);
            throw error;
        }
    }

    /**
     * Get seeding statistics
     */
    getStats() {
        const stats = {
            users: this.db.prepare('SELECT COUNT(*) as count FROM users').get().count,
            products: this.db.prepare('SELECT COUNT(*) as count FROM products').get().count,
            cartItems: this.db.prepare('SELECT COUNT(*) as count FROM cart').get().count,
            orders: this.db.prepare('SELECT COUNT(*) as count FROM orders').get().count
        };

        console.log('\n📊 Database Statistics:');
        console.log(`  Users: ${stats.users}`);
        console.log(`  Products: ${stats.products}`);
        console.log(`  Cart Items: ${stats.cartItems}`);
        console.log(`  Orders: ${stats.orders}`);

        return stats;
    }

    /**
     * Close database connection
     */
    close() {
        this.db.close();
        console.log('🔒 Database connection closed');
    }
}

// Export for use as module
module.exports = BetterSQLiteSeeder;

// CLI execution
if (require.main === module) {
    const dbPath = process.argv[2] || path.join(__dirname, '../../database/campusdeals.db');
    
    console.log(`📍 Database path: ${dbPath}\n`);
    
    const seeder = new BetterSQLiteSeeder(dbPath);
    
    try {
        seeder.seedDatabase(true);
        seeder.getStats();
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        seeder.close();
    }
}