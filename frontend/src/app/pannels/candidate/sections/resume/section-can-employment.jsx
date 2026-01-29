import React, { useEffect, useState, memo, Fragment } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import './employment-card-styles.css';

function SectionCanEmployment({ profile }) {
    const modalId = 'EmploymentModal';
    const descModalId = 'DescriptionModal';
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('employmentFormData');
        return saved ? JSON.parse(saved) : {
            designation: '',
            organization: '',
            isCurrent: false,
            startDate: '',
            endDate: '',
            description: '',
            presentCTC: '',
            expectedCTC: '',
            noticePeriod: ''
        };
    });
    const [totalExperience, setTotalExperience] = useState(() => {
        return localStorage.getItem('totalExperience') || '';
    });
    const [loading, setLoading] = useState(false);
    const [employment, setEmployment] = useState([]);
    const [errors, setErrors] = useState({});
    const [editingIndex, setEditingIndex] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);

    const calculateTotalExperienceFromEmployment = (employmentList = []) => {
        if (!Array.isArray(employmentList) || employmentList.length === 0) {
            return '0 months';
        }

        let totalMonths = 0;

        employmentList.forEach(emp => {
            if (!emp.startDate) return;

            const startDate = new Date(emp.startDate);
            let endDate;

            if (emp.isCurrent) {
                endDate = new Date();
            } else if (emp.endDate) {
                endDate = new Date(emp.endDate);
            } else {
                return;
            }

            if (startDate > endDate) {
                return;
            }

            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                           (endDate.getMonth() - startDate.getMonth());

            totalMonths += Math.max(0, months);
        });

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        if (years === 0 && months === 0) {
            return '0 months';
        } else if (years === 0) {
            return `${months} month${months > 1 ? 's' : ''}`;
        } else if (months === 0) {
            return `${years} year${years > 1 ? 's' : ''}`;
        } else {
            return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
        }
    };

    const calculateGap = (currentEmp, nextEmp) => {
        if (!currentEmp.startDate || !nextEmp.endDate) return null;

        const currentStart = new Date(currentEmp.startDate);
        const nextEnd = new Date(nextEmp.endDate);

        if (nextEnd >= currentStart) return null; // No gap or overlapping

        const totalMonths = (currentStart.getFullYear() - nextEnd.getFullYear()) * 12 +
                           (currentStart.getMonth() - nextEnd.getMonth());

        if (totalMonths <= 0) return null;

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        if (years === 0) {
            return `${months} month${months > 1 ? 's' : ''} gap`;
        } else if (months === 0) {
            return `${years} year${years > 1 ? 's' : ''} gap`;
        } else {
            return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''} gap`;
        }
    };

    const calculateExperience = (startDateStr, endDateStr, isCurrent) => {
        if (!startDateStr) return "";
        const start = new Date(startDateStr);
        const end = isCurrent ? new Date() : (endDateStr ? new Date(endDateStr) : new Date());
        
        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (months < 0) months = 0;
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        let result = "";
        if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            if (result) result += " ";
            result += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        return result || "0 months";
    };

    const clearForm = () => {
        const resetFormData = { designation: '', organization: '', isCurrent: false, startDate: '', endDate: '', description: '', presentCTC: '', expectedCTC: '', noticePeriod: '' };
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
            isCurrent: emp.isCurrent || false,
            startDate: formatDateForInput(emp.startDate),
            endDate: formatDateForInput(emp.endDate),
            description: emp.description || '',
            presentCTC: emp.presentCTC || '',
            expectedCTC: emp.expectedCTC || '',
            noticePeriod: emp.noticePeriod || ''
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
            
            // Auto calculate total experience from the sorted employment list
            const calculatedExp = calculateTotalExperienceFromEmployment(sortedEmployment);
            setTotalExperience(calculatedExp);
            localStorage.setItem('totalExperience', calculatedExp);
        }
    }, [profile]);

    useEffect(() => {
        // Update total experience whenever employment state OR form data changes (for live feedback)
        let tempEmployment = [...employment];
        if (formData.startDate) {
            const currentEntry = {
                startDate: formData.startDate,
                endDate: formData.isCurrent ? null : formData.endDate,
                isCurrent: formData.isCurrent
            };
            if (editingIndex !== null) {
                tempEmployment[editingIndex] = currentEntry;
            } else {
                tempEmployment.push(currentEntry);
            }
        }
        const calculatedExp = calculateTotalExperienceFromEmployment(tempEmployment);
        setTotalExperience(calculatedExp);
    }, [employment, formData.startDate, formData.endDate, formData.isCurrent, editingIndex]);

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

        if (!formData.designation || !formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
        } else if (formData.designation.trim().length < 2) {
            newErrors.designation = 'Designation must be at least 2 characters long';
        } else if (formData.designation.trim().length > 100) {
            newErrors.designation = 'Designation cannot exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-\.]+$/.test(formData.designation.trim())) {
            newErrors.designation = 'Designation can only contain letters, numbers, spaces, hyphens, and periods';
        }

        if (!formData.organization || !formData.organization.trim()) {
            newErrors.organization = 'Organization name is required';
        } else if (formData.organization.trim().length < 2) {
            newErrors.organization = 'Organization name must be at least 2 characters long';
        } else if (formData.organization.trim().length > 100) {
            newErrors.organization = 'Organization name cannot exceed 100 characters';
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
            // workType validation removed - field no longer required
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
            
            const calculatedExp = calculateTotalExperienceFromEmployment(sortedEmployment);
            const updateData = { 
                employment: sortedEmployment,
                totalExperience: calculatedExp
            };
            
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
                isCurrent: Boolean(formData.isCurrent),
                startDate: formData.startDate,
                endDate: formData.isCurrent ? null : (formData.endDate || null),
                description: formData.description ? formData.description.trim() : '',
                presentCTC: formData.presentCTC ? formData.presentCTC.trim() : '',
                expectedCTC: formData.expectedCTC ? formData.expectedCTC.trim() : '',
                noticePeriod: formData.noticePeriod ? formData.noticePeriod.trim() : ''
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

            const calculatedExp = calculateTotalExperienceFromEmployment(sortedEmployment);
            const updateData = { 
                employment: sortedEmployment,
                totalExperience: calculatedExp
            };
            
            const response = await api.updateCandidateProfile(updateData);
            
            if (response && (response.success || response.candidate)) {
                setEmployment(sortedEmployment);
                const resetFormData = { designation: '', organization: '', location: '', isCurrent: false, startDate: '', endDate: '', description: '', presentCTC: '', expectedCTC: '' };
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
                        <div className="m-b30">
                            <h4 className="section-head-small m-b20">1. Employment History / Experience</h4>
                            <div className="table-responsive">
                                <table className="table table-bordered twm-table-style-1">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Organization Name</th>
                                            <th>Designation</th>
                                            <th>Years of Experience</th>
                                            <th style={{ width: '120px' }} className="text-center">Job Description</th>
                                            <th style={{ width: '100px' }} className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employment.map((emp, index) => (
                                            <tr key={index}>
                                                <td>{emp.organization}</td>
                                                <td>{emp.designation}</td>
                                                <td>{calculateExperience(emp.startDate, emp.endDate, emp.isCurrent)}</td>
                                                <td className="text-center">
                                                    {emp.description ? (
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            title="View Description"
                                                            data-bs-toggle="modal"
                                                            data-bs-target={`#${descModalId}`}
                                                            onClick={() => setSelectedDescription(emp.description)}
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                    ) : '—'}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <button
                                                            onClick={() => {
                                                                handleEdit(index);
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
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-muted small">The Job Description column is left blank to be filled by the candidate.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-a30 site-bg-gray m-b30">
                            <p>No employment history found. Click the "+" button to add.</p>
                        </div>
                    )}

                    {/* Current Company Details */}
                    <div className="m-b30">
                        <h4 className="section-head-small m-b20">2. Current Company Details</h4>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Field</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const currentEmp = employment.find(emp => emp.isCurrent);
                                        return (
                                            <>
                                                <tr>
                                                    <td><strong>Current Company Name</strong></td>
                                                    <td>{currentEmp?.organization || '—'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Notice Period</strong></td>
                                                    <td>{currentEmp?.noticePeriod || '—'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Present CTC</strong></td>
                                                    <td>{currentEmp?.presentCTC ? `₹${currentEmp.presentCTC} LPA` : '—'}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Expected CTC</strong></td>
                                                    <td>{currentEmp?.expectedCTC ? `₹${currentEmp.expectedCTC} LPA` : '—'}</td>
                                                </tr>
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>
            </div>

            {createPortal(
                <Fragment>
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
                                        <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                            Total Experience
                                            <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                        </label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="fa fa-clock" style={formStyles.icon}></i>
                                            <input
                                                type="text"
                                                placeholder="Auto-calculated from employment"
                                                value={totalExperience}
                                                readOnly
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, backgroundColor: '#f8f9fa', cursor: 'not-allowed', ...(errors.totalExperience && formStyles.inputError)}}
                                                title="This value is automatically calculated based on your employment history"
                                            />
                                        </div>
                                        {errors.totalExperience && <div style={formStyles.error}>{errors.totalExperience}</div>}
                                    </div>

                                    {/* Designation */}
                                    <div style={formStyles.fieldGroup}>
                                        <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                            Your Designation
                                            <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                        </label>
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
                                        <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                            Your Organization
                                            <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                        </label>
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

                                    {/* Current Company */}
                                    <div style={formStyles.fieldGroup}>
                                        <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                            Is this your current company?
                                            <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                        </label>
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
                                            <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                                Started Working From
                                                <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                            </label>
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

                                    {/* CTC Fields */}
                                    <div style={formStyles.twoColumnGrid}>
                                        <div style={formStyles.fieldGroup}>
                                            <label style={formStyles.label}>Present CTC (LPA)</label>
                                            <div style={{...formStyles.inputWrapper, position: 'relative'}}>
                                                <i className="fa fa-rupee-sign" style={formStyles.icon}></i>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 5.5"
                                                    value={formData.presentCTC}
                                                    onChange={(e) => handleInputChange('presentCTC', e.target.value)}
                                                    style={{...formStyles.input, ...formStyles.inputWithIcon, paddingRight: '45px', ...(errors.presentCTC && formStyles.inputError)}}
                                                    min="0"
                                                    step="0.1"
                                                />
                                                <span style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '14px', pointerEvents: 'none'}}>LPA</span>
                                            </div>
                                            {errors.presentCTC && <div style={formStyles.error}>{errors.presentCTC}</div>}
                                        </div>
                                        <div style={formStyles.fieldGroup}>
                                            <label style={{...formStyles.label, ...{display: 'flex', alignItems: 'center'}}}>
                                                Expected CTC (LPA)
                                                <span style={{color: '#dc3545', marginLeft: '4px'}}>*</span>
                                            </label>
                                            <div style={{...formStyles.inputWrapper, position: 'relative'}}>
                                                <i className="fa fa-rupee-sign" style={formStyles.icon}></i>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 7.0"
                                                    value={formData.expectedCTC}
                                                    onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                                                    style={{...formStyles.input, ...formStyles.inputWithIcon, paddingRight: '45px', ...(errors.expectedCTC && formStyles.inputError)}}
                                                    min="0"
                                                    step="0.1"
                                                />
                                                <span style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '14px', pointerEvents: 'none'}}>LPA</span>
                                            </div>
                                            {errors.expectedCTC && <div style={formStyles.error}>{errors.expectedCTC}</div>}
                                        </div>
                                    </div>

                                    {/* Notice Period */}
                                    <div style={formStyles.fieldGroup}>
                                        <label style={formStyles.label}>Notice Period</label>
                                        <div style={formStyles.inputWrapper}>
                                            <i className="fa fa-clock" style={formStyles.icon}></i>
                                            <select
                                                value={formData.noticePeriod}
                                                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                                                style={{...formStyles.input, ...formStyles.inputWithIcon, ...(errors.noticePeriod && formStyles.inputError)}}
                                            >
                                                <option value="">Select Notice Period</option>
                                                <option value="Immediate">Immediate</option>
                                                <option value="15 days">15 days</option>
                                                <option value="1 month">1 month</option>
                                                <option value="2 months">2 months</option>
                                                <option value="3 months">3 months</option>
                                            </select>
                                        </div>
                                        {errors.noticePeriod && <div style={formStyles.error}>{errors.noticePeriod}</div>}
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
                    </div>

                    {/* Job Description Modal */}
                    <div className="modal fade twm-saved-jobs-view" id={descModalId} tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered" style={{maxWidth: '600px'}}>
                            <div className="modal-content">
                                <div style={formStyles.modalHeader}>
                                    <h2 style={formStyles.modalTitle}>Job Description</h2>
                                    <button type="button" style={formStyles.closeButton} data-bs-dismiss="modal" aria-label="Close">×</button>
                                </div>
                                <div style={{padding: '20px', maxHeight: '400px', overflowY: 'auto'}}>
                                    <p style={{whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: '#333', margin: 0}}>
                                        {selectedDescription || 'No description provided.'}
                                    </p>
                                </div>
                                <div style={formStyles.buttonGroup}>
                                    <button
                                        type="button"
                                        data-bs-dismiss="modal"
                                        style={{...formStyles.button, background: '#007bff', color: 'white'}}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fragment>,
                document.body
            )}
        </>
    );
}

export default memo(SectionCanEmployment);
