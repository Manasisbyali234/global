import { useState, useEffect } from 'react';
import JobZImage from "../../../../common/jobz-img";
import { api } from '../../../../utils/api';
import './emp-manage-jobs.css';

function EmpManageJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.getEmployerJobs();
            if (response.success) {
                 // Debug log
                setJobs(response.jobs || []);
            } else {
                setError(response.message || 'Failed to fetch jobs');
            }
        } catch (error) {
            setError('Error fetching jobs');
            
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': { className: 'status-active', text: 'Active', icon: 'fa-check-circle' },
            'inactive': { className: 'status-inactive', text: 'Inactive', icon: 'fa-pause-circle' },
            'pending': { className: 'status-pending', text: 'Pending', icon: 'fa-clock' },
            'closed': { className: 'status-closed', text: 'Closed', icon: 'fa-times-circle' },
            'expired': { className: 'status-expired', text: 'Expired', icon: 'fa-calendar-times' }
        };
        const config = statusConfig[status] || { className: 'status-unknown', text: 'Unknown', icon: 'fa-question-circle' };
        return (
            <span className={`status-badge ${config.className}`}>
                <i className={`fa ${config.icon}`}></i>
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleDelete = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                const response = await api.deleteJob(jobId);
                if (response.success) {
                    setJobs(jobs.filter(job => job._id !== jobId));
                    alert('Job deleted successfully');
                } else {
                    alert('Failed to delete job');
                }
            } catch (error) {
                alert('Error deleting job');
                
            }
        }
    };

    if (loading) {
        return (
            <div className="manage-jobs-container">
                <div className="page-header">
                    <h2><i className="fa fa-briefcase"></i> Manage Jobs</h2>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner">
                        <i className="fa fa-spinner fa-spin"></i>
                        <p>Loading your jobs...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="manage-jobs-container">
            <div className="page-header">
                <div className="header-content">
                    <h2><i className="fa fa-briefcase"></i> Manage Jobs</h2>
                    <div className="breadcrumbs">
                        <span><i className="fa fa-home"></i> Home</span>
                        <span><i className="fa fa-angle-right"></i> Dashboard</span>
                        <span><i className="fa fa-angle-right"></i> My Job Listings</span>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <div className="stat-number">{jobs.length}</div>
                        <div className="stat-label">Total Jobs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{jobs.filter(job => job.status === 'active').length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-alert">
                    <i className="fa fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}

            <div className="jobs-panel">
                <div className="panel-header">
                    <h4><i className="fa fa-list"></i> Job Listings ({jobs.length})</h4>
                    <button className="btn-add-job" onClick={() => window.location.href = '/employer/post-job'}>
                        <i className="fa fa-plus"></i> Post New Job
                    </button>
                </div>
                
                <div className="jobs-table-container">
                    {jobs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fa fa-briefcase"></i>
                            </div>
                            <h3>No Jobs Posted Yet</h3>
                            <p>Start by posting your first job to attract talented candidates.</p>
                            <button className="btn-primary" onClick={() => window.location.href = '/employer/post-job'}>
                                <i className="fa fa-plus"></i> Post Your First Job
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="jobs-table">
                                <thead>
                                    <tr>
                                        <th>Job Details</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Vacancies</th>
                                        <th>Applications</th>
                                        <th>Dates</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job._id} className="job-row">
                                            <td data-label="Job Details">
                                                <div className="job-info">
                                                    <div className="job-avatar">
                                                        <i className="fa fa-briefcase"></i>
                                                    </div>
                                                    <div className="job-details">
                                                        <h5 className="job-title">{job.title}</h5>
                                                        <p className="job-location">
                                                            <i className="fa fa-map-marker-alt"></i>
                                                            {job.location || 'Remote'}
                                                        </p>
                                                        {job.ctc && typeof job.ctc === 'object' && job.ctc.min > 0 && job.ctc.max > 0 ? (
                                                            <p className="job-salary">
                                                                <i className="fa fa-dollar-sign"></i>
                                                                {job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA`}
                                                            </p>
                                                        ) : (
                                                            <p className="job-salary">
                                                                <i className="fa fa-dollar-sign"></i>
                                                                CTC: Not specified
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Category">
                                                <span className="category-tag">
                                                    {job.category || 'General'}
                                                </span>
                                            </td>
                                            <td data-label="Status">{getStatusBadge(job.status)}</td>
                                            <td data-label="Vacancies">
                                                <div className="vacancies-count">
                                                    <span className="count">{job.vacancies || job.numberOfPositions || job.positions || 1}</span>
                                                    <span className="label">Vacancies</span>
                                                </div>
                                            </td>
                                            <td data-label="Applications">
                                                <div className="applications-count">
                                                    <span className="count">{job.applicationCount || 0}</span>
                                                    <span className="label">Applications</span>
                                                </div>
                                            </td>
                                            <td data-label="Dates">
                                                <div className="date-info">
                                                    <div className="created-date">
                                                        <small>Created:</small>
                                                        <span>{formatDate(job.createdAt)}</span>
                                                    </div>
                                                    <div className="expiry-date">
                                                        <small>Expires:</small>
                                                        <span>{job.expiryDate ? formatDate(job.expiryDate) : 'No expiry'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-action btn-view"
                                                        title="View Applications"
                                                        onClick={() => window.location.href = `/employer/job-applications/${job._id}`}
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-edit"
                                                        title="Edit Job"
                                                        onClick={() => window.location.href = `/employer/edit-job/${job._id}`}
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-delete"
                                                        title="Delete Job"
                                                        onClick={() => handleDelete(job._id)}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default EmpManageJobsPage;
