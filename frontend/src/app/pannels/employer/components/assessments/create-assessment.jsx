import React, { useState, useEffect } from 'react';
import CreateAssessmentModal from './CreateAssessmentModal';
import { showPopup, showSuccess, showError, showConfirmation } from '../../../../../utils/popupNotification';
import './create-assessment.css';
import './mobile-text-fix.css';
import '../../../../../assessment-title-hide.css';

function CreateAssessmentPage() {
    const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const [assessments, setAssessments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssessments = assessments.filter(assessment => 
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchAssessments = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch('/api/employer/assessments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAssessments(data.assessments || []);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const handleDeleteAssessment = async (id) => {
        showConfirmation(
            'Are you sure you want to delete this assessment?',
            async () => {
                try {
                    const token = localStorage.getItem('employerToken');
                    const response = await fetch(`/api/employer/assessments/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        setAssessments(assessments.filter(a => a._id !== id));
                        showSuccess('Assessment deleted successfully');
                    } else {
                        showError('Failed to delete assessment');
                    }
                } catch (error) {
                    showError('Failed to delete assessment');
                }
            },
            () => {},
            'warning'
        );
    };

    const handleEditAssessment = (assessment) => {
        setEditingAssessment(assessment);
        setShowModal(true);
    };

    const handleCreateAssessment = async (assessmentData) => {
        try {
            const token = localStorage.getItem('employerToken');
            const isEditing = !!assessmentData.id;
            const url = isEditing ? `/api/employer/assessments/${assessmentData.id}` : '/api/employer/assessments';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(assessmentData)
            });
            
            if (response.status === 413) {
                showError('Assessment data is too large. This usually happens when images are too big. Please use smaller images (max 2MB each recommended).');
                return;
            }
            
            if (response.ok) {
                setShowModal(false);
                setEditingAssessment(null);
                fetchAssessments();
                showSuccess(`Assessment ${isEditing ? 'updated' : 'created'} successfully`);
            } else {
                const data = await response.json();
                showError(data.message || `Failed to ${isEditing ? 'update' : 'create'} assessment`);
            }
        } catch (error) {
            console.error(`Error ${assessmentData.id ? 'updating' : 'creating'} assessment:`, error);
            showError(`Failed to ${assessmentData.id ? 'update' : 'create'} assessment. Please try again.`);
        }
    };

    return (
        <div className="create-assessment-page">
            <div className="wt-admin-right-page-header clearfix">
                <h2>Create Assessment</h2>
                <div className="breadcrumbs">
                    <a href="#">Home</a>
                    <a href="#">Dashboard</a>
                    <span>Create Assessment</span>
                </div>
            </div>

            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="panel-title m-a0">
                            <i className="fa fa-plus-circle" /> Assessment Management
                        </h4>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                const securityMessage = (
                                    <div style={{ textAlign: 'left', lineHeight: '1.6', padding: '5px' }}>
                                        <h5 style={{ marginBottom: '15px', color: '#2563eb', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <i className="fa fa-shield" style={{ fontSize: '1.2em' }} />
                                            Security & Privacy Assurance
                                        </h5>
                                        <div style={{ fontSize: '14px', color: '#475569' }}>
                                            <p style={{ fontWeight: '500', marginBottom: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fa fa-lock" style={{ color: '#2563eb' }} />
                                                End-to-End encryption ensures your assessments remain completely private and secure.
                                            </p>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-eye-slash" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* Not even Tale-Global can read or copy the content</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-user" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* Only you can access and manage your assessment content.</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-user-secret" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* No one outside the platform can read, copy, or share your questions or answers.</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-check-square-o" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* All assessment content is securely encrypted.</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-file-text-o" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* Candidate responses are protected and confidential.</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-shield" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* Results and evaluations are accessible only to authorized users.</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-lock" style={{ width: '16px', color: '#059669' }} />
                                                    <span>* All assessment data is safely stored and protected.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            marginTop: '15px', 
                                            paddingTop: '12px', 
                                            borderTop: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fa fa-file-text" style={{ color: '#64748b' }} />
                                                <label htmlFor="terms-check" style={{ margin: 0, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                                    Agree to terms and conditions or not
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '25px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                    <i className="fa fa-check-circle" style={{ color: '#059669' }} />
                                                    <span style={{ fontSize: '13px' }}>Yes</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                    <i className="fa fa-times-circle" style={{ color: '#dc2626' }} />
                                                    <span style={{ fontSize: '13px' }}>No</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                                showPopup(securityMessage, 'secure', 8000);
                                setShowModal(true);
                            }}
                        >
                            <i className="fa fa-plus" /> Create New Assessment
                        </button>
                    </div>
                </div>

                <div className="panel-body wt-panel-body p-a20">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="search-input-group">
                                <i className="fa fa-search search-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search assessments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {filteredAssessments.map((assessment) => (
                            <div className="col-lg-6" key={assessment._id}>
                                <div className="card mb-4 assessment-card" style={{overflow: 'hidden'}}>
                                    <div className="card-body" style={{position: 'relative'}}>
                                        <style>{`.assessment-card .card-body > *:first-child { display: none !important; }`}</style>
                                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                                            <div className="flex-grow-1 w-100">
                                                {String(assessment.status || '').toLowerCase() === 'draft' && (
                                                    <span
                                                        className="badge mb-2"
                                                        style={{
                                                            backgroundColor: '#fff3cd',
                                                            color: '#92400e',
                                                            border: '1px solid #f59e0b',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            letterSpacing: '0.04em',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        Draft
                                                    </span>
                                                )}
                                                {assessment.companyName && (
                                                    <h6 className="mb-1" style={{fontSize: '14px', fontWeight: '600', wordWrap: 'break-word', overflowWrap: 'break-word'}}>
                                                        <span style={{color: '#8B7355'}}>Company:</span> <span className="text-primary">{assessment.companyName}</span>
                                                    </h6>
                                                )}
                                                {assessment.designation && (
                                                    <h6 className="mb-1" style={{fontSize: '14px', fontWeight: '600', wordWrap: 'break-word', overflowWrap: 'break-word'}}>
                                                        <span style={{color: '#8B7355'}}>Designation:</span> <span className="text-primary">{assessment.designation}</span>
                                                    </h6>
                                                )}
                                                {assessment.title && (
                                                    <h6 className="text-primary mb-1" style={{fontSize: '14px', fontWeight: '600', wordWrap: 'break-word', overflowWrap: 'break-word'}}>
                                                        <span style={{color: '#8B7355'}}>Assessment Title:</span> {assessment.title}
                                                    </h6>
                                                )}
                                                <div
                                                    className="card-text mb-2 text-muted assessment-rich-text assessment-rich-text--compact"
                                                    style={{fontSize: '0.9rem', wordWrap: 'break-word', overflowWrap: 'break-word'}}
                                                    dangerouslySetInnerHTML={{ __html: assessment.description || stripHtml(assessment.description) }}
                                                />
                                                <div className="d-flex gap-3">
                                                    <small className="text-muted"><i className="fa fa-question-circle me-1"></i>Questions: {assessment.questions?.length || 0}</small>
                                                    <small className="text-muted"><i className="fa fa-clock me-1"></i>Time: {assessment.timer || 0} min</small>
                                                    <small className="text-muted"><i className="fa fa-check-circle me-1"></i>Passing: {assessment.passingPercentage || 60}%</small>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row flex-sm-column gap-2 mt-2 mt-sm-0">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleEditAssessment(assessment)}
                                                    title="Edit Assessment"
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteAssessment(assessment._id)}
                                                    title="Delete Assessment"
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <CreateAssessmentModal
                    onClose={() => {
                        setShowModal(false);
                        setEditingAssessment(null);
                    }}
                    onCreate={handleCreateAssessment}
                    editData={editingAssessment}
                />
            )}
        </div>
    );
}

export default CreateAssessmentPage;
