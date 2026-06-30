import React from "react";
import { useNavigate } from "react-router-dom";
import { formatAssessmentContent } from "../../../../../utils/assessmentContent";
import { formatDesignation } from "../../../../../utils/jobTitleFormatter";
import './create-assessment.css';

export default function AssessmentCard({ data, onDelete, onEdit, index }) {
	const navigate = useNavigate();
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			timeZone: 'Asia/Kolkata',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
	<div className="card h-100 shadow-sm assessment-card">
			<div className="card-body">
				{/* Serial Number - First */}
				<div className="mb-2">
					<h6 className="fw-bold mb-1" style={{fontSize: '14px'}}>
						<span className="text-primary">#{data.serialNumber || (index + 1)}</span>
					</h6>
				</div>
				
				{/* Company Name - Second */}
				{data.companyName && (
					<div className="mb-2">
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>
							<span style={{color: '#8B7355'}}>Company:</span> <span className="text-primary">{data.companyName}</span>
						</h6>
					</div>
				)}
				
				{/* Designation - Third */}
				{data.designation && (
					<div className="mb-2">
						<h6 className="fw-bold mb-1" style={{
							fontSize: '14px',
							wordWrap: 'break-word',
							overflowWrap: 'break-word',
							whiteSpace: 'normal'
						}}>
							<span style={{color: '#8B7355'}}>Designation:</span> <span className="text-primary" style={{
								wordWrap: 'break-word',
								overflowWrap: 'break-word',
								whiteSpace: 'normal'
							}}>{formatDesignation(data.designation)}</span>
						</h6>
					</div>
				)}
				
				{/* Assessment Title - Fourth */}
				{data.title && (
					<div className="mb-2">
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>
							<span style={{color: '#8B7355'}}>Assessment Title:</span> <span className="text-primary">{data.title}</span>
						</h6>
					</div>
				)}
				
				{/* Created Date */}
				<div className="mb-2">
					<small className="text-muted">
						<i className="fa fa-calendar me-1"></i>
						{formatDate(data.createdAt)}
					</small>
				</div>
				{(data.instructions || data.description) && (
					<div
						className="card-text text-muted small assessment-rich-text assessment-rich-text--compact"
						style={{
							wordWrap: 'break-word',
							overflowWrap: 'break-word',
							whiteSpace: 'normal'
						}}
						dangerouslySetInnerHTML={{ __html: formatAssessmentContent(data.instructions || data.description) }}
					/>
				)}
				<div className="d-flex flex-wrap gap-3 mb-3">
					<small className="text-muted">
						<i className="fa fa-clock me-1"></i>{data.timer} min
					</small>
					<small className="text-muted">
						<i className="fa fa-question-circle me-1"></i>{data.totalQuestions || data.questions?.length || 0} questions
					</small>
				</div>
				<div className="d-flex flex-wrap gap-2">
					<button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/employer/assessment-results/${data._id}`)}>
						<i className="fa fa-chart-bar"></i> Results
					</button>
					<button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(data)} title="Edit Assessment">
						<i className="fa fa-edit"></i>
					</button>
					<button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(data._id)}>
						<i className="fa fa-trash"></i>
					</button>
				</div>
				</div>
		</div>
	);
}
