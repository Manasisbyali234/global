import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { disableBodyScroll, enableBodyScroll } from "../../../../../utils/scrollUtils";
import AssessmentPreview from "./AssessmentPreview";
import "./CreateassessmentModal.css";

export default function QuestionModal({ assessment, onClose }) {
	useEffect(() => {
		if (!assessment) {
			return undefined;
		}

		disableBodyScroll();

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			enableBodyScroll();
		};
	}, [assessment, onClose]);

	if (!assessment || typeof document === "undefined") {
		return null;
	}

	return createPortal(
		<div
			className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center"
			style={{
				background: "rgba(0,0,0,0.5)",
				zIndex: 100000,
				alignItems: "center",
				padding: "20px",
			}}
			onClick={() => onClose?.()}
			role="dialog"
			aria-modal="true"
			aria-label="Assessment Preview"
		>
			<div
				className="bg-white rounded-3 shadow-lg"
				style={{
					width: "min(960px, 100%)",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					position: "relative",
					zIndex: 100001,
				}}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="p-3 d-flex justify-content-between align-items-center" style={{ borderBottom: "1px solid #e5e7eb" }}>
					<h5 className="m-0 fw-bold">Assessment Preview</h5>
					<button
						type="button"
						className="btn btn-sm btn-outline-secondary"
						onClick={() => onClose?.()}
						aria-label="Close Preview"
					>
						<i className="fa fa-times"></i>
					</button>
				</div>

				<div className="p-0 overflow-auto" style={{ flex: "1 1 auto", minHeight: 0 }}>
					<AssessmentPreview assessment={assessment} />
				</div>

				<div className="p-3 border-top d-flex justify-content-end gap-2">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => onClose?.()}
					>
						Close
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
