
import YesNoPopup from "../app/common/popups/popup-yes-no";
import UnifiedHeader from "../components/UnifiedHeader";
import AdminSidebarSection from "../app/pannels/admin/common/admin-sidebar";

import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import AdminRoutes from "../routing/admin-routes";
import "./admin-mobile-header.css";

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

    const handleMenuToggle = () => {
        setSidebarActive(!sidebarActive);
    }

    const contentClasses = [
        !isMobile && !sidebarActive ? "sidebar-hidden" : "",
        isMobile ? "mobile-view" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="page-wraper">

                {isMobile && sidebarActive && (
                    <div 
                        className="sidebar-overlay active"
                        onClick={() => setSidebarActive(false)}
                    ></div>
                )}

                <UnifiedHeader 
                    userRole="admin"
                    onMenuToggle={handleMenuToggle}
                    isSidebarOpen={sidebarActive}
                />
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
