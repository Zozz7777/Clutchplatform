// Check what employees exist in the database
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkEmployees() {
  console.log('🔍 Checking employees in database...');
  
  // Wait 5 seconds to ensure rate limits are reset
  console.log('⏳ Waiting 5 seconds...');
  await delay(5000);
  
  // Try to get employees (this might require authentication)
  try {
    const response = await fetch(`${API_BASE_URL}/hr/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('Employees endpoint status:', response.status);
    console.log('Employees response:', data);
    
  } catch (error) {
    console.log('❌ Error checking employees:', error.message);
  }
  
  // Try different login variations
  const testCredentials = [
    { email: 'ziad@yourclutch.com', password: '49555698*Z*z' },
    { email: 'ziad@yourclutch.com', password: '49555698*Z*Z' },
    { email: 'ziad@yourclutch.com', password: '49555698*Z*z' },
    { email: 'ziad@yourclutch.com', password: '49555698*Z*Z' }
  ];
  
  for (let i = 0; i < testCredentials.length; i++) {
    const creds = testCredentials[i];
    console.log(`\n🔐 Testing login ${i + 1}:`, creds.email);
    
    await delay(2000); // Wait between attempts
    
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/employee-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
      });
      
      const loginData = await loginResponse.json();
      console.log(`Login ${i + 1} status:`, loginResponse.status);
      
      if (loginResponse.ok) {
        console.log(`✅ Login ${i + 1} successful!`);
        console.log('User data:', loginData.data?.user);
        break;
      } else {
        console.log(`❌ Login ${i + 1} failed:`, loginData.message);
      }
      
    } catch (error) {
      console.log(`❌ Login ${i + 1} error:`, error.message);
    }
  }
}

// Run the check
checkEmployees();
