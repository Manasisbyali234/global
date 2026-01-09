import React, { useEffect } from 'react';
import './CreditConfirmationPopup.css';

const CreditConfirmationPopup = ({ credits, onConfirm, onCancel, isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'credit-popup-overlay') {
      onCancel();
    }
  };

  return (
    <div className="credit-popup-overlay" onClick={handleOverlayClick}>
      <div className="credit-popup-box">
        <div className="credit-popup-content">
          <div className="credit-popup-icon">
            ⚠
          </div>
          <div className="credit-popup-message">
            You have {credits} credit{credits > 1 ? 's' : ''} remaining. Applying for this job will deduct 1 credit. Do you want to continue?
          </div>
          <div className="credit-popup-buttons">
            <button className="credit-popup-button cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="credit-popup-button confirm" onClick={onConfirm}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditConfirmationPopup;