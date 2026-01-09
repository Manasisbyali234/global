
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import TermsModal from "./TermsModal";
import AssessmentQuiz from "./AssessmentQuiz";
import AssessmentResult from "./AssessmentResult";

const StartAssessment = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { assessmentId, jobId, applicationId } = location.state || {};

	 const [showTerms, setShowTerms] = useState(true);
	const [assessment, setAssessment] = useState(null);
	const [attemptId, setAttemptId] = useState(null);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (assessmentId) {
			fetchAssessment();
		}
	}, [assessmentId]);

	const fetchAssessment = async () => {
		try {
			const token = localStorage.getItem('candidateToken');
			const response = await axios.get(`/api/candidate/assessments/${assessmentId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAssessment(response.data.assessment);
			}
		} catch (error) {
			console.error('Error fetching assessment:', error);
			alert('Failed to load assessment');
			navigate('/candidate/dashboard');
		} finally {
			setLoading(false);
		}
	};

	const handleAcceptTerms = async () => {
		try {
			const token = localStorage.getItem('candidateToken');
			const response = await axios.post('/api/candidate/assessments/start', {
				assessmentId,
				jobId,
				applicationId
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAttemptId(response.data.attempt._id);
				setShowTerms(false);
			}
		} catch (error) {
			console.error('Error starting assessment:', error);
			const errorMessage = error.response?.data?.message || 'Failed to start assessment';
			alert(errorMessage);
			if (errorMessage.includes('already completed') || errorMessage.includes('time expired')) {
				navigate('/candidate/dashboard');
			}
		}
	};

	const handleDeclineTerms = () => {
		navigate('/candidate/dashboard');
	};

	const handleComplete = (resultData) => {
		setResult(resultData);
	};

	if (loading) {
		return <div className="container mt-5"><p>Loading...</p></div>;
	}

	if (!assessment) {
		return <div className="container mt-5"><p>Assessment not found</p></div>;
	}

	if (result) {
		return <AssessmentResult result={result} />;
	}

	if (showTerms) {
		return (
			<TermsModal
				isOpen={showTerms}
				onAccept={handleAcceptTerms}
				onDecline={handleDeclineTerms}
				assessment={assessment}
			/>
		);
	}

	return (
		<AssessmentQuiz
			assessment={assessment}
			attemptId={attemptId}
			onComplete={handleComplete}
		/>
	);
};

export default StartAssessment;

	const handleSubmit = () => {
		const results = {
			score: 85,
			correct: 17,
			total: 20,
			accuracy: 85,
			timeTaken: "12m 30s",
		};

		navigate("/assessment-result", { state: results });
	};

	// TEMP: Hardcoded data (replace later with dynamic fetch using id)
	const assessment = {
		title: "JavaScript Basics",
		timeLimit: 15,
		questions: [
			{
				question: "What does `===` mean in JavaScript?",
				marks: 2,
				options: [
					"Loose equality",
					"Strict equality",
					"Assignment",
					"Type coercion",
				],
			},
			{
				question: "What is a closure?",
				marks: 1,
				options: [
					"A function inside a function",
					"A loop",
					"A variable",
					"None",
				],
			},
		],
	};

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState(
		Array(assessment.questions.length).fill(null)
	);
	const [timeLeft, setTimeLeft] = useState(assessment.timeLimit * 60);
	const [isSubmitted, setIsSubmitted] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setIsSubmitted(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};

	const handleOptionChange = (option) => {
		if (isSubmitted) return;
		const updated = [...answers];
		updated[currentQuestionIndex] = option;
		setAnswers(updated);
	};

	const question = assessment.questions[currentQuestionIndex];

	return (
		<div className="container py-4">
			<div className="mx-auto" style={{ maxWidth: "800px" }}>
				<div className="bg-white p-4 shadow-sm rounded border">
					{/* Header */}
					<div className="d-flex justify-content-between align-items-center mb-3">
						<div>
							<h5 className="mb-1 text-primary">{assessment.title}</h5>
							<small>
								Question {currentQuestionIndex + 1} of{" "}
								{assessment.questions.length}
							</small>
						</div>
						<div className="d-flex align-items-center text-danger fw-bold">
							<FaClock className="me-2" />
							{formatTime(timeLeft)}
						</div>
					</div>

					{/* Progress Bar */}
					<div className="progress mb-4" style={{ height: "6px" }}>
						<div
							className="progress-bar bg-dark"
							style={{
								width: `${
									((currentQuestionIndex + 1) / assessment.questions.length) *
									100
								}%`,
							}}
						/>
					</div>

					{/* Question */}
					<div className="mb-3">
						<h6 className="fw-semibold">{question.question}</h6>
						<span className="badge bg-dark">{question.marks} Marks</span>
					</div>

					{/* Options */}
					<div className="mb-4">
						{question.options.map((option, idx) => (
							<div
								key={idx}
								className={`form-check border rounded p-2 mb-2 ${
									answers[currentQuestionIndex] === option
										? "border-primary bg-light"
										: ""
								}`}
							>
								<input
									className="form-check-input"
									type="radio"
									name={`q-${currentQuestionIndex}`}
									value={option}
									disabled={isSubmitted}
									checked={answers[currentQuestionIndex] === option}
									onChange={() => handleOptionChange(option)}
									id={`q-${currentQuestionIndex}-opt-${idx}`}
								/>
								<label
									className="form-check-label ms-2"
									htmlFor={`q-${currentQuestionIndex}-opt-${idx}`}
								>
									{option}
								</label>
							</div>
						))}
					</div>

					{/* Navigation */}
					<div className="d-flex justify-content-between align-items-center">
						{/* Previous */}
						<button
							className="btn btn-outline-secondary"
							disabled={currentQuestionIndex === 0 || isSubmitted}
							onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
						>
							← Previous
						</button>

						{/* Question Numbers */}
						<div>
							{assessment.questions.map((_, idx) => (
								<button
									key={idx}
									className={`btn btn-sm mx-1 ${
										idx === currentQuestionIndex
											? "btn-primary"
											: "btn-outline-secondary"
									}`}
									onClick={() => setCurrentQuestionIndex(idx)}
									disabled={isSubmitted}
								>
									{idx + 1}
								</button>
							))}
						</div>

						<button
							className="btn btn-success"
							onClick={handleSubmit}
							disabled={isSubmitted}
						>
							Submit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StartAssessment;

