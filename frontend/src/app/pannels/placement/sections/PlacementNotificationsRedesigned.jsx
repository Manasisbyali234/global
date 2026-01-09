import { useEffect, useState } from 'react';

function PlacementNotificationsRedesigned() {
    const [notifications, setNotifications] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refreshNotifications', handleRefresh);
        return () => window.removeEventListener('refreshNotifications', handleRefresh);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('placementToken');
            if (!token) return;

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    // Dispatch event to update bell
                    const event = new CustomEvent('notificationsUpdated', { 
                        detail: { count: (data.notifications || []).length } 
                    });
                    window.dispatchEvent(event);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };



    const dismissNotification = async (id) => {
        try {
            const token = localStorage.getItem('placementToken');
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await fetch(`${API_BASE_URL}/notifications/${id}/dismiss`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            setNotifications(prev => prev.filter(n => n._id !== id));
        }
    };

    const getNotificationStyle = (type) => {
        const styles = {
            success: { 
                iconColor: '#10b981', 
                bgColor: 'rgba(16, 185, 129, 0.1)',
                icon: 'fa-check-circle'
            },
            info: { 
                iconColor: '#3b82f6', 
                bgColor: 'rgba(59, 130, 246, 0.1)',
                icon: 'fa-info-circle'
            },
            warning: { 
                iconColor: '#f59e0b', 
                bgColor: 'rgba(245, 158, 11, 0.1)',
                icon: 'fa-exclamation-triangle'
            },
            error: { 
                iconColor: '#ef4444', 
                bgColor: 'rgba(239, 68, 68, 0.1)',
                icon: 'fa-times-circle'
            }
        };
        return styles[type] || styles.info;
    };

    const displayedNotifications = showAll ? notifications : notifications.slice(0, 4);

    return (
        <div className="notifications-redesigned">
            <div className="notifications-header">
                <div className="header-left">
                    <i className="fa fa-bell"></i>
                    <span className="title">Notifications</span>
                </div>
                <div className="notifications-count">
                    {notifications.length}
                </div>
            </div>

            <div className="notifications-body">
                {notifications.length > 0 ? (
                    <>
                        {displayedNotifications.map((notif, index) => {
                            const style = getNotificationStyle(notif.type);
                            return (
                                <div key={notif._id} className="notification-item">
                                    <div 
                                        className="notification-icon"
                                        style={{ 
                                            backgroundColor: style.bgColor,
                                            color: style.iconColor 
                                        }}
                                    >
                                        <i className={`fa ${style.icon}`}></i>
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notif.title}</div>
                                        <div className="notification-message">
                                            {notif.message.length > 60 ? 
                                                notif.message.substring(0, 60) + '...' : 
                                                notif.message
                                            }
                                        </div>
                                        <div className="notification-time">
                                            {new Date(notif.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <button 
                                        className="dismiss-btn"
                                        onClick={() => dismissNotification(notif._id)}
                                        title="Dismiss notification"
                                    >
                                        <i className="fa fa-times"></i>
                                    </button>
                                </div>
                            );
                        })}
                        
                        {notifications.length > 4 && (
                            <div className="notifications-footer">
                                <button 
                                    className="view-all-btn"
                                    onClick={() => setShowAll(!showAll)}
                                >
                                    {showAll ? 'Show Less' : `View All (${notifications.length})`}
                                </button>
                                <button 
                                    className="mark-all-read-btn"
                                    onClick={() => setNotifications([])}
                                >
                                    Mark All Read
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-notifications">
                        <i className="fa fa-bell-slash"></i>
                        <div className="no-notifications-title">No notifications</div>
                        <div className="no-notifications-message">You're all caught up!</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlacementNotificationsRedesigned;