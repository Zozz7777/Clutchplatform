module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    // Disable console.log in production
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript for prop validation
    
    // General rules
    'prefer-const': 'warn',
    'no-var': 'warn',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'no-case-declarations': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'webpack*.js',
  ],
};
