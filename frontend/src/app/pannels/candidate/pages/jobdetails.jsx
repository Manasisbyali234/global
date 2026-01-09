import React from "react";
// import "./JobDetails.css";

export default function JobDetails() {
	return (
		<div className="job-details">
			<h3>Senior Full Stack Developer</h3>
			<p>
				<strong>Location:</strong> Bangalore, India
			</p>
			<p>
				<strong>Salary:</strong> ₹12,00,000 - ₹18,00,000 per annum
			</p>
			<h4>Benefits</h4>
			<ul>
				<li>Health Insurance</li>
				<li>Flexible Working</li>
				<li>Learning Budget</li>
				<li>Transportation Provided</li>
			</ul>
			<h4>Requirements</h4>
			<ul>
				<li>5+ years in React & Node.js</li>
				<li>Strong understanding of TypeScript</li>
				<li>Experience with AWS/Azure</li>
				<li>Knowledge of microservices</li>
			</ul>
		</div>
	);
}
