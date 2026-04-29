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
    const suspensionTime = violationTimestamp ? new Date(violationTimestamp).toLocaleString() : 'N/A';
    const infoCardBorder = violation.color === 'warning' ? '#0dcaf0' : '#dc3545';
    const infoCardBackground = violation.color === 'warning' ? '#f0fbff' : '#fff5f5';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px',
                background: 'linear-gradient(180deg, #fff8f5 0%, #f8fafc 100%)'
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '760px',
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        padding: '28px 32px 20px',
                        background: violation.color === 'warning'
                            ? 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)'
                            : 'linear-gradient(135deg, #fff1f2 0%, #fff 100%)',
                        borderBottom: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            width: '72px',
                            height: '72px',
                            margin: '0 auto 16px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: violation.color === 'warning' ? '#fff3cd' : '#fee2e2',
                            color: violation.color === 'warning' ? '#b45309' : '#b91c1c',
                            fontSize: '28px',
                            fontWeight: '700'
                        }}
                    >
                        !
                    </div>
                    <h2 style={{ margin: '0 0 8px', color: '#111827', fontWeight: '700' }}>Assessment Suspended</h2>
                    <p style={{ margin: 0, color: '#b91c1c', fontSize: '18px', fontWeight: '600' }}>{violation.title}</p>
                </div>

                <div style={{ padding: '28px 32px 32px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gap: '16px',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            marginBottom: '24px'
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '18px 20px',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                Assessment
                            </div>
                            <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600', wordBreak: 'break-word' }}>
                                {assessmentTitle || 'Technical Assessment'}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '18px 20px',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                Suspension Time
                            </div>
                            <div style={{ color: '#111827', fontSize: '16px', fontWeight: '600' }}>
                                {suspensionTime}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#fffaf0',
                            border: '1px solid #fde68a',
                            borderRadius: '16px',
                            padding: '18px 20px',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ color: '#92400e', fontSize: '13px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Violation Detected
                        </div>
                        <p style={{ margin: 0, color: '#374151', lineHeight: '1.7', fontSize: '16px' }}>
                            {violation.message}
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn btn-primary"
                            style={{
                                minWidth: '240px',
                                padding: '12px 22px',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600'
                            }}
                            onClick={() => navigate('/candidate/status')}
                        >
                            Return to Applications
                        </button>
                    </div>

                    <div style={{ marginTop: '18px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                        For any questions about this suspension, please contact support.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentTerminated;
