const https = require('https');

const baseUrl = 'clutch-main-nk7x.onrender.com';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Simple-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSimpleRegistration() {
  console.log('🧪 Testing Simple Registration...\n');

  // Test with a unique email to avoid conflicts
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const testData = {
    email: uniqueEmail,
    password: 'testpassword123',
    name: 'Test User'
  };

  console.log(`📧 Using email: ${uniqueEmail}`);
  console.log(`📝 Data: ${JSON.stringify(testData)}`);

  try {
    const response = await makeRequest('/api/v1/auth/register', 'POST', testData);
    console.log(`\n📊 Response Status: ${response.statusCode}`);
    console.log(`📄 Response Body: ${response.body}`);
    
    if (response.statusCode === 201) {
      console.log('\n✅ Registration successful!');
      const responseData = JSON.parse(response.body);
      console.log(`👤 User ID: ${responseData.data?.user?.id || 'N/A'}`);
      console.log(`🔑 Token: ${responseData.data?.token ? 'Present' : 'Missing'}`);
    } else if (response.statusCode === 409) {
      console.log('\n⚠️  User already exists');
    } else if (response.statusCode === 400) {
      console.log('\n❌ Validation error');
      const responseData = JSON.parse(response.body);
      console.log(`💬 Error: ${responseData.message}`);
    } else {
      console.log('\n❌ Registration failed');
      console.log(`💬 Full response: ${response.body}`);
    }
  } catch (error) {
    console.log(`\n❌ Request error: ${error.message}`);
  }

  console.log('\n🏁 Test complete!');
}

// Run the test
testSimpleRegistration();
