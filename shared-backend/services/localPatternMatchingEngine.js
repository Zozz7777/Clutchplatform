/**
 * Local Pattern Matching Engine
 * Advanced pattern matching and solution generation without AI providers
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

class LocalPatternMatchingEngine {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/pattern-matching.log' }),
        new winston.transports.Console()
      ]
    });

    this.patterns = new Map();
    this.solutions = new Map();
    this.learningData = new Map();
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };

    this.initializePatterns();
  }

  /**
   * Initialize predefined patterns and solutions
   */
  async initializePatterns() {
    try {
      // Load patterns from file if exists
      const patternsFile = path.join(__dirname, '../data/patterns.json');
      try {
        const patternsData = await fs.readFile(patternsFile, 'utf8');
        const patterns = JSON.parse(patternsData);
        this.loadPatternsFromData(patterns);
        this.logger.info('✅ Loaded patterns from file');
      } catch (error) {
        this.logger.info('📝 Creating default patterns');
        this.createDefaultPatterns();
      }

      this.logger.info(`✅ Pattern matching engine initialized with ${this.patterns.size} patterns`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize patterns:', error);
    }
  }

  /**
   * Create default patterns for common issues
   */
  createDefaultPatterns() {
    // Error patterns
    this.addPattern('error_websocket', {
      keywords: ['websocket', 'socket.io', 'connection failed', 'eaddrinuse'],
      category: 'websocket',
      severity: 'high',
      solution: {
        type: 'websocket_error',
        content: 'WebSocket connection issue detected',
        steps: [
          'Check if port is already in use',
          'Verify WebSocket server initialization',
          'Ensure proper http.Server instance is passed to socket.io',
          'Check firewall and network configuration'
        ],
        confidence: 0.9
      }
    });

    // Rate limit patterns
    this.addPattern('rate_limit_api', {
      keywords: ['rate limit', '429', 'too many requests', 'quota exceeded'],
      category: 'api',
      severity: 'high',
      solution: {
        type: 'rate_limit_error',
        content: 'API rate limit exceeded',
        steps: [
          'Implement exponential backoff delays',
          'Add request queuing system',
          'Rotate between multiple providers',
          'Cache responses to reduce API calls',
          'Monitor usage and adjust limits'
        ],
        confidence: 0.8
      }
    });

    // Database patterns
    this.addPattern('database_connection', {
      keywords: ['database', 'mongodb', 'connection failed', 'timeout', 'econnrefused'],
      category: 'database',
      severity: 'high',
      solution: {
        type: 'database_error',
        content: 'Database connection issue',
        steps: [
          'Verify database connection string',
          'Check network connectivity',
          'Validate database credentials',
          'Check database server status',
          'Review connection pool settings'
        ],
        confidence: 0.8
      }
    });

    // Authentication patterns
    this.addPattern('authentication_error', {
      keywords: ['unauthorized', '401', 'token', 'auth', 'permission denied'],
      category: 'security',
      severity: 'medium',
      solution: {
        type: 'auth_error',
        content: 'Authentication or authorization issue',
        steps: [
          'Check API key configuration',
          'Validate token format and expiration',
          'Verify authentication middleware',
          'Check user permissions',
          'Review security policies'
        ],
        confidence: 0.7
      }
    });

    // Performance patterns
    this.addPattern('performance_issue', {
      keywords: ['slow', 'timeout', 'performance', 'memory', 'cpu'],
      category: 'performance',
      severity: 'medium',
      solution: {
        type: 'performance_issue',
        content: 'Performance optimization needed',
        steps: [
          'Profile application performance',
          'Check memory usage and leaks',
          'Optimize database queries',
          'Implement caching strategies',
          'Review resource allocation'
        ],
        confidence: 0.6
      }
    });

    // Memory patterns
    this.addPattern('memory_issue', {
      keywords: ['memory', 'heap', 'out of memory', 'leak', 'gc'],
      category: 'memory',
      severity: 'high',
      solution: {
        type: 'memory_error',
        content: 'Memory management issue',
        steps: [
          'Check for memory leaks',
          'Optimize data structures',
          'Implement garbage collection',
          'Monitor memory usage',
          'Consider memory pooling'
        ],
        confidence: 0.8
      }
    });

    // Network patterns
    this.addPattern('network_issue', {
      keywords: ['network', 'dns', 'timeout', 'econnreset', 'enotfound'],
      category: 'network',
      severity: 'medium',
      solution: {
        type: 'network_error',
        content: 'Network connectivity issue',
        steps: [
          'Check network connectivity',
          'Verify DNS resolution',
          'Test firewall settings',
          'Check proxy configuration',
          'Monitor network latency'
        ],
        confidence: 0.7
      }
    });
  }

  /**
   * Add a new pattern
   */
  addPattern(id, pattern) {
    this.patterns.set(id, pattern);
    this.solutions.set(id, pattern.solution);
  }

  /**
   * Analyze problem and find matching patterns
   */
  async analyzeProblem(problem, context = {}) {
    try {
      this.logger.info(`🔍 Analyzing problem: ${problem.substring(0, 100)}...`);

      const problemLower = problem.toLowerCase();
      const matchedPatterns = [];
      const solutions = [];

      // Find matching patterns
      for (const [patternId, pattern] of this.patterns) {
        const matchScore = this.calculateMatchScore(problemLower, pattern);
        if (matchScore > 0.3) {
          matchedPatterns.push({
            id: patternId,
            pattern,
            score: matchScore
          });
        }
      }

      // Sort by match score
      matchedPatterns.sort((a, b) => b.score - a.score);

      // Get solutions for matched patterns
      for (const match of matchedPatterns) {
        const solution = this.solutions.get(match.id);
        if (solution) {
          solutions.push({
            ...solution,
            patternId: match.id,
            matchScore: match.score
          });
        }
      }

      const confidence = this.calculateConfidence(solutions);
      
      return {
        patterns: matchedPatterns,
        solutions,
        confidence,
        analysis: this.generateAnalysis(problem, matchedPatterns, context)
      };

    } catch (error) {
      this.logger.error('❌ Problem analysis failed:', error);
      return {
        patterns: [],
        solutions: [],
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate match score between problem and pattern
   */
  calculateMatchScore(problemLower, pattern) {
    let score = 0;
    let matches = 0;

    for (const keyword of pattern.keywords) {
      if (problemLower.includes(keyword.toLowerCase())) {
        matches++;
        score += 1;
      }
    }

    // Bonus for multiple keyword matches
    if (matches > 1) {
      score += (matches - 1) * 0.5;
    }

    // Normalize score
    return Math.min(score / pattern.keywords.length, 1);
  }

  /**
   * Calculate overall confidence
   */
  calculateConfidence(solutions) {
    if (solutions.length === 0) return 0;
    
    const totalConfidence = solutions.reduce((sum, solution) => {
      return sum + (solution.confidence * solution.matchScore);
    }, 0);
    
    return Math.min(totalConfidence / solutions.length, 1);
  }

  /**
   * Generate analysis insights
   */
  generateAnalysis(problem, matchedPatterns, context) {
    const analysis = {
      problemType: this.determineProblemType(problem),
      severity: this.determineSeverity(matchedPatterns),
      recommendations: this.generateRecommendations(matchedPatterns),
      context: context
    };

    return analysis;
  }

  /**
   * Determine problem type
   */
  determineProblemType(problem) {
    const problemLower = problem.toLowerCase();
    
    if (problemLower.includes('error') || problemLower.includes('exception')) {
      return 'error';
    } else if (problemLower.includes('performance') || problemLower.includes('slow')) {
      return 'performance';
    } else if (problemLower.includes('security') || problemLower.includes('auth')) {
      return 'security';
    } else if (problemLower.includes('database') || problemLower.includes('mongodb')) {
      return 'database';
    } else if (problemLower.includes('network') || problemLower.includes('connection')) {
      return 'network';
    } else {
      return 'general';
    }
  }

  /**
   * Determine severity level
   */
  determineSeverity(matchedPatterns) {
    if (matchedPatterns.length === 0) return 'low';
    
    const severities = matchedPatterns.map(p => p.pattern.severity);
    
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(matchedPatterns) {
    const recommendations = [];
    
    for (const match of matchedPatterns) {
      const solution = this.solutions.get(match.id);
      if (solution && solution.steps) {
        recommendations.push(...solution.steps);
      }
    }
    
    // Remove duplicates and return top recommendations
    return [...new Set(recommendations)].slice(0, 5);
  }

  /**
   * Learn from new problems and solutions
   */
  async learnFromSolution(problem, solution, success) {
    try {
      const learningKey = this.generateLearningKey(problem);
      const learningData = {
        problem,
        solution,
        success,
        timestamp: new Date(),
        usageCount: 1
      };

      if (this.learningData.has(learningKey)) {
        const existing = this.learningData.get(learningKey);
        existing.usageCount++;
        existing.lastUsed = new Date();
        if (success) {
          existing.successCount = (existing.successCount || 0) + 1;
        }
      } else {
        learningData.successCount = success ? 1 : 0;
        this.learningData.set(learningKey, learningData);
      }

      // Update pattern confidence based on success
      if (success) {
        await this.updatePatternConfidence(problem, solution);
      }

      this.logger.info(`📚 Learned from solution (success: ${success})`);
    } catch (error) {
      this.logger.error('❌ Learning failed:', error);
    }
  }

  /**
   * Generate learning key for problem
   */
  generateLearningKey(problem) {
    const words = problem.toLowerCase().split(' ').slice(0, 5);
    return words.join('_');
  }

  /**
   * Update pattern confidence based on successful solutions
   */
  async updatePatternConfidence(problem, solution) {
    const problemLower = problem.toLowerCase();
    
    for (const [patternId, pattern] of this.patterns) {
      const matchScore = this.calculateMatchScore(problemLower, pattern);
      if (matchScore > 0.5) {
        const currentSolution = this.solutions.get(patternId);
        if (currentSolution) {
          // Increase confidence slightly for successful matches
          currentSolution.confidence = Math.min(currentSolution.confidence + 0.01, 1.0);
          this.solutions.set(patternId, currentSolution);
        }
      }
    }
  }

  /**
   * Load patterns from data
   */
  loadPatternsFromData(patternsData) {
    for (const [id, pattern] of Object.entries(patternsData)) {
      this.patterns.set(id, pattern);
      if (pattern.solution) {
        this.solutions.set(id, pattern.solution);
      }
    }
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    return {
      totalPatterns: this.patterns.size,
      totalSolutions: this.solutions.size,
      learningDataSize: this.learningData.size,
      averageConfidence: this.calculateAverageConfidence()
    };
  }

  /**
   * Calculate average confidence
   */
  calculateAverageConfidence() {
    if (this.solutions.size === 0) return 0;
    
    const totalConfidence = Array.from(this.solutions.values())
      .reduce((sum, solution) => sum + solution.confidence, 0);
    
    return totalConfidence / this.solutions.size;
  }

  /**
   * Export patterns for backup
   */
  async exportPatterns() {
    const patternsData = {};
    for (const [id, pattern] of this.patterns) {
      patternsData[id] = pattern;
    }
    
    const exportPath = path.join(__dirname, '../data/patterns-export.json');
    await fs.writeFile(exportPath, JSON.stringify(patternsData, null, 2));
    
    this.logger.info(`📤 Patterns exported to ${exportPath}`);
    return exportPath;
  }
}

module.exports = LocalPatternMatchingEngine;
