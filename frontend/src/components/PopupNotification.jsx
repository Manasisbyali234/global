import React, { useEffect } from 'react';
import './PopupNotification.css';

const PopupNotification = ({ message, onClose, type = 'info' }) => {
  useEffect(() => {
    if (message) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [message]);

  if (!message) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'popup-overlay') {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className={`popup-box popup-${type}`}>
        <div className="popup-content">
          <div className="popup-icon">
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </div>
          <div className="popup-message" style={{ textAlign: 'center' }}>{message}</div>
          <button className="popup-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
