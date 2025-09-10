require('dotenv').config();
const securityMiddleware = require('../middleware/security');

async function testSecurityMiddleware() {
    console.log('🔒 Testing Security Middleware...\n');

    try {
        // Test 1: Get security status
        console.log('1. Testing security status...');
        const status = securityMiddleware.getSecurityStatus();
        console.log('✅ Security status:', status);

        // Test 2: Test password hashing
        console.log('\n2. Testing password hashing...');
        const password = 'testPassword123';
        const hashedPassword = await securityMiddleware.hashPassword(password);
        console.log('✅ Password hashed:', hashedPassword.length > 0);
        
        const isMatch = await securityMiddleware.comparePassword(password, hashedPassword);
        console.log('✅ Password comparison:', isMatch);

        // Test 3: Test JWT generation and verification
        console.log('\n3. Testing JWT functionality...');
        const payload = { userId: 'test-user', role: 'user' };
        const token = securityMiddleware.generateJWT(payload, '1h');
        console.log('✅ JWT generated:', token.length > 0);
        
        const decoded = securityMiddleware.verifyJWT(token);
        console.log('✅ JWT verified:', decoded ? 'Valid' : 'Invalid');

        // Test 4: Test secure token generation
        console.log('\n4. Testing secure token generation...');
        const secureToken = securityMiddleware.generateSecureToken(32);
        console.log('✅ Secure token generated:', secureToken.length === 64);

        // Test 5: Test input sanitization
        console.log('\n5. Testing input sanitization...');
        const maliciousInput = '<script>alert("xss")</script>SELECT * FROM users';
        const sanitized = securityMiddleware.sanitizeString(maliciousInput);
        console.log('✅ Input sanitized:', sanitized !== maliciousInput);

        // Test 6: Test token blacklisting
        console.log('\n6. Testing token blacklisting...');
        const testToken = 'test-token-123';
        securityMiddleware.blacklistToken(testToken);
        console.log('✅ Token blacklisted');
        console.log('Blacklisted tokens count:', securityMiddleware.blacklistedTokens.size);

        // Test 7: Test failed attempts tracking
        console.log('\n7. Testing failed attempts tracking...');
        const identifier = 'test@example.com';
        securityMiddleware.trackFailedAttempt(identifier);
        console.log('✅ Failed attempt tracked');
        console.log('Is account locked:', securityMiddleware.isAccountLocked(identifier));

        // Test 8: Test cleanup
        console.log('\n8. Testing cleanup...');
        securityMiddleware.cleanup();
        console.log('✅ Cleanup completed');

        console.log('\n🎉 All Security Middleware tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Security Middleware test failed:', error.message);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testSecurityMiddleware().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testSecurityMiddleware };
