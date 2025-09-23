const mongoose = require('mongoose');
const EmailTemplate = require('../models/EmailTemplate');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Default email templates
const defaultTemplates = [
  {
    name: 'Application Received Confirmation',
    type: 'application_received',
    subject: 'Application Received - {{jobTitle}} at Clutch',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Received</h1>
            <p>Thank you for your interest in joining Clutch</p>
          </div>
          <div class="content">
            <h2>Hello {{candidateName}},</h2>
            <p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at Clutch. We have successfully received your application and it is currently under review.</p>
            
            <h3>Application Details:</h3>
            <ul>
              <li><strong>Position:</strong> {{jobTitle}}</li>
              <li><strong>Application ID:</strong> {{applicationId}}</li>
              <li><strong>Applied Date:</strong> {{appliedDate}}</li>
            </ul>
            
            <p>Our HR team will review your application and get back to you within 5-7 business days. If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Thank you for considering Clutch as your next career opportunity!</p>
            
            <div class="footer">
              <p>Best regards,<br>The Clutch HR Team</p>
              <p>Clutch - Building the Future of Automotive Technology</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Application Received - {{jobTitle}} at Clutch
      
      Hello {{candidateName}},
      
      Thank you for applying for the {{jobTitle}} position at Clutch. We have successfully received your application and it is currently under review.
      
      Application Details:
      - Position: {{jobTitle}}
      - Application ID: {{applicationId}}
      - Applied Date: {{appliedDate}}
      
      Our HR team will review your application and get back to you within 5-7 business days. If you have any questions, please don't hesitate to contact us.
      
      Thank you for considering Clutch as your next career opportunity!
      
      Best regards,
      The Clutch HR Team
      Clutch - Building the Future of Automotive Technology
    `,
    variables: [
      { name: 'candidateName', description: 'Candidate full name', isRequired: true },
      { name: 'jobTitle', description: 'Job title', isRequired: true },
      { name: 'applicationId', description: 'Application ID', isRequired: true },
      { name: 'appliedDate', description: 'Date of application', isRequired: true }
    ],
    settings: {
      isActive: true,
      isDefault: true,
      language: 'en',
      category: 'recruitment'
    }
  },
  {
    name: 'Interview Invitation',
    type: 'interview_invite',
    subject: 'Interview Invitation - {{jobTitle}} at Clutch',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .interview-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Invitation</h1>
            <p>You're invited for an interview at Clutch</p>
          </div>
          <div class="content">
            <h2>Hello {{candidateName}},</h2>
            <p>Congratulations! We were impressed by your application for the <strong>{{jobTitle}}</strong> position and would like to invite you for an interview.</p>
            
            <div class="interview-details">
              <h3>Interview Details:</h3>
              <ul>
                <li><strong>Date:</strong> {{interviewDate}}</li>
                <li><strong>Time:</strong> {{interviewTime}}</li>
                <li><strong>Type:</strong> {{interviewType}}</li>
                <li><strong>Duration:</strong> {{interviewDuration}} minutes</li>
                <li><strong>Interviewer:</strong> {{interviewerName}}</li>
                {{#if meetingLink}}
                <li><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></li>
                {{/if}}
                {{#if location}}
                <li><strong>Location:</strong> {{location}}</li>
                {{/if}}
              </ul>
            </div>
            
            <p>Please confirm your attendance by replying to this email or contacting us at {{contactEmail}}.</p>
            
            <p>We look forward to meeting you and learning more about your experience and qualifications.</p>
            
            <div class="footer">
              <p>Best regards,<br>{{interviewerName}}<br>The Clutch HR Team</p>
              <p>Clutch - Building the Future of Automotive Technology</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Interview Invitation - {{jobTitle}} at Clutch
      
      Hello {{candidateName}},
      
      Congratulations! We were impressed by your application for the {{jobTitle}} position and would like to invite you for an interview.
      
      Interview Details:
      - Date: {{interviewDate}}
      - Time: {{interviewTime}}
      - Type: {{interviewType}}
      - Duration: {{interviewDuration}} minutes
      - Interviewer: {{interviewerName}}
      {{#if meetingLink}}
      - Meeting Link: {{meetingLink}}
      {{/if}}
      {{#if location}}
      - Location: {{location}}
      {{/if}}
      
      Please confirm your attendance by replying to this email or contacting us at {{contactEmail}}.
      
      We look forward to meeting you and learning more about your experience and qualifications.
      
      Best regards,
      {{interviewerName}}
      The Clutch HR Team
      Clutch - Building the Future of Automotive Technology
    `,
    variables: [
      { name: 'candidateName', description: 'Candidate full name', isRequired: true },
      { name: 'jobTitle', description: 'Job title', isRequired: true },
      { name: 'interviewDate', description: 'Interview date', isRequired: true },
      { name: 'interviewTime', description: 'Interview time', isRequired: true },
      { name: 'interviewType', description: 'Type of interview', isRequired: true },
      { name: 'interviewDuration', description: 'Interview duration in minutes', isRequired: true },
      { name: 'interviewerName', description: 'Interviewer name', isRequired: true },
      { name: 'meetingLink', description: 'Meeting link (for virtual interviews)', isRequired: false },
      { name: 'location', description: 'Interview location (for in-person interviews)', isRequired: false },
      { name: 'contactEmail', description: 'Contact email', isRequired: true }
    ],
    settings: {
      isActive: true,
      isDefault: true,
      language: 'en',
      category: 'recruitment'
    }
  },
  {
    name: 'Job Offer Letter',
    type: 'offer_letter',
    subject: 'Job Offer - {{jobTitle}} at Clutch',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Offer</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .offer-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>You've been selected to join the Clutch team</p>
          </div>
          <div class="content">
            <h2>Hello {{candidateName}},</h2>
            <p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at Clutch. After careful consideration of all candidates, we believe you are the perfect fit for our team.</p>
            
            <div class="offer-details">
              <h3>Offer Details:</h3>
              <ul>
                <li><strong>Position:</strong> {{jobTitle}}</li>
                <li><strong>Department:</strong> {{department}}</li>
                <li><strong>Start Date:</strong> {{startDate}}</li>
                <li><strong>Salary:</strong> {{salary}}</li>
                <li><strong>Employment Type:</strong> {{employmentType}}</li>
                <li><strong>Location:</strong> {{location}}</li>
              </ul>
              
              <h4>Benefits:</h4>
              <ul>
                {{#each benefits}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            
            <p>Please review the attached offer letter and employment contract. If you have any questions, please don't hesitate to contact us.</p>
            
            <p>We are excited about the possibility of you joining our team and contributing to our mission of building the future of automotive technology.</p>
            
            <p><strong>Please respond to this offer by {{responseDeadline}}.</strong></p>
            
            <div class="footer">
              <p>Welcome to the team!<br>{{hiringManagerName}}<br>The Clutch HR Team</p>
              <p>Clutch - Building the Future of Automotive Technology</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Job Offer - {{jobTitle}} at Clutch
      
      Hello {{candidateName}},
      
      We are delighted to offer you the position of {{jobTitle}} at Clutch. After careful consideration of all candidates, we believe you are the perfect fit for our team.
      
      Offer Details:
      - Position: {{jobTitle}}
      - Department: {{department}}
      - Start Date: {{startDate}}
      - Salary: {{salary}}
      - Employment Type: {{employmentType}}
      - Location: {{location}}
      
      Benefits:
      {{#each benefits}}
      - {{this}}
      {{/each}}
      
      Please review the attached offer letter and employment contract. If you have any questions, please don't hesitate to contact us.
      
      We are excited about the possibility of you joining our team and contributing to our mission of building the future of automotive technology.
      
      Please respond to this offer by {{responseDeadline}}.
      
      Welcome to the team!
      {{hiringManagerName}}
      The Clutch HR Team
      Clutch - Building the Future of Automotive Technology
    `,
    variables: [
      { name: 'candidateName', description: 'Candidate full name', isRequired: true },
      { name: 'jobTitle', description: 'Job title', isRequired: true },
      { name: 'department', description: 'Department', isRequired: true },
      { name: 'startDate', description: 'Start date', isRequired: true },
      { name: 'salary', description: 'Salary information', isRequired: true },
      { name: 'employmentType', description: 'Employment type', isRequired: true },
      { name: 'location', description: 'Work location', isRequired: true },
      { name: 'benefits', description: 'List of benefits', isRequired: false },
      { name: 'responseDeadline', description: 'Response deadline', isRequired: true },
      { name: 'hiringManagerName', description: 'Hiring manager name', isRequired: true }
    ],
    settings: {
      isActive: true,
      isDefault: true,
      language: 'en',
      category: 'recruitment'
    }
  },
  {
    name: 'Application Rejection',
    type: 'rejection',
    subject: 'Application Update - {{jobTitle}} at Clutch',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
            <p>Thank you for your interest in Clutch</p>
          </div>
          <div class="content">
            <h2>Hello {{candidateName}},</h2>
            <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at Clutch and for taking the time to apply.</p>
            
            <p>After careful consideration, we have decided to move forward with other candidates for this position. This decision was not easy, as we were impressed by the quality of applications we received.</p>
            
            <p>We encourage you to continue following our career opportunities and to apply for other positions that match your skills and interests. We will keep your application on file and may contact you for future opportunities.</p>
            
            <p>Thank you again for your interest in Clutch, and we wish you the best in your career endeavors.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Clutch HR Team</p>
              <p>Clutch - Building the Future of Automotive Technology</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Application Update - {{jobTitle}} at Clutch
      
      Hello {{candidateName}},
      
      Thank you for your interest in the {{jobTitle}} position at Clutch and for taking the time to apply.
      
      After careful consideration, we have decided to move forward with other candidates for this position. This decision was not easy, as we were impressed by the quality of applications we received.
      
      We encourage you to continue following our career opportunities and to apply for other positions that match your skills and interests. We will keep your application on file and may contact you for future opportunities.
      
      Thank you again for your interest in Clutch, and we wish you the best in your career endeavors.
      
      Best regards,
      The Clutch HR Team
      Clutch - Building the Future of Automotive Technology
    `,
    variables: [
      { name: 'candidateName', description: 'Candidate full name', isRequired: true },
      { name: 'jobTitle', description: 'Job title', isRequired: true }
    ],
    settings: {
      isActive: true,
      isDefault: true,
      language: 'en',
      category: 'recruitment'
    }
  },
  {
    name: 'Approval Request Notification',
    type: 'approval_request',
    subject: 'Job Approval Required - {{jobTitle}}',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Approval Required</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .job-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Action Required</h1>
            <p>Job posting approval needed</p>
          </div>
          <div class="content">
            <h2>Hello {{approverName}},</h2>
            <p>A new job posting requires your approval before it can be published.</p>
            
            <div class="job-details">
              <h3>Job Details:</h3>
              <ul>
                <li><strong>Title:</strong> {{jobTitle}}</li>
                <li><strong>Department:</strong> {{department}}</li>
                <li><strong>Employment Type:</strong> {{employmentType}}</li>
                <li><strong>Experience Level:</strong> {{experienceLevel}}</li>
                <li><strong>Created By:</strong> {{createdBy}}</li>
                <li><strong>Created Date:</strong> {{createdDate}}</li>
              </ul>
            </div>
            
            <p>Please review the job posting and approve or reject it through the HR admin panel.</p>
            
            <a href="{{approvalLink}}" class="button">Review & Approve</a>
            
            <p><strong>Note:</strong> This approval is due by {{dueDate}}.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Clutch HR System</p>
              <p>Clutch - Building the Future of Automotive Technology</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Job Approval Required - {{jobTitle}}
      
      Hello {{approverName}},
      
      A new job posting requires your approval before it can be published.
      
      Job Details:
      - Title: {{jobTitle}}
      - Department: {{department}}
      - Employment Type: {{employmentType}}
      - Experience Level: {{experienceLevel}}
      - Created By: {{createdBy}}
      - Created Date: {{createdDate}}
      
      Please review the job posting and approve or reject it through the HR admin panel.
      
      Review & Approve: {{approvalLink}}
      
      Note: This approval is due by {{dueDate}}.
      
      Best regards,
      The Clutch HR System
      Clutch - Building the Future of Automotive Technology
    `,
    variables: [
      { name: 'approverName', description: 'Approver name', isRequired: true },
      { name: 'jobTitle', description: 'Job title', isRequired: true },
      { name: 'department', description: 'Department', isRequired: true },
      { name: 'employmentType', description: 'Employment type', isRequired: true },
      { name: 'experienceLevel', description: 'Experience level', isRequired: true },
      { name: 'createdBy', description: 'Creator name', isRequired: true },
      { name: 'createdDate', description: 'Creation date', isRequired: true },
      { name: 'approvalLink', description: 'Approval link', isRequired: true },
      { name: 'dueDate', description: 'Due date', isRequired: true }
    ],
    settings: {
      isActive: true,
      isDefault: true,
      language: 'en',
      category: 'approval'
    }
  }
];

// Populate email templates
const populateTemplates = async () => {
  try {
    console.log('Starting email template population...');
    
    // Clear existing templates
    await EmailTemplate.deleteMany({});
    console.log('Cleared existing email templates');
    
    // Insert default templates
    for (const template of defaultTemplates) {
      const emailTemplate = new EmailTemplate({
        ...template,
        metadata: {
          createdBy: new mongoose.Types.ObjectId(), // System user
          tags: ['default', 'system']
        }
      });
      
      await emailTemplate.save();
      console.log(`Created template: ${template.name}`);
    }
    
    console.log('Email template population completed successfully!');
    console.log(`Created ${defaultTemplates.length} email templates`);
    
  } catch (error) {
    console.error('Error populating email templates:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  populateTemplates();
});
