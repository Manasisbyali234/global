
import React, { useState, useEffect } from "react";
import "./step-by-step.css";
import StepTracker from "../pages/step-tracker";
import JobDetails from "../pages/jobdetails";
import PaymentPopup from "../pages/payment-popup";
import DocumentPopup from "../pages/document-popup";
import TechnicalAssessment from "../pages/technical-assessment";

const steps = [
	"Application Fee Payment",
	"Document Submission",
	"Technical Assessment",
	"Interview Rounds",
	"Final Review",
];

function Stepper() {
	const [currentStep, setCurrentStep] = useState(null);
	const [completedSteps, setCompletedSteps] = useState([]);

	// Load progress from localStorage on mount
	useEffect(() => {
		const savedSteps = localStorage.getItem("completedSteps");
		if (savedSteps) {
			setCompletedSteps(JSON.parse(savedSteps));
		}
	}, []);

	useEffect(() => {
		localStorage.removeItem("completedSteps"); // Reset every time
		setCompletedSteps([]);
	}, []);


	const openStep = (index) => {
		// Allow only first step or steps whose previous step is completed
		if (index === 0 || completedSteps.includes(index - 1)) {
			setCurrentStep(index);
		}
	};

	const completeStep = () => {
		if (!completedSteps.includes(currentStep)) {
			setCompletedSteps([...completedSteps, currentStep]);
		}
		setCurrentStep(null);
	};

	return (
		<div className="container-a">
			{/* Step navigation */}
			<div className="top-bar-a">
				<StepTracker
					steps={steps}
					completedSteps={completedSteps}
					openStep={openStep}
				/>
			</div>

			{/* Default content */}
			<div className="content-a">
				<div className="left-panel-a">
					<p>Click a step above to start.</p>
				</div>
				<div className="right-panel-a">
					<JobDetails />
				</div>
			</div>

			{/* Step 0: Payment */}
			{currentStep === 0 && (
				<PaymentPopup
					isOpen={true}
					onClose={() => setCurrentStep(null)}
					onPay={completeStep}
				/>
			)}

			{/* Step 1: Document Submission */}
			{currentStep === 1 && (
				<DocumentPopup
					isOpen={true}
					onClose={() => setCurrentStep(null)}
					onSubmit={completeStep}
				/>
			)}

			{/* Step 2: Technical Assessment */}
			{currentStep === 2 && (
				<TechnicalAssessment
					isOpen={true}
					onClose={() => setCurrentStep(null)}
					onComplete={completeStep}
				/>
			)}
		</div>
	);
}

export default Stepper;

