// Test script to verify API is accessible exactly like the frontend would access it
async function testFrontendAPI() {
  console.log('🚀 Testing API as frontend would...');
  
  try {
    const response = await fetch(`http://localhost:5000/api/products?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      cache: 'no-cache',
    });
    
    console.log('📡 Response status:', response.status);
    console.log('✅ Response ok:', response.ok);
    console.log('📋 Response headers:', Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📦 API Response:', JSON.stringify(data, null, 2));
    
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    console.log('🔄 Products count:', productsArray.length);
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

testFrontendAPI();