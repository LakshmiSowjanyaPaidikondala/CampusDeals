const db = require('./src/config/db');

// Test script to debug cart items issue
console.log('🔍 Debugging Cart Items Issue...\n');

try {
    // Check if cart table exists and has data
    console.log('1. Checking cart table...');
    const cartCount = db.get('SELECT COUNT(*) as count FROM cart');
    console.log(`   Cart items in database: ${cartCount.count}`);
    
    // Check sample cart data
    if (cartCount.count > 0) {
        console.log('\n2. Sample cart data:');
        const sampleCart = db.query('SELECT * FROM cart LIMIT 3');
        sampleCart.forEach(item => {
            console.log(`   Cart ID: ${item.cart_id}, User: ${item.user_id}, Product: ${item.product_id}, Qty: ${item.quantity}`);
        });
    }
    
    // Check products table
    console.log('\n3. Checking products table...');
    const productCount = db.get('SELECT COUNT(*) as count FROM products');
    console.log(`   Products in database: ${productCount.count}`);
    
    if (productCount.count > 0) {
        console.log('\n4. Sample product data:');
        const sampleProducts = db.query('SELECT product_id, product_name, product_variant, product_price FROM products LIMIT 3');
        sampleProducts.forEach(product => {
            console.log(`   Product ID: ${product.product_id}, Name: ${product.product_name}, Variant: ${product.product_variant}, Price: ${product.product_price} (${typeof product.product_price})`);
        });
    }
    
    // Test the JOIN query that was causing issues
    console.log('\n5. Testing cart JOIN query...');
    const testUserId = 1; // Using user_id 1 instead of 13
    const joinResult = db.query(`
        SELECT 
            c.cart_id,
            c.user_id,
            c.product_id,
            c.quantity,
            c.created_at,
            p.product_name,
            p.product_variant,
            p.product_code,
            p.product_price,
            p.product_images,
            (c.quantity * p.product_price) as item_total
        FROM cart c
        INNER JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    `, [testUserId]);
    
    console.log(`   Found ${joinResult.length} items for user ${testUserId}`);
    
    if (joinResult.length > 0) {
        console.log('\n6. Analyzing item_total calculations:');
        joinResult.forEach(item => {
            console.log(`   Cart ${item.cart_id}:`);
            console.log(`     quantity: ${item.quantity} (${typeof item.quantity})`);
            console.log(`     price: ${item.product_price} (${typeof item.product_price})`);
            console.log(`     item_total: ${item.item_total} (${typeof item.item_total})`);
            console.log(`     manual calc: ${item.quantity * item.product_price}`);
            console.log('');
        });
    }
    
    // Add some test data if cart is empty
    if (cartCount.count === 0) {
        console.log('\n7. Adding test cart data...');
        db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 1, 2)');
        db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (1, 4, 1)');
        console.log('   ✅ Test cart data added');
    }
    
    console.log('\n✅ Debug complete!');
    
} catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error(error.stack);
}