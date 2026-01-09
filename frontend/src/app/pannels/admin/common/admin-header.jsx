import React, { useState, useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import NotificationBell from "../../../../components/NotificationBell";

function AdminHeaderSection(props) {
    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (token) {
                // Decode token to get admin info
                const payload = JSON.parse(atob(token.split('.')[1]));
                setAdminData({ name: 'Admin', email: 'admin@jobportal.com' });
            }
        } catch (error) {
            
        }
    };

    const headerClasses = [
        props.sidebarActive ? "" : "active",
        props.isMobile ? "mobile-view" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <header id="header-admin-wrap" className="header-admin-fixed">
                {/* Header Start */}
                <div id="header-admin" className={headerClasses}>
                    <div className="container">
                        {/* Left Side Content */}
                        <div className="header-left">
                            <div className="nav-btn-wrap">
                                <a className="nav-btn-admin" id="sidebarCollapse" onClick={props.onClick}>
                                    <span className="fa fa-angle-left" />
                                </a>
                            </div>
                        </div>
                        {/* Left Side Content End */}

                        {/* Right Side Content */}
                        <div className="header-right">
                            <ul className="header-widget-wrap">
                                {/*Message*/}

                                {/*Notification*/}
                                <li className="header-widget dashboard-noti-dropdown">
                                    <NotificationBell userRole="admin" />
                                </li>

                                {/*Account*/}
                                <li className="header-widget">
                                    <div className="dashboard-user-section">
                                        <div className="listing-user">
                                            <div className="dropdown">
                                                {/* <a href="#" className="dropdown-toggle" id="ID-ACCOUNT_dropdown" data-bs-toggle="dropdown"> */}
                                                    <div className="">
                                                        <span>
                                                            <JobZImage src="images/user-avtar/pic4.jpg" alt="Admin" />
                                                        </span>
                                                    </div>
                                                {/* </a> */}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        {/* Right Side Content End */}
                    </div>
                </div>
                {/* Header End */}
            </header>

        </>
    )
}

export default AdminHeaderSection;
