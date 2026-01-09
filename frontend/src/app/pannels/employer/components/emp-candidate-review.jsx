import { ArrowLeft, Award, Briefcase, Calendar, Check, Download, FileText, GraduationCap, Mail, MapPin, Phone, Save, User, UserCircle2, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import InterviewProcessManager from "./InterviewProcessManager";
import './emp-candidate-review.css';
import './emp-candidate-review-mobile.css';


import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function EmpCandidateReviewPage () {
	const navigate = useNavigate();
	const { applicationId } = useParams();
	const [application, setApplication] = useState(null);
	const [candidate, setCandidate] = useState(null);
	const [loading, setLoading] = useState(true);
	const [interviewRounds, setInterviewRounds] = useState([]);
	const [remarks, setRemarks] = useState('');
	const [isSelected, setIsSelected] = useState(false);
	const [interviewProcesses, setInterviewProcesses] = useState([]);
	const [processRemarks, setProcessRemarks] = useState({});
	const autoSaveTimeoutRef = useRef(null);

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplicationDetails();
	}, [applicationId]);

	useEffect(() => {
		if (interviewProcesses.length === 0) return;
		
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
		}
		
		autoSaveTimeoutRef.current = setTimeout(() => {
			saveInterviewProcesses();
		}, 1000);
		
		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, [interviewProcesses, processRemarks, applicationId]);

	const fetchApplicationDetails = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			if (!token) return;

			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			if (response.ok) {
				const data = await response.json();
				setApplication(data.application);
				setCandidate(data.application.candidateId);
				
				// Load existing review data if available
				if (data.application.employerRemarks) {
					setRemarks(data.application.employerRemarks);
				}
				if (data.application.isSelectedForProcess) {
					setIsSelected(data.application.isSelectedForProcess);
				}
				
				// Show interview rounds if job has interview rounds
				const job = data.application.jobId;
				const allRounds = [];
				
				// Check if job has interview rounds (not just assessment)
				const hasInterviewRounds = (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) || 
					(job?.interviewRoundTypes && Object.keys(job.interviewRoundTypes).filter(key => job.interviewRoundTypes[key]).length > 0);
				
				if (hasInterviewRounds) {
					if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
						job.interviewRoundOrder.forEach((uniqueKey, index) => {
							const roundType = job.interviewRoundTypes?.[uniqueKey];
							if (roundType) {
								const roundNames = {
									technical: 'Technical Round',
									nonTechnical: 'Non-Technical Round',
									managerial: 'Managerial Round',
									final: 'Final Round',
									hr: 'HR Round'
								};
								
								const existingRound = data.application.interviewRounds?.find(r => r.round === index + 1);
								allRounds.push({
									round: index + 1,
									name: roundNames[roundType] || roundType,
									uniqueKey: uniqueKey,
									roundType: roundType,
									status: existingRound?.status || 'pending',
									feedback: existingRound?.feedback || ''
								});
							}
						});
					} else if (job?.interviewRoundTypes && Object.values(job.interviewRoundTypes).some(Boolean)) {
						let roundsCount = job?.interviewRoundsCount || 1;
						
						const roundNames = [];
						if (job.interviewRoundTypes.technical) roundNames.push('Technical Round');
						if (job.interviewRoundTypes.managerial) roundNames.push('Managerial Round');
						if (job.interviewRoundTypes.nonTechnical) roundNames.push('Non-Technical Round');
						if (job.interviewRoundTypes.hr) roundNames.push('HR Round');
						if (job.interviewRoundTypes.final) roundNames.push('Final Round');
						
						for (let i = 0; i < Math.min(roundsCount, roundNames.length); i++) {
							const existingRound = data.application.interviewRounds?.find(r => r.round === i + 1);
							allRounds.push({
								round: i + 1,
								name: roundNames[i],
								status: existingRound?.status || 'pending',
								feedback: existingRound?.feedback || ''
							});
						}
					}
				}
				
				setInterviewRounds(allRounds);

				// Load interview processes
				let processes = [];
				
				// PRIORITY 1: Check interviewProcess.stages (from InterviewProcessManager)
				if (data.application.interviewProcess?.stages && data.application.interviewProcess.stages.length > 0) {
					processes = data.application.interviewProcess.stages
						.filter(stage => stage && stage.stageName && stage.stageType)
						.map(stage => ({
							id: stage._id || `${stage.stageType}-${stage.stageOrder}`,
							name: stage.stageName,
							type: stage.stageType,
							status: stage.status,
							isCompleted: stage.status === 'completed' || stage.status === 'passed',
							result: stage.assessmentResult
						}));
				}
				// PRIORITY 2: Check saved interviewProcesses (from review form - legacy)
				else if (data.application.interviewProcesses && data.application.interviewProcesses.length > 0) {
					processes = data.application.interviewProcesses.filter(p => p && p.name && p.type).map(p => ({
						id: p.id,
						name: p.name,
						type: p.type,
						status: p.status,
						isCompleted: p.isCompleted,
						result: p.result
					}));
				}
				// PRIORITY 3: Use job's interview rounds (from job posting)
				else if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
					job.interviewRoundOrder.forEach(uniqueKey => {
						const roundType = job.interviewRoundTypes?.[uniqueKey];
						if (roundType) {
							const roundNames = {
								technical: 'Technical Round',
								nonTechnical: 'Non-Technical Round',
								managerial: 'Managerial Round',
								final: 'Final Round',
								hr: 'HR Round',
								assessment: 'Assessment'
							};
							processes.push({
								id: uniqueKey,
								name: roundNames[roundType] || roundType,
								type: roundType,
								status: 'pending',
								isCompleted: false,
								result: null
							});
						}
					});
				}
				
				setInterviewProcesses(processes);
				console.log('Set interviewProcesses state to:', processes);
				
				// Initialize process remarks - load from saved data
				const initialRemarks = {};
				if (data.application.processRemarks) {
					// Handle both object and Map formats
					const remarksData = data.application.processRemarks;
					if (typeof remarksData === 'object') {
						Object.keys(remarksData).forEach(key => {
							initialRemarks[key] = remarksData[key] || '';
						});
					}
				}
				console.log('Loaded processRemarks:', initialRemarks);
				setProcessRemarks(initialRemarks);

			}
		} catch (error) {
			
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'pending': return 'twm-bg-yellow';
			case 'shortlisted': return 'twm-bg-purple';
			case 'interviewed': return 'twm-bg-orange';
			case 'hired': return 'twm-bg-green';
			case 'rejected': return 'twm-bg-red';
			case 'not_attended': return 'twm-bg-red';
			case 'offer_shared': return 'twm-bg-green';
			default: return 'twm-bg-light-blue';
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric'
		});
	};

	const saveReview = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			
			// Clean and format interview processes
			const cleanedProcesses = interviewProcesses.map(p => ({
				id: String(p.id),
				name: String(p.name),
				type: String(p.type),
				status: String(p.status),
				isCompleted: Boolean(p.isCompleted),
				result: p.result || null
			}));
			
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/review`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					interviewRounds,
					remarks,
					isSelected,
					interviewProcesses: cleanedProcesses,
					processRemarks: processRemarks
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				
				// Send notification to candidate
				await sendNotificationToCandidate('interview_scheduled', 'Interview Scheduled', 
					`Your interview has been scheduled. Please check your dashboard for details.`);
				
				showSuccess('Interview review saved successfully! Candidate will see the updated status.');
				
			} else {
				const errorData = await response.json();
				showError(errorData.message || errorData.error || 'Failed to save review');
			}
		} catch (error) {
			
			console.error('Error saving review:', error);
		showError('Network error while saving review. Please try again.');
		}
	};

	const saveInterviewProcesses = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			
			// Clean and format interview processes
			const cleanedProcesses = interviewProcesses.map(p => ({
				id: String(p.id),
				name: String(p.name),
				type: String(p.type),
				status: String(p.status),
				isCompleted: Boolean(p.isCompleted),
				result: p.result || null
			}));
			
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/review`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					interviewProcesses: cleanedProcesses,
					processRemarks: processRemarks
				})
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error('Failed to save interview processes:', errorData);
				showError(errorData.message || 'Failed to save interview processes');
			}
		} catch (error) {
			console.error('Error saving interview processes:', error);
			showError('Network error while saving interview processes. Please try again.');
		}
	};

	const sendNotificationToCandidate = async (type, title, message) => {
		try {
			const token = localStorage.getItem('employerToken');
			await fetch('http://localhost:5000/api/notifications/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					recipientId: candidate._id,
					recipientType: 'candidate',
					type,
					title,
					message
				})
			});
		} catch (error) {
			console.error('Error sending notification:', error);
		}
	};

	const allProcessesCompleted = () => {
		if (interviewProcesses.length === 0) return true;
		return interviewProcesses.every(p => p.isCompleted);
	};

	const updateProcessCompletion = (processId, isCompleted) => {
		setInterviewProcesses(prev => 
			prev.map(p => p.id === processId ? { ...p, isCompleted } : p)
		);
	};

	const updateProcessRemark = (processId, remark) => {
		setProcessRemarks(prev => ({ ...prev, [processId]: remark }));
	};

	const shortlistCandidate = async () => {
		if (interviewProcesses.length > 0 && !allProcessesCompleted()) {
			showWarning('Please complete all assigned interview processes before proceeding with actions.');
			return;
		}
		
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: 'shortlisted' })
			});
			
			if (response.ok) {
				showSuccess('Candidate shortlisted successfully! Status updated for candidate.');
				setApplication(prev => ({ ...prev, status: 'shortlisted' }));
			} else {
				const errorData = await response.json();
				showError(errorData.message || errorData.error || 'Failed to shortlist candidate');
			}
		} catch (error) {
			
			console.error('Error shortlisting candidate:', error);
		showError('Network error while shortlisting candidate. Please try again.');
		}
	};

	const updateApplicationStatus = async (status) => {
		try {
			const token = localStorage.getItem('employerToken');
			const statusMessages = {
				offer_shared: 'Offer letter shared with candidate',
				not_attended: 'Marked as candidate not attended'
			};
			
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status })
			});
			
			if (response.ok) {
				showSuccess(statusMessages[status] || 'Status updated successfully');
				setApplication(prev => ({ ...prev, status }));
			} else {
				const errorData = await response.json();
				showError(errorData.message || errorData.error || 'Failed to update status');
			}
		} catch (error) {
			console.error('Error updating status:', error);
			showError('Network error while updating status. Please try again.');
		}
	};

	const hireCandidate = async () => {
		if (interviewProcesses.length > 0 && !allProcessesCompleted()) {
			showWarning('Please complete all assigned interview processes before proceeding with actions.');
			return;
		}
		
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: 'hired' })
			});
			
			if (response.ok) {
				showSuccess('Offer letter shared with candidate! Status updated for candidate.');
				setApplication(prev => ({ ...prev, status: 'hired' }));
			} else {
				const errorData = await response.json();
				showError(errorData.message || errorData.error || 'Failed to share offer letter');
			}
		} catch (error) {
			console.error('Error sharing offer letter:', error);
			showError('Network error while sharing offer letter. Please try again.');
		}
	};

	const rejectCandidate = async () => {
		if (interviewProcesses.length > 0 && !allProcessesCompleted()) {
			showWarning('Please complete all assigned interview processes before proceeding with actions.');
			return;
		}
		
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status: 'rejected' })
			});
			
			if (response.ok) {
				showSuccess('Candidate rejected. Status updated for candidate.');
				setApplication(prev => ({ ...prev, status: 'rejected' }));
			} else {
				const errorData = await response.json();
				showError(errorData.message || errorData.error || 'Failed to reject candidate');
			}
		} catch (error) {
			console.error('Error rejecting candidate:', error);
			showError('Network error while rejecting candidate. Please try again.');
		}
	};

	const downloadDocument = (fileData, fileName) => {
		if (!fileData) return;
		
		// Handle Base64 encoded files
		if (fileData.startsWith('data:')) {
			const link = document.createElement('a');
			link.href = fileData;
			link.download = fileName || 'document';
			link.click();
		} else {
			// Handle file paths
			const link = document.createElement('a');
			link.href = `http://localhost:5000/${fileData}`;
			link.download = fileName || 'document';
			link.click();
		}
	};

	const viewDocument = (fileData) => {
		if (!fileData) return;
		
		// Handle Base64 encoded files
		if (fileData.startsWith('data:')) {
			// Create a blob URL for better viewing
			const byteCharacters = atob(fileData.split(',')[1]);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
			const blob = new Blob([byteArray], { type: mimeType });
			const blobUrl = URL.createObjectURL(blob);
			window.open(blobUrl, '_blank');
		} else {
			// Handle file paths
			window.open(`http://localhost:5000/${fileData}`, '_blank');
		}
	};

	if (loading) {
		return <div className="text-center p-4">Loading candidate details...</div>;
	}

	if (!application || !candidate) {
		return <div className="text-center p-4">Candidate not found</div>;
	}

	return (
		<div className="container-fluid py-4 emp-candidate-review-page" style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
			{/* Header Section */}
			<div className="row mb-4">
				<div className="col-12">
					<div className="d-flex justify-content-between align-items-center bg-white p-4 rounded-3 shadow-sm border-0" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'}}>
						<div className="d-flex align-items-center gap-3">
							<button
								className="btn btn-outline-primary d-flex align-items-center"
								style={{borderColor: '#ff6600', color: '#ff6600', borderRadius: '8px', padding: '8px 16px', gap: '6px'}}
								onClick={() => navigate(-1)}
							>
								<ArrowLeft size={16} />
								<span>Back</span>
							</button>
							<div>
								<h2 className="mb-1 fw-bold" style={{color: '#2c3e50'}}>
									Candidate Review
								</h2>
								<p className="text-muted mb-0 fs-6">Comprehensive candidate evaluation & assessment</p>
							</div>
						</div>
						<div className="d-flex gap-2">
							{interviewProcesses.length > 0 && (
								<span className={`badge ${interviewProcesses.some(p => p.isCompleted) ? 'bg-success' : 'bg-warning'} text-capitalize fs-6 px-4 py-2 rounded-pill`} style={{fontSize: '0.9rem !important'}}>
									{interviewProcesses.some(p => p.isCompleted) ? 'Attended' : 'Pending'}
								</span>
							)}
							<span className={`badge ${getStatusBadge(application?.status)} text-capitalize fs-6 px-4 py-2 rounded-pill`} style={{fontSize: '0.9rem !important'}}>
								{application?.status === 'not_attended' ? 'Not Attended' : (application?.status || 'pending').replace('_', ' ')}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="row g-4">
				{/* Right Column - Actions & Review */}
				<div className="col-lg-4">
					{/* Resume Card */}
					{candidate.resume && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<FileText size={22} />
									Resume
								</h5>
							</div>
							<div className="card-body p-4">
								<button
									className="btn btn-lg rounded-pill px-4 py-2 fw-semibold"
									style={{backgroundColor: '#ff6600', color: 'white', border: 'none', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
									onClick={() => viewDocument(candidate.resume)}
								>
									<i className="fa fa-eye me-2" style={{color: 'white'}}></i>View Resume
								</button>
							</div>
						</div>
					)}

					{/* Assessment Results */}
					{application?.jobId?.assessmentId && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<UserCircle2 size={22} />
									Assessment Results
								</h5>
							</div>
							<div className="card-body p-4">
								<div className="mb-4 p-3 rounded-3" style={{backgroundColor: 'white'}}>
									<div className="d-flex align-items-start justify-content-between mb-3 gap-2">
										<h6 className="mb-0 fw-bold" style={{color: '#2c3e50'}}>
											{application.assessmentAttempt?.assessmentId?.title || 'Technical Assessment'}
										</h6>
										<span className={`badge`} style={{
											backgroundColor: application.assessmentAttempt?.status === 'completed' ? '#28a745' :
												application.assessmentAttempt?.status === 'in_progress' ? '#ffc107' :
												application.assessmentAttempt?.status === 'expired' ? '#dc3545' :
												'white',
											color: application.assessmentAttempt?.status ? 'white' : '#ff6600',
											border: application.assessmentAttempt?.status ? 'none' : '1px solid #ff6600',
											paddingRight: '12px'
										}}>
											{application.assessmentAttempt?.status ? 
												application.assessmentAttempt.status.charAt(0).toUpperCase() + application.assessmentAttempt.status.slice(1) : 
												'Not Attempted'
											}
										</span>
									</div>
									
									{application.assessmentAttempt ? (
										<div className="row g-3">
											{application.assessmentAttempt.startTime && (
												<div className="col-md-6">
													<small className="text-muted d-block">Started:</small>
													<div className="fw-semibold">{new Date(application.assessmentAttempt.startTime).toLocaleString()}</div>
												</div>
											)}
											{application.assessmentAttempt.endTime && (
												<div className="col-md-6">
													<small className="text-muted d-block">Completed:</small>
													<div className="fw-semibold">{new Date(application.assessmentAttempt.endTime).toLocaleString()}</div>
												</div>
											)}
											{application.assessmentAttempt.score !== undefined && (
												<div className="col-md-4">
													<small className="text-muted d-block">Score:</small>
													<div className="fw-semibold">{application.assessmentAttempt.score}/{application.assessmentAttempt.totalMarks || 'N/A'}</div>
												</div>
											)}
											{application.assessmentAttempt.percentage !== undefined && (
												<div className="col-md-4">
													<small className="text-muted d-block">Percentage:</small>
													<div className="fw-semibold">{application.assessmentAttempt.percentage.toFixed(1)}%</div>
												</div>
											)}
											{application.assessmentAttempt.result && (
												<div className="col-md-4">
													<small className="text-muted d-block">Result:</small>
													<div className="mt-1">
														<span className={`badge ${
															application.assessmentAttempt.result.toLowerCase() === 'pass' ? 'bg-success' :
															application.assessmentAttempt.result.toLowerCase() === 'fail' ? 'bg-danger' :
															'bg-warning'
														}`}>
															{application.assessmentAttempt.result.toUpperCase()}
														</span>
													</div>
												</div>
											)}

											{application.assessmentAttempt.violations && application.assessmentAttempt.violations.length > 0 && (
												<div className="col-md-6">
													<small className="text-muted d-block">Violations:</small>
													<div className="mt-1">
														<span className="badge bg-danger me-2">{application.assessmentAttempt.violations.length}</span>
														<small className="text-muted">
															{application.assessmentAttempt.violations.map(v => v.type).join(', ')}
														</small>
													</div>
												</div>
	
										)}
										</div>
									) : (
										<div className="text-center py-3">
											<p className="text-muted mb-2">Assessment not yet attempted by candidate</p>
											<span className="badge bg-warning">Pending</span>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Interview Process Manager */}
					<div className="mb-4">
						<InterviewProcessManager 
							applicationId={applicationId}
							onSave={(process) => {
								console.log('Interview process saved:', process);
							}}
						/>
					</div>

					{/* Review & Actions */}
					<div className="card border-0 shadow-sm" style={{borderRadius: '15px'}}>
						<div className="card-header border-0" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '15px 15px 0 0'}}>
							<h5 className="mb-0 fw-bold" style={{color: '#2c3e50', fontSize: '1.1rem'}}>
								<i className="fa fa-tasks me-2" style={{color: '#ff6600'}}></i>
								Review & Actions
							</h5>
						</div>
						<div className="card-body p-4">
							
							<div className="mb-4">
								<label className="form-label fw-semibold" style={{color: '#2c3e50', marginBottom: '8px'}}>
									<i className="fa fa-pencil me-2" style={{color: '#ff6600'}}></i>
									Overall Remarks
								</label>
								<textarea
									className="form-control border-2 rounded-3"
									rows="4"
									placeholder="Enter your detailed remarks and feedback..."
									value={remarks}
									onChange={(e) => setRemarks(e.target.value)}
									style={{borderColor: '#ff6600', fontSize: '0.95rem'}}
								/>
								<small className="text-muted d-block mt-1">Max 1000 characters</small>
							</div>

							<div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '100%'}}>
								{/* Save Remark Button - Only show when remarks are written */}
								{remarks.trim() && (
									<button 
										className="action-btn-consistent" 
										style={{
											backgroundColor: 'transparent', 
											color: '#ff8a00', 
											border: '1.5px solid #ff8a00', 
											borderRadius: '20px', 
											fontSize: '15px', 
											fontWeight: '500', 
											padding: '12px 20px', 
											alignItems: 'center', 
											justifyContent: 'center', 
											gap: '10px', 
											transition: 'background-color 0.3s ease', 
											whiteSpace: 'nowrap', 
											boxSizing: 'border-box'
										}} 
										onClick={saveReview} 
										onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff3e5'} 
										onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
										title="Save remarks for this candidate"
									>
										<Save size={16} style={{flexShrink: 0}} />Save Remark
									</button>
								)}

								{/* Shortlist Candidate Button - Disabled if processes incomplete or hired */}
								{application?.status !== 'hired' && application?.status !== 'offer_shared' && (
								<button 
									className={`action-btn-consistent ${application?.status === 'shortlisted' ? 'btn-shortlisted' : ''}`} 
									style={{
										backgroundColor: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#e9ecef' : 'transparent',
										color: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#999' : '#ff8a00',
										border: interviewProcesses.length > 0 && !allProcessesCompleted() ? '1.5px solid #ccc' : '1.5px solid #ff8a00',
										borderRadius: '20px', 
										fontSize: '15px', 
										fontWeight: '500', 
										padding: '12px 20px', 
										alignItems: 'center', 
										justifyContent: 'center', 
										gap: '10px', 
										transition: 'all 0.3s ease', 
										whiteSpace: 'nowrap', 
										boxSizing: 'border-box',
										cursor: interviewProcesses.length > 0 && !allProcessesCompleted() ? 'not-allowed' : 'pointer',
										opacity: interviewProcesses.length > 0 && !allProcessesCompleted() ? 0.6 : 1
									}} 
									onClick={shortlistCandidate}
									disabled={interviewProcesses.length > 0 && !allProcessesCompleted()}
									onMouseEnter={(e) => {
										if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
											e.currentTarget.style.backgroundColor = '#fff3e5';
										}
									}}
									onMouseLeave={(e) => {
										if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
											e.currentTarget.style.backgroundColor = 'transparent';
										}
									}}
									title={interviewProcesses.length > 0 && !allProcessesCompleted() ? 'Complete all interview processes first' : 'Mark candidate as shortlisted'}
								>
									<Check size={16} style={{flexShrink: 0}} />Shortlist Candidate
								</button>
								)}

								{/* Offer Letter Button - Disabled if processes incomplete */}
								<button 
									className="action-btn-consistent" 
									style={{
										backgroundColor: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#e9ecef' : 'transparent',
										color: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#999' : '#ff8a00',
										border: interviewProcesses.length > 0 && !allProcessesCompleted() ? '1.5px solid #ccc' : '1.5px solid #ff8a00',
										borderRadius: '20px', 
										fontSize: '15px', 
										fontWeight: '500', 
										padding: '12px 20px', 
										alignItems: 'center', 
										justifyContent: 'center', 
										gap: '10px', 
										transition: 'all 0.3s ease', 
										whiteSpace: 'nowrap', 
										boxSizing: 'border-box',
										cursor: interviewProcesses.length > 0 && !allProcessesCompleted() ? 'not-allowed' : 'pointer',
										opacity: interviewProcesses.length > 0 && !allProcessesCompleted() ? 0.6 : 1
									}} 
									onClick={hireCandidate}
									disabled={interviewProcesses.length > 0 && !allProcessesCompleted()}
									onMouseEnter={(e) => {
										if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
											e.currentTarget.style.backgroundColor = '#fff3e5';
										}
									}}
									onMouseLeave={(e) => {
										if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
											e.currentTarget.style.backgroundColor = 'transparent';
										}
									}}
									title={interviewProcesses.length > 0 && !allProcessesCompleted() ? 'Complete all interview processes first' : 'Share offer letter with candidate'}
								>
									Offer Letter Shared
								</button>

								{/* Reject Button - Hidden if shortlisted/hired, Disabled if processes incomplete */}
								{application?.status !== 'shortlisted' && application?.status !== 'hired' && application?.status !== 'offer_shared' && (
									<button 
										className={`action-btn-consistent ${application?.status === 'rejected' ? 'btn-rejected' : ''}`} 
										style={{
											backgroundColor: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#e9ecef' : 'transparent',
											color: interviewProcesses.length > 0 && !allProcessesCompleted() ? '#999' : '#ff8a00',
											border: interviewProcesses.length > 0 && !allProcessesCompleted() ? '1.5px solid #ccc' : '1.5px solid #ff8a00',
											borderRadius: '20px', 
											fontSize: '15px', 
											fontWeight: '500', 
											padding: '12px 20px', 
											alignItems: 'center', 
											justifyContent: 'center', 
											gap: '10px', 
											transition: 'all 0.3s ease', 
											whiteSpace: 'nowrap', 
											boxSizing: 'border-box',
											cursor: interviewProcesses.length > 0 && !allProcessesCompleted() ? 'not-allowed' : 'pointer',
											opacity: interviewProcesses.length > 0 && !allProcessesCompleted() ? 0.6 : 1
										}} 
										onClick={rejectCandidate}
										disabled={interviewProcesses.length > 0 && !allProcessesCompleted()}
										onMouseEnter={(e) => {
											if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
												e.currentTarget.style.backgroundColor = '#fff3e5';
											}
										}}
										onMouseLeave={(e) => {
											if (!(interviewProcesses.length > 0 && !allProcessesCompleted())) {
												e.currentTarget.style.backgroundColor = 'transparent';
											}
										}}
										title={interviewProcesses.length > 0 && !allProcessesCompleted() ? 'Complete all interview processes first' : 'Reject this candidate'}
									>
										<X size={16} style={{flexShrink: 0}} />Reject Candidate
									</button>
								)}

								{/* Candidate Not Attended - Always Enabled */}
								<button 
									className={`action-btn-consistent ${application?.status === 'not_attended' ? 'btn-not-attended' : ''}`} 
									style={{
										backgroundColor: 'transparent', 
										color: '#ff8a00', 
										border: '1.5px solid #ff8a00', 
										borderRadius: '20px', 
										fontSize: '15px', 
										fontWeight: '500', 
										padding: '12px 20px', 
										alignItems: 'center', 
										justifyContent: 'center', 
										gap: '10px', 
										transition: 'background-color 0.3s ease', 
										whiteSpace: 'nowrap', 
										boxSizing: 'border-box'
									}} 
									onClick={() => updateApplicationStatus('not_attended')}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff3e5'} 
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
									title="Mark candidate as not attended"
								>
									Candidate Not Attended
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Left Column - Candidate Profile */}
				<div className="col-lg-8" style={{display: 'flex', flexDirection: 'column'}}>
					{/* Personal Information Card */}
					<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
						<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
							<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
								<User size={22} />
								Basic Information
							</h5>
						</div>
						<div className="card-body p-4">
							<div className="row align-items-center mb-4">
								<div className="col-auto">
									<div
										className="overflow-hidden shadow-sm"
										style={{ width: "100px", height: "100px", borderRadius: "12px" }}
									>
										{candidate.profilePicture || candidate.profileImage ? (
											<img
												src={candidate.profilePicture || candidate.profileImage}
												alt={candidate.name}
												style={{ width: "100px", height: "100px", objectFit: "cover" }}
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.parentElement.innerHTML = '<div class="d-flex flex-column align-items-center justify-content-center h-100" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); width: 100px; height: 100px;"><svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><small style="color: #6c757d; font-size: 0.65rem; margin-top: 4px; text-align: center;">Profile image<br/>not uploaded</small></div>';
												}}
											/>
										) : (
											<div className="d-flex flex-column align-items-center justify-content-center h-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', width: '100px', height: '100px'}}>
												<User size={45} style={{color: '#ff6600'}} />
												<small style={{color: '#6c757d', fontSize: '0.65rem', marginTop: '4px', textAlign: 'center'}}>Profile image<br/>not uploaded</small>
											</div>
										)}
									</div>
								</div>
								<div className="col">
									<h3 className="mb-2 fw-bold" style={{color: '#2c3e50'}}>{candidate.name}</h3>
									<p className="mb-2 d-flex align-items-center gap-2" style={{color: '#ff6600', fontWeight: '500'}}>
										<Briefcase size={18} />
										Applied for: {application.jobId?.title || 'Unknown Job'}
									</p>
									<p className="text-muted mb-0 d-flex align-items-center gap-2">
										<Calendar size={16} />
										Applied on: {formatDate(application.createdAt)}
									</p>
								</div>
							</div>

							<div className="row g-4">
								<div className="col-md-6">
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Mail size={16} style={{ color: "#ff6600" }} />
											<strong>Email:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.email}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Phone size={16} style={{ color: "#ff6600" }} />
											<strong>Mobile:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.phone || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<Calendar size={16} style={{ color: "#ff6600" }} />
											<strong>Date of Birth:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.dateOfBirth ? formatDate(candidate.dateOfBirth) : 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Gender:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.gender || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Pincode:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.pincode || 'Not provided'}</p>
									</div>
								</div>
								<div className="col-md-6">

									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Father's/Husband's Name:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.fatherName || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<User size={16} style={{ color: "#ff6600" }} />
											<strong>Mother's Name:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.motherName || 'Not provided'}</p>
									</div>


									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Residential Address:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.residentialAddress || 'Not provided'}</p>
									</div>
									<div className="info-item mb-3">
										<div className="d-flex align-items-center gap-2 mb-1">
											<MapPin size={16} style={{ color: "#ff6600" }} />
											<strong>Permanent Address:</strong>
										</div>
										<p className="text-muted mb-0 ms-4">{candidate.permanentAddress || 'Not provided'}</p>
									</div>

								</div>
							</div>
						</div>
					</div>

					{/* Education Card */}
					{candidate.education && candidate.education.length > 0 && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<GraduationCap size={22} />
									Education Details
								</h5>
							</div>
							<div className="card-body">
								<div className="row">
									{candidate.education.map((edu, index) => (
										<div key={index} className="col-md-6 mb-3 d-flex">
											<div className="border rounded p-3 w-100 d-flex flex-column">
												<h6 className="text-primary mb-2">
													{index === 0 ? '10th Grade' : index === 1 ? '12th Grade' : 'Degree'}
												</h6>
												<p className="mb-1"><strong>Institution:</strong> {edu.collegeName || 'Not provided'}</p>
												{edu.specialization && <p className="mb-1"><strong>Specialization:</strong> {edu.specialization}</p>}
												<p className="mb-1"><strong>Year:</strong> {edu.passYear || 'Not provided'}</p>
												<p className="mb-2"><strong>Score:</strong> {edu.scoreValue || edu.percentage || 'Not provided'}{edu.scoreType === 'percentage' ? '%' : ''}</p>
												{edu.marksheet && (
													<div style={{display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'nowrap'}}>
														<button
															className="btn btn-outline-primary btn-sm"
															style={{color: 'white', backgroundColor: '#ff6600', borderColor: '#ff6600', flex: 1, whiteSpace: 'nowrap'}}
															onClick={() => viewDocument(edu.marksheet)}
														>
															<i className="fa fa-eye me-1" style={{color: 'white'}}></i>View
														</button>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Assigned Interview Process Section - Show when processes exist */}
					{interviewProcesses && interviewProcesses.length > 0 ? (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '15px 15px 0 0'}}>
								<div className="d-flex align-items-center justify-content-between" style={{gap: '12px', flexWrap: 'wrap'}}>
									<h5 className="mb-0 fw-bold" style={{color: '#2c3e50', fontSize: '1.1rem'}}>
										<i className="fa fa-list-check me-2" style={{color: '#ff6600'}}></i>
										Assigned Interview Processes
									</h5>
									<div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
										<span className={`badge px-3 py-2 ${allProcessesCompleted() ? 'bg-success' : 'bg-warning'}`} style={{fontSize: '0.85rem'}}>
											{interviewProcesses.filter(p => p.isCompleted).length}/{interviewProcesses.length} Completed
										</span>
										<button 
											onClick={saveReview}
											className="btn btn-sm"
											style={{
												backgroundColor: '#ff6600',
												color: 'white',
												borderRadius: '20px',
												padding: '6px 16px',
												fontSize: '0.85rem',
												fontWeight: '500',
												border: 'none',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												gap: '6px',
												transition: 'all 0.3s ease'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = '#e55a00';
												e.currentTarget.style.transform = 'scale(1.05)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = '#ff6600';
												e.currentTarget.style.transform = 'scale(1)';
											}}
										>
											<Save size={16} style={{flexShrink: 0}} />
											Save Remarks
										</button>
									</div>
								</div>
							</div>
							<div className="card-body p-4">
								{console.log('Rendering section, processes count:', interviewProcesses.length)}
								<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%'}}>
									{interviewProcesses.map((process) => (
										<div key={process.id} style={{display: 'flex', flexDirection: 'column'}}>
											<div className="border rounded-3 h-100" style={{
												backgroundColor: process.isCompleted ? '#f0f8f0' : 'transparent',
												borderColor: process.isCompleted ? '#28a745' : '#dee2e6',
												borderWidth: '2px',
												transition: 'all 0.3s ease',
												display: 'flex',
												flexDirection: 'column',
												padding: '12px'
											}}>
												{/* Header with Checkbox and Title */}
												<div style={{display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px'}}>
													<div style={{flexShrink: 0, paddingTop: '2px'}}>
														<div className="form-check">
															<input
																className="form-check-input"
																type="checkbox"
																id={`process-${process.id}`}
																checked={process.isCompleted}
																onChange={(e) => updateProcessCompletion(process.id, e.target.checked)}
																style={{width: '22px', height: '22px', cursor: 'pointer', accentColor: '#ff6600'}}
															/>
														</div>
													</div>
													<div style={{flex: 1, minWidth: 0}}>
														<div style={{display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px'}}>
															<h6 className="mb-0 fw-bold" style={{color: '#2c3e50', fontSize: '0.9rem', wordBreak: 'break-word'}}>
																{process.name}
															</h6>
														</div>
														<div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
															{!process.isCompleted && (
																<span className={`badge ${
																	process.status === 'in_progress' ? 'bg-warning' :
																	process.status === 'passed' ? 'bg-success' :
																	process.status === 'failed' ? 'bg-danger' :
																	''
																}`} style={{fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap', backgroundColor: process.status === 'pending' ? 'transparent' : undefined, border: process.status === 'pending' ? '1px solid #ff6600' : undefined, color: process.status === 'pending' ? '#ff6600' : undefined}}>
																	{process.status.charAt(0).toUpperCase() + process.status.slice(1)}
																</span>
															)}
															{process.isCompleted && (
																<span className="badge bg-success" style={{fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap'}}>
																	<i className="fa fa-check-circle me-1"></i>Complete
																</span>
															)}
														</div>
													</div>
												</div>

												{/* Divider */}
												<div style={{height: '1px', backgroundColor: '#e9ecef', margin: '8px 0'}}></div>

												{/* Process Details */}
												<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
													{/* Type and Additional Info */}
													<div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem'}}>
														<span style={{color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px'}}>
															<i className="fa fa-tag" style={{color: '#ff6600', fontSize: '0.9rem'}}></i>
															<strong>Type:</strong> {process.type.charAt(0).toUpperCase() + process.type.slice(1)}
														</span>
														{process.type === 'assessment' && (
															<span style={{color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px'}}>
																<i className="fa fa-clipboard-check" style={{color: '#ff6600', fontSize: '0.9rem'}}></i>
																Assessment
															</span>
														)}
													</div>

													{/* Assessment Result Display */}
													{process.type === 'assessment' && process.result && (
														<div className="rounded" style={{padding: '8px', backgroundColor: 'rgba(255, 102, 0, 0.05)', border: '1px solid rgba(255, 102, 0, 0.2)'}}>
															<small className="text-muted d-block" style={{fontWeight: '600', fontSize: '0.75rem', marginBottom: '4px'}}>Assessment Result:</small>
															<span className={`badge ${
																process.result.toLowerCase() === 'pass' ? 'bg-success' :
																process.result.toLowerCase() === 'fail' ? 'bg-danger' :
																'bg-info'
															}`} style={{fontSize: '0.85rem', padding: '6px 10px'}}>
																<i className={`fa ${
																	process.result.toLowerCase() === 'pass' ? 'fa-check-circle' :
																	process.result.toLowerCase() === 'fail' ? 'fa-times-circle' :
																	'fa-info-circle'
																} me-1`}></i>
																{process.result.toUpperCase()}
															</span>
														</div>
													)}

													{/* Status Dropdown */}
													<div style={{display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px'}}>
														<label className="form-label fw-semibold" style={{fontSize: '0.75rem', color: '#2c3e50', marginBottom: '0'}}>
															<i className="fa fa-list me-2" style={{color: '#ff6600'}}></i>
															Status
														</label>
														<select
															className="form-select"
															value={process.status || 'pending'}
															onChange={(e) => {
																const newStatus = e.target.value;
																setInterviewProcesses(prev => 
																	prev.map(p => p.id === process.id ? { ...p, status: newStatus } : p)
																);
															}}
															style={{
																borderColor: process.isCompleted ? '#28a745' : '#ff6600',
																fontSize: '0.75rem',
																borderWidth: '1.5px',
																padding: '6px 8px'
															}}
														>
															<option value="shortlisted">Shortlisted</option>
															<option value="under_review">Under Review</option>
															<option value="interview_scheduled">Interview Scheduled</option>
															<option value="interview_completed">Interview Completed</option>
															<option value="selected">Selected</option>
															<option value="rejected">Rejected</option>
															<option value="on_hold">On Hold</option>
														</select>
													</div>

													{/* Remarks Input */}
													<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
														<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0'}}>
															<label className="form-label fw-semibold" style={{fontSize: '0.75rem', color: '#2c3e50', marginBottom: '0'}}>
																<i className="fa fa-comment-o me-2" style={{color: '#ff6600'}}></i>
																Remarks
															</label>
															{processRemarks[process.id] && (
																<button
																	type="button"
																	className="btn btn-sm"
																	onClick={() => updateProcessRemark(process.id, '')}
																	style={{
																		backgroundColor: 'transparent',
																		color: '#dc3545',
																		border: '1px solid #dc3545',
																		borderRadius: '4px',
																		padding: '2px 6px',
																		fontSize: '0.65rem'
																	}}
																	title="Remove remarks"
																>
																	<i className="fa fa-trash" style={{fontSize: '0.6rem'}}></i>
																</button>
															)}
														</div>
														<textarea
															className="form-control"
															rows="2"
															placeholder="Enter remarks..."
															value={processRemarks[process.id] || ''}
															onChange={(e) => updateProcessRemark(process.id, e.target.value)}
															style={{
																borderColor: process.isCompleted ? '#28a745' : '#ff6600',
																fontSize: '0.75rem',
																borderWidth: '1.5px',
																resize: 'vertical',
																minHeight: '50px',
																padding: '6px 8px'
															}}
														/>
														<small className="text-muted" style={{fontSize: '0.65rem'}}>Max 500 chars</small>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
								
								{/* Summary Section */}
								<div className="mt-4 p-3 rounded-3" style={{backgroundColor: '#f8f9fa', border: '1px dashed #dee2e6'}}>
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<h6 className="mb-1 fw-bold" style={{color: '#2c3e50'}}>Process Summary</h6>
											<p className="mb-0 text-muted" style={{fontSize: '0.9rem'}}>
												<strong>{interviewProcesses.filter(p => p.isCompleted).length}</strong> of <strong>{interviewProcesses.length}</strong> processes completed
											</p>
										</div>
										<div className="text-end">
											{allProcessesCompleted() ? (
												<span className="badge bg-success" style={{fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap'}}>
													<i className="fa fa-check-circle me-1"></i>All Processes Complete
												</span>
											) : (
												<span className="badge" style={{fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap', backgroundColor: 'rgba(255, 102, 0, 0.15)', color: '#ff6600', border: '1px solid rgba(255, 102, 0, 0.3)'}}>
													<i className="fa fa-hourglass-half me-1"></i>Pending
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 fw-bold" style={{color: '#2c3e50', fontSize: '1.1rem'}}>
									<i className="fa fa-list-check me-2" style={{color: '#ff6600'}}></i>
									Assigned Interview Processes
								</h5>
							</div>
							<div className="card-body p-4">
								<div className="text-center py-5">
									<i className="fa fa-info-circle fa-3x text-muted mb-3"></i>
									<h6 className="text-muted">No Interview Processes Configured</h6>
									<p className="text-muted mb-0">
										The job posting for this position does not have any interview processes configured. 
										Please configure interview rounds/assessment in the job posting settings.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Desired Work Location */}
					{candidate.jobPreferences?.preferredLocations?.length > 0 && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<MapPin size={22} />
									Desired Work Location
								</h5>
							</div>
							<div className="card-body p-4">
								<div className="mb-3">
									<h6 className="fw-bold mb-3" style={{color: '#2c3e50'}}>Preferred Locations</h6>
									<div className="d-flex flex-wrap gap-2">
										{candidate.jobPreferences.preferredLocations.map((location, index) => (
											<span key={index} className="badge px-3 py-2 rounded-pill" style={{backgroundColor: '#ff6600', color: 'white', fontSize: '0.85rem', fontWeight: '500'}}>{location}</span>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Skills & Summary */}
					{(candidate.skills?.length > 0 || candidate.profileSummary) && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<Award size={22} />
									Skills & Summary
								</h5>
							</div>
							<div className="card-body p-4">
								{candidate.skills && candidate.skills.length > 0 && (
									<div className="mb-4">
										<h6 className="fw-bold mb-3" style={{color: '#2c3e50'}}>Key Skills</h6>
										<div className="d-flex flex-wrap gap-2">
											{candidate.skills.map((skill, index) => (
												<span key={index} className="badge px-3 py-2 rounded-pill" style={{backgroundColor: '#ff6600', color: 'white', fontSize: '0.85rem', fontWeight: '500'}}>{skill}</span>
											))}
										</div>
									</div>
								)}
								{candidate.profileSummary && (
									<div>
										<h6>Profile Summary</h6>
										<p className="text-muted" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{candidate.profileSummary}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Present Employment */}
					{candidate.employment?.length > 0 && (
						<div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px'}}>
							<div className="card-header border-0" style={{background: '#f8f9fa', borderRadius: '15px 15px 0 0'}}>
								<h5 className="mb-0 d-flex align-items-center gap-2 fw-bold" style={{color: '#000'}}>
									<Briefcase size={22} />
									Present Employment
								</h5>
							</div>
							<div className="card-body p-4">
								{candidate.employment.map((emp, index) => (
									<div key={index} className="border rounded-3 p-3 mb-3" style={{backgroundColor: emp.isCurrent ? '#f0f8f0' : '#f8f9fa'}}>
										<div className="d-flex justify-content-between align-items-start mb-2">
											<h6 className="fw-bold mb-1" style={{color: '#2c3e50'}}>{emp.designation}</h6>
											{emp.isCurrent && <span className="badge bg-success">Current</span>}
										</div>
										<p className="mb-2 fw-semibold" style={{color: '#ff6600'}}>{emp.organization}</p>
										<div className="row g-3">
											<div className="col-md-6">
												<small className="text-muted d-block">Duration:</small>
												<div>{emp.startDate ? new Date(emp.startDate).toLocaleDateString() : 'N/A'} - {emp.isCurrent ? 'Present' : (emp.endDate ? new Date(emp.endDate).toLocaleDateString() : 'N/A')}</div>
											</div>
											{emp.workType && (
												<div className="col-md-6">
													<small className="text-muted d-block">Work Type:</small>
													<div>{emp.workType}</div>
												</div>
											)}
											{emp.presentCTC && (
												<div className="col-md-6">
													<small className="text-muted d-block">Present CTC:</small>
													<div>{emp.presentCTC}</div>
												</div>
											)}
											{emp.expectedCTC && (
												<div className="col-md-6">
													<small className="text-muted d-block">Expected CTC:</small>
													<div>{emp.expectedCTC}</div>
												</div>
											)}
										</div>
										{emp.description && (
											<div className="mt-3">
												<small className="text-muted d-block">Description:</small>
												<p className="mb-0 text-muted" style={{fontSize: '0.9rem'}}>{emp.description}</p>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default EmpCandidateReviewPage;
