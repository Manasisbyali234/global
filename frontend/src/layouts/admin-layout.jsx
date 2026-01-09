
import YesNoPopup from "../app/common/popups/popup-yes-no";
import AdminHeaderSection from "../app/pannels/admin/common/admin-header";
import AdminSidebarSection from "../app/pannels/admin/common/admin-sidebar";

import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import AdminRoutes from "../routing/admin-routes";

function AdminLayout() {

    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 991);
            if (window.innerWidth <= 991) {
                setSidebarActive(false);
            } else {
                setSidebarActive(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSidebarCollapse = () => {
        setSidebarActive(!sidebarActive);
    }

    const handleMobileMenuToggle = () => {
        setSidebarActive(!sidebarActive);
    }

    const handleOverlayClick = () => {
        if (isMobile) {
            setSidebarActive(false);
        }
    }

    const contentClasses = [
        !isMobile && !sidebarActive ? "sidebar-hidden" : "",
        isMobile ? "mobile-view" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="page-wraper">

                {isMobile && !sidebarActive && (
                    <button 
                        className="mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle Menu"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                )}

                {isMobile && sidebarActive && (
                    <div 
                        className="sidebar-overlay active"
                        onClick={handleOverlayClick}
                    ></div>
                )}

                <AdminHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} isMobile={isMobile} />
                <AdminSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} />

                <div id="content" className={contentClasses}>
                    <div className="content-admin-main">
                        <AdminRoutes />
                    </div>
                </div>

                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Are you sure you want to logout?"} />
            </div>
        </>
    )
}

export default AdminLayout;
