/**
 * Production-Safe AI Agent Wrapper
 * Ensures all AI operations are safe for production deployment
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ProductionSafeAI {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/production-safe-ai.log' }),
        new winston.transports.Console()
      ]
    });

    this.safetyConfig = {
      // Maximum number of AI operations per hour
      maxOperationsPerHour: 50,
      // Maximum file size for code analysis (1MB)
      maxFileSize: 1024 * 1024,
      // Allowed file extensions for modification
      allowedFileExtensions: ['.js', '.json', '.md', '.txt'],
      // Forbidden operations
      forbiddenOperations: [
        'delete',
        'rm',
        'drop',
        'truncate',
        'kill',
        'shutdown',
        'restart'
      ],
      // Safe directories for file operations
      safeDirectories: [
        'logs/',
        'temp/',
        'backups/',
        'ai-fixes/'
      ]
    };

    this.operationHistory = [];
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
      threshold: 10, // Increased threshold
      timeout: 600000 // 10 minutes
    };
  }

  /**
   * Validate AI operation before execution
   */
  async validateOperation(operation) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailure;
      if (timeSinceLastFailure < this.circuitBreaker.timeout) {
        validation.isValid = false;
        validation.errors.push('Circuit breaker is open - too many recent failures');
        return validation;
      } else {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
      }
    }

    // Check operation rate limiting
    const recentOperations = this.operationHistory.filter(
      op => Date.now() - op.timestamp < 3600000 // Last hour
    );
    if (recentOperations.length >= this.safetyConfig.maxOperationsPerHour) {
      validation.isValid = false;
      validation.errors.push('Rate limit exceeded - too many operations in the last hour');
      return validation;
    }

    // Check for forbidden operations
    const operationText = JSON.stringify(operation).toLowerCase();
    for (const forbidden of this.safetyConfig.forbiddenOperations) {
      if (operationText.includes(forbidden)) {
        validation.isValid = false;
        validation.errors.push(`Forbidden operation detected: ${forbidden}`);
      }
    }

    // Validate file operations
    if (operation.type === 'file_operation') {
      const fileValidation = await this.validateFileOperation(operation);
      if (!fileValidation.isValid) {
        validation.isValid = false;
        validation.errors.push(...fileValidation.errors);
      }
      validation.warnings.push(...fileValidation.warnings);
    }

    // Validate code changes
    if (operation.type === 'code_change') {
      const codeValidation = await this.validateCodeChange(operation);
      if (!codeValidation.isValid) {
        validation.isValid = false;
        validation.errors.push(...codeValidation.errors);
      }
      validation.warnings.push(...codeValidation.warnings);
    }

    return validation;
  }

  /**
   * Validate file operation safety
   */
  async validateFileOperation(operation) {
    const validation = { isValid: true, errors: [], warnings: [] };

    if (!operation.filePath) {
      validation.isValid = false;
      validation.errors.push('File path is required for file operations');
      return validation;
    }

    // Check file extension
    const ext = path.extname(operation.filePath);
    if (!this.safetyConfig.allowedFileExtensions.includes(ext)) {
      validation.isValid = false;
      validation.errors.push(`File extension ${ext} is not allowed`);
    }

    // Check if file is in safe directory
    const isInSafeDirectory = this.safetyConfig.safeDirectories.some(dir => 
      operation.filePath.startsWith(dir)
    );
    if (!isInSafeDirectory && operation.action !== 'read') {
      validation.isValid = false;
      validation.errors.push(`File operation outside safe directories: ${operation.filePath}`);
    }

    // Check file size
    try {
      const stats = await fs.stat(operation.filePath);
      if (stats.size > this.safetyConfig.maxFileSize) {
        validation.isValid = false;
        validation.errors.push(`File too large: ${stats.size} bytes`);
      }
    } catch (error) {
      // File doesn't exist, which is okay for create operations
      if (operation.action !== 'create') {
        validation.warnings.push(`File does not exist: ${operation.filePath}`);
      }
    }

    return validation;
  }

  /**
   * Validate code change safety
   */
  async validateCodeChange(operation) {
    const validation = { isValid: true, errors: [], warnings: [] };

    if (!operation.code) {
      validation.isValid = false;
      validation.errors.push('Code content is required');
      return validation;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /process\.exit/gi,
      /require\s*\(\s*['"]child_process['"]/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*['"]/gi,
      /setInterval\s*\(\s*['"]/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(operation.code)) {
        validation.isValid = false;
        validation.errors.push(`Dangerous code pattern detected: ${pattern.source}`);
      }
    }

    // Check for proper error handling
    if (!operation.code.includes('try') && !operation.code.includes('catch')) {
      validation.warnings.push('Code lacks proper error handling');
    }

    // Check for logging
    if (!operation.code.includes('logger') && !operation.code.includes('console.log')) {
      validation.warnings.push('Code lacks proper logging');
    }

    return validation;
  }

  /**
   * Execute operation with safety checks
   */
  async executeOperation(operation) {
    const startTime = Date.now();
    
    try {
      // Validate operation
      const validation = await this.validateOperation(operation);
      if (!validation.isValid) {
        throw new Error(`Operation validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings
      if (validation.warnings.length > 0) {
        this.logger.warn('Operation warnings:', validation.warnings);
      }

      // Create backup if modifying files
      let backupPath = null;
      if (operation.type === 'file_operation' && operation.action === 'modify') {
        backupPath = await this.createBackup(operation.filePath);
      }

      // Execute operation
      const result = await this.performOperation(operation);

      // Record successful operation
      this.recordOperation(operation, true, Date.now() - startTime);
      this.circuitBreaker.failures = 0;

      return {
        success: true,
        result,
        backupPath,
        executionTime: Date.now() - startTime,
        warnings: validation.warnings
      };

    } catch (error) {
      // Record failed operation
      this.recordOperation(operation, false, Date.now() - startTime, error.message);
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailure = Date.now();

      if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
        this.circuitBreaker.isOpen = true;
        this.logger.error('Circuit breaker opened due to repeated failures');
      }

      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Perform the actual operation
   */
  async performOperation(operation) {
    switch (operation.type) {
      case 'file_operation':
        return await this.performFileOperation(operation);
      case 'code_change':
        return await this.performCodeChange(operation);
      case 'analysis':
        return await this.performAnalysis(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Perform file operation
   */
  async performFileOperation(operation) {
    const { action, filePath, content } = operation;

    switch (action) {
      case 'read':
        return await fs.readFile(filePath, 'utf8');
      case 'create':
        await fs.writeFile(filePath, content, 'utf8');
        return { message: 'File created successfully' };
      case 'modify':
        await fs.writeFile(filePath, content, 'utf8');
        return { message: 'File modified successfully' };
      case 'backup':
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
        return { backupPath };
      default:
        throw new Error(`Unknown file action: ${action}`);
    }
  }

  /**
   * Perform code change
   */
  async performCodeChange(operation) {
    // In production, we should not directly modify code files
    // Instead, we should create fix suggestions or patches
    const fixId = crypto.randomUUID();
    const fixPath = `ai-fixes/fix-${fixId}.js`;
    
    // Create fix file in safe directory
    await fs.mkdir('ai-fixes', { recursive: true });
    await fs.writeFile(fixPath, operation.code, 'utf8');
    
    return {
      fixId,
      fixPath,
      message: 'Code fix created as separate file - manual review required',
      requiresReview: true
    };
  }

  /**
   * Perform analysis
   */
  async performAnalysis(operation) {
    // Safe analysis operations
    return {
      analysis: 'Analysis completed safely',
      timestamp: new Date()
    };
  }

  /**
   * Create backup of file
   */
  async createBackup(filePath) {
    const backupPath = `backups/${path.basename(filePath)}.backup.${Date.now()}`;
    await fs.mkdir('backups', { recursive: true });
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }

  /**
   * Record operation in history
   */
  recordOperation(operation, success, executionTime, error = null) {
    const record = {
      id: crypto.randomUUID(),
      operation: operation.type,
      success,
      executionTime,
      timestamp: Date.now(),
      error
    };

    this.operationHistory.push(record);

    // Keep only last 1000 operations
    if (this.operationHistory.length > 1000) {
      this.operationHistory = this.operationHistory.slice(-1000);
    }

    this.logger.info('Operation recorded:', record);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailure = null;
    this.logger.info('🔄 Circuit breaker reset');
  }

  /**
   * Get safety statistics
   */
  getSafetyStats() {
    const recentOperations = this.operationHistory.filter(
      op => Date.now() - op.timestamp < 3600000 // Last hour
    );

    return {
      totalOperations: this.operationHistory.length,
      recentOperations: recentOperations.length,
      successRate: this.operationHistory.length > 0 
        ? (this.operationHistory.filter(op => op.success).length / this.operationHistory.length * 100).toFixed(2)
        : 0,
      circuitBreakerStatus: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED',
      failures: this.circuitBreaker.failures,
      lastFailure: this.circuitBreaker.lastFailure
    };
  }
}

module.exports = ProductionSafeAI;
