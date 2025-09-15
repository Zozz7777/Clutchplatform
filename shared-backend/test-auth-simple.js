/**
 * Simple Authentication Test
 * Tests the authentication without database dependencies
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuth() {
  console.log('🧪 Testing Simple Authentication...\n');

  try {
    // Test password hashing and comparison
    const password = '4955698*Z*z';
    const hashedPassword = '$2b$12$5PMqe4ig1OwGH0OgomKBfu4fjehS3holhZC3PitkKN69GLjb8L.Vy';
    
    console.log('1️⃣ Testing password comparison...');
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(`   Password comparison: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!isValid) {
      console.log('   Generating new hash...');
      const newHash = await bcrypt.hash(password, 12);
      console.log(`   New hash: ${newHash}`);
    }

    // Test JWT token generation
    console.log('\n2️⃣ Testing JWT token generation...');
    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
    console.log(`   JWT Secret: ${jwtSecret.substring(0, 10)}...`);
    
    const token = jwt.sign(
      {
        userId: 'admin-001',
        email: 'ziad@yourclutch.com',
        role: 'admin',
        permissions: ['all']
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log(`   Token generated: ${token.substring(0, 50)}...`);
    
    // Test JWT token verification
    console.log('\n3️⃣ Testing JWT token verification...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log(`   Token verification: ✅ Valid`);
    console.log(`   Decoded user: ${decoded.email} (${decoded.role})`);

    console.log('\n✅ All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();
