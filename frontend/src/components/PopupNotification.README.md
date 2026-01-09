# PopupNotification Component

A custom, lightweight popup notification component to replace react-toastify.

## Features

- ✅ Center-screen popup with semi-transparent overlay
- ✅ Four notification types: success, error, warning, info
- ✅ Click outside to close
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ No external dependencies

## Installation

No installation needed - all files are included in the project.

## Usage

### Method 1: Using the Custom Hook (Recommended)

```jsx
import React from 'react';
import PopupNotification from './components/PopupNotification';
import { usePopupNotification } from './hooks/usePopupNotification';

const MyComponent = () => {
  const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();

  const handleSubmit = async () => {
    try {
      // Your API call
      await submitData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      
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
```

### Method 2: Using useState Directly

```jsx
import React, { useState } from 'react';
import PopupNotification from './components/PopupNotification';

const MyComponent = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('info');

  const handleSuccess = () => {
    setPopupMessage('Operation successful!');
    setPopupType('success');
    setShowPopup(true);
  };

  return (
    <div>
      <button onClick={handleSuccess}>Click Me</button>
      
      {showPopup && (
        <PopupNotification 
          message={popupMessage} 
          type={popupType}
          onClose={() => setShowPopup(false)} 
        />
      )}
    </div>
  );
};
```

## Migration from Toastify

### Before (with Toastify):
```jsx
import { toast } from 'react-toastify';

toast.success('Success message');
toast.error('Error message');
toast.warning('Warning message');
toast.info('Info message');
```

### After (with PopupNotification):
```jsx
import { usePopupNotification } from './hooks/usePopupNotification';

const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();

showSuccess('Success message');
showError('Error message');
showWarning('Warning message');
showInfo('Info message');

// Add to JSX:
{popup.show && (
  <PopupNotification 
    message={popup.message} 
    type={popup.type}
    onClose={hidePopup} 
  />
)}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | string | Yes | - | The message to display |
| type | string | No | 'info' | Notification type: 'success', 'error', 'warning', 'info' |
| onClose | function | Yes | - | Callback function when popup closes |

## Notification Types

- **success**: Green checkmark icon
- **error**: Red X icon
- **warning**: Yellow warning icon
- **info**: Blue info icon

## Customization

Edit `PopupNotification.css` to customize:
- Colors
- Border radius
- Padding
- Shadow
- Animation speed
- Button styles

## Example

See `PopupNotificationExample.jsx` for a complete working example.
