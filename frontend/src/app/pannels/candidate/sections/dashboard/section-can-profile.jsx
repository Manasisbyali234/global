import { useEffect, useState } from 'react';
import { api } from '../../../../../utils/api';

const SECTION_ANCHORS = {
	'Resume Headline': 'resume-headline',
	'Profile Summary': 'profile-summary',
	'Key Skills': 'key-skills',
	'Personal Details': 'personal-details',
	'Education (need at least 1 complete entry)': 'education',
	'Work Location Preferences': 'work-location',
	'Resume Attachment': 'resume-attachment',
};

function CompleteProfileCard() {
	const [profileCompletion, setProfileCompletion] = useState(0);
	const [missingSections, setMissingSections] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchProfileCompletion();
		
		const handleProfileUpdate = () => {
			fetchProfileCompletion();
			window.dispatchEvent(new CustomEvent('refreshNotifications'));
		};
		
		window.addEventListener('profileUpdated', handleProfileUpdate);
		
		return () => {
			window.removeEventListener('profileUpdated', handleProfileUpdate);
		};
	}, []);

	const fetchProfileCompletion = async () => {
		try {
			const response = await api.getCandidateProfile();
			if (response.success) {
				const completion = response.profileCompletion || 0;
				const details = response.profileCompletionDetails || { missingSections: [] };
				setProfileCompletion(completion);
				setMissingSections(details.missingSections || []);
				window.dispatchEvent(new CustomEvent('refreshNotifications'));
			}
		} catch (error) {
			console.error('Error fetching profile completion:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-white p-4 rounded shadow-sm mb-4">
				<div className="text-center">
					<div className="d-flex align-items-center justify-content-center">
						<i className="fa fa-spinner fa-spin me-2"></i>
						Loading profile completion...
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="bg-white p-4 rounded shadow-sm mb-4">
			<h4 className="text-primary mb-2">Complete Your Resume</h4>
			<p className="text-muted mb-3" style={{ fontSize: "14px" }}>
				A complete profile increases your chances of getting hired
			</p>
			{profileCompletion === 100 && (
				<div className="alert alert-success py-2 mb-3" style={{ fontSize: "13px" }}>
					<i className="fa fa-check-circle me-1"></i>
					Congratulations! Your profile is 100% complete.
				</div>
			)}

			{/* Profile Completion Label */}
			<div className="d-flex justify-content-between align-items-center mb-1">
				<span className="fw-semibold">Profile Completion</span>
				<span className="text-primary fw-semibold">{profileCompletion}%</span>
			</div>

			{/* Progress Bar */}
			<div
				className="progress"
				style={{ height: "10px", borderRadius: "10px" }}
			>
				<div
					className="progress-bar progress-animated"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={profileCompletion}
					style={{
						width: `${profileCompletion}%`,
						backgroundColor: "#2563eb",
						borderRadius: "10px",
					}}
				/>
			</div>

			{/* Missing Sections */}
			{missingSections.length > 0 && (
				<div className="mt-3">
					<small className="text-muted d-block mb-2">
						<i className="fa fa-info-circle me-1"></i>
						Missing sections:
					</small>
					<div className="d-flex flex-wrap gap-1">
						{missingSections.map((section, index) => {
							const anchor = SECTION_ANCHORS[section] || 'resume-headline';
							return (
								<a
									key={index}
									href={`/candidate/my-resume#${anchor}`}
									className="badge bg-light text-dark text-decoration-none"
									style={{fontSize: '11px', cursor: 'pointer', border: '1px solid #dee2e6'}}
									onMouseEnter={(e) => { e.currentTarget.style.background = '#fff3cd'; e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.color = '#ff6b35'; }}
									onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.color = ''; }}
								>
									<i className="fa fa-plus-circle me-1" style={{fontSize: '10px'}}></i>
									{section}
								</a>
							);
						})}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="mt-3 d-flex flex-wrap gap-2">
				<button
					className="btn btn-outline-primary btn-lg px-5"
					style={{backgroundColor: 'transparent !important', borderColor: '#ff6b35 !important', color: '#ff6b35 !important', transition: 'none !important'}}
					onMouseEnter={(e) => {e.target.style.setProperty('background-color', 'transparent', 'important'); e.target.style.setProperty('border-color', '#ff6b35', 'important'); e.target.style.setProperty('color', '#ff6b35', 'important');}}
					onMouseLeave={(e) => {e.target.style.setProperty('background-color', 'transparent', 'important'); e.target.style.setProperty('border-color', '#ff6b35', 'important'); e.target.style.setProperty('color', '#ff6b35', 'important');}}
					onClick={() => (window.location.href = "/candidate/my-resume")}
				>
					{profileCompletion === 100 ? 'View Resume' : 'Complete Resume'}
				</button>
			</div>
		</div>
	);
}

export default CompleteProfileCard;
