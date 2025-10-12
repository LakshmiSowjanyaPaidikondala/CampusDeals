// Seeding Utilities
// Additional seeding functions and utilities

const { db } = require('../config/db');

/**
 * Reset database to clean state
 */
const resetDatabase = () => {
    try {
        console.log('🔄 RESETTING DATABASE...');
        
        const transaction = db.transaction(() => {
            // Clear all data (order matters due to foreign keys)
            db.prepare('DELETE FROM orders').run();
            db.prepare('DELETE FROM cart').run(); 
            db.prepare('DELETE FROM products').run();
            // Keep users for testing
            
            // Reset sequences
            try {
                db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('products', 'orders', 'cart')").run();
            } catch (e) {
                // Ignore if sqlite_sequence doesn't exist
            }
        });
        
        transaction();
        console.log('✅ Database reset completed');
        
    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
    }
};

/**
 * Seed only products (for testing product functionality)
 */
const seedProductsOnly = () => {
    try {
        console.log('📦 SEEDING PRODUCTS ONLY...');
        
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
        
        if (productCount.count > 0) {
            console.log('ℹ️ Products already exist, use resetDatabase() first if needed');
            return;
        }
        
        const transaction = db.transaction(() => {
            const insertProduct = db.prepare(`
                INSERT INTO products 
                (product_name, product_variant, product_code, product_price, product_images, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            // Sample products with consistent naming
            insertProduct.run('drafter', 'premium_drafter', 'DFT-001', 400.00, 'Drafter.jpeg', 15);
            insertProduct.run('drafter', 'standard_drafter', 'DFT-002', 350.00, 'Drafter.jpeg', 25);
            insertProduct.run('white_lab_coat', 'M', 'WLC-001', 230.00, 'Chemical.jpeg', 20);
            insertProduct.run('calculator', 'ES-Plus', 'CALC-001', 950.00, 'Calci.jpg', 15);
            insertProduct.run('chartbox', 'chart holder', 'CHB-001', 60.00, 'chart holder.jpg', 20);
        });
        
        transaction();
        console.log('✅ Products seeded successfully');
        
    } catch (error) {
        console.error('❌ Product seeding failed:', error.message);
    }
};

/**
 * Check database status
 */
const checkDatabaseStatus = () => {
    try {
        const counts = {
            users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
            products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
            cart: db.prepare('SELECT COUNT(*) as count FROM cart').get(),
            orders: db.prepare('SELECT COUNT(*) as count FROM orders').get()
        };
        
        console.log('📊 DATABASE STATUS:');
        console.log(`   👥 Users: ${counts.users.count}`);
        console.log(`   📦 Products: ${counts.products.count}`);
        console.log(`   🛒 Cart items: ${counts.cart.count}`);
        console.log(`   📋 Orders: ${counts.orders.count}`);
        
        return counts;
        
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
        return null;
    }
};

/**
 * Seed sample cart data for testing
 */
const seedSampleCart = (userId = 1, productIds = [1, 2, 3]) => {
    try {
        console.log(`🛒 SEEDING SAMPLE CART for user ${userId}...`);
        
        const transaction = db.transaction(() => {
            const insertCart = db.prepare(`
                INSERT OR IGNORE INTO cart (cart_id, product_id, quantity) 
                VALUES (?, ?, ?)
            `);
            
            productIds.forEach((productId, index) => {
                insertCart.run(userId, productId, index + 1); // quantity 1, 2, 3
            });
        });
        
        transaction();
        console.log('✅ Sample cart data added');
        
    } catch (error) {
        console.error('❌ Cart seeding failed:', error.message);
    }
};

module.exports = {
    resetDatabase,
    seedProductsOnly,
    checkDatabaseStatus,
    seedSampleCart
};