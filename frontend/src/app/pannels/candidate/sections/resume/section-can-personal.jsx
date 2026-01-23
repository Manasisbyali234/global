import React, { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanPersonalDetail({ profile }) {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        mobileNumber: '',
        emailAddress: '',
        dateOfBirth: '',
        gender: '',
        location: '',
        stateCode: '',
        pincode: '',
        fatherName: '',
        motherName: '',
        residentialAddress: '',
        permanentAddress: '',
        correspondenceAddress: ''
    });
    
    const indianStateCodes = [
        { code: 'AP', name: 'Andhra Pradesh' },
        { code: 'AR', name: 'Arunachal Pradesh' },
        { code: 'AS', name: 'Assam' },
        { code: 'BR', name: 'Bihar' },
        { code: 'CG', name: 'Chhattisgarh' },
        { code: 'GA', name: 'Goa' },
        { code: 'GJ', name: 'Gujarat' },
        { code: 'HR', name: 'Haryana' },
        { code: 'HP', name: 'Himachal Pradesh' },
        { code: 'JH', name: 'Jharkhand' },
        { code: 'KA', name: 'Karnataka' },
        { code: 'KL', name: 'Kerala' },
        { code: 'MP', name: 'Madhya Pradesh' },
        { code: 'MH', name: 'Maharashtra' },
        { code: 'MN', name: 'Manipur' },
        { code: 'ML', name: 'Meghalaya' },
        { code: 'MZ', name: 'Mizoram' },
        { code: 'NL', name: 'Nagaland' },
        { code: 'OD', name: 'Odisha' },
        { code: 'PB', name: 'Punjab' },
        { code: 'RJ', name: 'Rajasthan' },
        { code: 'SK', name: 'Sikkim' },
        { code: 'TN', name: 'Tamil Nadu' },
        { code: 'TS', name: 'Telangana' },
        { code: 'TR', name: 'Tripura' },
        { code: 'UP', name: 'Uttar Pradesh' },
        { code: 'UK', name: 'Uttarakhand' },
        { code: 'WB', name: 'West Bengal' },
        { code: 'AN', name: 'Andaman and Nicobar Islands' },
        { code: 'CH', name: 'Chandigarh' },
        { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu' },
        { code: 'DL', name: 'Delhi' },
        { code: 'JK', name: 'Jammu and Kashmir' },
        { code: 'LA', name: 'Ladakh' },
        { code: 'LD', name: 'Lakshadweep' },
        { code: 'PY', name: 'Puducherry' }
    ];
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [sameAsResidential, setSameAsResidential] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (profile) {
            // Fetch profile data to get pincode, stateCode, and location
            fetchProfileData();
            setFormData({
                firstName: profile.firstName || profile.candidateId?.name || '',
                middleName: profile.middleName || '',
                lastName: profile.lastName || '',
                mobileNumber: profile.mobileNumber || (profile.candidateId?.phone ? profile.candidateId.phone.replace(/^\+91/, '') : ''),
                emailAddress: profile.candidateId?.email || profile.emailAddress || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                location: profile.location || '',
                stateCode: profile.stateCode || '',
                pincode: profile.pincode || '',
                fatherName: profile.fatherName || '',
                motherName: profile.motherName || '',
                residentialAddress: profile.residentialAddress || '',
                permanentAddress: profile.permanentAddress || '',
                correspondenceAddress: profile.correspondenceAddress || ''
            });
        }
    }, [profile]);

    const fetchProfileData = async () => {
        try {
            const response = await api.getCandidateProfile();
            if (response.success && response.profile) {
                setProfileData(response.profile);
                // Update form data with profile data
                setFormData(prev => ({
                    ...prev,
                    location: response.profile.location || prev.location,
                    stateCode: response.profile.stateCode || prev.stateCode,
                    pincode: response.profile.pincode || prev.pincode
                }));
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    const validateField = (field, value) => {
        const newErrors = { ...errors };
        
        switch (field) {
            case 'location':
                // Location is fetched from profile, no validation needed
                delete newErrors[field];
                break;
            case 'pincode':
                // Pincode is fetched from profile, no validation needed
                delete newErrors[field];
                break;
            case 'gender':
                if (!value || !value.trim()) {
                    newErrors[field] = 'Gender is required';
                } else {
                    delete newErrors[field];
                }
                break;
            
            case 'dateOfBirth':
                if (!value || !value.trim()) {
                    newErrors.dateOfBirth = 'Date of birth is required';
                } else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    
                    // Check if date is valid
                    if (isNaN(birthDate.getTime())) {
                        newErrors.dateOfBirth = 'Please enter a valid date';
                    }
                    // Check if date is not in the future
                    else if (birthDate > today) {
                        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
                    }
                    // Check minimum age (16 years)
                    else if (birthDate > new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())) {
                        newErrors.dateOfBirth = 'You must be at least 16 years old';
                    }
                    // Check maximum age (100 years)
                    else if (birthDate < new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())) {
                        newErrors.dateOfBirth = 'Please enter a valid date of birth';
                    }
                    else {
                        delete newErrors.dateOfBirth;
                    }
                }
                break;
            
            case 'fatherName':
                if (!value || !value.trim()) {
                    newErrors[field] = "Father's/Husband's Name is required";
                } else if (value.length < 2 || value.length > 50) {
                    newErrors[field] = 'Name must be between 2 and 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors[field] = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'motherName':
                if (!value || !value.trim()) {
                    newErrors[field] = "Mother's Name is required";
                } else if (value.length < 2 || value.length > 50) {
                    newErrors[field] = 'Name must be between 2 and 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors[field] = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors[field];
                }
                break;
            
            case 'residentialAddress':
                if (!value || !value.trim()) {
                    newErrors[field] = 'Residential Address is required';
                } else if (value.length > 200) {
                    newErrors[field] = 'Address cannot exceed 200 characters';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'permanentAddress':
                if (!value || !value.trim()) {
                    newErrors[field] = 'Permanent Address is required';
                } else if (value.length > 200) {
                    newErrors[field] = 'Address cannot exceed 200 characters';
                } else {
                    delete newErrors[field];
                }
                break;
            case 'correspondenceAddress':
                if (!value || !value.trim()) {
                    newErrors[field] = 'Correspondence Address is required';
                } else if (value.length > 200) {
                    newErrors[field] = 'Address cannot exceed 200 characters';
                } else {
                    delete newErrors[field];
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAllRequiredFields = () => {
        const requiredFields = ['dateOfBirth', 'gender', 'fatherName', 'motherName', 'residentialAddress', 'permanentAddress'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field, formData[field])) {
                isValid = false;
            }
        });
        
        return isValid;
    };



    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
        
        // If residential address changes and checkbox is checked, update permanent address
        if (field === 'residentialAddress' && sameAsResidential) {
            setFormData(prev => ({ ...prev, permanentAddress: value }));
        }
    };

    const handleSameAsResidentialChange = (checked) => {
        setSameAsResidential(checked);
        setHasUnsavedChanges(true);
        if (checked) {
            setFormData(prev => ({ ...prev, permanentAddress: prev.residentialAddress }));
        } else {
            setFormData(prev => ({ ...prev, permanentAddress: '' }));
        }
    };



    const handleSubmit = async () => {
        if (!validateAllRequiredFields()) {
            const errorMessages = Object.values(errors).join(', ');
            showError(errorMessages || 'Please fill all required fields correctly');
            return;
        }
        
        setLoading(true);
        try {
            const updateData = {
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                fatherName: formData.fatherName.trim(),
                motherName: formData.motherName.trim(),
                residentialAddress: formData.residentialAddress.trim(),
                permanentAddress: formData.permanentAddress.trim(),
                correspondenceAddress: formData.correspondenceAddress.trim()
            };
            
            const response = await api.updateCandidateProfile(updateData);
            if (response.success) {
                showSuccess('Personal details updated successfully!');
                setHasUnsavedChanges(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showError('Failed to update personal details. Please try again.');
            }
        } catch (error) {
            showError('Failed to update personal details: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">
                    Personal Details
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="alert alert-info mb-3" style={{padding: '8px 12px', fontSize: '13px', backgroundColor: '#e3f2fd', borderColor: '#2196f3', color: '#1976d2'}}>
                            <i className="fa fa-info-circle me-1"></i>
                            Pincode, State Code, and Location are fetched from your <a href="/candidate/profile" style={{color: '#1976d2'}}>Profile page</a>.
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-user me-1"></i> First Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="First name fetched from profile"
                                    value={formData.firstName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-user me-1"></i> Middle Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Middle name fetched from profile"
                                    value={formData.middleName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-user me-1"></i> Last Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Last name fetched from profile"
                                    value={formData.lastName}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Name is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <style>{`
                                    @media (max-width: 576px) {
                                        .mobile-input-wrapper input {
                                            font-size: 13px !important;
                                            padding-left: 60px !important;
                                        }
                                        .mobile-country-code {
                                            width: 50px !important;
                                            padding-left: 8px !important;
                                            padding-right: 8px !important;
                                            font-size: 13px !important;
                                        }
                                    }
                                `}</style>
                                <label><i className="fa fa-phone me-1"></i> Mobile Number</label>
                                <div style={{position: 'relative'}} className="mobile-input-wrapper">
                                    <div className="mobile-country-code" style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '0',
                                        bottom: '0',
                                        zIndex: 10,
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #ced4da',
                                        borderRight: 'none',
                                        borderRadius: '4px 0 0 4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: '12px',
                                        paddingRight: '12px',
                                        fontSize: '14px',
                                        color: '#495057',
                                        width: '60px'
                                    }}>
                                        +91
                                    </div>
                                    <input
                                        className="form-control"
                                        type="tel"
                                        placeholder="Mobile number"
                                        value={formData.mobileNumber}
                                        readOnly
                                        style={{ 
                                            paddingLeft: '72px', 
                                            borderRadius: '0 4px 4px 0', 
                                            borderLeft: 'none',
                                            backgroundColor: '#f8f9fa', 
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                </div>
                                <small className="text-muted">Mobile number is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-envelope me-1"></i> Email Address</label>
                                <input
                                    className="form-control"
                                    type="email"
                                    placeholder="Email fetched from profile"
                                    value={formData.emailAddress}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Email is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-map-pin me-1"></i> Pincode</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Pincode fetched from profile"
                                    value={formData.pincode}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Pincode is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-map-marker me-1"></i> Location *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Location fetched from profile"
                                    value={formData.location}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">Location is fetched from your profile page</small>
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label><i className="fa fa-map me-1"></i> State Code *</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="State code fetched from profile"
                                    value={formData.stateCode ? `${formData.stateCode} - ${indianStateCodes.find(state => state.code === formData.stateCode)?.name || ''}` : ''}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                                />
                                <small className="text-muted">State code is fetched from your profile page</small>
                            </div>
                            <div className="col-12 col-md-6 mb-3">
                                <label className="required-field"><i className="fa fa-calendar me-1"></i> Date of Birth</label>
                                <input
                                    className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                    type="date"
                                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                    onChange={(e) => {
                                        handleInputChange('dateOfBirth', e.target.value);
                                        validateField('dateOfBirth', e.target.value);
                                    }}
                                    max={new Date().toISOString().split('T')[0]}
                                    min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                                    required
                                />
                                {errors.dateOfBirth && <div className="text-danger mt-1"><small>{errors.dateOfBirth}</small></div>}
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label className="required-field"><i className="fa fa-venus-mars me-1"></i> Gender</label>
                                <select 
                                    className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
                                    value={formData.gender}
                                    onChange={(e) => {
                                        handleInputChange('gender', e.target.value);
                                        validateField('gender', e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                                {errors.gender && <div className="text-danger mt-1"><small>{errors.gender}</small></div>}
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label className="required-field"><i className="fa fa-male me-1"></i> Father's / Husband's Name</label>
                                <input
                                    className={`form-control ${errors.fatherName ? 'is-invalid' : ''}`}
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.fatherName}
                                    onChange={(e) => {
                                        handleInputChange('fatherName', e.target.value);
                                        validateField('fatherName', e.target.value);
                                    }}
                                    required
                                />
                                {errors.fatherName && <div className="text-danger mt-1"><small>{errors.fatherName}</small></div>}
                            </div>

                            <div className="col-12 col-md-6 mb-3">
                                <label className="required-field"><i className="fa fa-female me-1"></i> Mother's Name</label>
                                <input
                                    className={`form-control ${errors.motherName ? 'is-invalid' : ''}`}
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.motherName}
                                    onChange={(e) => {
                                        handleInputChange('motherName', e.target.value);
                                        validateField('motherName', e.target.value);
                                    }}
                                    required
                                />
                                {errors.motherName && <div className="text-danger mt-1"><small>{errors.motherName}</small></div>}
                            </div>

                            <div className="col-12 mb-3">
                                <label className="required-field"><i className="fa fa-home me-1"></i> Residential Address</label>
                                <textarea
                                    className={`form-control ${errors.residentialAddress ? 'is-invalid' : ''}`}
                                    rows={2}
                                    placeholder="Enter address"
                                    value={formData.residentialAddress}
                                    onChange={(e) => {
                                        handleInputChange('residentialAddress', e.target.value);
                                        validateField('residentialAddress', e.target.value);
                                    }}
                                    required
                                ></textarea>
                                {errors.residentialAddress && <div className="text-danger mt-1"><small>{errors.residentialAddress}</small></div>}
                            </div>

                            <div className="col-12 mb-3">
                                <style>{`
                                    @media (max-width: 576px) {
                                        .address-toggle-wrapper {
                                            gap: 10px !important;
                                        }
                                    }
                                `}</style>
                                <div className="d-flex align-items-center mb-2 address-toggle-wrapper" style={{gap: '8px'}}>
                                    <div 
                                        className="toggle-switch"
                                        onClick={() => handleSameAsResidentialChange(!sameAsResidential)}
                                        style={{
                                            width: '40px',
                                            height: '18px',
                                            backgroundColor: sameAsResidential ? '#ff6b35' : '#ccc',
                                            borderRadius: '9px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: '14px',
                                                height: '14px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '2px',
                                                left: sameAsResidential ? '24px' : '2px',
                                                transition: 'left 0.3s'
                                            }}
                                        ></div>
                                    </div>
                                    <label style={{ cursor: 'pointer', margin: 0 }} onClick={() => handleSameAsResidentialChange(!sameAsResidential)}>
                                        <i className="fa fa-copy me-1"></i> Same as Residential Address
                                    </label>
                                </div>
                                <label className="required-field"><i className="fa fa-map-marker me-1"></i> Permanent Address</label>
                                <textarea
                                    className={`form-control ${errors.permanentAddress ? 'is-invalid' : ''}`}
                                    rows={2}
                                    placeholder="Enter permanent address"
                                    value={formData.permanentAddress}
                                    onChange={(e) => {
                                        handleInputChange('permanentAddress', e.target.value);
                                        validateField('permanentAddress', e.target.value);
                                    }}
                                    disabled={sameAsResidential}
                                    required
                                ></textarea>
                                {errors.permanentAddress && <div className="text-danger mt-1"><small>{errors.permanentAddress}</small></div>}
                            </div>
                        </div>

                        <div className="text-left mt-4">
                            {hasUnsavedChanges && (
                                <div className="alert alert-warning mb-3" style={{padding: '10px 15px', fontSize: '14px'}}>
                                    <i className="fa fa-exclamation-triangle me-2"></i>
                                    You have unsaved changes. Please click "Save Changes" button to save your information.
                                </div>
                            )}
                            <button 
                                type="button" 
                                onClick={handleSubmit} 
                                className="btn btn-outline-primary" 
                                disabled={loading}
                                style={{
                                    backgroundColor: hasUnsavedChanges ? '#ff6b35' : 'transparent',
                                    color: hasUnsavedChanges ? 'white' : '#007bff',
                                    borderColor: hasUnsavedChanges ? '#ff6b35' : '#007bff',
                                    fontWeight: hasUnsavedChanges ? '600' : 'normal'
                                }}
                            >
                                <i className="fa fa-save me-1"></i>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            {Object.keys(errors).length > 0 && (
                                <div className="text-danger mt-2">
                                    <small><i className="fa fa-times-circle me-1"></i>Please fix the validation errors above before saving</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SectionCanPersonalDetail;
