import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import { validatePhoneNumber, ensureCountryCode } from "../../../../../utils/phoneValidation";
import PhoneInput from "../../../../../components/PhoneInput";

function SectionCandicateBasicInfo() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '+91 ',
        email: '',
        website: '',
        qualification: '',
        language: '',
        jobCategory: '',
        experience: '',
        currentSalary: '',
        expectedSalary: '',
        age: '',
        country: '',
        city: '',
        postcode: '',
        fullAddress: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.getCandidateProfile();
            if (response.success && response.profile) {
                const profile = response.profile;
                setFormData({
                    name: profile.candidateId?.name || '',
                    phone: ensureCountryCode(profile.candidateId?.phone || ''),
                    email: profile.candidateId?.email || '',
                    website: profile.website || '',
                    qualification: profile.qualification || '',
                    language: profile.language || '',
                    jobCategory: profile.jobCategory || '',
                    experience: profile.totalExperience || '',
                    currentSalary: profile.currentSalary || '',
                    expectedSalary: profile.expectedSalary || '',
                    age: profile.age || '',
                    country: profile.country || '',
                    city: profile.city || '',
                    postcode: profile.postcode || '',
                    fullAddress: profile.fullAddress || '',
                    description: profile.bio || ''
                });
            }
        } catch (error) {
            
        }
    };

    const handleInputChange = (field, value) => {
        if (field === 'phone') {
            value = ensureCountryCode(value);
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (formData.phone) {
            const phoneValidation = validatePhoneNumber(formData.phone);
            if (!phoneValidation.isValid) {
                newErrors.phone = phoneValidation.message;
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                website: formData.website,
                qualification: formData.qualification,
                language: formData.language,
                jobCategory: formData.jobCategory,
                totalExperience: formData.experience,
                currentSalary: formData.currentSalary,
                expectedSalary: formData.expectedSalary,
                age: formData.age,
                country: formData.country,
                city: formData.city,
                postcode: formData.postcode,
                fullAddress: formData.fullAddress,
                bio: formData.description
            };
            
            const response = await api.updateCandidateProfile(updateData);
            if (response.success) {
                alert('Profile updated successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><i className="fa fa-id-card text-primary me-2" /> Basic Information</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30 ">
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <div className="ls-inputicon-box">
                                        <input 
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                                            name="company_name" 
                                            type="text" 
                                            placeholder="Enter your full name" 
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                        {errors.name && (
                                            <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                                {errors.name}
                                            </div>
                                        )}
                                        <i className="fs-input-icon fa fa-user " />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <div className="ls-inputicon-box">
                                        <PhoneInput
                                            value={formData.phone}
                                            onChange={(value) => handleInputChange('phone', value)}
                                            error={errors.phone}
                                            setError={(errorSetter) => {
                                                if (typeof errorSetter === 'function') {
                                                    setErrors(errorSetter);
                                                }
                                            }}
                                            name="phone"
                                            placeholder="+91 9876543210"
                                            className=""
                                        />
                                        <i className="fs-input-icon fa fa-phone-alt" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="ls-inputicon-box">
                                        <input 
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                                            name="company_Email" 
                                            type="email" 
                                            placeholder="your.email@example.com" 
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                        {errors.email && (
                                            <div className="text-danger mt-1" style={{fontSize: '12px'}}>
                                                {errors.email}
                                            </div>
                                        )}
                                        <i className="fs-input-icon fas fa-at" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Website</label>
                                    <div className="ls-inputicon-box">
                                        <input 
                                            className="form-control" 
                                            name="company_website" 
                                            type="text" 
                                            placeholder="https://yourwebsite.com" 
                                            value={formData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                        />
                                        <i className="fs-input-icon fa fa-globe-americas" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Qualification</label>
                                    <div className="ls-inputicon-box">
                                        <input 
                                            className="form-control" 
                                            name="company_since" 
                                            type="text" 
                                            placeholder="B.Tech, MBA, etc." 
                                            value={formData.qualification}
                                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                                        />
                                        <i className="fs-input-icon fa fa-user-graduate" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Language</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="e.x English, Spanish" />
                                        <i className="fs-input-icon fa fa-language" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Job Category</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="IT & Software" />
                                        <i className="fs-input-icon fa fa-border-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Experience</label>
                                    <div className="ls-inputicon-box">
                                        <input 
                                            className="form-control" 
                                            name="company_since" 
                                            type="text" 
                                            placeholder="e.g., 2 years, 6 months" 
                                            value={formData.experience}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                        />
                                        <i className="fs-input-icon fa fa-user-edit" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Current Salary</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="65K" />
                                        <i className="fs-input-icon fa fa-dollar-sign" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Expected Salary</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="75K" />
                                        <i className="fs-input-icon fa fa-dollar-sign" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Age</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="35 Years" />
                                        <i className="fs-input-icon fa fa-child" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Country</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="USA" />
                                        <i className="fs-input-icon fa fa-globe-americas" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>City</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="Texas" />
                                        <i className="fs-input-icon fa fa-globe-americas" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Postcode</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder={75462} />
                                        <i className="fs-input-icon fas fa-map-pin" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-12 col-lg-12 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Full Address</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_since" type="text" placeholder="1363-1385 Sunset Blvd Angeles, CA 90026 ,USA" />
                                        <i className="fs-input-icon fas fa-map-marker-alt" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        className="form-control" 
                                        rows={3} 
                                        placeholder="Tell us about yourself, your skills, and career objectives..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="text-left">
                                    <button type="submit" className="site-button" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SectionCandicateBasicInfo;
