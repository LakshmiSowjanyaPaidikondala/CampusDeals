const { hashPassword } = require('./src/utils/auth');

async function createTestUser() {
    try {
        const password = 'Syamala@122';
        const hashedPassword = await hashPassword(password);
        
        console.log('Password:', password);
        console.log('Hashed:', hashedPassword);
        
        // Now let's create a test API call
        const testUser = {
            user_name: 'Syamala Devi',
            user_email: 'syamaladevi1221@gmail.com',
            user_password: password,
            role: 'buyer'
        };
        
        console.log('\nTest user data:', JSON.stringify(testUser, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createTestUser();