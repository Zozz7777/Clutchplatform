const { logger } = require('../config/logger');
const crypto = require('crypto');

/**
 * Fraud Detection Service
 * AI-powered fraud prevention and risk assessment
 */
class FraudDetectionService {
  constructor() {
    this.riskRules = new Map();
    this.userBehaviorPatterns = new Map();
    this.suspiciousActivities = new Map();
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
      critical: 0.9
    };
    this.initializeRiskRules();
  }

  /**
   * Initialize risk assessment rules
   */
  initializeRiskRules() {
    // Location-based rules
    this.riskRules.set('location_mismatch', {
      weight: 0.4,
      check: (data) => {
        const { userLocation, transactionLocation, userHistory } = data;
        if (!userLocation || !transactionLocation) return 0;
        
        const distance = this.calculateDistance(
          userLocation.lat, userLocation.lng,
          transactionLocation.lat, transactionLocation.lng
        );
        
        // High risk if transaction is far from user's usual location
        if (distance > 100) return 0.8; // 100km
        if (distance > 50) return 0.5;  // 50km
        if (distance > 20) return 0.2;  // 20km
        return 0;
      }
    });

    // Time-based rules
    this.riskRules.set('unusual_time', {
      weight: 0.3,
      check: (data) => {
        const { transactionTime, userHistory } = data;
        const hour = new Date(transactionTime).getHours();
        
        // High risk for transactions between 2 AM and 6 AM
        if (hour >= 2 && hour <= 6) return 0.7;
        if (hour >= 22 || hour <= 8) return 0.4;
        return 0;
      }
    });

    // Amount-based rules
    this.riskRules.set('unusual_amount', {
      weight: 0.5,
      check: (data) => {
        const { amount, userHistory, averageAmount } = data;
        
        if (!userHistory || userHistory.length === 0) return 0.3;
        
        const userAvg = averageAmount || this.calculateAverageAmount(userHistory);
        const ratio = amount / userAvg;
        
        if (ratio > 5) return 0.9;  // 5x average
        if (ratio > 3) return 0.7;  // 3x average
        if (ratio > 2) return 0.4;  // 2x average
        return 0;
      }
    });

    // Frequency-based rules
    this.riskRules.set('high_frequency', {
      weight: 0.4,
      check: (data) => {
        const { userHistory, timeWindow } = data;
        const window = timeWindow || 3600000; // 1 hour default
        const recentTransactions = userHistory.filter(t => 
          Date.now() - new Date(t.timestamp).getTime() < window
        );
        
        if (recentTransactions.length > 10) return 0.8;
        if (recentTransactions.length > 5) return 0.5;
        if (recentTransactions.length > 3) return 0.3;
        return 0;
      }
    });

    // Device-based rules
    this.riskRules.set('new_device', {
      weight: 0.3,
      check: (data) => {
        const { deviceId, userHistory } = data;
        if (!deviceId || !userHistory) return 0;
        
        const knownDevices = new Set(userHistory.map(t => t.deviceId).filter(Boolean));
        if (!knownDevices.has(deviceId)) return 0.6;
        return 0;
      }
    });

    // Payment method rules
    this.riskRules.set('payment_method_risk', {
      weight: 0.4,
      check: (data) => {
        const { paymentMethod, userHistory } = data;
        
        // Higher risk for new payment methods
        const knownMethods = new Set(userHistory.map(t => t.paymentMethod).filter(Boolean));
        if (!knownMethods.has(paymentMethod)) return 0.5;
        
        // Higher risk for certain payment methods
        const highRiskMethods = ['crypto', 'gift_card', 'prepaid_card'];
        if (highRiskMethods.includes(paymentMethod)) return 0.7;
        
        return 0;
      }
    });
  }

  /**
   * Assess risk for a transaction
   */
  async assessRisk(transactionData) {
    try {
      const riskScores = {};
      let totalRiskScore = 0;
      let totalWeight = 0;

      // Apply each risk rule
      for (const [ruleName, rule] of this.riskRules) {
        const score = rule.check(transactionData);
        riskScores[ruleName] = score;
        totalRiskScore += score * rule.weight;
        totalWeight += rule.weight;
      }

      // Calculate weighted average risk score
      const finalRiskScore = totalWeight > 0 ? totalRiskScore / totalWeight : 0;

      // Determine risk level
      const riskLevel = this.getRiskLevel(finalRiskScore);

      // Generate risk assessment
      const assessment = {
        riskScore: finalRiskScore,
        riskLevel,
        riskFactors: Object.entries(riskScores)
          .filter(([_, score]) => score > 0)
          .map(([rule, score]) => ({ rule, score })),
        recommendations: this.getRecommendations(riskLevel, riskScores),
        timestamp: new Date().toISOString()
      };

      // Log suspicious activities
      if (riskLevel === 'high' || riskLevel === 'critical') {
        await this.logSuspiciousActivity(transactionData, assessment);
      }

      // Update user behavior patterns
      await this.updateUserBehaviorPatterns(transactionData, assessment);

      return assessment;
    } catch (error) {
      logger.error('Risk assessment error:', error);
      return {
        riskScore: 0.5,
        riskLevel: 'medium',
        riskFactors: [],
        recommendations: ['Unable to complete risk assessment'],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get risk level based on score
   */
  getRiskLevel(score) {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    if (score >= this.riskThresholds.low) return 'low';
    return 'minimal';
  }

  /**
   * Get recommendations based on risk level
   */
  getRecommendations(riskLevel, riskScores) {
    const recommendations = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('Block transaction immediately');
        recommendations.push('Require additional verification');
        recommendations.push('Contact customer support');
        break;
      case 'high':
        recommendations.push('Require 2FA verification');
        recommendations.push('Request additional documentation');
        recommendations.push('Monitor for suspicious activity');
        break;
      case 'medium':
        recommendations.push('Require SMS verification');
        recommendations.push('Review transaction details');
        break;
      case 'low':
        recommendations.push('Proceed with caution');
        recommendations.push('Monitor for patterns');
        break;
      default:
        recommendations.push('Transaction appears safe');
    }

    // Add specific recommendations based on risk factors
    if (riskScores.location_mismatch > 0.5) {
      recommendations.push('Verify user location');
    }
    if (riskScores.unusual_amount > 0.5) {
      recommendations.push('Verify transaction amount');
    }
    if (riskScores.new_device > 0.5) {
      recommendations.push('Verify device authentication');
    }

    return recommendations;
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(transactionData, assessment) {
    try {
      const activity = {
        userId: transactionData.userId,
        transactionId: transactionData.transactionId,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        riskFactors: assessment.riskFactors,
        transactionData: {
          amount: transactionData.amount,
          location: transactionData.location,
          deviceId: transactionData.deviceId,
          paymentMethod: transactionData.paymentMethod,
          timestamp: transactionData.timestamp
        },
        timestamp: new Date().toISOString()
      };

      // Store in database
      const dbService = require('./databaseService');
      await dbService.create('suspicious_activities', activity);

      // Send alert to security team
      await this.sendSecurityAlert(activity);

      logger.warn('Suspicious activity detected:', activity);
    } catch (error) {
      logger.error('Error logging suspicious activity:', error);
    }
  }

  /**
   * Update user behavior patterns
   */
  async updateUserBehaviorPatterns(transactionData, assessment) {
    try {
      const userId = transactionData.userId;
      const patterns = this.userBehaviorPatterns.get(userId) || {
        transactionCount: 0,
        totalAmount: 0,
        averageAmount: 0,
        locations: new Set(),
        devices: new Set(),
        paymentMethods: new Set(),
        riskScores: [],
        lastUpdated: new Date()
      };

      // Update patterns
      patterns.transactionCount++;
      patterns.totalAmount += transactionData.amount;
      patterns.averageAmount = patterns.totalAmount / patterns.transactionCount;
      patterns.locations.add(JSON.stringify(transactionData.location));
      patterns.devices.add(transactionData.deviceId);
      patterns.paymentMethods.add(transactionData.paymentMethod);
      patterns.riskScores.push(assessment.riskScore);
      patterns.lastUpdated = new Date();

      // Keep only last 100 risk scores
      if (patterns.riskScores.length > 100) {
        patterns.riskScores = patterns.riskScores.slice(-100);
      }

      this.userBehaviorPatterns.set(userId, patterns);

      // Store in database periodically
      if (patterns.transactionCount % 10 === 0) {
        const dbService = require('./databaseService');
        await dbService.updateOne(
          'user_behavior_patterns',
          { userId },
          {
            ...patterns,
            locations: Array.from(patterns.locations),
            devices: Array.from(patterns.devices),
            paymentMethods: Array.from(patterns.paymentMethods)
          },
          { upsert: true }
        );
      }
    } catch (error) {
      logger.error('Error updating behavior patterns:', error);
    }
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(activity) {
    try {
      const notificationService = require('./notificationService');
      
      await notificationService.sendEmail({
        to: process.env.SECURITY_TEAM_EMAIL || 'security@clutch.com',
        subject: `🚨 High Risk Transaction Alert - ${activity.riskLevel.toUpperCase()}`,
        template: 'security-alert',
        data: {
          riskLevel: activity.riskLevel,
          riskScore: activity.riskScore,
          userId: activity.userId,
          amount: activity.transactionData.amount,
          location: activity.transactionData.location,
          timestamp: activity.timestamp,
          riskFactors: activity.riskFactors
        }
      });
    } catch (error) {
      logger.error('Error sending security alert:', error);
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate average amount from transaction history
   */
  calculateAverageAmount(history) {
    if (!history || history.length === 0) return 0;
    const total = history.reduce((sum, t) => sum + t.amount, 0);
    return total / history.length;
  }

  /**
   * Get fraud detection statistics
   */
  getStats() {
    const totalActivities = this.suspiciousActivities.size;
    const highRiskActivities = Array.from(this.suspiciousActivities.values())
      .filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length;

    return {
      totalActivities,
      highRiskActivities,
      riskThresholds: this.riskThresholds,
      activeRules: this.riskRules.size,
      trackedUsers: this.userBehaviorPatterns.size
    };
  }

  /**
   * Update risk thresholds
   */
  updateRiskThresholds(newThresholds) {
    this.riskThresholds = { ...this.riskThresholds, ...newThresholds };
    logger.info('Risk thresholds updated:', this.riskThresholds);
  }

  /**
   * Add custom risk rule
   */
  addRiskRule(name, rule) {
    this.riskRules.set(name, rule);
    logger.info(`Custom risk rule added: ${name}`);
  }
}

// Create singleton instance
const fraudDetectionService = new FraudDetectionService();

module.exports = fraudDetectionService;
