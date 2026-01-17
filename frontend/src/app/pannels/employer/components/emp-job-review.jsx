
import { useEffect, useState } from "react";
import JobZImage from "../../../common/jobz-img";
import { loadScript } from "../../../../globals/constants";
import { useNavigate, useParams } from "react-router-dom";
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
            if (response.ok && data.success) {
                setJobDetails(data.job || data.data || data);
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
                                    <p className="mb-0 text-muted">{jobDetails.title}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Job Category</h5>
                                    <p className="mb-0 text-muted">{jobDetails.category || 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Job Type</h5>
                                    <p className="mb-0 text-muted">{jobDetails.jobType}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Type of Employment</h5>
                                    <p className="mb-0 text-muted text-capitalize">{jobDetails.typeOfEmployment || 'N/A'}</p>
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
                                    <p className="mb-0 text-muted">{jobDetails.location}</p>
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
                                    <p className="mb-0 text-muted">{jobDetails.offerLetterDate ? new Date(jobDetails.offerLetterDate).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Joining Date</h5>
                                    <p className="mb-0 text-muted">{jobDetails.joiningDate ? new Date(jobDetails.joiningDate).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Last Date of Application</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.lastDateOfApplication ? new Date(jobDetails.lastDateOfApplication).toLocaleDateString() : 'N/A'}
                                        {jobDetails.lastDateOfApplicationTime && ` at ${jobDetails.lastDateOfApplicationTime}`}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Candidate Transportation Options</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.transportation ? 
                                            (jobDetails.transportation.oneWay ? 'One-way Cab' : 
                                             jobDetails.transportation.twoWay ? 'Two-way Cab' : 
                                             jobDetails.transportation.noCab ? 'No Cab Facility' : 'N/A') : 'N/A'}
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
                                    <p className="mb-0 text-muted">{jobDetails.education || 'N/A'}</p>
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
                                                    nonTechnical: 'Non-Technical',
                                                    managerial: 'Managerial',
                                                    final: 'Final',
                                                    hr: 'HR',
                                                    assessment: 'Assessment'
                                                };
                                                return `${index + 1}. ${roundNames[roundType] || roundType}`;
                                            }).join(', ')
                                        ) : (jobDetails.roundTypes || 'N/A')}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Interview Mode</h5>
                                    <p className="mb-0 text-muted">
                                        {jobDetails.interviewMode ? 
                                            Object.entries(jobDetails.interviewMode)
                                                .filter(([key, value]) => value)
                                                .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
                                                .map(mode => mode.charAt(0).toUpperCase() + mode.slice(1))
                                                .join(', ') || 'N/A' : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                       
                        <hr />

                        {/* Interview Round Details */}
                        {jobDetails.interviewRoundOrder && jobDetails.interviewRoundOrder.length > 0 && (
                            <div className="mt-4">
                                <h5 className="mb-3">Interview Schedule Details</h5>
                                <div className="row">
                                    {jobDetails.interviewRoundOrder.map((key, index) => {
                                        const roundType = jobDetails.interviewRoundTypes?.[key];
                                        const details = jobDetails.interviewRoundDetails?.[key];
                                        const roundNames = {
                                            technical: 'Technical Round',
                                            nonTechnical: 'Non-Technical Round',
                                            managerial: 'Managerial Round',
                                            final: 'Final Round',
                                            hr: 'HR Round',
                                            assessment: 'Assessment'
                                        };
                                        
                                        if (!details) return null;
                                        
                                        return (
                                            <div key={key} className="col-lg-6 col-12 mb-3">
                                                <div className="border rounded p-3 bg-light">
                                                    <h6 className="mb-2">
                                                        <span className="badge bg-primary me-2">{index + 1}</span>
                                                        {roundNames[roundType] || roundType}
                                                    </h6>
                                                    {details.description && (
                                                        <p className="mb-1"><strong>Description:</strong> {details.description}</p>
                                                    )}
                                                    {details.fromDate && (
                                                        <p className="mb-1"><strong>From Date:</strong> {new Date(details.fromDate).toLocaleDateString()}</p>
                                                    )}
                                                    {details.toDate && (
                                                        <p className="mb-1"><strong>To Date:</strong> {new Date(details.toDate).toLocaleDateString()}</p>
                                                    )}
                                                    {details.time && (
                                                        <p className="mb-1"><strong>Time:</strong> {details.time}</p>
                                                    )}
                                                    {details.startTime && (
                                                        <p className="mb-1"><strong>Start Time:</strong> {details.startTime}</p>
                                                    )}
                                                    {details.endTime && (
                                                        <p className="mb-1"><strong>End Time:</strong> {details.endTime}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
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
