
import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { employer, empRoute, publicUser } from "../../../../globals/route-names";
import { useEffect, useState } from "react";
import { api } from "../../../../utils/api";

function EmpSidebarSection({ sidebarActive, isMobile, onClose }) {
    const currentpath = useLocation().pathname;
    const [hasNewTickets, setHasNewTickets] = useState(false);

    const checkNewTickets = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) return;
            
            const data = await api.getEmployerSupportTickets({ status: 'new', limit: 1 });
            
            if (data.success) {
                setHasNewTickets(data.unreadCount > 0 || (data.tickets && data.tickets.some(t => !t.isRead)));
            }
        } catch (error) {
            console.error('Error checking new support tickets:', error);
        }
    };

    useEffect(() => {
        loadScript("js/custom.js");
        loadScript("js/emp-sidebar.js");
        checkNewTickets();

        const interval = setInterval(() => {
            checkNewTickets();
        }, 45000);

        return () => clearInterval(interval);
    }, []);

    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    const sidebarClasses = [
        sidebarActive ? "active" : "",
        !isMobile && !sidebarActive ? "collapsed" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <nav 
                id="sidebar-admin-wraper" 
                className={sidebarClasses}
                style={isMobile ? {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "280px",
                    transform: sidebarActive ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                    boxShadow: sidebarActive ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
                    zIndex: 10000,
                    background: "#ffffff",
                    height: "100vh",
                    overflowY: "auto"
                } : {}}>
                <div className="page-logo">
                    <NavLink to={publicUser.INITIAL}><JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="" /></NavLink>
                </div>

                <div className="admin-nav scrollbar-macosx">
                    <ul>
                        <li
                            className={setMenuActive(currentpath, empRoute(employer.DASHBOARD))}>
                            <NavLink to={empRoute(employer.DASHBOARD)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-home" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Dashboard</span></NavLink>
                        </li>

                        <li
                            className={setMenuActive(currentpath, empRoute(employer.PROFILE))}>
                            <NavLink to={empRoute(employer.PROFILE)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-user-tie" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Company Profile</span></NavLink>
                        </li>

                        <li
                            className={setMenuActive(currentpath, empRoute(employer.POST_A_JOB))}>
                            <NavLink to={empRoute(employer.POST_A_JOB)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-plus-circle" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Post Job</span></NavLink>
                        </li>

                        <li
                            className={setMenuActive(currentpath, empRoute(employer.MANAGE_JOBS))}>
                            <NavLink to={empRoute(employer.MANAGE_JOBS)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-suitcase" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Manage Interview</span></NavLink>
                        </li>

                        <li className={setMenuActive(currentpath, empRoute(employer.CREATE_ASSESSMENT))}>
                            <NavLink to={empRoute(employer.CREATE_ASSESSMENT)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-clipboard-check" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Assessments</span></NavLink>
                        </li>

                        <li className={setMenuActive(currentpath, empRoute(employer.CANDIDATES))}>
                            <NavLink to={empRoute(employer.CANDIDATES)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-user-friends" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '15px'}}>Applicants</span></NavLink>
                        </li>

                        <li className={setMenuActive(currentpath, empRoute(employer.SUPPORT_TICKETS))}>
                            <NavLink to={empRoute(employer.SUPPORT_TICKETS)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}>
                                <i className="fa fa-ticket-alt" style={{minWidth: '30px', textAlign: 'center'}} />
                                <span className="admin-nav-text" style={{paddingLeft: '10px'}}>Candidate Tickets</span>
                                {hasNewTickets && (
                                    <span style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#ff4444',
                                        borderRadius: '50%',
                                        marginLeft: '8px'
                                    }}></span>
                                )}
                            </NavLink>
                        </li>

                        <li className={setMenuActive(currentpath, empRoute(employer.SUPPORT))}>
                            <NavLink to={empRoute(employer.SUPPORT)} onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}><i className="fa fa-headset" style={{minWidth: '30px', textAlign: 'center'}} /><span className="admin-nav-text" style={{paddingLeft: '10px'}}>Support</span></NavLink>
                        </li>
                        
                        <li>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile" onClick={handleLinkClick} style={{display: 'flex', alignItems: 'center'}}>
                                <i className="fa fa-share-square" style={{minWidth: '30px', textAlign: 'center'}} />
                                <span className="admin-nav-text" style={{paddingLeft: '10px'}}>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}

export default EmpSidebarSection;
