// Browser Console Test for Campus Deals Authentication
// Copy and paste this into your browser's developer console (F12) while on http://localhost:5173

console.log('🧪 Testing Campus Deals Authentication from Browser...');

// Test 1: Check if API is reachable
async function testAPIConnection() {
    try {
        console.log('1️⃣ Testing API Connection...');
        const response = await fetch('http://localhost:5000/api/test');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Connection: SUCCESS');
            console.log('   Response:', data.message);
            return true;
        } else {
            console.log('❌ API Connection: FAILED', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API Connection Error:', error.message);
        return false;
    }
}

// Test 2: Test Registration
async function testRegistration() {
    try {
        console.log('2️⃣ Testing Registration...');
        const testUser = {
            user_name: 'BrowserTest_' + Date.now(),
            user_email: `browsertest_${Date.now()}@campus.com`,
            user_password: 'TestPassword123!',
            role: 'buyer'
        };
        
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Registration: SUCCESS');
            console.log('   User:', data.user?.user_name);
            console.log('   Token Length:', data.token?.length || 0);
            window.testUserEmail = testUser.user_email;
            window.testUserPassword = testUser.user_password;
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Registration: FAILED');
            console.log('   Status:', response.status);
            console.log('   Error:', errorText);
            return false;
        }
    } catch (error) {
        console.log('❌ Registration Error:', error.message);
        return false;
    }
}

// Test 3: Test Login
async function testLogin() {
    try {
        console.log('3️⃣ Testing Login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_email: window.testUserEmail,
                user_password: window.testUserPassword
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login: SUCCESS');
            console.log('   User:', data.user?.user_name);
            console.log('   Email:', data.user?.user_email);
            window.testToken = data.token;
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Login: FAILED');
            console.log('   Status:', response.status);
            console.log('   Error:', errorText);
            return false;
        }
    } catch (error) {
        console.log('❌ Login Error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Browser Authentication Tests...\n');
    
    const apiWorking = await testAPIConnection();
    if (apiWorking) {
        const registrationWorking = await testRegistration();
        if (registrationWorking) {
            await testLogin();
        }
    }
    
    console.log('\n🎉 Browser tests completed!');
    console.log('📝 Instructions:');
    console.log('   1. If tests pass: Your authentication system is working!');
    console.log('   2. If tests fail: Check browser Network tab for detailed errors');
    console.log('   3. Try using the actual registration form on the page');
}

// Auto-run the tests
runAllTests();