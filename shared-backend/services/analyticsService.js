const dbService = require('./databaseService');
const redis = require('../config/redis');

class AnalyticsService {
  constructor() {
        this.cacheTTL = 3600; // 1 hour
        this.metrics = new Map();
        this.eventQueue = [];
        this.batchSize = 100;
        this.flushInterval = 60000; // 1 minute

        // Start periodic flush
        setInterval(() => this.flushEvents(), this.flushInterval);
    }

    /**
     * Track user event
     */
    async trackEvent(eventType, userId, data = {}) {
        const event = {
            eventType,
            userId,
            timestamp: new Date(),
            data,
            sessionId: data.sessionId,
            userAgent: data.userAgent,
            ip: data.ip
        };

        this.eventQueue.push(event);

        // Flush if queue is full
        if (this.eventQueue.length >= this.batchSize) {
            await this.flushEvents();
        }

        return event;
    }

    /**
     * Flush events to database
     */
    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            // Store events in analytics collection
            await dbService.bulkInsert('analytics_events', events);
            
            // Update real-time metrics
            await this.updateRealTimeMetrics(events);
            
            console.log(`Flushed ${events.length} analytics events`);
    } catch (error) {
            console.error('Error flushing analytics events:', error);
    }
  }

  /**
     * Update real-time metrics
     */
    async updateRealTimeMetrics(events) {
        const redisClient = redis.getRedisClient();
        if (!redisClient) return;

        for (const event of events) {
            const key = `analytics:${event.eventType}:${new Date().toDateString()}`;
            
            await redisClient.hIncrBy(key, 'count', 1);
            await redisClient.hset(key, 'lastUpdated', new Date().toISOString());
            
            if (event.userId) {
                await redisClient.sAdd(`${key}:users`, event.userId);
            }
    }
  }

  /**
     * Get user analytics
     */
    async getUserAnalytics(userId, timeRange = '30d') {
        const cacheKey = `user_analytics:${userId}:${timeRange}`;
        const redisClient = redis.getRedisClient();
        
        // Check cache first
        if (redisClient) {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const startDate = this.getStartDate(timeRange);
        
        const analytics = {
            userId,
            timeRange,
            bookings: await this.getUserBookingAnalytics(userId, startDate),
            services: await this.getUserServiceAnalytics(userId, startDate),
            spending: await this.getUserSpendingAnalytics(userId, startDate),
            behavior: await this.getUserBehaviorAnalytics(userId, startDate),
            preferences: await this.getUserPreferences(userId, startDate)
        };

        // Cache result
        if (redisClient) {
            await redisClient.setex(cacheKey, this.cacheTTL, JSON.stringify(analytics));
        }
        
        return analytics;
    }

    /**
     * Get user booking analytics
     */
    async getUserBookingAnalytics(userId, startDate) {
        const bookings = await dbService.find('bookings', {
            userId,
            createdAt: { $gte: startDate }
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;

        const avgBookingValue = totalBookings > 0 
            ? bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / totalBookings 
            : 0;

        const bookingTrend = this.calculateTrend(bookings, 'createdAt');

      return {
            total: totalBookings,
            completed: completedBookings,
            cancelled: cancelledBookings,
            pending: pendingBookings,
            completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
            avgValue: avgBookingValue,
            trend: bookingTrend
        };
    }

    /**
     * Get user service analytics
     */
    async getUserServiceAnalytics(userId, startDate) {
        const bookings = await dbService.find('bookings', {
            userId,
            createdAt: { $gte: startDate }
        });

        const serviceCount = {};
        bookings.forEach(booking => {
            const serviceName = booking.serviceType || 'Unknown';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        const topServices = Object.entries(serviceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([service, count]) => ({ service, count }));

      return {
            totalServices: Object.keys(serviceCount).length,
            topServices,
            serviceDistribution: serviceCount
        };
    }

    /**
     * Get user spending analytics
     */
    async getUserSpendingAnalytics(userId, startDate) {
        const bookings = await dbService.find('bookings', {
            userId,
            createdAt: { $gte: startDate },
            status: 'completed'
        });

        const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const avgSpending = bookings.length > 0 ? totalSpent / bookings.length : 0;
        
        const monthlySpending = this.groupByMonth(bookings, 'totalAmount');
        const spendingTrend = this.calculateTrend(bookings, 'createdAt', 'totalAmount');

      return {
            totalSpent,
            avgSpending,
            monthlySpending,
            trend: spendingTrend
        };
    }

    /**
     * Get user behavior analytics
     */
    async getUserBehaviorAnalytics(userId, startDate) {
        const events = await dbService.getAnalyticsEvents({
            userId,
            timestamp: { $gte: startDate }
        });

        const eventCount = {};
        events.forEach(event => {
            eventCount[event.eventType] = (eventCount[event.eventType] || 0) + 1;
        });

        const activeDays = new Set(events.map(e => e.timestamp.toDateString())).size;
        const totalDays = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
            totalEvents: events.length,
            eventTypes: eventCount,
            activeDays,
            engagementRate: totalDays > 0 ? (activeDays / totalDays) * 100 : 0,
            avgEventsPerDay: activeDays > 0 ? events.length / activeDays : 0
        };
    }

    /**
     * Get user preferences
     */
    async getUserPreferences(userId, startDate) {
        const bookings = await dbService.find('bookings', {
            userId,
            createdAt: { $gte: startDate }
        });

        const preferences = {
            preferredTime: this.getPreferredTime(bookings),
            preferredServices: this.getPreferredServices(bookings),
            preferredLocation: this.getPreferredLocation(bookings),
            urgencyPattern: this.getUrgencyPattern(bookings)
        };

        return preferences;
    }

    /**
     * Get business analytics
     */
    async getBusinessAnalytics(timeRange = '30d') {
        const cacheKey = `business_analytics:${timeRange}`;
        const redisClient = redis.getRedisClient();
        
        // Check cache first
        if (redisClient) {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const startDate = this.getStartDate(timeRange);
        
        const analytics = {
            timeRange,
            revenue: await this.getRevenueAnalytics(startDate),
            bookings: await this.getBookingAnalytics(startDate),
            users: await this.getPlatformUserAnalytics(startDate),
            mechanics: await this.getMechanicAnalytics(startDate),
            services: await this.getServiceAnalytics(startDate),
            performance: await this.getPerformanceMetrics(startDate)
        };

        // Cache result
        if (redisClient) {
            await redisClient.setex(cacheKey, this.cacheTTL, JSON.stringify(analytics));
        }
        
        return analytics;
    }

    /**
     * Get revenue analytics
     */
    async getRevenueAnalytics(startDate) {
        const bookings = await dbService.find('bookings', {
            createdAt: { $gte: startDate },
            status: 'completed'
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const avgOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
        
        const monthlyRevenue = this.groupByMonth(bookings, 'totalAmount');
        const revenueTrend = this.calculateTrend(bookings, 'createdAt', 'totalAmount');

      return {
            total: totalRevenue,
            average: avgOrderValue,
            monthly: monthlyRevenue,
            trend: revenueTrend
        };
    }

    /**
     * Get booking analytics
     */
    async getBookingAnalytics(startDate) {
        const bookings = await dbService.find('bookings', {
            createdAt: { $gte: startDate }
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

        const monthlyBookings = this.groupByMonth(bookings, 'count');
        const bookingTrend = this.calculateTrend(bookings, 'createdAt');

      return {
            total: totalBookings,
            completed: completedBookings,
            cancelled: cancelledBookings,
            completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
            monthly: monthlyBookings,
            trend: bookingTrend
        };
    }

    /**
     * Get platform user analytics (platform-wide)
     */
    async getPlatformUserAnalytics(startDate) {
        const users = await dbService.find('users', {
            createdAt: { $gte: startDate }
        });

        const totalUsers = users.length;
        const activeUsers = await this.getActiveUsers(startDate);
        const newUsers = users.filter(u => u.createdAt >= startDate).length;

        const monthlyUsers = this.groupByMonth(users, 'count');
        const userGrowthTrend = this.calculateTrend(users, 'createdAt');

        return {
            total: totalUsers,
            active: activeUsers,
            new: newUsers,
            growthRate: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0,
            monthly: monthlyUsers,
            trend: userGrowthTrend
        };
    }

    /**
     * Get mechanic analytics
     */
    async getMechanicAnalytics(startDate) {
        const mechanics = await dbService.find('mechanics', {
            createdAt: { $gte: startDate }
        });

        const totalMechanics = mechanics.length;
        const activeMechanics = mechanics.filter(m => m.status === 'available').length;
        const avgRating = mechanics.length > 0 
            ? mechanics.reduce((sum, m) => sum + (m.rating || 0), 0) / mechanics.length 
            : 0;

        const topMechanics = mechanics
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10)
            .map(m => ({
                id: m._id,
                name: m.name,
                rating: m.rating,
                completedJobs: m.completedJobs || 0
            }));

        return {
            total: totalMechanics,
            active: activeMechanics,
            avgRating,
            topMechanics
        };
    }

    /**
     * Get service analytics
     */
    async getServiceAnalytics(startDate) {
        const bookings = await dbService.find('bookings', {
            createdAt: { $gte: startDate }
        });

        const serviceCount = {};
        const serviceRevenue = {};

        bookings.forEach(booking => {
            const serviceName = booking.serviceType || 'Unknown';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
            serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + (booking.totalAmount || 0);
        });

        const topServices = Object.entries(serviceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([service, count]) => ({
                service,
                bookings: count,
                revenue: serviceRevenue[service]
            }));

        return {
            totalServices: Object.keys(serviceCount).length,
            topServices,
            serviceDistribution: serviceCount,
            revenueByService: serviceRevenue
        };
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(startDate) {
        const bookings = await dbService.find('bookings', {
            createdAt: { $gte: startDate }
        });

        const avgResponseTime = bookings.length > 0 
            ? bookings.reduce((sum, b) => {
                if (b.assignedAt && b.createdAt) {
                    return sum + (b.assignedAt - b.createdAt);
                }
                return sum;
            }, 0) / bookings.filter(b => b.assignedAt).length
            : 0;

        const avgCompletionTime = bookings.length > 0
            ? bookings.reduce((sum, b) => {
                if (b.completedAt && b.assignedAt) {
                    return sum + (b.completedAt - b.assignedAt);
                }
                return sum;
            }, 0) / bookings.filter(b => b.completedAt).length
            : 0;

      return {
            avgResponseTime: avgResponseTime / (1000 * 60), // Convert to minutes
            avgCompletionTime: avgCompletionTime / (1000 * 60), // Convert to minutes
            customerSatisfaction: await this.getCustomerSatisfaction(startDate)
        };
    }

    /**
     * Get customer satisfaction
     */
    async getCustomerSatisfaction(startDate) {
        const bookings = await dbService.find('bookings', {
            createdAt: { $gte: startDate },
            rating: { $exists: true, $ne: null }
        });

        if (bookings.length === 0) return 0;

        const avgRating = bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length;
        return avgRating;
    }

    /**
     * Get active users count
     */
    async getActiveUsers(startDate) {
        const activeUsers = await dbService.getCollection('analytics_events')
            .distinct('userId', {
                timestamp: { $gte: startDate }
            });

        return activeUsers.length;
    }

    /**
     * Calculate trend
     */
    calculateTrend(data, dateField, valueField = null) {
        if (data.length < 2) return 'stable';

        const sortedData = data.sort((a, b) => a[dateField] - b[dateField]);
        const midPoint = Math.floor(sortedData.length / 2);
        
        const firstHalf = sortedData.slice(0, midPoint);
        const secondHalf = sortedData.slice(midPoint);

        const firstAvg = valueField 
            ? firstHalf.reduce((sum, item) => sum + (item[valueField] || 0), 0) / firstHalf.length
            : firstHalf.length;
        
        const secondAvg = valueField
            ? secondHalf.reduce((sum, item) => sum + (item[valueField] || 0), 0) / secondHalf.length
            : secondHalf.length;

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 10) return 'increasing';
        if (change < -10) return 'decreasing';
        return 'stable';
    }

    /**
     * Group data by month
     */
    groupByMonth(data, valueField) {
        const monthly = {};
        
        data.forEach(item => {
            const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
            if (valueField === 'count') {
                monthly[month] = (monthly[month] || 0) + 1;
            } else {
                monthly[month] = (monthly[month] || 0) + (item[valueField] || 0);
            }
        });

        return monthly;
    }

    /**
     * Get start date from time range
     */
    getStartDate(timeRange) {
        const now = new Date();
        const days = parseInt(timeRange.replace('d', ''));
        return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    }

    /**
     * Get preferred time
     */
    getPreferredTime(bookings) {
        const timeCount = {};
        bookings.forEach(booking => {
            const hour = new Date(booking.createdAt).getHours();
            timeCount[hour] = (timeCount[hour] || 0) + 1;
        });

        const preferredHour = Object.entries(timeCount)
            .sort(([,a], [,b]) => b - a)[0];

        return preferredHour ? parseInt(preferredHour[0]) : null;
    }

    /**
     * Get preferred services
     */
    getPreferredServices(bookings) {
        const serviceCount = {};
        bookings.forEach(booking => {
            const serviceName = booking.serviceId?.name || 'Unknown';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        return Object.entries(serviceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([service]) => service);
    }

    /**
     * Get preferred location
     */
    getPreferredLocation(bookings) {
        const locationCount = {};
        bookings.forEach(booking => {
            const location = booking.location?.address || 'Unknown';
            locationCount[location] = (locationCount[location] || 0) + 1;
        });

        const preferredLocation = Object.entries(locationCount)
            .sort(([,a], [,b]) => b - a)[0];

        return preferredLocation ? preferredLocation[0] : null;
    }

    /**
     * Get urgency pattern
     */
    getUrgencyPattern(bookings) {
        const urgencyCount = {};
        bookings.forEach(booking => {
            const urgency = booking.urgency || 'normal';
            urgencyCount[urgency] = (urgencyCount[urgency] || 0) + 1;
        });

        const total = bookings.length;
      return {
            emergency: total > 0 ? (urgencyCount.emergency || 0) / total * 100 : 0,
            high: total > 0 ? (urgencyCount.high || 0) / total * 100 : 0,
            normal: total > 0 ? (urgencyCount.normal || 0) / total * 100 : 0,
            low: total > 0 ? (urgencyCount.low || 0) / total * 100 : 0
        };
    }

    /**
     * Generate insights
     */
    async generateInsights(timeRange = '30d') {
        const businessAnalytics = await this.getBusinessAnalytics(timeRange);
        
        const insights = {
            revenue: this.generateRevenueInsights(businessAnalytics.revenue),
            bookings: this.generateBookingInsights(businessAnalytics.bookings),
            users: this.generateUserInsights(businessAnalytics.users),
            services: this.generateServiceInsights(businessAnalytics.services)
        };

        return insights;
    }

    /**
     * Generate revenue insights
     */
    generateRevenueInsights(revenue) {
        const insights = [];
        
        if (revenue.trend === 'increasing') {
            insights.push('Revenue is showing positive growth trend');
        } else if (revenue.trend === 'decreasing') {
            insights.push('Revenue is declining - consider promotional campaigns');
        }

        if (revenue.average > 0) {
            insights.push(`Average order value is ${revenue.average.toFixed(2)}`);
        }

        return insights;
    }

    /**
     * Generate booking insights
     */
    generateBookingInsights(bookings) {
        const insights = [];
        
        if (bookings.completionRate < 80) {
            insights.push('Low booking completion rate - review cancellation reasons');
        }

        if (bookings.trend === 'increasing') {
            insights.push('Booking volume is increasing');
        }

        return insights;
    }

    /**
     * Generate user insights
     */
    generateUserInsights(users) {
        const insights = [];
        
        if (users.growthRate > 10) {
            insights.push('Strong user growth - consider scaling operations');
        }

        if (users.active / users.total < 0.3) {
            insights.push('Low user engagement - consider re-engagement campaigns');
        }

        return insights;
    }

    /**
     * Generate service insights
     */
    generateServiceInsights(services) {
        const insights = [];
        
        if (services.topServices.length > 0) {
            const topService = services.topServices[0];
            insights.push(`${topService.service} is the most popular service`);
        }

        return insights;
    }
}

module.exports = new AnalyticsService();
