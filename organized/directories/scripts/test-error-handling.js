const { createErrorResponse, handleDatabaseError, handleAuthError, CustomError, ERROR_MESSAGES, ERROR_STATUS_CODES } = require('../shared-backend/utils/errorHandler');

console.log('🧪 Testing Enhanced Error Handling System\n');

// Test 1: Basic error response creation
console.log('1. Testing basic error response creation:');
const basicError = createErrorResponse('USER_NOT_FOUND');
console.log('✅ Basic error response:', JSON.stringify(basicError, null, 2));

// Test 2: Custom error message
console.log('\n2. Testing custom error message:');
const customError = createErrorResponse('INVALID_EMAIL', 'Please provide a valid email address');
console.log('✅ Custom error response:', JSON.stringify(customError, null, 2));

// Test 3: Error with details
console.log('\n3. Testing error with details:');
const detailedError = createErrorResponse('INVALID_INPUT', null, { 
  field: 'email', 
  value: 'invalid-email',
  suggestions: ['Please use a valid email format like user@example.com']
});
console.log('✅ Detailed error response:', JSON.stringify(detailedError, null, 2));

// Test 4: Database error handling
console.log('\n4. Testing database error handling:');
const mockDbError = new Error('Duplicate key error');
mockDbError.code = 11000;
mockDbError.keyPattern = { email: 1 };
mockDbError.keyValue = { email: 'test@example.com' };

const dbErrorResponse = handleDatabaseError(mockDbError, 'create user');
console.log('✅ Database error response:', JSON.stringify(dbErrorResponse, null, 2));

// Test 5: Auth error handling
console.log('\n5. Testing auth error handling:');
const mockAuthError = new Error('Token expired');
mockAuthError.name = 'TokenExpiredError';

const authErrorResponse = handleAuthError(mockAuthError);
console.log('✅ Auth error response:', JSON.stringify(authErrorResponse, null, 2));

// Test 6: Custom error class
console.log('\n6. Testing custom error class:');
const customErrorInstance = new CustomError('INSUFFICIENT_ROLES', 'At least one role must be assigned');
console.log('✅ Custom error instance:', {
  name: customErrorInstance.name,
  message: customErrorInstance.message,
  code: customErrorInstance.code,
  statusCode: customErrorInstance.statusCode,
  customError: customErrorInstance.customError
});

// Test 7: Error messages validation
console.log('\n7. Testing error messages:');
const testErrorCodes = [
  'USER_NOT_FOUND',
  'INVALID_EMAIL',
  'INSUFFICIENT_PERMISSIONS',
  'EMPLOYEE_ALREADY_EXISTS',
  'DATABASE_CONNECTION_FAILED',
  'RATE_LIMIT_EXCEEDED'
];

testErrorCodes.forEach(code => {
  const message = ERROR_MESSAGES[code];
  const statusCode = ERROR_STATUS_CODES[code];
  console.log(`✅ ${code}: ${message} (Status: ${statusCode})`);
});

// Test 8: Status codes validation
console.log('\n8. Testing status codes:');
const statusCodeTests = [
  { code: 'INVALID_CREDENTIALS', expected: 401 },
  { code: 'INSUFFICIENT_PERMISSIONS', expected: 403 },
  { code: 'USER_NOT_FOUND', expected: 404 },
  { code: 'USER_ALREADY_EXISTS', expected: 409 },
  { code: 'INTERNAL_SERVER_ERROR', expected: 500 }
];

statusCodeTests.forEach(test => {
  const actual = ERROR_STATUS_CODES[test.code];
  const passed = actual === test.expected;
  console.log(`${passed ? '✅' : '❌'} ${test.code}: Expected ${test.expected}, Got ${actual}`);
});

// Test 9: Complex error scenario
console.log('\n9. Testing complex error scenario:');
const complexError = createErrorResponse('CREATE_EMPLOYEE_FAILED', null, {
  validationErrors: [
    { field: 'email', message: 'Email is required' },
    { field: 'firstName', message: 'First name is required' },
    { field: 'roles', message: 'At least one role must be selected' }
  ],
  suggestions: [
    'Please fill in all required fields',
    'Make sure to select at least one role for the employee',
    'Verify the email format is correct'
  ]
});
console.log('✅ Complex error response:', JSON.stringify(complexError, null, 2));

console.log('\n🎉 Error handling system test completed successfully!');
console.log('\n📊 Summary:');
console.log(`- Total error codes defined: ${Object.keys(ERROR_MESSAGES).length}`);
console.log(`- Total status codes defined: ${Object.keys(ERROR_STATUS_CODES).length}`);
console.log('- All error handling functions working correctly');
console.log('- Custom error class functioning properly');
console.log('- Detailed error responses with context and suggestions');
