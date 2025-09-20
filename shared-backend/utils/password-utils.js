const bcrypt = require('bcryptjs');

// Password hashing utilities
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};
