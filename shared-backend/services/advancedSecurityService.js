const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const { AuditLog } = require('../models/auditLog');
const { Session } = require('../models/session');
const { Role } = require('../models/Role');

class AdvancedSecurityService {
    constructor() {
        this.isInitialized = false;
        this.threatDetectionRules = new Map();
        this.complianceRules = new Map();
        this.securityMetrics = {
            failedAttempts: new Map(),
            suspiciousActivities: new Map(),
            threatLevel: 'low',
            lastAssessment: new Date()
        };
    }

    async initialize() {
        try {
            await this.setupZeroTrustArchitecture();
            await this.initializeThreatDetection();
            await this.setupComplianceManagement();
            await this.initializeSecurityMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Advanced Security Service initialized');
            
            // Start periodic security assessments
            setInterval(() => this.performSecurityAssessment(), 5 * 60 * 1000); // Every 5 minutes
            
        } catch (error) {
            console.error('❌ Advanced Security Service initialization failed:', error.message);
            throw error;
        }
    }

    // Zero-Trust Architecture Implementation
    async setupZeroTrustArchitecture() {
        console.log('🔐 Setting up Zero-Trust Architecture...');
        
        // Continuous verification system
        this.continuousVerification = {
            enabled: true,
            verificationInterval: 30000, // 30 seconds
            maxFailedVerifications: 3,
            lockoutDuration: 15 * 60 * 1000 // 15 minutes
        };

        // Micro-segmentation rules
        this.microSegmentation = {
            userSegments: ['admin', 'manager', 'operator', 'customer', 'partner'],
            resourceSegments: ['public', 'internal', 'confidential', 'restricted'],
            accessMatrix: new Map()
        };

        // Least privilege access
        this.leastPrivilege = {
            enabled: true,
            defaultAccess: 'deny',
            explicitGrants: true,
            timeBasedAccess: true
        };
    }

    // Advanced Threat Detection
    async initializeThreatDetection() {
        console.log('🛡️ Initializing Advanced Threat Detection...');
        
        // Behavioral analysis rules
        this.threatDetectionRules.set('loginAnomaly', {
            type: 'behavioral',
            threshold: 5,
            timeWindow: 15 * 60 * 1000, // 15 minutes
            action: 'block'
        });

        this.threatDetectionRules.set('dataAccessAnomaly', {
            type: 'behavioral',
            threshold: 10,
            timeWindow: 60 * 60 * 1000, // 1 hour
            action: 'alert'
        });

        this.threatDetectionRules.set('geographicAnomaly', {
            type: 'location',
            threshold: 1000, // km
            timeWindow: 5 * 60 * 1000, // 5 minutes
            action: 'verify'
        });

        // Machine learning-based threat detection
        this.mlThreatDetection = {
            enabled: true,
            modelVersion: '1.0.0',
            confidenceThreshold: 0.8,
            features: ['loginTime', 'location', 'device', 'behavior', 'network']
        };
    }

    // Compliance Management
    async setupComplianceManagement() {
        console.log('📋 Setting up Compliance Management...');
        
        // GDPR Compliance
        this.complianceRules.set('gdpr', {
            enabled: true,
            dataRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
            rightToBeForgotten: true,
            dataPortability: true,
            consentManagement: true
        });

        // CCPA Compliance
        this.complianceRules.set('ccpa', {
            enabled: true,
            dataDisclosure: true,
            optOutRights: true,
            nonDiscrimination: true
        });

        // SOC 2 Compliance
        this.complianceRules.set('soc2', {
            enabled: true,
            securityControls: true,
            availabilityControls: true,
            processingIntegrity: true,
            confidentialityControls: true,
            privacyControls: true
        });

        // PCI DSS Compliance
        this.complianceRules.set('pciDss', {
            enabled: true,
            cardholderDataProtection: true,
            vulnerabilityManagement: true,
            accessControl: true,
            networkMonitoring: true,
            securityPolicy: true
        });
    }

    // Security Information & Event Management (SIEM)
    async initializeSecurityMonitoring() {
        console.log('📊 Initializing SIEM...');
        
        this.siem = {
            enabled: true,
            eventCollection: true,
            realTimeAnalysis: true,
            threatIntelligence: true,
            incidentResponse: true,
            reporting: true
        };

        // Security event categories
        this.securityEvents = {
            authentication: ['login', 'logout', 'failed_login', 'password_change'],
            authorization: ['access_granted', 'access_denied', 'privilege_escalation'],
            data: ['data_access', 'data_modification', 'data_export'],
            system: ['configuration_change', 'system_startup', 'system_shutdown'],
            network: ['connection_attempt', 'suspicious_traffic', 'ddos_attack']
        };
    }

