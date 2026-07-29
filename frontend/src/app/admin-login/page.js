import React, { useRef, useState, useEffect } from "react";
import { useLoginRateLimit } from "../../hooks/useLoginRateLimit";
import { base } from "../../globals/route-names";
import "../../admin-login-custom.css";
import LetterCaptchaField from "../../components/LetterCaptchaField";
import { api } from "../../utils/api";

const DEFAULT_PHONE = "+91 90085 99697";
const MASKED_PHONE = "+91 90*******97";

const initialPasswordValidationState = {
    length: false,
    uppercase: false,
    specialChars: false
};

export default function AdminLogin() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // 2FA OTP step states
    const [requires2FA, setRequires2FA] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginOtp, setLoginOtp] = useState("");
    const [loginOtpLoading, setLoginOtpLoading] = useState(false);
    const [loginOtpError, setLoginOtpError] = useState("");

    // Reset password flow states
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [passwordValidation, setPasswordValidation] = useState(initialPasswordValidationState);
    const [otpLockout, setOtpLockout] = useState(0); // seconds remaining in lockout

    const captchaRef = useRef(null);
    const resendTimerRef = useRef(null);
    const lockoutTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            clearInterval(resendTimerRef.current);
            clearInterval(lockoutTimerRef.current);
        };
    }, []);
    const { isLocked, countdown, startLockout, clearAttempts } = useLoginRateLimit();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const startResendCooldown = () => {
        clearInterval(resendTimerRef.current);
        setResendCooldown(60);
        resendTimerRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) { clearInterval(resendTimerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const startOtpLockout = (seconds) => {
        clearInterval(lockoutTimerRef.current);
        setOtpLockout(seconds);
        lockoutTimerRef.current = setInterval(() => {
            setOtpLockout((prev) => {
                if (prev <= 1) { clearInterval(lockoutTimerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleToggleResetMode = () => {
        setError("");
        if (isResetMode) {
            setIsResetMode(false);
            setOtpSent(false);
            setOtp("");
            setNewPassword("");
            setResetEmail("");
            setResetError("");
            setResetSuccess("");
            setPasswordValidation(initialPasswordValidationState);
        } else {
            setResetEmail(formData.email);
            setResetError("");
            setResetSuccess("");
            setIsResetMode(true);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        setResetError("");
        setResetSuccess("");
        try {
            const data = await api.adminSendOtp({ email: resetEmail.trim() });
            if (data.success) {
                setResetSuccess('OTP sent successfully to +91 90*******97');
                setOtpSent(true);
                startResendCooldown();
            } else if (data.secondsRemaining) {
                startOtpLockout(data.secondsRemaining);
                setResetError(data.message);
            } else {
                setResetError(data.message || "Failed to send OTP. Please try again.");
            }
        } catch (err) {
            setResetError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResetLoading(true);
        setResetError("");
        setResetSuccess("");
        try {
            const data = await api.adminSendOtp({ email: resetEmail.trim() });
            if (data.success) {
                setResetSuccess('OTP resent successfully to +91 90*******97');
                startResendCooldown();
            } else if (data.secondsRemaining) {
                startOtpLockout(data.secondsRemaining);
                setResetError(data.message);
            } else {
                setResetError(data.message || "Failed to resend OTP.");
            }
        } catch (err) {
            setResetError(err.message || "Failed to resend OTP.");
        } finally {
            setResetLoading(false);
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

        try {
            const data = await api.adminVerifyOtpReset({
                email: resetEmail.trim(),
                otp: otp.trim(),
                newPassword
            });
            if (data.success) {
                setResetSuccess("Password reset successful. You can log in now.");
                setTimeout(() => {
                    setIsResetMode(false);
                    setOtpSent(false);
                    setOtp("");
                    setNewPassword("");
                    setResetEmail("");
                    setResetError("");
                    setResetSuccess("");
                    setPasswordValidation(initialPasswordValidationState);
                }, 1500);
            } else if (data.secondsRemaining) {
                startOtpLockout(data.secondsRemaining);
                setResetError(data.message);
            } else {
                setResetError(data.message || "Invalid or expired OTP. Please try again.");
            }
        } catch (err) {
            setResetError(err.message || "Unable to reset password. Please try again.");
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

            if (data.success && data.requiresOTP) {
                clearAttempts();
                setLoginEmail(data.email || formData.email);
                setRequires2FA(true);
                setLoading(false);
                return;
            }

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
                window.location.href = base.ADMIN_PRE + "/dashboard";
                return;
            }

            setError(data.message || "Login failed. Please try again.");
        } catch (networkError) {
            setError(`Network error: ${networkError.message}. Please ensure backend server is running on port 5000.`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLoginOtp = async (e) => {
        e.preventDefault();
        setLoginOtpLoading(true);
        setLoginOtpError("");
        try {
            const data = await api.adminVerifyLoginOtp({ email: loginEmail, otp: loginOtp.trim() });
            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                if (data.admin) {
                    localStorage.setItem("adminData", JSON.stringify(data.admin));
                    localStorage.removeItem("subAdminData");
                } else if (data.subAdmin) {
                    localStorage.setItem("subAdminData", JSON.stringify(data.subAdmin));
                    localStorage.removeItem("adminData");
                }
                window.location.href = base.ADMIN_PRE + "/dashboard";
            } else {
                setLoginOtpError(data.message || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            setLoginOtpError(err.message || "Failed to verify OTP.");
        } finally {
            setLoginOtpLoading(false);
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
                                        <p>{isResetMode ? "Reset your admin password" : "Access Admin Panel"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="twm-tabs-style-2">
                                <div className="tab-content" id="myTab2Content">
                                    <div className="tab-pane fade show active" id="login">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="twm-tabs-style-2">
                                                    {requires2FA ? (
                                                        <form onSubmit={handleVerifyLoginOtp}>
                                                            <div className="twm-tabs-style-2-content">
                                                                {loginOtpError && (
                                                                    <div className="alert alert-danger" role="alert">{loginOtpError}</div>
                                                                )}
                                                                <div className="alert alert-info" role="alert" style={{ fontSize: '13px' }}>
                                                                    An OTP has been sent to <strong>{loginEmail}</strong>. Enter it below to complete login.
                                                                </div>
                                                                <div className="form-group mb-3">
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Enter OTP"
                                                                        value={loginOtp}
                                                                        onChange={(e) => setLoginOtp(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <button
                                                                        type="button"
                                                                        className="site-button admin-auth-button admin-secondary-button"
                                                                        onClick={() => { setRequires2FA(false); setLoginOtp(""); setLoginOtpError(""); }}
                                                                    >
                                                                        Back to login
                                                                    </button>
                                                                </div>
                                                                <div className="form-group">
                                                                    <button type="submit" className="site-button admin-auth-button" disabled={loginOtpLoading}>
                                                                        {loginOtpLoading ? "Verifying..." : "Verify OTP"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : !isResetMode ? (
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
                                                                            position: "absolute", right: "8px", top: 0, bottom: 0,
                                                                            cursor: "pointer", color: "#6c757d", fontSize: "16px",
                                                                            zIndex: "10", userSelect: "none", display: "flex",
                                                                            alignItems: "center", justifyContent: "center",
                                                                            width: "32px", textAlign: "center", lineHeight: 1
                                                                        }}
                                                                    >
                                                                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                                    </span>
                                                                </div>

                                                                <div className="form-group mb-3">
                                                                    <LetterCaptchaField ref={captchaRef} wrapperClassName="admin-letter-captcha" />
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
                                                                        Too many failed attempts. Try again in <strong>{countdown}s</strong>
                                                                    </div>
                                                                )}

                                                                <div className="form-group">
                                                                    <button
                                                                        type="submit"
                                                                        className="site-button admin-auth-button"
                                                                        disabled={loading || isLocked}
                                                                        style={{ transition: "none" }}
                                                                        onMouseEnter={(e) => { e.currentTarget.style.transform = "none"; }}
                                                                    >
                                                                        {loading ? "Logging in..." : isLocked ? `Try after ${countdown}s` : "Login"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : !otpSent ? (
                                                        <form onSubmit={handleSendOtp}>
                                                            <div className="twm-tabs-style-2-content">
                                                                {resetError && <div className="alert alert-danger" role="alert">{resetError}</div>}
                                                                {resetSuccess && <div className="alert alert-success" role="alert">{resetSuccess}</div>}

                                                                <div className="alert alert-info" role="alert" style={{ fontSize: '13px' }}>
                                                                    OTP will be sent via SMS to <strong>{MASKED_PHONE}</strong>
                                                                </div>
                                                                <div className="form-group mb-3">
                                                                    <input
                                                                        type="email"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Admin Email"
                                                                        value={resetEmail}
                                                                        onChange={(e) => setResetEmail(e.target.value)}
                                                                    />
                                                                </div>

                                                                <div className="form-group">
                                                                    <button type="button" className="site-button admin-auth-button admin-secondary-button" onClick={handleToggleResetMode}>
                                                                        Back to login
                                                                    </button>
                                                                </div>

                                                                <div className="form-group">
                                                                    <button type="submit" className="site-button admin-auth-button" disabled={resetLoading || otpLockout > 0}>
                                                                        {resetLoading ? "Sending OTP..." : otpLockout > 0 ? `Locked (${Math.floor(otpLockout / 60)}:${String(otpLockout % 60).padStart(2, '0')})` : "Send OTP"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <form onSubmit={handleResetPassword}>
                                                            <div className="twm-tabs-style-2-content">
                                                                {resetError && <div className="alert alert-danger" role="alert">{resetError}</div>}
                                                                {resetSuccess && <div className="alert alert-success" role="alert">{resetSuccess}</div>}
                                                                {otpLockout > 0 && (
                                                                    <div className="alert alert-warning" role="alert" style={{ textAlign: 'center' }}>
                                                                        Too many failed attempts. Try again in <strong>{Math.floor(otpLockout / 60)}:{String(otpLockout % 60).padStart(2, '0')}</strong>
                                                                    </div>
                                                                )}

<div className="form-group mb-3">
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="Enter OTP"
                                                                        value={otp}
                                                                        onChange={(e) => setOtp(e.target.value)}
                                                                    />
                                                                </div>

                                                                <div className="form-group mb-3" style={{ position: "relative" }}>
                                                                    <input
                                                                        type={showResetPassword ? "text" : "password"}
                                                                        required
                                                                        className="form-control"
                                                                        placeholder="New Password"
                                                                        value={newPassword}
                                                                        onChange={(e) => {
                                                                            const pwd = e.target.value;
                                                                            setNewPassword(pwd);
                                                                            setPasswordValidation({
                                                                                length: pwd.length >= 6,
                                                                                uppercase: /[A-Z]/.test(pwd),
                                                                                specialChars: /[@#!%$*?]/.test(pwd)
                                                                            });
                                                                        }}
                                                                        style={{ paddingRight: "48px" }}
                                                                    />
                                                                    <span
                                                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                                                        style={{
                                                                            position: "absolute", right: "8px", top: 0, bottom: 0,
                                                                            cursor: "pointer", color: "#6c757d", fontSize: "16px",
                                                                            zIndex: "10", userSelect: "none", display: "flex",
                                                                            alignItems: "center", justifyContent: "center",
                                                                            width: "32px", textAlign: "center", lineHeight: 1
                                                                        }}
                                                                    >
                                                                        <i className={showResetPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                                    </span>
                                                                </div>

                                                                <div className="password-requirements">
                                                                    <div className={`password-rule ${passwordValidation.length ? "active" : ""}`}>At least 6 characters</div>
                                                                    <div className={`password-rule ${passwordValidation.uppercase ? "active" : ""}`}>One uppercase letter</div>
                                                                    <div className={`password-rule ${passwordValidation.specialChars ? "active" : ""}`}>One special character (@#!%$*?)</div>
                                                                </div>

                                                                <div className="mt-3 mb-3 text-center">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-link p-0"
                                                                        onClick={handleResendOtp}
                                                                        disabled={resendCooldown > 0 || resetLoading}
                                                                        style={{ color: resendCooldown > 0 ? '#6c757d' : '#FF7A00', textDecoration: 'none', fontWeight: '500' }}
                                                                    >
                                                                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                                                                    </button>
                                                                </div>

                                                                <div className="form-group">
                                                                    <button type="button" className="site-button admin-auth-button admin-secondary-button" onClick={handleToggleResetMode}>
                                                                        Back to login
                                                                    </button>
                                                                </div>

                                                                <div className="form-group">
                                                                    <button type="submit" className="site-button admin-auth-button" disabled={resetLoading || otpLockout > 0}>
                                                                        {resetLoading ? "Resetting..." : otpLockout > 0 ? `Locked (${Math.floor(otpLockout / 60)}:${String(otpLockout % 60).padStart(2, '0')})` : "Reset Password"}
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
