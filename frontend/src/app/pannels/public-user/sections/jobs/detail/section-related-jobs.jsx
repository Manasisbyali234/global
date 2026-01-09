import { publicUser } from "../../../../../../globals/route-names";
import JobZImage from "../../../../../common/jobz-img";
import { NavLink } from "react-router-dom";

function SectionRelatedJobs() {
    return (
        <>
            {/* title="" START*/}
            <div className="section-head center wt-small-separator-outer">
                <div className="wt-small-separator site-text-primary">
                    <div>Top Jobs</div>
                </div>
                <h2 className="wt-title">Related Jobs</h2>
            </div>
            {/* title="" END*/}
            <div className="container">
                <div className="section-content">
                    <div className="owl-carousel twm-related-jobs-carousel owl-btn-vertical-center">
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">1 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4>Senior Web Designer , Developer</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹2500 <span>/ Month</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">15 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-brown">Intership</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4>Senior Rolling Stock Technician</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹7 <span>/ Hour</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">6 Month ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-purple">Fulltime</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4 className="twm-job-title">IT Department Manager</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹2500 <span>/ Month</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">2 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-sky">Freelancer</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4 className="twm-job-title">Art Production Specialist</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹1800 <span>/ Month</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic5.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">1 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-golden">Temporary</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4 className="twm-job-title">Recreation &amp; Fitness Worker</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹1000 <span>/ Month</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">1 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4>Senior Web Designer , Developer</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹19 <span>/ Hour</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="twm-jobs-grid-style2">
                                <div className="twm-media">
                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                </div>
                                <span className="twm-job-post-duration">1 days ago</span>
                                <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                        <h4>Senior Web Designer , Developer</h4>
                                    </NavLink>
                                    <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                    <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-amount">₹2500 <span>/ Month</span></div>
                                    <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionRelatedJobs;
