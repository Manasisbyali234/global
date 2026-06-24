// CANDIDATE DASHBOARD SIDEBAR (Legacy Reff)

import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { candidate, canRoute, publicUser } from "../../../../globals/route-names";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../../utils/api";
import "./can-sidebar.css";

function CanSidebarSection({ sidebarActive, isMobile, onLinkClick }) {
  const currentpath = useLocation().pathname;
  const [showTransactions, setShowTransactions] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchSidebarMeta = async () => {
      try {
        const token = localStorage.getItem('candidateToken');
        if (!token) {
          setUnreadNotifications(0);
          return;
        }

        const [statsResponse, notificationResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/candidate/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${BACKEND_URL}/api/notifications/candidate?page=1&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          if (data.success && data.candidate) {
            const credits = Number(data.candidate?.credits ?? 0);
            setShowTransactions(credits === 0);
          }
        }

        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();
          if (notificationData.success) {
            setUnreadNotifications(Number(notificationData.unreadCount ?? 0));
          }
        }
      } catch (error) {
        console.error('Error loading candidate sidebar details:', error);
      }
    };

    fetchSidebarMeta();

    const handleRefresh = () => {
      fetchSidebarMeta();
    };

    window.addEventListener('refreshNotifications', handleRefresh);

    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  useEffect(() => {
    loadScript("js/custom.js");
    loadScript("js/can-sidebar.js");
  });

  const sidebarClasses = [
    sidebarActive ? "active" : "",
    !isMobile && !sidebarActive ? "collapsed" : ""
  ].filter(Boolean).join(" ");

  return (
    <>
      <nav id="sidebar-admin-wraper" className={sidebarClasses}>
        <div className="page-logo">
          <NavLink to={publicUser.INITIAL}>
            <JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="logo" />
          </NavLink>
        </div>
        <div className="admin-nav scrollbar-macosx">
          <ul>
            <li className={setMenuActive(currentpath, canRoute(candidate.DASHBOARD))}>
              <NavLink to={canRoute(candidate.DASHBOARD)} onClick={handleLinkClick}>
                <i className="fa fa-home" />
                <span className="admin-nav-text">Dashboard</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.NOTIFICATIONS))}>
              <NavLink to={canRoute(candidate.NOTIFICATIONS)} onClick={handleLinkClick}>
                <i className="fa fa-bell" />
                <span className="admin-nav-text">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="admin-nav-badge">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.PROFILE))}>
              <NavLink to={canRoute(candidate.PROFILE)} onClick={handleLinkClick}>
                <i className="fa fa-user-tie" />
                <span className="admin-nav-text">My Profile</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.STATUS))}>
              <NavLink to={canRoute(candidate.STATUS)} onClick={handleLinkClick}>
                <i className="fa fa-folder-open" />
                <span className="admin-nav-text">My Applications</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.INTERVIEWS))}>
              <NavLink to={canRoute(candidate.INTERVIEWS)} onClick={handleLinkClick}>
                <i className="fa fa-calendar" />
                <span className="admin-nav-text">My interview</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.RESUME))}>
              <NavLink to={canRoute(candidate.RESUME)} onClick={handleLinkClick}>
                <i className="fa fa-user-friends" />
                <span className="admin-nav-text">My Resume</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.SUPPORT))}>
              <NavLink to={canRoute(candidate.SUPPORT)} onClick={handleLinkClick}>
                <i className="fa fa-headset" />
                <span className="admin-nav-text">Support</span>
              </NavLink>
            </li>
            {showTransactions && (
              <li className={setMenuActive(currentpath, canRoute(candidate.TRANSACTIONS))}>
                <NavLink to={canRoute(candidate.TRANSACTIONS)} onClick={handleLinkClick}>
                  <i className="fa fa-receipt" />
                  <span className="admin-nav-text">Transactions</span>
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
  );
}

export default CanSidebarSection;


