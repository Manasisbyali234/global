import React from 'react';
import './PopupNotification.css';

const ConfirmationDialog = ({ message, onConfirm, onCancel, type = 'warning' }) => {
  if (!message) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'popup-overlay') {
      onCancel();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className={`popup-box popup-${type}`}>
        <button className="popup-close-button" onClick={onCancel} aria-label="Close">
          ✕
        </button>
        <div className="popup-content">
          <div className="popup-icon">
            {type === 'warning' && '⚠'}
            {type === 'error' && '✕'}
            {type === 'info' && 'ℹ'}
          </div>
          <div className="popup-message-left">{message}</div>
          <div className="popup-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              className="popup-button popup-button-confirm" 
              onClick={onConfirm}
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white',
                minWidth: '80px'
              }}
            >
              Yes
            </button>
            <button 
              className="popup-button popup-button-cancel" 
              onClick={onCancel}
              style={{ 
                backgroundColor: '#6c757d', 
                color: 'white',
                minWidth: '80px'
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;