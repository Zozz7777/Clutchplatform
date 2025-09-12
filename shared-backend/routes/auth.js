const express = require('express');
const jwt = require('jsonwebtoken');
const databaseUtils = require('../utils/databaseUtils');
const router = express.Router();
const authService = require('../services/authService');
const employeeAuthService = require('../services/employeeAuthService');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { validateUserLogin } = require('../middleware/validation');
const userService = require("../services/userService");
const { getCollection } = require('../config/database');
    // Add employee caching to reduce database queries
    const employeeCache = new Map();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    const getCachedEmployee = async (email) => {
      const cached = employeeCache.get(email);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.employee;
      }
      return null;
    };
    
    const setCachedEmployee = (email, employee) => {
      employeeCache.set(email, {
        employee,
        timestamp: Date.now()
      });
    };
    
    // Clear cache periodically
    setInterval(() => {
      const now = Date.now();
      for (const [email, cached] of employeeCache.entries()) {
        if (now - cached.timestamp > CACHE_TTL) {
          employeeCache.delete(email);
        }
      }
    }, CACHE_TTL);
    
    

// ==================== EMPLOYEE AUTHENTICATION ROUTES ====================

// Test endpoint to verify auth routes are accessible
router.get('/test', (req, res) => {
    console.log('🧪 Auth test endpoint called:', { path: req.path, method: req.method });
    res.json({
        success: true,
        message: 'Auth routes are working correctly',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
});

// Employee Login
router.post('/employee-login', rateLimit.authRateLimit, validateUserLogin, async (req, res) => {
    try {
        const { email, password, deviceInfo } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_CREDENTIALS',
                message: 'Email and password are required'
            });
        }

        // Normalize email to lowercase for consistent authentication
        const normalizedEmail = email.toLowerCase().trim();

        console.log('Employee login attempt:', { email: normalizedEmail, hasPassword: !!password });

        // Find employee by email
        const employeeResult = await employeeAuthService.findEmployeeByEmail(normalizedEmail);
        if (!employeeResult.success || !employeeResult.data) {
            console.log('Employee not found:', normalizedEmail);
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        // Use the employee data from the initial search
        const employee = employeeResult.data;
        console.log('Employee found:', { 
            id: employee._id, 
            email: employee.basicInfo?.email || employee.email, 
            isActive: employee.isActive,
            role: employee.role 
        });

        // Check if employee is active
        if (!employee.isActive) {
            console.log('Employee account inactive:', employee._id);
            return res.status(401).json({
                success: false,
                error: 'ACCOUNT_INACTIVE',
                message: 'Account is inactive'
            });
        }

        // Check if account is locked (optimized - no additional DB call)
        const lockResult = await employeeAuthService.isAccountLocked(employee);
        if (lockResult.success && lockResult.isLocked) {
            return res.status(423).json({
                success: false,
                error: 'ACCOUNT_LOCKED',
                message: 'Account is locked due to multiple failed login attempts'
            });
        }

        // Verify password (optimized - no additional DB call)
        console.log('Verifying password for employee:', employee._id);
        const passwordResult = await employeeAuthService.verifyPassword(employee, password);
        if (!passwordResult.success || !passwordResult.isValid) {
            console.log('Password verification failed for employee:', employee._id);
            // Update login attempts
            await employeeAuthService.updateLoginAttempts(employee._id, true);

            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }
        console.log('Password verification successful for employee:', employee._id);

        // Reset login attempts on successful login
        await employeeAuthService.updateLoginAttempts(employee._id, false);

        // Get employee permissions
        const permissions = await employeeAuthService.getEmployeePermissions(employee._id);

        // Generate JWT token
        const tokenResult = await employeeAuthService.generateJWTToken(employee._id, permissions.data);
        if (!tokenResult.success) {
            return res.status(500).json({
                success: false,
                error: 'TOKEN_GENERATION_FAILED',
                message: 'Failed to generate authentication token'
            });
        }
        const token = tokenResult.data;

        // Generate refresh token (longer expiry)
        const refreshTokenPayload = {
            userId: employee._id,
            type: 'refresh',
            tokenType: 'refresh'
        };
        const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
            expiresIn: '7d' // 7 days
        });

        // Handle both data structures for employee information
        const employeeEmail = employee.basicInfo?.email || employee.email;
        const employeeFirstName = employee.basicInfo?.firstName || employee.firstName;
        const employeeLastName = employee.basicInfo?.lastName || employee.lastName;
        const employeeJobTitle = employee.employment?.jobTitle || employee.jobTitle;
        const employeeDepartment = employee.employment?.department;
        const employeeProfilePicture = employee.basicInfo?.profilePicture || employee.profilePicture;

        const responseData = {
            success: true,
            message: 'Employee login successful',
            data: {
                user: {
                    id: employee._id,
                    email: employeeEmail,
                    firstName: employeeFirstName,
                    lastName: employeeLastName,
                    fullName: `${employeeFirstName} ${employeeLastName}`,
                    role: employee.role,
                    jobTitle: employeeJobTitle,
                    department: employeeDepartment || null,
                    departmentName: employeeDepartment || 'General',
                    departmentCode: null,
                    profilePicture: employeeProfilePicture
                },
                token,
                refreshToken,
                permissions: permissions.data
            }
        };

        console.log('Employee login successful:', { 
            employeeId: employee._id, 
            email: employee.basicInfo?.email || employee.email,
            role: employee.role,
            hasToken: !!token,
            permissionsCount: permissions.data.length
        });

        res.json(responseData);
    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({
            success: false,
            error: 'LOGIN_FAILED',
            message: 'Login failed'
        });
    }
});

