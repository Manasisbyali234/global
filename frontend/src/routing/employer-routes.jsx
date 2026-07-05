
import { Route, Routes } from "react-router-dom";
import { employer } from "../globals/route-names";
import { lazy, Suspense } from "react";
import PageLoader from "../components/PageLoader";

const EmpDashboardPage = lazy(() => import("../app/pannels/employer/components/emp-dashboard"));
const EmpCompanyProfilePage = lazy(() => import("../app/pannels/employer/components/emp-company-profile"));
const EmpCandidatesPage = lazy(() => import("../app/pannels/employer/components/emp-candidates"));
const EmpResumeAlertsPage = lazy(() => import("../app/pannels/employer/components/emp-resume-alerts"));
const Error404Page = lazy(() => import("../app/pannels/public-user/components/pages/error404"));
const EmpCandidateReviewPage = lazy(() => import("../app/pannels/employer/components/emp-candidate-review"));
const AssessmentDashboard = lazy(() => import("../app/pannels/employer/components/pages/AssessmentDashboard"));
const AssessmentResults = lazy(() => import("../app/pannels/employer/components/pages/AssessmentResults"));
const ViewAnswers = lazy(() => import("../app/pannels/employer/components/pages/ViewAnswers"));
const EmpPostedJobs = lazy(() => import("../app/pannels/employer/components/jobs/emp-posted-jobs"));
const EmpPostJob = lazy(() => import("../app/pannels/employer/components/jobs/emp-post-job"));
const EmpJobReviewPage = lazy(() => import("../app/pannels/employer/components/emp-job-review"));
const EmpSupport = lazy(() => import("../app/pannels/employer/components/emp-support"));
const EmployerSupportTickets = lazy(() => import("../app/pannels/employer/components/employer-support-tickets"));
const EmpNotificationsPage = lazy(() => import("../app/pannels/employer/components/emp-notifications"));
const InterviewProcessGuide = lazy(() => import("../app/pannels/employer/components/interview-process-guide"));

function EmployerRoutes() {
    return (
			<Suspense fallback={<PageLoader pageName="Employer" loadingText="Loading.." compact />}>
			<Routes>
				<Route path={employer.DASHBOARD} element={<EmpDashboardPage />} />
				<Route path={employer.NOTIFICATIONS} element={<EmpNotificationsPage />} />
				<Route path={employer.PROFILE} element={<EmpCompanyProfilePage />} />
				<Route path={employer.MANAGE_JOBS} element={<EmpPostedJobs />} /> 
				<Route path={employer.POST_A_JOB} element={<EmpPostJob />} />
				<Route path={employer.EDIT_JOB} element={<EmpPostJob />} /> 
				<Route
					path={employer.CREATE_ASSESSMENT}
					element={<AssessmentDashboard />}
				/>
				<Route
					path="/assessment-results/:assessmentId"
					element={<AssessmentResults />}
				/>
				<Route
					path="/assessment-results"
					element={<AssessmentResults />}
				/>
				<Route
					path="/view-answers/:attemptId"
					element={<ViewAnswers />}
				/>
				<Route path={employer.CANDIDATES} element={<EmpCandidatesPage />} />
				<Route path="/candidates-list/:jobId" element={<EmpCandidatesPage />} />
				<Route
					path={`${employer.CAN_REVIEW}/:applicationId`}
					element={<EmpCandidateReviewPage />}
				/>
				<Route
					path={`${employer.JOB_REVIEW}/:id`}
					element={<EmpJobReviewPage />}
				/>
				<Route
					path={employer.INTERVIEW_GUIDANCE}
					element={<InterviewProcessGuide />}
				/>
				<Route
					path={employer.RESUME_ALERTS}
					element={<EmpResumeAlertsPage />}
				/>
				<Route path={employer.SUPPORT} element={<EmpSupport />} />
				<Route path={employer.SUPPORT_TICKETS} element={<EmployerSupportTickets />} />
				<Route path="*" element={<Error404Page />} />
			</Routes>
			</Suspense>
		);
}

export default EmployerRoutes;
