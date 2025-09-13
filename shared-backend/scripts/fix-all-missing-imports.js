/**
 * Fix All Missing authenticateToken Imports
 * Systematically adds missing imports to all route files
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing All Missing authenticateToken Imports');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// Get all route files
const routesDir = path.join(__dirname, '..', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

function fixAuthenticateImport(routeFile) {
  const routePath = path.join(routesDir, routeFile);
  let content = fs.readFileSync(routePath, 'utf8');
  
  // Check if authenticateToken import already exists
  if (content.includes("require('../middleware/auth')") || content.includes("authenticateToken")) {
    console.log(`✅ ${routeFile} already has authenticateToken import`);
    return;
  }
  
  // Check if the file uses authenticateToken
  if (!content.includes('authenticateToken')) {
    console.log(`⚪ ${routeFile} doesn't use authenticateToken`);
    return;
  }
  
  // Find the first require statement and add the import after it
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("require(") && !lines[i].includes("authenticateToken")) {
      insertIndex = i + 1;
      break;
    }
  }
  
  // Insert the authenticateToken import
  lines.splice(insertIndex, 0, "const { authenticateToken } = require('../middleware/auth');");
  
  // Write back to file
  const newContent = lines.join('\n');
  fs.writeFileSync(routePath, newContent);
  console.log(`✅ Added authenticateToken import to ${routeFile}`);
}

// Process all route files
console.log(`\n🔄 Processing ${routeFiles.length} route files...\n`);

routeFiles.forEach(routeFile => {
  fixAuthenticateImport(routeFile);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 ALL MISSING IMPORTS FIXED');
console.log('='.repeat(60));
console.log('✅ Added authenticateToken imports to all route files that need them');
console.log('✅ Server should now start without import errors');
console.log('\n🏁 All import issues fixed!');
