require('dotenv').config();
const { connectDB } = require('../config/database');
const aiService = require('../services/aiService');

async function testAIService() {
    // Connect to database first
    await connectDB();
    console.log('🧠 Testing AI Service...\n');

    try {
        // Test 1: Generate service recommendations
        console.log('1. Testing service recommendations...');
        const recommendations = await aiService.generateServiceRecommendations(
            '507f1f77bcf86cd799439011',
            { year: 2020, make: 'Toyota', model: 'Camry' }
        );
        console.log('✅ Recommendations generated:', recommendations.length);
        console.log('Sample recommendation:', recommendations[0]);

        // Test 2: Predict booking demand
        console.log('\n2. Testing demand prediction...');
        const demandPrediction = await aiService.predictBookingDemand(
            { coordinates: [31.9539, 35.9106] }, // Amman coordinates
            { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        );
        console.log('✅ Demand prediction:', demandPrediction.demand);
        console.log('Confidence:', demandPrediction.confidence);

        // Test 3: Generate automated response
        console.log('\n3. Testing automated responses...');
        const response = await aiService.generateAutomatedResponse(
            { type: 'booking', userId: 'test-user' },
            'I need help with my car service'
        );
        console.log('✅ Automated response generated:', response);

        // Test 4: Optimize mechanic allocation
        console.log('\n4. Testing mechanic allocation...');
        const booking = {
            location: { coordinates: [31.9539, 35.9106] },
            serviceType: 'maintenance'
        };
        const availableMechanics = [
            { _id: '507f1f77bcf86cd799439012', rating: 4.5, location: { coordinates: [31.9539, 35.9106] } }
        ];
        const mechanic = await aiService.optimizeMechanicAllocation(booking, availableMechanics);
        console.log('✅ Mechanic allocation result:', mechanic.recommendedMechanics.length > 0 ? 'Mechanic found' : 'No mechanic available');

        // Test 5: Get service status
        console.log('\n5. Testing service status...');
        const status = aiService.getServiceStatus();
        console.log('✅ Service status:', status);

        console.log('\n🎉 All AI Service tests passed!');
        return true;
    } catch (error) {
        console.error('❌ AI Service test failed:', error.message);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testAIService().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testAIService };
