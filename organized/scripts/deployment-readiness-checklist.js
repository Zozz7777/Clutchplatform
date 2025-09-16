const fs = require('fs');
const path = require('path');

class DeploymentReadinessChecklist {
  constructor() {
    this.checklist = {
      infrastructure: [],
      security: [],
      performance: [],
      monitoring: [],
      data: [],
      code: [],
      testing: []
    };
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  // ==================== INFRASTRUCTURE CHECKS ====================

  checkInfrastructure() {
    console.log('🏗️ Checking Infrastructure Requirements...\n');

    const checks = [
      {
        name: 'Server Configuration',
        check: () => this.checkServerConfig(),
        critical: true
      },
      {
        name: 'Database Connection',
        check: () => this.checkDatabaseConnection(),
        critical: true
      },
      {
        name: 'Environment Variables',
        check: () => this.checkEnvironmentVariables(),
        critical: true
      },
      {
        name: 'Port Configuration',
        check: () => this.checkPortConfiguration(),
        critical: true
      },
      {
        name: 'SSL/TLS Configuration',
        check: () => this.checkSSLConfiguration(),
        critical: false
      },
      {
        name: 'Load Balancer Setup',
        check: () => this.checkLoadBalancer(),
        critical: false
      }
    ];

    this.runChecks('infrastructure', checks);
  }

  checkServerConfig() {
    const serverFile = path.join(__dirname, 'shared-backend', 'server.js');
    const exists = fs.existsSync(serverFile);
    
    if (exists) {
      const content = fs.readFileSync(serverFile, 'utf8');
      const hasGracefulShutdown = content.includes('graceful') || content.includes('SIGTERM');
      const hasErrorHandling = content.includes('error') && content.includes('handler');
      
      return {
        success: exists && hasGracefulShutdown && hasErrorHandling,
        details: {
          serverFileExists: exists,
          hasGracefulShutdown: hasGracefulShutdown,
          hasErrorHandling: hasErrorHandling
        }
      };
    }
    
    return { success: false, details: { serverFileExists: false } };
  }

  checkDatabaseConnection() {
    const dbConfigFile = path.join(__dirname, 'shared-backend', 'config', 'database.js');
    const exists = fs.existsSync(dbConfigFile);
    
    if (exists) {
      const content = fs.readFileSync(dbConfigFile, 'utf8');
      const hasConnectionString = content.includes('mongodb://') || content.includes('MONGODB_URI');
      const hasErrorHandling = content.includes('catch') || content.includes('error');
      
      return {
        success: exists && hasConnectionString && hasErrorHandling,
        details: {
          configFileExists: exists,
          hasConnectionString: hasConnectionString,
          hasErrorHandling: hasErrorHandling
        }
      };
    }
    
    return { success: false, details: { configFileExists: false } };
  }

  checkEnvironmentVariables() {
    const envFile = path.join(__dirname, '.env');
    const envExampleFile = path.join(__dirname, '.env.example');
    
    const envExists = fs.existsSync(envFile);
    const envExampleExists = fs.existsSync(envExampleFile);
    
    let requiredVars = [];
    if (envExampleExists) {
      const content = fs.readFileSync(envExampleFile, 'utf8');
      requiredVars = content.split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim());
    }
    
    return {
      success: envExists && envExampleExists,
      details: {
        envFileExists: envExists,
        envExampleExists: envExampleExists,
        requiredVariables: requiredVars.length,
        variables: requiredVars
      }
    };
  }

  checkPortConfiguration() {
    const serverFile = path.join(__dirname, 'shared-backend', 'server.js');
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      const hasPortConfig = content.includes('PORT') || content.includes('port');
      const hasDefaultPort = content.includes('5000') || content.includes('3000');
      
      return {
        success: hasPortConfig && hasDefaultPort,
        details: {
          hasPortConfig: hasPortConfig,
          hasDefaultPort: hasDefaultPort
        }
      };
    }
    
