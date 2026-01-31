import { useEffect, useState } from 'react';
import './section-notifications.css';

function SectionNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [showAll, setShowAll] = useState(false);
	const [hoveredId, setHoveredId] = useState(null);

	useEffect(() => {
		fetchNotifications();
		const handleRefresh = () => fetchNotifications();
		window.addEventListener('refreshNotifications', handleRefresh);
		return () => window.removeEventListener('refreshNotifications', handleRefresh);
	}, []);

	const fetchNotifications = async () => {
		try {
			const token = localStorage.getItem('candidateToken');
			if (!token) return;

			const response = await fetch('http://localhost:5000/api/notifications/candidate', {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) setNotifications(data.notifications || []);
			}
		} catch (error) {}
	};

	const dismissNotification = async (id) => {
		try {
			const token = localStorage.getItem('candidateToken');
			await fetch(`http://localhost:5000/api/notifications/${id}/dismiss`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
			});
			setNotifications(prev => prev.filter(n => n._id !== id));
		} catch (error) {}
	};

	const getIcon = (type) => {
		const icons = {
			profile_approved: { icon: 'feather-user', color: '#3b82f6' },
			profile_submitted: { icon: 'feather-user', color: '#8b5cf6' },
			application_status: { icon: 'feather-briefcase', color: '#3b82f6' },
			interview_scheduled: { icon: 'feather-calendar', color: '#f59e0b' },
			file_validation_error: { icon: 'feather-info', color: '#6b7280' }
		};
		return icons[type] || { icon: 'feather-info', color: '#6b7280' };
	};

	const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

	return (
		<div className="notification-container" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'white', maxHeight: '400px' }}>
			<div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
					<i className="feather-bell" style={{ marginRight: '8px' }}></i>Notifications
				</h5>
				<span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
					{notifications.length}
				</span>
			</div>

			<div style={{ maxHeight: '320px', overflowY: 'auto' }}>
				{notifications.length > 0 ? (
					<>
						{displayedNotifications.map((notif, idx) => {
							const { icon, color } = getIcon(notif.type);
							const isMobile = window.innerWidth <= 767;
							return (
								<div key={notif._id} className="notification-item" onMouseEnter={() => setHoveredId(notif._id)} onMouseLeave={() => setHoveredId(null)} onClick={() => isMobile && setHoveredId(hoveredId === notif._id ? null : notif._id)} style={{ padding: '10px 12px', borderBottom: idx < displayedNotifications.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
									<div className="notification-icon" style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
										<i className={icon} style={{ color, fontSize: '14px' }}></i>
									</div>
									<div className="notification-content" style={{ flex: 1, minWidth: 0 }}>
										<h6 className="notification-title" style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0', wordWrap: 'break-word' }}>{notif.title}</h6>
										<p className="notification-message" style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
											{notif.message}
										</p>
										<small style={{ fontSize: '10px', color: '#9ca3af' }}>
											{new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</small>
									</div>
									{(hoveredId === notif._id || isMobile) && (
										<button className="notification-dismiss" onClick={(e) => { e.stopPropagation(); dismissNotification(notif._id); }} style={{ background: '#fed7aa', border: 'none', color: 'black', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', padding: '2px 6px', height: 'fit-content', flexShrink: 0, width: '20px', height: '20px', display: hoveredId === notif._id || isMobile ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', transition: 'none' }} onMouseEnter={(e) => {e.target.style.setProperty('background', '#fed7aa', 'important'); e.target.style.setProperty('color', 'black', 'important');}} onMouseLeave={(e) => {e.target.style.setProperty('background', '#fed7aa', 'important'); e.target.style.setProperty('color', 'black', 'important');}}>
											<i className="fa fa-times"></i>
										</button>
									)}
								</div>
							);
						})}
						{notifications.length > 3 && (
							<div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
								<button onClick={() => setShowAll(!showAll)} style={{ background: 'rgba(0,0,0,0.8)', color: 'white', border: 'none', borderRadius: '12px', padding: '4px 12px', fontSize: '10px', cursor: 'pointer' }}>
									{showAll ? 'Show Less' : 'View All'}
								</button>
							</div>
						)}
					</>
				) : (
					<div style={{ padding: '24px', textAlign: 'center' }}>
						<i className="feather-bell" style={{ fontSize: '32px', color: '#d1d5db', opacity: 0.5 }}></i>
						<h6 style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0' }}>No notifications</h6>
						<p style={{ color: '#9ca3af', fontSize: '10px', margin: '2px 0 0 0' }}>Updates will appear here</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default SectionNotifications;