// Create Employee with Authentication
router.post('/create-employee', rateLimit.authRateLimit, async (req, res) => {
    try {
        const { email, password, firstName, lastName, jobTitle, role = 'employee' } = req.body;

        // Normalize email to lowercase for consistency
        const normalizedEmail = email.toLowerCase().trim();

        // Check if employee already exists
        const existingEmployee = await employeeAuthService.findEmployeeByEmail(normalizedEmail);
        if (existingEmployee.success && existingEmployee.data) {
            return res.status(400).json({
                success: false,
                error: 'EMPLOYEE_EXISTS',
                message: 'Employee with this email already exists'
            });
        }

        // Handle department - create if it doesn't exist
        let departmentId = null;
        if (req.body.department) {
            const Department = require('../models/Department');
            
            // Try to find existing department by name
            let department = await Department.findOne({ 
                name: { $regex: new RegExp(`^${req.body.department}$`, 'i') } 
            });
            
            if (!department) {
                // Create new department
                department = new Department({
                    name: req.body.department,
                    code: req.body.department.toUpperCase().substring(0, 3),
                    description: `${req.body.department} Department`,
                    status: 'active'
                });
                await department.save();
                console.log('Created new department:', department.name);
            }
            
            departmentId = department._id;
        }

        // Create employee with authentication
        const employeeData = {
            employeeId: `EMP${Date.now()}`,
            basicInfo: {
                firstName,
                lastName,
                email: normalizedEmail,
                phone: req.body.phone || ''
            },
            employment: {
                department: departmentId,
                position: jobTitle,
                jobTitle,
                hireDate: new Date(),
                status: 'active'
            },
            role,
            password
        };

        const result = await employeeAuthService.createEmployeeWithAuth(employeeData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: 'EMPLOYEE_CREATION_FAILED',
                message: result.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                id: result.data._id,
                email: result.data.basicInfo.email,
                firstName: result.data.basicInfo.firstName,
                lastName: result.data.basicInfo.lastName,
                jobTitle: result.data.employment.jobTitle,
                role: result.data.role,
                employeeId: result.data.employeeId,
                department: result.data.employment.department,
                password: password // Return the original password for reference
            }
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            error: 'EMPLOYEE_CREATION_FAILED',
            message: 'Failed to create employee'
        });
    }
});

