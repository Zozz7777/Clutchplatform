const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { getCollection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for production
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login attempts per windowMs
  message: {
    success: false,
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Too many login attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/v1/auth/login - Production login endpoint
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email/phone and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Detect if input is email or phone number
    const isEmail = email.includes('@');
    const isPhone = /^[0-9+\-\s()]+$/.test(email.replace(/\s/g, ''));
    
    console.log('🔐 Login attempt for:', email, '| Type:', isEmail ? 'email' : (isPhone ? 'phone' : 'unknown'));
    
    // Convert phone number to email format for database lookup if it's a phone
    let lookupEmail = email.toLowerCase();
    if (isPhone && !isEmail) {
      // If it's a phone number, convert to the format used during registration
      lookupEmail = `${email.replace(/\D/g, '')}@clutch.app`;
      console.log('📱 Phone number detected, converting to email format:', lookupEmail);
    }
    
    // Get user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: lookupEmail,
      isActive: true // Only allow active users
    });
    
    if (!user) {
      console.log('❌ User not found or inactive:', lookupEmail);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email/phone or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', lookupEmail);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email/phone or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || 'user',
        permissions: user.permissions || ['read', 'write']
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || 'user',
        permissions: user.permissions || ['read', 'write'],
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );
    
    console.log('✅ Login successful for user:', user.email);
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/register - Production registration endpoint
router.post('/register', authRateLimit, async (req, res) => {
  try {
    console.log('🔐 Registration attempt:', { email: req.body.email, hasName: !!req.body.name, hasFirstName: !!req.body.firstName });
    
    const { email, password, name, firstName, lastName, phone, phoneNumber, confirmPassword, agreeToTerms } = req.body;
    
    // Handle both name formats (name or firstName/lastName)
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : null);
    
    console.log('📝 Registration data processed:', { email, hasPassword: !!password, fullName });
    
    if (!email || !password || !fullName) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName });
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name (or firstName/lastName) are required',
        timestamp: new Date().toISOString()
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      console.log('❌ Password mismatch');
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_MISMATCH',
        message: 'Password and confirm password do not match',
        timestamp: new Date().toISOString()
      });
    }

    if (agreeToTerms !== undefined && !agreeToTerms) {
      console.log('❌ Terms not agreed');
      return res.status(400).json({
        success: false,
        error: 'TERMS_NOT_AGREED',
        message: 'You must agree to the terms and conditions',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    console.log('📧 Email to check:', email.toLowerCase());
    const usersCollection = await getCollection('users');
    console.log('✅ Database collection accessed');
    
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    console.log('🔍 User lookup result:', { 
      found: !!existingUser,
      email: email.toLowerCase(),
      existingUserEmail: existingUser?.email,
      existingUserId: existingUser?._id
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');
    
    // Create user
    console.log('💾 Creating user in database...');
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      phoneNumber: phone || phoneNumber || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      firebaseId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: firstName || fullName.split(' ')[0] || 'User',
      lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
      phone: phone || phoneNumber || null,
      dateOfBirth: null,
      gender: null,
      profileImage: null,
      isEmailVerified: false,
      isPhoneVerified: false,
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: { push: true, email: true, sms: false },
        receiveOffers: true,
        subscribeNewsletter: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    console.log('📝 User data to insert:', { email: newUser.email, hasPassword: !!newUser.password, name: newUser.name, phoneNumber: newUser.phoneNumber, userId: newUser.userId, firebaseId: newUser.firebaseId, role: newUser.role });
    
    const result = await usersCollection.insertOne(newUser);
    console.log('✅ User created successfully:', { userId: result.insertedId });
    
    // Send welcome email
    try {
      const { sendEmail } = require('../services/emailService');
      
      const welcomeEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Clutch!</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${newUser.firstName || 'there'}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Welcome to Clutch! We're excited to have you join our automotive services platform. 
              Your account has been successfully created and you can now start exploring all the features we have to offer.
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FF6B35;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Complete your profile to get personalized recommendations</li>
                <li>Browse our automotive services and book appointments</li>
                <li>Connect with trusted service providers in your area</li>
                <li>Track your service history and manage your vehicles</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://yourclutch.com'}/dashboard" 
                 style="background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Get Started
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              <strong>Need Help?</strong> Our support team is here to assist you. 
              You can reach us at <a href="mailto:support@yourclutch.com" style="color: #FF6B35;">support@yourclutch.com</a> or visit our help center.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Best regards,<br>
              The Clutch Team
            </p>
          </div>
        </div>
      `;
      
      const welcomeEmailText = `
        Welcome to Clutch!
        
        Hello ${newUser.firstName || 'there'}!
        
        Welcome to Clutch! We're excited to have you join our automotive services platform. 
        Your account has been successfully created and you can now start exploring all the features we have to offer.
        
        What's Next?
        - Complete your profile to get personalized recommendations
        - Browse our automotive services and book appointments
        - Connect with trusted service providers in your area
        - Track your service history and manage your vehicles
        
        Get started: ${process.env.FRONTEND_URL || 'https://yourclutch.com'}/dashboard
        
        Need Help? Our support team is here to assist you. 
        You can reach us at support@yourclutch.com or visit our help center.
        
        Best regards,
        The Clutch Team
      `;
      
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to Clutch - Your Account is Ready!',
        html: welcomeEmailHtml,
        text: welcomeEmailText
      });
      
      console.log('📧 Welcome email sent successfully to:', newUser.email);
      
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails, just log it
    }
    
    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { 
        userId: result.insertedId, 
        email: newUser.email, 
        role: newUser.role, 
        permissions: newUser.permissions 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { 
        userId: result.insertedId, 
        email: newUser.email, 
        role: newUser.role, 
        permissions: newUser.permissions, 
        type: 'refresh' 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT tokens generated successfully');
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: result.insertedId.toString(),
          email: newUser.email,
          phone: newUser.phone,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          dateOfBirth: newUser.dateOfBirth,
          gender: newUser.gender,
          profileImage: newUser.profileImage,
          isEmailVerified: newUser.isEmailVerified,
          isPhoneVerified: newUser.isPhoneVerified,
          preferences: newUser.preferences,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        },
        token: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      },
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'User with this information already exists',
        field: Object.keys(error.keyPattern)[0],
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/forgot-password - Forgot password endpoint
router.post('/forgot-password', authRateLimit, async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    
    if (!emailOrPhone) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL_OR_PHONE',
        message: 'Email or phone number is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Detect if input is email or phone number
    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^[0-9+\-\s()]+$/.test(emailOrPhone.replace(/\s/g, ''));
    
    let lookupEmail = emailOrPhone.toLowerCase();
    if (isPhone && !isEmail) {
      lookupEmail = `${emailOrPhone.replace(/\D/g, '')}@clutch.app`;
    }
    
    // Check if user exists
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email: lookupEmail });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If the email/phone exists, a reset code has been sent',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token in database
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: resetToken,
          resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          updatedAt: new Date()
        }
      }
    );
    
    // Send password reset email
    try {
      const { sendEmail } = require('../services/emailService');
      
      const resetUrl = `${process.env.FRONTEND_URL || 'https://admin.yourclutch.com'}/reset-password?token=${resetToken}`;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; color: white; padding: 20px; text-align: center;">
            <h1>Clutch Password Reset</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Hello ${user.name || user.firstName || 'User'}!</h2>
            <p>We received a request to reset your password for your Clutch account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <hr>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>For security reasons, this link can only be used once</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The Clutch Team</p>
          </div>
        </div>
      `;
      
      const emailResult = await sendEmail({
        to: lookupEmail,
        subject: 'Reset Your Clutch Password',
        html: emailContent,
        text: `Hello ${user.name || user.firstName || 'User'}! Please click the following link to reset your password: ${resetUrl}. This link expires in 1 hour.`
      });
      
      if (emailResult.success) {
        console.log('📧 Password reset email sent successfully to:', lookupEmail);
      } else {
        console.error('❌ Failed to send password reset email:', emailResult.error);
      }
      
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the request if email fails, just log it
    }
    
    console.log('📧 Password reset requested for:', lookupEmail);
    
    res.json({
      success: true,
      message: 'If the email/phone exists, a reset code has been sent',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'FORGOT_PASSWORD_FAILED',
      message: 'Failed to process password reset request',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/verify-otp - Verify OTP endpoint
router.post('/verify-otp', authRateLimit, async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;
    
    if (!emailOrPhone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email/phone and OTP are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // TODO: Implement actual OTP verification
    // For now, just return success for any 6-digit OTP
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      res.json({
        success: true,
        message: 'OTP verified successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'INVALID_OTP',
        message: 'Invalid OTP format',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'OTP_VERIFICATION_FAILED',
      message: 'Failed to verify OTP',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
