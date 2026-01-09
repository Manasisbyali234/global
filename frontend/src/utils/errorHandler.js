import { showPopup, showSuccess, showError, showWarning, showInfo } from './popupNotification';
/**
 * Enhanced error handling utility for better user experience
 */

export class ValidationError extends Error {
  constructor(message, field = null, code = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Parse API error response and return structured error data
 */
export const parseApiError = (error, response = null) => {
  const errorData = {
    message: 'An unexpected error occurred',
    type: 'error',
    field: null,
    code: null,
    details: []
  };

  // Handle network errors
  if (!response && (error.message.includes('fetch') || error.message.includes('network'))) {
    errorData.message = 'Network error. Please check your connection and try again.';
    errorData.type = 'network';
    return errorData;
  }

  // Handle response errors
  if (response) {
    errorData.code = response.status;
    
    switch (response.status) {
      case 400:
        errorData.message = 'Invalid request. Please check your input and try again.';
        errorData.type = 'validation';
        break;
      case 401:
        errorData.message = 'Session expired. Please login again.';
        errorData.type = 'auth';
        break;
      case 403:
        errorData.message = 'Access denied. You don\'t have permission to perform this action.';
        errorData.type = 'permission';
        break;
      case 404:
        errorData.message = 'The requested resource was not found.';
        errorData.type = 'notfound';
        break;
      case 413:
        errorData.message = 'File too large. Please reduce file size and try again.';
        errorData.type = 'filesize';
        break;
      case 422:
        errorData.message = 'Validation failed. Please check your input.';
        errorData.type = 'validation';
        break;
      case 429:
        errorData.message = 'Too many requests. Please wait a moment and try again.';
        errorData.type = 'ratelimit';
        break;
      case 500:
        errorData.message = 'Server error. Please try again later.';
        errorData.type = 'server';
        break;
      default:
        errorData.message = `Request failed with status ${response.status}`;
        errorData.type = 'unknown';
    }
  }

  // Override with specific error message if available
  if (error.message && error.message !== 'Failed to fetch') {
    errorData.message = error.message;
  }

  return errorData;
};

/**
 * Parse validation errors from API response
 */
export const parseValidationErrors = (apiResponse) => {
  const errors = {};
  
  if (apiResponse.errors && Array.isArray(apiResponse.errors)) {
    apiResponse.errors.forEach(error => {
      const field = error.path || error.param || error.field;
      let message = error.msg || error.message || 'Invalid value';
      
      // Replace field names in error messages with user-friendly labels
      if (field && message.includes(field)) {
        const fieldLabel = getFieldLabel(field);
        message = message.replace(field, fieldLabel);
      }
      
      if (field) {
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(message);
      }
    });
  }
  
  // Handle single field error
  if (apiResponse.field && apiResponse.message) {
    let message = apiResponse.message;
    if (message.includes(apiResponse.field)) {
      const fieldLabel = getFieldLabel(apiResponse.field);
      message = message.replace(apiResponse.field, fieldLabel);
    }
    errors[apiResponse.field] = [message];
  }
  
  return errors;
};

/**
 * Display error using appropriate method based on context
 */
export const displayError = (error, options = {}) => {
  const {
    useToast = true,
    useAlert = false,
    duration = 5000,
    onError = null
  } = options;

  const errorData = typeof error === 'string' 
    ? { message: error, type: 'error' }
    : parseApiError(error);

  // Call custom error handler if provided
  if (onError && typeof onError === 'function') {
    onError(errorData);
    return;
  }

  // Display using toast notification (preferred)
  if (useToast && !useAlert) {
    if (errorData.type === 'auth') { showWarning(errorData.message); } else { showError(errorData.message); }
    return;
  }

  // Fallback to alert
  if (useAlert) {
    alert(errorData.message);
    return;
  }

  // Default to console error
  console.error('Error:', errorData);
};

/**
 * Handle API response and extract error information
 */
export const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new NetworkError(`Server returned ${response.status}: Expected JSON but got ${contentType || 'unknown'}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.message || `Request failed with status ${response.status}`;
    
    if (response.status === 401) {
      throw new AuthError(errorMessage);
    }
    
    if (response.status === 400 && data.errors) {
      const validationError = new ValidationError(errorMessage);
      validationError.details = data.errors;
      throw validationError;
    }
    
    throw new NetworkError(errorMessage, response.status);
  }
  
  return data;
};

/**
 * Safe API call wrapper with enhanced error handling
 */
export const safeApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    // Re-throw known error types
    if (error instanceof ValidationError || 
        error instanceof NetworkError || 
        error instanceof AuthError) {
      throw error;
    }
    
    // Handle unknown errors
    if (error.message.includes('Unexpected token')) {
      throw new NetworkError('API server is not responding correctly. Please check if the backend is running.');
    }
    
    throw new NetworkError(error.message || 'Network request failed');
  }
};

/**
 * Field name mappings for user-friendly error messages
 */
const fieldLabels = {
  // Basic Information
  companyName: 'Company Name',
  phone: 'Phone Number',
  email: 'Email Address',
  website: 'Website',
  establishedSince: 'Established Since',
  
  // Company Details
  corporateAddress: 'Corporate Address',
  officialEmail: 'Official Email',
  officialMobile: 'Official Mobile Number',
  cin: 'CIN Number',
  gstNumber: 'GST Number',
  panNumber: 'PAN Number',
  
  // Primary Contact
  contactFullName: 'First Name',
  contactLastName: 'Last Name',
  contactDesignation: 'Designation',
  contactOfficialEmail: 'Official Email',
  contactMobile: 'Mobile Number',
  alternateContact: 'Alternate Contact'
};



/**
 * Validate form field and return error message
 */
export const validateField = (fieldName, value, rules = {}) => {
  const errors = [];
  const fieldLabel = getFieldLabel(fieldName);
  
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    errors.push(`${fieldLabel} is required`);
    return errors;
  }
  
  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return errors;
  }
  
  // Email validation
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push('Please enter a valid email address');
  }
  
  // Phone validation
  if (rules.phone) {
    const cleanNumber = value.replace(/[\s\-\(\)]/g, '');
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      errors.push('Phone number must be between 7-15 digits');
    }
  }
  
  // URL validation
  if (rules.url && !/^https?:\/\/.+/.test(value)) {
    errors.push('URL must start with http:// or https://');
  }
  
  // Year validation
  if (rules.year && !/^\d{4}$/.test(value)) {
    errors.push('Please enter a valid 4-digit year');
  }
  
  // Length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters`);
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters`);
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || 'Invalid format');
  }
  
  return errors;
};

/**
 * Validate entire form object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const fieldErrors = validateField(fieldName, formData[fieldName], validationRules[fieldName]);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  });
  
  return errors;
};

/**
 * Export getFieldLabel for use in other components
 */
export const getFieldLabel = (fieldName) => {
  return fieldLabels[fieldName] || fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Get user-friendly error message for common scenarios
 */
export const getErrorMessage = (error, context = '') => {
  if (typeof error === 'string') return error;
  
  const errorData = parseApiError(error);
  
  // Context-specific messages
  const contextMessages = {
    upload: {
      network: 'Upload failed due to network error. Please check your connection and try again.',
      filesize: 'File is too large. Please choose a smaller file and try again.',
      validation: 'Invalid file format. Please check the file requirements and try again.'
    },
    login: {
      auth: 'Invalid email or password. Please check your credentials and try again.',
      network: 'Login failed due to network error. Please check your connection and try again.'
    },
    profile: {
      validation: 'Please check the highlighted fields and correct any errors.',
      network: 'Profile update failed due to network error. Please try again.',
      auth: 'Your session has expired. Please login again to continue.'
    }
  };
  
  if (context && contextMessages[context] && contextMessages[context][errorData.type]) {
    return contextMessages[context][errorData.type];
  }
  
  return errorData.message;
};

export default {
  ValidationError,
  NetworkError,
  AuthError,
  parseApiError,
  parseValidationErrors,
  displayError,
  handleApiResponse,
  safeApiCall,
  validateField,
  validateForm,
  getErrorMessage,
  getFieldLabel
};
