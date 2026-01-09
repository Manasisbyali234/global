import React, { useEffect } from "react";
import SectionJobsGrid from "../../sections/jobs/section-jobs-grid";
import SectionJobsSearch from "../../sections/jobs/section-jobs-search";
import { loadScript } from "../../../../../globals/constants";
import SectionJobsGridMap from "../../sections/jobs/section-jobs-grid-map";

function JobsGridMapPage() {

    useEffect(() => {
        loadScript("js/custom.js");
    })

    return (
        <>
            <div className="section-full">
                <div className="half-map-list p-a20">
                    <div className="wt-listing-full-width">
                        <SectionJobsSearch />
                    </div>
                    <div className="wt-searchReasult-divider" />
                    <div className="p-a30 side-bar-opposite">
                        <div className="wt-listing-container">
                            <SectionJobsGrid />
                        </div>
                    </div>
                </div>
                {/* Right part */}
                <div className="half-map-section">
                    <div className="user-msg-list-btn-outer">
                        <button className="map-show-btn-close">Close</button>
                        <button className="map-show-btn-open">View Map</button>
                    </div>
                    <div id="map-container">
                        {/* <div id="map" data-map-zoom="9"></div> */}
                        <SectionJobsGridMap />
                    </div>
                </div>
                {/* Right part END */}
            </div>

        </>
    )
}

export default JobsGridMapPage;
