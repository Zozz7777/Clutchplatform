const ResearchBasedAI = require('./researchBasedAI');
const GoogleResearchEngine = require('./googleResearchEngine');
const AutoFixingSystem = require('./autoFixingSystem');
const FixedHealthMonitor = require('./fixedHealthMonitor');

class ComprehensiveResearchSystem {
  constructor() {
    this.logger = require('./logger');
    
    // Initialize all research-based components
    this.researchAI = new ResearchBasedAI();
    this.googleResearch = new GoogleResearchEngine();
    this.autoFixing = new AutoFixingSystem();
    this.healthMonitor = new FixedHealthMonitor();
    
    // System state
    this.isInitialized = false;
    this.systemMetrics = {
      totalProblemsSolved: 0,
      successfulFixes: 0,
      researchQueries: 0,
      healthChecks: 0,
      lastActivity: new Date()
    };
    
    this.initializeSystem();
  }

  async initializeSystem() {
    try {
      this.logger.info('🚀 Initializing Comprehensive Research System...');
      
      // Start health monitoring
      await this.healthMonitor.startMonitoring();
      
      // Initialize all components
      await this.initializeComponents();
      
      this.isInitialized = true;
      this.logger.info('✅ Comprehensive Research System initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize Comprehensive Research System:', error);
      return false;
    }
  }

  async initializeComponents() {
    // All components are already initialized in their constructors
    this.logger.info('🔧 All research components initialized');
  }

  /**
   * Main problem-solving method
   */
  async solveProblem(problem, context = {}) {
    try {
      this.logger.info(`🔍 Solving problem: ${problem.substring(0, 100)}...`);
      this.systemMetrics.totalProblemsSolved++;
      
      // Step 1: Analyze the problem
      const analysis = this.analyzeProblem(problem, context);
      
      // Step 2: Try research-based AI solution
      const aiSolution = await this.researchAI.generateResponse(problem, context);
      
      // Step 3: If high confidence, return solution
      if (aiSolution.success && aiSolution.confidence > 0.7) {
        this.systemMetrics.successfulFixes++;
        this.logger.info('✅ Problem solved using research-based AI');
        return {
          success: true,
          solution: aiSolution.response,
          confidence: aiSolution.confidence,
          source: 'research_ai',
          timestamp: new Date(),
          analysis
        };
      }
      
      // Step 4: Try Google research
      const researchSolution = await this.performGoogleResearch(problem, analysis);
      
      // Step 5: If research successful, return solution
      if (researchSolution.success && researchSolution.confidence > 0.6) {
        this.systemMetrics.successfulFixes++;
        this.logger.info('✅ Problem solved using Google research');
        return {
          success: true,
          solution: researchSolution.response,
          confidence: researchSolution.confidence,
          source: 'google_research',
          timestamp: new Date(),
          analysis,
          research: researchSolution.research
        };
      }
      
      // Step 6: Try auto-fixing
      const autoFixResult = await this.autoFixing.autoFix(problem, context);
      
      if (autoFixResult.success) {
        this.systemMetrics.successfulFixes++;
        this.logger.info('✅ Problem solved using auto-fixing');
        return {
          success: true,
          solution: autoFixResult.message || 'Problem automatically fixed',
          confidence: 0.8,
          source: 'auto_fixing',
          timestamp: new Date(),
          analysis,
          autoFix: autoFixResult
        };
      }
      
      // Step 7: Return fallback solution
      this.logger.warn('⚠️ Using fallback solution');
      return {
        success: false,
        solution: this.generateFallbackSolution(problem, analysis),
        confidence: 0.3,
        source: 'fallback',
        timestamp: new Date(),
        analysis
      };
      
    } catch (error) {
      this.logger.error('❌ Problem solving failed:', error);
      return {
        success: false,
        error: error.message,
        solution: 'I apologize, but I encountered an error while solving this problem. Please try again.',
        timestamp: new Date()
      };
    }
  }

  analyzeProblem(problem, context) {
    return {
      originalProblem: problem,
      context,
      keywords: this.extractKeywords(problem),
      category: this.categorizeProblem(problem),
      urgency: this.assessUrgency(problem),
      complexity: this.assessComplexity(problem),
      timestamp: new Date()
    };
  }

