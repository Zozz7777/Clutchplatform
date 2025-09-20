#!/usr/bin/env node
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testFleetEndpoint() {
  console.log('🚗 Testing Fleet Endpoint...');
  
  // Generate a test token with head_administrator role
  const testToken = jwt.sign(
    { 
      userId: 'admin-001',
      email: 'ziad@yourclutch.com',
      role: 'head_administrator'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  console.log('✅ Test token generated');
  console.log('   Token preview:', testToken.substring(0, 50) + '...');
  
  // Test the fleet vehicles endpoint
  const fleetUrl = 'https://clutch-main-nk7x.onrender.com/api/v1/fleet/vehicles';
  
  try {
    const response = await fetch(fleetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n📊 Fleet Vehicles Endpoint Test:`);
    console.log(`   URL: ${fleetUrl}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success!`);
      console.log(`   Data keys:`, Object.keys(data));
      if (data.data && Array.isArray(data.data)) {
        console.log(`   Vehicles count: ${data.data.length}`);
      }
    } else {
      const errorData = await response.text();
      console.log(`   ❌ Error: ${errorData}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }
  
  // Test other fleet endpoints
  const fleetEndpoints = [
    '/api/v1/fleet/fuel-cost-metrics',
    '/api/v1/fleet/maintenance-forecast',
    '/api/v1/fleet/downtime-impact'
  ];
  
  for (const endpoint of fleetEndpoints) {
    try {
      const url = `https://clutch-main-nk7x.onrender.com${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`\n📊 ${endpoint}:`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`   ✅ Success!`);
      } else {
        const errorData = await response.text();
        console.log(`   ❌ Error: ${errorData.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
}

testFleetEndpoint().catch(console.error);
