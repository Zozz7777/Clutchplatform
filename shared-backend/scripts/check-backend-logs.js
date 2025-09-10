#!/usr/bin/env node

const https = require('https');

const API_KEY = process.env.RENDER_API_KEY || 'rnd_2QpESL778eadns0biHOJad0faGvG';
const BACKEND_SERVICE_ID = 'srv-2k6b86r433s73fk0er0';

async function checkBackendLogs() {
  console.log('🔍 Checking backend logs...');
  console.log('Backend Service ID:', BACKEND_SERVICE_ID);
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: `/v1/services/${BACKEND_SERVICE_ID}/logs?limit=100`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('\n📊 Recent Backend Logs:');
          console.log('='.repeat(60));
          
          if (parsed.logs && parsed.logs.length > 0) {
            parsed.logs.slice(0, 20).forEach((log, i) => {
              const timestamp = new Date(log.timestamp).toLocaleString();
              const message = log.message;
              
              // Check for error patterns
              if (message.toLowerCase().includes('error') || 
                  message.toLowerCase().includes('failed') ||
                  message.toLowerCase().includes('exception') ||
                  message.toLowerCase().includes('timeout')) {
                console.log(`\n❌ ${i + 1}. [${timestamp}] ${message}`);
              } else if (message.toLowerCase().includes('warning') || 
                         message.toLowerCase().includes('warn')) {
                console.log(`\n⚠️  ${i + 1}. [${timestamp}] ${message}`);
              } else {
                console.log(`\n✅ ${i + 1}. [${timestamp}] ${message}`);
              }
            });
          } else {
            console.log('No backend logs found');
          }
        } catch(e) {
          console.log('Parse Error:', e.message);
          console.log('Raw Response:', data);
        }
      } else {
        console.log('Error Response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request Error:', error.message);
  });
  
  req.end();
}

checkBackendLogs().catch(console.error);
