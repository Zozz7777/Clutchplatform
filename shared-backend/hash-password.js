const bcrypt = require('bcryptjs');

const password = '4955698*Z*z'; // The password to hash

async function hashAndVerify() {
  try {
    const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds
    console.log('Hashed password:', hashedPassword);

    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Hash verification:', isValid ? '✅ Valid' : '❌ Invalid');
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashAndVerify();
