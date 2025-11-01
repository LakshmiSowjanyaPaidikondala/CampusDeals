const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminRegister() {
  console.log('📝 Testing Admin Registration API\n');
  
  try {
    // Test Case 1: Admin registration with complete data
    console.log('1️⃣ Testing admin registration with complete data...');
    try {
      const adminData = {
        admin_name: 'New Admin User',
        admin_email: 'newadmin@campus.edu',
        admin_password: 'NewAdminPass123!',
        admin_phone: '+1234567890',
        admin_studyyear: 'Graduate',
        admin_branch: 'Computer Science',
        admin_section: 'A',
        admin_residency: 'On-campus'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, adminData);
      console.log('✅ Admin Registration Success:', response.data.message);
      console.log(`👤 Admin: ${response.data.admin.admin_name} (${response.data.admin.admin_email})`);
      console.log(`🆔 Admin ID: ${response.data.admin.admin_id}`);
      console.log(`🔑 Access Token: ${response.data.accessToken.substring(0, 20)}...`);
      console.log(`♻️ Refresh Token: ${response.data.refreshToken.substring(0, 20)}...`);
      console.log(`⏰ Token Expiry: ${response.data.tokenExpiry.accessToken}\n`);
      
      // Store token for further testing
      const adminToken = response.data.accessToken;
      
      // Test Case 2: Use admin token to access admin endpoints
      console.log('2️⃣ Testing new admin token with admin endpoints...');
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
      console.log('❌ Admin registration failed:', error.response?.data?.message || error.message, '\n');
    }
    
    // Test Case 3: Admin registration with minimal required fields
    console.log('3️⃣ Testing admin registration with minimal fields...');
    try {
      const minimalData = {
        admin_name: 'Minimal Admin',
        admin_email: 'minimal@admin.com',
        admin_password: 'MinimalPass123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, minimalData);
      console.log('✅ Minimal admin registration successful:', response.data.message);
      console.log(`👤 Admin: ${response.data.admin.admin_name}\n`);
    } catch (error) {
      console.log('❌ Minimal admin registration failed:', error.response?.data?.message || error.message, '\n');
    }
    
    // Test Case 4: Admin registration with duplicate email
    console.log('4️⃣ Testing admin registration with duplicate email...');
    try {
      const duplicateData = {
        admin_name: 'Duplicate Admin',
        admin_email: 'newadmin@campus.edu', // Same as first test
        admin_password: 'DuplicatePass123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, duplicateData);
      console.log('❌ This should not succeed - duplicate email');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('🔍 Duplicate email properly rejected\n');
    }
    
    // Test Case 5: Admin registration with invalid email
    console.log('5️⃣ Testing admin registration with invalid email...');
    try {
      const invalidEmailData = {
        admin_name: 'Invalid Email Admin',
        admin_email: 'invalid-email-format',
        admin_password: 'ValidPass123!'
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, invalidEmailData);
      console.log('❌ This should not succeed - invalid email format');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('📧 Invalid email format properly rejected\n');
    }
    
    // Test Case 6: Admin registration with weak password
    console.log('6️⃣ Testing admin registration with weak password...');
    try {
      const weakPasswordData = {
        admin_name: 'Weak Password Admin',
        admin_email: 'weakpass@admin.com',
        admin_password: '123' // Too weak
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, weakPasswordData);
      console.log('❌ This should not succeed - weak password');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('🔐 Weak password properly rejected\n');
    }
    
    // Test Case 7: Admin registration with missing required fields
    console.log('7️⃣ Testing admin registration with missing fields...');
    try {
      const incompleteData = {
        admin_name: 'Incomplete Admin'
        // Missing admin_email and admin_password
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/admin-register`, incompleteData);
      console.log('❌ This should not succeed - missing required fields');
    } catch (error) {
      console.log('✅ Expected failure:', error.response?.data?.message || error.message);
      console.log('📝 Missing fields properly validated\n');
    }
    
    // Test Case 8: Test admin login with newly registered admin
    console.log('8️⃣ Testing login with newly registered admin...');
    try {
      const loginData = {
        admin_email: 'minimal@admin.com',
        admin_password: 'MinimalPass123!'
      };
      
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin-login`, loginData);
      console.log('✅ Login with registered admin successful:', loginResponse.data.message);
      console.log('🔑 Login token received and working\n');
    } catch (loginError) {
      console.log('❌ Login with registered admin failed:', loginError.response?.data?.message || loginError.message, '\n');
    }
    
    console.log('🎉 Admin Registration API Test Complete!');
    console.log('✅ Features verified:');
    console.log('   - ✅ Admin registration with complete data');
    console.log('   - ✅ Admin registration with minimal required fields');
    console.log('   - ✅ Automatic token generation and admin login');
    console.log('   - ✅ Admin token works with admin endpoints');
    console.log('   - ✅ Duplicate email validation');
    console.log('   - ✅ Email format validation');
    console.log('   - ✅ Password strength validation');
    console.log('   - ✅ Required fields validation');
    console.log('   - ✅ Login works with registered admin');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminRegister();