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

    return (
        <div className="modal fade twm-model-popup show" id="termsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="false" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Assessment Terms & Conditions</h5>
                    </div>

                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0' }}>
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

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>🔒</span> Assessment Integrity
                                </h6>
                                <ul style={{ paddingLeft: '24px', margin: '0', color: '#f72d12ff', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '8px' }}>You must complete the assessment in one continuous session</li>
                                    <li style={{ marginBottom: '8px' }}>Switching browser tabs will result in immediate termination</li>
                                    <li style={{ marginBottom: '8px' }}>Minimizing the browser window will result in immediate termination</li>
                                    <li style={{ marginBottom: '8px' }}>Using Alt+Tab or other window switching will result in immediate termination</li>
                                    <li style={{ marginBottom: '8px' }}>Right-clicking is disabled during the assessment</li>
                                    <li style={{ marginBottom: '8px' }}>Copy-paste functionality is disabled during the assessment</li>
                                </ul>
                            </div>

                            <div className="mb-4" style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                                <h6 style={{ color: '#dc3545', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>⚠️</span> Violation Consequences
                                </h6>
                                <ul style={{ paddingLeft: '24px', margin: '0', color: '#495057', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '8px' }}><strong>Tab Switch:</strong> Assessment will be terminated immediately</li>
                                    <li style={{ marginBottom: '8px' }}><strong>Window Minimize/Blur:</strong> Assessment will be terminated immediately</li>
                                    <li style={{ marginBottom: '8px' }}><strong>Right Click:</strong> Assessment will be terminated immediately</li>
                                    <li style={{ marginBottom: '8px' }}><strong>Copy/Paste Attempt:</strong> Assessment will be terminated immediately</li>
                                    <li style={{ marginBottom: '0' }}><strong>Time Expiration:</strong> Assessment will auto-submit with current answers</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>💻</span> Technical Requirements
                                </h6>
                                <ul style={{ paddingLeft: '24px', margin: '0', color: '#495057', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '8px' }}>Use a stable internet connection</li>
                                    <li style={{ marginBottom: '8px' }}>Ensure your browser is up to date</li>
                                    <li style={{ marginBottom: '8px' }}>Close all unnecessary applications</li>
                                    <li style={{ marginBottom: '0' }}>Do not refresh the page during the assessment</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h6 style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>📌</span> Important Notes
                                </h6>
                                <ul style={{ paddingLeft: '24px', margin: '0', color: '#495057', lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '8px' }}>All violations are logged with timestamps</li>
                                    <li style={{ marginBottom: '8px' }}>Once terminated, the assessment cannot be resumed</li>
                                    <li style={{ marginBottom: '8px' }}>Your progress will be saved only upon successful completion</li>
                                    <li style={{ marginBottom: '0' }}>Ensure you have answered all questions before submitting</li>
                                </ul>
                            </div>

                            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '16px', marginTop: '24px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '24px', marginRight: '12px' }}>⚠️</span>
                                    <div>
                                        <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>Warning:</strong>
                                        <p style={{ margin: '0', color: '#856404', lineHeight: '1.6' }}>By proceeding with this assessment, you agree to abide by all the rules stated above. Any violation will result in immediate termination of your assessment.</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '20px', marginTop: '8px' }}>
                                <details style={{ marginBottom: '16px' }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#2c3e50', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                                        📋 Legal Compliance and Jurisdiction
                                    </summary>
                                    <div style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', lineHeight: '1.7', backgroundColor: '#f8f9fa', borderRadius: '6px', marginTop: '8px' }}>
                                        <p style={{ marginBottom: '12px' }}>All users of TaleGlobal including employers, candidates, consultancies, and placement officers agree to comply with all applicable laws, regulations, and guidelines in force in India, including but not limited to: Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; Digital Personal Data Protection Act, 2023; Indian Contract Act, 1872; Right to Privacy as enshrined under Article 21 of the Constitution of India; Applicable Employment, Labour, and Anti-Discrimination Laws of India; UGC and AICTE Guidelines governing campus placements and institutional data management.</p>
                                        <p style={{ marginBottom: '12px' }}>TaleGlobal operates solely as a digital intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000 and shall not be deemed to create any employment, partnership, or agency relationship with any user.</p>
                                        <p style={{ marginBottom: '0' }}>Any dispute, claim, or controversy arising out of or in connection with these Terms, the Privacy Policy, or use of the platform shall be governed exclusively by the laws of India. The parties agree that the courts at Bengaluru, Karnataka, shall have exclusive jurisdiction to adjudicate all such disputes.</p>
                                    </div>
                                </details>

                                <details style={{ marginBottom: '16px' }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#2c3e50', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                                        🔐 Privacy Policy
                                    </summary>
                                    <div style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', lineHeight: '1.7', backgroundColor: '#f8f9fa', borderRadius: '6px', marginTop: '8px' }}>
                                        <p style={{ marginBottom: '0' }}>TaleGlobal is committed to protecting the privacy, security, and lawful use of personal information entrusted to it by all individuals using its website and services. By creating an account, accessing, or using the TaleGlobal platform, you expressly acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to the collection and use of your personal data as set out herein in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and other applicable laws of India.</p>
                                    </div>
                                </details>

                                <details style={{ marginBottom: '16px' }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#2c3e50', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                                        ⚖️ Disclaimer and Limitation of Liability
                                    </summary>
                                    <div style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', lineHeight: '1.7', backgroundColor: '#f8f9fa', borderRadius: '6px', marginTop: '8px' }}>
                                        <p style={{ marginBottom: '0' }}>TaleGlobal functions solely as a digital recruitment intermediary and does not guarantee employment, selection, job placement, or any hiring outcome. TaleGlobal shall not be held liable for any hiring decisions, rejections, delayed offers, job cancellations, or any consequential, indirect, emotional, reputational, or financial loss arising out of or in connection with the use of the platform. TaleGlobal provides all services on an "as is" and "as available" basis, without any express or implied warranties.</p>
                                    </div>
                                </details>

                                <details>
                                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#2c3e50', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                                        ⚖️ Legal Validity and Governing Law
                                    </summary>
                                    <div style={{ padding: '12px 16px', color: '#6c757d', fontSize: '13px', lineHeight: '1.7', backgroundColor: '#f8f9fa', borderRadius: '6px', marginTop: '8px' }}>
                                        <p style={{ marginBottom: '0' }}>This Disclaimer and all related Terms and Conditions shall be governed by and construed in accordance with the laws of India. Users agree that any dispute, claim, or controversy arising from or relating to the use of the TaleGlobal platform, these Terms, or this Disclaimer shall be subject to the exclusive jurisdiction of the competent courts at Bengaluru, Karnataka, India. The invalidity or unenforceability of any provision of this Disclaimer shall not affect the validity of the remaining provisions, which shall remain in full force and effect.</p>
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