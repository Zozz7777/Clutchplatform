const os = require('os');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class RealSystemMonitoringService {
  constructor() {
    this.monitoringInterval = null;
    this.metrics = {
      cpu: [],
      memory: [],
      network: [],
      disk: []
    };
    this.maxHistorySize = 100;
  }

  /**
   * Get real CPU usage percentage
   */
  async getCPUUsage() {
    try {
      if (process.platform === 'win32') {
        // Windows CPU usage
        const { stdout } = await execAsync('wmic cpu get loadpercentage /value');
        const match = stdout.match(/LoadPercentage=(\d+)/);
        return match ? parseInt(match[1]) : 0;
      } else {
        // Unix/Linux CPU usage
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | awk -F'%' '{print $1}'");
        return parseFloat(stdout.trim()) || 0;
      }
    } catch (error) {
      console.error('Failed to get CPU usage:', error);
      return 0;
    }
  }

  /**
   * Get real memory usage
   */
  getMemoryUsage() {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      
      return {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percentage: Math.round((usedMemory / totalMemory) * 100)
      };
    } catch (error) {
      console.error('Failed to get memory usage:', error);
      return { total: 0, used: 0, free: 0, percentage: 0 };
    }
  }

  /**
   * Get real network usage
   */
  async getNetworkUsage() {
    try {
      if (process.platform === 'win32') {
        // Windows network stats
        const { stdout } = await execAsync('netstat -e');
        const lines = stdout.split('\n');
        let bytesReceived = 0;
        let bytesSent = 0;
        
        for (const line of lines) {
          if (line.includes('Bytes')) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
              bytesReceived = parseInt(parts[1]) || 0;
              bytesSent = parseInt(parts[2]) || 0;
              break;
            }
          }
        }
        
        return {
          bytesIn: bytesReceived,
          bytesOut: bytesSent,
          activeConnections: await this.getActiveConnections()
        };
      } else {
        // Unix/Linux network stats
        const { stdout } = await execAsync('cat /proc/net/dev');
        const lines = stdout.split('\n');
        let totalBytesIn = 0;
        let totalBytesOut = 0;
        
        for (const line of lines) {
          if (line.includes(':')) {
            const parts = line.split(':')[1].trim().split(/\s+/);
            if (parts.length >= 9) {
              totalBytesIn += parseInt(parts[0]) || 0;
              totalBytesOut += parseInt(parts[8]) || 0;
            }
          }
        }
        
        return {
          bytesIn: totalBytesIn,
          bytesOut: totalBytesOut,
          activeConnections: await this.getActiveConnections()
        };
      }
    } catch (error) {
      console.error('Failed to get network usage:', error);
      return { bytesIn: 0, bytesOut: 0, activeConnections: 0 };
    }
  }

  /**
   * Get active network connections
   */
  async getActiveConnections() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('netstat -an | find "ESTABLISHED" | find /c ":"');
        return parseInt(stdout.trim()) || 0;
      } else {
        const { stdout } = await execAsync('netstat -an | grep ESTABLISHED | wc -l');
        return parseInt(stdout.trim()) || 0;
      }
    } catch (error) {
      console.error('Failed to get active connections:', error);
      return 0;
    }
  }

  /**
   * Get disk usage
   */
  async getDiskUsage() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption /value');
        const lines = stdout.split('\n');
        let totalSpace = 0;
        let freeSpace = 0;
        
        for (const line of lines) {
          if (line.includes('Size=')) {
            totalSpace += parseInt(line.split('=')[1]) || 0;
          } else if (line.includes('FreeSpace=')) {
            freeSpace += parseInt(line.split('=')[1]) || 0;
          }
        }
        
        const usedSpace = totalSpace - freeSpace;
        return {
          total: totalSpace,
          used: usedSpace,
          free: freeSpace,
          percentage: totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0
        };
      } else {
        const { stdout } = await execAsync('df -h /');
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          if (parts.length >= 5) {
            const total = this.parseSize(parts[1]);
            const used = this.parseSize(parts[2]);
            const free = this.parseSize(parts[3]);
            const percentage = parseInt(parts[4].replace('%', '')) || 0;
            
            return { total, used, free, percentage };
          }
        }
        return { total: 0, used: 0, free: 0, percentage: 0 };
      }
    } catch (error) {
      console.error('Failed to get disk usage:', error);
      return { total: 0, used: 0, free: 0, percentage: 0 };
    }
  }

  /**
   * Parse size string (e.g., "1.2G" -> bytes)
   */
  parseSize(sizeStr) {
    const units = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024, T: 1024 * 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGTP]?)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || '';
      return Math.round(value * (units[unit] || 1));
    }
    return 0;
  }

  /**
   * Get comprehensive system metrics
   */
  async getSystemMetrics() {
    try {
      const [cpuUsage, memoryUsage, networkUsage, diskUsage] = await Promise.all([
        this.getCPUUsage(),
        this.getMemoryUsage(),
        this.getNetworkUsage(),
        this.getDiskUsage()
      ]);

      return {
        timestamp: new Date().toISOString(),
        cpu: {
          usage: cpuUsage,
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'Unknown'
        },
        memory: memoryUsage,
        network: networkUsage,
        disk: diskUsage,
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version
      };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      throw error;
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 30000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.getSystemMetrics();
        this.storeMetrics(metrics);
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, intervalMs);

    console.log(`System monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('System monitoring stopped');
    }
  }

  /**
   * Store metrics in memory (with size limit)
   */
  storeMetrics(metrics) {
    this.metrics.cpu.push({ timestamp: metrics.timestamp, usage: metrics.cpu.usage });
    this.metrics.memory.push({ timestamp: metrics.timestamp, usage: metrics.memory.percentage });
    this.metrics.network.push({ timestamp: metrics.timestamp, ...metrics.network });
    this.metrics.disk.push({ timestamp: metrics.timestamp, usage: metrics.disk.percentage });

    // Keep only recent metrics
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > this.maxHistorySize) {
        this.metrics[key] = this.metrics[key].slice(-this.maxHistorySize);
      }
    });
  }

  /**
   * Get metrics history
   */
  getMetricsHistory() {
    return this.metrics;
  }
}

module.exports = RealSystemMonitoringService;
