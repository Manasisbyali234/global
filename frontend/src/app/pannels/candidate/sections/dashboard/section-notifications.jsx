import { useEffect, useState } from 'react';
import { formatDate } from '../../../../../utils/dateFormatter';
import './section-notifications.css';

function SectionNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [showAll, setShowAll] = useState(false);
	const [hoveredId, setHoveredId] = useState(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		fetchNotifications();
		const handleRefresh = () => fetchNotifications();
		const handleResize = () => setIsMobile(window.innerWidth <= 767);

		handleResize();
		window.addEventListener('refreshNotifications', handleRefresh);
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('refreshNotifications', handleRefresh);
			window.removeEventListener('resize', handleResize);
		};
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

	const getNotificationTone = (notification) => {
		const title = notification.title || '';
		const type = notification.type || '';
		const lowerTitle = title.toLowerCase();

		const isApproved = type === 'profile_approved' ||
			lowerTitle.includes('approved') ||
			lowerTitle.includes('selected') ||
			lowerTitle.includes('shortlisted');
		const isRejected = lowerTitle.includes('rejected') ||
			lowerTitle.includes('declined') ||
			type === 'file_validation_error';

		if (isApproved) {
			return {
				background: notification.isRead ? '#f9fafb' : '#f0fdf4',
				border: '#22c55e',
				iconBackground: '#dcfce7',
				icon: 'OK'
			};
		}

		if (isRejected) {
			return {
				background: notification.isRead ? '#f9fafb' : '#fef2f2',
				border: '#ef4444',
				iconBackground: '#fecaca',
				icon: '!'
			};
		}

		return {
			background: notification.isRead ? '#f9fafb' : '#fef3c7',
			border: '#f59e0b',
			iconBackground: '#fde68a',
			icon: type === 'interview_scheduled' ? '>>' : 'i'
		};
	};

	const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

	return (
		<div
			className="notification-container"
			style={{
				background: 'white',
				borderRadius: '0.75rem',
				border: '1px solid #e5e7eb',
				padding: isMobile ? '1rem' : '1.5rem',
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			}}
		>
			<h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
				Notifications
			</h3>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
				{notifications.length > 0 ? (
					<>
						{displayedNotifications.map((notif) => {
							const tone = getNotificationTone(notif);
							const showDetails = hoveredId === notif._id || isMobile;

							return (
								<div
									key={notif._id}
									className="notification-item"
									onMouseEnter={() => setHoveredId(notif._id)}
									onMouseLeave={() => setHoveredId(null)}
									style={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: '0.75rem',
										padding: '0.75rem',
										background: tone.background,
										borderRadius: '0.5rem',
										position: 'relative',
										borderLeft: `3px solid ${tone.border}`
									}}
								>
									<div
										className="notification-icon"
										style={{
											width: '2rem',
											height: '2rem',
											background: tone.iconBackground,
											borderRadius: '50%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
											color: '#111827',
											fontSize: '1rem',
											fontWeight: '700'
										}}
									>
										<span>{tone.icon}</span>
									</div>
									<div className="notification-content" style={{ flex: 1, minWidth: 0 }}>
										<p
											className="notification-title"
											style={{
												fontSize: '0.875rem',
												fontWeight: '600',
												color: '#111827',
												margin: '0 0 0.25rem 0',
												lineHeight: '1.3'
											}}
										>
											{notif.title}
										</p>
										<p
											className="notification-message"
											style={{
												fontSize: '0.75rem',
												color: '#6b7280',
												margin: '0 0 0.25rem 0',
												lineHeight: '1.4',
												wordBreak: 'break-word',
												display: showDetails ? 'block' : 'none'
											}}
										>
											{notif.message}
										</p>
										<p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
											{formatDate(notif.createdAt)}
										</p>
									</div>
									{showDetails && (
										<button
											className="notification-dismiss"
											onClick={(e) => {
												e.stopPropagation();
												dismissNotification(notif._id);
											}}
											style={{
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
											}}
										>
											<i className="fa fa-times"></i>
										</button>
									)}
								</div>
							);
						})}
						{notifications.length > 3 && (
							<button
								onClick={() => setShowAll(!showAll)}
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
									{showAll ? 'Show Less' : 'View All'}
							</button>
						)}
					</>
				) : (
					<div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
						<p style={{ margin: 0 }}>No notifications</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default SectionNotifications;