// Get Current Employee
router.get('/employee-me', authenticateToken, async (req, res) => {
    try {
        // Handle both userId (from JWT) and id (from session) for backward compatibility
        const employeeId = req.user.userId || req.user.id;
        
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                error: 'USER_ID_MISSING',
                message: 'User ID not found in token'
            });
        }
        
        // Find employee by ID using native MongoDB driver
        const { getCollection } = require('../config/database');
        const { ObjectId } = require('mongodb');
        const employeesCollection = await getCollection('employees');
        const employee = await employeesCollection.findOne(
            { _id: new ObjectId(employeeId) },
            { projection: { password: 0 } }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'EMPLOYEE_NOT_FOUND',
                message: 'Employee not found'
            });
        }

        // Handle both data structures and provide fallbacks
        const employeeEmail = employee.basicInfo?.email || employee.email || 'No email';
        const employeeFirstName = employee.basicInfo?.firstName || employee.firstName || 'Unknown';
        const employeeLastName = employee.basicInfo?.lastName || employee.lastName || 'User';
        const employeeJobTitle = employee.employment?.jobTitle || employee.jobTitle || 'Employee';
        const employeeDepartment = employee.employment?.department || null;
        const employeeProfilePicture = employee.basicInfo?.profilePicture || employee.profilePicture || null;
        const employeePhone = employee.basicInfo?.phone || employee.phone || null;
        const employeeStatus = employee.employment?.status || employee.status || 'active';
        const employeeHireDate = employee.employment?.hireDate || employee.hireDate || null;

        res.json({
            success: true,
            message: 'Employee data retrieved successfully',
            data: {
                id: employee._id,
                email: employeeEmail,
                firstName: employeeFirstName,
                lastName: employeeLastName,
                fullName: `${employeeFirstName} ${employeeLastName}`,
                role: employee.role || 'employee',
                roles: employee.roles || [],
                permissions: employee.websitePermissions || employee.permissions || [],
                jobTitle: employeeJobTitle,
                department: employeeDepartment,
                profilePicture: employeeProfilePicture,
                phone: employeePhone,
                status: employeeStatus,
                hireDate: employeeHireDate,
                isActive: employee.isActive !== false // Default to true if not explicitly false
            }
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_EMPLOYEE_FAILED',
            message: 'Failed to retrieve employee data'
        });
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// User Registration
router.post('/register', rateLimit.authRateLimit, async (req, res) => {
    try {
        const { email, password, fullName, phoneNumber, userType = 'customer' } = req.body;

        // Normalize email to lowercase for consistency
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await userService.findUserByEmail(normalizedEmail);
        if (existingUser.success && existingUser.data) {
            return res.status(400).json({
                success: false,
                error: 'USER_EXISTS',
                message: 'User with this email already exists'
            });
        }

        // Create user
        const userResult = await userService.createUser({
            email: normalizedEmail,
            password,
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' '),
            phoneNumber,
            role: userType,
            isActive: true
        });

        if (!userResult.success) {
            return res.status(500).json({
                success: false,
                error: 'REGISTRATION_FAILED',
                message: userResult.error
            });
        }

        const user = userResult.data;

        // Generate JWT token
        const permissions = await authService.getUserPermissions(user._id);
        const token = authService.generateJWTToken(user._id, permissions);

        // Create session
        const session = await authService.createSession(user._id, {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            deviceType: 'unknown'
        });

        // Log audit event
        await authService.logAuditEvent(user._id, 'user_registered', 'User registration successful', {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.getFullName(),
                    userType: user.role
                },
                token,
                sessionToken: session.sessionToken,
                permissions
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'REGISTRATION_FAILED',
            message: 'Registration failed'
        });
    }
});

