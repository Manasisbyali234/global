import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import { formatDate as formatDateUtil } from '../../../../../utils/dateFormatter';
import { Building2, Calendar, Edit, Eye, MapPin, Pause, Play, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import { employer, empRoute } from "../../../../../globals/route-names";
import TermsModal from "../../../../../components/TermsModal";
import './emp-posted-jobs.css';
import './emp-posted-jobs-mobile-button-fix.css';

export default function EmpPostedJobs() {
	const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(false);
    const [employerType, setEmployerType] = useState('company');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [applicationCounts, setApplicationCounts] = useState({});
    const [showEmployerInstructionsModal, setShowEmployerInstructionsModal] = useState(false);
    
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
    }, [jobs, statusFilter, searchText, employerType]);

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

            // Fetch employer profile to check approval status
            const profileResponse = await fetch('http://localhost:5000/api/employer/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log('Profile data:', profileData);
                
                // If profile is null, fetch employer data directly
                if (!profileData.profile) {
                    const employerResponse = await fetch('http://localhost:5000/api/employer/profile/completion', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (employerResponse.ok) {
                        const completionData = await employerResponse.json();
                        setIsApproved(completionData.isApproved || false);
                        setEmployerType('company');
                    }
                } else {
                    const employerData = profileData.profile?.employerId;
                    console.log('Employer data:', employerData);
                    setIsApproved(employerData?.isApproved || false);
                    setEmployerType(employerData?.employerType || 'company');
                }
            }

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

    const handleOpenPostJobFlow = () => {
        setShowEmployerInstructionsModal(true);
    };

    const handleAcceptEmployerInstructions = () => {
        setShowEmployerInstructionsModal(false);
        navigate(empRoute(employer.POST_A_JOB));
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
			<div style={{ padding: '2rem 2rem 2rem 2rem' }}>
				<div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
					<h2>Manage Jobs</h2>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 2rem 2rem 2rem' }}>
				<div className="panel panel-default site-bg-white p-3" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
				<div className="panel-heading wt-panel-heading mb-3 d-flex justify-content-between">
                    <div>
                        <h4 className="panel-tittle">
                            <i className="far fa-list-alt" /> Job Listing
                        </h4>

                        <p className="text-muted"> <span style={{ color: "red", fontWeight: "600" }}>Please Note:</span> Review and manage jobs details</p>
                    </div>
					
                    <div className="text-left">
                        {isApproved ? (
                            <button type="button" className="site-button" onClick={handleOpenPostJobFlow}>
                                Post Job
                            </button>
                        ) : (
                            <div>
                                <button type="button" className="site-button" disabled>
                                    Post Job
                                </button>
                                <div className="alert alert-warning mt-2 mb-0 d-flex align-items-center" style={{fontSize: '14px', padding: '8px 12px'}}>
                                    <i className="fas fa-clock me-2" style={{color: '#856404'}}></i>
                                    <strong>Account verification in progress</strong>
                                </div>
                            </div>
                        )}
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
                                    {isApproved ? (
                                        <button type="button" className="site-button" onClick={handleOpenPostJobFlow}>
                                            Post Your First Job
                                        </button>
                                    ) : (
                                        <div>
                                            <button className="site-button" disabled>Post Your First Job</button>
											<div className="alert alert-warning mt-3 d-flex align-items-center justify-content-center" style={{maxWidth: '500px', margin: '16px auto'}}>
												<i className="fas fa-exclamation-triangle me-2" style={{color: '#856404'}}></i>
												<div>
													<strong>Account verification pending</strong><br/>
													<small>Job posting will be available after admin approval.</small>
												</div>
											</div>
										</div>
									)}
								</div>
							) : (
								filteredJobs.map((job) => (
									<div className="col-lg-6 col-12" key={job._id}>
										<div className="manage-jobs-card p-4 border rounded-3 mb-4 shadow-sm bg-white position-relative" style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => handleJobClick(job._id)}>
											{/* Top Section: Title and Status */}
											<div className="d-flex justify-content-between align-items-start mb-3">
												<h5 className="mb-0 fw-bold text-dark" style={{fontSize: '1.2rem'}}>{job.title}</h5>
												{job.status !== 'closed' && (
													<span className={`badge ${getStatusBadge(job.status)} text-capitalize px-3 py-2 rounded-pill`}>
														{job.status}
													</span>
												)}
											</div>

											{/* Company and Location */}
											<div className="mb-3">
												{job.companyName && (
													<div className="d-flex align-items-center mb-1 text-muted">
														<Building2 size={16} className="me-2" style={{ color: '#fd7e14' }} />
														<span className="fw-medium">{job.companyName}</span>
													</div>
												)}
												<div className="d-flex align-items-center text-muted">
													<MapPin size={16} className="me-2" style={{ color: '#fd7e14' }} />
													<span>{Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'N/A')}</span>
												</div>
											</div>

											{/* Middle Section: Info Tags */}
											<div className="d-flex flex-wrap gap-2 mb-3">
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
											<div className="d-flex justify-content-between align-items-end">
												<div className="text-muted small">
													<div className="d-flex align-items-center mb-1">
														<Calendar size={14} className="me-2" />
														<span>Posted: {formatDate(job.createdAt)}</span>
													</div>
													{job.offerLetterDate && (
														<div className="d-flex align-items-center">
															<Calendar size={14} className="me-2" />
															<span>Offer Date: {formatDate(job.offerLetterDate)}</span>
														</div>
													)}
													{job.status === 'closed' && (
														<div className="mt-1 text-danger fw-bold">
															Status: Closed
														</div>
													)}
												</div>

												<div onClick={(e) => e.stopPropagation()}>
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

            <TermsModal
                isOpen={showEmployerInstructionsModal}
                onClose={() => setShowEmployerInstructionsModal(false)}
                onAccept={handleAcceptEmployerInstructions}
                role="employerJobPosting"
            />
		</div>
	);
}

