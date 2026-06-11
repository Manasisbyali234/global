import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { publicUser } from "../../../../../../globals/route-names";
import { handlePhoneInputChange } from "../../../../../../utils/phoneValidation";
import { showSuccess, showError } from "../../../../../../utils/popupNotification";
import TermsModal from "../../../../../../components/TermsModal";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function SignupCandidate() {
    const navigate = useNavigate();
    const [candidateData, setCandidateData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        mobile: '',
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
        if (name === 'firstName') {
            if (!value || !value.trim()) {
                errors.firstName = 'First name is required';
            } else if (value.trim().length < 1) {
                errors.firstName = 'First name must be at least 1 character long';
            } else if (value.trim().length > 50) {
                errors.firstName = 'First name must be less than 50 characters';
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                errors.firstName = 'First name can only contain letters and spaces';
            } else {
                delete errors.firstName;
            }
        }
        if (name === 'middleName') {
            if (value && value.trim() && value.trim().length > 50) {
                errors.middleName = 'Middle name must be less than 50 characters';
            } else if (value && value.trim() && !/^[a-zA-Z\s]+$/.test(value.trim())) {
                errors.middleName = 'Middle name can only contain letters and spaces';
            } else {
                delete errors.middleName;
            }
        }
        if (name === 'lastName') {
            if (!value || !value.trim()) {
                errors.lastName = 'Last name is required';
            } else if (value.trim().length > 50) {
                errors.lastName = 'Last name must be less than 50 characters';
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                errors.lastName = 'Last name can only contain letters and spaces';
            } else {
                delete errors.lastName;
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

    const registerCandidate = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || '';
            const response = await fetch(`${apiUrl}/api/candidate/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: candidateData.firstName,
                    middleName: candidateData.middleName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.countryCode + candidateData.mobile,
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                // Store signup data in localStorage for auto-filling profile
                localStorage.setItem('candidateSignupData', JSON.stringify({
                    firstName: candidateData.firstName,
                    middleName: candidateData.middleName,
                    lastName: candidateData.lastName,
                    email: candidateData.email,
                    phone: candidateData.mobile,
                    phoneCountryCode: candidateData.countryCode
                }));
                
                showSuccess(data.message || 'OTP sent successfully. Please verify your mobile number.');
                setOtp('');
                setShowOtpModal(true);
                startOtpTimer();
            } else if (response.status === 409) {
                if (data.field === 'mobile') {
                    setFieldErrors(prev => ({ ...prev, mobile: data.message || 'This mobile number is already registered. Please use a different number.' }));
                    showError(data.message || 'This mobile number is already registered.');
                } else {
                    // Duplicate email — show error with inline field highlight and redirect link
                    setFieldErrors(prev => ({ ...prev, email: data.message || 'This email is already registered. Please log in instead.' }));
                    showError(data.message || 'This email is already registered. Please log in instead.');
                }
            } else {
                // Show first validation error if present, otherwise show general message
                const errMsg = data.errors?.[0]?.msg || data.message || 'Registration failed.';
                showError(errMsg);
            }
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields before submitting
        const newErrors = {};
        if (!candidateData.firstName.trim()) newErrors.firstName = 'First name is required';
        else if (candidateData.firstName.trim().length > 50) newErrors.firstName = 'First name must be less than 50 characters';
        else if (!/^[a-zA-Z\s]+$/.test(candidateData.firstName.trim())) newErrors.firstName = 'First name can only contain letters and spaces';

        if (!candidateData.lastName.trim()) newErrors.lastName = 'Last name is required';
        else if (candidateData.lastName.trim().length > 50) newErrors.lastName = 'Last name must be less than 50 characters';
        else if (!/^[a-zA-Z\s]+$/.test(candidateData.lastName.trim())) newErrors.lastName = 'Last name can only contain letters and spaces';

        if (candidateData.middleName && candidateData.middleName.trim()) {
            if (candidateData.middleName.trim().length > 50) newErrors.middleName = 'Middle name must be less than 50 characters';
            else if (!/^[a-zA-Z\s]+$/.test(candidateData.middleName.trim())) newErrors.middleName = 'Middle name can only contain letters and spaces';
        }

        if (!candidateData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateData.email.trim())) newErrors.email = 'Please enter a valid email address';

        if (!candidateData.mobile.trim()) newErrors.mobile = 'Mobile number is required';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            showError('Please fill in all required fields correctly.');
            return;
        }

        if (Object.values(fieldErrors).some(Boolean)) {
            showError('Please correct the errors before submitting.');
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }

        registerCandidate();
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
            const response = await fetch(`${apiUrl}/api/candidate/verify-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: candidateData.email,
                    otp: otp
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                clearInterval(timerRef.current);
                showSuccess('Mobile number verified successfully! Please check your registered email inbox to create your password.');
                setShowOtpModal(false);
                setCandidateData({ firstName: '', middleName: '', lastName: '', email: '', mobile: '', countryCode: '+91' });
                navigate(publicUser.pages.LOGIN_CANDIDATE);
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
            const response = await fetch(`${apiUrl}/api/candidate/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: candidateData.email,
                    phone: candidateData.countryCode + candidateData.mobile
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
        registerCandidate();
    };

    return (
        <div className="auth-page-wrapper public-auth-page">
            <div className="container auth-page-container">
                <div className="main-card public-auth-card">
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
                                name="firstName" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.firstName ? 'is-invalid' : ''}`} 
                                placeholder="First Name" 
                                value={candidateData.firstName} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.firstName && <div className="invalid-feedback">{fieldErrors.firstName}</div>}
                        </div>

                        <div className="auth-form-group">
                            <input 
                                name="middleName" 
                                type="text" 
                                className={`auth-input ${fieldErrors.middleName ? 'is-invalid' : ''}`} 
                                placeholder="Middle Name " 
                                value={candidateData.middleName} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.middleName && <div className="invalid-feedback">{fieldErrors.middleName}</div>}
                        </div>

                        <div className="auth-form-group">
                            <input 
                                name="lastName" 
                                type="text" 
                                required 
                                className={`auth-input ${fieldErrors.lastName ? 'is-invalid' : ''}`} 
                                placeholder="Last Name" 
                                value={candidateData.lastName} 
                                onChange={handleChange} 
                            />
                            {fieldErrors.lastName && <div className="invalid-feedback">{fieldErrors.lastName}</div>}
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
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span style={{ position: 'absolute', left: '0', width: '55px', display: 'flex', justifyContent: 'center', color: '#000', fontSize: '14px', zIndex: '10', pointerEvents: 'none', lineHeight: 'normal' }}>{candidateData.countryCode}</span>
                                <input 
                                    name="mobile" 
                                    type="text" 
                                    required 
                                    className={`auth-input ${fieldErrors.mobile ? 'is-invalid' : ''}`} 
                                    style={{ paddingLeft: '55px' }}
                                    placeholder="Mobile Number" 
                                    value={candidateData.mobile} 
                                    onChange={handleChange} 
                                />
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
            </div>
            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleTermsAccept} role="candidate" />
            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal">
                        <h3>Verify Mobile Number</h3>
                        <p>Enter the 6-digit OTP sent to {candidateData.countryCode}{candidateData.mobile}</p>
                        <form onSubmit={handleOtpVerify}>
                            <div className="otp-input-container">
                                <input
                                    type="text"
                                    className="otp-digit-input"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter OTP"
                                />
                            </div>
                            <div className="otp-timer">
                                {otpExpired ? (
                                    <p className="expired-text">OTP expired. Please request a new one.</p>
                                ) : (
                                    <p className="timer-text">OTP expires in <span className="timer-countdown">{formatTime(timeLeft)}</span></p>
                                )}
                            </div>
                            <div className="otp-actions">
                                <button type="submit" className="verify-btn" disabled={verifying || otpExpired}>
                                    {verifying ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={resending}>
                                    {resending ? 'Resending...' : 'Resend OTP'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowOtpModal(false)}>
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

export default SignupCandidate;
