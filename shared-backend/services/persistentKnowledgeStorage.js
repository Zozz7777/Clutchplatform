/**
 * Persistent Knowledge Storage System
 * Stores and retrieves all learning experiences, solutions, and improvements
 * Enables continuous learning and self-sufficiency
 */

const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');
const crypto = require('crypto');

class PersistentKnowledgeStorage {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/knowledge-storage.log' }),
        new winston.transports.Console()
      ]
    });

    // Knowledge storage paths
    this.storagePaths = {
      solutions: path.join(__dirname, '../knowledge/solutions'),
      patterns: path.join(__dirname, '../knowledge/patterns'),
      experiences: path.join(__dirname, '../knowledge/experiences'),
      improvements: path.join(__dirname, '../knowledge/improvements'),
      bestPractices: path.join(__dirname, '../knowledge/best-practices'),
      troubleshooting: path.join(__dirname, '../knowledge/troubleshooting'),
      codeExamples: path.join(__dirname, '../knowledge/code-examples'),
      architecture: path.join(__dirname, '../knowledge/architecture')
    };

    // Knowledge indexes for fast retrieval
    this.knowledgeIndexes = {
      byTopic: new Map(),
      byComplexity: new Map(),
      bySuccess: new Map(),
      byDate: new Map(),
      byTeamMember: new Map()
    };

    // Learning metrics
    this.learningMetrics = {
      totalSolutions: 0,
      totalPatterns: 0,
      totalExperiences: 0,
      successRate: 0,
      selfSufficiencyScore: 0,
      lastUpdated: new Date()
    };

    this.initializeStorage();
  }

  /**
   * Initialize knowledge storage system
   */
  async initializeStorage() {
    this.logger.info('🗄️ Initializing persistent knowledge storage...');

    try {
      // Create knowledge directories
      for (const [category, dirPath] of Object.entries(this.storagePaths)) {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.info(`📁 Created knowledge directory: ${category}`);
      }

      // Load existing knowledge indexes
      await this.loadKnowledgeIndexes();

      // Initialize comprehensive knowledge base
      await this.initializeComprehensiveKnowledge();

      this.logger.info('✅ Persistent knowledge storage initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize knowledge storage:', error);
      throw error;
    }
  }

  /**
   * Store a solution with comprehensive metadata
   */
  async storeSolution(problem, solution, context = {}) {
    const solutionId = this.generateId(problem);
    const timestamp = new Date();

    const solutionData = {
      id: solutionId,
      problem: problem,
      solution: solution,
      context: context,
      timestamp: timestamp,
      complexity: this.analyzeComplexity(problem),
      success: true,
      teamMember: context.teamMember || 'system',
      category: this.categorizeProblem(problem),
      tags: this.generateTags(problem, solution),
      usageCount: 0,
      lastUsed: timestamp,
      effectiveness: 1.0,
      alternatives: [],
      relatedSolutions: []
    };

    try {
      // Store solution file
      const solutionPath = path.join(this.storagePaths.solutions, `${solutionId}.json`);
      await fs.writeFile(solutionPath, JSON.stringify(solutionData, null, 2));

      // Update indexes
      this.updateIndexes(solutionData);

      // Update metrics
      this.learningMetrics.totalSolutions++;
      this.updateSelfSufficiencyScore();

      this.logger.info(`💾 Stored solution: ${solutionId}`);
      return solutionId;

    } catch (error) {
      this.logger.error('Failed to store solution:', error);
      throw error;
    }
  }

  /**
   * Store a learning pattern
   */
  async storePattern(pattern, context = {}) {
    const patternId = this.generateId(pattern.name || pattern.description);
    const timestamp = new Date();

    const patternData = {
      id: patternId,
      name: pattern.name,
      description: pattern.description,
      pattern: pattern.pattern,
      context: context,
      timestamp: timestamp,
      category: pattern.category || 'general',
      tags: pattern.tags || [],
      usageCount: 0,
      successRate: 1.0,
      relatedPatterns: [],
      examples: pattern.examples || []
    };

    try {
      // Store pattern file
      const patternPath = path.join(this.storagePaths.patterns, `${patternId}.json`);
      await fs.writeFile(patternPath, JSON.stringify(patternData, null, 2));

      // Update indexes
      this.updatePatternIndexes(patternData);

      // Update metrics
      this.learningMetrics.totalPatterns++;
      this.updateSelfSufficiencyScore();

      this.logger.info(`🔍 Stored pattern: ${patternId}`);
      return patternId;

    } catch (error) {
      this.logger.error('Failed to store pattern:', error);
      throw error;
    }
  }

  /**
   * Store an experience (success or failure)
   */
  async storeExperience(experience, context = {}) {
    const experienceId = this.generateId(experience.description);
    const timestamp = new Date();

    const experienceData = {
      id: experienceId,
      description: experience.description,
      outcome: experience.outcome, // 'success' or 'failure'
      context: context,
      timestamp: timestamp,
      lessons: experience.lessons || [],
      improvements: experience.improvements || [],
      teamMember: context.teamMember || 'system',
      category: experience.category || 'general',
      tags: experience.tags || [],
      impact: experience.impact || 'medium'
    };

    try {
      // Store experience file
      const experiencePath = path.join(this.storagePaths.experiences, `${experienceId}.json`);
      await fs.writeFile(experiencePath, JSON.stringify(experienceData, null, 2));

      // Update indexes
      this.updateExperienceIndexes(experienceData);

      // Update metrics
      this.learningMetrics.totalExperiences++;
      this.updateSelfSufficiencyScore();

      this.logger.info(`📚 Stored experience: ${experienceId}`);
      return experienceId;

    } catch (error) {
      this.logger.error('Failed to store experience:', error);
      throw error;
    }
  }

  /**
   * Store an improvement
   */
  async storeImprovement(improvement, context = {}) {
    const improvementId = this.generateId(improvement.description);
    const timestamp = new Date();

    const improvementData = {
      id: improvementId,
      description: improvement.description,
      before: improvement.before,
      after: improvement.after,
      impact: improvement.impact,
      context: context,
      timestamp: timestamp,
      category: improvement.category || 'optimization',
      tags: improvement.tags || [],
      metrics: improvement.metrics || {},
      teamMember: context.teamMember || 'system'
    };

    try {
      // Store improvement file
      const improvementPath = path.join(this.storagePaths.improvements, `${improvementId}.json`);
      await fs.writeFile(improvementPath, JSON.stringify(improvementData, null, 2));

      // Update indexes
      this.updateImprovementIndexes(improvementData);

      this.logger.info(`🚀 Stored improvement: ${improvementId}`);
      return improvementId;

    } catch (error) {
      this.logger.error('Failed to store improvement:', error);
      throw error;
    }
  }

  /**
   * Retrieve solutions by query
   */
  async retrieveSolutions(query, options = {}) {
    const {
      limit = 10,
      category = null,
      complexity = null,
      teamMember = null,
      minEffectiveness = 0.5
    } = options;

    try {
      let solutions = [];

      // Search by topic
      if (this.knowledgeIndexes.byTopic.has(query.toLowerCase())) {
        solutions = this.knowledgeIndexes.byTopic.get(query.toLowerCase());
      } else {
        // Fuzzy search through all solutions
        solutions = await this.fuzzySearchSolutions(query);
      }

      // Apply filters
      solutions = solutions.filter(solution => {
        if (category && solution.category !== category) return false;
        if (complexity && solution.complexity !== complexity) return false;
        if (teamMember && solution.teamMember !== teamMember) return false;
        if (solution.effectiveness < minEffectiveness) return false;
        return true;
      });

      // Sort by effectiveness and usage
      solutions.sort((a, b) => {
        const scoreA = a.effectiveness * (1 + a.usageCount * 0.1);
        const scoreB = b.effectiveness * (1 + b.usageCount * 0.1);
        return scoreB - scoreA;
      });

      // Update usage count for retrieved solutions
      solutions.slice(0, limit).forEach(solution => {
        solution.usageCount++;
        solution.lastUsed = new Date();
        this.updateSolutionFile(solution);
      });

      this.logger.info(`🔍 Retrieved ${solutions.length} solutions for query: ${query}`);
      return solutions.slice(0, limit);

    } catch (error) {
      this.logger.error('Failed to retrieve solutions:', error);
      return [];
    }
  }

  /**
   * Retrieve patterns by query
   */
  async retrievePatterns(query, options = {}) {
    const { limit = 10, category = null } = options;

    try {
      let patterns = [];

      // Search by topic
      if (this.knowledgeIndexes.byTopic.has(query.toLowerCase())) {
        patterns = this.knowledgeIndexes.byTopic.get(query.toLowerCase());
      } else {
        // Fuzzy search through all patterns
        patterns = await this.fuzzySearchPatterns(query);
      }

      // Apply filters
      patterns = patterns.filter(pattern => {
        if (category && pattern.category !== category) return false;
        return true;
      });

      // Sort by success rate and usage
      patterns.sort((a, b) => {
        const scoreA = a.successRate * (1 + a.usageCount * 0.1);
        const scoreB = b.successRate * (1 + b.usageCount * 0.1);
        return scoreB - scoreA;
      });

      this.logger.info(`🔍 Retrieved ${patterns.length} patterns for query: ${query}`);
      return patterns.slice(0, limit);

    } catch (error) {
      this.logger.error('Failed to retrieve patterns:', error);
      return [];
    }
  }

  /**
   * Learn from experience and improve
   */
  async learnFromExperience(experience, context = {}) {
    this.logger.info(`🧠 Learning from experience: ${experience.description}`);

    try {
      // Store the experience
      const experienceId = await this.storeExperience(experience, context);

      // Extract lessons and improvements
      const lessons = this.extractLessons(experience);
      const improvements = this.extractImprovements(experience);

      // Update related solutions and patterns
      await this.updateRelatedKnowledge(experience, lessons, improvements);

      // Update self-sufficiency score
      this.updateSelfSufficiencyScore();

      // Create improvement recommendations
      const recommendations = await this.generateImprovementRecommendations(experience);

      this.logger.info(`✅ Learned from experience: ${experienceId}`);
      return {
        experienceId,
        lessons,
        improvements,
        recommendations
      };

    } catch (error) {
      this.logger.error('Failed to learn from experience:', error);
      throw error;
    }
  }

  /**
   * Get self-sufficiency score
   */
  getSelfSufficiencyScore() {
    const totalKnowledge = this.learningMetrics.totalSolutions + 
                          this.learningMetrics.totalPatterns + 
                          this.learningMetrics.totalExperiences;

    const successRate = this.learningMetrics.successRate;
    const knowledgeDiversity = this.calculateKnowledgeDiversity();

    // Calculate self-sufficiency score (0-100)
    const score = Math.min(100, 
      (totalKnowledge * 0.3) + 
      (successRate * 0.4) + 
      (knowledgeDiversity * 0.3)
    );

    return {
      score: Math.round(score),
      totalKnowledge,
      successRate,
      knowledgeDiversity,
      lastUpdated: this.learningMetrics.lastUpdated
    };
  }

  /**
   * Get learning progress
   */
  getLearningProgress() {
    return {
      metrics: this.learningMetrics,
      selfSufficiency: this.getSelfSufficiencyScore(),
      knowledgeAreas: this.getKnowledgeAreas(),
      recentActivity: this.getRecentActivity(),
      improvementTrends: this.getImprovementTrends()
    };
  }

  /**
   * Initialize comprehensive knowledge base
   */
  async initializeComprehensiveKnowledge() {
    this.logger.info('📚 Initializing comprehensive knowledge base...');

    // Store comprehensive backend development knowledge
    const comprehensiveKnowledge = {
      backendDevelopment: {
        nodejs: {
          eventLoop: "Node.js event loop handles asynchronous operations efficiently using callbacks, promises, and async/await.",
          modules: "CommonJS (require/module.exports) and ES6 modules (import/export) for code organization.",
          streams: "Streams for handling large data: Readable, Writable, Duplex, and Transform streams.",
          clustering: "Cluster module for utilizing multiple CPU cores with child processes.",
          performance: "Performance monitoring with perf_hooks, memory usage tracking, and profiling."
        },
        express: {
          middleware: "Middleware functions execute during request-response cycle. Order matters.",
          routing: "Express routing with parameters, query strings, and route handlers.",
          errorHandling: "Error handling middleware with try-catch blocks and custom error classes.",
          security: "Security middleware: helmet, cors, rate-limiting, and input validation."
        },
        authentication: {
          jwt: "JSON Web Tokens for stateless authentication with header, payload, and signature.",
          oauth2: "OAuth 2.0 for third-party authentication with authorization codes.",
          sessions: "Session-based authentication with express-session and Redis storage.",
          bcrypt: "Password hashing with bcrypt for secure password storage."
        }
      },
      databases: {
        mongodb: {
          documents: "MongoDB stores data as BSON documents in collections, similar to JSON objects.",
          queries: "Query operations with find(), findOne(), and aggregation pipelines.",
          indexing: "Indexes for query performance: single field, compound, and text indexes.",
          aggregation: "Aggregation pipeline for complex data processing and analytics.",
          transactions: "ACID transactions for multi-document operations."
        },
        performance: {
          queryOptimization: "Query optimization techniques and explain() method for performance analysis.",
          connectionPooling: "Connection pooling for efficient database connections.",
          caching: "Caching strategies with Redis for frequently accessed data."
        }
      },
      security: {
        owasp: "OWASP Top 10 security vulnerabilities and prevention strategies.",
        cors: "Cross-Origin Resource Sharing configuration for API security.",
        rateLimiting: "Rate limiting to prevent abuse and DDoS attacks.",
        inputValidation: "Input validation and sanitization to prevent injection attacks.",
        https: "HTTPS implementation with SSL/TLS certificates for secure communication."
      },
      deployment: {
        docker: "Docker containers for consistent deployment environments.",
        kubernetes: "Kubernetes for container orchestration and management.",
        cloud: "Cloud deployment strategies with AWS, Azure, and GCP.",
        monitoring: "Application monitoring with tools like New Relic, DataDog, and APM solutions."
      }
    };

    // Store all knowledge
    for (const [category, subcategories] of Object.entries(comprehensiveKnowledge)) {
      for (const [subcategory, topics] of Object.entries(subcategories)) {
        for (const [topic, content] of Object.entries(topics)) {
          await this.storeSolution(
            `${category} - ${subcategory} - ${topic}`,
            content,
            {
              category: category,
              subcategory: subcategory,
              topic: topic,
              source: 'comprehensive_knowledge_base',
              teamMember: 'system'
            }
          );
        }
      }
    }

    this.logger.info('✅ Comprehensive knowledge base initialized');
  }

  // Helper methods
  generateId(input) {
    return crypto.createHash('md5').update(input + Date.now()).digest('hex').substring(0, 12);
  }

  analyzeComplexity(problem) {
    const complexityKeywords = {
      simple: ['basic', 'simple', 'easy', 'straightforward'],
      moderate: ['complex', 'advanced', 'optimization', 'performance'],
      complex: ['architecture', 'scalability', 'distributed', 'microservices']
    };

    const problemLower = problem.toLowerCase();
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      if (keywords.some(keyword => problemLower.includes(keyword))) {
        return level;
      }
    }
    return 'moderate';
  }

  categorizeProblem(problem) {
    const categories = {
      authentication: ['login', 'auth', 'jwt', 'oauth', 'session'],
      database: ['database', 'mongodb', 'sql', 'query', 'index'],
      security: ['security', 'cors', 'rate limit', 'validation', 'https'],
      performance: ['performance', 'optimization', 'caching', 'memory'],
      deployment: ['deploy', 'docker', 'kubernetes', 'cloud', 'ci/cd'],
      api: ['api', 'rest', 'graphql', 'endpoint', 'route']
    };

    const problemLower = problem.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => problemLower.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  generateTags(problem, solution) {
    const tags = [];
    const text = (problem + ' ' + solution).toLowerCase();
    
    const tagKeywords = {
      'nodejs': ['node', 'nodejs', 'javascript'],
      'express': ['express', 'middleware', 'routing'],
      'mongodb': ['mongodb', 'mongo', 'database'],
      'security': ['security', 'auth', 'jwt', 'cors'],
      'performance': ['performance', 'optimization', 'caching'],
      'docker': ['docker', 'container', 'deployment'],
      'api': ['api', 'rest', 'endpoint', 'route']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }

  updateIndexes(solutionData) {
    // Update topic index
    const topics = solutionData.tags.concat([solutionData.category]);
    topics.forEach(topic => {
      if (!this.knowledgeIndexes.byTopic.has(topic)) {
        this.knowledgeIndexes.byTopic.set(topic, []);
      }
      this.knowledgeIndexes.byTopic.get(topic).push(solutionData);
    });

    // Update complexity index
    if (!this.knowledgeIndexes.byComplexity.has(solutionData.complexity)) {
      this.knowledgeIndexes.byComplexity.set(solutionData.complexity, []);
    }
    this.knowledgeIndexes.byComplexity.get(solutionData.complexity).push(solutionData);

    // Update team member index
    if (!this.knowledgeIndexes.byTeamMember.has(solutionData.teamMember)) {
      this.knowledgeIndexes.byTeamMember.set(solutionData.teamMember, []);
    }
    this.knowledgeIndexes.byTeamMember.get(solutionData.teamMember).push(solutionData);
  }

  updatePatternIndexes(patternData) {
    // Similar to updateIndexes but for patterns
    const topics = patternData.tags.concat([patternData.category]);
    topics.forEach(topic => {
      if (!this.knowledgeIndexes.byTopic.has(topic)) {
        this.knowledgeIndexes.byTopic.set(topic, []);
      }
      this.knowledgeIndexes.byTopic.get(topic).push(patternData);
    });
  }

  updateExperienceIndexes(experienceData) {
    // Similar to updateIndexes but for experiences
    const topics = experienceData.tags.concat([experienceData.category]);
    topics.forEach(topic => {
      if (!this.knowledgeIndexes.byTopic.has(topic)) {
        this.knowledgeIndexes.byTopic.set(topic, []);
      }
      this.knowledgeIndexes.byTopic.get(topic).push(experienceData);
    });
  }

  updateImprovementIndexes(improvementData) {
    // Similar to updateIndexes but for improvements
    const topics = improvementData.tags.concat([improvementData.category]);
    topics.forEach(topic => {
      if (!this.knowledgeIndexes.byTopic.has(topic)) {
        this.knowledgeIndexes.byTopic.set(topic, []);
      }
      this.knowledgeIndexes.byTopic.get(topic).push(improvementData);
    });
  }

  async fuzzySearchSolutions(query) {
    // Implement fuzzy search through all solution files
    const solutions = [];
    try {
      const files = await fs.readdir(this.storagePaths.solutions);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.storagePaths.solutions, file), 'utf8');
          const solution = JSON.parse(content);
          if (this.matchesQuery(solution, query)) {
            solutions.push(solution);
          }
        }
      }
    } catch (error) {
      this.logger.error('Fuzzy search failed:', error);
    }
    return solutions;
  }

  async fuzzySearchPatterns(query) {
    // Implement fuzzy search through all pattern files
    const patterns = [];
    try {
      const files = await fs.readdir(this.storagePaths.patterns);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.storagePaths.patterns, file), 'utf8');
          const pattern = JSON.parse(content);
          if (this.matchesQuery(pattern, query)) {
            patterns.push(pattern);
          }
        }
      }
    } catch (error) {
      this.logger.error('Fuzzy search failed:', error);
    }
    return patterns;
  }

  matchesQuery(item, query) {
    const searchText = (item.problem || item.name || item.description || '').toLowerCase();
    const queryLower = query.toLowerCase();
    return searchText.includes(queryLower) || 
           item.tags.some(tag => tag.toLowerCase().includes(queryLower));
  }

  updateSelfSufficiencyScore() {
    const totalKnowledge = this.learningMetrics.totalSolutions + 
                          this.learningMetrics.totalPatterns + 
                          this.learningMetrics.totalExperiences;
    
    // Calculate self-sufficiency based on knowledge accumulation
    this.learningMetrics.selfSufficiencyScore = Math.min(100, totalKnowledge * 0.5);
    this.learningMetrics.lastUpdated = new Date();
  }

  extractLessons(experience) {
    // Extract lessons from experience
    return experience.lessons || [];
  }

  extractImprovements(experience) {
    // Extract improvements from experience
    return experience.improvements || [];
  }

  async updateRelatedKnowledge(experience, lessons, improvements) {
    // Update related solutions and patterns based on experience
    // This would implement the learning feedback loop
  }

  async generateImprovementRecommendations(experience) {
    // Generate improvement recommendations based on experience
    return [];
  }

  calculateKnowledgeDiversity() {
    // Calculate knowledge diversity across different areas
    const categories = new Set();
    for (const solutions of this.knowledgeIndexes.byTopic.values()) {
      solutions.forEach(solution => categories.add(solution.category));
    }
    return Math.min(100, categories.size * 10);
  }

  getKnowledgeAreas() {
    // Get knowledge areas and their coverage
    const areas = {};
    for (const [topic, solutions] of this.knowledgeIndexes.byTopic.entries()) {
      areas[topic] = solutions.length;
    }
    return areas;
  }

  getRecentActivity() {
    // Get recent learning activity
    return {
      lastSolutions: 0,
      lastPatterns: 0,
      lastExperiences: 0,
      lastImprovements: 0
    };
  }

  getImprovementTrends() {
    // Get improvement trends over time
    return {
      trend: 'improving',
      rate: 0.1
    };
  }

  async loadKnowledgeIndexes() {
    // Load existing knowledge indexes from storage
    // This would implement persistence of indexes
  }

  async updateSolutionFile(solution) {
    // Update solution file with new usage data
    try {
      const solutionPath = path.join(this.storagePaths.solutions, `${solution.id}.json`);
      await fs.writeFile(solutionPath, JSON.stringify(solution, null, 2));
    } catch (error) {
      this.logger.error('Failed to update solution file:', error);
    }
  }
}

module.exports = PersistentKnowledgeStorage;
