const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image buffer
const createTestImage = () => {
  // Create a simple 1x1 pixel PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return pngBuffer;
};

async function testCaptureUpload() {
  try {
    console.log('🧪 Testing capture upload endpoint...\n');

    // Create test image
    const imageBuffer = createTestImage();
    console.log('✅ Created test image buffer');

    // Create form data
    const formData = new FormData();
    formData.append('capture', imageBuffer, {
      filename: 'test-capture.png',
      contentType: 'image/png'
    });
    formData.append('attemptId', '507f1f77bcf86cd799439011'); // Dummy ObjectId
    formData.append('captureIndex', '0');

    console.log('📤 Sending capture upload request...');

    // Test the endpoint
    const response = await axios.post('http://localhost:5000/api/candidate/assessments/capture', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer dummy-token' // This will fail auth but test the endpoint
      },
      timeout: 5000
    });

    console.log('✅ Response:', response.data);

  } catch (error) {
    if (error.response) {
      console.log('📋 Server responded with:', error.response.status);
      console.log('📋 Response data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('✅ Endpoint exists (authentication failed as expected)');
      } else if (error.response.status === 404) {
        console.log('❌ Endpoint not found - route issue');
      } else {
        console.log('⚠️ Other server error');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running on localhost:5000');
    } else {
      console.log('❌ Request error:', error.message);
    }
  }
}

testCaptureUpload();