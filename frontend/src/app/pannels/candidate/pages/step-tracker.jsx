import React from "react";
import "./step-tracker.css";

export default function StepTracker({ steps, completedSteps, openStep }) {
	return (
		<div className="stepper">
			{steps.map((step, index) => {
				const isCompleted = completedSteps.includes(index);
				const isActive = completedSteps.includes(index - 1) || index === 0;

				return (
					<div className="step-wrapper" key={index}>
						<div
							className="step-item"
							onClick={() => isActive && openStep(index)}
						>
							<div
								className={`step-circle ${
									isCompleted ? "completed" : isActive ? "active" : ""
								}`}
							>
								{index + 1}
							</div>
							<div className="step-label">{step}</div>
						</div>

						{index < steps.length - 1 && (
							<div
								className={`step-line ${
									completedSteps.includes(index) ? "line-filled" : ""
								}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}

