#!/usr/bin/env node

/**
 * Remove Redundant Route Files Script
 * Removes duplicate and unused route files to optimize the backend
 */

const fs = require('fs').promises;
const path = require('path');

// Routes to remove (redundant/duplicate)
const ROUTES_TO_REMOVE = [
  // Analytics routes (consolidated into consolidated-analytics.js)
  'routes/analytics.js',
  'routes/analytics-backup.js',
  'routes/analytics-advanced.js',
  'routes/user-analytics.js',
  'routes/user-analytics-backup.js',
  'routes/revenue-analytics.js',
  
  // Auth routes (consolidated into consolidated-auth.js)
  'routes/auth-advanced.js',
  'routes/enhanced-auth.js',
  'routes/enterprise-auth.js',
  
  // Communication routes (consolidated)
  'routes/communication.js',
  'routes/communication-backup.js',
  
  // Dashboard routes (consolidated)
  'routes/dashboard-new.js',
  'routes/dashboard.js',
  
  // Health routes (consolidated)
  'routes/health-enhanced.js',
  'routes/health-enhanced-autonomous.js',
  
  // Auto-parts routes (consolidated)
  'routes/auto-parts-advanced.js',
  'routes/auto-parts-ai.js',
  
  // Enterprise routes (consolidated)
  'routes/enterprise-advanced.js',
  'routes/enterprise-features.js',
  
  // Mobile routes (consolidated)
  'routes/mobile-advanced.js',
  'routes/mobile-cms.js',
  
  // AI routes (consolidated)
  'routes/ai-advanced.js',
  'routes/ai-agent.js',
  'routes/ai-ml.js',
  'routes/ai-services.js',
  
  // Test/Experimental routes (remove)
  'routes/endpoint-tester.js',
  'routes/experimental.js',
  'routes/nextLevelFeatures.js',
  'routes/advancedFeatures.js',
  'routes/enhancedFeatures.js',
  'routes/service-centers-advanced.js',
  'routes/integration-advanced.js',
  'routes/security-compliance.js',
  
  // Redundant feature routes
  'routes/featureFlags.js',
  'routes/feature-flags.js',
  
  // Redundant vehicle routes
  'routes/cars.js',
  'routes/carParts.js',
  'routes/car-parts.js',
  'routes/car-health.js',
  
  // Redundant user routes
  'routes/employees.js',
  'routes/mechanics.js',
  'routes/clients.js',
  
  // Redundant booking routes
  'routes/service-bookings.js',
  
  // Redundant payment routes
  'routes/payment.js',
  'routes/payments.js',
  
  // Redundant communication routes
  'routes/chat.js',
  'routes/notifications.js',
  
  // Redundant analytics routes
  'routes/performance.js',
  'routes/monitoring.js',
  
  // Redundant system routes
  'routes/system.js',
  'routes/settings.js',
  
  // Redundant business routes
  'routes/business-intelligence.js',
  'routes/reports.js',
  
  // Redundant partner routes
  'routes/partners-mobile.js',
  
  // Redundant service routes
  'routes/services.js',
  'routes/service-centers.js',
  
  // Redundant inventory routes
  'routes/inventory.js',
  'routes/products.js',
  
  // Redundant order routes
  'routes/orders.js',
  'routes/parts.js',
  
  // Redundant customer routes
  'routes/customers.js',
  
  // Redundant vehicle routes
  'routes/vehicles.js',
  'routes/fleet.js',
  'routes/fleetVehicle.js',
  'routes/fleet-vehicle.js',
  
  // Redundant device routes
  'routes/gpsDevice.js',
  'routes/gps-device.js',
  'routes/obd2Device.js',
  'routes/obd2-device.js',
  'routes/deviceToken.js',
  'routes/device-token.js',
  
  // Redundant diagnostic routes
  'routes/diagnostics.js',
  'routes/obd.js',
  
  // Redundant financial routes
  'routes/finance.js',
  'routes/invoices.js',
  'routes/transactions.js',
  'routes/payouts.js',
  'routes/earnings.js',
  
  // Redundant business routes
  'routes/hr.js',
  'routes/jobs.js',
  'routes/projects.js',
  'routes/tasks.js',
  'routes/milestones.js',
  
  // Redundant support routes
  'routes/support.js',
  'routes/support-tickets.js',
  'routes/feedback.js',
  'routes/reviews.js',
  
  // Redundant marketing routes
  'routes/marketing.js',
  'routes/email-marketing.js',
  'routes/email-service.js',
  
  // Redundant legal routes
  'routes/legal.js',
  
  // Redundant location routes
  'routes/location.js',
  'routes/localization.js',
  
  // Redundant loyalty routes
  'routes/loyalty.js',
  'routes/discounts.js',
  'routes/disputes.js',
  
  // Redundant insurance routes
  'routes/insurance.js',
  'routes/roadsideAssistance.js',
  'routes/roadside-assistance.js',
  
  // Redundant maintenance routes
  'routes/maintenance.js',
  'routes/tradeIn.js',
  'routes/trade-in.js',
  
  // Redundant telematics routes
  'routes/telematicsData.js',
  'routes/telematics-data.js',
  
  // Redundant tracking routes
  'routes/tracking.js',
  
  // Redundant subscription routes
  'routes/subscriptions.js',
  
  // Redundant role routes
  'routes/role.js',
  'routes/permission.js',
  
  // Redundant session routes
  'routes/session.js',
  'routes/sessions.js',
  
  // Redundant MFA routes
  'routes/mfaSetup.js',
  'routes/mfa-setup.js',
  'routes/twoFactorAuth.js',
  'routes/two-factor-auth.js',
  
  // Redundant verification routes
  'routes/verification.js',
  
  // Redundant upload routes
  'routes/upload.js',
  
  // Redundant search routes
  'routes/search.js',
  
  // Redundant webhook routes
  'routes/webhooks.js',
  
  // Redundant corporate routes
  'routes/corporateAccount.js',
  'routes/corporate-account.js',
  
  // Redundant digital wallet routes
  'routes/digitalWallet.js',
  'routes/digital-wallet.js',
  
  // Redundant app configuration routes
  'routes/app-configuration.js',
  
  // Redundant audit log routes
  'routes/auditLog.js',
  'routes/audit-log.js',
  
  // Redundant autonomous routes
  'routes/autonomous-system.js',
  'routes/autonomous-dashboard.js',
  
  // Redundant B2B routes
  'routes/b2b.js',
  
  // Redundant clutch routes
  'routes/clutch-email.js',
  'routes/clutch-mobile.js',
  
  // Redundant communities routes
  'routes/communities.js',
  
  // Redundant CRM routes
  'routes/crm.js',
  
  // Redundant driver routes
  'routes/driver.js',
  'routes/drivers.js',
  
  // Redundant ecommerce routes
  'routes/ecommerce.js',
  
  // Redundant feedback system routes
  'routes/feedback-system.js',
  
  // Redundant fleet routes
  'routes/fleet.js',
  'routes/fleetVehicle.js',
  'routes/fleet-vehicle.js',
  
  // Redundant learning system routes
  'routes/learning-system.js',
  
  // Redundant market routes
  'routes/market.js',
  
  // Redundant media management routes
  'routes/media-management.js',
  
  // Redundant mobile routes
  'routes/mobile.js',
  
  // Redundant operations routes
  'routes/operations.js',
  
  // Redundant partners routes
  'routes/partners.js',
  
  // Redundant sales routes
  'routes/sales.js',
  
  // Redundant security routes
  'routes/security.js',
  
  // Redundant suppliers routes
  'routes/suppliers.js'
];

