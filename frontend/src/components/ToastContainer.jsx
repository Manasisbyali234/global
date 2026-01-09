import { useState, useEffect } from 'react';
import ToastNotification from './ToastNotification';

let toastId = 0;
let addToastFunction = null;

export const showToast = (message, type = 'success', duration = 4000) => {
    if (addToastFunction) {
        addToastFunction({ id: ++toastId, message, type, duration });
    }
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        addToastFunction = (toast) => {
            setToasts(prev => [...prev, toast]);
        };

        return () => {
            addToastFunction = null;
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
            {toasts.map((toast, index) => (
                <div 
                    key={toast.id} 
                    style={{ 
                        marginBottom: '10px',
                        transform: `translateY(${index * 10}px)`
                    }}
                >
                    <ToastNotification
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;