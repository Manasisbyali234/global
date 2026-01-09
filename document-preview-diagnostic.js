// Document Preview Diagnostic Script
// Run this in your browser console on the admin employer details page

const diagnosticTest = async () => {
    console.log('=== Document Preview Diagnostic Test ===');
    
    // 1. Check if API_BASE_URL is correct
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log('1. API Base URL:', API_BASE_URL);
    
    // 2. Check authentication token
    const token = localStorage.getItem('adminToken');
    console.log('2. Auth Token Present:', !!token);
    console.log('   Token Length:', token ? token.length : 0);
    
    // 3. Get current employer ID from URL
    const urlParts = window.location.pathname.split('/');
    const employerId = urlParts[urlParts.length - 1];
    console.log('3. Current Employer ID:', employerId);
    
    // 4. Test API connectivity
    try {
        const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        console.log('4. API Health Check:', healthResponse.ok ? 'PASS' : 'FAIL');
    } catch (error) {
        console.log('4. API Health Check: FAIL -', error.message);
    }
    
    // 5. Test employer profile endpoint
    try {
        const profileResponse = await fetch(`${API_BASE_URL}/admin/employers/${employerId}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('5. Profile Endpoint:', profileResponse.ok ? 'PASS' : 'FAIL');
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('   Profile Data Available:', !!profileData.profile);
            
            // Check which documents are available
            const documents = ['panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation', 'logo', 'coverImage'];
            documents.forEach(doc => {
                const hasDoc = profileData.profile[doc];
                console.log(`   ${doc}:`, hasDoc ? 'AVAILABLE' : 'NOT FOUND');
                if (hasDoc) {
                    console.log(`     Data Length: ${hasDoc.length}`);
                    console.log(`     Starts with data:: ${hasDoc.startsWith('data:')}`);
                }
            });
        }
    } catch (error) {
        console.log('5. Profile Endpoint: FAIL -', error.message);
    }
    
    // 6. Test document view endpoint for each document type
    const documentTypes = ['panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation'];
    
    for (const docType of documentTypes) {
        try {
            console.log(`6. Testing ${docType}:`);
            const docResponse = await fetch(`${API_BASE_URL}/admin/employers/${employerId}/view-document/${docType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log(`   Status: ${docResponse.status}`);
            console.log(`   Content-Type: ${docResponse.headers.get('content-type')}`);
            console.log(`   Content-Length: ${docResponse.headers.get('content-length')}`);
            
            if (!docResponse.ok) {
                const errorText = await docResponse.text();
                console.log(`   Error: ${errorText}`);
            } else {
                const blob = await docResponse.blob();
                console.log(`   Blob Size: ${blob.size} bytes`);
                console.log(`   Blob Type: ${blob.type}`);
            }
        } catch (error) {
            console.log(`   ${docType}: FAIL -`, error.message);
        }
    }
    
    console.log('=== Diagnostic Test Complete ===');
};

// Run the diagnostic
diagnosticTest();