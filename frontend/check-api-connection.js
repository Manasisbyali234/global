// Run this script to check your API connection
// Usage: node check-api-connection.js

const http = require('http');
const https = require('https');

// Read the API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('Checking API connection...');
console.log('API URL:', API_URL);

const url = new URL(API_URL + '/health');
const client = url.protocol === 'https:' ? https : http;

const req = client.get(url, (res) => {
  console.log('\n✅ Connection successful!');
  console.log('Status Code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Backend server is running correctly!');
    } else {
      console.log('\n⚠️  Backend server responded but with an error status');
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ Connection failed!');
  console.log('Error:', error.message);
  console.log('\nPossible issues:');
  console.log('1. Backend server is not running');
  console.log('2. API URL is incorrect');
  console.log('3. Firewall is blocking the connection');
  console.log('\nTo fix:');
  console.log('1. Start your backend server: cd backend && npm start');
  console.log('2. Check your .env file for correct REACT_APP_API_URL');
  console.log('3. Make sure the backend is accessible from your network');
});

req.end();
