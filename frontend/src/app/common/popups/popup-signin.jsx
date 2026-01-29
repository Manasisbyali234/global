import { NavLink, useNavigate } from "react-router-dom";
import { canRoute, candidate, empRoute, employer, placementRoute, placement, pubRoute, publicUser } from "../../../globals/route-names";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import '../../../popup-nav-buttons.css';

function SignInPopup() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [canusername, setCanUsername] = useState('');
    const [empusername, setEmpUsername] = useState('');
    const [placementusername, setPlacementUsername] = useState('');
    const [canpassword, setCanPassword] = useState('');
    const [emppassword, setEmpPassword] = useState('');
    const [placementpassword, setPlacementPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCanPassword, setShowCanPassword] = useState(false);
    const [showEmpPassword, setShowEmpPassword] = useState(false);
    const [showPlacementPassword, setShowPlacementPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('candidate');

    useEffect(() => {
        setCanUsername('');
        setCanPassword('');
        setEmpUsername('');
        setEmpPassword('');
        setPlacementUsername('');
        setPlacementPassword('');
        setError('');
        setSuccess('');

        // Clear messages when modal opens
        const modal = document.getElementById('sign_up_popup2');
        const handleModalShow = () => {
            setError('');
            setSuccess('');
            // Fix for mobile white screen - ensure modal is visible
            if (modal) {
                modal.style.display = 'block';
                modal.style.opacity = '1';
                document.body.classList.add('modal-open');
            }
        };

        const handleModalHide = () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };

        // Clear messages when tabs change
        const handleTabChange = () => {
            setError('');
            setSuccess('');
        };

        if (modal) {
            modal.addEventListener('show.bs.modal', handleModalShow);
            modal.addEventListener('hide.bs.modal', handleModalHide);
            
            return () => {
                modal.removeEventListener('show.bs.modal', handleModalShow);
                modal.removeEventListener('hide.bs.modal', handleModalHide);
            };
        }
    }, []);

    const handleCandidateLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const result = await login({
            email: canusername.trim(),
            password: canpassword.trim()
        }, 'candidate');
        
        if (result.success) {
            moveToCandidate();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const handleEmployerLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const result = await login({
            email: empusername,
            password: emppassword
        }, 'employer');
        
        if (result.success) {
            moveToEmployer();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const moveToCandidate = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(canRoute(candidate.DASHBOARD));
    }

    const moveToEmployer = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(empRoute(employer.DASHBOARD));
    }

    const handlePlacementLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const result = await login({
            email: placementusername,
            password: placementpassword
        }, 'placement');
        
        if (result.success) {
            moveToPlacement();
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const moveToPlacement = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(placementRoute(placement.DASHBOARD));
    }

    const handleForgotPassword = () => {
        const modal = document.getElementById('sign_up_popup2');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        bootstrapModal?.hide();
        navigate(pubRoute(publicUser.pages.FORGOT));
    }

    const buttonStyle = {
        backgroundColor: '#FF7A00',
        color: '#ffffff',
        border: '1px solid #FF7A00',
        borderRadius: '10px',
        padding: '12px',
        fontWeight: 700,
        fontSize: '16px',
        minHeight: '48px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        width: '100%',
        maxWidth: 'none',
        minWidth: '100%',
        display: 'block',
        boxSizing: 'border-box',
        flex: '1 1 100%',
        whiteSpace: 'nowrap',
        boxShadow: 'none'
    };

    const handleButtonEnter = (event) => {
        event.currentTarget.style.backgroundColor = '#e66e00';
        event.currentTarget.style.borderColor = '#e66e00';
        event.currentTarget.style.color = '#ffffff';
        event.currentTarget.style.boxShadow = 'none';
    };

    const handleButtonLeave = (event) => {
        event.currentTarget.style.backgroundColor = '#FF7A00';
        event.currentTarget.style.borderColor = '#FF7A00';
        event.currentTarget.style.color = '#ffffff';
    };

    return (
			<>
				<div
					className="modal fade twm-sign-up"
					id="sign_up_popup2"
					aria-hidden="true"
					aria-labelledby="sign_up_popupLabel2"
					tabIndex={-1}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							{/* <form> */}
							<div className="modal-header">
								<h2 className="modal-title" id="sign_up_popupLabel2">
									Login - {activeTab === 'candidate' ? 'Candidate' : activeTab === 'employer' ? 'Employer' : 'Placement Officer'}
								</h2>
								<p>Login and get access to all the features of TaleGlobal</p>
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								/>
							</div>

							<div className="modal-body">
								<div className="twm-tabs-style-2">
									<div className="tab-content" id="myTab2Content">
										{/*Login Candidate Content*/}
										<form
											onSubmit={handleCandidateLogin}
											className={`tab-pane fade ${activeTab === 'candidate' ? 'show active' : ''}`}
											id="login-candidate"
										>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															required
															className="form-control"
															placeholder="Email*"
															value={canusername}
															autoComplete="new-password"
															onChange={(event) => {
																setCanUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showCanPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={canpassword}
															autoComplete="new-password"
															onChange={(event) => {
																setCanPassword(event.target.value);
															}}
														/>
														<span
															style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', userSelect: 'none', background: '#f8f9fa', padding: '5px 8px', borderRadius: '4px', zIndex: 10 }}
															onClick={() => setShowCanPassword(!showCanPassword)}
														>
															<i className={showCanPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#FF7A00' }} />
														</span>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="text-end">
															<a onClick={handleForgotPassword} style={{cursor: 'pointer'}}>Forgot Password</a>
														</div>
													</div>
												</div>

												<div className="col-12">
													<button
														type="submit"
														style={buttonStyle}
								onMouseEnter={handleButtonEnter}
								onMouseLeave={handleButtonLeave}
													>
														Log in
													</button>

													<div className="mt-3 mb-3" style={{color: "#000"}}>
														Don't have an account? <a href="#sign_up_popup" data-bs-target="#sign_up_popup" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign Up</a>
													</div>
												</div>
											</div>
										</form>

										{/*Login Employer Content*/}
										<form
											onSubmit={handleEmployerLogin}
											className={`tab-pane fade ${activeTab === 'employer' ? 'show active' : ''}`}
											id="login-Employer"
										>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															required
															className="form-control"
															placeholder="Company Email*"
															value={empusername}
															autoComplete="new-password"
															onChange={(event) => {
																setEmpUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showEmpPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={emppassword}
															autoComplete="new-password"
															onChange={(event) => {
																setEmpPassword(event.target.value);
															}}
														/>
														<span
															style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', userSelect: 'none', background: '#f8f9fa', padding: '5px 8px', borderRadius: '4px', zIndex: 10 }}
															onClick={() => setShowEmpPassword(!showEmpPassword)}
														>
															<i className={showEmpPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#FF7A00' }} />
														</span>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="text-end">
															<a onClick={handleForgotPassword} style={{cursor: 'pointer'}}>Forgot Password</a>
														</div>
													</div>
												</div>

												<div className="col-12">
													<button
														type="submit"
														style={buttonStyle}
								onMouseEnter={handleButtonEnter}
								onMouseLeave={handleButtonLeave}
													>
														Log in
													</button>

													<div className="mt-3 mb-3" style={{color: "#000"}}>
														Don't have an account? <a href="#sign_up_popup" data-bs-target="#sign_up_popup" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign Up</a>
													</div>
												</div>
											</div>
										</form>

										{/*Login Placement Content*/}
										<form
											onSubmit={handlePlacementLogin}
											className={`tab-pane fade ${activeTab === 'placement' ? 'show active' : ''}`}
											id="login-Placement"
										>
											<div className="row">
												{error && (
													<div className="col-12">
														<div className="alert alert-danger">{error}</div>
													</div>
												)}
												{success && (
													<div className="col-12">
														<div className="alert alert-success">{success}</div>
													</div>
												)}
												<div className="col-lg-12">
													<div className="form-group mb-3">
														<input
															name="username"
															type="text"
															required
															className="form-control"
															placeholder="Email*"
															value={placementusername}
															autoComplete="new-password"
															onChange={(event) => {
																setPlacementUsername(event.target.value);
															}}
														/>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3 position-relative">
														<input
															name="password"
															type={showPlacementPassword ? "text" : "password"}
															className="form-control"
															required
															placeholder="Password*"
															value={placementpassword}
															autoComplete="new-password"
															onChange={(event) => {
																setPlacementPassword(event.target.value);
															}}
														/>
														<span
															style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', userSelect: 'none', background: '#f8f9fa', padding: '5px 8px', borderRadius: '4px', zIndex: 10 }}
															onClick={() => setShowPlacementPassword(!showPlacementPassword)}
														>
															<i className={showPlacementPassword ? "fas fa-eye-slash" : "fas fa-eye"} style={{ color: '#FF7A00' }} />
														</span>
													</div>
												</div>

												<div className="col-lg-12">
													<div className="form-group mb-3">
														<div className="text-end">
															<a onClick={handleForgotPassword} style={{cursor: 'pointer'}}>Forgot Password</a>
														</div>
													</div>
												</div>

												<div className="col-12">
													<button
														type="submit"
														style={buttonStyle}
								onMouseEnter={handleButtonEnter}
								onMouseLeave={handleButtonLeave}
													>
														Log in
													</button>

													<div className="mt-3 mb-3" style={{color: "#000"}}>
														Don't have an account? <a href="#sign_up_popup" data-bs-target="#sign_up_popup" data-bs-toggle="modal" data-bs-dismiss="modal" style={{textDecoration: "underline", cursor: "pointer", color: "#FF7A00"}}>Sign Up</a>
													</div>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
							{/* </form> */}
						</div>
					</div>
				</div>
			</>
		);
}

export default SignInPopup;
