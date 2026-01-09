const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
    preferredLocations: ['Mumbai', 'Delhi', 'Bangalore'],
    remoteWork: true,
    willingToRelocate: false,
    noticePeriod: '1-month',
    expectedSalary: 500000,
    jobType: 'full-time'
};

async function testWorkLocationAPI() {
    try {
        console.log('Testing Work Location Preferences API...\n');

        // You'll need to replace this with a valid candidate token
        const token = 'YOUR_CANDIDATE_TOKEN_HERE';
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Test 1: Update work location preferences
        console.log('1. Testing PUT /candidate/work-location-preferences');
        console.log('Sending data:', JSON.stringify(testData, null, 2));
        
        const updateResponse = await axios.put(
            `${API_BASE_URL}/candidate/work-location-preferences`,
            testData,
            { headers }
        );
        
        console.log('Update Response:', updateResponse.data);
        console.log('✅ Update successful\n');

        // Test 2: Get work location preferences
        console.log('2. Testing GET /candidate/work-location-preferences');
        
        const getResponse = await axios.get(
            `${API_BASE_URL}/candidate/work-location-preferences`,
            { headers }
        );
        
        console.log('Get Response:', JSON.stringify(getResponse.data, null, 2));
        console.log('✅ Get successful\n');

        console.log('All tests passed! 🎉');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 Note: You need to replace YOUR_CANDIDATE_TOKEN_HERE with a valid candidate token');
            console.log('   You can get this by logging in as a candidate and copying the token from localStorage');
        }
    }
}

// Run the test
testWorkLocationAPI();