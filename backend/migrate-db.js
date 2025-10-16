const { db } = require('./src/config/db');

console.log('=== MIGRATING DATABASE SCHEMA ===');

try {
    // Add missing columns one by one
    const missingColumns = [
        'order_type TEXT CHECK(order_type IN ("buy","sell")) DEFAULT "buy"',
        'quantity INTEGER NOT NULL DEFAULT 1',
        'cart_id INTEGER NULL',
        'linked_order_id INTEGER NULL'
    ];
    
    for (const column of missingColumns) {
        try {
            const columnName = column.split(' ')[0];
            db.prepare(`ALTER TABLE orders ADD COLUMN ${column}`).run();
            console.log(`✅ Added column: ${columnName}`);
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
            } else {
                console.log(`❌ Error adding ${column.split(' ')[0]}:`, error.message);
            }
        }
    }
    
    // Check final schema
    console.log('\n=== FINAL SCHEMA ===');
    const columns = db.prepare('PRAGMA table_info(orders)').all();
    columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
    });
    
} catch (error) {
    console.error('Migration error:', error.message);
}