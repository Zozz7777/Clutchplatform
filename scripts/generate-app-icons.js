const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Android density multipliers and sizes
const densities = {
  'mipmap-mdpi': 1,      // 48x48
  'mipmap-hdpi': 1.5,    // 72x72
  'mipmap-xhdpi': 2,     // 96x96
  'mipmap-xxhdpi': 3,    // 144x144
  'mipmap-xxxhdpi': 4    // 192x192
};

// Source logo path
const sourceLogo = path.join(__dirname, '../assets/logos/Logo Red.png');

// Function to generate icons for a specific app
function generateAppIcons(appPath) {
  console.log(`\n🎨 Generating app icons for: ${appPath}`);
  
  const resPath = path.join(appPath, 'android/app/src/main/res');
  
  if (!fs.existsSync(resPath)) {
    console.log(`❌ Res directory not found: ${resPath}`);
    return;
  }
  
  // Create icons for each density
  Object.entries(densities).forEach(([density, multiplier]) => {
    const size = Math.round(48 * multiplier);
    const densityPath = path.join(resPath, density);
    
    if (!fs.existsSync(densityPath)) {
      fs.mkdirSync(densityPath, { recursive: true });
    }
    
    const outputPath = path.join(densityPath, 'ic_launcher.png');
    const outputRoundPath = path.join(densityPath, 'ic_launcher_round.png');
    
    try {
      // Generate regular icon
      execSync(`magick convert "${sourceLogo}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`, { stdio: 'inherit' });
      
      // Generate round icon (same as regular for now, but could be modified for rounded corners)
      execSync(`magick convert "${sourceLogo}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputRoundPath}"`, { stdio: 'inherit' });
      
      console.log(`✅ Generated ${density} icons (${size}x${size})`);
    } catch (error) {
      console.log(`❌ Failed to generate ${density} icons: ${error.message}`);
      console.log(`💡 Make sure ImageMagick is installed: https://imagemagick.org/script/download.php`);
    }
  });
}

// Main execution
console.log('🚀 Starting app icon generation...');

// Check if source logo exists
if (!fs.existsSync(sourceLogo)) {
  console.log(`❌ Source logo not found: ${sourceLogo}`);
  process.exit(1);
}

// Generate icons for both apps
const apps = [
  path.join(__dirname, '../mobile-apps/clutch-app'),
  path.join(__dirname, '../mobile-apps/clutchpartners')
];

apps.forEach(appPath => {
  if (fs.existsSync(appPath)) {
    generateAppIcons(appPath);
  } else {
    console.log(`⚠️  App directory not found: ${appPath}`);
  }
});

console.log('\n🎉 App icon generation complete!');
console.log('\n📝 Next steps:');
console.log('1. Review the generated icons in each app\'s res/mipmap-* directories');
console.log('2. Test the apps to ensure icons display correctly');
console.log('3. Commit the changes to version control');
