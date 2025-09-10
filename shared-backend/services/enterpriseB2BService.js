const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const Fleet = require('../models/Fleet');
const FleetVehicle = require('../models/FleetVehicle');
const CorporateAccount = require('../models/corporateAccount');
const AuditLog = require('../models/auditLog');

class EnterpriseB2BService {
    constructor() {
        this.isInitialized = false;
        this.tenants = new Map();
        this.fleetManagers = new Map();
        this.enterpriseIntegrations = new Map();
        this.b2bMetrics = {
            totalTenants: 0,
            activeFleets: 0,
            totalVehicles: 0,
            monthlyRevenue: 0
        };
    }

    async initialize() {
        try {
            await this.setupMultiTenantArchitecture();
            await this.initializeFleetManagement();
            await this.setupCorporateAccountManagement();
            await this.initializeEnterpriseIntegration();
            
            this.isInitialized = true;
            console.log('✅ Enterprise B2B Service initialized');
            
            // Start periodic B2B metrics calculation
            setInterval(() => this.calculateB2BMetrics(), 60 * 60 * 1000); // Every hour
            
        } catch (error) {
            console.error('❌ Enterprise B2B Service initialization failed:', error.message);
            throw error;
        }
    }

    // Multi-Tenant Architecture
    async setupMultiTenantArchitecture() {
        console.log('🏢 Setting up Multi-Tenant Architecture...');
        
        this.multiTenant = {
            enabled: true,
            tenantIsolation: true,
            customBranding: true,
            whiteLabelSolutions: true,
            enterpriseFeatures: true
        };

        // Tenant configuration
        this.tenantConfig = {
            maxUsers: 1000,
            maxVehicles: 10000,
            maxFleets: 100,
            storageLimit: 1000, // GB
            apiRateLimit: 10000, // requests per hour
            customDomain: true,
            ssoIntegration: true
        };

        // White-label configuration
        this.whiteLabelConfig = {
            customLogo: true,
            customColors: true,
            customDomain: true,
            customEmailTemplates: true,
            customSupport: true,
            customBranding: true
        };
    }

    // Fleet Management
    async initializeFleetManagement() {
        console.log('🚗 Initializing Fleet Management...');
        
        this.fleetManagement = {
            gpsTracking: true,
            fuelMonitoring: true,
            maintenanceScheduling: true,
            driverManagement: true,
            routeOptimization: true,
            costAnalytics: true
        };

        // Fleet features
        this.fleetFeatures = {
            realTimeTracking: true,
            geofencing: true,
            maintenanceAlerts: true,
            fuelEfficiency: true,
            driverBehavior: true,
            costTracking: true,
            reporting: true
        };

        // GPS integration
        this.gpsIntegration = {
            providers: ['garmin', 'tomtom', 'verizon', 'at&t'],
            realTimeUpdates: true,
            historicalData: true,
            geofencing: true,
            routeOptimization: true
        };
    }

    // Corporate Account Management
    async setupCorporateAccountManagement() {
        console.log('👥 Setting up Corporate Account Management...');
        
        this.corporateAccount = {
            multiUserAccounts: true,
            roleBasedAccess: true,
            approvalWorkflows: true,
            expenseTracking: true,
            billingManagement: true
        };

        // User roles for corporate accounts
        this.corporateRoles = {
            fleet_admin: {
                name: 'Fleet Administrator',
                permissions: ['fleet_management', 'user_management', 'billing', 'reports'],
                description: 'Full access to fleet management and user administration'
            },
            fleet_manager: {
                name: 'Fleet Manager',
                permissions: ['fleet_management', 'reports', 'maintenance'],
                description: 'Manage fleet operations and maintenance'
            },
            driver: {
                name: 'Driver',
                permissions: ['vehicle_access', 'route_view', 'maintenance_report'],
                description: 'Access to assigned vehicle and route information'
            },
            accountant: {
                name: 'Accountant',
                permissions: ['billing', 'expense_reports', 'financial_reports'],
                description: 'Access to billing and financial information'
            }
        };
    }

