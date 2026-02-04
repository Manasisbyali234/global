import { useEffect, useState, useCallback } from "react";
import SectionCanAccomplishments from "../sections/resume/section-can-accomplishments";
import SectionCanAttachment from "../sections/resume/section-can-attachment";
import SectionCanDesiredProfile from "../sections/resume/section-can-desired-profile";
import SectionCanEducation from "../sections/resume/section-can-education";
import SectionCanWorkLocation from "../sections/resume/section-can-work-location";
import SectionCanEmployment from "../sections/resume/section-can-employment";
import SectionCanKeySkills from "../sections/resume/section-can-keyskills";
import SectionCanPersonalDetail from "../sections/resume/section-can-personal";
import SectionCanProfileSummary from "../sections/resume/section-can-profile-summary";
import SectionCanProjects from "../sections/resume/section-can-projects";
import SectionCanResumeHeadline from "../sections/resume/section-can-resume-headline";


import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { initializeAllModals } from "../../../../utils/modalUtils";
import "./resume-styles.css";
import "../../../../table-overflow-fix.css";
import "../../../../resume-table-hot-scroll-fix.css";
import "../../../../table-overflow-override-fix.css";


function CanMyResumePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(()=>{
        const token = localStorage.getItem('candidateToken');
        if (token) {
            fetchProfile();
        } else {
            setError('Please login to view your resume');
            setLoading(false);
        }
    }, [])
    


    const fetchProfile = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getCandidateProfile();
            
            if (response.success) {
                setProfile(response.profile);
                // Trigger dashboard refresh by dispatching custom event
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                setError('Failed to load profile data');
            }
        } catch (error) {
            
            setError('Unable to connect to server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleProfileUpdate = useCallback(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
			<>
				<div className="twm-right-section-panel site-bg-gray">
					{/* Resume Page Header */}
					<div className="resume-page-header-container">
						<div className="resume-page-header-inner">
							<div style={{ textAlign: 'center' }}>
								<h2 className="resume-page-title">
									<i className="fa fa-file-text-o me-2" style={{color: '#f97316'}}></i>
									My Resume
								</h2>
								<p className="resume-page-subtitle">
									<i className="fa fa-wrench me-1" style={{color: '#f97316'}}></i>
									Build and manage your professional resume
								</p>
							</div>
						</div>
					</div>

					{/* Resume Content */}
					<div className="resume-content-container">
						{loading ? (
							<div className="text-center p-5">
								<div className="d-flex flex-column align-items-center">
									<i className="fa fa-spinner fa-spin fa-3x site-text-primary mb-3"></i>
									<h5 className="text-muted">Loading your resume...</h5>
									<p className="text-muted small">Please wait while we fetch your profile data</p>
								</div>
							</div>
						) : error ? (
							<div className="text-center p-5">
								<div className="alert alert-danger">
									<i className="fa fa-times-circle fa-2x mb-3"></i>
									<h5>Error Loading Profile</h5>
									<p>{error}</p>
									<button 
										type="button" 
										className="btn btn-primary mt-2"
										onClick={() => {
											setLoading(true);
											fetchProfile();
										}}
									>
										<i className="fa fa-refresh me-1"></i>
										Try Again
									</button>
								</div>
							</div>
						) : (
							<div className="row">
								<div className="col-12">
									<div className="panel panel-default mb-4">
										<SectionCanResumeHeadline profile={profile} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanProfileSummary profile={profile} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanKeySkills profile={profile} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanPersonalDetail profile={profile} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanEducation profile={profile} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanWorkLocation profile={profile} onUpdate={handleProfileUpdate} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanEmployment profile={profile} onUpdate={handleProfileUpdate} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanAttachment profile={profile} />
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</>
		);
}

export default CanMyResumePage;
