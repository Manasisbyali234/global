
import JobZImage from "../../../common/jobz-img";
import { Link, NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { admin, adminRoute, publicUser } from "../../../../globals/route-names";
import { useEffect, useState, useRef } from "react";
import "./admin-sidebar.css";

function AdminSidebarSection({ sidebarActive, isMobile }) {
    const location = useLocation();
    const currentpath = location.pathname;
    const currentSearch = location.search;
    const [userPermissions, setUserPermissions] = useState([]);
    const [isSubAdmin, setIsSubAdmin] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [hasNewEmployers, setHasNewEmployers] = useState(false);
    const [hasNewPlacements, setHasNewPlacements] = useState(false);
    const [hasNewTickets, setHasNewTickets] = useState(false);
    const employersLinkRef = useRef(null);
    const placementLinkRef = useRef(null);

    // Function to fetch and update sub-admin profile
    const fetchSubAdminProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const subAdminData = localStorage.getItem('subAdminData');
            
            if (!token || !subAdminData) return;
            
            const response = await fetch('http://localhost:5000/api/admin/sub-admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.subAdmin) {
                    // Update localStorage with fresh data
                    const currentData = JSON.parse(subAdminData);
                    const updatedData = {
                        ...currentData,
                        ...data.subAdmin,
                        permissions: data.subAdmin.permissions || currentData.permissions
                    };
                    
                    // Only update if data has changed
                    if (JSON.stringify(currentData) !== JSON.stringify(updatedData)) {
                        localStorage.setItem('subAdminData', JSON.stringify(updatedData));
                        setUserPermissions(updatedData.permissions || []);
                        console.log('Sub-admin profile updated');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching sub-admin profile:', error);
        }
    };

    // Check for new employers
    const checkNewEmployers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            
            const res = await fetch('http://localhost:5000/api/admin/employers?approvalStatus=pending&limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setHasNewEmployers(data.data?.length > 0);
            }
        } catch (error) {
            console.error('Error checking new employers:', error);
        }
    };

    // Check for new placements
    const checkNewPlacements = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            
            const res = await fetch('http://localhost:5000/api/admin/placements?status=pending&limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setHasNewPlacements(data.data?.length > 0);
            }
        } catch (error) {
            console.error('Error checking new placements:', error);
        }
    };

    // Check for new support tickets
    const checkNewTickets = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            
            const res = await fetch('http://localhost:5000/api/admin/support-tickets?status=new&limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setHasNewTickets(data.unreadCount > 0 || (data.tickets && data.tickets.some(t => !t.isRead)));
            }
        } catch (error) {
            console.error('Error checking new support tickets:', error);
        }
    };

    useEffect(() => {
        loadScript("js/custom.js");
        loadScript("js/admin-sidebar.js");
        checkNewEmployers();
        checkNewPlacements();
        checkNewTickets();

        const interval = setInterval(() => {
            checkNewEmployers();
            checkNewPlacements();
            checkNewTickets();
        }, 45000);

        // Add arrows after scripts load
        setTimeout(() => {
            if (!document.getElementById('arrowId') && window.jQuery) {
                window.jQuery(".sub-menu").parent('li').addClass('has-child');
                window.jQuery("<div id='arrowId' class='fa fa-angle-right submenu-toogle'></div>").insertAfter(".has-child > a");
            }
        }, 100);

        // Auto-open menus if current path matches submenu items
        const isEmployerPath = [
            adminRoute(admin.CAN_MANAGE),
            adminRoute(admin.CAN_APPROVE),
            adminRoute(admin.CAN_REJECT),
            adminRoute(admin.OVERVIEW)
        ].includes(currentpath);

        const isPlacementPath = [
            adminRoute(admin.PLACEMENT_MANAGE),
            adminRoute(admin.PLACEMENT_APPROVE),
            adminRoute(admin.PLACEMENT_REJECT),
            adminRoute(admin.PLACEMENT_BATCH_UPLOAD)
        ].includes(currentpath);

        setOpenMenus((prev) => ({
            ...prev,
            employers: isEmployerPath,
            placement: isPlacementPath
        }));

        let refreshInterval;

        // Check if user is sub-admin and get permissions
        const adminData = localStorage.getItem('adminData');
        const subAdminData = localStorage.getItem('subAdminData');

        if (subAdminData) {
            const subAdmin = JSON.parse(subAdminData);
            setUserPermissions(subAdmin.permissions || []);
            setIsSubAdmin(true);

            // Fetch fresh profile data immediately
            fetchSubAdminProfile();

            // Set up periodic refresh every 30 seconds
            refreshInterval = setInterval(fetchSubAdminProfile, 30000);
        } else if (adminData) {
            // Regular admin has all permissions
            setUserPermissions(['employers', 'placement_officers', 'registered_candidates']);
            setIsSubAdmin(false);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
            clearInterval(interval);
        };
    }, [currentpath, currentSearch])

    const hasPermission = (permission) => {
        return !isSubAdmin || userPermissions.includes(permission);
    };

    const isEmployersUnderReviewActive =
        currentpath === adminRoute(admin.CAN_MANAGE) &&
        String(new URLSearchParams(currentSearch).get('status') || '').toLowerCase() === 'under-review';
    const isEmployersAllSubmissionsActive =
        currentpath === adminRoute(admin.CAN_MANAGE) && !isEmployersUnderReviewActive;

    const sidebarClasses = [
        sidebarActive ? "active" : "",
        !isMobile && !sidebarActive ? "collapsed" : ""
    ].filter(Boolean).join(" ");

    const mobileStyles = isMobile ? {
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
    } : {};

    return (
        <>
            <nav id="sidebar-admin-wraper" className={sidebarClasses} style={mobileStyles}>
                <div className="page-logo">
                    <NavLink to={publicUser.INITIAL}><JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="" /></NavLink>
                </div>

                <div className={`admin-nav scrollbar-macosx ${(openMenus.employers || openMenus.placement) ? 'has-open-dropdown' : ''}`}>
                    <ul>
                        <li
                            className={setMenuActive(currentpath, adminRoute(admin.DASHBOARD))}>
                            <NavLink to={adminRoute(admin.DASHBOARD)}><i className="fa fa-home" /><span className="admin-nav-text">Dashboard</span></NavLink>
                        </li>

                        {hasPermission('employers') && (
                            <li>
                                <a ref={employersLinkRef} href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setOpenMenus(prev => ({...prev, employers: !prev.employers}));
                                    setTimeout(() => {
                                        const arrow = employersLinkRef.current?.nextElementSibling;
                                        if (arrow?.classList.contains('submenu-toogle')) {
                                            arrow.classList.toggle('rotate-down');
                                        }
                                    }, 0);
                                }}>
                                    <i className="fa fa-user-tie" />
                                    <span className="admin-nav-text">Employers</span>
                                </a>
                                <ul className={`sub-menu ${openMenus.employers ? 'open' : ''}`}>
                                    <li className={isEmployersAllSubmissionsActive ? 'active' : ''}>
                                        <Link
                                            to={adminRoute(admin.CAN_MANAGE)}
                                            id="allList"
                                            className={isEmployersAllSubmissionsActive ? 'active' : ''}
                                        >
                                            <span className="admin-nav-text">All Submissions</span>
                                            {hasNewEmployers && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#ff4444',
                                                    borderRadius: '50%',
                                                    marginLeft: '8px'
                                                }}></span>
                                            )}
                                        </Link>
                                    </li>
                                    <li className={isEmployersUnderReviewActive ? 'active' : ''}>
                                        <Link
                                            to={`${adminRoute(admin.CAN_MANAGE)}?status=under-review`}
                                            id="underReviewList"
                                            className={isEmployersUnderReviewActive ? 'active' : ''}
                                        >
                                            <span className="admin-nav-text">Under Review</span>
                                        </Link>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.CAN_APPROVE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.CAN_APPROVE)} id="approvedList">
                                            <span className="admin-nav-text">Approved</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.CAN_REJECT) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.CAN_REJECT)} id="rejectedList">
                                            <span className="admin-nav-text">Rejected</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.OVERVIEW) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.OVERVIEW)} id="overviewList">
                                            <span className="admin-nav-text">Overview</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        )}

                        {hasPermission('registered_candidates') && (
                            <li className={setMenuActive(currentpath, adminRoute(admin.REGISTERED_CANDIDATES))}>
                                <NavLink to={adminRoute(admin.REGISTERED_CANDIDATES)}>
                                    <i className="fa fa-users" />
                                    <span className="admin-nav-text">Registered Candidates</span>
                                </NavLink>
                            </li>
                        )}

                        {hasPermission('placement_officers') && (
                            <li>
                                <a ref={placementLinkRef} href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setOpenMenus(prev => ({...prev, placement: !prev.placement}));
                                    setTimeout(() => {
                                        const arrow = placementLinkRef.current?.nextElementSibling;
                                        if (arrow?.classList.contains('submenu-toogle')) {
                                            arrow.classList.toggle('rotate-down');
                                        }
                                    }, 0);
                                }}>
                                    <i className="fa fa-graduation-cap" />
                                    <span className="admin-nav-text">Placement Officers</span>
                                </a>
                                <ul className={`sub-menu ${openMenus.placement ? 'open' : ''}`}>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_MANAGE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_MANAGE)}>
                                            <span className="admin-nav-text">All Submissions</span>
                                            {hasNewPlacements && (
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
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_APPROVE) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_APPROVE)}>
                                            <span className="admin-nav-text">Approved</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_REJECT) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_REJECT)}>
                                            <span className="admin-nav-text">Rejected</span>
                                        </NavLink>
                                    </li>
                                    <li className={currentpath === adminRoute(admin.PLACEMENT_BATCH_UPLOAD) ? 'active' : ''}>
                                        <NavLink to={adminRoute(admin.PLACEMENT_BATCH_UPLOAD)}>
                                            <span className="admin-nav-text">Batch Uploads</span>
                                        </NavLink>
                                    </li>
                                    {!isSubAdmin && (
                                        <li>
                                            <NavLink to="/admin/placement-credits">
                                                <span className="admin-nav-text">Credits</span>
                                            </NavLink>
                                        </li>
                                    )}
                                </ul>
                            </li>
                        )}

                        <li className={setMenuActive(currentpath, adminRoute(admin.SUPPORT_TICKETS))}>
                            <NavLink to={adminRoute(admin.SUPPORT_TICKETS)}>
                                <i className="fa fa-headset" />
                                <span className="admin-nav-text">Support Tickets</span>
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

                        {hasPermission('transactions') && (
                            <li className={setMenuActive(currentpath, adminRoute(admin.TRANSACTIONS))}>
                                <NavLink to={adminRoute(admin.TRANSACTIONS)}>
                                    <i className="fa fa-receipt" />
                                    <span className="admin-nav-text">Transactions</span>
                                </NavLink>
                            </li>
                        )}

                        {!isSubAdmin && (
                            <li className={setMenuActive(currentpath, adminRoute(admin.SUB_ADMIN))}>
                                <NavLink to={adminRoute(admin.SUB_ADMIN)}>
                                    <i className="fa fa-user-shield" />
                                    <span className="admin-nav-text">Sub Admin</span>
                                </NavLink>
                            </li>
                        )}
    
                        <li>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile">
                                <i className="fa fa-share-square" />
                                <span className="admin-nav-text">Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    )
}

export default AdminSidebarSection;
