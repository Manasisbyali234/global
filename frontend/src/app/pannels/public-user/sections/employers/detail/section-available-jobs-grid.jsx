import { NavLink } from "react-router-dom";
import JobZImage from "../../../../../common/jobz-img";
import { publicUser } from "../../../../../../globals/route-names";

function SectionAvailableJobsGrid() {
    return (
        <>
            <h4 className="twm-s-title">Available Jobs</h4>
            <div className="twm-jobs-list-wrap">
                <div className="row">
                    {/*Block one*/}
                    <div className="col-lg-6 col-md-12 m-b30">
                        <div className="twm-jobs-grid-style1">
                            <div className="twm-media">
                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                            </div>
                            <span className="twm-job-post-duration">1 days ago</span>
                            <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                            <div className="twm-mid-content">
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                    <h4>Senior Web Designer , Developer</h4>
                                </NavLink>
                                <p className="twm-job-address">#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                            </div>
                            <div className="twm-right-content">
                                <div className="twm-jobs-amount">$2500 <span>/ Month</span></div>
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                            </div>
                        </div>
                    </div>
                    {/*Block two*/}
                    <div className="col-lg-6 col-md-12 m-b30">
                        <div className="twm-jobs-grid-style1">
                            <div className="twm-media">
                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                            </div>
                            <span className="twm-job-post-duration">15 days ago</span>
                            <div className="twm-jobs-category green"><span className="twm-bg-brown">Intership</span></div>
                            <div className="twm-mid-content">
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                    <h4>Senior Rolling Stock Technician</h4>
                                </NavLink>
                                <p className="twm-job-address">#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                            </div>
                            <div className="twm-right-content">
                                <div className="twm-jobs-amount">$7 <span>/ Hour</span></div>
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                            </div>
                        </div>
                    </div>
                    {/*Block three*/}
                    <div className="col-lg-6 col-md-12 m-b30">
                        <div className="twm-jobs-grid-style1">
                            <div className="twm-media">
                                <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                            </div>
                            <span className="twm-job-post-duration">6 Month ago</span>
                            <div className="twm-jobs-category green"><span className="twm-bg-purple">Fulltime</span></div>
                            <div className="twm-mid-content">
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                    <h4 className="twm-job-title">IT Department Manager</h4>
                                </NavLink>
                                <p className="twm-job-address">#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                            </div>
                            <div className="twm-right-content">
                                <div className="twm-jobs-amount">$2500 <span>/ Month</span></div>
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                            </div>
                        </div>
                    </div>
                    {/*Block Four*/}
                    <div className="col-lg-6 col-md-12 m-b30">
                        <div className="twm-jobs-grid-style1">
                            <div className="twm-media">
                                <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                            </div>
                            <span className="twm-job-post-duration">2 days ago</span>
                            <div className="twm-jobs-category green"><span className="twm-bg-sky">Freelancer</span></div>
                            <div className="twm-mid-content">
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                    <h4 className="twm-job-title">Art Production Specialist</h4>
                                </NavLink>
                                <p className="twm-job-address">#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                            </div>
                            <div className="twm-right-content">
                                <div className="twm-jobs-amount">$1800 <span>/ Month</span></div>
                                <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionAvailableJobsGrid;