// User Login
router.post('/login', rateLimit.authRateLimit, validateUserLogin, async (req, res) => {
    try {
        const { email, password, deviceInfo } = req.body;

        // Normalize email to lowercase for consistent authentication
        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const userResult = await userService.findUserByEmail(normalizedEmail, { password: 1 });
        if (!userResult.success || !userResult.data) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        const user = userResult.data;

        // Check if account is locked
        const lockResult = await userService.isAccountLocked(user._id);
        if (lockResult.success && lockResult.isLocked) {
            return res.status(423).json({
                success: false,
                error: 'ACCOUNT_LOCKED',
                message: 'Account is locked'
            });
        }

        // Verify password
        const passwordResult = await userService.verifyPassword(user._id, password);
        if (!passwordResult.success || !passwordResult.isValid) {
            // Log failed login attempt
            await authService.logAuditEvent(user._id, 'login_failed', 'Invalid password', {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            // Update login attempts
            await userService.updateLoginAttempts(user._id, true);

            // Check for suspicious activity
            const suspicious = await authService.detectSuspiciousActivity(user._id, 'login_failed', {
                ipAddress: req.ip
            });

            if (suspicious.suspicious) {
                return res.status(423).json({
                    success: false,
                    error: 'ACCOUNT_LOCKED',
                    message: 'Account locked due to multiple failed login attempts'
                });
            }

            return res.status(401).json({
                success: false,
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        // Check if MFA is required
        const mfaCollection = await getCollection('mfa_setups');
        const mfaSetup = await mfaCollection.findOne({ userId: user._id, enabled: true });
        
        if (mfaSetup) {
            // Return MFA challenge
            return res.status(200).json({
                success: true,
                requiresMFA: true,
                message: 'MFA verification required',
                data: {
                    userId: user._id,
                    mfaMethod: mfaSetup.method
                }
            });
        }

        // Generate JWT token
        const permissions = await authService.getUserPermissions(user._id);
        const token = authService.generateJWTToken(user._id, permissions);

        // Create session
        const session = await authService.createSession(user._id, {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            deviceType: deviceInfo?.deviceType || 'unknown',
            fingerprint: deviceInfo?.fingerprint
        });

        // Update last login and reset login attempts
        await userService.updateLastLogin(user._id);

        // Log successful login
        await authService.logAuditEvent(user._id, 'login_success', 'User login successful', {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.getFullName(),
                    userType: user.role
                },
                token,
                sessionToken: session.sessionToken,
                permissions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'LOGIN_FAILED',
            message: 'Login failed'
        });
    }
});

// MFA Verification
router.post('/mfa/verify', rateLimit.authRateLimit, async (req, res) => {
    try {
        const { userId, code, method = 'totp' } = req.body;

        const isValid = await authService.verifyMFA(userId, code, method);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_MFA_CODE',
                message: 'Invalid MFA code'
            });
        }

        // Get user and generate token
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        const permissions = await authService.getUserPermissions(user._id);
        const token = authService.generateJWTToken(user._id, permissions);

        // Create session
        const session = await authService.createSession(user._id, {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            deviceType: 'unknown'
        });

        // Log successful MFA verification
        await authService.logAuditEvent(user._id, 'mfa_verified', 'MFA verification successful', {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            message: 'MFA verification successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.getFullName(),
                    userType: user.role
                },
                token,
                sessionToken: session.sessionToken,
                permissions
            }
        });
    } catch (error) {
        console.error('MFA verification error:', error);
        res.status(500).json({
            success: false,
            error: 'MFA_VERIFICATION_FAILED',
            message: 'MFA verification failed'
        });
    }
});

// ==================== MFA MANAGEMENT ROUTES ====================

// Setup MFA
router.post('/mfa/setup', authenticateToken, async (req, res) => {
    try {
        const { method = 'totp' } = req.body;
        const userId = req.user.userId;

        const mfaSetup = await authService.setupMFA(userId, method);

        res.json({
            success: true,
            message: 'MFA setup initiated',
            data: mfaSetup
        });
    } catch (error) {
        console.error('MFA setup error:', error);
        res.status(500).json({
            success: false,
            error: 'MFA_SETUP_FAILED',
            message: 'MFA setup failed'
        });
    }
});

