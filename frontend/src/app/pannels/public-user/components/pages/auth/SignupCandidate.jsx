import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { publicUser } from "../../../../../../globals/route-names";
import { handlePhoneInputChange } from "../../../../../../utils/phoneValidation";
import { showSuccess, showError } from "../../../../../../utils/popupNotification";
import TermsModal from "../../../../../../components/TermsModal";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function SignupCandidate() {
    const [candidateData, setCandidateData] = useState({
        username: '',
        email: '',
        mobile: '',
        countryCode: '+91'
    });
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        if (name === 'username') {
            if (!value || !value.trim()) {
                errors.username = 'Name is required';
            } else if (value.trim().length < 2) {
                errors.username = 'Name must be at least 2 characters long';
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                errors.username = 'Name can only contain letters and spaces';
            } else {
                delete errors.username;
            }
        }
        if (name === 'email') {
            if (!value || !value.trim()) {
                errors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                errors.email = 'Please enter a valid email address';
            } else {
                delete errors.email;
            }
        }
        setFieldErrors(errors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            handlePhoneInputChange(value, 
                (val) => setCandidateData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setCandidateData({ ...candidateData, [name]: value });
            validateField(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Object.keys(fieldErrors).filter(key => fieldErrors[key]).length > 0) {
            showError('Please correct the errors before submitting.');
            return;
        }


        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/candidate/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: candidateData.username,
                    email: candidateData.email,
                    phone: candidateData.countryCode + candidateData.mobile,
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                showSuccess('You have successfully signed up! Please check your registered email inbox to create your password.');
                setCandidateData({ username: '', email: '', mobile: '', countryCode: '+91' });
                setTermsAccepted(false);
            } else {
                showError(data.message || 'Registration failed.');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTermsAccept = () => {
        setTermsAccepted(true);
        setShowTermsModal(false);
    };

    return (
        <div className="auth-page-wrapper">
            <div className="main-card">
                {/* Left Side (Image Section) */}
                <div className="left-section">
                    <div className="image-wrapper">
                        <img src="assets/images/background/image.png" alt="Candidate Signup" />
                    </div>
                </div>

                {/* Right Side (Form Section) */}
                <div className="right-section">
                    <NavLink to={publicUser.INITIAL} className="auth-logo">
                        <JobZImage src="images/logo-dark.png" alt="Logo" />
                    </NavLink>
                    
                    <h2>Sign Up</h2>
                    <p className="sub-text">Create your candidate account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <input 
                                name="username" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.username ? 'is-invalid' : ''}`} 
                                placeholder="Full Name" 
                                value={candidateData.username} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
                        </div>

                        <div className="auth-form-group">
                            <input 
                                name="email" 
                                type="email" 
                                required 
                                className={`auth-input ${fieldErrors.email ? 'is-invalid' : ''}`} 
                                placeholder="Email Address" 
                                value={candidateData.email} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                        </div>

                        <div className="auth-form-group">
                            <div style={{ position: 'relative' }}>
                                <input 
                                    name="mobile" 
                                    type="text" 
                                    required 
                                    className={`auth-input ${fieldErrors.mobile ? 'is-invalid' : ''}`} 
                                    style={{ paddingLeft: '50px' }}
                                    placeholder="Mobile Number" 
                                    value={candidateData.mobile} 
                                    onChange={handleChange} 
                                />
                                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '14px', zIndex: '10', pointerEvents: 'none' }}>{candidateData.countryCode}</span>
                            </div>
                            {fieldErrors.mobile && <div className="invalid-feedback d-block">{fieldErrors.mobile}</div>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>

                        <p className="small-link">
                            Already have an account? <NavLink to={publicUser.pages.LOGIN_CANDIDATE}>Log In</NavLink>
                        </p>
                    </form>
                </div>
            </div>
            <TermsModal show={showTermsModal} onHide={() => setShowTermsModal(false)} onAccept={handleTermsAccept} role="candidate" />
        </div>
    );
}

export default SignupCandidate;
