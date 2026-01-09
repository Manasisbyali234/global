import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import { showSuccess, showError } from '../../../../utils/popupNotification';
import './admin-emp-manage-styles.css';

function AdminAddCandidate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        specialChars: false
    });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        collegeName: '',
        credits: 0
    });

    const validatePassword = (pwd) => {
        const specialChars = pwd.match(/[@#!%$*?]/g) || [];
        setPasswordValidation({
            length: pwd.length >= 6,
            uppercase: /[A-Z]/.test(pwd),
            specialChars: specialChars.length >= 1
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (name === 'password') {
            validatePassword(value);
        }
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
            newErrors.firstName = 'First name can only contain letters';
        }
        
        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters';
        }
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordValidation.length) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!passwordValidation.uppercase) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!passwordValidation.specialChars) {
            newErrors.password = 'Password must contain at least one special character (@#!%$*?)';
        }
        
        // College Name validation
        if (!formData.collegeName.trim()) {
            newErrors.collegeName = 'College name is required';
        } else if (formData.collegeName.trim().length < 3) {
            newErrors.collegeName = 'College name must be at least 3 characters';
        }
        
        // Credits validation
        if (formData.credits < 0) {
            newErrors.credits = 'Credits cannot be negative';
        } else if (formData.credits > 10000) {
            newErrors.credits = 'Credits cannot exceed 10000';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showError('Please fix all validation errors before submitting');
            return;
        }

        setLoading(true);
        try {
            const response = await api.createCandidate(formData);
            
            if (response.success) {
                showSuccess('Candidate created successfully! Welcome email sent with login credentials.');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    collegeName: '',
                    credits: 0
                });
                setTimeout(() => {
                    navigate('/admin/placement-credits');
                }, 1500);
            } else {
                showError(response.message || 'Failed to create candidate');
            }
        } catch (error) {
            showError('Error creating candidate: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Add New Candidate</h2>
                <p>Create a new candidate account and assign credits</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Candidate Information</h4>
                </div>

                <div className="panel-body wt-panel-body p-a20">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                />
                                {errors.firstName && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.firstName}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                />
                                {errors.lastName && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.lastName}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Email ID <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.email}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Password <span style={{color: 'red'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '12px',
                                            cursor: 'pointer',
                                            color: '#6c757d'
                                        }}
                                    >
                                        <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                                    </span>
                                </div>
                                {errors.password && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.password}</div>}
                                {formData.password && (
                                    <div style={{ marginTop: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                                        <h6 style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#495057' }}>Password Requirements:</h6>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ padding: '3px 0', fontSize: '12px', color: passwordValidation.length ? '#28a745' : '#dc3545' }}>
                                                <i className={`fa ${passwordValidation.length ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                At least 6 characters
                                            </li>
                                            <li style={{ padding: '3px 0', fontSize: '12px', color: passwordValidation.uppercase ? '#28a745' : '#dc3545' }}>
                                                <i className={`fa ${passwordValidation.uppercase ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                One uppercase letter
                                            </li>
                                            <li style={{ padding: '3px 0', fontSize: '12px', color: passwordValidation.specialChars ? '#28a745' : '#dc3545' }}>
                                                <i className={`fa ${passwordValidation.specialChars ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                One special character (@#!%$*?)
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">College Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    className={`form-control ${errors.collegeName ? 'is-invalid' : ''}`}
                                    value={formData.collegeName}
                                    onChange={handleChange}
                                    placeholder="Enter college name"
                                />
                                {errors.collegeName && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.collegeName}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Credits</label>
                                <input
                                    type="number"
                                    name="credits"
                                    className={`form-control ${errors.credits ? 'is-invalid' : ''}`}
                                    value={formData.credits}
                                    onChange={handleChange}
                                    placeholder="Enter credits (0-10000)"
                                />
                                {errors.credits && <div className="text-danger mt-1" style={{fontSize: '0.875rem'}}>{errors.credits}</div>}
                            </div>
                        </div>

                        <div className="mt-4" style={{display: 'flex', gap: '10px'}}>
                            <button
                                type="submit"
                                className="site-button"
                                disabled={loading}
                                style={{
                                    backgroundColor: '#fd7e14',
                                    color: 'white',
                                    padding: '10px 30px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Candidate'}
                            </button>
                            <button
                                type="button"
                                className="site-button"
                                onClick={() => navigate('/admin/placement-credits')}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    padding: '10px 30px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminAddCandidate;
