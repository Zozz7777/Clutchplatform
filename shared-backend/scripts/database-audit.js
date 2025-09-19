#!/usr/bin/env node

/**
 * MongoDB Atlas Database Audit & Collection Creation Script
 * Clutch Platform - Database Collections Audit & Fix
 * 
 * This script audits MongoDB Atlas and ensures all collections required by the Clutch ecosystem
 * exist, are correctly structured, and are in sync with the backend services.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://clutch:clutch123@cluster0.mongodb.net/clutch?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGODB_DB || 'clutch';

// Required collections based on backend analysis
const REQUIRED_COLLECTIONS = {
  // Core User Management
  'users': {
    description: 'User accounts and profiles',
    indexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { role: 1 } },
      { keys: { isActive: 1 } },
      { keys: { createdAt: 1 } },
      { keys: { updatedAt: 1 } }
    ],
    schema: {
      email: { type: 'string', required: true },
      password: { type: 'string', required: true },
      role: { type: 'string', required: true },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      isActive: { type: 'boolean', default: true },
      createdAt: { type: 'date', default: '$$NOW' },
      updatedAt: { type: 'date', default: '$$NOW' }
    }
  },
  'user_sessions': {
    description: 'User session management',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { token: 1 }, options: { unique: true } },
      { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
    ]
  },
  'user_vehicles': {
    description: 'User vehicle ownership',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { vehicleId: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Vehicle & Parts Management
  'vehicles': {
    description: 'Vehicle inventory and management',
    indexes: [
      { keys: { licensePlate: 1 }, options: { unique: true } },
      { keys: { make: 1, model: 1 } },
      { keys: { status: 1 } },
      { keys: { location: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'products': {
    description: 'Product catalog and inventory',
    indexes: [
      { keys: { sku: 1 }, options: { unique: true } },
      { keys: { category: 1 } },
      { keys: { brand: 1 } },
      { keys: { isActive: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'vehicle_diagnostics': {
    description: 'Vehicle diagnostic data',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { errorCode: 1 } },
      { keys: { severity: 1 } }
    ]
  },

  // Service & Booking Management
  'bookings': {
    description: 'Service bookings and appointments',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { serviceCenterId: 1 } },
      { keys: { status: 1 } },
      { keys: { scheduledDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'service_centers': {
    description: 'Service center locations',
    indexes: [
      { keys: { location: '2dsphere' } },
      { keys: { isActive: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'service_categories': {
    description: 'Service categories and types',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { isActive: 1 } }
    ]
  },

  // Business & Partner Management
  'partners': {
    description: 'Business partners and service providers',
    indexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { businessType: 1 } },
      { keys: { status: 1 } },
      { keys: { location: '2dsphere' } },
      { keys: { createdAt: 1 } }
    ]
  },
  'customers': {
    description: 'Customer profiles and CRM data',
    indexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { phone: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Financial Management
  'transactions': {
    description: 'Financial transactions and payments',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { amount: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'payment_methods': {
    description: 'Payment method configurations',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { isDefault: 1 } },
      { keys: { isActive: 1 } }
    ]
  },
  'invoices': {
    description: 'Invoice and billing records',
    indexes: [
      { keys: { invoiceNumber: 1 }, options: { unique: true } },
      { keys: { customerId: 1 } },
      { keys: { status: 1 } },
      { keys: { dueDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'payments': {
    description: 'Payment processing records',
    indexes: [
      { keys: { transactionId: 1 } },
      { keys: { userId: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Communication & Notifications
  'notifications': {
    description: 'System notifications',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { isRead: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'chat_messages': {
    description: 'Chat messages and conversations',
    indexes: [
      { keys: { roomId: 1 } },
      { keys: { userId: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'emails': {
    description: 'Email system and templates',
    indexes: [
      { keys: { recipient: 1 } },
      { keys: { status: 1 } },
      { keys: { type: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Analytics & Reporting
  'analytics': {
    description: 'Analytics and metrics data',
    indexes: [
      { keys: { type: 1 } },
      { keys: { date: 1 } },
      { keys: { userId: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'reports': {
    description: 'Business reports and analytics',
    indexes: [
      { keys: { type: 1 } },
      { keys: { userId: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'audit_logs': {
    description: 'System audit logs and security',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { action: 1 } },
      { keys: { resource: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { severity: 1 } }
    ]
  },

  // System & Configuration
  'feature_flags': {
    description: 'Feature flags and toggles',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { isActive: 1 } },
      { keys: { environment: 1 } }
    ]
  },
  'cities': {
    description: 'City and location data',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { country: 1 } },
      { keys: { location: '2dsphere' } }
    ]
  },
  'areas': {
    description: 'Area and region data',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { cityId: 1 } },
      { keys: { location: '2dsphere' } }
    ]
  },

  // OBD & Diagnostic Data
  'obd_error_codes': {
    description: 'OBD error codes and definitions',
    indexes: [
      { keys: { code: 1 }, options: { unique: true } },
      { keys: { category: 1 } },
      { keys: { severity: 1 } }
    ]
  },
  'obd_categories': {
    description: 'OBD diagnostic categories',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { isActive: 1 } }
    ]
  },
  'obd2_data': {
    description: 'OBD2 diagnostic data',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { errorCode: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Device & Token Management
  'device_tokens': {
    description: 'Device tokens for push notifications',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { token: 1 }, options: { unique: true } },
      { keys: { platform: 1 } },
      { keys: { isActive: 1 } }
    ]
  },
  'sessions': {
    description: 'User sessions and authentication',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { token: 1 }, options: { unique: true } },
      { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
    ]
  },

  // Employee Management
  'employees': {
    description: 'Employee records and management',
    indexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { employeeId: 1 }, options: { unique: true } },
      { keys: { department: 1 } },
      { keys: { position: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'employee_invitations': {
    description: 'Employee invitation management',
    indexes: [
      { keys: { email: 1 } },
      { keys: { token: 1 }, options: { unique: true } },
      { keys: { status: 1 } },
      { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'job_applications': {
    description: 'Job applications and recruitment',
    indexes: [
      { keys: { jobId: 1 } },
      { keys: { applicantEmail: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'recruitment': {
    description: 'Recruitment process and job postings',
    indexes: [
      { keys: { title: 1 } },
      { keys: { department: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // User Activity & Support
  'user_activity': {
    description: 'User activity tracking',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { action: 1 } },
      { keys: { timestamp: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'support_tickets': {
    description: 'Customer support tickets',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { ticketNumber: 1 }, options: { unique: true } },
      { keys: { status: 1 } },
      { keys: { priority: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Compliance & Legal
  'compliance': {
    description: 'Compliance tracking and records',
    indexes: [
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { userId: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'compliance_flags': {
    description: 'Compliance flags and alerts',
    indexes: [
      { keys: { type: 1 } },
      { keys: { severity: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'compliance_frameworks': {
    description: 'Compliance frameworks and standards',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { isActive: 1 } }
    ]
  },

  // AI/ML Collections
  'ai_models': {
    description: 'AI model definitions and metadata',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_predictions': {
    description: 'AI prediction results',
    indexes: [
      { keys: { modelId: 1 } },
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_training_jobs': {
    description: 'AI model training jobs',
    indexes: [
      { keys: { modelId: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_recommendations': {
    description: 'AI-generated recommendations',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_feedback': {
    description: 'User feedback on AI predictions',
    indexes: [
      { keys: { predictionId: 1 } },
      { keys: { userId: 1 } },
      { keys: { rating: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_model_performance': {
    description: 'AI model performance metrics',
    indexes: [
      { keys: { modelId: 1 } },
      { keys: { date: 1 } },
      { keys: { metric: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'ai_training': {
    description: 'AI training data and ROI',
    indexes: [
      { keys: { modelId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'anomalies': {
    description: 'Anomaly detection results',
    indexes: [
      { keys: { type: 1 } },
      { keys: { severity: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'fraud_cases': {
    description: 'Fraud detection cases',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { severity: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Legal Collections
  'contracts': {
    description: 'Legal contracts',
    indexes: [
      { keys: { contractNumber: 1 }, options: { unique: true } },
      { keys: { partyId: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'disputes': {
    description: 'Legal disputes',
    indexes: [
      { keys: { disputeNumber: 1 }, options: { unique: true } },
      { keys: { partyId: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'legal_documents': {
    description: 'Legal documents',
    indexes: [
      { keys: { documentNumber: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // CMS Collections
  'cms_categories': {
    description: 'CMS content categories',
    indexes: [
      { keys: { name: 1 }, options: { unique: true } },
      { keys: { slug: 1 }, options: { unique: true } },
      { keys: { isActive: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'cms_media': {
    description: 'CMS media files',
    indexes: [
      { keys: { filename: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { category: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'help_articles': {
    description: 'Help articles and documentation',
    indexes: [
      { keys: { title: 1 } },
      { keys: { slug: 1 }, options: { unique: true } },
      { keys: { category: 1 } },
      { keys: { isPublished: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'seo_data': {
    description: 'SEO data and optimization',
    indexes: [
      { keys: { url: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Security Collections
  'security_alerts': {
    description: 'Security alerts and threats',
    indexes: [
      { keys: { type: 1 } },
      { keys: { severity: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'security_logs': {
    description: 'Security event logs',
    indexes: [
      { keys: { userId: 1 } },
      { keys: { event: 1 } },
      { keys: { severity: 1 } },
      { keys: { timestamp: 1 } }
    ]
  },
  'threat_intelligence': {
    description: 'Threat intelligence data',
    indexes: [
      { keys: { type: 1 } },
      { keys: { severity: 1 } },
      { keys: { source: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'security_incidents': {
    description: 'Security incident reports',
    indexes: [
      { keys: { incidentNumber: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { severity: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Asset Management Collections
  'assets': {
    description: 'Asset inventory and management',
    indexes: [
      { keys: { assetNumber: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { location: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'asset_maintenance': {
    description: 'Asset maintenance records',
    indexes: [
      { keys: { assetId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { scheduledDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'asset_assignments': {
    description: 'Asset assignment tracking',
    indexes: [
      { keys: { assetId: 1 } },
      { keys: { userId: 1 } },
      { keys: { status: 1 } },
      { keys: { assignedDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'maintenance_records': {
    description: 'General maintenance records',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { scheduledDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'maintenance_tasks': {
    description: 'Maintenance task management',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { priority: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'maintenance_schedules': {
    description: 'Maintenance scheduling',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { nextService: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'technicians': {
    description: 'Technician management',
    indexes: [
      { keys: { employeeId: 1 }, options: { unique: true } },
      { keys: { skills: 1 } },
      { keys: { availability: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Mobile Apps Collections
  'mobile_app_versions': {
    description: 'Mobile app version management',
    indexes: [
      { keys: { version: 1 }, options: { unique: true } },
      { keys: { platform: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'mobile_app_crashes': {
    description: 'Mobile app crash reports',
    indexes: [
      { keys: { version: 1 } },
      { keys: { platform: 1 } },
      { keys: { severity: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'mobile_app_analytics': {
    description: 'Mobile app analytics',
    indexes: [
      { keys: { version: 1 } },
      { keys: { platform: 1 } },
      { keys: { date: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'mobile_app_stores': {
    description: 'Mobile app store listings',
    indexes: [
      { keys: { platform: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'mobile_app_settings': {
    description: 'Mobile app settings and configuration',
    indexes: [
      { keys: { _id: 1 }, options: { unique: true } },
      { keys: { updatedAt: 1 } }
    ]
  },

  // Marketing Collections
  'campaigns': {
    description: 'Marketing campaigns',
    indexes: [
      { keys: { name: 1 } },
      { keys: { status: 1 } },
      { keys: { type: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'marketing_leads': {
    description: 'Marketing leads and prospects',
    indexes: [
      { keys: { email: 1 } },
      { keys: { source: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'marketing_promotions': {
    description: 'Marketing promotions and offers',
    indexes: [
      { keys: { code: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { expiresAt: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'leads': {
    description: 'General leads management',
    indexes: [
      { keys: { email: 1 } },
      { keys: { source: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'promotions': {
    description: 'General promotions management',
    indexes: [
      { keys: { code: 1 }, options: { unique: true } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // System Performance Collections
  'api_performance': {
    description: 'API performance metrics',
    indexes: [
      { keys: { endpoint: 1 } },
      { keys: { method: 1 } },
      { keys: { date: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'system_alerts': {
    description: 'System alerts and monitoring',
    indexes: [
      { keys: { type: 1 } },
      { keys: { severity: 1 } },
      { keys: { status: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },

  // Fleet Management Collections
  'fleet_vehicles': {
    description: 'Fleet vehicle management',
    indexes: [
      { keys: { licensePlate: 1 }, options: { unique: true } },
      { keys: { make: 1, model: 1 } },
      { keys: { status: 1 } },
      { keys: { location: 1 } },
      { keys: { createdAt: 1 } }
    ]
  },
  'maintenance': {
    description: 'Fleet maintenance records',
    indexes: [
      { keys: { vehicleId: 1 } },
      { keys: { type: 1 } },
      { keys: { status: 1 } },
      { keys: { scheduledDate: 1 } },
      { keys: { createdAt: 1 } }
    ]
  }
};

class DatabaseAuditor {
  constructor() {
    this.client = null;
    this.db = null;
    this.auditResults = {
      existingCollections: [],
      missingCollections: [],
      createdCollections: [],
      errors: []
    };
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      this.client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log(`✅ Connected to database: ${DB_NAME}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async auditCollections() {
    console.log('\n📊 Starting collection audit...');
    
    try {
      // Get existing collections
      const existingCollections = await this.db.listCollections().toArray();
      this.auditResults.existingCollections = existingCollections.map(col => col.name);
      
      console.log(`📋 Found ${existingCollections.length} existing collections`);
      
      // Check for missing collections
      const requiredCollectionNames = Object.keys(REQUIRED_COLLECTIONS);
      this.auditResults.missingCollections = requiredCollectionNames.filter(
        name => !this.auditResults.existingCollections.includes(name)
      );
      
      console.log(`⚠️  Missing ${this.auditResults.missingCollections.length} required collections`);
      
      return this.auditResults;
    } catch (error) {
      console.error('❌ Error during audit:', error.message);
      this.auditResults.errors.push(error.message);
      return this.auditResults;
    }
  }

  async createMissingCollections() {
    console.log('\n🔨 Creating missing collections...');
    
    for (const collectionName of this.auditResults.missingCollections) {
      try {
        const collectionConfig = REQUIRED_COLLECTIONS[collectionName];
        console.log(`📝 Creating collection: ${collectionName}`);
        
        // Create collection
        await this.db.createCollection(collectionName);
        
        // Create indexes
        if (collectionConfig.indexes) {
          for (const indexConfig of collectionConfig.indexes) {
            try {
              await this.db.collection(collectionName).createIndex(
                indexConfig.keys,
                indexConfig.options || {}
              );
              console.log(`  ✅ Created index: ${JSON.stringify(indexConfig.keys)}`);
            } catch (indexError) {
              console.log(`  ⚠️  Index creation failed: ${indexError.message}`);
            }
          }
        }
        
        // Insert sample document if schema is defined
        if (collectionConfig.schema) {
          const sampleDoc = this.generateSampleDocument(collectionConfig.schema);
          await this.db.collection(collectionName).insertOne(sampleDoc);
          console.log(`  📄 Inserted sample document`);
        }
        
        this.auditResults.createdCollections.push(collectionName);
        console.log(`✅ Successfully created collection: ${collectionName}`);
        
      } catch (error) {
        console.error(`❌ Failed to create collection ${collectionName}:`, error.message);
        this.auditResults.errors.push(`Failed to create ${collectionName}: ${error.message}`);
      }
    }
  }

  generateSampleDocument(schema) {
    const doc = {};
    
    for (const [field, config] of Object.entries(schema)) {
      if (config.default === '$$NOW') {
        doc[field] = new Date();
      } else if (config.default !== undefined) {
        doc[field] = config.default;
      } else if (config.type === 'string') {
        doc[field] = `sample_${field}`;
      } else if (config.type === 'boolean') {
        doc[field] = false;
      } else if (config.type === 'number') {
        doc[field] = 0;
      } else if (config.type === 'date') {
        doc[field] = new Date();
      }
    }
    
    return doc;
  }

  async verifyBackendAlignment() {
    console.log('\n🔍 Verifying backend alignment...');
    
    // Check if all collections referenced in backend routes exist
    const backendCollections = [
      'users', 'vehicles', 'products', 'bookings', 'partners', 'customers',
      'transactions', 'payments', 'notifications', 'analytics', 'reports',
      'audit_logs', 'feature_flags', 'employees', 'employee_invitations',
      'compliance_flags', 'compliance_frameworks', 'ai_models', 'ai_predictions',
      'fraud_cases', 'contracts', 'disputes', 'cms_categories', 'cms_media',
      'help_articles', 'seo_data', 'security_alerts', 'security_logs',
      'assets', 'maintenance_records', 'maintenance_tasks', 'maintenance_schedules',
      'technicians', 'mobile_app_versions', 'mobile_app_crashes', 'mobile_app_analytics',
      'mobile_app_stores', 'mobile_app_settings', 'campaigns', 'marketing_leads',
      'marketing_promotions', 'api_performance', 'system_alerts', 'fleet_vehicles',
      'maintenance', 'obd2_data', 'sessions', 'user_activity', 'support_tickets',
      'compliance', 'leads', 'promotions'
    ];
    
    const missingBackendCollections = backendCollections.filter(
      name => !this.auditResults.existingCollections.includes(name) && 
              !this.auditResults.createdCollections.includes(name)
    );
    
    if (missingBackendCollections.length > 0) {
      console.log(`⚠️  Missing backend-referenced collections: ${missingBackendCollections.join(', ')}`);
      this.auditResults.missingCollections.push(...missingBackendCollections);
    } else {
      console.log('✅ All backend-referenced collections exist');
    }
  }

  generateReport() {
    console.log('\n📊 DATABASE AUDIT REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📋 EXISTING COLLECTIONS (${this.auditResults.existingCollections.length}):`);
    this.auditResults.existingCollections.forEach(name => {
      console.log(`  ✅ ${name}`);
    });
    
    console.log(`\n🔨 CREATED COLLECTIONS (${this.auditResults.createdCollections.length}):`);
    this.auditResults.createdCollections.forEach(name => {
      console.log(`  🆕 ${name}`);
    });
    
    if (this.auditResults.missingCollections.length > 0) {
      console.log(`\n⚠️  STILL MISSING (${this.auditResults.missingCollections.length}):`);
      this.auditResults.missingCollections.forEach(name => {
        console.log(`  ❌ ${name}`);
      });
    }
    
    if (this.auditResults.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.auditResults.errors.length}):`);
      this.auditResults.errors.forEach(error => {
        console.log(`  🚨 ${error}`);
      });
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Required: ${Object.keys(REQUIRED_COLLECTIONS).length}`);
    console.log(`  Existing: ${this.auditResults.existingCollections.length}`);
    console.log(`  Created: ${this.auditResults.createdCollections.length}`);
    console.log(`  Missing: ${this.auditResults.missingCollections.length}`);
    console.log(`  Errors: ${this.auditResults.errors.length}`);
    
    const success = this.auditResults.missingCollections.length === 0 && this.auditResults.errors.length === 0;
    console.log(`\n${success ? '✅ AUDIT COMPLETE - ALL COLLECTIONS READY' : '⚠️  AUDIT INCOMPLETE - ISSUES REMAIN'}`);
    
    return this.auditResults;
  }

  async runFullAudit() {
    console.log('🚀 Starting Clutch Database Audit & Fix');
    console.log('='.repeat(50));
    
    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
      
      // Run audit loop until clean
      let iteration = 1;
      let hasMissingCollections = true;
      
      while (hasMissingCollections && iteration <= 3) {
        console.log(`\n🔄 AUDIT ITERATION ${iteration}`);
        console.log('-'.repeat(30));
        
        // Audit existing collections
        await this.auditCollections();
        
        // Create missing collections
        if (this.auditResults.missingCollections.length > 0) {
          await this.createMissingCollections();
        }
        
        // Verify backend alignment
        await this.verifyBackendAlignment();
        
        // Check if we're done
        hasMissingCollections = this.auditResults.missingCollections.length > 0;
        iteration++;
        
        if (hasMissingCollections) {
          console.log(`\n⚠️  Still missing ${this.auditResults.missingCollections.length} collections. Running iteration ${iteration}...`);
        }
      }
      
      // Generate final report
      const finalReport = this.generateReport();
      
      return finalReport;
      
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      this.auditResults.errors.push(error.message);
      return this.auditResults;
    } finally {
      await this.disconnect();
    }
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  const auditor = new DatabaseAuditor();
  auditor.runFullAudit()
    .then(results => {
      const success = results.missingCollections.length === 0 && results.errors.length === 0;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseAuditor;
