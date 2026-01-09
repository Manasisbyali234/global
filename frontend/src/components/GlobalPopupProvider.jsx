import React, { useEffect } from 'react';
import { usePopupNotification } from '../hooks/usePopupNotification';
import PopupNotification from './PopupNotification';
import ConfirmationDialog from './ConfirmationDialog';
import { initPopupNotification } from '../utils/popupNotification';

const GlobalPopupProvider = ({ children }) => {
  const { popup, confirmation, showPopup, hidePopup, showConfirmation, hideConfirmation } = usePopupNotification();

  useEffect(() => {
    initPopupNotification(showPopup, showConfirmation);
  }, [showPopup, showConfirmation]);

  const handleConfirm = () => {
    if (confirmation.onConfirm) {
      confirmation.onConfirm();
    }
    hideConfirmation();
  };

  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  return (
    <>
      {children}
      {popup.show && (
        <PopupNotification
          message={popup.message}
          type={popup.type}
          onClose={hidePopup}
        />
      )}
      {confirmation.show && (
        <ConfirmationDialog
          message={confirmation.message}
          type={confirmation.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default GlobalPopupProvider;
