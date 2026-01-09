const axios = require('axios');

// Test the view answers API endpoint
async function testViewAnswersAPI() {
  try {
    const attemptId = '6956c551bffad0c4cd17acf1';
    
    // You'll need to replace this with a valid employer token
    const token = 'YOUR_EMPLOYER_TOKEN_HERE';
    
    console.log('Testing view answers API...');
    console.log('Attempt ID:', attemptId);
    console.log('API URL:', `http://localhost:5000/api/employer/assessment-attempts/${attemptId}`);
    
    const response = await axios.get(`http://localhost:5000/api/employer/assessment-attempts/${attemptId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ API call successful');
      console.log('Attempt found:', !!response.data.attempt);
      console.log('Assessment found:', !!response.data.attempt?.assessmentId);
      console.log('Answers count:', response.data.attempt?.answers?.length || 0);
      
      if (response.data.attempt?.answers?.length > 0) {
        console.log('Sample answer:', response.data.attempt.answers[0]);
      }
    } else {
      console.log('❌ API returned success: false');
    }
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Error message:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
  }
}

// Instructions for running this test
console.log(`
To test the API:
1. Make sure your backend server is running on port 5000
2. Get a valid employer token by logging in as an employer
3. Replace 'YOUR_EMPLOYER_TOKEN_HERE' with the actual token
4. Run: node test-view-answers-api.js
`);

// Uncomment the line below to run the test
// testViewAnswersAPI();