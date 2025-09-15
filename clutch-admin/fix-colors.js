const fs = require('fs');
const path = require('path');

// Color mapping from hardcoded colors to design system colors
const colorMappings = {
  // Status colors
  'bg-green-100 text-green-800': 'bg-primary/10 text-primary-foreground',
  'bg-red-100 text-red-800': 'bg-destructive/10 text-destructive-foreground',
  'bg-yellow-100 text-yellow-800': 'bg-secondary/10 text-secondary-foreground',
  'bg-blue-100 text-blue-800': 'bg-secondary/10 text-secondary-foreground',
  'bg-gray-100 text-gray-800': 'bg-muted text-muted-foreground',
  'bg-orange-100 text-orange-800': 'bg-secondary/10 text-secondary-foreground',
  'bg-purple-100 text-purple-800': 'bg-primary/10 text-primary-foreground',
  'bg-pink-100 text-pink-800': 'bg-primary/10 text-primary-foreground',
  'bg-indigo-100 text-indigo-800': 'bg-secondary/10 text-secondary-foreground',
  
  // Single color backgrounds
  'bg-green-500': 'bg-primary',
  'bg-red-500': 'bg-destructive',
  'bg-yellow-500': 'bg-secondary',
  'bg-blue-500': 'bg-primary',
  'bg-gray-500': 'bg-muted',
  'bg-orange-500': 'bg-secondary',
  'bg-purple-500': 'bg-primary',
  'bg-pink-500': 'bg-primary',
  'bg-indigo-500': 'bg-secondary',
  
  // Alert backgrounds
  'bg-red-50 border border-red-200': 'bg-destructive/10 border border-destructive/20',
  'bg-yellow-50 border border-yellow-200': 'bg-secondary/10 border border-secondary/20',
  'bg-blue-50 border border-blue-200': 'bg-primary/10 border border-primary/20',
  'bg-green-50 border border-green-200': 'bg-primary/10 border border-primary/20',
  'bg-orange-50 border border-orange-200': 'bg-secondary/10 border border-secondary/20',
  'bg-purple-50 border border-purple-200': 'bg-primary/10 border border-primary/20',
  'bg-pink-50 border border-pink-200': 'bg-primary/10 border border-primary/20',
  'bg-indigo-50 border border-indigo-200': 'bg-secondary/10 border border-secondary/20',
  
  // Alert text colors
  'text-red-600': 'text-destructive',
  'text-yellow-600': 'text-secondary',
  'text-blue-600': 'text-primary',
  'text-green-600': 'text-primary',
  'text-orange-600': 'text-secondary',
  'text-purple-600': 'text-primary',
  'text-pink-600': 'text-primary',
  'text-indigo-600': 'text-secondary',
  
  'text-red-900': 'text-destructive-foreground',
  'text-yellow-900': 'text-secondary-foreground',
  'text-blue-900': 'text-primary-foreground',
  'text-green-900': 'text-primary-foreground',
  'text-orange-900': 'text-secondary-foreground',
  'text-purple-900': 'text-primary-foreground',
  'text-pink-900': 'text-primary-foreground',
  'text-indigo-900': 'text-secondary-foreground',
  
  'text-red-700': 'text-destructive-foreground/80',
  'text-yellow-700': 'text-secondary-foreground/80',
  'text-blue-700': 'text-primary-foreground/80',
  'text-green-700': 'text-primary-foreground/80',
  'text-orange-700': 'text-secondary-foreground/80',
  'text-purple-700': 'text-primary-foreground/80',
  'text-pink-700': 'text-primary-foreground/80',
  'text-indigo-700': 'text-secondary-foreground/80',
};

// Files to process
const filesToProcess = [
  'src/app/(dashboard)/finance/page.tsx',
  'src/app/(dashboard)/chat/page.tsx',
  'src/app/(dashboard)/ai-ml/page.tsx',
  'src/app/(dashboard)/mobile-apps/page.tsx',
  'src/app/(dashboard)/communication/page.tsx',
  'src/app/(dashboard)/api-docs/page.tsx',
  'src/app/(dashboard)/integrations/page.tsx',
  'src/app/(dashboard)/reports/page.tsx',
  'src/app/(dashboard)/system-health/page.tsx',
  'src/app/(dashboard)/assets/page.tsx',
  'src/app/(dashboard)/vendors/page.tsx',
  'src/app/(dashboard)/audit-trail/page.tsx',
  'src/app/(dashboard)/feature-flags/page.tsx',
  'src/app/(dashboard)/projects/page.tsx',
  'src/app/(dashboard)/api-performance/page.tsx',
];

function fixColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply color mappings
    for (const [oldColor, newColor] of Object.entries(colorMappings)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldColor)) {
        content = content.replace(regex, newColor);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed colors in ${filePath}`);
    } else {
      console.log(`ℹ️  No hardcoded colors found in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🎨 Starting color fix process...\n');

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixColorsInFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 Color fix process completed!');
