// Test the placement profile update API endpoint
const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:5000/api';

// First, let's get a valid token by logging in
async function testLogin() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'development@metromindz.com',
      password: 'password123' // You'll need to use the correct password
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/placement/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Login response:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
}

// Test profile update
async function testProfileUpdate(token) {
  return new Promise((resolve, reject) => {
    const updateData = JSON.stringify({
      firstName: 'Updated',
      lastName: 'Name',
      phone: '9876543210',
      collegeName: 'Updated College'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/placement/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(updateData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Profile update response:', result);
          resolve(result);
        } catch (error) {
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(updateData);
    req.end();
  });
}

// Test server health
async function testHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Health check response:', result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing server health...');
    await testHealth();
    
    console.log('\nTesting login...');
    const loginResult = await testLogin();
    
    if (loginResult.success && loginResult.token) {
      console.log('\nTesting profile update...');
      await testProfileUpdate(loginResult.token);
    } else {
      console.log('Login failed, cannot test profile update');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

runTests();