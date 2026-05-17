import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
import PageLoader from "../../../../components/PageLoader";
import "../../../../table-overflow-fix.css";
import "../../../../resume-table-hot-scroll-fix.css";
import "../../../../table-overflow-override-fix.css";
import "./resume-styles.css";


function CanMyResumePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const incompleteSections = location.state?.incompleteSections || [];
    
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

    useEffect(() => {
        if (!loading && !error && window.location.hash) {
            const id = window.location.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
        }
    }, [loading, error]);

    useEffect(() => {
        if (!loading && !error && incompleteSections.length > 0) {
            const sectionIdMap = {
                'Resume Headline': 'resume-headline',
                'Profile Summary': 'profile-summary',
                'Key Skills': 'key-skills',
                'Desired Work Location': 'work-location',
                'Educational Qualification (at least one entry)': 'education',
            };
            const personalFields = ['Date of Birth', 'Gender', "Father's/Husband's Name", "Mother's Name", 'Residential Address', 'Permanent Address'];
            const firstId = incompleteSections.reduce((found, s) => {
                if (found) return found;
                if (personalFields.includes(s)) return 'personal-details';
                return sectionIdMap[s] || null;
            }, null);
            if (firstId) {
                setTimeout(() => {
                    const el = document.getElementById(firstId);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    }, [loading, error, incompleteSections]);

    return (
			<>
				<div className="twm-right-section-panel site-bg-gray candidate-resume-page">
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

					{incompleteSections.length > 0 && (
						<div className="alert alert-danger mx-3 mt-3" style={{border: '2px solid #dc3545'}}>
							<strong><i className="fa fa-exclamation-circle me-2"></i>Action Required:</strong>
							<span className="ms-1">Please complete all mandatory Resume and Personal Details sections before applying for jobs.</span>
						</div>
					)}

					{/* Resume Content */}
					<div className="resume-content-container">
						{loading ? (
							<PageLoader pageName="Resume" />
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
									<div id="resume-headline" className="panel panel-default mb-4" style={incompleteSections.includes('Resume Headline') ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanResumeHeadline profile={profile} />
									</div>

									<div id="profile-summary" className="panel panel-default mb-4" style={incompleteSections.includes('Profile Summary') ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanProfileSummary profile={profile} />
									</div>

									<div id="key-skills" className="panel panel-default mb-4" style={incompleteSections.includes('Key Skills') ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanKeySkills profile={profile} />
									</div>

									<div id="personal-details" className="panel panel-default mb-4" style={incompleteSections.some(s => ['Date of Birth','Gender',"Father's/Husband's Name","Mother's Name",'Residential Address','Permanent Address'].includes(s)) ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanPersonalDetail profile={profile} />
									</div>

									<div id="education" className="panel panel-default mb-4 education-panel-container" style={incompleteSections.includes('Educational Qualification (at least one entry)') ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanEducation profile={profile} />
									</div>

									<div id="work-location" className="panel panel-default mb-4" style={incompleteSections.includes('Desired Work Location') ? {border: '2px solid #dc3545', borderRadius: '4px'} : {}}>
										<SectionCanWorkLocation profile={profile} onUpdate={handleProfileUpdate} />
									</div>

									<div className="panel panel-default mb-4">
										<SectionCanEmployment profile={profile} onUpdate={handleProfileUpdate} />
									</div>

									<div id="resume-attachment" className="panel panel-default mb-4">
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
