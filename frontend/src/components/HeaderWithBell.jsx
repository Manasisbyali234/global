import React from 'react';
import { NavLink } from 'react-router-dom';
import BellIcon from './BellIcon';
import NotificationBell from './NotificationBell';

const HeaderWithBell = ({ userRole }) => {
  return (
    <header className="site-header">
      <div className="sticky-header main-bar-wraper navbar-expand-lg">
        <div className="main-bar">
          <div className="container-fluid clearfix">
            
            {/* Logo Section */}
            <div className="logo-header">
              <div className="logo-header-inner logo-header-one">
                <NavLink to="/">
                  <img src="/images/logo-dark.png" alt="Logo" />
                </NavLink>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="nav-animation header-nav navbar-collapse d-flex justify-content-center">
              <ul className="nav navbar-nav">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/jobs">Jobs</NavLink></li>
                <li><NavLink to="/employers">Employers</NavLink></li>
              </ul>
            </div>

            {/* Header Right Section with Bell Icons */}
            <div className="extra-nav header-2-nav">
              <div className="extra-cell">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem' 
                }}>
                  
                  {/* Simple Bell Icon with Sound */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Alert:</span>
                    <BellIcon size={18} color="#007bff" />
                  </div>

                  {/* Existing Notification Bell (with dropdown) */}
                  {userRole && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Notifications:</span>
                      <NotificationBell userRole={userRole} />
                    </div>
                  )}

                  {/* User Actions */}
                  <div className="header-nav-btn-section">
                    <NavLink 
                      className="btn btn-outline-primary"
                      to="/dashboard"
                    >
                      <i className="feather-user" /> Dashboard
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderWithBell;