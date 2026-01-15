import { useEffect, useState, memo } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import './employment-card-styles.css';

function SectionCanEmployment({ profile }) {
    const modalId = 'EmploymentModal';
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('employmentFormData');
        return saved ? JSON.parse(saved) : {
            designation: '',
            organization: '',
            location: '',
            isCurrent: false,
            startDate: '',
            endDate: '',
            description: '',
            workType: '',
            presentCTC: '',
            expectedCTC: ''
        };
    });
    const [totalExperience, setTotalExperience] = useState(() => {
        return localStorage.getItem('totalExperience') || '';
    });
    const [loading, setLoading] = useState(false);
    const [employment, setEmployment] = useState([]);
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);

    const clearForm = () => {
        const resetFormData = { designation: '', organization: '', location: '', isCurrent: false, startDate: '', endDate: '', description: '', workType: '', presentCTC: '', expectedCTC: '' };
        setFormData(resetFormData);
        localStorage.removeItem('employmentFormData');
        setErrors({});
        setEditingIndex(null);
    };

    const handleEdit = (index) => {
        const emp = employment[index];
        // Format dates for input fields (YYYY-MM-DD)
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };
        
        setFormData({
            designation: emp.designation || '',
            organization: emp.organization || '',
            location: emp.location || '',
            isCurrent: emp.isCurrent || false,
            startDate: formatDateForInput(emp.startDate),
            endDate: formatDateForInput(emp.endDate),
            description: emp.description || '',
            workType: emp.workType || '',
            presentCTC: emp.presentCTC || '',
            expectedCTC: emp.expectedCTC || ''
        });
        setEditingIndex(index);
        setErrors({});
    };

    useEffect(() => {
        if (profile?.employment) {
            // Sort employment by start date (most recent first)
            const sortedEmployment = [...profile.employment].sort((a, b) => {
                const dateA = new Date(a.startDate || '1900-01-01');
                const dateB = new Date(b.startDate || '1900-01-01');
                return dateB - dateA;
            });
            setEmployment(sortedEmployment);
        }
        if (profile?.totalExperience) {
            setTotalExperience(profile.totalExperience);
            localStorage.setItem('totalExperience', profile.totalExperience);
        }
    }, [profile]);

    useEffect(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const handleModalHide = () => {
                console.log('Modal closed - form data preserved in localStorage');
            };
            modal.addEventListener('hidden.bs.modal', handleModalHide);
            return () => modal.removeEventListener('hidden.bs.modal', handleModalHide);
        }
    }, [modalId]);

    const handleInputChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        localStorage.setItem('employmentFormData', JSON.stringify(newFormData));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!totalExperience || !totalExperience.trim()) {
            newErrors.totalExperience = 'Total Experience is required';
        } else if (totalExperience.trim().length < 2) {
            newErrors.totalExperience = 'Total Experience must be at least 2 characters long';
        } else if (totalExperience.trim().length > 50) {
            newErrors.totalExperience = 'Total Experience cannot exceed 50 characters';
        }

        if (!formData.designation || !formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        } else if (formData.designation.trim().length < 2) {
            newErrors.designation = 'Designation must be at least 2 characters long';
        } else if (formData.designation.trim().length > 100) {
            newErrors.designation = 'Designation cannot exceed 100 characters';
        } else if (!/^[a-zA-Z\s\-\.]+$/.test(formData.designation.trim())) {
            newErrors.designation = 'Designation can only contain letters, spaces, hyphens, and periods';
        }

        if (!formData.organization || !formData.organization.trim()) {
            newErrors.organization = 'Organization name is required';
        } else if (formData.organization.trim().length < 2) {
            newErrors.organization = 'Organization name must be at least 2 characters long';
        } else if (formData.organization.trim().length > 100) {
            newErrors.organization = 'Organization name cannot exceed 100 characters';
        }

        if (!formData.location || !formData.location.trim()) {
            newErrors.location = 'Location is required';
        } else if (formData.location.trim().length < 2) {
            newErrors.location = 'Location must be at least 2 characters long';
        } else if (formData.location.trim().length > 100) {
            newErrors.location = 'Location cannot exceed 100 characters';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        } else {
            const startDate = new Date(formData.startDate);
            const today = new Date();
            const minDate = new Date('1950-01-01');

            if (startDate > today) {
                newErrors.startDate = 'Start date cannot be in the future';
            } else if (startDate < minDate) {
                newErrors.startDate = 'Start date seems too old. Please check the year.';
            }
        }

        if (!formData.isCurrent && !formData.endDate) {
            newErrors.endDate = 'End date is required for past employment';
        } else if (!formData.isCurrent && formData.endDate) {
            const endDate = new Date(formData.endDate);
            const startDate = new Date(formData.startDate);
            const today = new Date();

            if (endDate > today) {
                newErrors.endDate = 'End date cannot be in the future';
            } else if (startDate && endDate < startDate) {
                newErrors.endDate = 'End date cannot be before start date';
            }
        }

        if (formData.description && formData.description.trim()) {
            if (formData.description.trim().length < 10) {
                newErrors.description = 'Job description should be at least 10 characters long';
            } else if (formData.description.trim().length > 1000) {
                newErrors.description = 'Job description cannot exceed 1000 characters';
            }
        }

        if (!formData.workType) {
            newErrors.workType = 'Work type is required';
        }

        if (formData.presentCTC && formData.presentCTC.trim()) {
            const ctcValue = parseFloat(formData.presentCTC.trim());
            if (isNaN(ctcValue) || ctcValue < 0) {
                newErrors.presentCTC = 'Present CTC must be a valid positive number';
            } else if (ctcValue > 10000) {
                newErrors.presentCTC = 'Present CTC seems too high. Please check the value.';
            }
        }

        if (!formData.expectedCTC || !formData.expectedCTC.trim()) {
            newErrors.expectedCTC = 'Expected CTC is required';
        } else {
            const ctcValue = parseFloat(formData.expectedCTC.trim());
            if (isNaN(ctcValue) || ctcValue < 0) {
                newErrors.expectedCTC = 'Expected CTC must be a valid positive number';
            } else if (ctcValue > 10000) {
                newErrors.expectedCTC = 'Expected CTC seems too high. Please check the value.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDelete = async (indexToDelete) => {
        try {
            const updatedEmployment = employment.filter((_, index) => index !== indexToDelete);
            // Sort employment by start date (most recent first)
            const sortedEmployment = [...updatedEmployment].sort((a, b) => {
                const dateA = new Date(a.startDate || '1900-01-01');
                const dateB = new Date(b.startDate || '1900-01-01');
                return dateB - dateA;
            });
            const updateData = { employment: sortedEmployment };
            
            const response = await api.updateCandidateProfile(updateData);
            
            if (response && (response.success || response.candidate)) {
                setEmployment(sortedEmployment);
                showSuccess('Employment deleted successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                const errorMsg = response?.message || response?.error || 'Unknown error occurred';
                showError(`Failed to delete employment: ${errorMsg}`);
            }
        } catch (error) {
            showError(`Failed to delete employment: ${error.message || 'Please check your connection and try again.'}`);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            const errorMessages = Object.values(errors).filter(error => error);
            if (errorMessages.length > 0) {
                showPopup(errorMessages.join(', '), 'error', 4000);
            }
            return;
        }

        setLoading(true);
        try {
            try {
                const testResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/candidate/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('candidateToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!testResponse.ok) {
                    const errorText = await testResponse.text();
                    throw new Error(`API test failed: ${testResponse.status} - ${errorText}`);
                }
            } catch (testError) {
                console.error('API connectivity test failed:', testError);
                showError(`API connection failed: ${testError.message}. Please check if the backend server is running.`);
                setLoading(false);
                return;
            }
            
            // Re-validate before saving
            if (!validateForm()) {
                setLoading(false);
                return;
            }
            
            const employmentEntry = {
                designation: formData.designation.trim(),
                organization: formData.organization.trim(),
                location: formData.location.trim(),
                isCurrent: Boolean(formData.isCurrent),
                startDate: formData.startDate,
                endDate: formData.isCurrent ? null : (formData.endDate || null),
                description: formData.description ? formData.description.trim() : '',
                workType: formData.workType,
                presentCTC: formData.presentCTC ? formData.presentCTC.trim() : '',
                expectedCTC: formData.expectedCTC ? formData.expectedCTC.trim() : ''
            };
            
            let newEmployment;
            if (editingIndex !== null) {
                // Update existing employment
                newEmployment = [...employment];
                newEmployment[editingIndex] = employmentEntry;
            } else {
                // Add new employment at the beginning (most recent first)
                newEmployment = [employmentEntry, ...employment];
            }
            // Sort employment by start date (most recent first) before saving
            const sortedEmployment = [...newEmployment].sort((a, b) => {
                const dateA = new Date(a.startDate || '1900-01-01');
                const dateB = new Date(b.startDate || '1900-01-01');
                return dateB - dateA;
            });
            const updateData = { employment: sortedEmployment };
            
            if (totalExperience && totalExperience.trim()) {
                updateData.totalExperience = totalExperience.trim();
            }
            
            const response = await api.updateCandidateProfile(updateData);
            
            if (response && (response.success || response.candidate)) {
                setEmployment(sortedEmployment);
                const resetFormData = { designation: '', organization: '', location: '', isCurrent: false, startDate: '', endDate: '', description: '', workType: '', presentCTC: '', expectedCTC: '' };
                setFormData(resetFormData);
                localStorage.removeItem('employmentFormData');
                setErrors({});
                setEditingIndex(null);
                setTotalExperience(totalExperience || '');
                showSuccess(editingIndex !== null ? 'Employment updated successfully!' : 'Employment added successfully!');
                
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                
                setTimeout(() => {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        if (window.bootstrap?.Modal) {
                            const modalInstance = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
                            modalInstance.hide();
                        } else if (window.$ && window.$.fn.modal) {
                            window.$(`#${modalId}`).modal('hide');
                        } else {
                            modal.style.display = 'none';
                            modal.classList.remove('show');
                            document.body.classList.remove('modal-open');
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                        }
                    }
                }, 100);
            } else {
                const errorMsg = response?.message || response?.error || 'Unknown error occurred';
                showError(`Failed to save employment: ${errorMsg}`);
            }
        } catch (error) {
            showError(`Failed to save employment: ${error.message || 'Please check your connection and try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    const formStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px'
        },
        fieldGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
        },
        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '4px'
        },
        input: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
        },
        inputError: {
            borderColor: '#dc3545'
        },
        error: {
            fontSize: '12px',
            color: '#dc3545',
            marginTop: '4px'
        },
        radioGroup: {
            display: 'flex',
            gap: '24px',
            marginTop: '8px',
            alignItems: 'center',
            flexWrap: 'nowrap'
        },
        radioOption: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        },
        radioInput: {
            cursor: 'pointer',
            margin: 0,
            width: '18px',
            height: '18px'
        },
        radioLabel: {
            margin: 0,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '400'
        },
        twoColumnGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
        },
        textarea: {
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            minHeight: '100px',
            resize: 'vertical'
        },
        textareaError: {
            borderColor: '#dc3545'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid #e0e0e0',
            flexWrap: 'wrap'
        },
        button: {
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            minWidth: '100px',
            whiteSpace: 'nowrap'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e0e0e0',
            gap: '12px'
        },
        modalTitle: {
            fontSize: '18px',
            fontWeight: '600',
            margin: 0,
            flex: 1
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px 8px',
            color: '#666'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        icon: {
            position: 'absolute',
            left: '12px',
            color: '#666',
            fontSize: '14px',
            pointerEvents: 'none'
        },
        inputWithIcon: {
            paddingLeft: '36px'
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">Employment History</h4>
                <button
                    type="button"
                    title="Add Employment"
                    className="btn btn-link site-text-primary p-0 border-0"
                    data-bs-toggle="modal"
                    data-bs-target={`#${modalId}`}
                    style={{background: 'none'}}
                    onClick={() => {
                        clearForm();
                        setTotalExperience('');
                        localStorage.removeItem('totalExperience');
                    }}
                >
                    <span className="fa fa-plus" />
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="twm-panel-inner">
                    <div style={{background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid #e9ecef', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <i className="fa fa-hourglass-half" style={{color: '#FF6A00', fontSize: '16px'}}></i>
                        <p style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#2c3e50'}}>
                            Total Experience: <span style={{color: '#FF6A00'}}>{totalExperience || '0 months'}</span>
                        </p>
                    </div>
                    {employment.length > 0 ? (
                        employment.map((emp, index) => (
                            <div key={index} className="employment-card" style={{
                                background: '#fff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                marginBottom: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                transition: 'box-shadow 0.2s ease',
                                position: 'relative'
                            }}>
                                {/* Action Buttons */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={() => {
                                            handleEdit(index);
                                            // Open modal
                                            const modal = document.getElementById(modalId);
                                            if (modal) {
                                                if (window.bootstrap?.Modal) {
                                                    const modalInstance = new window.bootstrap.Modal(modal);
                                                    modalInstance.show();
                                                } else if (window.$ && window.$.fn.modal) {
                                                    window.$(`#${modalId}`).modal('show');
                                                }
                                            }
                                        }}
                                        style={{
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        title="Edit Employment"
                                    >
                                        <i className="fa fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                         title="Delete Employment"
                                    >
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </div>

                                {/* Header Section */}
                                <div style={{borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px', paddingRight: '80px'}}>
                                    <h4 style={{color: '#2c3e50', marginBottom: '4px', fontWeight: '600', fontSize: '18px', margin: 0}}>
                                        <i className="fa fa-briefcase" style={{color: '#FF6A00', marginRight: '8px'}}></i>
                                        {emp.designation}
                                    </h4>
                                    <p style={{color: '#34495e', marginBottom: '0', fontSize: '16px', fontWeight: '500'}}>
                                        <i className="fa fa-building" style={{color: '#FF6A00', marginRight: '8px'}}></i>
                                        {emp.organization}
                                    </p>
                                </div>

                                {/* All Details in One Section */}
                                <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef'}}>
                                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start'}}>
                                        {/* Duration */}
                                        <div style={{minWidth: '200px'}}>
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                <i className="fa fa-calendar" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                <strong style={{fontSize: '13px', color: '#495057'}}>Duration</strong>
                                            </div>
                                            <p style={{margin: 0, fontSize: '14px', color: '#6c757d'}}>
                                                {emp.startDate ? new Date(emp.startDate).toLocaleDateString('en-GB') : 'Start Date'} - {emp.isCurrent ? 'Present' : (emp.endDate ? new Date(emp.endDate).toLocaleDateString('en-GB') : 'End Date')}
                                            </p>
                                        </div>

                                        {/* Location */}
                                        {emp.location && (
                                            <div style={{minWidth: '150px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                    <i className="fa fa-map-marker" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                    <strong style={{fontSize: '13px', color: '#495057'}}>Location</strong>
                                                </div>
                                                <p style={{margin: 0, fontSize: '14px', color: '#6c757d'}}>
                                                    {emp.location}
                                                </p>
                                            </div>
                                        )}

                                        {/* Current Company */}
                                        <div style={{minWidth: '120px'}}>
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                <i className="fa fa-check-circle" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                <strong style={{fontSize: '13px', color: '#495057'}}>Current Company</strong>
                                            </div>
                                            <p style={{margin: 0, fontSize: '14px', color: emp.isCurrent ? '#28a745' : '#6c757d', fontWeight: '500'}}>
                                                {emp.isCurrent ? 'Yes' : 'No'}
                                            </p>
                                        </div>

                                        {/* Work Type */}
                                        {emp.workType && (
                                            <div style={{minWidth: '100px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                    <i className="fa fa-laptop" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                    <strong style={{fontSize: '13px', color: '#495057'}}>Work Type</strong>
                                                </div>
                                                <p style={{margin: 0, fontSize: '14px', color: '#6c757d'}}>
                                                    {emp.workType}
                                                </p>
                                            </div>
                                        )}

                                        {/* Present CTC */}
                                        {emp.presentCTC && (
                                            <div style={{minWidth: '120px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                    <i className="fa fa-rupee-sign" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                    <strong style={{fontSize: '13px', color: '#495057'}}>Present CTC (LPA)</strong>
                                                </div>
                                                <p style={{margin: 0, fontSize: '14px', color: '#6c757d', fontWeight: '500'}}>
                                                    ₹{emp.presentCTC}
                                                </p>
                                            </div>
                                        )}

                                        {/* Expected CTC */}
                                        {emp.expectedCTC && (
                                            <div style={{minWidth: '120px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                                                    <i className="fa fa-chart-line" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                    <strong style={{fontSize: '13px', color: '#495057'}}>Expected CTC (LPA)</strong>
                                                </div>
                                                <p style={{margin: 0, fontSize: '14px', color: '#6c757d', fontWeight: '500'}}>
                                                    ₹{emp.expectedCTC}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Job Description */}
                                    {emp.description && (
                                        <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dee2e6'}}>
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                                <i className="fa fa-file-text" style={{color: '#FF6A00', marginRight: '6px', fontSize: '14px'}}></i>
                                                <strong style={{fontSize: '14px', color: '#495057'}}>Job Profile Description</strong>
                                            </div>
                                            <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#555'}}>
                                                {emp.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>

            {createPortal(
                <div className="modal fade twm-saved-jobs-view" id={modalId} tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered" style={{maxWidth: '500px'}}>
                        <div className="modal-content">
                            <div style={formStyles.modalHeader}>
                                <h2 style={formStyles.modalTitle}>{editingIndex !== null ? 'Edit Employment Details' : 'Add Employment Details'}</h2>
                                <button type="button" style={formStyles.closeButton} data-bs-dismiss="modal" aria-label="Close">×</button>
                            </div>

                            <div style={{...formStyles.container, paddingBottom: '80px'}}>
                                {/* Total Experience */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Total Experience</label>
                                    <div style={formStyles.inputWrapper}>
                                        <i className="fa fa-clock" style={formStyles.icon}></i>
                                        <input
                                            type="text"
                                            placeholder="e.g., 2 years, 6 months"
                                            value={totalExperience}
                                            onChange={(e) => {
                                                setTotalExperience(e.target.value);
                                                localStorage.setItem('totalExperience', e.target.value);
                                                if (errors.totalExperience) setErrors(prev => ({...prev, totalExperience: null}));
                                            }}
                                            style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.totalExperience && formStyles.inputError)}}
                                        />
                                    </div>
                                    {errors.totalExperience && <div style={formStyles.error}>{errors.totalExperience}</div>}
                                </div>

                                {/* Designation */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Your Designation</label>
                                    <div style={formStyles.inputWrapper}>
                                        <i className="fa fa-address-card" style={formStyles.icon}></i>
                                        <input
                                            type="text"
                                            placeholder="Enter Your Designation"
                                            value={formData.designation}
                                            onChange={(e) => handleInputChange('designation', e.target.value)}
                                            style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.designation && formStyles.inputError)}}
                                        />
                                    </div>
                                    {errors.designation && <div style={formStyles.error}>{errors.designation}</div>}
                                </div>

                                {/* Organization */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Your Organization</label>
                                    <div style={formStyles.inputWrapper}>
                                        <i className="fa fa-building" style={formStyles.icon}></i>
                                        <input
                                            type="text"
                                            placeholder="Enter Your Organization"
                                            value={formData.organization}
                                            onChange={(e) => handleInputChange('organization', e.target.value)}
                                            style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.organization && formStyles.inputError)}}
                                        />
                                    </div>
                                    {errors.organization && <div style={formStyles.error}>{errors.organization}</div>}
                                </div>

                                {/* Location */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Work Location</label>
                                    <div style={formStyles.inputWrapper}>
                                        <i className="fa fa-map-marker" style={formStyles.icon}></i>
                                        <input
                                            type="text"
                                            placeholder="e.g., Mumbai, Bangalore"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.location && formStyles.inputError)}}
                                        />
                                    </div>
                                    {errors.location && <div style={formStyles.error}>{errors.location}</div>}
                                </div>

                                {/* Current Company */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Is this your current company?</label>
                                    <div style={formStyles.radioGroup}>
                                        <div style={formStyles.radioOption}>
                                            <input
                                                type="radio"
                                                id="current_yes"
                                                name="isCurrent"
                                                checked={formData.isCurrent}
                                                onChange={() => handleInputChange('isCurrent', true)}
                                                style={formStyles.radioInput}
                                            />
                                            <label htmlFor="current_yes" style={formStyles.radioLabel}>Yes</label>
                                        </div>
                                        <div style={formStyles.radioOption}>
                                            <input
                                                type="radio"
                                                id="current_no"
                                                name="isCurrent"
                                                checked={!formData.isCurrent}
                                                onChange={() => handleInputChange('isCurrent', false)}
                                                style={formStyles.radioInput}
                                            />
                                            <label htmlFor="current_no" style={formStyles.radioLabel}>No</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Fields */}
                                <div style={formStyles.twoColumnGrid}>
                                    <div style={formStyles.fieldGroup}>
                                        <label style={formStyles.label}>Started Working From</label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="far fa-calendar" style={formStyles.icon}></i>
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.startDate && formStyles.inputError)}}
                                            />
                                        </div>
                                        {errors.startDate && <div style={formStyles.error}>{errors.startDate}</div>}
                                    </div>
                                    <div style={formStyles.fieldGroup}>
                                        <label style={formStyles.label}>Worked Till</label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="far fa-calendar" style={formStyles.icon}></i>
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                                disabled={formData.isCurrent}
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.endDate && formStyles.inputError)}}
                                            />
                                        </div>
                                        {errors.endDate && <div style={formStyles.error}>{errors.endDate}</div>}
                                    </div>
                                </div>

                                {/* Work Type */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Work Type</label>
                                    <div style={formStyles.inputWrapper}>
                                        <i className="fa fa-laptop" style={formStyles.icon}></i>
                                        <select
                                            value={formData.workType}
                                            onChange={(e) => handleInputChange('workType', e.target.value)}
                                            style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.workType && formStyles.inputError)}}
                                        >
                                            <option value="">Select Work Type</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Onsite">Onsite</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    {errors.workType && <div style={formStyles.error}>{errors.workType}</div>}
                                </div>

                                {/* CTC Fields */}
                                <div style={formStyles.twoColumnGrid}>
                                    <div style={formStyles.fieldGroup}>
                                        <label style={formStyles.label}>Present CTC (LPA)</label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="fa fa-rupee-sign" style={formStyles.icon}></i>
                                            <input
                                                type="number"
                                                placeholder="e.g., 5.5"
                                                value={formData.presentCTC}
                                                onChange={(e) => handleInputChange('presentCTC', e.target.value)}
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.presentCTC && formStyles.inputError)}}
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                        {errors.presentCTC && <div style={formStyles.error}>{errors.presentCTC}</div>}
                                    </div>
                                    <div style={formStyles.fieldGroup}>
                                        <label style={formStyles.label}>Expected CTC (LPA)</label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="fa fa-rupee-sign" style={formStyles.icon}></i>
                                            <input
                                                type="number"
                                                placeholder="e.g., 7.0"
                                                value={formData.expectedCTC}
                                                onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.expectedCTC && formStyles.inputError)}}
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                        {errors.expectedCTC && <div style={formStyles.error}>{errors.expectedCTC}</div>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={formStyles.fieldGroup}>
                                    <label style={formStyles.label}>Describe your Job Profile</label>
                                    <textarea
                                        placeholder="Describe your Job"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        style={{...formStyles.textarea, ...(errors.description && formStyles.textareaError)}}
                                    />
                                    {errors.description && <div style={formStyles.error}>{errors.description}</div>}
                                    <small style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>Optional: {formData.description.length}/1000 characters</small>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={formStyles.buttonGroup}>
                                <button
                                    type="button"
                                    data-bs-dismiss="modal"
                                    style={{...formStyles.button, background: '#e0e0e0', color: '#333'}}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={clearForm}
                                    style={{...formStyles.button, background: '#f5f5f5', color: '#333', border: '1px solid #ddd'}}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={{...formStyles.button, background: '#007bff', color: 'white', opacity: loading ? 0.6 : 1}}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default memo(SectionCanEmployment);
