import {
    MapPin
} from 'lucide-react';
import { useEffect, useState } from 'react';
import CountUp from "react-countup";
import { api } from '../../../../utils/api';
import './emp-dashboard.css';


function EmpDashboardPage() {
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        shortlisted: 0
    });
    const [employer, setEmployer] = useState({ companyName: 'Company', logo: null });
    const [profileCompletion, setProfileCompletion] = useState({ 
        completion: 0, 
        missingFields: [], 
        message: 'Loading...', 
        isProfileComplete: false, 
        canPostJobs: false 
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 767);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsData, profileData, completionData, activityData, notificationData] = await Promise.all([
                api.getEmployerDashboard(),
                api.getEmployerProfile(),
                api.getEmployerProfileCompletion(),
                api.getRecentEmployerActivity(),
                api.getEmployerNotifications()
            ]);

            if (statsData.success) {
                setStats({
                    totalJobs: statsData.stats.totalJobs || 0,
                    activeJobs: statsData.stats.activeJobs || 0,
                    totalApplications: statsData.stats.totalApplications || 0,
                    shortlisted: statsData.stats.shortlisted || 0
                });
            }

            if (profileData.success) {
                setEmployer({
                    companyName: profileData.profile?.companyName || 'Company',
                    logo: profileData.profile?.logo || null
                });
            }

            if (completionData.success) {
                setProfileCompletion({
                    completion: completionData.completion || 0,
                    missingFields: completionData.missingFields || [],
                    message: completionData.message || '',
                    isProfileComplete: completionData.isProfileComplete || false,
                    canPostJobs: completionData.canPostJobs || false
                });
            } else {
                setProfileCompletion({
                    completion: 0,
                    missingFields: ['Unable to load profile data'],
                    message: 'Error loading profile completion status'
                });
            }

            if (activityData.success) {
                setRecentActivity(activityData.activities || []);
            }

            if (notificationData.success) {
                setNotifications(notificationData.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setProfileCompletion(prev => ({
                ...prev,
                message: 'Failed to load profile completion status'
            }));
        }
    };

    return (
        <>
            <div className="twm-right-section-panel site-bg-gray emp-dashboard" style={{
                width: '100%',
                margin: 0,
                padding: 0,
                background: '#f7f7f7',
                minHeight: '100vh'
            }}>
                {/* Header */}
                <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
                <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: isMobile ? '1rem' : '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0' }}>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                            <div style={{
                                width: isMobile ? '60px' : '80px',
                                height: isMobile ? '60px' : '80px',
                                borderRadius: '50%',
                                background: employer.logo ? `url("${employer.logo}") center/cover` : '#f97316',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: isMobile ? '1.25rem' : '1.5rem',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                border: '3px solid #fff',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                                {!employer.logo && (employer.companyName ? employer.companyName.charAt(0).toUpperCase() : 'C')}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0', wordBreak: 'break-word' }}>Welcome, {employer.companyName}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <MapPin size={isMobile ? 14 : 16} style={{ color: '#f97316', flexShrink: 0 }} />
                                    <span style={{ color: '#f97316', fontSize: isMobile ? '0.75rem' : '0.875rem', fontWeight: '500' }}>Bangalore</span>
                                </div>
                                <p style={{ color: '#6b7280', margin: 0, fontSize: isMobile ? '0.813rem' : '0.875rem' }}>Here's an overview of your job postings and applications</p>
                            </div>
                        </div>

                    </div>
                </div>
                </div>

                {/* Stats Cards */}
                <div style={{ padding: isMobile ? '1rem' : '0 2rem 2rem 2rem' }}>
                    <div className="row" style={{ marginBottom: '2rem' }}>
                        <div className="col-xl-4 col-lg-4 col-md-12 mb-3">
                            <div className="panel panel-default" onClick={() => window.location.href = '/employer/manage-jobs'} style={{ cursor: 'pointer' }}>
                                <div className="panel-body wt-panel-body dashboard-card-2" style={{ backgroundColor: '#e0f7fa' }}>
                                    <div className="d-flex align-items-center" style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div className="wt-card-icon-2 me-3 fs-2 text-info" style={{ lineHeight: "1" }}>
                                            <i className="flaticon-resume" />
                                        </div>
                                        <div>
                                            <div className="counter fw-bold fs-4 text-info">
                                                <CountUp end={stats.activeJobs} duration={2} />
                                            </div>
                                            <h5 className="mb-0 mt-1">Active Jobs</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-lg-4 col-md-12 mb-3">
                            <div className="panel panel-default" onClick={() => window.location.href = '/employer/candidates-list'} style={{ cursor: 'pointer' }}>
                                <div className="panel-body wt-panel-body dashboard-card-2" style={{ backgroundColor: '#fff3e0' }}>
                                    <div className="d-flex align-items-center" style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div className="wt-card-icon-2 me-3 fs-2 text-warning" style={{ lineHeight: "1" }}>
                                            <i className="flaticon-envelope" />
                                        </div>
                                        <div>
                                            <div className="counter fw-bold fs-4 text-warning">
                                                <CountUp end={stats.totalApplications} duration={2} />
                                            </div>
                                            <h5 className="mb-0 mt-1">Applications</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4 col-lg-4 col-md-12 mb-3">
                            <div className="panel panel-default" onClick={() => window.location.href = '/employer/candidates-list'} style={{ cursor: 'pointer' }}>
                                <div className="panel-body wt-panel-body dashboard-card-2" style={{ backgroundColor: '#fff3e0' }}>
                                    <div className="d-flex align-items-center" style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div className="wt-card-icon-2 me-3 fs-2 text-warning" style={{ lineHeight: "1" }}>
                                            ✓
                                        </div>
                                        <div>
                                            <div className="counter fw-bold fs-4 text-warning">
                                                <CountUp end={stats.shortlisted} duration={2} />
                                            </div>
                                            <h5 className="mb-0 mt-1">Shortlisted</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Completion and Recent Activity */}
                    <div className="row" style={{ marginTop: '-1rem' }}>
                        {/* Profile Completion Section */}
                        <div className="col-xl-8 col-lg-8 col-md-12 mb-2">
                            <div style={{
                                background: 'white',
                                borderRadius: '0.75rem',
                                border: '1px solid #e5e7eb',
                                padding: isMobile ? '1.5rem' : '2rem',
                                height: '100%'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Complete Your Company Profile</h2>
                                        <p style={{ color: '#6b7280', margin: 0 }}>A complete profile attracts more qualified candidates</p>
                                    </div>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: isMobile ? 'center' : 'flex-start', 
                                    gap: isMobile ? '1.5rem' : '2rem', 
                                    flexDirection: isMobile ? 'column' : 'row', 
                                    textAlign: isMobile ? 'center' : 'left' 
                                }}>
                                    {/* Circular Progress */}
                                    <div style={{ position: 'relative', width: '8rem', height: '8rem' }}>
                                        <svg style={{ width: '8rem', height: '8rem', transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                stroke="#f3f4f6"
                                                strokeWidth="8"
                                                fill="none"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                stroke="#f97316"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${profileCompletion.completion * 3.14159} ${100 * 3.14159}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div style={{
                                            position: 'absolute',
                                            inset: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{profileCompletion.completion}%</p>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Complete</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: '1' }}>
                                        <p style={{ color: '#374151', marginBottom: '1rem' }}>
                                            You are <span style={{ fontWeight: '600' }}>{profileCompletion.completion}% done</span>. Complete the remaining fields to improve your company visibility.
                                        </p>
                                        
                                        {/* Show missing fields if any */}
                                        {profileCompletion.missingFields && profileCompletion.missingFields.length > 0 && (
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <p style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                                    Missing required fields:
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {profileCompletion.missingFields.map((field, index) => (
                                                        <span 
                                                            key={index}
                                                            style={{
                                                                background: '#fef2f2',
                                                                color: '#dc2626',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '0.375rem',
                                                                fontSize: '0.75rem',
                                                                border: '1px solid #fecaca'
                                                            }}
                                                        >
                                                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show profile completion message */}
                                        <div style={{ 
                                            marginBottom: '1.5rem',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            background: profileCompletion.completion === 100 ? '#f0f9ff' : '#fef3c7',
                                            border: `1px solid ${profileCompletion.completion === 100 ? '#bae6fd' : '#fde68a'}`,
                                            color: profileCompletion.completion === 100 ? '#0369a1' : '#92400e'
                                        }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                                {profileCompletion.completion === 100 
                                                    ? "Thank you for completing your profile!" 
                                                    : "Kindly complete your profile and wait for the admin's approval."}
                                            </p>
                                        </div>
                                        
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '1rem', 
                                            marginBottom: '1.5rem',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            width: isMobile ? '100%' : 'auto'
                                        }}>
                                            <button 
                                                onClick={() => window.location.href = '/employer/profile'}
                                                style={{
                                                    background: '#f97316',
                                                    color: 'white',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: 'none',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    width: isMobile ? '100%' : 'auto',
                                                    minHeight: '44px'
                                                }}
                                            >
                                                Complete Profile
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const token = localStorage.getItem('employerToken');
                                                    if (token) {
                                                        const payload = JSON.parse(atob(token.split('.')[1]));
                                                        window.open(`/emp-detail/${payload.id}`, '_blank');
                                                    }
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    color: '#6b7280',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #d1d5db',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    width: isMobile ? '100%' : 'auto',
                                                    minHeight: '44px'
                                                }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Section */}
                        <div className="col-xl-4 col-lg-4 col-md-12 mb-4">
                            <div style={{
                                background: 'white',
                                borderRadius: '0.75rem',
                                border: '1px solid #e5e7eb',
                                padding: isMobile ? '1rem' : '1.5rem',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Notifications</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1' }}>
                                    {notifications.length > 0 ? notifications.slice(0, 5).map((notification, index) => {
                                        const isDocumentNotification = notification.type === 'document_approved' || notification.type === 'document_rejected';
                                        const isApproved = notification.type === 'document_approved' || notification.title?.includes('Approved');
                                        const isRejected = notification.type === 'document_rejected' || notification.title?.includes('Rejected');
                                        
                                        return (
                                            <div key={index} onMouseEnter={() => setHoveredId(notification._id)} onMouseLeave={() => setHoveredId(null)} style={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '0.75rem', 
                                                padding: '0.75rem', 
                                                background: notification.isRead ? '#f9fafb' : (isRejected ? '#fef2f2' : (isApproved ? '#f0fdf4' : '#fef3c7')), 
                                                borderRadius: '0.5rem', 
                                                position: 'relative',
                                                borderLeft: `3px solid ${isRejected ? '#ef4444' : (isApproved ? '#22c55e' : '#f59e0b')}`
                                            }}>
                                                <div style={{ 
                                                    width: '2rem', 
                                                    height: '2rem', 
                                                    background: isApproved ? '#dcfce7' : (isRejected ? '#fecaca' : '#fef3c7'), 
                                                    borderRadius: '50%', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    flexShrink: 0 
                                                }}>
                                                    <span style={{ fontSize: '1rem' }}>
                                                        {isApproved ? '✅' : (isRejected ? '❌' : '📄')}
                                                    </span>
                                                </div>
                                                <div style={{ flex: '1', minWidth: 0 }}>
                                                    <p style={{ 
                                                        fontSize: '0.875rem', 
                                                        fontWeight: '600', 
                                                        color: '#111827', 
                                                        margin: '0 0 0.25rem 0',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {notification.title}
                                                    </p>
                                                    <p style={{ 
                                                        fontSize: '0.75rem', 
                                                        color: '#6b7280', 
                                                        margin: '0 0 0.25rem 0',
                                                        lineHeight: '1.4',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {notification.message.length > 100 ? 
                                                            `${notification.message.substring(0, 100)}...` : 
                                                            notification.message
                                                        }
                                                    </p>
                                                    <p style={{ 
                                                        fontSize: '0.75rem', 
                                                        color: '#9ca3af', 
                                                        margin: 0,
                                                        fontStyle: 'italic'
                                                    }}>
                                                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {hoveredId === notification._id && (
                                                    <button onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem('employerToken');
                                                            await fetch(`http://localhost:5000/api/notifications/${notification._id}/dismiss`, {
                                                                method: 'PUT',
                                                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                                                            });
                                                            setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                                        } catch (error) {}
                                                    }} style={{ 
                                                        background: '#fed7aa', 
                                                        border: 'none', 
                                                        color: 'black', 
                                                        fontSize: '10px', 
                                                        cursor: 'pointer', 
                                                        borderRadius: '2px', 
                                                        padding: '2px', 
                                                        width: '18px', 
                                                        height: '18px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        flexShrink: 0 
                                                    }}>
                                                        <i className="fa fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                            <p>No notifications</p>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => window.location.href = '/employer/manage-jobs'}
                                    style={{
                                        width: '100%',
                                        marginTop: 'auto',
                                        padding: '0.5rem',
                                        background: 'transparent',
                                        color: '#f97316',
                                        border: '1px solid #f97316',
                                        borderRadius: '0.5rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </>
    )
}

export default EmpDashboardPage;
