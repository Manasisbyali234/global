import { Routes, Route } from "react-router-dom";
import { placement } from "../globals/route-names";
import PlacementDashboardRedesigned from "../app/pannels/placement/placement-dashboard-redesigned";
import '../app/pannels/common/modern-dashboard.css';
import '../app/pannels/placement/placement-dashboard-redesigned.css';
import '../app/pannels/placement/batch-upload.css';

function PlacementRoutes() {
    return (
        <Routes>
            <Route path={placement.INITIAL} element={<PlacementDashboardRedesigned />} />
            <Route path={placement.DASHBOARD} element={<PlacementDashboardRedesigned />} />
        </Routes>
    );
}

export default PlacementRoutes;
