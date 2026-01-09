// Emergency login fix utility
export const fixLoginIssues = () => {
  
  
  // Clear all authentication data
  const keysToRemove = [
    'candidateToken', 'candidateUser',
    'employerToken', 'employerUser', 
    'adminToken', 'adminUser',
    'placementToken', 'placementUser'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear session storage as well
  sessionStorage.clear();
  
  
  
  // Force reload to reset application state
  window.location.reload();
};

// Check and fix WebSocket connection issues
export const checkWebSocketConnection = () => {
  const wsUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  
  
  // Test connection
  try {
    const testSocket = new WebSocket(wsUrl.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket');
    
    testSocket.onopen = () => {
      
      testSocket.close();
    };
    
    testSocket.onerror = (error) => {
      
      
    };
    
  } catch (error) {
    
  }
};

// Test API connectivity
export const testApiConnection = async () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  
  try {
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
    if (response.ok) {
      
      return true;
    } else {
      
      return false;
    }
  } catch (error) {
    
    return false;
  }
};
