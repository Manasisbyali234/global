
import { Route, Routes, Navigate } from "react-router-dom";
import { candidate } from "../globals/route-names";
import { useState, useEffect, lazy, Suspense } from "react";
import { BACKEND_URL } from "../utils/api";
import PageLoader from "../components/PageLoader";

const CanDashboardPage = lazy(() => import("../app/pannels/candidate/components/can-dashboard"));
const CanNotificationsPage = lazy(() => import("../app/pannels/candidate/components/can-notifications"));
const CanProfilePage = lazy(() => import("../app/pannels/candidate/components/can-profile"));
const CanAppliedJobs = lazy(() => import("../app/pannels/candidate/components/can-applied-jobs"));
const CanStatusPage = lazy(() => import("../app/pannels/candidate/components/application-status"));
const CanInterviewsPage = lazy(() => import("../app/pannels/candidate/components/can-interviews"));
const CanMyResumePage = lazy(() => import("../app/pannels/candidate/components/can-resume"));
const CanSavedJobsPage = lazy(() => import("../app/pannels/candidate/components/can-saved-jobs"));
const CanCVManagerPage = lazy(() => import("../app/pannels/candidate/components/can-cv-manager"));
const CanJobAlertsPage = lazy(() => import("../app/pannels/candidate/components/can-job-alerts"));
const CanChangePasswordPage = lazy(() => import("../app/pannels/candidate/components/can-change-password"));
const CanChatPage = lazy(() => import("../app/pannels/candidate/components/can-chat"));
const Error404Page = lazy(() => import("../app/pannels/public-user/components/pages/error404"));
const TakeAssessment = lazy(() => import("../app/pannels/candidate/components/take-assesment"));
const Stepper = lazy(() => import("../app/pannels/candidate/components/step-by-step"));
const StartAssessment = lazy(() => import("../app/pannels/candidate/pages/start-tech-assessment"));
const AssessmentResults = lazy(() => import("../app/pannels/candidate/pages/assessment-result"));
const CanSupport = lazy(() => import("../app/pannels/candidate/components/can-support"));
const CanTransactionsPage = lazy(() => import("../app/pannels/candidate/components/can-transactions"));

// Component to protect transactions route from placement candidates
function ProtectedTransactions() {
	const [canAccessTransactions, setCanAccessTransactions] = useState(null);

	useEffect(() => {
		const checkPlacementStatus = async () => {
			try {
				const token = localStorage.getItem('candidateToken');
				if (!token) {
					setCanAccessTransactions(true);
					return;
				}

				const response = await fetch(`${BACKEND_URL}/api/candidate/dashboard/stats`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.candidate) {
						const isPlacementCandidate = !!data.candidate.placement;
						const credits = Number(data.candidate?.credits ?? 0);
						// Allow transactions for non-placement candidates OR placement candidates with 0 credits
						setCanAccessTransactions(!isPlacementCandidate || credits === 0);
						return;
					}
				}
				setCanAccessTransactions(true);
			} catch (error) {
				setCanAccessTransactions(true);
			}
		};

		checkPlacementStatus();
	}, []);

	if (canAccessTransactions === null) {
		return <div>Loading...</div>;
	}
	
	if (!canAccessTransactions) {
		return <Navigate to="/candidate/dashboard" replace />;
	}
	return <CanTransactionsPage />;
}

function CandidateRoutes() {
    return (
			<Suspense fallback={<PageLoader pageName="Candidate" loadingText="Loading.." compact />}>
			<Routes>
				<Route path={candidate.INITIAL} element={<CanDashboardPage />} />
				<Route path={candidate.DASHBOARD} element={<CanDashboardPage />} />
				<Route path={candidate.NOTIFICATIONS} element={<CanNotificationsPage />} />
				<Route path={candidate.PROFILE} element={<CanProfilePage />} />
				<Route path={candidate.APPLIED_JOBS} element={<CanAppliedJobs />} />
				<Route path={candidate.STATUS} element={<CanStatusPage />} />
				<Route path={candidate.INTERVIEW_DETAILS} element={<CanStatusPage />} />
				<Route path={candidate.INTERVIEWS} element={<CanInterviewsPage />} />
				<Route path={candidate.RESUME} element={<CanMyResumePage />} />

				<Route path={candidate.STEP} element={<Stepper />} />

				<Route path={candidate.SAVED_JOBS} element={<CanSavedJobsPage />} />
				<Route path={candidate.CV_MANAGER} element={<CanCVManagerPage />} />
				<Route path={candidate.ALERTS} element={<CanJobAlertsPage />} />
				<Route path={candidate.ASSESSMENT} element={<TakeAssessment />} />
				<Route
					path={candidate.START_ASSESSMENT}
					element={<StartAssessment />}
				/>
				<Route path={candidate.RESULT} element={< AssessmentResults/>} />
				<Route path="/assessment-result" element={<Navigate to="/candidate/status" replace />} />
				<Route
					path={candidate.CHANGE_PASSWORD}
					element={<CanChangePasswordPage />}
				/>
				<Route path={candidate.CHAT} element={<CanChatPage />} />
				<Route path={candidate.SUPPORT} element={<CanSupport />} />
				<Route path={candidate.TRANSACTIONS} element={<ProtectedTransactions />} />
				<Route path="*" element={<Error404Page />} />
			</Routes>
			</Suspense>
		);
}

export default CandidateRoutes;
