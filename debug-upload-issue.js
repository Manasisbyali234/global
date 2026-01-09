const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testResumeUpload() {
  try {
    console.log('=== DEBUGGING RESUME UPLOAD ISSUE ===\n');
    
    // Step 1: Test if backend is running
    console.log('1. Testing backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      console.log('Make sure the backend server is running on port 5000');
      return;
    }
    
    // Step 2: Test API health
    console.log('\n2. Testing API health...');
    try {
      const apiHealthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ API is working:', apiHealthResponse.data);
    } catch (error) {
      console.log('❌ API health check failed:', error.message);
      return;
    }
    
    // Step 3: Test upload endpoint without auth (should fail with 401)
    console.log('\n3. Testing upload endpoint without auth...');
    try {
      const form = new FormData();
      // Create a small test file
      form.append('resume', Buffer.from('test file content'), {
        filename: 'test.pdf',
        contentType: 'application/pdf'
      });
      
      const response = await axios.post('http://localhost:5000/api/candidate/upload-resume', form, {
        headers: {
          ...form.getHeaders()
        }
      });
      console.log('❌ Unexpected success (should have failed with 401):', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
        console.log('Response data:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Headers:', error.response.headers);
          console.log('Data:', error.response.data);
        }
      }
    }
    
    // Step 4: Check if the issue is with the proxy
    console.log('\n4. Testing frontend proxy...');
    try {
      const proxyResponse = await axios.get('http://localhost:3000/api/health');
      console.log('✅ Frontend proxy is working:', proxyResponse.data);
    } catch (error) {
      console.log('❌ Frontend proxy failed:', error.message);
      console.log('This might be the issue - the frontend proxy is not working correctly');
    }
    
    console.log('\n=== DIAGNOSIS COMPLETE ===');
    console.log('\nPossible solutions:');
    console.log('1. Make sure both frontend (port 3000) and backend (port 5000) are running');
    console.log('2. Try uploading directly to http://localhost:5000/api/candidate/upload-resume');
    console.log('3. Check browser network tab for the actual request being made');
    console.log('4. Verify the authentication token is being sent correctly');
    
  } catch (error) {
    console.error('Diagnostic script failed:', error.message);
  }
}

testResumeUpload();