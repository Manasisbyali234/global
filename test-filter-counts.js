const fetch = require('node-fetch');

async function testFilterCounts() {
    try {
        console.log('Testing filter counts API endpoint...');
        
        const response = await fetch('http://localhost:5000/api/public/jobs/filter-counts');
        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('\n✅ API endpoint working correctly!');
            console.log('Job Types count:', data.counts.jobTypes.length);
            console.log('Locations count:', data.counts.locations.length);
            console.log('Categories count:', data.counts.categories.length);
            console.log('Designations count:', data.counts.designations.length);
        } else {
            console.log('❌ API returned success: false');
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

// Also test the regular jobs endpoint to compare
async function testJobsEndpoint() {
    try {
        console.log('\nTesting regular jobs API endpoint...');
        
        const response = await fetch('http://localhost:5000/api/public/jobs?limit=5');
        const data = await response.json();
        
        console.log('Jobs API status:', response.status);
        console.log('Total jobs found:', data.totalCount || 0);
        console.log('Jobs returned:', data.jobs?.length || 0);
        
    } catch (error) {
        console.error('❌ Error testing jobs API:', error.message);
    }
}

testFilterCounts();
testJobsEndpoint();