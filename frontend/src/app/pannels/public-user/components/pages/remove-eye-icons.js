// Remove duplicate eye icons from password fields
export const removePasswordEyeIcons = () => {
    const removeIcons = () => {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            const parent = field.parentElement;
            if (parent) {
                const eyeIcons = parent.querySelectorAll('.fa-eye, .fa-eye-slash, i[class*="eye"]');
                eyeIcons.forEach(icon => icon.remove());
            }
        });
    };
    
    // Run immediately
    removeIcons();
    
    // Run again after a short delay to catch dynamically added icons
    setTimeout(removeIcons, 100);
    setTimeout(removeIcons, 300);
};
