const { getDb, getDatabaseStats } = require('../config/database');
const { ObjectId } = require('mongodb');

/**
 * Database Migration Script
 * Handles migration from current database structure to new infrastructure requirements
 */

class DatabaseMigration {
  constructor() {
    this.migrationLog = [];
    this.errors = [];
  }

  async runMigration() {
    console.log('🚀 Starting database migration...');
    
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }

      // Get current database stats
      const beforeStats = await getDatabaseStats();
      console.log('📊 Before migration stats:', beforeStats);

      // Run migration steps
      await this.migrateUsers();
      await this.migrateVehicles();
      await this.migrateBookings();
      await this.migratePayments();
      await this.createMissingCollections();
      await this.createIndexes();
      await this.validateMigration();

      // Get after migration stats
      const afterStats = await getDatabaseStats();
      console.log('📊 After migration stats:', afterStats);

      console.log('✅ Database migration completed successfully!');
      console.log('📝 Migration log:', this.migrationLog);
      
      if (this.errors.length > 0) {
        console.log('⚠️ Migration warnings:', this.errors);
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async migrateUsers() {
    console.log('🔄 Migrating users collection...');
    
    try {
      const db = await getDb();
      
      // Check if users collection exists and has data
      const usersCount = await db.collection('users').countDocuments();
      console.log(`Found ${usersCount} users to migrate`);
      
      if (usersCount > 0) {
        // Update user documents to match new schema
        const result = await db.collection('users').updateMany(
          {},
          {
            $set: {
              // Add missing fields with defaults
              userId: { $ifNull: ['$userId', { $concat: ['USER_', { $toString: '$_id' }] }] },
              isActive: { $ifNull: ['$isActive', true] },
              isVerified: { $ifNull: ['$isVerified', false] },
              verificationMethod: { $ifNull: ['$verificationMethod', 'email'] },
              loginCount: { $ifNull: ['$loginCount', 0] },
              lastLoginAt: { $ifNull: ['$lastLoginAt', null] },
              language: { $ifNull: ['$language', 'en'] },
              timezone: { $ifNull: ['$timezone', 'UTC'] },
              gender: { $ifNull: ['$gender', 'other'] },
              
              // Add preferences structure
              preferences: {
                notifications: {
                  push: { $ifNull: ['$preferences.notifications.push', true] },
                  email: { $ifNull: ['$preferences.notifications.email', true] },
                  sms: { $ifNull: ['$preferences.notifications.sms', false] }
                },
                privacy: {
                  shareData: { $ifNull: ['$preferences.privacy.shareData', false] },
                  marketingEmails: { $ifNull: ['$preferences.privacy.marketingEmails', true] }
                }
              },
              
              // Add security structure
              security: {
                passwordHash: { $ifNull: ['$security.passwordHash', '$passwordHash'] },
                salt: { $ifNull: ['$security.salt', '$salt'] },
                mfaEnabled: { $ifNull: ['$security.mfaEnabled', false] },
                mfaMethod: { $ifNull: ['$security.mfaMethod', 'sms'] },
                failedLoginAttempts: { $ifNull: ['$security.failedLoginAttempts', 0] },
                lockedUntil: { $ifNull: ['$security.lockedUntil', null] }
              }
            }
          }
        );
        
        this.migrationLog.push(`Updated ${result.modifiedCount} user documents`);
        console.log(`✅ Migrated ${result.modifiedCount} users`);
      }
      
    } catch (error) {
      this.errors.push(`User migration error: ${error.message}`);
      console.error('❌ User migration error:', error);
    }
  }

  async migrateVehicles() {
    console.log('🔄 Migrating vehicles collection...');
    
    try {
      const db = await getDb();
      
      // Check if vehicles collection exists
      const vehiclesCount = await db.collection('vehicles').countDocuments();
      console.log(`Found ${vehiclesCount} vehicles to migrate`);
      
      if (vehiclesCount > 0) {
        // Migrate vehicles to user_vehicles collection
        const vehicles = await db.collection('vehicles').find({}).toArray();
        
        for (const vehicle of vehicles) {
          try {
            // Create new user_vehicle document
            const userVehicleData = {
              userId: vehicle.userId || vehicle.user_id,
              vehicleId: vehicle.vehicleId || `VEH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              brandId: vehicle.brandId || vehicle.brand_id,
              modelId: vehicle.modelId || vehicle.model_id,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate || vehicle.license_plate,
              vin: vehicle.vin,
              color: vehicle.color,
              mileage: vehicle.mileage || 0,
              fuelType: vehicle.fuelType || vehicle.fuel_type || 'gasoline',
              transmissionType: vehicle.transmissionType || vehicle.transmission_type || 'automatic',
              engineSize: vehicle.engineSize || vehicle.engine_size,
              isPrimary: vehicle.isPrimary || vehicle.is_primary || false,
              isActive: vehicle.isActive !== undefined ? vehicle.isActive : true,
              createdAt: vehicle.createdAt || new Date(),
              updatedAt: vehicle.updatedAt || new Date(),
              
              // Vehicle Health
              health: {
                overallHealth: vehicle.health?.overallHealth || 100,
                lastHealthCheck: vehicle.health?.lastHealthCheck || new Date(),
                healthHistory: vehicle.health?.healthHistory || []
              }
            };
            
            // Insert into user_vehicles collection
            await db.collection('user_vehicles').insertOne(userVehicleData);
            
          } catch (error) {
            this.errors.push(`Vehicle migration error for vehicle ${vehicle._id}: ${error.message}`);
          }
        }
        
        this.migrationLog.push(`Migrated ${vehicles.length} vehicles to user_vehicles collection`);
        console.log(`✅ Migrated ${vehicles.length} vehicles`);
      }
      
    } catch (error) {
      this.errors.push(`Vehicle migration error: ${error.message}`);
      console.error('❌ Vehicle migration error:', error);
    }
  }

  async migrateBookings() {
    console.log('🔄 Migrating bookings collection...');
    
    try {
      const db = await getDb();
      
      // Check if bookings collection exists
      const bookingsCount = await db.collection('bookings').countDocuments();
      console.log(`Found ${bookingsCount} bookings to migrate`);
      
      if (bookingsCount > 0) {
        // Migrate bookings to service_bookings collection
        const bookings = await db.collection('bookings').find({}).toArray();
        
        for (const booking of bookings) {
          try {
            // Create new service_booking document
            const serviceBookingData = {
              bookingId: booking.bookingId || `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: booking.userId || booking.user_id,
              vehicleId: booking.vehicleId || booking.vehicle_id,
              serviceCenterId: booking.serviceCenterId || booking.mechanicId || booking.mechanic_id,
              bookingDate: booking.bookingDate || booking.createdAt || new Date(),
              appointmentDate: booking.appointmentDate || booking.scheduledDate,
              appointmentTime: booking.appointmentTime || '09:00',
              status: booking.status || 'pending',
              totalAmount: booking.totalAmount || booking.estimatedCost || booking.actualCost || 0,
              isActive: booking.isActive !== undefined ? booking.isActive : true,
              createdAt: booking.createdAt || new Date(),
              updatedAt: booking.updatedAt || new Date(),
              
              // Services array
              services: booking.services || [{
                serviceId: booking.serviceType ? new ObjectId() : null, // Placeholder
                quantity: 1,
                price: booking.estimatedCost || 0,
                totalPrice: booking.estimatedCost || 0
              }],
              
              // Quotation details
              quotation: {
                quotationId: null,
                quotationNumber: null,
                quotationDate: null,
                validUntil: null,
                status: 'pending',
                totalAmount: booking.estimatedCost || 0,
                services: []
              },
              
              // Payment details
              payment: {
                paymentId: null,
                paymentMethod: null,
                paymentStatus: 'pending',
                amount: 0,
                heldAmount: 0,
                releasedAmount: 0,
                transactionDate: null
              }
            };
            
            // Insert into service_bookings collection
            await db.collection('service_bookings').insertOne(serviceBookingData);
            
          } catch (error) {
            this.errors.push(`Booking migration error for booking ${booking._id}: ${error.message}`);
          }
        }
        
        this.migrationLog.push(`Migrated ${bookings.length} bookings to service_bookings collection`);
        console.log(`✅ Migrated ${bookings.length} bookings`);
      }
      
    } catch (error) {
      this.errors.push(`Booking migration error: ${error.message}`);
      console.error('❌ Booking migration error:', error);
    }
  }

  async migratePayments() {
    console.log('🔄 Migrating payments collection...');
    
    try {
      const db = await getDb();
      
      // Check if payments collection exists
      const paymentsCount = await db.collection('payments').countDocuments();
      console.log(`Found ${paymentsCount} payments to migrate`);
      
      if (paymentsCount > 0) {
        // Migrate payments to transactions collection
        const payments = await db.collection('payments').find({}).toArray();
        
        for (const payment of payments) {
          try {
            // Create new transaction document
            const transactionData = {
              transactionId: payment.transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: payment.userId || payment.user_id,
              transactionType: 'payment',
              amount: payment.amount || 0,
              currency: payment.currency || 'EGP',
              status: payment.status || 'pending',
              paymentMethod: payment.paymentMethod || payment.method || 'card',
              referenceId: payment.referenceId || payment.transactionId,
              description: payment.description || 'Service payment',
              isActive: payment.isActive !== undefined ? payment.isActive : true,
              createdAt: payment.createdAt || new Date(),
              updatedAt: payment.updatedAt || new Date(),
              
              // Related entities
              relatedEntities: {
                bookingId: payment.bookingId || payment.booking_id,
                orderId: payment.orderId || payment.order_id,
                partnerId: payment.partnerId || payment.partner_id
              },
              
              // Processing details
              processing: {
                gatewayResponse: payment.gatewayResponse || {},
                processingTime: payment.processingTime || 0,
                errorCode: payment.errorCode || null,
                errorMessage: payment.errorMessage || null
              }
            };
            
            // Insert into transactions collection
            await db.collection('transactions').insertOne(transactionData);
            
          } catch (error) {
            this.errors.push(`Payment migration error for payment ${payment._id}: ${error.message}`);
          }
        }
        
        this.migrationLog.push(`Migrated ${payments.length} payments to transactions collection`);
        console.log(`✅ Migrated ${payments.length} payments`);
      }
      
    } catch (error) {
      this.errors.push(`Payment migration error: ${error.message}`);
      console.error('❌ Payment migration error:', error);
    }
  }

  async createMissingCollections() {
    console.log('🔄 Creating missing collections...');
    
    try {
      const db = await getDb();
      
      const requiredCollections = [
        'car_brands', 'car_models', 'car_parts', 'user_vehicle_parts',
        'service_categories', 'service_types', 'service_centers',
        'partners', 'business_categories',
        'payment_methods', 'installment_providers',
        'user_analytics', 'service_analytics',
        'feature_flags', 'notification_templates', 'cities', 'areas',
        'obd_error_codes', 'obd_categories', 'vehicle_diagnostics'
      ];
      
      for (const collectionName of requiredCollections) {
        try {
          await db.createCollection(collectionName);
          this.migrationLog.push(`Created collection: ${collectionName}`);
          console.log(`✅ Created collection: ${collectionName}`);
        } catch (error) {
          if (error.code !== 48) { // Collection already exists
            this.errors.push(`Error creating collection ${collectionName}: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      this.errors.push(`Collection creation error: ${error.message}`);
      console.error('❌ Collection creation error:', error);
    }
  }

  async createIndexes() {
    console.log('🔄 Creating database indexes...');
    
    try {
      const db = await getDb();
      
      // Users collection indexes
      await db.collection('users').createIndex({ "email": 1 }, { unique: true });
      await db.collection('users').createIndex({ "phoneNumber": 1 }, { unique: true });
      await db.collection('users').createIndex({ "userId": 1 }, { unique: true });
      await db.collection('users').createIndex({ "isActive": 1 });
      await db.collection('users').createIndex({ "createdAt": -1 });

      // User vehicles indexes
      await db.collection('user_vehicles').createIndex({ "userId": 1 });
      await db.collection('user_vehicles').createIndex({ "vehicleId": 1 }, { unique: true });
      await db.collection('user_vehicles').createIndex({ "licensePlate": 1 });
      await db.collection('user_vehicles').createIndex({ "brandId": 1 });
      await db.collection('user_vehicles').createIndex({ "isActive": 1 });

      // Service bookings indexes
      await db.collection('service_bookings').createIndex({ "bookingId": 1 }, { unique: true });
      await db.collection('service_bookings').createIndex({ "userId": 1 });
      await db.collection('service_bookings').createIndex({ "serviceCenterId": 1 });
      await db.collection('service_bookings').createIndex({ "appointmentDate": 1 });
      await db.collection('service_bookings').createIndex({ "status": 1 });

      // Transactions indexes
      await db.collection('transactions').createIndex({ "transactionId": 1 }, { unique: true });
      await db.collection('transactions').createIndex({ "userId": 1 });
      await db.collection('transactions').createIndex({ "status": 1 });
      await db.collection('transactions').createIndex({ "createdAt": -1 });

      this.migrationLog.push('Created database indexes');
      console.log('✅ Created database indexes');
      
    } catch (error) {
      this.errors.push(`Index creation error: ${error.message}`);
      console.error('❌ Index creation error:', error);
    }
  }

  async validateMigration() {
    console.log('🔄 Validating migration...');
    
    try {
      const db = await getDb();
      
      // Check if required collections exist
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      const requiredCollections = [
        'users', 'user_vehicles', 'user_sessions',
        'car_brands', 'car_models', 'car_parts', 'user_vehicle_parts',
        'service_categories', 'service_types', 'service_centers', 'service_bookings',
        'partners', 'business_categories',
        'payment_methods', 'installment_providers', 'transactions',
        'user_analytics', 'service_analytics',
        'feature_flags', 'notification_templates', 'cities', 'areas',
        'obd_error_codes', 'obd_categories', 'vehicle_diagnostics'
      ];
      
      const missingCollections = requiredCollections.filter(col => !collectionNames.includes(col));
      
      if (missingCollections.length > 0) {
        this.errors.push(`Missing collections: ${missingCollections.join(', ')}`);
      } else {
        this.migrationLog.push('All required collections exist');
      }
      
      // Check data integrity
      const usersCount = await db.collection('users').countDocuments();
      const userVehiclesCount = await db.collection('user_vehicles').countDocuments();
      const serviceBookingsCount = await db.collection('service_bookings').countDocuments();
      const transactionsCount = await db.collection('transactions').countDocuments();
      
      this.migrationLog.push(`Validation results: ${usersCount} users, ${userVehiclesCount} user vehicles, ${serviceBookingsCount} service bookings, ${transactionsCount} transactions`);
      
      console.log('✅ Migration validation completed');
      
    } catch (error) {
      this.errors.push(`Validation error: ${error.message}`);
      console.error('❌ Validation error:', error);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new DatabaseMigration();
  migration.runMigration()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseMigration;
