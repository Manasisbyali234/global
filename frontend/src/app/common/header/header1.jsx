
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { memo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import HamburgerMenu from "../../../components/HamburgerMenu";
import { useHamburgerMenu } from "../../../components/useHamburgerMenu";
import "../../../header-responsive.css";

const Header1 = memo(function Header1({ _config }) {
    const { user, userType, isAuthenticated } = useAuth();
    const { isOpen: menuActive, toggle: toggleMenu, close: closeMenu } = useHamburgerMenu();

    const getDashboardRoute = () => {
        switch (userType) {
            case 'employer':
                return '/employer/dashboard';
            case 'candidate':
                return '/candidate/dashboard';
            case 'placement':
                return '/placement/dashboard';
            case 'admin':
                return '/admin/dashboard';
            case 'sub-admin':
                return '/sub-admin/dashboard';
            default:
                return '/';
        }
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        
        switch (userType) {
            case 'employer':
                return user.companyName || user.name || 'Dashboard';
            case 'candidate':
                return user.name || user.username || 'Profile';
            case 'placement':
                return user.name || 'Profile';
            case 'admin':
                return user.name || 'Admin';
            case 'sub-admin':
                return user.name || 'SubAdmin';
            default:
                return 'User';
        }
    };

    return (
        <>
            <header className={"site-header " + _config.style + " " + (menuActive ? "active" : "") + (isAuthenticated() ? " authenticated-user" : "") }>
                <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid clearfix">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <NavLink to={publicUser.INITIAL}>
                                        {
                                            _config.withBlackLogo
                                                ?
                                                <JobZImage src="images/skins-logo/logo-skin-8.png" alt="" />
                                                :
                                                (
                                                    _config.withWhiteLogo
                                                        ?
                                                        <JobZImage src="images/skins-logo/logo-skin-8.png" alt="" />
                                                        :
                                                        (
                                                            _config.withLightLogo ?
                                                                <>
                                                                    <JobZImage id="skin_header_logo_light" src="images/logo-light-3.png" alt="" className="default-scroll-show" />
                                                                    <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" className="on-scroll-show" />
                                                                </> :
                                                                <JobZImage id="skin_header_logo" src="images/skins-logo/logo-skin-8.png" alt="" />
                                                        )
                                                )
                                        }
                                    </NavLink>
                                </div>
                            </div>
                            {/* MAIN Nav */}
                            <div className="nav-animation header-nav navbar-collapse d-flex justify-content-center">
                                <ul className="nav navbar-nav">
                                    <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
                                    <li><NavLink to="/job-grid" className={({ isActive }) => isActive ? 'active' : ''}>Jobs</NavLink></li>
                                    <li><NavLink to="/emp-grid" className={({ isActive }) => isActive ? 'active' : ''}>Companies</NavLink></li>
                                </ul>
                            </div>

                            {/* Header Right Section*/}
                            <div className="extra-nav header-2-nav">
                                <div className="extra-cell">
                                    {isAuthenticated() ? (
                                        <div className="employer-nav-menu">
                                            <div className="dashboard-link">
                                                <NavLink
                                                    className="btn btn-outline-primary"
                                                    to={getDashboardRoute()}
                                                >
                                                    <i className="feather-user" /> <span className="user-name-text">{getUserDisplayName()}</span>
                                                </NavLink>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="header-nav-btn-section">
                                            <div className="twm-nav-btn-left">
                                                <a className="twm-nav-sign-up" data-bs-toggle="modal" href="#sign_up_popup" role="button">
                                                    <i className="feather-log-in" /> Sign Up
                                                </a>
                                            </div>
                                            <div className="twm-nav-btn-right">
                                                <a className="twm-nav-post-a-job" data-bs-toggle="modal" href="#sign_up_popup2" role="button">
                                                    <i className="feather-log-in" /> Sign In
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="extra-cell">
                                    <HamburgerMenu 
                                        isOpen={menuActive}
                                        onToggle={toggleMenu}
                                        onClose={closeMenu}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SITE Search */}
                    <div id="search">
                        <span className="close" />
                        <form role="search" id="searchform" action="/search" method="get" className="radius-xl">
                            <input className="form-control" name="q" type="search" placeholder="Type to search" />
                            <span className="input-group-append">
                                <button type="button" className="search-btn">
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </span>
                        </form>
                    </div>
                </div>


            </header>

        </>
    )
});

export default Header1;
