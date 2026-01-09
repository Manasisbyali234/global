import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobZImage from "../../../common/jobz-img";

function CanPostedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        jobType: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.location) params.append('location', filters.location);
            if (filters.jobType) params.append('jobType', filters.jobType);
            
            const response = await fetch(`http://localhost:5000/api/public/jobs?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setJobs(data.jobs || data.data || []);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('candidateToken');
            const response = await fetch(`http://localhost:5000/api/candidate/apply/${jobId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('Thank you for applying');
                // Refresh jobs to update apply status
                fetchJobs();
            } else {
                alert(data.message || 'Failed to apply');
            }
        } catch (error) {
            
            alert('Error applying to job');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="twm-pro-view-chart-wrap">
            {/* Filters */}
            <div className="col-lg-12 col-md-12 mb-4">
                <div className="panel panel-default site-bg-white">
                    <div className="panel-body wt-panel-body p-a20">
                        <div className="row">
                            <div className="col-md-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search jobs..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Location"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-control"
                                    value={filters.jobType}
                                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                                >
                                    <option value="">All Job Types</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="col-lg-12 col-md-12 mb-4">
                <div className="panel panel-default site-bg-white">
                    <div className="panel-body wt-panel-body">
                        {loading ? (
                            <div className="text-center p-5">Loading jobs...</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center p-5">
                                <h5>No jobs found</h5>
                                <p>Please check back later for new opportunities.</p>
                            </div>
                        ) : (
                            <div className="row">
                                {jobs.map((job) => (
                                    <div key={job._id} className="col-lg-12 col-md-12 m-b30">
                                        <div className="twm-jobs-list-style1 bdr-light">
                                            <div className="twm-media">
                                                {job.employerProfile?.logo ? (
                                                    <img src={job.employerProfile.logo} alt="Company Logo" />
                                                ) : (
                                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                                )}
                                            </div>
                                            
                                            <div className="twm-mid-content">
                                                <h4 className="twm-job-title">
                                                    {job.title}
                                                    <span className={`twm-job-post-duration ${job.status === 'active' ? 'text-success' : 'text-muted'}`}>
                                                        / {job.status}
                                                    </span>
                                                </h4>
                                                <p className="twm-job-address">
                                                    <i className="feather-map-pin" />
                                                    {job.location}
                                                </p>
                                                <div className="twm-job-self-mid">
                                                    <div className="twm-job-self-mid-left">
                                                        <div className="twm-jobs-amount">
                                                            {job.salary?.min && job.salary?.max ? 
                                                                `₹${job.salary.min/1000}K - ${job.salary.max/1000}K` : 
                                                                'Salary not specified'
                                                            }
                                                        </div>
                                                        <span className="twm-job-type">{job.jobType}</span>
                                                    </div>
                                                    <div className="twm-job-self-mid-right">
                                                        <div className="twm-job-self-bottom">
                                                            <span className="job-time">
                                                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twm-job-description">
                                                    <p>{job.description?.substring(0, 150)}...</p>
                                                </div>
                                            </div>
                                            
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-category green">
                                                    <span className={`twm-bg-${job.status === 'active' ? 'green' : 'gray'}`}>
                                                        {job.status === 'active' ? 'Active' : 'Closed'}
                                                    </span>
                                                </div>
                                                <div className="twm-jobs-self-bottom">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleApply(job._id)}
                                                        disabled={job.status !== 'active'}
                                                    >
                                                        Apply Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CanPostedJobs;
