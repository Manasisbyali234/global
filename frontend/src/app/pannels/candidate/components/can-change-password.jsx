import React, { useState } from 'react';
import { authAPI } from '../../../../utils/apiAuth';

function CanChangePasswordPage() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message when user starts typing
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setMessage({ type: 'error', text: 'Current password is required' });
            return false;
        }
        if (!formData.newPassword) {
            setMessage({ type: 'error', text: 'New password is required' });
            return false;
        }
        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return false;
        }
        if (formData.currentPassword === formData.newPassword) {
            setMessage({ type: 'error', text: 'New password must be different from current password' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authAPI.candidateChangePassword(
                formData.currentPassword,
                formData.newPassword
            );

            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to change password' });
            }
        } catch (error) {
            
            let errorMessage = error.message || 'An error occurred while changing password';
            
            if (error.message.includes('401') || error.message.includes('authorization') || error.message.includes('token')) {
                errorMessage = 'Please log in again to change your password';
                // Optionally redirect to login
                setTimeout(() => {
                    localStorage.removeItem('candidateToken');
                    window.location.href = '/login';
                }, 2000);
            }
            
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="twm-right-section-panel site-bg-gray">
                <form onSubmit={handleSubmit}>
                    {/*Basic Information*/}
                    <div className="panel panel-default">
                        <div className="panel-heading wt-panel-heading p-a20">
                            <h4 className="panel-tittle m-a0">Change Password</h4>
                        </div>
                        <div className="panel-body wt-panel-body p-a20">
                            {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                                    {message.text}
                                </div>
                            )}
                            
                            <div className="row">
                                <div className="col-lg-6 col-md-6">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <div className="ls-inputicon-box">
                                            <input 
                                                className="form-control wt-form-control" 
                                                name="currentPassword" 
                                                type={showPasswords.current ? "text" : "password"}
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter current password"
                                                required
                                            />
                                            <i 
                                                className={`fs-input-icon fa ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => togglePasswordVisibility('current')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div className="ls-inputicon-box">
                                            <input 
                                                className="form-control wt-form-control" 
                                                name="newPassword" 
                                                type={showPasswords.new ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                placeholder="Enter new password (min 6 characters)"
                                                required
                                            />
                                            <i 
                                                className={`fs-input-icon fa ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => togglePasswordVisibility('new')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 col-md-12">
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <div className="ls-inputicon-box">
                                            <input 
                                                className="form-control wt-form-control" 
                                                name="confirmPassword" 
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            <i 
                                                className={`fs-input-icon fa ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-12 col-lg-12 col-md-12">
                                    <div className="text-left">
                                        <button 
                                            type="submit" 
                                            className="site-button"
                                            disabled={loading}
                                        >
                                            {loading ? 'Changing Password...' : 'Change Password'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default CanChangePasswordPage;
