export const isAuthenticated = (role) => {
    return !!localStorage.getItem(`${role}Token`);
};

export const getCurrentUser = (role) => {
    const token = localStorage.getItem(`${role}Token`);
    const user = localStorage.getItem(`${role}User`);
    
    if (token && user) {
        try {
            return JSON.parse(user);
        } catch (error) {
            return null;
        }
    }
    return null;
};

export const logout = () => {
    localStorage.removeItem('candidateToken');
    localStorage.removeItem('employerToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('candidateUser');
    localStorage.removeItem('employerUser');
    localStorage.removeItem('adminUser');
};

export const redirectToLogin = (navigate, from = null) => {
    navigate('/login', { state: { from } });
};
