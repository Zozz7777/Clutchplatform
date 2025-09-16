#!/usr/bin/env node

/**
 * Script to fix JSX comment syntax errors
 * Removes inline comments that are causing build failures
 */

const fs = require('fs');
const path = require('path');

// Files with JSX comment issues
const filesToFix = [
  'clutch-admin/src/app/(dashboard)/mobile/operations/page.tsx',
  'clutch-admin/src/app/(dashboard)/marketing/analytics/page.tsx',
  'clutch-admin/src/app/(dashboard)/finance/payments/page.tsx',
  'clutch-admin/src/app/(dashboard)/hr/employees/page.tsx',
  'clutch-admin/src/app/(dashboard)/crm/customers/page.tsx',
  'clutch-admin/src/app/(dashboard)/layout.tsx',
  'clutch-admin/src/components/navigation/smart-navigation.tsx',
  'clutch-admin/src/app/(dashboard)/monitoring/alerts/page.tsx',
  'clutch-admin/src/app/(dashboard)/dashboard/page.tsx',
  'clutch-admin/src/app/(dashboard)/dashboard-consolidated/page.tsx',
  'clutch-admin/src/components/ui/card.tsx',
  'clutch-admin/src/components/ui/badge.tsx',
  'clutch-admin/src/components/ui/snow-input.tsx',
  'clutch-admin/src/components/ui/component-library.tsx'
];

console.log('🔧 Fixing JSX comment syntax errors...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove inline JSX comments that are causing syntax errors
    content = content.replace(/\s*\{\s*\/\*.*?\*\/\s*\}/g, '');
    
    // Remove comments at the end of JSX elements
    content = content.replace(/\s*\/\*.*?\*\/\s*(?=\s*[>}])/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('🎉 All JSX comment syntax errors fixed!');
