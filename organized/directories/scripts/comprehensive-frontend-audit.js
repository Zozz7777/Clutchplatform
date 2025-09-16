const fs = require('fs');
const path = require('path');

// Comprehensive frontend audit script
// This will scan ALL frontend files for API calls, including widgets, buttons, cards, etc.

const frontendDirectories = [
  'clutch-admin/src',
  'website',
  'clutch-auto-parts-clean'
];

const apiCallPatterns = [
  // Fetch API calls
  /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /fetch\s*\(\s*`([^`]+)`/g,
  
  // Axios calls
  /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /axios\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g,
  
  // API service calls
  /api\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /api\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g,
  
  // HTTP client calls
  /http\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /http\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g,
  
  // Custom API calls
  /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /\.(get|post|put|delete|patch)\s*\(\s*`([^`]+)`/g,
  
  // URL patterns in variables
  /const\s+\w+\s*=\s*['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g,
  /let\s+\w+\s*=\s*['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g,
  /var\s+\w+\s*=\s*['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g,
  
  // URL patterns in objects
  /['"`]([^'"`]*\/api\/[^'"`]+)['"`]\s*:/g,
  /:\s*['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g,
  
  // Template literals with API calls
  /`[^`]*\/api\/[^`]+`/g,
  
  // React Query/useQuery calls
  /useQuery\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /useQuery\s*\(\s*`([^`]+)`/g,
  
  // SWR calls
  /useSWR\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /useSWR\s*\(\s*`([^`]+)`/g,
  
  // Next.js API routes
  /\/api\/[^'"`\s]+/g,
  
  // Any URL starting with /api
  /\/api\/[^'"`\s\)]+/g,
  
  // Any URL starting with /auth
  /\/auth\/[^'"`\s\)]+/g,
  
  // Any URL starting with /admin
  /\/admin\/[^'"`\s\)]+/g,
  
  // Any URL starting with /dashboard
  /\/dashboard\/[^'"`\s\)]+/g,
  
  // Any URL starting with /analytics
  /\/analytics\/[^'"`\s\)]+/g,
  
  // Any URL starting with /monitoring
  /\/monitoring\/[^'"`\s\)]+/g,
  
  // Any URL starting with /users
  /\/users\/[^'"`\s\)]+/g,
  
  // Any URL starting with /errors
  /\/errors\/[^'"`\s\)]+/g
];

const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.html', '.php', '.kt', '.java'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist, build directories
        if (!['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'].includes(file)) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        }
      } else {
        // Check if file has relevant extension
        const ext = path.extname(file);
        if (fileExtensions.includes(ext)) {
          arrayOfFiles.push(fullPath);
        }
      }
    });
  } catch (error) {
    console.log(`Skipping directory ${dirPath}: ${error.message}`);
  }
  
  return arrayOfFiles;
}

function extractApiCalls(content, filePath) {
  const apiCalls = new Set();
  
  apiCallPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let url = match[1] || match[0];
      
      // Clean up the URL
      if (url.startsWith('`') && url.endsWith('`')) {
        url = url.slice(1, -1);
      }
      if (url.startsWith("'") && url.endsWith("'")) {
        url = url.slice(1, -1);
      }
      if (url.startsWith('"') && url.endsWith('"')) {
        url = url.slice(1, -1);
      }
      
      // Extract just the path part
      if (url.includes('/api/') || url.includes('/auth/') || url.includes('/admin/') || 
          url.includes('/dashboard/') || url.includes('/analytics/') || url.includes('/monitoring/') ||
          url.includes('/users/') || url.includes('/errors/')) {
        
        // Extract the path after the domain
        const pathMatch = url.match(/(\/[^?\s]*)/);
        if (pathMatch) {
          let path = pathMatch[1];
          
          // Remove query parameters
          path = path.split('?')[0];
          
          // Remove trailing slash
          if (path.endsWith('/') && path.length > 1) {
            path = path.slice(0, -1);
          }
          
          // Add leading slash if missing
          if (!path.startsWith('/')) {
            path = '/' + path;
          }
          
          if (path.length > 1) {
            apiCalls.add(path);
          }
        }
      }
    }
  });
  
  return Array.from(apiCalls);
}

function auditFrontend() {
  console.log('🔍 Starting comprehensive frontend audit...\n');
  
  const allApiCalls = new Set();
  const fileResults = [];
  const categoryResults = {
    auth: new Set(),
    admin: new Set(),
    dashboard: new Set(),
    analytics: new Set(),
    monitoring: new Set(),
    users: new Set(),
    other: new Set(),
    errors: new Set()
  };
  
  frontendDirectories.forEach(dir => {
    console.log(`📁 Scanning directory: ${dir}`);
    
    if (!fs.existsSync(dir)) {
      console.log(`   ⚠️  Directory ${dir} does not exist, skipping...`);
      return;
    }
    
    const files = getAllFiles(dir);
    console.log(`   📄 Found ${files.length} files to scan`);
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const apiCalls = extractApiCalls(content, filePath);
        
        if (apiCalls.length > 0) {
          fileResults.push({
            file: filePath,
            apiCalls: apiCalls
          });
          
          apiCalls.forEach(call => {
            allApiCalls.add(call);
            
            // Categorize the API call
            if (call.includes('/auth/')) {
              categoryResults.auth.add(call);
            } else if (call.includes('/admin/')) {
              categoryResults.admin.add(call);
            } else if (call.includes('/dashboard/')) {
              categoryResults.dashboard.add(call);
            } else if (call.includes('/analytics/')) {
              categoryResults.analytics.add(call);
            } else if (call.includes('/monitoring/')) {
              categoryResults.monitoring.add(call);
            } else if (call.includes('/users/')) {
              categoryResults.users.add(call);
            } else if (call.includes('/errors/')) {
              categoryResults.errors.add(call);
            } else {
              categoryResults.other.add(call);
            }
          });
        }
      } catch (error) {
        console.log(`   ❌ Error reading file ${filePath}: ${error.message}`);
      }
    });
  });
  
  // Convert Sets to Arrays for JSON serialization
  const results = {
    summary: {
      totalFiles: fileResults.length,
      totalApiCalls: allApiCalls.size,
      categories: {
        auth: categoryResults.auth.size,
        admin: categoryResults.admin.size,
        dashboard: categoryResults.dashboard.size,
        analytics: categoryResults.analytics.size,
        monitoring: categoryResults.monitoring.size,
        users: categoryResults.users.size,
        other: categoryResults.other.size,
        errors: categoryResults.errors.size
      }
    },
    allApiCalls: Array.from(allApiCalls).sort(),
    categories: {
      auth: Array.from(categoryResults.auth).sort(),
      admin: Array.from(categoryResults.admin).sort(),
      dashboard: Array.from(categoryResults.dashboard).sort(),
      analytics: Array.from(categoryResults.analytics).sort(),
      monitoring: Array.from(categoryResults.monitoring).sort(),
      users: Array.from(categoryResults.users).sort(),
      other: Array.from(categoryResults.other).sort(),
      errors: Array.from(categoryResults.errors).sort()
    },
    fileResults: fileResults
  };
  
  // Save results
  fs.writeFileSync('comprehensive-frontend-audit.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 COMPREHENSIVE FRONTEND AUDIT RESULTS:');
  console.log('=====================================');
  console.log(`📄 Total files scanned: ${fileResults.length}`);
  console.log(`🔗 Total unique API calls found: ${allApiCalls.size}`);
  console.log('\n📋 By Category:');
  console.log(`   🔐 Auth: ${categoryResults.auth.size} calls`);
  console.log(`   👑 Admin: ${categoryResults.admin.size} calls`);
  console.log(`   📊 Dashboard: ${categoryResults.dashboard.size} calls`);
  console.log(`   📈 Analytics: ${categoryResults.analytics.size} calls`);
  console.log(`   🔍 Monitoring: ${categoryResults.monitoring.size} calls`);
  console.log(`   👥 Users: ${categoryResults.users.size} calls`);
  console.log(`   🔧 Other: ${categoryResults.other.size} calls`);
  console.log(`   ❌ Errors: ${categoryResults.errors.size} calls`);
  
  console.log('\n✅ Results saved to: comprehensive-frontend-audit.json');
  
  return results;
}

// Run the audit
if (require.main === module) {
  auditFrontend();
}

module.exports = { auditFrontend };
