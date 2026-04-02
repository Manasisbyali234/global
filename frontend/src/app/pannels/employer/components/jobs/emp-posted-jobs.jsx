import { showSuccess, showError } from '../../../../../utils/popupNotification';
import { formatDate as formatDateUtil } from '../../../../../utils/dateFormatter';
import { AlertCircle, Building2, Calendar, Edit, Eye, MapPin, Pause, Play, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import './emp-posted-jobs.css';
import './emp-posted-jobs-mobile-button-fix.css';

export default function EmpPostedJobs() {
	const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [applicationCounts, setApplicationCounts] = useState({});
    
    useEffect(() => {
        loadScript("js/custom.js");
        fetchJobs();
    }, []);

    useEffect(() => {
        // Filter by status first
        let next = jobs;
        if (statusFilter === 'active') {
            next = jobs.filter(job => job.status === 'active');
        } else if (statusFilter === 'inactive') {
            next = jobs.filter(job => job.status !== 'active');
        }
        // Then filter by search text (title, location, and company name)
        const query = (searchText || '').trim().toLowerCase();
        if (query) {
            next = next.filter(job => {
                const title = (job.title || '').toLowerCase();
                const location = Array.isArray(job.location) ? job.location.join(' ').toLowerCase() : (typeof job.location === 'string' ? job.location : '').toLowerCase();
                const companyName = (job.companyName || '').toLowerCase();
                
                // Search in title, location, and company name for all employer types
                return title.includes(query) || location.includes(query) || companyName.includes(query);
            });
        }
        setFilteredJobs(next);
    }, [jobs, statusFilter, searchText]);

    const jobSuggestions = useMemo(() => {
        const suggestions = new Set();
        jobs.forEach((job) => {
            const title = job.title;
            if (title && String(title).trim() !== "") {
                suggestions.add(String(title).trim());
            }
        });
        return Array.from(suggestions).sort((a, b) => a.localeCompare(b));
    }, [jobs]);


    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) return;

            const response = await fetch('http://localhost:5000/api/employer/jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const nonDraftJobs = (data.jobs || []).filter(
                    (job) => (job?.status || '').toLowerCase() !== 'draft'
                );
                setJobs(nonDraftJobs);
                setFilteredJobs(nonDraftJobs);
                fetchApplicationCounts(nonDraftJobs);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationCounts = async (jobsList) => {
        try {
            const token = localStorage.getItem('employerToken');
            const counts = {};
            
            await Promise.all(jobsList.map(async (job) => {
                try {
                    const response = await fetch(`http://localhost:5000/api/employer/jobs/${job._id}/applications`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        counts[job._id] = data.applications.length;
                    }
                } catch (error) {
                    
                    counts[job._id] = 0;
                }
            }));
            
            setApplicationCounts(counts);
        } catch (error) {
            
        }
    };

    const handleJobClick = (jobId) => {
        navigate(`/employer/candidates-list/${jobId}`);
    };


    const formatDate = (dateString) => {
        return formatDateUtil(dateString);
    };

    const getStatusBadge = (status) => {
        return status === 'active' ? 'twm-bg-green' : 'twm-bg-red';
    };

    // Simple utility for job CTC text
    const formatCtc = (job) => {
     if (!job.ctc || job.ctc.min <= 0) return 'CTC not specified';
     if (job.ctc.min === job.ctc.max) return `₹${(job.ctc.min/100000).toFixed(0)}LPA`;
     return `₹${(job.ctc.min/100000).toFixed(0)} - ${(job.ctc.max/100000).toFixed(0)} LPA`;
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`http://localhost:5000/api/employer/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                showSuccess('Job deleted successfully!');
                fetchJobs();
            } else {
                showError('Failed to delete job');
            }
        } catch (error) {
            
            showError('Failed to delete job');
        }
    };

    const handleStatusToggle = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`http://localhost:5000/api/employer/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                showSuccess(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
                fetchJobs();
            } else {
                showError('Failed to update job status');
            }
        } catch (error) {
            
            showError('Failed to update job status');
        }
    };

	return (
		<div className="twm-right-section-panel site-bg-gray emp-posted-jobs-page" style={{
			width: '100%',
			margin: 0,
			padding: 0,
			background: '#f7f7f7',
			minHeight: '100vh'
		}}>
			{/* Header */}
			<div className="employer-page-shell employer-page-shell--header">
				<div className="wt-admin-right-page-header clearfix employer-page-header-card" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
					<h2 className="employer-page-title">Manage Interview</h2>
					<p className="employer-page-subtitle" style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
						Review your posted jobs, track applications, and manage listing status from one place.
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="employer-page-shell employer-page-shell--content">
				<div className="panel panel-default site-bg-white p-3 employer-page-content-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
				<div className="panel-heading wt-panel-heading mb-3 d-flex justify-content-between">
                    <div>
                        <h4 className="panel-tittle">
                            <i className="far fa-list-alt" /> Job Listing
                        </h4>

                        <p className="text-muted">View job details, monitor applications, and open each listing for interview workflow updates.</p>
                    </div>
					
				</div>

				<div className="panel-body wt-panel-body">
					<div className="mb-4 d-flex flex-wrap gap-3 justify-content-between align-items-center">
						<div className="position-relative" style={{maxWidth: '360px', flex: '1 1 300px'}}>
							<i className="fa fa-search position-absolute" style={{left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ff6b35', fontSize: '16px', zIndex: 10}}></i>
							<input
								type="text"
								className="form-control ps-5"
								placeholder="Search by title, location, or company name..."
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								list="job-title-suggestions"
								style={{paddingLeft: '40px'}}
							/>
							<datalist id="job-title-suggestions">
								{jobSuggestions.map((title) => (
									<option key={title} value={title} />
								))}
							</datalist>
						</div>
						<div className="d-flex gap-2">
							<button 
								type="button" 
								className={`btn ${statusFilter === 'all' ? 'btn-outline-primary' : 'btn-outline-primary'}`}
								onClick={() => setStatusFilter('all')}
							>
								All
							</button>
							<button 
								type="button" 
								className={`btn ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
								onClick={() => setStatusFilter('active')}
							>
								Active
							</button>
							<button 
								type="button" 
								className={`btn ${statusFilter === 'inactive' ? 'btn-secondary' : 'btn-outline-secondary'}`}
								onClick={() => setStatusFilter('inactive')}
							>
								Inactive
							</button>
						</div>
					</div>

					{loading ? (
						<div className="text-center py-4">
							<div className="spinner-border" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					) : (
						<div className="row">
                            {filteredJobs.length === 0 ? (
                                <div className="col-12 text-center py-4">
                                    <p className="text-muted">No jobs posted yet.</p>
                                </div>
                            ) : (
								filteredJobs.map((job) => (
									<div className="col-lg-6 col-12" key={job._id}>
										<div className="manage-jobs-card p-4 border rounded-3 mb-4 shadow-sm bg-white position-relative" style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => handleJobClick(job._id)}>
											{/* Top Section: Title and Status */}
											<div className="d-flex justify-content-between align-items-start mb-3 manage-jobs-card__header">
												<h5 className="mb-0 fw-bold text-dark manage-jobs-card__title" style={{fontSize: '1.2rem'}}>{job.title}</h5>
												{job.status !== 'closed' && (
													<span className={`badge ${getStatusBadge(job.status)} text-capitalize px-3 py-2 rounded-pill`}>
														{job.status}
													</span>
												)}
											</div>

											{/* Company and Location */}
											<div className="mb-3 manage-jobs-card__meta">
												{job.companyName && (
													<div className="d-flex align-items-center mb-1 text-muted manage-jobs-card__meta-row">
														<Building2 size={16} className="me-2" style={{ color: '#fd7e14' }} />
														<span className="fw-medium">{job.companyName}</span>
													</div>
												)}
												<div className="d-flex align-items-center text-muted manage-jobs-card__meta-row manage-jobs-card__location-row">
													<MapPin size={16} className="me-2 manage-jobs-card__location-icon" style={{ color: '#fd7e14' }} />
													<span className="manage-jobs-card__location-text">{Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'N/A')}</span>
												</div>
											</div>

											{/* Middle Section: Info Tags */}
											<div className="d-flex flex-wrap gap-2 mb-3 manage-jobs-card__chips">
												<div className="px-3 py-1 bg-light border rounded-pill small fw-bold text-dark">
													Annual CTC: {formatCtc(job)}
												</div>
												<div className="px-3 py-1 bg-light border rounded-pill small fw-bold text-dark">
													Vacancies: {job.vacancies || 0}
												</div>
												<div className="px-3 py-1 bg-light border rounded-pill small fw-bold text-primary">
													Applications: {applicationCounts[job._id] || 0}
												</div>
											</div>

											{/* Subtle Divider */}
											<hr className="my-3 opacity-10" />

											{/* Bottom Section: Dates and Action */}
											<div className="d-flex justify-content-between align-items-end manage-jobs-card__footer">
												<div className="text-muted small manage-jobs-card__dates" style={{ marginRight: '16px', flex: '1 1 auto' }}>
													<div className="d-flex align-items-center mb-1 manage-jobs-card__date-row">
														<Calendar size={14} className="me-2" />
														<span>Posted: {formatDate(job.createdAt)}</span>
													</div>
													{job.status === 'closed' && (
														<div className="d-flex align-items-center mt-1 text-danger fw-bold manage-jobs-card__date-row">
															<AlertCircle size={14} className="me-2" />
															<span style={{ whiteSpace: 'nowrap' }}>Status: Application Closed</span>
														</div>
													)}
													{job.offerLetterDate && (
														<div className="d-flex align-items-center manage-jobs-card__date-row">
															<Calendar size={14} className="me-2" />
															<span>Offer Date: {formatDate(job.offerLetterDate)}</span>
														</div>
													)}
												</div>

												<div className="manage-jobs-card__action" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '-8px' }}>
													<button
														className="btn border-0 text-white px-4 py-2 fw-bold rounded-3 shadow-sm"
														style={{ backgroundColor: '#fd7e14' }}
														onClick={() => navigate(`/employer/emp-job-review/${job._id}`)}
													>
														View Interview
													</button>
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>
				</div>
			</div>

		</div>
	);
}

