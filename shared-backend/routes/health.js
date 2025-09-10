const express = require('express');
const router = express.Router();

// Import database utilities with error handling
let getCollection, connectDB;
try {
  const dbUtils = require('../config/database');
  getCollection = dbUtils.getCollection;
  connectDB = dbUtils.connectDB;
} catch (error) {
  console.error('❌ Error importing database utilities:', error.message);
  // Provide fallback functions
  getCollection = async () => { throw new Error('Database not available'); };
  connectDB = async () => { throw new Error('Database not available'); };
}

// Lightweight ping endpoint for keep-alive service
router.get('/ping', (req, res) => {
    try {
        console.log('🏥 Health route ping endpoint called');
        res.status(200).json({
            success: true,
            data: {
                status: 'pong',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        console.error('🏥 Health route ping error:', error);
        res.status(200).json({
            success: true,
            data: {
                status: 'pong',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }
        });
    }
});

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.API_VERSION || 'v1'
        };

        res.json({
            success: true,
            data: healthStatus
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            error: 'HEALTH_CHECK_FAILED',
            message: 'Health check failed'
        });
    }
});

// Database health check
router.get('/database', async (req, res) => {
    try {
        const collection = await getCollection('users');
        await collection.findOne({});
        
        const payload = {
            success: true,
            data: {
                status: 'connected',
                timestamp: new Date().toISOString()
            }
        };
        return res.json(payload);
    } catch (error) {
        console.error('Database health check error:', error);
        res.status(500).json({
            success: false,
            error: 'DATABASE_HEALTH_CHECK_FAILED',
            message: 'Database connection failed'
        });
    }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
    try {
        const checks = {
            database: false,
            redis: false,
            memory: false,
            disk: false
        };

        // Database check
        try {
            const collection = await getCollection('users');
            await collection.findOne({});
            checks.database = true;
        } catch (error) {
            console.error('Database check failed:', error);
        }

        // Memory check
        const memUsage = process.memoryUsage();
        checks.memory = memUsage.heapUsed < 500 * 1024 * 1024; // Less than 500MB

        // Disk check (simplified)
        checks.disk = true; // Assume disk is available

        const allHealthy = Object.values(checks).every(check => check);

        const response = {
            success: allHealthy,
            data: {
                status: allHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                checks
            }
        };
        if (process.env.NODE_ENV === 'production') {
            response.data.checks = Object.entries(checks).map(([name, ok]) => ({ name, status: ok ? 'healthy' : 'unhealthy' }));
        }
        res.json(response);
    } catch (error) {
        console.error('Detailed health check error:', error);
        res.status(500).json({
            success: false,
            error: 'DETAILED_HEALTH_CHECK_FAILED',
            message: 'Detailed health check failed'
        });
    }
});

// Email status check endpoint
router.get('/email-status', (req, res) => {
    try {
        const emailConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            user: process.env.EMAIL_USER || 'YourClutchauto@gmail.com',
            from: process.env.EMAIL_FROM || 'YourClutchauto@gmail.com',
            fromName: process.env.EMAIL_FROM_NAME || 'Clutch Automotive Services',
            configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        };

        res.json({
            success: true,
            data: {
                status: emailConfig.configured ? 'configured' : 'not_configured',
                timestamp: new Date().toISOString(),
                configuration: emailConfig
            }
        });
    } catch (error) {
        console.error('Email status check error:', error);
        res.status(500).json({
            success: false,
            error: 'EMAIL_STATUS_CHECK_ERROR',
            message: 'Email status check failed'
        });
    }
});

// Firebase status check endpoint
router.get('/firebase-status', async (req, res) => {
    try {
        const { getFirestore } = require('../config/firebase-admin');
        const firestore = getFirestore();
        
        if (!firestore) {
            return res.json({
                success: false,
                data: {
                    status: 'not_configured',
                    timestamp: new Date().toISOString(),
                    message: 'Firebase not initialized'
                }
            });
        }
        // Avoid write operations during health checks; report generic healthy if initialized
        const payload = {
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString()
            }
        };
        return res.json(payload);
    } catch (error) {
        console.error('Firebase status check error:', error);
        res.status(500).json({
            success: false,
            error: 'FIREBASE_STATUS_CHECK_ERROR',
            message: 'Firebase status check failed'
        });
    }
});

// Email test endpoint
router.post('/test-email', async (req, res) => {
    try {
        const { to, subject = 'Clutch Email Service Test', message = 'This is a test email from Clutch Platform' } = req.body;
        
        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EMAIL',
                message: 'Recipient email address is required'
            });
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
                    <h1>Clutch Email Service Test</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello!</h2>
                    <p>This is a test email to verify that the Clutch Platform email service is working correctly.</p>
                    <p><strong>Message:</strong> ${message}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <hr>
                    <p>If you received this email, the email service is configured and working properly!</p>
                    <p>Best regards,<br>The Clutch Team</p>
                </div>
            </div>
        `;

        // Import email service dynamically to avoid circular dependencies
        const { sendEmail } = require('../services/emailService');
        const result = await sendEmail(to, subject, htmlContent, message);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Test email sent successfully',
                data: {
                    to,
                    subject,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'EMAIL_SEND_FAILED',
                message: 'Failed to send test email',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Email test error:', error);
        res.status(500).json({
            success: false,
            error: 'EMAIL_TEST_ERROR',
            message: 'Email test failed',
            details: error.message
        });
    }
});

module.exports = router;
