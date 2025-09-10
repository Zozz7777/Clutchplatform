# Clutch Platform Database Seeding Guide

## Overview

This guide provides comprehensive instructions for using the Clutch platform database seeding system. The seeding system is designed to populate all necessary databases with realistic data for the Egyptian automotive market, including OBD error codes, car brands, payment methods, and more.

## Quick Start

### 1. Prerequisites

Before running the seeding scripts, ensure you have:

- Node.js >= 18.0.0
- MongoDB Atlas connection
- Firebase project with Storage enabled
- Proper environment variables configured

### 2. Environment Setup

Create or update your `.env` file with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clutch
REDIS_URL=redis://localhost:6379

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-storage-bucket

# Seeding Configuration
SEEDING_ENVIRONMENT=development
SEEDING_BATCH_SIZE=100
SEEDING_DELAY_MS=100
ENABLE_LOGO_UPLOAD=true
VALIDATION_STRICT_MODE=false
CONTINUE_ON_ERROR=true
```

### 3. Install Dependencies

```bash
cd shared-backend
npm install
```

### 4. Run Seeding

#### Run All Seeders
```bash
npm run seed:all
```

#### Run Individual Seeders
```bash
# OBD Error Codes (CRITICAL)
npm run seed:obd-codes

# Vehicle Data (Brands & Models)
npm run seed:vehicles

# Location Data (Cities & Areas)
npm run seed:locations

# Payment Methods
npm run seed:payments

# Service Categories
npm run seed:services

# Business Categories
npm run seed:businesses

# Feature Flags
npm run seed:features

# Notification Templates
npm run seed:notifications
```

## Seeding Priority Order

The seeding system follows a specific priority order to handle dependencies:

1. **OBD Error Codes** (CRITICAL) - Foundation for AI error system
2. **Locations** (HIGH) - Cities and areas for service providers
3. **Payment Methods** (HIGH) - Payment options for transactions
4. **Vehicles** (HIGH) - Car brands and models with logos
5. **Services** (MEDIUM) - Service categories and types
6. **Businesses** (MEDIUM) - Business categories and types
7. **Features** (LOW) - Feature flags and configuration
8. **Notifications** (LOW) - Notification templates

## OBD Error Codes Seeding

### Overview
The OBD error codes database is the most critical component of the seeding system. It provides comprehensive diagnostic trouble codes for the AI error system.

### Features
- **Complete OBD-II Coverage**: P, C, B, and U codes
- **Comprehensive Data**: Symptoms, causes, troubleshooting steps
- **Safety Information**: Urgency levels, driving restrictions
- **Cost Estimates**: Repair costs in Egyptian Pounds (EGP)
- **DIY Guidance**: Difficulty levels and professional recommendations

### Data Structure
Each OBD code includes:
- Code and description
- Severity and urgency levels
- Possible causes and symptoms
- Recommended actions
- Troubleshooting steps
- Cost estimates
- Safety warnings
- DIY vs professional guidance

### Running OBD Seeding
```bash
npm run seed:obd-codes
```

### Validation
After seeding, validate the OBD codes:
```bash
# Check total codes
db.obdelements.countDocuments()

# Check critical codes
db.obdelements.countDocuments({
  $or: [
    { severity: 'CRITICAL' },
    { urgency_level: 'IMMEDIATE' },
    { requires_tow: true }
  ]
})

# Check manufacturer-specific codes
db.obdelements.countDocuments({ manufacturer_specific: true })
```

## Vehicle Data Seeding

### Overview
Vehicle seeding populates car brands and models with logos and specifications.

### Features
- **Popular Brands**: Toyota, Honda, Nissan, BMW, Mercedes, etc.
- **Logo Management**: Automatic logo download and upload to Firebase
- **Egyptian Market Focus**: Popular models in Egypt
- **Comprehensive Data**: Specifications, pricing, fuel types

### Logo Management
The system automatically:
1. Downloads logos from official sources
2. Processes and validates images
3. Uploads to Firebase Storage in multiple sizes
4. Generates fallback URLs for missing logos

### Running Vehicle Seeding
```bash
npm run seed:vehicles
```

### Logo Configuration
```bash
# Enable/disable logo upload
ENABLE_LOGO_UPLOAD=true

# Logo sizes to generate
LOGO_SIZES=32,64,128,256,512

# Maximum logo file size
MAX_LOGO_SIZE=5242880
```

## Payment Methods Seeding

### Overview
Payment methods seeding populates Egyptian payment options with logos and configuration.

### Egyptian Payment Methods
- **Cards**: Visa, MasterCard, American Express
- **Digital Wallets**: Vodafone Cash, Orange Money, Etisalat Wallet
- **Bank Transfers**: Direct bank transfer, Fawry, Aman
- **Cash Options**: Cash on delivery

### Running Payment Seeding
```bash
npm run seed:payments
```

## Location Data Seeding

### Overview
Location seeding populates Egyptian cities and areas with coordinates and postal codes.

### Egyptian Cities Coverage
- **Major Cities**: Cairo, Alexandria, Giza, Sharm El Sheikh, Hurghada
- **Governorate Capitals**: All 27 governorate capitals
- **Tourist Cities**: Luxor, Aswan, Dahab, El Gouna

### Running Location Seeding
```bash
npm run seed:locations
```

## Configuration Options

### Seeding Configuration
```bash
# Batch processing
SEEDING_BATCH_SIZE=100
SEEDING_DELAY_MS=100

# Error handling
CONTINUE_ON_ERROR=true
MAX_ERRORS=50

# Validation
VALIDATION_STRICT_MODE=false
MAX_VALIDATION_ERRORS=100

