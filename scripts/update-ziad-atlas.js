const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './shared-backend/.env' });

async function updateZiadRoles() {
  try {
    console.log('🔧 Updating ziad@YourClutch.com roles in MongoDB Atlas...');
    
    // Connect to MongoDB Atlas
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not found');
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const employeesCollection = db.collection('employees');
    
    // Check if employee exists with correct email format
    const employee = await employeesCollection.findOne({ email: 'ziad@YourClutch.com' });
    if (!employee) {
      console.log('❌ Employee ziad@YourClutch.com not found in database');
      return;
    }
    
    console.log('✅ Employee found:', employee.email);
    console.log('📋 Current role:', employee.role);
    console.log('📋 Current websitePermissions:', employee.websitePermissions);
    
    // Update employee with all roles and permissions
    const allRoles = [
      'admin', 'manager', 'employee', 'viewer', 'hr_manager', 'fleet_manager', 
      'enterprise_manager', 'sales_manager', 'analytics', 'management', 'cto', 
      'operations', 'sales_rep', 'analyst', 'super_admin', 'finance_manager', 
      'marketing_manager', 'legal_manager', 'legal', 'compliance', 'partner_manager', 'hr', 'fleet_admin', 
      'driver', 'accountant'
    ];
    
    const allPermissions = [
      'dashboard:read', 'dashboard:write', 'users:read', 'users:write', 'users:delete',
      'mechanics:read', 'mechanics:write', 'mechanics:delete', 'bookings:read', 
      'bookings:write', 'bookings:delete', 'analytics:read', 'analytics:write', 
      'finance:read', 'finance:write', 'marketing:read', 'marketing:write', 
      'employees:read', 'employees:write', 'employees:delete', 'settings:read', 
      'settings:write', 'reports:read', 'reports:write', 'fleet:read', 'fleet:write',
      'fleet:delete', 'hr:read', 'hr:write', 'hr:delete', 'enterprise:read', 
      'enterprise:write', 'enterprise:delete', 'crm:read', 'crm:write', 'crm:delete',
      'projects:read', 'projects:write', 'projects:delete', 'partners:read', 
      'partners:write', 'partners:delete', 'legal:read', 'legal:write', 'legal:delete',
      'system:read', 'system:write', 'system:delete', 'security:read', 'security:write',
      'security:delete', 'communication:read', 'communication:write', 'communication:delete'
    ];
    
    const result = await employeesCollection.updateOne(
      { email: 'ziad@YourClutch.com' },
      { 
        $set: { 
          roles: allRoles,
          role: 'admin', // Keep the primary role as admin for backward compatibility
          websitePermissions: allPermissions
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Employee roles updated successfully!');
      console.log('🎉 Employee now has access to all features!');
      console.log('📋 Updated roles:', allRoles);
      console.log('📋 Updated permissions:', allPermissions);
    } else {
      console.log('❌ Failed to update employee roles');
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error updating employee roles:', error);
  }
}

updateZiadRoles();
