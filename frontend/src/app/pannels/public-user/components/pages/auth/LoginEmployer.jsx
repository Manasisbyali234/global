import { NavLink, useNavigate } from "react-router-dom";
import { empRoute, employer, publicUser } from "../../../../../../globals/route-names";
import { useRef, useState } from "react";
import { useAuth } from "../../../../../../contexts/AuthContext";
import JobZImage from "../../../../../common/jobz-img";
import LetterCaptchaField from "../../../../../../components/LetterCaptchaField";
import "./AuthPages.css";

function LoginEmployer() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const captchaRef = useRef(null);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (!captchaRef.current?.validate()) {
            setLoading(false);
            return;
        }

        const result = await login({
            email: email.trim(),
            password: password.trim()
        }, 'employer');

        if (result.success) {
            navigate(empRoute(employer.DASHBOARD));
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page-wrapper public-auth-page">
            <div className="container auth-page-container">
                <div className="main-card public-auth-card">
                    <div className="left-section">
                        <div className="image-wrapper">
                            <img src="assets/images/background/image.png" alt="Employer Login" />
                        </div>
                    </div>

                    <div className="right-section">
                        <NavLink to={publicUser.INITIAL} className="auth-logo">
                            <JobZImage src="images/logo-dark.png" alt="Logo" />
                        </NavLink>

                        <h2>Login</h2>
                        <p className="sub-text">Manage your company and hiring</p>

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
                                    placeholder="Company Email Address"
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

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>

                            <p className="small-link">
                                Don't have an account? <NavLink to={publicUser.pages.SIGNUP_EMPLOYER}>Sign Up</NavLink>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginEmployer;
