#!/usr/bin/env node

/**
 * Comprehensive script to fix ALL JSX comment syntax errors
 * Removes all inline comments that are causing build failures
 */

const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (!['node_modules', '.next', '.git'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

console.log('🔧 Fixing ALL JSX comment syntax errors...');

// Find all TypeScript/JavaScript files in the clutch-admin directory
const files = findFiles('clutch-admin/src');

console.log(`Found ${files.length} files to check...`);

let fixedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove inline JSX comments that are causing syntax errors
    // Pattern: {/* comment */}
    content = content.replace(/\s*\{\s*\/\*.*?\*\/\s*\}/g, '');
    
    // Remove comments at the end of JSX elements
    // Pattern: /> {/* comment */}
    content = content.replace(/\s*\/\*.*?\*\/\s*(?=\s*[>}])/g, '');
    
    // Remove comments at the end of lines in JSX
    // Pattern: text */} or text */}
    content = content.replace(/\s*\/\*.*?\*\/\s*(?=\s*[}])/g, '');
    
    // Remove comments that are breaking JSX syntax
    // Pattern: {/* comment */ followed by JSX content
    content = content.replace(/\s*\{\s*\/\*.*?\*\/\s*\}/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`⚠️  Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`🎉 Fixed ${fixedCount} files with JSX comment syntax errors!`);
