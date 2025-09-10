/**
 * Research-First Approach Monitoring Service
 * Monitors and reports on the usage of research-first vs API-first approach
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');

class ResearchFirstMonitoring {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/research-first-monitoring.log' }),
        new winston.transports.Console()
      ]
    });

    this.stats = {
      totalRequests: 0,
      knowledgeBaseRequests: 0,
      webSearchRequests: 0,
      aiApiRequests: 0,
      researchFirstSuccess: 0,
      aiApiFallback: 0,
      startTime: new Date()
    };

    this.loadStats();
  }

  /**
   * Record a research-first request
   */
  recordResearchFirstRequest(source, success = true) {
    this.stats.totalRequests++;
    
    switch (source) {
      case 'knowledge_base':
        this.stats.knowledgeBaseRequests++;
        break;
      case 'web_search':
        this.stats.webSearchRequests++;
        break;
      case 'ai_api':
        this.stats.aiApiRequests++;
        break;
    }

    if (success && source !== 'ai_api') {
      this.stats.researchFirstSuccess++;
    } else if (source === 'ai_api') {
      this.stats.aiApiFallback++;
    }

    this.saveStats();
    this.logUsage();
  }

  /**
   * Get current statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    const hours = uptime / (1000 * 60 * 60);
    
    return {
      ...this.stats,
      uptime: hours,
      researchFirstRate: this.stats.totalRequests > 0 ? 
        (this.stats.researchFirstSuccess / this.stats.totalRequests) * 100 : 0,
      aiApiUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.aiApiRequests / this.stats.totalRequests) * 100 : 0,
      knowledgeBaseUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.knowledgeBaseRequests / this.stats.totalRequests) * 100 : 0,
      webSearchUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.webSearchRequests / this.stats.totalRequests) * 100 : 0
    };
  }

  /**
   * Log current usage statistics
   */
  logUsage() {
    const stats = this.getStats();
    
    this.logger.info('Research-First Approach Statistics', {
      totalRequests: stats.totalRequests,
      researchFirstRate: stats.researchFirstRate.toFixed(2) + '%',
      aiApiUsageRate: stats.aiApiUsageRate.toFixed(2) + '%',
      knowledgeBaseUsageRate: stats.knowledgeBaseUsageRate.toFixed(2) + '%',
      webSearchUsageRate: stats.webSearchUsageRate.toFixed(2) + '%'
    });

    // Alert if AI API usage is too high
    if (stats.aiApiUsageRate > 10) {
      this.logger.warn('High AI API usage detected', {
        aiApiUsageRate: stats.aiApiUsageRate.toFixed(2) + '%',
        threshold: '10%'
      });
    }
  }

  /**
   * Save statistics to file
   */
  saveStats() {
    try {
      const statsPath = path.join(__dirname, '..', 'data', 'research-first-stats.json');
      const dataDir = path.dirname(statsPath);
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(statsPath, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      this.logger.error('Failed to save statistics:', error);
    }
  }

  /**
   * Load statistics from file
   */
  loadStats() {
    try {
      const statsPath = path.join(__dirname, '..', 'data', 'research-first-stats.json');
      
      if (fs.existsSync(statsPath)) {
        const savedStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        this.stats = { ...this.stats, ...savedStats };
      }
    } catch (error) {
      this.logger.error('Failed to load statistics:', error);
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      knowledgeBaseRequests: 0,
      webSearchRequests: 0,
      aiApiRequests: 0,
      researchFirstSuccess: 0,
      aiApiFallback: 0,
      startTime: new Date()
    };
    
    this.saveStats();
    this.logger.info('Statistics reset');
  }
}

module.exports = ResearchFirstMonitoring;
