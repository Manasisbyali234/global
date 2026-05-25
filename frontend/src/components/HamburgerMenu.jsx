import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { publicUser } from '../globals/route-names';
import './HamburgerMenu.css';

const MENU_TRANSITION_MS = 300;
const MENU_ICON = '\u2630';
const CLOSE_ICON = '\u2715';

const HamburgerMenu = ({ isOpen, onToggle, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(isOpen);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hamburger-open');
    } else {
      document.body.classList.remove('hamburger-open');
      setActiveSubmenu(null);
    }

    return () => {
      document.body.classList.remove('hamburger-open');
    };
  }, [isOpen]);

  useEffect(() => {
    let animationFrameId1 = 0;
    let animationFrameId2 = 0;
    let timeoutId = 0;

    if (isOpen) {
      setShouldRenderMenu(true);

      if (typeof window !== 'undefined') {
        animationFrameId1 = window.requestAnimationFrame(() => {
          animationFrameId2 = window.requestAnimationFrame(() => {
            setIsMenuVisible(true);
          });
        });
      } else {
        setIsMenuVisible(true);
      }
    } else {
      setIsMenuVisible(false);

      if (typeof window !== 'undefined') {
        timeoutId = window.setTimeout(() => {
          setShouldRenderMenu(false);
        }, MENU_TRANSITION_MS);
      } else {
        setShouldRenderMenu(false);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        if (animationFrameId1) {
          window.cancelAnimationFrame(animationFrameId1);
        }
        if (animationFrameId2) {
          window.cancelAnimationFrame(animationFrameId2);
        }
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      }
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
        {isOpen ? CLOSE_ICON : MENU_ICON}
      </button>

      {shouldRenderMenu && (
        <div
          className={`hamburger-overlay${isMenuVisible ? ' show' : ''}`}
          onClick={onClose}
          style={{ cursor: 'pointer' }}
        />
      )}

      {shouldRenderMenu && (
        <nav className={`hamburger-menu ${isMenuVisible ? 'open' : ''}`}>
          <div className="hamburger-header">
            <img
              src="/assets/images/logo-dark.png"
              alt="Logo"
              className="hamburger-logo"
            />
            <button className="close-btn" onClick={onClose} type="button">
              {CLOSE_ICON}
            </button>
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
                  type="button"
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
                  type="button"
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
      )}
    </>
  );
};

export default HamburgerMenu;