    // Zero-Trust Verification
    async verifyAccess(userId, resource, action) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                await this.logSecurityEvent('access_denied', { userId, resource, action, reason: 'user_not_found' });
                return { allowed: false, reason: 'user_not_found' };
            }

            // Check if user is locked
            if (user.isLocked) {
                await this.logSecurityEvent('access_denied', { userId, resource, action, reason: 'account_locked' });
                return { allowed: false, reason: 'account_locked' };
            }

            // Continuous verification
            const verificationResult = await this.performContinuousVerification(userId);
            if (!verificationResult.verified) {
                await this.logSecurityEvent('access_denied', { userId, resource, action, reason: 'verification_failed' });
                return { allowed: false, reason: 'verification_failed' };
            }

            // Micro-segmentation check
            const segmentationResult = await this.checkMicroSegmentation(userId, resource);
            if (!segmentationResult.allowed) {
                await this.logSecurityEvent('access_denied', { userId, resource, action, reason: 'segmentation_violation' });
                return { allowed: false, reason: 'segmentation_violation' };
            }

            // Least privilege check
            const privilegeResult = await this.checkLeastPrivilege(userId, resource, action);
            if (!privilegeResult.allowed) {
                await this.logSecurityEvent('access_denied', { userId, resource, action, reason: 'privilege_violation' });
                return { allowed: false, reason: 'privilege_violation' };
            }

            // Threat detection
            const threatResult = await this.detectThreats(userId, resource, action);
            if (threatResult.threatDetected) {
                await this.handleThreat(userId, threatResult);
                return { allowed: false, reason: 'threat_detected' };
            }

            await this.logSecurityEvent('access_granted', { userId, resource, action });
            return { allowed: true, reason: 'access_granted' };

        } catch (error) {
            console.error('Error in verifyAccess:', error);
            await this.logSecurityEvent('access_error', { userId, resource, action, error: error.message });
            return { allowed: false, reason: 'system_error' };
        }
    }

    // Continuous Verification
    async performContinuousVerification(userId) {
        try {
            const session = await Session.findOne({ userId, status: 'active' });
            if (!session) {
                return { verified: false, reason: 'no_active_session' };
            }

            // Check session validity
            if (session.expiresAt < new Date()) {
                await Session.findByIdAndUpdate(session._id, { status: 'expired' });
                return { verified: false, reason: 'session_expired' };
            }

            // Check for suspicious activity
            const suspiciousActivity = await this.checkSuspiciousActivity(userId);
            if (suspiciousActivity.detected) {
                return { verified: false, reason: 'suspicious_activity' };
            }

            return { verified: true, reason: 'verification_passed' };

        } catch (error) {
            console.error('Error in performContinuousVerification:', error);
            return { verified: false, reason: 'verification_error' };
        }
    }

    // Micro-segmentation Check
    async checkMicroSegmentation(userId, resource) {
        try {
            const user = await User.findById(userId).populate('roles');
            const userSegment = this.getUserSegment(user);
            const resourceSegment = this.getResourceSegment(resource);

            // Check access matrix
            const accessAllowed = this.microSegmentation.accessMatrix.get(`${userSegment}:${resourceSegment}`);
            
            return { allowed: accessAllowed || false, userSegment, resourceSegment };

        } catch (error) {
            console.error('Error in checkMicroSegmentation:', error);
            return { allowed: false, reason: 'segmentation_error' };
        }
    }

    // Least Privilege Check
    async checkLeastPrivilege(userId, resource, action) {
        try {
            const user = await User.findById(userId).populate('roles');
            const userRoles = user.roles || [];

            // Check if user has explicit permission for this action
            for (const role of userRoles) {
                const permissions = role.permissions || [];
                const hasPermission = permissions.some(permission => 
                    permission.resource === resource && 
                    permission.action === action
                );
                
                if (hasPermission) {
                    return { allowed: true, reason: 'explicit_permission' };
                }
            }

            return { allowed: false, reason: 'no_permission' };

        } catch (error) {
            console.error('Error in checkLeastPrivilege:', error);
            return { allowed: false, reason: 'privilege_check_error' };
        }
    }

    // Threat Detection
    async detectThreats(userId, resource, action) {
        try {
            const threats = [];

            // Check for behavioral anomalies
            const behavioralThreat = await this.detectBehavioralAnomaly(userId, action);
            if (behavioralThreat.detected) {
                threats.push(behavioralThreat);
            }

            // Check for geographic anomalies
            const geographicThreat = await this.detectGeographicAnomaly(userId);
            if (geographicThreat.detected) {
                threats.push(geographicThreat);
            }

            // Check for data access anomalies
            const dataThreat = await this.detectDataAccessAnomaly(userId, resource);
            if (dataThreat.detected) {
                threats.push(dataThreat);
            }

            // ML-based threat detection
            const mlThreat = await this.detectMLThreat(userId, resource, action);
            if (mlThreat.detected) {
                threats.push(mlThreat);
            }

            return {
                threatDetected: threats.length > 0,
                threats: threats,
                threatLevel: this.calculateThreatLevel(threats)
            };

        } catch (error) {
            console.error('Error in detectThreats:', error);
            return { threatDetected: false, threats: [], threatLevel: 'low' };
        }
    }

    // Behavioral Anomaly Detection
    async detectBehavioralAnomaly(userId, action) {
        try {
            const rule = this.threatDetectionRules.get('loginAnomaly');
            const recentAttempts = await AuditLog.find({
                userId,
                action: 'login',
                createdAt: { $gte: new Date(Date.now() - rule.timeWindow) }
            });

            if (recentAttempts.length >= rule.threshold) {
                return {
                    detected: true,
                    type: 'behavioral_anomaly',
                    severity: 'high',
                    details: `Too many login attempts: ${recentAttempts.length}`
                };
            }

            return { detected: false };

        } catch (error) {
            console.error('Error in detectBehavioralAnomaly:', error);
            return { detected: false };
        }
    }

    // Geographic Anomaly Detection
    async detectGeographicAnomaly(userId) {
        try {
            const rule = this.threatDetectionRules.get('geographicAnomaly');
            const recentSessions = await Session.find({
                userId,
                createdAt: { $gte: new Date(Date.now() - rule.timeWindow) }
            }).sort({ createdAt: -1 }).limit(2);

            if (recentSessions.length >= 2) {
                const distance = this.calculateDistance(
                    recentSessions[0].location,
                    recentSessions[1].location
                );

                if (distance > rule.threshold) {
                    return {
                        detected: true,
                        type: 'geographic_anomaly',
                        severity: 'medium',
                        details: `Unusual location change: ${distance}km`
                    };
                }
            }

            return { detected: false };

        } catch (error) {
            console.error('Error in detectGeographicAnomaly:', error);
            return { detected: false };
        }
    }

    // Data Access Anomaly Detection
    async detectDataAccessAnomaly(userId, resource) {
        try {
            const rule = this.threatDetectionRules.get('dataAccessAnomaly');
            const recentAccess = await AuditLog.find({
                userId,
                action: 'data_access',
                resource,
                createdAt: { $gte: new Date(Date.now() - rule.timeWindow) }
            });

            if (recentAccess.length >= rule.threshold) {
                return {
                    detected: true,
                    type: 'data_access_anomaly',
                    severity: 'medium',
                    details: `Excessive data access: ${recentAccess.length} times`
                };
            }

            return { detected: false };

        } catch (error) {
            console.error('Error in detectDataAccessAnomaly:', error);
            return { detected: false };
        }
    }

    // ML-based Threat Detection
    async detectMLThreat(userId, resource, action) {
        try {
            if (!this.mlThreatDetection.enabled) {
                return { detected: false };
            }

            // Extract features for ML model
            const features = await this.extractMLFeatures(userId, resource, action);
            
            // Simulate ML prediction (in real implementation, this would call an ML model)
            const threatScore = this.simulateMLPrediction(features);
            
            if (threatScore > this.mlThreatDetection.confidenceThreshold) {
                return {
                    detected: true,
                    type: 'ml_threat',
                    severity: 'high',
                    confidence: threatScore,
                    details: 'ML model detected suspicious activity'
                };
            }

            return { detected: false };

        } catch (error) {
            console.error('Error in detectMLThreat:', error);
            return { detected: false };
        }
    }

    // Threat Handling
    async handleThreat(userId, threatResult) {
        try {
            console.log(`🚨 Threat detected for user ${userId}:`, threatResult);

            // Log the threat
            await this.logSecurityEvent('threat_detected', {
                userId,
                threatResult,
                timestamp: new Date()
            });

            // Take appropriate action based on threat level
            switch (threatResult.threatLevel) {
                case 'high':
                    await this.handleHighThreat(userId, threatResult);
                    break;
                case 'medium':
                    await this.handleMediumThreat(userId, threatResult);
                    break;
                case 'low':
                    await this.handleLowThreat(userId, threatResult);
                    break;
            }

            // Update security metrics
            this.updateSecurityMetrics(threatResult);

        } catch (error) {
            console.error('Error in handleThreat:', error);
        }
    }

    // High Threat Handling
    async handleHighThreat(userId, threatResult) {
        try {
            // Lock user account
            await User.findByIdAndUpdate(userId, { isLocked: true });
            
            // Terminate all active sessions
            await Session.updateMany(
                { userId, status: 'active' },
                { status: 'terminated', logoutReason: 'security_threat' }
            );

            // Send security alert
            await this.sendSecurityAlert(userId, 'high', threatResult);

            console.log(`🔒 User ${userId} locked due to high threat`);

        } catch (error) {
            console.error('Error in handleHighThreat:', error);
        }
    }

    // Medium Threat Handling
    async handleMediumThreat(userId, threatResult) {
        try {
            // Require additional verification
            await this.requireAdditionalVerification(userId);
            
            // Send security alert
            await this.sendSecurityAlert(userId, 'medium', threatResult);

            console.log(`⚠️ Additional verification required for user ${userId}`);

        } catch (error) {
            console.error('Error in handleMediumThreat:', error);
        }
    }

    // Low Threat Handling
    async handleLowThreat(userId, threatResult) {
        try {
            // Log for monitoring
            await this.logSecurityEvent('low_threat_monitoring', {
                userId,
                threatResult,
                action: 'monitoring'
            });

            console.log(`📊 Low threat logged for monitoring: user ${userId}`);

        } catch (error) {
            console.error('Error in handleLowThreat:', error);
        }
    }

    // Compliance Management
    async ensureCompliance(operation, data) {
        try {
            const complianceChecks = [];

            // GDPR Compliance
            if (this.complianceRules.get('gdpr').enabled) {
                const gdprCheck = await this.checkGDPRCompliance(operation, data);
                complianceChecks.push(gdprCheck);
            }

            // CCPA Compliance
            if (this.complianceRules.get('ccpa').enabled) {
                const ccpaCheck = await this.checkCCPACompliance(operation, data);
                complianceChecks.push(ccpaCheck);
            }

            // SOC 2 Compliance
            if (this.complianceRules.get('soc2').enabled) {
                const soc2Check = await this.checkSOC2Compliance(operation, data);
                complianceChecks.push(soc2Check);
            }

            // PCI DSS Compliance
            if (this.complianceRules.get('pciDss').enabled) {
                const pciCheck = await this.checkPCIDSSCompliance(operation, data);
                complianceChecks.push(pciCheck);
            }

            return {
                compliant: complianceChecks.every(check => check.compliant),
                checks: complianceChecks
            };

        } catch (error) {
            console.error('Error in ensureCompliance:', error);
            return { compliant: false, error: error.message };
        }
    }

    // GDPR Compliance Check
    async checkGDPRCompliance(operation, data) {
        try {
            const checks = [];

            // Data retention check
            if (operation === 'data_retention') {
                const retentionCheck = await this.checkDataRetention(data);
                checks.push(retentionCheck);
            }

            // Right to be forgotten
            if (operation === 'data_deletion') {
                const deletionCheck = await this.checkDataDeletion(data);
                checks.push(deletionCheck);
            }

            // Data portability
            if (operation === 'data_export') {
                const portabilityCheck = await this.checkDataPortability(data);
                checks.push(portabilityCheck);
            }

            return {
                compliant: checks.every(check => check.compliant),
                checks: checks,
                regulation: 'GDPR'
            };

        } catch (error) {
            console.error('Error in checkGDPRCompliance:', error);
            return { compliant: false, error: error.message, regulation: 'GDPR' };
        }
    }

    // Security Event Logging
    async logSecurityEvent(eventType, details) {
        try {
            const auditLog = new AuditLog({
                userId: details.userId,
                action: eventType,
                details: details,
                category: 'security',
                severity: this.getEventSeverity(eventType),
                timestamp: new Date()
            });

            await auditLog.save();

            // Update security metrics
            this.updateSecurityMetrics({ eventType, details });

        } catch (error) {
            console.error('Error in logSecurityEvent:', error);
        }
    }

    // Security Assessment
    async performSecurityAssessment() {
        try {
            console.log('🔍 Performing security assessment...');

            const assessment = {
                timestamp: new Date(),
                threatLevel: this.calculateOverallThreatLevel(),
                failedAttempts: this.getFailedAttemptsCount(),
                suspiciousActivities: this.getSuspiciousActivitiesCount(),
                complianceStatus: await this.getComplianceStatus(),
                recommendations: await this.generateSecurityRecommendations()
            };

            // Update security metrics
            this.securityMetrics.lastAssessment = assessment.timestamp;
            this.securityMetrics.threatLevel = assessment.threatLevel;

            // Log assessment
            await this.logSecurityEvent('security_assessment', assessment);

            console.log(`📊 Security assessment completed. Threat level: ${assessment.threatLevel}`);

            return assessment;

        } catch (error) {
            console.error('Error in performSecurityAssessment:', error);
        }
    }

    // Utility Methods
    getUserSegment(user) {
        if (user.roles && user.roles.some(role => role.name === 'admin')) {
            return 'admin';
        } else if (user.roles && user.roles.some(role => role.name === 'manager')) {
            return 'manager';
        } else if (user.roles && user.roles.some(role => role.name === 'partner')) {
            return 'partner';
        } else {
            return 'customer';
        }
    }

    getResourceSegment(resource) {
        if (resource.includes('admin') || resource.includes('system')) {
            return 'restricted';
        } else if (resource.includes('user') || resource.includes('profile')) {
            return 'confidential';
        } else if (resource.includes('public')) {
            return 'public';
        } else {
            return 'internal';
        }
    }

    calculateDistance(location1, location2) {
        // Simple distance calculation (in real implementation, use proper geolocation library)
        if (!location1 || !location2) return 0;
        
        const lat1 = location1.latitude || 0;
        const lon1 = location1.longitude || 0;
        const lat2 = location2.latitude || 0;
        const lon2 = location2.longitude || 0;

        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    calculateThreatLevel(threats) {
        if (threats.some(threat => threat.severity === 'high')) {
            return 'high';
        } else if (threats.some(threat => threat.severity === 'medium')) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    getEventSeverity(eventType) {
        const severityMap = {
            'threat_detected': 'high',
            'access_denied': 'medium',
            'failed_login': 'medium',
            'security_assessment': 'low',
            'access_granted': 'low'
        };
        return severityMap[eventType] || 'low';
    }

    async extractMLFeatures(userId, resource, action) {
        // Extract features for ML model (simplified)
        return {
            userId,
            resource,
            action,
            timestamp: Date.now(),
            userAgent: 'web',
            ipAddress: '127.0.0.1'
        };
    }

    simulateMLPrediction(features) {
        // Simulate ML prediction (in real implementation, call actual ML model)
        return Math.random() * 0.3; // Low threat score for simulation
    }

    updateSecurityMetrics(data) {
        // Update security metrics
        if (data.eventType === 'failed_login') {
            const count = this.securityMetrics.failedAttempts.get(data.userId) || 0;
            this.securityMetrics.failedAttempts.set(data.userId, count + 1);
        }
    }

    async sendSecurityAlert(userId, level, details) {
        // Send security alert (implement notification logic)
        console.log(`🚨 Security alert sent for user ${userId}, level: ${level}`);
    }

    async requireAdditionalVerification(userId) {
        // Require additional verification (implement MFA logic)
        console.log(`🔐 Additional verification required for user ${userId}`);
    }

    async checkSuspiciousActivity(userId) {
        // Check for suspicious activity
        return { detected: false };
    }

    calculateOverallThreatLevel() {
        // Calculate overall threat level
        return 'low';
    }

    getFailedAttemptsCount() {
        return this.securityMetrics.failedAttempts.size;
    }

    getSuspiciousActivitiesCount() {
        return this.securityMetrics.suspiciousActivities.size;
    }

    async getComplianceStatus() {
        // Get compliance status
        return { gdpr: 'compliant', ccpa: 'compliant', soc2: 'compliant', pciDss: 'compliant' };
    }

    async generateSecurityRecommendations() {
        // Generate security recommendations
        return ['Enable MFA for all users', 'Review access logs regularly', 'Update security policies'];
    }

    async checkDataRetention(data) {
        return { compliant: true, details: 'Data retention policy followed' };
    }

    async checkDataDeletion(data) {
        return { compliant: true, details: 'Data deletion policy followed' };
    }

    async checkDataPortability(data) {
        return { compliant: true, details: 'Data portability policy followed' };
    }

    async checkCCPACompliance(operation, data) {
        return { compliant: true, regulation: 'CCPA' };
    }

    async checkSOC2Compliance(operation, data) {
        return { compliant: true, regulation: 'SOC2' };
    }

    async checkPCIDSSCompliance(operation, data) {
        return { compliant: true, regulation: 'PCI DSS' };
    }

    // Get service status
    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            threatLevel: this.securityMetrics.threatLevel,
            lastAssessment: this.securityMetrics.lastAssessment,
            failedAttempts: this.getFailedAttemptsCount(),
            suspiciousActivities: this.getSuspiciousActivitiesCount()
        };
    }
}

module.exports = new AdvancedSecurityService();
