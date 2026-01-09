// Test script to debug profile update issue
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testProfileUpdate() {
  try {
    // First, let's test if the server is running
    console.log('Testing server connection...');
    const healthResponse = await fetch(`${API_BASE_URL}/public/stats`);
    console.log('Server status:', healthResponse.status);
    
    // You'll need to replace this with a valid placement token
    const token = 'YOUR_PLACEMENT_TOKEN_HERE';
    
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      collegeName: 'Test College'
    };
    
    console.log('Testing profile update with data:', testData);
    
    const response = await fetch(`${API_BASE_URL}/placement/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testProfileUpdate();