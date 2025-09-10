// Test case-insensitive email authentication
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCaseInsensitiveAuth() {
  console.log('🔍 Testing Case-Insensitive Email Authentication...');
  
  // Wait 5 seconds to ensure rate limits are reset
  console.log('⏳ Waiting 5 seconds...');
  await delay(5000);
  
  // Test different case variations of the same email
  const emailVariations = [
    'ziad@YourClutch.com',    // Original case
    'ziad@yourclutch.com',    // All lowercase
    'ZIAD@YOURCLUTCH.COM',    // All uppercase
    'Ziad@YourClutch.com',    // Mixed case
    'ziad@YOURCLUTCH.com',    // Mixed case
    'ZIAD@yourclutch.COM'     // Mixed case
  ];
  
  const password = '4955698*Z*z';
  
  for (let i = 0; i < emailVariations.length; i++) {
    const email = emailVariations[i];
    console.log(`\n🔐 Testing login ${i + 1}: ${email}`);
    
    await delay(2000); // Wait between attempts
    
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/employee-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginResponse.json();
      console.log(`Login ${i + 1} status:`, loginResponse.status);
      
      if (loginResponse.ok) {
        console.log(`✅ Login ${i + 1} successful!`);
        console.log(`User: ${loginData.data?.user?.fullName} (${loginData.data?.user?.email})`);
        console.log(`Role: ${loginData.data?.user?.role}`);
      } else {
        console.log(`❌ Login ${i + 1} failed:`, loginData.message);
      }
      
    } catch (error) {
      console.log(`❌ Login ${i + 1} error:`, error.message);
    }
  }
  
  console.log('\n🎉 Case-insensitive authentication testing completed!');
}

// Run the test
testCaseInsensitiveAuth();
