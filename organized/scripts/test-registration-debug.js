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
        'User-Agent': 'Registration-Debug/1.0'
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

async function testRegistrationVariants() {
  console.log('🔍 Testing Registration Variants...\n');

  const testCases = [
    {
      name: 'With name field',
      data: {
        email: 'test1@example.com',
        password: 'testpassword',
        name: 'Test User'
      }
    },
    {
      name: 'With firstName/lastName',
      data: {
        email: 'test2@example.com',
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User'
      }
    },
    {
      name: 'Minimal required fields',
      data: {
        email: 'test3@example.com',
        password: 'testpassword',
        name: 'Test'
      }
    },
    {
      name: 'With phone number',
      data: {
        email: 'test4@example.com',
        password: 'testpassword',
        name: 'Test User',
        phoneNumber: '+1234567890'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Data: ${JSON.stringify(testCase.data)}`);
    
    try {
      const response = await makeRequest('/api/v1/auth/register', 'POST', testCase.data);
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 201) {
        console.log('   ✅ Registration successful!');
        const responseData = JSON.parse(response.body);
        console.log(`   User ID: ${responseData.data?.user?.id || 'N/A'}`);
      } else if (response.statusCode === 409) {
        console.log('   ⚠️  User already exists');
      } else if (response.statusCode === 400) {
        console.log('   ❌ Validation error');
        const responseData = JSON.parse(response.body);
        console.log(`   Error: ${responseData.message}`);
      } else {
        console.log('   ❌ Registration failed');
        console.log(`   Response: ${response.body.substring(0, 300)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Request error: ${error.message}`);
    }
  }

  console.log('\n🏁 Registration testing complete!');
}

// Run the tests
testRegistrationVariants();
