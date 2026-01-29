import { NavLink, useNavigate, useLocation } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import { canRoute, candidate, empRoute, employer, placementRoute, placement, publicUser } from "../../../../../globals/route-names";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../../contexts/AuthContext";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import { handleFacebookLogin, handleGoogleLogin } from "../../../../../utils/socialAuth";
import './login-fix.css';
import './login-mobile-responsive.css';
import { removePasswordEyeIcons } from './remove-eye-icons';



function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [canusername, setCanUsername] = useState('');
    const [empusername, setEmpUsername] = useState('');
    const [placementusername, setPlacementUsername] = useState('');
    const [canpassword, setCanPassword] = useState('');
    const [emppassword, setEmpPassword] = useState('');
    const [placementpassword, setPlacementPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        loadScript("js/custom.js");
        removePasswordEyeIcons();

        // Handle tab selection via query parameter
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab === 'employer') {
            const employerTab = document.querySelector('[data-bs-target="#twm-login-Employer"]');
            if (employerTab) {
                employerTab.click();
            }
        } else if (tab === 'placement') {
            const placementTab = document.querySelector('[data-bs-target="#twm-login-Placement"]');
            if (placementTab) {
                placementTab.click();
            }
        }
        
        // Remove eye icons when tabs change
        const observer = new MutationObserver(() => {
            removePasswordEyeIcons();
        });
        
        const tabContainer = document.getElementById('myTab2Content');
        if (tabContainer) {
            observer.observe(tabContainer, { childList: true, subtree: true });
        }
        
        return () => observer.disconnect();
    }, []);



    const handleCandidateLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: canusername,
            password: canpassword
        }, 'candidate');
        
        setLoading(false);
        
        if (result.success) {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl, { replace: true });
            } else {
                navigate('/candidate/dashboard', { replace: true });
            }
        } else {
            setError(result.message || 'Login failed');
        }
    }

    const handleEmployerLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        // Validate inputs
        if (!empusername.trim() || !emppassword.trim()) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }
        
        try {
            const result = await login({
                email: empusername.trim(),
                password: emppassword
            }, 'employer');
            
            setLoading(false);
            
            if (result.success) {
                // Check if there's a redirect URL stored
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectUrl, { replace: true });
                } else {
                    navigate('/employer/dashboard', { replace: true });
                }
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (error) {
            setLoading(false);
            setError('Login failed. Please check your connection and try again.');
        }
    }

    const handlePlacementLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: placementusername,
            password: placementpassword
        }, 'placement');
        
        setLoading(false);
        
        if (result.success) {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl, { replace: true });
            } else {
                navigate(placementRoute(placement.DASHBOARD), { replace: true });
            }
        } else {
            setError(result.message || 'Login failed');
        }
    }

    return (
        <>

            <div className="min-vh-100 d-flex align-items-center" style={{background: 'transparent'}}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-11 col-xl-10">
                            <div className="row g-0">
                                    <div className="col-md-6 position-relative">
                                        <div className="h-100 d-flex align-items-center justify-content-center" style={{background: 'transparent', minHeight: '600px'}}>
                                            <JobZImage src="images/login-image.svg" alt="" style={{width: '95%', maxWidth: '400px'}} />
                                        </div>
                                    </div>
                                    <div className="col-md-6" style={{borderLeft: '4px solid #FF6A00'}}>
                                        <div className="p-5 d-flex flex-column justify-content-center" style={{minHeight: '600px'}}>
                                            <div className="text-center mb-4">
                                                <NavLink to={publicUser.HOME1}>
                                                    <JobZImage src="images/skins-logo/logo-skin-8.png" alt="" className="mb-3" style={{maxHeight: '45px'}} />
                                                </NavLink>
                                                <h3 className="fw-bold text-dark mb-2">Welcome Back</h3>
                                                <p className="text-muted mb-0">Sign in to your account</p>
                                            </div>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                            <div className="mb-4">
                                                <ul className="nav nav-tabs" id="myTab2" role="tablist">
                                                    <li className="nav-item">
                                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#twm-login-candidate" type="button"><i className="fas fa-user-tie me-1" /><span>Candidate</span></button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#twm-login-Employer" type="button"><i className="fas fa-building me-1" /><span>Employer</span></button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#twm-login-Placement" type="button"><i className="fas fa-graduation-cap me-1" /><span>Placement</span></button>
                                                    </li>
                                                </ul>
                                                <div className="tab-content" id="myTab2Content">
                                            {/*Login Candidate Content*/}
                                            <form onSubmit={handleCandidateLogin} className="tab-pane fade show active" id="twm-login-candidate">
                                                <div className="mb-3">
                                                    <input name="email"
                                                        type="email"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={canusername}
                                                        onChange={(event) => setCanUsername(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={canpassword}
                                                        onChange={(event) => setCanPassword(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberCandidate" />
                                                        <label className="form-check-label text-muted" htmlFor="rememberCandidate" style={{fontSize: '14px'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500', backgroundColor: '#fd7e14', color: 'white', border: 'none'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                            {/*Login Employer Content*/}
                                            <form onSubmit={handleEmployerLogin} className="tab-pane fade" id="twm-login-Employer">
                                                <div className="mb-3">
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={empusername}
                                                        onChange={(event) => setEmpUsername(event.target.value)}
                                                        autoComplete="email"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={emppassword}
                                                        onChange={(event) => setEmpPassword(event.target.value)}
                                                        autoComplete="current-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberEmployer" />
                                                        <label className="form-check-label text-muted" htmlFor="rememberEmployer" style={{fontSize: '14px'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500', backgroundColor: '#fd7e14', color: 'white', border: 'none'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                            {/*Login Placement Content*/}
                                            <form onSubmit={handlePlacementLogin} className="tab-pane fade" id="twm-login-Placement">
                                                <div className="mb-3">
                                                    <input
                                                        name="username"
                                                        type="text"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={placementusername}
                                                        onChange={(event) => setPlacementUsername(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={placementpassword}
                                                        onChange={(event) => setPlacementPassword(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberPlacement" />
                                                        <label className="form-check-label text-muted" htmlFor="rememberPlacement" style={{fontSize: '14px'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500', backgroundColor: '#fd7e14', color: 'white', border: 'none'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="text-center mt-3">
                                            <p className="mb-3">Don't have an account? <NavLink to={publicUser.pages.SIGNUP_CANDIDATE} className="site-text-primary">Sign Up</NavLink></p>
                                            <NavLink to={publicUser.INITIAL} className="btn btn-outline-secondary" style={{padding: '8px 20px', borderRadius: '8px', textDecoration: 'none'}}>
                                                <i className="fas fa-home me-2" style={{color: '#FF6A00'}}></i>Back to Home
                                            </NavLink>
                                        </div>
                                    </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;
