import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../admin-login-custom.css";
import LetterCaptchaField from "../../components/LetterCaptchaField";
import { api } from "../../utils/api";

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const captchaRef = useRef(null);
    const navigate = useNavigate();

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
            const data = await api.adminLogin(formData);

            if (data.success) {
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

            setError(data.message || "Login failed. Please try again.");
        } catch (networkError) {
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
                                        <h4>Admin Login</h4>
                                        <p>Access Admin Panel</p>
                                    </div>
                                </div>
                            </div>

                            <div className="twm-tabs-style-2">
                                <div className="tab-content" id="myTab2Content">
                                    <div className="tab-pane fade show active" id="login">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="twm-tabs-style-2">
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
                                                                    type="submit"
                                                                    className="site-button"
                                                                    disabled={loading}
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
