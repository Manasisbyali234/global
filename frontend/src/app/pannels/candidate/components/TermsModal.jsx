import React, { useEffect } from 'react';
import { disableBodyScroll, enableBodyScroll } from '../../../../utils/scrollUtils';

const TermsModal = ({ isOpen, onAccept, onDecline, assessment }) => {
    useEffect(() => {
        if (isOpen) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
        return () => enableBodyScroll();
    }, [isOpen]);

    if (!isOpen) return null;
    const timeLimit = assessment?.timer ?? assessment?.timeLimit ?? '--';
    const rawPassingPercentage = assessment?.passingPercentage ?? 60;
    const passingPercentage = Number.isFinite(Number(rawPassingPercentage))
        ? Number(rawPassingPercentage)
        : 60;
    return (
        <div className="modal fade twm-model-popup show" id="termsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="false" style={{ display: 'block' }}>
            <div
                className="modal-dialog modal-xl"
                style={{
                    width: 'min(96vw, 1180px)',
                    maxWidth: '1180px',
                    margin: '1.5rem auto'
                }}
            >
                <div className="modal-content" style={{ borderRadius: '16px' }}>
                    <div className="modal-header">
                        <h5 className="modal-title">Assessment Terms & Conditions</h5>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', padding: '0' }}>
                        <div className="terms-content" style={{ padding: '24px 32px' }}>
                            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #ff6b35' }}>
                                <h5 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '8px' }}>Assessment Rules & Guidelines</h5>
                                <p style={{ color: '#6c757d', fontSize: '14px', margin: '0' }}>Please read carefully before proceeding</p>
                            </div>

                            <div className="mb-4" style={{ backgroundColor: '#fff3e0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ff6b35' }}>
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>⏱️</span> Time Limit
                                </h6>
                                <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>You have <strong style={{ color: '#ff6b35' }}>{timeLimit} minutes</strong> to complete this assessment. The timer will start once you begin the assessment.</p>
                            </div>

                            <div className="mb-4" style={{ backgroundColor: '#edf7ed', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #198754' }}>
                                <h6 style={{ color: '#1f5132', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className="fa fa-percent" style={{ marginRight: '8px' }}></i> Passing Percentage
                                </h6>
                                <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>
                                    You need at least <strong style={{ color: '#198754' }}>{passingPercentage}%</strong> to pass this assessment.
                                </p>
                            </div>

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>🔒</span> Assessment Integrity
                                </h6>
                                <ul style={{ paddingLeft: '24px', margin: '0', color: '#f72d12ff', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '8px' }}>Complete in one continuous session</li>
                                    <li style={{ marginBottom: '8px' }}>No tab/window switching (immediate termination)</li>
                                    <li style={{ marginBottom: '8px' }}>Right-click and copy-paste disabled</li>
                                </ul>
                            </div>

                            <div className="mb-4" style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                                <h6 style={{ color: '#dc3545', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>⚠️</span> Violations = Immediate Termination
                                </h6>
                                <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>Tab switching, window blur, right-click, or copy/paste will terminate the assessment. Time expiration auto-submits current answers.</p>
                            </div>

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>💻</span> Technical Requirements
                                </h6>
                                <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>Stable internet, updated browser, close unnecessary apps, no page refresh.</p>
                            </div>

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>📌</span> Important Notes
                                </h6>
                                <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>Violations are logged. Terminated assessments cannot be resumed. Progress saved only on completion.</p>
                            </div>

                            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px 16px', marginTop: '20px', marginBottom: '20px' }}>
                                <p style={{ margin: '0', color: '#856404', lineHeight: '1.6' }}><strong>⚠️ Warning:</strong> By proceeding, you agree to all rules. Violations result in immediate termination.</p>
                            </div>

                            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '16px', marginTop: '8px' }}>
                                <details>
                                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#2c3e50', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                        📋 Legal Terms & Privacy
                                    </summary>
                                    <div style={{ padding: '12px', color: '#6c757d', fontSize: '12px', lineHeight: '1.6', backgroundColor: '#f8f9fa', borderRadius: '6px', marginTop: '8px' }}>
                                        <p style={{ marginBottom: '8px' }}><strong>Compliance:</strong> Users agree to comply with Indian laws including IT Act 2000, DPDP Act 2023, and applicable employment laws.</p>
                                        <p style={{ marginBottom: '8px' }}><strong>Privacy:</strong> By using TaleGlobal, you consent to data collection per our Privacy Policy in accordance with Indian data protection laws.</p>
                                        <p style={{ marginBottom: '8px' }}><strong>Disclaimer:</strong> TaleGlobal is a recruitment intermediary and does not guarantee employment outcomes. Services provided "as is" without warranties.</p>
                                        <p style={{ marginBottom: '0' }}><strong>Jurisdiction:</strong> Governed by Indian law. Disputes subject to exclusive jurisdiction of Bengaluru, Karnataka courts.</p>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ padding: '20px 32px', backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                        <button
                            type="button"
                            className="btn px-4"
                            onClick={() => { enableBodyScroll(); onDecline(); }}
                            style={{
                                backgroundColor: '#fff',
                                borderColor: '#6c757d',
                                color: '#6c757d',
                                border: '2px solid #6c757d',
                                fontWeight: '500',
                                padding: '10px 24px',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#6c757d';
                                e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.color = '#6c757d';
                            }}
                        >
                            Decline & Exit
                        </button>
                        <button
                            type="button"
                            className="btn px-4"
                            onClick={() => { enableBodyScroll(); onAccept(); }}
                            style={{
                                backgroundColor: '#ff6b35',
                                borderColor: '#ff6b35',
                                color: '#fff',
                                border: '2px solid #ff6b35',
                                fontWeight: '600',
                                padding: '10px 24px',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#ff5722';
                                e.target.style.borderColor = '#ff5722';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#ff6b35';
                                e.target.style.borderColor = '#ff6b35';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
                            }}
                        >
                            ✓ I Accept - Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
