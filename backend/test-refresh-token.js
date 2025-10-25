// test-refresh-token.js
// Test script to verify refresh token changes

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the auth endpoints to verify refresh token behavior
async function testRefreshTokenChanges() {
    console.log('🧪 Testing Refresh Token Changes');
    console.log('=' .repeat(50));

    try {
        // Test 1: Register a new user
        console.log('\n1️⃣ Testing User Registration');
        const registrationData = {
            user_name: 'Test User',
            user_email: `test${Date.now()}@example.com`,
            user_password: 'testpassword123'
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registrationData);
            console.log('✅ Registration Success');
            console.log('Access Token received:', !!registerResponse.data.accessToken);
            console.log('Refresh Token received:', !!registerResponse.data.refreshToken);
            console.log('Refresh Token is JWT:', registerResponse.data.refreshToken.includes('.'));
            
            const { accessToken, refreshToken } = registerResponse.data;
            
            // Test 2: Use refresh token to get new access token
            console.log('\n2️⃣ Testing Refresh Token Usage');
            try {
                const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });
                
                console.log('✅ Refresh Token Success');
                console.log('New Access Token received:', !!refreshResponse.data.accessToken);
                console.log('New Refresh Token received:', !!refreshResponse.data.refreshToken);
                console.log('Server note:', refreshResponse.data.instructions?.note);
                
            } catch (refreshError) {
                console.log('❌ Refresh Token Error:', refreshError.response?.data || refreshError.message);
            }
            
            // Test 3: Test logout
            console.log('\n3️⃣ Testing Logout');
            try {
                const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                console.log('✅ Logout Success');
                console.log('Refresh Token Note:', logoutResponse.data.data?.refreshTokenNote);
                
            } catch (logoutError) {
                console.log('❌ Logout Error:', logoutError.response?.data || logoutError.message);
            }
            
        } catch (registerError) {
            console.log('❌ Registration Error:', registerError.response?.data || registerError.message);
        }

        console.log('\n🏁 Refresh Token Testing Completed!');
        console.log('\n📋 Summary of Changes:');
        console.log('• Refresh tokens are now JWT tokens');
        console.log('• Refresh tokens are NOT stored in database');
        console.log('• Refresh tokens are only returned in API responses');
        console.log('• Client is responsible for managing refresh tokens');

    } catch (error) {
        console.error('❌ General Error:', error.message);
    }
}

// Check if server is running first
async function checkServer() {
    try {
        const response = await axios.get(`${BASE_URL}/test`);
        console.log('✅ Server is running:', response.data.message);
        return true;
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first.');
        console.log('   Run: npm start or node server.js');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Refresh Token Tests...\n');
    
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testRefreshTokenChanges();
    }
}

main();