import { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';

function CanSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        userType: 'candidate',
        userId: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
        receiverRole: 'admin',
        receiverId: ''
    });
    const [files, setFiles] = useState([]);
    const [employers, setEmployers] = useState([]);
    const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        fetchCandidateData();
    }, []);

    useEffect(() => {
        if (formData.receiverRole === 'employer') {
            fetchAppliedEmployers();
        }
    }, [formData.receiverRole]);

    const fetchAppliedEmployers = async () => {
        setIsLoadingEmployers(true);
        try {
            const response = await api.getCandidateApplications();
            if (response.success && response.applications) {
                // Extract unique employers from applications
                const uniqueEmployers = [];
                const seenEmployerIds = new Set();

                response.applications.forEach(app => {
                    const employer = app.employerId || app.jobId?.employerId;
                    if (employer && !seenEmployerIds.has(employer._id)) {
                        seenEmployerIds.add(employer._id);
                        uniqueEmployers.push({
                            id: employer._id,
                            name: employer.companyName || employer.name
                        });
                    }
                });
                setEmployers(uniqueEmployers);
            }
        } catch (error) {
            console.error('Error fetching applied employers:', error);
        } finally {
            setIsLoadingEmployers(false);
        }
    };

    const fetchCandidateData = async () => {
        try {
            // First try to get data from localStorage
            const candidateData = localStorage.getItem('candidateData');
            if (candidateData) {
                const candidate = JSON.parse(candidateData);
                setFormData(prev => ({
                    ...prev,
                    name: candidate.name || '',
                    email: candidate.email || '',
                    phone: candidate.phone || '',
                    userId: candidate.id || ''
                }));
            }

            // Then try to fetch from API for more up-to-date data
            const token = localStorage.getItem('candidateToken');
            if (token) {
                try {
                    const response = await api.getCandidateProfile();
                    if (response.success && response.profile) {
                        const profile = response.profile;
                        const candidate = profile.candidateId || {};
                        
                        // Update form with profile data (this will override localStorage data)
                        setFormData(prev => ({
                            ...prev,
                            name: candidate.name || prev.name,
                            email: candidate.email || prev.email,
                            phone: candidate.phone || prev.phone,
                            userId: candidate._id || prev.userId
                        }));
                    }
                } catch (apiError) {
                    console.log('Could not fetch profile from API, using localStorage data:', apiError.message);
                }
            }
        } catch (error) {
            console.error('Error fetching candidate data:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'account', label: 'Account Management' },
        { value: 'application', label: 'Job Application' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        if (formData.receiverRole === 'employer' && !formData.receiverId) {
            newErrors.receiverId = 'Please select an employer';
        }
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
            e.target.value = '';
        };
        
        if (selectedFiles.length > 3) {
            setErrors(prev => ({ ...prev, files: 'Too many files selected. Please choose maximum 3 files only.' }));
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
        
        const maxSize = 50 * 1024 * 1024; // 50MB per file
        const oversizedFiles = processedFiles.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            const fileList = oversizedFiles.map(f => `"${f.name}" (${(f.size / 1024 / 1024).toFixed(1)}MB)`).join(', ');
            setErrors(prev => ({ 
                ...prev, 
                files: `File size too large: ${fileList}. Each file must be under 50MB. Please compress your files before uploading.` 
            }));
            clearFileInput();
            return;
        }
        
        const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 150 * 1024 * 1024; // 150MB total
        if (totalSize > maxTotalSize) {
            const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
            setErrors(prev => ({ 
                ...prev, 
                files: `Combined file size too large: ${totalSizeMB}MB exceeds the 150MB limit. Please reduce file sizes or number of files.` 
            }));
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
            
            // Ensure all required fields are present
            const requiredData = {
                name: formData.name.trim() || 'Candidate User',
                email: formData.email.trim() || 'candidate@jobportal.com',
                phone: formData.phone.trim() || '',
                userType: formData.userType,
                userId: formData.userId || '',
                subject: formData.subject.trim(),
                category: formData.category,
                priority: formData.priority,
                message: formData.message.trim(),
                receiverRole: formData.receiverRole,
                receiverId: formData.receiverId
            };
            
            console.log('Submitting candidate support ticket with data:', requiredData);
            
            Object.keys(requiredData).forEach(key => {
                if (requiredData[key] !== undefined && requiredData[key] !== null) {
                    submitData.append(key, requiredData[key]);
                }
            });
            
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            const response = await api.submitSupportTicket(submitData);
            
            const contentType = response.headers.get('content-type');
            
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
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.error('Support ticket submission failed:', data);
                    
                    // Handle validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const validationErrors = {};
                        data.errors.forEach(error => {
                            if (error.path) {
                                validationErrors[error.path] = error.msg;
                            }
                        });
                        setErrors({ ...validationErrors, submit: data.message || 'Validation failed' });
                    } else {
                        setErrors({ submit: data.message || 'Failed to submit support ticket' });
                    }
                } else {
                    // Server returned HTML or other non-JSON response
                    const text = await response.text();
                    console.error('Non-JSON response:', text.substring(0, 200));
                    
                    if (response.status === 413) {
                        setErrors({ submit: 'File size too large. Each file must be under 50MB and total size under 150MB. Please compress your files before uploading.' });
                    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
                        setErrors({ submit: 'Server is temporarily busy or unavailable. Your attachments might be too large for the server to process. Please try with smaller or fewer files.' });
                    } else {
                        setErrors({ submit: `Failed to submit support ticket (Status ${response.status}). Please try again with smaller files or contact support.` });
                    }
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrors({ submit: 'Failed to submit ticket: ' + (error.message || 'Network error. Please check your connection and try again.') });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="twm-right-section-panel site-bg-gray" style={{ height: '100vh', overflow: 'hidden', position: 'fixed', width: '100%', top: 0, left: 0 }}>
                <div style={{ padding: '2rem 2rem 0 2rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                                <i className="fa fa-headset me-2" style={{color: '#f97316'}}></i>
                                Support Ticket Submitted
                            </h2>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh', padding: '0 2rem' }}>
                    <div className="text-center">
                        <div className="success-icon mb-3">
                            <i className="fa fa-check-circle" style={{fontSize: '4rem', color: '#28a745'}}></i>
                        </div>
                        <h3 className="text-success mb-3" style={{wordBreak: 'break-word', display: 'block', textAlign: 'center'}}>✓ Support Ticket Submitted!</h3>
                        <p className="mb-4">Thank you for contacting our support team. We have received your ticket and will respond within 24 hours.</p>
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
        <div className="twm-right-section-panel site-bg-gray">
            {/* Support Page Header */}
            <div style={{ padding: '2rem 2rem 0 2rem' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                            <i className="fa fa-headset me-2" style={{color: '#f97316'}}></i>
                            Get Support
                        </h2>
                        <p style={{ color: '#6b7280', margin: 0 }}>
                            Need help? Contact our support team and we'll get back to you within 24 hours
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Support Content */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                            <form onSubmit={handleSubmit}>
                                {errors.submit && (
                                    <div className="alert alert-danger mb-3" style={{padding: '12px', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word'}}>{errors.submit}</div>
                                )}
                                
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input 
                                                name="name" 
                                                type="text" 
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder={isLoadingProfile ? "Loading..." : "Your name"}
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={isLoadingProfile}
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input 
                                                name="email" 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder={isLoadingProfile ? "Loading..." : "Your email address"}
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isLoadingProfile}
                                                readOnly
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Send To</label>
                                            <select 
                                                name="receiverRole" 
                                                className="form-control"
                                                value={formData.receiverRole}
                                                onChange={handleChange}
                                            >
                                                <option value="admin">Admin Support</option>
                                                <option value="employer">HR Support</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formData.receiverRole === 'employer' && (
                                        <div className="col-xl-6 col-lg-6 col-md-12">
                                            <div className="form-group">
                                                <label>Select Employer</label>
                                                <select 
                                                    name="receiverId" 
                                                    className={`form-control ${errors.receiverId ? 'is-invalid' : ''}`}
                                                    value={formData.receiverId}
                                                    onChange={handleChange}
                                                    disabled={isLoadingEmployers}
                                                >
                                                    <option value="">{isLoadingEmployers ? 'Loading employers...' : 'Choose an employer'}</option>
                                                    {employers.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </select>
                                                {errors.receiverId && <div className="invalid-feedback">{errors.receiverId}</div>}
                                                {employers.length === 0 && !isLoadingEmployers && (
                                                    <small className="text-muted">No employers found. You can only send tickets to employers you've applied to.</small>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Subject</label>
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
                                            <label>Message</label>
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
                                                disabled={isCompressing}
                                            />
                                            {isCompressing && (
                                                <div className="mt-2" style={{ color: '#ff6b35' }}>
                                                    <i className="fa fa-spinner fa-spin me-1"></i>
                                                    Compressing images...
                                                </div>
                                            )}
                                            <small className="form-text d-block mt-2" style={{ color: '#ff6b35' }}>
                                                <i className="fa fa-info-circle me-1"></i>
                                                Upload up to 3 files (max 50MB each, 150MB total). Large images will be automatically compressed.
                                            </small>
                                            {errors.files && (
                                                <div className="invalid-feedback d-block">
                                                    <i className="fa fa-exclamation-triangle me-1"></i>
                                                    {errors.files}
                                                </div>
                                            )}
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

export default CanSupport;
