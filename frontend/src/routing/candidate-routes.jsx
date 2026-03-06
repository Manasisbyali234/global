
import { Route, Routes, Navigate } from "react-router-dom";
import { candidate } from "../globals/route-names";
import { useState, useEffect } from "react";
import CanDashboardPage from "../app/pannels/candidate/components/can-dashboard";
import CanProfilePage from "../app/pannels/candidate/components/can-profile";
import CanAppliedJobs from "../app/pannels/candidate/components/can-applied-jobs";
import CanStatusPage from "../app/pannels/candidate/components/application-status";
import CanMyResumePage from "../app/pannels/candidate/components/can-resume";
import CanSavedJobsPage from "../app/pannels/candidate/components/can-saved-jobs";
import CanCVManagerPage from "../app/pannels/candidate/components/can-cv-manager";
import CanJobAlertsPage from "../app/pannels/candidate/components/can-job-alerts";
import CanChangePasswordPage from "../app/pannels/candidate/components/can-change-password";
import CanChatPage from "../app/pannels/candidate/components/can-chat";
import Error404Page from "../app/pannels/public-user/components/pages/error404";
import TakeAssessment from "../app/pannels/candidate/components/take-assesment";

import Stepper from "../app/pannels/candidate/components/step-by-step";
import StartAssessment from "../app/pannels/candidate/pages/start-tech-assessment";
import AssessmentResults from "../app/pannels/candidate/pages/assessment-result";
import CanSupport from "../app/pannels/candidate/components/can-support";
import CanTransactionsPage from "../app/pannels/candidate/components/can-transactions";

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

				const response = await fetch('http://localhost:5000/api/candidate/dashboard/stats', {
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
			<Routes>
				<Route path={candidate.INITIAL} element={<CanDashboardPage />} />
				<Route path={candidate.DASHBOARD} element={<CanDashboardPage />} />
				<Route path={candidate.PROFILE} element={<CanProfilePage />} />
				<Route path={candidate.APPLIED_JOBS} element={<CanAppliedJobs />} />
				<Route path={candidate.STATUS} element={<CanStatusPage />} />
				<Route path={candidate.INTERVIEW_DETAILS} element={<CanStatusPage />} />
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
		);
}

export default CandidateRoutes;
