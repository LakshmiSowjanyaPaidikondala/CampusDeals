// Test the auth endpoints with proper error handling
async function testAuthenticationFlow() {
    console.log('🚀 Starting authentication flow test...\n');
    
    try {
        // Test 1: API Connection
        console.log('1️⃣ Testing API connection...');
        const testResponse = await fetch('http://localhost:5000/api/test');
        if (!testResponse.ok) {
            throw new Error(`API test failed: ${testResponse.status}`);
        }
        const testData = await testResponse.json();
        console.log('✅ API Connection:', testData.message);
        
        // Test 2: User Registration
        console.log('\n2️⃣ Testing user registration...');
        const registerData = {
            user_name: 'Test User',
            user_email: 'testuser@example.com',
            user_password: 'TestPass123!',
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
        console.log('📝 Registration Status:', registerResponse.status);
        console.log('📝 Registration Response:', registerResult);
        
        if (registerResult.success) {
            console.log('✅ Registration successful!');
            
            // Test 3: User Login
            console.log('\n3️⃣ Testing user login...');
            const loginData = {
                user_email: 'testuser@example.com',
                user_password: 'TestPass123!'
            };
            
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const loginResult = await loginResponse.json();
            console.log('🔑 Login Status:', loginResponse.status);
            console.log('🔑 Login Response:', loginResult);
            
            if (loginResult.success) {
                console.log('✅ Login successful!');
                console.log('🎯 Token received:', loginResult.token ? 'Yes' : 'No');
            } else {
                console.log('❌ Login failed:', loginResult.message);
            }
        } else {
            console.log('❌ Registration failed:', registerResult.message);
            
            // Test login with existing user if registration failed due to duplicate
            if (registerResult.message && registerResult.message.includes('already exists')) {
                console.log('\n3️⃣ Testing login with existing user...');
                const loginData = {
                    user_email: 'testuser@example.com',
                    user_password: 'TestPass123!'
                };
                
                const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                });
                
                const loginResult = await loginResponse.json();
                console.log('🔑 Login Status:', loginResponse.status);
                console.log('🔑 Login Response:', loginResult);
            }
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testAuthenticationFlow();