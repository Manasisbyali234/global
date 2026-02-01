import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { publicUser } from "../../../../../../globals/route-names";
import { handlePhoneInputChange, validatePhoneOnBlur } from "../../../../../../utils/phoneValidation";
import { showSuccess, showError } from "../../../../../../utils/popupNotification";
import TermsModal from "../../../../../../components/TermsModal";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function SignupEmployer() {
    const navigate = useNavigate();
    const [employerData, setEmployerData] = useState({
        name: '',
        email: '',
        mobile: '',
        employerCategory: '',
        countryCode: '+91'
    });
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        if (name === 'name') {
            if (!value || !value.trim()) {
                errors.name = 'Company Name is required';
            } else if (value.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters long';
            } else {
                delete errors.name;
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
        if (name === 'employerCategory') {
            if (!value) {
                errors.employerCategory = 'Please select a category';
            } else {
                delete errors.employerCategory;
            }
        }
        setFieldErrors(errors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            handlePhoneInputChange(value, 
                (val) => setEmployerData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setEmployerData({ ...employerData, [name]: value });
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            validatePhoneOnBlur(value, setFieldErrors, name, true);
        } else {
            validateField(name, value);
        }
    };

    const validateAllFields = () => {
        const errors = {};
        
        if (!employerData.name || !employerData.name.trim()) {
            errors.name = 'Company Name is required';
        } else if (employerData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }
        
        if (!employerData.email || !employerData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employerData.email.trim())) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!employerData.mobile || !employerData.mobile.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!/^\d{10,15}$/.test(employerData.mobile.replace(/[\s\-\(\)\+]/g, ''))) {
            errors.mobile = 'Phone number must be at least 10 digits';
        }
        
        if (!employerData.employerCategory) {
            errors.employerCategory = 'Please select a category';
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const registerEmployer = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/employer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: employerData.name,
                    email: employerData.email,
                    phone: employerData.countryCode + employerData.mobile,
                    companyName: employerData.name,
                    employerCategory: employerData.employerCategory,
                    employerType: employerData.employerCategory === 'consultancy' ? 'consultant' : 'company',
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                setShowOtpModal(true);
            } else {
                showError(data.message || 'Registration failed.');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateAllFields()) {
            showError('Please complete all required fields correctly.');
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }
        
        registerEmployer();
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            showError('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/employer/verify-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: employerData.email,
                    otp: otp
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                showSuccess('Mobile number verified successfully! Please check your registered email inbox to create your password.');
                setShowOtpModal(false);
                setEmployerData({ name: '', email: '', mobile: '', employerCategory: '', countryCode: '+91' });
                navigate(publicUser.pages.LOGIN_EMPLOYER);
            } else {
                showError(data.message || 'Verification failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleTermsAccept = () => {
        setTermsAccepted(true);
        setShowTermsModal(false);
        registerEmployer();
    };

    return (
        <div className="auth-page-wrapper">
            <div className="main-card">
                <div className="left-section">
                    <div className="image-wrapper">
                        <img src="assets/images/background/image.png" alt="Employer Signup" />
                    </div>
                </div>

                <div className="right-section">
                    <NavLink to={publicUser.INITIAL} className="auth-logo">
                        <JobZImage src="images/logo-dark.png" alt="Logo" />
                    </NavLink>
                    
                    <h2>Sign Up</h2>
                    <p className="sub-text">Create your employer account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <input 
                                name="name" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.name ? 'is-invalid' : ''}`} 
                                placeholder="Company Name" 
                                value={employerData.name} 
                                onChange={handleChange}
                                onBlur={handleBlur} 
                            />
                            {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                        </div>

                        <div className="auth-form-group">
                            <input 
                                name="email" 
                                type="email" 
                                required 
                                className={`auth-input ${fieldErrors.email ? 'is-invalid' : ''}`} 
                                placeholder="Official Email Address" 
                                value={employerData.email} 
                                onChange={handleChange}
                                onBlur={handleBlur} 
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
                                    value={employerData.mobile} 
                                    onChange={handleChange}
                                    onBlur={handleBlur} 
                                />
                                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '14px', zIndex: '10', pointerEvents: 'none' }}>{employerData.countryCode}</span>
                            </div>
                            {fieldErrors.mobile && <div className="invalid-feedback d-block">{fieldErrors.mobile}</div>}
                        </div>

                        <div className="auth-form-group">
                            <select 
                                name="employerCategory" 
                                className={`auth-input ${fieldErrors.employerCategory ? 'is-invalid' : ''}`} 
                                value={employerData.employerCategory} 
                                onChange={handleChange}
                                onBlur={handleBlur} 
                                required
                            >
                                <option value="">Select Employer Category*</option>
                                <option value="company">Company</option>
                                <option value="consultancy">Consultancy</option>
                            </select>
                            {fieldErrors.employerCategory && <div className="invalid-feedback">{fieldErrors.employerCategory}</div>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>

                        <p className="small-link">
                            Already have an account? <NavLink to={publicUser.pages.LOGIN_EMPLOYER}>Log In</NavLink>
                        </p>
                    </form>
                </div>
            </div>
            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} role="employer" />
            
            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal">
                        <h3>Verify Mobile Number</h3>
                        <p>We have sent a 6-digit OTP to {employerData.mobile}</p>
                        
                        <form onSubmit={handleOtpVerify}>
                            <div className="otp-input-container">
                                <input
                                    type="text"
                                    className="otp-digit-input"
                                    maxLength="6"
                                    style={{ width: '200px' }}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Enter OTP"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="otp-actions">
                                <button type="submit" className="verify-btn" disabled={verifying}>
                                    {verifying ? 'Verifying...' : 'Verify & Proceed'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowOtpModal(false)} disabled={verifying}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignupEmployer;
