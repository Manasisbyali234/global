const axios = require('axios');

// Test script to verify assessment submission endpoint
async function testAssessmentSubmission() {
  try {
    console.log('Testing assessment submission endpoint...');
    
    // Test the health endpoint first
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test the assessment submission endpoint with invalid data to see error handling
    try {
      const testResponse = await axios.post('http://localhost:5000/api/candidate/assessments/submit', {
        attemptId: 'invalid-id',
        violations: []
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Assessment endpoint is responding with proper error handling:', error.response.status, error.response.data);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssessmentSubmission();