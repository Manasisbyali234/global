import { useState, useEffect } from 'react';
import './emp-support.css';

function EmpSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        userType: 'employer',
        userId: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        // Debug: Check all localStorage keys
        
        
        // Try multiple localStorage keys for employer data
        const possibleKeys = ['employerData', 'employer', 'user', 'authData', 'loginData'];
        let foundData = null;
        
        for (const key of possibleKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                
                try {
                    foundData = JSON.parse(data);
                    break;
                } catch (e) {
                    
                }
            }
        }
        
        // Check for token like NotificationBell does
        const employerToken = localStorage.getItem('employerToken') || 
                            localStorage.getItem('token') ||
                            localStorage.getItem('authToken');
        
        
        // Update form data if we found any data
        if (foundData) {
            
            setFormData(prev => ({
                ...prev,
                name: foundData.companyName || foundData.name || foundData.firstName || 'Employer',
                email: foundData.email || '',
                phone: foundData.phone || foundData.mobile || '',
                userId: foundData._id || foundData.id || ''
            }));
        }
        
        // If no data, try to decode token
        if (!foundData && employerToken) {
            try {
                const tokenPayload = JSON.parse(atob(employerToken.split('.')[1]));
                
                setFormData(prev => ({
                    ...prev,
                    userId: tokenPayload.id || tokenPayload.userId || '',
                    name: tokenPayload.companyName || tokenPayload.name || 'Employer',
                    email: tokenPayload.email || ''
                }));
            } catch (error) {
                
            }
        }
    }, []);

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'account', label: 'Account Management' },
        { value: 'job-posting', label: 'Job Posting' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            // If not an image, return as is
            if (!file.type.startsWith('image/')) {
                resolve(file);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Resize if image is too large
                    const maxDimension = 1920;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with compression
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const fileName = file.name || `attachment-${Date.now()}.jpg`;
                            const compressedFile = new File([blob], fileName, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.8); // 80% quality
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        const clearFileInput = () => {
            if (e.target) e.target.value = '';
        };
        
        // Check file count
        if (selectedFiles.length > 3) {
            setErrors(prev => ({ ...prev, files: 'Maximum 3 files allowed' }));
            clearFileInput();
            return;
        }
        
        // Compress images if they're too large
        setIsCompressing(true);
        const processedFiles = [];
        for (const file of selectedFiles) {
            if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
                // Compress large images (over 5MB)
                const compressed = await compressImage(file);
                processedFiles.push(compressed);
            } else {
                processedFiles.push(file);
            }
        }
        setIsCompressing(false);
        
        // Check individual file sizes
        const maxSize = 10 * 1024 * 1024; // 10MB per file
        const oversizedFiles = processedFiles.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setErrors(prev => ({ ...prev, files: `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max 10MB per file after compression.` }));
            clearFileInput();
            return;
        }
        
        // Check total size
        const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 25 * 1024 * 1024; // 25MB total
        if (totalSize > maxTotalSize) {
            setErrors(prev => ({ ...prev, files: 'Total file size exceeds 25MB. Please select smaller files.' }));
            clearFileInput();
            return;
        }
        
        setFiles(processedFiles);
        if (errors.files) {
            setErrors(prev => ({ ...prev, files: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            
            // Ensure all required fields are present - email will be auto-fetched from login
            const requiredData = {
                name: formData.name || 'Employer User',
                email: formData.email, // This will be auto-fetched from login credentials
                userType: formData.userType,
                userId: formData.userId || '',
                subject: formData.subject,
                category: formData.category,
                priority: formData.priority,
                message: formData.message
            };
            
            // Only add phone if it's a valid phone number
            if (formData.phone && formData.phone.trim() && formData.phone !== 'Not provided') {
                requiredData.phone = formData.phone;
            }
            
            // Use fallback email if none found
            if (!requiredData.email) {
                requiredData.email = 'employer@jobportal.com';
                
            }
            
            Object.keys(requiredData).forEach(key => {
                submitData.append(key, requiredData[key]);
            });
            
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            console.log('Submitting support ticket with data:', Object.fromEntries(submitData));
            
            const response = await fetch('/api/public/support', {
                method: 'POST',
                body: submitData
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                setIsSubmitted(true);
                setFormData(prev => ({
                    ...prev,
                    subject: '',
                    category: 'general',
                    priority: 'medium',
                    message: ''
                }));
                setFiles([]);
                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            } else {
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log('Backend error response:', data);
                    
                    // Handle validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const errorMessages = data.errors.map(err => err.msg).join(', ');
                        setErrors({ submit: `Validation Error: ${errorMessages}` });
                    } else {
                        setErrors({ submit: data.message || 'Failed to submit support ticket' });
                    }
                } else {
                    // Handle non-JSON responses (HTML error pages)
                    const text = await response.text();
                    console.log('Non-JSON error response:', text.substring(0, 200));
                    
                    if (response.status === 413) {
                        setErrors({ submit: 'File size too large. Please reduce file sizes to under 10MB each and 25MB total.' });
                    } else if (response.status === 408) {
                        setErrors({ submit: 'Upload timeout. Please try uploading smaller files or check your internet connection.' });
                    } else {
                        setErrors({ submit: `Server error (${response.status}). Please try again with smaller files or contact support.` });
                    }
                }
            }
        } catch (error) {
            console.log('Support submission error:', error);
            
            // Check if it's a network error
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setErrors({ submit: 'Backend server not running. Please start the backend server on port 5000.' });
            } else {
                setErrors({ submit: `Network error: ${error.message}` });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="twm-right-section-panel site-bg-gray emp-support-page" style={{
                width: '100%',
                margin: 0,
                padding: 0,
                background: '#f7f7f7',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
                    <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <h2>Support Ticket Submitted</h2>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh', padding: '0 2rem' }}>
                    <div className="text-center">
                        <div className="success-icon mb-3">
                            <i className="fa fa-check-circle" style={{fontSize: '4rem', color: '#28a745'}}></i>
                        </div>
                        <p className="mb-4">Thank you for contacting our support team. We have received your ticket and will respond within 2 to 3 Working Days.</p>
                        <button 
                            onClick={() => setIsSubmitted(false)} 
                            className="site-button"
                        >
                            Submit Another Ticket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="twm-right-section-panel site-bg-gray emp-support-page" style={{
            width: '100%',
            margin: 0,
            padding: 0,
            background: '#f7f7f7',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
                <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <h2>Support</h2>
                </div>
            </div>
            {/* Content */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
                <div className="panel panel-default" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0">Get Support</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30">

                            
                            <form onSubmit={handleSubmit}>
                                {errors.submit && (
                                    <div className="alert alert-danger mb-3">{errors.submit}</div>
                                )}
                                
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Subject <span style={{ color: 'red' }}>*</span></label>
                                            <input 
                                                name="subject" 
                                                type="text" 
                                                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                placeholder="Brief description of your issue" 
                                                value={formData.subject}
                                                onChange={handleChange}
                                            />
                                            {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select 
                                                name="category" 
                                                className="form-control"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Priority</label>
                                            <select 
                                                name="priority" 
                                                className="form-control"
                                                value={formData.priority}
                                                onChange={handleChange}
                                            >
                                                {priorities.map(pri => (
                                                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Message<span style={{ color: 'red' }}>*</span></label>
                                            <textarea 
                                                name="message" 
                                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                rows={5} 
                                                placeholder="Describe your issue or question in detail..." 
                                                value={formData.message}
                                                onChange={handleChange}
                                            />
                                            {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Attachments (Optional)</label>
                                            <input 
                                                type="file" 
                                                className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                                                multiple 
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                                onChange={handleFileChange}
                                            />
                                            <small className="form-text text-muted">
                                                Upload up to 3 files (max 10MB each, 25MB total). Supported: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF, WEBP
                                            </small>
                                            {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                                            {files.length > 0 && (
                                                <div className="mt-3">
                                                    <strong className="d-block mb-2" style={{ color: '#ff6b35' }}>
                                                        <i className="fa fa-check-circle me-1"></i>
                                                        Selected files ({files.length}/3):
                                                    </strong>
                                                    <ul className="list-unstyled mb-0">
                                                        {files.map((file, index) => {
                                                            const fileSizeKB = file.size / 1024;
                                                            const fileSizeMB = fileSizeKB / 1024;
                                                            const displaySize = fileSizeMB >= 1 
                                                                ? fileSizeMB.toFixed(2) + ' MB' 
                                                                : fileSizeKB.toFixed(2) + ' KB';
                                                            return (
                                                                <li key={index} className="d-flex align-items-center mb-2">
                                                                    <i className="fa fa-file me-2" style={{ color: '#ff6b35' }}></i>
                                                                    <span className="flex-grow-1" style={{ fontSize: '14px', color: '#ff6b35' }}>{file.name}</span>
                                                                    <span className="ms-2" style={{ fontSize: '12px', color: '#ff6b35', fontWeight: '600' }}>
                                                                        {displaySize}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <button 
                                            type="submit" 
                                            className="site-button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmpSupport;
