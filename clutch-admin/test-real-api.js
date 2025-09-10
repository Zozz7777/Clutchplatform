// Test real API calls with proper delays
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRealAPI() {
  console.log('🔍 Testing Real API Calls...');
  console.log('⏳ Waiting 10 seconds to ensure rate limits are reset...');
  await delay(10000);
  
  // Test 1: Public endpoint
  console.log('\n1. Testing public endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/admin/test-public`);
    const data = await response.json();
    console.log('✅ Public endpoint status:', response.status);
    console.log('✅ Public endpoint response:', data);
  } catch (error) {
    console.log('❌ Public endpoint error:', error.message);
  }
  
  // Wait 2 seconds between requests
  await delay(2000);
  
  // Test 2: Employee Login
  console.log('\n2. Testing employee login...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/employee-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ziad@YourClutch.com',
        password: '4955698*Z*z'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', loginData);
    
    if (loginResponse.ok && loginData.success) {
      const token = loginData.data.token;
      console.log('✅ Login successful, token:', token.substring(0, 50) + '...');
      
      // Wait 2 seconds before next request
      await delay(2000);
      
      // Test 3: Authenticated endpoint
      console.log('\n3. Testing authenticated endpoint...');
      try {
        const authResponse = await fetch(`${API_BASE_URL}/admin/test-auth`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const authData = await authResponse.json();
        console.log('Auth endpoint status:', authResponse.status);
        console.log('Auth endpoint response:', authData);
        
        if (authResponse.ok) {
          console.log('✅ Authenticated endpoint working!');
        } else {
          console.log('❌ Authenticated endpoint failed');
        }
        
      } catch (error) {
        console.log('❌ Auth endpoint error:', error.message);
      }
      
      // Wait 2 seconds before next request
      await delay(2000);
      
      // Test 4: Admin dashboard metrics
      console.log('\n4. Testing admin dashboard metrics...');
      try {
        const metricsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const metricsData = await metricsResponse.json();
        console.log('Metrics endpoint status:', metricsResponse.status);
        console.log('Metrics endpoint response:', metricsData);
        
        if (metricsResponse.ok) {
          console.log('✅ Dashboard metrics working!');
        } else {
          console.log('❌ Dashboard metrics failed');
        }
        
      } catch (error) {
        console.log('❌ Metrics endpoint error:', error.message);
      }
      
      // Wait 2 seconds before next request
      await delay(2000);
      
      // Test 5: Platform services
      console.log('\n5. Testing platform services...');
      try {
        const servicesResponse = await fetch(`${API_BASE_URL}/admin/platform/services`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const servicesData = await servicesResponse.json();
        console.log('Services endpoint status:', servicesResponse.status);
        console.log('Services endpoint response:', servicesData);
        
        if (servicesResponse.ok) {
          console.log('✅ Platform services working!');
        } else {
          console.log('❌ Platform services failed');
        }
        
      } catch (error) {
        console.log('❌ Services endpoint error:', error.message);
      }
      
      // Wait 2 seconds before next request
      await delay(2000);
      
      // Test 6: Activity logs
      console.log('\n6. Testing activity logs...');
      try {
        const logsResponse = await fetch(`${API_BASE_URL}/admin/activity-logs?limit=20`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const logsData = await logsResponse.json();
        console.log('Logs endpoint status:', logsResponse.status);
        console.log('Logs endpoint response:', logsData);
        
        if (logsResponse.ok) {
          console.log('✅ Activity logs working!');
        } else {
          console.log('❌ Activity logs failed');
        }
        
      } catch (error) {
        console.log('❌ Logs endpoint error:', error.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData);
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  console.log('\n🎉 Real API testing completed!');
}

// Run the test
testRealAPI();
