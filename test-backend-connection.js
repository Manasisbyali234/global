const axios = require('axios');

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Health check:', healthResponse.data);
    
    // Test API health endpoint
    const apiHealthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('API Health check:', apiHealthResponse.data);
    
    console.log('Backend is running correctly and returning JSON responses.');
    
  } catch (error) {
    console.error('Backend connection test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBackendConnection();