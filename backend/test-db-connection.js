const { db, query, run } = require('./src/config/db');

console.log('Testing database connection...');

try {
    // Test basic query
    console.log('1. Testing basic query...');
    const [users] = query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);
    
    // Test user existence check
    console.log('\n2. Testing user existence check...');
    const [existingUsers] = query('SELECT user_id, user_email FROM users WHERE user_email = ?', ['test@example.com']);
    console.log('Existing users with test@example.com:', existingUsers.length);
    
    // Test if syamaladevi1221@gmail.com exists
    console.log('\n3. Testing specific user...');
    const [specificUser] = query('SELECT user_id, user_email FROM users WHERE user_email = ?', ['syamaladevi1221@gmail.com']);
    console.log('User syamaladevi1221@gmail.com exists:', specificUser.length > 0);
    
    if (specificUser.length > 0) {
        console.log('User details:', specificUser[0]);
    }
    
    console.log('\n✅ Database connection test successful!');
    
} catch (error) {
    console.error('❌ Database error:', error.message);
}