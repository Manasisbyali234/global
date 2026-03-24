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
                    icon: 'Tab',
                    color: 'danger'
                };
            case 'window_blur':
                return {
                    title: 'Focus Violation',
                    message: 'You minimized the browser window or switched to another application.',
                    icon: 'Focus',
                    color: 'danger'
                };
            case 'fullscreen_exit':
                return {
                    title: 'Fullscreen Exit Violation',
                    message: 'You exited fullscreen mode during the assessment.',
                    icon: 'Full',
                    color: 'danger'
                };
            case 'multi_screen':
                return {
                    title: 'Multiple Screen Violation',
                    message: 'Multiple displays were detected during the assessment.',
                    icon: 'Display',
                    color: 'danger'
                };
            case 'right_click':
                return {
                    title: 'Right Click Violation',
                    message: 'You attempted to right-click during the assessment.',
                    icon: 'Mouse',
                    color: 'danger'
                };
            case 'copy_attempt':
                return {
                    title: 'Copy/Paste Violation',
                    message: 'You attempted to copy or paste content during the assessment.',
                    icon: 'Copy',
                    color: 'danger'
                };
            case 'time_expired':
                return {
                    title: 'Time Expired',
                    message: 'The assessment time limit was exceeded.',
                    icon: 'Time',
                    color: 'warning'
                };
            case 'screen_capture':
                return {
                    title: 'Screen Capture Violation',
                    message: 'Multiple screenshot or screen-recording attempts were detected during the assessment.',
                    icon: 'Screen',
                    color: 'danger'
                };
            default:
                return {
                    title: 'Assessment Suspended',
                    message: 'The assessment was suspended due to repeated rule violations.',
                    icon: 'Alert',
                    color: 'danger'
                };
        }
    };

    const violation = getViolationDetails(violationType);

    return (
        <div className="mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className={`card border-${violation.color} shadow`}>
                        <div className={`card-header bg-${violation.color} text-white text-center`}>
                            <h3 className="mb-0">
                                <span className="me-3" style={{ fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {violation.icon}
                                </span>
                                Assessment Suspended
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
                                <strong>Suspension Time:</strong><br />
                                <span className="text-muted">
                                    {violationTimestamp ? new Date(violationTimestamp).toLocaleString() : 'N/A'}
                                </span>
                            </div>

                            <div className={`alert alert-${violation.color === 'warning' ? 'info' : 'danger'}`}>
                                <h6><strong>What happened?</strong></h6>
                                <p className="mb-0">
                                    {violation.color === 'warning'
                                        ? 'Your assessment time has expired. Any answers you provided have been submitted automatically.'
                                        : 'This assessment has been suspended after repeated rule violations and cannot be resumed. Please contact the employer if you believe this was an error.'
                                    }
                                </p>
                            </div>

                            <div className="mt-4">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/candidate/status')}
                                >
                                    Return to Applications
                                </button>
                            </div>
                        </div>

                        <div className="card-footer text-muted text-center">
                            <small>
                                For any questions about this suspension, please contact support.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentTerminated;
