import React from 'react';
import { validatePhoneNumber, handlePhoneInputChange, validatePhoneOnBlur } from '../utils/phoneValidation';

const PhoneInput = ({ 
  value, 
  onChange, 
  onBlur,
  error, 
  setError,
  name = 'phone',
  placeholder = 'Phone Number* (10 digits)',
  required = false,
  className = '',
  disabled = false,
  autoComplete = 'tel'
}) => {
  const handleChange = (e) => {
    const formattedValue = handlePhoneInputChange(
      e.target.value,
      onChange,
      setError,
      name
    );
    
    // Call parent onChange if provided
    if (onChange && typeof onChange === 'function') {
      onChange(formattedValue);
    }
  };

  const handleBlurEvent = (e) => {
    validatePhoneOnBlur(e.target.value, setError, name, required);
    
    // Call parent onBlur if provided
    if (onBlur && typeof onBlur === 'function') {
      onBlur(e);
    }
  };

  return (
    <div className="phone-input-wrapper">
      <input
        name={name}
        type="tel"
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlurEvent}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {error && (
        <div className="invalid-feedback d-block" style={{fontSize: '12px'}}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;