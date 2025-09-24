// Using built-in fetch (Node.js 18+)

async function testAPI() {
    try {
        // Test 1: Check if server is running
        console.log('🔍 Testing API connection...');
        const testResponse = await fetch('http://localhost:5000/api/test');
        const testData = await testResponse.json();
        console.log('✅ API Test:', testData.message);
        
        // Test 2: Try to register a user
        console.log('\n🔍 Testing user registration...');
        const registerData = {
            user_name: 'Syamala Devi',
            user_email: 'syamaladevi1221@gmail.com',
            user_password: 'Syamala@122',
            role: 'buyer'
        };
        
        const registerResponse = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const registerResult = await registerResponse.json();
        console.log('📝 Registration Result:', JSON.stringify(registerResult, null, 2));
        
        // Test 3: Try to login with the same user
        console.log('\n🔍 Testing user login...');
        const loginData = {
            user_email: 'syamaladevi1221@gmail.com',
            user_password: 'Syamala@122'
        };
        
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const loginResult = await loginResponse.json();
        console.log('🔑 Login Result:', JSON.stringify(loginResult, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAPI();