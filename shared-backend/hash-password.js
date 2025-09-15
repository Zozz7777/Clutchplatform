const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = '4955698*Z*z';
  const saltRounds = 12;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Hash verification:', isValid ? '✅ Valid' : '❌ Invalid');
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword();
