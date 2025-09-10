const mongoose = require('../shims/mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect();
    console.log('✅ MongoDB connected successfully (shim)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize default permissions
const initializePermissions = async () => {
  console.log('🔑 Initializing default permissions...');
  
  try {
    const defaultPermissions = [
      // User Management
      {
        name: 'user_read',
        displayName: 'Read Users',
        description: 'View user information and profiles',
        category: 'user_management',
        actions: ['read_user'],
        resourceTypes: ['user'],
        level: 'read',
        metadata: { priority: 1, icon: 'users' }
      },
      {
        name: 'user_write',
        displayName: 'Manage Users',
        description: 'Create, update, and delete users',
        category: 'user_management',
        actions: ['create_user', 'update_user', 'delete_user'],
        resourceTypes: ['user'],
        level: 'write',
        metadata: { priority: 2, icon: 'user-plus' }
      },
      {
        name: 'user_admin',
        displayName: 'User Administration',
        description: 'Full user management including activation and password reset',
        category: 'user_management',
        actions: ['create_user', 'read_user', 'update_user', 'delete_user', 'activate_user', 'deactivate_user', 'reset_password'],
        resourceTypes: ['user'],
        level: 'admin',
        metadata: { priority: 3, icon: 'user-cog' }
      },
      
      // Role Management
      {
        name: 'role_read',
        displayName: 'Read Roles',
        description: 'View role information and permissions',
        category: 'role_management',
        actions: ['read_role'],
        resourceTypes: ['role'],
        level: 'read',
        metadata: { priority: 1, icon: 'shield' }
      },
      {
        name: 'role_write',
        displayName: 'Manage Roles',
        description: 'Create, update, and delete roles',
        category: 'role_management',
        actions: ['create_role', 'update_role', 'delete_role'],
        resourceTypes: ['role'],
        level: 'write',
        metadata: { priority: 2, icon: 'shield-plus' }
      },
      
      // Job Management
      {
        name: 'job_read',
        displayName: 'Read Jobs',
        description: 'View job information and status',
        category: 'job_management',
        actions: ['read_job'],
        resourceTypes: ['job'],
        level: 'read',
        metadata: { priority: 1, icon: 'briefcase' }
      },
      {
        name: 'job_write',
        displayName: 'Manage Jobs',
        description: 'Create, update, and manage jobs',
        category: 'job_management',
        actions: ['create_job', 'update_job', 'assign_job', 'cancel_job'],
        resourceTypes: ['job'],
        level: 'write',
        metadata: { priority: 2, icon: 'briefcase-plus' }
      },
      {
        name: 'job_admin',
        displayName: 'Job Administration',
        description: 'Full job management including completion and rating',
        category: 'job_management',
        actions: ['create_job', 'read_job', 'update_job', 'delete_job', 'assign_job', 'cancel_job', 'complete_job', 'rate_job'],
        resourceTypes: ['job'],
        level: 'admin',
        metadata: { priority: 3, icon: 'briefcase-check' }
      },
      
      // Payment Management
      {
        name: 'payment_read',
        displayName: 'Read Payments',
        description: 'View payment information and history',
        category: 'payment_management',
        actions: ['read_payment', 'view_payment_history'],
        resourceTypes: ['payment'],
        level: 'read',
        metadata: { priority: 1, icon: 'credit-card' }
      },
      {
        name: 'payment_write',
        displayName: 'Manage Payments',
        description: 'Process payments and manage transactions',
        category: 'payment_management',
        actions: ['create_payment', 'update_payment', 'process_payment', 'refund_payment'],
        resourceTypes: ['payment'],
        level: 'write',
        metadata: { priority: 2, icon: 'credit-card-plus' }
      },
      
      // Analytics
      {
        name: 'analytics_read',
        displayName: 'View Analytics',
        description: 'Access analytics and reporting data',
        category: 'analytics_management',
        actions: ['view_analytics'],
        resourceTypes: ['analytics'],
        level: 'read',
        metadata: { priority: 1, icon: 'chart-bar' }
      },
      {
        name: 'analytics_write',
        displayName: 'Manage Analytics',
        description: 'Create reports and manage analytics',
        category: 'analytics_management',
        actions: ['view_analytics', 'export_analytics', 'create_reports'],
        resourceTypes: ['analytics'],
        level: 'write',
        metadata: { priority: 2, icon: 'chart-line' }
      },
      
      // Finance Management
      {
        name: 'finance_read',
        displayName: 'View Finance',
        description: 'Access financial information and reports',
        category: 'finance_management',
        actions: ['view_finance', 'view_revenue'],
        resourceTypes: ['finance'],
        level: 'read',
        metadata: { priority: 1, icon: 'currency-dollar' }
      },
      {
        name: 'finance_write',
        displayName: 'Manage Finance',
        description: 'Manage invoices, payouts, and financial operations',
        category: 'finance_management',
        actions: ['manage_invoices', 'manage_payouts', 'manage_taxes'],
        resourceTypes: ['finance'],
        level: 'write',
        metadata: { priority: 2, icon: 'banknotes' }
      },
      
      // System Management
      {
        name: 'system_read',
        displayName: 'View System',
        description: 'Access system settings and information',
        category: 'system_management',
        actions: ['view_system_settings', 'view_logs'],
        resourceTypes: ['system'],
        level: 'read',
        metadata: { priority: 1, icon: 'cog' }
      },
      {
        name: 'system_write',
        displayName: 'Manage System',
        description: 'Update system settings and manage integrations',
        category: 'system_management',
        actions: ['update_system_settings', 'manage_integrations'],
        resourceTypes: ['system'],
        level: 'write',
        metadata: { priority: 2, icon: 'cog-6-tooth' }
      }
    ];

    for (const permissionData of defaultPermissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      if (!existingPermission) {
        await Permission.create(permissionData);
        console.log(`  ✅ Created permission: ${permissionData.displayName}`);
      } else {
        console.log(`  ℹ️  Permission already exists: ${permissionData.displayName}`);
      }
    }

    console.log('✅ Default permissions initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing permissions:', error);
    throw error;
  }
};

// Initialize default roles
const initializeRoles = async () => {
  console.log('👥 Initializing default roles...');
  
  try {
    // Get all permissions for role assignment
    const allPermissions = await Permission.find();
    
    const defaultRoles = [
      {
        name: 'superadmin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        level: 1,
        permissions: allPermissions.map(p => p._id),
        metadata: {
          color: '#DC2626',
          icon: 'shield-check',
          category: 'system'
        }
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administration with most permissions',
        level: 2,
        permissions: allPermissions.filter(p => !p.name.includes('system_')).map(p => p._id),
        metadata: {
          color: '#EA580C',
          icon: 'cog',
          category: 'system'
        }
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Business management with operational permissions',
        level: 3,
        permissions: allPermissions.filter(p => 
          ['user_read', 'user_write', 'job_read', 'job_write', 'payment_read', 'analytics_read', 'finance_read'].includes(p.name)
        ).map(p => p._id),
        metadata: {
          color: '#D97706',
          icon: 'briefcase',
          category: 'business'
        }
      },
      {
        name: 'analyst',
        displayName: 'Analyst',
        description: 'Data analysis and reporting',
        level: 4,
        permissions: allPermissions.filter(p => 
          ['analytics_read', 'analytics_write', 'finance_read'].includes(p.name)
        ).map(p => p._id),
        metadata: {
          color: '#059669',
          icon: 'chart-bar',
          category: 'business'
        }
      },
      {
        name: 'support',
        displayName: 'Support',
        description: 'Customer support and assistance',
        level: 5,
        permissions: allPermissions.filter(p => 
          ['user_read', 'job_read', 'payment_read'].includes(p.name)
        ).map(p => p._id),
        metadata: {
          color: '#2563EB',
          icon: 'life-ring',
          category: 'business'
        }
      },
      {
        name: 'mechanic',
        displayName: 'Mechanic',
        description: 'Service provider with job-related permissions',
        level: 6,
        permissions: allPermissions.filter(p => 
          ['job_read', 'job_write', 'payment_read'].includes(p.name)
        ).map(p => p._id),
        metadata: {
          color: '#059669',
          icon: 'wrench',
          category: 'user'
        }
      },
      {
        name: 'client',
        displayName: 'Client',
        description: 'Service consumer with basic permissions',
        level: 7,
        permissions: allPermissions.filter(p => 
          ['job_read', 'payment_read'].includes(p.name)
        ).map(p => p._id),
        metadata: {
          color: '#2563EB',
          icon: 'user',
          category: 'user'
        }
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`  ✅ Created role: ${roleData.displayName}`);
      } else {
        console.log(`  ℹ️  Role already exists: ${roleData.displayName}`);
      }
    }

    console.log('✅ Default roles initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing roles:', error);
    throw error;
  }
};

// Create superadmin user
const createSuperadmin = async () => {
  console.log('👑 Creating superadmin user...');
  
  try {
    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ 'role.name': 'superadmin' });
    if (existingSuperadmin) {
      console.log('  ℹ️  Superadmin user already exists');
      return existingSuperadmin;
    }

    // Get superadmin role
    const superadminRole = await Role.findOne({ name: 'superadmin' });
    if (!superadminRole) {
      throw new Error('Superadmin role not found');
    }

    // Create superadmin user
    const superadminData = {
      firebaseUid: 'superadmin-clutch-platform',
      email: 'admin@clutch.com',
      phoneNumber: '+1234567890',
      firstName: 'Super',
      lastName: 'Administrator',
      dateOfBirth: new Date('1990-01-01'),
      role: superadminRole._id,
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'United States'
      }
    };

    const superadmin = await User.create(superadminData);
    await superadmin.populate('role');

    console.log('  ✅ Superadmin user created successfully');
    console.log(`  📧 Email: ${superadmin.email}`);
    console.log(`  🔑 Firebase UID: ${superadmin.firebaseUid}`);
    
    return superadmin;
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    throw error;
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting Clutch Platform database initialization...\n');
    
    // Connect to database
    await connectDB();
    
    // Initialize permissions first
    await initializePermissions();
    console.log('');
    
    // Initialize roles
    await initializeRoles();
    console.log('');
    
    // Create superadmin user
    await createSuperadmin();
    console.log('');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Set up Firebase project and credentials');
    console.log('  2. Configure environment variables in .env file');
    console.log('  3. Start the server with: npm run dev');
    console.log('  4. Access API docs at: https://clutch-main-nk7x.onrender.com/api-docs');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
