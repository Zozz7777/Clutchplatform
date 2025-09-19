#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/JavaScript files in src directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix styling issues in a file
function fixStylingIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix rounded-lg to rounded-[0.625rem]
    if (content.includes('rounded-lg')) {
      content = content.replace(/rounded-lg/g, 'rounded-[0.625rem]');
      modified = true;
    }
    
    // Fix shadow-sm to shadow-2xs
    if (content.includes('shadow-sm')) {
      content = content.replace(/shadow-sm/g, 'shadow-2xs');
      modified = true;
    }
    
    // Fix shadow-md to shadow-sm
    if (content.includes('shadow-md')) {
      content = content.replace(/shadow-md/g, 'shadow-sm');
      modified = true;
    }
    
    // Fix duration-200 to duration-normal
    if (content.includes('duration-200')) {
      content = content.replace(/duration-200/g, 'duration-normal');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed styling issues in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Fix hardcoded colors in a file
function fixHardcodedColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Common color mappings
    const colorMappings = {
      // Green colors
      'text-green-600': 'text-success',
      'text-green-500': 'text-success',
      'text-green-700': 'text-success',
      'bg-green-100': 'bg-success/10',
      'bg-green-50': 'bg-success/10',
      'bg-green-500': 'bg-success',
      'border-green-600': 'border-success',
      
      // Red colors
      'text-red-600': 'text-destructive',
      'text-red-500': 'text-destructive',
      'text-red-700': 'text-destructive',
      'bg-red-100': 'bg-destructive/10',
      'bg-red-50': 'bg-destructive/10',
      'bg-red-500': 'bg-destructive',
      'border-red-600': 'border-destructive',
      
      // Blue colors
      'text-blue-600': 'text-primary',
      'text-blue-500': 'text-primary',
      'text-blue-700': 'text-primary',
      'bg-blue-100': 'bg-primary/10',
      'bg-blue-50': 'bg-primary/10',
      'bg-blue-500': 'bg-primary',
      'border-blue-600': 'border-primary',
      
      // Yellow colors
      'text-yellow-600': 'text-warning',
      'text-yellow-500': 'text-warning',
      'text-yellow-700': 'text-warning',
      'bg-yellow-100': 'bg-warning/10',
      'bg-yellow-50': 'bg-warning/10',
      'bg-yellow-500': 'bg-warning',
      'border-yellow-600': 'border-warning',
      
      // Gray colors
      'text-gray-600': 'text-muted-foreground',
      'text-gray-500': 'text-muted-foreground',
      'text-gray-700': 'text-foreground',
      'text-gray-900': 'text-foreground',
      'bg-gray-100': 'bg-muted',
      'bg-gray-50': 'bg-muted/50',
      'bg-gray-200': 'bg-muted',
      'border-gray-600': 'border-border',
      
      // Orange colors
      'text-orange-600': 'text-warning',
      'text-orange-500': 'text-warning',
      'bg-orange-100': 'bg-warning/10',
      'bg-orange-50': 'bg-warning/10',
      
      // Purple colors
      'text-purple-600': 'text-primary',
      'text-purple-500': 'text-primary',
      'bg-purple-100': 'bg-primary/10',
      'bg-purple-50': 'bg-primary/10',
    };
    
    // Apply color mappings
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      if (content.includes(oldColor)) {
        content = content.replace(new RegExp(oldColor, 'g'), newColor);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed hardcoded colors in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing colors in ${filePath}:`, error.message);
    return false;
  }
}

// Remove console.log statements (except in logger.ts)
function removeConsoleLogs(filePath) {
  try {
    // Skip logger files
    if (filePath.includes('logger.ts') || filePath.includes('logger.js')) {
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log statements
    if (content.includes('console.log')) {
      // Remove single line console.log statements
      content = content.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
      // Remove multi-line console.log statements
      content = content.replace(/^\s*console\.log\([\s\S]*?\);\s*$/gm, '');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Removed console.log statements from: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error removing console.logs from ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🚀 Starting comprehensive styling and console.log fixes...');
  
  const srcDir = path.join(__dirname, 'src');
  const files = getAllFiles(srcDir);
  
  let stylingFixed = 0;
  let colorsFixed = 0;
  let consoleLogsRemoved = 0;
  
  files.forEach(file => {
    if (fixStylingIssues(file)) stylingFixed++;
    if (fixHardcodedColors(file)) colorsFixed++;
    if (removeConsoleLogs(file)) consoleLogsRemoved++;
  });
  
  console.log('\n📊 Fix Summary:');
  console.log(`✅ Styling issues fixed: ${stylingFixed} files`);
  console.log(`✅ Hardcoded colors fixed: ${colorsFixed} files`);
  console.log(`✅ Console.log statements removed: ${consoleLogsRemoved} files`);
  console.log(`📁 Total files processed: ${files.length}`);
  
  console.log('\n🎯 Running build test...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixStylingIssues, fixHardcodedColors, removeConsoleLogs };
