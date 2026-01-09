import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorDisplay = ({ 
  errors = {}, 
  fieldName, 
  className = '', 
  showIcon = true,
  inline = false 
}) => {
  const fieldErrors = fieldName ? errors[fieldName] : null;
  
  if (!fieldErrors) return null;

  const errorArray = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];

  if (inline) {
    return (
      <div className={`error-display inline ${className}`}>
        {errorArray.map((error, index) => (
          <div key={index} className="error-message inline-error">
            {showIcon && <AlertCircle size={14} className="error-icon" />}
            <span className="error-text">{error}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`error-display ${className}`}>
      {errorArray.map((error, index) => (
        <div key={index} className="error-message">
          {showIcon && <AlertCircle size={16} className="error-icon" />}
          <span className="error-text">{error}</span>
        </div>
      ))}
    </div>
  );
};

const GlobalErrorDisplay = ({ 
  errors = [], 
  onDismiss, 
  className = '',
  title = "Please fix the following errors:"
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={`global-error-display ${className}`}>
      <div className="error-header">
        <AlertCircle size={20} className="error-icon" />
        <h4 className="error-title">{title}</h4>
        {onDismiss && (
          <button 
            type="button" 
            className="error-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss errors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <ul className="error-list">
        {errors.map((error, index) => (
          <li key={index} className="error-item">
            {typeof error === 'string' ? error : error.message || 'Unknown error'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export { ErrorDisplay, GlobalErrorDisplay };
export default ErrorDisplay;