import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminCandidateAddEdit = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		resume: "",
		credits: 0,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({ ...prev, resume: file }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Submit logic here (e.g., POST to API)
		
		navigate("/admin/candidates");
	};

	return (
		<div className="container mt-4">
			<div className="twm-dash-b-blocks mb-5">
				<div className="row">
					<div className="col-md-8 offset-md-2">
						<div className="panel panel-default">
							<div className="panel-body wt-panel-body gradi-1 dashboard-card p-4">
								<h4 className="mb-4">Add / Edit Candidate</h4>
								<form onSubmit={handleSubmit}>
									<div className="form-group mb-3">
										<label>Name</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											className="form-control"
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label>Email</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											className="form-control"
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label>Phone</label>
										<input
											type="text"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											className="form-control"
										/>
									</div>

									<div className="form-group mb-3">
										<label>Resume/Document</label>
										<input
											type="file"
											onChange={handleFileChange}
											className="form-control"
										/>
									</div>

									<div className="form-group mb-4">
										<label>Credits</label>
										<input
											type="number"
											name="credits"
											value={formData.credits}
											onChange={handleChange}
											className="form-control"
										/>
									</div>

									<button type="submit" className="btn btn-primary">
										Save Candidate
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminCandidateAddEdit;
