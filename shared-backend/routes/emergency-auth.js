/**
 * Emergency Authentication Routes
 * Simple, reliable authentication that works even when database is down
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Emergency admin credentials
const EMERGENCY_USERS = [
  {
    id: 'emergency-admin-001',
    email: 'ziad@yourclutch.com',
    password: '4955698*Z*z',
    name: 'Ziad - CEO',
    role: 'super_admin',
    permissions: [
      'all',
      'admin',
      'super_admin',
      'ceo',
      'user_management',
      'system_management',
      'database_management',
      'api_management',
      'security_management',
      'analytics_management',
      'fleet_management',
      'hr_management',
      'finance_management',
      'customer_management',
      'booking_management',
      'payment_management',
      'notification_management',
      'audit_management',
      'feature_flag_management',
      'ai_management',
      'websocket_management',
      'email_management',
      'file_management',
      'report_management',
      'dashboard_management',
      'settings_management',
      'backup_management',
      'monitoring_management',
      'performance_management',
      'log_management',
      'error_management',
      'health_management',
      'deployment_management',
      'configuration_management',
      'integration_management',
      'automation_management',
      'compliance_management',
      'risk_management',
      'vendor_management',
      'asset_management',
      'project_management',
      'communication_management',
      'document_management',
      'workflow_management',
      'approval_management',
      'escalation_management',
      'incident_management',
      'maintenance_management',
      'upgrade_management',
      'migration_management',
      'testing_management',
      'quality_management',
      'training_management',
      'support_management',
      'sales_management',
      'marketing_management',
      'content_management',
      'media_management',
      'social_management',
      'mobile_management',
      'web_management',
      'api_documentation',
      'developer_tools',
      'debugging_tools',
      'profiling_tools',
      'monitoring_tools',
      'alerting_tools',
      'reporting_tools',
      'analytics_tools',
      'data_tools',
      'export_tools',
      'import_tools',
      'sync_tools',
      'backup_tools',
      'restore_tools',
      'cleanup_tools',
      'optimization_tools',
      'security_tools',
      'compliance_tools',
      'audit_tools',
      'testing_tools',
      'deployment_tools',
      'configuration_tools',
      'integration_tools',
      'automation_tools',
      'workflow_tools',
      'approval_tools',
      'escalation_tools',
      'incident_tools',
      'maintenance_tools',
      'upgrade_tools',
      'migration_tools',
      'quality_tools',
      'training_tools',
      'support_tools',
      'sales_tools',
      'marketing_tools',
      'content_tools',
      'media_tools',
      'social_tools',
      'mobile_tools',
      'web_tools',
      'read',
      'write',
      'create',
      'update',
      'delete',
      'view',
      'edit',
      'manage',
      'configure',
      'execute',
      'approve',
      'reject',
      'publish',
      'unpublish',
      'archive',
      'restore',
      'export',
      'import',
      'sync',
      'backup',
      'restore',
      'cleanup',
      'optimize',
      'secure',
      'comply',
      'audit',
      'test',
      'deploy',
      'configure',
      'integrate',
      'automate',
      'workflow',
      'escalate',
      'incident',
      'maintain',
      'upgrade',
      'migrate',
      'quality',
      'train',
      'support',
      'sell',
      'market',
      'content',
      'media',
      'social',
      'mobile',
      'web'
    ]
  },
  {
    id: 'emergency-admin-002', 
    email: 'admin@yourclutch.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 'emergency-employee-001',
    email: 'employee@yourclutch.com',
    password: 'employee123',
    name: 'Employee User',
    role: 'employee',
    permissions: ['read', 'write']
  }
];

// POST /api/v1/emergency-auth/login - Emergency login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🚨 Emergency login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Find user in emergency credentials
    const user = EMERGENCY_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      console.log('❌ Emergency login failed for:', email);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('✅ Emergency login successful for:', email);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'emergency-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create session token
    const sessionToken = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      data: {
        token,
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      },
      message: 'Emergency login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Emergency login error:', error);
    res.status(500).json({
      success: false,
      error: 'EMERGENCY_LOGIN_FAILED',
      message: 'Emergency login failed. Please contact support.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/emergency-auth/status - Check emergency auth status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      availableUsers: EMERGENCY_USERS.length,
      timestamp: new Date().toISOString()
    },
    message: 'Emergency authentication system is operational'
  });
});

// GET /api/v1/emergency-auth/users - List available emergency users (for testing)
router.get('/users', (req, res) => {
  const publicUsers = EMERGENCY_USERS.map(user => ({
    email: user.email,
    name: user.name,
    role: user.role
  }));
  
  res.json({
    success: true,
    data: {
      users: publicUsers,
      count: publicUsers.length
    },
    message: 'Emergency users available'
  });
});

module.exports = router;
