const { connectDB } = require('./config/database');
const { logger } = require('./config/logger');

async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connection established');
    
    console.log('🚀 Starting HTTP server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
