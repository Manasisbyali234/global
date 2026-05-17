import UnifiedHeader from "../components/UnifiedHeader";
import EmpHeaderSection from "../app/pannels/employer/common/emp-header";
import EmpSidebarSection from "../app/pannels/employer/common/emp-sidebar";
import YesNoPopup from "../app/common/popups/popup-yes-no";
import EmployerRoutes from "../routing/employer-routes";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import "./employer-mobile-header.css";

function EmployerLayout() {
    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 991;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarActive(false);
            } else {
                setSidebarActive(true);
                document.body.classList.remove('sidebar-open');
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.classList.remove('sidebar-open');
        };
    }, []);

    useEffect(() => {
        if (isMobile && sidebarActive) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
    }, [isMobile, sidebarActive]);

    const handleMenuToggle = () => {
        setSidebarActive((current) => !current);
    }

    const closeSidebar = () => {
        setSidebarActive(false);
    }

    const contentClasses = [
        "employer-panel-layout",
        !isMobile && !sidebarActive ? "sidebar-hidden" : "",
        isMobile ? "mobile-view" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="page-wraper">
                {isMobile && (
                    <div
                        className={`sidebar-overlay ${sidebarActive ? "active" : ""}`}
                        onClick={closeSidebar}
                    ></div>
                )}

                <EmpSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} onClose={closeSidebar} />

                <UnifiedHeader 
                    userRole="employer"
                    onMenuToggle={handleMenuToggle}
                    isSidebarOpen={sidebarActive}
                />
                <EmpHeaderSection onClick={handleMenuToggle} sidebarActive={sidebarActive} isMobile={isMobile} />

                <div id="content" className={contentClasses}>
                    <div className="content-admin-main" style={{
                        width: '100%',
                        minHeight: '100vh',
                        padding: '0',
                        background: '#f7f7f7'
                    }}>
                        <EmployerRoutes />
                    </div>
                </div>

                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Are you sure you want to logout?"} />
            </div>
        </>
    )
}

export default EmployerLayout;
