
// import React, { useState } from "react";

// export default function AssessmentPage() {
// 	const [showModal, setShowModal] = useState(false);
// 	const [questions, setQuestions] = useState([
// 		{ text: "", options: ["", "", "", ""], correct: 0, marks: 1 },
// 	]);

// 	const handleAddQuestion = () => {
// 		setQuestions([
// 			...questions,
// 			{ text: "", options: ["", "", "", ""], correct: 0, marks: 1 },
// 		]);
// 	};

// 	const handleQuestionChange = (index, value) => {
// 		const updated = [...questions];
// 		updated[index].text = value;
// 		setQuestions(updated);
// 	};

// 	const handleOptionChange = (qIndex, oIndex, value) => {
// 		const updated = [...questions];
// 		updated[qIndex].options[oIndex] = value;
// 		setQuestions(updated);
// 	};

// 	const handleCorrectChange = (qIndex, oIndex) => {
// 		const updated = [...questions];
// 		updated[qIndex].correct = oIndex;
// 		setQuestions(updated);
// 	};

// 	const handleMarksChange = (qIndex, value) => {
// 		const updated = [...questions];
// 		updated[qIndex].marks = value;
// 		setQuestions(updated);
// 	};

// 	return (
// 		<div style={{ padding: "20px" }}>
// 			{/* Top Bar */}
// 			<div style={{ display: "flex", justifyContent: "flex-end" }}>
// 				<button
// 					onClick={() => setShowModal(true)}
// 					style={{
// 						backgroundColor: "#000",
// 						color: "#fff",
// 						border: "none",
// 						padding: "10px 20px",
// 						borderRadius: "8px",
// 						cursor: "pointer",
// 					}}
// 				>
// 					+ Create Assessment
// 				</button>
// 			</div>

// 			{/* Content Area */}
// 			<div
// 				style={{
// 					backgroundColor: "#fff",
// 					borderRadius: "8px",
// 					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// 					padding: "20px",
// 					marginTop: "20px",
// 				}}
// 			>
// 				<h3>Assessments</h3>
// 				<p style={{ color: "#777" }}>
// 					Manage skill assessments for candidate evaluation
// 				</p>
// 			</div>

// 			{/* Modal */}
// 			{showModal && (
// 				<div
// 					style={{
// 						position: "fixed",
// 						top: 0,
// 						left: 0,
// 						right: 0,
// 						bottom: 0,
// 						backgroundColor: "rgba(0,0,0,0.5)",
// 						display: "flex",
// 						justifyContent: "center",
// 						alignItems: "center",
// 						zIndex: 1000,
// 					}}
// 				>
// 					<div
// 						style={{
// 							backgroundColor: "#fff",
// 							borderRadius: "10px",
// 							padding: "20px",
// 							width: "500px",
// 							maxHeight: "90vh",
// 							overflowY: "auto",
// 						}}
// 					>
// 						<h3>Create New Assessment</h3>
// 						<p style={{ color: "#777", fontSize: "14px" }}>
// 							Create a new MCQ assessment for candidate evaluation
// 						</p>

// 						{/* Title & Time Limit */}
// 						<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
// 							<input
// 								type="text"
// 								placeholder="e.g., JavaScript Fundamentals"
// 								style={{
// 									flex: 1,
// 									padding: "8px",
// 									borderRadius: "6px",
// 									border: "1px solid #ccc",
// 								}}
// 							/>
// 							<input
// 								type="number"
// 								placeholder="Time (min)"
// 								style={{
// 									width: "120px",
// 									padding: "8px",
// 									borderRadius: "6px",
// 									border: "1px solid #ccc",
// 								}}
// 							/>
// 						</div>

// 						{/* Description */}
// 						<textarea
// 							placeholder="Describe what this assessment covers..."
// 							style={{
// 								width: "100%",
// 								padding: "8px",
// 								borderRadius: "6px",
// 								border: "1px solid #ccc",
// 								minHeight: "60px",
// 								marginBottom: "10px",
// 							}}
// 						/>

