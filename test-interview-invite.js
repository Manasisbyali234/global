// Test script for interview invite API
const fetch = require('node-fetch');

const testInterviewInvite = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/employer/send-interview-invite/TEST_APPLICATION_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer TEST_TOKEN'
      },
      body: JSON.stringify({
        interviewDate: '2025-12-11',
        interviewTime: '11:48',
        meetingLink: 'https://meet.google.com/test-link',
        instructions: 'Test instructions'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Test error:', error);
  }
};

console.log('Testing interview invite API...');
// testInterviewInvite();