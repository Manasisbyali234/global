# Terms & Conditions Modal Component

A reusable, role-based Terms & Conditions modal that appears before signup and requires users to read and accept the terms.

## Features

- **Role-Based Content**: Different terms for Candidate, Employer, and Placement Officer roles
- **Scroll Detection**: Users must scroll to the bottom before accepting
- **Accept Checkbox**: Requires explicit acceptance via checkbox
- **Responsive Design**: Works on desktop and mobile devices
- **Accessible**: Keyboard navigation and screen reader friendly

## Usage

### Basic Implementation

```jsx
import TermsModal from '../../../components/TermsModal';

function YourComponent() {
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [currentRole, setCurrentRole] = useState('candidate');

    const handleTermsAccept = () => {
        setShowTermsModal(false);
        // Proceed with signup or other action
    };

    return (
        <>
            <button onClick={() => {
                setCurrentRole('candidate');
                setShowTermsModal(true);
            }}>
                Sign Up
            </button>

            <TermsModal 
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={handleTermsAccept}
                role={currentRole}
            />
        </>
    );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | - | Controls modal visibility |
| `onClose` | function | Yes | - | Called when user closes modal |
| `onAccept` | function | Yes | - | Called when user accepts terms |
| `role` | string | No | 'candidate' | User role: 'candidate', 'employer', or 'placement' |

## Integration in Signup Flow

The component is integrated into the signup popup (`popup-signup.jsx`) as follows:

1. **State Management**: Track terms acceptance for each role
```jsx
const [termsAccepted, setTermsAccepted] = useState({ 
    candidate: false, 
    employer: false, 
    placement: false 
});
```

2. **Form Submission**: Check if terms are accepted before proceeding
```jsx
const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted.candidate) {
        setCurrentRole('candidate');
        setShowTermsModal(true);
        return;
    }
    
    // Proceed with registration...
};
```

3. **Terms Acceptance Handler**: Update state and trigger form submission
```jsx
const handleTermsAccept = () => {
    setTermsAccepted(prev => ({ ...prev, [currentRole]: true }));
    setShowTermsModal(false);
    
    // Auto-submit form after accepting
    setTimeout(() => {
        document.getElementById('candidate-submit-btn')?.click();
    }, 100);
};
```

## Customization

### Adding New Roles

To add a new role, update the `termsContent` object in `TermsModal.jsx`:

```jsx
const termsContent = {
    // ... existing roles
    newRole: {
        title: 'Terms & Conditions for New Role',
        sections: [
            { 
                heading: 'Section Title', 
                content: 'Section content...' 
            },
            // Add more sections...
        ]
    }
};
```

### Styling

Modify `TermsModal.css` to customize:
- Colors (currently uses `#fd7e14` for primary color)
- Spacing and padding
- Modal dimensions
- Button styles
- Mobile responsiveness

## User Experience Flow

1. User fills out signup form
2. User clicks "Sign Up" button
3. If terms not accepted, modal appears
4. User must scroll to bottom of terms
5. Scroll indicator disappears when bottom reached
6. User checks acceptance checkbox (enabled after scrolling)
7. User clicks "Accept & Continue"
8. Modal closes and form submits automatically
9. Registration proceeds

## Accessibility

- Keyboard navigation supported
- Focus management
- ARIA labels for screen readers
- Clear visual indicators for required actions
- Disabled state for buttons when conditions not met

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE11 not supported (uses modern CSS features)

## Notes

- Terms acceptance is tracked per role in the same session
- Modal prevents background scrolling when open
- Close button (X) allows users to cancel without accepting
- Cancel button provides alternative way to close modal
- Accept button only enabled after scrolling and checking box
