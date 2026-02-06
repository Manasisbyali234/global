import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../admin-login-custom.css";

export default function SubAdminLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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

        try {
            const response = await fetch("http://localhost:5000/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            

            if (response.ok && data.success) {
                localStorage.setItem("adminToken", data.token);
                
                if (data.subAdmin) {
                    // Sub-admin login
                    localStorage.setItem("subAdminData", JSON.stringify(data.subAdmin));
                    localStorage.removeItem("adminData");
                    // Redirect to admin dashboard where sub-admin profile will be displayed
                    window.location.href = "/admin/dashboard";
                } else if (data.admin && data.admin.role === 'sub-admin') {
                    // Handle case where sub-admin is returned as admin
                    localStorage.setItem("subAdminData", JSON.stringify(data.admin));
                    localStorage.removeItem("adminData");
                    window.location.href = "/admin/dashboard";
                } else {
                    setError("Access denied. This login is for sub-admins only.");
                }
            } else {
                
                setError(data.message || `Login failed (${response.status})`);
            }
        } catch (error) {
            
            setError(`Network error: ${error.message}. Please ensure backend server is running.`);
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

                                            <div className="form-group mb-3" style={{ position: 'relative' }}>
                                                <input
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className="form-control"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    style={{ paddingRight: '60px' }}
                                                />
                                                <span
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                        color: '#6c757d',
                                                        fontSize: '16px',
                                                        zIndex: '10',
                                                        userSelect: 'none',
                                                        display: 'inline-block',
                                                        width: '20px',
                                                        height: '20px',
                                                        textAlign: 'center',
                                                        lineHeight: '20px'
                                                    }}
                                                >
                                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                                </span>
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
