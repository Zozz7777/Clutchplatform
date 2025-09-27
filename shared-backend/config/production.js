/**
 * Production Environment Configuration
 * Optimized settings for production deployment
 */

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: true,
    compression: true,
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },

  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        retryWrites: true,
        retryReads: true,
        compressors: ['zlib'],
        zlibCompressionLevel: 6
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      options: {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
        connectTimeout: 10000,
        commandTimeout: 5000
      }
    }
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
      refreshExpiresIn: '7d',
      algorithm: 'HS256'
    },
    bcrypt: {
      saltRounds: 12
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-token', 'X-API-Version', 'X-Correlation-ID']
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestamp: true,
    colorize: false,
    file: {
      enabled: true,
      filename: 'logs/production.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      datePattern: 'YYYY-MM-DD'
    },
    console: {
      enabled: process.env.NODE_ENV !== 'production'
    }
  },

  // Performance Configuration
  performance: {
    compression: {
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return true;
      }
    },
    cache: {
      ttl: 3600, // 1 hour
      max: 1000,
      checkperiod: 600 // 10 minutes
    },
    pagination: {
      defaultLimit: 20,
      maxLimit: 100
    }
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retries: 3
    },
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
      retention: 24 * 60 * 60 * 1000 // 24 hours
    },
    alerts: {
      enabled: true,
      thresholds: {
        memory: 0.9, // 90%
        cpu: 0.8, // 80%
        responseTime: 5000, // 5 seconds
        errorRate: 0.05 // 5%
      }
    }
  },

  // Feature Flags
  features: {
    realTimeUpdates: true,
    pushNotifications: true,
    analytics: true,
    reporting: true,
    auditLogging: true,
    rateLimiting: true,
    compression: true,
    caching: true,
    monitoring: true
  },

  // External Services
  external: {
    email: {
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER || 'local',
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET
      }
    }
  },

  // Environment Variables Validation
  validate: () => {
    const required = [
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
  }
};
