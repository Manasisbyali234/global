import { useState } from 'react';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ src, alt, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    return (
        <div className={`image-preview-overlay ${isMinimized ? 'minimized' : ''}`} onClick={onClose}>
            <div 
                className={`image-preview-container ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="image-preview-controls">
                    <button 
                        className="control-btn minimize-btn" 
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? "Restore" : "Minimize"}
                    >
                        {isMinimized ? '□' : '_'}
                    </button>
                    <button 
                        className="control-btn maximize-btn" 
                        onClick={() => setIsMaximized(!isMaximized)}
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? '❐' : '□'}
                    </button>
                    <button className="control-btn close-btn" onClick={onClose} title="Close">
                        ×
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
};

export default ImagePreviewModal;
