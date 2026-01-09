const axios = require('axios');

// Test assessment validation
async function testAssessmentValidation() {
  const baseURL = 'http://localhost:5000/api/employer';
  
  // You'll need to replace this with a valid employer token
  const token = 'your_employer_token_here';
  
  console.log('Testing Assessment Validation...\n');
  
  // Test 1: Empty assessment
  console.log('Test 1: Empty assessment');
  try {
    const response = await axios.post(`${baseURL}/assessments`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
  }
  
  // Test 2: Missing title
  console.log('\nTest 2: Missing title');
  try {
    const response = await axios.post(`${baseURL}/assessments`, {
      type: 'Technical',
      timer: 30,
      questions: [
        {
          question: 'What is JavaScript?',
          options: ['Language', 'Framework', 'Library', 'Database'],
          correctAnswer: 0,
          marks: 1
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
  }
  
  // Test 3: Empty questions
  console.log('\nTest 3: Empty questions');
  try {
    const response = await axios.post(`${baseURL}/assessments`, {
      title: 'Test Assessment',
      type: 'Technical',
      timer: 30,
      questions: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
  }
  
  // Test 4: Question with empty text
  console.log('\nTest 4: Question with empty text');
  try {
    const response = await axios.post(`${baseURL}/assessments`, {
      title: 'Test Assessment',
      type: 'Technical',
      timer: 30,
      questions: [
        {
          question: '',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          marks: 1
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
  }
  
  // Test 5: Question with empty options
  console.log('\nTest 5: Question with empty options');
  try {
    const response = await axios.post(`${baseURL}/assessments`, {
      title: 'Test Assessment',
      type: 'Technical',
      timer: 30,
      questions: [
        {
          question: 'What is JavaScript?',
          options: ['Language', '', 'Library', 'Database'],
          correctAnswer: 0,
          marks: 1
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
  }
  
  console.log('\nValidation tests completed!');
  console.log('\nTo test with a real token:');
  console.log('1. Login as an employer in the frontend');
  console.log('2. Get the token from localStorage');
  console.log('3. Replace "your_employer_token_here" with the actual token');
  console.log('4. Run: node test-assessment-validation.js');
}

testAssessmentValidation();