#!/usr/bin/env node

const https = require('https');

const API_KEY = process.env.RENDER_API_KEY || 'rnd_2QpESL778eadns0biHOJad0faGvG';

// Try different service IDs that might be correct
const SERVICE_IDS = [
  'srv-2k6b86r433s73fk0er0', // Current ID
  'srv-d2k6b86r433s73fk0er0', // Alternative ID
  'srv-clutch-main-nk7x', // Possible ID
];

async function checkRenderLogs() {
  console.log('🔍 Checking Render logs for all possible service IDs...');
  
  for (const serviceId of SERVICE_IDS) {
    console.log(`\n📋 Trying Service ID: ${serviceId}`);
    
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: `/v1/services/${serviceId}/logs?limit=10`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    };

    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({ statusCode: res.statusCode, data });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.end();
      });

      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        try {
          const parsed = JSON.parse(response.data);
          if (parsed.logs && parsed.logs.length > 0) {
            console.log(`   ✅ Found ${parsed.logs.length} logs`);
            console.log('   Recent logs:');
            parsed.logs.slice(0, 3).forEach((log, i) => {
              console.log(`     ${i+1}. [${log.timestamp}] ${log.message.substring(0, 100)}...`);
            });
            return; // Found working service ID
          } else {
            console.log('   ⚠️  No logs found');
          }
        } catch(e) {
          console.log(`   ❌ Parse Error: ${e.message}`);
        }
      } else if (response.statusCode === 404) {
        console.log('   ❌ Service not found');
      } else {
        console.log(`   ❌ Error: ${response.data}`);
      }
    } catch (error) {
      console.log(`   ❌ Request Error: ${error.message}`);
    }
  }
  
  console.log('\n🔍 Trying to list all services...');
  
  // Try to list all services
  const listOptions = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/services',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    }
  };

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(listOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });

    console.log(`   List Services Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const parsed = JSON.parse(response.data);
        if (parsed.services && parsed.services.length > 0) {
          console.log(`   ✅ Found ${parsed.services.length} services:`);
          parsed.services.forEach((service, i) => {
            console.log(`     ${i+1}. ${service.name} (${service.id}) - ${service.status}`);
          });
        } else {
          console.log('   ⚠️  No services found');
        }
      } catch(e) {
        console.log(`   ❌ Parse Error: ${e.message}`);
      }
    } else {
      console.log(`   ❌ Error: ${response.data}`);
    }
  } catch (error) {
    console.log(`   ❌ Request Error: ${error.message}`);
  }
}

checkRenderLogs().catch(console.error);
