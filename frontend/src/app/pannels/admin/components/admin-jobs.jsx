import { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';

function AdminJobs() {
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
                <h2>Jobs Management</h2>
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
                <h2>Jobs Management</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dashboard</a><span>Jobs</span></div>
            </div>
            <div className="panel panel-default site-bg-white m-t30">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><i className="far fa-briefcase" />All Jobs ({jobs.length})</h4>
                </div>
                <div className="panel-body wt-panel-body">
                    {error && (
                        <div className="alert alert-danger m-b20">{error}</div>
                    )}
                    <div className="p-a20 table-responsive">
                        <table className="table twm-table table-striped table-borderless">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Job Type</th>
                                    <th>Location</th>
                                    <th>Posted Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
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
                                                <strong>{job.title}</strong>
                                                <br />
                                                <small className="text-muted">{job.description?.substring(0, 50)}...</small>
                                            </td>
                                            <td>{job.company || job.employerId?.companyName || 'N/A'}</td>
                                            <td>
                                                <div className="twm-jobs-category">
                                                    <span className={getJobTypeColor(job.jobType)}>{job.jobType}</span>
                                                </div>
                                            </td>
                                            <td>{job.location}</td>
                                            <td>{formatDate(job.createdAt)}</td>
                                            <td>
                                                <span className={job.status === 'active' ? 'text-clr-green2' : 'text-muted'}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    title="View" 
                                                    data-bs-toggle="tooltip" 
                                                    data-bs-placement="top"
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                >
                                                    <i className="fa fa-eye" />
                                                </button>
                                                <button 
                                                    title="Delete" 
                                                    data-bs-toggle="tooltip" 
                                                    data-bs-placement="top"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteJob(job._id)}
                                                >
                                                    <i className="fa fa-trash-alt" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminJobs;
