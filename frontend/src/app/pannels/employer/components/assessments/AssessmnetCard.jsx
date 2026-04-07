import React from "react";
import { useNavigate } from "react-router-dom";
import "./create-assessment.css";

export default function AssessmentCard({ data, onDelete, onEdit, index }) {
	const navigate = useNavigate();

	const stripHtml = (value = "") => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

	const truncateText = (value = "", maxLength = 120) => {
		const text = stripHtml(value);
		if (text.length <= maxLength) {
			return text || "N/A";
		}

		return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
	};

	const instructionText = data.instructions || data.description || "";

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
			<div className="card-body" style={{ position: 'relative' }}>
				{String(data.status || '').toLowerCase() === 'draft' && (
					<span
						className="badge"
						style={{
							position: 'absolute',
							top: '14px',
							right: '14px',
							backgroundColor: '#dc2626',
							color: '#ffffff',
							border: '1px solid #b91c1c',
							fontSize: '13px',
							fontWeight: '700',
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
							padding: '8px 14px',
							borderRadius: '999px'
						}}
					>
						Draft
					</span>
				)}
				{/* Serial Number - First */}
				<div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
					<h6 className="fw-bold mb-1" style={{fontSize: '14px'}}>
						<span className="text-primary">#{data.serialNumber || (index + 1)}</span>
					</h6>
				</div>
				
				{/* Company Name - Second */}
				{data.companyName && (
					<div className="mb-2" style={{maxWidth: '100%', overflow: 'hidden'}}>
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word'}}>
							<span style={{color: '#8B7355'}}>Company:</span> <span className="text-primary" style={{wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word'}}>{data.companyName}</span>
						</h6>
					</div>
				)}
				
				{/* Designation - Third */}
				{data.designation && (
					<div className="mb-2" style={{maxWidth: '100%', overflow: 'hidden'}}>
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word'}}>
							<span style={{color: '#8B7355'}}>Designation:</span> <span className="text-primary" style={{wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word'}}>{data.designation}</span>
						</h6>
					</div>
				)}
				
				{/* Assessment Title - Fourth */}
				{data.title && (
					<div className="mb-2" style={{maxWidth: '100%', overflow: 'hidden'}}>
						<h6 className="fw-bold mb-1" style={{fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word'}}>
							<span style={{color: '#8B7355'}}>Assessment Title:</span> <span className="text-primary" style={{wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word'}}>{data.title}</span>
						</h6>
					</div>
				)}
				
				<div className="mb-3" style={{ fontSize: '13px' }}>
					<div className="mb-2" style={{ color: '#374151', whiteSpace: 'normal', wordBreak: 'break-word' }}>
						<span style={{ color: '#8B7355', fontWeight: '600' }}>Created Date:</span>{' '}
						<span>{formatDate(data.createdAt)}</span>
					</div>
					<div style={{ color: '#374151', whiteSpace: 'normal', wordBreak: 'break-word' }}>
						<span style={{ color: '#8B7355', fontWeight: '600' }}>Instructions:</span>{' '}
						<span>{truncateText(instructionText, 140)}</span>
					</div>
				</div>

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
