// Phone number validation utility with +91 support

export const validatePhoneNumber = (phoneNumber, isRequired = false) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return isRequired 
      ? { isValid: false, message: 'Phone number is required' }
      : { isValid: true, message: '' };
  }
  
  // Remove all spaces and special characters
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's exactly 10 digits
  if (!/^\d{10}$/.test(cleanNumber)) {
    return { 
      isValid: false, 
      message: 'Phone number must be exactly 10 digits' 
    };
  }
  
  return { isValid: true, message: '' };
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Return only digits, max 10
  return cleanNumber.substring(0, 10);
};

export const ensureCountryCode = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') return '';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Return only digits, max 10
  return cleanNumber.substring(0, 10);
};

// Utility to handle phone input changes with validation
export const handlePhoneInputChange = (value, setFieldValue, setErrors, fieldName = 'phone') => {
  const formattedValue = formatPhoneNumber(value);
  setFieldValue(formattedValue);
  
  // Validate immediately if length is not 10
  if (formattedValue.length > 0 && formattedValue.length !== 10) {
    setErrors(prev => ({ ...prev, [fieldName]: 'Phone number must be exactly 10 digits' }));
  } else {
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  }
  
  return formattedValue;
};

// Utility to validate phone on blur
export const validatePhoneOnBlur = (value, setErrors, fieldName = 'phone', isRequired = false) => {
  const validation = validatePhoneNumber(value, isRequired);
  if (!validation.isValid) {
    setErrors(prev => ({ ...prev, [fieldName]: validation.message }));
  }
  return validation.isValid;
};
