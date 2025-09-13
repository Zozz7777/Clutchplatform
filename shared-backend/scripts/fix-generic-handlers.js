/**
 * Fix Generic Handlers
 * Fix the ReferenceError in generic handlers by replacing routeFile variable
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Generic Handlers');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// Get all route files
const routesDir = path.join(__dirname, '..', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

function fixGenericHandlers(routeFile) {
  const routePath = path.join(routesDir, routeFile);
  let content = fs.readFileSync(routePath, 'utf8');
  
  // Check if the file has the problematic routeFile variable
  if (!content.includes('routeFile.replace')) {
    console.log(`✅ ${routeFile} - No routeFile variable found`);
    return;
  }
  
  // Get the service name from the filename
  const serviceName = routeFile.replace('.js', '');
  
  // Replace all instances of routeFile.replace('.js', '') with the service name
  content = content.replace(/routeFile\.replace\('\.js', ''\)/g, `'${serviceName}'`);
  
  fs.writeFileSync(routePath, content);
  console.log(`✅ Fixed generic handlers in ${routeFile}`);
}

// Process all route files
console.log(`\n🔄 Processing ${routeFiles.length} route files...\n`);

routeFiles.forEach(routeFile => {
  fixGenericHandlers(routeFile);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 ALL GENERIC HANDLERS FIXED');
console.log('='.repeat(60));
console.log('✅ Fixed ReferenceError in all generic handlers');
console.log('✅ All endpoints should now work without 500 errors');
console.log('\n🏁 All generic handler issues fixed!');
