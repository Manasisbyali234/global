import React, { useState, useEffect } from "react";
import AssessmentCard from "../assessments/AssessmnetCard";
import CreateAssessmentModal from "../assessments/CreateassessmentModal";
import { api } from '../../../../../utils/api';
import './assessment-dashboard.css';
import '../../../../../assessment-modal-fix.css';
import '../../../../../assessment-title-hide.css';

import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../../utils/popupNotification';
export default function AssessmentDashboard() {
	const [assessments, setAssessments] = useState([]);
	const [filteredAssessments, setFilteredAssessments] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editingAssessment, setEditingAssessment] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');

	const handleCreateAssessmentClick = () => {
		const securityMessage = (
			<div style={{ textAlign: 'left', lineHeight: '1.6', padding: '4px 6px' }}>
				<div style={{ marginBottom: '14px', color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>
					<i className="fa fa-lock" style={{ color: '#f97316', marginRight: '10px' }} />
					End-to-end encryption ensures your assessments remain completely private and secure.
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
						<span>No one outside the platform can read, copy, or share your questions or answers.</span>
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
	}, []);

	const fetchAssessments = async () => {
		try {
			const response = await api.getEmployerAssessments();
			if (response.success) {
				setAssessments(response.assessments);
				setFilteredAssessments(response.assessments);
			}
		} catch (error) {
			console.error('Error fetching assessments:', error);
		} finally {
			setLoading(false);
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
					setFilteredAssessments(updatedAssessments);
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
					setFilteredAssessments(newAssessments);
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
		setEditingAssessment(assessment);
		setShowModal(true);
	};

	const handleDeleteAssessment = async (id) => {
		showConfirmation(
			'Are you sure you want to delete this assessment?',
			async () => {
				try {
					await api.deleteEmployerAssessment(id);
					const updatedAssessments = assessments.filter(a => a._id !== id);
					setAssessments(updatedAssessments);
					setFilteredAssessments(updatedAssessments);
					showSuccess('Assessment deleted successfully');
				} catch (error) {
					console.error('Error deleting assessment:', error);
					showError('Failed to delete assessment');
				}
			},
			() => {},
			'warning'
		);
	};

	// Handle dropdown selection
	const handleTitleSelect = (searchValue) => {
		setSearchTerm(searchValue);
		if (searchValue) {
			const filtered = assessments.filter(assessment => 
				assessment.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
				assessment.designation?.toLowerCase().includes(searchValue.toLowerCase()) ||
				assessment.type?.toLowerCase().includes(searchValue.toLowerCase())
			);
			setFilteredAssessments(filtered);
		} else {
			setFilteredAssessments(assessments);
		}
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

	return (
		<div className="twm-right-section-panel site-bg-gray emp-assessment-page" style={{
			width: '100%',
			margin: 0,
			padding: 0,
			background: '#f7f7f7',
			minHeight: '100vh'
		}}>
			{/* Header */}
			<div style={{ padding: '2rem 2rem 2rem 2rem' }}>
				<div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<h2>Assessments</h2>
								<p className="text-muted mb-0">Manage and create your assessments</p>
							</div>
							<div className="d-flex align-items-center gap-3">
								<span className="badge bg-light text-dark px-3 py-2" style={{fontSize: '14px'}}>
									Showing: {filteredAssessments.length} of {assessments.length}
								</span>
								<button className="btn btn-dark" onClick={handleCreateAssessmentClick}>
									<i className="fa fa-plus me-2"></i>Create Assessment
								</button>
							</div>
						</div>
				</div>
			</div>

			{/* Search Bar */}
			<div style={{ padding: '0 2rem 1rem 2rem' }}>
				<div className="d-flex flex-wrap gap-3 align-items-center" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
					<label className="form-label mb-0 fw-semibold" style={{ minWidth: '140px' }}>Search Assessment:</label>
					<div className="d-flex flex-grow-1 flex-wrap gap-2" style={{minWidth: '250px'}}>
						<input
							type="text"
							className="form-control"
							placeholder="Search by title, designation, or type..."
							style={{ flex: '1 1 300px' }}
							value={searchTerm}
							onChange={(e) => handleTitleSelect(e.target.value)}
						/>
						<select 
							className="form-select" 
							style={{ flex: '1 1 300px', color: '#007bff' }}
							onChange={(e) => handleTitleSelect(e.target.value)}
							value={searchTerm}
						>
							<option value="" style={{ color: '#6c757d' }}>Select Assessment</option>
							{assessments.map(assessment => (
								<option key={assessment._id} value={assessment.title} style={{ color: '#28a745' }}>
									{assessment.title} - {assessment.designation || 'N/A'} ({assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'N/A'} min)
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Content */}
			<div style={{ padding: '0 2rem 2rem 2rem' }}>
				<div className="panel panel-default site-bg-white p-3" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
					{assessments.length === 0 ? (
						<div className="text-center py-5">
							<i className="fa fa-clipboard-list" style={{fontSize: '64px', color: '#ccc'}}></i>
							<p className="mt-3 text-muted">No assessments yet. Create one to get started.</p>
						</div>
					) : filteredAssessments.length === 0 ? (
						<div className="text-center py-5">
							<i className="fa fa-search" style={{fontSize: '64px', color: '#ccc'}}></i>
							<p className="mt-3 text-muted">No assessments match your search criteria.</p>
							<button 
								className="btn btn-outline-primary mt-2"
								onClick={() => {
									setSearchTerm('');
									setFilteredAssessments(assessments);
								}}
							>
								Clear Filters
							</button>
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
		</div>
	);
}
