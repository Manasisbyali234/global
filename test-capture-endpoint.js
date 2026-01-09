const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the capture upload endpoint
async function testCaptureEndpoint() {
    try {
        console.log('🧪 Testing Capture Upload Endpoint...\n');

        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        // Save test image temporarily
        const testImagePath = path.join(__dirname, 'test-capture.png');
        fs.writeFileSync(testImagePath, testImageBuffer);

        console.log('✅ Test image created');

        // Create form data
        const formData = new FormData();
        formData.append('capture', fs.createReadStream(testImagePath), {
            filename: 'test-capture.jpg',
            contentType: 'image/jpeg'
        });
        formData.append('attemptId', 'test-attempt-id-123');
        formData.append('captureIndex', '0');

        console.log('📋 Form data prepared');

        // Test endpoint (replace with your actual server URL and token)
        const serverUrl = 'http://localhost:5000';
        const testToken = 'your-test-token-here'; // Replace with actual token

        console.log(`🔗 Testing endpoint: ${serverUrl}/api/candidate/assessments/capture`);

        try {
            const response = await axios.post(`${serverUrl}/api/candidate/assessments/capture`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${testToken}`
                },
                timeout: 10000
            });

            console.log('✅ Upload successful!');
            console.log('Response:', response.data);

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('⚠️  Server not running on localhost:5000');
                console.log('   Make sure your backend server is started');
            } else if (error.response) {
                console.log('❌ Server responded with error:');
                console.log('   Status:', error.response.status);
                console.log('   Message:', error.response.data?.message || 'Unknown error');
                console.log('   Full response:', error.response.data);
            } else {
                console.log('❌ Request failed:', error.message);
            }
        }

        // Cleanup
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('🧹 Test image cleaned up');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test endpoint availability
async function testEndpointAvailability() {
    console.log('🔍 Testing endpoint availability...\n');

    const endpoints = [
        'http://localhost:5000/health',
        'http://localhost:5000/api/candidate/assessments/capture',
        'http://localhost:3000' // Frontend
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(endpoint, { timeout: 5000 });
            console.log(`✅ ${endpoint} - Available (${response.status})`);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${endpoint} - Not running`);
            } else if (error.response) {
                console.log(`⚠️  ${endpoint} - Responded with ${error.response.status}`);
            } else {
                console.log(`❌ ${endpoint} - ${error.message}`);
            }
        }
    }
    console.log();
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Capture Endpoint Tests\n');
    console.log('=' .repeat(50));
    
    await testEndpointAvailability();
    await testCaptureEndpoint();
    
    console.log('=' .repeat(50));
    console.log('✨ Tests completed!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Make sure your backend server is running on port 5000');
    console.log('2. Replace "your-test-token-here" with a valid candidate token');
    console.log('3. Create a test assessment attempt in your database');
    console.log('4. Update the attemptId in the test to match your test attempt');
    console.log('5. Open the debug-webcam-capture.html file in your browser to test frontend');
}

runTests();