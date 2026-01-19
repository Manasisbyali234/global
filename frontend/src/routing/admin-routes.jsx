
import { Route, Routes } from "react-router-dom";
import { admin } from "../globals/route-names";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboardPage from "../app/pannels/admin/components/admin-dashboard";
import AdminCandidates from "../app/pannels/admin/components/admin-candidates";
import AdminCandidateAddEdit from "../app/pannels/admin/components/admin-candidate-add";
import AdminEmployerJobs from "../app/pannels/admin/components/admin-emp-jobs";
import AdminJobs from "../app/pannels/admin/components/admin-jobs";
import AdminCreditsPage from "../app/pannels/admin/components/admin-can-credit";
import AdminBulkUploadPage from "../app/pannels/admin/components/admin-credit-bulkupload";
import AdminEmployersAllRequest from "../app/pannels/admin/components/admin-emp-manage";
import AdminEmployersApproved from "../app/pannels/admin/components/admin-emp-approve";
import AdminEmployersRejected from "../app/pannels/admin/components/admin-emp-reject";
import EmployerDetails from "../app/pannels/admin/components/adminEmployerDetails";
import AdminPlacementOfficersAllRequest from "../app/pannels/admin/components/admin-placement-manage";
import AdminPlacementOfficersApproved from "../app/pannels/admin/components/admin-placement-approve";
import AdminPlacementOfficersRejected from "../app/pannels/admin/components/admin-placement-reject";
import AdminPlacementOfficersTabs from "../app/pannels/admin/components/admin-placement-manage-tabs.jsx";
import AdminIndividualCredit from "../app/pannels/admin/components/admin-individual-credit";
import AdminJobsSkills from "../app/pannels/admin/components/admin-jobs-skills";
import PlacementDetails from "../app/pannels/admin/components/placement-details.jsx";
import AdminSubAdmin from "../app/pannels/admin/components/admin-sub-admin";
import AdminSupportTickets from "../app/pannels/admin/components/admin-support-tickets";
import AdminAddCandidate from "../app/pannels/admin/components/admin-add-candidate.jsx";
import AdminExcelUploads from "../app/pannels/admin/components/admin-excel-uploads";
import AdminTransactionsPage from "../app/pannels/admin/components/admin-transactions";

import RegisteredCandidatesPage from "../app/pannels/admin/components/registered-candidates";
import AdminCandidateReviewPage from "../app/pannels/admin/components/admin-candidate-review";

function AdminRoutes() {
    return (
			<Routes>
				<Route path={admin.DASHBOARD} element={<AdminDashboardPage />} />
				<Route path={admin.CAN_MANAGE} element={<AdminEmployersAllRequest />} />
				<Route path={admin.CAN_APPROVE} element={<AdminEmployersApproved />} />
				<Route path={admin.CAN_REJECT} element={<AdminEmployersRejected />} />
				<Route path={admin.CANDIDATES} element={<AdminCandidates />} />
				<Route
					path={admin.CANDIDATE_ADD_EDIT}
					element={<AdminCandidateAddEdit />}
				/>
				<Route path={admin.EMPLOYER_JOBS} element={<AdminEmployerJobs />} />
				<Route path={admin.JOBS} element={<AdminJobs />} />
				<Route path={admin.CREDITS} element={<AdminCreditsPage />} />
				<Route path={admin.BULK_UPLOAD} element={<AdminBulkUploadPage />} />
				<Route
					path={admin.EMPLOYER_DETAILS}
					element={<EmployerDetails />}
				/>

				<Route path={admin.REGISTERED_CANDIDATES} element={<RegisteredCandidatesPage />} />
				<Route path={admin.CANDIDATE_REVIEW} element={<AdminCandidateReviewPage />} />
				<Route path={admin.PLACEMENT_MANAGE} element={<AdminPlacementOfficersTabs />} />
				<Route path={admin.PLACEMENT_APPROVE} element={<AdminPlacementOfficersApproved />} />
				<Route path={admin.PLACEMENT_REJECT} element={<AdminPlacementOfficersRejected />} />
				<Route path="/placement-details/:id" element={<PlacementDetails />} />
				<Route path="/excel-uploads" element={<AdminExcelUploads />} />
				<Route path="/placement-credits" element={<AdminIndividualCredit />} />
				<Route path="/placement-credits/add-candidate" element={<AdminAddCandidate />} />
				<Route path="/jobs/skills" element={<AdminJobsSkills />} />
				<Route path={admin.SUPPORT_TICKETS} element={<AdminSupportTickets />} />
				<Route path={admin.SUB_ADMIN} element={<AdminSubAdmin />} />
				<Route path={admin.TRANSACTIONS} element={<AdminTransactionsPage />} />
			</Routes>
		);
}

export default AdminRoutes;
