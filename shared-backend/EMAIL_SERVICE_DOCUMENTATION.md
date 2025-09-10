# Clutch Email Auto-Design & Sending Service

**Base URL:** `https://clutch-main-nk7x.onrender.com/api/v1/email-service`

## 🎨 Brand Configuration

The email service uses your Clutch brand colors and logo:

- **Primary Color:** `#ED1B24` (Red)
- **Secondary Color:** `#191919` (Black)
- **Accent Color:** `#227AFF` (Blue)
- **Text Color:** `#333333` (Dark Gray)
- **Light Gray:** `#F1F1F1`
- **White:** `#FFFFFF`
- **Logo:** `https://clutch.com/images/logo.png` (Replace with actual logo URL)

## 📧 Available Email Templates

### 1. Welcome Email
**Template Type:** `welcome`
**Subject:** "Welcome to Clutch - Your Automotive Service Companion"

**Data Parameters:**
```json
{
  "userName": "John Doe",
  "loginUrl": "https://clutch.com/login"
}
```

### 2. Password Reset
**Template Type:** `password-reset`
**Subject:** "Password Reset Request - Clutch"

**Data Parameters:**
```json
{
  "resetUrl": "https://clutch.com/reset-password?token=abc123"
}
```

### 3. Password Changed
**Template Type:** `password-changed`
**Subject:** "Password Changed Successfully - Clutch"

**Data Parameters:**
```json
{
  "loginUrl": "https://clutch.com/login"
}
```

### 4. Account Created
**Template Type:** `account-created`
**Subject:** "Account Created Successfully - Clutch"

**Data Parameters:**
```json
{
  "verificationUrl": "https://clutch.com/verify-email?token=abc123"
}
```

### 5. Email Verification
**Template Type:** `email-verification`
**Subject:** "Verify Your Email - Clutch"

**Data Parameters:**
```json
{
  "verificationUrl": "https://clutch.com/verify-email?token=abc123"
}
```

### 6. Trial Ended
**Template Type:** `trial-ended`
**Subject:** "Your Free Trial Has Ended - Clutch"

**Data Parameters:**
```json
{
  "trialDays": 30,
  "upgradeUrl": "https://clutch.com/upgrade"
}
```

### 7. User Invitation
**Template Type:** `user-invitation`
**Subject:** "You've Been Invited to Join Clutch"

**Data Parameters:**
```json
{
  "inviterName": "Jane Smith",
  "invitationUrl": "https://clutch.com/invite?code=abc123"
}
```

### 8. Order Confirmation
**Template Type:** `order-confirmation`
**Subject:** "Order Confirmation - Clutch"

**Data Parameters:**
```json
{
  "orderNumber": "ORD-12345",
  "total": "299.99",
  "orderUrl": "https://clutch.com/orders/12345",
  "items": [
    {
      "name": "Oil Change Service",
      "price": "49.99"
    },
    {
      "name": "Brake Pad Replacement",
      "price": "250.00"
    }
  ]
}
```

### 9. Maintenance Reminder
**Template Type:** `maintenance-reminder`
**Subject:** "Vehicle Maintenance Reminder - Clutch"

**Data Parameters:**
```json
{
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry 2020",
  "serviceType": "Oil Change",
  "recommendedDate": "2024-01-15",
  "scheduleUrl": "https://clutch.com/schedule"
}
```

### 10. Service Completed
**Template Type:** `service-completed`
**Subject:** "Service Completed - Clutch"

**Data Parameters:**
```json
{
  "vehicleMake": "Honda",
  "serviceType": "Brake Service",
  "serviceDate": "2024-01-10",
  "cost": "350.00",
  "receiptUrl": "https://clutch.com/receipts/12345"
}
```

### 11. Payment Received
**Template Type:** `payment-received`
**Subject:** "Payment Received - Clutch"

**Data Parameters:**
```json
{
  "amount": "299.99",
  "transactionId": "TXN-12345",
  "paymentDate": "2024-01-10",
  "receiptUrl": "https://clutch.com/receipts/12345"
}
```

