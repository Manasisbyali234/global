import { NavLink, useNavigate } from "react-router-dom";
import { placementRoute, placement, publicUser } from "../../../../../../globals/route-names";
import { useRef, useState } from "react";
import { useLoginRateLimit } from "../../../../../../hooks/useLoginRateLimit";
import { useAuth } from "../../../../../../contexts/AuthContext";
import JobZImage from "../../../../../common/jobz-img";
import LetterCaptchaField from "../../../../../../components/LetterCaptchaField";
import "./AuthPages.css";

function LoginPlacement() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const captchaRef = useRef(null);
    const { isLocked, countdown, recordFailedAttempt, clearAttempts } = useLoginRateLimit('placement');

    const handleLogin = async (event) => {
        event.preventDefault();
        if (isLocked) return;
        setError('');
        setLoading(true);

        if (!captchaRef.current?.validate()) {
            setLoading(false);
            return;
        }

        if (!email.trim()) {
            setError('Email is required');
            setLoading(false);
            return;
        }

        if (!password.trim()) {
            setError('Password is required');
            setLoading(false);
            return;
        }

        try {
            const result = await login({
                email: email.trim(),
                password: password.trim()
            }, 'placement');

            if (result.success) {
                clearAttempts();
                navigate(placementRoute(placement.DASHBOARD));
            } else {
                recordFailedAttempt();
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            recordFailedAttempt();
            setError('Login failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-page-wrapper public-auth-page">
            <div className="container auth-page-container">
                <div className="main-card public-auth-card">
                    <div className="left-section">
                        <div className="image-wrapper login-page-image-wrapper">
                            <img
                                className="login-page-image"
                                src="assets/images/ChatGPT%20Image%20Jul%206%2C%202026%2C%2010_13_53%20AM.png"
                                alt="Placement Login"
                            />
                        </div>
                    </div>

                    <div className="right-section">
                        <NavLink to={publicUser.INITIAL} className="auth-logo">
                            <JobZImage src="images/logo-dark.png" alt="Logo" />
                        </NavLink>

                        <h2>Login</h2>
                        <p className="sub-text">Placement Dean Portal</p>

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

                            <div className="auth-form-group">
                                <LetterCaptchaField ref={captchaRef} />
                            </div>

                            {isLocked && (
                                <div className="alert alert-warning p-2 mb-3" style={{ fontSize: '14px', textAlign: 'center' }}>
                                    Too many failed attempts. Try again in <strong>{countdown}s</strong>
                                </div>
                            )}
                            <button type="submit" className="login-btn" disabled={loading || isLocked}>
                                {loading ? 'Logging in...' : isLocked ? `Try after ${countdown}s` : 'Log in'}
                            </button>

                            <p className="small-link">
                                Don't have an account? <NavLink to={publicUser.pages.SIGNUP_PLACEMENT}>Sign Up</NavLink>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPlacement;
