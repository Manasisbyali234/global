// Candidate profile validation - blocks update without required fields
export const validateCandidateUpdate = (formData) => {
    const errors = {};
    
    if (!formData.middleName?.trim()) {
        errors.middleName = 'Middle name is required to update profile';
    }
    
    if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required to update profile';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const blockProfileUpdate = (formData) => {
    const validation = validateCandidateUpdate(formData);
    if (!validation.isValid) {
        throw new Error('Profile update blocked: Middle name and last name are required');
    }
    return true;
};
