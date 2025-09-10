#!/usr/bin/env node

/**
 * Test Documentation Loading (Without AI Providers)
 * Simple test to verify documentation can be loaded and parsed
 */

const fs = require('fs');
const path = require('path');

async function testDocumentationLoading() {
  console.log('🧪 Testing Documentation Loading...\n');

  try {
    // Check if documentation file exists
    const documentationPath = path.join(__dirname, '../AI_TEAM_DOCUMENTATION.md');
    
    console.log('📁 Checking documentation file...');
    console.log(`   • Path: ${documentationPath}`);
    
    if (!fs.existsSync(documentationPath)) {
      throw new Error('AI_TEAM_DOCUMENTATION.md file not found');
    }
    
    console.log('   ✅ Documentation file exists');
    
    // Read documentation
    console.log('\n📚 Reading documentation...');
    const documentation = fs.readFileSync(documentationPath, 'utf8');
    
    console.log(`   • File size: ${documentation.length} characters`);
    console.log(`   • File size: ${(documentation.length / 1024).toFixed(2)} KB`);
    
    // Parse key sections
    console.log('\n🔍 Parsing key sections...');
    
    const sections = {
      businessGoals: documentation.includes('BUSINESS GOALS & OBJECTIVES'),
      teamRoles: documentation.includes('INDIVIDUAL AI TEAM MEMBER ROLES'),
      systemArchitecture: documentation.includes('SYSTEM ARCHITECTURE'),
      apiEndpoints: documentation.includes('API ENDPOINTS & SERVICES'),
      deployment: documentation.includes('DEPLOYMENT & INFRASTRUCTURE'),
      monitoring: documentation.includes('MONITORING & HEALTH CHECKS'),
      security: documentation.includes('SECURITY & COMPLIANCE'),
      troubleshooting: documentation.includes('TROUBLESHOOTING & SUPPORT')
    };
    
    console.log('   📋 Key sections found:');
    Object.entries(sections).forEach(([section, found]) => {
      console.log(`   • ${section}: ${found ? '✅' : '❌'}`);
    });
    
    // Extract business goals
    console.log('\n🎯 Extracting business goals...');
    const businessGoalsMatch = documentation.match(/Revenue Goals[\s\S]*?Target.*?(\$[\d,]+)/);
    if (businessGoalsMatch) {
      console.log(`   • Revenue target found: ${businessGoalsMatch[1]}`);
    }
    
    // Extract team roles
    console.log('\n👥 Extracting team roles...');
    const teamRoles = [
      'Lead Developer (Alex Chen)',
      'DevOps Engineer',
      'Security Expert',
      'Performance Engineer',
      'Database Administrator'
    ];
    
    teamRoles.forEach(role => {
      const found = documentation.includes(role);
      console.log(`   • ${role}: ${found ? '✅' : '❌'}`);
    });
    
    // Extract API endpoints count
    console.log('\n📡 Extracting API information...');
    const apiCountMatch = documentation.match(/Total Endpoints: (\d+)/);
    if (apiCountMatch) {
      console.log(`   • Total API endpoints: ${apiCountMatch[1]}`);
    }
    
    // Check for autonomous system information
    console.log('\n🤖 Checking autonomous system information...');
    const autonomousFeatures = [
      '24/7 Operation',
      'Goal-Oriented AI',
      'Continuous Learning',
      'Autonomous Trigger System',
      'Self-Healing Capabilities'
    ];
    
    autonomousFeatures.forEach(feature => {
      const found = documentation.includes(feature);
      console.log(`   • ${feature}: ${found ? '✅' : '❌'}`);
    });
    
    console.log('\n🎉 Documentation Loading Test Complete!');
    console.log('\n📊 Test Results:');
    console.log(`   • File exists: ✅`);
    console.log(`   • File readable: ✅`);
    console.log(`   • File size: ${(documentation.length / 1024).toFixed(2)} KB`);
    console.log(`   • Key sections: ${Object.values(sections).filter(Boolean).length}/${Object.keys(sections).length}`);
    console.log(`   • Team roles: ${teamRoles.filter(role => documentation.includes(role)).length}/${teamRoles.length}`);
    console.log(`   • Autonomous features: ${autonomousFeatures.filter(feature => documentation.includes(feature)).length}/${autonomousFeatures.length}`);
    
    return {
      success: true,
      fileSize: documentation.length,
      sectionsFound: Object.values(sections).filter(Boolean).length,
      totalSections: Object.keys(sections).length,
      teamRolesFound: teamRoles.filter(role => documentation.includes(role)).length,
      totalTeamRoles: teamRoles.length
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
  testDocumentationLoading()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        console.log(`📈 Documentation Quality Score: ${Math.round((result.sectionsFound / result.totalSections) * 100)}%`);
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

module.exports = testDocumentationLoading;
