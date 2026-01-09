import React, { useEffect } from 'react';
import { disableBodyScroll, enableBodyScroll } from '../../../../utils/scrollUtils';

const ViolationModal = ({ isOpen, violationType, timestamp, onAcknowledge }) => {
    useEffect(() => {
        if (isOpen) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
        return () => enableBodyScroll();
    }, [isOpen]);

    if (!isOpen) return null;

    const getViolationMessage = (type) => {
        switch (type) {
            case 'tab_switch':
                return {
                    title: 'Tab Switch Detected',
                    message: 'You have switched to another browser tab. This violates the assessment rules.',
                    icon: '🔄'
                };
            case 'window_blur':
                return {
                    title: 'Window Focus Lost',
                    message: 'You have minimized the browser window or switched to another application. This violates the assessment rules.',
                    icon: '👁️'
                };
            case 'right_click':
                return {
                    title: 'Right Click Detected',
                    message: 'Right-clicking is not allowed during the assessment. This violates the assessment rules.',
                    icon: '🖱️'
                };
            case 'copy_attempt':
                return {
                    title: 'Copy/Paste Attempt Detected',
                    message: 'Copy-paste functionality is disabled during the assessment. This violates the assessment rules.',
                    icon: '📋'
                };
            case 'time_expired':
                return {
                    title: 'Time Expired',
                    message: 'The assessment time has expired. Your current answers will be submitted automatically.',
                    icon: '⏰'
                };
            default:
                return {
                    title: 'Violation Detected',
                    message: 'An assessment rule violation has been detected.',
                    icon: '⚠️'
                };
        }
    };

    const violation = getViolationMessage(violationType);

    return (
        <div className="modal fade twm-model-popup show" id="violationModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="false" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content border-danger">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">
                            <span className="me-2">{violation.icon}</span>
                            {violation.title}
                        </h5>
                    </div>

                    <div className="modal-body">
                        <div className="alert alert-danger">
                            <strong>Violation Time:</strong> {new Date(timestamp).toLocaleString()}
                        </div>

                        <p className="mb-3">{violation.message}</p>

                        <div className="alert alert-warning">
                            <strong>Consequence:</strong> Your assessment will be terminated immediately and cannot be resumed.
                        </div>

                        <div className="text-muted small">
                            This violation has been logged and reported to the system administrators.
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={() => { enableBodyScroll(); onAcknowledge(); }}
                            style={{
                                background: "#e74c3c",
                                color: "#fff",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Acknowledge & Exit Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViolationModal;