# Clutch Platform Database Seeding System

## Overview
This directory contains comprehensive database seeding scripts for the Clutch automotive platform. The seeding system is designed to populate all necessary databases with realistic data for the Egyptian automotive market.

## Directory Structure
```
seeding/
├── README.md                           # This file
├── config/
│   ├── database-config.js             # Database connection configuration
│   ├── firebase-config.js             # Firebase configuration for logo storage
│   └── seeding-config.js              # Seeding configuration and settings
├── models/
│   ├── CarBrand.js                    # Car brand schema
│   ├── CarModel.js                    # Car model schema
│   ├── CarPart.js                     # Car part schema (enhanced)
│   ├── OBDElement.js                  # OBD error code schema
│   ├── OBDSeverity.js                 # OBD severity levels schema
│   ├── OBDSeverityLevel.js            # OBD severity levels schema
│   ├── ServiceCategory.js             # Service category schema
│   ├── ServiceType.js                 # Service type schema
│   ├── City.js                        # City schema
│   ├── Area.js                        # Area schema
│   ├── PaymentMethod.js               # Payment method schema
│   ├── InstallmentProvider.js         # Installment provider schema
│   ├── BusinessCategory.js            # Business category schema
│   ├── ServiceCenterType.js           # Service center type schema
│   ├── FeatureFlag.js                 # Feature flag schema
│   └── NotificationTemplate.js        # Notification template schema
├── data/
│   ├── car-brands/                    # Car brand data and logos
│   ├── car-models/                    # Car model data
│   ├── car-parts/                     # Car part data
│   ├── obd-codes/                     # OBD error code data
│   ├── services/                      # Service data
│   ├── locations/                     # Location data
│   ├── payments/                      # Payment method data
│   ├── businesses/                    # Business data
│   ├── features/                      # Feature flag data
│   └── notifications/                 # Notification template data
├── scripts/
│   ├── seed-all.js                    # Main seeding script
│   ├── seed-vehicles.js               # Vehicle-related seeding
│   ├── seed-obd-codes.js              # OBD codes seeding
│   ├── seed-services.js               # Service-related seeding
│   ├── seed-locations.js              # Location seeding
│   ├── seed-payments.js               # Payment method seeding
│   ├── seed-businesses.js             # Business seeding
│   ├── seed-features.js               # Feature flag seeding
│   └── seed-notifications.js          # Notification seeding
├── utils/
│   ├── logo-manager.js                # Logo upload and management
│   ├── data-validator.js              # Data validation utilities
│   ├── progress-tracker.js            # Seeding progress tracking
│   └── error-handler.js               # Error handling utilities
└── logs/
    └── seeding-logs/                  # Seeding execution logs
```

## Priority Order
1. **Week 1**: OBD Error Codes, Car Brands & Models (with logos), Cities & Areas, Payment Methods (with logos)
2. **Week 2**: Car Parts Database, Service Categories & Types, Feature Flags, Notification Templates
3. **Week 3**: Installment Providers (with logos), Service Center Types, Additional Car Parts, Advanced Templates

## Requirements

### Dependencies
- Node.js >= 18.0.0
- MongoDB Atlas connection
- Firebase project with Storage enabled
- Redis for caching (optional)

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clutch
REDIS_URL=redis://localhost:6379

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-storage-bucket

# Seeding Configuration
SEEDING_ENVIRONMENT=development
SEEDING_BATCH_SIZE=100
SEEDING_DELAY_MS=100
```

## Usage

### Quick Start
```bash
# Install dependencies
npm install

# Run all seeding scripts
npm run seed:all

# Run specific seeding categories
npm run seed:vehicles
npm run seed:obd-codes
npm run seed:services
npm run seed:locations
npm run seed:payments
npm run seed:businesses
npm run seed:features
npm run seed:notifications
```

### Individual Scripts
```bash
# Vehicle-related data
node scripts/seeding/scripts/seed-vehicles.js

# OBD error codes (CRITICAL)
node scripts/seeding/scripts/seed-obd-codes.js

# Services and categories
node scripts/seeding/scripts/seed-services.js

# Locations (cities and areas)
node scripts/seeding/scripts/seed-locations.js

# Payment methods with logos
node scripts/seeding/scripts/seed-payments.js

# Business categories and types
node scripts/seeding/scripts/seed-businesses.js

# Feature flags and configuration
node scripts/seeding/scripts/seed-features.js

# Notification templates
node scripts/seeding/scripts/seed-notifications.js
```

## Data Sources

### OBD Error Codes
- SAE J1979 OBD-II standard
- Official manufacturer service manuals
- Professional diagnostic tool databases
- Automotive repair databases
- Industry-standard OBD-II code libraries

### Car Brands and Logos
- Official brand websites
- Automotive industry databases
- Licensed logo repositories
- Brand style guides

### Egyptian Market Data
- Egyptian automotive market research
- Local service provider databases
- Egyptian cities and governorates
- Local payment methods and providers

## Logo Management

### Requirements
- **Format**: PNG with transparent background, SVG for scalability
- **Sizes**: 32x32, 64x64, 128x128, 256x256, 512x512 pixels
- **Quality**: High-resolution, professional quality
- **Storage**: Firebase Storage with organized folder structure
- **URL Structure**: `https://firebasestorage.googleapis.com/v0/b/clutch-app/o/{category}/{brand_name}/{size}.png`

### Logo Processing
1. Download official logos from brand websites
2. Process and resize logos to required dimensions
3. Upload to Firebase Storage with proper naming convention
4. Update database records with logo URLs
5. Include fallback logos for missing brands

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

## Performance Considerations

### Batch Processing
- Process data in configurable batch sizes
- Implement delays between batches to prevent overload
- Use database transactions for data consistency
- Monitor memory usage during large seeding operations

### Indexing Strategy
- Create indexes for frequently queried fields
- Optimize indexes for search operations
- Monitor query performance during seeding
- Update indexes after seeding completion

## Error Handling

### Common Issues
- Network connectivity problems
- Database connection timeouts
- Firebase upload failures
- Data validation errors
- Memory exhaustion during large operations

### Recovery Procedures
- Automatic retry mechanisms
- Partial seeding recovery
- Data integrity verification
- Rollback procedures for failed operations

## Monitoring and Logging

### Log Levels
- **INFO**: General seeding progress
- **WARN**: Non-critical issues
- **ERROR**: Critical failures
- **DEBUG**: Detailed debugging information

### Metrics
- Seeding progress percentage
- Records processed per second
- Error rates and types
- Memory and CPU usage
- Database performance metrics

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

## Support

For issues or questions regarding the seeding system:
1. Check the logs in `logs/seeding-logs/`
2. Review the error handling documentation
3. Consult the data validation rules
4. Contact the development team

## License

This seeding system is part of the Clutch platform and is licensed under the same terms as the main project.
