import React from 'react';

const PhoneValidationInfo = ({ show = false }) => {
  if (!show) return null;

  return (
    <div className="phone-validation-info mt-2 p-3" style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '0.375rem',
      fontSize: '0.875rem'
    }}>
      <h6 className="mb-2" style={{ color: '#495057', fontSize: '0.875rem' }}>
        <i className="fa fa-info-circle me-1"></i>
        Phone Number Format Requirements:
      </h6>
      <ul className="mb-0 ps-3" style={{ color: '#6c757d' }}>
        <li>Must be exactly 10 digits long</li>
        <li>Only numeric digits allowed (0-9)</li>
      </ul>
      <div className="mt-2">
        <small className="text-success">
          <i className="fa fa-check me-1"></i>
          Valid example: 9876543210
        </small>
      </div>
    </div>
  );
};

export default PhoneValidationInfo;