    // Enterprise Integration
    async initializeEnterpriseIntegration() {
        console.log('🔗 Initializing Enterprise Integration...');
        
        this.enterpriseIntegration = {
            erpIntegration: true,
            crmIntegration: true,
            accountingIntegration: true,
            hrIntegration: true,
            apiAccess: true
        };

        // ERP Integration
        this.erpIntegration = {
            systems: ['sap', 'oracle', 'microsoft_dynamics', 'netsuite'],
            dataSync: true,
            realTimeUpdates: true,
            bidirectionalSync: true
        };

        // CRM Integration
        this.crmIntegration = {
            systems: ['salesforce', 'hubspot', 'microsoft_crm', 'zoho'],
            customerSync: true,
            leadManagement: true,
            opportunityTracking: true
        };

        // API Access
        this.apiAccess = {
            restApi: true,
            graphqlApi: true,
            webhooks: true,
            sdk: true,
            documentation: true
        };
    }

    // Create Tenant
    async createTenant(tenantData) {
        try {
            const {
                name,
                domain,
                adminUser,
                plan = 'enterprise',
                customBranding = {},
                features = {}
            } = tenantData;

            // Validate tenant data
            const validation = await this.validateTenantData(tenantData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Create tenant record
            const tenant = {
                id: this.generateTenantId(),
                name,
                domain,
                adminUser,
                plan,
                customBranding,
                features,
                status: 'active',
                createdAt: new Date(),
                config: this.getTenantConfig(plan)
            };

            // Store tenant
            this.tenants.set(tenant.id, tenant);

            // Create corporate account
            const corporateAccount = await this.createCorporateAccount({
                tenantId: tenant.id,
                name: tenant.name,
                adminUser: tenant.adminUser
            });

            // Initialize tenant environment
            await this.initializeTenantEnvironment(tenant);

            // Log tenant creation
            await this.logB2BEvent('tenant_created', {
                tenantId: tenant.id,
                name: tenant.name,
                adminUser: tenant.adminUser
            });

            return {
                success: true,
                tenantId: tenant.id,
                corporateAccountId: corporateAccount.id,
                tenant: tenant
            };

        } catch (error) {
            console.error('Error in createTenant:', error);
            throw error;
        }
    }

    // Create Corporate Account
    async createCorporateAccount(accountData) {
        try {
            const {
                tenantId,
                name,
                adminUser,
                billingInfo = {},
                settings = {}
            } = accountData;

            // Create corporate account record
            const corporateAccount = new CorporateAccount({
                tenantId,
                name,
                adminUser,
                billingInfo,
                settings,
                status: 'active',
                userCount: 1,
                fleetCount: 0,
                vehicleCount: 0
            });

            await corporateAccount.save();

            return {
                success: true,
                id: corporateAccount._id,
                account: corporateAccount
            };

        } catch (error) {
            console.error('Error in createCorporateAccount:', error);
            throw error;
        }
    }

    // Fleet Management
    async createFleet(fleetData) {
        try {
            const {
                tenantId,
                name,
                description,
                manager,
                vehicles = [],
                settings = {}
            } = fleetData;

            // Validate fleet data
            const validation = await this.validateFleetData(fleetData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Create fleet record
            const fleet = new Fleet({
                tenantId,
                name,
                description,
                manager,
                vehicles,
                settings,
                status: 'active',
                vehicleCount: vehicles.length,
                createdAt: new Date()
            });

            await fleet.save();

            // Add vehicles to fleet
            if (vehicles.length > 0) {
                await this.addVehiclesToFleet(fleet._id, vehicles);
            }

            // Log fleet creation
            await this.logB2BEvent('fleet_created', {
                tenantId,
                fleetId: fleet._id,
                name: fleet.name,
                manager: fleet.manager
            });

            return {
                success: true,
                fleetId: fleet._id,
                fleet: fleet
            };

        } catch (error) {
            console.error('Error in createFleet:', error);
            throw error;
        }
    }

    // Add Vehicles to Fleet
    async addVehiclesToFleet(fleetId, vehicles) {
        try {
            const fleet = await Fleet.findById(fleetId);
            if (!fleet) {
                throw new Error('Fleet not found');
            }

            const fleetVehicles = [];
            for (const vehicleData of vehicles) {
                const fleetVehicle = new FleetVehicle({
                    fleetId,
                    vehicleId: vehicleData.vehicleId,
                    assignedDriver: vehicleData.assignedDriver,
                    gpsDevice: vehicleData.gpsDevice,
                    status: 'active',
                    assignedAt: new Date()
                });

                await fleetVehicle.save();
                fleetVehicles.push(fleetVehicle);
            }

            // Update fleet vehicle count
            await Fleet.findByIdAndUpdate(fleetId, {
                vehicleCount: fleet.vehicleCount + vehicles.length
            });

            return {
                success: true,
                vehiclesAdded: fleetVehicles.length,
                vehicles: fleetVehicles
            };

        } catch (error) {
            console.error('Error in addVehiclesToFleet:', error);
            throw error;
        }
    }

    // GPS Tracking
    async trackVehicle(vehicleId, locationData) {
        try {
            const {
                latitude,
                longitude,
                speed,
                heading,
                timestamp = new Date(),
                fuelLevel,
                engineStatus,
                driverId
            } = locationData;

            // Validate location data
            if (!latitude || !longitude) {
                throw new Error('Invalid location data');
            }

            // Find fleet vehicle
            const fleetVehicle = await FleetVehicle.findOne({ vehicleId });
            if (!fleetVehicle) {
                throw new Error('Vehicle not found in fleet');
            }

            // Update vehicle location
            await FleetVehicle.findByIdAndUpdate(fleetVehicle._id, {
                lastLocation: {
                    latitude,
                    longitude,
                    speed,
                    heading,
                    timestamp
                },
                lastUpdate: timestamp,
                fuelLevel,
                engineStatus,
                currentDriver: driverId
            });

            // Check geofences
            await this.checkGeofences(fleetVehicle.fleetId, locationData);

            // Log tracking event
            await this.logB2BEvent('vehicle_tracked', {
                fleetId: fleetVehicle.fleetId,
                vehicleId,
                location: { latitude, longitude },
                timestamp
            });

            return {
                success: true,
                vehicleId,
                location: { latitude, longitude, timestamp }
            };

        } catch (error) {
            console.error('Error in trackVehicle:', error);
            throw error;
        }
    }

    // Geofencing
    async checkGeofences(fleetId, locationData) {
        try {
            const fleet = await Fleet.findById(fleetId);
            if (!fleet || !fleet.settings.geofences) {
                return;
            }

            const { latitude, longitude } = locationData;

            for (const geofence of fleet.settings.geofences) {
                const isInside = this.isPointInGeofence(
                    { latitude, longitude },
                    geofence
                );

                if (isInside && !geofence.lastTriggered) {
                    // Trigger geofence event
                    await this.triggerGeofenceEvent(fleetId, geofence, locationData);
                    
                    // Update geofence
                    geofence.lastTriggered = new Date();
                }
            }

        } catch (error) {
            console.error('Error in checkGeofences:', error);
        }
    }

    // Maintenance Scheduling
    async scheduleMaintenance(maintenanceData) {
        try {
            const {
                fleetId,
                vehicleId,
                maintenanceType,
                scheduledDate,
                estimatedCost,
                description,
                priority = 'medium'
            } = maintenanceData;

            // Create maintenance record
            const maintenance = {
                fleetId,
                vehicleId,
                maintenanceType,
                scheduledDate,
                estimatedCost,
                description,
                priority,
                status: 'scheduled',
                createdAt: new Date()
            };

            // Add to fleet maintenance schedule
            await Fleet.findByIdAndUpdate(fleetId, {
                $push: { maintenanceSchedule: maintenance }
            });

            // Send notifications
            await this.sendMaintenanceNotification(fleetId, maintenance);

            // Log maintenance scheduling
            await this.logB2BEvent('maintenance_scheduled', {
                fleetId,
                vehicleId,
                maintenanceType,
                scheduledDate
            });

            return {
                success: true,
                maintenance: maintenance
            };

        } catch (error) {
            console.error('Error in scheduleMaintenance:', error);
            throw error;
        }
    }

    // Driver Management
    async assignDriverToVehicle(fleetId, vehicleId, driverId) {
        try {
            // Validate assignment
            const fleet = await Fleet.findById(fleetId);
            if (!fleet) {
                throw new Error('Fleet not found');
            }

            // Update fleet vehicle
            await FleetVehicle.findOneAndUpdate(
                { fleetId, vehicleId },
                { assignedDriver: driverId, assignedAt: new Date() }
            );

            // Log driver assignment
            await this.logB2BEvent('driver_assigned', {
                fleetId,
                vehicleId,
                driverId
            });

            return {
                success: true,
                fleetId,
                vehicleId,
                driverId
            };

        } catch (error) {
            console.error('Error in assignDriverToVehicle:', error);
            throw error;
        }
    }

    // Enterprise Integration
    async integrateWithERP(tenantId, erpData) {
        try {
            const {
                erpSystem,
                connectionString,
                credentials,
                syncSettings = {}
            } = erpData;

            // Validate ERP system
            if (!this.erpIntegration.systems.includes(erpSystem)) {
                throw new Error(`Unsupported ERP system: ${erpSystem}`);
            }

            // Create ERP integration record
            const integration = {
                tenantId,
                type: 'erp',
                system: erpSystem,
                connectionString,
                credentials: this.encryptCredentials(credentials),
                syncSettings,
                status: 'active',
                createdAt: new Date()
            };

            // Store integration
            this.enterpriseIntegrations.set(`${tenantId}_erp`, integration);

            // Test connection
            const connectionTest = await this.testERPConnection(integration);
            if (!connectionTest.success) {
                throw new Error(`ERP connection failed: ${connectionTest.error}`);
            }

            // Log integration
            await this.logB2BEvent('erp_integrated', {
                tenantId,
                erpSystem,
                status: 'active'
            });

            return {
                success: true,
                integration: integration
            };

        } catch (error) {
            console.error('Error in integrateWithERP:', error);
            throw error;
        }
    }

    // API Access Management
    async generateAPIKey(tenantId, keyData) {
        try {
            const {
                name,
                permissions = [],
                expiresAt = null
            } = keyData;

            // Generate API key
            const apiKey = this.generateSecureKey();
            const keyHash = await this.hashAPIKey(apiKey);

            // Create API key record
            const apiKeyRecord = {
                tenantId,
                name,
                keyHash,
                permissions,
                expiresAt,
                status: 'active',
                createdAt: new Date(),
                lastUsed: null
            };

            // Store API key
            this.apiKeys.set(keyHash, apiKeyRecord);

            // Log API key generation
            await this.logB2BEvent('api_key_generated', {
                tenantId,
                keyName: name,
                permissions
            });

            return {
                success: true,
                apiKey: apiKey,
                keyRecord: apiKeyRecord
            };

        } catch (error) {
            console.error('Error in generateAPIKey:', error);
            throw error;
        }
    }

    // B2B Analytics
    async generateB2BReports(options = {}) {
        try {
            const {
                tenantId,
                reportType = 'comprehensive',
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate = new Date()
            } = options;

            const reports = {};

            // Fleet Performance Report
            if (reportType === 'comprehensive' || reportType === 'fleet') {
                reports.fleetPerformance = await this.generateFleetPerformanceReport(tenantId, startDate, endDate);
            }

            // Cost Analysis Report
            if (reportType === 'comprehensive' || reportType === 'costs') {
                reports.costAnalysis = await this.generateCostAnalysisReport(tenantId, startDate, endDate);
            }

            // Driver Performance Report
            if (reportType === 'comprehensive' || reportType === 'drivers') {
                reports.driverPerformance = await this.generateDriverPerformanceReport(tenantId, startDate, endDate);
            }

            // Maintenance Report
            if (reportType === 'comprehensive' || reportType === 'maintenance') {
                reports.maintenance = await this.generateMaintenanceReport(tenantId, startDate, endDate);
            }

            return reports;

        } catch (error) {
            console.error('Error in generateB2BReports:', error);
            throw error;
        }
    }

    // Utility Methods
    validateTenantData(tenantData) {
        const { name, domain, adminUser } = tenantData;

        if (!name) {
            return { valid: false, error: 'Tenant name is required' };
        }

        if (!domain) {
            return { valid: false, error: 'Domain is required' };
        }

        if (!adminUser) {
            return { valid: false, error: 'Admin user is required' };
        }

        return { valid: true };
    }

    validateFleetData(fleetData) {
        const { tenantId, name, manager } = fleetData;

        if (!tenantId) {
            return { valid: false, error: 'Tenant ID is required' };
        }

        if (!name) {
            return { valid: false, error: 'Fleet name is required' };
        }

        if (!manager) {
            return { valid: false, error: 'Fleet manager is required' };
        }

        return { valid: true };
    }

    generateTenantId() {
        return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getTenantConfig(plan) {
        const baseConfig = { ...this.tenantConfig };
        
        switch (plan) {
            case 'enterprise':
                baseConfig.maxUsers = 10000;
                baseConfig.maxVehicles = 100000;
                baseConfig.maxFleets = 1000;
                baseConfig.storageLimit = 10000;
                baseConfig.apiRateLimit = 100000;
                break;
            case 'professional':
                baseConfig.maxUsers = 1000;
                baseConfig.maxVehicles = 10000;
                baseConfig.maxFleets = 100;
                baseConfig.storageLimit = 1000;
                baseConfig.apiRateLimit = 10000;
                break;
            default:
                // Use base config
                break;
        }

        return baseConfig;
    }

    isPointInGeofence(point, geofence) {
        // Simple distance-based geofence check
        const distance = this.calculateDistance(point, geofence.center);
        return distance <= geofence.radius;
    }

    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
        const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    async triggerGeofenceEvent(fleetId, geofence, locationData) {
        // Trigger geofence event (implement notification logic)
        console.log(`🚨 Geofence triggered: ${geofence.name} for fleet ${fleetId}`);
    }

    async sendMaintenanceNotification(fleetId, maintenance) {
        // Send maintenance notification (implement notification logic)
        console.log(`🔧 Maintenance notification sent for fleet ${fleetId}`);
    }

    encryptCredentials(credentials) {
        // Encrypt credentials (implement encryption logic)
        return Buffer.from(JSON.stringify(credentials)).toString('base64');
    }

    async testERPConnection(integration) {
        // Test ERP connection (implement connection test logic)
        return { success: true };
    }

    generateSecureKey() {
        return `clutch_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    }

    async hashAPIKey(apiKey) {
        // Hash API key (implement hashing logic)
        return Buffer.from(apiKey).toString('base64');
    }

    async initializeTenantEnvironment(tenant) {
        // Initialize tenant environment (implement environment setup logic)
        console.log(`🏢 Initializing environment for tenant: ${tenant.name}`);
    }

    async logB2BEvent(eventType, details) {
        try {
            const auditLog = new AuditLog({
                userId: details.tenantId || 'system',
                action: eventType,
                details: details,
                category: 'b2b',
                severity: 'medium',
                timestamp: new Date()
            });

            await auditLog.save();

        } catch (error) {
            console.error('Error in logB2BEvent:', error);
        }
    }

    async calculateB2BMetrics() {
        try {
            // Calculate B2B metrics
            this.b2bMetrics.totalTenants = this.tenants.size;
            this.b2bMetrics.activeFleets = await Fleet.countDocuments({ status: 'active' });
            this.b2bMetrics.totalVehicles = await FleetVehicle.countDocuments({ status: 'active' });

            console.log('📊 B2B metrics updated');

        } catch (error) {
            console.error('Error in calculateB2BMetrics:', error);
        }
    }

    async generateFleetPerformanceReport(tenantId, startDate, endDate) {
        // Generate fleet performance report
        return {
            period: { startDate, endDate },
            totalFleets: 0,
            activeFleets: 0,
            totalVehicles: 0,
            averageUtilization: 0,
            fuelEfficiency: 0
        };
    }

    async generateCostAnalysisReport(tenantId, startDate, endDate) {
        // Generate cost analysis report
        return {
            period: { startDate, endDate },
            totalCosts: 0,
            fuelCosts: 0,
            maintenanceCosts: 0,
            laborCosts: 0,
            costPerVehicle: 0
        };
    }

    async generateDriverPerformanceReport(tenantId, startDate, endDate) {
        // Generate driver performance report
        return {
            period: { startDate, endDate },
            totalDrivers: 0,
            averageScore: 0,
            safetyIncidents: 0,
            fuelEfficiency: 0
        };
    }

    async generateMaintenanceReport(tenantId, startDate, endDate) {
        // Generate maintenance report
        return {
            period: { startDate, endDate },
            scheduledMaintenance: 0,
            completedMaintenance: 0,
            totalCost: 0,
            averageDowntime: 0
        };
    }

    // Get service status
    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            totalTenants: this.b2bMetrics.totalTenants,
            activeFleets: this.b2bMetrics.activeFleets,
            totalVehicles: this.b2bMetrics.totalVehicles,
            monthlyRevenue: this.b2bMetrics.monthlyRevenue
        };
    }
}

module.exports = new EnterpriseB2BService();
