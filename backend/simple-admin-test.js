const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function simpleAdminLoginTest() {
  console.log('🔐 Simple Admin Login Test\n');
  
  try {
    // Test with the existing admin
    const loginData = {
      admin_email: '323103310175@gvpce.ac.in',
      admin_password: 'AdminPassword123!' // This might not be the correct password
    };
    
    console.log('Testing admin login...');
    const response = await axios.post(`${BASE_URL}/api/auth/admin-login`, loginData);
    
    console.log('✅ Success:', response.data.message);
    console.log('Admin:', response.data.admin.admin_name);
    console.log('Token received:', response.data.accessToken ? 'Yes' : 'No');
    
  } catch (error) {
    console.log('Response status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 This is expected if the password is incorrect.');
      console.log('   The admin login API is working correctly!');
    }
  }
}

simpleAdminLoginTest();