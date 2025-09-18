/**
 * Script to fix authentication imports in all route files
 * Replaces old auth.js and rbac.js imports with unified-auth.js
 */

const fs = require('fs');
const path = require('path');

// Routes directory
const routesDir = path.join(__dirname, '..', 'routes');

// Files to fix (routes that import from auth.js or rbac.js)
const filesToFix = [
  'admin.js',
  'assets.js',
  'audit-trail.js',
  'chat.js',
  'communication.js',
  'cms.js',
  'dashboard.js',
  'employee-invitations.js',
  'employees.js',
  'enterprise.js',
  'errors.js',
  'export.js',
  'feature-flags.js',
  'hr.js',
  'integrations.js',
  'legal.js',
  'marketing.js',
  'other.js',
  'payments.js',
  'performance.js',
  'projects.js',
  'realtime.js',
  'reports.js',
  'settings.js',
  'system-health.js',
  'vendors.js'
];

console.log('🔧 Fixing authentication imports in route files...');

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(routesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix pattern 1: Both auth.js and rbac.js imports
    const pattern1 = /const\s*{\s*authenticateToken,\s*requireRole\s*}\s*=\s*require\s*\(\s*['"]\.\.\/middleware\/auth['"]\s*\);\s*\n\s*const\s*{\s*checkRole,\s*checkPermission\s*}\s*=\s*require\s*\(\s*['"]\.\.\/middleware\/rbac['"]\s*\);/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, 'const { authenticateToken, checkRole, checkPermission } = require(\'../middleware/unified-auth\');');
      modified = true;
    }
    
    // Fix pattern 2: Only auth.js import
    const pattern2 = /const\s*{\s*authenticateToken,\s*requireRole\s*}\s*=\s*require\s*\(\s*['"]\.\.\/middleware\/auth['"]\s*\);/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, 'const { authenticateToken, checkRole } = require(\'../middleware/unified-auth\');');
      modified = true;
    }
    
    // Fix pattern 3: Only rbac.js import with authenticateToken
    const pattern3 = /const\s*{\s*authenticateToken,\s*checkRole\s*}\s*=\s*require\s*\(\s*['"]\.\.\/middleware\/rbac['"]\s*\);/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, 'const { authenticateToken, checkRole } = require(\'../middleware/unified-auth\');');
      modified = true;
    }
    
    // Fix pattern 4: Only rbac.js import without authenticateToken
    const pattern4 = /const\s*{\s*checkRole,\s*checkPermission\s*}\s*=\s*require\s*\(\s*['"]\.\.\/middleware\/rbac['"]\s*\);/g;
    if (pattern4.test(content)) {
      content = content.replace(pattern4, 'const { checkRole, checkPermission } = require(\'../middleware/unified-auth\');');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fileName}`);
      fixedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${fileName}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${fileName}:`, error.message);
    errorCount++;
  }
});

console.log('\n📊 Fix Summary:');
console.log(`✅ Files fixed: ${fixedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📁 Total files processed: ${filesToFix.length}`);

if (errorCount === 0) {
  console.log('\n🎉 All authentication imports fixed successfully!');
} else {
  console.log('\n⚠️  Some files had errors. Please check the output above.');
}
