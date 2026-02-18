import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import { formatDate } from '../../../../utils/dateFormatter';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { pubRoute, publicUser } from "../../../../globals/route-names";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import "./status-styles.css";
import "../../../../table-overflow-fix.css";

function CanStatusPage() {
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showAllDetails, setShowAllDetails] = useState(false);
	const [selectedApplication, setSelectedApplication] = useState(null);

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplications();
	}, []);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			console.log('Fetching applications...');
			const response = await api.getCandidateApplicationsWithInterviews();
			console.log('API Response:', response);
			
			if (response && response.success) {
				const apps = response.applications || response.data || [];
				console.log('Applications received:', apps.length);
				setApplications(apps);
			} else {
				console.error('API failed:', response);
				throw new Error(response?.message || 'Failed to fetch');
			}
		} catch (error) {
			console.error('Primary API failed:', error);
			try {
				console.log('Trying fallback...');
				const fallbackResponse = await api.getCandidateApplications();
				if (fallbackResponse && fallbackResponse.success) {
					const apps = fallbackResponse.applications || fallbackResponse.data || [];
					console.log('Fallback success:', apps.length);
					setApplications(apps);
				} else {
					console.error('Fallback failed:', fallbackResponse);
					setApplications([]);
				}
			} catch (fallbackError) {
				console.error('Both APIs failed:', fallbackError);
				setApplications([]);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleViewAllDetails = (application) => {
		setSelectedApplication(application);
		setShowAllDetails(true);
	};

	return (
		<>
			<div className="twm-right-section-panel site-bg-gray">
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

				<div style={{ padding: '0 2rem 2rem 2rem' }}>
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
									<div className="table-responsive" style={{overflowX: 'auto'}}>
										<table className="table table-hover mb-0">
											<thead style={{backgroundColor: '#f8f9fa'}}>
												<tr>
													<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
														<i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
														Applied Date
													</th>
													<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
														<i className="fa fa-building me-2" style={{color: '#ff6b35'}}></i>
														Company
													</th>
													<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
														<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
														Position
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
														<td colSpan="5" className="text-center py-5">
															<div className="d-flex flex-column align-items-center">
																<i className="fa fa-spinner fa-spin fa-3x mb-3" style={{color: '#ff6b35'}}></i>
																<p className="text-muted mb-0">Loading your applications...</p>
															</div>
														</td>
													</tr>
												) : applications.length === 0 ? (
													<tr>
														<td colSpan="5" className="text-center py-5">
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
													applications.map((app, index) => (
														<tr key={index} className="border-bottom">
															<td className="px-4 py-3">
																<span className="text-dark fw-medium">
																	{formatDate(app.createdAt || app.appliedAt)}
																</span>
															</td>
															<td className="px-4 py-3">
																<div className="d-flex align-items-center">
																	<div className="me-3">
																		<div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35', overflow: 'hidden'}}>
																			{app.jobId?.companyLogo ? (
																				<img src={app.jobId.companyLogo} alt="Company Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
																			) : (
																				<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px'}}></i>
																			)}
																		</div>
																	</div>
																	<div>
																		<h6 className="mb-1 fw-semibold text-dark" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
																			{app.employerId?.companyName || 'Company Name Not Available'}
																			{app.jobId?.companyName && app.jobId.companyName !== app.employerId?.companyName && (
																				<span className="badge bg-info bg-opacity-10 text-info border border-info ms-1" style={{ fontSize: '10px', padding: '2px 6px', fontWeight: '500', textTransform: 'none' }}>
																					Hiring for: {app.jobId.companyName}
																				</span>
																			)}
																		</h6>
																		<small className="text-muted d-block mt-1">
																			<i className="fas fa-map-marker-alt me-1"></i>
																			{Array.isArray(app.jobId?.location) ? app.jobId.location.join(', ') : (app.jobId?.location || 'Location Not Available')}
																		</small>
																	</div>
																</div>
															</td>
															<td className="px-4 py-3">
																<span className="fw-medium text-dark">
																	{app.jobId?.title || 'Position Not Available'}
																</span>
															</td>
															<td className="px-4 py-3">
																<span className={
																	app.status === 'pending' ? 'badge bg-warning bg-opacity-10 text-warning border border-warning' :
																	app.status === 'shortlisted' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'interviewed' ? 'badge bg-primary bg-opacity-10 text-primary border border-primary' :
																	app.status === 'hired' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	app.status === 'rejected' ? 'badge bg-danger bg-opacity-10 text-danger border border-danger' : 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary'
																} style={{fontSize: '12px', padding: '6px 12px'}}>
																	{app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
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
																	title="View all details"
																>
																	<i className="fa fa-eye" style={{color: '#ff6b35', fontSize: '18px'}}></i>
																</button>
															</td>
														</tr>
													))
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
			
			{/* Details Modal */}
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
											<strong>Location:</strong> {Array.isArray(selectedApplication.jobId?.location) ? selectedApplication.jobId.location.join(', ') : (selectedApplication.jobId?.location || 'N/A')}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Applied Date:</strong> {formatDate(selectedApplication.createdAt || selectedApplication.appliedAt)}
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

								{/* Interview Rounds with Sub-Stages */}
								<div className="mb-3">
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
										Interview Rounds
									</h6>
									{selectedApplication.interviewProcess?.stages && selectedApplication.interviewProcess.stages.length > 0 ? (
										selectedApplication.interviewProcess.stages.map((stage, stageIndex) => (
											<div key={stageIndex} className="mb-3 p-3" style={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
												<div className="d-flex justify-content-between align-items-center mb-2">
													<h6 className="mb-0" style={{color: '#232323', fontWeight: '600'}}>
														<i className="fa fa-circle me-2" style={{color: '#ff6b35', fontSize: '8px'}}></i>
														{stage.stageName || stage.stageType}
													</h6>
													<span className="badge bg-info" style={{fontSize: '12px', padding: '4px 8px'}}>
														{stage.status || 'Pending'}
													</span>
												</div>
												
												{/* Sub-Stages */}
												{stage.subStages && stage.subStages.length > 0 && (
													<div className="mt-3">
														<small className="text-muted d-block mb-2">
															<i className="fa fa-list me-1"></i>
															<strong>Sub-Stages:</strong>
														</small>
														{stage.subStages.map((subStage, subIndex) => (
															<div key={subIndex} className="mt-2 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																<div className="d-flex justify-content-between align-items-center mb-1">
																	<strong>Scheduled Timing {subIndex + 1}</strong>
																	{subStage.status && (
																		<span className="badge bg-secondary" style={{fontSize: '10px'}}>
																			{subStage.status}
																		</span>
																	)}
																</div>
																{subStage.fromDate && (
																	<div><small><strong>Date:</strong> {formatDate(subStage.fromDate)}</small></div>
																)}
																{subStage.startTime && subStage.endTime && (
																	<div><small><strong>Time:</strong> {subStage.startTime} - {subStage.endTime}</small></div>
																)}
																{subStage.description && (
																	<div className="mt-1"><small>{subStage.description}</small></div>
																)}
															</div>
														))}
													</div>
												)}
												
												{/* Stage Description */}
												{stage.description && (
													<div className="mt-2 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
														<small className="text-muted"><i className="fa fa-info-circle me-1"></i>Description:</small>
														<div className="mt-1">{stage.description}</div>
													</div>
												)}
											</div>
										))
									) : (
										<div className="text-center py-3 text-muted">
											<i className="fa fa-info-circle me-2"></i>
											No interview rounds configured yet
										</div>
									)}
								</div>
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