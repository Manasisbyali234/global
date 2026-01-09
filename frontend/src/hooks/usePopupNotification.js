import { useState } from 'react';

export const usePopupNotification = () => {
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });
  const [confirmation, setConfirmation] = useState({ 
    show: false, 
    message: '', 
    type: 'warning', 
    onConfirm: null, 
    onCancel: null 
  });

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
  };

  const hidePopup = () => {
    setPopup({ show: false, message: '', type: 'info' });
  };

  const showConfirmation = (message, onConfirm, onCancel, type = 'warning') => {
    setConfirmation({ 
      show: true, 
      message, 
      type, 
      onConfirm, 
      onCancel: onCancel || (() => hideConfirmation()) 
    });
  };

  const hideConfirmation = () => {
    setConfirmation({ 
      show: false, 
      message: '', 
      type: 'warning', 
      onConfirm: null, 
      onCancel: null 
    });
  };

  return {
    popup,
    confirmation,
    showPopup,
    hidePopup,
    showConfirmation,
    hideConfirmation,
    showSuccess: (message) => showPopup(message, 'success'),
    showError: (message) => showPopup(message, 'error'),
    showWarning: (message) => showPopup(message, 'warning'),
    showInfo: (message) => showPopup(message, 'info'),
  };
};
