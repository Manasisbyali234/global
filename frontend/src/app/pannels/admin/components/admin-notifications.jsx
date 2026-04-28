import RoleNotificationsPage from "../../../../components/RoleNotificationsPage";

function AdminNotificationsPage() {
  return (
    <RoleNotificationsPage
      role="admin"
      title="Admin Notifications"
      subtitle="Track platform alerts, employer updates, placement events, and document activity in one place."
      accentColor="#fd7e14"
      pageClassName="admin-notifications-page"
      shellClassName="admin-notifications-shell"
      headerIconClass="fa fa-bell"
    />
  );
}

export default AdminNotificationsPage;
