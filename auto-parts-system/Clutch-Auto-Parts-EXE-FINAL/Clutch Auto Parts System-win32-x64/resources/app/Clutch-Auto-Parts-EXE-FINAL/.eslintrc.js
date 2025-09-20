module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-case-declarations': 'off',
    'no-prototype-builtins': 'off'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js'
  ]
};
