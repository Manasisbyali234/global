import RoleNotificationsPage from "../../../../components/RoleNotificationsPage";

function CanNotificationsPage() {
  return (
    <RoleNotificationsPage
      role="candidate"
      title="Notifications"
      subtitle="Review alerts, track recent updates, and clear items once you are done."
      accentColor="#f97316"
      pageClassName="candidate-notifications-page"
      shellClassName="candidate-notifications-shell"
      headerIconClass="fa fa-bell"
      compactMobilePagination
    />
  );
}

export default CanNotificationsPage;
