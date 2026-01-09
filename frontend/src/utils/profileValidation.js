// Profile validation for required fields
export const validateCandidateProfile = (formData) => {
    const errors = {};
    
    // Required fields validation
    if (!formData.name?.trim()) {
        errors.name = 'Full name is required';
    }
    
    if (!formData.middleName?.trim()) {
        errors.middleName = 'Middle name is required';
    }
    
    if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
    }
    
    if (!formData.phone?.trim()) {
        errors.phone = 'Mobile number is required';
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s\-\(\)\+]/g, ''))) {
        errors.phone = 'Mobile number must be exactly 10 digits';
    }
    
    if (!formData.email?.trim()) {
        errors.email = 'Email is required';
    }
    
    if (!formData.location?.trim()) {
        errors.location = 'Location is required';
    }
    
    return errors;
};
