// Token validation test
const testToken = () => {
  const token = localStorage.getItem('candidateToken');
  
  if (!token) {
    console.log('No token found');
    return;
  }
  
  try {
    // Decode JWT token (without verification - just to see the payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    console.log('Token payload:', payload);
    console.log('User ID:', payload.id);
    console.log('Role:', payload.role);
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Is expired:', Date.now() >= payload.exp * 1000);
    
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

// Export for browser console
window.testToken = testToken;