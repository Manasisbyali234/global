// Backend health check and API test
const testBackendHealth = async () => {
  console.log('=== BACKEND HEALTH CHECK ===');
  
  try {
    // Test 1: Basic health check
    console.log('1. Testing basic health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    } else {
      console.log('Health check failed');
      return;
    }
    
    // Test 2: API health check
    console.log('2. Testing API health endpoint...');
    const apiHealthResponse = await fetch('http://localhost:5000/api/health');
    console.log('API health check status:', apiHealthResponse.status);
    
    if (apiHealthResponse.ok) {
      const apiHealthData = await apiHealthResponse.json();
      console.log('API health check response:', apiHealthData);
    }
    
    // Test 3: Check if candidate token exists
    const token = localStorage.getItem('candidateToken');
    console.log('3. Candidate token exists:', !!token);
    
    if (token) {
      // Test 4: Test protected endpoint
      console.log('4. Testing protected endpoint...');
      const protectedResponse = await fetch('http://localhost:5000/api/candidate/dashboard/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Protected endpoint status:', protectedResponse.status);
      
      if (protectedResponse.ok) {
        const protectedData = await protectedResponse.json();
        console.log('Protected endpoint response:', protectedData);
        
        if (protectedData.success && protectedData.candidate) {
          console.log('✅ Candidate name found:', protectedData.candidate.name);
        } else {
          console.log('❌ No candidate data in response');
        }
      } else {
        const errorText = await protectedResponse.text();
        console.log('Protected endpoint error:', errorText);
      }
    } else {
      console.log('❌ No token found - user needs to login');
    }
    
  } catch (error) {
    console.error('Health check error:', error);
  }
  
  console.log('=== END HEALTH CHECK ===');
};

// Export for browser console
window.testBackendHealth = testBackendHealth;

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  console.log('Backend health check script loaded. Run testBackendHealth() in console to test.');
}