import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import SectionPagination from "../../sections/common/section-pagination";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function EmployersListPage() {

    const _filterConfig = {
        prefix: "Showing",
        type: "Result",
        total: "10",
        showRange: true,
        showingUpto: "8"
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

                            <div className="twm-employer-list-wrap">
                                <ul>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4>Herbal Ltd</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Accountancy</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>25</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4>Artistre Studio PVT Ltd</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">IT Contractor</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>30</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4 className="twm-job-title">Wins Developers</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Banking</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>32</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4 className="twm-job-title">Thewebmax PVT Ltd</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Digital &amp; Creative</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>38</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic5.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4 className="twm-job-title">Robo Tech</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Sales &amp; Marketing</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>40</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4>Galaxy IT Solution</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Leisure &amp; Tourismm</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>38</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4>Coderbotics solutions</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Consultancy</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>35</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4 className="twm-job-title">Microsoft solution</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Technologies</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>65</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="twm-employer-list-style1 mb-5">
                                            <div className="twm-media">
                                                <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                            </div>
                                            <div className="twm-mid-content">
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-title">
                                                    <h4 className="twm-job-title">Dot Circle PVT Ltd</h4>
                                                </NavLink>
                                                <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                                <NavLink to={publicUser.employer.DETAIL1} className="twm-job-websites site-text-primary">Sales &amp; Marketing</NavLink>
                                            </div>
                                            <div className="twm-right-content">
                                                <div className="twm-jobs-vacancies"><span>50</span>Vacancies</div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <SectionPagination />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmployersListPage;
