import React, { useState, useEffect } from 'react';
import { pubRoute, publicUser } from '../../../globals/route-names';
import { validatePhoneNumber, handlePhoneInputChange, validatePhoneOnBlur } from '../../../utils/phoneValidation';
import { showSuccess, showError } from '../../../utils/popupNotification';
import TermsModal from '../../../components/TermsModal';
import '../../../popup-nav-buttons.css';

function SignUpPopup() {
    const [candidateData, setCandidateData] = useState({
        username: '',
        email: '',
        mobile: '',
        countryCode: '+91'
    });
    
    const [employerData, setEmployerData] = useState({
        name: '',
        email: '',
        mobile: '',
        employerCategory: '',
        countryCode: '+91'
    });
    
    const [placementData, setPlacementData] = useState({
        name: '',
        email: '',
        phone: '',
        collegeName: '',
        countryCode: '+91'
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [currentRole, setCurrentRole] = useState('candidate');
    const [termsAccepted, setTermsAccepted] = useState({ candidate: false, employer: false, placement: false });

    useEffect(() => {
        const handleSetTab = (e) => {
            if (e.detail.modalId === 'sign_up_popup') {
                setCurrentRole(e.detail.tab);
            }
        };

        window.addEventListener('setModalTab', handleSetTab);
        return () => window.removeEventListener('setModalTab', handleSetTab);
    }, []);

    useEffect(() => {
        setCandidateData({ username: '', email: '', mobile: '', countryCode: '+91' });
        setEmployerData({ name: '', email: '', mobile: '', employerCategory: '', countryCode: '+91' });
        setPlacementData({ name: '', email: '', phone: '', collegeName: '', countryCode: '+91' });
        setFieldErrors({});
        setError('');
        setSuccess('');

        // Clear messages when modal opens
        const modal = document.getElementById('sign_up_popup');
        const handleModalShow = () => {
            setError('');
            setSuccess('');
            setFieldErrors({});
            // Fix for mobile white screen - ensure modal is visible
            if (modal) {
                modal.style.display = 'block';
                modal.style.opacity = '1';
                document.body.classList.add('modal-open');
            }
        };

        const handleModalHide = () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            setTermsAccepted({ candidate: false, employer: false, placement: false });
        };

        // Clear messages when tabs change
        const handleTabChange = () => {
            setError('');
            setSuccess('');
            setFieldErrors({});
            setTermsAccepted({ candidate: false, employer: false, placement: false });
        };

        if (modal) {
            modal.addEventListener('show.bs.modal', handleModalShow);
            modal.addEventListener('hide.bs.modal', handleModalHide);
            
            return () => {
                modal.removeEventListener('show.bs.modal', handleModalShow);
                modal.removeEventListener('hide.bs.modal', handleModalHide);
            };
        }
    }, []);

    // Validation functions
    const validateField = (field, value, formType) => {
        const errors = { ...fieldErrors };

        switch (field) {
            case 'username':
            case 'name':
                if (!value || !value.trim()) {
                    errors[field] = 'Name is required';
                } else if (value.trim().length < 2) {
                    errors[field] = 'Name must be at least 2 characters long';
                } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                    errors[field] = 'Name can only contain letters and spaces';
                } else {
                    delete errors[field];
                }
                break;

            case 'email':
                if (!value || !value.trim()) {
                    errors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    errors.email = 'Please enter a valid email address';
                } else {
                    delete errors.email;
                }
                break;

            case 'mobile':
            case 'phone':
                const phoneValidation = validatePhoneNumber(value, true);
                if (!phoneValidation.isValid) {
                    errors[field] = phoneValidation.message;
                } else {
                    delete errors[field];
                }
                break;



            case 'employerCategory':
                if (!value) {
                    errors.employerCategory = 'Please select an employer category';
                } else {
                    delete errors.employerCategory;
                }
                break;

            case 'collegeName':
                if (!value || !value.trim()) {
                    errors.collegeName = 'College name is required';
                } else if (value.trim().length < 3) {
                    errors.collegeName = 'College name must be at least 3 characters long';
                } else {
                    delete errors.collegeName;
                }
                break;

            default:
                break;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateForm = (formData, formType) => {
        let hasErrors = false;
        const tempErrors = {};

        // Validate all required fields
        Object.keys(formData).forEach(field => {
            const value = formData[field];
            
            switch (field) {
                case 'username':
                case 'name':
                    if (!value || !value.trim()) {
                        tempErrors[field] = 'Name is required';
                        hasErrors = true;
                    } else if (value.trim().length < 2) {
                        tempErrors[field] = 'Name must be at least 2 characters long';
                        hasErrors = true;
                    } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                        tempErrors[field] = 'Name can only contain letters and spaces';
                        hasErrors = true;
                    }
                    break;

                case 'email':
                    if (!value || !value.trim()) {
                        tempErrors.email = 'Email is required';
                        hasErrors = true;
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                        tempErrors.email = 'Please enter a valid email address';
                        hasErrors = true;
                    }
                    break;

                case 'mobile':
                case 'phone':
                    if (!value || !value.trim()) {
                        tempErrors[field] = 'Phone number is required';
                        hasErrors = true;
                    } else {
                        const phoneValidation = validatePhoneNumber(value, true);
                        if (!phoneValidation.isValid) {
                            tempErrors[field] = phoneValidation.message;
                            hasErrors = true;
                        }
                    }
                    break;

                case 'employerCategory':
                    if (!value) {
                        tempErrors.employerCategory = 'Please select an employer category';
                        hasErrors = true;
                    }
                    break;

                case 'collegeName':
                    if (!value || !value.trim()) {
                        tempErrors.collegeName = 'College name is required';
                        hasErrors = true;
                    } else if (value.trim().length < 3) {
                        tempErrors.collegeName = 'College name must be at least 3 characters long';
                        hasErrors = true;
                    }
                    break;
            }
        });

        setFieldErrors(tempErrors);
        return !hasErrors;
    };

    const handleCandidateChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'mobile') {
            const formattedValue = handlePhoneInputChange(value, 
                (val) => setCandidateData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setCandidateData({ ...candidateData, [name]: value });
            // Validate the field
            validateField(name, value, 'candidate');
        }
    };

    const handleEmployerChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'mobile') {
            const formattedValue = handlePhoneInputChange(value, 
                (val) => setEmployerData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setEmployerData({ ...employerData, [name]: value });
            validateField(name, value, 'employer');
        }
    };

    const handlePlacementChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'phone') {
            const formattedValue = handlePhoneInputChange(value, 
                (val) => setPlacementData(prev => ({ ...prev, [name]: val })), 
                setFieldErrors, name);
        } else {
            setPlacementData({ ...placementData, [name]: value });
            validateField(name, value, 'placement');
        }
    };

    const handleCandidateSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(candidateData, 'candidate');

        if (!isFormValid) {
            showError('Please correct the errors below and try again.');
            return;
        }

        if (!termsAccepted.candidate) {
            setCurrentRole('candidate');
            // Close signup modal first
            const modal = document.getElementById('sign_up_popup');
            if (modal) {
                const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                modalInstance.hide();
            }
            // Show terms modal after a brief delay
            setTimeout(() => {
                setShowTermsModal(true);
            }, 300);
            return;
        }
        
        setLoading(true);
        setError('');
        
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
                setCandidateData({ username: '', email: '', mobile: '', countryCode: '+91' });
                setFieldErrors({});
                setError('');
                setSuccess('');
                const modal = document.getElementById('sign_up_popup');
                if (modal) {
                    const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                    modalInstance.hide();
                }
                setTimeout(() => {
                    showSuccess('You have successfully signed up! Please check your registered email inbox to create your password.');
                }, 500);
            } else {
                if (data.message && data.message.toLowerCase().includes('already registered')) {
                    showError('This email address is already registered. Please try logging in instead.');
                } else {
                    showError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployerSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(employerData, 'employer');

        if (!isFormValid) {
            showError('Please correct the errors below and try again.');
            return;
        }

        if (!termsAccepted.employer) {
            setCurrentRole('employer');
            // Close signup modal first
            const modal = document.getElementById('sign_up_popup');
            if (modal) {
                const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                modalInstance.hide();
            }
            // Show terms modal after a brief delay
            setTimeout(() => {
                setShowTermsModal(true);
            }, 300);
            return;
        }
        
        setLoading(true);
        setError('');
        
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
                setEmployerData({ name: '', email: '', mobile: '', employerCategory: '', countryCode: '+91' });
                setFieldErrors({});
                setError('');
                setSuccess('');
                const modal = document.getElementById('sign_up_popup');
                if (modal) {
                    const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                    modalInstance.hide();
                }
                setTimeout(() => {
                    showSuccess('You have successfully signed up! Please check your registered email inbox to create your password.');
                }, 500);
            } else {
                if (data.message && data.message.toLowerCase().includes('already registered')) {
                    showError('This email address is already registered. Please try logging in instead.');
                } else {
                    showError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlacementSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm(placementData, 'placement');

        if (!isFormValid) {
            showError('Please correct the errors below and try again.');
            return;
        }

        if (!termsAccepted.placement) {
            setCurrentRole('placement');
            // Close signup modal first
            const modal = document.getElementById('sign_up_popup');
            if (modal) {
                const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                modalInstance.hide();
            }
            // Show terms modal after a brief delay
            setTimeout(() => {
                setShowTermsModal(true);
            }, 300);
            return;
        }
        
        setLoading(true);
        setError('');
        
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
                    sendWelcomeEmail: true
                })
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                setPlacementData({ name: '', email: '', phone: '', collegeName: '', countryCode: '+91' });
                setFieldErrors({});
                setError('');
                setSuccess('');
                const modal = document.getElementById('sign_up_popup');
                if (modal) {
                    const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                    modalInstance.hide();
                }
                setTimeout(() => {
                    showSuccess('You have successfully signed up! Please check your registered email inbox to create your password.');
                }, 500);
            } else {
                if (data.message && data.message.toLowerCase().includes('already registered')) {
                    showError('This email address is already registered. Please try logging in instead.');
                } else {
                    showError(data.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error) {
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTermsAccept = () => {
        setTermsAccepted(prev => ({ ...prev, [currentRole]: true }));
        setShowTermsModal(false);
        
        // Re-open signup modal and trigger form submission
        const modal = document.getElementById('sign_up_popup');
        if (modal) {
            const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
            modalInstance.show();
        }
        
        // Trigger form submission after accepting terms
        setTimeout(() => {
            if (currentRole === 'candidate') {
                document.getElementById('candidate-submit-btn')?.click();
            } else if (currentRole === 'employer') {
                document.getElementById('employer-submit-btn')?.click();
            } else if (currentRole === 'placement') {
                document.getElementById('placement-submit-btn')?.click();
            }
        }, 300);
    };

    return (
			<>
				<div
					className="modal fade twm-sign-up"
					id="sign_up_popup"
					aria-hidden="true"
					aria-labelledby="sign_up_popupLabel"
					tabIndex={-1}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h2 className="modal-title" id="sign_up_popupLabel">
									Sign Up - {currentRole === 'candidate' ? 'Candidate' : currentRole === 'employer' ? 'Employer' : 'Placement Officer'}
								</h2>
								<p>
									Sign Up and get access to all the features of TaleGlobal
								</p>
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								/>
							</div>

							<div className="modal-body">
								<div className="twm-tabs-style-2">
									<div className="tab-content" id="myTabContent">
										<div
											className={`tab-pane fade ${currentRole === 'candidate' ? 'show active' : ''}`}
											id="sign-candidate"
										>
											<form onSubmit={handleCandidateSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Name*"
															value={candidateData.username}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.username && (
															<div className="invalid-feedback d-block">{fieldErrors.username}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Email*"
															value={candidateData.email}
															autoComplete="new-password"
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-3 col-md-3" style={{ paddingRight: '5px' }}>
													<div className="form-group mb-3">
														<select 
															name="countryCode"
															className="form-control"
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															value={candidateData.countryCode}
															onChange={handleCandidateChange}
														>
															<option value="+91">+91 (India)</option>
															<option value="+1">+1 (USA/Canada)</option>
															<option value="+44">+44 (UK)</option>
															<option value="+61">+61 (Australia)</option>
															<option value="+33">+33 (France)</option>
															<option value="+49">+49 (Germany)</option>
															<option value="+81">+81 (Japan)</option>
															<option value="+86">+86 (China)</option>
														</select>
													</div>
												</div>
												<div className="col-lg-9 col-md-9" style={{ paddingLeft: '5px' }}>
													<div className="form-group mb-3">
														<input
															name="mobile"
															type="tel"
															className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Mobile No.*"
															value={candidateData.mobile}
															onChange={handleCandidateChange}
															required
														/>
														{fieldErrors.mobile && (
															<div className="invalid-feedback d-block">{fieldErrors.mobile}</div>
														)}
													</div>
												</div>


												
												<div className="col-lg-12">
													<p style={{marginTop: "10px", marginBottom: "10px", fontSize: "14px"}}>
														Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" onClick={() => { setError(''); setSuccess(''); setFieldErrors({}); }} style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign in</a>
													</p>
												</div>
												<div className="col-12">
													<button id="candidate-submit-btn" type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#FF7A00", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%", boxShadow: "none", whiteSpace: "nowrap" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>

										<div className={`tab-pane fade ${currentRole === 'employer' ? 'show active' : ''}`} id="sign-Employer">
											<form onSubmit={handleEmployerSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<select
															name="employerCategory"
															className={`form-control ${fieldErrors.employerCategory ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															value={employerData.employerCategory}
															onChange={handleEmployerChange}
															required
														>
															<option value="">Select Category*</option>
															<option value="company">Company</option>
															<option value="consultancy">Consultancy</option>
														</select>
														{fieldErrors.employerCategory && (
															<div className="invalid-feedback d-block">{fieldErrors.employerCategory}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Company Name*"
															value={employerData.name}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.name && (
															<div className="invalid-feedback d-block">{fieldErrors.name}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Email*"
															value={employerData.email}
															autoComplete="new-password"
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-3 col-md-3" style={{ paddingRight: '5px' }}>
													<div className="form-group mb-3">
														<select 
															name="countryCode"
															className="form-control"
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															value={employerData.countryCode}
															onChange={handleEmployerChange}
														>
															<option value="+91">+91 (India)</option>
															<option value="+1">+1 (USA/Canada)</option>
															<option value="+44">+44 (UK)</option>
															<option value="+61">+61 (Australia)</option>
															<option value="+33">+33 (France)</option>
															<option value="+49">+49 (Germany)</option>
															<option value="+81">+81 (Japan)</option>
															<option value="+86">+86 (China)</option>
														</select>
													</div>
												</div>
												<div className="col-lg-9 col-md-9" style={{ paddingLeft: '5px' }}>
													<div className="form-group mb-3">
														<input
															name="mobile"
															type="tel"
															className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Mobile No.*"
															value={employerData.mobile}
															onChange={handleEmployerChange}
															required
														/>
														{fieldErrors.mobile && (
															<div className="invalid-feedback d-block">{fieldErrors.mobile}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<p style={{marginTop: "10px", marginBottom: "10px", fontSize: "14px"}}>
														Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign in</a>
													</p>
												</div>

												<div className="col-12">
													<button id="employer-submit-btn" type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#FF7A00", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%", boxShadow: "none", whiteSpace: "nowrap" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>

										<div className={`tab-pane fade ${currentRole === 'placement' ? 'show active' : ''}`} id="sign-Placement">
											<form onSubmit={handlePlacementSubmit}>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="name"
															type="text"
															className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Name*"
															value={placementData.name}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.name && (
															<div className="invalid-feedback d-block">{fieldErrors.name}</div>
														)}
													</div>
												</div>
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="email"
															type="email"
															className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Email*"
															value={placementData.email}
															autoComplete="new-password"
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.email && (
															<div className="invalid-feedback d-block">{fieldErrors.email}</div>
														)}
													</div>
												</div>

												<div className="col-lg-3 col-md-3" style={{ paddingRight: '5px' }}>
													<div className="form-group mb-3">
														<select 
															name="countryCode"
															className="form-control"
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															value={placementData.countryCode}
															onChange={handlePlacementChange}
														>
															<option value="+91">+91 (India)</option>
															<option value="+1">+1 (USA/Canada)</option>
															<option value="+44">+44 (UK)</option>
															<option value="+61">+61 (Australia)</option>
															<option value="+33">+33 (France)</option>
															<option value="+49">+49 (Germany)</option>
															<option value="+81">+81 (Japan)</option>
															<option value="+86">+86 (China)</option>
														</select>
													</div>
												</div>
												<div className="col-lg-9 col-md-9" style={{ paddingLeft: '5px' }}>
													<div className="form-group mb-3">
														<input
															name="phone"
															type="tel"
															className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="Phone Number*"
															value={placementData.phone}
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.phone && (
															<div className="invalid-feedback d-block">{fieldErrors.phone}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="collegeName"
															type="text"
															className={`form-control ${fieldErrors.collegeName ? 'is-invalid' : ''}`}
															style={{ backgroundColor: 'transparent', border: '1px solid #ddd' }}
															placeholder="College Name*"
															value={placementData.collegeName}
															onChange={handlePlacementChange}
															required
														/>
														{fieldErrors.collegeName && (
															<div className="invalid-feedback d-block">{fieldErrors.collegeName}</div>
														)}
													</div>
												</div>

												<div className="col-lg-12">
													<p style={{marginTop: "10px", marginBottom: "10px", fontSize: "14px"}}>
														Already registered? <a href="#sign_up_popup2" data-bs-target="#sign_up_popup2" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign in</a>
													</p>
												</div>

												<div className="col-12">
													<button id="placement-submit-btn" type="submit" style={{ width: "100%", maxWidth: "none", minWidth: "100%", padding: "12px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", minHeight: "48px", backgroundColor: "#FF7A00", color: "white", border: "none", cursor: "pointer", display: "block", boxSizing: "border-box", flex: "1 1 100%", boxShadow: "none", whiteSpace: "nowrap" }} disabled={loading}>
														{loading ? 'Signing Up...' : 'Sign Up'}
													</button>
												</div>
											</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<TermsModal 
					isOpen={showTermsModal}
					onClose={() => setShowTermsModal(false)}
					onAccept={handleTermsAccept}
					role={currentRole}
				/>
			</>
		);
}

export default SignUpPopup;
