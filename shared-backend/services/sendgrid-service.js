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
