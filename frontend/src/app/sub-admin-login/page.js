import React, { useRef, useState } from "react";
import "../../admin-login-custom.css";
import LetterCaptchaField from "../../components/LetterCaptchaField";
import { api } from "../../utils/api";

export default function SubAdminLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const captchaRef = useRef(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!captchaRef.current?.validate()) {
            setLoading(false);
            return;
        }

        try {
            const data = await api.subAdminLogin(formData);

            if (data.success) {
                localStorage.setItem("adminToken", data.token);

                if (data.subAdmin) {
                    localStorage.setItem("subAdminData", JSON.stringify(data.subAdmin));
                    localStorage.removeItem("adminData");
                    window.location.href = "/admin/dashboard";
                    return;
                }

                if (data.admin && data.admin.role === "sub-admin") {
                    localStorage.setItem("subAdminData", JSON.stringify(data.admin));
                    localStorage.removeItem("adminData");
                    window.location.href = "/admin/dashboard";
                    return;
                }

                setError("Access denied. This login is for sub-admins only.");
                return;
            }

            setError(data.message || "Login failed. Please try again.");
        } catch (networkError) {
            setError(`Network error: ${networkError.message}. Please ensure backend server is running.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wraper">
            <div className="twm-login-reg">
                <div className="twm-login-reg-inner">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 col-sm-12 m-auto">
                                <div className="twm-login-reg-head">
                                    <div className="twm-login-reg-logo">
                                        <div className="twm-login-reg-title">
                                            <h4>Sub Admin Login</h4>
                                            <p>Access Sub Admin Panel</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="twm-tabs-style-2">
                                    <form onSubmit={handleSubmit}>
                                        <div className="twm-tabs-style-2-content">
                                            {error && (
                                                <div className="alert alert-danger">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="form-group mb-3">
                                                <input
                                                    name="email"
                                                    type="email"
                                                    required
                                                    className="form-control"
                                                    placeholder="Sub Admin Email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="form-group mb-3" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                                <input
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className="form-control"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    style={{ paddingRight: "40px" }}
                                                />
                                                <span
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: "absolute",
                                                        right: "15px",
                                                        cursor: "pointer",
                                                        color: "#6c757d",
                                                        fontSize: "16px",
                                                        zIndex: "10",
                                                        userSelect: "none",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        height: "100%"
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
                                                    type="submit"
                                                    className="site-button"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Logging in..." : "Login as Sub Admin"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
