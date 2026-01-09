
import React from "react";
import "./technical-assessment.css";
import { useNavigate } from "react-router-dom";
    export default function TechnicalAssessment({  onClose }) {
	
    const navigate = useNavigate();

    const handleStart = () => {
			navigate("/candidate/start-tech-assessment");
		};

	return (
		<div className="popup-overlay">
			<div className="popup-container">
				<h2 className="popup-title">📝 Technical Assessment</h2>

				{/* Time Info */}
				<div className="section-card">
					<div className="time-info">
						<span className="time-icon">⏳</span>
						<p>
							You have <strong>60 minutes</strong> to complete this assessment.
							Make sure you have a stable internet connection before starting.
						</p>
					</div>
				</div>

				{/* Assessment Details */}
				<div className="section-card">
					<h3 className="section-title">Assessment Details</h3>
					<ul>
						<li>• 30 Multiple Choice Questions</li>
						<li>• Topics: React, Node.js, TypeScript, System Design</li>
						<li>• Duration: 60 minutes</li>
						<li>• Minimum Score: 70%</li>
					</ul>
				</div>

				{/* Instructions */}
				<div className="section-card">
					<h3 className="section-title">📌 Instructions</h3>
					<ul>
						<li>• This assessment has 5 multiple choice questions</li>
						<li>• Time limit: 45 min</li>
						<li>• You can navigate between questions</li>
						<li>• Answer all questions before submitting</li>
						<li>• Auto-submit when time runs out</li>
					</ul>
					<div className="important-box">
						<strong>⚠ Important:</strong> Once you start, the timer will begin.
						Ensure you have a stable internet connection.
					</div>
				</div>

				{/* Actions */}
				<div className="action-row">
					<button onClick={onClose} className="cancel-btn">
						Cancel
					</button>
					<button onClick={handleStart} className="start-btn">
						Start Assessment
					</button>
				</div>

                
			</div>
		</div>
	);
}
