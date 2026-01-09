const { body } = require('express-validator');
const { validatePhoneNumber } = require('../utils/phoneValidation');

// Phone validation middleware using express-validator
const phoneValidationRules = () => {
  return [
    body('phone')
      .optional()
      .custom((value) => {
        if (!value) return true; // Allow empty if optional
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
        return true;
      })
  ];
};

// Required phone validation
const requiredPhoneValidationRules = () => {
  return [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .custom((value) => {
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
        return true;
      })
  ];
};

// Mobile field validation (for signup forms)
const mobileValidationRules = () => {
  return [
    body('mobile')
      .optional()
      .custom((value) => {
        if (!value) return true;
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
        return true;
      })
  ];
};

// Required mobile validation
const requiredMobileValidationRules = () => {
  return [
    body('mobile')
      .notEmpty()
      .withMessage('Mobile number is required')
      .custom((value) => {
        const validation = validatePhoneNumber(value);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
        return true;
      })
  ];
};

module.exports = {
  phoneValidationRules,
  requiredPhoneValidationRules,
  mobileValidationRules,
  requiredMobileValidationRules
};