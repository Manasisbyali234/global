import { useEffect, useState } from "react";
import { loadScript } from "../../../../globals/constants";
import { formatDateTime } from "../../../../utils/dateFormatter";
import "./can-notifications.css";

const notificationTypeMeta = {
  profile_approved: { icon: "fa fa-user", color: "#16a34a", label: "Profile" },
  profile_submitted: { icon: "fa fa-user", color: "#7c3aed", label: "Profile" },
  profile_updated: { icon: "fa fa-user", color: "#2563eb", label: "Profile" },
  application_received: { icon: "fa fa-briefcase", color: "#2563eb", label: "Application" },
  application_status: { icon: "fa fa-briefcase", color: "#2563eb", label: "Application" },
  application_status_updated: { icon: "fa fa-briefcase", color: "#2563eb", label: "Application" },
  interview_scheduled: { icon: "fa fa-calendar", color: "#f59e0b", label: "Interview" },
  interview_updated: { icon: "fa fa-calendar", color: "#f97316", label: "Interview" },
  support_response: { icon: "fa fa-headset", color: "#0f766e", label: "Support" },
  file_uploaded: { icon: "fa fa-file", color: "#0ea5e9", label: "Files" },
  file_processed: { icon: "fa fa-file", color: "#16a34a", label: "Files" },
  file_rejected: { icon: "fa fa-file", color: "#dc2626", label: "Files" },
  file_validation_error: { icon: "fa fa-info-circle", color: "#6b7280", label: "Update" },
  placement_processed: { icon: "fa fa-building", color: "#ea580c", label: "Placement" },
  offer_response: { icon: "fa fa-envelope-open", color: "#0891b2", label: "Offer" }
};

function getNotificationMeta(type) {
  return notificationTypeMeta[type] || {
    icon: "fa fa-bell",
    color: "#6b7280",
    label: "Update"
  };
}

function CanNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pendingAction, setPendingAction] = useState("");
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadScript("js/custom.js");
    fetchNotifications({ initialLoad: true });

    const refreshInterval = setInterval(() => {
      fetchNotifications({ silent: true });
    }, 30000);

    const handleRefresh = () => {
      fetchNotifications({ silent: true });
    };

    window.addEventListener("refreshNotifications", handleRefresh);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("refreshNotifications", handleRefresh);
    };
  }, []);

  const fetchNotifications = async ({ initialLoad = false, silent = false } = {}) => {
    const token = localStorage.getItem("candidateToken");

    if (!token) {
      setNotifications([]);
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (initialLoad) {
      setLoading(true);
    } else if (!silent) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch("http://localhost:5000/api/notifications/candidate?page=1&limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load notifications.");
      }

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setError("");
    } catch (fetchError) {
      if (!silent) {
        setError(fetchError.message || "Unable to load notifications.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const dispatchNotificationRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshNotifications"));
  };

  const applyNotificationAction = async ({ actionKey, endpoint, method, updateNotifications, failureMessage }) => {
    const token = localStorage.getItem("candidateToken");
    if (!token) {
      setError("Please log in again to manage notifications.");
      return;
    }

    setPendingAction(actionKey);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || failureMessage);
      }

      setNotifications((currentNotifications) => updateNotifications(currentNotifications));
      setError("");
      dispatchNotificationRefresh();
    } catch (actionError) {
      setError(actionError.message || failureMessage);
    } finally {
      setPendingAction("");
    }
  };

  const markAsRead = (notificationId) => {
    applyNotificationAction({
      actionKey: `read:${notificationId}`,
      endpoint: `http://localhost:5000/api/notifications/${notificationId}/read`,
      method: "PATCH",
      updateNotifications: (currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        ),
      failureMessage: "Unable to mark this notification as read."
    });
  };

  const markAllAsRead = () => {
    applyNotificationAction({
      actionKey: "read-all",
      endpoint: "http://localhost:5000/api/notifications/candidate/read-all",
      method: "PATCH",
      updateNotifications: (currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, isRead: true })),
      failureMessage: "Unable to mark all notifications as read."
    });
  };

  const dismissNotification = (notificationId) => {
    applyNotificationAction({
      actionKey: `dismiss:${notificationId}`,
      endpoint: `http://localhost:5000/api/notifications/${notificationId}/dismiss`,
      method: "PUT",
      updateNotifications: (currentNotifications) =>
        currentNotifications.filter((notification) => notification._id !== notificationId),
      failureMessage: "Unable to dismiss this notification."
    });
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;
  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "unread" && notification.isRead) return false;
    if (activeFilter === "read" && !notification.isRead) return false;
    if (dateFrom && new Date(notification.createdAt) < new Date(dateFrom)) return false;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(notification.createdAt) > to) return false;
    }
    return true;
  });

  const stats = [
    { label: "Total Notifications", value: notifications.length, icon: "fa fa-bell", tone: "orange" },
    { label: "Unread", value: unreadCount, icon: "fa fa-envelope-open", tone: "blue" },
    { label: "Read", value: readCount, icon: "fa fa-check", tone: "green" }
  ];

  return (
    <div className="twm-right-section-panel site-bg-gray candidate-notifications-page">
      <div className="candidate-page-shell candidate-notifications-shell candidate-page-shell--header">
        <div className="candidate-page-header-card">
          <div style={{ textAlign: "center" }}>
            <h2 className="candidate-page-title">
              <i className="fa fa-bell me-2" style={{ color: "#f97316" }}></i>
              Notifications
            </h2>
            <p className="candidate-page-subtitle">
              Review alerts, track recent updates, and clear items once you are done.
            </p>
          </div>
        </div>
      </div>

      <div className="candidate-page-shell candidate-notifications-shell candidate-page-shell--content">
        <div className="candidate-notifications-stats">
          {stats.map((stat) => (
            <div key={stat.label} className={`candidate-notifications-stat-card tone-${stat.tone}`}>
              <div className="candidate-notifications-stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div>
                <div className="candidate-notifications-stat-value">{stat.value}</div>
                <div className="candidate-notifications-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel panel-default candidate-notifications-panel">
          <div className="panel-body wt-panel-body p-a20">
            <div className="candidate-notifications-toolbar">
              <div className="candidate-notifications-filter-group">
                <button
                  type="button"
                  className={`candidate-notifications-filter ${activeFilter === "all" ? "is-active" : ""}`}
                  onClick={() => { setActiveFilter("all"); setCurrentPage(1); }}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`candidate-notifications-filter ${activeFilter === "unread" ? "is-active" : ""}`}
                  onClick={() => { setActiveFilter("unread"); setCurrentPage(1); }}
                >
                  Unread
                </button>
                <button
                  type="button"
                  className={`candidate-notifications-filter ${activeFilter === "read" ? "is-active" : ""}`}
                  onClick={() => { setActiveFilter("read"); setCurrentPage(1); }}
                >
                  Read
                </button>
              </div>

              <div className="candidate-notifications-date-range">
                <div className="candidate-notifications-date-field">
                  <label>From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <div className="candidate-notifications-date-field">
                  <label>To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button type="button" className="candidate-notifications-date-clear" onClick={() => { setDateFrom(""); setDateTo(""); setCurrentPage(1); }}>
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="alert alert-danger candidate-notifications-alert" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="candidate-notifications-empty-state">
                <i className="fa fa-spinner fa-spin"></i>
                <h4>Loading notifications</h4>
                <p>Please wait while we fetch your latest updates.</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="candidate-notifications-list">
                {filteredNotifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((notification) => {
                  const meta = getNotificationMeta(notification.type);
                  const isReadPending = pendingAction === `read:${notification._id}`;
                  const isDismissPending = pendingAction === `dismiss:${notification._id}`;

                  return (
                    <article
                      key={notification._id}
                      className={`candidate-notification-card ${notification.isRead ? "is-read" : "is-unread"}`}
                      style={{ "--notification-accent": meta.color }}
                    >
                      <div
                        className="candidate-notification-card__icon"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        <i className={meta.icon}></i>
                      </div>

                      <div className="candidate-notification-card__body">
                        <div className="candidate-notification-card__topline">
                          <span className="candidate-notification-card__category">{meta.label}</span>
                          <span className={`candidate-notification-card__status ${notification.isRead ? "is-read" : "is-unread"}`}>
                            {notification.isRead ? "Read" : "Unread"}
                          </span>
                        </div>

                        <h4 className="candidate-notification-card__title">{notification.title}</h4>
                        <p className="candidate-notification-card__message">{notification.message}</p>

                        <div className="candidate-notification-card__footer">
                          <span className="candidate-notification-card__time">
                            <i className="fa fa-clock"></i>
                            {formatDateTime(notification.createdAt)}
                          </span>

                          <div className="candidate-notification-card__actions">
                            {!notification.isRead && (
                              <button
                                type="button"
                                className="candidate-notification-action"
                                onClick={() => markAsRead(notification._id)}
                                disabled={isReadPending || isDismissPending}
                              >
                                <i className={`fa ${isReadPending ? "fa-spinner fa-spin" : "fa-eye"}`}></i>
                              </button>
                            )}
                            <button
                              type="button"
                              className="candidate-notification-action danger"
                              onClick={() => dismissNotification(notification._id)}
                              disabled={isDismissPending || isReadPending}
                            >
                              <i className={`fa ${isDismissPending ? "fa-spinner fa-spin" : "fa-trash"}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="candidate-notifications-empty-state">
                <i className="fa fa-bell-slash"></i>
                <h4>{activeFilter === "all" ? "No notifications yet" : `No ${activeFilter} notifications`}</h4>
                <p>
                  {activeFilter === "all"
                    ? "New updates about applications, interviews, and profile activity will appear here."
                    : "Try another filter or come back after new activity arrives."}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
              <div style={{ color: "#6c757d", fontSize: "13px" }}>
                Showing {filteredNotifications.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredNotifications.length)} of {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </div>
              {Math.ceil(filteredNotifications.length / PAGE_SIZE) > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
                  {Array.from({ length: Math.ceil(filteredNotifications.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredNotifications.length / PAGE_SIZE)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === Math.ceil(filteredNotifications.length / PAGE_SIZE) ? "#f8f9fa" : "#fff", color: currentPage === Math.ceil(filteredNotifications.length / PAGE_SIZE) ? "#adb5bd" : "#495057", cursor: currentPage === Math.ceil(filteredNotifications.length / PAGE_SIZE) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CanNotificationsPage;
