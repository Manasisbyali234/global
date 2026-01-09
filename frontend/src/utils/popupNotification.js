let showPopupFunction = null;
let showConfirmationFunction = null;

export const initPopupNotification = (showPopupFn, showConfirmationFn) => {
  showPopupFunction = showPopupFn;
  showConfirmationFunction = showConfirmationFn;
};

export const showPopup = (message, type = 'info', duration = 5000) => {
  if (showPopupFunction) {
    showPopupFunction(message, type, duration);
  }
};

export const showConfirmation = (message, onConfirm, onCancel, type = 'warning') => {
  if (showConfirmationFunction) {
    showConfirmationFunction(message, onConfirm, onCancel, type);
  }
};

export const showSuccess = (message, duration) => showPopup(message, 'success', duration);
export const showError = (message, duration) => showPopup(message, 'error', duration);
export const showWarning = (message, duration) => showPopup(message, 'warning', duration);
export const showInfo = (message, duration) => showPopup(message, 'info', duration);
