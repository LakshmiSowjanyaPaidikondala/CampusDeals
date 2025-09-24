// Complete Authentication Test - Run this in browser console at http://localhost:5173
console.log('🚀 Campus Deals - Complete Authentication Test');
console.log('===============================================\n');

// Test Suite Configuration
const API_BASE = 'http://localhost:5000/api';
const testResults = {
    apiConnection: false,
    registration: false,
    login: false,
    profile: false
};

// Helper function to create unique test data
const createTestUser = () => ({
    user_name: `TestUser_${Date.now()}`,
    user_email: `test_${Date.now()}@campusdeals.com`,
    user_password: 'SecurePass123!',
    role: 'buyer'
});

// Test 1: API Connection
async function testAPIConnection() {
    console.log('🔌 Testing API Connection...');
    try {
        const response = await fetch(`${API_BASE}/test`);
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ API Connected:', data.message);
            testResults.apiConnection = true;
            return true;
        } else {
            console.log('   ❌ API Response Error:', response.status);
            return false;
        }
    } catch (error) {
        console.log('   ❌ API Connection Failed:', error.message);
        return false;
    }
}

// Test 2: User Registration
async function testRegistration() {
    console.log('\n👤 Testing User Registration...');
    const testUser = createTestUser();
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Registration Successful!');
            console.log('   📝 User ID:', data.user?.user_id);
            console.log('   📧 Email:', data.user?.user_email);
            console.log('   🎭 Role:', data.user?.role);
            console.log('   🔑 Token Length:', data.token?.length);
            
            // Store for login test
            window.testUser = testUser;
            window.testToken = data.token;
            testResults.registration = true;
            return true;
        } else {
            const errorData = await response.json();
            console.log('   ❌ Registration Failed:', errorData.message);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Registration Error:', error.message);
        return false;
    }
}

// Test 3: User Login
async function testLogin() {
    console.log('\n🔐 Testing User Login...');
    
    if (!window.testUser) {
        console.log('   ⚠️  No test user available, skipping login test');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_email: window.testUser.user_email,
                user_password: window.testUser.user_password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Login Successful!');
            console.log('   👋 Welcome:', data.user?.user_name);
            console.log('   📧 Email:', data.user?.user_email);
            console.log('   🔑 New Token Length:', data.token?.length);
            
            window.loginToken = data.token;
            testResults.login = true;
            return true;
        } else {
            const errorData = await response.json();
            console.log('   ❌ Login Failed:', errorData.message);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Login Error:', error.message);
        return false;
    }
}

// Test 4: Profile Access
async function testProfile() {
    console.log('\n👤 Testing Profile Access...');
    
    const token = window.loginToken || window.testToken;
    if (!token) {
        console.log('   ⚠️  No authentication token available');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Profile Access Successful!');
            console.log('   👤 Profile Data:', data.user);
            testResults.profile = true;
            return true;
        } else {
            console.log('   ❌ Profile Access Failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Profile Error:', error.message);
        return false;
    }
}

// Main Test Runner
async function runCompleteTest() {
    console.log('🧪 Starting Complete Authentication Test Suite...\n');
    
    // Run tests in sequence
    const apiOK = await testAPIConnection();
    
    if (apiOK) {
        const regOK = await testRegistration();
        
        if (regOK) {
            const loginOK = await testLogin();
            
            if (loginOK) {
                await testProfile();
            }
        }
    }
    
    // Results Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log('🔌 API Connection:', testResults.apiConnection ? '✅ PASS' : '❌ FAIL');
    console.log('👤 Registration:', testResults.registration ? '✅ PASS' : '❌ FAIL');
    console.log('🔐 Login:', testResults.login ? '✅ PASS' : '❌ FAIL');
    console.log('👤 Profile Access:', testResults.profile ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = Object.values(testResults).every(result => result);
    
    console.log('\n🎯 OVERALL STATUS:', allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
    
    if (allPassed) {
        console.log('\n🎉 CONGRATULATIONS! Your authentication system is working perfectly!');
        console.log('✨ You can now:');
        console.log('   • Register new users');
        console.log('   • Login existing users');
        console.log('   • Access protected routes');
        console.log('   • Use the full Campus Deals application');
    } else {
        console.log('\n🔧 Next Steps:');
        console.log('   • Check browser Network tab for detailed errors');
        console.log('   • Verify both servers are running');
        console.log('   • Check console for specific error messages');
    }
}

// Auto-run the complete test suite
runCompleteTest();