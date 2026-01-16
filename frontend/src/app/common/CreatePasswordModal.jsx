import React, { useState, useEffect } from 'react';
import { disableBodyScroll, enableBodyScroll } from '../../utils/scrollUtils';

function CreatePasswordModal({ modalId = 'createPasswordModal', userType = 'candidate' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        specialChars: false
    });

    useEffect(() => {
        const modal = document.getElementById(modalId);
        const handleModalShow = () => disableBodyScroll();
        const handleModalHide = () => enableBodyScroll();

        if (modal) {
            modal.addEventListener('show.bs.modal', handleModalShow);
            modal.addEventListener('hide.bs.modal', handleModalHide);

            return () => {
                modal.removeEventListener('show.bs.modal', handleModalShow);
                modal.removeEventListener('hide.bs.modal', handleModalHide);
            };
        }
    }, [modalId]);

    const validatePassword = (pwd) => {
        const minLength = 6;
        
        setPasswordValidation({
            length: pwd.length >= minLength,
            uppercase: /[A-Z]/.test(pwd),
            specialChars: /[@#!%$*?]/.test(pwd)
        });
    };

    const handlePasswordChange = (e) => {
        const pwd = e.target.value;
        setPassword(pwd);
        validatePassword(pwd);
    };

    const isPasswordValid = () => {
        return passwordValidation.length && 
               passwordValidation.uppercase && 
               passwordValidation.specialChars;
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setPasswordValidation({
            length: false,
            uppercase: false,
            specialChars: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!isPasswordValid()) {
            setError('Please meet all password requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/${userType}/create-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Password created successfully! You can now login with your new password.');
                setTimeout(() => {
                    resetForm();
                    // Close the modal
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
                        if (bootstrapModal) {
                            bootstrapModal.hide();
                        }
                    }
                }, 2000);
            } else {
                setError(data.message || 'Failed to create password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" id={modalId} tabIndex="-1" aria-labelledby={`${modalId}Label`} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${modalId}Label`}>Create Your Password - {userType.charAt(0).toUpperCase() + userType.slice(1)}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => { enableBodyScroll(); resetForm(); }}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}
                            {success && (
                                <div className="alert alert-success">{success}</div>
                            )}
                            
                            <div className="mb-3">
                                <label htmlFor="createPasswordEmail" className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="createPasswordEmail"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}}
                                />
                            </div>

                            <div className="mb-3 position-relative">
                                <label htmlFor="createPasswordField" className="form-label">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="createPasswordField"
                                    placeholder="Create your password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}}
                                />
                                <span
                                    style={{ position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: '#666' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                                </span>
                            </div>

                            {password && (
                                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                    <h6 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#495057' }}>Password Requirements:</h6>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        <li style={{ padding: '4px 0', fontSize: '13px', color: passwordValidation.length ? '#28a745' : '#dc3545' }}>
                                            <i className={`fa ${passwordValidation.length ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                                            At least 6 characters
                                        </li>
                                        <li style={{ padding: '4px 0', fontSize: '13px', color: passwordValidation.uppercase ? '#28a745' : '#dc3545' }}>
                                            <i className={`fa ${passwordValidation.uppercase ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                                            One uppercase letter
                                        </li>
                                        <li style={{ padding: '4px 0', fontSize: '13px', color: passwordValidation.specialChars ? '#28a745' : '#dc3545' }}>
                                            <i className={`fa ${passwordValidation.specialChars ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '8px' }}></i>
                                            One special character (@#!%$*?)
                                        </li>
                                    </ul>
                                </div>
                            )}

                            <div className="mb-3 position-relative">
                                <label htmlFor="confirmPasswordField" className="form-label">Confirm Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-control"
                                    id="confirmPasswordField"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}}
                                />
                                <span
                                    style={{ position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: '#666' }}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                                </span>
                            </div>

                            <div className="d-grid">
                                <button 
                                    type="submit" 
                                    className="btn"
                                    disabled={loading || !isPasswordValid()}
                                    style={{
                                        padding: '12px', 
                                        fontSize: '16px', 
                                        backgroundColor: '#fd7e14', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontWeight: '600'
                                    }}
                                >
                                    {loading ? 'Creating Password...' : 'Create Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePasswordModal;