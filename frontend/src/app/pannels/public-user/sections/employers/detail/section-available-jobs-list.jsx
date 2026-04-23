

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicUser } from "../../../../../../globals/route-names";
import PageLoader from "../../../../../../components/PageLoader";
import { getJobDisplayLogo } from "../../../../../../utils/jobBranding";
import "../../../../../../new-job-card.css";

function SectionAvailableJobsList({ employerId }) {
	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (employerId) {
			fetchEmployerJobs();
		}
	}, [employerId]);

	const fetchEmployerJobs = async () => {
		try {
			console.log('Fetching jobs for employer:', employerId);
			const response = await fetch(`http://localhost:5000/api/public/jobs?employerId=${employerId}`);
			const data = await response.json();
			
			console.log('Jobs API response:', data);
			console.log('First job details:', data.jobs?.[0]);
			
			if (data.success) {
				// No filtering needed - backend already filters properly
				const validJobs = data.jobs || [];
				
				console.log('Valid jobs after filtering:', validJobs.length);
				setJobs(validJobs);
			} else {
				console.log('API returned success: false');
				setJobs([]);
			}
		} catch (error) {
			console.error('Error fetching jobs:', error);
			setJobs([]);
		} finally {
			setLoading(false);
		}
	};

	const formatSalary = (job) => {
		if (job.ctc && typeof job.ctc === "object" && (job.ctc.min > 0 || job.ctc.max > 0)) {
			const formatValue = (value) => {
				if (value > 100000) {
					return Math.floor(value / 100000);
				}
				return value;
			};
			
			if (job.ctc.min && job.ctc.max) {
				const minLPA = formatValue(job.ctc.min);
				const maxLPA = formatValue(job.ctc.max);
				return minLPA === maxLPA ? `₹${minLPA}LPA` : `₹${minLPA} - ${maxLPA} LPA`;
			} else {
				const lpa = formatValue(job.ctc.min || job.ctc.max);
				return `₹${lpa}LPA`;
			}
		}
		if (job.salary && (job.salary.min || job.salary.max)) {
			const currency = job.salary.currency === 'USD' ? '$' : '₹';
			if (job.salary.min && job.salary.max) {
				return `${currency}${job.salary.min} - ${currency}${job.salary.max}`;
			} else {
				return `${currency}${job.salary.min || job.salary.max}`;
			}
		}
		return 'Not specified';
	};

	const formatJobType = (jobType) => {
		return jobType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified';
	};

	const getPostedByLabel = (job) => {
		const rawPostedBy = job?.postedBy || job?.employerId?.employerType || job?.employerType;
		if (!rawPostedBy) {
			return "Company";
		}

		const normalized = rawPostedBy.toString().trim().toLowerCase();
		if (normalized === "consultant" || normalized === "consultancy") {
			return "Consultant";
		}

		if (normalized === "company") {
			return "Company";
		}

		return normalized.charAt(0).toUpperCase() + normalized.slice(1);
	};

	if (loading) {
		return <PageLoader pageName="Jobs" compact />;
	}

	return (
		<>
			<h4 className="twm-s-title">Available Jobs ({jobs.length})</h4>

			<div className="row" style={{'--bs-gutter-x': '10px'}}>
				{jobs.length > 0 ? (
					jobs.map((job) => (
						<div key={job._id} className="col-lg-6 col-md-12 mb-3">
							<div className="new-job-card">
								<div className="job-card-header">
									<div className="job-card-left">
										<div className="company-logo">
											{getJobDisplayLogo(job) ? (
												<img
													src={getJobDisplayLogo(job)}
													alt="Company Logo"
												/>
											) : (
												<div className="logo-placeholder">
													{(job.employerId?.companyName || job.companyName || "C").charAt(0).toUpperCase()}
												</div>
											)}
										</div>
										<div className="job-info">
											<h4 className="job-title">{(() => {
                                                const rawTitle = typeof job.title === "string" ? job.title.trim() : "";
                                                if (!rawTitle) return "Job title";
                                                return rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
                                            })()}</h4>
											<div className="job-location">
												<i className="feather-map-pin" />
												{(() => {
													if (Array.isArray(job.location)) {
														const locations = job.location
															.map((loc) => String(loc || '').trim())
															.filter(Boolean);
														const primaryLocation = locations[0] || '';
														const primaryLocationDisplay = primaryLocation.split(' - ')[0].trim() || primaryLocation;
														if (locations.length <= 1) {
															return <span className="location-text" title={primaryLocation}>{primaryLocationDisplay || 'Location not specified'}</span>;
														} else {
															return (
																<>
																	<span className="location-text" title={primaryLocation}>{primaryLocationDisplay}</span>
																	<span className="location-more" title={locations.slice(1).join(', ')}> +more</span>
																</>
															);
														}
													} else {
														return <span className="location-text">{job.location || 'Location not specified'}</span>;
													}
												})()}
											</div>
										</div>
									</div>
									<div className="job-type-badge">
										<span className={`job-type-pill ${
											job.jobType === "full-time" ? "full-time" :
											job.jobType === "part-time" ? "part-time" :
											job.jobType === "contract" ? "contract" :
											job.jobType?.includes("internship") ? "internship" :
											job.jobType === "work-from-home" ? "wfh" : "full-time"
										}`}>
											{formatJobType(job.jobType)}
										</span>
									</div>
								</div>
								<div className="job-card-middle">
									<div className="ctc-info">
										{job.ctc && typeof job.ctc === "object" && (job.ctc.min > 0 || job.ctc.max > 0) ? (
											<span className="ctc-text">
												Annual CTC: {formatSalary(job)}
											</span>
										) : (
											<span className="ctc-text">
												CTC: {formatSalary(job)}
											</span>
										)}
									</div>
									<div className="vacancy-info">
										<span className="vacancy-text">
											Vacancies: {job.vacancies || "Not specified"}
										</span>
									</div>
								</div>
								<div className="job-card-footer">
									<div className="company-info">
										<div className="posted-by-label">Posted by:</div>
										<div className="company-name">
											{getPostedByLabel(job)}
										</div>
									</div>
									<button
										className="apply-now-btn"
										onClick={() => window.location.href = `/job-detail/${job._id}`}
									>
										View Details
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="col-12 text-center p-4">
						<p>No jobs available from this employer.</p>
					</div>
				)}
			</div>
		</>
	);
}

export default SectionAvailableJobsList;
