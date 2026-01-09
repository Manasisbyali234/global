const validator = require('validator');

/**
 * Email validation and normalization middleware
 * Ensures consistent email handling across the application
 */

// Email validation function
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  if (!validator.isEmail(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for common email issues
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address too long' };
  }

  return { isValid: true, email: trimmedEmail };
};

// Middleware for validating email in request body
const validateEmailMiddleware = (req, res, next) => {
  if (req.body.email) {
    const validation = validateEmail(req.body.email);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    // Store the validated and trimmed email back to req.body
    req.body.email = validation.email;
  }
  
  next();
};

// Middleware for validating email in query parameters
const validateEmailQueryMiddleware = (req, res, next) => {
  if (req.query.email) {
    const validation = validateEmail(req.query.email);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    // Store the validated and trimmed email back to req.query
    req.query.email = validation.email;
  }
  
  next();
};

// Function to normalize email for storage (preserves original case)
const normalizeEmailForStorage = (email) => {
  if (!email) return email;
  return email.trim(); // Only trim whitespace, preserve original case
};

// Function to normalize email for comparison (case-insensitive)
const normalizeEmailForComparison = (email) => {
  if (!email) return email;
  return email.trim().toLowerCase();
};

module.exports = {
  validateEmail,
  validateEmailMiddleware,
  validateEmailQueryMiddleware,
  normalizeEmailForStorage,
  normalizeEmailForComparison
};