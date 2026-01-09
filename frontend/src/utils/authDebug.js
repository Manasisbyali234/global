

// Authentication debugging utility
export const debugAuth = () => {
    const tokens = {
        placement: localStorage.getItem('placementToken'),
        candidate: localStorage.getItem('candidateToken'),
        employer: localStorage.getItem('employerToken'),
        admin: localStorage.getItem('adminToken')
    };
    
    const users = {
        placement: localStorage.getItem('placementUser'),
        candidate: localStorage.getItem('candidateUser'),
        employer: localStorage.getItem('employerUser'),
        admin: localStorage.getItem('adminUser')
    };
    
    const activeUserType = Object.keys(tokens).find(type => tokens[type]);
    
    return { tokens, users, activeUserType };
};

// Test API connectivity
export const testAPIConnection = async () => {
    try {
        const response = await fetch('/health');
        const text = await response.text();
        
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            throw new Error('Backend not accessible');
        }
        
        const data = JSON.parse(text);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Test placement authentication
export const testPlacementAuth = async () => {
    const token = localStorage.getItem('placementToken');
    if (!token) {
        return { success: false, error: 'No placement token found' };
    }
    
    try {
        const response = await fetch('/api/placement/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 0 || response.type === 'opaque') {
                throw new Error('Backend server not running');
            }
            return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, status: response.status };
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message, status: error.status };
    }
};

// Fix authentication issues
export const fixAuthIssues = async () => {
    const { activeUserType } = debugAuth();
    
    if (!activeUserType) {
        window.location.href = '/login';
        return;
    }
    
    if (activeUserType === 'placement') {
        const result = await testPlacementAuth();
        if (!result.success) {
            localStorage.removeItem('placementToken');
            localStorage.removeItem('placementUser');
            window.location.href = '/login';
        }
        return result;
    }
};
