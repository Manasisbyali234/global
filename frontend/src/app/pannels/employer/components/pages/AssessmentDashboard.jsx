import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AssessmentCard from "../assessments/AssessmnetCard";
import CreateAssessmentModal from "../assessments/CreateassessmentModal";
import { api } from '../../../../../utils/api';
import './assessment-dashboard.css';
import '../../../../../assessment-modal-fix.css';
import '../../../../../assessment-title-hide.css';

import { showSuccess, showError, showWarning, showConfirmation } from '../../../../../utils/popupNotification';

const STATUS_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived" }
];

export default function AssessmentDashboard() {
	const [assessments, setAssessments] = useState([]);
	const [filteredAssessments, setFilteredAssessments] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [showInstructionsModal, setShowInstructionsModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editingAssessment, setEditingAssessment] = useState(null);
	const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [companySearch, setCompanySearch] = useState("");
	const [isConsultantEmployer, setIsConsultantEmployer] = useState(false);
	const [isSelectorOpen, setIsSelectorOpen] = useState(false);
	const selectorRef = useRef(null);

	const truncateText = (value, maxLength) => {
		const text = String(value || '').trim();
		if (text.length <= maxLength) {
			return text;
		}
		return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
	};

	const getAssessmentOptionLabel = (assessment) => {
		const title = truncateText(assessment.title || 'Untitled Assessment', 32);
		const designation = truncateText(assessment.designation || 'N/A', 18);
		const duration = assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'N/A';
		return `${title} | ${designation} | ${duration} min`;
	};

	const getAssessmentOptionTitle = (assessment) => {
		const duration = assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'N/A';
		return `${assessment.title || 'Untitled Assessment'} - ${assessment.designation || 'N/A'} (${duration} min)`;
	};

	const getSelectedAssessment = () =>
		assessments.find((assessment) => assessment._id === selectedAssessmentId) || null;

	const getAssessmentStatus = (assessment) =>
		String(assessment?.status || "published").trim().toLowerCase();

	const handleCreateAssessmentClick = () => {
		const securityMessage = (
			<div style={{ textAlign: 'left', lineHeight: '1.6', padding: '4px 6px' }}>
				<div style={{ marginBottom: '14px', color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>
					<i className="fa fa-lock" style={{ color: '#f97316', marginRight: '10px' }} />
					End-to-End encryption ensures your assessments remain completely private and secure.
				</div>
				<div style={{ display: 'grid', gap: '10px', color: '#475569', fontSize: '14px' }}>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-eye-slash" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>Not even Tale-Global can read or copy the content</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-user" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>Only you can access and manage your assessment content.</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-ban" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>No one outside the platform can read, copy or share your questions or answers.</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-lock" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>All assessment content is securely encrypted.</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-file-text" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>Candidate responses are protected and confidential.</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-shield" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>Results and evaluations are accessible only to authorized users.</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
						<i className="fa fa-database" style={{ width: '16px', color: '#f97316', marginTop: '3px' }} />
						<span>All assessment data is safely stored and protected.</span>
					</div>
				</div>
				<div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', color: '#1e293b', fontSize: '13px', fontWeight: '600' }}>
					<i className="fa fa-check-circle" style={{ color: '#f97316', marginRight: '10px' }} />
					Agree to terms and conditions
				</div>
			</div>
		);

		showConfirmation(
			securityMessage,
			() => setShowModal(true),
			null,
			'secure',
			{
				confirmText: 'Agree',
				cancelText: 'Cancel'
			}
		);
	};

	useEffect(() => {
		fetchAssessments();
		fetchEmployerType();
	}, []);

	useEffect(() => {
		if (selectedAssessmentId && !assessments.some((assessment) => assessment._id === selectedAssessmentId)) {
			setSelectedAssessmentId("");
		}
	}, [assessments, selectedAssessmentId]);

	useEffect(() => {
		const normalizedCompanySearch = String(companySearch || '').trim().toLowerCase();
		const filtered = assessments.filter((assessment) => {
			const matchesAssessment = !selectedAssessmentId || assessment._id === selectedAssessmentId;
			const matchesStatus = selectedStatus === "all" || getAssessmentStatus(assessment) === selectedStatus;
			const matchesCompany =
				!isConsultantEmployer ||
				!normalizedCompanySearch ||
				String(assessment.companyName || '').toLowerCase().includes(normalizedCompanySearch);
			return matchesAssessment && matchesStatus && matchesCompany;
		});

		setFilteredAssessments(filtered);
	}, [assessments, selectedAssessmentId, selectedStatus, companySearch, isConsultantEmployer]);

	useEffect(() => {
		const handlePointerDown = (event) => {
			if (selectorRef.current && !selectorRef.current.contains(event.target)) {
				setIsSelectorOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, []);

	const fetchAssessments = async () => {
		try {
			const response = await api.getEmployerAssessments();
			if (response.success) {
				setAssessments(response.assessments);
			}
		} catch (error) {
			console.error('Error fetching assessments:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchEmployerType = async () => {
		try {
			const response = await api.getEmployerProfile();
			if (response?.success && response.profile) {
				const employerType = String(response.profile?.employerId?.employerType || '').toLowerCase();
				const employerCategory = String(response.profile?.employerCategory || '').toLowerCase();
				setIsConsultantEmployer(employerType === 'consultant' || employerCategory === 'consultancy');
			}
		} catch (error) {
			console.error('Error fetching employer profile:', error);
		}
	};

	const handleCreateAssessment = async (assessmentData) => {
		try {
			let response;
			if (assessmentData.id) {
				// Update existing assessment
				response = await api.updateEmployerAssessment(assessmentData.id, assessmentData);
				if (response.success) {
					const updatedAssessments = assessments.map(a => a._id === assessmentData.id ? response.assessment : a);
					setAssessments(updatedAssessments);
					setShowModal(false);
					setEditingAssessment(null);
					const successMessage = assessmentData.status === 'draft' ? 'Assessment Draft updated successfully!' : 'Assessment updated successfully!';
					showSuccess(successMessage);
				}
			} else {
				// Create new assessment
				response = await api.createEmployerAssessment(assessmentData);
				if (response.success) {
					const newAssessments = [response.assessment, ...assessments];
					setAssessments(newAssessments);
					setShowModal(false);
					showSuccess('Assessment created successfully!');
				}
			}
		} catch (error) {
			console.error('Error saving assessment:', error.message);
			let errorMessage = assessmentData.id ? 'Failed to update assessment' : 'Failed to create assessment';
			if (error.message) {
				errorMessage = error.message;
			}
			showError(errorMessage);
		}
	};

	const handleEditAssessment = (assessment) => {
		if (assessment?.isAssigned) {
			showWarning('Assigned assessments cannot be edited.');
			return;
		}

		setEditingAssessment(assessment);
		setShowModal(true);
	};

	const handleDeleteAssessment = async (assessment) => {
		if (assessment?.isAssigned) {
			showWarning('Assigned assessments cannot be deleted.');
			return;
		}

		showConfirmation(
			'Are you sure you want to delete this assessment?',
			async () => {
				try {
					await api.deleteEmployerAssessment(assessment._id);
					const updatedAssessments = assessments.filter(a => a._id !== assessment._id);
					setAssessments(updatedAssessments);
					showSuccess('Assessment deleted successfully');
				} catch (error) {
					console.error('Error deleting assessment:', error);
					showError(error.message || 'Failed to delete assessment');
				}
			},
			() => {},
			'warning'
		);
	};

	if (loading) {
		return (
			<div className="twm-right-section-panel site-bg-gray" style={{
				width: '100%',
				margin: 0,
				padding: '2rem',
				background: '#f7f7f7',
				minHeight: '100vh'
			}}>
				<div className="text-center py-4">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	const selectedAssessment = getSelectedAssessment();

	const instructionsModal = showInstructionsModal && typeof document !== "undefined"
		? createPortal(
			<div
				className="assessment-instructions-modal-overlay"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						setShowInstructionsModal(false);
					}
				}}
				role="presentation"
			>
				<div
					className="assessment-instructions-modal"
					role="dialog"
					aria-modal="true"
					aria-labelledby="assessment-instructions-title"
				>
					<div className="assessment-instructions-header">
						<div className="assessment-instructions-heading">
							<div className="assessment-instructions-icon">
								<i className="fa fa-info-circle" aria-hidden="true"></i>
							</div>
							<div>
								<h3 id="assessment-instructions-title">Instructions for Assessment & Interview Process</h3>
								<p className="mb-0">Review these guidelines before managing candidate assessments and interview rounds.</p>
							</div>
						</div>
						<button
							type="button"
							className="btn btn-dark assessment-instructions-header-close"
							onClick={() => setShowInstructionsModal(false)}
						>
							Close
						</button>
					</div>

					<div className="assessment-instructions-body">
						<div className="assessment-instructions-item">
							<h4>For MCQ Assessments</h4>
							<p>Results are evaluated automatically and candidates can view their results immediately after completion.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>For Subjective / Descriptive / Written Tests</h4>
							<p>Evaluation must be done manually by the employer. Candidates become eligible for the next round only after marks or stages are updated.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>Progression to Next Round (MCQ)</h4>
							<p>If a candidate meets the qualifying criteria, the next interview stage, including slot booking, is enabled instantly.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>Mandatory Status Updates</h4>
							<p>Updating candidate status at every stage is mandatory. Without status updates, candidates cannot access or book slots for the next round.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>Candidate Monitoring & Integrity</h4>
							<p>During assessments, the candidate&apos;s webcam remains active and images are captured throughout the test. All captured images are available inside the respective candidate application for review.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>Right to Reject</h4>
							<p>Employers have full authority to reject candidates at any stage, even after passing the assessment, if malpractice such as copying or external assistance is detected.</p>
						</div>
						<div className="assessment-instructions-item">
							<h4>Timely Updates</h4>
							<p>Employers must update the status of each stage within 24 hours to ensure a smooth hiring process.</p>
						</div>
					</div>
				</div>
			</div>,
			document.body
		)
		: null;

	return (
		<div className="twm-right-section-panel site-bg-gray emp-assessment-page" style={{
			width: '100%',
			margin: 0,
			padding: 0,
			background: '#f7f7f7',
			minHeight: '100vh'
		}}>
			{/* Header */}
			<div className="employer-page-shell employer-page-shell--header">
				<div className="wt-admin-right-page-header clearfix employer-page-header-card" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<h2 className="employer-page-title">Assessments</h2>
								<p className="employer-page-subtitle text-muted mb-0">Manage and create your assessments</p>
							</div>
							<div className="d-flex align-items-center gap-3">
								<span className="badge bg-light text-dark px-3 py-2" style={{fontSize: '14px'}}>
									Showing: {filteredAssessments.length} of {assessments.length}
								</span>
								<button
									type="button"
									className="btn btn-outline-secondary assessment-instructions-button"
									onClick={() => setShowInstructionsModal(true)}
								>
									<i className="fa fa-info-circle me-2"></i>Instructions
								</button>
								<button className="btn btn-dark" onClick={handleCreateAssessmentClick}>
									<i className="fa fa-plus me-2"></i>Create Assessment
								</button>
							</div>
						</div>
				</div>
			</div>

			{/* Assessment Selector */}
			<div className="employer-page-shell">
				<div className="d-flex flex-wrap gap-3 align-items-center employer-page-content-card assessment-selector-row" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
					<label className="form-label mb-0 fw-semibold assessment-selector-label">Select Assessment:</label>
					<div className="assessment-selector-control-wrap" ref={selectorRef}>
						<button
							type="button"
							className="assessment-selector-trigger"
							onClick={() => setIsSelectorOpen((current) => !current)}
							aria-expanded={isSelectorOpen}
							aria-haspopup="listbox"
							title={selectedAssessment ? getAssessmentOptionTitle(selectedAssessment) : "Select Assessment"}
						>
							<span className={`assessment-selector-trigger-text${selectedAssessment ? "" : " is-placeholder"}`}>
								{selectedAssessment ? getAssessmentOptionLabel(selectedAssessment) : "Select Assessment"}
							</span>
							<i className={`fa ${isSelectorOpen ? "fa-chevron-up" : "fa-chevron-down"} assessment-selector-trigger-icon`} aria-hidden="true"></i>
						</button>
						{isSelectorOpen && (
							<div className="assessment-selector-menu" role="listbox" aria-label="Select Assessment">
								<button
									type="button"
									className={`assessment-selector-option${selectedAssessmentId ? "" : " is-active"}`}
									onClick={() => {
										setSelectedAssessmentId("");
										setIsSelectorOpen(false);
									}}
									title="Select Assessment"
								>
									<span className="assessment-selector-option-title">Select Assessment</span>
									<span className="assessment-selector-option-meta">Show all assessments</span>
								</button>
								{assessments.map((assessment) => (
									<button
										key={assessment._id}
										type="button"
										className={`assessment-selector-option${selectedAssessmentId === assessment._id ? " is-active" : ""}`}
										onClick={() => {
											setSelectedAssessmentId(assessment._id);
											setIsSelectorOpen(false);
										}}
										title={getAssessmentOptionTitle(assessment)}
									>
										<span className="assessment-selector-option-title">
											{assessment.title || 'Untitled Assessment'}
										</span>
										<span className="assessment-selector-option-meta">
											{assessment.designation || 'N/A'} | {assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'N/A'} min
										</span>
									</button>
								))}
							</div>
						)}
					</div>
					<div className="assessment-status-filter-wrap">
						<label className="form-label mb-0 fw-semibold assessment-selector-label assessment-status-filter-label">Status:</label>
						<select
							className="form-select assessment-status-filter-select"
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
						>
							{STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
					{isConsultantEmployer && (
						<div className="assessment-company-search-wrap">
							<label className="form-label mb-0 fw-semibold assessment-selector-label assessment-status-filter-label">
								Company:
							</label>
							<div className="assessment-search-input-wrap">
								<i className="fa fa-search assessment-search-icon" aria-hidden="true"></i>
								<input
									type="text"
									className="form-control assessment-company-search-input"
									placeholder="Search company"
									value={companySearch}
									onChange={(event) => setCompanySearch(event.target.value)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="employer-page-shell employer-page-shell--content">
				<div className="panel panel-default site-bg-white p-3 employer-page-content-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
					{assessments.length === 0 ? (
						<div className="text-center py-5">
							<i className="fa fa-clipboard-list" style={{fontSize: '64px', color: '#ccc'}}></i>
							<p className="mt-3 text-muted">No assessments yet. Create one to get started.</p>
						</div>
					) : filteredAssessments.length === 0 ? (
						<div className="text-center py-5">
							<i className="fa fa-filter" style={{fontSize: '56px', color: '#cbd5e1'}}></i>
							<p className="mt-3 text-muted mb-1">No assessments match the selected filters.</p>
							<small className="text-muted">Try changing the selected assessment or status.</small>
						</div>
					) : (
						<div className="row">
							{filteredAssessments.map((assessment, index) => (
								<div key={assessment._id} className="col-md-6 mb-4">
									<AssessmentCard 
										data={assessment} 
										onDelete={handleDeleteAssessment}
										onEdit={handleEditAssessment}
										index={index}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{showModal && (
				<CreateAssessmentModal
					onClose={() => {
						setShowModal(false);
						setEditingAssessment(null);
					}}
					onCreate={handleCreateAssessment}
					editData={editingAssessment}
				/>
			)}
			{instructionsModal}
		</div>
	);
}
