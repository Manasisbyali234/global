// Utility to check if user is authenticated and redirect if not
export const checkAuthAndRedirect = (userType = 'candidate') => {
  const token = localStorage.getItem(`${userType}Token`);
  
  if (!token) {
    // Clear any stale data
    localStorage.clear();
    
    // Redirect to appropriate login page
    const loginPaths = {
      candidate: '/login',
      employer: '/login?tab=employer', 
      admin: '/admin-login',
      placement: '/login?tab=placement'
    };
    
    window.location.href = loginPaths[userType] || '/login';
    return false;
  }
  
  return true;
};

// Check if token is expired (basic check)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Validate current authentication status
export const validateAuth = (userType = 'candidate') => {
  const token = localStorage.getItem(`${userType}Token`);
  
  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    return false;
  }
  
  return true;
};
