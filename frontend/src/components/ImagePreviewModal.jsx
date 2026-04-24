import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ src, alt, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.classList.add('image-preview-modal-open');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.classList.remove('image-preview-modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const modalContent = (
        <div
            className={`image-preview-overlay ${isMinimized ? 'minimized' : ''}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={alt || 'Image preview'}
        >
            <div
                className={`image-preview-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="image-preview-controls">
                    <button
                        type="button"
                        className="control-btn minimize-btn"
                        onClick={() => setIsMinimized((value) => !value)}
                        title={isMinimized ? 'Restore' : 'Minimize'}
                        aria-label={isMinimized ? 'Restore preview' : 'Minimize preview'}
                    >
                        {isMinimized ? '\u25A1' : '_'}
                    </button>
                    <button
                        type="button"
                        className="control-btn maximize-btn"
                        onClick={() => setIsMaximized((value) => !value)}
                        title={isMaximized ? 'Restore' : 'Maximize'}
                        aria-label={isMaximized ? 'Restore preview size' : 'Maximize preview size'}
                    >
                        {isMaximized ? '\u2750' : '\u25A1'}
                    </button>
                    <button
                        type="button"
                        className="control-btn close-btn"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close image preview"
                    >
                        {'\u00D7'}
                    </button>
                </div>

                {!isMinimized && (
                    <div className="image-preview-content">
                        <img src={src} alt={alt} />
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof document === 'undefined') {
        return modalContent;
    }

    return createPortal(modalContent, document.body);
};

export default ImagePreviewModal;
