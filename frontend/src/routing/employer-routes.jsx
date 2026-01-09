
import { Route, Routes } from "react-router-dom";
import { employer } from "../globals/route-names";
import EmpDashboardPage from "../app/pannels/employer/components/emp-dashboard";
import EmpCompanyProfilePage from "../app/pannels/employer/components/emp-company-profile";
import EmpCandidatesPage from "../app/pannels/employer/components/emp-candidates";
import EmpResumeAlertsPage from "../app/pannels/employer/components/emp-resume-alerts";
import Error404Page from "../app/pannels/public-user/components/pages/error404";
import EmpCandidateReviewPage from "../app/pannels/employer/components/emp-candidate-review";
import AssessmentDashboard from "../app/pannels/employer/components/pages/AssessmentDashboard";
import AssessmentResults from "../app/pannels/employer/components/pages/AssessmentResults";
import ViewAnswers from "../app/pannels/employer/components/pages/ViewAnswers";
import EmpPostedJobs from "../app/pannels/employer/components/jobs/emp-posted-jobs";
import EmpPostJob from "../app/pannels/employer/components/jobs/emp-post-job";
import EmpJobReviewPage from "../app/pannels/employer/components/emp-job-review";
import EmpSupport from "../app/pannels/employer/components/emp-support";

function EmployerRoutes() {
    return (
			<Routes>
				<Route path={employer.DASHBOARD} element={<EmpDashboardPage />} />
				<Route path={employer.PROFILE} element={<EmpCompanyProfilePage />} />
				<Route path={employer.MANAGE_JOBS} element={<EmpPostedJobs />} /> 
				<Route path={employer.POST_A_JOB} element={<EmpPostJob />} />
				<Route path="/edit-job/:id" element={<EmpPostJob />} /> 
				<Route
					path={employer.CREATE_ASSESSMENT}
					element={<AssessmentDashboard />}
				/>
				<Route
					path="/assessment-results/:assessmentId"
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
					path={employer.RESUME_ALERTS}
					element={<EmpResumeAlertsPage />}
				/>
				<Route path={employer.SUPPORT} element={<EmpSupport />} />
				<Route path="*" element={<Error404Page />} />
			</Routes>
		);
}

export default EmployerRoutes;
