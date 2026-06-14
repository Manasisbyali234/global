import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import PublicUserLayout from "../layouts/public-user-layout";
import { base } from "../globals/route-names";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy-load all authenticated layouts — they are never needed on public pages
// and contribute the most to the long main-thread task on first load
const EmployerLayout = lazy(() => import("../layouts/employer-layout"));
const CandidateLayout = lazy(() => import("../layouts/candidate-layout"));
const PlacementLayout = lazy(() => import("../layouts/placement-layout"));
const AdminLayout = lazy(() => import("../layouts/admin-layout"));
const StartAssessment = lazy(() => import("../app/pannels/candidate/pages/start-tech-assessment"));

function AppRoutes() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route path={base.PUBLIC_PRE + "/*"} element={<PublicUserLayout />} />
                <Route path={base.CANDIDATE_PRE + "/start-tech-assessment"} element={
                    <ProtectedRoute requiredRole="candidate">
                        <StartAssessment />
                    </ProtectedRoute>
                } />
                <Route path={base.EMPLOYER_PRE + "/*"} element={
                    <ProtectedRoute requiredRole="employer">
                        <EmployerLayout />
                    </ProtectedRoute>
                } />
                <Route path={base.CANDIDATE_PRE + "/*"} element={
                    <ProtectedRoute requiredRole="candidate">
                        <CandidateLayout />
                    </ProtectedRoute>
                } />
                <Route path={base.ADMIN_PRE + "/*"} element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                } />
                <Route path={base.PLACEMENT_PRE + "/*"} element={
                    <ProtectedRoute requiredRole="placement">
                        <PlacementLayout />
                    </ProtectedRoute>
                } />
            </Routes>
        </Suspense>
    )
}

export default AppRoutes;
