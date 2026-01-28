import { useEffect, useState } from "react";
import JobZImage from "../../../common/jobz-img";
import { useNavigate, useParams } from "react-router-dom";
import './admin-candidate-review.css';

function AdminCandidateReviewPage() {
    const navigate = useNavigate();
    const { candidateId } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' });

    useEffect(() => {
        fetchCandidateDetails();
    }, [candidateId]);

    const fetchCandidateDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/admin/candidates/${candidateId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setCandidate(data.candidate);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
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

    if (loading) {
        return (
            <div className="candidate-review-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="candidate-review-error">
                <div className="error-content">
                    <i className="fas fa-user-slash"></i>
                    <h3>Candidate not found</h3>
                    <p>The requested candidate could not be found.</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

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
        // 1. Check if educationLevel exists and has a mapping
        if (edu.educationLevel && educationLevelLabels[edu.educationLevel]) {
            return educationLevelLabels[edu.educationLevel];
        }

        // 2. Fallback to existing logic if educationLevel is missing or not mapped
        if (edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) {
                return '10th Standard';
            } else if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('intermediate') || degreeLower.includes('puc')) {
                return '12th Standard';
            } else {
                return edu.degreeName; // Return actual degree name if it's something else
            }
        }

        // 3. Last resort fallback to index-based
        const levels = ['10th Standard', '12th Standard', 'Course'];
        return levels[index] || 'Education';
    };

    const getEducationPriority = (edu) => {
        const level = edu.educationLevel;
        if (level === '10th_pass') return 1;
        if (level === '12th_pass') return 2;
        
        const mastersLevels = ['me', 'mtech', 'mba', 'mba_finance', 'mba_marketing', 'mba_hr', 'mba_operations', 'mba_systems', 'msc', 'mca', 'mcom', 'ma', 'mph', 'ms', 'md', 'mds', 'mpt'];
        const phdLevels = ['phd', 'doctoral_research', 'post_doctoral'];
        
        if (mastersLevels.includes(level)) return 4;
        if (phdLevels.includes(level)) return 5;
        
        // Handle cases where educationLevel might be missing but degreeName identifies it
        if (!level && edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) return 1;
            if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('intermediate') || degreeLower.includes('puc')) return 2;
        }
        
        return 3; // Default for Degrees/Diplomas
    };

    return (
        <div className="candidate-review-container">
            {/* Header Section */}
            <div className="candidate-review-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Candidates</span>
                </button>
                <div className="header-title">
                    <h2>Candidate Profile Review</h2>
                    <p>Comprehensive candidate information and documents</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {candidate.profilePicture ? (
                            <img src={candidate.profilePicture.startsWith('data:') ? candidate.profilePicture : `http://localhost:5000/${candidate.profilePicture}`} alt={candidate.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        <div className="status-indicator active"></div>
                    </div>
                    <div className="profile-info">
                        <h3>{candidate.name}</h3>
                        <p className="email">{candidate.email || 'Email not provided'}</p>
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="label">Registered</span>
                                <span className="value">{formatDate(candidate.createdAt)}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Status</span>
                                <span className={`value status ${candidate.isProfileComplete ? 'complete' : 'incomplete'}`}>
                                    {candidate.isProfileComplete ? 'Complete' : `Incomplete ${candidate.profileCompletionPercentage || 0}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    <i className="fas fa-user"></i>
                    Personal Info
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    <i className="fas fa-graduation-cap"></i>
                    Education
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <i className="fas fa-cogs"></i>
                    Skills & Summary
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <i className="fas fa-file-alt"></i>
                    Documents
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    <i className="fas fa-building"></i>
                    Company Details
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('locations')}
                >
                    <i className="fas fa-map-marker-alt"></i>
                    Work Locations
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employment')}
                >
                    <i className="fas fa-briefcase"></i>
                    Employment
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                    <div className="tab-panel personal-info">
                        <div className="info-section">
                            <div className="info-rows">
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-user"></i>
                                        </div>
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
                                        <div className="field-icon">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Email Address</label>
                                            <span>{candidate.email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-phone"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Mobile Number</label>
                                            <span>{candidate.phone || candidate.mobileNumber || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-calendar"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Date of Birth</label>
                                            <span>{candidate.dateOfBirth ? formatDate(candidate.dateOfBirth) : 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-venus-mars"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Gender</label>
                                            <span>{candidate.gender || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Registration Date</label>
                                            <span>{formatDate(candidate.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-male"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Father's/Husband's Name</label>
                                            <span>{candidate.fatherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-female"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Mother's Name</label>
                                            <span>{candidate.motherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Location</label>
                                            <span>{candidate.location || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-map-pin"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Pincode</label>
                                            <span>{candidate.pincode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon">
                                            <i className="fas fa-map"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>State Code</label>
                                            <span>{candidate.stateCode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon">
                                            <i className="fas fa-home"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Residential Address</label>
                                            <span>{candidate.residentialAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon">
                                            <i className="fas fa-building"></i>
                                        </div>
                                        <div className="field-content">
                                            <label>Permanent Address</label>
                                            <span>{candidate.permanentAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon">
                                            <i className="fas fa-envelope-open-text"></i>
                                        </div>
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

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div className="tab-panel education-info">
                        {!candidate.education || candidate.education.length === 0 ? (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-graduation-cap"></i>
                                    <h5>No Education Information</h5>
                                    <p>This candidate hasn't provided their education details yet</p>
                                </div>
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
                                                    {edu.registrationNumber && (
                                                        <div className="detail-item">
                                                            <label>Reg. No:</label>
                                                            <span>{edu.registrationNumber}</span>
                                                        </div>
                                                    )}
                                                    {edu.state && (
                                                        <div className="detail-item">
                                                            <label>State:</label>
                                                            <span>{edu.state}</span>
                                                        </div>
                                                    )}
                                                    <div className="detail-item">
                                                        <label>Score:</label>
                                                        <span>
                                                            {edu.scoreValue || edu.percentage || 'Not provided'}
                                                            {edu.scoreType === 'percentage' || (!edu.scoreType && edu.percentage) ? '%' : ''}
                                                            {edu.scoreType && edu.scoreType !== 'percentage' ? ` ${edu.scoreType.toUpperCase()}` : ''}
                                                            {edu.cgpa && ` (CGPA: ${edu.cgpa})`}
                                                        </span>
                                                    </div>
                                                    {edu.grade && (
                                                        <div className="detail-item">
                                                            <label>Result/Grade:</label>
                                                            <span>{edu.grade}</span>
                                                        </div>
                                                    )}
                                                    {edu.marksheet && (
                                                        <div className="document-actions">
                                                            <button
                                                                className="action-btn view"
                                                                onClick={() => viewDocument(edu.marksheet, `${educationLevel} Marksheet`)}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                                View Marksheet
                                                            </button>
                                                            <button
                                                                className="action-btn download"
                                                                onClick={() => downloadDocument(edu.marksheet, `marksheet_${educationLevel.replace(' ', '_').toLowerCase()}.pdf`)}
                                                            >
                                                                <i className="fas fa-download"></i>
                                                                Download
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

                {/* Skills & Summary Tab */}
                {activeTab === 'skills' && (
                    <div className="tab-panel skills-info">
                        {(!candidate.skills || candidate.skills.length === 0) && !candidate.profileSummary && !candidate.resumeHeadline ? (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-cogs"></i>
                                    <h5>No Skills & Summary Information</h5>
                                    <p>This candidate hasn't provided their skills or profile summary yet</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {candidate.resumeHeadline && (
                                    <div className="summary-section">
                                        <div className="section-header">
                                            <i className="fas fa-newspaper"></i>
                                            <h4>Resume Headline</h4>
                                        </div>
                                        <div className="summary-content">
                                            <p>{candidate.resumeHeadline}</p>
                                        </div>
                                    </div>
                                )}

                                {candidate.skills && candidate.skills.length > 0 && (
                                    <div className="skills-section">
                                        <div className="section-header">
                                            <i className="fas fa-cogs"></i>
                                            <h4>Technical Skills</h4>
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

                                {candidate.profileSummary && (
                                    <div className="summary-section">
                                        <div className="section-header">
                                            <i className="fas fa-user-edit"></i>
                                            <h4>Profile Summary</h4>
                                        </div>
                                        <div className="summary-content">
                                            <p>{candidate.profileSummary}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="tab-panel documents-info">
                        {!candidate.resume && (!candidate.education || !candidate.education.some(edu => edu.marksheet)) ? (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-file-alt"></i>
                                    <h5>No Documents Available</h5>
                                    <p>This candidate hasn't uploaded any documents yet</p>
                                </div>
                            </div>
                        ) : (
                            <div className="documents-grid">
                                {candidate.resume && (
                                    <div className="document-card">
                                        <div className="document-icon">
                                            <i className="fas fa-file-pdf"></i>
                                        </div>
                                        <div className="document-info">
                                            <h5>Resume</h5>
                                            <p>Candidate's complete resume</p>
                                        </div>
                                        <div className="document-actions">
                                            <button
                                                className="action-btn view"
                                                onClick={() => viewDocument(candidate.resume, 'Resume')}
                                            >
                                                <i className="fas fa-eye"></i>
                                                View
                                            </button>
                                            <button
                                                className="action-btn download"
                                                onClick={() => downloadDocument(candidate.resume, 'resume.pdf')}
                                            >
                                                <i className="fas fa-download"></i>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {candidate.education && [...candidate.education]
                                    .sort((a, b) => getEducationPriority(a) - getEducationPriority(b))
                                    .map((edu, index) => {
                                        if (!edu.marksheet) return null;
                                        const eduLevelLabel = getEducationLevelLabel(edu, index);
                                    return (
                                        <div key={index} className="document-card">
                                            <div className="document-icon">
                                                <i className="fas fa-certificate"></i>
                                            </div>
                                            <div className="document-info">
                                                <h5>{eduLevelLabel} Marksheet</h5>
                                                <p>Academic certificate and marks</p>
                                            </div>
                                            <div className="document-actions">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => viewDocument(edu.marksheet, `${eduLevelLabel} Marksheet`)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                    View
                                                </button>
                                                <button
                                                    className="action-btn download"
                                                    onClick={() => downloadDocument(edu.marksheet, `marksheet_${eduLevelLabel.replace(/\s+/g, '_').toLowerCase()}.pdf`)}
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Company Details Tab */}
                {activeTab === 'company' && (
                    <div className="tab-panel company-info">
                        <div className="section-header">
                            <i className="fas fa-building"></i>
                            <h4>Job Applications & Company Details</h4>
                        </div>
                        
                        {candidate.applications && candidate.applications.length > 0 ? (
                            <div className="company-table-container">
                                <table className="company-details-table">
                                    <thead>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Job Title</th>
                                            <th>Application Status</th>
                                            <th>Applied Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {candidate.applications.map((application, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="company-cell">
                                                        <i className="fas fa-building company-icon"></i>
                                                        <span>{application.employerId?.companyName || application.companyName || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="job-category">
                                                        {application.jobTitle || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${
                                                        application.status === 'hired' ? 'selected' :
                                                        application.status === 'shortlisted' ? 'shortlisted' :
                                                        application.status === 'rejected' ? 'not-selected' :
                                                        'pending'
                                                    }`}>
                                                        {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="date-info">
                                                        {formatDate(application.createdAt || application.appliedDate)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-briefcase"></i>
                                    <h5>No Job Applications Found</h5>
                                    <p>This candidate hasn't applied to any jobs yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Work Locations Tab */}
                {activeTab === 'locations' && (
                    <div className="tab-panel locations-info">
                        <div className="section-header">
                            <i className="fas fa-map-marker-alt"></i>
                            <h4>Preferred Work Locations</h4>
                        </div>
                        
                        {candidate.jobPreferences?.preferredLocations && candidate.jobPreferences.preferredLocations.length > 0 ? (
                            <div className="locations-grid">
                                {candidate.jobPreferences.preferredLocations.map((location, index) => (
                                    <div key={index} className="location-card">
                                        <div className="location-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="location-info">
                                            <h5>{location}</h5>
                                            <p>Preferred work location</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <h5>No Preferred Locations</h5>
                                    <p>This candidate hasn't specified their preferred work locations yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Employment Tab */}
                {activeTab === 'employment' && (
                    <div className="tab-panel employment-info">
                        <div className="section-header">
                            <i className="fas fa-briefcase"></i>
                            <h4>Employment History</h4>
                        </div>
                        
                        {candidate.totalExperience && (
                            <div style={{background: '#f8f9fa', padding: '14px', borderRadius: '6px', border: '1px solid #e9ecef', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <i className="fas fa-hourglass-half" style={{color: '#FF6A00', fontSize: '16px'}}></i>
                                <p style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#2c3e50'}}>
                                    Total Experience: <span style={{color: '#FF6A00'}}>{candidate.totalExperience}</span>
                                </p>
                            </div>
                        )}
                        
                        {candidate.employment && candidate.employment.length > 0 ? (
                            <div className="employment-timeline">
                                {candidate.employment.map((emp, index) => (
                                    <div key={index} className="employment-item">
                                        <div className="employment-icon">
                                            <i className="fas fa-briefcase"></i>
                                        </div>
                                        <div className="employment-content">
                                            <div className="employment-header">
                                                <h4>{emp.designation || emp.jobTitle || 'Job Title'}</h4>
                                                <span className="employment-duration">
                                                    {emp.startDate ? formatDate(emp.startDate) : 'Start Date'} - 
                                                    {emp.endDate ? formatDate(emp.endDate) : emp.isCurrent || emp.isCurrentJob ? 'Present' : 'End Date'}
                                                </span>
                                            </div>
                                            <div className="employment-details">
                                                <div className="detail-item">
                                                    <label>Company:</label>
                                                    <span>{emp.organization || emp.companyName || 'Not provided'}</span>
                                                </div>
                                                {emp.location && (
                                                    <div className="detail-item">
                                                        <label>Location:</label>
                                                        <span>{emp.location}</span>
                                                    </div>
                                                )}
                                                {emp.workType && (
                                                    <div className="detail-item">
                                                        <label>Work Type:</label>
                                                        <span>{emp.workType}</span>
                                                    </div>
                                                )}
                                                {emp.presentCTC && (
                                                    <div className="detail-item">
                                                        <label>Current CTC:</label>
                                                        <span>₹{emp.presentCTC} LPA</span>
                                                    </div>
                                                )}
                                                {emp.expectedCTC && (
                                                    <div className="detail-item">
                                                        <label>Expected CTC:</label>
                                                        <span>₹{emp.expectedCTC} LPA</span>
                                                    </div>
                                                )}
                                                {emp.description && (
                                                    <div className="detail-item">
                                                        <label>Description:</label>
                                                        <span>{emp.description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-applications">
                                <div className="no-data-content">
                                    <i className="fas fa-briefcase"></i>
                                    <h5>No Employment History</h5>
                                    <p>This candidate hasn't provided their employment history yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Document Modal */}
            {documentModal.isOpen && (
                <div className="document-modal-overlay" onClick={closeDocumentModal}>
                    <div className="document-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>{documentModal.title}</h3>
                            <button className="close-btn" onClick={closeDocumentModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="document-modal-content">
                            <iframe
                                src={documentModal.url}
                                title={documentModal.title}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCandidateReviewPage;
