
import YesNoPopup from "../app/common/popups/popup-yes-no";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import UnifiedHeader from "../components/UnifiedHeader";
import CanHeaderSection from "../app/pannels/candidate/common/can-header";
import CanSidebarSection from "../app/pannels/candidate/common/can-sidebar";
import CandidateRoutes from "../routing/candidate-routes";
import "../logout-modal-fix.css";
import "./candidate-mobile-header.css";
import "./candidate-mobile-app-shell.css";

function CandidateLayout() {

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
        "candidate-panel-layout",
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

                <UnifiedHeader 
                    userRole="candidate"
                    onMenuToggle={handleMenuToggle}
                    isSidebarOpen={sidebarActive}
                />
                <CanHeaderSection onClick={handleMenuToggle} sidebarActive={sidebarActive} isMobile={isMobile} />
                <CanSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} onLinkClick={isMobile ? closeSidebar : undefined} />

                <div id="content" className={contentClasses}>
                    <div className="content-admin-main">
                        <CandidateRoutes />
                    </div>
                </div>

                <YesNoPopup id="delete-dash-profile" type={popupType.DELETE} msg={"Do you want to delete your profile?"} />
                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Do you want to Logout your profile?"} />
                <YesNoPopup id="assessment-close-confirm" type={popupType.ASSESSMENT_CLOSE} msg={"Are you sure you want to close the assessment without submitting? Your assessment will be suspended."} onConfirm={() => { if (window.__assessmentCloseHandler) window.__assessmentCloseHandler(); }} />

            </div>
        </>
    )
}

export default CandidateLayout;
