import RoleNotificationsPage from "../../../../components/RoleNotificationsPage";

function EmpNotificationsPage() {
  return (
    <RoleNotificationsPage
      role="employer"
      title="Employer Notifications"
      subtitle="Review job, candidate, document, and support updates without relying on the header dropdown."
      accentColor="#f97316"
      pageClassName="employer-notifications-page"
      shellClassName="employer-notifications-shell"
      headerIconClass="fa fa-bell"
    />
  );
}

export default EmpNotificationsPage;
