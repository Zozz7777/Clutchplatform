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
                          <img src="https://clutch-main-nk7x.onrender.com/Assets/logos/logowhite.png" alt="Clutch Platform" style="height: 48px; width: auto; max-width: 200px;" />
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