// 						{/* Questions */}
// 						{questions.map((q, qIndex) => (
// 							<div
// 								key={qIndex}
// 								style={{
// 									border: "1px solid #ddd",
// 									borderRadius: "6px",
// 									padding: "10px",
// 									marginBottom: "10px",
// 								}}
// 							>
// 								<strong>Question {qIndex + 1}</strong>
// 								<input
// 									type="text"
// 									placeholder="Enter your question here..."
// 									value={q.text}
// 									onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
// 									style={{
// 										width: "100%",
// 										padding: "8px",
// 										borderRadius: "6px",
// 										border: "1px solid #ccc",
// 										marginTop: "5px",
// 										marginBottom: "8px",
// 									}}
// 								/>

// 								{/* Options */}
// 								<div
// 									style={{
// 										display: "grid",
// 										gridTemplateColumns: "1fr 1fr",
// 										gap: "8px",
// 									}}
// 								>
// 									{q.options.map((opt, oIndex) => (
// 										<label
// 											key={oIndex}
// 											style={{
// 												display: "flex",
// 												alignItems: "center",
// 												gap: "5px",
// 												fontSize: "14px",
// 											}}
// 										>
// 											<input
// 												type="radio"
// 												checked={q.correct === oIndex}
// 												onChange={() => handleCorrectChange(qIndex, oIndex)}
// 											/>
// 											<input
// 												type="text"
// 												placeholder={`Option ${String.fromCharCode(
// 													65 + oIndex
// 												)}`}
// 												value={opt}
// 												onChange={(e) =>
// 													handleOptionChange(qIndex, oIndex, e.target.value)
// 												}
// 												style={{
// 													flex: 1,
// 													padding: "6px",
// 													borderRadius: "6px",
// 													border: "1px solid #ccc",
// 												}}
// 											/>
// 										</label>
// 									))}
// 								</div>

// 								{/* Marks */}
// 								<div style={{ marginTop: "8px", fontSize: "14px" }}>
// 									Marks:{" "}
// 									<input
// 										type="number"
// 										min="1"
// 										value={q.marks}
// 										onChange={(e) => handleMarksChange(qIndex, e.target.value)}
// 										style={{
// 											width: "60px",
// 											padding: "5px",
// 											borderRadius: "6px",
// 											border: "1px solid #ccc",
// 										}}
// 									/>{" "}
// 									Correct Answer: Option {String.fromCharCode(65 + q.correct)}
// 								</div>
// 							</div>
// 						))}

// 						{/* Add Question Button */}
// 						<button
// 							onClick={handleAddQuestion}
// 							style={{
// 								backgroundColor: "#f1f1f1",
// 								border: "1px solid #ccc",
// 								padding: "6px 10px",
// 								borderRadius: "6px",
// 								marginBottom: "10px",
// 								cursor: "pointer",
// 							}}
// 						>
// 							+ Add Question
// 						</button>

// 						{/* Actions */}
// 						<div
// 							style={{
// 								display: "flex",
// 								justifyContent: "flex-end",
// 								gap: "10px",
// 							}}
// 						>
// 							<button
// 								onClick={() => setShowModal(false)}
// 								style={{
// 									backgroundColor: "#f1f1f1",
// 									border: "1px solid #ccc",
// 									padding: "8px 12px",
// 									borderRadius: "6px",
// 									cursor: "pointer",
// 								}}
// 							>
// 								Cancel
// 							</button>
// 							<button
// 								style={{
// 									backgroundColor: "#000",
// 									color: "#fff",
// 									border: "none",
// 									padding: "8px 12px",
// 									borderRadius: "6px",
// 									cursor: "pointer",
// 								}}
// 							>
// 								Create Assessment
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// }


// import React, { useState } from "react";

// export default function AssessmentPage() {
// 	const [showModal, setShowModal] = useState(false);
// 	const [questions, setQuestions] = useState([
// 		{ text: "", options: ["", "", "", ""], correct: 0, marks: 1 },
// 	]);

// 	const handleAddQuestion = () => {
// 		setQuestions([
// 			...questions,
// 			{ text: "", options: ["", "", "", ""], correct: 0, marks: 1 },
// 		]);
// 	};

// 	const handleQuestionChange = (index, value) => {
// 		const updated = [...questions];
// 		updated[index].text = value;
// 		setQuestions(updated);
// 	};

