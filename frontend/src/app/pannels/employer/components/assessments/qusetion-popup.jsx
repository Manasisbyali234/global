import React, { useEffect } from "react";
import { disableBodyScroll, enableBodyScroll } from "../../../../utils/scrollUtils";

export default function QuestionModal({ assessment, onClose }) {
	useEffect(() => {
		if (assessment) {
			disableBodyScroll();
		} else {
			enableBodyScroll();
		}
		return () => enableBodyScroll();
	}, [assessment]);

	if (!assessment) return null; // no data yet

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.5)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 9999,
			}}
		>
			<div
				style={{
					background: "#fff",
					padding: "20px",
					borderRadius: "8px",
					width: "500px",
					maxHeight: "80%",
					overflowY: "auto",
				}}
			>
				<h2 style={{ marginBottom: "15px" }}>{assessment.title}</h2>
				{assessment.designation && (
					<p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px" }}>
						<strong>Designation:</strong> {assessment.designation}
					</p>
				)}
				{assessment.companyName && (
					<p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
						<strong>Company:</strong> {assessment.companyName}
					</p>
				)}
				{assessment.questions?.map((q, i) => (
					<div
						key={i}
						style={{
							marginBottom: "20px",
							paddingBottom: "15px",
							borderBottom: "1px solid #eee",
						}}
					>
						<strong>
							{i + 1}. <span dangerouslySetInnerHTML={{ __html: q.question }} />
						</strong>
						<div style={{ marginTop: "8px" }}>
							{q.options?.map((opt, idx) => (
								<div key={idx}>
									<label>
										<input type="radio" name={`q-${i}`} value={opt} /> {opt}
									</label>
								</div>
							))}
						</div>
					</div>
				))}

				<button
					onClick={() => { enableBodyScroll(); onClose(); }}
					style={{
						background: "#007bff",
						color: "#fff",
						border: "none",
						padding: "8px 16px",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Close
				</button>
			</div>
		</div>
	);
}
