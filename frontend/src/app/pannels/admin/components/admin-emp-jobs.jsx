import { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';

function AdminEmployerJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.getAllJobs();
            if (response.success) {
                setJobs(response.data);
            } else {
                setError(response.message || 'Failed to fetch jobs');
            }
        } catch (error) {
            setError('Error fetching jobs');
            
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                const response = await api.adminDeleteJob(jobId);
                if (response.success) {
                    setJobs(jobs.filter(job => job._id !== jobId));
                } else {
                    alert('Failed to delete job');
                }
            } catch (error) {
                alert('Error deleting job');
                
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getJobTypeColor = (type) => {
        const colors = {
            'Full-time': 'twm-bg-purple',
            'Part-time': 'twm-bg-green',
            'Contract': 'twm-bg-brown',
            'Internship': 'twm-bg-sky',
            'Freelance': 'twm-bg-golden'
        };
        return colors[type] || 'twm-bg-green';
    };

    if (loading) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Employer Jobs</h2>
                <div className="panel panel-default site-bg-white m-t30">
                    <div className="panel-body wt-panel-body p-a20">
                        <div className="text-center">Loading jobs...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Employer Jobs</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dashboard</a><span>Employer Jobs</span></div>
            </div>
            <div className="twm-pro-view-chart-wrap">
                <div className="col-lg-12 col-md-12 mb-4">
                    <div className="panel panel-default site-bg-white m-t30">
                        <div className="panel-heading wt-panel-heading p-a20">
                            <h4 className="panel-tittle m-a0"><i className="far fa-briefcase" />All Posted Jobs ({jobs.length})</h4>
                        </div>
                        <div className="panel-body wt-panel-body">
                            {error && (
                                <div className="alert alert-danger m-b20">{error}</div>
                            )}
                            <div className="twm-D_table p-a20 table-responsive">
                                <table id="jobs_bookmark_table" className="table table-bordered twm-bookmark-list-wrap">
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Job Type</th>
                                            <th>Company</th>
                                            <th>Location</th>
                                            <th>Posted Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">No jobs found</td>
                                            </tr>
                                        ) : (
                                            jobs.map((job) => (
                                                <tr key={job._id}>
                                                    <td>
                                                        <div className="twm-bookmark-list">
                                                            <div className="twm-mid-content">
                                                                <a href="#" className="twm-job-title">
                                                                    <h4>{job.title}</h4>
                                                                </a>
                                                                <p className="twm-bookmark-address">
                                                                    <i className="feather-map-pin" />{job.location}
                                                                </p>
                                                                <div className="twm-job-websites site-text-primary">
                                                                    {job.description?.substring(0, 100)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="twm-jobs-category">
                                                            <span className={getJobTypeColor(job.jobType)}>{job.jobType}</span>
                                                        </div>
                                                    </td>
                                                    <td>{job.company || job.employerId?.companyName || 'N/A'}</td>
                                                    <td>{job.location}</td>
                                                    <td><div className="twm-job-post-duration">{formatDate(job.createdAt)}</div></td>
                                                    <td>
                                                        <span className={job.status === 'active' ? 'text-clr-green2' : 'text-muted'}>
                                                            {job.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="twm-table-controls">
                                                            <ul className="twm-DT-controls-icon list-unstyled">
                                                                <li>
                                                                    <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                        <span className="fa fa-eye" />
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                        <span className="far fa-envelope-open" />
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        title="Delete" 
                                                                        data-bs-toggle="tooltip" 
                                                                        data-bs-placement="top"
                                                                        onClick={() => handleDeleteJob(job._id)}
                                                                    >
                                                                        <span className="far fa-trash-alt" />
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Job Type</th>
                                            <th>Company</th>
                                            <th>Location</th>
                                            <th>Posted Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminEmployerJobs;
