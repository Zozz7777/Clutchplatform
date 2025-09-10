// Test authentication with delays to avoid rate limiting
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAuthWithDelays() {
  console.log('🔍 Testing Authentication with Delays...');
  
  // Wait 5 seconds before starting to let any previous rate limits reset
  console.log('⏳ Waiting 5 seconds to reset rate limits...');
  await delay(5000);
  
  // Test 1: Public endpoint
  console.log('\n1. Testing public endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/admin/test-public`);
    const data = await response.json();
    console.log('✅ Public endpoint:', data);
  } catch (error) {
    console.log('❌ Public endpoint error:', error.message);
  }
  
  // Wait 2 seconds between requests
  await delay(2000);
  
  // Test 2: Login
  console.log('\n2. Testing login...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@clutch.com',
        password: 'admin123'
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
      
    } else {
      console.log('❌ Login failed:', loginData);
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
}

// Run the test
testAuthWithDelays();
