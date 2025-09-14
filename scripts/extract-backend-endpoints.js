#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Extracting API endpoints from Clutch backend...\n');

// Function to recursively find all route files
function findRouteFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findRouteFiles(fullPath));
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract endpoints from route file content
function extractEndpoints(content, filePath) {
  const endpoints = new Set();
  
  // Patterns to match route definitions
  const patterns = [
    // Express router patterns
    /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
    /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
    
    // Route with parameters
    /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`],/g,
    /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`],/g,
    
    // Route with middleware
    /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`],\s*[^,]+,\s*async/g,
    /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`],\s*[^,]+,\s*async/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1];
      const endpoint = match[2];
      
      if (endpoint && endpoint !== '/') {
        endpoints.add(`${method.toUpperCase()} ${endpoint}`);
      }
    }
  });
  
  return Array.from(endpoints);
}

// Main extraction process
const backendDir = path.join(__dirname, '..', 'shared-backend', 'routes');
const allFiles = findRouteFiles(backendDir);
const allEndpoints = new Set();
const fileEndpoints = {};

console.log(`📁 Found ${allFiles.length} backend route files to analyze...\n`);

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const endpoints = extractEndpoints(content, file);
    
    if (endpoints.length > 0) {
      const relativePath = path.relative(process.cwd(), file);
      fileEndpoints[relativePath] = endpoints;
      endpoints.forEach(endpoint => allEndpoints.add(endpoint));
    }
  } catch (error) {
    console.warn(`⚠️  Could not read file: ${file}`);
  }
});

// Sort endpoints for better readability
const sortedEndpoints = Array.from(allEndpoints).sort();

console.log(`🎯 Found ${sortedEndpoints.length} unique backend endpoints:\n`);

// Group endpoints by category
const categorizedEndpoints = {
  auth: [],
  admin: [],
  dashboard: [],
  analytics: [],
  monitoring: [],
  performance: [],
  errors: [],
  feedback: [],
  email: [],
  users: [],
  fleet: [],
  autoParts: [],
  mobile: [],
  enterprise: [],
  ai: [],
  other: []
};

sortedEndpoints.forEach(endpoint => {
  const endpointPath = endpoint.split(' ')[1] || '';
  
  if (endpointPath.includes('/auth/')) {
    categorizedEndpoints.auth.push(endpoint);
  } else if (endpointPath.includes('/admin/')) {
    categorizedEndpoints.admin.push(endpoint);
  } else if (endpointPath.includes('/dashboard/')) {
    categorizedEndpoints.dashboard.push(endpoint);
  } else if (endpointPath.includes('/analytics/')) {
    categorizedEndpoints.analytics.push(endpoint);
  } else if (endpointPath.includes('/monitoring/')) {
    categorizedEndpoints.monitoring.push(endpoint);
  } else if (endpointPath.includes('/performance/')) {
    categorizedEndpoints.performance.push(endpoint);
  } else if (endpointPath.includes('/errors/')) {
    categorizedEndpoints.errors.push(endpoint);
  } else if (endpointPath.includes('/feedback/')) {
    categorizedEndpoints.feedback.push(endpoint);
  } else if (endpointPath.includes('/email/') || endpointPath.includes('/clutch-email/')) {
    categorizedEndpoints.email.push(endpoint);
  } else if (endpointPath.includes('/users/')) {
    categorizedEndpoints.users.push(endpoint);
  } else if (endpointPath.includes('/fleet/')) {
    categorizedEndpoints.fleet.push(endpoint);
  } else if (endpointPath.includes('/auto-parts/')) {
    categorizedEndpoints.autoParts.push(endpoint);
  } else if (endpointPath.includes('/mobile/')) {
    categorizedEndpoints.mobile.push(endpoint);
  } else if (endpointPath.includes('/enterprise/')) {
    categorizedEndpoints.enterprise.push(endpoint);
  } else if (endpointPath.includes('/ai/')) {
    categorizedEndpoints.ai.push(endpoint);
  } else {
    categorizedEndpoints.other.push(endpoint);
  }
});

// Display categorized endpoints
Object.entries(categorizedEndpoints).forEach(([category, endpoints]) => {
  if (endpoints.length > 0) {
    console.log(`📂 ${category.toUpperCase()} (${endpoints.length} endpoints):`);
    endpoints.forEach(endpoint => {
      console.log(`   ${endpoint}`);
    });
    console.log('');
  }
});

// Save results to file
const results = {
  totalEndpoints: sortedEndpoints.length,
  totalFiles: allFiles.length,
  filesWithEndpoints: Object.keys(fileEndpoints).length,
  categorizedEndpoints,
  allEndpoints: sortedEndpoints,
  fileEndpoints
};

const outputFile = path.join(__dirname, '..', 'backend-endpoints-audit.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

console.log(`💾 Results saved to: ${outputFile}`);
console.log(`\n📊 Summary:`);
console.log(`   • Total route files analyzed: ${allFiles.length}`);
console.log(`   • Files with endpoints: ${Object.keys(fileEndpoints).length}`);
console.log(`   • Unique endpoints found: ${sortedEndpoints.length}`);
console.log(`   • Auth endpoints: ${categorizedEndpoints.auth.length}`);
console.log(`   • Admin endpoints: ${categorizedEndpoints.admin.length}`);
console.log(`   • Dashboard endpoints: ${categorizedEndpoints.dashboard.length}`);
console.log(`   • Analytics endpoints: ${categorizedEndpoints.analytics.length}`);
console.log(`   • Monitoring endpoints: ${categorizedEndpoints.monitoring.length}`);
console.log(`   • Performance endpoints: ${categorizedEndpoints.performance.length}`);
console.log(`   • Error endpoints: ${categorizedEndpoints.errors.length}`);
console.log(`   • Feedback endpoints: ${categorizedEndpoints.feedback.length}`);
console.log(`   • Email endpoints: ${categorizedEndpoints.email.length}`);
console.log(`   • User endpoints: ${categorizedEndpoints.users.length}`);
console.log(`   • Fleet endpoints: ${categorizedEndpoints.fleet.length}`);
console.log(`   • Auto Parts endpoints: ${categorizedEndpoints.autoParts.length}`);
console.log(`   • Mobile endpoints: ${categorizedEndpoints.mobile.length}`);
console.log(`   • Enterprise endpoints: ${categorizedEndpoints.enterprise.length}`);
console.log(`   • AI endpoints: ${categorizedEndpoints.ai.length}`);
console.log(`   • Other endpoints: ${categorizedEndpoints.other.length}`);

console.log('\n✅ Backend endpoint extraction completed!');
