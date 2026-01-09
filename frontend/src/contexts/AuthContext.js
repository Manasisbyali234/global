import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediate auth check without delay
    const timeoutId = setTimeout(checkAuthStatus, 0);
    
    const handleProfileUpdate = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('employerProfileUpdated', handleProfileUpdate);
    window.addEventListener('candidateProfileUpdated', handleProfileUpdate);
    window.addEventListener('PlacementfileUpdated', handleProfileUpdate);
    window.addEventListener('adminProfileUpdated', handleProfileUpdate);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('employerProfileUpdated', handleProfileUpdate);
      window.removeEventListener('candidateProfileUpdated', handleProfileUpdate);
      window.removeEventListener('PlacementfileUpdated', handleProfileUpdate);
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check tokens in priority order for faster detection
      const tokens = {
        placement: localStorage.getItem('placementToken'),
        candidate: localStorage.getItem('candidateToken'),
        employer: localStorage.getItem('employerToken'),
        admin: localStorage.getItem('adminToken'),
        'sub-admin': localStorage.getItem('subAdminToken')
      };

      // Find first valid token
      for (const [type, token] of Object.entries(tokens)) {
        if (token) {
          try {
            const userDataKey = type === 'sub-admin' ? 'subAdminData' : `${type}User`;
            let userData = JSON.parse(localStorage.getItem(userDataKey) || '{}');
            
            if (token) {
              try {
                let endpoint;
                if (type === 'employer') endpoint = 'http://localhost:5000/api/employer/profile';
                else if (type === 'candidate') endpoint = 'http://localhost:5000/api/candidate/profile';
                else if (type === 'placement') endpoint = 'http://localhost:5000/api/placement/profile';
                else if (type === 'admin') endpoint = 'http://localhost:5000/api/admin/profile';
                
                if (endpoint) {
                  const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const data = await response.json();
                  if (data.success && data.profile) {
                    // For candidates, merge candidateId data with profile data
                    if (type === 'candidate' && data.profile.candidateId) {
                      userData = { ...userData, ...data.profile, ...data.profile.candidateId };
                    } else {
                      userData = { ...userData, ...data.profile };
                    }
                    localStorage.setItem(userDataKey, JSON.stringify(userData));
                  }
                }
              } catch (e) {}
            }
            
            setUser(userData);
            setUserType(type);
            setLoading(false);
            return;
          } catch (e) {
            // Invalid user data, remove token
            const tokenKey = type === 'sub-admin' ? 'subAdminToken' : `${type}Token`;
            const userKey = type === 'sub-admin' ? 'subAdminData' : `${type}User`;
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(userKey);
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
    
    setLoading(false);
  };

  const login = async (credentials, type) => {
    try {
      let response;
      
      switch (type) {
        case 'candidate':
          response = await api.candidateLogin(credentials);
          break;
        case 'employer':
          response = await api.employerLogin(credentials);
          break;
        case 'admin':
          response = await api.adminLogin(credentials);
          break;
        case 'sub-admin':
          response = await api.subAdminLogin(credentials);
          break;
        case 'placement':
          response = await api.placementLogin(credentials);
          break;
        default:
          throw new Error('Invalid user type');
      }

      if (response.success) {
        const userData = response[type] || response.subAdmin;
        const token = response.token;
        
        console.log('Login response:', { success: response.success, hasToken: !!token, hasUserData: !!userData });
        
        const tokenKey = type === 'sub-admin' ? 'subAdminToken' : `${type}Token`;
        const userKey = type === 'sub-admin' ? 'subAdminData' : `${type}User`;
        
        localStorage.setItem(tokenKey, token);
        localStorage.setItem(userKey, JSON.stringify(userData));
        
        console.log('Token stored in localStorage:', tokenKey, localStorage.getItem(tokenKey) ? 'success' : 'failed');
        
        setUser(userData);
        setUserType(type);
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    // Clear all possible tokens
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('employerToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('subAdminToken');
    localStorage.removeItem('placementToken');
    localStorage.removeItem('candidateUser');
    localStorage.removeItem('employerUser');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('subAdminData');
    localStorage.removeItem('placementUser');
    
    setUser(null);
    setUserType(null);
  };

  const isAuthenticated = () => {
    return user !== null && userType !== null;
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    isAuthenticated,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
