#!/usr/bin/env node

/**
 * Continuous Learning Feed for AI Team
 * Provides ongoing learning and solutions without git commits
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

class ContinuousLearningFeed {
  constructor() {
    this.learningDataPath = path.join(__dirname, '..', 'data', 'continuous-learning-data.json');
    this.solutionsPath = path.join(__dirname, '..', 'data', 'ai-team-learning-data.json');
    this.knowledgeBasePath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
    
    this.initializeLearningData();
  }

  async initializeLearningData() {
    const dataDir = path.dirname(this.learningDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(this.learningDataPath)) {
      const initialData = {
        feedId: 'continuous-learning-feed-001',
        startTime: new Date().toISOString(),
        totalFeeds: 0,
        categories: {},
        lastFeedTime: null,
        activeLearning: true,
        learningSessions: []
      };
      fs.writeFileSync(this.learningDataPath, JSON.stringify(initialData, null, 2));
    }
  }

  async feedSolutionToAITeam(solution) {
    console.log(`🌱 Feeding solution to AI team: ${solution.type}`);
    
    try {
      // Load current learning data
      let learningData = {};
      if (fs.existsSync(this.solutionsPath)) {
        learningData = JSON.parse(fs.readFileSync(this.solutionsPath, 'utf8'));
      }

      if (!learningData.solutions) {
        learningData.solutions = [];
      }

      // Add solution with enhanced metadata
      const enhancedSolution = {
        ...solution,
        feedId: `feed-${Date.now()}`,
        learnedAt: new Date().toISOString(),
        source: 'continuous_learning_feed',
        confidence: 1.0,
        usageCount: 0,
        successRate: 1.0,
        lastUsed: null,
        tags: solution.tags || [],
        category: solution.category || 'general',
        severity: solution.severity || 'medium'
      };

      learningData.solutions.push(enhancedSolution);

      // Update learning statistics
      this.updateLearningStatistics(learningData, enhancedSolution);

      // Save updated learning data
      fs.writeFileSync(this.solutionsPath, JSON.stringify(learningData, null, 2));

      // Update continuous learning feed data
      this.updateContinuousFeedData(enhancedSolution);

      console.log(`   ✅ Solution fed successfully (ID: ${enhancedSolution.feedId})`);
      return enhancedSolution;

    } catch (error) {
      console.error('Failed to feed solution to AI team:', error);
      throw error;
    }
  }

  updateLearningStatistics(learningData, solution) {
    if (!learningData.statistics) {
      learningData.statistics = {
        totalSolutions: 0,
        categories: {},
        severities: {},
        tags: {},
        lastUpdated: new Date().toISOString(),
        feedSources: {}
      };
    }

    learningData.statistics.totalSolutions = learningData.solutions.length;
    learningData.statistics.lastUpdated = new Date().toISOString();

    // Update category statistics
    if (!learningData.statistics.categories[solution.category]) {
      learningData.statistics.categories[solution.category] = 0;
    }
    learningData.statistics.categories[solution.category]++;

    // Update severity statistics
    if (!learningData.statistics.severities[solution.severity]) {
      learningData.statistics.severities[solution.severity] = 0;
    }
    learningData.statistics.severities[solution.severity]++;

    // Update tag statistics
    solution.tags.forEach(tag => {
      if (!learningData.statistics.tags[tag]) {
        learningData.statistics.tags[tag] = 0;
      }
      learningData.statistics.tags[tag]++;
    });

    // Update feed source statistics
    const source = solution.source || 'unknown';
    if (!learningData.statistics.feedSources) {
      learningData.statistics.feedSources = {};
    }
    if (!learningData.statistics.feedSources[source]) {
      learningData.statistics.feedSources[source] = 0;
    }
    learningData.statistics.feedSources[source]++;
  }

  updateContinuousFeedData(solution) {
    let feedData = JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));
    
    feedData.totalFeeds++;
    feedData.lastFeedTime = new Date().toISOString();

    // Update category tracking
    if (!feedData.categories[solution.category]) {
      feedData.categories[solution.category] = 0;
    }
    feedData.categories[solution.category]++;

    // Add to learning sessions
    feedData.learningSessions.push({
      sessionId: solution.feedId,
      timestamp: new Date().toISOString(),
      solutionType: solution.type,
      category: solution.category,
      severity: solution.severity
    });

    // Keep only last 100 learning sessions
    if (feedData.learningSessions.length > 100) {
      feedData.learningSessions = feedData.learningSessions.slice(-100);
    }

    fs.writeFileSync(this.learningDataPath, JSON.stringify(feedData, null, 2));
  }

  async feedMultipleSolutions(solutions) {
    console.log(`🌱 Feeding ${solutions.length} solutions to AI team...\n`);
    
    const results = [];
    for (const solution of solutions) {
      try {
        const result = await this.feedSolutionToAITeam(solution);
        results.push(result);
      } catch (error) {
        console.error(`Failed to feed solution: ${solution.type}`, error);
      }
    }

    console.log(`\n📊 Feeding Summary:`);
    console.log(`✅ Successfully fed: ${results.length}/${solutions.length} solutions`);
    
    return results;
  }

  async feedRealTimeSolution(problem, solution, context = {}) {
    const realTimeSolution = {
      id: `realtime-${Date.now()}`,
      type: 'Real-time Problem Solution',
      problem: problem,
      solution: solution,
      code: context.code || '',
      category: context.category || 'realtime',
      severity: context.severity || 'medium',
      tags: context.tags || ['realtime', 'immediate', 'contextual'],
      context: context
    };

    return await this.feedSolutionToAITeam(realTimeSolution);
  }

  async getLearningStatistics() {
    try {
      if (!fs.existsSync(this.solutionsPath)) {
        return { error: 'No learning data found' };
      }

      const learningData = JSON.parse(fs.readFileSync(this.solutionsPath, 'utf8'));
      const feedData = JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));

      return {
        learning: learningData.statistics || {},
        feed: {
          totalFeeds: feedData.totalFeeds,
          lastFeedTime: feedData.lastFeedTime,
          categories: feedData.categories,
          activeLearning: feedData.activeLearning
        },
        recentSolutions: learningData.solutions?.slice(-10) || []
      };

    } catch (error) {
      return { error: error.message };
    }
  }

  async searchSolutions(query) {
    try {
      if (!fs.existsSync(this.solutionsPath)) {
        return [];
      }

      const learningData = JSON.parse(fs.readFileSync(this.solutionsPath, 'utf8'));
      const solutions = learningData.solutions || [];

      // Simple search implementation
      const queryLower = query.toLowerCase();
      const matchingSolutions = solutions.filter(solution => 
        solution.problem.toLowerCase().includes(queryLower) ||
        solution.solution.toLowerCase().includes(queryLower) ||
        solution.type.toLowerCase().includes(queryLower) ||
        solution.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );

      return matchingSolutions;

    } catch (error) {
      console.error('Failed to search solutions:', error);
      return [];
    }
  }

  async exportLearningData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportPath = path.join(__dirname, '..', 'data', `learning-export-${timestamp}.json`);
      
      const learningData = JSON.parse(fs.readFileSync(this.solutionsPath, 'utf8'));
      const feedData = JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));
      
      const exportData = {
        exportTimestamp: new Date().toISOString(),
        learningData,
        feedData,
        summary: {
          totalSolutions: learningData.solutions?.length || 0,
          totalFeeds: feedData.totalFeeds,
          categories: Object.keys(learningData.statistics?.categories || {}),
          lastFeedTime: feedData.lastFeedTime
        }
      };

      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`📁 Learning data exported to: ${exportPath}`);
      
      return exportPath;

    } catch (error) {
      console.error('Failed to export learning data:', error);
      throw error;
    }
  }
}

// Example usage and testing
async function demonstrateContinuousLearning() {
  console.log('🚀 Continuous Learning Feed Demonstration');
  console.log('=========================================\n');

  const feed = new ContinuousLearningFeed();

  // Example real-time solution
  const realTimeSolution = await feed.feedRealTimeSolution(
    'Database connection timeout error',
    'Fixed by implementing connection pooling and retry logic with exponential backoff',
    {
      category: 'database',
      severity: 'high',
      tags: ['database', 'connection', 'timeout', 'pooling'],
      code: `
// Database connection pooling fix
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});
      `
    }
  );

  console.log(`\n📊 Learning Statistics:`);
  const stats = await feed.getLearningStatistics();
  console.log(JSON.stringify(stats, null, 2));

  console.log(`\n🔍 Searching for 'database' solutions:`);
  const searchResults = await feed.searchSolutions('database');
  console.log(`Found ${searchResults.length} matching solutions`);

  console.log(`\n📁 Exporting learning data...`);
  const exportPath = await feed.exportLearningData();
  console.log(`Exported to: ${exportPath}`);

  return feed;
}

// Run demonstration if called directly
if (require.main === module) {
  demonstrateContinuousLearning().catch(console.error);
}

module.exports = { ContinuousLearningFeed };
