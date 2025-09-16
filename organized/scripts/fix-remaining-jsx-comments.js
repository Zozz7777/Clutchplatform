#!/usr/bin/env node

/**
 * Aggressive script to fix ALL remaining JSX comment syntax errors
 * Removes ALL inline comments that are causing build failures
 */

const fs = require('fs');

// Files with remaining JSX comment issues
const filesToFix = [
  'clutch-admin/src/app/(dashboard)/dashboard-consolidated/page.tsx',
  'clutch-admin/src/app/(dashboard)/marketing/analytics/page.tsx',
  'clutch-admin/src/app/(dashboard)/monitoring/alerts/page.tsx',
  'clutch-admin/src/app/(dashboard)/security/audit/page.tsx',
  'clutch-admin/src/app/(dashboard)/security/biometric/page.tsx'
];

console.log('🔧 Fixing remaining JSX comment syntax errors...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove ALL inline JSX comments aggressively
    content = content.replace(/\s*\{\s*\/\*.*?\*\/\s*\}/g, '');
    content = content.replace(/\s*\/\*.*?\*\/\s*/g, '');
    content = content.replace(/\s*\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('🎉 All remaining JSX comment syntax errors fixed!');
