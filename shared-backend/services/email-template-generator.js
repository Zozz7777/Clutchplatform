class EmailTemplateGenerator {
  constructor(config) {
    this.config = config;
  }

  // Generate HTML email template
  generateTemplate(templateType, data) {
    const template = this.getTemplateHTML(templateType, data);
    return this.wrapInEmailContainer(template);
  }

  // Wrap content in email container
  wrapInEmailContainer(content) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clutch</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Poppins', Arial, sans-serif;
            background-color: #333333;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${this.config.branding.white};
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid ${this.config.branding.lightGray};
          }
          .logo {
            height: 40px;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 20px;
          }
          .footer {
            padding: 20px;
            background-color: ${this.config.branding.lightGray};
            text-align: center;
            font-size: 12px;
            color: ${this.config.branding.textColor};
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${this.config.branding.primaryColor};
            color: ${this.config.branding.white};
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .btn-secondary {
            background-color: transparent;
            color: ${this.config.branding.primaryColor};
            border: 2px solid ${this.config.branding.primaryColor};
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .mb-20 { margin-bottom: 20px; }
          .mt-20 { margin-top: 20px; }
          .highlight {
            color: ${this.config.branding.primaryColor};
            font-weight: 600;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: ${this.config.branding.textColor};
            text-decoration: none;
          }
          .engagement-tracking {
            width: 1px;
            height: 1px;
            opacity: 0;
            position: absolute;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 4px;
            }
            .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  // Get specific template HTML
  getTemplateHTML(templateType, data) {
    switch (templateType) {
      case 'welcome':
        return this.getWelcomeTemplate(data);
      case 'password-reset':
        return this.getPasswordResetTemplate(data);
      case 'password-changed':
        return this.getPasswordChangedTemplate(data);
      case 'account-created':
        return this.getAccountCreatedTemplate(data);
      case 'email-verification':
        return this.getEmailVerificationTemplate(data);
      case 'trial-ended':
        return this.getTrialEndedTemplate(data);
      case 'user-invitation':
        return this.getUserInvitationTemplate(data);
      case 'order-confirmation':
        return this.getOrderConfirmationTemplate(data);
      case 'maintenance-reminder':
        return this.getMaintenanceReminderTemplate(data);
      case 'service-completed':
        return this.getServiceCompletedTemplate(data);
      case 'payment-received':
        return this.getPaymentReceivedTemplate(data);
      case 'appointment-reminder':
        return this.getAppointmentReminderTemplate(data);
      case 'newsletter':
        return this.getNewsletterTemplate(data);
      case 'promotional':
        return this.getPromotionalTemplate(data);
      case 'abandoned-cart':
        return this.getAbandonedCartTemplate(data);
      case 're-engagement':
        return this.getReEngagementTemplate(data);
      case 'birthday':
        return this.getBirthdayTemplate(data);
      case 'anniversary':
        return this.getAnniversaryTemplate(data);
      case 'seasonal':
        return this.getSeasonalTemplate(data);
      default:
        return this.getDefaultTemplate(data);
    }
  }

  // Welcome email template
  getWelcomeTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Welcome to Clutch!</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.firstName || data.userName || 'there'}!</h2>
        <p>A big welcome to the Clutch family! 🚗</p>
        <p>We're excited to have you on board and help you manage everything automotive from one spot.</p>
        <p>With Clutch, you can:</p>
        <ul>
          <li>Track your vehicle maintenance</li>
          <li>Schedule service appointments</li>
          <li>Get AI-powered recommendations</li>
          <li>Manage your automotive documents</li>
          <li>Earn loyalty rewards</li>
        </ul>
        <div class="text-center">
          <a href="${data.loginUrl || '#'}" class="btn">Sign in to your account</a>
        </div>
        <p class="mt-20">If you have any questions, don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The Clutch Team</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Password reset template
  getPasswordResetTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Password Reset</h1>
      </div>
      <div class="content">
        <h2>We received a request to reset your password</h2>
        <p>Use the link below to set up a new password for your account. If you did not request to reset your password, simply ignore this email.</p>
        <div class="text-center">
          <a href="${data.resetUrl || '#'}" class="btn">Set new password</a>
        </div>
        <p class="mt-20"><strong>Note:</strong> This link will expire in 24 hours for security reasons.</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Password changed template
  getPasswordChangedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Password Changed</h1>
      </div>
      <div class="content">
        <h2>Your password has been changed successfully</h2>
        <p>You have successfully changed your password on Clutch. Please keep it safe.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <div class="text-center">
          <a href="${data.loginUrl || '#'}" class="btn">Sign in to your account</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Account created template
  getAccountCreatedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Account Created</h1>
      </div>
      <div class="content">
        <h2>Welcome to Clutch!</h2>
        <p>Your account has been created successfully. You can now access all the features of Clutch.</p>
        <p>Here's what you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your vehicles</li>
          <li>Schedule your first service</li>
          <li>Explore our features</li>
        </ul>
        <div class="text-center">
          <a href="${data.verificationUrl || '#'}" class="btn">Verify your email</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Email verification template
  getEmailVerificationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Verify Your Email</h1>
      </div>
      <div class="content">
        <h2>One more thing to do!</h2>
        <p>Click on the button below to verify your email address and complete your account setup.</p>
        <div class="text-center">
          <a href="${data.verificationUrl || '#'}" class="btn">Verify your email</a>
        </div>
        <p class="mt-20">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: ${this.config.branding.primaryColor};">${data.verificationUrl || '#'}</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Trial ended template
  getTrialEndedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Trial Ended</h1>
      </div>
      <div class="content">
        <div class="text-center mb-20">
          <div style="background: ${this.config.branding.lightGray}; padding: 20px; border-radius: 8px; display: inline-block;">
            <h3 style="margin: 0; color: ${this.config.branding.primaryColor};">Day ${data.trialDays || 30}</h3>
          </div>
        </div>
        <h2>Your free trial has just ended 💧</h2>
        <p>The ${data.trialDays || 30}-day trial for your account has just ended, but all of your data is still safe.</p>
        <p>We know everyone gets busy, so if you've just forgotten to enter your billing information, you can still do it here:</p>
        <div class="text-center">
          <a href="${data.upgradeUrl || '#'}" class="btn">Continue the service</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // User invitation template
  getUserInvitationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">You're Invited!</h1>
      </div>
      <div class="content">
        <div class="text-center mb-20">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: ${this.config.branding.lightGray}; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">👤</span>
          </div>
        </div>
        <h2>${data.inviterName || 'Someone'} invited you</h2>
        <p>Your friend ${data.inviterName || 'someone'} just joined Clutch and thought you might like it too!</p>
        <div class="text-center">
          <a href="${data.invitationUrl || '#'}" class="btn">Check it out</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Order confirmation template
  getOrderConfirmationTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Order Confirmation</h1>
      </div>
      <div class="content">
        <h2>Thank you for your order!</h2>
        <p><strong>Order #:</strong> ${data.orderNumber || 'N/A'}</p>
        <p><strong>Total:</strong> $${data.total || '0.00'}</p>
        <div style="background: ${this.config.branding.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details:</h3>
          ${data.items ? data.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>${item.name}</span>
              <span>$${item.price}</span>
            </div>
          `).join('') : '<p>No items listed</p>'}
        </div>
        <div class="text-center">
          <a href="${data.orderUrl || '#'}" class="btn">View Order Details</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Maintenance reminder template
  getMaintenanceReminderTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Maintenance Reminder</h1>
      </div>
      <div class="content">
        <h2>Time for your vehicle maintenance!</h2>
        <p>Your ${data.vehicleMake || 'vehicle'} ${data.vehicleModel || ''} is due for maintenance.</p>
        <p><strong>Service Type:</strong> ${data.serviceType || 'Regular Maintenance'}</p>
        <p><strong>Recommended Date:</strong> ${data.recommendedDate || 'ASAP'}</p>
        <div class="text-center">
          <a href="${data.scheduleUrl || '#'}" class="btn">Schedule Service</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Service completed template
  getServiceCompletedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Service Completed</h1>
      </div>
      <div class="content">
        <h2>Your service has been completed!</h2>
        <p>Great news! The service on your ${data.vehicleMake || 'vehicle'} has been completed successfully.</p>
        <p><strong>Service Details:</strong></p>
        <ul>
          <li>Service Type: ${data.serviceType || 'N/A'}</li>
          <li>Date: ${data.serviceDate || 'N/A'}</li>
          <li>Cost: $${data.cost || '0.00'}</li>
        </ul>
        <div class="text-center">
          <a href="${data.receiptUrl || '#'}" class="btn">View Receipt</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Payment received template
  getPaymentReceivedTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Payment Received</h1>
      </div>
      <div class="content">
        <h2>Thank you for your payment!</h2>
        <p>We've received your payment of $${data.amount || '0.00'}.</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</p>
        <p><strong>Date:</strong> ${data.paymentDate || 'N/A'}</p>
        <div class="text-center">
          <a href="${data.receiptUrl || '#'}" class="btn">View Receipt</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Appointment reminder template
  getAppointmentReminderTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Appointment Reminder</h1>
      </div>
      <div class="content">
        <h2>Don't forget your appointment!</h2>
        <p>This is a friendly reminder about your upcoming appointment.</p>
        <p><strong>Date:</strong> ${data.appointmentDate || 'N/A'}</p>
        <p><strong>Time:</strong> ${data.appointmentTime || 'N/A'}</p>
        <p><strong>Service:</strong> ${data.serviceType || 'N/A'}</p>
        <div class="text-center">
          <a href="${data.appointmentUrl || '#'}" class="btn">View Appointment</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Newsletter template
  getNewsletterTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Clutch Newsletter</h1>
      </div>
      <div class="content">
        <h2>${data.title || 'Latest Updates from Clutch'}</h2>
        <p>${data.summary || 'Stay updated with the latest automotive news and tips.'}</p>
        ${data.articles ? data.articles.map(article => `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid ${this.config.branding.lightGray}; border-radius: 8px;">
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <a href="${article.url}" style="color: ${this.config.branding.primaryColor};">Read more</a>
          </div>
        `).join('') : ''}
        <div class="text-center">
          <a href="${data.newsletterUrl || '#'}" class="btn">Read Full Newsletter</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Promotional template
  getPromotionalTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">${data.promotionTitle || 'Special Offer'}</h1>
      </div>
      <div class="content">
        <h2>${data.headline || 'Limited Time Offer!'}</h2>
        <p>${data.description || 'Don\'t miss out on this amazing deal!'}</p>
        <div style="background: ${this.config.branding.primaryColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 24px;">${data.discount || '50% OFF'}</h3>
          <p style="margin: 10px 0 0 0;">${data.offerDetails || 'On selected services'}</p>
        </div>
        <div class="text-center">
          <a href="${data.offerUrl || '#'}" class="btn">Claim Offer</a>
        </div>
        <p class="mt-20"><small>${data.terms || 'Terms and conditions apply. Offer valid until specified date.'}</small></p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Abandoned cart template
  getAbandonedCartTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Complete Your Purchase</h1>
      </div>
      <div class="content">
        <h2>You left something in your cart!</h2>
        <p>We noticed you didn't complete your purchase. Don't let these great deals slip away!</p>
        <div style="background: ${this.config.branding.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Cart Items:</h3>
          ${data.items ? data.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>${item.name}</span>
              <span>$${item.price}</span>
            </div>
          `).join('') : '<p>No items in cart</p>'}
          <div style="border-top: 1px solid #ccc; margin-top: 15px; padding-top: 15px;">
            <strong>Total: $${data.total || '0.00'}</strong>
          </div>
        </div>
        <div class="text-center">
          <a href="${data.cartUrl || '#'}" class="btn">Complete Purchase</a>
        </div>
      </div>
      ${this.getFooter()}
    `;
  }

  // Re-engagement template
  getReEngagementTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">We Miss You!</h1>
      </div>
      <div class="content">
        <h2>It's been a while since we've seen you</h2>
        <p>We noticed you haven't been using Clutch lately. We'd love to have you back!</p>
        <p>Here's what you've been missing:</p>
        <ul>
          <li>New AI-powered maintenance recommendations</li>
          <li>Exclusive member discounts</li>
          <li>Enhanced vehicle tracking features</li>
          <li>24/7 customer support</li>
        </ul>
        <div class="text-center">
          <a href="${data.loginUrl || '#'}" class="btn">Come Back to Clutch</a>
        </div>
        <p class="mt-20">If you're having any issues, our support team is here to help!</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Birthday template
  getBirthdayTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Happy Birthday!</h1>
      </div>
      <div class="content">
        <div class="text-center mb-20">
          <div style="font-size: 48px; margin: 20px 0;">🎉</div>
        </div>
        <h2>Happy Birthday, ${data.firstName || 'there'}!</h2>
        <p>We hope your special day is filled with joy and celebration! 🎂</p>
        <p>As a birthday gift from us, enjoy a special discount on your next service:</p>
        <div style="background: ${this.config.branding.primaryColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 24px;">20% OFF</h3>
          <p style="margin: 10px 0 0 0;">On your next service appointment</p>
        </div>
        <div class="text-center">
          <a href="${data.bookingUrl || '#'}" class="btn">Book Your Service</a>
        </div>
        <p class="mt-20">Use code: <strong>BIRTHDAY20</strong> at checkout</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Anniversary template
  getAnniversaryTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Happy Anniversary!</h1>
      </div>
      <div class="content">
        <h2>Congratulations on ${data.anniversaryYears || 1} year with Clutch!</h2>
        <p>Thank you for being a loyal member of the Clutch family. We appreciate your trust in us!</p>
        <p>As a token of our appreciation, here's a special anniversary gift:</p>
        <div style="background: ${this.config.branding.primaryColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 24px;">Free Oil Change</h3>
          <p style="margin: 10px 0 0 0;">On your next visit</p>
        </div>
        <div class="text-center">
          <a href="${data.scheduleUrl || '#'}" class="btn">Schedule Your Service</a>
        </div>
        <p class="mt-20">Here's to many more years of great service together!</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Seasonal template
  getSeasonalTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">${data.season || 'Seasonal'} Service Reminder</h1>
      </div>
      <div class="content">
        <h2>Time for your ${data.season || 'seasonal'} vehicle checkup!</h2>
        <p>${data.season || 'This season'} brings unique challenges for your vehicle. Make sure it's ready!</p>
        <div style="background: ${this.config.branding.lightGray}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Recommended ${data.season || 'Seasonal'} Services:</h3>
          <ul>
            ${data.recommendedServices ? data.recommendedServices.map(service => 
              `<li>${service}</li>`
            ).join('') : '<li>Tire rotation and balance</li><li>Fluid level checks</li><li>Battery inspection</li>'}
          </ul>
        </div>
        <div class="text-center">
          <a href="${data.scheduleUrl || '#'}" class="btn">Schedule ${data.season || 'Seasonal'} Service</a>
        </div>
        <p class="mt-20">Stay safe on the roads this ${data.season || 'season'}!</p>
      </div>
      ${this.getFooter()}
    `;
  }

  // Default template
  getDefaultTemplate(data) {
    return `
      <div class="header">
        <img src="${this.config.branding.logo}" alt="Clutch" class="logo">
        <h1 style="color: ${this.config.branding.primaryColor}; margin: 0;">Clutch Notification</h1>
      </div>
      <div class="content">
        <h2>${data.subject || 'Important Update'}</h2>
        <p>${data.message || 'You have a new notification from Clutch.'}</p>
        ${data.actionUrl ? `
          <div class="text-center">
            <a href="${data.actionUrl}" class="btn">${data.actionText || 'Learn More'}</a>
          </div>
        ` : ''}
      </div>
      ${this.getFooter()}
    `;
  }

  // Common footer
  getFooter() {
    return `
      <div class="footer">
        <div class="social-links">
          <a href="#">Instagram</a>
          <a href="#">Twitter</a>
          <a href="#">Facebook</a>
        </div>
        <p>If you did not sign up for this account, you can ignore this email and the account will be deleted.</p>
        <p>© 2024 Clutch. All rights reserved. You received this email because you signed up for Clutch. To update your email preferences, <a href="#" style="color: ${this.config.branding.primaryColor};">click here</a>.</p>
        <p><a href="#" style="color: ${this.config.branding.primaryColor};">View this email in the browser</a></p>
        <img src="https://clutch.com/track/open" class="engagement-tracking" alt="" />
      </div>
    `;
  }
}

module.exports = { EmailTemplateGenerator };
