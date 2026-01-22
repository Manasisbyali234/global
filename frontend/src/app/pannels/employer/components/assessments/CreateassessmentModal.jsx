import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import './CreateassessmentModal.css';
import { disableBodyScroll, enableBodyScroll } from "../../../../../utils/scrollUtils";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
export default function CreateAssessmentModal({ onClose, onCreate, editData = null }) {
	const [title, setTitle] = useState(editData?.title || "");
	const [type, setType] = useState(editData?.type || "Aptitude Test");
	const [designation, setDesignation] = useState(editData?.designation || "");
	const [companyName, setCompanyName] = useState(editData?.companyName || "");
	const [timeLimit, setTimeLimit] = useState(editData?.timer || 30);
	const [description, setDescription] = useState(editData?.description || "");
	const [employerCategory, setEmployerCategory] = useState("");
	const [approvedCompanies, setApprovedCompanies] = useState([]);
	const [questions, setQuestions] = useState(
		editData?.questions || [{ question: "", type: "mcq", options: ["", "", "", ""], optionImages: ["", "", "", ""], correctAnswer: null, marks: 1, imageUrl: "" }]
	);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);

	const quillModules = useMemo(() => ({
		toolbar: [
			[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
			[{ 'font': [] }],
			[{ 'size': ['small', false, 'large', 'huge'] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ 'color': [] }, { 'background': [] }],
			[{ 'script': 'sub' }, { 'script': 'super' }],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			[{ 'align': [] }],
			['blockquote', 'code-block'],
			['link', 'image'],
			['clean']
		]
	}), []);

	const quillFormats = [
		'header', 'font', 'size',
		'bold', 'italic', 'underline', 'strike',
		'color', 'background',
		'script',
		'list', 'bullet', 'indent',
		'align',
		'blockquote', 'code-block',
		'link', 'image'
	];

	useEffect(() => {
		disableBodyScroll();
		
		// Fetch employer profile to get category
		const fetchEmployerCategory = async () => {
			try {
				const token = localStorage.getItem('employerToken');
				if (token) {
					const response = await fetch('http://localhost:5000/api/employer/profile', {
						headers: { 'Authorization': `Bearer ${token}` }
					});
					const data = await response.json();
					if (data.success && data.profile) {
						setEmployerCategory(data.profile.employerCategory || '');
					}
				}
			} catch (error) {
				console.error('Error fetching employer category:', error);
			}
		};
		
		// Fetch approved companies for consultants
		const fetchApprovedCompanies = async () => {
			try {
				const token = localStorage.getItem('employerToken');
				if (token) {
					const response = await fetch('http://localhost:5000/api/employer/approved-authorization-companies', {
						headers: { 'Authorization': `Bearer ${token}` }
					});
					const data = await response.json();
					if (data.success) {
						setApprovedCompanies(data.companies || []);
					}
				}
			} catch (error) {
				console.error('Error fetching approved companies:', error);
			}
		};
		
		fetchEmployerCategory();
		fetchApprovedCompanies();
		return () => enableBodyScroll();
	}, []);

	const handleQuestionChange = (index, field, value) => {
		const updated = [...questions];
		if (field === "question") updated[index].question = value;
		if (field === "marks") updated[index].marks = value;
		if (field === "type") {
			updated[index].type = value;
			if (value === "subjective" || value === "upload" || value === "image") {
				updated[index].options = [];
				updated[index].optionImages = [];
				updated[index].correctAnswer = null;
			} else if (value === "mcq" || value === "visual-mcq") {
				updated[index].options = ["", "", "", ""];
				updated[index].optionImages = value === "visual-mcq" ? ["", "", "", ""] : [];
				updated[index].correctAnswer = null;
			}
		}
		if (field === "imageUrl") updated[index].imageUrl = value;
		setQuestions(updated);
	};

	const handleOptionChange = (qIndex, optIndex, value) => {
		const updated = [...questions];
		updated[qIndex].options[optIndex] = value;
		setQuestions(updated);
	};

	const handleCorrectAnswerChange = (qIndex, optIndex) => {
		const updated = [...questions];
		updated[qIndex].correctAnswer = optIndex;
		setQuestions(updated);
	};

	const addQuestion = () => {
		// Validate the last question before adding a new one
		if (questions.length > 0) {
			const lastQuestion = questions[questions.length - 1];
			const questionText = lastQuestion.question.replace(/<[^>]*>/g, '').trim();
			
			if (!questionText) {
				showWarning("Please write a question before adding a new one");
				return;
			}
			
			if ((lastQuestion.type === "mcq" || lastQuestion.type === "visual-mcq") && (lastQuestion.correctAnswer === null || lastQuestion.correctAnswer === undefined)) {
				showWarning("Please select answer before you create question");
				return;
			}
		}
		
		setQuestions([
			...questions,
			{ question: "", type: "mcq", options: ["", "", "", ""], optionImages: ["", "", "", ""], correctAnswer: null, marks: 1, imageUrl: "" },
		]);
	};

	const removeQuestion = (index) => {
		if (questions.length > 1) {
			const updated = questions.filter((_, i) => i !== index);
			setQuestions(updated);
		} else {
			showWarning("Assessment must have at least one question");
		}
	};

	const handleMinimize = () => {
		if (isMaximized) setIsMaximized(false);
		setIsMinimized(!isMinimized);
	};

	const handleMaximize = () => {
		if (isMinimized) setIsMinimized(false);
		setIsMaximized(!isMaximized);
	};

	const handleOptionImageUpload = async (qIndex, optIndex, file) => {
		if (!file) return;
		
		const formData = new FormData();
		formData.append('image', file);
		
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch('http://localhost:5000/api/employer/assessments/upload-option-image', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
			});
			
			const data = await response.json();
			if (data.success) {
				const updated = [...questions];
				updated[qIndex].optionImages[optIndex] = data.imageUrl;
				setQuestions(updated);
				showSuccess('Option image uploaded successfully');
			} else {
				showError(data.message || 'Failed to upload option image');
			}
		} catch (error) {
			showError('Failed to upload option image');
		}
	};

	const handleImageUpload = async (qIndex, file) => {
		if (!file) return;
		
		const formData = new FormData();
		formData.append('image', file);
		
		try {
			const token = localStorage.getItem('employerToken');
			const response = await fetch('http://localhost:5000/api/employer/assessments/upload-question-image', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
			});
			
			const data = await response.json();
			if (data.success) {
				handleQuestionChange(qIndex, "imageUrl", data.imageUrl);
				showSuccess('Image uploaded successfully');
			} else {
				showError(data.message || 'Failed to upload image');
			}
		} catch (error) {
			showError('Failed to upload image');
		}
	};

	const handleSubmit = (isDraft = false) => {
		if (!designation.trim()) {
			showWarning("Please enter a designation");
			return;
		}
		
		if (employerCategory === 'consultancy' && !companyName.trim()) {
			showWarning("Please enter the company name");
			return;
		}
		
		if (!title.trim()) {
			showWarning("Please select an assessment type");
			return;
		}
		
		if (!description.trim()) {
			showWarning("Please provide instructions for the assessment");
			return;
		}
		
		if (!isDraft) {
			if (!timeLimit || timeLimit < 1) {
				showWarning("Please enter a valid time limit (at least 1 minute)");
				return;
			}
			
			if (questions.length === 0) {
				showWarning("Please add at least one question");
				return;
			}
			
			for (let i = 0; i < questions.length; i++) {
				const question = questions[i];
				
				const questionText = question.question.replace(/<[^>]*>/g, '').trim();
				if (!questionText) {
					showWarning(`Please enter text for Question ${i + 1}`);
					return;
				}
				
				if (question.type === "mcq" || question.type === "visual-mcq") {
					for (let j = 0; j < question.options.length; j++) {
						if (!question.options[j].trim()) {
							showWarning(`Please fill Option ${String.fromCharCode(65 + j)} for Question ${i + 1}`);
							return;
						}
					}
					
					if (question.correctAnswer === null || question.correctAnswer === undefined) {
						showWarning(`Please select answer before you create question`);
						return;
					}
				}
				
				if (!question.marks || question.marks < 1) {
					showWarning(`Please enter valid marks for Question ${i + 1} (at least 1)`);
					return;
				}
			}
		}
		
		onCreate({
				id: editData?._id,
				title,
				type: title, // Use title as type since Type field is hidden
				designation,
				companyName,
				timer: timeLimit,
			description,
			questions,
			status: isDraft ? 'draft' : 'published'
		});
	};

	const modalContent = (
		<div
			className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center"
			style={{ 
				background: isMinimized ? "transparent" : "rgba(0,0,0,0.5)", 
				zIndex: 100000,
				alignItems: isMinimized ? "flex-end" : "center",
				padding: isMinimized ? "0 0 20px 0" : "0"
			}}
		>
			<div
				className="bg-white rounded-3 shadow-lg"
				style={{
					width: isMaximized ? "100vw" : isMinimized ? "400px" : "800px",
					height: isMaximized ? "100vh" : isMinimized ? "60px" : "auto",
					maxHeight: isMaximized ? "100vh" : isMinimized ? "60px" : "90vh",
					minHeight: isMinimized ? "60px" : "auto",
					display: "flex",
					flexDirection: "column",
					transition: "all 0.3s ease",
					overflow: isMinimized ? "hidden" : "visible",
					position: isMaximized ? "fixed" : "relative",
					top: isMaximized ? "0" : "auto",
					left: isMaximized ? "0" : "auto",
					zIndex: 100001,
					borderRadius: isMaximized ? "0" : "12px",
					boxShadow: isMinimized ? "0 -2px 10px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.15)",
				}}
			>
				<div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: isMinimized ? 'none' : '1px solid #e5e7eb' }}>
					<h5 className="m-0 fw-bold">{editData ? 'Edit Assessment' : 'Create New Assessment'}</h5>
					<div className="d-flex gap-1">
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={handleMinimize}
							title="Minimize"
						>
							−
						</button>
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={handleMaximize}
							title={isMaximized ? "Restore" : "Maximize"}
						>
							{isMaximized ? '❐' : '□'}
						</button>
						<button
							type="button"
							style={{
								background: 'none',
								border: 'none',
								width: '20px',
								height: '20px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								color: '#6c757d',
								fontSize: '14px'
							}}
							onClick={() => { enableBodyScroll(); onClose(); }}
							title="Close"
						>
							×
						</button>
					</div>
				</div>

				{!isMinimized && (
				<div
					className="p-4 overflow-auto"
					style={{ flex: "1 1 auto", minHeight: 0 }}
				>
					<div className="mb-3">
						<label className="form-label small text-muted mb-2">
							Designation
						</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter designation (e.g., Software Engineer)"
							value={designation}
							onChange={(e) => setDesignation(e.target.value)}
							list="designations"
							required
						/>
						<datalist id="designations">
							<option value="Software Engineer" />
							<option value="Senior Software Engineer" />
							<option value="Frontend Developer" />
							<option value="Backend Developer" />
							<option value="Full Stack Developer" />
							<option value="Data Scientist" />
							<option value="Data Analyst" />
							<option value="Product Manager" />
							<option value="Project Manager" />
							<option value="Business Analyst" />
							<option value="UI/UX Designer" />
							<option value="Graphic Designer" />
							<option value="Marketing Manager" />
							<option value="Sales Manager" />
							<option value="Sales Executive" />
							<option value="HR Manager" />
							<option value="HR Executive" />
							<option value="Finance Manager" />
							<option value="Accountant" />
							<option value="Content Writer" />
							<option value="Digital Marketing Specialist" />
							<option value="Customer Support Executive" />
							<option value="Operations Manager" />
							<option value="Quality Assurance Engineer" />
							<option value="DevOps Engineer" />
							<option value="System Administrator" />
							<option value="Network Administrator" />
							<option value="Telecaller" />
						</datalist>
					</div>

					{employerCategory === 'consultancy' && (
						<div className="mb-3">
							<label className="form-label small text-muted mb-2">
								Company Name *
								<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}>(Required)</span>
							</label>
							{approvedCompanies.length > 0 ? (
								<select
									className="form-select"
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									required
									style={{
										borderColor: companyName ? '#10b981' : '#dc2626',
										borderWidth: 2,
										cursor: 'pointer'
									}}
								>
									<option value="" disabled>Select Approved Company</option>
									{approvedCompanies.map((company, index) => (
										<option key={index} value={company}>
											{company}
										</option>
									))}
								</select>
							) : (
								<input
									type="text"
									className="form-control"
									placeholder="Enter hiring company name"
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									required
									style={{
										borderColor: companyName ? '#10b981' : '#dc2626',
										borderWidth: 2,
									}}
								/>
							)}
							{!companyName && (
								<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
									<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
									{approvedCompanies.length > 0 ? 'Please select an approved company' : 'Please enter company name'}
								</small>
							)}
							{approvedCompanies.length > 0 && (
								<small style={{color: '#10b981', fontSize: 12, marginTop: 6, display: 'block'}}>
									<i className="fa fa-check-circle" style={{marginRight: 4}}></i>
									Showing {approvedCompanies.length} approved authorization companies
								</small>
							)}
						</div>
					)}

					<div className="mb-3">
						<label className="form-label small text-muted mb-2">
							Assessment Type
						</label>
						<select
							className="form-select"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						>
							<option value="">Select Assessment Type</option>
							<option value="Aptitude Test">Aptitude Test</option>
							<option value="Coding Assessment">Coding Assessment</option>
							<option value="Case Study Round">Case Study Round</option>
							<option value="Group Discussion">Group Discussion</option>
							<option value="Managerial Round">Managerial Round</option>
							<option value="Panel Interview">Panel Interview</option>
							<option value="Final HR Round">Final HR Round</option>
							<option value="Leadership Interview">Leadership Interview</option>
							<option value="Technical Interview">Technical Interview</option>
							<option value="Behavioral Interview">Behavioral Interview</option>
							<option value="Skills Assessment">Skills Assessment</option>
						</select>
					</div>



					<div className="row mb-3">
						<div className="col-6">
							<label className="form-label small text-muted mb-2">
								Time Limit (min)
							</label>
							<input
								type="number"
								className="form-control"
								value={timeLimit}
								onChange={(e) => setTimeLimit(e.target.value)}
								min="1"
								required
							/>
						</div>
					</div>

					<div className="mb-4">
						<label className="form-label small text-muted mb-2">
							Instructions
						</label>
						<textarea
							className="form-control"
							placeholder="Provide instructions for this assessment..."
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
						/>
					</div>

					<div className="mb-4 p-3 border rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
						<h6 className="fw-semibold mb-3 text-primary">
							<i className="fa fa-shield-alt me-2"></i>
							Security & Privacy
						</h6>
						<ul className="list-unstyled mb-0" style={{ textAlign: 'left' }}>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>End-to-end encryption keeps your assessments secure between you and the candidates you choose.</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>Not even Tale-Global can read or copy the content</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>No one outside can read, copy, or share them</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>Questions and answers are protected</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>Assessment content is encrypted</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>Candidate responses are secure</span>
							</li>
							<li className="mb-2 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>Results and evaluations are private</span>
							</li>
							<li className="mb-0 d-flex align-items-start">
								<span className="me-2">•</span>
								<span>All assessment data is protected</span>
							</li>
						</ul>
					</div>

					<h6 className="fw-semibold mb-3 mt-2">Questions ({questions.length})</h6>

					<div style={{
						background: '#e3f2fd',
						border: '1px solid #2196f3',
						borderRadius: 6,
						padding: '8px 12px',
						marginBottom: 16,
						display: 'flex',
						alignItems: 'center',
						gap: 8
					}}>
						<i className="fa fa-info-circle" style={{color: '#2196f3', fontSize: 14}}></i>
						<small style={{color: '#1565c0', fontSize: 12, margin: 0}}>
							Supports MCQ, Visual MCQs (with images), Subjective (text), and Upload Image questions
						</small>
					</div>

					{questions.map((q, qIndex) => (
						<div
							key={qIndex}
							className="border rounded-3 p-3 mb-4"
							style={{ background: "#f9fafb" }}
						>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<label className="form-label small text-muted mb-0 fw-semibold">
									Question {qIndex + 1}
								</label>
								<div className="d-flex gap-2">
									<select
										className="form-select form-select-sm"
										value={q.type}
										onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value)}
										style={{ width: "120px", fontSize: "12px" }}
									>
										<option value="mcq">MCQ</option>
										<option value="visual-mcq">Visual MCQs</option>
										<option value="subjective">Subjective</option>
										<option value="upload">Upload File</option>
										<option value="image">Upload Image</option>
									</select>
									<button
										type="button"
										className="btn btn-sm btn-outline-danger"
										onClick={() => removeQuestion(qIndex)}
										title="Remove Question"
										style={{ fontSize: "12px", padding: "2px 6px" }}
									>
										Remove
									</button>
								</div>
							</div>
							<ReactQuill
								theme="snow"
								value={q.question || ''}
								onChange={(value) => handleQuestionChange(qIndex, "question", value)}
								modules={quillModules}
								formats={quillFormats}
								placeholder="Enter your question here..."
								style={{ marginBottom: '1rem' }}
							/>
							{q.type === "mcq" || q.type === "visual-mcq" ? (
								<>
									<div className="row mb-3">
										{q.options.map((opt, optIndex) => (
										<div
											key={optIndex}
											className="col-6 mb-3"
										>
											<div className="d-flex align-items-center mb-2">
												<input
													type="radio"
													name={`correct-${qIndex}`}
													checked={q.correctAnswer === optIndex}
													onChange={() =>
														handleCorrectAnswerChange(qIndex, optIndex)
													}
													style={{ 
														width: "18px", 
														height: "18px", 
														marginRight: "8px",
														flexShrink: 0,
														appearance: "auto"
													}}
												/>
												<input
													type="text"
													className="form-control"
													placeholder={`Option ${String.fromCharCode(
														65 + optIndex
													)}`}
													value={opt}
													onChange={(e) =>
														handleOptionChange(qIndex, optIndex, e.target.value)
													}
												/>
											</div>
											{q.type === "visual-mcq" && (
												<div className="mt-2">
													<input
														type="file"
														className="form-control form-control-sm"
														accept="image/*"
														onChange={(e) => handleOptionImageUpload(qIndex, optIndex, e.target.files[0])}
														style={{ fontSize: "12px" }}
													/>
													{q.optionImages && q.optionImages[optIndex] && (
														<div className="mt-1">
															<img 
																src={q.optionImages[optIndex]} 
																alt={`Option ${String.fromCharCode(65 + optIndex)}`} 
																style={{maxWidth: '80px', maxHeight: '60px', borderRadius: '4px'}} 
															/>
															<button
																type="button"
																className="btn btn-sm ms-1"
																style={{backgroundColor: '#ff6600', color: 'white', border: 'none', fontSize: '10px', padding: '2px 6px'}}
																onClick={() => {
																	const updated = [...questions];
																	updated[qIndex].optionImages[optIndex] = "";
																	setQuestions(updated);
																}}
															>
																Remove
															</button>
														</div>
													)}
												</div>
											)}
										</div>
										))}
									</div>
								</>
							) : q.type === "upload" ? (
								<div className="mb-3">
									<small className="text-muted">This is an upload question. Candidates will upload files as their answer.</small>
									<div className="mt-2 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
										<small className="text-info">📎 Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</small>
									</div>
								</div>
							) : q.type === "image" ? (
								<div className="mb-3">
									<small className="text-muted">This is an image upload question. Candidates will upload images as their answer.</small>
									<div className="mt-2 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
										<small className="text-info">🖼️ Accepted image types: JPG, JPEG, PNG, GIF, WEBP (Max: 5MB)</small>
									</div>
								</div>
							) : (
								<div className="mb-3">
									<small className="text-muted">This is a subjective question. Candidates will provide written answers.</small>
								</div>
							)}
							
							<div className="mb-3">
								<label className="form-label small text-muted mb-1">Question Image (Optional)</label>
								<input
									type="file"
									className="form-control"
									accept="image/*"
									onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
								/>
								{q.imageUrl && (
									<div className="mt-2">
										<img src={q.imageUrl} alt="Question" style={{maxWidth: '200px', maxHeight: '150px'}} />
										<button
											type="button"
											className="btn btn-sm ms-2"
											style={{backgroundColor: '#ff6600', color: 'white', border: 'none'}}
											onClick={() => handleQuestionChange(qIndex, "imageUrl", "")}
										>
											Remove
										</button>
									</div>
								)}
							</div>
							
							<div className="row">
								<div className="col-6">
									<label className="form-label small text-muted mb-1">Marks</label>
									<input
										type="number"
										className="form-control"
										value={q.marks}
										onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
										min="1"
									/>
								</div>
							</div>
						</div>
					))}

					<button
						type="button"
						className="btn btn-outline-primary btn-sm mb-4"
						onClick={addQuestion}
					>
						+ Add Question
					</button>
				</div>
				)}

				{!isMinimized && (
				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={() => handleSubmit(true)}
					>
						Save as Draft
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => { enableBodyScroll(); onClose(); }}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => handleSubmit(false)}
					>
						{editData ? 'Update Assessment' : 'Create Assessment'}
					</button>
				</div>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}