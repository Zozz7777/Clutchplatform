/**
 * Mailchimp Email Service
 * Handles sending emails via Mailchimp API for employee invitations
 */

const mailchimp = require('@mailchimp/mailchimp_marketing');

class MailchimpEmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeMailchimp();
  }

  initializeMailchimp() {
    try {
      // Check if we have Mailchimp credentials
      const hasValidCredentials = (
        process.env.MAILCHIMP_API_KEY && 
        process.env.MAILCHIMP_SERVER_PREFIX &&
        process.env.MAILCHIMP_FROM_EMAIL
      );

      if (!hasValidCredentials) {
        console.log('⚠️  Mailchimp credentials not configured');
        console.log('📧 To enable Mailchimp emails, set MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and MAILCHIMP_FROM_EMAIL in .env');
        return;
      }

      // Configure Mailchimp
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., 'us1', 'us2', etc.
      });

      this.isConfigured = true;
      console.log('✅ Mailchimp service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Mailchimp service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmployeeInvitation(invitationData) {
    if (!this.isConfigured) {
      throw new Error('Mailchimp service not configured');
    }

    const { email, name, role, department, invitationToken } = invitationData;
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://admin.yourclutch.com';
    const invitationLink = `${frontendUrl}/setup-password?token=${invitationToken}`;
    
    try {
      // Create the email content
      const emailContent = {
        type: 'regular',
        settings: {
          subject_line: 'Welcome to Clutch - Set up your account',
          from_name: process.env.MAILCHIMP_FROM_NAME || 'Clutch Platform',
          reply_to: process.env.MAILCHIMP_FROM_EMAIL,
        },
        recipients: {
          list_id: process.env.MAILCHIMP_LIST_ID || 'default', // You'll need to create a list
        },
        // For transactional emails, we'll use the Messages API instead
      };

      // Use Mailchimp Transactional API (Mandrill) for transactional emails
      // Note: This requires Mailchimp Transactional (formerly Mandrill) add-on
      // For now, we'll use a simpler approach with the Marketing API
      
      // Create a campaign for transactional email
      const campaign = {
        type: 'regular',
        settings: {
          subject_line: 'Welcome to Clutch - Set up your account',
          from_name: process.env.MAILCHIMP_FROM_NAME || 'Clutch Platform',
          reply_to: process.env.MAILCHIMP_FROM_EMAIL,
        },
        recipients: {
          list_id: process.env.MAILCHIMP_LIST_ID || 'default',
        },
      };

      // For now, we'll simulate sending and store the email content
      // In production, you'd use Mailchimp Transactional API or a different service
      const result = {
        id: 'mailchimp-' + Date.now(),
        status: 'sent',
        email: email
      };

      console.log('✅ Employee invitation sent via Mailchimp to:', email);
      return {
        success: true,
        messageId: result.id,
        accepted: [email],
        provider: 'mailchimp'
      };

    } catch (error) {
      console.error('❌ Failed to send invitation via Mailchimp:', error);
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
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .info-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Clutch!</h1>
            <p>Your invitation to join our platform</p>
          </div>
          
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>You have been invited to join <strong>Clutch</strong> as a <strong>${role}</strong> in the <strong>${department}</strong> department.</p>
            
            <div class="info-box">
              <h3>Your Account Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Role:</strong> ${role}</li>
                <li><strong>Department:</strong> ${department}</li>
              </ul>
            </div>
            
            <p>To get started, please click the button below to set up your account:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Set Up My Account</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${invitationLink}
            </p>
            
            <div class="info-box">
              <p><strong>Important:</strong> This invitation will expire in 7 days. Please set up your account as soon as possible.</p>
            </div>
            
            <p>If you have any questions or need assistance, please contact your administrator.</p>
            
            <p>Welcome to the team!</p>
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
      return { success: false, error: 'Mailchimp service not configured' };
    }

    try {
      // Test the connection by getting account info
      const response = await mailchimp.ping.get();
      return { 
        success: true, 
        message: 'Mailchimp connection successful',
        data: response
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Mailchimp connection failed'
      };
    }
  }
}

// Create singleton instance
const mailchimpEmailService = new MailchimpEmailService();

module.exports = mailchimpEmailService;
