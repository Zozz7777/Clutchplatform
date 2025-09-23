# Shared Backend - Complete System Documentation

## Overview
The Shared Backend is a comprehensive Node.js/Express.js API server that powers the entire Clutch platform. It provides RESTful APIs, real-time WebSocket communication, database management, authentication, and all business logic for the Clutch ecosystem.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [API Routes Documentation](#api-routes-documentation)
5. [Database Models](#database-models)
6. [Services Documentation](#services-documentation)
7. [Middleware Documentation](#middleware-documentation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Careers System](#careers-system)
10. [Real-time Features](#real-time-features)
11. [Email System](#email-system)
12. [Monitoring & Logging](#monitoring--logging)
13. [Deployment](#deployment)

## Architecture Overview

### Backend Architecture
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session and data caching
- **Real-time**: WebSocket for live updates
- **Authentication**: JWT-based with role-based access control
- **File Storage**: Local and cloud file storage
- **Email**: Nodemailer and SendGrid integration

### Key Features
- **RESTful APIs**: Comprehensive API endpoints
- **Real-time Communication**: WebSocket integration
- **Multi-tenant Support**: Organization-based data isolation
- **Role-based Access Control**: Granular permissions
- **File Upload/Download**: Secure file handling
- **Email Services**: Automated email notifications
- **Audit Logging**: Comprehensive audit trails
- **Performance Monitoring**: System health tracking

## Technology Stack

### Core Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Redis**: In-memory data store
- **JWT**: JSON Web Tokens for authentication
- **WebSocket**: Real-time communication

### External Services
- **SendGrid**: Email delivery service
- **Nodemailer**: Email sending library
- **Multer**: File upload handling
- **Winston**: Logging library
- **Agenda**: Job scheduling
- **Bull**: Redis-based job queue

### Development Tools
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Nodemon**: Development server
- **Swagger**: API documentation

## Project Structure

```
shared-backend/
├── config/                 # Configuration files
├── middleware/            # Express middleware
├── models/               # Mongoose models
├── routes/               # API route handlers
├── services/             # Business logic services
├── utils/                # Utility functions
├── scripts/              # Database scripts
├── tests/                # Test files
├── logs/                 # Log files
├── public/               # Static files
├── server.js             # Main server file
└── package.json          # Dependencies
```

## API Routes Documentation

### Authentication Routes (`/api/auth`)
- **POST /login**: User authentication
- **POST /register**: User registration
- **POST /logout**: User logout
- **POST /refresh**: Token refresh
- **POST /forgot-password**: Password reset request
- **POST /reset-password**: Password reset

### User Management Routes (`/api/users`)
- **GET /**: List all users
- **POST /**: Create new user
- **GET /:id**: Get user by ID
- **PUT /:id**: Update user
- **DELETE /:id**: Delete user
- **GET /:id/profile**: Get user profile
- **PUT /:id/profile**: Update user profile

### HR Routes (`/api/hr`)
- **GET /employees**: List employees
- **POST /employees**: Create employee
- **GET /employees/:id**: Get employee details
- **PUT /employees/:id**: Update employee
- **DELETE /employees/:id**: Delete employee
- **GET /departments**: List departments
- **POST /departments**: Create department

### Careers Routes (`/api/careers`)
- **GET /jobs**: List published jobs (public)
- **GET /jobs/:slug**: Get job details (public)
- **POST /jobs/:id/apply**: Submit job application (public)
- **GET /admin/jobs**: List all jobs (admin)
- **POST /admin/jobs**: Create job posting (admin)
- **PUT /admin/jobs/:id**: Update job posting (admin)
- **DELETE /admin/jobs/:id**: Delete job posting (admin)
- **GET /admin/applications**: List applications (admin)
- **PUT /admin/applications/:id/status**: Update application status (admin)

### Fleet Management Routes (`/api/fleet`)
- **GET /vehicles**: List vehicles
- **POST /vehicles**: Add vehicle
- **GET /vehicles/:id**: Get vehicle details
- **PUT /vehicles/:id**: Update vehicle
- **DELETE /vehicles/:id**: Delete vehicle
- **GET /maintenance**: List maintenance records
- **POST /maintenance**: Create maintenance record

### Finance Routes (`/api/finance`)
- **GET /transactions**: List transactions
- **POST /transactions**: Create transaction
- **GET /budgets**: List budgets
- **POST /budgets**: Create budget
- **GET /reports**: Generate financial reports

### Analytics Routes (`/api/analytics`)
- **GET /dashboard**: Dashboard metrics
- **GET /revenue**: Revenue analytics
- **GET /users**: User analytics
- **GET /performance**: Performance metrics

### System Routes (`/api/system`)
- **GET /health**: System health check
- **GET /status**: System status
- **GET /logs**: System logs
- **POST /backup**: Create system backup

## Database Models

### User Model (`models/User.js`)
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: String,
    address: Object
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Employee Model (`models/Employee.js`)
```javascript
{
  employeeId: String,
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: Object,
    dateOfBirth: Date,
    gender: String,
    nationality: String
  },
  employmentInfo: {
    position: String,
    department: String,
    manager: ObjectId,
    startDate: Date,
    employmentType: String,
    status: String
  },
  compensation: {
    salary: Number,
    currency: String,
    benefits: [String],
    bonuses: [Object]
  },
  performance: {
    reviews: [Object],
    ratings: [Object],
    goals: [Object]
  },
  documents: [Object],
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model (`models/Job.js`)
```javascript
{
  title: String,
  slug: String,
  department: String,
  locations: [Object],
  description: [String],
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  employmentType: String,
  experienceLevel: String,
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isNegotiable: Boolean
  },
  customApplicationQuestions: [Object],
  applicationDeadline: Date,
  expiryDate: Date,
  postedDate: Date,
  status: String,
  visibility: String,
  approvals: [Object],
  auditTrail: [Object],
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### JobApplication Model (`models/JobApplication.js`)
```javascript
{
  job: ObjectId,
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    portfolio: String
  },
  resume: {
    filename: String,
    path: String,
    size: Number,
    mimetype: String
  },
  coverLetter: {
    filename: String,
    path: String,
    size: Number,
    mimetype: String
  },
  customAnswers: [Object],
  status: String,
  score: Number,
  interviewDetails: Object,
  notes: [Object],
  consentGiven: Boolean,
  appliedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle Model (`models/Vehicle.js`)
```javascript
{
  vehicleId: String,
  make: String,
  model: String,
  year: Number,
  vin: String,
  licensePlate: String,
  color: String,
  type: String,
  fuelType: String,
  mileage: Number,
  status: String,
  location: Object,
  assignedDriver: ObjectId,
  maintenanceRecords: [Object],
  insurance: Object,
  registration: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Services Documentation

### Authentication Service (`services/authService.js`)
- **User Registration**: Create new user accounts
- **User Login**: Authenticate users
- **Token Management**: JWT token generation and validation
- **Password Management**: Password hashing and reset
- **Session Management**: User session handling

### Email Service (`services/emailService.js`)
- **Email Templates**: Predefined email templates
- **SMTP Configuration**: Email server setup
- **SendGrid Integration**: Cloud email delivery
- **Notification System**: Automated notifications
- **Email Tracking**: Delivery and open tracking

### File Service (`services/fileService.js`)
- **File Upload**: Secure file upload handling
- **File Storage**: Local and cloud storage
- **File Validation**: File type and size validation
- **File Security**: Virus scanning and security checks
- **File Cleanup**: Automatic file cleanup

### Notification Service (`services/notificationService.js`)
- **Real-time Notifications**: WebSocket notifications
- **Email Notifications**: Email-based notifications
- **Push Notifications**: Mobile push notifications
- **Notification Templates**: Reusable notification templates
- **Notification History**: Notification tracking

### Analytics Service (`services/analyticsService.js`)
- **Data Aggregation**: Collect and aggregate data
- **Metrics Calculation**: Calculate business metrics
- **Report Generation**: Generate analytical reports
- **Trend Analysis**: Identify trends and patterns
- **Performance Monitoring**: System performance tracking

## Middleware Documentation

### Authentication Middleware (`middleware/auth.js`)
- **Token Validation**: JWT token verification
- **User Authentication**: User identity verification
- **Session Management**: User session handling
- **Token Refresh**: Automatic token refresh

### Authorization Middleware (`middleware/authorization.js`)
- **Role-based Access**: Role-based permission checking
- **Permission Validation**: Feature-level permissions
- **Resource Access**: Resource-specific access control
- **Audit Logging**: Access attempt logging

### Validation Middleware (`middleware/validation.js`)
- **Input Validation**: Request data validation
- **Schema Validation**: Data schema validation
- **Sanitization**: Input sanitization
- **Error Handling**: Validation error handling

### Rate Limiting Middleware (`middleware/rateLimiting.js`)
- **API Rate Limiting**: Request rate limiting
- **User Rate Limiting**: Per-user rate limiting
- **IP Rate Limiting**: IP-based rate limiting
- **Burst Protection**: Burst request protection

### Logging Middleware (`middleware/logging.js`)
- **Request Logging**: HTTP request logging
- **Response Logging**: HTTP response logging
- **Error Logging**: Error and exception logging
- **Audit Logging**: User action logging

## Authentication & Authorization

### JWT Implementation
- **Token Structure**: Header, payload, signature
- **Token Expiration**: Configurable expiration times
- **Token Refresh**: Automatic token refresh mechanism
- **Token Revocation**: Token invalidation system

### Role-based Access Control (RBAC)
- **Roles**: Admin, Manager, Employee, Viewer
- **Permissions**: Feature-level permissions
- **Resource Access**: Resource-specific access control
- **Dynamic Permissions**: Runtime permission checking

### Permission Matrix
| Resource | Admin | Manager | Employee | Viewer |
|----------|-------|---------|----------|--------|
| Users | CRUD | R | R | R |
| Employees | CRUD | CRUD | R | R |
| Jobs | CRUD | CRUD | R | R |
| Applications | CRUD | CRUD | R | R |
| Fleet | CRUD | CRUD | R | R |
| Finance | CRUD | R | R | R |
| Analytics | CRUD | R | R | R |

## Careers System

### Job Posting Workflow
1. **Draft Creation**: Recruiter creates job posting
2. **Manager Approval**: Manager reviews and approves
3. **HR Admin Approval**: HR Admin gives final approval
4. **Publication**: Job goes live on website
5. **Application Processing**: Applications are received
6. **Candidate Management**: HR manages candidates

### Application Processing
- **Application Receipt**: Applications are received via API
- **Initial Screening**: Automatic screening based on criteria
- **Manual Review**: HR team reviews applications
- **Interview Scheduling**: Interview coordination
- **Decision Making**: Hire/reject decisions
- **Onboarding**: New employee onboarding

### Multi-level Approval System
- **Recruiter Level**: Create and manage job postings
- **Manager Level**: Approve job postings for department
- **HR Admin Level**: Final approval for publication
- **Audit Trail**: Complete approval history tracking

## Real-time Features

### WebSocket Implementation
- **Connection Management**: WebSocket connection handling
- **Room Management**: User room subscriptions
- **Message Broadcasting**: Real-time message delivery
- **Connection Recovery**: Automatic reconnection

### Real-time Updates
- **Dashboard Updates**: Live dashboard data
- **Notification Delivery**: Real-time notifications
- **Status Changes**: Live status updates
- **Collaboration**: Real-time collaboration features

## Email System

### Email Templates
- **Application Received**: Job application confirmation
- **Interview Invite**: Interview scheduling
- **Job Offer**: Job offer communication
- **Rejection**: Application rejection
- **Approval Request**: Job approval requests

### Email Configuration
- **SMTP Settings**: SMTP server configuration
- **SendGrid Integration**: Cloud email delivery
- **Template Management**: Email template system
- **Delivery Tracking**: Email delivery monitoring

## Monitoring & Logging

### System Monitoring
- **Health Checks**: System health monitoring
- **Performance Metrics**: Performance tracking
- **Error Tracking**: Error monitoring and alerting
- **Resource Usage**: CPU, memory, disk usage

### Logging System
- **Winston Logger**: Structured logging
- **Log Levels**: Debug, info, warn, error
- **Log Rotation**: Automatic log rotation
- **Log Aggregation**: Centralized log collection

### Audit Trail
- **User Actions**: User action logging
- **Data Changes**: Data modification tracking
- **Access Logs**: Access attempt logging
- **Security Events**: Security event logging

## Database Management

### MongoDB Configuration
- **Connection Pooling**: Database connection management
- **Indexing**: Database index optimization
- **Aggregation**: Data aggregation pipelines
- **Backup Strategy**: Database backup procedures

### Data Models
- **Schema Validation**: Data schema validation
- **Relationships**: Model relationships
- **Virtual Fields**: Computed fields
- **Middleware**: Pre/post save hooks

## Security

### Data Security
- **Encryption**: Data encryption at rest and in transit
- **Input Validation**: Comprehensive input validation
- **SQL Injection Prevention**: NoSQL injection prevention
- **XSS Protection**: Cross-site scripting protection

### API Security
- **HTTPS**: Secure communication
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Authentication**: Secure authentication

## Performance Optimization

### Caching Strategy
- **Redis Caching**: In-memory caching
- **Query Optimization**: Database query optimization
- **Response Caching**: API response caching
- **Session Caching**: User session caching

### Database Optimization
- **Indexing**: Strategic database indexing
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Efficient connection management
- **Data Pagination**: Efficient data pagination

## Testing

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API integration testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

### Test Coverage
- **Code Coverage**: Comprehensive code coverage
- **API Coverage**: All API endpoint testing
- **Error Scenarios**: Error handling testing
- **Security Testing**: Security vulnerability testing

## Deployment

### Environment Configuration
- **Development**: Local development setup
- **Staging**: Staging environment
- **Production**: Production deployment
- **Environment Variables**: Configuration management

### Docker Configuration
- **Containerization**: Docker container setup
- **Multi-stage Builds**: Optimized Docker builds
- **Health Checks**: Container health monitoring
- **Volume Management**: Data persistence

### CI/CD Pipeline
- **Automated Testing**: Continuous testing
- **Code Quality**: Code quality checks
- **Automated Deployment**: Automated deployment
- **Rollback Strategy**: Deployment rollback

## API Documentation

### Swagger Integration
- **API Documentation**: Comprehensive API docs
- **Interactive Testing**: API testing interface
- **Schema Validation**: Request/response schemas
- **Authentication**: API authentication docs

### Postman Collection
- **API Collection**: Complete API collection
- **Environment Variables**: Environment configuration
- **Test Scripts**: Automated API testing
- **Documentation**: API usage examples

## Troubleshooting

### Common Issues
1. **Database Connection**: MongoDB connection issues
2. **Authentication**: JWT token problems
3. **File Upload**: File upload failures
4. **Email Delivery**: Email sending issues

### Debug Tools
- **Logging**: Comprehensive logging system
- **Health Checks**: System health monitoring
- **Performance Monitoring**: Performance tracking
- **Error Tracking**: Error monitoring and alerting

## Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: JWT signing secret
- `SENDGRID_API_KEY`: SendGrid API key
- `NODE_ENV`: Environment (development/production)

### Feature Flags
- `ENABLE_CAREERS_SYSTEM`: Careers system toggle
- `ENABLE_REAL_TIME_UPDATES`: WebSocket updates
- `ENABLE_EMAIL_NOTIFICATIONS`: Email notifications
- `ENABLE_AUDIT_LOGGING`: Audit logging toggle

## Future Enhancements

### Planned Features
- **GraphQL API**: GraphQL endpoint
- **Microservices**: Service decomposition
- **Event Sourcing**: Event-driven architecture
- **Advanced Analytics**: Machine learning integration

### Technical Improvements
- **Performance Optimization**: Further performance improvements
- **Security Enhancements**: Advanced security features
- **Monitoring**: Enhanced monitoring and alerting
- **Scalability**: Horizontal scaling capabilities
