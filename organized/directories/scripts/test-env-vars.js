require('dotenv').config();

console.log('🔍 Testing Environment Variables...\n');

const envVars = [
  'REALTIME_ENABLED',
  'MONITORING_ENABLED', 
  'CDN_ENABLED',
  'HELMET_ENABLED',
  'NODE_ENV',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: "${value}" (${value === 'true' ? '✅ TRUE' : value === 'false' ? '❌ FALSE' : '⚠️  UNDEFINED'})`);
});

console.log('\n🔍 Feature Status:');
console.log(`Real-time: ${process.env.REALTIME_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`Monitoring: ${process.env.MONITORING_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`CDN: ${process.env.CDN_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`Helmet: ${process.env.HELMET_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);

console.log('\n📁 Current working directory:', process.cwd());
console.log('📄 .env file location:', require('path').resolve('.env'));
