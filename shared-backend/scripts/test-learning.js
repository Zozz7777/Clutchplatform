#!/usr/bin/env node

/**
 * Test Learning Script
 */

console.log('🎓 Testing Learning System...');

try {
  const AutonomousLearningAcademy = require('../services/autonomousLearningAcademy');
  console.log('✅ AutonomousLearningAcademy loaded successfully');
  
  const academy = new AutonomousLearningAcademy();
  console.log('✅ Academy instance created successfully');
  
  console.log('🎉 Learning system test completed successfully!');
  
} catch (error) {
  console.error('❌ Learning system test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