// Enable MFA
router.post('/mfa/enable', authenticateToken, async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const userId = req.user.userId;

        const result = await authService.enableMFA(userId, verificationCode);

        res.json({
            success: true,
            message: 'MFA enabled successfully',
            data: result
        });
    } catch (error) {
        console.error('Enable MFA error:', error);
        res.status(500).json({
            success: false,
            error: 'MFA_ENABLE_FAILED',
            message: error.message
        });
    }
});

// Disable MFA
router.post('/mfa/disable', authenticateToken, async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const userId = req.user.userId;

        const result = await authService.disableMFA(userId, verificationCode);

        res.json({
            success: true,
            message: 'MFA disabled successfully',
            data: result
        });
    } catch (error) {
        console.error('Disable MFA error:', error);
        res.status(500).json({
            success: false,
            error: 'MFA_DISABLE_FAILED',
            message: error.message
        });
    }
});

// Get MFA backup codes
router.get('/mfa/backup-codes', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const mfaCollection = await getCollection('mfa_setups');
        const mfaSetup = await mfaCollection.findOne({ userId });

        if (!mfaSetup) {
            return res.status(404).json({
                success: false,
                error: 'MFA_NOT_SETUP',
                message: 'MFA not setup for this user'
            });
        }

        const unusedBackupCodes = mfaSetup.backupCodes
            .filter(bc => !bc.used)
            .map((bc, index) => `BACKUP-${index + 1}`);

        res.json({
            success: true,
            message: 'Backup codes retrieved',
            data: {
                unusedCount: unusedBackupCodes.length,
                backupCodes: unusedBackupCodes
            }
        });
    } catch (error) {
        console.error('Get backup codes error:', error);
        res.status(500).json({
            success: false,
            error: 'BACKUP_CODES_FAILED',
            message: 'Failed to retrieve backup codes'
        });
    }
});

// ==================== SESSION MANAGEMENT ROUTES ====================

// Get active sessions
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessions = await authService.getActiveSessions(userId);

        res.json({
            success: true,
            message: 'Active sessions retrieved',
            data: sessions
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SESSIONS_FAILED',
            message: 'Failed to retrieve sessions'
        });
    }
});

// Logout current session
router.post('/logout', async (req, res) => {
    try {
        // Check if user is authenticated (optional for logout)
        let userId = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (error) {
                // Token is invalid, but we still allow logout
                console.log('Invalid token during logout, proceeding with logout anyway');
            }
        }
        
        // Try to logout session if session token is provided
        const sessionToken = req.headers['x-session-token'];
        if (sessionToken) {
            try {
                await authService.logoutSession(sessionToken);
            } catch (error) {
                console.log('Session logout failed, but continuing with logout:', error.message);
            }
        }
        
        // If we have a valid user ID, try to logout all sessions
        if (userId) {
            try {
                await authService.logoutAllSessions(userId);
            } catch (error) {
                console.log('Logout all sessions failed, but continuing with logout:', error.message);
            }
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'LOGOUT_FAILED',
            message: 'Logout failed'
        });
    }
});

// Logout all sessions
router.post('/logout-all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await authService.logoutAllSessions(userId);

        res.json({
            success: true,
            message: 'All sessions logged out successfully',
            data: result
        });
    } catch (error) {
        console.error('Logout all sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'LOGOUT_ALL_FAILED',
            message: 'Failed to logout all sessions'
        });
    }
});

