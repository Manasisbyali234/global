import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { publicUser } from '../globals/route-names';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onToggle, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Manage body scroll when menu is open (especially important for iPhone)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hamburger-open');
    } else {
      document.body.classList.remove('hamburger-open');
      setActiveSubmenu(null); // Reset submenus when main menu closes
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hamburger-open');
    };
  }, [isOpen]);

  const toggleSubmenu = (name) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  return (
    <>
      <button 
        className={`hamburger-btn ${isOpen ? 'active' : ''}`} 
        onClick={onToggle}
        data-testid="hamburger-menu-button"
        aria-label="Toggle navigation menu"
        type="button"
        style={{ cursor: 'pointer' }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && <div className="hamburger-overlay show" onClick={onClose} style={{ cursor: 'pointer' }}></div>}

      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-header">
          <img 
            src="/assets/images/logo-dark.png" 
            alt="Logo" 
            className="hamburger-logo"
          />
          <button 
            className="close-btn" 
            onClick={onClose}
          >✕</button>
        </div>

        <div className="hamburger-content">
          <ul className="menu-list">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/job-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Jobs
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/emp-grid" 
                className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} 
                onClick={onClose}
              >
                Companies
              </NavLink>
            </li>
          </ul>
        </div>

        {!isAuthenticated() && (
          <div className="auth-section">
            <div className={`auth-group-accordion ${activeSubmenu === 'signup' ? 'active' : ''}`}>
              <button 
                className="auth-accordion-trigger"
                onClick={() => toggleSubmenu('signup')}
              >
                <span>SIGN UP</span>
                <i className={`feather-chevron-down arrow-icon ${activeSubmenu === 'signup' ? 'rotate' : ''}`}></i>
              </button>
              <div className="auth-accordion-content">
                <div className="auth-links">
                  <NavLink to={publicUser.pages.SIGNUP_CANDIDATE} className="auth-link" onClick={onClose}>Candidate</NavLink>
                  <NavLink to={publicUser.pages.SIGNUP_EMPLOYER} className="auth-link" onClick={onClose}>Employer</NavLink>
                  <NavLink to={publicUser.pages.SIGNUP_PLACEMENT} className="auth-link" onClick={onClose}>Placement</NavLink>
                </div>
              </div>
            </div>

            <div className={`auth-group-accordion ${activeSubmenu === 'signin' ? 'active' : ''}`}>
              <button 
                className="auth-accordion-trigger"
                onClick={() => toggleSubmenu('signin')}
              >
                <span>LOGIN</span>
                <i className={`feather-chevron-down arrow-icon ${activeSubmenu === 'signin' ? 'rotate' : ''}`}></i>
              </button>
              <div className="auth-accordion-content">
                <div className="auth-links">
                  <NavLink to={publicUser.pages.LOGIN_CANDIDATE} className="auth-link" onClick={onClose}>Candidate</NavLink>
                  <NavLink to={publicUser.pages.LOGIN_EMPLOYER} className="auth-link" onClick={onClose}>Employer</NavLink>
                  <NavLink to={publicUser.pages.LOGIN_PLACEMENT} className="auth-link" onClick={onClose}>Placement</NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default HamburgerMenu;
