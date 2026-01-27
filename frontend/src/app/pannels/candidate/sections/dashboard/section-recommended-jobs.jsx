import { useEffect, useState } from 'react';
import { MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../../utils/api';
import './recommended-jobs.css';

function SectionRecommendedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecommendedJobs();
    }, []);

    const fetchRecommendedJobs = async () => {
        try {
            console.log('Fetching recommended jobs...');
            const response = await api.getRecommendedJobs();
            console.log('Recommended jobs response:', response);
            
            if (response.success) {
                setJobs(response.jobs || []);
                console.log('Set jobs:', response.jobs?.length || 0);
            } else {
                console.error('API returned error:', response.message);
                setError(response.message || 'Failed to fetch recommended jobs');
            }
        } catch (error) {
            console.error('Error fetching recommended jobs:', error);
            setError('Unable to load recommended jobs');
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (job) => {
        const salary = job.ctc || job.salary || job.netSalary;
        if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
        
        const formatLPA = (amount) => {
            const lpa = amount / 100000;
            return lpa % 1 === 0 ? `${lpa}` : lpa.toFixed(1);
        };
        
        if (salary.min && salary.max) {
            return `₹${formatLPA(salary.max)} LPA`;
        }
        return salary.min ? `₹${formatLPA(salary.min)}+ LPA` : `Up to ₹${formatLPA(salary.max)} LPA`;
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const jobDate = new Date(date);
        const diffTime = Math.abs(now - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    };

    if (loading) {
        return (
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">
                        <i className="fa fa-lightbulb-o site-text-primary me-2"></i>
                        Recommended Jobs
                    </h4>
                </div>
                <div className="panel-body wt-panel-body p-a20 text-center">
                    <i className="fa fa-spinner fa-spin fa-2x site-text-primary mb-3"></i>
                    <p className="text-muted">Loading recommendations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">
                        <i className="fa fa-lightbulb-o site-text-primary me-2"></i>
                        Recommended Jobs
                    </h4>
                </div>
                <div className="panel-body wt-panel-body p-a20 text-center">
                    <i className="fa fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                    <p className="text-muted">{error}</p>
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">
                        <i className="fa fa-lightbulb-o site-text-primary me-2"></i>
                        Recommended Jobs
                    </h4>
                </div>
                <div className="panel-body wt-panel-body p-a20 text-center">
                    <i className="fa fa-info-circle text-muted fa-2x mb-3"></i>
                    <p className="text-muted mb-2">No job recommendations available</p>
                    <small className="text-muted">Add skills to your profile to get personalized job recommendations</small>
                </div>
            </div>
        );
    }

    return (
        <div className="panel panel-default">
            <div className="panel-heading wt-panel-heading p-a20 recommended-jobs-header-wrapper">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-lightbulb-o site-text-primary me-2"></i>
                    Recommended Jobs
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                    Based on your skills and profile
                    <span className="badge bg-primary ms-2" style={{ fontSize: '0.75rem' }}>
                        {jobs.length}
                    </span>
                </p>
            </div>
            <div className="panel-body wt-panel-body p-0">
                <div className="job-recommendations-list">
                    {jobs.map((job, index) => (
                        <div 
                            key={job._id} 
                            className="job-recommendation-card"
                            style={{
                                padding: '1rem 1.25rem',
                                borderBottom: index < jobs.length - 1 ? '1px solid #e5e7eb' : 'none',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/job-detail/${job._id}`)}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                    <h6 className="mb-1" style={{ 
                                        color: '#111827', 
                                        fontWeight: '600',
                                        fontSize: '0.95rem'
                                    }}>
                                        {job.title}
                                    </h6>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span 
                                        className="badge"
                                        style={{
                                            backgroundColor: job.jobType === 'full-time' ? '#dcfdf7' : '#fef3c7',
                                            color: job.jobType === 'full-time' ? '#065f46' : '#92400e',
                                            fontSize: '0.7rem',
                                            fontWeight: '500',
                                            padding: '0.25rem 0.5rem'
                                        }}
                                    >
                                        {job.jobType?.replace('-', ' ') || 'Full Time'}
                                    </span>
                                    {job.matchScore && (
                                        <span 
                                            className="badge"
                                            style={{
                                                backgroundColor: job.matchScore >= 70 ? '#dcfdf7' : job.matchScore >= 40 ? '#fef3c7' : '#fee2e2',
                                                color: job.matchScore >= 70 ? '#065f46' : job.matchScore >= 40 ? '#92400e' : '#991b1b',
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                padding: '0.25rem 0.5rem'
                                            }}
                                        >
                                            {job.matchScore}% match
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-2" style={{ 
                                    color: '#6b7280', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    {job.employerId?.companyName || 'Company Name'}
                                </p>
                                
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    <div className="d-flex align-items-center" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        <MapPin size={12} className="me-1" />
                                        {Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'Location not specified')}
                                    </div>
                                    <div className="d-flex align-items-center" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        <Clock size={12} className="me-1" />
                                        {getTimeAgo(job.createdAt)}
                                    </div>
                                    {job.vacancies && (
                                        <div className="d-flex align-items-center" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            <Users size={12} className="me-1" />
                                            {job.vacancies} positions
                                        </div>
                                    )}
                                </div>

                                {(job.salary || job.ctc || job.netSalary) && (
                                    <div className="d-flex align-items-center mb-2" style={{ fontSize: '0.8rem', color: '#059669' }}>
                                        {formatSalary(job)}
                                    </div>
                                )}

                                {job.requiredSkills && job.requiredSkills.length > 0 && (
                                    <div className="d-flex flex-wrap gap-1">
                                        {job.requiredSkills.slice(0, 3).map((skill, skillIndex) => {
                                            const isMatching = job.matchingSkills && job.matchingSkills.includes(skill);
                                            return (
                                                <span 
                                                    key={skillIndex}
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: isMatching ? '#dcfdf7' : '#eff6ff',
                                                        color: isMatching ? '#065f46' : '#1d4ed8',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '500',
                                                        padding: '0.25rem 0.5rem',
                                                        border: isMatching ? '1px solid #10b981' : 'none'
                                                    }}
                                                >
                                                    {skill}
                                                    {isMatching && <i className="fa fa-check ms-1" style={{ fontSize: '0.6rem' }}></i>}
                                                </span>
                                            );
                                        })}
                                        {job.requiredSkills.length > 3 && (
                                            <span 
                                                className="badge"
                                                style={{
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#6b7280',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '500',
                                                    padding: '0.25rem 0.5rem'
                                                }}
                                            >
                                                +{job.requiredSkills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {jobs.length > 0 && (
                    <div className="p-3 text-center" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
                        <button 
                            className="btn btn-sm"
                            style={{ 
                                fontSize: '0.875rem',
                                backgroundColor: 'white',
                                color: '#6b7280',
                                border: '1px solid #d1d5db'
                            }}
                            onClick={() => window.location.href = '/job-grid'}
                        >
                            View All Jobs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SectionRecommendedJobs;