// Refresh session
router.post('/sessions/refresh', authenticateToken, async (req, res) => {
    try {
        const sessionToken = req.headers['x-session-token'];
        if (!sessionToken) {
            return res.status(400).json({
                success: false,
                error: 'SESSION_TOKEN_REQUIRED',
                message: 'Session token is required'
            });
        }

        const result = await authService.refreshSession(sessionToken);

        res.json({
            success: true,
            message: 'Session refreshed successfully',
            data: result
        });
    } catch (error) {
        console.error('Refresh session error:', error);
        res.status(500).json({
            success: false,
            error: 'SESSION_REFRESH_FAILED',
            message: 'Failed to refresh session'
        });
    }
});

// ==================== ROLE MANAGEMENT ROUTES ====================

// Create role (Admin only)
router.post('/roles', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'roles:create');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to create roles'
            });
        }

        const role = await authService.createRole(req.body);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_ROLE_FAILED',
            message: error.message
        });
    }
});

// Get all roles
router.get('/roles', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'roles:read');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to view roles'
            });
        }

        const rolesCollection = await getCollection('roles');
        const roles = await rolesCollection.find({ isActive: true }).toArray();

        res.json({
            success: true,
            message: 'Roles retrieved successfully',
            data: roles
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_ROLES_FAILED',
            message: 'Failed to retrieve roles'
        });
    }
});

// Assign role to user
router.post('/users/:userId/roles', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'users:manage_roles');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to assign roles'
            });
        }

        const { userId } = req.params;
        const { roleId } = req.body;

        const result = await authService.assignRoleToUser(userId, roleId, req.user.userId);

        res.json({
            success: true,
            message: 'Role assigned successfully',
            data: result
        });
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({
            success: false,
            error: 'ASSIGN_ROLE_FAILED',
            message: error.message
        });
    }
});

// Remove role from user
router.delete('/users/:userId/roles/:roleId', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'users:manage_roles');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to remove roles'
            });
        }

        const { userId, roleId } = req.params;

        const result = await authService.removeRoleFromUser(userId, roleId, req.user.userId);

        res.json({
            success: true,
            message: 'Role removed successfully',
            data: result
        });
    } catch (error) {
        console.error('Remove role error:', error);
        res.status(500).json({
            success: false,
            error: 'REMOVE_ROLE_FAILED',
            message: error.message
        });
    }
});

// ==================== AUDIT LOG ROUTES ====================

// Get audit logs
router.get('/audit-logs', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'audit:read');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to view audit logs'
            });
        }

        const filters = {
            userId: req.query.userId,
            action: req.query.action,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            limit: parseInt(req.query.limit) || 100
        };

        const logs = await authService.getAuditLogs(filters);

        res.json({
            success: true,
            message: 'Audit logs retrieved successfully',
            data: logs
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_AUDIT_LOGS_FAILED',
            message: 'Failed to retrieve audit logs'
        });
    }
});

// ==================== SECURITY ROUTES ====================

// Unlock account (Admin only)
router.post('/users/:userId/unlock', authenticateToken, async (req, res) => {
    try {
        const hasPermission = await authService.checkPermission(req.user.userId, 'users:unlock');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Insufficient permissions to unlock accounts'
            });
        }

        const { userId } = req.params;
        await authService.unlockAccount(userId, req.user.userId);

        res.json({
            success: true,
            message: 'Account unlocked successfully'
        });
    } catch (error) {
        console.error('Unlock account error:', error);
        res.status(500).json({
            success: false,
            error: 'UNLOCK_ACCOUNT_FAILED',
            message: 'Failed to unlock account'
        });
    }
});

// Get user permissions
router.get('/permissions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const permissions = await authService.getUserPermissions(userId);

        res.json({
            success: true,
            message: 'User permissions retrieved',
            data: permissions
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_PERMISSIONS_FAILED',
            message: 'Failed to retrieve permissions'
        });
    }
});

// ==================== TOKEN MANAGEMENT ROUTES ====================

