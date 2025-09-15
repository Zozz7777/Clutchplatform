#!/usr/bin/env node

/**
 * Endpoint Collection Audit Script
 * Checks which collections endpoints are trying to use vs what actually exists
 */

const { MongoClient } = require('mongodb');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Collections that endpoints are trying to use
const ENDPOINT_COLLECTIONS = [
  'users', 'employees', 'sessions', 'analytics', 'bookings', 'transactions',
  'assets', 'audit_logs', 'auto_parts_inventory', 'mechanics', 'vehicles',
  'cms_content', 'white_label_configs', 'api_keys', 'feature_flags',
  'contracts', 'marketing_campaigns', 'projects', 'chat_rooms', 'chat_messages',
  'system_metrics', 'performance_metrics', 'system_alerts', 'vendors'
];

// Collections that actually exist (from our previous check)
const EXISTING_COLLECTIONS = [
  'users', 'employees', 'email_accounts', 'user_vehicles', 'user_sessions',
  'user_roles', 'user_interactions', 'corporateaccounts', 'user_vehicle_parts',
  'user_theme_preferences', 'corporate_accounts', 'user_analytics', 'apikeys',
  'sales_analytics', 'routes', 'system_settings', 'service_centers', 'permissions',
  'operations_approvals', 'chatmessages', 'theme_assets', 'obd_error_codes',
  'clients', 'email_folders', 'quotes', 'cities', 'supporttickets', 'campaigns',
  'data_retention_policies', 'gdpr_requests', 'language_localization', 'reports',
  'mltrainingdatas', 'support_categories', 'email_messages', 'transactions',
  'theme_templates', 'jobpostings', 'sales', 'tasks', 'mlmodels', 'maintenances',
  'templates', 'geofence_events', 'location_tracking', 'email_signatures',
  'files', 'system_alerts', 'partners', 'pricing_tiers', 'fleetvehicles',
  'finance', 'departments', 'color_palettes', 'theme_previews', 'parts_orders',
  'marketing', 'payments', 'support', 'campaign_performance', 'vehicle_diagnostics',
  'mfa_setups', 'installment_providers', 'lead_sources', 'bookings',
  'email_engagement', 'devicetokens', 'cars', 'api_keys', 'system_metrics',
  'sales_pipeline', 'theme_feedback', 'auditlogs', 'conversion_funnels',
  'service_areas', 'carparts', 'operations_metrics', 'dashboard', 'partsshops',
  'telematicsdatas', 'theme_custom_colors', 'email_automations', 'service_categories',
  'ai_recommendations', 'partsorders', 'services', 'cost_reports', 'analytics',
  'customers', 'public_custom_colors', 'car_models', 'subscriptions',
  'satisfaction_ratings', 'parts_shops', 'lead_activities', 'email_analytics',
  'service_bookings', 'invoices', 'notifications', 'leads', 'support_tickets',
  'verification', 'products', 'payouts', 'report_templates', 'insurance',
  'design_system', 'drivers', 'email_attachments', 'financial_reports',
  'obd2_devices', 'emails', 'search_history', 'trade_ins', 'contracts',
  'projects', 'ml_training_data', 'device_tokens', 'mechanics', 'vehicles',
  'audit_logs', 'roles_permissions', 'uploads', 'gps_devices', 'theme_analytics',
  'cache_intelligence', 'audits', 'communities', 'mobile_versions',
  'roadside_assistance', 'analytics_events', 'email_segments', 'settings',
  'mfasetups', 'security_config', 'messages', 'activities', 'obd_categories',
  'custom_reports', 'operations', 'ml_models', 'mobile_configs',
  'securityauditlogs', 'fleets', 'candidates', 'performance_test', 'chat',
  'diagnostics', 'topics', 'email_sessions', 'car_parts', 'promotions',
  'error_logs', 'tracking', 'data_privacy', 'mlpredictions', 'payment_methods',
  'errorlogs', 'orders', 'feature_flags', 'disputes', 'notification_templates',
  'service_analytics', 'earnings', 'fleet_vehicles', 'sales_deals',
  'analytics_sessions', 'query_optimizations', 'jobs', 'encryption_metadata',
  'chat_messages', 'performance_metrics', 'search_analytics', 'reviews',
  'ml_predictions', 'sales_leads', 'geofences', 'business_categories',
  'email_filters', 'areas', 'support_comments', 'mobile_optimization',
  'sessions', 'email_labels', 'milestones', 'roles', 'service_types',
  'telematics_data', 'maintenance', 'ai_predictions', 'email_campaigns',
  'car_brands', 'admin_actions', 'ai_models', 'ui_updates', 'app_analytics',
  'approvals', 'carmakemodels', 'email_activity_logs', 'chatrooms',
  'marketing_analytics', 'email_contacts', 'discounts', 'security_audit_logs',
  'email_subscribers', 'car_makes_models', 'predictive_models',
  'support_priorities', 'chat_rooms'
];

async function auditEndpointCollections() {
  let client;
  
  try {
    console.log('🔍 Auditing endpoint collections...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Get actual collections from database
    const actualCollections = await db.listCollections().toArray();
    const actualCollectionNames = actualCollections.map(c => c.name);
    
    console.log(`\n📊 Collection Analysis:`);
    console.log(`   • Endpoints trying to use: ${ENDPOINT_COLLECTIONS.length} collections`);
    console.log(`   • Collections that actually exist: ${actualCollectionNames.length} collections`);
    
    // Check which endpoint collections exist
    console.log('\n✅ Collections that endpoints use and exist:');
    const existingEndpointCollections = [];
    const missingEndpointCollections = [];
    
    ENDPOINT_COLLECTIONS.forEach(collectionName => {
      if (actualCollectionNames.includes(collectionName)) {
        existingEndpointCollections.push(collectionName);
        console.log(`   • ${collectionName} ✅`);
      } else {
        missingEndpointCollections.push(collectionName);
        console.log(`   • ${collectionName} ❌ MISSING`);
      }
    });
    
    // Suggest alternatives for missing collections
    console.log('\n🔧 Suggested fixes for missing collections:');
    missingEndpointCollections.forEach(missing => {
      const suggestions = actualCollectionNames.filter(name => 
        name.toLowerCase().includes(missing.toLowerCase().split('_')[0]) ||
        missing.toLowerCase().includes(name.toLowerCase().split('_')[0])
      );
      
      if (suggestions.length > 0) {
        console.log(`   • ${missing} → Try: ${suggestions.join(', ')}`);
      } else {
        console.log(`   • ${missing} → No similar collections found`);
      }
    });
    
    // Check for collections that exist but endpoints don't use
    console.log('\n📋 Collections that exist but endpoints don\'t use:');
    const unusedCollections = actualCollectionNames.filter(name => 
      !ENDPOINT_COLLECTIONS.includes(name) && 
      !name.startsWith('system.') && 
      !name.startsWith('temp_')
    );
    
    unusedCollections.slice(0, 20).forEach(collection => {
      console.log(`   • ${collection}`);
    });
    
    if (unusedCollections.length > 20) {
      console.log(`   ... and ${unusedCollections.length - 20} more`);
    }
    
    console.log('\n📈 Summary:');
    console.log(`   • ✅ Working collections: ${existingEndpointCollections.length}`);
    console.log(`   • ❌ Missing collections: ${missingEndpointCollections.length}`);
    console.log(`   • 📋 Unused collections: ${unusedCollections.length}`);
    
  } catch (error) {
    console.error('❌ Error auditing collections:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  auditEndpointCollections();
}

module.exports = { auditEndpointCollections };
