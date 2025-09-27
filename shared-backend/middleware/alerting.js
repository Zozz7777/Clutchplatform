/**
 * Enhanced Alerting System Middleware
 */

const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const alerts = {
  errors: [],
  warnings: [],
  critical: []
};

const alertThresholds = {
  memory: { warning: 80, critical: 90 },
  cpu: { warning: 80, critical: 90 },
  responseTime: { warning: 2000, critical: 5000 },
  errorRate: { warning: 5, critical: 10 },
  diskSpace: { warning: 80, critical: 90 }
};

const addAlert = (type, message, severity = 'warning', metadata = {}) => {
  const alert = {
    id: Date.now() + Math.random(),
    type,
    message,
    severity,
    timestamp: new Date().toISOString(),
    metadata,
    resolved: false
  };
  
  // Ensure the severity array exists
  if (!alerts[severity]) {
    alerts[severity] = [];
  }
  
  alerts[severity].push(alert);
  
  // Keep only last 50 alerts and remove alerts older than 1 hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  alerts[severity] = alerts[severity]
    .filter(alert => new Date(alert.timestamp).getTime() > oneHourAgo)
    .slice(-50);
  
  logger.warn(`🚨 ${severity.toUpperCase()} ALERT [${type}]: ${message}`);
  
  // Send to external monitoring if configured
  if (process.env.ALERT_WEBHOOK_URL) {
    sendWebhookAlert(alert);
  }
};

const sendWebhookAlert = async (alert) => {
  try {
    const axios = require('axios');
    await axios.post(process.env.ALERT_WEBHOOK_URL, {
      text: `🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.message}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good',
        fields: [
          { title: 'Type', value: alert.type, short: true },
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Timestamp', value: alert.timestamp, short: true }
        ]
      }]
    });
  } catch (error) {
    logger.error('Failed to send webhook alert:', error.message);
  }
};

const checkSystemHealth = () => {
  const { getRenderCompatibleMemoryUsage, getV8HeapUsage } = require('../utils/memory-monitor');
  
  const renderMemory = getRenderCompatibleMemoryUsage();
  const v8Heap = getV8HeapUsage();
  
  // Use Render-compatible memory usage for alerts (matches Render metrics)
  const renderMemoryPercent = renderMemory.usagePercentage;
  const heapUsagePercent = v8Heap.heapUsagePercentage;
  
  // Memory checks using Render-compatible calculation
  if (renderMemoryPercent > alertThresholds.memory.critical) {
    addAlert('memory', `Critical RENDER memory usage: ${renderMemoryPercent.toFixed(1)}% (Heap: ${heapUsagePercent.toFixed(1)}%)`, 'critical', { 
      renderUsage: renderMemoryPercent,
      heapUsage: heapUsagePercent 
    });
  } else if (renderMemoryPercent > alertThresholds.memory.warning) {
    addAlert('memory', `High RENDER memory usage: ${renderMemoryPercent.toFixed(1)}% (Heap: ${heapUsagePercent.toFixed(1)}%)`, 'warning', { 
      renderUsage: renderMemoryPercent,
      heapUsage: heapUsagePercent 
    });
  } else {
    // Log healthy memory status
    logger.debug(`✅ Memory healthy - Render Compatible: ${renderMemoryPercent.toFixed(1)}%, Heap: ${heapUsagePercent.toFixed(1)}%`);
  }
  
  // CPU checks - Proper calculation with time tracking
  const cpuUsage = process.cpuUsage();
  let cpuPercent = 0; // Default value
  
  // Store previous CPU usage for comparison
  if (!global.previousCpuUsage) {
    global.previousCpuUsage = cpuUsage;
    global.previousCpuTime = Date.now();
    cpuPercent = 0; // First run, no previous data
  } else {
    const currentTime = Date.now();
    const timeDiff = currentTime - global.previousCpuTime;
    const cpuDiff = (cpuUsage.user + cpuUsage.system) - (global.previousCpuUsage.user + global.previousCpuUsage.system);
    
    // Calculate CPU percentage based on time elapsed
    cpuPercent = Math.min((cpuDiff / (timeDiff * 1000)) * 100, 100); // Convert to percentage and cap at 100%
    
    // Update previous values
    global.previousCpuUsage = cpuUsage;
    global.previousCpuTime = currentTime;
  }
  
  if (cpuPercent > alertThresholds.cpu.critical) {
    addAlert('cpu', `Critical CPU usage: ${cpuPercent.toFixed(1)}%`, 'critical', { usage: cpuPercent });
  } else if (cpuPercent > alertThresholds.cpu.warning) {
    addAlert('cpu', `High CPU usage: ${cpuPercent.toFixed(1)}%`, 'warning', { usage: cpuPercent });
  }
  
  // Uptime checks - only alert once per restart
  const uptime = process.uptime();
  if (uptime < 30 && !global.restartAlertShown) {
    global.restartAlertShown = true;
    addAlert('system', 'System recently restarted', 'info', { uptime });
  }
  
  // Disk space checks (if available)
  try {
    const fs = require('fs');
    const stats = fs.statSync('.');
    // This is a simplified check - in production you'd use a proper disk space library
  } catch (error) {
    // Disk space check not available
  }
};

const resolveAlert = (alertId) => {
  for (const severity in alerts) {
    const alert = alerts[severity].find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
  }
  return false;
};

const getAlerts = () => {
  const allAlerts = [...alerts.critical, ...alerts.warnings, ...alerts.errors];
  const activeAlerts = allAlerts.filter(alert => !alert.resolved);
  
  return {
    total: allAlerts.length,
    active: activeAlerts.length,
    critical: alerts.critical.filter(a => !a.resolved).length,
    warnings: alerts.warnings.filter(a => !a.resolved).length,
    errors: alerts.errors.filter(a => !a.resolved).length,
    alerts: {
      critical: alerts.critical.slice(-10),
      warnings: alerts.warnings.slice(-10),
      errors: alerts.errors.slice(-10)
    },
    activeAlerts: activeAlerts.slice(-20)
  };
};

const clearAlerts = (severity = null) => {
  if (severity && alerts[severity]) {
    alerts[severity] = [];
  } else {
    alerts.errors = [];
    alerts.warnings = [];
    alerts.critical = [];
  }
};

// Check system health every 30 seconds
setInterval(checkSystemHealth, 30000);

module.exports = {
  addAlert,
  getAlerts,
  checkSystemHealth,
  resolveAlert,
  clearAlerts,
  alertThresholds
};
