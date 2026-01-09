// Authentication API utilities
const API_BASE_URL = 'http://localhost:5000/api';

export const authAPI = {
  // Password reset for candidates
  candidateResetPassword: (email) => {
    return fetch(`${API_BASE_URL}/candidate/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Password reset failed');
      }
      return res.json();
    });
  },

  // Confirm password reset for candidates
  candidateConfirmReset: (token, newPassword) => {
    return fetch(`${API_BASE_URL}/candidate/password/confirm-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Password reset confirmation failed');
      }
      return res.json();
    });
  },

  // Change password for authenticated candidates
  candidateChangePassword: (currentPassword, newPassword) => {
    const token = localStorage.getItem('candidateToken');
    return fetch(`${API_BASE_URL}/candidate/password/change`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Password change failed');
      }
      return res.json();
    });
  }
};
