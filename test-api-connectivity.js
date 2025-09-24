// Comprehensive API Connectivity Test
// This file tests all authentication and API endpoints to debug network issues

const API_BASE = 'http://localhost:5000/api';

// Test helper function
async function testEndpoint(name, url, options = {}) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`📡 URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        console.log(`✅ Status: ${response.status} ${response.statusText}`);
        console.log(`📄 Response:`, JSON.stringify(data, null, 2));
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting API Connectivity Tests...');
    console.log('='.repeat(50));
    
    // Test 1: Basic server connectivity
    console.log('\n📊 TEST SUITE 1: Basic Connectivity');
    await testEndpoint('Server Health Check', `${API_BASE}/health`);
    
    // Test 2: Register endpoint
    console.log('\n📊 TEST SUITE 2: Authentication Endpoints');
    
    const testUser = {
        user_name: 'Test User',
        user_email: `test${Date.now()}@example.com`,
        user_password: 'TestPassword123!',
        user_phone: '1234567890',
        user_college: 'Test College'
    };
    
    const registerResult = await testEndpoint('User Registration', `${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
    });
    
    // Test 3: Login endpoint
    if (registerResult.success) {
        console.log('\n🔐 Testing Login with registered user...');
        await testEndpoint('User Login', `${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                user_email: testUser.user_email,
                user_password: testUser.user_password
            })
        });
    } else {
        console.log('\n🔐 Testing Login with existing user...');
        await testEndpoint('User Login (Existing)', `${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                user_email: 'existing@example.com',
                user_password: 'password123'
            })
        });
    }
    
    // Test 4: Test alternative registration endpoint
    console.log('\n📊 TEST SUITE 3: Alternative Endpoints');
    await testEndpoint('Alternative Signup', `${API_BASE}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
            ...testUser,
            user_email: `signup${Date.now()}@example.com`
        })
    });
    
    // Test 5: CORS and preflight check
    console.log('\n📊 TEST SUITE 4: CORS Check');
    try {
        const corsTest = await fetch(`${API_BASE}/auth/login`, {
            method: 'OPTIONS'
        });
        console.log(`✅ CORS Preflight: ${corsTest.status} ${corsTest.statusText}`);
        console.log('🔍 CORS Headers:', Object.fromEntries(corsTest.headers.entries()));
    } catch (error) {
        console.error(`❌ CORS Error: ${error.message}`);
    }
    
    // Test 6: Network connectivity test
    console.log('\n📊 TEST SUITE 5: Network Diagnostics');
    try {
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}/health`);
        const endTime = Date.now();
        console.log(`⚡ Response Time: ${endTime - startTime}ms`);
        console.log(`🌐 Connection Type: ${navigator.connection?.effectiveType || 'Unknown'}`);
    } catch (error) {
        console.error(`❌ Network Test Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 API Tests Complete!');
}

// Auto-run tests when script loads
runTests().catch(console.error);

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testEndpoint, runTests };
}