import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { publicUser } from "../../../../../../globals/route-names";
import { handlePhoneInputChange } from "../../../../../../utils/phoneValidation";
import { showSuccess, showError } from "../../../../../../utils/popupNotification";
import TermsModal from "../../../../../../components/TermsModal";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function SignupEmployer() {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Object.keys(fieldErrors).length > 0 || !employerData.employerCategory) {
            showError('Please complete all required fields correctly.');
            return;
        }

        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }
        
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
                showSuccess('You have successfully signed up! Please check your registered email inbox to create your password.');
                setEmployerData({ name: '', email: '', mobile: '', employerCategory: '', countryCode: '+91' });
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
                        <img src="assets/images/background/image.png" alt="Employer Signup" />
                    </div>
                </div>

                {/* Right Side (Form Section) */}
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
                            />
                            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                        </div>

                        <div className="auth-form-group">
                            <div className="input-group">
                                <span className="input-group-text" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}>{employerData.countryCode}</span>
                                <input 
                                    name="mobile" 
                                    type="text" 
                                    required 
                                    className={`auth-input ${fieldErrors.mobile ? 'is-invalid' : ''}`} 
                                    style={{ borderRadius: '0 8px 8px 0' }}
                                    placeholder="Mobile Number" 
                                    value={employerData.mobile} 
                                    onChange={handleChange} 
                                />
                            </div>
                            {fieldErrors.mobile && <div className="invalid-feedback d-block">{fieldErrors.mobile}</div>}
                        </div>

                        <div className="auth-form-group">
                            <select 
                                name="employerCategory" 
                                className={`auth-input ${fieldErrors.employerCategory ? 'is-invalid' : ''}`} 
                                value={employerData.employerCategory} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Employer Category*</option>
                                <option value="company">Company</option>
                                <option value="consultancy">Consultancy</option>
                            </select>
                            {fieldErrors.employerCategory && <div className="invalid-feedback">{fieldErrors.employerCategory}</div>}
                        </div>

                        <div className="auth-form-group">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                <label className="form-check-label" htmlFor="terms" style={{ fontSize: '13px' }}>
                                    I agree to the <span onClick={() => setShowTermsModal(true)} style={{color: '#0F172A', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline'}}>Terms and Conditions</span>
                                </label>
                            </div>
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
            <TermsModal show={showTermsModal} onHide={() => setShowTermsModal(false)} onAccept={handleTermsAccept} role="employer" />
        </div>
    );
}

export default SignupEmployer;
