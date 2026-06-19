import { useEffect, useState } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { formatJobEducationDisplay } from '../../../../utils/jobEducationOptions';
import JobZImage from "../../../common/jobz-img";
import { loadScript } from "../../../../globals/constants";
import { useNavigate, useParams } from "react-router-dom";
import { formatTimeToAMPM } from "../../../../utils/dateFormatter";
import "./emp-job-review.css";

function EmpJobReviewPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interviewModal, setInterviewModal] = useState({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false });

    useEffect(() => {
        loadScript("js/custom.js");
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`http://localhost:5000/api/employer/jobs/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Job API Response:', data);
            if (response.ok && data.success) {
                const jobData = data.job || data.data || data;
                console.log('Job Details:', jobData);
                console.log('Interview Rounds:', jobData.interviewRounds);
                console.log('Interview Round Order:', jobData.interviewRoundOrder);
                console.log('Interview Round Details:', jobData.interviewRoundDetails);
                setJobDetails(jobData);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!jobDetails) return <div>Job not found</div>;

    const roundNames = {
        technical: 'Technical Round',
        oneOnOne: 'One-on-One',
        panel: 'Panel',
        group: 'Group Discussion',
        situational: 'Situational / Behavioral Round',
        others: 'Others',
        assessment: 'Assessment',
        oneOnOnePanel: 'One-on-One / Panel',
        managerial: 'Managerial Round',
        hr: 'HR Round'
    };

    const normalizeRoundType = (value) => String(value || '').toLowerCase().replace(/[\s_-]/g, '');
    const getRoundTypeFromRound = (round) => round?.roundType || round?.type || round?.name;
    const getRoundDisplayName = (roundType, customType) => (
        (customType && customType.trim()) || roundNames[roundType] || roundType || 'Interview Round'
    );
    const normalizeCommaList = (value) => {
        if (!value) return '';
        return String(value)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .join(' ');
    };

    const isPastEndDate = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(0, 0, 0, 0);
        return today > endDate;
    };

    const interviewRoundsArray = Array.isArray(jobDetails.interviewRounds) ? jobDetails.interviewRounds : [];
    const interviewRoundOrder = Array.isArray(jobDetails.interviewRoundOrder) ? jobDetails.interviewRoundOrder : [];
    const interviewRoundTypes = jobDetails.interviewRoundTypes || {};
    const interviewRoundDetails = jobDetails.interviewRoundDetails || {};

    const roundsByTypeQueue = interviewRoundsArray.reduce((acc, round) => {
        const normalizedType = normalizeRoundType(getRoundTypeFromRound(round));
        if (!normalizedType) return acc;
        if (!acc[normalizedType]) acc[normalizedType] = [];
        acc[normalizedType].push(round);
        return acc;
    }, {});

    const orderedInterviewRounds = interviewRoundOrder.length > 0
        ? interviewRoundOrder.map((key, index) => {
            const roundType = interviewRoundTypes[key];
            const normalizedType = normalizeRoundType(roundType);
            const matchedRound = roundsByTypeQueue[normalizedType]?.shift() || null;
            const details = interviewRoundDetails[key] || {};
            const isAssessment = normalizedType === 'assessment';
            const assessmentId = isAssessment
                ? (details.assessmentId || matchedRound?.assessmentId?._id || matchedRound?.assessmentId || jobDetails.assessmentId?._id || jobDetails.assessmentId || null)
                : null;

            return {
                key,
                stageNumber: index + 1,
                roundType,
                displayName: getRoundDisplayName(roundType, details.customType),
                description: details.description || matchedRound?.description || '',
                fromDate: details.fromDate || matchedRound?.fromDate || matchedRound?.fromdate || matchedRound?.date || (isAssessment ? jobDetails.assessmentStartDate : null),
                toDate: details.toDate || matchedRound?.toDate || matchedRound?.todate || (isAssessment ? jobDetails.assessmentEndDate : null),
                startTime: details.startTime || matchedRound?.startTime || (isAssessment ? jobDetails.assessmentStartTime : null),
                endTime: details.endTime || matchedRound?.endTime || (isAssessment ? jobDetails.assessmentEndTime : null),
                applicationLimit: details.applicationLimit || matchedRound?.applicationLimit,
                roundId: matchedRound?._id || matchedRound?.id || details?._id || details?.id,
                subStages: (details.subStages && details.subStages.length > 0) ? details.subStages : (matchedRound?.subStages || []),
                isAssessment,
                assessmentId
            };
        })
        : interviewRoundsArray.map((round, index) => {
            const roundType = getRoundTypeFromRound(round);
            const normalizedType = normalizeRoundType(roundType);
            const isAssessment = normalizedType === 'assessment';
            const assessmentId = isAssessment
                ? (round?.assessmentId?._id || round?.assessmentId || jobDetails.assessmentId?._id || jobDetails.assessmentId || null)
                : null;
            return {
                key: round?._id || round?.id || `${normalizedType}-${index}`,
                stageNumber: index + 1,
                roundType,
                displayName: getRoundDisplayName(roundType, ''),
                description: round?.description || '',
                fromDate: round?.fromDate || round?.fromdate || round?.date || (isAssessment ? jobDetails.assessmentStartDate : null),
                toDate: round?.toDate || round?.todate || (isAssessment ? jobDetails.assessmentEndDate : null),
                startTime: round?.startTime || (isAssessment ? jobDetails.assessmentStartTime : null),
                endTime: round?.endTime || (isAssessment ? jobDetails.assessmentEndTime : null),
                applicationLimit: round?.applicationLimit,
                roundId: round?._id || round?.id,
                subStages: round?.subStages || [],
                isAssessment,
                assessmentId
            };
        });

    return (
        <div className="emp-job-review-page">
            <div className="panel panel-default site-bg-white p-3">
                <div className="panel-heading d-flex justify-content-between align-items-center">
                    <h4 className="panel-tittle">
                        <i className="far fa-user-circle" /> Job Details
                    </h4>

                    <div className="d-flex align-items-center">
                        <span className={`badge ${jobDetails.status === 'active' ? 'twm-bg-green' : 'twm-bg-orange'} text-capitalize me-3`}>
                            {jobDetails.status}
                        </span>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => navigate('/employer/manage-jobs')}
                        >
                            ← Back to Jobs List
                        </button>
                    </div>
                </div>

                <div className="panel-body">
                    <div className="border rounded p-4 shadow-sm">
                        {/* Interview Round Details */}
                        {orderedInterviewRounds.length > 0 && (
                            <div className="interview-schedule-section mt-4">
                                <div className="interview-schedule-header">
                                    <div>
                                        <h5 className="mb-1">Interview Schedule Details</h5>
                                        <p className="mb-0">Stage-wise schedule summary for interview operations.</p>
                                    </div>
                                    <span className="interview-total-pill">{orderedInterviewRounds.length} {orderedInterviewRounds.length === 1 ? 'Stage' : 'Stages'}</span>
                                </div>
                                <div className="interview-rounds-strip">
                                    {orderedInterviewRounds.map((round) => {
                                        const fromDateLabel = round.fromDate ? formatDate(round.fromDate) : 'N/A';
                                        const toDateLabel = round.toDate ? formatDate(round.toDate) : (round.fromDate ? formatDate(round.fromDate) : 'N/A');

                                        return (
                                            <div key={round.key} className="interview-round-slot">
                                                <div className="interview-round-card">
                                                    <div className="interview-round-top">
                                                        <div className="interview-round-title-wrap">
                                                            <span className="interview-stage-pill">Stage {round.stageNumber}</span>
                                                            <h6 className="interview-round-title">{round.displayName}</h6>
                                                        </div>
                                                    </div>

                                                    {round.description && (
                                                        <p className="interview-round-desc">{round.description}</p>
                                                    )}

                                                    <div className="interview-meta-grid">
                                                        {round.isAssessment ? (
                                                            <>
                                                                <div className="interview-meta-item">
                                                                    <span className="label">From Date</span>
                                                                    <span className="value">{fromDateLabel}</span>
                                                                </div>
                                                                <div className="interview-meta-item">
                                                                    <span className="label">Start Time</span>
                                                                    <span className="value">{round.startTime ? formatTimeToAMPM(round.startTime) : 'N/A'}</span>
                                                                </div>
                                                                <div className="interview-meta-item">
                                                                    <span className="label">End Time</span>
                                                                    <span className="value">{round.endTime ? formatTimeToAMPM(round.endTime) : 'N/A'}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="interview-meta-item">
                                                                    <span className="label">Start Date</span>
                                                                    <span className="value">{fromDateLabel}</span>
                                                                </div>
                                                                <div className="interview-meta-item">
                                                                    <span className="label">End Date</span>
                                                                    <span className="value">{toDateLabel}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="interview-meta-item">
                                                            <span className="label">Application Limit</span>
                                                            <span className="value">{round.applicationLimit || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    {round.roundId && !round.isAssessment && !isPastEndDate(round.toDate || round.fromDate) && (
                                                        <button
                                                            className="btn site-button-secondry btn-sm interview-open-btn"
                                                            onClick={() => setInterviewModal(prev => ({
                                                                isOpen: true,
                                                                url: `https://schedule.taleglobal.net/rounds/${round.roundId}`,
                                                                title: `Schedule Interview - ${round.displayName}`,
                                                                isMaximized: prev.isOpen && prev.url === `https://schedule.taleglobal.net/rounds/${round.roundId}` ? prev.isMaximized : false,
                                                                isMinimized: false
                                                            }))}
                                                        >
                                                            Join Now
                                                        </button>
                                                    )}

                                                    {round.isAssessment && round.assessmentId && (
                                                        <button
                                                            className="btn site-button btn-sm interview-open-btn"
                                                            onClick={() => navigate(`/employer/assessment-results/${round.assessmentId}`)}
                                                        >
                                                            <i className="fa fa-chart-bar me-1"></i>
                                                            Result
                                                        </button>
                                                    )}

                                                    {round.subStages && round.subStages.length > 0 && (
                                                        <div className="interview-substage-wrap">
                                                            <h6>Sub-Stages</h6>
                                                            <div className="interview-substage-list">
                                                                {round.subStages.map((subStage, subIndex) => (
                                                                    <div key={subIndex} className="interview-substage-item">
                                                                        <span className="substage-title">Sub-Stage {subIndex + 1}</span>
                                                                        <div className="substage-field">
                                                                            <small><i className="fa fa-calendar"></i> Date</small>
                                                                            <strong>{subStage.fromDate ? formatDate(subStage.fromDate) : 'N/A'}</strong>
                                                                        </div>
                                                                        <div className="substage-field">
                                                                            <small><i className="fa fa-clock"></i> Start</small>
                                                                            <strong>{subStage.startTime ? formatTimeToAMPM(subStage.startTime) : 'N/A'}</strong>
                                                                        </div>
                                                                        <div className="substage-field">
                                                                            <small><i className="fa fa-clock"></i> End</small>
                                                                            <strong>{subStage.endTime ? formatTimeToAMPM(subStage.endTime) : 'N/A'}</strong>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <hr />

                        {/* Consultant Company Information */}
                        {(jobDetails.companyName || jobDetails.companyLogo || jobDetails.companyDescription) && (
                            <div className="mb-4 p-3 bg-light rounded consultant-company-card">
                                <h5 className="mb-3 consultant-company-title">Company Information</h5>
                                <div className="consultant-company-layout">
                                    {jobDetails.companyLogo && (
                                        <div className="consultant-company-logo-wrap">
                                            <img
                                                src={jobDetails.companyLogo}
                                                alt="Company Logo"
                                                className="consultant-company-logo"
                                            />
                                        </div>
                                    )}
                                    <div className="consultant-company-content">
                                        {jobDetails.companyName && (
                                            <div className="mb-2 consultant-company-name">
                                                <strong>Company Name:</strong> {jobDetails.companyName}
                                            </div>
                                        )}
                                        {jobDetails.companyDescription && (
                                            <div className="consultant-company-description">
                                                <strong>Description:</strong>
                                                <div dangerouslySetInnerHTML={{ __html: jobDetails.companyDescription }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="row">
                            <div className="col-lg-6 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Job Title / Designation</h5>
                                    <p className="mb-0 text-muted"><strong>{jobDetails.title}</strong></p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Job Category</h5>
                                    <p className="mb-0 text-muted">{jobDetails.category || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Work Mode</h5>
                                    <p className="mb-0 text-muted text-capitalize">{jobDetails.workMode ? jobDetails.workMode.replace(/-/g, ' ') : 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Work Shift</h5>
                                    <p className="mb-0 text-muted text-capitalize">{jobDetails.shift ? jobDetails.shift.replace(/-/g, ' ') : 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Job Location</h5>
                                    <p className="mb-0 text-muted">
                                        {Array.isArray(jobDetails.location) ? jobDetails.location.join(', ') : (jobDetails.location || 'N/A')}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">CTC (Annual)</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.ctc && (jobDetails.ctc.min > 0 || jobDetails.ctc.max > 0) ? 
                                            (jobDetails.ctc.min === jobDetails.ctc.max ? 
                                                `₹${(jobDetails.ctc.min/100000).toFixed(1)} LPA` : 
                                                `₹${(jobDetails.ctc.min/100000).toFixed(1)} - ${(jobDetails.ctc.max/100000).toFixed(1)} LPA`) : 
                                            'CTC not specified'}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Net Salary (Monthly)</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.netSalary && (jobDetails.netSalary.min > 0 || jobDetails.netSalary.max > 0) ? 
                                            (jobDetails.netSalary.min === jobDetails.netSalary.max ? 
                                                `₹${(jobDetails.netSalary.min/1000).toFixed(0)}K` : 
                                                `₹${(jobDetails.netSalary.min/1000).toFixed(0)}K - ${(jobDetails.netSalary.max/1000).toFixed(0)}K`) : 
                                            'Net salary not specified'}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Experience Level</h5>
                                    <p className="mb-0 text-muted text-capitalize">{jobDetails.experienceLevel}</p>
                                    {jobDetails.experienceLevel === 'minimum' && (jobDetails.minExperience || jobDetails.maxExperience) && (
                                        <p className="mb-0 text-muted">
                                            {jobDetails.minExperience && `Min: ${jobDetails.minExperience} years`}
                                            {jobDetails.minExperience && jobDetails.maxExperience && ' | '}
                                            {jobDetails.maxExperience && `Max: ${jobDetails.maxExperience} years`}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Offer Letter Release Date</h5>
                                    <p className="mb-0 text-muted">{jobDetails.offerLetterDate ? formatDate(jobDetails.offerLetterDate) : 'N/A'}</p>
                                </div>



                                <div className="mt-2">
                                    <h5 className="mb-1">Last Date of Application</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.lastDateOfApplication ? formatDate(jobDetails.lastDateOfApplication) : 'N/A'}
                                        {jobDetails.lastDateOfApplicationTime && ` at ${formatTimeToAMPM(jobDetails.lastDateOfApplicationTime)}`}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Candidate Transportation Options</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.transportation ? (
                                            [
                                                jobDetails.transportation.oneWay && 'One-way Cab',
                                                jobDetails.transportation.twoWay && 'Two-way Cab',
                                                jobDetails.transportation.noCab && 'No Cab Facility'
                                            ].filter(Boolean).join(', ') || 'N/A'
                                        ) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="col-lg-6 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Number of Vacancies</h5>
                                    <p className="mb-0 text-muted">{jobDetails.vacancies || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Application Limit</h5>
                                    <p className="mb-0 text-muted">{jobDetails.applicationLimit || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Application Count</h5>
                                    <p className="mb-0 text-muted">{jobDetails.applicationCount || 0}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Are Backlogs Allowed?</h5>
                                    <p className="mb-0 text-muted">{jobDetails.backlogsAllowed ? 'Yes' : 'No'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Required Educational Background</h5>
                                    <p className="mb-0 text-muted">
                                        {Array.isArray(jobDetails.education) && jobDetails.education.length > 0 
                                            ? formatJobEducationDisplay(jobDetails.education, jobDetails.educationSpecializations)
                                            : (jobDetails.education || 'N/A')}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Required Skills</h5>
                                    <p className="mb-0 text-muted">{jobDetails.requiredSkills?.join(', ') || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Number of Interview Rounds</h5>
                                    <p className="mb-0 text-muted">{jobDetails.interviewRoundsCount || jobDetails.round || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Interview Round Types</h5>
                                    <div className="mb-0 text-muted">
                                        {jobDetails.interviewRoundOrder && jobDetails.interviewRoundOrder.length > 0 ? (
                                            jobDetails.interviewRoundOrder.map((key, index) => {
                                                const roundType = jobDetails.interviewRoundTypes?.[key];
                                                const customType = jobDetails.interviewRoundDetails?.[key]?.customType;
                                                return <div key={key}>{index + 1}. {getRoundDisplayName(roundType, customType)}</div>;
                                            })
                                        ) : (normalizeCommaList(jobDetails.roundTypes) || 'N/A')}
                                    </div>
                                </div>


                            </div>
                        </div>
                       
                        <hr />

                        <div className="row">
                            <div className="col-lg-12 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Job Description</h5>
                                    <div
                                        className="mb-0 text-muted job-review-rich-text"
                                        dangerouslySetInnerHTML={{ __html: jobDetails.description }}
                                    />
                                </div>

                                <div className="mt-4">
                                    <h5 className="mb-1">Roles and Responsibilities</h5>
                                    <div className="mb-0 text-muted job-review-rich-text responsibilities-rich-text">
                                        {jobDetails.responsibilities ? (
                                            typeof jobDetails.responsibilities === 'string' ? (
                                                <div dangerouslySetInnerHTML={{ __html: jobDetails.responsibilities }} />
                                            ) : Array.isArray(jobDetails.responsibilities) ? (
                                                <ul>
                                                    {jobDetails.responsibilities.map((resp, idx) => (
                                                        <li key={idx}>{resp}</li>
                                                    ))}
                                                </ul>
                                            ) : null
                                        ) : (
                                            <p>Role and responsibility not available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {interviewModal.isOpen && (
                <div className={`document-modal-overlay ${interviewModal.isMinimized ? 'minimized-overlay' : ''}`} onClick={() => setInterviewModal({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false })}>
                    <div className={`document-modal-container ${interviewModal.isMaximized ? 'maximized' : ''} ${interviewModal.isMinimized ? 'minimized' : ''}`} onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header" onClick={() => interviewModal.isMinimized && setInterviewModal(prev => ({ ...prev, isMinimized: false }))}>
                            <h3>{interviewModal.title}</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setInterviewModal(prev => ({ ...prev, isMinimized: !prev.isMinimized }))} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: 16 }}>
                                    <i className={`fas ${interviewModal.isMinimized ? 'fa-window-restore' : 'fa-minus'}`}></i>
                                </button>
                                <button onClick={() => setInterviewModal(prev => ({ ...prev, isMaximized: !prev.isMaximized }))} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: 16 }}>
                                    <i className={`fas ${interviewModal.isMaximized ? 'fa-compress' : 'fa-expand'}`}></i>
                                </button>
                                <button onClick={() => setInterviewModal({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false })} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: 16 }}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="document-modal-body">
                            <iframe src={interviewModal.url} title={interviewModal.title} />
                        </div>
                        <div className="document-modal-footer">
                            <button
                                className="document-modal-close-btn"
                                onClick={() => setInterviewModal({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false })}
                                aria-label="Close interview popup"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmpJobReviewPage;
