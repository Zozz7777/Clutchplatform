/**
 * Email Service
 * Handles sending emails for employee invitations and notifications
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if we have proper email credentials
      const hasValidCredentials = (
        (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ||
        (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
        (process.env.SMTP_USER && process.env.SMTP_PASS)
      );

      if (!hasValidCredentials) {
        console.log('⚠️  Email credentials not configured, using mock email service');
        this.transporter = 'mock';
        return;
      }

      // Use Gmail SMTP as default, but allow configuration via environment variables
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS
        },
        // For other SMTP providers
        ...(process.env.EMAIL_HOST && {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_SECURE === 'true'
        })
      });

      console.log('✅ Email service initialized with real SMTP');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      console.log('⚠️  Falling back to mock email service');
      this.transporter = 'mock';
    }
  }

  async sendEmployeeInvitation(invitationData) {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const { email, name, role, department, invitationToken } = invitationData;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
      // Handle mock email service
      if (this.transporter === 'mock') {
        console.log('📧 MOCK EMAIL - Employee invitation would be sent to:', email);
        console.log('📧 MOCK EMAIL - Subject:', mailOptions.subject);
        console.log('📧 MOCK EMAIL - Invitation Link:', invitationLink);
        console.log('📧 MOCK EMAIL - To set up real email, configure EMAIL_USER and EMAIL_PASSWORD in .env');
        return { messageId: 'mock-' + Date.now(), accepted: [email] };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Employee invitation email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
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
        <title>Welcome to Clutch</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .info-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Clutch!</h1>
            <p>You've been invited to join our team</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>We're excited to welcome you to the Clutch team! You've been invited to join us as a <strong>${role}</strong> in the <strong>${department}</strong> department.</p>
            
            <div class="info-box">
              <h3>Your Role Details:</h3>
              <ul>
                <li><strong>Position:</strong> ${role}</li>
                <li><strong>Department:</strong> ${department}</li>
                <li><strong>Access Level:</strong> Employee Portal</li>
              </ul>
            </div>
            
            <p>To get started, please set up your account password by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Set Up My Account</a>
            </div>
            
            <p><strong>Important:</strong> This invitation link will expire in 7 days. If you have any questions or need assistance, please contact your HR department.</p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">${invitationLink}</p>
          </div>
          
          <div class="footer">
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
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
