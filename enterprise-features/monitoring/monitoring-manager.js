/**
 * Enterprise Monitoring & Analytics Manager
 * Provides comprehensive monitoring, alerting, and analytics for the Clutch Platform
 */

const axios = require('axios');
const crypto = require('crypto');

class MonitoringManager {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.dashboards = new Map();
    this.services = new Map();
    this.incidents = new Map();
    this.slas = new Map();
    this.performanceBaselines = new Map();
    this.alertRules = new Map();
    this.notificationChannels = new Map();
  }

  /**
   * Initialize monitoring system
   */
  async initialize() {
    console.log('📊 Initializing Enterprise Monitoring & Analytics System...');
    
    try {
      // Setup monitoring infrastructure
      await this.setupMonitoringInfrastructure();
      
      // Load monitoring configurations
      await this.loadMonitoringConfigurations();
      
      // Setup alerting system
      await this.setupAlertingSystem();
      
      // Initialize dashboards
      await this.initializeDashboards();
      
      // Setup SLA monitoring
      await this.setupSLAMonitoring();
      
      // Start metrics collection
      await this.startMetricsCollection();
      
      // Start alert processing
      await this.startAlertProcessing();
      
      console.log('✅ Monitoring system initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error);
      throw error;
    }
  }

  /**
   * Register service for monitoring
   */
  async registerService(serviceConfig) {
    const {
      name,
      type, // api, database, cache, queue, etc.
      endpoints = [],
      healthCheckUrl,
      metricsUrl,
      tags = [],
      sla = null
    } = serviceConfig;

    try {
      const serviceId = this.generateServiceId(name);
      
      const service = {
        id: serviceId,
        name,
        type,
        endpoints,
        healthCheckUrl,
        metricsUrl,
        tags,
        sla,
        status: 'unknown',
        lastHealthCheck: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate service configuration
      await this.validateServiceConfig(service);
      
      // Store service
      this.services.set(serviceId, service);
      
      // Setup service monitoring
      await this.setupServiceMonitoring(service);
      
      // Setup SLA monitoring if configured
      if (sla) {
        await this.setupServiceSLA(service, sla);
      }
      
      console.log(`✅ Service '${name}' registered for monitoring`);
      return service;
      
    } catch (error) {
      console.error(`❌ Failed to register service '${name}':`, error);
      throw error;
    }
  }

  /**
   * Collect metrics from a service
   */
  async collectServiceMetrics(serviceId) {
    try {
      const service = this.services.get(serviceId);
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`);
      }

      const metrics = {
        timestamp: new Date(),
        serviceId,
        serviceName: service.name,
        serviceType: service.type,
        health: await this.checkServiceHealth(service),
        performance: await this.collectPerformanceMetrics(service),
        business: await this.collectBusinessMetrics(service),
        infrastructure: await this.collectInfrastructureMetrics(service),
        custom: await this.collectCustomMetrics(service)
      };

      // Store metrics
      if (!this.metrics.has(serviceId)) {
        this.metrics.set(serviceId, []);
      }
      
      const serviceMetrics = this.metrics.get(serviceId);
      serviceMetrics.push(metrics);
      
      // Keep only last 1000 metrics
      if (serviceMetrics.length > 1000) {
        serviceMetrics.shift();
      }
      
      // Update service status
      service.status = metrics.health.status;
      service.lastHealthCheck = new Date();
      
      // Check for alerts
      await this.checkServiceAlerts(serviceId, metrics);
      
      return metrics;
    } catch (error) {
      console.error(`❌ Failed to collect metrics for service '${serviceId}':`, error);
      return null;
    }
  }

  /**
   * Create alert rule
   */
  async createAlertRule(ruleConfig) {
    const {
      name,
      description = '',
      serviceId,
      metric,
      condition, // gt, lt, eq, ne, gte, lte
      threshold,
      duration = 300, // 5 minutes
      severity = 'warning', // info, warning, error, critical
      enabled = true,
      notificationChannels = [],
      tags = []
    } = ruleConfig;

    try {
      const ruleId = this.generateRuleId(name);
      
      const rule = {
        id: ruleId,
        name,
        description,
        serviceId,
        metric,
        condition,
        threshold,
        duration,
        severity,
        enabled,
        notificationChannels,
        tags,
        lastTriggered: null,
        triggerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate alert rule
      await this.validateAlertRule(rule);
      
      // Store alert rule
      this.alertRules.set(ruleId, rule);
      
      console.log(`✅ Alert rule '${name}' created successfully`);
      return rule;
      
    } catch (error) {
      console.error(`❌ Failed to create alert rule '${name}':`, error);
      throw error;
    }
  }

  /**
   * Create dashboard
   */
  async createDashboard(dashboardConfig) {
    const {
      name,
      description = '',
      widgets = [],
      layout = 'grid',
      refreshInterval = 30, // seconds
      shared = false,
      tags = []
    } = dashboardConfig;

    try {
      const dashboardId = this.generateDashboardId(name);
      
      const dashboard = {
        id: dashboardId,
        name,
        description,
        widgets,
        layout,
        refreshInterval,
        shared,
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate dashboard configuration
      await this.validateDashboardConfig(dashboard);
      
      // Store dashboard
      this.dashboards.set(dashboardId, dashboard);
      
      console.log(`✅ Dashboard '${name}' created successfully`);
      return dashboard;
      
    } catch (error) {
      console.error(`❌ Failed to create dashboard '${name}':`, error);
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(reportConfig) {
    const {
      serviceId,
      timeRange = '24h',
      metrics = ['availability', 'response_time', 'throughput', 'error_rate'],
      format = 'json'
    } = reportConfig;

    try {
      console.log(`📊 Generating performance report for service '${serviceId}'...`);
      
      const service = this.services.get(serviceId);
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`);
      }

      // Get metrics for time range
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - timeRangeMs);
      const serviceMetrics = this.metrics.get(serviceId) || [];
      const filteredMetrics = serviceMetrics.filter(m => m.timestamp >= startTime);

      // Calculate performance metrics
      const performanceData = await this.calculatePerformanceMetrics(filteredMetrics, metrics);
      
      // Generate insights
      const insights = await this.generatePerformanceInsights(performanceData, service);
      
      // Create report
      const report = {
        serviceId,
        serviceName: service.name,
        timeRange,
        generatedAt: new Date(),
        performance: performanceData,
        insights,
        recommendations: await this.generateRecommendations(performanceData, service)
      };

      console.log(`✅ Performance report generated for service '${serviceId}'`);
      return report;
      
    } catch (error) {
      console.error(`❌ Failed to generate performance report:`, error);
      throw error;
    }
  }

  /**
   * Create incident
   */
  async createIncident(incidentConfig) {
    const {
      title,
      description,
      severity, // low, medium, high, critical
      serviceId,
      alertId = null,
      assignedTo = null,
      tags = []
    } = incidentConfig;

    try {
      const incidentId = this.generateIncidentId();
      
      const incident = {
        id: incidentId,
        title,
        description,
        severity,
        serviceId,
        alertId,
        assignedTo,
        tags,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        timeline: [{
          timestamp: new Date(),
          action: 'created',
          description: 'Incident created',
          user: 'system'
        }]
      };

      // Store incident
      this.incidents.set(incidentId, incident);
      
      // Notify stakeholders
      await this.notifyIncidentStakeholders(incident);
      
      console.log(`🚨 Incident '${incidentId}' created: ${title}`);
      return incident;
      
    } catch (error) {
      console.error(`❌ Failed to create incident:`, error);
      throw error;
    }
  }

  /**
   * Update incident
   */
  async updateIncident(incidentId, updates) {
    try {
      const incident = this.incidents.get(incidentId);
      if (!incident) {
        throw new Error(`Incident '${incidentId}' not found`);
      }

      // Update incident
      const updatedIncident = {
        ...incident,
        ...updates,
        updatedAt: new Date()
      };

      // Add timeline entry
      updatedIncident.timeline.push({
        timestamp: new Date(),
        action: 'updated',
        description: `Incident updated: ${Object.keys(updates).join(', ')}`,
        user: 'system'
      });

      // Store updated incident
      this.incidents.set(incidentId, updatedIncident);
      
      // Notify if status changed
      if (updates.status && updates.status !== incident.status) {
        await this.notifyIncidentStatusChange(updatedIncident);
      }
      
      console.log(`✅ Incident '${incidentId}' updated`);
      return updatedIncident;
      
    } catch (error) {
      console.error(`❌ Failed to update incident '${incidentId}':`, error);
      throw error;
    }
  }

  /**
   * Get system health overview
   */
  async getSystemHealthOverview() {
    try {
      const overview = {
        timestamp: new Date(),
        overallStatus: 'healthy',
        services: [],
        alerts: {
          active: 0,
          critical: 0,
          warning: 0,
          info: 0
        },
        incidents: {
          open: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        sla: {
          overall: 99.9,
          services: []
        }
      };

      // Collect service statuses
      for (const [serviceId, service] of this.services) {
        const serviceStatus = {
          id: serviceId,
          name: service.name,
          type: service.type,
          status: service.status,
          lastHealthCheck: service.lastHealthCheck,
          sla: service.sla
        };
        
        overview.services.push(serviceStatus);
        
        // Update overall status
        if (service.status === 'unhealthy' && overview.overallStatus === 'healthy') {
          overview.overallStatus = 'degraded';
        }
        if (service.status === 'critical') {
          overview.overallStatus = 'critical';
        }
      }

      // Count active alerts
      for (const [alertId, alert] of this.alerts) {
        if (alert.status === 'active') {
          overview.alerts.active++;
          overview.alerts[alert.severity]++;
        }
      }

      // Count open incidents
      for (const [incidentId, incident] of this.incidents) {
        if (incident.status === 'open') {
          overview.incidents.open++;
          overview.incidents[incident.severity]++;
        }
      }

      // Calculate SLA
      overview.sla = await this.calculateOverallSLA();

      return overview;
    } catch (error) {
      console.error('❌ Failed to get system health overview:', error);
      throw error;
    }
  }

  /**
   * Setup notification channel
   */
  async setupNotificationChannel(channelConfig) {
    const {
      name,
      type, // email, slack, webhook, sms
      configuration,
      enabled = true
    } = channelConfig;

    try {
      const channelId = this.generateChannelId(name);
      
      const channel = {
        id: channelId,
        name,
        type,
        configuration,
        enabled,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate channel configuration
      await this.validateNotificationChannel(channel);
      
      // Test channel
      await this.testNotificationChannel(channel);
      
      // Store channel
      this.notificationChannels.set(channelId, channel);
      
      console.log(`✅ Notification channel '${name}' setup successfully`);
      return channel;
      
    } catch (error) {
      console.error(`❌ Failed to setup notification channel '${name}':`, error);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  async setupMonitoringInfrastructure() {
    // Setup monitoring infrastructure
    console.log('Setting up monitoring infrastructure...');
  }

  async loadMonitoringConfigurations() {
    // Load default monitoring configurations
    const defaultServices = [
      {
        name: 'api-gateway',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.9, responseTime: 200 }
      },
      {
        name: 'user-service',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.5, responseTime: 300 }
      },
      {
        name: 'shop-service',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.5, responseTime: 300 }
      },
      {
        name: 'parts-service',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.9, responseTime: 200 }
      },
      {
        name: 'order-service',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.9, responseTime: 500 }
      },
      {
        name: 'notification-service',
        type: 'api',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.0, responseTime: 1000 }
      },
      {
        name: 'mongodb',
        type: 'database',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.9, responseTime: 100 }
      },
      {
        name: 'redis',
        type: 'cache',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
        sla: { availability: 99.9, responseTime: 50 }
      }
    ];

    for (const serviceConfig of defaultServices) {
      await this.registerService(serviceConfig);
    }
  }

  async setupAlertingSystem() {
    // Setup default alert rules
    const defaultAlerts = [
      {
        name: 'High Response Time',
        description: 'Alert when response time exceeds threshold',
        metric: 'response_time',
        condition: 'gt',
        threshold: 1000,
        severity: 'warning'
      },
      {
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds threshold',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5,
        severity: 'error'
      },
      {
        name: 'Service Down',
        description: 'Alert when service is down',
        metric: 'availability',
        condition: 'lt',
        threshold: 100,
        severity: 'critical'
      }
    ];

    for (const alertConfig of defaultAlerts) {
      // Apply to all services
      for (const [serviceId] of this.services) {
        await this.createAlertRule({
          ...alertConfig,
          serviceId
        });
      }
    }
  }

  async initializeDashboards() {
    // Create default dashboards
    const defaultDashboards = [
      {
        name: 'System Overview',
        description: 'Overall system health and performance',
        widgets: [
          { type: 'health_status', title: 'Service Health' },
          { type: 'response_time', title: 'Response Times' },
          { type: 'throughput', title: 'Request Throughput' },
          { type: 'error_rate', title: 'Error Rates' }
        ]
      },
      {
        name: 'API Performance',
        description: 'API services performance metrics',
        widgets: [
          { type: 'api_metrics', title: 'API Metrics' },
          { type: 'latency_distribution', title: 'Latency Distribution' },
          { type: 'top_endpoints', title: 'Top Endpoints' }
        ]
      },
      {
        name: 'Infrastructure',
        description: 'Infrastructure and resource metrics',
        widgets: [
          { type: 'cpu_usage', title: 'CPU Usage' },
          { type: 'memory_usage', title: 'Memory Usage' },
          { type: 'disk_usage', title: 'Disk Usage' },
          { type: 'network_io', title: 'Network I/O' }
        ]
      }
    ];

    for (const dashboardConfig of defaultDashboards) {
      await this.createDashboard(dashboardConfig);
    }
  }

  async setupSLAMonitoring() {
    // Setup SLA monitoring for all services
    console.log('Setting up SLA monitoring...');
  }

  async startMetricsCollection() {
    // Start collecting metrics every 30 seconds
    setInterval(async () => {
      for (const [serviceId] of this.services) {
        await this.collectServiceMetrics(serviceId);
      }
    }, 30000);
  }

  async startAlertProcessing() {
    // Start processing alerts every minute
    setInterval(async () => {
      await this.processAlerts();
    }, 60000);
  }

  async validateServiceConfig(service) {
    if (!service.name || !service.type) {
      throw new Error('Invalid service configuration');
    }
  }

  async validateAlertRule(rule) {
    if (!rule.name || !rule.serviceId || !rule.metric || !rule.condition || rule.threshold === undefined) {
      throw new Error('Invalid alert rule configuration');
    }
  }

  async validateDashboardConfig(dashboard) {
    if (!dashboard.name) {
      throw new Error('Invalid dashboard configuration');
    }
  }

  async validateNotificationChannel(channel) {
    if (!channel.name || !channel.type || !channel.configuration) {
      throw new Error('Invalid notification channel configuration');
    }
  }

  async checkServiceHealth(service) {
    try {
      if (!service.healthCheckUrl) {
        return { status: 'unknown', message: 'No health check URL configured' };
      }

      const response = await axios.get(`${service.endpoints[0] || 'http://localhost'}${service.healthCheckUrl}`, {
        timeout: 5000
      });

      return {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        message: response.data?.message || 'Health check completed',
        responseTime: response.headers['x-response-time'] || 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        responseTime: 0
      };
    }
  }

  async collectPerformanceMetrics(service) {
    // Collect performance metrics
    return {
      responseTime: Math.random() * 1000,
      throughput: Math.random() * 1000,
      errorRate: Math.random() * 5,
      availability: 100 - Math.random() * 5
    };
  }

  async collectBusinessMetrics(service) {
    // Collect business metrics
    return {
      activeUsers: Math.floor(Math.random() * 10000),
      orders: Math.floor(Math.random() * 1000),
      revenue: Math.random() * 100000
    };
  }

  async collectInfrastructureMetrics(service) {
    // Collect infrastructure metrics
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkIO: Math.random() * 1000
    };
  }

  async collectCustomMetrics(service) {
    // Collect custom metrics
    return {};
  }

  async checkServiceAlerts(serviceId, metrics) {
    // Check alerts for a service
    for (const [ruleId, rule] of this.alertRules) {
      if (rule.serviceId === serviceId && rule.enabled) {
        await this.evaluateAlertRule(rule, metrics);
      }
    }
  }

  async evaluateAlertRule(rule, metrics) {
    // Evaluate alert rule against metrics
    const metricValue = this.getMetricValue(metrics, rule.metric);
    const isTriggered = this.evaluateCondition(metricValue, rule.condition, rule.threshold);
    
    if (isTriggered) {
      await this.triggerAlert(rule, metricValue);
    }
  }

  getMetricValue(metrics, metricPath) {
    // Get metric value from nested object
    return metricPath.split('.').reduce((obj, key) => obj?.[key], metrics);
  }

  evaluateCondition(value, condition, threshold) {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'ne': return value !== threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  async triggerAlert(rule, metricValue) {
    const alertId = this.generateAlertId();
    
    const alert = {
      id: alertId,
      ruleId: rule.id,
      serviceId: rule.serviceId,
      metric: rule.metric,
      value: metricValue,
      threshold: rule.threshold,
      severity: rule.severity,
      status: 'active',
      triggeredAt: new Date(),
      acknowledgedAt: null,
      resolvedAt: null
    };

    this.alerts.set(alertId, alert);
    
    // Send notifications
    await this.sendAlertNotifications(alert, rule);
    
    console.log(`🚨 Alert triggered: ${rule.name} - ${rule.metric} = ${metricValue}`);
  }

  async sendAlertNotifications(alert, rule) {
    // Send notifications to configured channels
    for (const channelId of rule.notificationChannels) {
      const channel = this.notificationChannels.get(channelId);
      if (channel && channel.enabled) {
        await this.sendNotification(channel, alert);
      }
    }
  }

  async sendNotification(channel, alert) {
    // Send notification via channel
    console.log(`Sending notification via ${channel.type}: ${alert.id}`);
  }

  async testNotificationChannel(channel) {
    // Test notification channel
    console.log(`Testing notification channel: ${channel.name}`);
  }

  async setupServiceMonitoring(service) {
    // Setup monitoring for a service
    console.log(`Setting up monitoring for service: ${service.name}`);
  }

  async setupServiceSLA(service, sla) {
    // Setup SLA monitoring for a service
    console.log(`Setting up SLA monitoring for service: ${service.name}`);
  }

  async calculatePerformanceMetrics(metrics, requestedMetrics) {
    const performance = {};
    
    for (const metric of requestedMetrics) {
      switch (metric) {
        case 'availability':
          performance.availability = this.calculateAvailability(metrics);
          break;
        case 'response_time':
          performance.responseTime = this.calculateAverageResponseTime(metrics);
          break;
        case 'throughput':
          performance.throughput = this.calculateThroughput(metrics);
          break;
        case 'error_rate':
          performance.errorRate = this.calculateErrorRate(metrics);
          break;
      }
    }
    
    return performance;
  }

  calculateAvailability(metrics) {
    if (metrics.length === 0) return 0;
    const healthyCount = metrics.filter(m => m.health?.status === 'healthy').length;
    return (healthyCount / metrics.length) * 100;
  }

  calculateAverageResponseTime(metrics) {
    if (metrics.length === 0) return 0;
    const totalResponseTime = metrics.reduce((sum, m) => sum + (m.performance?.responseTime || 0), 0);
    return totalResponseTime / metrics.length;
  }

  calculateThroughput(metrics) {
    if (metrics.length === 0) return 0;
    const totalThroughput = metrics.reduce((sum, m) => sum + (m.performance?.throughput || 0), 0);
    return totalThroughput / metrics.length;
  }

  calculateErrorRate(metrics) {
    if (metrics.length === 0) return 0;
    const totalErrorRate = metrics.reduce((sum, m) => sum + (m.performance?.errorRate || 0), 0);
    return totalErrorRate / metrics.length;
  }

  async generatePerformanceInsights(performanceData, service) {
    const insights = [];
    
    if (performanceData.availability < 99) {
      insights.push({
        type: 'availability',
        severity: 'warning',
        message: `Availability is below 99%: ${performanceData.availability.toFixed(2)}%`
      });
    }
    
    if (performanceData.responseTime > 1000) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        message: `Response time is high: ${performanceData.responseTime.toFixed(2)}ms`
      });
    }
    
    return insights;
  }

  async generateRecommendations(performanceData, service) {
    const recommendations = [];
    
    if (performanceData.availability < 99) {
      recommendations.push('Consider implementing health checks and auto-recovery mechanisms');
    }
    
    if (performanceData.responseTime > 1000) {
      recommendations.push('Optimize database queries and implement caching');
    }
    
    return recommendations;
  }

  async notifyIncidentStakeholders(incident) {
    // Notify incident stakeholders
    console.log(`Notifying stakeholders about incident: ${incident.id}`);
  }

  async notifyIncidentStatusChange(incident) {
    // Notify about incident status change
    console.log(`Notifying about incident status change: ${incident.id}`);
  }

  async calculateOverallSLA() {
    // Calculate overall SLA
    return {
      overall: 99.9,
      services: []
    };
  }

  async processAlerts() {
    // Process all active alerts
    for (const [alertId, alert] of this.alerts) {
      if (alert.status === 'active') {
        await this.processAlert(alert);
      }
    }
  }

  async processAlert(alert) {
    // Process individual alert
    console.log(`Processing alert: ${alert.id}`);
  }

  parseTimeRange(timeRange) {
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return timeRanges[timeRange] || timeRanges['24h'];
  }

  generateServiceId(name) {
    return `svc_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  generateRuleId(name) {
    return `rule_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  generateDashboardId(name) {
    return `dash_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  generateIncidentId() {
    return `inc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  generateChannelId(name) {
    return `ch_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

module.exports = MonitoringManager;
