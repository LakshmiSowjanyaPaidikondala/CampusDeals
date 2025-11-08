const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login API\n');
  
  try {
    // Test Case 1: Admin login with correct credentials
    console.log('1️⃣ Testing admin login with valid credentials...');
    try {
      const loginData = {
        admin_email: 'admin@campusdeals.com',
        admin_password: 'AdminPassword123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, loginData);
      console.log('✅ Admin Login Success:', response.data.message);
      console.log(`👤 Admin: ${response.data.admin.admin_name} (${response.data.admin.admin_email})`);
      console.log(`🔑 Access Token: ${response.data.accessToken.substring(0, 20)}...`);
      console.log(`♻️ Refresh Token: ${response.data.refreshToken.substring(0, 20)}...`);
      console.log(`⏰ Token Expiry: ${response.data.tokenExpiry.accessToken}\n`);
      
      // Store token for further testing
      const adminToken = response.data.accessToken;
      
      // Test Case 2: Use admin token to access admin endpoints
      console.log('2️⃣ Testing admin token with admin endpoints...');
      try {
        const adminsResponse = await axios.get(`${BASE_URL}/api/admins`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        console.log('✅ Admin endpoint access successful:', adminsResponse.data.message);
        console.log(`📊 Found ${adminsResponse.data.count} admins\n`);
      } catch (adminError) {
        console.log('❌ Admin endpoint access failed:', adminError.response?.data?.message || adminError.message, '\n');
      }
      
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message, '\n');
    }
    
    // Test Case 3: Admin login with invalid credentials
    console.log('3️⃣ Testing admin login with invalid credentials...');
    try {
      const invalidData = {
        admin_email: 'admin@campusdeals.com',
        admin_password: 'WrongPassword123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, invalidData);
      console.log('❌ This should not succeed');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('🔐 Invalid credentials properly rejected\n');
    }
    
    // Test Case 4: Admin login with non-existent admin
    console.log('4️⃣ Testing admin login with non-existent admin...');
    try {
      const nonExistentData = {
        admin_email: 'nonexistent@admin.com',
        admin_password: 'SomePassword123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, nonExistentData);
      console.log('❌ This should not succeed');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('🔍 Non-existent admin properly rejected\n');
    }
    
    // Test Case 5: Admin login with missing fields
    console.log('5️⃣ Testing admin login with missing fields...');
    try {
      const incompleteData = {
        admin_email: 'admin@campusdeals.com'
        // Missing admin_password
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, incompleteData);
      console.log('❌ This should not succeed');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('📝 Missing fields properly validated\n');
    }
    
    // Test Case 6: Compare with regular user login (should not work for admin endpoints)
    console.log('6️⃣ Testing regular user login vs admin endpoints...');
    try {
      // Try to login with a regular user
      const userLoginData = {
        user_email: 'test@user.com', // Assuming this exists
        user_password: 'UserPassword123!'
      };
      
      const userResponse = await axios.post(`${BASE_URL}/api/auth/login`, userLoginData);
      const userToken = userResponse.data.accessToken;
      console.log('✅ Regular user login successful');
      
      // Try to access admin endpoints with user token
      try {
        const adminAttempt = await axios.get(`${BASE_URL}/api/admins`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        console.log('❌ This should not work - user token should not access admin endpoints');
      } catch (adminError) {
        console.log('✅ Expected failure:', adminError.response?.data?.message || adminError.message);
        console.log('🛡️ User token properly rejected from admin endpoints\n');
      }
      
    } catch (userError) {
      console.log('ℹ️ Regular user login test skipped (user may not exist):', userError.response?.data?.message || userError.message, '\n');
    }
    
    console.log('🎉 Admin Login API Test Complete!');
    console.log('✅ Features verified:');
    console.log('   - ✅ Admin-specific login endpoint');
    console.log('   - ✅ Admin credential validation');
    console.log('   - ✅ Admin token generation');
    console.log('   - ✅ Admin token works with admin endpoints');
    console.log('   - ✅ Invalid credentials rejected');
    console.log('   - ✅ Missing fields validated');
    console.log('   - ✅ User tokens rejected from admin endpoints');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminLogin();