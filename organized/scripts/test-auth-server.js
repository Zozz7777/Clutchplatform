/**
 * Authentication Test Script for Render Server
 * Run this on the server to test authentication
 */

const https = require('https');

// Test authentication endpoint
function testAuth() {
  const postData = JSON.stringify({
    email: 'ziad@yourclutch.com',
    password: '4955698*Z*z'
  });

  const options = {
    hostname: 'clutch-main-nk7x.onrender.com',
    port: 443,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🔐 Testing authentication endpoint...');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Credentials:', { email: 'ziad@yourclutch.com', password: '***' });

  const req = https.request(options, (res) => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    console.log('📋 Response Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ Response Body:');
        console.log(JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200 && response.success) {
          console.log('\n🎉 Authentication successful!');
          console.log('Token:', response.data.token ? 'Present' : 'Missing');
          console.log('User Role:', response.data.user?.role);
        } else {
          console.log('\n❌ Authentication failed');
          console.log('Error:', response.error);
          console.log('Message:', response.message);
        }
      } catch (error) {
        console.log('\n❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test health endpoint first
function testHealth() {
  const options = {
    hostname: 'clutch-main-nk7x.onrender.com',
    port: 443,
    path: '/health/ping',
    method: 'GET'
  };

  console.log('🏥 Testing health endpoint...');
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Health check:', response.success ? 'PASSED' : 'FAILED');
        console.log('Status:', response.data?.status);
        console.log('Uptime:', response.data?.uptime, 'seconds');
        
        // Test auth after health check
        setTimeout(testAuth, 1000);
      } catch (error) {
        console.log('❌ Health check failed:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Health check error:', error.message);
  });

  req.end();
}

// Run tests
console.log('🚀 Starting server-side authentication tests...\n');
testHealth();
