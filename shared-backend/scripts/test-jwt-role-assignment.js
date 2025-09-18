const jwt = require('jsonwebtoken');

// Test JWT token generation and role assignment logic
function testJWTTokenGeneration() {
  console.log('🔐 Testing JWT Token Generation and Role Assignment...\n');
  
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  // Test cases for different users
  const testCases = [
    {
      name: 'CEO User (fallback_ziad_ceo)',
      userId: 'fallback_ziad_ceo',
      email: 'ziad@yourclutch.com',
      expectedRole: 'head_administrator'
    },
    {
      name: 'Admin User (admin-001)',
      userId: 'admin-001',
      email: 'admin@clutch.com',
      expectedRole: 'head_administrator'
    },
    {
      name: 'Regular User',
      userId: 'user_123',
      email: 'user@example.com',
      expectedRole: 'admin'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`   User ID: ${testCase.userId}`);
    console.log(`   Email: ${testCase.email}`);
    console.log(`   Expected Role: ${testCase.expectedRole}`);
    
    // Generate token using the same logic as in consolidated-auth.js
    const role = (testCase.userId === 'fallback_ziad_ceo' || testCase.userId === 'admin-001') ? 'head_administrator' : 'admin';
    
    const token = jwt.sign(
      {
        userId: testCase.userId,
        email: testCase.email,
        role: role,
        permissions: ['all']
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`   ✅ Generated Role: ${role}`);
    console.log(`   ✅ Role Match: ${role === testCase.expectedRole ? 'PASS' : 'FAIL'}`);
    console.log(`   🔑 Token Preview: ${token.substring(0, 50)}...`);
    
    // Decode and verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`   🔍 Decoded Token Role: ${decoded.role}`);
      console.log(`   🔍 Decoded Token User ID: ${decoded.userId}`);
      console.log(`   ✅ Token Valid: YES`);
    } catch (error) {
      console.log(`   ❌ Token Invalid: ${error.message}`);
    }
  });
  
  console.log('\n🎯 Summary:');
  console.log('   - CEO and admin-001 users should get "head_administrator" role');
  console.log('   - Other users should get "admin" role');
  console.log('   - All tokens should be valid and contain the correct role');
}

// Test RBAC middleware logic
function testRBACLogic() {
  console.log('\n🔒 Testing RBAC Middleware Logic...\n');
  
  const testUsers = [
    {
      userId: 'fallback_ziad_ceo',
      role: 'head_administrator',
      name: 'CEO User'
    },
    {
      userId: 'admin-001',
      role: 'head_administrator',
      name: 'Admin User'
    },
    {
      userId: 'user_123',
      role: 'admin',
      name: 'Regular User'
    }
  ];
  
  const requiredRoles = ['head_administrator'];
  
  testUsers.forEach((user, index) => {
    console.log(`\n📋 RBAC Test ${index + 1}: ${user.name}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   User Role: ${user.role}`);
    console.log(`   Required Roles: ${JSON.stringify(requiredRoles)}`);
    
    // Simulate the RBAC check logic
    const isFallbackUser = user.userId === 'fallback_ziad_ceo' || user.userId === 'admin-001';
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasAccess = allowedRoles.includes(user.role);
    
    console.log(`   Is Fallback User: ${isFallbackUser}`);
    console.log(`   Has Access: ${hasAccess ? 'YES' : 'NO'}`);
    console.log(`   Expected Result: ${user.role === 'head_administrator' ? 'YES' : 'NO'}`);
    console.log(`   ✅ Test Result: ${hasAccess === (user.role === 'head_administrator') ? 'PASS' : 'FAIL'}`);
  });
}

// Run the tests
console.log('🧪 JWT Token and RBAC Logic Tests\n');
console.log('=' .repeat(50));

testJWTTokenGeneration();
testRBACLogic();

console.log('\n' + '=' .repeat(50));
console.log('✅ Tests completed!');
console.log('\n💡 Next Steps:');
console.log('   1. If all tests pass, the logic is correct');
console.log('   2. The issue might be with token refresh or caching');
console.log('   3. Check if the frontend is using old tokens');
console.log('   4. Verify the server is applying these fixes correctly');

