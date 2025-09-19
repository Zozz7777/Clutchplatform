const { getCollection } = require('../utils/databaseUtils');

class RealAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or fetch fresh data
   */
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(timeRange = '7d') {
    return this.getCachedData(`user_analytics_${timeRange}`, async () => {
      try {
        const usersCollection = await getCollection('users');
        const bookingsCollection = await getCollection('bookings');
        
        const timeFilter = this.getTimeFilter(timeRange);
        
        // Total users
        const totalUsers = await usersCollection.countDocuments();
        
        // New users in time range
        const newUsers = await usersCollection.countDocuments({
          createdAt: timeFilter
        });
        
        // Active users (users with bookings in time range)
        const activeUserIds = await bookingsCollection.distinct('userId', {
          createdAt: timeFilter
        });
        const activeUsers = activeUserIds.length;
        
        // User engagement (average bookings per user)
        const totalBookings = await bookingsCollection.countDocuments({
          createdAt: timeFilter
        });
        const userEngagement = activeUsers > 0 ? totalBookings / activeUsers : 0;
        
        // User retention (users who made bookings in previous period and current period)
        const previousTimeFilter = this.getTimeFilter(timeRange, true);
        const previousActiveUsers = await bookingsCollection.distinct('userId', {
          createdAt: previousTimeFilter
        });
        const retainedUsers = await bookingsCollection.distinct('userId', {
          userId: { $in: previousActiveUsers },
          createdAt: timeFilter
        });
        const retention = previousActiveUsers.length > 0 ? 
          (retainedUsers.length / previousActiveUsers.length) * 100 : 0;

        return {
          totalUsers,
          newUsers,
          activeUsers,
          userEngagement: Math.round(userEngagement * 100) / 100,
          retention: Math.round(retention * 100) / 100
        };
      } catch (error) {
        console.error('Failed to get user analytics:', error);
        throw error;
      }
    });
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(timeRange = '7d') {
    return this.getCachedData(`revenue_analytics_${timeRange}`, async () => {
      try {
        const bookingsCollection = await getCollection('bookings');
        const timeFilter = this.getTimeFilter(timeRange);
        
        // Total revenue
        const revenueResult = await bookingsCollection.aggregate([
          { $match: { status: 'completed', createdAt: timeFilter } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]).toArray();
        
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        
        // Revenue by day
        const dailyRevenue = await bookingsCollection.aggregate([
          { $match: { status: 'completed', createdAt: timeFilter } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$amount' }
            }
          },
          { $sort: { _id: 1 } }
        ]).toArray();
        
        // Average order value
        const avgOrderResult = await bookingsCollection.aggregate([
          { $match: { status: 'completed', createdAt: timeFilter } },
          { $group: { _id: null, avgAmount: { $avg: '$amount' } } }
        ]).toArray();
        
        const avgOrderValue = avgOrderResult.length > 0 ? avgOrderResult[0].avgAmount : 0;
        
        // Revenue growth
        const previousTimeFilter = this.getTimeFilter(timeRange, true);
        const previousRevenueResult = await bookingsCollection.aggregate([
          { $match: { status: 'completed', createdAt: previousTimeFilter } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]).toArray();
        
        const previousRevenue = previousRevenueResult.length > 0 ? previousRevenueResult[0].totalRevenue : 0;
        const revenueGrowth = previousRevenue > 0 ? 
          ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        return {
          totalRevenue,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          dailyRevenue: dailyRevenue.map(item => ({
            date: item._id,
            revenue: item.revenue
          }))
        };
      } catch (error) {
        console.error('Failed to get revenue analytics:', error);
        throw error;
      }
    });
  }

  /**
   * Get booking analytics
   */
  async getBookingAnalytics(timeRange = '7d') {
    return this.getCachedData(`booking_analytics_${timeRange}`, async () => {
      try {
        const bookingsCollection = await getCollection('bookings');
        const timeFilter = this.getTimeFilter(timeRange);
        
        // Total bookings
        const totalBookings = await bookingsCollection.countDocuments({
          createdAt: timeFilter
        });
        
        // Bookings by status
        const bookingsByStatus = await bookingsCollection.aggregate([
          { $match: { createdAt: timeFilter } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();
        
        // Bookings by day
        const dailyBookings = await bookingsCollection.aggregate([
          { $match: { createdAt: timeFilter } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]).toArray();
        
        // Conversion rate (completed / total)
        const completedBookings = bookingsByStatus.find(item => item._id === 'completed')?.count || 0;
        const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

        return {
          totalBookings,
          completedBookings,
          conversionRate: Math.round(conversionRate * 100) / 100,
          bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          dailyBookings: dailyBookings.map(item => ({
            date: item._id,
            count: item.count
          }))
        };
      } catch (error) {
        console.error('Failed to get booking analytics:', error);
        throw error;
      }
    });
  }

  /**
   * Get fleet analytics
   */
  async getFleetAnalytics(timeRange = '7d') {
    return this.getCachedData(`fleet_analytics_${timeRange}`, async () => {
      try {
        const vehiclesCollection = await getCollection('vehicles');
        const bookingsCollection = await getCollection('bookings');
        const timeFilter = this.getTimeFilter(timeRange);
        
        // Total vehicles
        const totalVehicles = await vehiclesCollection.countDocuments();
        
        // Active vehicles (vehicles with bookings in time range)
        const activeVehicleIds = await bookingsCollection.distinct('vehicleId', {
          createdAt: timeFilter
        });
        const activeVehicles = activeVehicleIds.length;
        
        // Vehicle utilization
        const vehicleUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
        
        // Most popular vehicles
        const popularVehicles = await bookingsCollection.aggregate([
          { $match: { createdAt: timeFilter } },
          { $group: { _id: '$vehicleId', bookingCount: { $sum: 1 } } },
          { $sort: { bookingCount: -1 } },
          { $limit: 10 }
        ]).toArray();
        
        // Get vehicle details for popular vehicles
        const vehicleDetails = await vehiclesCollection.find({
          _id: { $in: popularVehicles.map(v => v._id) }
        }).toArray();
        
        const popularVehiclesWithDetails = popularVehicles.map(vehicle => {
          const details = vehicleDetails.find(v => v._id.toString() === vehicle._id.toString());
          return {
            vehicleId: vehicle._id,
            bookingCount: vehicle.bookingCount,
            make: details?.make || 'Unknown',
            model: details?.model || 'Unknown',
            year: details?.year || 'Unknown'
          };
        });

        return {
          totalVehicles,
          activeVehicles,
          vehicleUtilization: Math.round(vehicleUtilization * 100) / 100,
          popularVehicles: popularVehiclesWithDetails
        };
      } catch (error) {
        console.error('Failed to get fleet analytics:', error);
        throw error;
      }
    });
  }

  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboardAnalytics(timeRange = '7d') {
    try {
      const [userAnalytics, revenueAnalytics, bookingAnalytics, fleetAnalytics] = await Promise.all([
        this.getUserAnalytics(timeRange),
        this.getRevenueAnalytics(timeRange),
        this.getBookingAnalytics(timeRange),
        this.getFleetAnalytics(timeRange)
      ]);

      return {
        timestamp: new Date().toISOString(),
        timeRange,
        users: userAnalytics,
        revenue: revenueAnalytics,
        bookings: bookingAnalytics,
        fleet: fleetAnalytics
      };
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Get time filter for MongoDB queries
   */
  getTimeFilter(timeRange, previous = false) {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - (previous ? 2 : 1) * 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - (previous ? 14 : 7) * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - (previous ? 60 : 30) * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - (previous ? 180 : 90) * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    if (previous) {
      const endDate = new Date(now.getTime() - (timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);
      return { $gte: startDate, $lt: endDate };
    }
    
    return { $gte: startDate };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = RealAnalyticsService;
