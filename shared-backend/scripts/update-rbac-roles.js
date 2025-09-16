const fs = require('fs');
const path = require('path');

// Role mapping from old to new RBAC system
const roleMapping = {
  'admin': 'head_administrator',
  'super_admin': 'head_administrator', 
  'hr_manager': 'hr_manager',
  'fleet_manager': 'asset_manager',
  'finance_manager': 'finance_officer',
  'crm_manager': 'customer_support',
  'developer': 'technology_admin'
};

// Files to update
const routeFiles = [
  'routes/hr.js',
  'routes/employee-invitations.js',
  'routes/feature-flags.js',
  'routes/fleet.js',
  'routes/audit-trail.js',
  'routes/integrations.js',
  'routes/settings.js',
  'routes/chat.js',
  'routes/finance.js',
  'routes/crm.js',
  'routes/system-health.js',
  'routes/reports.js',
  'routes/vendors.js',
  'routes/assets.js',
  'routes/projects.js',
  'routes/export.js',
  'routes/payments.js',
  'routes/communication.js',
  'routes/performance.js',
  'routes/notifications.js',
  'routes/dashboard.js',
  'routes/employees.js',
  'routes/marketing.js',
  'routes/enterprise.js',
  'routes/cms.js',
  'routes/auto-parts.js',
  'routes/users.js',
  'routes/audit.js',
  'routes/legal.js',
  'routes/consolidated-analytics.js',
  'routes/auth.js',
  'routes/admin.js',
  'routes/errors.js',
  'routes/other.js',
  'routes/realtime.js',
  'routes/ai.js'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Add RBAC import if not present
    if (content.includes('requireRole') && !content.includes('checkRole')) {
      content = content.replace(
        /const { authenticateToken, requireRole } = require\('\.\.\/middleware\/auth'\);/,
        `const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkRole, checkPermission } = require('../middleware/rbac');`
      );
      updated = true;
    }

    // Replace requireRole with checkRole and update role names
    Object.entries(roleMapping).forEach(([oldRole, newRole]) => {
      // Replace role names in arrays
      const oldPattern = new RegExp(`'${oldRole}'`, 'g');
      if (content.includes(`'${oldRole}'`)) {
        content = content.replace(oldPattern, `'${newRole}'`);
        updated = true;
      }
    });

    // Replace requireRole with checkRole
    if (content.includes('requireRole')) {
      content = content.replace(/requireRole/g, 'checkRole');
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting RBAC role update...');
  
  routeFiles.forEach(updateFile);
  
  console.log('🎉 RBAC role update completed!');
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, roleMapping };
