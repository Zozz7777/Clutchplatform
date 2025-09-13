/**
 * Enhanced Alerting System Middleware
 */

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
  
  // Keep only last 100 alerts
  if (alerts[severity].length > 100) {
    alerts[severity] = alerts[severity].slice(-100);
  }
  
  console.log(`🚨 ${severity.toUpperCase()} ALERT [${type}]: ${message}`);
  
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
    console.error('Failed to send webhook alert:', error.message);
  }
};

const checkSystemHealth = () => {
  const { getSystemMemoryUsage, getV8HeapUsage } = require('../utils/memory-monitor');
  
  const systemMemory = getSystemMemoryUsage();
  const v8Heap = getV8HeapUsage();
  
  // Use CORRECT system memory usage for alerts
  const systemMemoryPercent = systemMemory.usagePercentage;
  const heapUsagePercent = v8Heap.heapUsagePercentage;
  
  // System memory checks (the important ones)
  if (systemMemoryPercent > alertThresholds.memory.critical) {
    addAlert('memory', `Critical SYSTEM memory usage: ${systemMemoryPercent.toFixed(1)}% (Heap: ${heapUsagePercent.toFixed(1)}%)`, 'critical', { 
      systemUsage: systemMemoryPercent,
      heapUsage: heapUsagePercent 
    });
  } else if (systemMemoryPercent > alertThresholds.memory.warning) {
    addAlert('memory', `High SYSTEM memory usage: ${systemMemoryPercent.toFixed(1)}% (Heap: ${heapUsagePercent.toFixed(1)}%)`, 'warning', { 
      systemUsage: systemMemoryPercent,
      heapUsage: heapUsagePercent 
    });
  } else {
    // Log healthy memory status
    console.log(`✅ Memory healthy - System: ${systemMemoryPercent.toFixed(1)}%, Heap: ${heapUsagePercent.toFixed(1)}%`);
  }
  
  // CPU checks
  const cpuUsage = process.cpuUsage();
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to percentage
  
  if (cpuPercent > alertThresholds.cpu.critical) {
    addAlert('cpu', `Critical CPU usage: ${cpuPercent.toFixed(1)}%`, 'critical', { usage: cpuPercent });
  } else if (cpuPercent > alertThresholds.cpu.warning) {
    addAlert('cpu', `High CPU usage: ${cpuPercent.toFixed(1)}%`, 'warning', { usage: cpuPercent });
  }
  
  // Uptime checks
  const uptime = process.uptime();
  if (uptime < 60) {
    addAlert('system', 'System recently restarted', 'warning', { uptime });
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
