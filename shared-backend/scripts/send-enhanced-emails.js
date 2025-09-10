const nodemailer = require('nodemailer');

// Enhanced email templates for ziad@yourclutch.com
const ENHANCED_EMAILS = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to Clutch - Your Automotive Service Companion',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Clutch</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: #ED1B24; padding: 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; }
            .content { padding: 40px; }
            .welcome-text { font-size: 18px; color: #333; margin-bottom: 20px; }
            .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin: 10px 0; color: #555; }
            .cta-button { display: inline-block; background: #ED1B24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚗 CLUTCH</div>
            </div>
            <div class="content">
                <h1>Welcome to Clutch, Ziad!</h1>
                <p class="welcome-text">We're excited to have you join our community of car enthusiasts and service professionals.</p>
                
                <div class="features">
                    <h3>What you'll get with Clutch:</h3>
                    <div class="feature-item">✅ Professional automotive services</div>
                    <div class="feature-item">✅ Vehicle maintenance tracking</div>
                    <div class="feature-item">✅ Expert diagnostics and repairs</div>
                    <div class="feature-item">✅ Loyalty rewards program</div>
                </div>
                
                <p><strong>Your current loyalty points: 100</strong></p>
                
                <a href="https://clutch.com/services" class="cta-button">Explore Our Services</a>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Clutch Team</p>
            </div>
        </div>
    </body>
    </html>
    `
  },
  {
    name: 'Service Reminder',
    subject: 'Vehicle Maintenance Reminder - Clutch',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: #ED1B24; padding: 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; }
            .content { padding: 40px; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .vehicle-info { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #ED1B24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔧 CLUTCH</div>
            </div>
            <div class="content">
                <h1>Maintenance Reminder</h1>
                <div class="alert">
                    <h2>⚠️ Your vehicle is due for maintenance!</h2>
                </div>
                
                <div class="vehicle-info">
                    <h3>Vehicle Details:</h3>
                    <p><strong>Make:</strong> Toyota</p>
                    <p><strong>Model:</strong> Camry</p>
                    <p><strong>Year:</strong> 2020</p>
                    <p><strong>Current Mileage:</strong> 45,000</p>
                    <p><strong>Next Service:</strong> Oil Change</p>
                    <p><strong>Due Date:</strong> February 15, 2024</p>
                </div>
                
                <p>Don't let your vehicle fall behind on maintenance. Schedule your service today to keep your car running smoothly.</p>
                
                <a href="https://clutch.com/schedule" class="cta-button">Schedule Service</a>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Clutch Team</p>
            </div>
        </div>
    </body>
    </html>
    `
  },
  {
    name: 'Newsletter',
    subject: 'Clutch Newsletter - Latest Updates & Tips',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clutch Newsletter</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: #ED1B24; padding: 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; }
            .content { padding: 40px; }
            .article { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .cta-button { display: inline-block; background: #ED1B24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📰 CLUTCH</div>
            </div>
            <div class="content">
                <h1>Welcome to the latest Clutch Newsletter!</h1>
                <p>You've completed <strong>5 orders</strong> with us - thank you for your trust!</p>
                
                <div class="article">
                    <h3>❄️ Winter Car Care Tips</h3>
                    <p>Keep your vehicle running smoothly in cold weather with our expert tips and maintenance advice.</p>
                </div>
                
                <div class="article">
                    <h3>🎁 New Service Packages</h3>
                    <p>Exclusive deals on maintenance packages designed to keep your vehicle in top condition.</p>
                </div>
                
                <p>Stay updated with the latest automotive tips, service offers, and industry news.</p>
                
                <a href="https://clutch.com/blog" class="cta-button">Read More</a>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Clutch Team</p>
            </div>
        </div>
    </body>
    </html>
    `
  },
  {
    name: 'Promotional Offer',
    subject: 'Special Offer - 20% Off Your Next Service',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Special Offer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: #ED1B24; padding: 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; }
            .content { padding: 40px; }
            .offer { background: linear-gradient(135deg, #ED1B24, #ff6b6b); color: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .services { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #ED1B24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎁 CLUTCH</div>
            </div>
            <div class="content">
                <div class="offer">
                    <h1>🎉 WINTER SERVICE SPECIAL 🎉</h1>
                    <h2>Get 20% OFF your next service!</h2>
                    <p>Valid until: February 28, 2024</p>
                </div>
                
                <div class="services">
                    <h3>Services included:</h3>
                    <p>• Oil Change</p>
                    <p>• Brake Inspection</p>
                    <p>• Tire Rotation</p>
                </div>
                
                <p>Don't miss this limited-time offer to keep your vehicle in top condition this winter.</p>
                
                <a href="https://clutch.com/offers/winter-special" class="cta-button">Claim Offer</a>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Clutch Team</p>
            </div>
        </div>
    </body>
    </html>
    `
  },
  {
    name: 'Birthday Wish',
    subject: 'Happy Birthday from Clutch!',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Happy Birthday!</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #ED1B24, #ff6b6b); padding: 30px; text-align: center; }
            .logo { color: white; font-size: 32px; font-weight: bold; }
            .content { padding: 40px; text-align: center; }
            .birthday { font-size: 48px; margin: 20px 0; }
            .gift { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #ED1B24; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎂 CLUTCH</div>
            </div>
            <div class="content">
                <div class="birthday">🎂 HAPPY BIRTHDAY! 🎂</div>
                <h1>Happy Birthday, Ziad!</h1>
                <p>We hope your special day is filled with joy and celebration!</p>
                
                <div class="gift">
                    <h3>🎁 Birthday Gift</h3>
                    <p>As a birthday gift, enjoy <strong>15% off any service</strong> at Clutch.</p>
                    <p>This offer is valid until February 15, 2024.</p>
                </div>
                
                <p>Treat yourself and your vehicle to some well-deserved care!</p>
                
                <a href="https://clutch.com/offers/birthday" class="cta-button">Claim Birthday Offer</a>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Clutch Team</p>
            </div>
        </div>
    </body>
    </html>
    `
  }
];

async function sendEnhancedEmails() {
  console.log('🚀 Sending Enhanced Email Templates to ziad@yourclutch.com...');
  
  try {
    // Create transporter with working SMTP configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'YourClutchauto@gmail.com',
        pass: 'xoon gnlw qwpj cruo'
      }
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    const targetEmail = 'ziad@yourclutch.com';
    console.log(`📧 Sending enhanced emails to: ${targetEmail}`);
    
    // Send each enhanced email
    for (const email of ENHANCED_EMAILS) {
      try {
        console.log(`\n📤 Sending: ${email.name}`);
        
        const mailOptions = {
          from: '"Clutch Automotive" <YourClutchauto@gmail.com>',
          to: targetEmail,
          subject: email.subject,
          html: email.html
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ ${email.name} sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        
        // Wait 3 seconds between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Failed to send ${email.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Enhanced Email Sending Complete!');
    console.log('\n📋 Summary:');
    console.log(`- Target Email: ${targetEmail}`);
    console.log(`- Templates Sent: ${ENHANCED_EMAILS.length}`);
    console.log('- Email Types: Welcome, Service Reminder, Newsletter, Promotional Offer, Birthday Wish');
    console.log('\n📧 Check your email inbox for the enhanced Clutch emails!');
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

// Run the enhanced email sending
if (require.main === module) {
  sendEnhancedEmails();
}

module.exports = { sendEnhancedEmails, ENHANCED_EMAILS };