// Refresh JWT token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'REFRESH_TOKEN_REQUIRED',
                message: 'Refresh token is required'
            });
        }

        // Verify the refresh token and rotate
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
            const employeeId = decoded.userId;
            
            // Get employee to include updated role information
            const Employee = require('../models/Employee');
            const employee = await Employee.findById(employeeId).select('-password');
            
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    error: 'EMPLOYEE_NOT_FOUND',
                    message: 'Employee not found'
                });
            }

            // Get employee permissions
            const employeeAuthService = require('../services/employeeAuthService');
            const permissions = await employeeAuthService.getEmployeePermissions(employee._id);

            // Generate new JWT token
            const tokenResult = await employeeAuthService.generateJWTToken(employee._id, permissions.data);
            if (!tokenResult.success) {
                return res.status(500).json({
                    success: false,
                    error: 'TOKEN_GENERATION_FAILED',
                    message: 'Failed to generate new token'
                });
            }

            // Rotate refresh token: issue a new one and invalidate the old one
            const newRefreshToken = jwt.sign({ userId: employee._id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
            try {
                const { getCollection } = require('../config/database');
                const refreshTokens = await getCollection('refresh_tokens');
                // Mark old as revoked
                await refreshTokens.updateOne({ token: refreshToken }, { $set: { status: 'revoked', revokedAt: new Date() } }, { upsert: true });
                // Store new
                await refreshTokens.insertOne({ token: newRefreshToken, userId: employee._id, createdAt: new Date(), status: 'active', expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
            } catch (storeErr) {
                console.error('Refresh token store/rotate error:', storeErr.message);
            }

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: tokenResult.data,
                    refreshToken: newRefreshToken,
                    user: {
                        id: employee._id,
                        email: employee.basicInfo?.email || employee.email,
                        firstName: employee.basicInfo?.firstName || employee.firstName,
                        lastName: employee.basicInfo?.lastName || employee.lastName,
                        role: employee.role,
                        roles: employee.roles || [],
                        permissions: permissions.data
                    }
                }
            });
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_REFRESH_TOKEN',
                message: 'Invalid or expired refresh token'
            });
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'TOKEN_REFRESH_FAILED',
            message: 'Failed to refresh token'
        });
    }
});

// ==================== ADMIN UTILITY ROUTES ====================

// Update user roles (Admin utility endpoint) - SECURED
router.put('/update-user-roles', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
        const { email, roles } = req.body;
        
        if (!email || !roles || !Array.isArray(roles)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_INPUT',
                message: 'Email and roles array are required'
            });
        }

        const employeesCollection = await getCollection('employees');
        const usersCollection = await getCollection('users');
        
        // Try to find user in employees collection first
        let user = await employeesCollection.findOne({ 
            'basicInfo.email': { $regex: new RegExp(email, 'i') } 
        });
        
        if (!user) {
            // Try users collection
            user = await usersCollection.findOne({ 
                email: { $regex: new RegExp(email, 'i') } 
            });
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }
        
        // Update with all roles
        const updateData = {
            role: 'admin',
            roles: roles,
            permissions: ['*:*:*'], // Wildcard permission for everything
            updatedAt: new Date()
        };
        
        let result;
        if (user.basicInfo) {
            // Employee collection
            result = await employeesCollection.updateOne(
                { _id: user._id },
                { $set: updateData }
            );
        } else {
            // Users collection
            result = await usersCollection.updateOne(
                { _id: user._id },
                { $set: updateData }
            );
        }
        
        if (result.modifiedCount > 0) {
            res.json({
                success: true,
                message: 'User roles updated successfully',
                data: {
                    email: user.basicInfo?.email || user.email,
                    roles: roles,
                    permissions: ['*:*:*']
                }
            });
        } else {
            res.json({
                success: true,
                message: 'No changes made to user (roles may already be set)',
                data: {
                    email: user.basicInfo?.email || user.email,
                    roles: roles
                }
            });
        }
        
    } catch (error) {
        console.error('Update user roles error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_ROLES_FAILED',
            message: 'Failed to update user roles'
        });
    }
});

module.exports = router;
