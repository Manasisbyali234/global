import React, { useState, useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { empRoute, employer } from "../../../../globals/route-names";
import NotificationBell from "../../../../components/NotificationBell";
import { api } from "../../../../utils/api";
import "../../../../employer-header-mobile-fix.css";

function EmpHeaderSection(props) {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
        
        const handleProfileUpdate = () => {
            fetchProfile();
        };
        
        window.addEventListener('employerProfileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('employerProfileUpdated', handleProfileUpdate);
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.getEmployerProfile();
            if (response.success && response.profile) {
                setProfileData(response.profile);
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
                <div id="header-admin" className={headerClasses}>
                    <div className="container">
                        <div className="header-left">
                            <div className="nav-btn-wrap">
                                <a className="nav-btn-admin" id="sidebarCollapse" onClick={props.onClick}>
                                    <span className="fa fa-angle-left" />
                                </a>
                            </div>
                        </div>

                        <div className="header-right">
                            <ul className="header-widget-wrap">
                                <li className="header-widget dashboard-noti-dropdown">
                                    <NotificationBell userRole="employer" />
                                </li>

                                <li className="header-widget">
                                    <div className="dashboard-user-section">
                                        <div className="listing-user">
                                            <div className="">
                                                <span>
                                                    {profileData?.logo ? (
                                                        <img 
                                                            src={profileData.logo} 
                                                            alt="Company Logo" 
                                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <JobZImage src="images/user-avtar/pic4.jpg" alt="" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

        </>
    )
}

export default EmpHeaderSection;
