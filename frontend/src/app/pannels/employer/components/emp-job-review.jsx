import { useEffect, useState } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
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

    return (
        <div className="emp-job-review-page">
            <div className="panel panel-default site-bg-white p-3">
                <div className="panel-heading d-flex justify-content-between align-items-center">
                    <h4 className="panel-tittle">
                        <i className="far fa-user-circle" /> Job Details
                    </h4>

                    <span className={`badge ${jobDetails.status === 'active' ? 'twm-bg-green' : 'twm-bg-orange'} text-capitalize`}>
                        {jobDetails.status}
                    </span>
                </div>

                <div className="panel-body">
                    <button
                        className="btn btn-outline-secondary mb-3"
                        onClick={() => navigate(-1)}
                    >
                        ← Back to Jobs List
                    </button>

                    <div className="border rounded p-4 shadow-sm">
                        {/* Consultant Company Information */}
                        {(jobDetails.companyName || jobDetails.companyLogo || jobDetails.companyDescription) && (
                            <div className="mb-4 p-3 bg-light rounded">
                                <h5 className="mb-3">Company Information</h5>
                                <div className="row">
                                    {jobDetails.companyLogo && (
                                        <div className="col-md-3">
                                            <img src={jobDetails.companyLogo} alt="Company Logo" style={{width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #ddd'}} />
                                        </div>
                                    )}
                                    <div className="col-md-9">
                                        {jobDetails.companyName && (
                                            <div className="mb-2">
                                                <strong>Company Name:</strong> {jobDetails.companyName}
                                            </div>
                                        )}
                                        {jobDetails.companyDescription && (
                                            <div>
                                                <strong>Description:</strong> {jobDetails.companyDescription}
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
                                            ? jobDetails.education.join(', ') 
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
                                    <p className="mb-0 text-muted">
                                        {jobDetails.interviewRoundOrder && jobDetails.interviewRoundOrder.length > 0 ? (
                                            jobDetails.interviewRoundOrder.map((key, index) => {
                                                const roundType = jobDetails.interviewRoundTypes?.[key];
                                                const roundNames = {
                                                    technical: 'Technical',
                                                    oneOnOne: 'One-on-One',
                                                    panel: 'Panel',
                                                    group: 'Group',
                                                    situational: 'Situational / Behavioral',
                                                    others: 'Others – Specify.',
                                                    assessment: 'Assessment',
                                                    oneOnOnePanel: 'One-on-One / Panel'
                                                };
                                                return `${index + 1}. ${roundNames[roundType] || roundType}`;
                                            }).join(', ')
                                        ) : (jobDetails.roundTypes || 'N/A')}
                                    </p>
                                </div>


                            </div>
                        </div>
                       
                        <hr />

                        {/* Interview Round Details */}
                        {((jobDetails.interviewRounds && jobDetails.interviewRounds.length > 0) || 
                          (jobDetails.interviewRoundOrder && jobDetails.interviewRoundOrder.length > 0)) && (
                            <div className="mt-4">
                                <h5 className="mb-3">Interview Schedule Details</h5>
                                <div className="row">
                                    {/* Display from interviewRounds array if available */}
                                    {jobDetails.interviewRounds && jobDetails.interviewRounds.length > 0 ? (
                                        jobDetails.interviewRounds.map((round, index) => {
                                            const roundNames = {
                                                technical: 'Technical',
                                                oneOnOne: 'One-on-One',
                                                panel: 'Panel',
                                                group: 'Group',
                                                situational: 'Situational / Behavioral',
                                                others: 'Others',
                                                assessment: 'Assessment',
                                                oneOnOnePanel: 'One-on-One / Panel',
                                                managerial: 'Managerial Round',
                                                hr: 'HR Round'
                                            };
                                            const displayName = roundNames[round.name] || round.name;
                                            return (
                                            <div key={round.id || index} className="col-lg-6 col-12 mb-3">
                                                <div className="border rounded p-3 bg-light">
                                                    <h6 className="mb-2">
                                                        <span className="badge bg-primary me-2">{index + 1}</span>
                                                        {displayName}
                                                    </h6>
                                                    {round.description && (
                                                        <p className="mb-1"><strong>Description:</strong> {round.description}</p>
                                                    )}
                                                    {(round.fromdate || round.fromDate || round.date) ? (
                                                        <p className="mb-1"><strong>Date:</strong> {formatDate(round.fromdate || round.fromDate || round.date)}</p>
                                                    ) : (
                                                        <p className="mb-1 text-muted"><strong>Date:</strong> Not scheduled yet</p>
                                                    )}
                                                    {(round.todate || round.toDate) && (
                                                        <p className="mb-1"><strong>End Date:</strong> {formatDate(round.todate || round.toDate)}</p>
                                                    )}
                                                    {round.startTime && (
                                                        <p className="mb-1"><strong>Start Time:</strong> {formatTimeToAMPM(round.startTime)}</p>
                                                    )}
                                                    {round.endTime && (
                                                        <p className="mb-1"><strong>End Time:</strong> {formatTimeToAMPM(round.endTime)}</p>
                                                    )}
                                                    {round.applicationLimit && (
                                                        <p className="mb-1"><strong>Application Limit:</strong> {round.applicationLimit}</p>
                                                    )}
                                                    
                                                    {(round._id || round.id) && round.name?.toLowerCase() !== 'assessment' && (
                                                        <button 
                                                            className="btn site-button-secondry btn-sm mt-2"
                                                            onClick={() => window.open(`https://schedule.taleglobal.net/rounds/${round._id || round.id}`, '_blank')}
                                                        >
                                                            Join now
                                                        </button>
                                                    )}
                                                    
                                                    {/* Sub-stages */}
                                                    {round.subStages && round.subStages.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6 className="mb-2 text-secondary">Sub-Stages:</h6>
                                                            {round.subStages.map((subStage, subIndex) => (
                                                                <div key={subIndex} className="ms-3 mb-2 p-2 bg-white rounded border">
                                                                    <p className="mb-1 small"><strong>Sub-Stage {subIndex + 1}</strong></p>
                                                                    {subStage.fromDate && (
                                                                        <p className="mb-1 small"><strong>Date:</strong> {formatDate(subStage.fromDate)}</p>
                                                                    )}
                                                                    {subStage.startTime && (
                                                                        <p className="mb-1 small"><strong>Start:</strong> {formatTimeToAMPM(subStage.startTime)}</p>
                                                                    )}
                                                                    {subStage.endTime && (
                                                                        <p className="mb-1 small"><strong>End:</strong> {formatTimeToAMPM(subStage.endTime)}</p>
                                                                    )}
                                                                    {subStage.breakTime > 0 && (
                                                                        <p className="mb-0 small"><strong>Break:</strong> {subStage.breakTime} mins</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                        })
                                    ) : (
                                        /* Display from interviewRoundDetails if interviewRounds not available */
                                        jobDetails.interviewRoundOrder && jobDetails.interviewRoundOrder.map((key, index) => {
                                            const details = jobDetails.interviewRoundDetails?.[key];
                                            const roundType = jobDetails.interviewRoundTypes?.[key];
                                            const roundNames = {
                                                technical: 'Technical',
                                                managerial: 'Managerial Round',
                                                hr: 'HR Round',
                                                oneOnOnePanel: 'One-on-One / Panel',
                                                group: 'Group',
                                                situational: 'Situational / Behavioral',
                                                assessment: 'Assessment',
                                                others: 'Others'
                                            };
                                            const displayName = details?.customType || roundNames[roundType] || roundType;
                                            
                                            return (
                                                <div key={key} className="col-lg-6 col-12 mb-3">
                                                    <div className="border rounded p-3 bg-light">
                                                        <h6 className="mb-2">
                                                            <span className="badge bg-primary me-2">{index + 1}</span>
                                                            {displayName}
                                                        </h6>
                                                        {details?.description && (
                                                            <p className="mb-1"><strong>Description:</strong> {details.description}</p>
                                                        )}
                                                        {details?.fromDate ? (
                                                            <p className="mb-1"><strong>Date:</strong> {formatDate(details.fromDate)}</p>
                                                        ) : (
                                                            <p className="mb-1 text-muted"><strong>Date:</strong> Not scheduled yet</p>
                                                        )}
                                                        {details?.toDate && (
                                                            <p className="mb-1"><strong>End Date:</strong> {formatDate(details.toDate)}</p>
                                                        )}
                                                        {details?.startTime && (
                                                            <p className="mb-1"><strong>Start Time:</strong> {formatTimeToAMPM(details.startTime)}</p>
                                                        )}
                                                        {details?.endTime && (
                                                            <p className="mb-1"><strong>End Time:</strong> {formatTimeToAMPM(details.endTime)}</p>
                                                        )}
                                                        
                                                        {(details?._id || details?.id) && roundType !== 'assessment' && (
                                                            <button 
                                                                className="btn site-button-secondry btn-sm mt-2"
                                                                onClick={() => window.open(`https://schedule.taleglobal.net/rounds/${details._id || details.id}`, '_blank')}
                                                            >
                                                                Join now
                                                            </button>
                                                        )}
                                                        
                                                        {/* Sub-stages */}
                                                        {details?.subStages && details.subStages.length > 0 && (
                                                            <div className="mt-3">
                                                                <h6 className="mb-2 text-secondary">Sub-Stages:</h6>
                                                                {details.subStages.map((subStage, subIndex) => (
                                                                    <div key={subIndex} className="ms-3 mb-2 p-2 bg-white rounded border">
                                                                        <p className="mb-1 small"><strong>Sub-Stage {subIndex + 1}</strong></p>
                                                                        {subStage.fromDate && (
                                                                            <p className="mb-1 small"><strong>Date:</strong> {formatDate(subStage.fromDate)}</p>
                                                                        )}
                                                                        {subStage.startTime && (
                                                                            <p className="mb-1 small"><strong>Start:</strong> {formatTimeToAMPM(subStage.startTime)}</p>
                                                                        )}
                                                                        {subStage.endTime && (
                                                                            <p className="mb-1 small"><strong>End:</strong> {formatTimeToAMPM(subStage.endTime)}</p>
                                                                        )}
                                                                        {subStage.breakTime > 0 && (
                                                                            <p className="mb-0 small"><strong>Break:</strong> {subStage.breakTime} mins</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        <hr />

                        <div className="row">
                            <div className="col-lg-12 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Job Description</h5>
                                    <div className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
                                </div>

                                <div className="mt-4">
                                    <h5 className="mb-1">Roles and Responsibilities</h5>
                                    <div className="mb-0 text-muted">
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
        </div>
    );
}

export default EmpJobReviewPage;
