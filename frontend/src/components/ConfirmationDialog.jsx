import React from 'react';
import './PopupNotification.css';

const icons = {
  warning: '\u26A0',
  error: '\u2716',
  info: '\u2139',
  secure: (
    <div className="popup-icon-lock" aria-hidden="true">
      <i className="fa fa-lock lock-icon" />
    </div>
  )
};

const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  type = 'warning',
  confirmText = 'Yes',
  cancelText = 'No'
}) => {
  if (!message) return null;

  const handleOverlayClick = (e) => {
    if (e.target?.classList?.contains('popup-overlay')) {
      onCancel();
    }
  };

  return (
    <div className="popup-overlay popup-overlay-blocking" onClick={handleOverlayClick}>
      <div className={`popup-box popup-${type}`}>
        <button className="popup-close-button" onClick={onCancel} aria-label="Close">
          {'\u00D7'}
        </button>
        <div className="popup-content">
          <div className="popup-icon">{icons[type] || icons.info}</div>
          <div className="popup-message">{message}</div>
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
              {confirmText}
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
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