  extractKeywords(problem) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return problem.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  }

  categorizeProblem(problem) {
    const text = problem.toLowerCase();
    
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

  assessUrgency(problem) {
    const urgentKeywords = ['critical', 'urgent', 'emergency', 'down', 'broken', 'failed'];
    const text = problem.toLowerCase();
    
    for (const keyword of urgentKeywords) {
      if (text.includes(keyword)) {
        return 'high';
      }
    }
    
    return 'medium';
  }

  assessComplexity(problem) {
    const wordCount = problem.split(' ').length;
    const hasCode = problem.includes('```') || problem.includes('function') || problem.includes('class');
    const hasError = problem.includes('error') || problem.includes('exception');
    
    if (wordCount > 100 || hasCode || hasError) {
      return 'high';
    } else if (wordCount > 50) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  async performGoogleResearch(problem, analysis) {
    try {
      this.systemMetrics.researchQueries++;
      
      const queries = this.generateResearchQueries(problem, analysis);
      const researchResults = [];

      for (const query of queries) {
        const result = await this.googleResearch.searchGoogle(query);
        researchResults.push(result);
      }

      const synthesizedResponse = this.synthesizeResearchResults(researchResults);
      
      return {
        success: true,
        response: synthesizedResponse,
        confidence: 0.7,
        research: researchResults,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('❌ Google research failed:', error);
      return {
        success: false,
        error: error.message,
        response: 'Research failed, using fallback solution',
        confidence: 0.3
      };
    }
  }

  generateResearchQueries(problem, analysis) {
    const baseQuery = analysis.keywords.join(' ');
    const queries = [
      `${baseQuery} solution`,
      `${baseQuery} troubleshooting`,
      `${baseQuery} best practices`,
      `${analysis.category} ${baseQuery} fix`
    ];

    return queries;
  }

  synthesizeResearchResults(researchResults) {
    if (!researchResults || researchResults.length === 0) {
      return 'Based on my research, I recommend checking the system documentation and logs for guidance.';
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

  generateFallbackSolution(problem, analysis) {
    const fallbackSolutions = {
      database: 'Check your database connection settings and ensure the database server is running and accessible.',
      api: 'Verify your API endpoint configuration and check that all required middleware is properly set up.',
      performance: 'Monitor system resources and consider optimizing your code for better performance.',
      auth: 'Check your authentication configuration and ensure tokens are valid and properly configured.',
      error: 'Review the error logs and check the system configuration for any misconfigurations.',
      general: 'I recommend checking the system documentation and logs for more specific guidance on this issue.'
    };

    return fallbackSolutions[analysis.category] || fallbackSolutions.general;
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      metrics: this.systemMetrics,
      health: this.healthMonitor.getHealthStatus(),
      researchAI: this.researchAI.getPerformanceMetrics(),
      autoFixing: this.autoFixing.getFixStats(),
      googleResearch: this.googleResearch.getResearchStats(),
      timestamp: new Date()
    };
  }

  /**
   * Get detailed health report
   */
  getDetailedHealthReport() {
    return this.healthMonitor.getDetailedHealthReport();
  }

  /**
   * Learn from problem and solution
   */
  async learnFromSolution(problem, solution, success) {
    try {
      await this.researchAI.learnFromInteraction(problem, solution, success ? 'positive' : 'negative');
      this.logger.info('🧠 Learned from solution interaction');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to learn from solution:', error);
      return false;
    }
  }

  /**
   * Perform system maintenance
   */
  async performMaintenance() {
    try {
      this.logger.info('🔧 Performing system maintenance...');
      
      // Clear caches
      this.googleResearch.clearCache();
      
      // Update metrics
      this.systemMetrics.lastActivity = new Date();
      
      // Perform health check
      await this.healthMonitor.performHealthCheck();
      this.systemMetrics.healthChecks++;
      
      this.logger.info('✅ System maintenance completed');
      return true;
    } catch (error) {
      this.logger.error('❌ System maintenance failed:', error);
      return false;
    }
  }

  /**
   * Stop the system
   */
  async stop() {
    try {
      await this.healthMonitor.stopMonitoring();
      this.isInitialized = false;
      this.logger.info('🛑 Comprehensive Research System stopped');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to stop system:', error);
      return false;
    }
  }
}

module.exports = ComprehensiveResearchSystem;
