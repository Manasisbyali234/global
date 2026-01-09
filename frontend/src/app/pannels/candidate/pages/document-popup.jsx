import React, { useState, useEffect } from "react";
import "./document.css";
import { disableBodyScroll, enableBodyScroll } from "../../../../utils/scrollUtils";

export default function DocumentPopup({ isOpen, onClose, onSubmit }) {
	const [form, setForm] = useState({
		expectedSalary: "",
		availableFrom: "",
		noticePeriod: "",
		coverLetter: "",
	});

	useEffect(() => {
		if (isOpen) {
			disableBodyScroll();
		} else {
			enableBodyScroll();
		}
		return () => enableBodyScroll();
	}, [isOpen]);

	const [files, setFiles] = useState({
		resume: null,
		education: null,
		experience: null,
		idProof: null,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleFileChange = (e, field) => {
		setFiles({ ...files, [field]: e.target.files[0] });
	};

	const handleSubmit = () => {
		// Only front-end demo, no backend
		
		
		onSubmit();
	};

	if (!isOpen) return null;

	return (
		<div className="popup-overlay">
			<div className="popup-container">
				<h2 className="popup-title">
					Document Submission & Application Details
				</h2>
				<p className="popup-subtitle">
					Fill in your application details and upload the required documents to
					proceed.
				</p>

				{/* Application Details */}
				<div className="form-section">
					<label>Expected Salary (per annum)</label>
					<input
						type="text"
						name="expectedSalary"
						value={form.expectedSalary}
						onChange={handleChange}
						placeholder="e.g., ₹15,00,000"
					/>

					<label>Available From</label>
					<input
						type="date"
						name="availableFrom"
						value={form.availableFrom}
						onChange={handleChange}
					/>

					<label>Notice Period</label>
					<input
						type="text"
						name="noticePeriod"
						value={form.noticePeriod}
						onChange={handleChange}
						placeholder="e.g., 30 days, 2 months"
					/>

					<label>Cover Letter</label>
					<textarea
						name="coverLetter"
						value={form.coverLetter}
						onChange={handleChange}
						placeholder="Tell us why you're interested in this role..."
					></textarea>
				</div>

				{/* Document Upload */}
				<div className="form-section">
					<label>Resume</label>
					<input type="file" onChange={(e) => handleFileChange(e, "resume")} />
					{files.resume && <p className="file-name">{files.resume.name}</p>}

					<label>Educational Certificates</label>
					<input
						type="file"
						onChange={(e) => handleFileChange(e, "education")}
					/>
					{files.education && (
						<p className="file-name">{files.education.name}</p>
					)}

					<label>Experience Letters</label>
					<input
						type="file"
						onChange={(e) => handleFileChange(e, "experience")}
					/>
					{files.experience && (
						<p className="file-name">{files.experience.name}</p>
					)}

					<label>ID Proof</label>
					<input type="file" onChange={(e) => handleFileChange(e, "idProof")} />
					{files.idProof && <p className="file-name">{files.idProof.name}</p>}
				</div>

				{/* Actions */}
				<div className="action-row">
					<button className="cancel-btn" onClick={() => { enableBodyScroll(); onClose(); }}>
						Cancel
					</button>
					<button className="submit-btn" onClick={() => { enableBodyScroll(); handleSubmit(); }}>
						Submit & Continue
					</button>
				</div>
			</div>
		</div>
	);
}
