import React, { useState, useEffect } from 'react';
import CreateAssessmentModal from './CreateAssessmentModal';
import { showInfo, showSuccess, showError, showConfirmation } from '../../../../../utils/popupNotification';
import './mobile-text-fix.css';
import '../../../../../assessment-title-hide.css';

function CreateAssessmentPage() {
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
            const response = await fetch('/api/employer/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(assessmentData)
            });
            if (response.ok) {
                setShowModal(false);
                fetchAssessments();
            }
        } catch (error) {
            console.error('Error creating assessment:', error);
        }
    };

    return (
        <>
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
                                                End-to-end encryption keeps your assessments secure between you and the candidates you choose.
                                            </p>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-eye-slash" style={{ width: '16px', color: '#059669' }} />
                                                    <span>Not even Tale-Global can read or copy the content</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-user-secret" style={{ width: '16px', color: '#059669' }} />
                                                    <span>No one outside can read, copy, or share them</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-check-square-o" style={{ width: '16px', color: '#059669' }} />
                                                    <span>Questions and answers are protected</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-file-text-o" style={{ width: '16px', color: '#059669' }} />
                                                    <span>Assessment content is encrypted</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-shield" style={{ width: '16px', color: '#059669' }} />
                                                    <span>Candidate responses are secure</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-lock" style={{ width: '16px', color: '#059669' }} />
                                                    <span>Results and evaluations are private</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className="fa fa-database" style={{ width: '16px', color: '#059669' }} />
                                                    <span>All assessment data is protected</span>
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
                                showInfo(securityMessage, 8000);
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
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search assessments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row">
                        {filteredAssessments.map((assessment) => (
                            <div className="col-lg-6" key={assessment._id}>
                                <div className="card mb-4 assessment-card" style={{overflow: 'hidden'}}>
                                    <div className="card-body" style={{position: 'relative'}}>
                                        <style>{`.assessment-card .card-body > *:first-child { display: none !important; }`}</style>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <p className="text-muted">{assessment.designation}</p>
                                                <p className="card-text">{assessment.description}</p>
                                                <div className="d-flex justify-content-between">
                                                    <small>Questions: {assessment.questions?.length || 0}</small>
                                                    <small>Time: {assessment.timer || 0} min</small>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
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
        </>
    );
}

export default CreateAssessmentPage;