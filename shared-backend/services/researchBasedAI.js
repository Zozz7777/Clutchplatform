const GoogleResearchEngine = require('./googleResearchEngine');
const AutoFixingSystem = require('./autoFixingSystem');

class ResearchBasedAI {
  constructor() {
    this.logger = require('./logger');
    this.googleResearch = new GoogleResearchEngine();
    this.autoFixing = new AutoFixingSystem();
    this.knowledgeBase = new Map();
    this.solutionCache = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      researchAccuracy: 0
    };
    
    this.initializeKnowledgeBase();
  }

  initializeKnowledgeBase() {
    // Initialize with comprehensive knowledge base
    const knowledgeEntries = {
      'database_issues': {
        category: 'database',
        solutions: [
          'Check MongoDB connection string and credentials',
          'Verify network connectivity to database server',
          'Check database server status and availability',
          'Validate database permissions and access rights',
          'Restart database connection pool',
          'Check for database locks or deadlocks'
        ],
        patterns: ['database', 'connection', 'mongodb', 'failed', 'error'],
        successRate: 0.85
      },
      'api_endpoint_issues': {
        category: 'api',
        solutions: [
          'Verify route configuration in Express app',
          'Check middleware setup and order',
          'Validate request method (GET, POST, PUT, DELETE)',
          'Check endpoint path and parameters',
          'Verify authentication and authorization',
          'Check CORS configuration'
        ],
        patterns: ['api', 'endpoint', 'route', '404', 'not found'],
        successRate: 0.90
      },
      'memory_performance_issues': {
        category: 'performance',
        solutions: [
          'Clear unused variables and objects',
          'Implement garbage collection',
          'Optimize data structures and algorithms',
          'Check for memory leaks in event listeners',
          'Reduce data caching and buffer sizes',
          'Restart application to clear memory'
        ],
        patterns: ['memory', 'performance', 'slow', 'leak', 'usage'],
        successRate: 0.75
      },
      'authentication_issues': {
        category: 'auth',
        solutions: [
          'Check JWT token validity and expiration',
          'Verify session state and storage',
          'Validate user credentials and permissions',
          'Check token signing and verification',
          'Verify authentication middleware setup',
          'Check for token refresh mechanisms'
        ],
        patterns: ['auth', 'token', 'login', 'credential', 'permission'],
        successRate: 0.88
      },
      'rate_limiting_issues': {
        category: 'rate_limit',
        solutions: [
          'Implement exponential backoff strategy',
          'Add request queuing and throttling',
          'Optimize API call frequency',
          'Enable caching for repeated requests',
          'Implement circuit breaker pattern',
          'Add request rate monitoring'
        ],
        patterns: ['rate limit', 'exceeded', '429', 'throttle', 'quota'],
        successRate: 0.80
      }
    };

    for (const [key, value] of Object.entries(knowledgeEntries)) {
      this.knowledgeBase.set(key, value);
    }

    this.logger.info(`🧠 Initialized research-based AI with ${this.knowledgeBase.size} knowledge entries`);
  }

  async generateResponse(prompt, options = {}) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      this.logger.info(`🔬 Research-based AI processing: ${prompt.substring(0, 100)}...`);

      // Step 1: Analyze the prompt for problem patterns
      const problemAnalysis = this.analyzePrompt(prompt);
      
      // Step 2: Search knowledge base for solutions
      const knowledgeSolution = await this.searchKnowledgeBase(problemAnalysis);
      
      // Step 3: If no knowledge solution, perform Google research
      let researchSolution = null;
      if (!knowledgeSolution.found) {
        researchSolution = await this.performResearch(problemAnalysis);
      }
      
      // Step 4: Generate comprehensive response
      const response = await this.generateComprehensiveResponse(
        prompt, 
        problemAnalysis, 
        knowledgeSolution, 
        researchSolution, 
        options
      );

      // Step 5: Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(true, responseTime);

      this.logger.info(`✅ Research-based AI response generated in ${responseTime}ms`);
      return response;

    } catch (error) {
      this.logger.error('❌ Research-based AI failed:', error);
      this.updatePerformanceMetrics(false, Date.now() - startTime);
      
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        source: 'research_ai_error'
      };
    }
  }

  analyzePrompt(prompt) {
    const analysis = {
      originalPrompt: prompt,
      keywords: this.extractKeywords(prompt),
      category: this.categorizePrompt(prompt),
      urgency: this.assessUrgency(prompt),
      complexity: this.assessComplexity(prompt),
      patterns: this.extractPatterns(prompt)
    };

    return analysis;
  }

  extractKeywords(prompt) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    return prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  }

  categorizePrompt(prompt) {
    const text = prompt.toLowerCase();
    
    if (text.includes('database') || text.includes('mongodb') || text.includes('connection')) {
      return 'database';
    } else if (text.includes('api') || text.includes('endpoint') || text.includes('route')) {
      return 'api';
    } else if (text.includes('memory') || text.includes('performance') || text.includes('slow')) {
      return 'performance';
    } else if (text.includes('auth') || text.includes('login') || text.includes('token')) {
      return 'auth';
    } else if (text.includes('error') || text.includes('bug') || text.includes('issue')) {
      return 'error';
    } else {
      return 'general';
    }
  }

  assessUrgency(prompt) {
    const urgentKeywords = ['critical', 'urgent', 'emergency', 'down', 'broken', 'failed'];
    const text = prompt.toLowerCase();
    
    for (const keyword of urgentKeywords) {
      if (text.includes(keyword)) {
        return 'high';
      }
    }
    
    return 'medium';
  }

  assessComplexity(prompt) {
    const wordCount = prompt.split(' ').length;
    const hasCode = prompt.includes('```') || prompt.includes('function') || prompt.includes('class');
    const hasError = prompt.includes('error') || prompt.includes('exception');
    
    if (wordCount > 100 || hasCode || hasError) {
      return 'high';
    } else if (wordCount > 50) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  extractPatterns(prompt) {
    const patterns = [];
    const text = prompt.toLowerCase();
    
    const patternKeywords = [
      'error', 'failed', 'exception', 'crash', 'timeout',
      'connection', 'database', 'api', 'auth', 'permission',
      'memory', 'cpu', 'disk', 'network', 'ssl', 'tls',
      '404', '500', '502', '503', 'rate limit', 'quota'
    ];
    
    patternKeywords.forEach(pattern => {
      if (text.includes(pattern)) {
        patterns.push(pattern);
      }
    });
    
    return patterns;
  }

  async searchKnowledgeBase(analysis) {
    try {
      // Direct category match
      if (this.knowledgeBase.has(`${analysis.category}_issues`)) {
        const knowledge = this.knowledgeBase.get(`${analysis.category}_issues`);
        return {
          found: true,
          solution: knowledge.solutions[0],
          confidence: knowledge.successRate,
          source: 'knowledge_base',
          alternatives: knowledge.solutions.slice(1),
          category: analysis.category
        };
      }

      // Pattern matching
      for (const [key, knowledge] of this.knowledgeBase) {
        const patternMatch = this.calculatePatternMatch(analysis.patterns, knowledge.patterns);
        if (patternMatch > 0.5) {
          return {
            found: true,
            solution: knowledge.solutions[0],
            confidence: patternMatch * knowledge.successRate,
            source: 'pattern_matching',
            alternatives: knowledge.solutions.slice(1),
            category: knowledge.category
          };
        }
      }

      return {
        found: false,
        solution: null,
        confidence: 0,
        source: 'none',
        alternatives: []
      };
    } catch (error) {
      this.logger.error('❌ Knowledge base search failed:', error);
      return {
        found: false,
        solution: null,
        confidence: 0,
        source: 'error',
        alternatives: [],
        error: error.message
      };
    }
  }

  calculatePatternMatch(problemPatterns, knowledgePatterns) {
    if (!knowledgePatterns || knowledgePatterns.length === 0) return 0;
    
    const matches = problemPatterns.filter(pattern => 
      knowledgePatterns.includes(pattern)
    ).length;
    
    return matches / Math.max(problemPatterns.length, knowledgePatterns.length);
  }

  async performResearch(analysis) {
    try {
      this.logger.info(`🔍 Performing Google research for: ${analysis.category}`);
      
      const researchQueries = this.generateResearchQueries(analysis);
      const researchResults = [];

      for (const query of researchQueries) {
        const result = await this.googleResearch.searchGoogle(query);
        researchResults.push(result);
      }

      return {
        found: true,
        researchResults,
        confidence: 0.7, // Research-based confidence
        source: 'google_research',
        alternatives: []
      };
    } catch (error) {
      this.logger.error('❌ Research failed:', error);
      return {
        found: false,
        solution: null,
        confidence: 0,
        source: 'research_error',
        alternatives: [],
        error: error.message
      };
    }
  }

  generateResearchQueries(analysis) {
    const baseQuery = analysis.keywords.join(' ');
    const queries = [
      `${baseQuery} solution`,
      `${baseQuery} troubleshooting`,
      `${baseQuery} best practices`,
      `${analysis.category} ${baseQuery} fix`
    ];

    return queries;
  }

  async generateComprehensiveResponse(prompt, analysis, knowledgeSolution, researchSolution, options) {
    const response = {
      success: true,
      response: '',
      confidence: 0,
      source: 'research_based_ai',
      timestamp: new Date(),
      analysis: {
        category: analysis.category,
        urgency: analysis.urgency,
        complexity: analysis.complexity
      },
      solutions: [],
      alternatives: [],
      research: null,
      autoFix: null
    };

    // Primary solution
    if (knowledgeSolution.found) {
      response.response = knowledgeSolution.solution;
      response.confidence = knowledgeSolution.confidence;
      response.solutions.push(knowledgeSolution.solution);
      response.alternatives = knowledgeSolution.alternatives;
    } else if (researchSolution.found) {
      response.response = this.synthesizeResearchResults(researchSolution.researchResults);
      response.confidence = researchSolution.confidence;
      response.research = researchSolution.researchResults;
    } else {
      response.response = this.generateGenericSolution(analysis);
      response.confidence = 0.3;
    }

    // Auto-fix suggestion
    if (analysis.urgency === 'high' && analysis.category !== 'general') {
      try {
        const autoFixResult = await this.autoFixing.autoFix(prompt, analysis);
        response.autoFix = autoFixResult;
      } catch (error) {
        this.logger.warn('⚠️ Auto-fix failed:', error);
      }
    }

    return response;
  }

  synthesizeResearchResults(researchResults) {
    if (!researchResults || researchResults.length === 0) {
      return 'Based on my research, I recommend checking the system logs and documentation for more specific guidance.';
    }

    const allResults = researchResults.flatMap(result => result.results || []);
    const topResults = allResults.slice(0, 3);
    
    let synthesis = 'Based on my research, here are the recommended solutions:\n\n';
    
    topResults.forEach((result, index) => {
      synthesis += `${index + 1}. ${result.snippet}\n`;
      if (result.url) {
        synthesis += `   Source: ${result.url}\n\n`;
      }
    });

    return synthesis;
  }

  generateGenericSolution(analysis) {
    const genericSolutions = {
      database: 'Check your database connection settings and ensure the database server is running and accessible.',
      api: 'Verify your API endpoint configuration and check that all required middleware is properly set up.',
      performance: 'Monitor system resources and consider optimizing your code for better performance.',
      auth: 'Check your authentication configuration and ensure tokens are valid and properly configured.',
      error: 'Review the error logs and check the system configuration for any misconfigurations.',
      general: 'I recommend checking the system documentation and logs for more specific guidance on this issue.'
    };

    return genericSolutions[analysis.category] || genericSolutions.general;
  }

  updatePerformanceMetrics(success, responseTime) {
    if (success) {
      this.performanceMetrics.successfulRequests++;
    }

    // Update average response time
    const totalRequests = this.performanceMetrics.totalRequests;
    this.performanceMetrics.averageResponseTime = 
      (this.performanceMetrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;

    // Update research accuracy
    this.performanceMetrics.researchAccuracy = 
      this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests;
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      knowledgeBaseSize: this.knowledgeBase.size,
      cacheSize: this.solutionCache.size,
      lastUpdated: new Date()
    };
  }

  async learnFromInteraction(prompt, response, feedback) {
    try {
      const analysis = this.analyzePrompt(prompt);
      const learningEntry = {
        prompt,
        response,
        feedback,
        analysis,
        timestamp: new Date(),
        success: feedback === 'positive'
      };

      // Update knowledge base based on feedback
      if (feedback === 'positive' && analysis.category !== 'general') {
        const categoryKey = `${analysis.category}_issues`;
        if (this.knowledgeBase.has(categoryKey)) {
          const knowledge = this.knowledgeBase.get(categoryKey);
          knowledge.successRate = Math.min(0.95, knowledge.successRate + 0.05);
          knowledge.lastUpdated = new Date();
        }
      }

      this.logger.info(`🧠 Learned from interaction: ${feedback} feedback`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to learn from interaction:', error);
      return false;
    }
  }
}

module.exports = ResearchBasedAI;
