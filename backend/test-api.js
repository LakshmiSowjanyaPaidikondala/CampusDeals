const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response data:', data);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();