    return { success: false, details: { serverFileExists: false } };
  }

  checkSSLConfiguration() {
    // Check for SSL/TLS configuration files
    const sslFiles = [
      path.join(__dirname, 'ssl', 'cert.pem'),
      path.join(__dirname, 'ssl', 'key.pem'),
      path.join(__dirname, 'certs', 'cert.pem'),
      path.join(__dirname, 'certs', 'key.pem')
    ];
    
    const sslExists = sslFiles.some(file => fs.existsSync(file));
    
    return {
      success: sslExists,
      details: {
        sslFilesExist: sslExists,
        checkedPaths: sslFiles
      }
    };
  }

  checkLoadBalancer() {
    // Check for load balancer configuration
    const lbFiles = [
      path.join(__dirname, 'nginx.conf'),
      path.join(__dirname, 'docker-compose.yml'),
      path.join(__dirname, 'kubernetes.yaml')
    ];
    
    const lbExists = lbFiles.some(file => fs.existsSync(file));
    
    return {
      success: lbExists,
      details: {
        loadBalancerConfigExists: lbExists,
        checkedPaths: lbFiles
      }
    };
  }

  // ==================== SECURITY CHECKS ====================

  checkSecurity() {
    console.log('🔒 Checking Security Requirements...\n');

    const checks = [
      {
        name: 'Authentication Middleware',
        check: () => this.checkAuthenticationMiddleware(),
        critical: true
      },
      {
        name: 'Input Validation',
        check: () => this.checkInputValidation(),
        critical: true
      },
      {
        name: 'Rate Limiting',
        check: () => this.checkRateLimiting(),
        critical: true
      },
      {
        name: 'CORS Configuration',
        check: () => this.checkCORSConfiguration(),
        critical: true
      },
      {
        name: 'Security Headers',
        check: () => this.checkSecurityHeaders(),
        critical: false
      },
      {
        name: 'Password Hashing',
        check: () => this.checkPasswordHashing(),
        critical: true
      }
    ];

    this.runChecks('security', checks);
  }

  checkAuthenticationMiddleware() {
    const authFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'auth.js'),
      path.join(__dirname, 'shared-backend', 'middleware', 'authentication.js')
    ];
    
    const authExists = authFiles.some(file => fs.existsSync(file));
    
    if (authExists) {
      const authFile = authFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(authFile, 'utf8');
      const hasJWT = content.includes('jwt') || content.includes('JWT');
      const hasTokenValidation = content.includes('verify') || content.includes('validate');
      
      return {
        success: authExists && hasJWT && hasTokenValidation,
        details: {
          authFileExists: authExists,
          hasJWT: hasJWT,
          hasTokenValidation: hasTokenValidation
        }
      };
    }
    
    return { success: false, details: { authFileExists: false } };
  }

  checkInputValidation() {
    const validationFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'validation.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'validation.js')
    ];
    
    const validationExists = validationFiles.some(file => fs.existsSync(file));
    
    if (validationExists) {
      const validationFile = validationFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(validationFile, 'utf8');
      const hasSanitization = content.includes('sanitize') || content.includes('escape');
      const hasValidation = content.includes('validate') || content.includes('schema');
      
      return {
        success: validationExists && hasSanitization && hasValidation,
        details: {
          validationFileExists: validationExists,
          hasSanitization: hasSanitization,
          hasValidation: hasValidation
        }
      };
    }
    
    return { success: false, details: { validationFileExists: false } };
  }

  checkRateLimiting() {
    const rateLimitFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'rateLimit.js'),
      path.join(__dirname, 'shared-backend', 'middleware', 'smartRateLimit.js')
    ];
    
    const rateLimitExists = rateLimitFiles.some(file => fs.existsSync(file));
    
    if (rateLimitExists) {
      const rateLimitFile = rateLimitFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(rateLimitFile, 'utf8');
      const hasRateLimit = content.includes('rate') || content.includes('limit');
      const hasWindow = content.includes('window') || content.includes('time');
      
      return {
        success: rateLimitExists && hasRateLimit && hasWindow,
        details: {
          rateLimitFileExists: rateLimitExists,
          hasRateLimit: hasRateLimit,
          hasWindow: hasWindow
        }
      };
    }
    
    return { success: false, details: { rateLimitFileExists: false } };
  }

  checkCORSConfiguration() {
    const serverFile = path.join(__dirname, 'shared-backend', 'server.js');
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      const hasCORS = content.includes('cors') || content.includes('CORS');
      const hasOrigin = content.includes('origin') || content.includes('Origin');
      
      return {
        success: hasCORS && hasOrigin,
        details: {
          hasCORS: hasCORS,
          hasOrigin: hasOrigin
        }
      };
    }
    
    return { success: false, details: { serverFileExists: false } };
  }

  checkSecurityHeaders() {
    const middlewareFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'security.js'),
      path.join(__dirname, 'shared-backend', 'middleware', 'helmet.js')
    ];
    
    const securityExists = middlewareFiles.some(file => fs.existsSync(file));
    
    if (securityExists) {
      const securityFile = middlewareFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(securityFile, 'utf8');
      const hasHelmet = content.includes('helmet') || content.includes('Helmet');
      const hasHeaders = content.includes('header') || content.includes('Header');
      
      return {
        success: securityExists && hasHelmet && hasHeaders,
        details: {
          securityFileExists: securityExists,
          hasHelmet: hasHelmet,
          hasHeaders: hasHeaders
        }
      };
    }
    
    return { success: false, details: { securityFileExists: false } };
  }

  checkPasswordHashing() {
    const authFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'auth.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'password.js')
    ];
    
    const authExists = authFiles.some(file => fs.existsSync(file));
    
    if (authExists) {
      const authFile = authFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(authFile, 'utf8');
      const hasBcrypt = content.includes('bcrypt') || content.includes('hash');
      const hasSalt = content.includes('salt') || content.includes('Salt');
      
      return {
        success: authExists && hasBcrypt && hasSalt,
        details: {
          authFileExists: authExists,
          hasBcrypt: hasBcrypt,
          hasSalt: hasSalt
        }
      };
    }
    
    return { success: false, details: { authFileExists: false } };
  }

  // ==================== PERFORMANCE CHECKS ====================

  checkPerformance() {
    console.log('⚡ Checking Performance Requirements...\n');

    const checks = [
      {
        name: 'Caching Implementation',
        check: () => this.checkCaching(),
        critical: false
      },
      {
        name: 'Database Indexing',
        check: () => this.checkDatabaseIndexing(),
        critical: true
      },
      {
        name: 'Memory Management',
        check: () => this.checkMemoryManagement(),
        critical: true
      },
      {
        name: 'Response Time Optimization',
        check: () => this.checkResponseTimeOptimization(),
        critical: false
      },
      {
        name: 'Connection Pooling',
        check: () => this.checkConnectionPooling(),
        critical: true
      }
    ];

    this.runChecks('performance', checks);
  }

  checkCaching() {
    const cacheFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'cache.js'),
      path.join(__dirname, 'shared-backend', 'services', 'cache.js')
    ];
    
    const cacheExists = cacheFiles.some(file => fs.existsSync(file));
    
    if (cacheExists) {
      const cacheFile = cacheFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(cacheFile, 'utf8');
      const hasRedis = content.includes('redis') || content.includes('Redis');
      const hasMemoryCache = content.includes('memory') || content.includes('Memory');
      
      return {
        success: cacheExists && (hasRedis || hasMemoryCache),
        details: {
          cacheFileExists: cacheExists,
          hasRedis: hasRedis,
          hasMemoryCache: hasMemoryCache
        }
      };
    }
    
    return { success: false, details: { cacheFileExists: false } };
  }

  checkDatabaseIndexing() {
    const dbFiles = [
      path.join(__dirname, 'shared-backend', 'config', 'database.js'),
      path.join(__dirname, 'shared-backend', 'models', 'index.js')
    ];
    
    const dbExists = dbFiles.some(file => fs.existsSync(file));
    
    if (dbExists) {
      const dbFile = dbFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(dbFile, 'utf8');
      const hasIndexes = content.includes('index') || content.includes('Index');
      const hasCreateIndex = content.includes('createIndex') || content.includes('ensureIndex');
      
      return {
        success: dbExists && hasIndexes && hasCreateIndex,
        details: {
          dbFileExists: dbExists,
          hasIndexes: hasIndexes,
          hasCreateIndex: hasCreateIndex
        }
      };
    }
    
    return { success: false, details: { dbFileExists: false } };
  }

  checkMemoryManagement() {
    const performanceFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'performance-optimizer.js'),
      path.join(__dirname, 'shared-backend', 'services', 'memory.js')
    ];
    
    const performanceExists = performanceFiles.some(file => fs.existsSync(file));
    
    if (performanceExists) {
      const performanceFile = performanceFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(performanceFile, 'utf8');
      const hasMemoryMonitoring = content.includes('memory') || content.includes('Memory');
      const hasGarbageCollection = content.includes('gc') || content.includes('garbage');
      
      return {
        success: performanceExists && hasMemoryMonitoring && hasGarbageCollection,
        details: {
          performanceFileExists: performanceExists,
          hasMemoryMonitoring: hasMemoryMonitoring,
          hasGarbageCollection: hasGarbageCollection
        }
      };
    }
    
    return { success: false, details: { performanceFileExists: false } };
  }

  checkResponseTimeOptimization() {
    const optimizationFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'performance-optimizer.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'optimization.js')
    ];
    
    const optimizationExists = optimizationFiles.some(file => fs.existsSync(file));
    
    if (optimizationExists) {
      const optimizationFile = optimizationFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(optimizationFile, 'utf8');
      const hasResponseTime = content.includes('responseTime') || content.includes('response');
      const hasOptimization = content.includes('optimize') || content.includes('Optimize');
      
      return {
        success: optimizationExists && hasResponseTime && hasOptimization,
        details: {
          optimizationFileExists: optimizationExists,
          hasResponseTime: hasResponseTime,
          hasOptimization: hasOptimization
        }
      };
    }
    
    return { success: false, details: { optimizationFileExists: false } };
  }

  checkConnectionPooling() {
    const dbConfigFile = path.join(__dirname, 'shared-backend', 'config', 'database.js');
    if (fs.existsSync(dbConfigFile)) {
      const content = fs.readFileSync(dbConfigFile, 'utf8');
      const hasPooling = content.includes('pool') || content.includes('Pool');
      const hasMaxConnections = content.includes('max') || content.includes('Max');
      
      return {
        success: hasPooling && hasMaxConnections,
        details: {
          hasPooling: hasPooling,
          hasMaxConnections: hasMaxConnections
        }
      };
    }
    
    return { success: false, details: { dbConfigFileExists: false } };
  }

  // ==================== MONITORING CHECKS ====================

  checkMonitoring() {
    console.log('📊 Checking Monitoring Requirements...\n');

    const checks = [
      {
        name: 'Health Check Endpoints',
        check: () => this.checkHealthEndpoints(),
        critical: true
      },
      {
        name: 'Logging Configuration',
        check: () => this.checkLoggingConfiguration(),
        critical: true
      },
      {
        name: 'Error Tracking',
        check: () => this.checkErrorTracking(),
        critical: true
      },
      {
        name: 'Performance Monitoring',
        check: () => this.checkPerformanceMonitoring(),
        critical: false
      },
      {
        name: 'Alerting System',
        check: () => this.checkAlertingSystem(),
        critical: false
      }
    ];

    this.runChecks('monitoring', checks);
  }

  checkHealthEndpoints() {
    const serverFile = path.join(__dirname, 'shared-backend', 'server.js');
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      const hasHealthEndpoint = content.includes('/health') || content.includes('health');
      const hasPingEndpoint = content.includes('/ping') || content.includes('ping');
      
      return {
        success: hasHealthEndpoint && hasPingEndpoint,
        details: {
          hasHealthEndpoint: hasHealthEndpoint,
          hasPingEndpoint: hasPingEndpoint
        }
      };
    }
    
    return { success: false, details: { serverFileExists: false } };
  }

  checkLoggingConfiguration() {
    const loggingFiles = [
      path.join(__dirname, 'shared-backend', 'config', 'logger.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'logger.js')
    ];
    
    const loggingExists = loggingFiles.some(file => fs.existsSync(file));
    
    if (loggingExists) {
      const loggingFile = loggingFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(loggingFile, 'utf8');
      const hasWinston = content.includes('winston') || content.includes('Winston');
      const hasLogLevels = content.includes('level') || content.includes('Level');
      
      return {
        success: loggingExists && hasWinston && hasLogLevels,
        details: {
          loggingFileExists: loggingExists,
          hasWinston: hasWinston,
          hasLogLevels: hasLogLevels
        }
      };
    }
    
    return { success: false, details: { loggingFileExists: false } };
  }

  checkErrorTracking() {
    const errorFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'errorHandler.js'),
      path.join(__dirname, 'shared-backend', 'routes', 'errors.js')
    ];
    
    const errorExists = errorFiles.some(file => fs.existsSync(file));
    
    if (errorExists) {
      const errorFile = errorFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(errorFile, 'utf8');
      const hasErrorHandling = content.includes('error') || content.includes('Error');
      const hasStackTrace = content.includes('stack') || content.includes('Stack');
      
      return {
        success: errorExists && hasErrorHandling && hasStackTrace,
        details: {
          errorFileExists: errorExists,
          hasErrorHandling: hasErrorHandling,
          hasStackTrace: hasStackTrace
        }
      };
    }
    
    return { success: false, details: { errorFileExists: false } };
  }

  checkPerformanceMonitoring() {
    const performanceFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'performance-optimizer.js'),
      path.join(__dirname, 'shared-backend', 'routes', 'performance.js')
    ];
    
    const performanceExists = performanceFiles.some(file => fs.existsSync(file));
    
    if (performanceExists) {
      const performanceFile = performanceFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(performanceFile, 'utf8');
      const hasMetrics = content.includes('metrics') || content.includes('Metrics');
      const hasMonitoring = content.includes('monitor') || content.includes('Monitor');
      
      return {
        success: performanceExists && hasMetrics && hasMonitoring,
        details: {
          performanceFileExists: performanceExists,
          hasMetrics: hasMetrics,
          hasMonitoring: hasMonitoring
        }
      };
    }
    
    return { success: false, details: { performanceFileExists: false } };
  }

  checkAlertingSystem() {
    const alertFiles = [
      path.join(__dirname, 'shared-backend', 'services', 'alerts.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'notifications.js')
    ];
    
    const alertExists = alertFiles.some(file => fs.existsSync(file));
    
    if (alertExists) {
      const alertFile = alertFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(alertFile, 'utf8');
      const hasEmail = content.includes('email') || content.includes('Email');
      const hasSlack = content.includes('slack') || content.includes('Slack');
      
      return {
        success: alertExists && (hasEmail || hasSlack),
        details: {
          alertFileExists: alertExists,
          hasEmail: hasEmail,
          hasSlack: hasSlack
        }
      };
    }
    
    return { success: false, details: { alertFileExists: false } };
  }

  // ==================== DATA CHECKS ====================

  checkData() {
    console.log('🗄️ Checking Data Requirements...\n');

    const checks = [
      {
        name: 'Database Backup Strategy',
        check: () => this.checkDatabaseBackup(),
        critical: true
      },
      {
        name: 'Data Migration Scripts',
        check: () => this.checkDataMigration(),
        critical: false
      },
      {
        name: 'Data Validation',
        check: () => this.checkDataValidation(),
        critical: true
      },
      {
        name: 'Data Encryption',
        check: () => this.checkDataEncryption(),
        critical: true
      }
    ];

    this.runChecks('data', checks);
  }

  checkDatabaseBackup() {
    const backupFiles = [
      path.join(__dirname, 'scripts', 'backup.js'),
      path.join(__dirname, 'shared-backend', 'scripts', 'backup.js'),
      path.join(__dirname, 'backup', 'backup.sh')
    ];
    
    const backupExists = backupFiles.some(file => fs.existsSync(file));
    
    return {
      success: backupExists,
      details: {
        backupFileExists: backupExists,
        checkedPaths: backupFiles
      }
    };
  }

  checkDataMigration() {
    const migrationFiles = [
      path.join(__dirname, 'migrations'),
      path.join(__dirname, 'shared-backend', 'migrations'),
      path.join(__dirname, 'scripts', 'migrate.js')
    ];
    
    const migrationExists = migrationFiles.some(file => fs.existsSync(file));
    
    return {
      success: migrationExists,
      details: {
        migrationFileExists: migrationExists,
        checkedPaths: migrationFiles
      }
    };
  }

  checkDataValidation() {
    const validationFiles = [
      path.join(__dirname, 'shared-backend', 'middleware', 'validation.js'),
      path.join(__dirname, 'shared-backend', 'utils', 'validation.js')
    ];
    
    const validationExists = validationFiles.some(file => fs.existsSync(file));
    
    if (validationExists) {
      const validationFile = validationFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(validationFile, 'utf8');
      const hasSchema = content.includes('schema') || content.includes('Schema');
      const hasValidation = content.includes('validate') || content.includes('Validate');
      
      return {
        success: validationExists && hasSchema && hasValidation,
        details: {
          validationFileExists: validationExists,
          hasSchema: hasSchema,
          hasValidation: hasValidation
        }
      };
    }
    
    return { success: false, details: { validationFileExists: false } };
  }

  checkDataEncryption() {
    const encryptionFiles = [
      path.join(__dirname, 'shared-backend', 'utils', 'encryption.js'),
      path.join(__dirname, 'shared-backend', 'middleware', 'encryption.js')
    ];
    
    const encryptionExists = encryptionFiles.some(file => fs.existsSync(file));
    
    if (encryptionExists) {
      const encryptionFile = encryptionFiles.find(file => fs.existsSync(file));
      const content = fs.readFileSync(encryptionFile, 'utf8');
      const hasCrypto = content.includes('crypto') || content.includes('Crypto');
      const hasEncrypt = content.includes('encrypt') || content.includes('Encrypt');
      
      return {
        success: encryptionExists && hasCrypto && hasEncrypt,
        details: {
          encryptionFileExists: encryptionExists,
          hasCrypto: hasCrypto,
          hasEncrypt: hasEncrypt
        }
      };
    }
    
    return { success: false, details: { encryptionFileExists: false } };
  }

  // ==================== CODE QUALITY CHECKS ====================

  checkCode() {
    console.log('📝 Checking Code Quality...\n');

    const checks = [
      {
        name: 'Code Documentation',
        check: () => this.checkCodeDocumentation(),
        critical: false
      },
      {
        name: 'Error Handling',
        check: () => this.checkErrorHandling(),
        critical: true
      },
      {
        name: 'Code Structure',
        check: () => this.checkCodeStructure(),
        critical: true
      },
      {
        name: 'Dependencies',
        check: () => this.checkDependencies(),
        critical: true
      }
    ];

    this.runChecks('code', checks);
  }

  checkCodeDocumentation() {
    const readmeFile = path.join(__dirname, 'README.md');
    const docsDir = path.join(__dirname, 'docs');
    
    const readmeExists = fs.existsSync(readmeFile);
    const docsExists = fs.existsSync(docsDir);
    
    return {
      success: readmeExists && docsExists,
      details: {
        readmeExists: readmeExists,
        docsExists: docsExists
      }
    };
  }

  checkErrorHandling() {
    const serverFile = path.join(__dirname, 'shared-backend', 'server.js');
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      const hasTryCatch = content.includes('try') && content.includes('catch');
      const hasErrorHandler = content.includes('error') && content.includes('handler');
      
      return {
        success: hasTryCatch && hasErrorHandler,
        details: {
          hasTryCatch: hasTryCatch,
          hasErrorHandler: hasErrorHandler
        }
      };
    }
    
    return { success: false, details: { serverFileExists: false } };
  }

  checkCodeStructure() {
    const requiredDirs = [
      'shared-backend',
      'shared-backend/routes',
      'shared-backend/middleware',
      'shared-backend/config',
      'shared-backend/services'
    ];
    
    const existingDirs = requiredDirs.filter(dir => fs.existsSync(path.join(__dirname, dir)));
    
    return {
      success: existingDirs.length >= requiredDirs.length * 0.8,
      details: {
        requiredDirs: requiredDirs.length,
        existingDirs: existingDirs.length,
        missingDirs: requiredDirs.filter(dir => !fs.existsSync(path.join(__dirname, dir)))
      }
    };
  }

  checkDependencies() {
    const packageFile = path.join(__dirname, 'shared-backend', 'package.json');
    if (fs.existsSync(packageFile)) {
      const content = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      const hasDependencies = content.dependencies && Object.keys(content.dependencies).length > 0;
      const hasDevDependencies = content.devDependencies && Object.keys(content.devDependencies).length > 0;
      
      return {
        success: hasDependencies && hasDevDependencies,
        details: {
          hasDependencies: hasDependencies,
          hasDevDependencies: hasDevDependencies,
          dependencyCount: hasDependencies ? Object.keys(content.dependencies).length : 0
        }
      };
    }
    
    return { success: false, details: { packageFileExists: false } };
  }

  // ==================== TESTING CHECKS ====================

  checkTesting() {
    console.log('🧪 Checking Testing Requirements...\n');

    const checks = [
      {
        name: 'Unit Tests',
        check: () => this.checkUnitTests(),
        critical: true
      },
      {
        name: 'Integration Tests',
        check: () => this.checkIntegrationTests(),
        critical: true
      },
      {
        name: 'Test Coverage',
        check: () => this.checkTestCoverage(),
        critical: false
      },
      {
        name: 'Test Configuration',
        check: () => this.checkTestConfiguration(),
        critical: true
      }
    ];

    this.runChecks('testing', checks);
  }

  checkUnitTests() {
    const testDirs = [
      path.join(__dirname, 'tests'),
      path.join(__dirname, 'shared-backend', 'tests'),
      path.join(__dirname, '__tests__')
    ];
    
    const testExists = testDirs.some(dir => fs.existsSync(dir));
    
    if (testExists) {
      const testDir = testDirs.find(dir => fs.existsSync(dir));
      const files = fs.readdirSync(testDir);
      const testFiles = files.filter(file => file.includes('.test.') || file.includes('.spec.'));
      
      return {
        success: testExists && testFiles.length > 0,
        details: {
          testDirExists: testExists,
          testFileCount: testFiles.length,
          testFiles: testFiles
        }
      };
    }
    
    return { success: false, details: { testDirExists: false } };
  }

  checkIntegrationTests() {
    const integrationTestFiles = [
      path.join(__dirname, 'tests', 'integration'),
      path.join(__dirname, 'shared-backend', 'tests', 'integration'),
      path.join(__dirname, 'integration-tests')
    ];
    
    const integrationExists = integrationTestFiles.some(dir => fs.existsSync(dir));
    
    return {
      success: integrationExists,
      details: {
        integrationTestExists: integrationExists,
        checkedPaths: integrationTestFiles
      }
    };
  }

  checkTestCoverage() {
    const coverageFiles = [
      path.join(__dirname, 'coverage'),
      path.join(__dirname, 'shared-backend', 'coverage'),
      path.join(__dirname, '.nyc_output')
    ];
    
    const coverageExists = coverageFiles.some(dir => fs.existsSync(dir));
    
    return {
      success: coverageExists,
      details: {
        coverageExists: coverageExists,
        checkedPaths: coverageFiles
      }
    };
  }

  checkTestConfiguration() {
    const testConfigFiles = [
      path.join(__dirname, 'jest.config.js'),
      path.join(__dirname, 'shared-backend', 'jest.config.js'),
      path.join(__dirname, '.mocharc.js')
    ];
    
    const testConfigExists = testConfigFiles.some(file => fs.existsSync(file));
    
    return {
      success: testConfigExists,
      details: {
        testConfigExists: testConfigExists,
        checkedPaths: testConfigFiles
      }
    };
  }

  // ==================== UTILITY METHODS ====================

  runChecks(category, checks) {
    this.checklist[category] = [];
    
    checks.forEach(check => {
      try {
        const result = check.check();
        const checkResult = {
          name: check.name,
          critical: check.critical,
          success: result.success,
          details: result.details
        };
        
        this.checklist[category].push(checkResult);
        this.results.total++;
        
        if (result.success) {
          this.results.passed++;
          console.log(`✅ ${check.name}`);
        } else if (check.critical) {
          this.results.failed++;
          console.log(`❌ ${check.name} (CRITICAL)`);
        } else {
          this.results.warnings++;
          console.log(`⚠️ ${check.name} (WARNING)`);
        }
      } catch (error) {
        this.checklist[category].push({
          name: check.name,
          critical: check.critical,
          success: false,
          error: error.message
        });
        
        this.results.total++;
        if (check.critical) {
          this.results.failed++;
          console.log(`❌ ${check.name} (CRITICAL) - ERROR: ${error.message}`);
        } else {
          this.results.warnings++;
          console.log(`⚠️ ${check.name} (WARNING) - ERROR: ${error.message}`);
        }
      }
    });
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%',
        deploymentReady: this.results.failed === 0,
        timestamp: new Date().toISOString()
      },
      checklist: this.checklist,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for critical failures
    Object.keys(this.checklist).forEach(category => {
      this.checklist[category].forEach(check => {
        if (!check.success && check.critical) {
          recommendations.push(`CRITICAL: Fix ${check.name} in ${category} category`);
        } else if (!check.success && !check.critical) {
          recommendations.push(`WARNING: Consider fixing ${check.name} in ${category} category`);
        }
      });
    });
    
    // Add general recommendations
    if (this.results.failed > 0) {
      recommendations.push('Do not deploy until all critical issues are resolved');
    }
    
    if (this.results.warnings > 5) {
      recommendations.push('Consider addressing warnings before deployment');
    }
    
    if (this.results.passed / this.results.total < 0.8) {
      recommendations.push('Overall readiness is below 80% - review all categories');
    }
    
    return recommendations;
  }

  // ==================== MAIN EXECUTION ====================

  async runChecklist() {
    console.log('🚀 Starting Deployment Readiness Checklist...\n');
    console.log('=' * 60);

    try {
      // Run all checks
      this.checkInfrastructure();
      this.checkSecurity();
      this.checkPerformance();
      this.checkMonitoring();
      this.checkData();
      this.checkCode();
      this.checkTesting();

      // Generate report
      const report = this.generateReport();

      console.log('\n' + '=' * 60);
      console.log('📊 DEPLOYMENT READINESS REPORT');
      console.log('=' * 60);
      console.log(`Total Checks: ${report.summary.total}`);
      console.log(`Passed: ${report.summary.passed}`);
      console.log(`Failed: ${report.summary.failed}`);
      console.log(`Warnings: ${report.summary.warnings}`);
      console.log(`Success Rate: ${report.summary.successRate}`);
      console.log(`Deployment Ready: ${report.summary.deploymentReady ? '✅ YES' : '❌ NO'}`);

      if (report.recommendations.length > 0) {
        console.log('\n📋 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }

      // Save detailed report
      const reportPath = `deployment-readiness-report-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);

      return report;

    } catch (error) {
      console.error('❌ Checklist execution failed:', error);
      throw error;
    }
  }
}

// ==================== EXECUTION ====================

async function main() {
  const checklist = new DeploymentReadinessChecklist();
  
  try {
    const report = await checklist.runChecklist();
    
    // Exit with appropriate code
    process.exit(report.summary.deploymentReady ? 0 : 1);
  } catch (error) {
    console.error('❌ Checklist execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DeploymentReadinessChecklist;
