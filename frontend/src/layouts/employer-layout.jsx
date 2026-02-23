import EmpHeaderSection from "../app/pannels/employer/common/emp-header";
import UnifiedHeader from "../components/UnifiedHeader";
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
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 9998,
                            backdropFilter: 'blur(2px)'
                        }}
                    ></div>
                )}
                
                <EmpSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} onClose={() => setSidebarActive(false)} />

                <EmpHeaderSection sidebarActive={sidebarActive} onClick={handleMenuToggle} isMobile={isMobile} />
                <UnifiedHeader 
                    userRole="employer"
                    onMenuToggle={handleMenuToggle}
                    isSidebarOpen={sidebarActive}
                />

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
