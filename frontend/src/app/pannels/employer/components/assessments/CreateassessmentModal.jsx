import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import './CreateassessmentModal.css';
import { disableBodyScroll, enableBodyScroll } from "../../../../../utils/scrollUtils";
import RichTextEditor from "../../../../../components/RichTextEditor";
import AssessmentPreview from "./AssessmentPreview";
import { resizeImage } from "../../../../../utils/imageResizer";

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
export default function CreateAssessmentModal({ onClose, onCreate, editData = null }) {
	const [title, setTitle] = useState(editData?.title || "");
	const [type, setType] = useState(editData?.type || "Aptitude Test");
	const [designation, setDesignation] = useState(editData?.designation || "");
	const [companyName, setCompanyName] = useState(editData?.companyName || "");
	const [timeLimit, setTimeLimit] = useState(editData?.timer || 30);
	const [passingPercentage, setPassingPercentage] = useState(editData?.passingPercentage || 60);
	const [description, setDescription] = useState(editData?.description || "");
	const [employerCategory, setEmployerCategory] = useState("");
	const [approvedCompanies, setApprovedCompanies] = useState([]);
	const [approvedCompaniesLoading, setApprovedCompaniesLoading] = useState(false);
	const [questions, setQuestions] = useState(
		editData?.questions || [{ question: "", type: "mcq", options: ["", "", "", ""], optionImages: ["", "", "", ""], correctAnswer: null, marks: 1, imageUrl: "" }]
	);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [optionErrors, setOptionErrors] = useState({});
	const isConsultantEmployer = employerCategory === 'consultancy' || employerCategory === 'consultant';

	const getPlainText = (html = "") => {
		if (!html) return "";
		const temp = document.createElement("div");
		temp.innerHTML = html;
		return temp.textContent || temp.innerText || "";
	};

	const autoCapitalizeText = (value = "") =>
		String(value).replace(/(^|[\s([{'"`/\\-]+)([a-z])/g, (match, prefix, character) => `${prefix}${character.toUpperCase()}`);

	const autoCapitalizeRichText = (value = "") => {
		if (!value || typeof document === "undefined") return value;

		const temp = document.createElement("div");
		temp.innerHTML = value;

		const transformNode = (node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				node.textContent = autoCapitalizeText(node.textContent || "");
				return;
			}

			node.childNodes.forEach(transformNode);
		};

		transformNode(temp);
		return temp.innerHTML;
	};

	useEffect(() => {
		disableBodyScroll();
		
		// Fetch employer profile to get category
		const fetchEmployerCategory = async () => {
			try {
				const token = localStorage.getItem('employerToken');
				if (token) {
					const response = await fetch('/api/employer/profile', {
						headers: { 'Authorization': `Bearer ${token}` }
					});
					if (!response.ok) throw new Error('Failed to fetch profile');
					const data = await response.json();
					if (data.success && data.profile) {
						setEmployerCategory(data.profile.employerCategory || '');
					}
				}
			} catch (error) {
				console.error('Error fetching employer category:', error);
			}
		};
		
		const fetchApprovedCompanies = async () => {
			try {
				setApprovedCompaniesLoading(true);
				const token = localStorage.getItem('employerToken');
				if (token) {
					const response = await fetch('/api/employer/approved-authorization-companies', {
						headers: { 'Authorization': `Bearer ${token}` }
					});
					if (!response.ok) throw new Error('Failed to fetch approved companies');
					const data = await response.json();
					if (data.success) {
						setApprovedCompanies(data.companies || []);
					}
				}
			} catch (error) {
				console.error('Error fetching approved companies:', error);
			} finally {
				setApprovedCompaniesLoading(false);
			}
		};
		
		fetchEmployerCategory();
		fetchApprovedCompanies();
		return () => enableBodyScroll();
	}, []);

	const handleQuestionChange = (index, field, value) => {
		const updated = [...questions];
		if (field === "question") updated[index].question = autoCapitalizeRichText(value);
		if (field === "marks") updated[index].marks = value;
		if (field === "type") {
			updated[index].type = value;
			if (value === "subjective" || value === "upload" || value === "image") {
				updated[index].options = [];
				updated[index].optionImages = [];
				updated[index].correctAnswer = null;
			} else if (value === "mcq" || value === "visual-mcq" || value === "questionary-image-mcq" || value === "image-mcq") {
				updated[index].options = ["", "", "", ""];
				updated[index].optionImages = (value === "visual-mcq" || value === "questionary-image-mcq") ? ["", "", "", ""] : [];
				updated[index].correctAnswer = null;
			}
		}
		if (field === "imageUrl") updated[index].imageUrl = value;
		setQuestions(updated);
	};

	const handleOptionChange = (qIndex, optIndex, value) => {
		const updated = [...questions];
		updated[qIndex].options[optIndex] = autoCapitalizeText(value);
		setQuestions(updated);
		
		// Clear error for this option when user starts typing
		if (value.trim()) {
			const errorKey = `${qIndex}-${optIndex}`;
			if (optionErrors[errorKey]) {
				const newErrors = { ...optionErrors };
				delete newErrors[errorKey];
				setOptionErrors(newErrors);
			}
		}
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
			const lastQIndex = questions.length - 1;
			const questionText = (lastQuestion.question || "").replace(/<[^>]*>/g, '').trim();
			
			if (!questionText) {
				showWarning("Please write a question before adding a new one");
				return;
			}
			
			if (lastQuestion.type === 'image-mcq' && !lastQuestion.imageUrl) {
				showWarning("Please upload an image for the question before adding a new one");
				return;
			}
			
			// Validate options for MCQ type questions
			if (["mcq", "visual-mcq", "questionary-image-mcq", "image-mcq"].includes(lastQuestion.type)) {
				const errors = {};
				let hasEmptyOptions = false;
				
				for (let j = 0; j < lastQuestion.options.length; j++) {
					if (!lastQuestion.options[j] || !lastQuestion.options[j].trim()) {
						errors[`${lastQIndex}-${j}`] = true;
						hasEmptyOptions = true;
					}
				}
				
				if (hasEmptyOptions) {
					setOptionErrors(errors);
					showWarning("Please fill all options before adding a new question");
					return;
				}
				
				if (lastQuestion.correctAnswer === null || lastQuestion.correctAnswer === undefined) {
					showWarning("Please select a correct answer before adding a new question");
					return;
				}
			}
		}
		
		// Clear errors when adding new question
		setOptionErrors({});
		setQuestions([
			...questions,
			{ question: "", type: "mcq", options: ["", "", "", ""], optionImages: [], correctAnswer: null, marks: 1, imageUrl: "" },
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
		
		try {
			// Resize image before upload
			showInfo('Compressing image...');
			const resizedFile = await resizeImage(file, 2);
			
			const formData = new FormData();
			formData.append('image', resizedFile);
			
			const token = localStorage.getItem('employerToken');
			const response = await fetch('/api/employer/assessments/upload-option-image', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
			});
			
			if (response.status === 413) {
				showError('Image is too large. Please use a smaller image (max 2MB recommended).');
				return;
			}
			
			const data = await response.json();
			if (data.success) {
				const updated = [...questions];
				updated[qIndex].optionImages[optIndex] = data.imageUrl;
				
				// For questionary-image-mcq, the image URL IS the option text
				if (updated[qIndex].type === "questionary-image-mcq") {
					updated[qIndex].options[optIndex] = data.imageUrl;
				}
				
				setQuestions(updated);
				showSuccess('Image uploaded successfully');
			} else {
				showError(data.message || 'Failed to upload option image');
			}
		} catch (error) {
			showError('Failed to upload option image. Please try again.');
		}
	};

	const handleImageUpload = async (qIndex, file) => {
		if (!file) return;
		
		try {
			// Resize image before upload
			showInfo('Compressing image...');
			const resizedFile = await resizeImage(file, 2);
			
			const formData = new FormData();
			formData.append('image', resizedFile);
			
			const token = localStorage.getItem('employerToken');
			const response = await fetch('/api/employer/assessments/upload-question-image', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
			});
			
			if (response.status === 413) {
				showError('Image is too large. Please use a smaller image (max 2MB recommended).');
				return;
			}
			
			const data = await response.json();
			if (data.success) {
				handleQuestionChange(qIndex, "imageUrl", data.imageUrl);
				showSuccess('Image uploaded successfully');
			} else {
				showError(data.message || 'Failed to upload file');
			}
		} catch (error) {
			showError('Failed to upload file. Please try again.');
		}
	};

	const handleSubmit = (isDraft = false) => {
		// Validate all mandatory fields regardless of draft status
		if (!designation.trim()) {
			showWarning("Please enter a designation");
			return;
		}
		
		if (isConsultantEmployer && !companyName.trim()) {
			showWarning(approvedCompanies.length > 0 ? "Please select an approved company" : "No approved companies are available for this consultant");
			return;
		}
		
		if (!title.trim()) {
			showWarning("Please enter an assessment title");
			return;
		}
		
		if (!getPlainText(description).trim()) {
			showWarning("Please provide instructions for the assessment");
			return;
		}
		
		if (!timeLimit || timeLimit < 1) {
			showWarning("Please enter a valid time limit (at least 1 minute)");
			return;
		}

		if (passingPercentage === undefined || passingPercentage === "" || passingPercentage < 0 || passingPercentage > 100) {
			showWarning("Please enter a valid passing percentage (0-100)");
			return;
		}
		
		if (questions.length === 0) {
			showWarning("Please add at least one question");
			return;
		}
		
		for (let i = 0; i < questions.length; i++) {
			const question = questions[i];
			
			const questionText = (question.question || "").replace(/<[^>]*>/g, '').trim();
			if (!questionText) {
				showWarning(`Please enter text for Question ${i + 1}`);
				return;
			}

			if (question.type === "image-mcq" && !question.imageUrl) {
				showWarning(`Please upload an image for Question ${i + 1}`);
				return;
			}
			
			if (["mcq", "visual-mcq", "questionary-image-mcq", "image-mcq"].includes(question.type)) {
				for (let j = 0; j < question.options.length; j++) {
					if (!question.options[j] || !question.options[j].trim()) {
						showWarning(`Please fill Option ${String.fromCharCode(65 + j)} for Question ${i + 1}`);
						return;
					}
				}
				
				if (question.correctAnswer === null || question.correctAnswer === undefined) {
					showWarning(`Please select a correct answer for Question ${i + 1}`);
					return;
				}
			}
			
			if (!question.marks || question.marks < 1) {
				showWarning(`Please enter valid marks for Question ${i + 1} (at least 1)`);
				return;
			}
		}
		
		const parsedPercentage = passingPercentage === '' ? 60 : parseInt(passingPercentage);
		onCreate({
			id: editData?._id,
			title: title.trim(),
			type: title.trim(),
			designation: designation.trim(),
			companyName: companyName.trim(),
			timer: parseInt(timeLimit) || 30,
			passingPercentage: parsedPercentage,
			description: description.trim(),
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
					<h5 className="m-0 fw-bold">
						{showPreview ? 'Previewing Assessment' : (editData ? 'Edit Assessment' : 'Create New Assessment')}
					</h5>
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
					showPreview ? (
						<div className="p-0 overflow-auto" style={{ flex: "1 1 auto", minHeight: 0 }}>
							<AssessmentPreview 
								assessment={{ title, timer: timeLimit, questions, passingPercentage }} 
								onBack={() => setShowPreview(false)} 
							/>
						</div>
					) : (
				<div
					className="p-4 overflow-auto"
					style={{ flex: "1 1 auto", minHeight: 0 }}
				>
					<div className="mb-3">
						<label className="form-label small text-muted mb-2">
							Designation <span style={{color: '#dc2626'}}>*</span>
						</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter designation (e.g., Software Engineer)"
							value={designation}
							onChange={(e) => setDesignation(autoCapitalizeText(e.target.value))}
							list="designations"
							required
							style={{
								borderColor: designation ? '#10b981' : '#dc2626',
								borderWidth: 2
							}}
						/>
						{!designation && (
							<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
								<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
								Please enter a designation
							</small>
						)}
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

					{isConsultantEmployer && (
						<div className="mb-3">
							<label className="form-label small text-muted mb-2">
								Company Name <span style={{color: '#dc2626'}}>*</span>
							</label>
							<select
								className="form-select"
								value={companyName}
								onChange={(e) => setCompanyName(autoCapitalizeText(e.target.value))}
								required
								disabled={approvedCompaniesLoading || approvedCompanies.length === 0}
								style={{
									borderColor: companyName ? '#10b981' : '#dc2626',
									borderWidth: 2,
									cursor: approvedCompaniesLoading || approvedCompanies.length === 0 ? 'not-allowed' : 'pointer',
									backgroundColor: approvedCompaniesLoading || approvedCompanies.length === 0 ? '#f9fafb' : '#ffffff'
								}}
							>
								<option value="" disabled>
									{approvedCompaniesLoading
										? 'Loading approved companies...'
										: approvedCompanies.length > 0
											? 'Select Approved Company'
											: 'No approved companies available'}
								</option>
								{approvedCompanies.map((company, index) => (
									<option key={index} value={company}>
										{company}
									</option>
								))}
							</select>
							{!companyName && (
								<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
									<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
									{approvedCompaniesLoading
										? 'Loading approved companies'
										: approvedCompanies.length > 0
											? 'Please select an approved company'
											: 'No approved companies available for this consultant'}
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
							Assessment Title <span style={{color: '#dc2626'}}>*</span>
						</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter assessment title (e.g., Aptitude Test)"
							value={title}
							onChange={(e) => setTitle(autoCapitalizeText(e.target.value))}
							required
							style={{
								borderColor: title ? '#10b981' : '#dc2626',
								borderWidth: 2
							}}
						/>
						{!title && (
							<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
								<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
								Please enter an assessment title
							</small>
						)}
					</div>



					<div className="row mb-3">
						<div className="col-6">
							<label className="form-label small text-muted mb-2">
								Time Limit (min) <span style={{color: '#dc2626'}}>*</span>
							</label>
							<input
								type="number"
								className="form-control"
								value={timeLimit}
								onChange={(e) => setTimeLimit(e.target.value)}
								min="1"
								required
								style={{
									borderColor: timeLimit && timeLimit > 0 ? '#10b981' : '#dc2626',
									borderWidth: 2
								}}
							/>
							{(!timeLimit || timeLimit < 1) && (
								<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
									<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
									Please enter a valid time limit (at least 1 minute)
								</small>
							)}
						</div>
						<div className="col-6">
							<label className="form-label small text-muted mb-2">
								Passing Percentage (%) <span style={{color: '#dc2626'}}>*</span>
							</label>
							<input
								type="text"
								inputMode="numeric"
								className="form-control"
								value={passingPercentage}
								onChange={(e) => {
									const val = e.target.value;
									if (val === '' || /^\d+$/.test(val)) {
										const num = parseInt(val);
										if (val === '' || (num >= 0 && num <= 100)) {
											setPassingPercentage(val);
										}
									}
								}}
								required
								style={{
									borderColor: passingPercentage !== '' && parseInt(passingPercentage) >= 0 && parseInt(passingPercentage) <= 100 ? '#10b981' : '#dc2626',
									borderWidth: 2
								}}
							/>
							{(passingPercentage !== '' && (parseInt(passingPercentage) < 0 || parseInt(passingPercentage) > 100)) && (
								<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
									<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
									Please enter a valid percentage (0-100)
								</small>
							)}
						</div>
					</div>

					<div className="mb-4">
						<label className="form-label small text-muted mb-2">
							Instructions <span style={{color: '#dc2626'}}>*</span>
						</label>
						<RichTextEditor
							value={description}
							onChange={(value) => setDescription(autoCapitalizeRichText(value))}
							placeholder="Provide instructions for this assessment..."
							className="form-control-editor"
						/>
						{!getPlainText(description).trim() && (
							<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
								<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
								Please provide instructions for the assessment
							</small>
						)}
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
							Supports MCQ, Question with image,  Options with image , Subjective (text), and Upload File/image questions
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
										style={{ minWidth: "140px", fontSize: "12px", whiteSpace: "nowrap" }}
									>
										<option value="mcq">MCQ</option>
										<option value="subjective">Subjective</option>
										<option value="upload">Upload File/image</option>
										<option value="questionary-image-mcq">Options with image</option>
										<option value="visual-mcq">Question with image</option>
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
							{q.type === 'image-mcq' ? (
								<>
									<div style={{ marginBottom: '1rem' }}>
										<RichTextEditor
											value={q.question || ''}
											onChange={(value) => handleQuestionChange(qIndex, "question", value)}
											placeholder="Enter your question here..."
											className="form-control-editor"
										/>
									</div>
									<div className="mb-3">
									<label className="form-label small text-muted mb-2 fw-semibold">
										Upload Question Image <span style={{color: '#dc2626'}}>*</span>
									</label>
									<div 
										style={{
											border: '2px dashed #d1d5db',
											borderRadius: '8px',
											padding: '20px',
											textAlign: 'center',
											background: '#fff',
											cursor: 'pointer',
											transition: 'all 0.2s ease',
											borderColor: q.imageUrl ? '#10b981' : '#dc2626'
										}}
										onClick={() => document.getElementById(`q-image-${qIndex}`).click()}
									>
										<input
											id={`q-image-${qIndex}`}
											type="file"
											className="d-none"
											accept="image/*"
											onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
										/>
										{!q.imageUrl ? (
											<div>
												<i className="fa fa-cloud-upload" style={{ fontSize: '24px', color: '#6b7280', marginBottom: '8px' }}></i>
												<p className="mb-0 small text-muted">Click to upload or drag and drop</p>
												<p className="mb-0 extra-small text-muted" style={{ fontSize: '10px' }}>PNG, JPG or GIF (max. 2MB recommended)</p>
											</div>
										) : (
											<div className="position-relative d-inline-block">
												<img src={q.imageUrl} alt="Question" style={{maxWidth: '100%', maxHeight: '180px', borderRadius: '4px'}} />
												<div className="mt-2 small text-success">
													<i className="fa fa-check-circle me-1"></i> Image Uploaded
												</div>
											</div>
										)}
									</div>
									{q.imageUrl && (
										<button
											type="button"
											className="btn btn-sm mt-2"
											style={{color: '#dc2626', fontSize: '12px', padding: 0}}
											onClick={(e) => { e.stopPropagation(); handleQuestionChange(qIndex, "imageUrl", ""); }}
										>
											<i className="fa fa-trash-o me-1"></i> Remove and re-upload
										</button>
									)}
									{!q.imageUrl && (
										<small style={{color: '#dc2626', fontSize: 11, marginTop: 4, display: 'block'}}>
											<i className="fa fa-exclamation-circle me-1"></i>
											Image is required for this question type
										</small>
									)}
								</div>
								</>
							) : (
								<div style={{ marginBottom: '1rem' }}>
									<RichTextEditor
										value={q.question || ''}
										onChange={(value) => handleQuestionChange(qIndex, "question", value)}
										placeholder="Enter your question here..."
										className="form-control-editor"
									/>
								</div>
							)}
							{q.type === "visual-mcq" && (
								<div className="mb-3">
									<label className="form-label small text-muted mb-1">Question Image</label>
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
							)}
							{q.type === "mcq" || q.type === "visual-mcq" || q.type === "questionary-image-mcq" || q.type === "image-mcq" ? (
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
												{q.type !== "questionary-image-mcq" ? (
													<div style={{ flex: 1 }}>
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
															style={{
																borderColor: optionErrors[`${qIndex}-${optIndex}`] ? '#dc2626' : '#dee2e6',
																borderWidth: optionErrors[`${qIndex}-${optIndex}`] ? 2 : 1
															}}
														/>
														{optionErrors[`${qIndex}-${optIndex}`] && (
															<small style={{color: '#dc2626', fontSize: 11, marginTop: 4, display: 'block'}}>
																<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
																Please fill this option
															</small>
														)}
													</div>
												) : (
													<input
														type="file"
														className="form-control form-control-sm"
														accept="image/*"
														onChange={(e) => handleOptionImageUpload(qIndex, optIndex, e.target.files[0])}
														style={{ fontSize: "12px" }}
													/>
												)}
											</div>
											{q.type === "questionary-image-mcq" && q.optionImages && q.optionImages[optIndex] && (
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
										))}
									</div>
								</>
							) : q.type === "upload" ? (
								<>
									<div className="mb-3">
										<small className="text-muted">This is an upload question. Candidates will upload files/images as their answer.</small>
										<div className="mt-2">
											<label className="form-label small text-muted mb-1">Sample Upload (Optional)</label>
											<input
												type="file"
												className="form-control"
												accept="image/*"
												onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
											/>
											{q.imageUrl && (
												<div className="mt-2">
													<small className="text-success"><i className="fa fa-check-circle me-1"></i>File uploaded</small>
													<button
														type="button"
														className="btn btn-sm ms-2"
														style={{backgroundColor: '#ff6600', color: 'white', border: 'none', fontSize: '11px'}}
														onClick={() => handleQuestionChange(qIndex, "imageUrl", "")}
													>
														Remove
													</button>
												</div>
											)}
										</div>
										<div className="mt-2 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
											<small className="text-info">📎 Accepted file types: JPG, JPEG, PNG, GIF, WEBP, BMP, SVG (Max: 2MB recommended)</small>
										</div>
									</div>
									<div className="row mb-3">
										{q.options.map((opt, optIndex) => (
											<div key={optIndex} className="col-6 mb-3">
												<div className="d-flex align-items-center mb-2">
													<input
														type="radio"
														name={`correct-${qIndex}`}
														checked={q.correctAnswer === optIndex}
														onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
														style={{ width: "18px", height: "18px", marginRight: "8px", flexShrink: 0, appearance: "auto" }}
													/>
													<input
														type="text"
														className="form-control"
														placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
														value={opt}
														onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
													/>
												</div>
											</div>
										))}
									</div>
								</>
							) : q.type === "image" ? (
								<div className="mb-3">
									<small className="text-muted">This is an image upload question. Candidates will upload images as their answer.</small>
									<div className="mt-2 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
										<small className="text-info">🖼️ Accepted image types: JPG, JPEG, PNG, GIF, WEBP (Max: 2MB recommended)</small>
									</div>
								</div>
							) : (
								<div className="mb-3">
									<small className="text-muted">This is a subjective question. Requires the Candidate to provide a detailed explanation.</small>
								</div>
							)}
							
							<div className="row">
								<div className="col-6">
									<label className="form-label small text-muted mb-1">
										Marks <span style={{color: '#dc2626'}}>*</span>
									</label>
									<input
										type="number"
										className="form-control"
										value={q.marks}
										onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
										min="1"
										required
										style={{
											borderColor: q.marks && q.marks > 0 ? '#10b981' : '#dc2626',
											borderWidth: 2
										}}
									/>
									{(!q.marks || q.marks < 1) && (
										<small style={{color: '#dc2626', fontSize: 12, marginTop: 6, display: 'block'}}>
											<i className="fa fa-exclamation-circle" style={{marginRight: 4}}></i>
											Please enter valid marks (at least 1)
										</small>
									)}
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
				) )}

				{!isMinimized && (
				<div className="p-3 border-top d-flex justify-content-end gap-2">
					{!showPreview && (
						<>
							<button
								type="button"
								className="btn btn-outline-info"
								onClick={() => setShowPreview(true)}
							>
								<i className="fa fa-eye me-1"></i> Preview
							</button>
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
						</>
					)}
					{showPreview && (
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => setShowPreview(false)}
						>
							Back to Editor
						</button>
					)}
				</div>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
