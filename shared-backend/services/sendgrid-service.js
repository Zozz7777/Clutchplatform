/**
 * SendGrid Email Service
 * Handles sending emails via SendGrid API for employee invitations
 */

const sgMail = require('@sendgrid/mail');

class SendGridEmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeSendGrid();
  }

  initializeSendGrid() {
    try {
      // Check if we have SendGrid credentials
      const hasValidCredentials = process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL;

      if (!hasValidCredentials) {
        console.log('⚠️  SendGrid credentials not configured');
        console.log('📧 To enable SendGrid emails, set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in .env');
        return;
      }

      // Configure SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      this.isConfigured = true;
      console.log('✅ SendGrid service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmployeeInvitation(invitationData) {
    if (!this.isConfigured) {
      throw new Error('SendGrid service not configured');
    }

    const { email, name, role, department, invitationToken } = invitationData;
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://admin.yourclutch.com';
    const invitationLink = `${frontendUrl}/setup-password?token=${invitationToken}`;
    
    try {
      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: process.env.SENDGRID_FROM_NAME || 'Clutch Platform'
        },
        subject: 'Welcome to Clutch - Set up your account',
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
        }),
        categories: ['employee-invitation', 'clutch-admin'],
        customArgs: {
          employee_name: name,
          employee_role: role,
          employee_department: department,
          invitation_token: invitationToken
        }
      };

      const result = await sgMail.send(msg);

      console.log('✅ Employee invitation sent via SendGrid to:', email);
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        accepted: [email],
        provider: 'sendgrid'
      };

    } catch (error) {
      console.error('❌ Failed to send invitation via SendGrid:', error);
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; background-color: #f8f9fa; }
          .button { display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .button:hover { background: linear-gradient(135deg, #0056b3, #004085); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; padding: 20px; }
          .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .link-box { background-color: #f1f3f4; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #333; margin-top: 0; }
          .role-badge { background-color: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .department-badge { background-color: #17a2b8; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Welcome to Clutch!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your invitation to join our platform</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            
            <p>You have been invited to join <strong>Clutch</strong> as a <span class="role-badge">${role}</span> in the <span class="department-badge">${department}</span> department.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #1976d2;">📋 Your Account Details:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Role:</strong> ${role}</li>
                <li><strong>Department:</strong> ${department}</li>
              </ul>
            </div>
            
            <p>To get started, please click the button below to set up your account:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">🔧 Set Up My Account</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="link-box">
              ${invitationLink}
            </div>
            
            <div class="info-box">
              <p style="margin: 0;"><strong>⏰ Important:</strong> This invitation will expire in 7 days. Please set up your account as soon as possible.</p>
            </div>
            
            <p>If you have any questions or need assistance, please contact your administrator.</p>
            
            <p>Welcome to the team! 🎉</p>
            <p><strong>The Clutch Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Clutch Platform</p>
            <p>If you didn't expect this invitation, please ignore this email.</p>
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

You have been invited to join Clutch as a ${role} in the ${department} department.

Your Account Details:
- Name: ${name}
- Role: ${role}
- Department: ${department}

To get started, please click the link below to set up your account:
${invitationLink}

Important: This invitation will expire in 7 days. Please set up your account as soon as possible.

If you have any questions or need assistance, please contact your administrator.

Welcome to the team!

The Clutch Team

---
This email was sent by Clutch Platform
If you didn't expect this invitation, please ignore this email.
    `;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'SendGrid service not configured' };
    }

    try {
      // Test the connection by sending a test email to ourselves
      const testMsg = {
        to: process.env.SENDGRID_FROM_EMAIL,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'SendGrid Test - Clutch Platform',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p>'
      };

      await sgMail.send(testMsg);
      return { 
        success: true, 
        message: 'SendGrid connection successful - test email sent'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'SendGrid connection failed'
      };
    }
  }
}

// Create singleton instance
const sendGridEmailService = new SendGridEmailService();

module.exports = sendGridEmailService;
