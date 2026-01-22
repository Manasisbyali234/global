import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pubRoute, publicUser } from '../../globals/route-names';

function CreatePassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        specialChars: false
    });
    const email = searchParams.get('email');
    const rawType = (searchParams.get('type') || 'candidate').toLowerCase();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Normalize user type to map to correct endpoints
    const typeMapping = {
        candidate: 'candidate',
        placement_candidate: 'candidate',
        employer: 'employer',
        company: 'employer',
        consultant: 'employer',
        placement: 'placement'
    };

    const userType = typeMapping[rawType] || 'candidate';
    
    const endpointMap = {
        candidate: `${apiUrl}/api/candidate/create-password`,
        employer: `${apiUrl}/api/employer/create-password`,
        placement: `${apiUrl}/api/placement/create-password`
    };

    const endpoint = endpointMap[userType];
    
    // Display role logic
    const displayRole = rawType === 'placement' ? 'placement officer' : 
                        rawType === 'placement_candidate' ? 'candidate' :
                        rawType === 'company' ? 'employer' : rawType;
    const displayRoleLabel = displayRole.charAt(0).toUpperCase() + displayRole.slice(1);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        
        if (!isPasswordValid()) {
            setError('Please meet all password requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!email) {
            setError('Email parameter is missing.');
            return;
        }

        if (searchParams.get('type') && !typeMapping[rawType]) {
            setError('Invalid user type. Please use the link provided in your email.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage('Password created successfully! Please login.');
                setTimeout(() => {
                    navigate('/', { replace: true });
                    setTimeout(() => {
                        const loginModal = document.getElementById('sign_up_popup2');
                        if (loginModal) {
                            const modal = new window.bootstrap.Modal(loginModal);
                            modal.show();
                        }
                    }, 500);
                }, 1500);
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
        <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header text-center">
                            <h3>Create Your Password</h3>
                            {email && <p className="mb-0" style={{ fontWeight: '500', color: '#666' }}>{email}({displayRole})</p>}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {successMessage && (
                                    <div className="alert alert-success">{successMessage}</div>
                                )}
                                {error && (
                                    <div className="alert alert-danger">{error}</div>
                                )}
                                
                                <div className="form-group mb-3" style={{position: 'relative'}}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password*"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        style={{paddingRight: '40px'}}
                                    />
                                    <span
                                        style={{ position: 'absolute', right: '10px', top: '12px', cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto', zIndex: 10 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ pointerEvents: 'none' }} />
                                    </span>
                                </div>

                                {password && (
                                    <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
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

                                <div className="form-group mb-3" style={{position: 'relative'}}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Confirm Password*"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{paddingRight: '40px'}}
                                    />
                                    <span
                                        style={{ position: 'absolute', right: '10px', top: '12px', cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto', zIndex: 10 }}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ pointerEvents: 'none' }} />
                                    </span>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-100"
                                    disabled={loading}
                                    style={{ padding: '12px', fontSize: '16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '5px', fontWeight: '600' }}
                                >
                                    {loading ? 'Creating Password...' : 'Create Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default CreatePassword;