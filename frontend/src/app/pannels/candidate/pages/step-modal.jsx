import React, { useEffect } from "react";
import "./step-modal.css";
import { disableBodyScroll, enableBodyScroll } from "../../../../utils/scrollUtils";

export default function StepModal({ stepTitle, onClose, onComplete }) {
	useEffect(() => {
		disableBodyScroll();
		return () => enableBodyScroll();
	}, []);

	return (
		<div className="modal-overlay">
			<div className="modal">
				<h2>{stepTitle}</h2>
				<p>Form for {stepTitle} goes here...</p>
				<div className="modal-actions">
					<button onClick={() => { enableBodyScroll(); onComplete(); }}>Mark as Complete</button>
					<button onClick={() => { enableBodyScroll(); onClose(); }}>Close</button>
				</div>
			</div>
		</div>
	);
}
