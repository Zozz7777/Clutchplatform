const { hashPassword } = require('./shared-backend/middleware/auth');

async function testHashPassword() {
  console.log('🧪 Testing hashPassword function...');
  
  try {
    const password = 'testpassword123';
    console.log('📝 Testing password:', password);
    
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully');
    console.log('🔐 Hashed password length:', hashedPassword.length);
    console.log('🔐 Hashed password preview:', hashedPassword.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ hashPassword error:', error);
  }
}

testHashPassword();
