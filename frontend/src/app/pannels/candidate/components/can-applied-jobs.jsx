import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../globals/route-names";
import JobZImage from "../../../common/jobz-img";
import SectionRecordsFilter from "../../public-user/sections/common/section-records-filter";
import SectionPagination from "../../public-user/sections/common/section-pagination";
import { useEffect, useState } from "react";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";

// Company Details Modal Component
function CompanyDetailsModal({ company, isOpen, onClose }) {
    if (!isOpen || !company) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Company Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-3">
                                {company.logo ? (
                                    <img src={company.logo} alt="Company Logo" className="img-fluid" style={{maxHeight: '100px'}} />
                                ) : (
                                    <div className="bg-light p-3 text-center" style={{height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <span>No Logo</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-9">
                                <h4>{company.name}</h4>
                                <p className="text-muted mb-2">
                                    <i className="fa fa-envelope me-2"></i>{company.email}
                                </p>
                                <p className="text-muted mb-3">
                                    <i className="fa fa-phone me-2"></i>{company.phone}
                                </p>
                                <div>
                                    <h6>About Company:</h6>
                                    <p>{company.description || 'No description available.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CanAppliedJobsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showCompanyModal, setShowCompanyModal] = useState(false);

    const _filterConfig = {
        prefix: "Applied",
        type: "jobs",
        total: applications.length.toString(),
        showRange: false,
        showingUpto: ""
    }

    useEffect(()=>{
        loadScript("js/custom.js")
        fetchApplications();
    }, [])

    const fetchApplications = async () => {
        try {
            const response = await api.getCandidateApplications();
            if (response.success) {
                setApplications(response.data || []);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyClick = async (employerId, jobData) => {
        try {
            // For consultant jobs, use job data directly
            if (jobData.companyName || jobData.companyLogo) {
                setSelectedCompany({
                    name: jobData.companyName || 'Company Name',
                    description: jobData.companyDescription || 'No description available',
                    logo: jobData.companyLogo,
                    email: 'Contact via platform',
                    phone: 'Contact via platform'
                });
            } else {
                // For regular companies, fetch employer profile
                const response = await fetch(`http://localhost:5000/api/public/employers/${employerId}`);
                const data = await response.json();
                if (data.success) {
                    setSelectedCompany({
                        name: data.profile.companyName || data.profile.employerId.companyName,
                        description: data.profile.description || data.profile.companyDescription,
                        logo: data.profile.logo,
                        email: data.profile.email || data.profile.employerId.email,
                        phone: data.profile.phone || data.profile.employerId.phone
                    });
                }
            }
            setShowCompanyModal(true);
        } catch (error) {
            
        }
    };

    return (
			<>
				<div className="twm-right-section-panel candidate-save-job site-bg-gray">
					{/*Filter Short By*/}
					<SectionRecordsFilter _config={_filterConfig} />

					<div className="twm-jobs-list-wrap">
						{loading ? (
							<div className="text-center p-4">Loading applications...</div>
						) : applications.length === 0 ? (
							<div className="text-center p-4">No applications found</div>
						) : (
							<ul>
								{applications.map((app, index) => (
									<li key={index}>
										<div className="twm-jobs-list-style1 mb-5">
											<div className="twm-media">
												<JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
											</div>
											<div className="twm-mid-content">
												<NavLink
													to={`/jobs/${app.job?._id}`}
													className="twm-job-title"
												>
													<h4>
														{app.job?.title || 'Job Title'}
														<span className="twm-job-post-duration">
															/ {new Date(app.appliedAt).toLocaleDateString()}
														</span>
													</h4>
												</NavLink>
												<p className="twm-candidate-address">
													<i className="feather-map-pin" /> {app.job?.location || 'Location'}
												</p>
												<p className="twm-job-websites site-text-primary" 
												   style={{cursor: 'pointer'}} 
												   onClick={() => handleCompanyClick(app.employerId, app.jobId)}>
													{app.jobId?.companyName || app.employerId?.companyName || 'Company Name'}
												</p>
											</div>
											<div className="twm-right-content">
												<div className="twm-jobs-category green">
													<span className={`twm-bg-${app.status === 'pending' ? 'golden' : app.status === 'accepted' ? 'green' : 'red'}`}>
														{app.status || 'Pending'}
													</span>
												</div>
												<div className="twm-jobs-amount">
													{app.job?.salary || 'Not specified'}
												</div>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>

					<SectionPagination />
				</div>

				<CompanyDetailsModal 
					company={selectedCompany}
					isOpen={showCompanyModal}
					onClose={() => setShowCompanyModal(false)}
				/>
			</>
		);
}

export default CanAppliedJobsPage;
