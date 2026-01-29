import { NavLink, useNavigate } from "react-router-dom";
import { canRoute, candidate, publicUser } from "../../../../../../globals/route-names";
import { useState } from "react";
import { useAuth } from "../../../../../../contexts/AuthContext";
import JobZImage from "../../../../../common/jobz-img";
import "./AuthPages.css";

function LoginCandidate() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: email.trim(),
            password: password.trim()
        }, 'candidate');
        
        if (result.success) {
            navigate(canRoute(candidate.DASHBOARD));
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    return (
        <div className="auth-page-wrapper">
            <div className="main-card">
                {/* Left Side (Image Section) */}
                <div className="left-section">
                    <div className="image-wrapper">
                        <img src="assets/images/background/image.png" alt="Candidate Login" />
                    </div>
                </div>

                {/* Right Side (Login Form Section) */}
                <div className="right-section">
                    <NavLink to={publicUser.INITIAL} className="auth-logo">
                        <JobZImage src="images/logo-dark.png" alt="Logo" />
                    </NavLink>
                    
                    <h2>Login</h2>
                    <p className="sub-text">Manage your career and applications</p>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>
                                {error}
                            </div>
                        )}
                        
                        <div className="auth-form-group">
                            <input
                                name="email"
                                type="email"
                                required
                                className="auth-input"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="auth-form-group">
                            <div className="password-input-wrapper">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                                </span>
                            </div>
                        </div>

                        <NavLink to={publicUser.pages.FORGOT} className="forgot-link site-text-primary">
                            Forgot Password?
                        </NavLink>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>

                        <p className="small-link">
                            Don't have an account? <NavLink to={publicUser.pages.SIGNUP_CANDIDATE}>Sign Up</NavLink>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginCandidate;
