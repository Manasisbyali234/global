/**
 * Toast Notification Utility
 * Provides a centralized way to show toast notifications without alerts
 */

const showToast = (message, type = 'info', duration = 3000) => {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    const toastId = `toast-${Date.now()}`;
    toast.id = toastId;
    
    // Set styles based on type
    const typeStyles = {
        success: {
            bg: '#10b981',
            icon: '✓'
        },
        error: {
            bg: '#ef4444',
            icon: '✕'
        },
        warning: {
            bg: '#f59e0b',
            icon: ''
        },
        info: {
            bg: '#3b82f6',
            icon: 'ℹ'
        }
    };

    const style = typeStyles[type] || typeStyles.info;

    toast.style.cssText = `
        background-color: ${style.bg};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        animation: slideIn 0.3s ease-out;
        word-break: break-word;
        pointer-events: auto;
    `;

    toast.innerHTML = `
        ${style.icon ? `<span style="flex-shrink: 0; font-size: 18px; font-weight: bold;">${style.icon}</span>` : ''}
        <span style="flex: 1;">${message}</span>
    `;

    container.appendChild(toast);

    // Add animation keyframes if not already present
    if (!document.getElementById('toast-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Auto remove toast after duration
    const timeoutId = setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.remove();
            // Remove container if empty
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);

    // Return function to manually close toast
    return () => {
        clearTimeout(timeoutId);
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.remove();
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    };
};

export default showToast;