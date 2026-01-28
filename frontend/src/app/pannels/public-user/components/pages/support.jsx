import { useState, useEffect } from 'react';
import './support.css';
import CountryCodeSelector from '../../../../../components/CountryCodeSelector';

function SupportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        phoneCountryCode: '+91',
        userType: 'guest',
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

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'billing', label: 'Billing & Payment' },
        { value: 'account', label: 'Account Management' },
        { value: 'job-posting', label: 'Job Posting' },
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
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        
        // Validate file size (max 10MB per file)
        for (let file of files) {
            if (file.size > 10 * 1024 * 1024) {
                newErrors.files = 'Each file must be less than 10MB after compression';
                break;
            }
        }
        
        // Check total file size (max 30MB)
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 30 * 1024 * 1024) {
            newErrors.files = 'Total file size exceeds 30MB';
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
        
        // Check individual file sizes (align with backend 10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = processedFiles.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            setErrors(prev => ({ ...prev, files: `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max 10MB per file after compression.` }));
            clearFileInput();
            return;
        }
        
        // Check total size (align with backend 30MB limit)
        const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);
        const maxTotalSize = 30 * 1024 * 1024; // 30MB
        if (totalSize > maxTotalSize) {
            setErrors(prev => ({ ...prev, files: 'Total file size exceeds 30MB. Please select smaller files.' }));
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
            Object.keys(formData).forEach(key => {
                if (key === 'phone') {
                    submitData.append(key, `${formData.phoneCountryCode}${formData.phone.trim()}`);
                } else {
                    submitData.append(key, formData[key]);
                }
            });
            
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            const response = await fetch('/api/public/support', {
                method: 'POST',
                body: submitData
            });
            
            if (response.ok) {
                setIsSubmitted(true);
                setFormData({
                    name: '', email: '', phone: '', phoneCountryCode: '+91', userType: 'guest',
                    subject: '', category: 'general', priority: 'medium', message: ''
                });
                setFiles([]);
                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            } else {
                // Try to parse JSON response, handle HTML error pages
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setErrors({ submit: data.message || 'Failed to submit support ticket' });
                } else {
                    // Server returned HTML error page
                    const text = await response.text();
                    if (response.status === 413) {
                        setErrors({ submit: 'File size too large. Please reduce file sizes and try again.' });
                    } else if (response.status === 408) {
                        setErrors({ submit: 'Upload timeout. Please try uploading smaller files or check your internet connection.' });
                    } else {
                        setErrors({ submit: 'Server error. Please try again or contact support if the issue persists.' });
                    }
                }
            }
        } catch (error) {
            console.error('Support ticket submission error:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                setErrors({ submit: 'Network error. Please check your internet connection and try again.' });
            } else {
                setErrors({ submit: 'An unexpected error occurred. Please try again or contact support.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
            const panels = document.querySelectorAll('.twm-right-section-panel, .page-wraper, #content');
            panels.forEach(el => {
                el.style.overflow = 'hidden';
                el.style.height = '100vh';
            });
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
            const panels = document.querySelectorAll('.twm-right-section-panel, .page-wraper, #content');
            panels.forEach(el => {
                el.style.overflow = '';
                el.style.height = '';
            });
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
        };
    }, [isSubmitted]);

    if (isSubmitted) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 9999, touchAction: 'none' }} onWheel={(e) => e.preventDefault()} onTouchMove={(e) => e.preventDefault()}>
                <div className="d-flex align-items-center justify-content-center" style={{ height: '100%', width: '100%', backgroundColor: '#fff' }}>
                    <div className="text-center" style={{ padding: '20px' }}>
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
        <div className="section-full twm-contact-one">
            <div className="section-content">
                <div className="container">
                    <div className="contact-one-inner">
                        <div className="row">
                            <div className="col-lg-8 col-md-12">
                                <div className="contact-form-outer">
                                    <div className="section-head left wt-small-separator-outer">
                                        <h2 className="wt-title">Get Support</h2>
                                        <p>Need help? Submit a support ticket and our team will assist you promptly.</p>
                                    </div>
                                    
                                    <form className="cons-contact-form" onSubmit={handleSubmit}>
                                        {errors.submit && (
                                            <div className="alert alert-danger mb-3">{errors.submit}</div>
                                        )}
                                        
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="name" 
                                                        type="text" 
                                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                        placeholder="Full Name *" 
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="email" 
                                                        type="email" 
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        placeholder="Email Address *" 
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <div className="input-group">
                                                        <CountryCodeSelector
                                                            value={formData.phoneCountryCode}
                                                            onChange={(value) => {
                                                                setFormData(prev => ({ ...prev, phoneCountryCode: value }));
                                                            }}
                                                            borderRadius="0.375rem 0 0 0.375rem"
                                                            height="auto"
                                                        />
                                                        <input
                                                            name="phone"
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Phone Number"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            maxLength="15"
                                                            style={{ borderRadius: '0 0.375rem 0.375rem 0' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
                                                    <select 
                                                        name="userType" 
                                                        className="form-control"
                                                        value={formData.userType}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="guest">Guest User</option>
                                                        <option value="candidate">Job Seeker</option>
                                                        <option value="employer">Employer</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        name="subject" 
                                                        type="text" 
                                                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                        placeholder="Subject *" 
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
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
                                            
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group mb-3">
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
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <textarea 
                                                        name="message" 
                                                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                        rows={4} 
                                                        placeholder="Describe your issue or question *" 
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-12">
                                                <div className="form-group mb-3">
                                                    <input 
                                                        type="file" 
                                                        className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                                                        multiple 
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                                        onChange={handleFileChange}
                                                    />
                                                    <small className="form-text text-muted">
                                                        Optional: Attach up to 3 files (max 20MB each, 60MB total). Supported: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, PNG, GIF, WEBP
                                                    </small>
                                                    {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                                                    {files.length > 0 && (
                                                        <div className="mt-2">
                                                            <strong>Selected files:</strong>
                                                            <ul className="list-unstyled mt-1">
                                                                {files.map((file, index) => (
                                                                    <li key={index} className="text-muted small">
                                                                        <i className="fa fa-file me-1"></i>
                                                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12">
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
                            
                            <div className="col-lg-4 col-md-12">
                                <div className="contact-info-wrap">
                                    <div className="contact-info">
                                        <div className="contact-info-section">
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-headset" /></div>
                                                <h3 className="twm-title">24/7 Support</h3>
                                                <p>Our support team is available round the clock to help you with any issues.</p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-clock" /></div>
                                                <h3 className="twm-title">Quick Response</h3>
                                                <p>We typically respond to support tickets within 24 hours.</p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-envelope" /></div>
                                                <h3 className="twm-title">Email Support</h3>
                                                <p><a href="mailto:support@jobzz.com">support@jobzz.com</a></p>
                                            </div>
                                            
                                            <div className="c-info-column">
                                                <div className="c-info-icon"><i className="fas fa-phone" /></div>
                                                <h3 className="twm-title">Phone Support</h3>
                                                <p><a href="tel:+919876543210">+91 9876543210</a></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupportPage;
