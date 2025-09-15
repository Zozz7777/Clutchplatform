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
        'User-Agent': 'Dashboard-Test/1.0',
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

async function testDashboardAndNotifications() {
  console.log('🧪 Testing Dashboard and Notifications Endpoints...\n');

  // First, get a valid token by logging in
  console.log('1️⃣ Getting authentication token...');
  try {
    const loginResponse = await makeRequest('/api/v1/auth/login', 'POST', {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    });

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed, cannot test protected endpoints');
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful, token received');

    // Test Dashboard KPIs
    console.log('\n2️⃣ Testing Dashboard KPIs...');
    try {
      const kpisResponse = await makeRequest('/api/v1/dashboard/kpis', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   Status: ${kpisResponse.statusCode}`);
      if (kpisResponse.statusCode === 200) {
        console.log('   ✅ Dashboard KPIs working!');
        const kpisData = JSON.parse(kpisResponse.body);
        console.log(`   📊 KPIs: ${JSON.stringify(kpisData.data, null, 2)}`);
      } else {
        console.log('   ❌ Dashboard KPIs failed');
        console.log(`   Response: ${kpisResponse.body.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Dashboard KPIs error: ${error.message}`);
    }

    // Test Notifications
    console.log('\n3️⃣ Testing Notifications...');
    try {
      const notificationsResponse = await makeRequest('/api/v1/notifications', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   Status: ${notificationsResponse.statusCode}`);
      if (notificationsResponse.statusCode === 200) {
        console.log('   ✅ Notifications working!');
        const notificationsData = JSON.parse(notificationsResponse.body);
        console.log(`   📬 Notifications: ${JSON.stringify(notificationsData.data, null, 2)}`);
      } else {
        console.log('   ❌ Notifications failed');
        console.log(`   Response: ${notificationsResponse.body.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Notifications error: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
  }

  console.log('\n🏁 Dashboard and Notifications testing complete!');
}

// Run the tests
testDashboardAndNotifications();
