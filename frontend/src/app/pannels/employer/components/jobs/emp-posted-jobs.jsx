import { showSuccess, showError } from '../../../../../utils/popupNotification';
import { formatDate as formatDateUtil } from '../../../../../utils/dateFormatter';
import { AlertCircle, Building2, Calendar, Edit, Eye, MapPin, Pause, Play, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import { formatJobTitle } from "../../../../../utils/jobTitleFormatter";
import './emp-posted-jobs.css';
import './emp-posted-jobs-mobile-button-fix.css';

export default function EmpPostedJobs() {
	const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [designationFilter, setDesignationFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [dateFilterField, setDateFilterField] = useState('createdAt');
    const [postedDateFrom, setPostedDateFrom] = useState('');
    const [postedDateTo, setPostedDateTo] = useState('');
    const [applicationCounts, setApplicationCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    const parseFilterDateInput = (value) => {
        if (!value) return null;
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    };

    const getEndOfDay = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    };

    const getDateFilterValue = (job) => {
        if (dateFilterField === 'lastDateOfApplication') return job?.lastDateOfApplication;
        if (dateFilterField === 'offerLetterDate') return job?.offerLetterDate;
        return job?.createdAt;
    };
    
    useEffect(() => {
        loadScript("js/custom.js");
        fetchJobs();
    }, []);

    useEffect(() => {
        // Filter by status first
        let next = jobs;
        if (statusFilter === 'active') {
            next = jobs.filter(job => getDisplayStatus(job) === 'active');
        } else if (statusFilter === 'closed') {
            next = jobs.filter(job => getDisplayStatus(job) === 'closed');
        }
        if (designationFilter !== 'all') {
            next = next.filter(job => String(job.title || '').trim().toLowerCase() === designationFilter);
        }
        // Then filter by search text (company name only)
        const query = (searchText || '').trim().toLowerCase();
        if (query) {
            next = next.filter(job => (job.companyName || '').toLowerCase().includes(query));
        }
        const fromInputDate = parseFilterDateInput(postedDateFrom);
        const toInputDate = parseFilterDateInput(postedDateTo);
        const startDate = fromInputDate && toInputDate
            ? new Date(Math.min(fromInputDate.getTime(), toInputDate.getTime()))
            : fromInputDate;
        const endDate = fromInputDate && toInputDate
            ? getEndOfDay(new Date(Math.max(fromInputDate.getTime(), toInputDate.getTime())))
            : getEndOfDay(toInputDate);
        if (startDate || endDate) {
            next = next.filter((job) => {
                const filterDateValue = getDateFilterValue(job);
                if (!filterDateValue) return false;

                const filterDate = new Date(filterDateValue);
                if (Number.isNaN(filterDate.getTime())) return false;
                if (startDate && filterDate < startDate) return false;
                if (endDate && filterDate > endDate) return false;
                return true;
            });
        }
        setFilteredJobs(next);
        setCurrentPage(1);
    }, [jobs, statusFilter, designationFilter, searchText, postedDateFrom, postedDateTo, dateFilterField]);

    const jobSuggestions = useMemo(() => {
        const suggestions = new Set();
        jobs.forEach((job) => {
            const name = job.companyName;
            if (name && String(name).trim() !== "") {
                suggestions.add(String(name).trim());
            }
        });
        return Array.from(suggestions).sort((a, b) => a.localeCompare(b));
    }, [jobs]);

    const designationOptions = useMemo(() => {
        const titles = new Set();
        jobs.forEach((job) => {
            const title = String(job.title || '').trim();
            if (title) {
                titles.add(title);
            }
        });
        return Array.from(titles).sort((a, b) => a.localeCompare(b));
    }, [jobs]);

    const hasActiveFilters = useMemo(() => {
        return statusFilter !== 'all'
            || designationFilter !== 'all'
            || Boolean((searchText || '').trim())
            || Boolean(postedDateFrom)
            || Boolean(postedDateTo);
    }, [statusFilter, designationFilter, searchText, postedDateFrom, postedDateTo]);


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

    const isOfferLetterDatePassed = (job) => {
        if (!job?.offerLetterDate) return false;

        const offerDate = new Date(job.offerLetterDate);
        if (Number.isNaN(offerDate.getTime())) return false;

        // Keep the job open through the full offer-letter date and close it the day after.
        const offerDateEnd = new Date(
            offerDate.getFullYear(),
            offerDate.getMonth(),
            offerDate.getDate(),
            23, 59, 59, 999
        );

        return Date.now() > offerDateEnd.getTime();
    };

    const getDisplayStatus = (job) => {
        const normalizedStatus = String(job?.status || '').trim().toLowerCase();
        if (normalizedStatus === 'closed') return 'closed';
        if (isOfferLetterDatePassed(job)) return 'closed';
        return normalizedStatus || 'active';
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
					<div className="manage-jobs-toolbar d-flex flex-wrap gap-3 justify-content-between align-items-end">
						<div className="position-relative" style={{maxWidth: '360px', flex: '1 1 300px', alignSelf: 'flex-end'}}>
							<i className="fa fa-search position-absolute" style={{left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ff6b35', fontSize: '16px', zIndex: 10}}></i>
							<input
								type="text"
								className="form-control ps-5"
								placeholder="Search by company name..."
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
                        <div style={{minWidth: '220px', flex: '0 1 240px', alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', gap: '0.35rem', height: '100%', boxSizing: 'border-box'}}>
                            <label style={{color: '#4b5563', fontSize: '0.875rem', fontWeight: '600', margin: '0', lineHeight: '1.2', height: '16px'}} className="manage-jobs-toolbar__position-label">Position</label>
                            <select
                                className="form-select"
                                value={designationFilter}
                                onChange={(e) => setDesignationFilter(e.target.value)}
                                style={{height: '48px', minHeight: '48px', boxSizing: 'border-box'}}
                            >
                                <option value="all">All Designation</option>
                                {designationOptions.map((designation) => (
                                    <option key={designation} value={designation.toLowerCase()}>
                                        {formatJobTitle(designation)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="manage-jobs-toolbar__date-group">
                            <label className="manage-jobs-toolbar__date-label">Filter by Date</label>
                            <div className="manage-jobs-toolbar__date-fields">
                                <select
                                    className="form-select manage-jobs-toolbar__date-type"
                                    value={dateFilterField}
                                    onChange={(e) => setDateFilterField(e.target.value)}
                                    aria-label="Select job date field to filter"
                                >
                                    <option value="createdAt">Posted Date</option>
                                    <option value="lastDateOfApplication">Last Application Date</option>
                                    <option value="offerLetterDate">Offer Date</option>
                                </select>
                                <input
                                    type="date"
                                    className="form-control manage-jobs-toolbar__date-input"
                                    value={postedDateFrom}
                                    onChange={(e) => setPostedDateFrom(e.target.value)}
                                    aria-label="Filter jobs from posted date"
                                />
                                <span className="manage-jobs-toolbar__date-separator">to</span>
                                <input
                                    type="date"
                                    className="form-control manage-jobs-toolbar__date-input"
                                    value={postedDateTo}
                                    onChange={(e) => setPostedDateTo(e.target.value)}
                                    aria-label="Filter jobs to posted date"
                                />
                                {(postedDateFrom || postedDateTo) && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary manage-jobs-toolbar__clear-btn"
                                        onClick={() => {
                                            setPostedDateFrom('');
                                            setPostedDateTo('');
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="manage-jobs-toolbar__status-group">
                            <label className="manage-jobs-toolbar__status-label">Filter by Status</label>
                            <div className="manage-jobs-toolbar__status-buttons d-flex gap-2">
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
								className={`btn ${statusFilter === 'closed' ? 'btn-secondary' : 'btn-outline-secondary'}`}
								onClick={() => setStatusFilter('closed')}
							>
								Closed
							</button>
                            </div>
						</div>
					</div>

					{loading ? (
						<div className="text-center py-4">
							<div className="spinner-border" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					) : (
						<div className="row manage-jobs-grid">
                            {filteredJobs.length === 0 ? (
                                <div className="col-12 text-center py-4">
                                    <p className="text-muted">
                                        {jobs.length === 0
                                            ? 'No jobs posted yet.'
                                            : hasActiveFilters
                                                ? 'No jobs match the selected filters.'
                                                : 'No jobs available.'}
                                    </p>
                                </div>
                            ) : (
								filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((job) => {
									const displayStatus = getDisplayStatus(job);
									return (
									<div className="col-lg-6 col-12" key={job._id}>
										<div className="manage-jobs-card p-4 border rounded-3 mb-4 shadow-sm bg-white position-relative" style={{cursor: 'pointer', transition: 'all 0.3s ease'}} onClick={() => handleJobClick(job._id)}>
											{/* Top Section: Title and Status */}
											<div className="d-flex justify-content-between align-items-start mb-3 manage-jobs-card__header">
												<h5 className="mb-0 fw-bold text-dark manage-jobs-card__title" style={{fontSize: '1.2rem'}}>{formatJobTitle(job.title)}</h5>
												{displayStatus !== 'closed' && (
													<span className={`badge ${getStatusBadge(displayStatus)} text-capitalize px-3 py-2 rounded-pill`}>
														{displayStatus}
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
                                                    {job.lastDateOfApplication && (
                                                        <div className="d-flex align-items-center manage-jobs-card__date-row">
                                                            <Calendar size={14} className="me-2" />
                                                            <span>Last Apply: {formatDate(job.lastDateOfApplication)}</span>
                                                        </div>
                                                    )}
													{displayStatus === 'closed' && (
														<div className="d-flex align-items-center mt-1 text-danger fw-bold manage-jobs-card__date-row">
															<AlertCircle size={14} className="" />
															<span style={{ whiteSpace: 'nowrap' }}>Application Status: Closed</span>
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
								);
								})
							)}
						</div>
					)}
					{!loading && filteredJobs.length > 0 && (
						<div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
							<div style={{ color: "#6c757d", fontSize: "13px" }}>
								Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
							</div>
							{Math.ceil(filteredJobs.length / PAGE_SIZE) > 1 && (
								<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
									<button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
									{Array.from({ length: Math.ceil(filteredJobs.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
										<button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
									))}
									<button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredJobs.length / PAGE_SIZE)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === Math.ceil(filteredJobs.length / PAGE_SIZE) ? "#f8f9fa" : "#fff", color: currentPage === Math.ceil(filteredJobs.length / PAGE_SIZE) ? "#adb5bd" : "#495057", cursor: currentPage === Math.ceil(filteredJobs.length / PAGE_SIZE) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
								</div>
							)}
						</div>
					)}
				</div>
				</div>
			</div>

		</div>
	);
}

