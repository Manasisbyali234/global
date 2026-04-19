import React, { useEffect } from 'react';
import './PopupNotification.css';

const isValidationErrorMessage = (value) => {
  const text = String(value || '').toLowerCase();
  return (
    text.includes('validation failed') ||
    text.includes('validation error') ||
    text.includes('please check your input') ||
    text.includes('fill all required fields') ||
    text.includes('required fields are missing') ||
    text.includes('missing required fields') ||
    text.includes('must be after') ||
    text.includes('must be on') ||
    text.includes('clashes with') ||
    text.includes('incorrect format') ||
    text.includes('invalid') ||
    text.includes('please select') ||
    text.includes('is required') ||
    text.includes('are required') ||
    text.includes('must be') ||
    text.includes('enter a valid') ||
    text.includes('cannot be empty') ||
    text.includes('choose at least') ||
    text.includes('at least') ||
    text.includes('not match')
  );
};

const PopupNotification = ({ message, onClose, type = 'info', duration = 4000 }) => {
  const displayType = type === 'error' && isValidationErrorMessage(message) ? 'warning' : type;
  const isSingleLineScheduleMessage = typeof message === 'string' && message.startsWith('Assessment scheduled on ');
  const isStructuredMessage = typeof message === 'string' && !isSingleLineScheduleMessage && (
    message.includes('\n') ||
    message.includes('•') ||
    /required fields|missing required fields|row\(s\)|duplicate ids/i.test(message)
  );

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

  const icons = {
    success: '\u2713',
    error: '\u2716',
    warning: '\u26A0',
    info: '\uD83D\uDC4D',
    secure: (
      <div className="popup-icon-lock" aria-hidden="true">
        <i className="fa fa-lock lock-icon" />
      </div>
    )
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className={`popup-box popup-${displayType} ${isSingleLineScheduleMessage ? 'popup-box-single-line' : ''} ${isStructuredMessage ? 'popup-box-structured' : ''}`}>
        <button className="popup-close-button" onClick={onClose} aria-label="Close">
          {'\u00D7'}
        </button>
        <div className={`popup-content ${isStructuredMessage ? 'popup-content-structured' : ''}`}>
          <div className="popup-icon">{icons[displayType] || icons.info}</div>
          <div className={`popup-message ${isSingleLineScheduleMessage ? 'popup-message-single-line' : ''} ${isStructuredMessage ? 'popup-message-structured' : ''}`}>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
