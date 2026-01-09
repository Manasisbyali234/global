const { validatePhoneNumber, formatPhoneNumber } = require('./phoneValidation');

// Test cases for phone validation
const testCases = [
  // Valid cases
  { input: '9876543210', expected: true, description: 'Valid 10-digit number' },
  { input: '1234567890', expected: true, description: 'Valid 10-digit number starting with 1' },
  { input: '0123456789', expected: true, description: 'Valid 10-digit number starting with 0' },
  { input: '5876543210', expected: true, description: 'Valid 10-digit number starting with 5' },
  
  // Invalid cases
  { input: '', expected: false, description: 'Empty string' },
  { input: '98765432', expected: false, description: 'Too short (8 digits)' },
  { input: '987654321012', expected: false, description: 'Too long (12 digits)' },
  { input: '+91 9876543210', expected: false, description: 'Contains country code' },
  { input: 'abcd123456', expected: false, description: 'Contains letters' },
  { input: '9876-543-210', expected: false, description: 'Contains hyphens' },
  { input: '9876 543 210', expected: false, description: 'Contains spaces' },
  { input: '987654321', expected: false, description: 'Too short (9 digits)' },
  { input: '98765432101', expected: false, description: 'Too long (11 digits)' },
];

const runPhoneValidationTests = () => {
  console.log('Running Phone Validation Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = validatePhoneNumber(testCase.input);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result.isValid}`);
      console.log(`   Message: ${result.message}`);
    }
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  // Test formatting
  console.log('\nTesting Phone Formatting:');
  const formatTests = [
    '9876543210',
    '+91 9876543210',
    '9876-543-210',
    '9876 543 210',
    '98765432101234',
    ''
  ];
  
  formatTests.forEach(input => {
    const formatted = formatPhoneNumber(input);
    console.log(`"${input}" → "${formatted}"`);
  });
};

// Export for use in other files
module.exports = {
  runPhoneValidationTests,
  testCases
};

// Run tests if this file is executed directly
if (require.main === module) {
  runPhoneValidationTests();
}