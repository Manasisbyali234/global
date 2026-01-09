import React from 'react';
import { useNavigate } from 'react-router-dom';

const AssessmentTerminated = ({ violationType, violationTimestamp, assessmentTitle }) => {
    const navigate = useNavigate();

    const getViolationDetails = (type) => {
        switch (type) {
            case 'tab_switch':
                return {
                    title: 'Tab Switch Violation',
                    message: 'You switched to another browser tab during the assessment.',
                    icon: '🔄',
                    color: 'danger'
                };
            case 'window_blur':
                return {
                    title: 'Window Focus Violation',
                    message: 'You minimized the browser window or switched to another application.',
                    icon: '👁️',
                    color: 'danger'
                };
            case 'right_click':
                return {
                    title: 'Right Click Violation',
                    message: 'You attempted to right-click during the assessment.',
                    icon: '🖱️',
                    color: 'danger'
                };
            case 'copy_attempt':
                return {
                    title: 'Copy/Paste Violation',
                    message: 'You attempted to copy or paste content during the assessment.',
                    icon: '📋',
                    color: 'danger'
                };
            case 'time_expired':
                return {
                    title: 'Time Expired',
                    message: 'The assessment time limit was exceeded.',
                    icon: '⏰',
                    color: 'warning'
                };
            default:
                return {
                    title: 'Assessment Terminated',
                    message: 'The assessment was terminated due to a rule violation.',
                    icon: '⚠️',
                    color: 'danger'
                };
        }
    };

    const violation = getViolationDetails(violationType);

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className={`card border-${violation.color} shadow`}>
                        <div className={`card-header bg-${violation.color} text-white text-center`}>
                            <h3 className="mb-0">
                                <span className="me-3" style={{ fontSize: '2rem' }}>{violation.icon}</span>
                                Assessment Terminated
                            </h3>
                        </div>

                        <div className="card-body text-center p-4">
                            <h4 className="card-title text-danger mb-4">
                                {violation.title}
                            </h4>

                            <div className={`alert alert-${violation.color} mb-4`}>
                                <strong>Assessment:</strong> {assessmentTitle || 'Technical Assessment'}
                            </div>

                            <p className="lead mb-3">
                                {violation.message}
                            </p>

                            <div className="mb-4">
                                <strong>Termination Time:</strong><br />
                                <span className="text-muted">
                                    {new Date(violationTimestamp).toLocaleString()}
                                </span>
                            </div>

                            <div className={`alert alert-${violation.color === 'warning' ? 'info' : 'danger'}`}>
                                <h6><strong>What happened?</strong></h6>
                                <p className="mb-0">
                                    {violation.color === 'warning'
                                        ? 'Your assessment time has expired. Any answers you provided have been submitted automatically.'
                                        : 'This violation has been logged and your assessment cannot be resumed. Please contact the employer if you believe this was an error.'
                                    }
                                </p>
                            </div>

                            <div className="mt-4">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleGoBack}
                                >
                                    Return to Applications
                                </button>
                            </div>
                        </div>

                        <div className="card-footer text-muted text-center">
                            <small>
                                For any questions about this termination, please contact support.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentTerminated;