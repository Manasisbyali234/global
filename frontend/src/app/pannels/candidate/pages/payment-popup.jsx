import React, { useEffect } from "react";
import "./payment-popup.css";
import { disableBodyScroll, enableBodyScroll } from "../../../../utils/scrollUtils";

export default function PaymentPopup({ isOpen, onClose, onPay }) {
	useEffect(() => {
		if (isOpen) {
			disableBodyScroll();
		} else {
			enableBodyScroll();
		}
		return () => enableBodyScroll();
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="popup-overlay">
			<div className="popup-container">
				<h2 className="popup-title">Application Fee Payment</h2>

				{/* Payment Summary */}
				<div className="section-card">
					<h3 className="section-title">Payment Summary</h3>
					<div className="row">
						<span>Application Fee:</span>
						<span>₹299</span>
					</div>
					<div className="row">
						<span>Processing Fee:</span>
						<span>₹0</span>
					</div>
					<hr />
					<div className="row total">
						<span>Total Amount:</span>
						<span>₹299</span>
					</div>
				</div>

				{/* Payment Methods */}
				<div className="section-card">
					<h3 className="section-title">Select Payment Method</h3>
					{[
						"Credit/Debit Card",
						"Net Banking",
						"UPI Payment",
						"Digital Wallet",
					].map((method, i) => (
						<button key={i} className="method-btn">
							{method}
						</button>
					))}
				</div>

				{/* Action Buttons */}
				<div className="action-row">
					<button onClick={() => { enableBodyScroll(); onClose(); }} className="cancel-btn">
						Cancel
					</button>
					<button onClick={() => { enableBodyScroll(); onPay(); }} className="pay-btn">
						Pay ₹299
					</button>
				</div>
			</div>
		</div>
	);
}
