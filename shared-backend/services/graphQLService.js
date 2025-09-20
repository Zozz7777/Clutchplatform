const { logger } = require('../config/logger');
const { gql } = require('graphql-tag');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PubSub } = require('graphql-subscriptions');

/**
 * GraphQL Service
 * Provides type-safe APIs with real-time subscriptions
 */
class GraphQLService {
  constructor() {
    this.pubsub = new PubSub();
    this.schema = null;
    this.resolvers = new Map();
    this.subscriptions = new Map();
    this.initializeSchema();
  }

  /**
   * Initialize GraphQL schema
   */
  initializeSchema() {
    // Define base types
    const baseTypes = gql`
      scalar DateTime
      scalar JSON

      type Query {
        _: Boolean
      }

      type Mutation {
        _: Boolean
      }

      type Subscription {
        _: Boolean
      }

      type User {
        id: ID!
        email: String!
        firstName: String!
        lastName: String!
        phoneNumber: String
        userType: UserType!
        isActive: Boolean!
        createdAt: DateTime!
        updatedAt: DateTime!
        profile: UserProfile
        vehicles: [Vehicle!]
        bookings: [Booking!]
      }

      type UserProfile {
        id: ID!
        userId: ID!
        avatar: String
        preferences: JSON
        notificationSettings: NotificationSettings
        subscription: Subscription
      }

      type NotificationSettings {
        email: Boolean!
        push: Boolean!
        sms: Boolean!
        bookingUpdates: Boolean!
        promotions: Boolean!
        reminders: Boolean!
      }

      type Vehicle {
        id: ID!
        userId: ID!
        make: String!
        model: String!
        year: Int!
        vin: String
        licensePlate: String
        mileage: Int
        fuelType: FuelType
        transmission: TransmissionType
        color: String
        isActive: Boolean!
        createdAt: DateTime!
        updatedAt: DateTime!
        serviceHistory: [ServiceRecord!]
      }

      type ServiceRecord {
        id: ID!
        vehicleId: ID!
        serviceType: String!
        description: String
        cost: Float
        date: DateTime!
        mileage: Int
        mechanic: String
        notes: String
      }

      type Booking {
        id: ID!
        userId: ID!
        vehicleId: ID!
        serviceType: String!
        status: BookingStatus!
        scheduledDate: DateTime!
        estimatedDuration: Int
        totalCost: Float
        location: Location
        description: String
        createdAt: DateTime!
        updatedAt: DateTime!
        mechanic: Mechanic
        payments: [Payment!]
        updates: [BookingUpdate!]
      }

      type Mechanic {
        id: ID!
        userId: ID!
        specialization: [String!]
        rating: Float
        totalServices: Int
        isAvailable: Boolean!
        currentLocation: Location
        schedule: [TimeSlot!]
      }

      type Location {
        latitude: Float!
        longitude: Float!
        address: String
        city: String
        state: String
        zipCode: String
        country: String
      }

      type TimeSlot {
        id: ID!
        startTime: DateTime!
        endTime: DateTime!
        isAvailable: Boolean!
        bookingId: ID
      }

      type Payment {
        id: ID!
        bookingId: ID!
        amount: Float!
        currency: String!
        method: PaymentMethod!
        status: PaymentStatus!
        transactionId: String
        createdAt: DateTime!
        updatedAt: DateTime!
      }

      type BookingUpdate {
        id: ID!
        bookingId: ID!
        status: BookingStatus!
        message: String!
        timestamp: DateTime!
        type: UpdateType!
      }

      type Subscription {
        id: ID!
        userId: ID!
        planType: SubscriptionPlan!
        status: SubscriptionStatus!
        startDate: DateTime!
        endDate: DateTime
        autoRenew: Boolean!
        features: [String!]
        usage: UsageStats
      }

      type UsageStats {
        servicesUsed: Int!
        servicesLimit: Int!
        emergencyCallsUsed: Int!
        emergencyCallsLimit: Int!
        lastReset: DateTime!
      }

      type ServiceType {
        id: ID!
        name: String!
        description: String
        basePrice: Float!
        estimatedDuration: Int
        category: ServiceCategory!
        isActive: Boolean!
      }

      type Analytics {
        totalBookings: Int!
        totalRevenue: Float!
        averageRating: Float!
        customerSatisfaction: Float!
        popularServices: [ServiceStats!]
        revenueByMonth: [RevenueData!]
        bookingsByStatus: [BookingStats!]
      }

      type ServiceStats {
        serviceType: String!
        count: Int!
        revenue: Float!
        averageRating: Float!
      }

      type RevenueData {
        month: String!
        revenue: Float!
        bookings: Int!
      }

      type BookingStats {
        status: BookingStatus!
        count: Int!
        percentage: Float!
      }

      enum UserType {
        CUSTOMER
        MECHANIC
        ADMIN
        SUPER_ADMIN
      }

      enum FuelType {
        GASOLINE
        DIESEL
        ELECTRIC
        HYBRID
        PLUGIN_HYBRID
      }

      enum TransmissionType {
        MANUAL
        AUTOMATIC
        CVT
        SEMI_AUTOMATIC
      }

      enum BookingStatus {
        PENDING
        CONFIRMED
        IN_PROGRESS
        COMPLETED
        CANCELLED
        NO_SHOW
      }

      enum PaymentMethod {
        CREDIT_CARD
        DEBIT_CARD
        PAYPAL
        APPLE_PAY
        GOOGLE_PAY
        CASH
        BANK_TRANSFER
      }

      enum PaymentStatus {
        PENDING
        PROCESSING
        COMPLETED
        FAILED
        REFUNDED
        CANCELLED
      }

      enum UpdateType {
        STATUS_CHANGE
        MESSAGE
        PAYMENT
        SCHEDULE
        MECHANIC_ASSIGNED
      }

      enum SubscriptionPlan {
        BASIC
        PREMIUM
        ENTERPRISE
      }

      enum SubscriptionStatus {
        ACTIVE
        INACTIVE
        CANCELLED
        EXPIRED
        TRIAL
      }

      enum ServiceCategory {
        MAINTENANCE
        REPAIR
        DIAGNOSTIC
        EMERGENCY
        INSPECTION
        CLEANING
      }

      input UserInput {
        email: String!
        firstName: String!
        lastName: String!
        phoneNumber: String
        password: String!
        userType: UserType!
      }

      input VehicleInput {
        make: String!
        model: String!
        year: Int!
        vin: String
        licensePlate: String
        mileage: Int
        fuelType: FuelType
        transmission: TransmissionType
        color: String
      }

      input BookingInput {
        vehicleId: ID!
        serviceType: String!
        scheduledDate: DateTime!
        description: String
        location: LocationInput
      }

      input LocationInput {
        latitude: Float!
        longitude: Float!
        address: String
        city: String
        state: String
        zipCode: String
        country: String
      }

      input PaymentInput {
        bookingId: ID!
        amount: Float!
        method: PaymentMethod!
        currency: String = "EGP"
      }
    `;

    // Define queries
    const queries = gql`
      extend type Query {
        # User queries
        user(id: ID!): User
        users(filter: UserFilter): [User!]!
        currentUser: User
        
        # Vehicle queries
        vehicle(id: ID!): Vehicle
        userVehicles(userId: ID!): [Vehicle!]!
        
        # Booking queries
        booking(id: ID!): Booking
        userBookings(userId: ID!, status: BookingStatus): [Booking!]!
        mechanicBookings(mechanicId: ID!, status: BookingStatus): [Booking!]!
        
        # Service queries
        serviceTypes(category: ServiceCategory): [ServiceType!]!
        serviceType(id: ID!): ServiceType
        
        # Payment queries
        payment(id: ID!): Payment
        bookingPayments(bookingId: ID!): [Payment!]!
        
        # Subscription queries
        subscription(id: ID!): Subscription
        userSubscription(userId: ID!): Subscription
        
        # Analytics queries
        analytics(timeframe: String, filters: JSON): Analytics!
        
        # Search queries
        searchMechanics(location: LocationInput, specialization: [String!]): [Mechanic!]!
        searchServices(query: String!): [ServiceType!]!
      }

      input UserFilter {
        userType: UserType
        isActive: Boolean
        search: String
        limit: Int
        offset: Int
      }
    `;

    // Define mutations
    const mutations = gql`
      extend type Mutation {
        # User mutations
        createUser(input: UserInput!): User!
        updateUser(id: ID!, input: UserInput!): User!
        deleteUser(id: ID!): Boolean!
        login(email: String!, password: String!): AuthResponse!
        logout: Boolean!
        
        # Vehicle mutations
        createVehicle(userId: ID!, input: VehicleInput!): Vehicle!
        updateVehicle(id: ID!, input: VehicleInput!): Vehicle!
        deleteVehicle(id: ID!): Boolean!
        
        # Booking mutations
        createBooking(userId: ID!, input: BookingInput!): Booking!
        updateBooking(id: ID!, input: BookingInput!): Booking!
        cancelBooking(id: ID!): Booking!
        assignMechanic(bookingId: ID!, mechanicId: ID!): Booking!
        
        # Payment mutations
        createPayment(input: PaymentInput!): Payment!
        processPayment(paymentId: ID!): Payment!
        refundPayment(paymentId: ID!, amount: Float): Payment!
        
        # Subscription mutations
        createSubscription(userId: ID!, planType: SubscriptionPlan!): Subscription!
        updateSubscription(id: ID!, planType: SubscriptionPlan): Subscription!
        cancelSubscription(id: ID!): Subscription!
        
        # Service mutations
        createServiceType(input: ServiceTypeInput!): ServiceType!
        updateServiceType(id: ID!, input: ServiceTypeInput!): ServiceType!
        deleteServiceType(id: ID!): Boolean!
      }

      type AuthResponse {
        user: User!
        token: String!
        refreshToken: String!
      }

      input ServiceTypeInput {
        name: String!
        description: String
        basePrice: Float!
        estimatedDuration: Int
        category: ServiceCategory!
      }
    `;

    // Define subscriptions
    const subscriptions = gql`
      extend type Subscription {
        # Real-time updates
        bookingUpdated(bookingId: ID!): BookingUpdate!
        userBookingsUpdated(userId: ID!): [Booking!]!
        mechanicBookingsUpdated(mechanicId: ID!): [Booking!]!
        
        # Payment updates
        paymentProcessed(bookingId: ID!): Payment!
        
        # System updates
        systemNotification(userId: ID!): SystemNotification!
        analyticsUpdated: Analytics!
      }

      type SystemNotification {
        id: ID!
        type: NotificationType!
        title: String!
        message: String!
        data: JSON
        timestamp: DateTime!
        read: Boolean!
      }

      enum NotificationType {
        INFO
        WARNING
        ERROR
        SUCCESS
        BOOKING_UPDATE
        PAYMENT_UPDATE
        SYSTEM_MAINTENANCE
      }
    `;

    // Combine all type definitions
    const typeDefs = [baseTypes, queries, mutations, subscriptions];
    
    // Create resolvers
    const resolvers = this.createResolvers();
    
    // Create executable schema
    this.schema = makeExecutableSchema({
      typeDefs,
      resolvers
    });

    logger.info('GraphQL schema initialized');
  }