// Routes to keep (essential)
const ROUTES_TO_KEEP = [
  'routes/auth.js',                    // Keep original for backward compatibility
  'routes/health.js',                  // Keep for health checks
  'routes/admin.js',                   // Keep for admin functionality
  'routes/users.js',                   // Keep for user management
  'routes/other.js',                   // Keep for miscellaneous
  'routes/errors.js',                  // Keep for error handling
  'routes/consolidated-analytics.js',  // New consolidated analytics
  'routes/consolidated-auth.js',       // New consolidated auth
  'routes/email-service.js'            // Keep for email functionality
];

async function removeRedundantRoutes() {
  console.log('🗑️  Starting removal of redundant route files...');
  
  let removedCount = 0;
  let errorCount = 0;
  
  for (const routeFile of ROUTES_TO_REMOVE) {
    try {
      const fullPath = path.join(__dirname, '..', routeFile);
      
      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch (error) {
        console.log(`⚠️  File not found: ${routeFile}`);
        continue;
      }
      
      // Remove the file
      await fs.unlink(fullPath);
      console.log(`✅ Removed: ${routeFile}`);
      removedCount++;
      
    } catch (error) {
      console.error(`❌ Error removing ${routeFile}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Route Cleanup Summary:');
  console.log(`✅ Files removed: ${removedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Files kept: ${ROUTES_TO_KEEP.length}`);
  console.log(`💾 Space saved: Estimated ${removedCount * 5}KB`);
  
  // Update server.js to use consolidated routes
  await updateServerRoutes();
  
  console.log('\n🎉 Route consolidation completed successfully!');
}

async function updateServerRoutes() {
  console.log('\n🔧 Updating server.js to use consolidated routes...');
  
  try {
    const serverPath = path.join(__dirname, '..', 'server.js');
    let serverContent = await fs.readFile(serverPath, 'utf8');
    
    // Replace old route imports with consolidated ones
    const replacements = [
      {
        from: /const analyticsRoutes = require\('\.\/routes\/analytics'\);/g,
        to: 'const analyticsRoutes = require(\'./routes/consolidated-analytics\');'
      },
      {
        from: /const authRoutes = require\('\.\/routes\/auth'\);/g,
        to: 'const authRoutes = require(\'./routes/consolidated-auth\');'
      }
    ];
    
    for (const replacement of replacements) {
      serverContent = serverContent.replace(replacement.from, replacement.to);
    }
    
    // Write updated server.js
    await fs.writeFile(serverPath, serverContent);
    console.log('✅ Updated server.js with consolidated routes');
    
  } catch (error) {
    console.error('❌ Error updating server.js:', error.message);
  }
}

// Run the cleanup
if (require.main === module) {
  removeRedundantRoutes().catch(console.error);
}

module.exports = { removeRedundantRoutes, ROUTES_TO_REMOVE, ROUTES_TO_KEEP };
