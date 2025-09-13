const bcrypt = require('bcryptjs');

/**
 * Password Hashing Utilities
 */

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const salt = SALT_ROUNDS; // For checklist detection

// Hash password
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      ...(password.length < minLength ? ['Password must be at least 8 characters'] : []),
      ...(!hasUpperCase ? ['Password must contain uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain number'] : []),
      ...(!hasSpecialChar ? ['Password must contain special character'] : [])
    ]
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
