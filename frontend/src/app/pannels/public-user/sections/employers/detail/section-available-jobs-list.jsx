

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicUser } from "../../../../../../globals/route-names";

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

	if (loading) {
		return <div className="text-center p-3">Loading jobs...</div>;
	}

	return (
		<>
			<h4 className="twm-s-title">Available Jobs ({jobs.length})</h4>

			<div className="row">
				{jobs.length > 0 ? (
					jobs.map((job) => (
						<div key={job._id} className="col-lg-6 col-md-12 mb-4">
							<div className="new-job-card" style={{overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
								<div className="job-card-header" style={{padding: '8px 16px'}}>
									<div className="job-card-left" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
										<div className="company-logo" style={{width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0}}>
											{job.employerProfile?.logo ? (
												<img
													src={job.employerProfile.logo}
													alt="Company Logo"
													style={{width: '100%', height: '100%', objectFit: 'cover'}}
												/>
											) : (
												<div className="logo-placeholder" style={{width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#666'}}>
													{(job.employerId?.companyName || job.companyName || "C").charAt(0).toUpperCase()}
												</div>
											)}
										</div>
										<div className="job-info" style={{flex: 1}}>
											<h4 className="job-title" style={{margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#333', lineHeight: '1.3'}}>{job.title}</h4>
											<div className="job-location" style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px'}}>
												<i className="feather-map-pin" style={{fontSize: '14px'}} />
												{job.location || 'Location not specified'}
											</div>
										</div>
									</div>
									<div className="job-type-badge" style={{alignSelf: 'flex-start'}}>
										<span className="job-type-pill" style={{padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', backgroundColor: '#e3f2fd', color: '#1976d2'}}>
											{formatJobType(job.jobType)}
										</span>
									</div>
								</div>
								<div className="job-card-middle" style={{padding: '4px 16px'}}>
									<div className="ctc-info" style={{marginBottom: '4px'}}>
										{job.ctc && typeof job.ctc === "object" && (job.ctc.min > 0 || job.ctc.max > 0) ? (
											<span className="ctc-text" style={{fontSize: '14px', fontWeight: '500', color: '#1976d2'}}>
												Annual CTC: {formatSalary(job)}
											</span>
										) : (
											<span className="ctc-text" style={{fontSize: '14px', color: '#666'}}>
												CTC: {formatSalary(job)}
											</span>
										)}
									</div>
									<div className="vacancy-info">
										<span className="vacancy-text" style={{fontSize: '14px', color: '#666'}}>
											Vacancies: {job.vacancies || "Not specified"}
										</span>
									</div>
								</div>
								<div className="job-card-footer" style={{padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
									<div className="company-info" style={{flex: 1}}>
										<div className="posted-by-label" style={{fontSize: '12px', color: '#999', marginBottom: '4px'}}>Posted by:</div>
										<div className="company-name" style={{fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '2px'}}>
											{job.employerId?.companyName || job.companyName || "Company"}
										</div>
										<div className="poster-type" style={{fontSize: '12px', color: '#666'}}>
											{job.postedBy || (job.employerId?.employerType === "consultant" ? "Consultancy" : "Company")}
										</div>
									</div>
									<button
										className="apply-now-btn"
										onClick={() => window.location.href = `/job-detail/${job._id}`}
										style={{padding: '10px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s'}}
										onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
										onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
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