  /**
   * Create resolvers for all operations
   */
  createResolvers() {
    return {
      Query: {
        // User queries
        user: async (_, { id }, context) => {
          return await this.resolveUser(id, context);
        },
        users: async (_, { filter }, context) => {
          return await this.resolveUsers(filter, context);
        },
        currentUser: async (_, __, context) => {
          return await this.resolveCurrentUser(context);
        },

        // Vehicle queries
        vehicle: async (_, { id }, context) => {
          return await this.resolveVehicle(id, context);
        },
        userVehicles: async (_, { userId }, context) => {
          return await this.resolveUserVehicles(userId, context);
        },

        // Booking queries
        booking: async (_, { id }, context) => {
          return await this.resolveBooking(id, context);
        },
        userBookings: async (_, { userId, status }, context) => {
          return await this.resolveUserBookings(userId, status, context);
        },
        mechanicBookings: async (_, { mechanicId, status }, context) => {
          return await this.resolveMechanicBookings(mechanicId, status, context);
        },

        // Service queries
        serviceTypes: async (_, { category }, context) => {
          return await this.resolveServiceTypes(category, context);
        },
        serviceType: async (_, { id }, context) => {
          return await this.resolveServiceType(id, context);
        },

        // Payment queries
        payment: async (_, { id }, context) => {
          return await this.resolvePayment(id, context);
        },
        bookingPayments: async (_, { bookingId }, context) => {
          return await this.resolveBookingPayments(bookingId, context);
        },

        // Subscription queries
        subscription: async (_, { id }, context) => {
          return await this.resolveSubscription(id, context);
        },
        userSubscription: async (_, { userId }, context) => {
          return await this.resolveUserSubscription(userId, context);
        },

        // Analytics queries
        analytics: async (_, { timeframe, filters }, context) => {
          return await this.resolveAnalytics(timeframe, filters, context);
        },

        // Search queries
        searchMechanics: async (_, { location, specialization }, context) => {
          return await this.resolveSearchMechanics(location, specialization, context);
        },
        searchServices: async (_, { query }, context) => {
          return await this.resolveSearchServices(query, context);
        }
      },

      Mutation: {
        // User mutations
        createUser: async (_, { input }, context) => {
          return await this.mutateCreateUser(input, context);
        },
        updateUser: async (_, { id, input }, context) => {
          return await this.mutateUpdateUser(id, input, context);
        },
        deleteUser: async (_, { id }, context) => {
          return await this.mutateDeleteUser(id, context);
        },
        login: async (_, { email, password }, context) => {
          return await this.mutateLogin(email, password, context);
        },
        logout: async (_, __, context) => {
          return await this.mutateLogout(context);
        },

        // Vehicle mutations
        createVehicle: async (_, { userId, input }, context) => {
          return await this.mutateCreateVehicle(userId, input, context);
        },
        updateVehicle: async (_, { id, input }, context) => {
          return await this.mutateUpdateVehicle(id, input, context);
        },
        deleteVehicle: async (_, { id }, context) => {
          return await this.mutateDeleteVehicle(id, context);
        },

        // Booking mutations
        createBooking: async (_, { userId, input }, context) => {
          return await this.mutateCreateBooking(userId, input, context);
        },
        updateBooking: async (_, { id, input }, context) => {
          return await this.mutateUpdateBooking(id, input, context);
        },
        cancelBooking: async (_, { id }, context) => {
          return await this.mutateCancelBooking(id, context);
        },
        assignMechanic: async (_, { bookingId, mechanicId }, context) => {
          return await this.mutateAssignMechanic(bookingId, mechanicId, context);
        },

        // Payment mutations
        createPayment: async (_, { input }, context) => {
          return await this.mutateCreatePayment(input, context);
        },
        processPayment: async (_, { paymentId }, context) => {
          return await this.mutateProcessPayment(paymentId, context);
        },
        refundPayment: async (_, { paymentId, amount }, context) => {
          return await this.mutateRefundPayment(paymentId, amount, context);
        },

        // Subscription mutations
        createSubscription: async (_, { userId, planType }, context) => {
          return await this.mutateCreateSubscription(userId, planType, context);
        },
        updateSubscription: async (_, { id, planType }, context) => {
          return await this.mutateUpdateSubscription(id, planType, context);
        },
        cancelSubscription: async (_, { id }, context) => {
          return await this.mutateCancelSubscription(id, context);
        },

        // Service mutations
        createServiceType: async (_, { input }, context) => {
          return await this.mutateCreateServiceType(input, context);
        },
        updateServiceType: async (_, { id, input }, context) => {
          return await this.mutateUpdateServiceType(id, input, context);
        },
        deleteServiceType: async (_, { id }, context) => {
          return await this.mutateDeleteServiceType(id, context);
        }
      },

      Subscription: {
        // Real-time subscriptions
        bookingUpdated: {
          subscribe: (_, { bookingId }) => {
            return this.pubsub.asyncIterator([`BOOKING_UPDATED_${bookingId}`]);
          }
        },
        userBookingsUpdated: {
          subscribe: (_, { userId }) => {
            return this.pubsub.asyncIterator([`USER_BOOKINGS_UPDATED_${userId}`]);
          }
        },
        mechanicBookingsUpdated: {
          subscribe: (_, { mechanicId }) => {
            return this.pubsub.asyncIterator([`MECHANIC_BOOKINGS_UPDATED_${mechanicId}`]);
          }
        },
        paymentProcessed: {
          subscribe: (_, { bookingId }) => {
            return this.pubsub.asyncIterator([`PAYMENT_PROCESSED_${bookingId}`]);
          }
        },
        systemNotification: {
          subscribe: (_, { userId }) => {
            return this.pubsub.asyncIterator([`SYSTEM_NOTIFICATION_${userId}`]);
          }
        },
        analyticsUpdated: {
          subscribe: () => {
            return this.pubsub.asyncIterator(['ANALYTICS_UPDATED']);
          }
        }
      },

      // Field resolvers
      User: {
        profile: async (parent, _, context) => {
          return await this.resolveUserProfile(parent.id, context);
        },
        vehicles: async (parent, _, context) => {
          return await this.resolveUserVehicles(parent.id, context);
        },
        bookings: async (parent, _, context) => {
          return await this.resolveUserBookings(parent.id, null, context);
        }
      },

      Booking: {
        mechanic: async (parent, _, context) => {
          return await this.resolveBookingMechanic(parent.id, context);
        },
        payments: async (parent, _, context) => {
          return await this.resolveBookingPayments(parent.id, context);
        },
        updates: async (parent, _, context) => {
          return await this.resolveBookingUpdates(parent.id, context);
        }
      },

      Vehicle: {
        serviceHistory: async (parent, _, context) => {
          return await this.resolveVehicleServiceHistory(parent.id, context);
        }
      }
    };
  }

