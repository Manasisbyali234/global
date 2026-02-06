import { useState, useEffect } from "react";
import SearchBar from "../../../../components/SearchBar";
import './admin-sub-admin-permission-cards-fix.css';

import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../utils/popupNotification';
const API_BASE_URL = 'http://localhost:5000/api';

const passwordInputStyle = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
`;

function AdminSubAdmin() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        employerCode: '',
        permissions: [],
        password: '',
        confirmPassword: ''
    });
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMainAdmin, setIsMainAdmin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [filteredSubAdmins, setFilteredSubAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePermissionChange = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
        // Clear permissions validation error
        if (validationErrors.permissions) {
            setValidationErrors(prev => ({
                ...prev,
                permissions: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // First Name validation
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
            errors.firstName = 'First name can only contain letters';
        }
        
        // Last Name validation
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            errors.lastName = 'Last name can only contain letters';
        }
        
        // Username validation
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, and underscores';
        }
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Phone validation
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        // Employer Code validation
        if (!formData.employerCode.trim()) {
            errors.employerCode = 'Employer code is required';
        } else if (formData.employerCode.trim().length < 3) {
            errors.employerCode = 'Employer code must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.employerCode)) {
            errors.employerCode = 'Employer code can only contain letters, numbers, hyphens, and underscores';
        }
        
        // Permissions validation
        if (formData.permissions.length === 0) {
            errors.permissions = 'Please select at least one permission';
        }
        
        // Password validation (only for add form or if password is provided in edit)
        if (showAddForm || formData.password) {
            if (!formData.password) {
                errors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            } else if (!/(?=.*[A-Z])/.test(formData.password)) {
                errors.password = 'Password must contain at least one uppercase letter';
            } else if (!/[@#!%$*?]/.test(formData.password)) {
                errors.password = 'Password must contain at least one special character (@#!%$*?)';
            }
            
            // Confirm Password validation
            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const url = showEditForm ? `${API_BASE_URL}/admin/sub-admins/${editingId}` : `${API_BASE_URL}/admin/sub-admins`;
            const method = showEditForm ? 'PUT' : 'POST';
            
            const requestBody = {
                name: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                employerCode: formData.employerCode,
                permissions: formData.permissions
            };
            
            // Only include password if it's provided
            if (formData.password) {
                requestBody.password = formData.password;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            if (data.success) {
                if (showEditForm) {
                    showSuccess('Sub Admin updated successfully. They will see changes after refreshing their page.');
                } else {
                    showSuccess('Sub Admin created successfully');
                }
                resetForm();
                fetchSubAdmins();
            } else {
                showError(data.message || `Error ${showEditForm ? 'updating' : 'creating'} sub admin`);
            }
        } catch (error) {
            showError(`Error ${showEditForm ? 'updating' : 'creating'} sub admin`);
        }
        setLoading(false);
    };
    
    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            employerCode: '',
            permissions: [],
            password: '',
            confirmPassword: ''
        });
        setValidationErrors({});
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingId(null);
    };
    
    const handleEdit = (admin) => {
        const [firstName, ...lastNameParts] = admin.name.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setFormData({
            firstName: firstName || '',
            lastName: lastName || '',
            username: admin.username,
            email: admin.email,
            phone: admin.phone || '',
            employerCode: admin.employerCode || '',
            permissions: admin.permissions || [],
            password: '',
            confirmPassword: ''
        });
        setEditingId(admin._id);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const fetchSubAdmins = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/admin/sub-admins`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                setError('Authentication failed. Please refresh the page or login again.');
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                setSubAdmins(data.subAdmins);
                setFilteredSubAdmins(data.subAdmins);
                setError('');
            } else {
                setError(data.message || 'Failed to fetch sub admins');
            }
        } catch (error) {
            
            setError('Failed to connect to server');
        }
    };

    const handleDelete = async (id) => {
        showConfirmation(
            'Are you sure you want to delete this sub admin? This action cannot be undone.',
            async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch(`${API_BASE_URL}/admin/sub-admins/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        showSuccess('Sub Admin deleted successfully');
                        fetchSubAdmins();
                    } else {
                        showError(data.message || 'Error deleting sub admin');
                    }
                } catch (error) {
                    showError('Error deleting sub admin');
                }
            },
            () => {},
            'warning'
        );
    };

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        
        if (!adminToken || !adminData) {
            window.location.href = '/';
            return;
        }
        
        setAuthChecked(true);
        fetchSubAdmins();
        
        // Set up periodic refresh to check for updates
        const refreshInterval = setInterval(() => {
            fetchSubAdmins();
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(refreshInterval);
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredSubAdmins(subAdmins);
        } else {
            const filtered = subAdmins.filter(admin => 
                admin.name.toLowerCase().includes(term.toLowerCase()) ||
                admin.username.toLowerCase().includes(term.toLowerCase()) ||
                admin.email.toLowerCase().includes(term.toLowerCase()) ||
                admin.employerCode.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredSubAdmins(filtered);
        }
    };

    useEffect(() => {
        setFilteredSubAdmins(subAdmins);
    }, [subAdmins]);



    return (
        <>
        <style>{passwordInputStyle}</style>
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Sub Admin Management</h2>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-body wt-panel-body">
                        {!showAddForm && !showEditForm ? (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-semibold text-dark mb-0">Sub Admins List</h4>
                                    <button 
                                        className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                                        style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                        onClick={() => {
                                            resetForm();
                                            setShowAddForm(true);
                                        }}
                                    >
                                        <i className="fa fa-plus me-2"></i>
                                        Add New Sub Admin
                                    </button>
                                </div>
                                
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search by name, username, email, or employer code..."
                                    className="mb-3"
                                />
                                
                                <div className="table-container">
                                    <table className="table emp-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Employer Code</th>
                                                <th>Permissions</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubAdmins.length > 0 ? (
                                                filteredSubAdmins.map((admin) => (
                                                    <tr key={admin._id}>
                                                        <td>
                                                            <span className="company-name">{admin.name}</span>
                                                        </td>
                                                        <td>{admin.username}</td>
                                                        <td>{admin.email}</td>
                                                        <td style={{fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '600'}}>{admin.employerCode}</td>
                                                        <td style={{fontSize: '0.85rem'}}>
                                                            {admin.permissions.map((permission, index) => (
                                                                <span key={index}>
                                                                    {permission.replace('_', ' ')}{index < admin.permissions.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-btn"
                                                                    onClick={() => handleEdit(admin)}
                                                                    style={{ minWidth: '140px', maxWidth: '140px', width: '140px' }}
                                                                >
                                                                    <i className="fa fa-edit"></i>
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="action-btn"
                                                                    onClick={() => handleDelete(admin._id)}
                                                                    style={{ minWidth: '140px', maxWidth: '140px', width: '140px' }}
                                                                >
                                                                    <i className="fa fa-trash"></i>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        {searchTerm ? `No sub admins found matching "${searchTerm}"` : 'No sub admins found'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-semibold text-dark mb-0">
                                        <i className={`fa ${showEditForm ? 'fa-edit' : 'fa-plus'} me-2`} style={{ color: '#fd7e14' }}></i>
                                        {showEditForm ? 'Edit Sub Admin' : 'Add New Sub Admin'}
                                    </h4>
                                    <button 
                                        className="btn btn-outline-secondary rounded-pill px-4"
                                        onClick={resetForm}
                                    >
                                        <i className="fa fa-arrow-left me-2"></i>
                                        Back to List
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.firstName ? 'is-invalid' : ''}`}
                                                name="firstName"
                                                type="text"
                                                placeholder="First Name *"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.firstName && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.firstName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.lastName ? 'is-invalid' : ''}`}
                                                name="lastName"
                                                type="text"
                                                placeholder="Last Name *"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.lastName && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.lastName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.username ? 'is-invalid' : ''}`}
                                                name="username"
                                                type="text"
                                                placeholder="Username *"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.username && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.username}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.email ? 'is-invalid' : ''}`}
                                                name="email"
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.email && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.phone ? 'is-invalid' : ''}`}
                                                name="phone"
                                                type="tel"
                                                placeholder="Phone Number *"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.phone && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <input
                                                className={`form-control rounded-3 ${validationErrors.employerCode ? 'is-invalid' : ''}`}
                                                name="employerCode"
                                                type="text"
                                                placeholder="Employer Code *"
                                                value={formData.employerCode}
                                                onChange={handleInputChange}
                                            />
                                            {validationErrors.employerCode && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.employerCode}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 mt-4 admin-sub-admin-permissions">
                                            <label className="form-label fw-semibold text-dark mb-3">Permissions  <span style={{ color: 'red' }}>*</span></label>
                                            {validationErrors.permissions && (
                                                <div className="alert alert-danger py-2 mb-3">
                                                    <i className="fa fa-exclamation-circle me-1"></i>
                                                    {validationErrors.permissions}
                                                </div>
                                            )}
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('employers') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="employers"
                                                                checked={formData.permissions.includes('employers')}
                                                                onChange={() => handlePermissionChange('employers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="employers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-building fa-2x mb-2" style={{ color: formData.permissions.includes('employers') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Employers</span>
                                                                <small className="text-muted">Manage employer accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('placement_officers') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="placement_officers"
                                                                checked={formData.permissions.includes('placement_officers')}
                                                                onChange={() => handlePermissionChange('placement_officers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="placement_officers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-graduation-cap fa-2x mb-2" style={{ color: formData.permissions.includes('placement_officers') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Placement Officers</span>
                                                                <small className="text-muted">Manage placement officers</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('registered_candidates') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="registered_candidates"
                                                                checked={formData.permissions.includes('registered_candidates')}
                                                                onChange={() => handlePermissionChange('registered_candidates')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="registered_candidates" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-users fa-2x mb-2" style={{ color: formData.permissions.includes('registered_candidates') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Registered Candidates</span>
                                                                <small className="text-muted">Manage candidate accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="position-relative">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={showAddForm ? "Password *" : "Password (Leave blank to keep current)"}
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    style={{ 
                                                        paddingRight: validationErrors.password ? '70px' : '40px',
                                                        WebkitTextSecurity: showPassword ? 'none' : 'disc',
                                                        border: validationErrors.password ? '1px solid #dc3545' : '1px solid #ced4da'
                                                    }}
                                                    autoComplete="new-password"
                                                />
                                                {validationErrors.password && (
                                                    <i 
                                                        className="fa fa-exclamation-circle"
                                                        style={{
                                                            position: 'absolute',
                                                            right: '40px',
                                                            top: '12px',
                                                            color: '#dc3545',
                                                            zIndex: 10,
                                                            pointerEvents: 'none'
                                                        }}
                                                    ></i>
                                                )}
                                                <i 
                                                    className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '12px',
                                                        cursor: 'pointer',
                                                        color: '#6c757d',
                                                        zIndex: 10
                                                    }}
                                                ></i>
                                            </div>
                                            {validationErrors.password && (
                                                <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                                                    {validationErrors.password}
                                                </div>
                                            )}
                                            {formData.password && (
                                                <div style={{ marginTop: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                                                    <h6 style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#495057' }}>Password Requirements:</h6>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        <li style={{ padding: '3px 0', fontSize: '12px', color: formData.password.length >= 6 ? '#28a745' : '#dc3545' }}>
                                                            <i className={`fa ${formData.password.length >= 6 ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                            At least 6 characters
                                                        </li>
                                                        <li style={{ padding: '3px 0', fontSize: '12px', color: /(?=.*[A-Z])/.test(formData.password) ? '#28a745' : '#dc3545' }}>
                                                            <i className={`fa ${/(?=.*[A-Z])/.test(formData.password) ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                            One uppercase letter
                                                        </li>
                                                        <li style={{ padding: '3px 0', fontSize: '12px', color: /[@#!%$*?]/.test(formData.password) ? '#28a745' : '#dc3545' }}>
                                                            <i className={`fa ${/[@#!%$*?]/.test(formData.password) ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: '6px' }}></i>
                                                            One special character (@#!%$*?)
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <div className="position-relative">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder={showAddForm ? "Confirm Password *" : "Confirm Password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    style={{ 
                                                        paddingRight: validationErrors.confirmPassword ? '70px' : '40px',
                                                        WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc',
                                                        border: validationErrors.confirmPassword ? '1px solid #dc3545' : '1px solid #ced4da'
                                                    }}
                                                    autoComplete="new-password"
                                                />
                                                {validationErrors.confirmPassword && (
                                                    <i 
                                                        className="fa fa-exclamation-circle"
                                                        style={{
                                                            position: 'absolute',
                                                            right: '40px',
                                                            top: '12px',
                                                            color: '#dc3545',
                                                            zIndex: 10,
                                                            pointerEvents: 'none'
                                                        }}
                                                    ></i>
                                                )}
                                                <i 
                                                    className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '12px',
                                                        cursor: 'pointer',
                                                        color: '#6c757d',
                                                        zIndex: 10
                                                    }}
                                                ></i>
                                            </div>
                                            {validationErrors.confirmPassword && (
                                                <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                                                    {validationErrors.confirmPassword}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex gap-3 pt-3">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <i className="fa fa-spinner fa-spin me-2"></i>
                                                            {showEditForm ? 'Updating...' : 'Adding...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className={`fa ${showEditForm ? 'fa-save' : 'fa-plus'} me-2`}></i>
                                                            {showEditForm ? 'Update Sub Admin' : 'Add Sub Admin'}
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary rounded-pill px-4 py-2"
                                                    onClick={resetForm}
                                                >
                                                    <i className="fa fa-times me-2"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                </div>
            </div>
        </div>
        </>
    );
}

export default AdminSubAdmin;
