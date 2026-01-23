import React, { useState, useEffect } from 'react';
import CreateAssessmentModal from './CreateAssessmentModal';
import { showInfo } from '../../../../../utils/popupNotification';

function CreateAssessmentPage() {
    const [assessments, setAssessments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssessments = assessments.filter(assessment => 
        assessment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchAssessments = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch('https://taleglobal.net/api/employer/assessments', {
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

    const handleCreateAssessment = async (assessmentData) => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch('https://taleglobal.net/api/employer/assessments', {
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
                        <h4 className="panel-tittle m-a0">
                            <i className="fa fa-plus-circle" /> Assessment Management
                        </h4>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                const securityMessage = (
                                    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                                        <h6 style={{ marginBottom: '15px', color: '#2563eb', textAlign: 'center' }}>End-to-end encryption keeps your assessments secure between you and the candidates you choose</h6>
                                        <div style={{ fontSize: '14px' }}>
                                            <div style={{ marginBottom: '8px' }}>🚫 Not even Tale-Global can read or copy the content</div>
                                            <div style={{ marginBottom: '8px' }}>👥 No one outside can read, copy, or share them</div>
                                            <div style={{ marginBottom: '8px' }}>❓ Questions and answers are protected</div>
                                            <div style={{ marginBottom: '8px' }}>🔐 Assessment content is encrypted</div>
                                            <div style={{ marginBottom: '8px' }}>🛡️ Candidate responses are secure</div>
                                            <div style={{ marginBottom: '8px' }}>📊 Results and evaluations are private</div>
                                            <div style={{ marginBottom: '8px' }}>🔒 All assessment data is protected</div>
                                            <div style={{ marginBottom: '8px' }}>✅ Agree to terms and conditions or not</div>
                                            <div style={{ marginBottom: '8px' }}>📋 Agree to terms and conditions or not</div>
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
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h6 className="card-title">{assessment.title}</h6>
                                        <p className="text-muted">{assessment.designation}</p>
                                        <p className="card-text">{assessment.description}</p>
                                        <div className="d-flex justify-content-between">
                                            <small>Questions: {assessment.questions?.length || 0}</small>
                                            <small>Time: {assessment.timer || 0} min</small>
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
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateAssessment}
                />
            )}
        </>
    );
}

export default CreateAssessmentPage;