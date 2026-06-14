
import { Route, Routes } from "react-router-dom";
import { admin } from "../globals/route-names";
import { lazy, Suspense } from "react";
import PageLoader from "../components/PageLoader";

const AdminDashboardPage = lazy(() => import("../app/pannels/admin/components/admin-dashboard"));
const AdminOverviewPage = lazy(() => import("../app/pannels/admin/components/admin-overview"));
const AdminJobsPostedPage = lazy(() => import("../app/pannels/admin/components/admin-jobs-posted"));
const AdminCandidates = lazy(() => import("../app/pannels/admin/components/admin-candidates"));
const AdminCandidateAddEdit = lazy(() => import("../app/pannels/admin/components/admin-candidate-add"));
const AdminEmployerJobs = lazy(() => import("../app/pannels/admin/components/admin-emp-jobs"));
const AdminJobs = lazy(() => import("../app/pannels/admin/components/admin-jobs"));
const AdminCreditsPage = lazy(() => import("../app/pannels/admin/components/admin-can-credit"));
const AdminBulkUploadPage = lazy(() => import("../app/pannels/admin/components/admin-credit-bulkupload"));
const AdminEmployersAllRequest = lazy(() => import("../app/pannels/admin/components/admin-emp-manage"));
const AdminEmployersApproved = lazy(() => import("../app/pannels/admin/components/admin-emp-approve"));
const AdminEmployersRejected = lazy(() => import("../app/pannels/admin/components/admin-emp-reject"));
const EmployerDetails = lazy(() => import("../app/pannels/admin/components/adminEmployerDetails"));
const AdminPlacementOfficersApproved = lazy(() => import("../app/pannels/admin/components/admin-placement-approve"));
const AdminPlacementOfficersRejected = lazy(() => import("../app/pannels/admin/components/admin-placement-reject"));
const AdminPlacementOfficersTabs = lazy(() => import("../app/pannels/admin/components/admin-placement-manage-tabs.jsx"));
const AdminBatchUploads = lazy(() => import("../app/pannels/admin/components/admin-placement-batch-uploads"));
const AdminIndividualCredit = lazy(() => import("../app/pannels/admin/components/admin-individual-credit"));
const AdminJobsSkills = lazy(() => import("../app/pannels/admin/components/admin-jobs-skills"));
const PlacementDetails = lazy(() => import("../app/pannels/admin/components/placement-details.jsx"));
const PlacementFileRecords = lazy(() => import("../app/pannels/admin/components/placement-file-records.jsx"));
const AdminSubAdmin = lazy(() => import("../app/pannels/admin/components/admin-sub-admin"));
const AdminSupportTickets = lazy(() => import("../app/pannels/admin/components/admin-support-tickets"));
const AdminAddCandidate = lazy(() => import("../app/pannels/admin/components/admin-add-candidate.jsx"));
const AdminExcelUploads = lazy(() => import("../app/pannels/admin/components/admin-excel-uploads"));
const AdminTransactionsPage = lazy(() => import("../app/pannels/admin/components/admin-transactions"));
const AdminNotificationsPage = lazy(() => import("../app/pannels/admin/components/admin-notifications"));
const RegisteredCandidatesPage = lazy(() => import("../app/pannels/admin/components/registered-candidates"));
const AdminCandidateReviewPage = lazy(() => import("../app/pannels/admin/components/admin-candidate-review"));

function AdminRoutes() {
    return (
			<Suspense fallback={<PageLoader pageName="Admin" loadingText="Loading.." compact />}>
			<Routes>
				<Route path={admin.DASHBOARD} element={<AdminDashboardPage />} />
				<Route path={admin.NOTIFICATIONS} element={<AdminNotificationsPage />} />
				<Route path={admin.OVERVIEW} element={<AdminOverviewPage />} />
				<Route path={admin.JOBS_POSTED} element={<AdminJobsPostedPage />} />
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
				<Route path={admin.PLACEMENT_BATCH_UPLOAD} element={<AdminBatchUploads />} />
				<Route path="/placement-details/:id/files/:fileId" element={<PlacementFileRecords />} />
				<Route path="/placement-details/:id" element={<PlacementDetails />} />
				<Route path="/excel-uploads" element={<AdminExcelUploads />} />
				<Route path="/placement-credits" element={<AdminIndividualCredit />} />
				<Route path="/placement-credits/add-candidate" element={<AdminAddCandidate />} />
				<Route path="/jobs/skills" element={<AdminJobsSkills />} />
				<Route path={admin.SUPPORT_TICKETS} element={<AdminSupportTickets />} />
				<Route path={admin.SUB_ADMIN} element={<AdminSubAdmin />} />
				<Route path={admin.TRANSACTIONS} element={<AdminTransactionsPage />} />
			</Routes>
			</Suspense>
		);
}

export default AdminRoutes;
