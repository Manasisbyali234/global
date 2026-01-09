import { useNavigate } from 'react-router-dom';
import { isAuthenticated, redirectToLogin } from '../utils/auth';
import { formatCategory } from '../utils/formatCategory';
import '../job-card-buttons.css';

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const truncateText = (text, maxLength = 150) => {
        const cleanText = stripHtml(text);
        if (cleanText.length <= maxLength) return cleanText;
        return cleanText.substring(0, maxLength) + '...';
    };

    const handleApplyClick = () => {
        if (isAuthenticated('candidate')) {
            // User is logged in as candidate, proceed with application
            navigate(`/job-detail/${job._id}`);
        } else {
            // User not logged in, redirect to login
            redirectToLogin(navigate, `/job-detail/${job._id}`);
        }
    };

    const handleViewDetails = () => {
        navigate(`/job-detail/${job._id}`);
    };

    return (
        <div className="job-card">
            <div className="job-header">
                <h3>{job.title}</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                    {job.companyLogo && (
                        <img src={job.companyLogo} alt="Company Logo" style={{width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px'}} />
                    )}
                    <p style={{margin: 0}}>{job.companyName || job.employerId?.companyName || job.company}</p>
                </div>
                <span>{job.location}</span>
                <div className="posted-by-info" style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                    Posted by: {job.employerId?.employerType === 'consultant' ? 'Consultancy' : 'Company'}
                </div>
            </div>

            <div className="job-details">
                <p>{truncateText(job.description || 'No description available')}</p>
                <div className="job-meta">
                    <span>CTC: {job.ctc && job.ctc.min && job.ctc.max ?
                        job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA` :
                        'Not specified'}</span>
                    <span>Type: {job.jobType || job.type}</span>
                    {job.category && <span>Category: {formatCategory(job.category)}</span>}
                </div>
            </div>

            <div className="job-actions">
                <button onClick={handleViewDetails} className="btn-view">
                    View Details
                </button>
                <button onClick={handleApplyClick} className="btn-apply">
                    {isAuthenticated('candidate') ? 'Apply Now' : 'Login to Apply'}
                </button>
            </div>
        </div>
    );
};

export default JobCard;
