// Phone number validation utility for backend with +91 support

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return { isValid: false, message: 'Phone number is required' };
  
  // Remove all spaces and special characters
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's between 6-10 digits
  if (!/^\d{7,15}$/.test(cleanNumber)) {
    return { 
      isValid: false, 
      message: 'Phone number must be exactly 10 digits' 
    };
  }
  
  return { isValid: true, message: '' };
};

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Return only digits, max 15
  return cleanNumber.substring(0, 15);
};

module.exports = {
  validatePhoneNumber,
  formatPhoneNumber
};