# 🚀 Clutch Email Marketing Service - Complete Documentation

**Base URL:** `https://clutch-main-nk7x.onrender.com/api/v1/email-marketing`

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup & Configuration](#setup--configuration)
4. [API Endpoints](#api-endpoints)
5. [Email Templates](#email-templates)
6. [Automation Workflows](#automation-workflows)
7. [Customer Segmentation](#customer-segmentation)
8. [Analytics & Reporting](#analytics--reporting)
9. [Integration Examples](#integration-examples)
10. [Best Practices](#best-practices)

## 🎯 Overview

The Clutch Email Marketing Service is a comprehensive email marketing, automation, and customer engagement platform built specifically for automotive businesses. It provides everything you need to create, manage, and optimize email campaigns with advanced automation workflows and detailed analytics.

### Key Capabilities:
- **Email Campaign Management** - Create, send, and track email campaigns
- **Customer Segmentation** - Advanced targeting based on behavior and demographics
- **Automation Workflows** - Trigger-based email sequences
- **Engagement Tracking** - Real-time analytics and performance metrics
- **Template System** - 20+ pre-built templates with Clutch branding
- **SMTP Integration** - Use your own email server

## ✨ Features

### 🎨 **Brand Integration**
- Clutch logo and branding throughout all templates
- Customizable color scheme (#ED1B24 primary red)
- Responsive design for all devices
- Professional automotive-focused content

### 📧 **Email Templates (20+ Types)**
- **Onboarding:** Welcome, Account Created, Email Verification
- **Security:** Password Reset, Password Changed
- **Service:** Maintenance Reminders, Service Completed, Appointment Reminders
- **E-commerce:** Order Confirmation, Abandoned Cart, Payment Received
- **Marketing:** Newsletter, Promotional, Re-engagement
- **Special:** Birthday, Anniversary, Seasonal, User Invitation
- **Billing:** Trial Ended

### 🤖 **Automation Workflows**
- Event-triggered automations
- Time-based sequences
- Segment-based targeting
- Multi-step workflows
- Conditional logic

### 👥 **Customer Segmentation**
- Behavioral segmentation
- Demographic targeting
- Engagement scoring
- Custom criteria
- Dynamic lists

### 📊 **Analytics & Reporting**
- Real-time campaign performance
- Subscriber engagement tracking
- A/B testing capabilities
- ROI measurement
- Detailed reporting

## ⚙️ Setup & Configuration

### Environment Variables

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@clutch.com

# Service Configuration
EMAIL_MARKETING_ENABLED=true
MAX_EMAILS_PER_HOUR=100
MAX_EMAILS_PER_DAY=1000
```

### Database Collections

The service automatically creates these MongoDB collections:
- `email_campaigns` - Campaign data and statistics
- `email_subscribers` - Subscriber information and preferences
- `email_automations` - Automation workflow definitions
- `email_engagement` - Engagement tracking data
- `email_segments` - Customer segment definitions
- `email_analytics` - Analytics and reporting data

## 🔌 API Endpoints

### Campaign Management

#### Create Campaign
```http
POST /api/v1/email-marketing/campaigns
```

**Request Body:**
```json
{
  "name": "Spring Service Special",
  "subject": "Save 25% on Spring Maintenance",
  "templateType": "promotional",
  "content": {
    "headline": "Spring Service Special",
    "description": "Get your car ready for spring with our special offers",
    "discount": "25% OFF",
    "offerDetails": "On all maintenance services",
    "offerUrl": "https://clutch.com/offers/spring-special"
  },
  "targetSegments": ["high-engagement", "service-customers"],
  "scheduledAt": "2024-03-15T10:00:00Z",
  "tags": ["promotional", "seasonal"]
}
```

#### Get All Campaigns
```http
GET /api/v1/email-marketing/campaigns
```

#### Send Campaign
```http
POST /api/v1/email-marketing/campaigns/{campaignId}/send
```

### Subscriber Management

#### Add Subscriber
```http
POST /api/v1/email-marketing/subscribers
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "segments": ["new-customers", "toyota-owners"],
  "tags": ["premium", "active"],
  "metadata": {
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry",
    "year": "2020"
  },
  "source": "website-signup"
}
```

#### Get Subscribers (with pagination)
```http
GET /api/v1/email-marketing/subscribers?page=1&limit=50&status=active&segment=high-engagement
```

#### Bulk Import Subscribers
```http
POST /api/v1/email-marketing/subscribers/bulk-import
```

**Request Body:**
```json
{
  "subscribers": [
    {
      "email": "user1@example.com",
      "firstName": "User",
      "lastName": "One"
    },
    {
      "email": "user2@example.com",
      "firstName": "User",
      "lastName": "Two"
    }
  ],
  "segments": ["imported", "website"]
}
```

### Automation Workflows

#### Create Automation
```http
POST /api/v1/email-marketing/automations
```

**Request Body:**
```json
{
  "name": "Welcome Series",
  "description": "3-email welcome sequence for new subscribers",
  "triggerType": "event",
  "triggerConditions": {
    "event": "subscriber_added",
    "segments": ["new-customers"]
  },
  "steps": [
    {
      "type": "send_email",
      "templateType": "welcome",
      "delay": 0
    },
    {
      "type": "wait",
      "duration": 86400000
    },
    {
      "type": "send_email",
      "templateType": "newsletter",
      "delay": 0
    },
    {
      "type": "wait",
      "duration": 172800000
    },
    {
      "type": "send_email",
      "templateType": "promotional",
      "delay": 0
    }
  ],
  "targetSegments": ["new-customers"],
  "status": "active"
}
```

#### Trigger Automation
```http
POST /api/v1/email-marketing/automations/{automationId}/trigger
```

### Customer Segmentation

#### Create Segment
```http
POST /api/v1/email-marketing/segments
```

**Request Body:**
```json
{
  "name": "High Engagement Customers",
  "description": "Customers with engagement score > 50",
  "criteria": [
    {
      "field": "engagementScore",
      "operator": "gte",
      "value": 50
    },
    {
      "field": "status",
      "operator": "eq",
      "value": "active"
    }
  ],
  "tags": ["high-value", "engaged"]
}
```

#### Get Segment Subscribers
```http
GET /api/v1/email-marketing/segments/{segmentId}/subscribers
```

### Analytics & Reporting

#### Campaign Analytics
```http
GET /api/v1/email-marketing/analytics/campaigns/{campaignId}?startDate=2024-01-01&endDate=2024-01-31
```

#### Subscriber Analytics
```http
GET /api/v1/email-marketing/analytics/subscribers/{subscriberId}
```

#### Track Engagement
```http
POST /api/v1/email-marketing/track
```

**Request Body:**
```json
{
  "subscriberId": "subscriber_id",
  "campaignId": "campaign_id",
  "eventType": "open",
  "eventData": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

### Utility Endpoints

#### Send Test Email
```http
POST /api/v1/email-marketing/test
```

**Request Body:**
```json
{
  "to": "test@example.com"
}
```

#### Preview Email Template
```http
POST /api/v1/email-marketing/preview
```

**Request Body:**
```json
{
  "templateType": "welcome",
  "data": {
    "firstName": "John",
    "loginUrl": "https://clutch.com/login"
  }
}
```

#### Get Available Templates
```http
GET /api/v1/email-marketing/templates
```

#### Service Status
```http
GET /api/v1/email-marketing/status
```

## 📧 Email Templates

### Template Categories

#### 1. **Onboarding Templates**
- `welcome` - Welcome new users
- `account-created` - Account creation confirmation
- `email-verification` - Email verification

#### 2. **Security Templates**
- `password-reset` - Password reset request
- `password-changed` - Password change confirmation

#### 3. **Service Templates**
- `maintenance-reminder` - Vehicle maintenance reminders
- `service-completed` - Service completion notification
- `appointment-reminder` - Appointment reminders

#### 4. **E-commerce Templates**
- `order-confirmation` - Order confirmation
- `abandoned-cart` - Abandoned cart recovery
- `payment-received` - Payment confirmation

#### 5. **Marketing Templates**
- `newsletter` - Newsletter content
- `promotional` - Special offers and deals
- `re-engagement` - Re-engagement campaigns

#### 6. **Special Templates**
- `birthday` - Birthday greetings with offers
- `anniversary` - Customer anniversary celebrations
- `seasonal` - Seasonal service reminders
- `user-invitation` - Referral invitations

#### 7. **Billing Templates**
- `trial-ended` - Trial expiration notifications

### Template Data Variables

Each template supports dynamic data insertion:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "serviceType": "Oil Change",
  "orderNumber": "ORD-12345",
  "total": "150.00",
  "discount": "25% OFF",
  "loginUrl": "https://clutch.com/login",
  "scheduleUrl": "https://clutch.com/schedule",
  "offerUrl": "https://clutch.com/offers"
}
```

## 🤖 Automation Workflows

### Automation Types

#### 1. **Event-Triggered Automations**
- New subscriber welcome series
- Service completion follow-ups
- Order confirmation sequences
- Birthday/anniversary campaigns

#### 2. **Time-Based Automations**
- Scheduled newsletters
- Seasonal service reminders
- Re-engagement campaigns
- Trial expiration sequences

#### 3. **Segment-Based Automations**
- High-value customer campaigns
- Inactive user re-engagement
- Geographic promotions
- Vehicle-specific offers

### Automation Steps

#### Available Step Types:
- `send_email` - Send an email
- `wait` - Delay before next step
- `update_subscriber` - Update subscriber data
- `add_to_segment` - Add subscriber to segment

#### Example Workflow:
```json
{
  "name": "Service Follow-up",
  "triggerType": "event",
  "triggerConditions": {
    "event": "service_completed"
  },
  "steps": [
    {
      "type": "send_email",
      "templateType": "service-completed",
      "delay": 0
    },
    {
      "type": "wait",
      "duration": 604800000
    },
    {
      "type": "send_email",
      "templateType": "maintenance-reminder",
      "delay": 0
    }
  ]
}
```

## 👥 Customer Segmentation

### Segmentation Criteria

#### Behavioral Criteria:
- Engagement score
- Email open rate
- Click-through rate
- Purchase history
- Service frequency

#### Demographic Criteria:
- Age range
- Location
- Vehicle type
- Service preferences
- Subscription status

#### Custom Criteria:
- Tags
- Segments
- Metadata fields
- Custom attributes

### Example Segments

#### High-Value Customers:
```json
{
  "name": "High-Value Customers",
  "criteria": [
    {
      "field": "engagementScore",
      "operator": "gte",
      "value": 75
    },
    {
      "field": "metadata.totalSpent",
      "operator": "gte",
      "value": 1000
    }
  ]
}
```

#### Inactive Users:
```json
{
  "name": "Inactive Users",
  "criteria": [
    {
      "field": "lastEngagement",
      "operator": "lt",
      "value": "2024-01-01"
    },
    {
      "field": "status",
      "operator": "eq",
      "value": "active"
    }
  ]
}
```

## 📊 Analytics & Reporting

### Campaign Metrics

#### Key Performance Indicators:
- **Open Rate** - Percentage of emails opened
- **Click Rate** - Percentage of clicks on links
- **Bounce Rate** - Percentage of failed deliveries
- **Unsubscribe Rate** - Percentage of unsubscribes
- **Conversion Rate** - Percentage of desired actions

#### Real-time Tracking:
- Email opens (via tracking pixel)
- Link clicks (via redirect tracking)
- Engagement scoring
- Geographic data
- Device information

### Subscriber Analytics

#### Engagement Scoring:
- **Open Score:** +5 points per open
- **Click Score:** +10 points per click
- **Delivery Score:** +1 point per delivery
- **Bounce Penalty:** -5 points per bounce
- **Unsubscribe Penalty:** -20 points per unsubscribe

#### Subscriber Insights:
- Engagement history
- Campaign performance
- Behavioral patterns
- Lifetime value
- Churn risk

## 🔗 Integration Examples

### React Native Integration

```javascript
// Send welcome email
const sendWelcomeEmail = async (userData) => {
  try {
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Welcome Campaign',
        subject: 'Welcome to Clutch!',
        templateType: 'welcome',
        content: {
          firstName: userData.firstName,
          loginUrl: 'https://clutch.com/login'
        },
        targetSegments: ['new-users']
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Add subscriber
const addSubscriber = async (subscriberData) => {
  try {
    const response = await fetch('https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: subscriberData.email,
        firstName: subscriberData.firstName,
        lastName: subscriberData.lastName,
        segments: ['mobile-app-users'],
        metadata: {
          vehicleMake: subscriberData.vehicleMake,
          vehicleModel: subscriberData.vehicleModel
        }
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding subscriber:', error);
  }
};
```

### Flutter Integration

```dart
// Send maintenance reminder
Future<void> sendMaintenanceReminder(String userEmail, VehicleData vehicle) async {
  try {
    final response = await http.post(
      Uri.parse('https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/campaigns'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: jsonEncode({
        'name': 'Maintenance Reminder',
        'subject': 'Time for your vehicle maintenance',
        'templateType': 'maintenance-reminder',
        'content': {
          'vehicleMake': vehicle.make,
          'vehicleModel': vehicle.model,
          'serviceType': vehicle.serviceType,
          'scheduleUrl': 'https://clutch.com/schedule'
        },
        'targetSegments': ['service-customers']
      }),
    );
    
    final result = jsonDecode(response.body);
    print('Campaign created: ${result['data']['campaignId']}');
  } catch (e) {
    print('Error sending maintenance reminder: $e');
  }
}

// Track email engagement
Future<void> trackEmailEngagement(String subscriberId, String campaignId, String eventType) async {
  try {
    await http.post(
      Uri.parse('https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/track'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: jsonEncode({
        'subscriberId': subscriberId,
        'campaignId': campaignId,
        'eventType': eventType,
        'eventData': {
          'timestamp': DateTime.now().toIso8601String(),
          'source': 'mobile-app'
        }
      }),
    );
  } catch (e) {
    print('Error tracking engagement: $e');
  }
}
```

### Web Integration

```javascript
// Create and send campaign
const createAndSendCampaign = async (campaignData) => {
  try {
    // Create campaign
    const createResponse = await fetch('/api/v1/email-marketing/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      // Send campaign
      const sendResponse = await fetch(`/api/v1/email-marketing/campaigns/${createResult.data.campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const sendResult = await sendResponse.json();
      return sendResult;
    }
  } catch (error) {
    console.error('Error creating and sending campaign:', error);
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (campaignId) => {
  try {
    const response = await fetch(`/api/v1/email-marketing/analytics/campaigns/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
  }
};
```

## 📈 Best Practices

### Email Marketing Best Practices

#### 1. **List Management**
- Always get explicit consent
- Provide clear unsubscribe options
- Regularly clean your list
- Segment your audience
- Respect frequency preferences

#### 2. **Content Strategy**
- Use compelling subject lines
- Keep content relevant and valuable
- Include clear call-to-actions
- Test different content formats
- Personalize when possible

#### 3. **Timing & Frequency**
- Send at optimal times for your audience
- Don't overwhelm subscribers
- Use automation for timely messages
- Test different send times
- Monitor engagement patterns

#### 4. **Compliance**
- Follow CAN-SPAM regulations
- Include physical address
- Honor unsubscribe requests
- Maintain accurate sender information
- Document consent

### Automation Best Practices

#### 1. **Workflow Design**
- Start with simple automations
- Test thoroughly before going live
- Monitor performance regularly
- Optimize based on results
- Keep workflows focused

#### 2. **Trigger Selection**
- Choose relevant triggers
- Avoid over-automation
- Consider user preferences
- Test trigger conditions
- Monitor trigger frequency

#### 3. **Content Personalization**
- Use dynamic content
- Segment your audience
- Test different messages
- Track performance
- Optimize continuously

### Analytics Best Practices

#### 1. **Key Metrics to Track**
- Open rates
- Click-through rates
- Conversion rates
- Bounce rates
- Unsubscribe rates

#### 2. **A/B Testing**
- Test subject lines
- Test send times
- Test content formats
- Test call-to-actions
- Test sender names

#### 3. **Performance Optimization**
- Monitor deliverability
- Track engagement trends
- Identify top performers
- Optimize underperformers
- Scale successful campaigns

## 🚀 Getting Started

### 1. **Setup Environment Variables**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SENDER_EMAIL=noreply@clutch.com
```

### 2. **Test Email Service**
```bash
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### 3. **Add Your First Subscriber**
```bash
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "segments": ["new-customers"]
  }'
```

### 4. **Create Your First Campaign**
```bash
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/email-marketing/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome Campaign",
    "subject": "Welcome to Clutch!",
    "templateType": "welcome",
    "content": {
      "firstName": "John",
      "loginUrl": "https://clutch.com/login"
    },
    "targetSegments": ["new-customers"]
  }'
```

## 📞 Support

For technical support or questions about the Email Marketing Service:

- **Documentation:** This file
- **API Status:** `/api/v1/email-marketing/status`
- **Test Endpoint:** `/api/v1/email-marketing/test`
- **Template Preview:** `/api/v1/email-marketing/preview`

---

**🎉 You're now ready to create powerful email marketing campaigns with Clutch!**
