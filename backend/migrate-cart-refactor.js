/**
 * Migration Script: Cart System Refactor
 * Migrates existing cart data to separate buy_cart and sell_cart tables
 * 
 * Strategy:
 * 1. Analyze user roles to determine cart type
 * 2. For users with no role, analyze their order history
 * 3. Copy cart data to appropriate new tables
 * 4. Preserve existing cart table for backward compatibility
 */

const { db } = require('./src/config/db');

async function migrateCartData() {
    console.log('🚀 Starting cart system migration...');
    
    try {
        // Create the new tables if they don't exist
        console.log('📋 Creating new cart tables...');
        
        // Read and execute the updated schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'src', 'models', 'schema_better_sqlite3.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema to ensure new tables exist
        db.exec(schema);
        console.log('✅ New cart tables created successfully');
        
        // Get all cart data
        const cartData = db.prepare(`
            SELECT c.cart_id, c.product_id, c.quantity, c.created_at,
                   u.user_id, u.role, u.user_name, u.user_email
            FROM cart c
            JOIN users u ON c.cart_id = u.user_id
            ORDER BY c.cart_id, c.product_id
        `).all();
        
        console.log(`📊 Found ${cartData.length} cart items to migrate`);
        
        if (cartData.length === 0) {
            console.log('ℹ️  No cart data to migrate');
            return;
        }
        
        // Group cart items by user
        const userCarts = {};
        cartData.forEach(item => {
            if (!userCarts[item.user_id]) {
                userCarts[item.user_id] = {
                    role: item.role,
                    items: []
                };
            }
            userCarts[item.user_id].items.push(item);
        });
        
        // Get user order history to determine cart type for users with no role
        const getUserOrderHistory = db.prepare(`
            SELECT order_type, COUNT(*) as count
            FROM orders 
            WHERE user_id = ?
            GROUP BY order_type
            ORDER BY count DESC
            LIMIT 1
        `);
        
        const insertIntoBuyCart = db.prepare(`
            INSERT OR IGNORE INTO buy_cart (cart_id, product_id, quantity, created_at)
            VALUES (?, ?, ?, ?)
        `);
        
        const insertIntoSellCart = db.prepare(`
            INSERT OR IGNORE INTO sell_cart (cart_id, product_id, quantity, created_at)
            VALUES (?, ?, ?, ?)
        `);
        
        let buyCartMigrations = 0;
        let sellCartMigrations = 0;
        let unknownUserMigrations = 0;
        
        console.log('🔄 Migrating cart data...');
        
        // Process each user's cart
        for (const [userId, userCart] of Object.entries(userCarts)) {
            const { role, items } = userCart;
            let targetCartType = null;
            
            // Determine cart type based on user role
            if (role === 'buyer') {
                targetCartType = 'buy';
            } else if (role === 'seller') {
                targetCartType = 'sell';
            } else {
                // User has no role or admin role - check order history
                const orderHistory = getUserOrderHistory.get(parseInt(userId));
                
                if (orderHistory) {
                    targetCartType = orderHistory.order_type; // 'buy' or 'sell'
                    console.log(`📈 User ${userId} (${role || 'no role'}) determined as ${targetCartType} based on order history`);
                } else {
                    // Default to buy cart for users with no history
                    targetCartType = 'buy';
                    unknownUserMigrations++;
                    console.log(`❓ User ${userId} (${role || 'no role'}) defaulted to buy cart (no order history)`);
                }
            }
            
            // Migrate items to appropriate cart
            for (const item of items) {
                try {
                    if (targetCartType === 'buy') {
                        insertIntoBuyCart.run(item.cart_id, item.product_id, item.quantity, item.created_at);
                        buyCartMigrations++;
                    } else if (targetCartType === 'sell') {
                        insertIntoSellCart.run(item.cart_id, item.product_id, item.quantity, item.created_at);
                        sellCartMigrations++;
                    }
                } catch (error) {
                    console.error(`❌ Error migrating item for user ${userId}, product ${item.product_id}:`, error.message);
                }
            }
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`✅ Buy cart items migrated: ${buyCartMigrations}`);
        console.log(`✅ Sell cart items migrated: ${sellCartMigrations}`);
        console.log(`❓ Users defaulted to buy cart: ${unknownUserMigrations}`);
        console.log(`📝 Total items processed: ${cartData.length}`);
        
        // Verify migration
        const buyCartCount = db.prepare('SELECT COUNT(*) as count FROM buy_cart').get();
        const sellCartCount = db.prepare('SELECT COUNT(*) as count FROM sell_cart').get();
        
        console.log('\n🔍 Verification:');
        console.log(`📦 Buy cart table now has: ${buyCartCount.count} items`);
        console.log(`📦 Sell cart table now has: ${sellCartCount.count} items`);
        console.log(`📦 Original cart table still has: ${cartData.length} items (preserved)`);
        
        // Create backup info
        console.log('\n💾 Backup Information:');
        console.log('🔸 Original cart table preserved for backward compatibility');
        console.log('🔸 New APIs use buy_cart and sell_cart tables');
        console.log('🔸 Legacy /api/cart endpoints still work with original cart table');
        
        console.log('\n🎉 Cart system migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('🔧 Please check your database and try again');
        throw error;
    }
}

// Export for use in other scripts
module.exports = { migrateCartData };

// Run migration if script is executed directly
if (require.main === module) {
    migrateCartData()
        .then(() => {
            console.log('✅ Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration script failed:', error);
            process.exit(1);
        });
}