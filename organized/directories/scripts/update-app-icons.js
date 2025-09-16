const fs = require('fs');
const path = require('path');

// Android density directories
const densities = [
  'mipmap-mdpi',
  'mipmap-hdpi', 
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

// Source logo paths
const sourceLogos = {
  red: path.join(__dirname, '../assets/logos/Logo Red.png'),
  white: path.join(__dirname, '../assets/logos/Logo White.png'),
  redSvg: path.join(__dirname, '../assets/logos/Logo Red.svg'),
  whiteSvg: path.join(__dirname, '../assets/logos/LogoWhite.svg')
};

// Function to update app icons for a specific app
function updateAppIcons(appPath) {
  console.log(`\n🎨 Updating app icons for: ${appPath}`);
  
  const resPath = path.join(appPath, 'android/app/src/main/res');
  
  if (!fs.existsSync(resPath)) {
    console.log(`❌ Res directory not found: ${resPath}`);
    return;
  }
  
  // Update icons for each density
  densities.forEach(density => {
    const densityPath = path.join(resPath, density);
    
    if (!fs.existsSync(densityPath)) {
      console.log(`⚠️  Density directory not found: ${densityPath}`);
      return;
    }
    
    const icLauncherPath = path.join(densityPath, 'ic_launcher.png');
    const icLauncherRoundPath = path.join(densityPath, 'ic_launcher_round.png');
    
    try {
      // Copy the red logo as the main launcher icon
      if (fs.existsSync(sourceLogos.red)) {
        fs.copyFileSync(sourceLogos.red, icLauncherPath);
        fs.copyFileSync(sourceLogos.red, icLauncherRoundPath);
        console.log(`✅ Updated ${density} icons with official logo`);
      } else {
        console.log(`❌ Source logo not found: ${sourceLogos.red}`);
      }
    } catch (error) {
      console.log(`❌ Failed to update ${density} icons: ${error.message}`);
    }
  });
}

// Function to update web app logos
function updateWebAppLogos() {
  console.log('\n🌐 Updating web app logos...');
  
  // Update dashboard logos
  const dashboardImagesPath = path.join(__dirname, '../web-apps/dashboard/web_dashboard/client/public/images');
  if (fs.existsSync(dashboardImagesPath)) {
    try {
      // Copy logos to dashboard images directory
      fs.copyFileSync(sourceLogos.redSvg, path.join(dashboardImagesPath, 'LogoRed.svg'));
      fs.copyFileSync(sourceLogos.whiteSvg, path.join(dashboardImagesPath, 'LogoWhite.svg'));
      console.log('✅ Updated dashboard logos');
    } catch (error) {
      console.log(`❌ Failed to update dashboard logos: ${error.message}`);
    }
  }
  
  // Update website logos
  const websitePath = path.join(__dirname, '../web-apps/website/clutch-website');
  if (fs.existsSync(websitePath)) {
    try {
      // Copy logos to website directory
      fs.copyFileSync(sourceLogos.redSvg, path.join(websitePath, 'LogoRed.svg'));
      fs.copyFileSync(sourceLogos.whiteSvg, path.join(websitePath, 'LogoWhite.svg'));
      console.log('✅ Updated website logos');
    } catch (error) {
      console.log(`❌ Failed to update website logos: ${error.message}`);
    }
  }
}

// Main execution
console.log('🚀 Starting logo standardization...');

// Check if source logos exist
let logosExist = true;
Object.entries(sourceLogos).forEach(([name, path]) => {
  if (!fs.existsSync(path)) {
    console.log(`❌ Source logo not found: ${path}`);
    logosExist = false;
  }
});

if (!logosExist) {
  console.log('\n❌ Some source logos are missing. Please ensure all logos exist in assets/logos/');
  process.exit(1);
}

// Update mobile app icons
const apps = [
  path.join(__dirname, '../mobile-apps/clutch-app'),
  path.join(__dirname, '../mobile-apps/clutchpartners')
];

apps.forEach(appPath => {
  if (fs.existsSync(appPath)) {
    updateAppIcons(appPath);
  } else {
    console.log(`⚠️  App directory not found: ${appPath}`);
  }
});

// Update web app logos
updateWebAppLogos();

console.log('\n🎉 Logo standardization complete!');
console.log('\n📝 Summary:');
console.log('✅ Updated mobile app launcher icons');
console.log('✅ Updated web app logos');
console.log('✅ Standardized all logos to use assets/logos/');
console.log('\n📝 Next steps:');
console.log('1. Test the mobile apps to ensure icons display correctly');
console.log('2. Test the web apps to ensure logos display correctly');
console.log('3. Commit the changes to version control');
