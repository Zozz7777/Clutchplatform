const fs = require('fs');
const path = require('path');

// Files that have duplicate checkRole declarations
const filesToFix = [
  'routes/hr.js',
  'routes/ai.js',
  'routes/other.js',
  'routes/errors.js',
  'routes/realtime.js',
  'routes/auth.js',
  'routes/consolidated-analytics.js',
  'routes/users.js',
  'routes/audit.js',
  'routes/legal.js',
  'routes/auto-parts.js',
  'routes/cms.js',
  'routes/enterprise.js',
  'routes/marketing.js',
  'routes/employees.js',
  'routes/dashboard.js',
  'routes/assets.js',
  'routes/communication.js',
  'routes/projects.js',
  'routes/performance.js',
  'routes/notifications.js',
  'routes/payments.js',
  'routes/export.js',
  'routes/vendors.js',
  'routes/system-health.js',
  'routes/reports.js',
  'routes/crm.js',
  'routes/chat.js',
  'routes/finance.js',
  'routes/audit-trail.js',
  'routes/integrations.js',
  'routes/settings.js',
  'routes/fleet.js',
  'routes/feature-flags.js'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Fix duplicate checkRole declarations
    // Replace: const { authenticateToken, checkRole } = require('../middleware/auth');
    // With:    const { authenticateToken, requireRole } = require('../middleware/auth');
    if (content.includes("const { authenticateToken, checkRole } = require('../middleware/auth');")) {
      content = content.replace(
        "const { authenticateToken, checkRole } = require('../middleware/auth');",
        "const { authenticateToken, requireRole } = require('../middleware/auth');"
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting duplicate checkRole fix...');
  
  filesToFix.forEach(fixFile);
  
  console.log('🎉 Duplicate checkRole fix completed!');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
