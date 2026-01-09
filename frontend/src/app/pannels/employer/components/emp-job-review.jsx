
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
                                    <h5 className="mb-1">Job Type</h5>
                                    <p className="mb-0 text-muted">{jobDetails.jobType}</p>
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
                                    <p className="mb-0 text-muted">{jobDetails.experienceLevel}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Offer Letter Release Date</h5>
                                    <p className="mb-0 text-muted">{jobDetails.offerLetterDate}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Candidate Transportation Options</h5>
                                    <p className="mb-0 text-muted">{jobDetails.transportationOptions}</p>
                                </div>
                            </div>

                            <div className="col-lg-6 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Number of Vacancies</h5>
                                    <p className="mb-0 text-muted">{jobDetails.vacancies || 'N/A'}</p>
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
                                    <p className="mb-0 text-muted">{jobDetails.round}</p>
                                </div>

                                <div className="mt-2">
                                    <h5 className="mb-1">Interview Round Types</h5>
                                    <p className="mb-0 text-muted">{jobDetails.roundTypes}</p>
                                </div>
                            </div>
                        </div>
                       
                        <hr />

                        <div className="row">
                            <div className="col-lg-8 col-12">
                                <div className="mt-2">
                                    <h5 className="mb-1">Job Description</h5>
                                    <div className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
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