// 	const handleOptionChange = (qIndex, oIndex, value) => {
// 		const updated = [...questions];
// 		updated[qIndex].options[oIndex] = value;
// 		setQuestions(updated);
// 	};

// 	const handleCorrectChange = (qIndex, oIndex) => {
// 		const updated = [...questions];
// 		updated[qIndex].correct = oIndex;
// 		setQuestions(updated);
// 	};

// 	const handleMarksChange = (qIndex, value) => {
// 		const updated = [...questions];
// 		updated[qIndex].marks = value;
// 		setQuestions(updated);
// 	};

// 	return (
// 		<div style={{ padding: "20px" }}>
// 			{/* Top Bar */}
// 			<div style={{ display: "flex", justifyContent: "flex-end" }}>
// 				<button
// 					onClick={() => setShowModal(true)}
// 					style={{
// 						backgroundColor: "#000",
// 						color: "#fff",
// 						border: "none",
// 						padding: "10px 20px",
// 						borderRadius: "8px",
// 						cursor: "pointer",
// 					}}
// 				>
// 					+ Create Assessment
// 				</button>
// 			</div>

// 			{/* Content Area */}
// 			<div
// 				style={{
// 					backgroundColor: "#fff",
// 					borderRadius: "8px",
// 					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// 					padding: "20px",
// 					marginTop: "20px",
// 				}}
// 			>
// 				<h3>Assessments</h3>
// 				<p style={{ color: "#777" }}>
// 					Manage skill assessments for candidate evaluation
// 				</p>
// 			</div>

// 			{/* Modal */}
// 			{showModal && (
// 				<div
// 					style={{
// 						position: "fixed",
// 						top: 0,
// 						left: 0,
// 						right: 0,
// 						bottom: 0,
// 						backgroundColor: "rgba(0,0,0,0.5)",
// 						display: "flex",
// 						justifyContent: "center",
// 						alignItems: "center",
// 						zIndex: 1000,
// 						padding: "20px",
// 					}}
// 				>
// 					<div
// 						style={{
// 							backgroundColor: "#fff",
// 							borderRadius: "12px",
// 							padding: "20px",
// 							width: "550px",
// 							maxHeight: "90vh",
// 							overflowY: "auto",
// 							boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
// 						}}
// 					>
// 						{/* Modal Header */}
// 						<div
// 							style={{
// 								display: "flex",
// 								justifyContent: "space-between",
// 								alignItems: "center",
// 							}}
// 						>
// 							<div>
// 								<h3 style={{ margin: 0 }}>Create New Assessment</h3>
// 								<p
// 									style={{ color: "#777", fontSize: "14px", margin: "4px 0 0" }}
// 								>
// 									Create a new MCQ assessment for candidate evaluation
// 								</p>
// 							</div>
// 							<button
// 								onClick={() => setShowModal(false)}
// 								style={{
// 									background: "none",
// 									border: "none",
// 									fontSize: "20px",
// 									cursor: "pointer",
// 								}}
// 							>
// 								×
// 							</button>
// 						</div>

// 						<hr style={{ margin: "15px 0" }} />

// 						{/* Title */}
// 						<input
// 							type="text"
// 							placeholder="e.g., JavaScript Fundamentals"
// 							style={{
// 								width: "100%",
// 								padding: "10px",
// 								borderRadius: "8px",
// 								border: "1px solid #ccc",
// 								marginBottom: "12px",
// 							}}
// 						/>

// 						{/* Type + Time Limit */}
// 						<div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
// 							<select
// 								style={{
// 									flex: 1,
// 									padding: "10px",
// 									borderRadius: "8px",
// 									border: "1px solid #ccc",
// 								}}
// 							>
// 								<option value="">Select Type</option>
// 								<option value="Technical">Technical</option>
// 								<option value="Soft Skill">Soft Skill</option>
// 								<option value="General">General</option>
// 							</select>
// 							<input
// 								type="number"
// 								placeholder="Time (min)"
// 								style={{
// 									width: "140px",
// 									padding: "10px",
// 									borderRadius: "8px",
// 									border: "1px solid #ccc",
// 								}}
// 							/>
// 						</div>

