import React, { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import JobZImage from '../app/common/jobz-img';
import './UnifiedHeader.css';

function UnifiedHeader({ userRole, userData, onMenuToggle, isSidebarOpen }) {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (userData) {
            setProfileData(userData);
        } else {
            loadUserData();
        }
    }, [userData, userRole]);

    const loadUserData = () => {
        const storageKey = `${userRole}User`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                setProfileData(JSON.parse(stored));
            } catch (e) {
                setProfileData({ name: userRole.charAt(0).toUpperCase() + userRole.slice(1) });
            }
        }
    };

    const getProfileImage = () => {
        if (userRole === 'placement' && profileData?.logo) {
            return profileData.logo.startsWith('data:') 
                ? profileData.logo 
                : `data:image/jpeg;base64,${profileData.logo}`;
        }
        if (profileData?.profileImage) return profileData.profileImage;
        return null;
    };

    const getUserName = () => {
        return profileData?.name || profileData?.firstName || userRole.charAt(0).toUpperCase() + userRole.slice(1);
    };

    return (
        <header className="unified-header">
            <div className="unified-header-container">
                {/* Mobile Menu Toggle */}
                <button 
                    className="unified-menu-toggle" 
                    onClick={onMenuToggle}
                    aria-label="Toggle Menu"
                >
                    <i className={`fa ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                {/* Logo - Only on mobile */}
                <div className="unified-header-logo">
                    <JobZImage 
                        id="unified_header_logo" 
                        src="images/skins-logo/logo-skin-8.gif" 
                        alt="Logo" 
                    />
                </div>

                {/* Right Side Actions */}
                <div className="unified-header-actions">
                    {/* Notification Bell */}
                    <div className="unified-header-notification">
                        <NotificationBell userRole={userRole} />
                    </div>

                    {/* User Profile */}
                    <div className="unified-header-profile">
                        <div className="unified-profile-avatar">
                            {getProfileImage() ? (
                                <img src={getProfileImage()} alt="Profile" />
                            ) : (
                                <i className="fa fa-user"></i>
                            )}
                        </div>
                        <span className="unified-profile-name">{getUserName()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default UnifiedHeader;
