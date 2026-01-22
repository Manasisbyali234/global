import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Award, BookOpen } from 'lucide-react';
import { api } from '../../../utils/api';
import { disableBodyScroll, enableBodyScroll } from '../../../utils/scrollUtils';

const PopupInterviewRoundDetails = ({ isOpen, onClose, roundDetails, roundType, assessmentId }) => {
    const [assessmentData, setAssessmentData] = useState(null);
    const [loadingAssessment, setLoadingAssessment] = useState(false);
    
    useEffect(() => {
        if (isOpen && roundType === 'technical' && assessmentId) {
            fetchAssessmentDetails();
        }
    }, [isOpen, roundType, assessmentId]);

    useEffect(() => {
        if (isOpen) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
        return () => enableBodyScroll();
    }, [isOpen]);
    
    const fetchAssessmentDetails = async () => {
        setLoadingAssessment(true);
        try {
            const response = await api.getAssessmentById(assessmentId);
            if (response.success) {
                setAssessmentData(response.assessment);
            }
        } catch (error) {
            console.error('Error fetching assessment:', error);
        } finally {
            setLoadingAssessment(false);
        }
    };
    
    if (!isOpen) return null;

    const roundNames = {
        technical: 'Technical Round',
        nonTechnical: 'Non-Technical Round',
        managerial: 'Managerial Round',
        final: 'Final Round',
        hr: 'HR Round',
        aptitude: 'Aptitude test',
        coding: 'Coding'
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        // Create a date object with the time in local timezone
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="modal fade show" style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100001, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxHeight: 'calc(100vh - 40px)', margin: '20px auto' }}>
                <div className="modal-content" style={{ borderRadius: '12px', border: 'none', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="modal-header" style={{ 
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                        color: 'white',
                        borderRadius: '12px 12px 0 0',
                        flexShrink: 0
                    }}>
                        <h5 className="modal-title d-flex align-items-center gap-2">
                            <FileText size={20} />
                            {roundNames[roundType] || 'Interview Round Details'}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={() => { enableBodyScroll(); onClose(); }}
                            style={{ filter: 'invert(1)' }}
                        ></button>
                    </div>
                    <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto' }}>
                        {roundType === 'technical' && assessmentId ? (
                            loadingAssessment ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="text-muted mt-3">Loading assessment details...</p>
                                </div>
                            ) : assessmentData ? (
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <div className="card" style={{ 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px',
                                            background: '#f8fafc'
                                        }}>
                                            <div className="card-body">
                                                <h6 className="card-title text-primary mb-3 d-flex align-items-center gap-2">
                                                    <Award size={20} style={{ color: '#f97316' }} />
                                                    Assessment Information
                                                </h6>
                                                
                                                <div className="row">
                                                    <div className="col-12 mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <BookOpen size={16} style={{ color: '#f97316' }} />
                                                            <strong>Title</strong>
                                                        </div>
                                                        <p className="text-muted mb-0 ms-4">
                                                            {assessmentData.title}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-6 mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <FileText size={16} style={{ color: '#f97316' }} />
                                                            <strong>Type</strong>
                                                        </div>
                                                        <p className="text-muted mb-0 ms-4">
                                                            {assessmentData.type}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-6 mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <Clock size={16} style={{ color: '#f97316' }} />
                                                            <strong>Duration</strong>
                                                        </div>
                                                        <p className="text-muted mb-0 ms-4">
                                                            {assessmentData.timer} minutes
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-6 mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <FileText size={16} style={{ color: '#f97316' }} />
                                                            <strong>Total Questions</strong>
                                                        </div>
                                                        <p className="text-muted mb-0 ms-4">
                                                            {assessmentData.totalQuestions}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="col-md-6 mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <Award size={16} style={{ color: '#f97316' }} />
                                                            <strong>Passing Percentage</strong>
                                                        </div>
                                                        <p className="text-muted mb-0 ms-4">
                                                            {assessmentData.passingPercentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {assessmentData.description && (
                                                    <div className="mt-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <FileText size={16} style={{ color: '#f97316' }} />
                                                            <strong>Description</strong>
                                                        </div>
                                                        <div className="ms-4">
                                                            <div className="p-3" style={{ 
                                                                background: 'white', 
                                                                borderRadius: '6px',
                                                                border: '1px solid #e5e7eb'
                                                            }}>
                                                                <p className="mb-0" style={{ 
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {assessmentData.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {assessmentData.instructions && (
                                                    <div className="mt-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <FileText size={16} style={{ color: '#f97316' }} />
                                                            <strong>Instructions</strong>
                                                        </div>
                                                        <div className="ms-4">
                                                            <div className="p-3" style={{ 
                                                                background: 'white', 
                                                                borderRadius: '6px',
                                                                border: '1px solid #e5e7eb'
                                                            }}>
                                                                <p className="mb-0" style={{ 
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {assessmentData.instructions}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mb-3">
                                        <FileText size={48} className="text-muted" />
                                    </div>
                                    <h6 className="text-muted">Assessment details not available</h6>
                                </div>
                            )
                        ) : roundDetails ? (
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <div className="card" style={{ 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        background: '#f8fafc'
                                    }}>
                                        <div className="card-body">
                                            <h6 className="card-title text-primary mb-3">
                                                Round Information
                                            </h6>
                                            
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Calendar size={16} style={{ color: '#f97316' }} />
                                                        <strong>From Date</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatDate(roundDetails.fromDate)}
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Calendar size={16} style={{ color: '#f97316' }} />
                                                        <strong>To Date</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatDate(roundDetails.toDate)}
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Clock size={16} style={{ color: '#f97316' }} />
                                                        <strong>Time</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatTime(roundDetails.time)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {roundDetails.description && typeof roundDetails.description === 'string' && (
                                                <div className="mt-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <FileText size={16} style={{ color: '#f97316' }} />
                                                        <strong>Description</strong>
                                                    </div>
                                                    <div className="ms-4">
                                                        <div className="p-3" style={{ 
                                                            background: 'white', 
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb'
                                                        }}>
                                                            <p className="mb-0" style={{ 
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word'
                                                            }}>
                                                                {roundDetails.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mb-3">
                                    <FileText size={48} className="text-muted" />
                                </div>
                                <h6 className="text-muted">No details available for this round</h6>
                                <p className="text-muted mb-0">
                                    Round details have not been configured yet.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer" style={{ 
                        borderTop: '1px solid #e5e7eb',
                        padding: '1rem 2rem'
                    }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => { enableBodyScroll(); onClose(); }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupInterviewRoundDetails;