// 						{/* Description */}
// 						<textarea
// 							placeholder="Describe what this assessment covers..."
// 							style={{
// 								width: "100%",
// 								padding: "10px",
// 								borderRadius: "8px",
// 								border: "1px solid #ccc",
// 								minHeight: "70px",
// 								marginBottom: "15px",
// 							}}
// 						/>

// 						{/* Questions */}
// 						{questions.map((q, qIndex) => (
// 							<div
// 								key={qIndex}
// 								style={{
// 									border: "1px solid #ddd",
// 									borderRadius: "8px",
// 									padding: "10px",
// 									marginBottom: "12px",
// 								}}
// 							>
// 								<strong>Question {qIndex + 1}</strong>
// 								<input
// 									type="text"
// 									placeholder="Enter your question here..."
// 									value={q.text}
// 									onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
// 									style={{
// 										width: "100%",
// 										padding: "8px",
// 										borderRadius: "6px",
// 										border: "1px solid #ccc",
// 										marginTop: "6px",
// 										marginBottom: "10px",
// 									}}
// 								/>

// 								{/* Options */}
// 								<div
// 									style={{
// 										display: "grid",
// 										gridTemplateColumns: "1fr 1fr",
// 										gap: "8px",
// 									}}
// 								>
// 									{q.options.map((opt, oIndex) => (
// 										<label
// 											key={oIndex}
// 											style={{
// 												display: "flex",
// 												alignItems: "center",
// 												gap: "5px",
// 												fontSize: "14px",
// 											}}
// 										>
// 											<input
// 												type="radio"
// 												checked={q.correct === oIndex}
// 												onChange={() => handleCorrectChange(qIndex, oIndex)}
// 											/>
// 											<input
// 												type="text"
// 												placeholder={`Option ${String.fromCharCode(
// 													65 + oIndex
// 												)}`}
// 												value={opt}
// 												onChange={(e) =>
// 													handleOptionChange(qIndex, oIndex, e.target.value)
// 												}
// 												style={{
// 													flex: 1,
// 													padding: "6px",
// 													borderRadius: "6px",
// 													border: "1px solid #ccc",
// 												}}
// 											/>
// 										</label>
// 									))}
// 								</div>

// 								{/* Marks */}
// 								<div style={{ marginTop: "8px", fontSize: "14px" }}>
// 									Marks:{" "}
// 									<input
// 										type="number"
// 										min="1"
// 										value={q.marks}
// 										onChange={(e) => handleMarksChange(qIndex, e.target.value)}
// 										style={{
// 											width: "60px",
// 											padding: "5px",
// 											borderRadius: "6px",
// 											border: "1px solid #ccc",
// 										}}
// 									/>{" "}
// 									Correct Answer: Option {String.fromCharCode(65 + q.correct)}
// 								</div>
// 							</div>
// 						))}

// 						{/* Add Question Button */}
// 						<button
// 							onClick={handleAddQuestion}
// 							style={{
// 								backgroundColor: "#f8f8f8",
// 								border: "1px solid #ccc",
// 								padding: "8px 12px",
// 								borderRadius: "8px",
// 								marginBottom: "15px",
// 								cursor: "pointer",
// 							}}
// 						>
// 							+ Add Question
// 						</button>

// 						{/* Actions */}
// 						<div
// 							style={{
// 								display: "flex",
// 								justifyContent: "flex-end",
// 								gap: "10px",
// 							}}
// 						>
// 							<button
// 								onClick={() => setShowModal(false)}
// 								style={{
// 									backgroundColor: "#f1f1f1",
// 									border: "1px solid #ccc",
// 									padding: "8px 14px",
// 									borderRadius: "6px",
// 									cursor: "pointer",
// 								}}
// 							>
// 								Cancel
// 							</button>
// 							<button
// 								style={{
// 									backgroundColor: "#000",
// 									color: "#fff",
// 									border: "none",
// 									padding: "8px 14px",
// 									borderRadius: "6px",
// 									cursor: "pointer",
// 								}}
// 							>
// 								Create Assessment
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			)}
// 		</div>
// 	);
// }


