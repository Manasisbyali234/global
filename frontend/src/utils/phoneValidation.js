// Phone number validation utility with +91 support

export const validatePhoneNumber = (phoneNumber, isRequired = false) => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return isRequired 
      ? { isValid: false, message: 'Phone number is required' }
      : { isValid: true, message: '' };
  }
  
  // Remove all spaces and special characters
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's minimum 10 digits
  if (!/^\d{10,15}$/.test(cleanNumber)) {
    return { 
      isValid: false, 
      message: 'Phone number must be at least 10 digits' 
    };
  }
  
  return { isValid: true, message: '' };
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Return only digits, max 15
  return cleanNumber.substring(0, 15);
};

export const ensureCountryCode = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') return '';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Return only digits, max 15
  return cleanNumber.substring(0, 15);
};

// Utility to handle phone input changes with validation
export const handlePhoneInputChange = (value, setFieldValue, setErrors, fieldName = 'phone') => {
  const formattedValue = formatPhoneNumber(value);
  setFieldValue(formattedValue);
  
  // Clear error when user starts typing
  setErrors(prev => ({ ...prev, [fieldName]: '' }));
  
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
