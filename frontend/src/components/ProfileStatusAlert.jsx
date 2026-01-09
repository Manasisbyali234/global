import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ProfileStatusAlert = () => {
    const [profileStatus, setProfileStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileStatus();
    }, []);

    const fetchProfileStatus = async () => {
        try {
            const response = await api.getEmployerProfile();
            if (response.success) {
                setProfileStatus({
                    isProfileComplete: response.isProfileComplete,
                    isApproved: response.isApproved,
                    profileSubmittedForReview: response.profileSubmittedForReview,
                    message: response.message
                });
            }
        } catch (error) {
            console.error('Error fetching profile status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !profileStatus) return null;

    const getAlertClass = () => {
        if (profileStatus.isApproved) return 'alert-success';
        if (profileStatus.profileSubmittedForReview) return 'alert-info';
        return 'alert-warning';
    };

    const getIcon = () => {
        if (profileStatus.isApproved) return 'fa-check-circle';
        if (profileStatus.profileSubmittedForReview) return 'fa-clock';
        return 'fa-exclamation-triangle';
    };

    return (
        <div className={`alert ${getAlertClass()} mb-3`} style={{ fontSize: '14px' }}>
            <i className={`fas ${getIcon()} me-2`}></i>
            <strong>Profile Status:</strong> {profileStatus.message}
        </div>
    );
};

export default ProfileStatusAlert;