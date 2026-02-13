import React from "react";
import { formatDate } from '../../../../../utils/dateFormatter';
import { useNavigate } from "react-router-dom";

export default function AssessmentCard({ data, onDelete, onEdit, index }) {
	const navigate = useNavigate();
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<div className="card h-100 shadow-sm">
			<div className="card-body">
				{/* Serial Number - First */}
				<div className="mb-2">
					<h6 className="fw-bold mb-1" style={{fontSize: '14px'}}>
						<span className="text-primary">#{data.serialNumber || (index + 1)}</span>
					</h6>
				</div>
				
				{/* Designation - Second */}
				{data.designation && (
					<div className="mb-2">
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>
							<span style={{color: '#8B7355'}}>Designation:</span> <span className="text-primary">{data.designation}</span>
						</h6>
					</div>
				)}
				
				{/* Company Name - Third (for consultancy) */}
				{data.companyName && (
					<div className="mb-2">
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>
							<span style={{color: '#8B7355'}}>Company:</span> <span className="text-primary">{data.companyName}</span>
						</h6>
					</div>
				)}
				
				{/* Assessment Type Badge */}
				<div className="d-flex justify-content-end mb-2">
					<span className="btn btn-sm btn-outline-primary" style={{pointerEvents: 'none', cursor: 'default', fontSize: '10px', padding: '1px 6px', lineHeight: '1.2', whiteSpace: 'normal', wordWrap: 'break-word'}}>
						{data.type}
					</span>
				</div>
				
				{/* Created Date */}
				<div className="mb-2">
					<small className="text-muted">
						<i className="fa fa-calendar me-1"></i>
						{formatDate(data.createdAt)}
					</small>
				</div>
				{data.description && (
					<p className="card-text text-muted small" style={{wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>{data.description}</p>
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
