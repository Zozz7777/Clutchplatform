/**
 * Test script to verify server can start without crashing
 */

const path = require('path');

console.log('🧪 Testing server startup...');

try {
  // Test if all route files can be required without errors
  const routesDir = path.join(__dirname, '..', 'routes');
  
  const routeFiles = [
    'ai.js',
    'analytics.js', 
    'notifications.js',
    'crm.js',
    'finance.js',
    'fleet.js',
    'users.js'
  ];
  
  console.log('📁 Testing route file imports...');
  
  routeFiles.forEach(fileName => {
    try {
      const routePath = path.join(routesDir, fileName);
      delete require.cache[require.resolve(routePath)];
      require(routePath);
      console.log(`✅ ${fileName} - OK`);
    } catch (error) {
      console.log(`❌ ${fileName} - ERROR:`, error.message);
    }
  });
  
  console.log('\n🔧 Testing middleware imports...');
  
  try {
    const unifiedAuth = require('../middleware/unified-auth');
    console.log('✅ unified-auth.js - OK');
  } catch (error) {
    console.log('❌ unified-auth.js - ERROR:', error.message);
  }
  
  try {
    const rbac = require('../middleware/rbac');
    console.log('✅ rbac.js - OK');
  } catch (error) {
    console.log('❌ rbac.js - ERROR:', error.message);
  }
  
  try {
    const auth = require('../middleware/auth');
    console.log('✅ auth.js - OK');
  } catch (error) {
    console.log('❌ auth.js - ERROR:', error.message);
  }
  
  console.log('\n🎉 Server startup test completed!');
  
} catch (error) {
  console.error('💥 Server startup test failed:', error.message);
  process.exit(1);
}
