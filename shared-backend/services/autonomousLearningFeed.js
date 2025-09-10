/**
 * Autonomous Learning Feed System
 * Feeds all fixes and solutions to the autonomous AI team for continuous learning
 * This system captures patterns, solutions, and best practices for autonomous operations
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

class AutonomousLearningFeed {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/autonomous-learning-feed.log' }),
        new winston.transports.Console()
      ]
    });

    this.learningData = {
      errorPatterns: new Map(),
      solutionPatterns: new Map(),
      fixStrategies: new Map(),
      performanceOptimizations: new Map(),
      deploymentPatterns: new Map(),
      monitoringInsights: new Map(),
      aiProviderStrategies: new Map(),
      circuitBreakerPatterns: new Map(),
      memoryOptimizationPatterns: new Map(),
      apiErrorPatterns: new Map(),
      databaseErrorPatterns: new Map(),
      renderDeploymentPatterns: new Map()
    };

    this.learningHistory = [];
    this.successfulFixes = [];
    this.failedAttempts = [];
    this.performanceMetrics = new Map();
  }

  /**
   * Feed a new error pattern to the learning system
   */
  feedErrorPattern(errorType, pattern, context = {}) {
    const key = `${errorType}:${pattern}`;
    const existing = this.learningData.errorPatterns.get(key) || { count: 0, contexts: [], lastSeen: null };
    
    existing.count++;
    existing.contexts.push({
      timestamp: new Date(),
      context,
      severity: context.severity || 'medium'
    });
    existing.lastSeen = new Date();

    this.learningData.errorPatterns.set(key, existing);
    
    this.logger.info(`📚 Learning: New error pattern fed - ${errorType}: ${pattern}`, {
      pattern: key,
      count: existing.count,
      context
    });

    return this;
  }

  /**
   * Feed a successful solution to the learning system
   */
  feedSolution(errorType, solution, effectiveness = 1.0, context = {}) {
    const key = `${errorType}:${solution}`;
    const existing = this.learningData.solutionPatterns.get(key) || { 
      count: 0, 
      effectiveness: 0, 
      contexts: [], 
      lastUsed: null,
      successRate: 0
    };
    
    existing.count++;
    existing.effectiveness = (existing.effectiveness + effectiveness) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      context,
      effectiveness,
      success: effectiveness > 0.5
    });
    existing.lastUsed = new Date();
    existing.successRate = existing.contexts.filter(c => c.success).length / existing.contexts.length;

    this.learningData.solutionPatterns.set(key, existing);
    
    this.logger.info(`✅ Learning: Solution fed - ${errorType}: ${solution}`, {
      solution: key,
      effectiveness,
      successRate: existing.successRate,
      context
    });

    return this;
  }

  /**
   * Feed a fix strategy to the learning system
   */
  feedFixStrategy(strategyType, strategy, steps = [], prerequisites = []) {
    const key = `${strategyType}:${strategy}`;
    const existing = this.learningData.fixStrategies.get(key) || { 
      count: 0, 
      steps: [], 
      prerequisites: [],
      successRate: 0,
      contexts: []
    };
    
    existing.count++;
    existing.steps = steps.length > 0 ? steps : existing.steps;
    existing.prerequisites = prerequisites.length > 0 ? prerequisites : existing.prerequisites;
    existing.contexts.push({
      timestamp: new Date(),
      strategyType,
      steps,
      prerequisites
    });

    this.learningData.fixStrategies.set(key, existing);
    
    this.logger.info(`🔧 Learning: Fix strategy fed - ${strategyType}: ${strategy}`, {
      strategy: key,
      steps: steps.length,
      prerequisites: prerequisites.length
    });

    return this;
  }

  /**
   * Feed performance optimization insights
   */
  feedPerformanceOptimization(optimizationType, optimization, impact = 'medium', metrics = {}) {
    const key = `${optimizationType}:${optimization}`;
    const existing = this.learningData.performanceOptimizations.get(key) || { 
      count: 0, 
      impact: 'medium',
      metrics: {},
      contexts: []
    };
    
    existing.count++;
    existing.impact = impact;
    existing.metrics = { ...existing.metrics, ...metrics };
    existing.contexts.push({
      timestamp: new Date(),
      optimizationType,
      impact,
      metrics
    });

    this.learningData.performanceOptimizations.set(key, existing);
    
    this.logger.info(`⚡ Learning: Performance optimization fed - ${optimizationType}: ${optimization}`, {
      optimization: key,
      impact,
      metrics
    });

    return this;
  }

  /**
   * Feed AI provider strategy insights
   */
  feedAIProviderStrategy(provider, strategy, successRate = 0, context = {}) {
    const key = `${provider}:${strategy}`;
    const existing = this.learningData.aiProviderStrategies.get(key) || { 
      count: 0, 
      successRate: 0,
      contexts: [],
      lastUsed: null
    };
    
    existing.count++;
    existing.successRate = (existing.successRate + successRate) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      provider,
      strategy,
      successRate,
      context
    });
    existing.lastUsed = new Date();

    this.learningData.aiProviderStrategies.set(key, existing);
    
    this.logger.info(`🤖 Learning: AI provider strategy fed - ${provider}: ${strategy}`, {
      strategy: key,
      successRate,
      context
    });

    return this;
  }

  /**
   * Feed circuit breaker pattern insights
   */
  feedCircuitBreakerPattern(service, pattern, threshold, timeout, effectiveness = 1.0) {
    const key = `${service}:${pattern}`;
    const existing = this.learningData.circuitBreakerPatterns.get(key) || { 
      count: 0, 
      threshold: 5,
      timeout: 300000,
      effectiveness: 0,
      contexts: []
    };
    
    existing.count++;
    existing.threshold = threshold;
    existing.timeout = timeout;
    existing.effectiveness = (existing.effectiveness + effectiveness) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      service,
      pattern,
      threshold,
      timeout,
      effectiveness
    });

    this.learningData.circuitBreakerPatterns.set(key, existing);
    
    this.logger.info(`🔌 Learning: Circuit breaker pattern fed - ${service}: ${pattern}`, {
      pattern: key,
      threshold,
      timeout,
      effectiveness
    });

    return this;
  }

  /**
   * Feed memory optimization patterns
   */
  feedMemoryOptimizationPattern(pattern, optimization, memorySaved = 0, context = {}) {
    const key = `${pattern}:${optimization}`;
    const existing = this.learningData.memoryOptimizationPatterns.get(key) || { 
      count: 0, 
      memorySaved: 0,
      contexts: []
    };
    
    existing.count++;
    existing.memorySaved += memorySaved;
    existing.contexts.push({
      timestamp: new Date(),
      pattern,
      optimization,
      memorySaved,
      context
    });

    this.learningData.memoryOptimizationPatterns.set(key, existing);
    
    this.logger.info(`💾 Learning: Memory optimization pattern fed - ${pattern}: ${optimization}`, {
      pattern: key,
      memorySaved,
      context
    });

    return this;
  }

  /**
   * Feed API error patterns and solutions
   */
  feedAPIErrorPattern(endpoint, errorCode, solution, successRate = 1.0) {
    const key = `${endpoint}:${errorCode}`;
    const existing = this.learningData.apiErrorPatterns.get(key) || { 
      count: 0, 
      solutions: [],
      successRate: 0,
      contexts: []
    };
    
    existing.count++;
    if (!existing.solutions.includes(solution)) {
      existing.solutions.push(solution);
    }
    existing.successRate = (existing.successRate + successRate) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      endpoint,
      errorCode,
      solution,
      successRate
    });

    this.learningData.apiErrorPatterns.set(key, existing);
    
    this.logger.info(`🌐 Learning: API error pattern fed - ${endpoint}: ${errorCode}`, {
      pattern: key,
      solution,
      successRate
    });

    return this;
  }

  /**
   * Feed database error patterns and solutions
   */
  feedDatabaseErrorPattern(errorType, solution, successRate = 1.0, context = {}) {
    const key = `${errorType}:${solution}`;
    const existing = this.learningData.databaseErrorPatterns.get(key) || { 
      count: 0, 
      solutions: [],
      successRate: 0,
      contexts: []
    };
    
    existing.count++;
    if (!existing.solutions.includes(solution)) {
      existing.solutions.push(solution);
    }
    existing.successRate = (existing.successRate + successRate) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      errorType,
      solution,
      successRate,
      context
    });

    this.learningData.databaseErrorPatterns.set(key, existing);
    
    this.logger.info(`🗄️ Learning: Database error pattern fed - ${errorType}: ${solution}`, {
      pattern: key,
      solution,
      successRate
    });

    return this;
  }

  /**
   * Feed Render deployment patterns
   */
  feedRenderDeploymentPattern(pattern, solution, successRate = 1.0, context = {}) {
    const key = `${pattern}:${solution}`;
    const existing = this.learningData.renderDeploymentPatterns.get(key) || { 
      count: 0, 
      solutions: [],
      successRate: 0,
      contexts: []
    };
    
    existing.count++;
    if (!existing.solutions.includes(solution)) {
      existing.solutions.push(solution);
    }
    existing.successRate = (existing.successRate + successRate) / 2;
    existing.contexts.push({
      timestamp: new Date(),
      pattern,
      solution,
      successRate,
      context
    });

    this.learningData.renderDeploymentPatterns.set(key, existing);
    
    this.logger.info(`🚀 Learning: Render deployment pattern fed - ${pattern}: ${solution}`, {
      pattern: key,
      solution,
      successRate
    });

    return this;
  }

  /**
   * Get learning insights for a specific error type
   */
  getLearningInsights(errorType) {
    const insights = {
      errorPatterns: [],
      solutions: [],
      strategies: [],
      performanceOptimizations: [],
      aiProviderStrategies: [],
      circuitBreakerPatterns: [],
      memoryOptimizations: [],
      apiErrorPatterns: [],
      databaseErrorPatterns: [],
      renderDeploymentPatterns: []
    };

    // Collect relevant patterns
    for (const [key, data] of this.learningData.errorPatterns) {
      if (key.includes(errorType)) {
        insights.errorPatterns.push({ pattern: key, data });
      }
    }

    for (const [key, data] of this.learningData.solutionPatterns) {
      if (key.includes(errorType)) {
        insights.solutions.push({ solution: key, data });
      }
    }

    for (const [key, data] of this.learningData.fixStrategies) {
      if (key.includes(errorType)) {
        insights.strategies.push({ strategy: key, data });
      }
    }

    return insights;
  }

  /**
   * Generate learning report
   */
  generateLearningReport() {
    const report = {
      timestamp: new Date(),
      summary: {
        totalErrorPatterns: this.learningData.errorPatterns.size,
        totalSolutions: this.learningData.solutionPatterns.size,
        totalStrategies: this.learningData.fixStrategies.size,
        totalPerformanceOptimizations: this.learningData.performanceOptimizations.size,
        totalAIProviderStrategies: this.learningData.aiProviderStrategies.size,
        totalCircuitBreakerPatterns: this.learningData.circuitBreakerPatterns.size,
        totalMemoryOptimizations: this.learningData.memoryOptimizationPatterns.size,
        totalAPIErrorPatterns: this.learningData.apiErrorPatterns.size,
        totalDatabaseErrorPatterns: this.learningData.databaseErrorPatterns.size,
        totalRenderDeploymentPatterns: this.learningData.renderDeploymentPatterns.size
      },
      topSolutions: this.getTopSolutions(),
      topStrategies: this.getTopStrategies(),
      performanceInsights: this.getPerformanceInsights(),
      aiProviderInsights: this.getAIProviderInsights(),
      recommendations: this.generateRecommendations()
    };

    this.logger.info('📊 Learning report generated', report.summary);
    return report;
  }

  /**
   * Get top solutions by effectiveness
   */
  getTopSolutions() {
    const solutions = Array.from(this.learningData.solutionPatterns.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 10);

    return solutions;
  }

  /**
   * Get top strategies by success rate
   */
  getTopStrategies() {
    const strategies = Array.from(this.learningData.fixStrategies.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    return strategies;
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights() {
    const optimizations = Array.from(this.learningData.performanceOptimizations.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return optimizations;
  }

  /**
   * Get AI provider insights
   */
  getAIProviderInsights() {
    const strategies = Array.from(this.learningData.aiProviderStrategies.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    return strategies;
  }

  /**
   * Generate recommendations based on learning data
   */
  generateRecommendations() {
    const recommendations = [];

    // Circuit breaker recommendations
    const circuitBreakerPatterns = Array.from(this.learningData.circuitBreakerPatterns.entries());
    if (circuitBreakerPatterns.length > 0) {
      const avgThreshold = circuitBreakerPatterns.reduce((sum, [, data]) => sum + data.threshold, 0) / circuitBreakerPatterns.length;
      const avgTimeout = circuitBreakerPatterns.reduce((sum, [, data]) => sum + data.timeout, 0) / circuitBreakerPatterns.length;
      
      recommendations.push({
        type: 'circuit_breaker',
        message: `Consider setting circuit breaker threshold to ${Math.round(avgThreshold)} and timeout to ${Math.round(avgTimeout)}ms based on historical data`,
        confidence: 0.8
      });
    }

    // Memory optimization recommendations
    const memoryPatterns = Array.from(this.learningData.memoryOptimizationPatterns.entries());
    if (memoryPatterns.length > 0) {
      const topMemoryOptimization = memoryPatterns
        .sort((a, b) => b[1].memorySaved - a[1].memorySaved)[0];
      
      recommendations.push({
        type: 'memory_optimization',
        message: `Most effective memory optimization: ${topMemoryOptimization[0]} (saved ${topMemoryOptimization[1].memorySaved}MB)`,
        confidence: 0.9
      });
    }

    // AI provider recommendations
    const aiProviderStrategies = Array.from(this.learningData.aiProviderStrategies.entries());
    if (aiProviderStrategies.length > 0) {
      const topProvider = aiProviderStrategies
        .sort((a, b) => b[1].successRate - a[1].successRate)[0];
      
      recommendations.push({
        type: 'ai_provider',
        message: `Most reliable AI provider strategy: ${topProvider[0]} (${(topProvider[1].successRate * 100).toFixed(1)}% success rate)`,
        confidence: 0.85
      });
    }

    return recommendations;
  }

  /**
   * Save learning data to file
   */
  async saveLearningData() {
    try {
      const dataDir = path.join(__dirname, '../data');
      await fs.mkdir(dataDir, { recursive: true });
      
      const learningData = {
        timestamp: new Date(),
        errorPatterns: Object.fromEntries(this.learningData.errorPatterns),
        solutionPatterns: Object.fromEntries(this.learningData.solutionPatterns),
        fixStrategies: Object.fromEntries(this.learningData.fixStrategies),
        performanceOptimizations: Object.fromEntries(this.learningData.performanceOptimizations),
        aiProviderStrategies: Object.fromEntries(this.learningData.aiProviderStrategies),
        circuitBreakerPatterns: Object.fromEntries(this.learningData.circuitBreakerPatterns),
        memoryOptimizationPatterns: Object.fromEntries(this.learningData.memoryOptimizationPatterns),
        apiErrorPatterns: Object.fromEntries(this.learningData.apiErrorPatterns),
        databaseErrorPatterns: Object.fromEntries(this.learningData.databaseErrorPatterns),
        renderDeploymentPatterns: Object.fromEntries(this.learningData.renderDeploymentPatterns)
      };

      await fs.writeFile(
        path.join(dataDir, 'autonomous-learning-data.json'),
        JSON.stringify(learningData, null, 2)
      );

      this.logger.info('💾 Learning data saved to file');
    } catch (error) {
      this.logger.error('❌ Failed to save learning data:', error);
    }
  }

  /**
   * Load learning data from file
   */
  async loadLearningData() {
    try {
      const dataFile = path.join(__dirname, '../data/autonomous-learning-data.json');
      const data = await fs.readFile(dataFile, 'utf8');
      const learningData = JSON.parse(data);

      // Restore Maps from objects
      this.learningData.errorPatterns = new Map(Object.entries(learningData.errorPatterns || {}));
      this.learningData.solutionPatterns = new Map(Object.entries(learningData.solutionPatterns || {}));
      this.learningData.fixStrategies = new Map(Object.entries(learningData.fixStrategies || {}));
      this.learningData.performanceOptimizations = new Map(Object.entries(learningData.performanceOptimizations || {}));
      this.learningData.aiProviderStrategies = new Map(Object.entries(learningData.aiProviderStrategies || {}));
      this.learningData.circuitBreakerPatterns = new Map(Object.entries(learningData.circuitBreakerPatterns || {}));
      this.learningData.memoryOptimizationPatterns = new Map(Object.entries(learningData.memoryOptimizationPatterns || {}));
      this.learningData.apiErrorPatterns = new Map(Object.entries(learningData.apiErrorPatterns || {}));
      this.learningData.databaseErrorPatterns = new Map(Object.entries(learningData.databaseErrorPatterns || {}));
      this.learningData.renderDeploymentPatterns = new Map(Object.entries(learningData.renderDeploymentPatterns || {}));

      this.logger.info('📚 Learning data loaded from file');
    } catch (error) {
      this.logger.info('📚 No existing learning data found, starting fresh');
    }
  }

  /**
   * Start the learning feed system
   */
  async start() {
    await this.loadLearningData();
    this.logger.info('🧠 Autonomous Learning Feed System started');
    
    // Auto-save learning data every 5 minutes
    setInterval(() => {
      this.saveLearningData();
    }, 5 * 60 * 1000);
  }

  /**
   * Process comprehensive fixes and feed to learning system
   */
  async processComprehensiveFixes(fixes, learningPatterns) {
    try {
      for (const fix of fixes) {
        await this.feedErrorPattern(fix.type, fix.description, {
          fixId: fix.id,
          changes: fix.changes,
          timestamp: fix.timestamp
        });
      }

      for (const pattern of learningPatterns) {
        await this.feedErrorPattern(pattern.type, pattern.pattern, {
          solution: pattern.solution,
          context: pattern.context,
          outcome: pattern.outcome
        });
      }

      this.logger.info(`📚 Processed ${fixes.length} fixes and ${learningPatterns.length} learning patterns`);
    } catch (error) {
      this.logger.error('Failed to process comprehensive fixes:', error);
    }
  }

module.exports = AutonomousLearningFeed;
