
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ApplicantPage = () => {
	const [assessments, setAssessments] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		// Dummy data
		const dummyAssessments = [
			{
				_id: "1",
				title: "React & JavaScript",
				description: "Technical",
				timeLimit: 45,
				progress: 85,
				questions: [{ marks: 5 }, { marks: 10 }],
				completed: true,
			},
			{
				_id: "2",
				title: "Communication Skills",
				description: "Soft Skills",
				timeLimit: 30,
				progress: 92,
				questions: [{ marks: 10 }, { marks: 5 }],
				completed: true,
			},
			{
				_id: "3",
				title: "System Design",
				description: "Technical",
				timeLimit: 60,
				questions: [{ marks: 10 }, { marks: 10 }],
				completed: false,
			},
		];
		setAssessments(dummyAssessments);
	}, []);

	const handleStartAssessment = (assessmentId) => {
		navigate(`/start-assessment/${assessmentId}`);
	};

	return (
		<div className="container my-5">
			<h4 className="fw-bold mb-1">Available Assessments</h4>
			<p className="text-muted mb-4">
				Complete assessments to improve your profile and job matching
			</p>

			<div className="row">
				{assessments.map((a) => (
					<div key={a._id} className="col-md-6 mb-4">
						<div className="card shadow-sm h-100">
							<div className="card-body d-flex flex-column justify-content-between">
								<div>
									<div className="d-flex justify-content-between align-items-center mb-1">
										<h6 className="mb-0 fw-semibold">{a.title}</h6>
										{a.completed ? (
											<span className="text-success fw-bold small">
												{a.progress}%
											</span>
										) : null}
									</div>
									<p className="text-muted small mb-2">
										{a.description} • {a.timeLimit} min
									</p>

									{a.completed ? (
										<>
											<div className="progress mb-2" style={{ height: "6px" }}>
												<div
													className="progress-bar bg-dark"
													style={{ width: `${a.progress}%` }}
													role="progressbar"
													aria-valuenow={a.progress}
													aria-valuemin="0"
													aria-valuemax="100"
												/>
											</div>
											<span className="badge bg-dark small">Completed</span>
										</>
									) : (
										<button
											className="btn btn-outline-dark btn-sm mt-3"
											onClick={() => handleStartAssessment(a._id)}
										>
											Start Assessment
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ApplicantPage;

