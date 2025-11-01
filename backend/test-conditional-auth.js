const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testConditionalAuth() {
  console.log('🧪 Testing Conditional Authentication System\n');
  
  try {
    // Step 1: Test admin endpoint without auth (should work if no admin exists)
    console.log('1️⃣ Testing GET /api/admins without authentication...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admins`);
      console.log('✅ Success:', response.data);
      console.log('🔓 No authentication required - no admin exists yet\n');
    } catch (error) {
      console.log('❌ Failed:', error.response?.data || error.message);
      console.log('🔐 Authentication required - admin already exists\n');
    }
    
    // Step 2: Test bootstrap endpoint to create first admin
    console.log('2️⃣ Testing POST /api/admins/bootstrap to create first admin...');
    try {
      const adminData = {
        admin_name: 'Test Admin',
        admin_email: 'test@admin.com',
        admin_password: 'admin123',
        admin_phone: '1234567890',
        admin_studyyear: '4th Year',
        admin_branch: 'CSE',
        admin_section: 'A',
        admin_residency: 'Hostel'
      };
      
      const response = await axios.post(`${BASE_URL}/api/admins/bootstrap`, adminData);
      console.log('✅ Bootstrap Success:', response.data);
      console.log('🎉 First admin created successfully\n');
      
      // Step 3: Now test admin endpoint again (should require auth)
      console.log('3️⃣ Testing GET /api/admins after admin creation (should require auth)...');
      try {
        const response2 = await axios.get(`${BASE_URL}/api/admins`);
        console.log('❌ This should not work - auth should be required now');
      } catch (error) {
        console.log('✅ Expected failure:', error.response?.data || error.message);
        console.log('🔐 Authentication now required - admin exists\n');
      }
      
      // Step 4: Login as admin to get token
      console.log('4️⃣ Testing admin login to get access token...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'test@admin.com',
          password: 'admin123'
        });
        console.log('✅ Login Success:', loginResponse.data);
        
        const accessToken = loginResponse.data.accessToken;
        console.log('🔑 Access token obtained\n');
        
        // Step 5: Test admin endpoint with admin token
        console.log('5️⃣ Testing GET /api/admins with admin access token...');
        const authResponse = await axios.get(`${BASE_URL}/api/admins`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        console.log('✅ Admin access granted:', authResponse.data);
        console.log('👑 Admin can access admin endpoints\n');
        
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      }
      
    } catch (error) {
      console.log('❌ Bootstrap failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testConditionalAuth();