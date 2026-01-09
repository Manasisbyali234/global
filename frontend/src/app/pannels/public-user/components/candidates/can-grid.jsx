import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";

import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionPagination from "../../sections/common/section-pagination";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function CandidateGridPage() {

    const _filterConfig = {
        prefix: "Showing",
        type: "Candidates",
        total: "2,150",
        showRange: false,
        showingUpto: ""
    }

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="section-full p-t120  p-b90 site-bg-white">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-12 rightSidebar">
                            <SectionJobsSidebar1 />
                        </div>
                        <div className="col-lg-8 col-md-12">
                            {/*Filter Short By*/}
                            <SectionRecordsFilter _config={_filterConfig} />

                            <div className="twm-candidates-grid-wrap">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Wanda Montgomery </h4>
                                                </NavLink>
                                                <p>Charted Accountant</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$20<span>/ Day</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic2.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Peter Hawkins</h4>
                                                </NavLink>
                                                <p>Medical Professed</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$7<span>/ Hour</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic3.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Ralph Johnson</h4>
                                                </NavLink>
                                                <p>Bank Manger</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$180<span>/ Day</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic4.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Randall Henderson </h4>
                                                </NavLink>
                                                <p>IT Contractor</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$90<span>/ Week</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic5.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Randall Warren</h4>
                                                </NavLink>
                                                <p>Digital &amp; Creative</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$95<span>/ Day</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic6.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Christina Fischer </h4>
                                                </NavLink>
                                                <p>Charity &amp; Voluntary</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$19<span>/ Hour</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic7.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Wanda Willis </h4>
                                                </NavLink>
                                                <p>Marketing &amp; PR</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$12<span>/ Day</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic8.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Peter Hawkins</h4>
                                                </NavLink>
                                                <p>Public Sector</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$7<span>/ Hour</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic9.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Kathleen Moreno </h4>
                                                </NavLink>
                                                <p>Sales &amp; Marketing</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$125<span>/ Week</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="twm-candidates-grid-style1 mb-5">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic10.jpg" alt="#" />
                                                </div>
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Kathleen Moreno </h4>
                                                </NavLink>
                                                <p>Sales &amp; Marketing</p>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                <div className="twm-fot-content">
                                                    <div className="twm-left-info">
                                                        <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                        <div className="twm-jobs-vacancies">$125<span>/ Week</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SectionPagination />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default CandidateGridPage;
