
import React, { useState } from "react";
import Papa from "papaparse"; // npm install papaparse

function AdminBulkUploadPage() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [results, setResults] = useState([]);
	const [summary, setSummary] = useState(null);

	const creditsPerStudent = 10;

	const handleFileChange = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) setSelectedFile(file);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const validateEmail = (email) => {
		// Basic email regex
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	};

	const checkIfUserExists = (email) => {
		
		const existingUsers = ["john@example.com"];
		return existingUsers.includes(email.toLowerCase());
	};

	const handleUpload = () => {
		if (!selectedFile) {
			alert("Please select a CSV file before uploading.");
			return;
		}

		Papa.parse(selectedFile, {
			header: true,
			skipEmptyLines: true,
			complete: function (parsedData) {
				let successes = 0;
				let errors = 0;
				let totalCredits = 0;
				let uploadResults = [];

				parsedData.data.forEach((row) => {
					const name = row.name?.trim();
					const email = row.email?.trim();

					if (!validateEmail(email)) {
						errors++;
						uploadResults.push({
							name,
							email,
							credits: 0,
							status: "Invalid email format",
							success: false,
						});
					} else if (checkIfUserExists(email)) {
						errors++;
						uploadResults.push({
							name,
							email,
							credits: 0,
							status: "User already exists",
							success: false,
						});
					} else {
						successes++;
						totalCredits += creditsPerStudent;
						uploadResults.push({
							name,
							email,
							credits: creditsPerStudent,
							status: "Success",
							success: true,
						});
					}
				});

				setResults(uploadResults);
				setSummary({
					successes,
					errors,
					totalCredits,
				});
			},
		});
	};

	const handleDownloadTemplate = () => {
		const csvContent =
			"name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com";
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "candidate_template.csv";
		link.click();
	};

	return (
		<div className="container-fluid p-4">
			<h4 className="mb-3">Bulk Upload Candidates</h4>
			<p className="text-muted mb-4">
				Upload multiple candidate profiles from a CSV file with automatic credit
				assignment
			</p>

			<div className="card">
				<div className="card-body">
					<div
						className="border rounded p-5 text-center mb-4"
						style={{
							borderStyle: "dashed",
							cursor: "pointer",
							backgroundColor: "#f9f9f9",
						}}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						<div className="mb-3">
							<i className="fa fa-upload fa-2x text-muted"></i>
						</div>
						<p className="text-muted mb-2">
							Drop your CSV file here or click to browse
						</p>

						<input
							type="file"
							accept=".csv"
							onChange={handleFileChange}
							className="form-control w-50 mx-auto"
							id="csvUpload"
						/>
					</div>

					<div className="d-flex justify-content-between align-items-center mb-3">
						<button
							className="btn btn-outline-secondary"
							onClick={handleDownloadTemplate}
						>
							<i className="fa fa-download me-2"></i>Download Template
						</button>
						<button className="btn btn-dark" onClick={handleUpload}>
							Upload Candidates ({creditsPerStudent} credits each)
						</button>
					</div>

					{summary && (
						<div className="mt-4">
							<h5>Upload Results</h5>
							<p>
								<span className="text-success">
									{summary.successes} successful
								</span>{" "}
								| <span className="text-danger">{summary.errors} errors</span> |{" "}
								<strong>{summary.totalCredits} credits assigned</strong>
							</p>
							<ul className="list-group">
								{results.map((r, index) => (
									<li
										key={index}
										className={`list-group-item d-flex justify-content-between align-items-center ${
											r.success
												? "list-group-item-success"
												: "list-group-item-danger"
										}`}
									>
										<div>
											<strong>{r.name}</strong> <br />
											<small>{r.email}</small>
										</div>
										<div>
											{r.success ? (
												<span className="text-success">
													{r.credits} credits - {r.status}
												</span>
											) : (
												<span className="text-danger">{r.status}</span>
											)}
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AdminBulkUploadPage;
