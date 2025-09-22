// Simple test to check if API is working
fetch('http://localhost:5000/api/products')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('Success! API Response:', data);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });