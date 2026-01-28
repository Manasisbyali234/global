import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InterviewProcessManager from "./InterviewProcessManager";
import './emp-candidate-review.css';
import './emp-candidate-review-active-button-fix.css';
import './emp-candidate-review-back-button-mobile-fix.css';
import './emp-candidate-review-profile-card-mobile-fix.css';
import './emp-candidate-review-button-size-fix.css';
import { showSuccess, showError } from '../../../../utils/popupNotification';

function EmpCandidateReviewPage() {
    const navigate = useNavigate();
    const { applicationId } = useParams();
    const [application, setApplication] = useState(null);
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('review');
    const [interviewProcesses, setInterviewProcesses] = useState([]);
    const [processRemarks, setProcessRemarks] = useState({});
    const [remarks, setRemarks] = useState('');
    const [isSelected, setIsSelected] = useState(false);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' });
    const [assessmentModal, setAssessmentModal] = useState({ isOpen: false, data: null });
    const [capturesModal, setCapturesModal] = useState({ isOpen: false, captures: [] });
    const autoSaveTimeoutRef = useRef(null);

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    useEffect(() => {
        if (interviewProcesses.length === 0) return;
        
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveInterviewProcesses();
        }, 1000);
        
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [interviewProcesses, processRemarks, applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setApplication(data.application);
                setCandidate(data.application.candidateId);
                
                if (data.application.employerRemarks) {
                    setRemarks(data.application.employerRemarks);
                }
                if (data.application.isSelectedForProcess) {
                    setIsSelected(data.application.isSelectedForProcess);
                }
                
                // Load interview processes
                let processes = [];
                if (data.application.interviewProcess?.stages && data.application.interviewProcess.stages.length > 0) {
                    processes = data.application.interviewProcess.stages
                        .filter(stage => stage && stage.stageName && stage.stageType)
                        .map(stage => ({
                            id: stage._id || `${stage.stageType}-${stage.stageOrder}`,
                            name: stage.stageName,
                            type: stage.stageType,
                            status: stage.status,
                            isCompleted: stage.status === 'completed' || stage.status === 'passed',
                            result: stage.assessmentResult
                        }));
                } else if (data.application.interviewProcesses && data.application.interviewProcesses.length > 0) {
                    processes = data.application.interviewProcesses.filter(p => p && p.name && p.type).map(p => ({
                        id: p.id,
                        name: p.name,
                        type: p.type,
                        status: p.status,
                        isCompleted: p.isCompleted,
                        result: p.result
                    }));
                }
                
                setInterviewProcesses(processes);

                const initialRemarks = {};
                if (data.application.processRemarks) {
                    const remarksData = data.application.processRemarks;
                    if (typeof remarksData === 'object') {
                        Object.keys(remarksData).forEach(key => {
                            initialRemarks[key] = remarksData[key] || '';
                        });
                    }
                }
                setProcessRemarks(initialRemarks);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const downloadDocument = (fileData, fileName) => {
        if (!fileData) return;
        
        if (fileData.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = fileData;
            link.download = fileName || 'document';
            link.click();
        } else {
            const link = document.createElement('a');
            link.href = `http://localhost:5000/${fileData}`;
            link.download = fileName || 'document';
            link.click();
        }
    };

    const viewDocument = (fileData, title = 'Document') => {
        if (!fileData) return;
        
        let documentUrl;
        if (fileData.startsWith('data:')) {
            const byteCharacters = atob(fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
            const blob = new Blob([byteArray], { type: mimeType });
            documentUrl = URL.createObjectURL(blob);
        } else {
            documentUrl = `http://localhost:5000/${fileData}`;
        }
        
        setDocumentModal({ isOpen: true, url: documentUrl, title });
    };

    const closeDocumentModal = () => {
        if (documentModal.url && documentModal.url.startsWith('blob:')) {
            URL.revokeObjectURL(documentModal.url);
        }
        setDocumentModal({ isOpen: false, url: '', title: '' });
    };

    const saveReview = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const cleanedProcesses = interviewProcesses.map(p => ({
                id: String(p.id),
                name: String(p.name),
                type: String(p.type),
                status: String(p.status),
                isCompleted: Boolean(p.isCompleted),
                result: p.result || null
            }));
            
            const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interviewRounds,
                    remarks,
                    isSelected,
                    interviewProcesses: cleanedProcesses,
                    processRemarks: processRemarks
                })
            });
            
            if (response.ok) {
                showSuccess('Review saved successfully!');
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Failed to save review');
            }
        } catch (error) {
            console.error('Error saving review:', error);
            showError('Network error while saving review.');
        }
    };

    const saveInterviewProcesses = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const cleanedProcesses = interviewProcesses.map(p => ({
                id: String(p.id),
                name: String(p.name),
                type: String(p.type),
                status: String(p.status),
                isCompleted: Boolean(p.isCompleted),
                result: p.result || null
            }));
            
            await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interviewProcesses: cleanedProcesses,
                    processRemarks: processRemarks
                })
            });
        } catch (error) {
            console.error('Error saving interview processes:', error);
        }
    };

    const updateApplicationStatus = async (status) => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            
            if (response.ok) {
                showSuccess(`Status updated to ${status.replace('_', ' ')}`);
                setApplication(prev => ({ ...prev, status }));
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Network error while updating status.');
        }
    };

    const allProcessesCompleted = () => {
        if (!application || !application.jobId) return false;
        
        const requiredRoundsCount = application.jobId.interviewRoundOrder?.length || 0;
        
        // If there are required rounds, we must have at least that many processes started
        if (requiredRoundsCount > 0 && interviewProcesses.length < requiredRoundsCount) {
            return false;
        }
        
        // If no processes have been started and none are required, allow actions
        if (interviewProcesses.length === 0) {
            return requiredRoundsCount === 0;
        }
        
        // All started processes must be completed
        return interviewProcesses.every(p => p.isCompleted);
    };

    const updateProcessCompletion = (processId, isCompleted) => {
        setInterviewProcesses(prev => 
            prev.map(p => p.id === processId ? { ...p, isCompleted } : p)
        );
    };

    const updateProcessRemark = (processId, remark) => {
        setProcessRemarks(prev => ({ ...prev, [processId]: remark }));
    };

    const educationLevelLabels = {
        '10th_pass': '10th Pass / SSLC',
        '12th_pass': '12th Pass / PUC / Higher Secondary',
        'diploma_general': 'Diploma (General)',
        'iti_trade': 'ITI / Trade Certification',
        'polytechnic_diploma': 'Polytechnic Diploma',
        'vocational_training': 'Vocational Training',
        'certification_courses': 'Certification Courses',
        'apprenticeship': 'Apprenticeship Programs',
        'be': 'B.E. (Bachelor of Engineering)',
        'btech': 'B.Tech (Bachelor of Technology)',
        'bsc': 'B.Sc (Bachelor of Science)',
        'bca': 'BCA (Bachelor of Computer Applications)',
        'bba': 'BBA (Bachelor of Business Administration)',
        'bcom': 'B.Com (Bachelor of Commerce)',
        'ba': 'BA (Bachelor of Arts)',
        'bba_llb': 'BBA-LLB',
        'bsc_nursing': 'B.Sc Nursing',
        'bpharm': 'Bachelor of Pharmacy (B.Pharm)',
        'bds': 'BDS (Dentistry)',
        'mbbs': 'MBBS (Medicine)',
        'bams': 'BAMS (Ayurvedic Medicine)',
        'bhms': 'BHMS (Homeopathy)',
        'bums': 'BUMS (Unani Medicine)',
        'bpt': 'BPT (Physiotherapy)',
        'bot': 'BOT (Occupational Therapy)',
        'bvsc': 'B.V.Sc (Veterinary Science)',
        'barch': 'B.Arch (Architecture)',
        'bfa': 'BFA (Fine Arts)',
        'bsw': 'BSW (Social Work)',
        'bhm': 'BHM (Hotel Management)',
        'bttm': 'BTTM (Travel & Tourism)',
        'bba_it': 'BBA (IT Management)',
        'bsc_it': 'B.Sc (IT)',
        'bsc_cs': 'B.Sc (Computer Science)',
        'bsc_data_science': 'B.Sc (Data Science / AI / ML)',
        'btech_ai': 'B.Tech (AI / Data Science / ML / Cybersecurity)',
        'be_specializations': 'B.E (Specializations)',
        'bca_cloud': 'BCA (Cloud Computing)',
        'bca_data_analytics': 'BCA (Data Analytics)',
        'bcom_finance': 'B.Com (Finance)',
        'bcom_banking': 'B.Com (Banking & Insurance)',
        'bba_finance': 'BBA (Finance)',
        'bba_marketing': 'BBA (Marketing)',
        'bba_hr': 'BBA (HR)',
        'bba_hospital': 'BBA (Hospital Administration)',
        'bba_retail': 'BBA (Retail Management)',
        'bba_entrepreneurship': 'BBA (Entrepreneurship)',
        'bsc_biology': 'B.Sc (Biology)',
        'bsc_biotech': 'B.Sc (Biotechnology)',
        'bsc_microbiology': 'B.Sc (Microbiology)',
        'bsc_genetics': 'B.Sc (Genetics)',
        'bsc_biochemistry': 'B.Sc (Biochemistry)',
        'clinical_research': 'Clinical Research Certification',
        'paramedical': 'Paramedical Courses',
        'llb': 'LLB (Bachelor of Law)',
        'aviation': 'Aviation Courses',
        'me': 'M.E. (Master of Engineering)',
        'mtech': 'M.Tech (Master of Technology)',
        'mba': 'MBA (Master of Business Administration)',
        'mba_finance': 'MBA (Finance)',
        'mba_marketing': 'MBA (Marketing)',
        'mba_hr': 'MBA (HR)',
        'mba_operations': 'MBA (Operations)',
        'mba_systems': 'MBA (Systems / IT)',
        'msc': 'M.Sc (Master of Science)',
        'mca': 'MCA (Master of Computer Applications)',
        'mcom': 'M.Com (Master of Commerce)',
        'ma': 'MA (Master of Arts)',
        'mph': 'MPH (Public Health)',
        'ms': 'MS (Master of Surgery)',
        'md': 'MD (Doctor of Medicine)',
        'mds': 'MDS (Master of Dental Surgery)',
        'mpt': 'MPT (Master of Physiotherapy)',
        'phd': 'PhD (Doctorate)',
        'doctoral_research': 'Doctoral Research Fellow',
        'post_doctoral': 'Post-Doctoral Programs'
    };

    const getEducationLevelLabel = (edu, index) => {
        if (edu.educationLevel && educationLevelLabels[edu.educationLevel]) {
            return educationLevelLabels[edu.educationLevel];
        }
        if (edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) return '10th Standard';
            if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('puc')) return '12th Standard';
            return edu.degreeName;
        }
        return ['10th Standard', '12th Standard', 'Course'][index] || 'Education';
    };

    const getEducationPriority = (edu) => {
        const level = edu.educationLevel;
        if (level === '10th_pass') return 1;
        if (level === '12th_pass') return 2;
        
        const mastersLevels = ['me', 'mtech', 'mba', 'mba_finance', 'mba_marketing', 'mba_hr', 'mba_operations', 'mba_systems', 'msc', 'mca', 'mcom', 'ma', 'mph', 'ms', 'md', 'mds', 'mpt'];
        const phdLevels = ['phd', 'doctoral_research', 'post_doctoral'];
        
        if (mastersLevels.includes(level)) return 4;
        if (phdLevels.includes(level)) return 5;
        
        if (!level && edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) return 1;
            if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('intermediate') || degreeLower.includes('puc')) return 2;
        }
        
        return 3;
    };

    if (loading) {
        return (
            <div className="candidate-review-loading">
                <div className="spinner"></div>
                <p>Loading application details...</p>
            </div>
        );
    }

    if (!application || !candidate) {
        return (
            <div className="candidate-review-error">
                <h3>Candidate or Application not found</h3>
                <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="candidate-review-container">
            <div className="candidate-review-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Applications</span>
                </button>
                <div className="header-title">
                    <h2>Candidate Application Review</h2>
                    <p>Evaluating <strong>{candidate.name}</strong> for <strong>{application.jobId?.title}</strong></p>
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {candidate.profilePicture || candidate.profileImage ? (
                            <img src={candidate.profilePicture || candidate.profileImage} alt={candidate.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        <div className={`status-indicator ${application.status === 'hired' ? 'active' : ''}`}></div>
                    </div>
                    <div className="profile-info">
                        <h3>{candidate.name}</h3>
                        <p className="email">{candidate.email}</p>
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="label">Applied Date</span>
                                <span className="value">{formatDate(application.createdAt)}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Application Status</span>
                                <span className={`value status ${application.status}`}>
                                    {application.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="stat">
                                <span className="label">Profile Status</span>
                                <span className={`value status ${candidate.isProfileComplete ? 'complete' : 'incomplete'}`}>
                                    {candidate.isProfileComplete ? 'Complete' : `Incomplete ${candidate.profileCompletionPercentage || 0}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tab-navigation">
                <button className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                    <i className="fas fa-tasks"></i>
                    Stages & Review
                </button>
                <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                    <i className="fas fa-user"></i>
                    Personal Info
                </button>
                <button className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
                    <i className="fas fa-graduation-cap"></i>
                    Education
                </button>
                <button className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`} onClick={() => setActiveTab('employment')}>
                    <i className="fas fa-briefcase"></i>
                    Experience
                </button>
                <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
                    <i className="fas fa-cogs"></i>
                    Skills & Summary
                </button>
                <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                    <i className="fas fa-file-alt"></i>
                    Documents
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'review' && (
                    <div className="tab-panel review-panel">
                        <div className="review-grid">
                            <div className="review-main">
                                <div className="interview-manager-container">
                                    <InterviewProcessManager 
                                        applicationId={applicationId}
                                        onSave={(process) => {
                                            if (process && process.stages) {
                                                const processes = process.stages.map(stage => ({
                                                    id: stage._id || `${stage.stageType}-${stage.stageOrder}`,
                                                    name: stage.stageName,
                                                    type: stage.stageType,
                                                    status: stage.status,
                                                    isCompleted: stage.status === 'completed' || stage.status === 'passed',
                                                    result: stage.assessmentResult
                                                }));
                                                setInterviewProcesses(processes);
                                            }
                                        }}
                                    />
                                </div>
                                
                                {interviewProcesses.length > 0 && (
                                    <div className="section-card mt-4">
                                        <div className="section-header">
                                            <h4><i className="fas fa-tasks"></i> Manual Stage Tracking</h4>
                                        </div>
                                        <div className="section-body">
                                            <div className="processes-grid">
                                                {interviewProcesses.map((process) => (
                                                    <div key={process.id} className={`process-item ${process.isCompleted ? 'completed' : ''}`}>
                                                        <div className="process-header">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={process.isCompleted}
                                                                onChange={(e) => updateProcessCompletion(process.id, e.target.checked)}
                                                            />
                                                            <h6>{process.name}</h6>
                                                            <span className={`status-badge ${process.status || 'pending'}`}>
                                                                {(process.status || 'pending').replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="process-controls">
                                                            <select 
                                                                value={process.status || 'pending'}
                                                                onChange={(e) => {
                                                                    const newStatus = e.target.value;
                                                                    setInterviewProcesses(prev => 
                                                                        prev.map(p => p.id === process.id ? { ...p, status: newStatus } : p)
                                                                    );
                                                                }}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="shortlisted">Shortlisted</option>
                                                                <option value="under_review">Under Review</option>
                                                                <option value="selected">Selected</option>
                                                                <option value="rejected">Rejected</option>
                                                            </select>
                                                            <textarea 
                                                                placeholder="Stage remarks..."
                                                                value={processRemarks[process.id] || ''}
                                                                onChange={(e) => updateProcessRemark(process.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {application.assessmentAttempt && (
                                    <div className="section-card mt-4">
                                        <div className="section-header">
                                            <h4><i className="fas fa-award"></i> Assessment Results</h4>
                                        </div>
                                        <div className="section-body">
                                            <div className="assessment-stats">
                                                <div className="stat-box">
                                                    <span className="label">Score</span>
                                                    <span className="value">{application.assessmentAttempt.score} / {application.assessmentAttempt.totalMarks}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="label">Percentage</span>
                                                    <span className="value">{application.assessmentAttempt.percentage?.toFixed(1)}%</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="label">Result</span>
                                                    <span className={`value result ${application.assessmentAttempt.result?.toLowerCase()}`}>
                                                        {application.assessmentAttempt.result}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="assessment-actions mt-3">
                                                <button 
                                                    className="btn-view-answers"
                                                    onClick={() => {
                                                        setAssessmentModal({ isOpen: true, data: application.assessmentAttempt });
                                                    }}
                                                >
                                                    <i className="fas fa-file-alt"></i> View Answers
                                                </button>
                                                <button 
                                                    className="btn-view-captures"
                                                    onClick={() => {
                                                        const captures = application.assessmentAttempt.captures || application.assessmentAttempt.capturedImages || [];
                                                        setCapturesModal({ isOpen: true, captures });
                                                    }}
                                                >
                                                    <i className="fas fa-camera"></i> View Captures
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="review-sidebar">
                                <div className="section-card">
                                    <div className="section-header">
                                        <h4>Overall Actions</h4>
                                    </div>
                                    <div className="section-body">
                                        <div className="remarks-area">
                                            <label>Employer Remarks</label>
                                            <textarea 
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Enter overall feedback..."
                                            />
                                            <button onClick={saveReview}>
                                                <i className="fas fa-save"></i> Save Remarks
                                            </button>
                                        </div>
                                        <div className="action-buttons">
                                            {allProcessesCompleted() && (
                                                <>
                                                    <button 
                                                        className={`${application.status === 'shortlisted' ? 'active shortlisted-btn' : ''}`}
                                                        onClick={() => updateApplicationStatus('shortlisted')}
                                                    >
                                                        <i className="fas fa-check"></i> Shortlist
                                                    </button>
                                                    <button 
                                                        className={`${application.status === 'hired' ? 'active' : ''}`}
                                                        onClick={() => updateApplicationStatus('hired')}
                                                    >
                                                        <i className="fas fa-briefcase"></i> Mark as Hired
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                className={`${application.status === 'offer_sent' ? 'active' : ''}`}
                                                onClick={() => updateApplicationStatus('offer_sent')}
                                                disabled={!allProcessesCompleted()}
                                            >
                                                <i className="fas fa-envelope"></i> Offer Letter Sent
                                            </button>
                                            {application.status !== 'shortlisted' && (
                                                <button 
                                                    className={`${application.status === 'rejected' ? 'active' : ''}`}
                                                    onClick={() => updateApplicationStatus('rejected')}
                                                >
                                                    <i className="fas fa-times"></i> Reject
                                                </button>
                                            )}
                                        </div>
                                        {!allProcessesCompleted() && (
                                            <p className="warning-text">Complete all interview stages to enable actions.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'personal' && (
                    <div className="tab-panel personal-info">
                        <div className="info-section">
                            <div className="info-rows">
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-user"></i></div>
                                        <div className="field-content">
                                            <label>Full Name</label>
                                            <span>
                                                {candidate.firstName ? 
                                                    `${candidate.firstName} ${candidate.middleName ? candidate.middleName + ' ' : ''}${candidate.lastName || ''}` : 
                                                    (candidate.name || 'Not provided')
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-envelope"></i></div>
                                        <div className="field-content">
                                            <label>Email Address</label>
                                            <span>{candidate.email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-phone"></i></div>
                                        <div className="field-content">
                                            <label>Phone Number</label>
                                            <span>{candidate.phone || candidate.mobileNumber || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-calendar-alt"></i></div>
                                        <div className="field-content">
                                            <label>Date of Birth</label>
                                            <span>{formatDate(candidate.dateOfBirth)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-venus-mars"></i></div>
                                        <div className="field-content">
                                            <label>Gender</label>
                                            <span>{candidate.gender || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-clock"></i></div>
                                        <div className="field-content">
                                            <label>Registration Date</label>
                                            <span>{formatDate(candidate.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-male"></i></div>
                                        <div className="field-content">
                                            <label>Father's/Husband's Name</label>
                                            <span>{candidate.fatherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-female"></i></div>
                                        <div className="field-content">
                                            <label>Mother's Name</label>
                                            <span>{candidate.motherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map-marker-alt"></i></div>
                                        <div className="field-content">
                                            <label>Location</label>
                                            <span>{candidate.location || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map-pin"></i></div>
                                        <div className="field-content">
                                            <label>Pincode</label>
                                            <span>{candidate.pincode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map"></i></div>
                                        <div className="field-content">
                                            <label>State Code</label>
                                            <span>{candidate.stateCode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon"><i className="fas fa-home"></i></div>
                                        <div className="field-content">
                                            <label>Residential Address</label>
                                            <span>{candidate.residentialAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon"><i className="fas fa-building"></i></div>
                                        <div className="field-content">
                                            <label>Permanent Address</label>
                                            <span>{candidate.permanentAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon"><i className="fas fa-envelope-open-text"></i></div>
                                        <div className="field-content">
                                            <label>Correspondence Address</label>
                                            <span>{candidate.correspondenceAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="tab-panel education-info">
                        {!candidate.education || candidate.education.length === 0 ? (
                            <div className="no-data-content">
                                <i className="fas fa-graduation-cap"></i>
                                <h5>No Education Information</h5>
                            </div>
                        ) : (
                            <div className="education-timeline">
                                {[...candidate.education]
                                    .sort((a, b) => getEducationPriority(a) - getEducationPriority(b))
                                    .map((edu, index) => {
                                        const educationLevel = getEducationLevelLabel(edu, index);
                                    return (
                                        <div key={index} className="education-item">
                                            <div className="education-icon">
                                                <i className="fas fa-graduation-cap"></i>
                                            </div>
                                            <div className="education-content">
                                                <div className="education-header">
                                                    <h4>{educationLevel}</h4>
                                                    <span className="year">{edu.passYear || 'N/A'}</span>
                                                </div>
                                                <div className="education-details">
                                                    {edu.specialization && educationLevel !== '10th Pass / SSLC' && (
                                                        <div className="detail-item">
                                                            <label>Course:</label>
                                                            <span>{edu.specialization}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <label>Institution:</label>
                                                        <span>{edu.degreeName || 'Not provided'}</span>
                                                    </div>
                                                    {edu.collegeName && (
                                                        <div className="detail-item">
                                                            <label>Board/University:</label>
                                                            <span>{edu.collegeName}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <label>Score:</label>
                                                        <span>
                                                            {edu.scoreValue || edu.percentage || 'Not provided'}
                                                            {edu.scoreType === 'percentage' || (!edu.scoreType && edu.percentage) ? '%' : ''}
                                                        </span>
                                                    </div>
                                                    {edu.marksheet && (
                                                        <div className="document-actions mt-2">
                                                            <button className="action-btn view" onClick={() => viewDocument(edu.marksheet, `${educationLevel} Marksheet`)}>
                                                                <i className="fas fa-eye"></i> View Marksheet
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'employment' && (
                    <div className="tab-panel employment-info">
                        <div className="section-header">
                            <h4><i className="fas fa-briefcase"></i> Employment History</h4>
                        </div>
                        
                        <div className="experience-overview-header">
                            {candidate.totalExperience && (
                                <div className="experience-badge-container">
                                    <i className="fas fa-hourglass-half"></i>
                                    <p>
                                        Total Experience: <span>{candidate.totalExperience}</span>
                                    </p>
                                </div>
                            )}

                            <div className="experience-quick-stats">
                                {/* Current Professional Details added under Experience */}
                                <div className="professional-details-section">
                                    <div className="sub-section-header">
                                        <i className="fas fa-building"></i>
                                        <h5>Current Professional Details</h5>
                                    </div>
                                    <div className="info-grid-simple">
                                        <div className="info-item-simple">
                                            <label>Current Company:</label>
                                            <span>{candidate.currentCompany || 'Not provided'}</span>
                                        </div>
                                        <div className="info-item-simple">
                                            <label>Current CTC:</label>
                                            <span>{candidate.currentCTC ? `₹ ${candidate.currentCTC} LPA` : 'Not provided'}</span>
                                        </div>
                                        <div className="info-item-simple">
                                            <label>Expected CTC:</label>
                                            <span>{candidate.expectedCTC ? `₹ ${candidate.expectedCTC} LPA` : 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferred Locations added under Experience */}
                                <div className="locations-section">
                                    <div className="sub-section-header">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <h5>Preferred Locations</h5>
                                    </div>
                                    <div className="locations-tags-container">
                                        {candidate.preferredLocations && candidate.preferredLocations.length > 0 ? (
                                            candidate.preferredLocations.map((loc, index) => (
                                                <div key={index} className="location-tag-simple">
                                                    <i className="fas fa-map-pin"></i>
                                                    <span>{loc}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-data-text">No preferred locations provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="tab-panel skills-info">
                        <div className="section-header">
                            <h4><i className="fas fa-cogs"></i> Skills & Professional Summary</h4>
                        </div>

                        {candidate.skills && candidate.skills.length > 0 && (
                            <div className="skills-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-tools"></i>
                                    <h5>Technical Skills</h5>
                                </div>
                                <div className="skills-grid">
                                    {candidate.skills.map((skill, index) => (
                                        <div key={index} className="skill-tag">
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {candidate.resumeHeadline && (
                            <div className="summary-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-newspaper"></i>
                                    <h5>Resume Headline</h5>
                                </div>
                                <div className="summary-content">
                                    <p>{candidate.resumeHeadline}</p>
                                </div>
                            </div>
                        )}

                        {candidate.profileSummary && (
                            <div className="summary-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-user-edit"></i>
                                    <h5>Profile Summary</h5>
                                </div>
                                <div className="summary-content">
                                    <p>{candidate.profileSummary}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="tab-panel documents-info">
                        <div className="documents-grid">
                            {candidate.resume && (
                                <div className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>Resume / CV</h5>
                                        <p>Candidate's complete resume</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(candidate.resume, 'Resume')}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button className="action-btn download" onClick={() => downloadDocument(candidate.resume, 'resume.pdf')}>
                                            <i className="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            )}

                            {candidate.experienceLetter && (
                                <div className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>Experience Letter</h5>
                                        <p>Previous employment proof</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(candidate.experienceLetter, 'Experience Letter')}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button className="action-btn download" onClick={() => downloadDocument(candidate.experienceLetter, 'experience_letter.pdf')}>
                                            <i className="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            )}

                            {candidate.education?.map((edu, index) => edu.marksheet && (
                                <div key={index} className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-certificate"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>{getEducationLevelLabel(edu, index)} Marksheet</h5>
                                        <p>Academic certificate</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(edu.marksheet, `${getEducationLevelLabel(edu, index)} Marksheet`)}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button className="action-btn download" onClick={() => downloadDocument(edu.marksheet, `marksheet_${index}.pdf`)}>
                                            <i className="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Captures Modal */}
            {capturesModal.isOpen && (
                <div className="document-modal-overlay" onClick={() => setCapturesModal({ isOpen: false, captures: [] })}>
                    <div className="captures-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Assessment Captures</h3>
                            <button className="modal-btn close" onClick={() => setCapturesModal({ isOpen: false, captures: [] })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="captures-modal-body">
                            {capturesModal.captures.length > 0 ? (
                                <div className="captures-grid">
                                    {capturesModal.captures.map((capture, index) => (
                                        <div key={index} className="capture-item">
                                            <img 
                                                src={capture.startsWith('data:') ? capture : `http://localhost:5000/${capture}`} 
                                                alt={`Capture ${index + 1}`}
                                                onClick={() => viewDocument(capture, `Capture ${index + 1}`)}
                                            />
                                            <p>Capture {index + 1}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-captures">
                                    <i className="fas fa-camera"></i>
                                    <p>No captures available for this assessment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assessment Results Modal */}
            {assessmentModal.isOpen && (
                <div className="document-modal-overlay" onClick={() => setAssessmentModal({ isOpen: false, data: null })}>
                    <div className="assessment-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Assessment Results</h3>
                            <button className="modal-btn close" onClick={() => setAssessmentModal({ isOpen: false, data: null })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="assessment-modal-body">
                            {assessmentModal.data && (
                                <div className="assessment-details">
                                    <div className="assessment-summary">
                                        <div className="summary-stats">
                                            <div className="stat">
                                                <span className="label">Score</span>
                                                <span className="value">{assessmentModal.data.score} / {assessmentModal.data.totalMarks}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="label">Percentage</span>
                                                <span className="value">{assessmentModal.data.percentage?.toFixed(1)}%</span>
                                            </div>
                                            <div className="stat">
                                                <span className="label">Result</span>
                                                <span className={`value result ${assessmentModal.data.result?.toLowerCase()}`}>
                                                    {assessmentModal.data.result}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {assessmentModal.data.answers && (
                                        <div className="answers-section">
                                            <h4>Answers</h4>
                                            <div className="answers-list">
                                                {assessmentModal.data.answers.map((answer, index) => (
                                                    <div key={index} className="answer-item">
                                                        <div className="question">
                                                            <strong>Q{index + 1}:</strong> {answer.question}
                                                        </div>
                                                        <div className="answer">
                                                            <strong>Answer:</strong> {answer.selectedAnswer || answer.answer}
                                                        </div>
                                                        <div className="correct">
                                                            <strong>Correct:</strong> 
                                                            <span className={answer.isCorrect ? 'correct' : 'incorrect'}>
                                                                {answer.isCorrect ? 'Yes' : 'No'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {documentModal.isOpen && (
                <div className="document-modal-overlay" onClick={closeDocumentModal}>
                    <div className="document-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>{documentModal.title}</h3>
                            <div className="modal-controls">
                                <button className="modal-btn download" onClick={() => downloadDocument(documentModal.url, `${documentModal.title.replace(/\s+/g, '_').toLowerCase()}.pdf`)}>
                                    <i className="fas fa-download"></i>
                                </button>
                                <button className="modal-btn close" onClick={closeDocumentModal}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="document-modal-body">
                            <iframe src={documentModal.url} title={documentModal.title} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmpCandidateReviewPage;
