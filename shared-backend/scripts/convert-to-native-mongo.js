const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
    './routes',
    './services',
    './middleware'
];

// Files to skip (already converted or don't need conversion)
const skipFiles = [
    'databaseUtils.js',
    'userService.js',
    'paymentService.js',
    'bookingService.js'
];

// Conversion mappings
const modelToServiceMap = {
    'User': 'userService',
    'Payment': 'paymentService',
    'Booking': 'bookingService',
    'Vehicle': 'databaseUtils',
    'ServiceCenter': 'databaseUtils',
    'Mechanic': 'databaseUtils',
    'Client': 'databaseUtils',
    'Employee': 'databaseUtils',
    'AuditLog': 'databaseUtils',
    'Session': 'databaseUtils',
    'Role': 'databaseUtils',
    'Subscription': 'databaseUtils',
    'PaymentPlan': 'databaseUtils',
    'Fleet': 'databaseUtils',
    'FleetVehicle': 'databaseUtils',
    'CorporateAccount': 'databaseUtils'
};

// Import patterns to replace
const importPatterns = [
    {
        pattern: /const\s+{\s*User\s*}\s*=\s*require\(['"]\.\.\/models\/user['"]\);/g,
        replacement: 'const userService = require(\'../services/userService\');'
    },
    {
        pattern: /const\s+User\s*=\s*require\(['"]\.\.\/models\/User['"]\);/g,
        replacement: 'const userService = require(\'../services/userService\');'
    },
    {
        pattern: /const\s+{\s*Payment\s*}\s*=\s*require\(['"]\.\.\/models\/payment['"]\);/g,
        replacement: 'const paymentService = require(\'../services/paymentService\');'
    },
    {
        pattern: /const\s+Payment\s*=\s*require\(['"]\.\.\/models\/Payment['"]\);/g,
        replacement: 'const paymentService = require(\'../services/paymentService\');'
    },
    {
        pattern: /const\s+{\s*Booking\s*}\s*=\s*require\(['"]\.\.\/models\/booking['"]\);/g,
        replacement: 'const bookingService = require(\'../services/bookingService\');'
    },
    {
        pattern: /const\s+Booking\s*=\s*require\(['"]\.\.\/models\/Booking['"]\);/g,
        replacement: 'const bookingService = require(\'../services/bookingService\');'
    }
];

// Function to process a single file
function processFile(filePath) {
    try {
        console.log(`Processing: ${filePath}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Apply import pattern replacements
        importPatterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                modified = true;
            }
        });
        
        // Add databaseUtils import if not present
        if (!content.includes('databaseUtils') && !content.includes('userService') && !content.includes('paymentService') && !content.includes('bookingService')) {
            // Skip files that don't need database operations
            return false;
        }
        
        if (!content.includes('const databaseUtils = require') && (content.includes('databaseUtils') || content.includes('userService') || content.includes('paymentService') || content.includes('bookingService'))) {
            const importIndex = content.indexOf('const express = require');
            if (importIndex !== -1) {
                const insertIndex = content.indexOf('\n', importIndex) + 1;
                content = content.slice(0, insertIndex) + 'const databaseUtils = require(\'../utils/databaseUtils\');\n' + content.slice(insertIndex);
                modified = true;
            }
        }
        
        // Replace Mongoose operations with native MongoDB operations
        content = content.replace(/User\.findById\(/g, 'userService.getUserById(');
        content = content.replace(/User\.findOne\(/g, 'userService.findUser(');
        content = content.replace(/User\.find\(/g, 'userService.findUsers(');
        content = content.replace(/User\.create\(/g, 'userService.createUser(');
        content = content.replace(/User\.findByIdAndUpdate\(/g, 'userService.updateUser(');
        content = content.replace(/User\.findByIdAndDelete\(/g, 'userService.deleteUser(');
        content = content.replace(/User\.countDocuments\(/g, 'userService.countUsers(');
        
        content = content.replace(/Payment\.findById\(/g, 'paymentService.getPaymentById(');
        content = content.replace(/Payment\.findOne\(/g, 'paymentService.findPayment(');
        content = content.replace(/Payment\.find\(/g, 'paymentService.findPayments(');
        content = content.replace(/Payment\.create\(/g, 'paymentService.createPayment(');
        content = content.replace(/Payment\.findByIdAndUpdate\(/g, 'paymentService.updatePayment(');
        content = content.replace(/Payment\.findByIdAndDelete\(/g, 'paymentService.deletePayment(');
        content = content.replace(/Payment\.countDocuments\(/g, 'paymentService.countPayments(');
        
        content = content.replace(/Booking\.findById\(/g, 'bookingService.getBookingById(');
        content = content.replace(/Booking\.findOne\(/g, 'bookingService.findBooking(');
        content = content.replace(/Booking\.find\(/g, 'bookingService.findBookings(');
        content = content.replace(/Booking\.create\(/g, 'bookingService.createBooking(');
        content = content.replace(/Booking\.findByIdAndUpdate\(/g, 'bookingService.updateBooking(');
        content = content.replace(/Booking\.findByIdAndDelete\(/g, 'bookingService.deleteBooking(');
        content = content.replace(/Booking\.countDocuments\(/g, 'bookingService.countBookings(');
        
        // Replace other model operations with databaseUtils
        Object.keys(modelToServiceMap).forEach(modelName => {
            if (modelToServiceMap[modelName] === 'databaseUtils') {
                const collectionName = modelName.toLowerCase() + 's';
                content = content.replace(new RegExp(`${modelName}\\.findById\\(`, 'g'), `databaseUtils.findById('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.findOne\\(`, 'g'), `databaseUtils.findOne('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.find\\(`, 'g'), `databaseUtils.find('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.create\\(`, 'g'), `databaseUtils.create('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.findByIdAndUpdate\\(`, 'g'), `databaseUtils.updateOne('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.findByIdAndDelete\\(`, 'g'), `databaseUtils.deleteOne('${collectionName}', `);
                content = content.replace(new RegExp(`${modelName}\\.countDocuments\\(`, 'g'), `databaseUtils.countDocuments('${collectionName}', `);
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to recursively process directories
function processDirectory(dirPath) {
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (stat.isFile() && item.endsWith('.js') && !skipFiles.includes(item)) {
                processFile(fullPath);
            }
        });
    } catch (error) {
        console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    }
}

// Main execution
console.log('🚀 Starting Mongoose to Native MongoDB conversion...\n');

let totalProcessed = 0;
let totalModified = 0;

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`📁 Processing directory: ${dir}`);
        processDirectory(dir);
    } else {
        console.log(`⚠️  Directory not found: ${dir}`);
    }
});

console.log('\n✅ Conversion completed!');
console.log(`📊 Total files processed: ${totalProcessed}`);
console.log(`📝 Total files modified: ${totalModified}`);
