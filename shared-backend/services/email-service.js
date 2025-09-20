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
        <style>
          /* Design System Colors from design.json */
          :root {
            --primary: oklch(0.5770 0.2450 27.3250);
            --primary-foreground: oklch(0.9850 0 0);
            --background: oklch(1 0 0);
            --foreground: oklch(0.1450 0 0);
            --card: oklch(1 0 0);
            --card-foreground: oklch(0.1450 0 0);
            --muted: oklch(0.9700 0 0);
            --muted-foreground: oklch(0.5560 0 0);
            --border: oklch(0.9220 0 0);
            --success: oklch(0.72 0.2 145);
            --info: oklch(0.75 0.1 220);
            --warning: oklch(0.85 0.18 75);
          }
          
          /* Typography from design.json */
          body { 
            font-family: 'Roboto', ui-sans-serif, sans-serif, system-ui;
            line-height: 1.5;
            color: var(--foreground);
            background-color: var(--muted);
            margin: 0;
            padding: 0;
          }
          
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: var(--background);
            border-radius: 0.625rem;
            overflow: hidden;
            box-shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
          }
          
          .header { 
            background: var(--primary); 
            color: var(--primary-foreground); 
            padding: 2rem 1.5rem; 
            text-align: center;
          }
          
          .logo-container {
            margin-bottom: 1rem;
          }
          
          .logo {
            height: 48px;
            width: auto;
            max-width: 200px;
            object-fit: contain;
          }
          
          .header h1 {
            font-size: 1.875rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            line-height: 1.25;
          }
          
          .header p {
            font-size: 1rem;
            margin: 0;
            opacity: 0.9;
          }
          
          .content { 
            padding: 2rem 1.5rem; 
            background-color: var(--card);
          }
          
          .content h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--foreground);
            margin: 0 0 1rem 0;
            line-height: 1.25;
          }
          
          .content p {
            font-size: 1rem;
            line-height: 1.5;
            color: var(--foreground);
            margin: 0 0 1rem 0;
          }
          
          .button { 
            display: inline-block; 
            background: var(--primary); 
            color: var(--primary-foreground); 
            padding: 0.75rem 1.5rem; 
            text-decoration: none; 
            border-radius: 0.625rem; 
            margin: 1.5rem 0;
            font-weight: 600;
            font-size: 1rem;
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10);
          }
          
          .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px 0px hsl(0 0% 0% / 0.15);
          }
          
          .info-box { 
            background: var(--muted); 
            border: 1px solid var(--border);
            border-radius: 0.625rem;
            padding: 1.5rem; 
            margin: 1.5rem 0;
          }
          
          .info-box h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--foreground);
            margin: 0 0 1rem 0;
          }
          
          .info-box ul {
            margin: 0;
            padding-left: 1.5rem;
          }
          
          .info-box li {
            font-size: 1rem;
            line-height: 1.5;
            color: var(--foreground);
            margin-bottom: 0.5rem;
          }
          
          .footer { 
            text-align: center; 
            padding: 1.5rem;
            background-color: var(--muted);
            border-top: 1px solid var(--border);
          }
          
          .footer-logo {
            margin-bottom: 1rem;
          }
          
          .footer-logo-img {
            height: 32px;
            width: auto;
            max-width: 150px;
            object-fit: contain;
          }
          
          .footer p {
            color: var(--muted-foreground); 
            font-size: 0.875rem;
            margin: 0.25rem 0;
          }
          
          .link-fallback {
            word-break: break-all; 
            background: var(--muted); 
            padding: 1rem; 
            border-radius: 0.625rem; 
            font-family: 'Roboto Mono', ui-monospace, monospace;
            font-size: 0.875rem;
            color: var(--muted-foreground);
            border: 1px solid var(--border);
            margin: 1rem 0;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-bold {
            font-weight: 600;
          }
          
          .text-success {
            color: var(--success);
          }
          
          .text-warning {
            color: var(--warning);
          }
          
          .text-info {
            color: var(--info);
          }
          
          /* Responsive design */
          @media (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            
            .header, .content, .footer {
              padding: 1rem;
            }
            
            .header h1 {
              font-size: 1.5rem;
            }
            
            .content h2 {
              font-size: 1.25rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <img src="https://admin.yourclutch.com/Assets/logos/logowhite.png" alt="Clutch Platform" class="logo" />
            </div>
            <h1>Welcome to Clutch Platform</h1>
            <p>You've been invited to join our team</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>We're excited to welcome you to the Clutch team! You've been invited to join us as a <span class="text-bold">${role}</span> in the <span class="text-bold">${department}</span> department.</p>
            
            <div class="info-box">
              <h3>Your Role Details</h3>
              <ul>
                <li><span class="text-bold">Position:</span> ${role}</li>
                <li><span class="text-bold">Department:</span> ${department}</li>
                <li><span class="text-bold">Access Level:</span> Employee Portal</li>
              </ul>
            </div>
            
            <p>To get started, please set up your account password by clicking the button below:</p>
            
            <div class="text-center">
              <a href="${invitationLink}" class="button">Set Up My Account</a>
            </div>
            
            <p><span class="text-warning text-bold">Important:</span> This invitation link will expire in 7 days. If you have any questions or need assistance, please contact your HR department.</p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <div class="link-fallback">${invitationLink}</div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">
              <img src="https://admin.yourclutch.com/Assets/logos/Logored.png" alt="Clutch Platform" class="footer-logo-img" />
            </div>
            <p>This is an automated message from Clutch Platform. Please do not reply to this email.</p>
            <p>© 2025 Clutch Platform. All rights reserved.</p>
          </div>
        </div>
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
