import { useState, useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ message, type = 'success', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-check-circle';
        }
    };

    return (
        <div className={`toast-notification toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
            <div className="toast-content">
                <i className={`fa ${getIcon()} toast-icon`}></i>
                <span className="toast-message">{message}</span>
                <button 
                    className="toast-close" 
                    onClick={() => {
                        setIsExiting(true);
                        setTimeout(() => {
                            setIsVisible(false);
                            onClose && onClose();
                        }, 300);
                    }}
                >
                    <i className="fa fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;