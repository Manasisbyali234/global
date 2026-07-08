import React, { useRef, useState } from "react";
import { useLoginRateLimit, formatCountdown } from "../../hooks/useLoginRateLimit";
import { useNavigate } from "react-router-dom";
import "../../admin-login-custom.css";
import LetterCaptchaField from "../../components/LetterCaptchaField";
import { api } from "../../utils/api";

const initialResetFormState = {
    email: "",
    newPassword: "",
    confirmPassword: ""
};

const initialPasswordValidationState = {
    length: false,
    uppercase: false,
    specialChars: false
};

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetFormData, setResetFormData] = useState(initialResetFormState);
    const [passwordValidation, setPasswordValidation] = useState(initialPasswordValidationState);
    const captchaRef = useRef(null);
    const navigate = useNavigate();
    const { isLocked, countdown, recordFailedAttempt, clearAttempts } = useLoginRateLimit('admin');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetResetFlowState = () => {
        setResetLoading(false);
        setResetError("");
        setResetSuccess("");
        setShowResetPassword(false);
        setResetFormData(initialResetFormState);
        setPasswordValidation(initialPasswordValidationState);
    };

    const handleToggleResetMode = () => {
        setError("");

        if (isResetMode) {
            setIsResetMode(false);
            resetResetFlowState();
            return;
        }

        setResetError("");
        setResetSuccess("");
        setResetFormData({
            ...initialResetFormState,
            email: formData.email
        });
        setIsResetMode(true);
    };

    const updatePasswordValidation = (password) => {
        setPasswordValidation({
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            specialChars: /[@#!%$*?]/.test(password)
        });
    };

    const handleResetFieldChange = (e) => {
        const { name, value } = e.target;

        setResetFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        if (name === "newPassword") {
            updatePasswordValidation(value);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        setResetError("");
        setResetSuccess("");

        if (!Object.values(passwordValidation).every(Boolean)) {
            setResetError("Please meet all password requirements.");
            setResetLoading(false);
            return;
        }

        if (resetFormData.newPassword !== resetFormData.confirmPassword) {
            setResetError("Passwords do not match.");
            setResetLoading(false);
            return;
        }

        try {
            const normalizedEmail = resetFormData.email.trim();
            const data = await api.adminResetPasswordDirect({
                email: normalizedEmail,
                newPassword: resetFormData.newPassword
            });

            if (data.success) {
                setResetSuccess("Password reset successful. You can log in now.");
                setFormData((currentFormData) => ({
                    ...currentFormData,
                    email: normalizedEmail
                }));
                window.setTimeout(() => {
                    setIsResetMode(false);
                    resetResetFlowState();
                }, 1200);
            }
        } catch (requestError) {
            setResetError(requestError.message || "Unable to reset password. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked) return;
        setLoading(true);
        setError("");

        if (!captchaRef.current?.validate()) {
            setLoading(false);
            return;
        }

        try {
            const data = await api.adminLogin(formData);

            if (data.success) {
                clearAttempts();
                localStorage.setItem("adminToken", data.token);

                if (data.admin) {
                    localStorage.setItem("adminData", JSON.stringify(data.admin));
                    localStorage.removeItem("subAdminData");
                } else if (data.subAdmin) {
                    localStorage.setItem("subAdminData", JSON.stringify(data.subAdmin));
                    localStorage.removeItem("adminData");
                }

                navigate("/admin/dashboard");
                return;
            }

            recordFailedAttempt();
            setError(data.message || "Login failed. Please try again.");
        } catch (networkError) {
            recordFailedAttempt();
            setError(`Network error: ${networkError.message}. Please ensure backend server is running on port 5000.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="twm-login-reg">
            <div className="twm-login-reg-inner">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 col-sm-12 m-auto">
                            <div className="twm-login-reg-head">
                                <div className="twm-login-reg-logo">
                                    <div className="twm-login-reg-title">
                                        <h4>{isResetMode ? "Reset Password" : "Admin Login"}</h4>
                                        <p>{isResetMode ? "Create a new password directly" : "Access Admin Panel"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="twm-tabs-style-2">
                                <div className="tab-content" id="myTab2Content">
                                    <div className="tab-pane fade show active" id="login">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="twm-tabs-style-2">
                                                    {!isResetMode ? (
                                                        <form onSubmit={handleSubmit}>
                                                            <div className="twm-tabs-style-2-content">
                                                                {error && (
                                                                    <div className="alert alert-danger" role="alert">
                                                                        {error}
                                                                    </div>
                                                                )}

                                                                <div className="form-group mb-3">
                                                                    <input
                                                                        name="email"
                                                                        type="email"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Admin Email"
                                                                        value={formData.email}
                                                                        onChange={handleChange}
                                                                    />
                                                                </div>

                                                                <div className="form-group mb-3" style={{ position: "relative" }}>
                                                                    <input
                                                                        name="password"
                                                                        type={showPassword ? "text" : "password"}
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Password"
                                                                        value={formData.password}
                                                                        onChange={handleChange}
                                                                        style={{ paddingRight: "48px" }}
                                                                    />
                                                                    <span
                                                                        onClick={() => setShowPassword(!showPassword)}
                                                                        style={{
                                                                            position: "absolute",
                                                                            right: "8px",
                                                                            top: 0,
                                                                            bottom: 0,
                                                                            cursor: "pointer",
                                                                            color: "#6c757d",
                                                                            fontSize: "16px",
                                                                            zIndex: "10",
                                                                            userSelect: "none",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "32px",
                                                                            textAlign: "center",
                                                                            lineHeight: 1
                                                                        }}
                                                                    >
                                                                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                                    </span>
                                                                </div>

                                                                <div className="form-group mb-3">
                                                                    <LetterCaptchaField
                                                                        ref={captchaRef}
                                                                        wrapperClassName="admin-letter-captcha"
                                                                    />
                                                                </div>

                                                                <div className="form-group">
                                                                    <button
                                                                        type="button"
                                                                        className="site-button admin-auth-button admin-secondary-button"
                                                                        onClick={handleToggleResetMode}
                                                                    >
                                                                        Reset password
                                                                    </button>
                                                                </div>

                                                                {isLocked && (
                                                                    <div className="alert alert-warning" role="alert" style={{ textAlign: 'center' }}>
                                                                        Too many failed attempts. Try again in <strong>{formatCountdown(countdown)}</strong>
                                                                    </div>
                                                                )}
                                                                <div className="form-group">
                                                                    <button
                                                                        type="submit"
                                                                        className="site-button admin-auth-button"
                                                                        disabled={loading || isLocked}
                                                                        style={{ transition: "none" }}
                                                                        onMouseEnter={(event) => {
                                                                            event.currentTarget.style.transform = "none";
                                                                        }}
                                                                    >
                                                                        {loading ? "Logging in..." : "Login"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <form onSubmit={handleResetPassword}>
                                                            <div className="twm-tabs-style-2-content">
                                                                {resetError && (
                                                                    <div className="alert alert-danger" role="alert">
                                                                        {resetError}
                                                                    </div>
                                                                )}

                                                                {resetSuccess && (
                                                                    <div className="alert alert-success" role="alert">
                                                                        {resetSuccess}
                                                                    </div>
                                                                )}

                                                                <div className="form-group mb-3">
                                                                    <input
                                                                        name="email"
                                                                        type="email"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Admin Email"
                                                                        value={resetFormData.email}
                                                                        onChange={handleResetFieldChange}
                                                                    />
                                                                </div>

                                                                <div className="form-group mb-3" style={{ position: "relative" }}>
                                                                    <input
                                                                        name="newPassword"
                                                                        type={showResetPassword ? "text" : "password"}
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="New Password"
                                                                        value={resetFormData.newPassword}
                                                                        onChange={handleResetFieldChange}
                                                                        style={{ paddingRight: "48px" }}
                                                                    />
                                                                    <span
                                                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                                                        style={{
                                                                            position: "absolute",
                                                                            right: "8px",
                                                                            top: 0,
                                                                            bottom: 0,
                                                                            cursor: "pointer",
                                                                            color: "#6c757d",
                                                                            fontSize: "16px",
                                                                            zIndex: "10",
                                                                            userSelect: "none",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            width: "32px",
                                                                            textAlign: "center",
                                                                            lineHeight: 1
                                                                        }}
                                                                    >
                                                                        <i className={showResetPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                                    </span>
                                                                </div>

                                                                <div className="form-group mb-3">
                                                                    <input
                                                                        name="confirmPassword"
                                                                        type={showResetPassword ? "text" : "password"}
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Confirm New Password"
                                                                        value={resetFormData.confirmPassword}
                                                                        onChange={handleResetFieldChange}
                                                                    />
                                                                </div>

                                                                <div className="password-requirements">
                                                                    <div className={`password-rule ${passwordValidation.length ? "active" : ""}`}>
                                                                        At least 6 characters
                                                                    </div>
                                                                    <div className={`password-rule ${passwordValidation.uppercase ? "active" : ""}`}>
                                                                        One uppercase letter
                                                                    </div>
                                                                    <div className={`password-rule ${passwordValidation.specialChars ? "active" : ""}`}>
                                                                        One special character (@#!%$*?)
                                                                    </div>
                                                                </div>

                                                                <div className="form-group">
                                                                    <button
                                                                        type="button"
                                                                        className="site-button admin-auth-button admin-secondary-button"
                                                                        onClick={handleToggleResetMode}
                                                                    >
                                                                        Back to login
                                                                    </button>
                                                                </div>

                                                                <div className="form-group">
                                                                    <button
                                                                        type="submit"
                                                                        className="site-button admin-auth-button"
                                                                        disabled={resetLoading}
                                                                    >
                                                                        {resetLoading ? "Resetting..." : "Reset Password"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
