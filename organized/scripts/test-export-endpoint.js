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
        'User-Agent': 'Export-Test/1.0',
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

async function testExportEndpoint() {
  console.log('📊 Testing Export Endpoint...\n');

  try {
    // First, get a valid token by logging in
    console.log('1️⃣ Getting authentication token...');
    const loginResponse = await makeRequest('/api/v1/auth/login', 'POST', {
      email: 'ziad@yourclutch.com',
      password: '4955698*Z*z'
    });

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed, cannot test export endpoint');
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful, token received');

    // Test Dashboard Export
    console.log('\n2️⃣ Testing Dashboard Export...');
    try {
      const exportResponse = await makeRequest('/api/v1/export/dashboard', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   Status: ${exportResponse.statusCode}`);
      if (exportResponse.statusCode === 200) {
        console.log('   ✅ Dashboard export working!');
        const exportData = JSON.parse(exportResponse.body);
        console.log(`   📊 Export Type: ${exportData.data?.exportInfo?.exportType}`);
        console.log(`   📅 Exported At: ${exportData.data?.exportInfo?.exportedAt}`);
        console.log(`   👤 Exported By: ${exportData.data?.exportInfo?.exportedBy}`);
        console.log(`   📈 Total Users: ${exportData.data?.kpis?.totalUsers}`);
        console.log(`   🚗 Total Vehicles: ${exportData.data?.kpis?.totalVehicles}`);
        console.log(`   📅 Total Bookings: ${exportData.data?.kpis?.totalBookings}`);
        console.log(`   💰 Total Revenue: ${exportData.data?.kpis?.totalRevenue}`);
      } else {
        console.log('   ❌ Dashboard export failed');
        console.log(`   Response: ${exportResponse.body.substring(0, 300)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Dashboard export error: ${error.message}`);
    }

    // Test Generic Export
    console.log('\n3️⃣ Testing Generic Export...');
    try {
      const genericExportResponse = await makeRequest('/api/v1/export/test', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      
      console.log(`   Status: ${genericExportResponse.statusCode}`);
      if (genericExportResponse.statusCode === 200) {
        console.log('   ✅ Generic export working!');
        const exportData = JSON.parse(genericExportResponse.body);
        console.log(`   📊 Export Type: ${exportData.data?.exportInfo?.exportType}`);
        console.log(`   📝 Message: ${exportData.data?.message}`);
      } else {
        console.log('   ❌ Generic export failed');
        console.log(`   Response: ${genericExportResponse.body.substring(0, 300)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Generic export error: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }

  console.log('\n🏁 Export endpoint testing complete!');
}

// Run the tests
testExportEndpoint();
