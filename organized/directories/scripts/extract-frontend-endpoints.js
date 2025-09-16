#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Extracting API endpoints from Clutch Admin frontend...\n');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to extract API endpoints from file content
function extractEndpoints(content, filePath) {
  const endpoints = new Set();
  
  // Patterns to match API endpoints
  const patterns = [
    // Direct API calls
    /fetch\(['"`]([^'"`]+)['"`]/g,
    /axios\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
    /\.request\(['"`]([^'"`]+)['"`]/g,
    /api\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g,
    
    // Template literals with API calls
    /fetch\(`([^`]+)`/g,
    /axios\.(get|post|put|delete|patch)\(`([^`]+)`/g,
    /\.request\(`([^`]+)`/g,
    /api\.(get|post|put|delete|patch)\(`([^`]+)`/g,
    
    // API URL constructions
    /apiUrl.*?['"`]([^'"`]+)['"`]/g,
    /baseURL.*?['"`]([^'"`]+)['"`]/g,
    /endpoint.*?['"`]([^'"`]+)['"`]/g,
    
    // Specific endpoint patterns
    /['"`]\/[a-zA-Z0-9\-_\/]+['"`]/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let endpoint = match[1] || match[2] || match[0];
      
      // Clean up the endpoint
      endpoint = endpoint.replace(/['"`]/g, '');
      
      // Filter out non-API endpoints
      if (endpoint && (
        endpoint.startsWith('/api/') ||
        endpoint.startsWith('/auth/') ||
        endpoint.startsWith('/admin/') ||
        endpoint.startsWith('/users/') ||
        endpoint.startsWith('/dashboard/') ||
        endpoint.startsWith('/analytics/') ||
        endpoint.startsWith('/monitoring/') ||
        endpoint.startsWith('/performance/') ||
        endpoint.startsWith('/errors/') ||
        endpoint.startsWith('/feedback/') ||
        endpoint.startsWith('/clutch-email/') ||
        endpoint.includes('api/v1') ||
        endpoint.includes('clutch-main-nk7x.onrender.com')
      )) {
        endpoints.add(endpoint);
      }
    }
  });
  
  return Array.from(endpoints);
}

// Main extraction process
const frontendDir = path.join(__dirname, '..', 'clutch-admin', 'src');
const allFiles = findFiles(frontendDir);
const allEndpoints = new Set();
const fileEndpoints = {};

console.log(`📁 Found ${allFiles.length} frontend files to analyze...\n`);

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

console.log(`🎯 Found ${sortedEndpoints.length} unique API endpoints:\n`);

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
  other: []
};

sortedEndpoints.forEach(endpoint => {
  if (endpoint.includes('/auth/')) {
    categorizedEndpoints.auth.push(endpoint);
  } else if (endpoint.includes('/admin/')) {
    categorizedEndpoints.admin.push(endpoint);
  } else if (endpoint.includes('/dashboard/')) {
    categorizedEndpoints.dashboard.push(endpoint);
  } else if (endpoint.includes('/analytics/')) {
    categorizedEndpoints.analytics.push(endpoint);
  } else if (endpoint.includes('/monitoring/')) {
    categorizedEndpoints.monitoring.push(endpoint);
  } else if (endpoint.includes('/performance/')) {
    categorizedEndpoints.performance.push(endpoint);
  } else if (endpoint.includes('/errors/')) {
    categorizedEndpoints.errors.push(endpoint);
  } else if (endpoint.includes('/feedback/')) {
    categorizedEndpoints.feedback.push(endpoint);
  } else if (endpoint.includes('/clutch-email/')) {
    categorizedEndpoints.email.push(endpoint);
  } else if (endpoint.includes('/users/')) {
    categorizedEndpoints.users.push(endpoint);
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

const outputFile = path.join(__dirname, '..', 'frontend-endpoints-audit.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

console.log(`💾 Results saved to: ${outputFile}`);
console.log(`\n📊 Summary:`);
console.log(`   • Total files analyzed: ${allFiles.length}`);
console.log(`   • Files with API calls: ${Object.keys(fileEndpoints).length}`);
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
console.log(`   • Other endpoints: ${categorizedEndpoints.other.length}`);

console.log('\n✅ Frontend endpoint extraction completed!');
