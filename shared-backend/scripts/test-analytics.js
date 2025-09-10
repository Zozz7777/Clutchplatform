require('dotenv').config();
require('dotenv').config();
const { connectDB } = require('../config/database');
const { connectRedis } = require('../config/redis');
const analyticsService = require('../services/analyticsService');

async function testAnalyticsService() {
    // Connect to database and Redis first
    await connectDB();
    await connectRedis();
    console.log('📊 Testing Analytics Service...\n');

    try {
        // Test 1: Track events
        console.log('1. Testing event tracking...');
        const event1 = await analyticsService.trackEvent('page_view', 'test-user-1', {
            page: '/dashboard',
            sessionId: 'session-123',
            userAgent: 'Mozilla/5.0',
            ip: '127.0.0.1'
        });
        console.log('✅ Event 1 tracked:', event1.eventType);

        const event2 = await analyticsService.trackEvent('booking_created', 'test-user-1', {
            bookingId: 'booking-123',
            serviceType: 'maintenance',
            amount: 150,
            sessionId: 'session-123',
            userAgent: 'Mozilla/5.0',
            ip: '127.0.0.1'
        });
        console.log('✅ Event 2 tracked:', event2.eventType);

        // Test 2: Get user analytics
        console.log('\n2. Testing user analytics...');
        const userAnalytics = await analyticsService.getUserAnalytics('test-user-1', '7d');
        console.log('✅ User analytics generated');
        console.log('User analytics structure:', JSON.stringify(userAnalytics, null, 2));
        if (userAnalytics && userAnalytics.bookings) {
            console.log('Bookings:', userAnalytics.bookings.total);
            console.log('Services:', userAnalytics.services.totalServices);
        } else {
            console.log('❌ User analytics structure is invalid');
        }

        // Test 3: Get business analytics
        console.log('\n3. Testing business analytics...');
        const businessAnalytics = await analyticsService.getBusinessAnalytics('7d');
        console.log('✅ Business analytics generated');
        console.log('Revenue:', businessAnalytics.revenue.total);
        console.log('Bookings:', businessAnalytics.bookings.total);
        console.log('Users:', businessAnalytics.users.total);

        // Test 4: Generate insights
        console.log('\n4. Testing insights generation...');
        const insights = await analyticsService.generateInsights('7d');
        console.log('✅ Insights generated');
        console.log('Revenue insights:', insights.revenue.length);
        console.log('Booking insights:', insights.bookings.length);
        console.log('User insights:', insights.users.length);

        // Test 5: Flush events
        console.log('\n5. Testing event flushing...');
        await analyticsService.flushEvents();
        console.log('✅ Events flushed successfully');

        console.log('\n🎉 All Analytics Service tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Analytics Service test failed:', error.message);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testAnalyticsService().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testAnalyticsService };
