/**
 * Email Service
 * Handles sending emails for employee invitations and notifications
 */

const nodemailer = require('nodemailer');
const { getCollection } = require('../config/optimized-database');
const sendGridService = require('./sendgrid-service');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if we have proper email credentials
      const hasValidCredentials = (
        (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your-app-password-here') ||
        (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
        (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your-app-password-here')
      );

      if (!hasValidCredentials) {
        console.log('⚠️  Email credentials not configured, using mock email service');
        this.transporter = 'mock';
        return;
      }

      // Use custom SMTP configuration (SpaceMail server)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.spacemail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true' || true, // SSL for port 465
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
        },
        // Additional options for better compatibility
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates if needed
        }
      });

      console.log('✅ Email service initialized with real SMTP');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      console.log('⚠️  Falling back to mock email service');
      this.transporter = 'mock';
    }
  }

  async sendEmployeeInvitation(invitationData) {
    const { email, name, role, department, invitationToken } = invitationData;
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://admin.yourclutch.com';
    const invitationLink = `${frontendUrl}/setup-password?token=${invitationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@yourclutch.com',
      to: email,
      subject: `Welcome to Clutch - Set up your account`,
      html: this.getInvitationEmailTemplate({
        name,
        role,
        department,
        invitationLink
      }),
      text: this.getInvitationEmailText({
        name,
        role,
        department,
        invitationLink
      })
    };

    try {
      // Try SendGrid first (most reliable for transactional emails)
      try {
        console.log('📧 Attempting to send via SendGrid...');
        const sendGridResult = await sendGridService.sendEmployeeInvitation(invitationData);
        console.log('✅ Employee invitation sent via SendGrid to:', email);
        return sendGridResult;
      } catch (sendGridError) {
        console.warn('⚠️  SendGrid failed, trying SMTP fallback:', sendGridError.message);
      }

      // Fallback to SMTP if Mailchimp fails
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      // Handle mock email service
      if (this.transporter === 'mock') {
        console.log('📧 MOCK EMAIL - Employee invitation would be sent to:', email);
        console.log('📧 MOCK EMAIL - Subject:', mailOptions.subject);
        console.log('📧 MOCK EMAIL - Invitation Link:', invitationLink);
        console.log('📧 MOCK EMAIL - To set up real email, configure SENDGRID_API_KEY or EMAIL_USER and EMAIL_PASSWORD in .env');
        
        // Store invitation in database for manual processing
        await this.storeInvitationForManualProcessing({
          email,
          name: invitationData.name,
          role: invitationData.role,
          department: invitationData.department,
          invitationLink,
          mailOptions
        });
        
        return { messageId: 'mock-' + Date.now(), accepted: [email] };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Employee invitation email sent via SMTP to:', email);
      return result;
    } catch (error) {
      console.error('❌ Failed to send invitation email via all methods:', error);
      
      // Store invitation for manual processing as last resort
      await this.storeInvitationForManualProcessing({
        email,
        name: invitationData.name,
        role: invitationData.role,
        department: invitationData.department,
        invitationLink,
        mailOptions
      });
      
      throw error;
    }
  }

  getInvitationEmailTemplate({ name, role, department, invitationLink }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Clutch Platform</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; max-width: 600px;">
                
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #E7000B 0%, #C7000A 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
                        <div style="margin-bottom: 20px;">
                          <img src="https://drive.google.com/uc?export=view&id=1UyOznOrD4lNpeS93t3TBWBhfNMdbykVQ" alt="Clutch Platform" style="height: 48px; width: auto; max-width: 200px;" />
                        </div>
                        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #ffffff;">Welcome to Clutch Platform</h1>
                        <p style="font-size: 16px; margin: 0; opacity: 0.9;">You've been invited to join our team</p>
                      </td>
                    </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #ffffff;">
                    <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0;">Hello ${name}!</h2>
                    
                        <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                          We're excited to welcome you to the Clutch team! You've been invited to join us as a 
                          <strong style="color: #E7000B;">${role}</strong> in the 
                          <strong style="color: #E7000B;">${department}</strong> department.
                        </p>
                    
                    <!-- Info Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 10px; margin: 30px 0;">
                      <tr>
                        <td style="padding: 30px;">
                          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0;">Your Role Details</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #374151;">
                            <li style="margin-bottom: 8px; font-size: 16px;"><strong>Position:</strong> ${role}</li>
                            <li style="margin-bottom: 8px; font-size: 16px;"><strong>Department:</strong> ${department}</li>
                            <li style="margin-bottom: 8px; font-size: 16px;"><strong>Access Level:</strong> Employee Portal</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">
                      To get started, please set up your account password by clicking the button below:
                    </p>
                    
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${invitationLink}" style="display: inline-block; background: linear-gradient(135deg, #E7000B 0%, #C7000A 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(231, 0, 11, 0.3);">
                            Set Up My Account
                          </a>
                        </div>
                    
                    <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                      <span style="color: #E7000B; font-weight: 600;">Important:</span> This invitation link will expire in 7 days. If you have any questions or need assistance, please contact your HR department.
                    </p>
                    
                    <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                      If the button doesn't work, you can copy and paste this link into your browser:
                    </p>
                    
                    <!-- Link Fallback -->
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; border: 1px solid #e5e7eb; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px; color: #6b7280;">
                      ${invitationLink}
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; border-top: 1px solid #e5e7eb; padding: 30px; text-align: center;">
                        <div style="margin-bottom: 20px;">
                          <img src="https://clutch-main-nk7x.onrender.com/Assets/logos/Logored.png" alt="Clutch Platform" style="height: 32px; width: auto; max-width: 150px;" />
                        </div>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                      This is an automated message from Clutch Platform. Please do not reply to this email.
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                      © 2025 Clutch Platform. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  getInvitationEmailText({ name, role, department, invitationLink }) {
    return `
Welcome to Clutch!

Hello ${name}!

We're excited to welcome you to the Clutch team! You've been invited to join us as a ${role} in the ${department} department.

Your Role Details:
- Position: ${role}
- Department: ${department}
- Access Level: Employee Portal

To get started, please set up your account password by visiting this link:
${invitationLink}

Important: This invitation link will expire in 7 days. If you have any questions or need assistance, please contact your HR department.

This is an automated message from Clutch Platform. Please do not reply to this email.
© 2025 Clutch Platform. All rights reserved.
    `;
  }

  async sendPasswordResetEmail(email, resetToken) {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@yourclutch.com',
      to: email,
      subject: 'Reset your Clutch password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for your Clutch account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Password Reset Request\n\nYou requested to reset your password for your Clutch account.\n\nReset your password: ${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async storeInvitationForManualProcessing(invitationData) {
    try {
      const pendingEmailsCollection = await getCollection('pending_emails');
      
      const pendingEmail = {
        type: 'employee_invitation',
        to: invitationData.email,
        subject: invitationData.mailOptions.subject,
        html: invitationData.mailOptions.html,
        text: invitationData.mailOptions.text,
        invitationLink: invitationData.invitationLink,
        employeeData: {
          name: invitationData.name,
          role: invitationData.role,
          department: invitationData.department
        },
        status: 'pending',
        createdAt: new Date(),
        attempts: 0,
        lastAttempt: null
      };

      await pendingEmailsCollection.insertOne(pendingEmail);
      console.log('📧 Stored invitation for manual processing:', invitationData.email);
    } catch (error) {
      console.error('❌ Failed to store invitation for manual processing:', error);
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
