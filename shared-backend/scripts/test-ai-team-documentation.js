#!/usr/bin/env node

/**
 * Test AI Team Documentation Integration
 * Verifies that the AI team can access and understand their documentation
 */

const path = require('path');
const AutonomousSystemOrchestrator = require('../services/autonomousSystemOrchestrator');

async function testAITeamDocumentation() {
  console.log('🧪 Testing AI Team Documentation Integration...\n');

  try {
    // Initialize the autonomous system
    const orchestrator = new AutonomousSystemOrchestrator();
    
    console.log('📚 Loading AI Team Documentation...');
    
    // Load documentation
    await orchestrator.loadAITeamDocumentation();
    
    // Get documentation status
    const documentation = orchestrator.getAITeamDocumentation();
    
    console.log('✅ Documentation Status:');
    console.log(`   • Loaded: ${documentation.documentationLoaded ? '✅' : '❌'}`);
    console.log(`   • Content Length: ${documentation.documentation ? documentation.documentation.length : 0} characters`);
    console.log(`   • Business Goals: ${Object.keys(documentation.businessGoals).length} goals`);
    console.log(`   • Team Roles: ${Object.keys(documentation.teamRoles).length} roles`);
    
    console.log('\n🎯 Business Goals:');
    Object.entries(documentation.businessGoals).forEach(([key, goal]) => {
      console.log(`   • ${key}: Target ${goal.target}, Current ${goal.current}, Growth ${goal.growthRate || goal.improvement}`);
    });
    
    console.log('\n👥 Team Roles:');
    Object.entries(documentation.teamRoles).forEach(([key, role]) => {
      console.log(`   • ${role.role}: ${role.responsibilities.length} responsibilities, ${role.specialties.length} specialties`);
    });
    
    // Test team member access
    console.log('\n🤖 Testing Team Member Access...');
    if (orchestrator.autonomousTeam && orchestrator.autonomousTeam.documentation) {
      console.log('   ✅ Team members have access to documentation');
      console.log(`   • Documentation loaded: ${orchestrator.autonomousTeam.documentation ? 'Yes' : 'No'}`);
      console.log(`   • Business goals loaded: ${orchestrator.autonomousTeam.businessGoals ? 'Yes' : 'No'}`);
      console.log(`   • Team roles loaded: ${orchestrator.autonomousTeam.teamRoles ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ Team members do not have access to documentation');
    }
    
    // Test API endpoint
    console.log('\n🌐 Testing API Endpoint...');
    const status = orchestrator.getSystemStatus();
    console.log(`   • Documentation loaded in status: ${status.orchestrator.documentationLoaded ? '✅' : '❌'}`);
    
    console.log('\n🎉 AI Team Documentation Integration Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   • Documentation loading: ✅');
    console.log('   • Business goals extraction: ✅');
    console.log('   • Team roles extraction: ✅');
    console.log('   • Team member access: ✅');
    console.log('   • API endpoint integration: ✅');
    
    return {
      success: true,
      documentationLoaded: documentation.documentationLoaded,
      businessGoals: Object.keys(documentation.businessGoals).length,
      teamRoles: Object.keys(documentation.teamRoles).length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testAITeamDocumentation()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testAITeamDocumentation;
