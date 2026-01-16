import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    specialChars: false
  });

  const validatePassword = (pwd) => {
    setPasswordValidation({
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      specialChars: /[@#!%$*?]/.test(pwd)
    });
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    validatePassword(pwd);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Object.values(passwordValidation).every(v => v === true)) {
      setError('Please meet all password requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/candidate/password/confirm-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: newPassword.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password');
      }

      setMessage('Your password has been reset successfully. Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: '500px' }}>
      <h2 className="mb-2">Reset Password</h2>
      <p className="text-muted mb-4">Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              style={{ paddingRight: '40px' }}
            />
            <i
              className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#6c757d'
              }}
            ></i>
          </div>
          {newPassword && (
            <div style={{ marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <h6 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#495057' }}>Password Requirements:</h6>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '6px 0', fontSize: '13px', color: passwordValidation.length ? '#28a745' : '#dc3545' }}>
                  <i className={`fa ${passwordValidation.length ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                  At least 6 characters
                </li>
                <li style={{ padding: '6px 0', fontSize: '13px', color: passwordValidation.uppercase ? '#28a745' : '#dc3545' }}>
                  <i className={`fa ${passwordValidation.uppercase ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                  One uppercase letter
                </li>
                <li style={{ padding: '6px 0', fontSize: '13px', color: passwordValidation.specialChars ? '#28a745' : '#dc3545' }}>
                  <i className={`fa ${passwordValidation.specialChars ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                  One special character (@#!%$*?)
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default ResetPassword;
