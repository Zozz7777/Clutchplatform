const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'help@yourclutch.com',
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async (emailOptions) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Clutch Careers',
        address: process.env.SMTP_FROM || 'help@yourclutch.com'
      },
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
      attachments: emailOptions.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      messageId: result.messageId,
      to: emailOptions.to,
      subject: emailOptions.subject
    });

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      to: emailOptions.to,
      subject: emailOptions.subject
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Send bulk emails
const sendBulkEmails = async (emailList, emailOptions) => {
  const results = [];
  
  for (const email of emailList) {
    try {
      const result = await sendEmail({
        ...emailOptions,
        to: email
      });
      results.push({ email, result });
    } catch (error) {
      results.push({ 
        email, 
        result: { success: false, error: error.message } 
      });
    }
  }
  
  return results;
};

// Send email with template
const sendTemplatedEmail = async (template, variables, recipient) => {
  try {
    const rendered = template.renderTemplate(variables);
    
    const result = await sendEmail({
      to: recipient,
      subject: rendered.subject,
      html: rendered.htmlContent,
      text: rendered.textContent
    });

    // Update template usage analytics
    await template.incrementUsage();

    return result;
  } catch (error) {
    logger.error('Failed to send templated email', {
      error: error.message,
      template: template.name,
      recipient
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    logger.info('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    logger.error('Email configuration test failed', { error: error.message });
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendTemplatedEmail,
  testEmailConfiguration
};