### 12. Appointment Reminder
**Template Type:** `appointment-reminder`
**Subject:** "Appointment Reminder - Clutch"

**Data Parameters:**
```json
{
  "appointmentDate": "2024-01-15",
  "appointmentTime": "2:00 PM",
  "serviceType": "Oil Change",
  "appointmentUrl": "https://clutch.com/appointments/12345"
}
```

### 13. Newsletter
**Template Type:** `newsletter`
**Subject:** "Clutch Newsletter - Latest Updates"

**Data Parameters:**
```json
{
  "title": "January 2024 Newsletter",
  "summary": "Stay updated with the latest automotive news and tips.",
  "newsletterUrl": "https://clutch.com/newsletter/jan-2024",
  "articles": [
    {
      "title": "Winter Car Care Tips",
      "excerpt": "Learn how to keep your car running smoothly in cold weather.",
      "url": "https://clutch.com/articles/winter-care"
    },
    {
      "title": "New AI Features Released",
      "excerpt": "Discover our latest AI-powered maintenance predictions.",
      "url": "https://clutch.com/articles/ai-features"
    }
  ]
}
```

### 14. Promotional
**Template Type:** `promotional`
**Subject:** "Special Offer - Clutch"

**Data Parameters:**
```json
{
  "promotionTitle": "Spring Service Special",
  "headline": "Save Big on Spring Maintenance!",
  "description": "Get your car ready for spring with our special offers.",
  "discount": "25% OFF",
  "offerDetails": "On all maintenance services",
  "offerUrl": "https://clutch.com/offers/spring-special",
  "terms": "Valid until March 31, 2024. Cannot be combined with other offers."
}
```

## 🚀 API Endpoints

### Send Email
**POST** `/send`

**Request Body:**
```json
{
  "to": "user@example.com",
  "templateType": "welcome",
  "data": {
    "userName": "John Doe",
    "loginUrl": "https://clutch.com/login"
  },
  "subject": "Custom Subject (Optional)",
  "customTemplate": "Custom HTML (Optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailId": "507f1f77bcf86cd799439011",
    "message": "Email queued for sending"
  }
}
```

### Get Available Templates
**GET** `/templates`

**Response:**
```json
{
  "success": true,
  "data": {
    "welcome": {
      "subject": "Welcome to Clutch - Your Automotive Service Companion",
      "template": "welcome"
    },
    "passwordReset": {
      "subject": "Password Reset Request - Clutch",
      "template": "password-reset"
    }
    // ... all templates
  }
}
```

### Preview Email Template
**POST** `/preview`

**Request Body:**
```json
{
  "templateType": "welcome",
  "data": {
    "userName": "John Doe",
    "loginUrl": "https://clutch.com/login"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "templateType": "welcome",
    "data": { ... }
  }
}
```

### Get Email Status
**GET** `/status/:emailId`

**Response:**
```json
{
  "success": true,
  "data": {
    "emailId": "507f1f77bcf86cd799439011",
    "to": "user@example.com",
    "subject": "Welcome to Clutch",
    "templateType": "welcome",
    "status": "sent",
    "createdAt": "2024-01-10T10:00:00Z",
    "sentAt": "2024-01-10T10:01:00Z",
    "error": null
  }
}
```

