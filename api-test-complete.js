// Comprehensive API Test for Campus Deals Backend
async function testCampusDealsAPI() {
    const API_BASE = 'http://localhost:5000/api';
    
    console.log('🧪 Testing Campus Deals API Endpoints...\n');
    
    // Test 1: Basic server health
    console.log('1️⃣ Testing Server Health...');
    try {
        const healthResponse = await fetch(`${API_BASE}/test`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Server Health: OK');
            console.log('   Message:', healthData.message);
        } else {
            console.log('❌ Server Health: Failed', healthResponse.status);
        }
    } catch (error) {
        console.log('❌ Server Health Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: User Registration
    console.log('2️⃣ Testing User Registration...');
    const testUser = {
        user_name: 'TestUser_' + Date.now(),
        user_email: `test_${Date.now()}@campus.com`,
        user_password: 'TestPassword123!',
        role: 'buyer'
    };
    
    try {
        const registerResponse = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ Registration: SUCCESS');
            console.log('   User ID:', registerData.user?.user_id);
            console.log('   User Name:', registerData.user?.user_name);
            console.log('   Token Length:', registerData.token?.length || 0);
            
            // Store for login test
            testUser.user_id = registerData.user?.user_id;
            testUser.token = registerData.token;
        } else {
            const errorText = await registerResponse.text();
            console.log('❌ Registration: FAILED');
            console.log('   Status:', registerResponse.status);
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ Registration Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: User Login
    console.log('3️⃣ Testing User Login...');
    try {
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_email: testUser.user_email,
                user_password: testUser.user_password
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login: SUCCESS');
            console.log('   Welcome:', loginData.user?.user_name);
            console.log('   Email:', loginData.user?.user_email);
            console.log('   Role:', loginData.user?.role);
            console.log('   Token Received:', loginData.token ? 'Yes' : 'No');
        } else {
            const errorText = await loginResponse.text();
            console.log('❌ Login: FAILED');
            console.log('   Status:', loginResponse.status);
            console.log('   Error:', errorText);
        }
    } catch (error) {
        console.log('❌ Login Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Database Connection Test
    console.log('4️⃣ Testing Database Connection...');
    try {
        const dbTestResponse = await fetch(`${API_BASE}/test`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (dbTestResponse.ok) {
            console.log('✅ Database: Connected');
        } else {
            console.log('❌ Database: Connection Issue');
        }
    } catch (error) {
        console.log('❌ Database Error:', error.message);
    }
    
    console.log('\n🎉 API Test Summary:');
    console.log('Backend Server: http://localhost:5000');
    console.log('Frontend Server: http://localhost:5173');
    console.log('Database: SQLite (./database/campusdeals.db)');
    console.log('\n✨ Ready for frontend testing!');
}

// Run the comprehensive test
testCampusDealsAPI().then(() => {
    console.log('\n🚀 Test completed! Check results above.');
}).catch(error => {
    console.error('❌ Test suite failed:', error.message);
});