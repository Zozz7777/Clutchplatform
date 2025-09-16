const fs = require('fs');
const path = require('path');

// Function to remove duplicate roles from checkRole arrays
function removeDuplicateRoles(content) {
  // Pattern to match checkRole arrays with potential duplicates
  const checkRoleRegex = /checkRole\(\[([^\]]+)\]\)/g;
  
  return content.replace(checkRoleRegex, (match, rolesString) => {
    // Split roles and clean them up
    const roles = rolesString.split(',').map(role => role.trim().replace(/['"]/g, ''));
    
    // Remove duplicates while preserving order
    const uniqueRoles = [...new Set(roles)];
    
    // Reconstruct the checkRole call
    const uniqueRolesString = uniqueRoles.map(role => `'${role}'`).join(', ');
    return `checkRole([${uniqueRolesString}])`;
  });
}

// Function to fix a single file
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove duplicate roles
    content = removeDuplicateRoles(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed duplicates in: ${filePath}`);
    } else {
      console.log(`⏭️  No duplicates found in: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Get all route files
function getAllRouteFiles() {
  const routesDir = path.join(__dirname, '..', 'routes');
  const files = fs.readdirSync(routesDir);
  return files
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(routesDir, file));
}

function main() {
  console.log('🚀 Starting duplicate role cleanup...');
  
  const routeFiles = getAllRouteFiles();
  routeFiles.forEach(fixFile);
  
  console.log('🎉 Duplicate role cleanup completed!');
}

if (require.main === module) {
  main();
}

module.exports = { removeDuplicateRoles, fixFile };
