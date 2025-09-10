// Test script to verify backend connection
const axios = require('axios');

async function testBackendConnection() {
    console.log('Testing Clutch Backend Connection...');
    console.log('Backend URL: https://clutch-main-nk7x.onrender.com');
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get('https://clutch-main-nk7x.onrender.com/health', {
            timeout: 10000
        });
        console.log('✅ Health endpoint:', healthResponse.status, healthResponse.data);
        
        // Test root endpoint for available routes
        console.log('\n2. Testing root endpoint...');
        try {
            const rootResponse = await axios.get('https://clutch-main-nk7x.onrender.com/', {
                timeout: 10000
            });
            console.log('✅ Root endpoint:', rootResponse.status, rootResponse.data);
        } catch (error) {
            console.log('⚠️  Root endpoint:', error.response?.status || error.message);
        }
        
        // Test API documentation endpoint
        console.log('\n3. Testing API documentation...');
        try {
            const docsResponse = await axios.get('https://clutch-main-nk7x.onrender.com/api-docs', {
                timeout: 10000
            });
            console.log('✅ API docs:', docsResponse.status, docsResponse.data);
        } catch (error) {
            console.log('⚠️  API docs:', error.response?.status || error.message);
        }
        
        // Test specific endpoints that the app uses
        const endpoints = [
            '/api/v1/auth/verify',
            '/api/v1/shops/profile',
            '/api/v1/inventory/items',
            '/api/v1/sales/transactions'
        ];
        
        console.log('\n4. Testing specific API endpoints...');
        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`https://clutch-main-nk7x.onrender.com${endpoint}`, {
                    timeout: 5000,
                    headers: {
                        'Authorization': 'Bearer demo-token',
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`✅ ${endpoint}:`, response.status);
            } catch (error) {
                if (error.response) {
                    console.log(`⚠️  ${endpoint}:`, error.response.status, error.response.statusText);
                } else {
                    console.log(`❌ ${endpoint}:`, error.message);
                }
            }
        }
        
        console.log('\n🎉 Backend connection test completed!');
        
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testBackendConnection();
