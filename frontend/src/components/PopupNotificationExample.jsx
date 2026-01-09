import React from 'react';
import PopupNotification from './PopupNotification';
import { usePopupNotification } from '../hooks/usePopupNotification';

const PopupNotificationExample = () => {
  const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>PopupNotification Example</h1>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => showSuccess('Operation completed successfully!')}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Show Success
        </button>
        
        <button 
          onClick={() => showError('An error occurred. Please try again.')}
          style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Show Error
        </button>
        
        <button 
          onClick={() => showWarning('This action requires confirmation.')}
          style={{ padding: '10px 20px', background: '#ffc107', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Show Warning
        </button>
        
        <button 
          onClick={() => showInfo('Here is some useful information.')}
          style={{ padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Show Info
        </button>
      </div>

      {popup.show && (
        <PopupNotification 
          message={popup.message} 
          type={popup.type}
          onClose={hidePopup} 
        />
      )}
    </div>
  );
};

export default PopupNotificationExample;
