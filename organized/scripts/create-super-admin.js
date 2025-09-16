const https = require('https');

const baseUrl = 'clutch-main-nk7x.onrender.com';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Super-Admin-Creator/1.0',
        ...headers
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

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function createSuperAdmin() {
  console.log('👑 Creating Super Admin User (ziad@yourclutch.com)...\n');

  try {
    // First, login to get a token
    console.log('1️⃣ Getting authentication token...');
    const loginResponse = await makeRequest('/api/v1/auth/login', 'POST', {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    });

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful, token received');

    // Create/update CEO user in database
    console.log('\n2️⃣ Creating/updating CEO user in database...');
    const createCeoResponse = await makeRequest('/api/v1/auth/create-ceo', 'POST', {}, {
      'Authorization': `Bearer ${token}`
    });

    console.log(`   Status: ${createCeoResponse.statusCode}`);
    if (createCeoResponse.statusCode === 200 || createCeoResponse.statusCode === 201) {
      console.log('   ✅ CEO user created/updated successfully!');
      const responseData = JSON.parse(createCeoResponse.body);
      console.log(`   User ID: ${responseData.data?.user?.id || 'N/A'}`);
      console.log(`   Role: ${responseData.data?.user?.role || 'N/A'}`);
      console.log(`   Permissions: ${responseData.data?.user?.permissions?.length || 0} permissions`);
    } else {
      console.log('   ❌ CEO user creation failed');
      console.log(`   Response: ${createCeoResponse.body.substring(0, 300)}...`);
    }

    // Test login again to verify permissions
    console.log('\n3️⃣ Testing login with updated permissions...');
    const testLoginResponse = await makeRequest('/api/v1/auth/login', 'POST', {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    });

    if (testLoginResponse.statusCode === 200) {
      const testLoginData = JSON.parse(testLoginResponse.body);
      const user = testLoginData.data?.user;
      console.log('   ✅ Login test successful!');
      console.log(`   Role: ${user?.role || 'N/A'}`);
      console.log(`   Permissions count: ${user?.permissions?.length || 0}`);
      console.log(`   Is Employee: ${user?.isEmployee || false}`);
      console.log(`   Is Active: ${user?.isActive || false}`);
      
      if (user?.permissions?.includes('all')) {
        console.log('   🎉 User has ALL permissions!');
      }
    } else {
      console.log('   ❌ Login test failed');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🏁 Super Admin creation complete!');
}

// Run the script
createSuperAdmin();
