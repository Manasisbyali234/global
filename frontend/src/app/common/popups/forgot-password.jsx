import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    specialChars: false
  });
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const startResendCooldown = () => {
    setCanResend(false);
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!email.includes('@')) {
      setMessage('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const endpoints = [
        `${apiUrl}/api/candidate/password/send-otp`,
        `${apiUrl}/api/employer/password/send-otp`,
        `${apiUrl}/api/admin/password/send-otp`,
        `${apiUrl}/api/placement/password/send-otp`
      ];
      
      let success = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMessage('OTP sent to your email successfully!');
          setOtpSent(true);
          startResendCooldown();
          success = true;
          break;
        }
      }
      
      if (!success) {
        setMessage('Email not registered');
      }
    } catch (error) {
      setMessage('Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const endpoints = [
        `${apiUrl}/api/candidate/password/send-otp`,
        `${apiUrl}/api/employer/password/send-otp`,
        `${apiUrl}/api/admin/password/send-otp`,
        `${apiUrl}/api/placement/password/send-otp`
      ];
      
      let success = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMessage('OTP resent to your email successfully!');
          startResendCooldown();
          success = true;
          break;
        }
      }
      
      if (!success) {
        setMessage('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setMessage('Unable to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!Object.values(passwordValidation).every(v => v === true)) {
      setMessage('Please meet all password requirements.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const endpoints = [
        `${apiUrl}/api/candidate/password/verify-otp`,
        `${apiUrl}/api/employer/password/verify-otp`,
        `${apiUrl}/api/admin/password/verify-otp`,
        `${apiUrl}/api/placement/password/verify-otp`
      ];
      
      let success = false;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMessage('Password reset successful! Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          success = true;
          break;
        }
      }
      
      if (!success) {
        setMessage('Invalid or expired OTP');
      }
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Forgot Password</h2>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn twm-bg-orange w-100" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  const pwd = e.target.value;
                  setNewPassword(pwd);
                  setPasswordValidation({
                    length: pwd.length >= 6,
                    uppercase: /[A-Z]/.test(pwd),
                    specialChars: /[@#!%$*?]/.test(pwd)
                  });
                }}
                required
                style={{ paddingRight: '40px', height: '38px', padding: '6px 40px 6px 12px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '0',
                  height: '20px',
                  width: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
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
          <button type="submit" className="btn twm-bg-orange w-100">
            Reset Password
          </button>
          <div className="mt-3 text-center">
            <p className="mb-2">Didn't receive the OTP?</p>
            <button 
              type="button" 
              className="btn btn-link p-0" 
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              style={{ color: canResend ? '#ff7a00' : '#6c757d' }}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}

export default ForgotPassword;