  // Query resolvers
  async resolveUser(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('users', { _id: id });
    } catch (error) {
      logger.error('Error resolving user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async resolveUsers(filter, context) {
    try {
      const dbService = require('./databaseService');
      const query = {};
      
      if (filter) {
        if (filter.userType) query.userType = filter.userType;
        if (filter.isActive !== undefined) query.isActive = filter.isActive;
        if (filter.search) {
          query.$or = [
            { firstName: { $regex: filter.search, $options: 'i' } },
            { lastName: { $regex: filter.search, $options: 'i' } },
            { email: { $regex: filter.search, $options: 'i' } }
          ];
        }
      }

      const options = {};
      if (filter?.limit) options.limit = filter.limit;
      if (filter?.offset) options.skip = filter.offset;

      return await dbService.find('users', query, options);
    } catch (error) {
      logger.error('Error resolving users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async resolveCurrentUser(context) {
    try {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return await this.resolveUser(context.user.id, context);
    } catch (error) {
      logger.error('Error resolving current user:', error);
      throw new Error('Failed to fetch current user');
    }
  }

  // Add more resolver methods for other entities...
  async resolveVehicle(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('vehicles', { _id: id });
    } catch (error) {
      logger.error('Error resolving vehicle:', error);
      throw new Error('Failed to fetch vehicle');
    }
  }

  async resolveUserVehicles(userId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.find('vehicles', { userId, isActive: true });
    } catch (error) {
      logger.error('Error resolving user vehicles:', error);
      throw new Error('Failed to fetch user vehicles');
    }
  }

  async resolveBooking(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('bookings', { _id: id });
    } catch (error) {
      logger.error('Error resolving booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  async resolveUserBookings(userId, status, context) {
    try {
      const dbService = require('./databaseService');
      const query = { userId };
      if (status) query.status = status;
      return await dbService.find('bookings', query, { sort: { createdAt: -1 } });
    } catch (error) {
      logger.error('Error resolving user bookings:', error);
      throw new Error('Failed to fetch user bookings');
    }
  }

  async resolveMechanicBookings(mechanicId, status, context) {
    try {
      const dbService = require('./databaseService');
      const query = { mechanicId };
      if (status) query.status = status;
      return await dbService.find('bookings', query, { sort: { scheduledDate: 1 } });
    } catch (error) {
      logger.error('Error resolving mechanic bookings:', error);
      throw new Error('Failed to fetch mechanic bookings');
    }
  }

  async resolveServiceTypes(category, context) {
    try {
      const dbService = require('./databaseService');
      const query = { isActive: true };
      if (category) query.category = category;
      return await dbService.find('serviceTypes', query);
    } catch (error) {
      logger.error('Error resolving service types:', error);
      throw new Error('Failed to fetch service types');
    }
  }

  async resolveServiceType(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('serviceTypes', { _id: id });
    } catch (error) {
      logger.error('Error resolving service type:', error);
      throw new Error('Failed to fetch service type');
    }
  }

  async resolvePayment(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('payments', { _id: id });
    } catch (error) {
      logger.error('Error resolving payment:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  async resolveBookingPayments(bookingId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.find('payments', { bookingId });
    } catch (error) {
      logger.error('Error resolving booking payments:', error);
      throw new Error('Failed to fetch booking payments');
    }
  }

  async resolveSubscription(id, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('subscriptions', { _id: id });
    } catch (error) {
      logger.error('Error resolving subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  }

  async resolveUserSubscription(userId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('subscriptions', { userId, status: { $in: ['active', 'trial'] } });
    } catch (error) {
      logger.error('Error resolving user subscription:', error);
      throw new Error('Failed to fetch user subscription');
    }
  }

  async resolveAnalytics(timeframe, filters, context) {
    try {
      // This would integrate with the analytics service
      const analyticsService = require('./analyticsService');
      return await analyticsService.getAnalytics(timeframe, filters);
    } catch (error) {
      logger.error('Error resolving analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  async resolveSearchMechanics(location, specialization, context) {
    try {
      const dbService = require('./databaseService');
      const query = { userType: 'mechanic', isActive: true };
      
      if (specialization && specialization.length > 0) {
        query.specialization = { $in: specialization };
      }
      
      if (location) {
        // Add geospatial query for location-based search
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            $maxDistance: 50000 // 50km radius
          }
        };
      }
      
      return await dbService.find('users', query);
    } catch (error) {
      logger.error('Error resolving search mechanics:', error);
      throw new Error('Failed to search mechanics');
    }
  }

  async resolveSearchServices(query, context) {
    try {
      const dbService = require('./databaseService');
      const searchQuery = {
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      };
      
      return await dbService.find('serviceTypes', searchQuery);
    } catch (error) {
      logger.error('Error resolving search services:', error);
      throw new Error('Failed to search services');
    }
  }

  // Mutation resolvers
  async mutateCreateUser(input, context) {
    try {
      const authService = require('./authService');
      return await authService.register(input);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async mutateUpdateUser(id, input, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.updateOne('users', { _id: id }, input);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async mutateDeleteUser(id, context) {
    try {
      const dbService = require('./databaseService');
      await dbService.updateOne('users', { _id: id }, { isActive: false });
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async mutateLogin(email, password, context) {
    try {
      const authService = require('./authService');
      return await authService.login(email, password);
    } catch (error) {
      logger.error('Error logging in:', error);
      throw new Error('Failed to login');
    }
  }

  async mutateLogout(context) {
    try {
      // Handle logout logic
      return true;
    } catch (error) {
      logger.error('Error logging out:', error);
      throw new Error('Failed to logout');
    }
  }

  async mutateCreateVehicle(userId, input, context) {
    try {
      const dbService = require('./databaseService');
      const vehicle = {
        ...input,
        userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return await dbService.create('vehicles', vehicle);
    } catch (error) {
      logger.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  }

  async mutateUpdateVehicle(id, input, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.updateOne('vehicles', { _id: id }, { ...input, updatedAt: new Date() });
    } catch (error) {
      logger.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  async mutateDeleteVehicle(id, context) {
    try {
      const dbService = require('./databaseService');
      await dbService.updateOne('vehicles', { _id: id }, { isActive: false });
      return true;
    } catch (error) {
      logger.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }

  async mutateCreateBooking(userId, input, context) {
    try {
      const dbService = require('./databaseService');
      const booking = {
        ...input,
        userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await dbService.create('bookings', booking);
      
      // Publish subscription event
      this.pubsub.publish(`USER_BOOKINGS_UPDATED_${userId}`, {
        userBookingsUpdated: await this.resolveUserBookings(userId, null, context)
      });
      
      return result;
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async mutateUpdateBooking(id, input, context) {
    try {
      const dbService = require('./databaseService');
      const booking = await dbService.updateOne('bookings', { _id: id }, { ...input, updatedAt: new Date() });
      
      // Publish subscription events
      this.pubsub.publish(`BOOKING_UPDATED_${id}`, {
        bookingUpdated: { id, status: booking.status, timestamp: new Date() }
      });
      
      return booking;
    } catch (error) {
      logger.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }

  async mutateCancelBooking(id, context) {
    try {
      const dbService = require('./databaseService');
      const booking = await dbService.updateOne('bookings', { _id: id }, { status: 'cancelled', updatedAt: new Date() });
      
      // Publish subscription events
      this.pubsub.publish(`BOOKING_UPDATED_${id}`, {
        bookingUpdated: { id, status: 'cancelled', timestamp: new Date() }
      });
      
      return booking;
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  async mutateAssignMechanic(bookingId, mechanicId, context) {
    try {
      const dbService = require('./databaseService');
      const booking = await dbService.updateOne('bookings', { _id: bookingId }, { mechanicId, updatedAt: new Date() });
      
      // Publish subscription events
      this.pubsub.publish(`BOOKING_UPDATED_${bookingId}`, {
        bookingUpdated: { id: bookingId, mechanicId, timestamp: new Date() }
      });
      
      return booking;
    } catch (error) {
      logger.error('Error assigning mechanic:', error);
      throw new Error('Failed to assign mechanic');
    }
  }

  async mutateCreatePayment(input, context) {
    try {
      const dbService = require('./databaseService');
      const payment = {
        ...input,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await dbService.create('payments', payment);
      
      // Publish subscription event
      this.pubsub.publish(`PAYMENT_PROCESSED_${input.bookingId}`, {
        paymentProcessed: result
      });
      
      return result;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async mutateProcessPayment(paymentId, context) {
    try {
      const dbService = require('./databaseService');
      const payment = await dbService.updateOne('payments', { _id: paymentId }, { status: 'completed', updatedAt: new Date() });
      
      // Publish subscription event
      this.pubsub.publish(`PAYMENT_PROCESSED_${payment.bookingId}`, {
        paymentProcessed: payment
      });
      
      return payment;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async mutateRefundPayment(paymentId, amount, context) {
    try {
      const dbService = require('./databaseService');
      const payment = await dbService.updateOne('payments', { _id: paymentId }, { status: 'refunded', updatedAt: new Date() });
      
      // Publish subscription event
      this.pubsub.publish(`PAYMENT_PROCESSED_${payment.bookingId}`, {
        paymentProcessed: payment
      });
      
      return payment;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  async mutateCreateSubscription(userId, planType, context) {
    try {
      const subscriptionService = require('./subscriptionService');
      return await subscriptionService.createSubscription({ userId, planId: planType });
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async mutateUpdateSubscription(id, planType, context) {
    try {
      const subscriptionService = require('./subscriptionService');
      return await subscriptionService.updateSubscription(id, { planId: planType });
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async mutateCancelSubscription(id, context) {
    try {
      const subscriptionService = require('./subscriptionService');
      return await subscriptionService.cancelSubscription(id);
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async mutateCreateServiceType(input, context) {
    try {
      const dbService = require('./databaseService');
      const serviceType = {
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return await dbService.create('serviceTypes', serviceType);
    } catch (error) {
      logger.error('Error creating service type:', error);
      throw new Error('Failed to create service type');
    }
  }

  async mutateUpdateServiceType(id, input, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.updateOne('serviceTypes', { _id: id }, { ...input, updatedAt: new Date() });
    } catch (error) {
      logger.error('Error updating service type:', error);
      throw new Error('Failed to update service type');
    }
  }

  async mutateDeleteServiceType(id, context) {
    try {
      const dbService = require('./databaseService');
      await dbService.updateOne('serviceTypes', { _id: id }, { isActive: false });
      return true;
    } catch (error) {
      logger.error('Error deleting service type:', error);
      throw new Error('Failed to delete service type');
    }
  }

  // Field resolvers
  async resolveUserProfile(userId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.findOne('userProfiles', { userId });
    } catch (error) {
      logger.error('Error resolving user profile:', error);
      return null;
    }
  }

  async resolveUserVehicles(userId, context) {
    try {
      return await this.resolveUserVehicles(userId, context);
    } catch (error) {
      logger.error('Error resolving user vehicles:', error);
      return [];
    }
  }

  async resolveUserBookings(userId, status, context) {
    try {
      return await this.resolveUserBookings(userId, status, context);
    } catch (error) {
      logger.error('Error resolving user bookings:', error);
      return [];
    }
  }

  async resolveBookingMechanic(bookingId, context) {
    try {
      const dbService = require('./databaseService');
      const booking = await dbService.findOne('bookings', { _id: bookingId });
      if (booking && booking.mechanicId) {
        return await dbService.findOne('users', { _id: booking.mechanicId });
      }
      return null;
    } catch (error) {
      logger.error('Error resolving booking mechanic:', error);
      return null;
    }
  }

  async resolveBookingPayments(bookingId, context) {
    try {
      return await this.resolveBookingPayments(bookingId, context);
    } catch (error) {
      logger.error('Error resolving booking payments:', error);
      return [];
    }
  }

  async resolveBookingUpdates(bookingId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.find('bookingUpdates', { bookingId }, { sort: { timestamp: -1 } });
    } catch (error) {
      logger.error('Error resolving booking updates:', error);
      return [];
    }
  }

  async resolveVehicleServiceHistory(vehicleId, context) {
    try {
      const dbService = require('./databaseService');
      return await dbService.find('serviceRecords', { vehicleId }, { sort: { date: -1 } });
    } catch (error) {
      logger.error('Error resolving vehicle service history:', error);
      return [];
    }
  }

  /**
   * Execute GraphQL query
   */
  async executeQuery(query, variables = {}, context = {}) {
    try {
      const { graphql } = require('graphql');
      const result = await graphql({
        schema: this.schema,
        source: query,
        variableValues: variables,
        contextValue: context
      });

      if (result.errors) {
        logger.error('GraphQL query errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      logger.error('Error executing GraphQL query:', error);
      throw error;
    }
  }

  /**
   * Execute GraphQL mutation
   */
  async executeMutation(mutation, variables = {}, context = {}) {
    try {
      const { graphql } = require('graphql');
      const result = await graphql({
        schema: this.schema,
        source: mutation,
        variableValues: variables,
        contextValue: context
      });

      if (result.errors) {
        logger.error('GraphQL mutation errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      logger.error('Error executing GraphQL mutation:', error);
      throw error;
    }
  }

  /**
   * Publish event to subscribers
   */
  publishEvent(eventName, data) {
    try {
      this.pubsub.publish(eventName, data);
      logger.info(`Published event: ${eventName}`);
    } catch (error) {
      logger.error('Error publishing event:', error);
    }
  }

  /**
   * Get GraphQL schema
   */
  getSchema() {
    return this.schema;
  }

  /**
   * Get introspection query result
   */
  async getIntrospection() {
    try {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }

        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated
            deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }

        fragment InputValue on __InputValue {
          name
          description
          type { ...TypeRef }
          defaultValue
        }

        fragment TypeRef on __Type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      return await this.executeQuery(introspectionQuery);
    } catch (error) {
      logger.error('Error getting introspection:', error);
      throw error;
    }
  }
}

// Create singleton instance
const graphQLService = new GraphQLService();

module.exports = graphQLService;
