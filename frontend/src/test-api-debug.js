// Simple API test to debug the candidate dashboard issue
const testCandidateAPI = async () => {
  const token = localStorage.getItem('candidateToken');
  console.log('=== API DEBUG TEST ===');
  console.log('Token exists:', !!token);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    console.log('No token found - user needs to login');
    return;
  }

  try {
    // Test 1: Profile API
    console.log('\n--- Testing Profile API ---');
    const profileResponse = await fetch('http://localhost:5000/api/candidate/profile', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile API Status:', profileResponse.status);
    console.log('Profile API Headers:', Object.fromEntries(profileResponse.headers.entries()));
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('Profile API Response:', profileData);
      
      if (profileData.success && profileData.profile) {
        console.log('Profile found!');
        console.log('Candidate ID:', profileData.profile.candidateId);
        console.log('Name from candidateId:', profileData.profile.candidateId?.name);
        console.log('First name:', profileData.profile.firstName);
        console.log('Location:', profileData.profile.location);
      } else {
        console.log('No profile found or API returned success: false');
      }
    } else {
      const errorText = await profileResponse.text();
      console.log('Profile API Error:', errorText);
    }

    // Test 2: Dashboard Stats API
    console.log('\n--- Testing Dashboard Stats API ---');
    const statsResponse = await fetch('http://localhost:5000/api/candidate/dashboard/stats', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Stats API Status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Stats API Response:', statsData);
      
      if (statsData.success && statsData.candidate) {
        console.log('Candidate stats found!');
        console.log('Candidate name:', statsData.candidate.name);
        console.log('Candidate credits:', statsData.candidate.credits);
      } else {
        console.log('No candidate stats found or API returned success: false');
      }
    } else {
      const errorText = await statsResponse.text();
      console.log('Stats API Error:', errorText);
    }

    // Test 3: Basic Dashboard API
    console.log('\n--- Testing Basic Dashboard API ---');
    const dashboardResponse = await fetch('http://localhost:5000/api/candidate/dashboard', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard API Status:', dashboardResponse.status);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard API Response:', dashboardData);
      
      if (dashboardData.success && dashboardData.candidate) {
        console.log('Dashboard candidate found!');
        console.log('Candidate name:', dashboardData.candidate.name);
      } else {
        console.log('No dashboard candidate found or API returned success: false');
      }
    } else {
      const errorText = await dashboardResponse.text();
      console.log('Dashboard API Error:', errorText);
    }

  } catch (error) {
    console.error('API Test Error:', error);
  }
  
  console.log('=== END API DEBUG TEST ===');
};

// Export for use in browser console
window.testCandidateAPI = testCandidateAPI;

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  console.log('API Debug script loaded. Run testCandidateAPI() in console to test.');
}