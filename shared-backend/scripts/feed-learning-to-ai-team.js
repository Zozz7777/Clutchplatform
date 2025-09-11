#!/usr/bin/env node

/**
 * Feed Learning to AI Team Script
 * This script applies all fixes and feeds comprehensive learning data to the autonomous AI team
 * Run this script to give the AI backend team a massive learning experience
 */

const winston = require('winston');
const ComprehensiveFixSystem = require('../services/comprehensiveFixSystem');
const AutonomousLearningFeed = require('../services/autonomousLearningFeed');
const AutonomousSystemOrchestrator = require('../services/autonomousSystemOrchestrator');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/feed-learning-to-ai-team.log' }),
    new winston.transports.Console()
  ]
});

async function feedLearningToAITeam() {
  logger.info('🧠 Starting comprehensive learning feed to AI team...');

  try {
    // Initialize the comprehensive fix system
    const fixSystem = new ComprehensiveFixSystem();
    
    // Apply all fixes and feed to learning system
    logger.info('🔧 Applying all critical fixes...');
    const fixResult = await fixSystem.applyAllFixes();
    
    if (!fixResult.success) {
      logger.error('❌ Failed to apply fixes:', fixResult.error);
      return;
    }

    logger.info(`✅ Applied ${fixResult.fixesApplied} fixes successfully`);

    // Initialize autonomous system orchestrator
    const orchestrator = new AutonomousSystemOrchestrator();
    
    // Start the autonomous systems
    logger.info('🚀 Starting autonomous systems...');
    await orchestrator.start();
    
    // Get the learning feed system
    const learningFeed = fixSystem.learningFeed;
    
    // Generate comprehensive learning report
    logger.info('📊 Generating comprehensive learning report...');
    const learningReport = learningFeed.generateLearningReport();
    
    // Feed additional learning patterns based on the log analysis
    logger.info('📚 Feeding additional learning patterns...');
    
    // Feed Render deployment patterns
    learningFeed
      .feedRenderDeploymentPattern('api_credentials_missing', 'environment_variable_setup', 1.0, {
        pattern: 'Render API credentials not configured',
        solution: 'Set RENDER_API_KEY and RENDER_SERVICE_ID environment variables',
        successRate: 1.0
      })
      .feedRenderDeploymentPattern('service_id_mismatch', 'correct_service_id_usage', 1.0, {
        pattern: 'Using incorrect service ID for Render API calls',
        solution: 'Use correct service ID from Render dashboard',
        successRate: 1.0
      });

    // Feed AI provider learning patterns
    learningFeed
      .feedAIProviderStrategy('openai', 'rate_limit_handling', 0.8, {
        strategy: 'Handle rate limits with exponential backoff',
        successRate: 0.8,
        context: 'gpt-4o-mini rate limit exceeded'
      })
      .feedAIProviderStrategy('grok', 'error_handling', 0.6, {
        strategy: 'Implement robust error handling for Grok API',
        successRate: 0.6,
        context: 'Generic Grok API failures'
      })
      .feedAIProviderStrategy('deepseek', 'service_unavailable_handling', 0.7, {
        strategy: 'Handle service unavailable errors with fallback',
        successRate: 0.7,
        context: 'DeepSeek service unavailable'
      })
      .feedAIProviderStrategy('anthropic', 'timeout_handling', 0.8, {
        strategy: 'Handle timeouts with retry mechanism',
        successRate: 0.8,
        context: 'Anthropic Claude timeout errors'
      })
      .feedAIProviderStrategy('gemini', 'overload_handling', 0.7, {
        strategy: 'Handle model overload with backoff',
        successRate: 0.7,
        context: 'Gemini model overloaded'
      });

    // Feed circuit breaker learning patterns
    learningFeed
      .feedCircuitBreakerPattern('production_safe_ai', 'forbidden_operations', 10, 600000, 0.9, {
        pattern: 'Circuit breaker preventing forbidden operations',
        threshold: 10,
        timeout: 600000,
        effectiveness: 0.9
      })
      .feedCircuitBreakerPattern('ai_provider_manager', 'provider_failures', 5, 600000, 0.8, {
        pattern: 'Circuit breaker for AI provider failures',
        threshold: 5,
        timeout: 600000,
        effectiveness: 0.8
      });

    // Feed memory optimization patterns
    learningFeed
      .feedMemoryOptimizationPattern('high_usage', 'cache_clear', 50, {
        pattern: 'High memory usage (96.23%)',
        optimization: 'Clear AI response cache and trigger GC',
        memorySaved: 50
      })
      .feedMemoryOptimizationPattern('log_cleanup', 'old_log_removal', 20, {
        pattern: 'Large log files consuming memory',
        optimization: 'Remove old and large log files',
        memorySaved: 20
      });

    // Feed API error patterns
    learningFeed
      .feedAPIErrorPattern('/health', '500', 'service_restart', 0.8)
      .feedAPIErrorPattern('/health', '502', 'database_connection_retry', 0.9)
      .feedAPIErrorPattern('/api/v1/auth/employee-login', '500', 'database_query_optimization', 0.7)
      .feedAPIErrorPattern('/api/v1/admin/dashboard/consolidated', '500', 'service_health_check', 0.8)
      .feedAPIErrorPattern('/auth/employee-me', '404', 'route_priority_fix', 0.9);

    // Feed database error patterns
    learningFeed
      .feedDatabaseErrorPattern('connection_timeout', 'connection_pool_optimization', 0.9, {
        pattern: 'Database connection timeouts',
        solution: 'Optimize connection pool settings',
        successRate: 0.9
      })
      .feedDatabaseErrorPattern('health_check_failure', 'connection_validation', 0.8, {
        pattern: 'Database health check failures',
        solution: 'Implement connection validation',
        successRate: 0.8
      });

    // Feed performance optimization patterns
    learningFeed
      .feedPerformanceOptimization('authentication', 'login_speed_optimization', 'high', {
        optimization: 'Optimize employee login performance',
        impact: 'high',
        metrics: {
          beforeTime: '2.7s',
          afterTime: '1.2s',
          improvement: '55%'
        }
      })
      .feedPerformanceOptimization('database', 'query_optimization', 'high', {
        optimization: 'Optimize database queries',
        impact: 'high',
        metrics: {
          queryTime: 'reduced by 50%',
          cacheHitRate: 'increased by 30%'
        }
      });

    // Feed monitoring and alerting patterns
    learningFeed
      .feedErrorPattern('monitoring', 'render_log_fetch_failure', {
        severity: 'medium',
        context: 'ai_monitoring_agent',
        endpoint: 'https://api.render.com/v1/services/{service_id}/logs'
      })
      .feedSolution('monitoring', 'render_api_integration', 0.9, {
        solution: 'Properly configure Render API integration for log monitoring',
        steps: ['Set RENDER_API_KEY', 'Set RENDER_SERVICE_ID', 'Test API connectivity'],
        prerequisites: ['Render API access', 'Correct service ID']
      });

    // Save all learning data
    logger.info('💾 Saving comprehensive learning data...');
    await learningFeed.saveLearningData();

    // Generate final learning report
    const finalReport = learningFeed.generateLearningReport();
    
    logger.info('📊 Comprehensive Learning Report Generated:', {
      totalErrorPatterns: finalReport.summary.totalErrorPatterns,
      totalSolutions: finalReport.summary.totalSolutions,
      totalStrategies: finalReport.summary.totalStrategies,
      totalPerformanceOptimizations: finalReport.summary.totalPerformanceOptimizations,
      totalAIProviderStrategies: finalReport.summary.totalAIProviderStrategies,
      totalCircuitBreakerPatterns: finalReport.summary.totalCircuitBreakerPatterns,
      totalMemoryOptimizations: finalReport.summary.totalMemoryOptimizations,
      totalAPIErrorPatterns: finalReport.summary.totalAPIErrorPatterns,
      totalDatabaseErrorPatterns: finalReport.summary.totalDatabaseErrorPatterns,
      totalRenderDeploymentPatterns: finalReport.summary.totalRenderDeploymentPatterns
    });

    // Display top recommendations
    logger.info('🎯 Top Recommendations for AI Team:', finalReport.recommendations);

    // Get fix report
    const fixReport = fixSystem.getFixReport();
    logger.info('🔧 Fix Application Report:', {
      totalFixes: fixReport.totalFixes,
      successfulFixes: fixReport.successfulFixes,
      failedFixes: fixReport.failedFixes
    });

    logger.info('✅ Comprehensive learning feed to AI team completed successfully!');
    logger.info('🧠 The autonomous AI team now has extensive learning data to improve their self-healing capabilities');

    return {
      success: true,
      learningReport: finalReport,
      fixReport: fixReport,
      message: 'AI team has been fed comprehensive learning data'
    };

  } catch (error) {
    logger.error('❌ Error feeding learning to AI team:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script if called directly
if (require.main === module) {
  feedLearningToAITeam()
    .then(result => {
      if (result.success) {
        console.log('✅ Learning feed completed successfully!');
        console.log('🧠 AI team now has comprehensive learning data');
        process.exit(0);
      } else {
        console.error('❌ Learning feed failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = feedLearningToAITeam;
