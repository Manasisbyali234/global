
// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const AssessmentResults = () => {
// 	const location = useLocation();
// 	const navigate = useNavigate();
// 	const {
// 		answers = [],
// 		totalQuestions = 0,
// 		timeTaken = 0,
// 	} = location.state || {};

// 	const correctAnswers = answers.filter(Boolean).length;
// 	const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(0);
// 	const accuracy = percentage; // Same value as percentage in this case

// 	return (
// 		<div
// 			style={{
// 				fontFamily: "Arial, sans-serif",
// 				backgroundColor: "rgba(0, 0, 0, 0.6)",
// 				minHeight: "100vh",
// 				display: "flex",
// 				justifyContent: "center",
// 				alignItems: "center",
// 				padding: "20px",
// 			}}
// 		>
// 			<div
// 				style={{
// 					background: "#fff",
// 					borderRadius: "12px",
// 					padding: "30px",
// 					width: "100%",
// 					maxWidth: "500px",
// 					textAlign: "center",
// 					boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
// 					position: "relative",
// 				}}
// 			>
// 				{/* Close Button */}
// 				<button
// 					onClick={() => navigate("/")}
// 					style={{
// 						position: "absolute",
// 						right: "15px",
// 						top: "15px",
// 						border: "none",
// 						background: "transparent",
// 						fontSize: "18px",
// 						cursor: "pointer",
// 					}}
// 				>
// 					✖
// 				</button>

// 				<h2 style={{ marginBottom: "15px", fontWeight: "bold" }}>
// 					Assessment Results
// 				</h2>
// 				<p style={{ marginBottom: "20px", color: "#555" }}>
// 					Assessment Completed!
// 				</p>

// 				{/* Percentage */}
// 				<div
// 					style={{
// 						fontSize: "40px",
// 						fontWeight: "bold",
// 						color: percentage >= 60 ? "green" : "red",
// 					}}
// 				>
// 					{percentage}%
// 				</div>
// 				<p style={{ marginBottom: "10px", color: "#555" }}>
// 					{correctAnswers} out of {totalQuestions} correct
// 				</p>

// 				{/* Pass/Fail Badge */}
// 				<span
// 					style={{
// 						display: "inline-block",
// 						padding: "5px 15px",
// 						borderRadius: "20px",
// 						background: percentage >= 60 ? "#d4edda" : "#f8d7da",
// 						color: percentage >= 60 ? "#155724" : "#721c24",
// 						fontWeight: "bold",
// 						marginBottom: "20px",
// 					}}
// 				>
// 					{percentage >= 60 ? "PASSED" : "FAILED"}
// 				</span>

// 				{/* Stats Grid */}
// 				<div
// 					style={{
// 						display: "flex",
// 						justifyContent: "space-around",
// 						marginTop: "20px",
// 						fontSize: "14px",
// 						color: "#333",
// 					}}
// 				>
// 					<div>
// 						<strong>Time Taken</strong>
// 						<div>
// 							{Math.floor(timeTaken / 60)}:
// 							{(timeTaken % 60).toString().padStart(2, "0")}
// 						</div>
// 					</div>
// 					<div>
// 						<strong>Questions Answered</strong>
// 						<div>{totalQuestions}</div>
// 					</div>
// 					<div>
// 						<strong>Accuracy</strong>
// 						<div>{accuracy}%</div>
// 					</div>
// 				</div>

// 				{/* Close Button */}
// 				<button
// 					onClick={() => navigate("/candidate/step")}
// 					style={{
// 						marginTop: "30px",
// 						padding: "10px 20px",
// 						border: "none",
// 						borderRadius: "8px",
// 						background: "#000",
// 						color: "#fff",
// 						cursor: "pointer",
// 					}}
// 				>
// 					Close Assessment
// 				</button>
// 			</div>
// 		</div>
// 	);
// };

