const { getCollection } = require('./shared-backend/config/optimized-database');
const { hashPassword } = require('./shared-backend/middleware/auth');

async function testRegistrationFlow() {
  console.log('🧪 Testing Complete Registration Flow...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const usersCollection = await getCollection('users');
    console.log('✅ Database collection accessed');

    // Test 2: Check if user exists
    console.log('\n2️⃣ Testing user existence check...');
    const testEmail = `test-${Date.now()}@example.com`;
    const existingUser = await usersCollection.findOne({ email: testEmail.toLowerCase() });
    console.log('✅ User lookup completed:', { found: !!existingUser });

    // Test 3: Password hashing
    console.log('\n3️⃣ Testing password hashing...');
    const password = 'testpassword123';
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully');

    // Test 4: User creation
    console.log('\n4️⃣ Testing user creation...');
    const newUser = {
      email: testEmail.toLowerCase(),
      password: hashedPassword,
      name: 'Test User',
      phoneNumber: null,
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };

    const result = await usersCollection.insertOne(newUser);
    console.log('✅ User created successfully:', { userId: result.insertedId });

    // Test 5: Cleanup
    console.log('\n5️⃣ Cleaning up test user...');
    await usersCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test user deleted');

    console.log('\n🎉 All registration flow tests passed!');

  } catch (error) {
    console.error('❌ Registration flow test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testRegistrationFlow();
