import { Routes, Route } from "react-router-dom";

import PublicUserLayout from "../layouts/public-user-layout";
import EmployerLayout from "../layouts/employer-layout";
import CandidateLayout from "../layouts/candidate-layout";
import PlacementLayout from "../layouts/placement-layout";
import { base } from "../globals/route-names";
import AdminLayout from "../layouts/admin-layout";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path={base.PUBLIC_PRE + "/*"} element={<PublicUserLayout />} />
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
    )
}

export default AppRoutes;