### Get Email History
**GET** `/history?to=user@example.com&templateType=welcome&status=sent&limit=10`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "emailId": "507f1f77bcf86cd799439011",
      "to": "user@example.com",
      "subject": "Welcome to Clutch",
      "templateType": "welcome",
      "status": "sent",
      "createdAt": "2024-01-10T10:00:00Z",
      "sentAt": "2024-01-10T10:01:00Z",
      "error": null
    }
  ]
}
```

### Bulk Send Emails
**POST** `/bulk-send`

**Request Body:**
```json
{
  "emails": [
    {
      "to": "user1@example.com",
      "templateType": "welcome",
      "data": {
        "userName": "John Doe"
      }
    },
    {
      "to": "user2@example.com",
      "templateType": "newsletter",
      "data": {
        "title": "Monthly Newsletter"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "success": true,
        "data": {
          "emailId": "507f1f77bcf86cd799439011",
          "message": "Email queued for sending"
        }
      }
    ]
  }
}
```

## 📱 Mobile App Integration Examples

### React Native Example
```javascript
// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/email-service/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        templateType: 'welcome',
        data: {
          userName: userName,
          loginUrl: 'https://clutch.com/login'
        }
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('Welcome email sent:', result.data.emailId);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send maintenance reminder
const sendMaintenanceReminder = async (userEmail, vehicleData) => {
  try {
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/email-service/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        templateType: 'maintenance-reminder',
        data: {
          vehicleMake: vehicleData.make,
          vehicleModel: vehicleData.model,
          serviceType: vehicleData.serviceType,
          recommendedDate: vehicleData.recommendedDate,
          scheduleUrl: `https://clutch.com/schedule?vehicle=${vehicleData.id}`
        }
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('Maintenance reminder sent:', result.data.emailId);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
```

### Flutter Example
```dart
// Send order confirmation email
Future<void> sendOrderConfirmation(String userEmail, Order order) async {
  try {
    final response = await http.post(
      Uri.parse('https://clutch-main-nk7x.onrender.com/api/v1/email-service/send'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'to': userEmail,
        'templateType': 'order-confirmation',
        'data': {
          'orderNumber': order.orderNumber,
          'total': order.total.toString(),
          'orderUrl': 'https://clutch.com/orders/${order.id}',
          'items': order.items.map((item) => {
            'name': item.name,
            'price': item.price.toString(),
          }).toList(),
        }
      }),
    );

    final result = jsonDecode(response.body);
    if (result['success']) {
      print('Order confirmation sent: ${result['data']['emailId']}');
    }
  } catch (e) {
    print('Error sending email: $e');
  }
}
```

## 🔧 Email Service Integration

### Current Implementation
The email service currently simulates email sending and stores emails in the database. To integrate with a real email service:

1. **Replace the `simulateEmailSending` method** in `email-service.js`
2. **Integrate with services like:**
   - SendGrid
   - AWS SES
   - Mailgun
   - Nodemailer with SMTP

### Example SendGrid Integration
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In the simulateEmailSending method:
const msg = {
  to: email.to,
  from: 'noreply@clutch.com',
  subject: email.subject,
  html: email.htmlContent,
};

await sgMail.send(msg);
```

## 📊 Database Schema

### Emails Collection
```javascript
{
  _id: ObjectId,
  to: String,           // Recipient email
  subject: String,      // Email subject
  templateType: String, // Template type used
  data: Object,         // Template data
  htmlContent: String,  // Generated HTML
  status: String,       // pending, sent, failed
  createdAt: Date,      // Creation timestamp
  sentAt: Date,         // Sent timestamp
  error: String         // Error message if failed
}
```

## 🎯 Best Practices

1. **Always validate email addresses** before sending
2. **Use appropriate template types** for different scenarios
3. **Include relevant data** for personalized emails
4. **Handle errors gracefully** and log them
5. **Monitor email delivery status** for important notifications
6. **Respect user preferences** for email frequency
7. **Test templates** before sending to users

## 🔒 Security Considerations

1. **Validate all input data** before processing
2. **Sanitize HTML content** to prevent XSS attacks
3. **Rate limit email sending** to prevent abuse
4. **Log all email activities** for audit purposes
5. **Use HTTPS** for all API communications
6. **Implement authentication** for sensitive operations

## 📈 Monitoring & Analytics

The email service provides:
- Email delivery status tracking
- Template usage analytics
- Error logging and monitoring
- Performance metrics
- User engagement tracking

## 🚀 Deployment Notes

1. **Update logo URL** in `EMAIL_CONFIG.brand.logo`
2. **Configure email service** (SendGrid, AWS SES, etc.)
3. **Set environment variables** for API keys
4. **Test all templates** before production use
5. **Monitor email delivery rates** and bounce rates
6. **Implement email queue** for high-volume sending

---

**For support and questions, refer to the main API documentation or contact the development team.**
