// Debug script to test logo path resolution
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Logo Path Resolution...\n');

// Test different logo paths
const logoPaths = [
    'assets/logo.svg',
    './assets/logo.svg',
    '../assets/logo.svg',
    path.join(__dirname, 'assets', 'logo.svg'),
    path.join(__dirname, 'src', 'renderer', 'assets', 'logo.svg')
];

console.log('1. Testing logo file existence:');
logoPaths.forEach(logoPath => {
    const fullPath = path.resolve(__dirname, logoPath);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${logoPath} -> ${fullPath}`);
    if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`      Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
    }
});

// Test in packaged app structure
console.log('\n2. Testing packaged app structure:');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    const buildDirs = fs.readdirSync(distPath).filter(item => 
        fs.statSync(path.join(distPath, item)).isDirectory() && 
        item.includes('Clutch Auto Parts System')
    );
    
    if (buildDirs.length > 0) {
        const latestBuild = buildDirs[buildDirs.length - 1];
        const packagedLogoPath = path.join(distPath, latestBuild, 'resources', 'app', 'assets', 'logo.svg');
        const packagedExists = fs.existsSync(packagedLogoPath);
        console.log(`   ${packagedExists ? '✅' : '❌'} Packaged logo: ${packagedLogoPath}`);
        
        if (packagedExists) {
            const stats = fs.statSync(packagedLogoPath);
            console.log(`      Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
        }
    }
}

// Test HTML content
console.log('\n3. Checking HTML logo references:');
const htmlPath = path.join(__dirname, 'src', 'renderer', 'index.html');
if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const logoMatches = htmlContent.match(/src="[^"]*logo[^"]*"/g);
    if (logoMatches) {
        logoMatches.forEach(match => {
            console.log(`   📄 HTML reference: ${match}`);
        });
    } else {
        console.log('   ❌ No logo references found in HTML');
    }
}

console.log('\n🎯 Logo Debug Complete!');
