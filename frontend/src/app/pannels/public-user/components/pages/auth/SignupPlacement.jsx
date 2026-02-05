import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { publicUser } from "../../../../../../globals/route-names";
import { handlePhoneInputChange } from "../../../../../../utils/phoneValidation";
import { showSuccess, showError } from "../../../../../../utils/popupNotification";
import TermsModal from "../../../../../../components/TermsModal";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function SignupPlacement() {
    const navigate = useNavigate();
    const [placementData, setPlacementData] = useState({
        name: '',
        email: '',
        phone: '',
        collegeName: '',
        countryCode: '+91'
    });
    
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [otpExpired, setOtpExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(true);
    const [resending, setResending] = useState(false);
    const timerRef = useRef(null);
    const otpGeneratedTime = useRef(null);

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        if (name === 'name') {
            if (!value || !value.trim()) {
                errors.name = 'Name is required';
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
        if (name === 'collegeName') {
            if (!value || !value.trim()) {
                errors.collegeName = 'College/University name is required';
            } else if (value.trim().length < 3) {
                errors.collegeName = 'Name must be at least 3 characters long';
            } else {
                delete errors.collegeName;
            }
        }
        setFieldErrors(errors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            handlePhoneInputChange(value, 
                (val) => setPlacementData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setPlacementData({ ...placementData, [name]: value });
            validateField(name, value);
        }
    };

    const startOtpTimer = () => {
        setTimeLeft(300);
        setOtpExpired(false);
        otpGeneratedTime.current = Date.now();
        
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setOtpExpired(true);
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const registerPlacement = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/placement/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: placementData.name,
                    email: placementData.email,
                    phone: placementData.countryCode + placementData.phone,
                    collegeName: placementData.collegeName,
                    sendWelcomeEmail: true,
                    skipOtpVerification: true
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                showSuccess('Registration successful! Please check your registered email inbox to create your password.');
                setPlacementData({ name: '', email: '', phone: '', collegeName: '', countryCode: '+91' });
                navigate(publicUser.pages.LOGIN_PLACEMENT);
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
        
        // Debug logging
        console.log('Form data:', placementData);
        console.log('Field errors:', fieldErrors);
        
        // Validate all required fields
        const requiredFields = ['name', 'email', 'phone', 'collegeName'];
        const missingFields = requiredFields.filter(field => !placementData[field] || !placementData[field].trim());
        
        console.log('Missing fields:', missingFields);
        console.log('Has field errors:', Object.keys(fieldErrors).length > 0);
        
        if (Object.keys(fieldErrors).filter(key => fieldErrors[key]).length > 0 || missingFields.length > 0) {
            showError('Please complete all required fields correctly.');
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }

        registerPlacement();
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            showError('Please enter a valid 6-digit OTP');
            return;
        }

        if (otpExpired) {
            showError('OTP has expired. Please request a new one.');
            return;
        }

        setVerifying(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/placement/verify-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: placementData.email,
                    otp: otp
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                clearInterval(timerRef.current);
                showSuccess('Mobile number verified successfully! Please check your registered email inbox to create your password.');
                setShowOtpModal(false);
                setPlacementData({ name: '', email: '', phone: '', collegeName: '', countryCode: '+91' });
                navigate(publicUser.pages.LOGIN_PLACEMENT);
            } else {
                showError(data.message || 'Verification failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/placement/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: placementData.email,
                    phone: placementData.countryCode + placementData.phone
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                setOtp('');
                startOtpTimer();
                showSuccess('New OTP sent successfully!');
            } else {
                showError(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const handleTermsAccept = () => {
        setTermsAccepted(true);
        setShowTermsModal(false);
        registerPlacement();
    };

    return (
        <div className="auth-page-wrapper">
            <div className="container">
                <div className="main-card">
                {/* Left Side (Image Section) */}
                <div className="left-section">
                    <div className="image-wrapper">
                        <img src="assets/images/background/image.png" alt="Placement Signup" />
                    </div>
                </div>

                {/* Right Side (Form Section) */}
                <div className="right-section">
                    <NavLink to={publicUser.INITIAL} className="auth-logo">
                        <JobZImage src="images/logo-dark.png" alt="Logo" />
                    </NavLink>
                    
                    <h2>Sign Up</h2>
                    <p className="sub-text">Create placement officer account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <input 
                                name="name" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.name ? 'is-invalid' : ''}`} 
                                placeholder="Full Name" 
                                value={placementData.name} 
                                onChange={handleChange} 
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
                                value={placementData.email} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                        </div>

                        <div className="auth-form-group">
                            <div style={{ position: 'relative' }}>
                                <input 
                                    name="phone" 
                                    type="text" 
                                    required 
                                    className={`auth-input ${fieldErrors.phone ? 'is-invalid' : ''}`} 
                                    style={{ paddingLeft: '50px' }}
                                    placeholder="Mobile Number" 
                                    value={placementData.phone} 
                                    onChange={handleChange} 
                                />
                                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#000', fontSize: '14px', zIndex: '10', pointerEvents: 'none' }}>{placementData.countryCode}</span>
                            </div>
                            {fieldErrors.phone && <div className="invalid-feedback d-block">{fieldErrors.phone}</div>}
                        </div>

                        <div className="auth-form-group">
                            <input 
                                name="collegeName" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.collegeName ? 'is-invalid' : ''}`} 
                                placeholder="College/University Name" 
                                value={placementData.collegeName} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.collegeName && <div className="invalid-feedback">{fieldErrors.collegeName}</div>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>

                        <p className="small-link">
                            Already have an account? <NavLink to={publicUser.pages.LOGIN_PLACEMENT}>Log In</NavLink>
                        </p>
                    </form>
                </div>
            </div>
            </div>
            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} role="placement" />
        </div>
    );
}

export default SignupPlacement;
