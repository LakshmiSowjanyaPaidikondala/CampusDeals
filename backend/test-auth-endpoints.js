const http = require('http');

function testRegistration() {
    const postData = JSON.stringify({
        user_name: 'Syamala Devi',
        user_email: 'syamaladevi1221@gmail.com',
        user_password: 'Syamala@122',
        role: 'buyer'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log('🔍 Testing registration endpoint...');
    console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
    console.log('Data:', postData);

    const req = http.request(options, (res) => {
        console.log(`\n📡 Response Status: ${res.statusCode}`);
        console.log('📡 Response Headers:', res.headers);

        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log('\n📄 Response Body:');
            try {
                const parsedData = JSON.parse(responseData);
                console.log(JSON.stringify(parsedData, null, 2));
            } catch (e) {
                console.log(responseData);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request Error:', error.message);
    });

    req.write(postData);
    req.end();
}

function testLogin() {
    setTimeout(() => {
        console.log('\n\n🔍 Testing login endpoint...');
        
        const postData = JSON.stringify({
            user_email: 'syamaladevi1221@gmail.com',
            user_password: 'Syamala@122'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
        console.log('Data:', postData);

        const req = http.request(options, (res) => {
            console.log(`\n📡 Response Status: ${res.statusCode}`);
            
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('\n📄 Login Response:');
                try {
                    const parsedData = JSON.parse(responseData);
                    console.log(JSON.stringify(parsedData, null, 2));
                } catch (e) {
                    console.log(responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Login Request Error:', error.message);
        });

        req.write(postData);
        req.end();
    }, 2000); // Wait 2 seconds after registration
}

// Run tests
testRegistration();
testLogin();