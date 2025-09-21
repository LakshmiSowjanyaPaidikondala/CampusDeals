const https = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing CampusDeals APIs with SQLite...\n');
  
  try {
    // Test 1: Get all products
    console.log('1️⃣ Testing GET /api/products');
    const productsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${productsResponse.status}`);
    console.log(`Products found: ${productsResponse.data.count || 0}`);
    console.log(`Sample product: ${productsResponse.data.products?.[0]?.product_name || 'None'}\n`);
    
    // Test 2: User registration
    console.log('2️⃣ Testing POST /api/auth/signup');
    const signupResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      user_name: 'API Test User',
      user_email: 'apitest@example.com',
      user_password: 'testpassword123',
      role: 'buyer'
    });
    
    console.log(`Status: ${signupResponse.status}`);
    console.log(`Message: ${signupResponse.data.message}`);
    console.log(`Success: ${signupResponse.data.success}\n`);
    
    // Test 3: User login
    console.log('3️⃣ Testing POST /api/auth/login');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      user_email: 'apitest@example.com',
      user_password: 'testpassword123'
    });
    
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Message: ${loginResponse.data.message}`);
    console.log(`Token received: ${!!loginResponse.data.token}\n`);
    
    // Test 4: Get single product
    console.log('4️⃣ Testing GET /api/products/1');
    const singleProductResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products/1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${singleProductResponse.status}`);
    console.log(`Product: ${singleProductResponse.data.product?.product_name || 'Not found'}\n`);
    
    console.log('🎉 API Testing completed!');
    
  } catch (error) {
    console.error('❌ API Testing failed:', error);
  }
}

testAPIs();