// export default AssessmentResults;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { api } from "../../../../utils/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const AssessmentResults = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { applicationId } = useParams();
	const [assessmentResult, setAssessmentResult] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAssessmentResult = async () => {
			try {
				if (applicationId) {
					const response = await api.getApplicationAssessmentResult(applicationId);
					if (response.success) {
						setAssessmentResult(response.data);
					} else {
						setError(response.message || 'Failed to fetch assessment result');
					}
				}
			} catch (err) {
				console.error('Error fetching assessment result:', err);
				setError(err.message || 'Error fetching assessment result');
			} finally {
				setLoading(false);
			}
		};

		fetchAssessmentResult();
	}, [applicationId]);

	const {
		result,
		assessment
	} = location.state || assessmentResult || {};

	// Handle both old format (answers array) and new format (result object)
	const correctAnswers = result?.correctAnswers || 0;
	const totalQuestions = result?.totalQuestions || assessment?.totalQuestions || 0;
	const percentage = result?.percentage || 0;
	const score = result?.score || 0;
	const totalMarks = result?.totalMarks || 0;
	const resultStatus = result?.result || 'pending';
	const status = result?.status || 'completed';

	// Calculate incorrect answers
	const incorrectAnswers = totalQuestions - correctAnswers;

	// Pie chart data
	const chartData = {
		labels: ['Correct Answers', 'Incorrect Answers'],
		datasets: [
			{
				data: [correctAnswers, incorrectAnswers],
				backgroundColor: ['#28a745', '#dc3545'],
				borderColor: ['#28a745', '#dc3545'],
				borderWidth: 1,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: 'bottom',
			},
			tooltip: {
				callbacks: {
					label: function(context) {
						const label = context.label || '';
						const value = context.parsed;
						const percentage = ((value / totalQuestions) * 100).toFixed(1);
						return `${label}: ${value} (${percentage}%)`;
					}
				}
			}
		},
	};

	// Close and go back to status page
	const handleCloseAssessment = () => {
		navigate("/candidate/status");
	};

	if (loading) {
		return (
			<div
				style={{
					fontFamily: "Arial, sans-serif",
					backgroundColor: "#f5f6fa",
					minHeight: "100vh",
					padding: "20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div style={{ textAlign: "center" }}>
					<i className="fa fa-spinner fa-spin fa-3x mb-3" style={{ color: "#ff6b35" }}></i>
					<p className="text-muted">Loading assessment result...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					fontFamily: "Arial, sans-serif",
					backgroundColor: "#f5f6fa",
					minHeight: "100vh",
					padding: "20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div style={{ textAlign: "center", maxWidth: "500px" }}>
					<i className="fa fa-exclamation-circle fa-3x mb-3" style={{ color: "#dc3545" }}></i>
					<h3>Error Loading Assessment</h3>
					<p className="text-danger">{error}</p>
					<button
						onClick={() => navigate("/candidate/status")}
						style={{
							padding: "10px 20px",
							border: "none",
							borderRadius: "8px",
							background: "#007bff",
							color: "#fff",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: "bold",
						}}
					>
						← Back to Status Page
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				fontFamily: "Arial, sans-serif",
				backgroundColor: "#f5f6fa",
				minHeight: "100vh",
				padding: "20px",
			}}
		>
			<div style={{ maxWidth: "800px", margin: "0 auto" }}>
				{/* Back Button - Top Left */}
				<button
					onClick={handleCloseAssessment}
					style={{
						padding: "10px 20px",
						border: "none",
						borderRadius: "8px",
						background: "#007bff",
						color: "#fff",
						cursor: "pointer",
						fontSize: "14px",
						fontWeight: "bold",
						marginBottom: "20px",
					}}
				>
					← Back to Status Page
				</button>
				{/* Header */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
						marginBottom: "20px",
						textAlign: "center",
					}}
				>
					<h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold", color: "#232323" }}>
						Assessment Results
					</h2>
					<p style={{ margin: "10px 0 0 0", color: "#666" }}>
						{assessment?.title || "Technical Assessment"}
					</p>
				</div>

				{status === 'expired' && (
					<div 
						style={{ 
							background: "#fff3f3", 
							borderLeft: "5px solid #dc3545", 
							padding: "15px 20px", 
							borderRadius: "8px", 
							marginBottom: "20px",
							display: "flex",
							alignItems: "center",
							gap: "15px",
							boxShadow: "0px 2px 5px rgba(0,0,0,0.05)"
						}}
					>
						<i className="fa fa-clock-o" style={{ fontSize: "24px", color: "#dc3545" }}></i>
						<div>
							<strong style={{ display: "block", color: "#dc3545", marginBottom: "2px" }}>Time Expired</strong>
							<span style={{ fontSize: "14px", color: "#666" }}>This assessment was automatically submitted because the time limit was reached.</span>
						</div>
					</div>
				)}

				{/* Results Cards */}
				<div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
					{/* Score Card */}
					<div
						style={{
							flex: 1,
							background: "#fff",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
							textAlign: "center",
						}}
					>
						<h3 style={{ margin: "0 0 15px 0", color: "#232323" }}>Your Score</h3>
						<div
							style={{
								fontSize: "48px",
								fontWeight: "bold",
								color: percentage >= 60 ? "#28a745" : "#dc3545",
								marginBottom: "10px",
							}}
						>
							{percentage.toFixed(1)}%
						</div>
						<p style={{ margin: "0", color: "#666" }}>
							{score}/{totalMarks} marks
						</p>
					</div>

					{/* Status Card */}
					<div
						style={{
							flex: 1,
							background: "#fff",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
							textAlign: "center",
						}}
					>
						<h3 style={{ margin: "0 0 15px 0", color: "#232323" }}>Result</h3>
						<span
							style={{
								display: "inline-block",
								padding: "10px 20px",
								borderRadius: "25px",
								background: (resultStatus === 'pass' || percentage >= 60) ? "#d4edda" : "#f8d7da",
								color: (resultStatus === 'pass' || percentage >= 60) ? "#155724" : "#721c24",
								fontWeight: "bold",
								fontSize: "18px",
							}}
						>
							{(resultStatus === 'pass' || percentage >= 60) ? "PASSED" : "FAILED"}
						</span>
					</div>
				</div>

				{/* Pie Chart */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
						marginBottom: "20px",
					}}
				>
					<h3 style={{ margin: "0 0 20px 0", textAlign: "center", color: "#232323" }}>
						Performance Breakdown
					</h3>
					<div style={{ maxWidth: "400px", margin: "0 auto" }}>
						<Pie data={chartData} options={chartOptions} />
					</div>
				</div>

				{/* Detailed Stats */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
						marginBottom: "20px",
					}}
				>
					<h3 style={{ margin: "0 0 20px 0", color: "#232323" }}>Detailed Statistics</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
							gap: "20px",
						}}
					>
						<div style={{ textAlign: "center" }}>
							<strong style={{ color: "#232323" }}>Total Questions</strong>
							<div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
								{totalQuestions}
							</div>
						</div>
						<div style={{ textAlign: "center" }}>
							<strong style={{ color: "#232323" }}>Correct Answers</strong>
							<div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
								{correctAnswers}
							</div>
						</div>
						<div style={{ textAlign: "center" }}>
							<strong style={{ color: "#232323" }}>Incorrect Answers</strong>
							<div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc3545" }}>
								{incorrectAnswers}
							</div>
						</div>
						<div style={{ textAlign: "center" }}>
							<strong style={{ color: "#232323" }}>Accuracy</strong>
							<div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>
								{percentage.toFixed(1)}%
							</div>
						</div>
					</div>
				</div>


			</div>
		</div>
	);
};

export default AssessmentResults;

