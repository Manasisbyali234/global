import React, { useEffect } from 'react';
import './PopupNotification.css';

const PopupNotification = ({ message, onClose, type = 'info', duration = 4000 }) => {
  useEffect(() => {
    if (message) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});

      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'popup-overlay') {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className={`popup-box popup-${type}`}>
        <button className="popup-close-button" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="popup-content">
          <div className="popup-icon">
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </div>
          <div className="popup-message" style={{ textAlign: 'center' }}>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
