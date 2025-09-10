const { pingHealthEndpoint } = require('./scripts/keep-alive');

async function testKeepAlive() {
  console.log('🧪 Testing Keep-Alive Functionality...');
  console.log('📡 Testing ping to health endpoint...');
  
  try {
    const result = await pingHealthEndpoint();
    console.log('✅ Keep-alive test successful!');
    console.log('📊 Result:', result);
    
    if (result.success) {
      console.log('🎉 Keep-alive service is working correctly!');
      console.log('📝 The backend will stay warm and prevent cold starts.');
    } else {
      console.log('⚠️ Keep-alive test completed but with warnings.');
    }
  } catch (error) {
    console.log('❌ Keep-alive test failed:', error);
    console.log('🔧 Please check the backend service is running.');
  }
}

// Run the test
testKeepAlive();
