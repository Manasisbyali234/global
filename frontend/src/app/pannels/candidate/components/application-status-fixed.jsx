import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { pubRoute, publicUser } from "../../../../globals/route-names";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import "./status-styles.css";

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
																	{new Date(app.createdAt || app.appliedAt).toLocaleDateString('en-US', {
																		day: '2-digit',
																		month: 'short',
																		year: 'numeric'
																	})}
																</span>
															</td>
															<td className="px-4 py-3">
																<div className="d-flex align-items-center">
																	<div className="me-3">
																		<div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35'}}>
																			<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px'}}></i>
																		</div>
																	</div>
																	<div>
																		<h6 className="mb-1 fw-semibold text-dark">
																			{app.employerId?.companyName || 'Company Name Not Available'}
																		</h6>
																		<small className="text-muted">
																			<i className="fas fa-map-marker-alt me-1"></i>
																			{app.jobId?.location || 'Location Not Available'}
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
				<div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowAllDetails(false)}>
					<div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
						<div className="modal-content" style={{borderRadius: '12px', border: 'none'}}>
							<div className="modal-header">
								<h5 className="modal-title">Application Details</h5>
								<button type="button" className="btn-close" onClick={() => setShowAllDetails(false)}></button>
							</div>
							<div className="modal-body">
								<div className="mb-3">
									<strong>Company:</strong> {selectedApplication.employerId?.companyName || 'N/A'}
								</div>
								<div className="mb-3">
									<strong>Position:</strong> {selectedApplication.jobId?.title || 'N/A'}
								</div>
								<div className="mb-3">
									<strong>Status:</strong> {selectedApplication.status || 'N/A'}
								</div>
								<div className="mb-3">
									<strong>Applied Date:</strong> {new Date(selectedApplication.createdAt || selectedApplication.appliedAt).toLocaleDateString()}
								</div>
							</div>
							<div className="modal-footer">
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