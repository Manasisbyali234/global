import { useLocation } from "react-router-dom";
import PlacementRoutes from "../routing/placement-routes";

function PlacementLayout() {
    // const currentpath = useLocation().pathname; // Unused variable

    return (
        <>
            <div className="page-wraper" style={{background: '#f8f9fa'}}>
                <div className="page-content">
                    <PlacementRoutes />
                </div>
            </div>
        </>
    )
}

export default PlacementLayout;
