import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../../utils/api';
import { showError, showSuccess, showWarning } from '../../../../utils/popupNotification';
import './PlacementSupportSection.css';

const MAX_FILES = 3;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = 30 * 1024 * 1024;

const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account Management' },
    { value: 'application', label: 'Student/Application Query' }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

function formatFileSize(sizeInBytes) {
    if (sizeInBytes >= 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
}

function PlacementSupportSection({ placementData }) {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const subjectRef = useRef(null);
    const messageRef = useRef(null);
    const fileInputRef = useRef(null);

    const placementProfile = useMemo(() => {
        if (!placementData) return null;

        return {
            name: placementData.name || `${placementData.firstName || ''} ${placementData.lastName || ''}`.trim(),
            email: placementData.email || '',
            phone: placementData.phone || '',
            collegeName: placementData.collegeName || '',
            userId: placementData._id || placementData.id || ''
        };
    }, [placementData]);

    useEffect(() => {
        const autoResize = (element) => {
            if (!element) return;
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        };

        autoResize(subjectRef.current);
        autoResize(messageRef.current);
    }, [formData.subject, formData.message]);

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!placementProfile?.name) nextErrors.profile = 'Placement profile is still loading. Please try again.';
        if (!placementProfile?.email) nextErrors.profile = 'Your placement email is missing from the profile.';
        if (!placementProfile?.userId) nextErrors.profile = 'Your placement account could not be identified.';
        if (!formData.subject.trim()) nextErrors.subject = 'Subject is required';
        if (!formData.message.trim()) nextErrors.message = 'Message is required';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));

        if (errors[name]) {
            setErrors((previous) => ({ ...previous, [name]: '' }));
        }

        if (errors.profile) {
            setErrors((previous) => ({ ...previous, profile: '' }));
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);

        if (selectedFiles.length > MAX_FILES) {
            setErrors((previous) => ({ ...previous, files: `Maximum ${MAX_FILES} files allowed.` }));
            clearFileInput();
            return;
        }

        const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
        if (oversizedFiles.length > 0) {
            setErrors((previous) => ({
                ...previous,
                files: `Each attachment must be under 10MB. Oversized: ${oversizedFiles.map((file) => file.name).join(', ')}`
            }));
            clearFileInput();
            return;
        }

        const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_SIZE_BYTES) {
            setErrors((previous) => ({
                ...previous,
                files: 'Combined attachment size must stay under 30MB.'
            }));
            clearFileInput();
            return;
        }

        setFiles(selectedFiles);
        if (errors.files) {
            setErrors((previous) => ({ ...previous, files: '' }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('name', placementProfile.name);
            submitData.append('email', placementProfile.email);
            submitData.append('phone', placementProfile.phone);
            submitData.append('userType', 'placement');
            submitData.append('userId', placementProfile.userId);
            submitData.append('subject', formData.subject.trim());
            submitData.append('category', formData.category);
            submitData.append('priority', formData.priority);
            submitData.append('message', formData.message.trim());

            files.forEach((file) => {
                submitData.append('attachments', file);
            });

            const response = await api.submitSupportTicket(submitData);
            const isJson = (response.headers.get('content-type') || '').includes('application/json');
            const result = isJson ? await response.json() : null;

            if (!response.ok) {
                const message = result?.message || `Failed to submit support ticket (status ${response.status}).`;
                setErrors({ submit: message });
                showError(message);
                return;
            }

            setIsSubmitted(true);
            setFormData({
                subject: '',
                category: 'general',
                priority: 'medium',
                message: ''
            });
            setFiles([]);
            setErrors({});
            clearFileInput();
            showSuccess(result?.message || 'Support ticket submitted successfully.');
        } catch (error) {
            const message = error?.message || 'Failed to submit support ticket. Please try again.';
            setErrors({ submit: message });
            showError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!placementProfile) {
        return (
            <div className="placement-support-panel">
                <div className="placement-support-card placement-support-card--empty">
                    <div className="placement-support-empty__icon">
                        <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
                    </div>
                    <h3>Loading placement profile</h3>
                    <p>Support form will be ready once your placement details are available.</p>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="placement-support-panel">
                <div className="placement-support-card placement-support-card--success">
                    <div className="placement-support-success__icon">
                        <i className="fa fa-check-circle" aria-hidden="true"></i>
                    </div>
                    <h3>Support ticket submitted</h3>
                    <p>Admin will review your request. Responses will also appear in your placement notifications.</p>
                    <button
                        type="button"
                        className="placement-support-btn placement-support-btn--primary"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Submit another ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="placement-support-panel">
            <div className="placement-support-hero">
                <div>
                    <span className="placement-support-hero__eyebrow">Placement Support</span>
                    <h2>Raise a Support Ticket to the TaleGlobal Team</h2>
                    <p>Use this when you need help with uploads, account access, or placement workflow issues.</p>
                </div>
                <div className="placement-support-hero__note">
                    <i className="fa fa-bell-o" aria-hidden="true"></i>
                    <span>Admin replies will be sent back through your placement notifications.</span>
                </div>
            </div>

            <div className="placement-support-layout">
                <div className="placement-support-card placement-support-card--profile">
                    <h3>Profile snapshot</h3>
                    <div className="placement-support-profile-grid">
                        <div className="placement-support-field">
                            <span className="placement-support-field__label">Officer Name</span>
                            <span className="placement-support-field__value">{placementProfile.name || 'N/A'}</span>
                        </div>
                        <div className="placement-support-field">
                            <span className="placement-support-field__label">Email</span>
                            <span className="placement-support-field__value placement-support-field__value--break">{placementProfile.email || 'N/A'}</span>
                        </div>
                        <div className="placement-support-field">
                            <span className="placement-support-field__label">Phone</span>
                            <span className="placement-support-field__value">{placementProfile.phone || 'Not provided'}</span>
                        </div>
                        <div className="placement-support-field">
                            <span className="placement-support-field__label">College</span>
                            <span className="placement-support-field__value">{placementProfile.collegeName || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="placement-support-card placement-support-card--form">
                    <h3>Ticket details</h3>
                    <form onSubmit={handleSubmit} className="placement-support-form">
                        {errors.submit && <div className="placement-support-alert placement-support-alert--error">{errors.submit}</div>}
                        {errors.profile && <div className="placement-support-alert placement-support-alert--error">{errors.profile}</div>}

                        <div className="placement-support-form__row placement-support-form__row--double">
                            <div className="placement-support-form__group">
                                <label htmlFor="placement-support-category">Category</label>
                                <select
                                    id="placement-support-category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>{category.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="placement-support-form__group">
                                <label htmlFor="placement-support-priority">Priority</label>
                                <select
                                    id="placement-support-priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    {priorities.map((priority) => (
                                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="placement-support-form__group">
                            <label htmlFor="placement-support-subject">Subject</label>
                            <textarea
                                id="placement-support-subject"
                                ref={subjectRef}
                                name="subject"
                                rows={1}
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Briefly summarize the issue"
                                className={errors.subject ? 'is-invalid' : ''}
                            />
                            {errors.subject && <span className="placement-support-form__error">{errors.subject}</span>}
                        </div>

                        <div className="placement-support-form__group">
                            <label htmlFor="placement-support-message">Message</label>
                            <textarea
                                id="placement-support-message"
                                ref={messageRef}
                                name="message"
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe the problem, the file or workflow involved, and what you already tried."
                                className={errors.message ? 'is-invalid' : ''}
                            />
                            {errors.message && <span className="placement-support-form__error">{errors.message}</span>}
                        </div>

                        <div className="placement-support-form__group">
                            <label htmlFor="placement-support-files">Attachments</label>
                            <input
                                id="placement-support-files"
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                onChange={handleFileChange}
                                className={errors.files ? 'is-invalid' : ''}
                            />
                            <span className="placement-support-form__hint">
                                Up to 3 files. Maximum 10MB each and 30MB combined.
                            </span>
                            {errors.files && <span className="placement-support-form__error">{errors.files}</span>}
                            {files.length > 0 && (
                                <div className="placement-support-files">
                                    {files.map((file) => (
                                        <div key={`${file.name}-${file.size}`} className="placement-support-file">
                                            <span className="placement-support-file__name">{file.name}</span>
                                            <span className="placement-support-file__size">{formatFileSize(file.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="placement-support-form__actions">
                            <button
                                type="button"
                                className="placement-support-btn placement-support-btn--secondary"
                                onClick={() => {
                                    setFormData({
                                        subject: '',
                                        category: 'general',
                                        priority: 'medium',
                                        message: ''
                                    });
                                    setFiles([]);
                                    setErrors({});
                                    clearFileInput();
                                    showWarning('Draft cleared.');
                                }}
                                disabled={isSubmitting}
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                className="placement-support-btn placement-support-btn--primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit support ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PlacementSupportSection;
