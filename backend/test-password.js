const bcrypt = require('bcryptjs');

// Test the hash from the seeder
const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1fJg7zRPO6';

// Common test passwords
const passwordsToTest = ['password', '123456', 'test123', 'admin123', 'password123', 'secret'];

async function checkPasswords() {
    console.log('Testing passwords against hash:', hash);
    
    for (const password of passwordsToTest) {
        try {
            const match = await bcrypt.compare(password, hash);
            console.log(`Password "${password}": ${match ? '✅ MATCH!' : '❌ No match'}`);
            if (match) {
                console.log(`\n🎉 Found matching password: "${password}"`);
                break;
            }
        } catch (error) {
            console.log(`Password "${password}": Error - ${error.message}`);
        }
    }
}

checkPasswords();