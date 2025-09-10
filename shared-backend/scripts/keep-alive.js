#!/usr/bin/env node

/**
 * External Keep-Alive Script for Clutch Backend
 * 
 * This script can be run externally (e.g., via cron job or external service)
 * to ping the health endpoint and prevent the Render service from spinning down.
 * 
 * Usage:
 * - Run locally: node scripts/keep-alive.js
 * - Run with custom URL: KEEP_ALIVE_URL=https://your-app.onrender.com/health/ping node scripts/keep-alive.js
 * - Run with custom interval: INTERVAL=10 node scripts/keep-alive.js (in minutes)
 */

const https = require('https');
const http = require('http');

// Configuration
const DEFAULT_URL = 'https://clutch-main-nk7x.onrender.com/health/ping';
const DEFAULT_INTERVAL = 14; // minutes (just under the 15-minute timeout)
const TIMEOUT = 10000; // 10 seconds

const keepAliveUrl = process.env.KEEP_ALIVE_URL || DEFAULT_URL;
const intervalMinutes = parseInt(process.env.INTERVAL) || DEFAULT_INTERVAL;
const intervalMs = intervalMinutes * 60 * 1000;

console.log('🔄 Starting External Keep-Alive Service...');
console.log(`📡 Target URL: ${keepAliveUrl}`);
console.log(`⏰ Interval: ${intervalMinutes} minutes`);
console.log(`🕐 Started at: ${new Date().toISOString()}`);

function pingHealthEndpoint() {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(keepAliveUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, {
        method: 'GET',
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Clutch-External-KeepAlive/1.0',
          'X-Keep-Alive': 'true',
          'X-External-Ping': 'true'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const timestamp = new Date().toISOString();
          if (res.statusCode === 200) {
            console.log(`✅ Keep-alive ping successful at ${timestamp}`);
            resolve({ success: true, statusCode: res.statusCode, timestamp });
          } else {
            console.log(`⚠️ Keep-alive ping returned status ${res.statusCode} at ${timestamp}`);
            resolve({ success: false, statusCode: res.statusCode, timestamp });
          }
        });
      });
      
      req.on('error', (error) => {
        const timestamp = new Date().toISOString();
        console.log(`❌ Keep-alive ping failed at ${timestamp}:`, error.message);
        reject({ success: false, error: error.message, timestamp });
      });
      
      req.on('timeout', () => {
        const timestamp = new Date().toISOString();
        console.log(`⏰ Keep-alive ping timeout at ${timestamp}`);
        req.destroy();
        reject({ success: false, error: 'timeout', timestamp });
      });
      
      req.end();
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.log(`❌ Keep-alive ping error at ${timestamp}:`, error.message);
      reject({ success: false, error: error.message, timestamp });
    }
  });
}

async function startKeepAlive() {
  // Initial ping
  try {
    await pingHealthEndpoint();
  } catch (error) {
    console.log('❌ Initial ping failed:', error);
  }
  
  // Set up interval
  setInterval(async () => {
    try {
      await pingHealthEndpoint();
    } catch (error) {
      console.log('❌ Interval ping failed:', error);
    }
  }, intervalMs);
  
  console.log(`✅ Keep-alive service started successfully`);
  console.log(`🔄 Next ping in ${intervalMinutes} minutes`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service stopped by system');
  process.exit(0);
});

// Start the service
startKeepAlive().catch(error => {
  console.error('❌ Failed to start keep-alive service:', error);
  process.exit(1);
});

module.exports = { pingHealthEndpoint, startKeepAlive };
