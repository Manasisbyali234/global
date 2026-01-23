import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import { formatInterviewTime } from '../../../../utils/timeUtils';
import { formatTimeToAMPM } from '../../../../utils/dateFormatter';
// Route: /candidate/status

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { pubRoute, publicUser, canRoute, candidate } from "../../../../globals/route-names";
import CanPostedJobs from "./can-posted-jobs";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import "./status-styles.css";

function CanStatusPage() {
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('applications');
	const [highlightShortlisted, setHighlightShortlisted] = useState(false);
	const [highlightCompanyPosition, setHighlightCompanyPosition] = useState(false);
	const [showRoundDetails, setShowRoundDetails] = useState(false);
	const [selectedRoundDetails, setSelectedRoundDetails] = useState(null);
	const [selectedRoundType, setSelectedRoundType] = useState(null);
	const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
	const [showAllDetails, setShowAllDetails] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState(null);

	const getAssessmentWindowInfo = (job) => {
		const now = new Date();
		const startRaw = job?.assessmentStartDate ? new Date(job.assessmentStartDate) : null;
		const endRaw = job?.assessmentEndDate ? new Date(job.assessmentEndDate) : null;
		const isValid = (date) => date instanceof Date && !isNaN(date.getTime());
		let startDate = isValid(startRaw) ? startRaw : null;
		let endDate = isValid(endRaw) ? endRaw : null;
		
		// Apply time if available
		if (startDate && job?.assessmentStartTime) {
			const [hours, minutes] = job.assessmentStartTime.split(':').map(Number);
			if (!isNaN(hours) && !isNaN(minutes)) {
				startDate = new Date(startDate);
				startDate.setHours(hours, minutes, 0, 0);
			}
		}
		if (endDate && job?.assessmentEndTime) {
			const [hours, minutes] = job.assessmentEndTime.split(':').map(Number);
			if (!isNaN(hours) && !isNaN(minutes)) {
				endDate = new Date(endDate);
				endDate.setHours(hours, minutes, 59, 999);
			}
		}
		
		const isBeforeStart = startDate ? now < startDate : false;
		const isAfterEnd = endDate ? now > endDate : false;
		return {
			isBeforeStart,
			isAfterEnd,
			isWithinWindow: !(isBeforeStart || isAfterEnd),
			startDate,
			endDate
		};
	};

	// Timer component for assessment countdown
	const AssessmentTimer = ({ timerInfo, onTimerEnd }) => {
		const [timeLeft, setTimeLeft] = useState(null);
		const [isActive, setIsActive] = useState(false);

		useEffect(() => {
			if (!timerInfo) return;

			const updateTimer = () => {
				const now = new Date().getTime();
				
				if (timerInfo.isBeforeStart && timerInfo.timeUntilStart) {
					const remaining = Math.max(0, timerInfo.timeUntilStart - (now - new Date(timerInfo.startDate).getTime()) + timerInfo.timeUntilStart);
					setTimeLeft(remaining);
					setIsActive(false);
				} else if (timerInfo.isActive && timerInfo.timeRemaining) {
					const remaining = Math.max(0, timerInfo.timeRemaining - (now - new Date(timerInfo.endDate).getTime()) + timerInfo.timeRemaining);
					setTimeLeft(remaining);
					setIsActive(true);
					if (remaining <= 0 && onTimerEnd) {
						onTimerEnd();
					}
				} else {
					setTimeLeft(null);
					setIsActive(false);
				}
			};

			updateTimer();
			const interval = setInterval(updateTimer, 1000);

			return () => clearInterval(interval);
		}, [timerInfo, onTimerEnd]);

		if (!timeLeft) return null;

		const formatTime = (milliseconds) => {
			const totalSeconds = Math.floor(milliseconds / 1000);
			const days = Math.floor(totalSeconds / (24 * 3600));
			const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;

			if (days > 0) {
				return `${days}d ${hours}h ${minutes}m`;
			} else if (hours > 0) {
				return `${hours}h ${minutes}m ${seconds}s`;
			} else {
				return `${minutes}m ${seconds}s`;
			}
		};

		return (
			<div style={{
				padding: '8px 12px',
				background: isActive ? '#fef3c7' : '#dbeafe',
				border: `1px solid ${isActive ? '#f59e0b' : '#3b82f6'}`,
				borderRadius: '6px',
				marginTop: '4px',
				display: 'flex',
				alignItems: 'center',
				gap: '6px',
				fontSize: '12px',
				fontWeight: '600'
			}}>
				<i className={`fa ${isActive ? 'fa-hourglass-half' : 'fa-clock'}`} style={{color: isActive ? '#f59e0b' : '#3b82f6'}}></i>
				<span style={{color: isActive ? '#92400e' : '#1e40af'}}>
					{isActive ? 'Time Remaining: ' : 'Starts in: '}{formatTime(timeLeft)}
				</span>
			</div>
		);
	};

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplications();
		
		
		// Check if we should highlight shortlisted applications
		const shouldHighlight = sessionStorage.getItem('highlightShortlisted');
		if (shouldHighlight === 'true') {
			setHighlightShortlisted(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightShortlisted(false);
				sessionStorage.removeItem('highlightShortlisted');
			}, 5000);
		}
		
		// Check if we should highlight company and position columns
		const shouldHighlightCP = sessionStorage.getItem('highlightCompanyPosition');
		if (shouldHighlightCP === 'true') {
			setHighlightCompanyPosition(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightCompanyPosition(false);
				sessionStorage.removeItem('highlightCompanyPosition');
			}, 5000);
		}
		

	}, []);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const response = await api.getCandidateApplicationsWithInterviews();
			if (response.success) {
				const apps = response.applications || response.data || [];
				console.log('Applications received:', apps);
				if (apps.length > 0) {
					console.log('First application job data:', apps[0].jobId);
					console.log('Assessment ID:', apps[0].jobId?.assessmentId);
					console.log('Interview Round Types:', apps[0].jobId?.interviewRoundTypes);
					// Log all applications with assessment info
					apps.forEach((app, idx) => {
						console.log(`App ${idx + 1} - Job: ${app.jobId?.title}, Has Assessment: ${!!app.jobId?.assessmentId}, Assessment ID: ${app.jobId?.assessmentId}`);
					});
				}
				setApplications(apps);
			}
		} catch (error) {
			console.error('Error fetching applications with interviews:', error);
			// Fallback to regular applications if new endpoint fails
			try {
				console.log('Falling back to regular applications endpoint');
				const fallbackResponse = await api.getCandidateApplications();
				if (fallbackResponse.success) {
					const apps = fallbackResponse.applications || fallbackResponse.data || [];
					console.log('Fallback applications received:', apps);
					setApplications(apps);
				}
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError);
			}
		} finally {
			setLoading(false);
		}
	};

	const getInterviewRounds = (job, application) => {
		// PRIORITY 1: Check if application has interviewProcess.stages from InterviewProcessManager
		if (application?.interviewProcess?.stages && application.interviewProcess.stages.length > 0) {
			console.log('Using interviewProcess.stages:', application.interviewProcess.stages);
			return application.interviewProcess.stages.map(stage => ({
				name: stage.stageName,
				uniqueKey: stage._id || stage.stageType,
				roundType: stage.stageType
			}));
		}
		
		// PRIORITY 2: Check if application has interviewProcesses from employer review (legacy)
		if (application?.interviewProcesses && application.interviewProcesses.length > 0) {
			console.log('Using interviewProcesses from application:', application.interviewProcesses);
			return application.interviewProcesses.map(process => ({
				name: process.name,
				uniqueKey: process.id || process.type,
				roundType: process.type
			}));
		}
		
		// PRIORITY 2: Check if job has interviewRoundOrder (new format)
		if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
			const rounds = [];
			
			// Map unique keys to round names
			job.interviewRoundOrder.forEach(uniqueKey => {
				const roundType = job.interviewRoundTypes?.[uniqueKey];
				if (roundType) {
					const roundNames = {
						technical: 'Technical',
						nonTechnical: 'Non-Technical',
						managerial: 'Managerial',
						final: 'Final',
						hr: 'HR',
						assessment: 'Assessment',
						aptitude: 'Aptitude test',
						coding: 'Coding'
					};
					rounds.push({
						name: roundNames[roundType] || roundType,
						uniqueKey: uniqueKey,
						roundType: roundType
					});
				}
			});
			
			if (rounds.length > 0) return rounds;
		}
		
		// PRIORITY 3: Use job's interview rounds (from job posting)
		if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
			const rounds = [];
			job.interviewRoundOrder.forEach(uniqueKey => {
				const roundType = job.interviewRoundTypes?.[uniqueKey];
				if (roundType) {
					const roundNames = {
						technical: 'Technical',
						nonTechnical: 'Non-Technical',
						managerial: 'Managerial',
						final: 'Final',
						hr: 'HR',
						assessment: 'Assessment',
						aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
						coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
					};
					rounds.push({
						name: roundNames[roundType] || roundType,
						uniqueKey: uniqueKey,
						roundType: roundType
					});
				}
			});
			if (rounds.length > 0) return rounds;
		}
		
		// PRIORITY 4: Fallback to old format
		if (job?.interviewRoundTypes) {
			const rounds = [];
			const roundTypes = job.interviewRoundTypes;

			if (job.assessmentId) rounds.push({ name: 'Assessment', uniqueKey: 'assessment', roundType: 'assessment' });
			if (roundTypes.technical) rounds.push({ name: 'Technical', uniqueKey: 'technical', roundType: 'technical' });
			if (roundTypes.aptitude) rounds.push({ name: 'Aptitude test - SOFTWARE ENGINEERING', uniqueKey: 'aptitude', roundType: 'aptitude' });
			if (roundTypes.coding) rounds.push({ name: 'Coding - SENIOR SOFTWARE ENGINEERING', uniqueKey: 'coding', roundType: 'coding' });
			if (roundTypes.hr) rounds.push({ name: 'HR', uniqueKey: 'hr', roundType: 'hr' });
			if (roundTypes.managerial) rounds.push({ name: 'Managerial', uniqueKey: 'managerial', roundType: 'managerial' });
			if (roundTypes.nonTechnical) rounds.push({ name: 'Non-Technical', uniqueKey: 'nonTechnical', roundType: 'nonTechnical' });
			if (roundTypes.final) rounds.push({ name: 'Final', uniqueKey: 'final', roundType: 'final' });

			if (rounds.length > 0) return rounds;
		}

		// Default rounds for testing
		return [{ name: 'Technical', uniqueKey: 'technical', roundType: 'technical' }, { name: 'HR', uniqueKey: 'hr', roundType: 'hr' }, { name: 'Final', uniqueKey: 'final', roundType: 'final' }];
	};

	const getRoundStatus = (application, roundIndex, roundName) => {
		// Check assessment status for Assessment rounds
		if (roundName === 'Assessment' && application.assessmentStatus) {
			switch (application.assessmentStatus) {
				case 'completed':
					return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
				case 'in_progress':
					return { text: 'In Progress', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' };
				case 'available':
					return { text: 'Available', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
				case 'expired':
					return { text: 'Expired', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
				default:
					return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
		}

		// Check if there are actual interview rounds data from employer review
		if (application.interviewRounds && application.interviewRounds.length > 0) {
			const round = application.interviewRounds.find(r => r.round === roundIndex + 1);
			if (round) {
				switch (round.status) {
					case 'passed':
						return { 
							text: 'Passed', 
							class: 'bg-success bg-opacity-10 text-success border border-success',
							feedback: round.feedback || ''
						};
					case 'failed':
						return { 
							text: 'Failed', 
							class: 'bg-danger bg-opacity-10 text-danger border border-danger',
							feedback: round.feedback || ''
						};
					case 'pending':
					default:
						return { 
							text: 'Scheduled', 
							class: 'bg-info bg-opacity-10 text-info border border-info',
							feedback: round.feedback || ''
						};
				}
			}
		}
		
		// Enhanced status logic based on application status
		const status = application.status;
		
		// For pending status, check if candidate is selected for process
		if (status === 'pending' && application.isSelectedForProcess) {
			return { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
		}
		
		if (status === 'shortlisted') {
			return { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
		} else if (status === 'interviewed') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'hired') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'rejected') {
			return { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
		} else if (status === 'pending') {
			return { text: 'Under Review', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' };
		}
		
		return { text: 'Submitted', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
	};

	const handleViewRoundDetails = (roundType, roundDetails, assessmentId = null) => {
		setSelectedRoundType(roundType);
		setSelectedRoundDetails(roundDetails);
		setSelectedAssessmentId(assessmentId);
		setShowRoundDetails(true);
	};

	const handleViewAllDetails = (application) => {
		setSelectedApplication(application);
		setShowAllDetails(true);
	};

	const handleStartAssessment = (application) => {
		showInfo('🚀 Starting Assessment...', 3000);
		console.log('=== HANDLE START ASSESSMENT CALLED ===');
		const job = application.jobId;
		const windowInfo = getAssessmentWindowInfo(job);
		if (!windowInfo.isWithinWindow) {
			if (windowInfo.isBeforeStart) {
				const startLabel = windowInfo.startDate ? windowInfo.startDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;
				showWarning(startLabel ? `⏰ Assessment Not Yet Available\n\nThe assessment will open on ${startLabel}. Please check back at the scheduled time.` : '⏰ Assessment is not yet available. Please wait for the scheduled time.');
				return;
			}
			const endLabel = windowInfo.endDate ? windowInfo.endDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;
			showError(endLabel ? `⛔ Assessment Window Closed\n\nThe assessment window ended on ${endLabel}. You can no longer take this assessment.` : '⛔ Assessment window has ended. You can no longer access this assessment.');
			return;
		}
		const assessmentId = job?.assessmentId;
		const jobId = job?._id || job;
		const applicationId = application._id;
		if (assessmentId && jobId && applicationId) {
			const sessionPayload = { assessmentId, jobId, applicationId };
			try {
				sessionStorage.setItem('candidateCurrentAssessment', JSON.stringify(sessionPayload));
			} catch (err) {}
			const params = new URLSearchParams();
			Object.entries(sessionPayload).forEach(([key, value]) => {
				if (value) {
					params.set(key, value);
				}
			});
			navigate(`/candidate/start-tech-assessment?${params.toString()}`, {
				state: sessionPayload
			});
		}
	};

	return (
		<>
			<div className="twm-right-section-panel site-bg-gray">
				{/* Status Page Header */}
				<div style={{ padding: '2rem 2rem 0 2rem' }}>
					<div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
						<div style={{ textAlign: 'center' }}>
							<h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
								<i className="fa fa-clipboard-list me-2" style={{color: '#f97316'}}></i>
								Application Status
							</h2>
							<p style={{ color: '#6b7280', margin: 0 }}>
								Track your job applications and interview progress
							</p>
						</div>
					</div>
				</div>

				{/* Status Content */}
				<div style={{ padding: '0 2rem 2rem 2rem' }}>

					{/* Highlight notification */}
					{highlightShortlisted && (
						<div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
							<i className="fa fa-star me-2"></i>
							<strong>Shortlisted Applications Highlighted!</strong> Your shortlisted applications are highlighted below.
						</div>
					)}
					
					{highlightCompanyPosition && (
						<div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
							<i className="fa fa-building me-2"></i>
							<strong>Company & Position Columns Highlighted!</strong> View your applied companies and positions below.
						</div>
					)}

					{/* Refresh Controls */}
					<div className="d-flex justify-content-end align-items-center mb-3">
						<button 
							className="btn btn-sm btn-outline-primary refresh-btn"
							onClick={fetchApplications}
							disabled={loading}
							style={{backgroundColor: 'transparent'}}
						>
							<i className="fa fa-refresh me-1" />
							{loading ? 'Refreshing...' : 'Refresh Now'}
						</button>
					</div>
			
					<div className="twm-pro-view-chart-wrap">
						<div className="col-lg-12 col-md-12 mb-4">
							<div className="card card-shadow border-0">
								<div className="card-body p-0">
									<div className="table-responsive">
									<table className="table table-hover mb-0">
										<thead style={{backgroundColor: '#f8f9fa'}}>
											<tr>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
													Applied Date
												</th>
												<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
													<i className="fa fa-building me-2" style={{color: '#ff6b35'}}></i>
													Company
												</th>
												<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
													<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
													Position
												</th>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
													Interview Progress
												</th>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-flag me-2" style={{color: '#ff6b35'}}></i>
													Status
												</th>
												<th className="border-0 px-4 py-3 fw-semibold text-center" style={{color: '#232323'}}>
													<i className="fa fa-eye me-2" style={{color: '#ff6b35'}}></i>
													View Details
												</th>
											</tr>
										</thead>

										<tbody>
											{loading ? (
												<tr>
													<td colSpan="6" className="text-center py-5">
														<div className="d-flex flex-column align-items-center">
															<i className="fa fa-spinner fa-spin fa-3x mb-3" style={{color: '#ff6b35'}}></i>
															<p className="text-muted mb-0">Loading your applications...</p>
														</div>
													</td>
												</tr>
											) : applications.length === 0 ? (
												<tr>
													<td colSpan="6" className="text-center py-5">
														<div className="d-flex flex-column align-items-center">
															<i className="fa fa-search fa-3x mb-3" style={{color: '#ff6b35'}}></i>
															<h5 style={{color: '#232323'}}>No Applications Yet</h5>
															<p className="text-muted mb-3">Start applying to jobs to see your application status here</p>
															<button className="btn btn-outline-primary" onClick={() => navigate(pubRoute(publicUser.jobs.GRID))} style={{backgroundColor: 'transparent'}}>
																<i className="fa fa-search me-2"></i>
																Browse Jobs
															</button>
														</div>
													</td>
												</tr>
											) : (
												applications.map((app, index) => {
													const interviewRounds = getInterviewRounds(app.jobId, app);
													const isShortlisted = app.status === 'shortlisted';
													const shouldHighlightRow = highlightShortlisted && isShortlisted;
													return (
														<tr 
															key={index} 
															className={`border-bottom ${shouldHighlightRow ? 'highlight-shortlisted' : ''}`}
															style={{
																backgroundColor: shouldHighlightRow ? '#e8f5e9' : 'transparent',
																transition: 'background-color 0.3s ease',
																border: shouldHighlightRow ? '2px solid #4caf50' : 'none'
															}}
														>
															<td className="px-4 py-3">
																<span className="text-dark fw-medium">
																	{new Date(app.createdAt || app.appliedAt).toLocaleDateString('en-US', {
																		day: '2-digit',
																		month: 'short',
																		year: 'numeric'
																	})}
																</span>
															</td>
															<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
																<div className="d-flex align-items-center">
																	<div className="me-3">
																		<div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35'}}>
																			<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px'}}></i>
																		</div>
																	</div>
																	<div>
																		<a href={`/emp-detail/${app.employerId?._id}`} className="text-decoration-none">
																			<h6 className="mb-1 fw-semibold text-dark hover-primary">
																				{app.employerId?.companyName || 'Company Name Not Available'}
																			</h6>
																		</a>
																		<small className="text-muted">
																			<i className="fas fa-map-marker-alt me-1"></i>
																			{app.jobId?.location || 'Location Not Available'}
																		</small>
																	</div>
																</div>
															</td>
															<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
																<span className="fw-medium text-dark">
																	{app.jobId?.title || 'Position Not Available'}
																</span>
															</td>
															<td className="px-4 py-3">
																<div className="interview-progress-wrapper" style={{display: 'flex', flexDirection: 'row', gap: '8px', overflowX: 'auto', alignItems: 'flex-start'}}>
																	{interviewRounds.length > 0 ? (
																		interviewRounds.map((round, roundIndex) => {
																			// Get interview details for this round
																			const roundName = typeof round === 'string' ? round : round.name;
																			const roundStatus = getRoundStatus(app, roundIndex, roundName);
																			const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round.uniqueKey;
																			
																			// Try to find round details with multiple possible keys
																			let roundDetails = null;
																			if (app.jobId?.interviewRoundDetails) {
																				// First try the uniqueKey
																				roundDetails = app.jobId.interviewRoundDetails[uniqueKey];
																				
																				// If not found, try to find by round type in any key
																				if (!roundDetails) {
																					const roundType = typeof round === 'object' ? round.roundType : round.toLowerCase();
																					for (const [key, details] of Object.entries(app.jobId.interviewRoundDetails)) {
																						if (key.includes(roundType) && details && (details.description || details.fromDate || details.toDate)) {
																							roundDetails = details;
																							break;
																						}
																					}
																				}
																				
																				// For Assessment rounds, also check if there are assessment-specific details
																				if (roundName === 'Assessment' && !roundDetails) {
																					// Check for assessment details in various possible keys
																					const assessmentKeys = ['assessment', 'Assessment', 'technical_assessment', 'online_assessment'];
																					for (const key of assessmentKeys) {
																						if (app.jobId.interviewRoundDetails[key]) {
																							roundDetails = app.jobId.interviewRoundDetails[key];
																							break;
																						}
																					}
																					
																					// If still no details, create a basic one from job assessment info
																					if (!roundDetails && app.jobId?.assessmentId) {
																						roundDetails = {
																							description: app.jobId.assessmentInstructions || 'Complete the technical assessment within the given timeframe',
																							fromDate: app.jobId.assessmentStartDate,
																							toDate: app.jobId.assessmentEndDate
																						};
																					}
																				}
																			}
																			const formatDate = (dateStr) => {
																				if (!dateStr) return null;
																				try {
																					return new Date(dateStr).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'});
																				} catch (error) {
																					return null;
																				}
																			};
																			// For Assessment, use job-level dates
																			let startDate, endDate, dateDisplay;
																			
																			if (roundName === 'Assessment') {
																				// Try multiple possible field names for assessment dates
																				startDate = formatDate(app.jobId?.assessmentStartDate || roundDetails?.fromDate);
																				endDate = formatDate(app.jobId?.assessmentEndDate || roundDetails?.toDate);
																			} else {
																				startDate = formatDate(roundDetails?.fromDate || roundDetails?.date);
																				endDate = formatDate(roundDetails?.toDate);
																			}
																			
																			dateDisplay = startDate && endDate ? `${startDate} - ${endDate}` : 
																						  startDate ? `From: ${startDate}` : 
																						  endDate ? `Until: ${endDate}` : null;
																			
																			return (
																				<div key={roundIndex} className="interview-round-item" style={{minWidth: '120px', padding: '4px', flexShrink: 0}}>
																					<div className="round-name" style={{fontSize: '12px', fontWeight: '600', marginBottom: '4px'}}>{roundName}</div>
																					<div style={{display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center'}}>
																						<span className={`badge ${roundStatus.class}`} style={{fontSize: '12px', padding: '4px 8px', minWidth: '60px', textAlign: 'center'}}>
																							{roundStatus?.text || 'Pending'}
																						</span>
																						{/* Show pass/fail result for completed assessments */}
																						{roundName === 'Assessment' && (app.assessmentResult === 'pass' || app.assessmentResult === 'fail') && (
																							<span className={`badge ${app.assessmentResult === 'pass' ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '9px', padding: '2px 6px', marginTop: '2px'}}>
																								{app.assessmentResult === 'pass' ? 'PASS' : 'FAIL'}
																							</span>
																						)}
																						{/* Show assessment description if available */}
																						{roundName === 'Assessment' && roundDetails?.description && typeof roundDetails.description === 'string' && (
																							<div style={{fontSize: '8px', color: '#1976d2', textAlign: 'center', padding: '2px 4px', backgroundColor: '#e3f2fd', borderRadius: '3px', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={roundDetails.description}>
																								<i className="fa fa-info-circle me-1" style={{fontSize: '7px'}}></i>
																								{roundDetails.description.length > 15 ? roundDetails.description.substring(0, 15) + '...' : roundDetails.description}
																							</div>
																						)}
																						{/* Show assessment remarks if available - removed from table, only in modal */}
																						{dateDisplay && (
																							<div style={{fontSize: '9px', color: '#666', textAlign: 'center', padding: '2px 4px', backgroundColor: '#f8f9fa', borderRadius: '3px', marginTop: '2px'}}>
																								{dateDisplay}
																							</div>
																						)}
																						{!dateDisplay && (
																							<div style={{fontSize: '9px', color: '#999', textAlign: 'center', padding: '2px 4px', backgroundColor: '#f8f9fa', borderRadius: '3px', marginTop: '2px'}}>
																								Dates TBD
																							</div>
																						)}
																						{/* Show non-assessment round description and remarks */}
																						{roundName !== 'Assessment' && roundDetails?.description && typeof roundDetails.description === 'string' && (
																							<div style={{fontSize: '8px', color: '#666', textAlign: 'center', padding: '2px 4px', backgroundColor: '#e8f5e9', borderRadius: '3px', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={roundDetails.description}>
																								<i className="fa fa-info-circle me-1" style={{fontSize: '7px'}}></i>
																								{roundDetails.description.length > 15 ? roundDetails.description.substring(0, 15) + '...' : roundDetails.description}
																							</div>
																						)}
																						{/* Show non-assessment round employer remarks */}
																						{(() => {
																							if (roundName === 'Assessment') return null;
																							const process = app.interviewProcesses?.find(p => p.type === (typeof round === 'object' ? round.roundType : round.toLowerCase()));
																							const processRemarks = process?.id ? app.processRemarks?.[process.id] : null;
																							const remarks = roundDetails?.employerRemarks || processRemarks;
																							if (!remarks || typeof remarks !== 'string') return null;
																							return (
																								<div style={{fontSize: '8px', color: '#e65100', textAlign: 'center', padding: '2px 4px', backgroundColor: '#fff3e0', borderRadius: '3px', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={remarks}>
																									<i className="fa fa-comment me-1" style={{fontSize: '7px'}}></i>
																									{remarks.length > 12 ? remarks.substring(0, 12) + '...' : remarks}
																								</div>
																							);
																						})()}
																					</div>
																				</div>
																			);
																		})
																	) : (
																		<span className="text-muted fst-italic">No rounds specified</span>
																	)}
																</div>
															</td>
															<td className="px-4 py-3">
																<span className={
																	(app.status === 'pending' && app.isSelectedForProcess) ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'pending' ? 'badge bg-warning bg-opacity-10 text-warning border border-warning' :
																	app.status === 'shortlisted' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'interviewed' ? 'badge bg-primary bg-opacity-10 text-primary border border-primary' :
																	app.status === 'hired' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	app.status === 'rejected' ? 'badge bg-danger bg-opacity-10 text-danger border border-danger' : 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary'
																} style={{fontSize: '12px', padding: '6px 12px'}}>
																	{(app.status === 'pending' && app.isSelectedForProcess) ? 'Shortlisted' : 
																	 app.status === 'hired' ? 'Hired' :
																	 app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
																</span>
															</td>
															<td className="px-4 py-3 text-center">
																<button
																	className="btn btn-sm"
																	style={{
																		width: '40px',
																		height: '40px',
																		borderRadius: '50%',
																		backgroundColor: '#fff3e0',
																		border: '2px solid #ff6b35',
																		display: 'flex',
																		alignItems: 'center',
																		justifyContent: 'center',
																		padding: '0',
																		transition: 'all 0.3s ease'
																	}}
																	onClick={() => handleViewAllDetails(app)}
																	title="View all interview process details"
																	onMouseEnter={(e) => {
																		e.currentTarget.style.backgroundColor = '#ff6b35';
																		e.currentTarget.querySelector('i').style.color = 'white';
																	}}
																	onMouseLeave={(e) => {
																		e.currentTarget.style.backgroundColor = '#fff3e0';
																		e.currentTarget.querySelector('i').style.color = '#ff6b35';
																	}}
																>
																	<i className="fa fa-eye" style={{color: '#ff6b35', fontSize: '18px', transition: 'color 0.3s ease'}}></i>
																</button>
															</td>
														</tr>
													);
												})
											)}

										</tbody>
									</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			{/* Interview Round Details Popup */}
			<PopupInterviewRoundDetails
				isOpen={showRoundDetails}
				onClose={() => setShowRoundDetails(false)}
				roundDetails={selectedRoundDetails}
				roundType={selectedRoundType}
				assessmentId={selectedAssessmentId}
			/>

			{/* All Interview Details Modal */}
			{showAllDetails && selectedApplication && (
				<div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100001, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%'}} onClick={(e) => { if (e.target === e.currentTarget) setShowAllDetails(false); }}>
					<div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{maxHeight: 'calc(100vh - 40px)', margin: '20px auto'}} onClick={(e) => e.stopPropagation()}>
						<div className="modal-content" style={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '100%', display: 'flex', flexDirection: 'column'}}>
							<div className="modal-header" style={{backgroundColor: '#f5f5f5', color: '#000', borderRadius: '12px 12px 0 0', flexShrink: 0}}>
								<h5 className="modal-title">
									<i className="fa fa-clipboard-list me-2"></i>
									Interview Process Details
								</h5>
								<button type="button" className="btn-close" onClick={() => setShowAllDetails(false)}></button>
							</div>
							<div className="modal-body" style={{padding: '30px', overflowY: 'auto'}}>
								{/* Job Information */}
								<div className="mb-4 p-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
										Job Information
									</h6>
									<div className="row">
										<div className="col-md-6 mb-2">
											<strong>Company:</strong> {selectedApplication.employerId?.companyName || 'N/A'}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Position:</strong> {selectedApplication.jobId?.title || 'N/A'}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Location:</strong> {selectedApplication.jobId?.location || 'N/A'}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Applied Date:</strong> {new Date(selectedApplication.createdAt || selectedApplication.appliedAt).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}
										</div>
										<div className="col-md-12 mb-2">
											<strong>Status:</strong> 
											<span className={
												selectedApplication.status === 'pending' ? 'badge bg-warning ms-2' :
												selectedApplication.status === 'shortlisted' ? 'badge bg-info ms-2' :
												selectedApplication.status === 'interviewed' ? 'badge bg-primary ms-2' :
												selectedApplication.status === 'hired' ? 'badge bg-success ms-2' :
												selectedApplication.status === 'rejected' ? 'badge bg-danger ms-2' : 'badge bg-secondary ms-2'
											}>
												{selectedApplication.status?.charAt(0).toUpperCase() + selectedApplication.status?.slice(1) || 'Pending'}
											</span>
										</div>
									</div>
								</div>

								{/* Interview Rounds */}
								<div className="mb-3">
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
										Interview Rounds
									</h6>
									{getInterviewRounds(selectedApplication.jobId, selectedApplication).map((round, roundIndex) => {
										const roundName = typeof round === 'string' ? round : round.name;
										const roundStatus = getRoundStatus(selectedApplication, roundIndex, roundName);
										const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round.uniqueKey;
										const roundType = (typeof round === 'object' ? round.roundType : round.toLowerCase()).replace(/[^a-z]/gi, '');
										
										// Find round details from job interviewRoundDetails
										let roundDetails = null;
										if (selectedApplication.jobId?.interviewRoundDetails) {
											const allDetails = selectedApplication.jobId.interviewRoundDetails;
											// Try direct key match
											roundDetails = allDetails[uniqueKey];
											// Search all keys for match
											if (!roundDetails) {
												for (const [key, details] of Object.entries(allDetails)) {
													if (key.replace(/[^a-z]/gi, '').toLowerCase().includes(roundType.toLowerCase()) && details) {
														roundDetails = details;
														break;
													}
												}
											}
										}
										// Merge with processRemarks if available
										if (selectedApplication.interviewProcesses?.[roundIndex]) {
											const processId = selectedApplication.interviewProcesses[roundIndex].id;
											const remarks = selectedApplication.processRemarks?.[processId];
											if (remarks) {
												roundDetails = { ...roundDetails, employerRemarks: remarks };
											}
										}
										
										const assessmentId = selectedApplication.jobId?.assessmentId;

										return (
											<div key={roundIndex} className="mb-3 p-3" style={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
												<div className="d-flex justify-content-between align-items-center mb-2">
													<h6 className="mb-0" style={{color: '#232323', fontWeight: '600'}}>
														<i className="fa fa-circle me-2" style={{color: '#ff6b35', fontSize: '8px'}}></i>
														{roundName}
													</h6>
													<div className="d-flex gap-2 align-items-center">
														<span className={`badge ${roundStatus.class}`} style={{fontSize: '12px', padding: '4px 8px', minWidth: '60px', textAlign: 'center'}}>
															{roundStatus.text}
														</span>
													</div>
												</div>
												
												{/* Assessment Details */}
												{roundName === 'Assessment' && (
													<div className="mt-2">
														{/* Assessment Description */}
														{roundDetails && roundDetails.description && (
															<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																<small className="text-muted d-block mb-1"><i className="fa fa-clipboard-check me-1" style={{color: '#ff6b35'}}></i><strong>Assessment Description:</strong></small>
																<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{roundDetails.description}</div>
															</div>
														)}
														
														{/* Assessment Period */}
														{(selectedApplication.jobId?.assessmentStartDate || selectedApplication.jobId?.assessmentEndDate) && (
															<div className="mb-2">
																<small className="text-muted"><i className="fa fa-calendar me-1"></i>Assessment Period:</small>
																<div>
																	{selectedApplication.jobId?.assessmentStartDate && (
																		<span><strong>From:</strong> {new Date(selectedApplication.jobId.assessmentStartDate).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
																	)}
																	{selectedApplication.jobId?.assessmentStartDate && selectedApplication.jobId?.assessmentEndDate && <span className="mx-2">-</span>}
																	{selectedApplication.jobId?.assessmentEndDate && (
																		<span><strong>To:</strong> {new Date(selectedApplication.jobId.assessmentEndDate).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
																	)}
																	{(selectedApplication.jobId?.assessmentStartTime || selectedApplication.jobId?.assessmentEndTime) && (
																		<div className="mt-1">
																			<strong>Time:</strong> {selectedApplication.jobId?.assessmentStartTime ? formatTimeToAMPM(selectedApplication.jobId.assessmentStartTime) : '--:--'} - {selectedApplication.jobId?.assessmentEndTime ? formatTimeToAMPM(selectedApplication.jobId.assessmentEndTime) : '--:--'}
																		</div>
																	)}
																</div>
															</div>
														)}

														{/* Assessment Employer Remarks */}
														{(() => {
															const assessmentProcess = selectedApplication.interviewProcesses?.find(p => p.type === 'assessment' || p.name?.toLowerCase().includes('assessment'));
															const processRemarks = assessmentProcess?.id ? selectedApplication.processRemarks?.[assessmentProcess.id] : null;
															const remarks = processRemarks || roundDetails?.employerRemarks;
															
															if (!remarks || typeof remarks !== 'string') return null;
															return (
																<div className="mb-3 p-2" style={{backgroundColor: '#fff3e0', borderRadius: '6px', border: '1px solid #ffe0b3'}}>
																	<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Assessment Remarks:</strong></small>
																	<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{remarks}</div>
																</div>
															);
														})()}

														{/* Assessment Action Buttons */}
														<div className="mt-3 pt-2 border-top d-flex gap-2 flex-wrap">
															{(selectedApplication.assessmentStatus === 'expired' || getAssessmentWindowInfo(selectedApplication.jobId).isAfterEnd) && !(selectedApplication.assessmentStatus === 'completed' || selectedApplication.assessmentResult === 'pass' || selectedApplication.assessmentResult === 'fail') ? (
																<div>
																	<button 
																		className="btn btn-sm btn-danger"
																		disabled
																		style={{borderRadius: '6px'}}
																	>
																		<i className="fa fa-times me-1"></i>
																		Assessment Expired
																	</button>
																	<div className="alert alert-danger mt-2 mb-0" style={{fontSize: '13px', padding: '8px 12px'}}>
																		<i className="fa fa-exclamation-circle me-1"></i>
																		The assessment window has ended. You can no longer take this assessment.
																	</div>
																</div>
															) : (selectedApplication.assessmentStatus === 'completed' || selectedApplication.assessmentStatus === 'pass' || selectedApplication.assessmentResult === 'pass' || selectedApplication.assessmentResult === 'fail') ? (
																<button 
																	className="btn btn-sm btn-success"
																	onClick={() => {
																		setShowAllDetails(false);
																		navigate(canRoute(candidate.RESULT.replace(':applicationId', selectedApplication._id)));
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-bar-chart me-1"></i>
																	View Result
																</button>
															) : selectedApplication.assessmentStatus === 'in_progress' ? (
																<button 
																	className="btn btn-sm btn-warning"
																	onClick={() => {
																		setShowAllDetails(false);
																		handleStartAssessment(selectedApplication);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Continue Assessment
																</button>
															) : (
																<button 
																	className="btn btn-sm btn-primary"
																	onClick={() => {
																		setShowAllDetails(false);
																		handleStartAssessment(selectedApplication);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Start Assessment
																</button>
															)}
														</div>
													</div>
												)}

												{/* Round Details - Always show if we have any details */}
												{roundName !== 'Assessment' && (
													<div className="mt-2">
														{roundDetails && (
															<>
																{roundDetails.description && typeof roundDetails.description === 'string' && (
																	<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																		<small className="text-muted d-block mb-1"><i className="fa fa-info-circle me-1" style={{color: '#ff6b35'}}></i><strong>Interview Process Description:</strong></small>
																		<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{roundDetails.description}</div>
																	</div>
																)}
																{(() => {
																	const process = selectedApplication.interviewProcesses?.find(p => p.type === (typeof round === 'object' ? round.roundType : round.toLowerCase()));
																	const processRemarks = process?.id ? selectedApplication.processRemarks?.[process.id] : null;
																	const remarks = roundDetails?.employerRemarks || processRemarks;
																	const statusColors = {shortlisted: '#6f42c1', under_review: '#fd7e14', interview_scheduled: '#0dcaf0', interview_completed: '#198754', selected: '#198754', rejected: '#dc3545', on_hold: '#6c757d'};
																	const statusLabels = {shortlisted: 'Shortlisted', under_review: 'Under Review', interview_scheduled: 'Interview Scheduled', interview_completed: 'Interview Completed', selected: 'Selected', rejected: 'Rejected', on_hold: 'On Hold'};
																	return (
																		<>
																			{process?.status && (
																				<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																					<small className="text-muted d-block mb-1"><i className="fa fa-flag me-1" style={{color: '#ff6b35'}}></i><strong>Current Status:</strong></small>
																					<span className="badge" style={{fontSize: '12px', padding: '4px 8px', backgroundColor: statusColors[process.status] || '#6c757d', color: 'white', border: 'none'}}>
																						{statusLabels[process.status] || process.status}
																					</span>
																				</div>
																			)}
																			{remarks && (
																				<div className="mb-3 p-2" style={{backgroundColor: '#fff3e0', borderRadius: '6px', border: '1px solid #ffe0b3'}}>
																					<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Employer Remarks:</strong></small>
																					<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{remarks}</div>
																				</div>
																			)}
																		</>
																	);
																})()}
																{(roundDetails.fromDate || roundDetails.toDate) && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-calendar me-1"></i>Interview Period:</small>
																		<div>
																			{roundDetails.fromDate && <span><strong>From:</strong> {new Date(roundDetails.fromDate).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}</span>}
																			{roundDetails.fromDate && roundDetails.toDate && <span className="mx-2">-</span>}
																			{roundDetails.toDate && <span><strong>To:</strong> {new Date(roundDetails.toDate).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'})}</span>}
																			{roundDetails.time && <div className="mt-1"><strong>Time (Daily):</strong> {formatInterviewTime(roundDetails.time, roundDetails.fromDate)} - This timing continues until {roundDetails.toDate ? new Date(roundDetails.toDate).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'}) : 'end date'}</div>}
																		</div>
																	</div>
																)}
																{!roundDetails.fromDate && !roundDetails.toDate && roundDetails.date && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-calendar me-1"></i>Date:</small>
																		<div>{new Date(roundDetails.date).toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
																	</div>
																)}
																{roundDetails.location && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-map-marker me-1"></i>Location:</small>
																		<div>{roundDetails.location}</div>
																	</div>
																)}
																{roundDetails.interviewerName && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-user me-1"></i>Interviewer:</small>
																		<div>{roundDetails.interviewerName}</div>
																	</div>
																)}
															</>
														)}
														{!roundDetails && (
															<div className="mb-2 p-2" style={{backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7'}}>
																<small className="text-muted"><i className="fa fa-info-circle me-1"></i>Interview details will be updated by the employer soon.</small>
															</div>
														)}
													</div>
												)}

												{/* Feedback */}
												{roundStatus.feedback && (
													<div className="mt-2 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
														<small className="text-muted"><i className="fa fa-comment me-1"></i>Feedback:</small>
														<div className="mt-1">{roundStatus.feedback}</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
								
								{/* Overall Employer Remarks */}
								{selectedApplication.employerRemarks && (
									<div className="mb-3 p-3" style={{backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffe0b3'}}>
										<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
											<i className="fa fa-comment-o me-2" style={{color: '#ff6b35'}}></i>
											Overall Employer Remarks
										</h6>
										<div style={{fontSize: '14px', lineHeight: '1.6', color: '#495057', whiteSpace: 'pre-wrap'}}>
											{selectedApplication.employerRemarks}
										</div>
									</div>
								)}
							</div>
							<div className="modal-footer" style={{borderTop: '1px solid #e0e0e0', flexShrink: 0}}>
								<button type="button" className="btn btn-secondary" onClick={() => setShowAllDetails(false)}>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default CanStatusPage;