# Performance
SEEDING_MEMORY_LIMIT=1073741824
SEEDING_CPU_LIMIT=80
```

### Firebase Configuration
```bash
# Logo upload settings
ENABLE_LOGO_UPLOAD=true
LOGO_QUALITY=high
MAX_CONCURRENT_UPLOADS=5

# Storage settings
FIREBASE_STORAGE_BUCKET=your-bucket-name
MAX_LOGO_SIZE=5242880
```

### Testing Configuration
```bash
# Dry run mode
ENABLE_DRY_RUN=false
VALIDATE_ONLY=false
TEST_MODE=false
SAMPLE_DATA_ONLY=false
```

## Monitoring and Logging

### Log Files
Seeding logs are stored in:
```
logs/seeding-logs/
├── seeding.log
├── errors.log
└── seeding-report-{timestamp}.json
```

### Progress Tracking
The system provides real-time progress updates:
- Batch processing progress
- Individual item status
- Error reporting
- Performance metrics

### Health Checks
Before seeding, the system performs health checks:
- Database connectivity
- Firebase Storage access
- Logo manager initialization
- Configuration validation

## Error Handling

### Error Types
1. **Database Errors**: Connection issues, validation failures
2. **Firebase Errors**: Upload failures, authentication issues
3. **Logo Errors**: Download failures, processing errors
4. **Validation Errors**: Data format issues, missing required fields

### Error Recovery
- **Automatic Retries**: Configurable retry attempts
- **Continue on Error**: Option to continue despite failures
- **Error Logging**: Detailed error logs with timestamps
- **Partial Recovery**: Resume from last successful batch

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check MongoDB connection
npm run health:full

# Verify connection string
echo $MONGODB_URI
```

#### Firebase Authentication Issues
```bash
# Check Firebase credentials
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"
node -e "console.log(process.env.FIREBASE_CLIENT_EMAIL)"
```

#### Logo Upload Issues
```bash
# Disable logo upload for testing
ENABLE_LOGO_UPLOAD=false

# Check Firebase Storage permissions
# Ensure bucket is publicly accessible
```

## Performance Optimization

### Batch Processing
- Process data in configurable batch sizes
- Add delays between batches to prevent overload
- Monitor memory usage during large operations

### Database Optimization
- Create proper indexes for frequently queried fields
- Use database transactions for data consistency
- Monitor query performance during seeding

### Memory Management
- Configure memory limits for large datasets
- Clean up temporary files after processing
- Monitor memory usage during seeding

## Data Validation

### Validation Rules
- All required fields must be present
- Data types must match schema definitions
- Relationships between collections must be valid
- Logo URLs must be accessible
- OBD codes must be accurate and up-to-date

### Quality Checks
- Duplicate detection and prevention
- Data consistency across collections
- Performance optimization with proper indexing
- Error handling and logging

## Security Considerations

### Data Protection
- Secure handling of sensitive data
- Proper authentication for Firebase operations
- Database connection security
- Log file security and rotation

### Legal Compliance
- Proper licensing for logos and images
- Compliance with data protection regulations
- Respect for intellectual property rights
- Proper attribution for data sources

## Maintenance

### Regular Updates
- Update OBD codes with new automotive standards
- Refresh logo assets with updated brand guidelines
- Update location data with new areas and cities
- Maintain payment method information

### Backup and Recovery
- Regular backups of seeded data
- Version control for seeding scripts
- Recovery procedures for data corruption
- Testing procedures for seeding updates

## Troubleshooting

### Common Problems

#### Seeding Fails to Start
```bash
# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Check database connection
npm run health:full

# Check Firebase configuration
node -e "require('dotenv').config(); console.log(process.env.FIREBASE_PROJECT_ID)"
```

#### Logo Upload Failures
```bash
# Check Firebase credentials
# Verify storage bucket permissions
# Check network connectivity

# Disable logo upload temporarily
ENABLE_LOGO_UPLOAD=false
```

#### Memory Issues
```bash
# Reduce batch size
SEEDING_BATCH_SIZE=50

# Increase memory limit
SEEDING_MEMORY_LIMIT=2147483648

# Monitor memory usage
node --max-old-space-size=4096 scripts/seeding/scripts/seed-all.js
```

#### Performance Issues
```bash
# Increase delays between batches
SEEDING_DELAY_MS=200

# Reduce concurrent operations
MAX_CONCURRENT_UPLOADS=3

# Use smaller batch sizes
SEEDING_BATCH_SIZE=50
```

### Getting Help

1. **Check Logs**: Review seeding logs for detailed error information
2. **Validate Configuration**: Ensure all environment variables are set correctly
3. **Test Individual Components**: Run individual seeders to isolate issues
4. **Check Dependencies**: Verify database and Firebase connectivity
5. **Review Documentation**: Consult this guide and the README file

## Advanced Usage

### Custom Data Sources
To add custom data sources:

1. Create data files in the appropriate directory
2. Update the seeder to load custom data
3. Add validation for custom data formats
4. Test with sample data before production

### Extending Seeders
To extend existing seeders:

1. Follow the established pattern
2. Add proper error handling
3. Include validation and logging
4. Update the master seeder configuration

### Custom Validation
To add custom validation rules:

1. Update the data validation utilities
2. Add custom validation functions
3. Configure validation in the seeding config
4. Test validation with sample data

## Conclusion

The Clutch platform database seeding system provides a comprehensive solution for populating all necessary databases with realistic data for the Egyptian automotive market. By following this guide, you can successfully seed your database and ensure the platform has all the required data for a successful launch.

For additional support or questions, please refer to the project documentation or contact the development team.
