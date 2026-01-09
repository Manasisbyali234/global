import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home10Page() {

    useEffect(()=>{
        updateSkinStyle("1", false, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home-10-banner-section twm-bne-10-skew" style={{ backgroundImage: `url(${publicUrlFor("images/home-10/banner-bg/pic1.jpg")})` }}>
                <div className="container">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12">
                            <div className="twm-bnr-left-section">
                                <div className="small-qb-box">
                                    <span className="qb-1" />
                                    <span className="qb-2 zoom-in-out-box" />
                                    <span className="qb-3 zoom-in-out-box2" />
                                    <span className="qb-4" />
                                </div>
                                <div className="twm-bnr-title-large-thin">We are</div>
                                <div className="twm-bnr-title-large-bold">Hiring Jobs</div>
                                <div className="twm-bnr-search-bar">
                                    <form>
                                        <div className="row">
                                            {/*Title*/}
                                            <div className="form-group col-xl-8 col-lg-8 col-md-8">
                                                <label>What</label>
                                                <div className="twm-single-iput">
                                                    <input name="username" type="text" required className="form-control  bg-none" placeholder="Job title, Keywords, or company" />
                                                </div>
                                            </div>
                                            {/*Find job btn*/}
                                            <div className="form-group col-xl-4 col-lg-4 col-md-4">
                                                <button type="button" className="site-button">Find Job</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="twm-bnr-popular-search">
                                    <span className="twm-title">Popular Searches</span>
                                    <NavLink to={publicUser.jobs.LIST}>Developer</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Designer</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Architect</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Engineer</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>PHP</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Banking</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Ios</NavLink> ,
                                    <NavLink to={publicUser.jobs.LIST}>Accountancy</NavLink>...
                                </div>
                            </div>
                        </div>
                        {/*right Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
                            <div className="twm-bnr-right-content">
                                <div className="bnr-media-wrap">
                                    <div className="bnr-media">
                                        <JobZImage src="images/home-10/banner-bg/right-pic1.jpg" alt="#" />
                                    </div>
                                    <div className="semi-circle rotate-center-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-bnr-bottom-section">
                        <div className="twm-browse-jobs">Search</div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* HOW IT WORK SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-how-it-work-area2">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-12">
                            {/* title="" START*/}
                            <div className="section-head left wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <div>How It Works for Candidates </div>
                                </div>
                                <h2 className="wt-title">Follow our steps we will help you.</h2>
                            </div>
                            <ul className="description-list">
                                <li>
                                    <i className="feather-check" />
                                    Trusted &amp; Quality Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    International Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    No Extra Charge
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    Top Companies
                                </li>
                            </ul>
                            {/* title="" END*/}
                        </div>
                        <div className="col-lg-8 col-md-12">
                            <div className="twm-w-process-steps-2-wrap">
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-sky-light bg-sky-light-shadow">
                                                <span className="twm-large-number text-clr-sky">01</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Register<br />Your Account</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-yellow-light bg-yellow-light-shadow">
                                                <span className="twm-large-number text-clr-yellow">02</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon4.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Search <br />
                                                    Your Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-pink-light bg-pink-light-shadow">
                                                <span className="twm-large-number text-clr-pink">03</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Apply <br />For Dream Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-green-light bg-clr-light-shadow">
                                                <span className="twm-large-number text-clr-green">04</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Upload <br />Your Resume</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-how-it-work-section">
                    </div>
                </div>
            </div>
            {/* HOW IT WORK SECTION END */}
            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-job-categories-area2">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs by Categories</div>
                    </div>
                    <h2 className="wt-title">Choose Your Desire Category</h2>
                </div>
                {/* title="" END*/}
                <div className="container">
                    <div className="twm-job-categories-section-2">
                        <div className="job-categories-style1 m-b30">
                            <div className="row">
                                {/* COLUMNS 1 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Business Development</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 2 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Project Management</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 3 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">2,100 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 4 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">1,500 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Costomer Services</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 5 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Finance</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 6 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Marketing</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 7 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-computer" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">2,100 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Design &amp; Art</NavLink>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 8 */}
                                <div className="col-lg-3 col-md-6">
                                    <div className="job-categories-block-2 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-coding" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">1,500 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Web Development</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center job-categories-btn">
                            <NavLink to={publicUser.jobs.LIST} className=" site-button">All Categories</NavLink>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOBS CATEGORIES SECTION END */}
            {/* TOP COMPANIES START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-companies-wrap">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Top Companies</div>
                    </div>
                    <h2 className="wt-title">Get hired in top companies</h2>
                </div>
                {/* title="" END*/}
                <div className="container">
                    <div className="section-content">
                        <div className="owl-carousel home-client-carousel3 owl-btn-vertical-center">
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w1.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w2.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w3.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w4.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w5.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w6.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w1.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w2.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w3.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo2/w5.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-company-approch2-outer">
                        <div className="twm-company-approch2">
                            <div className="row">
                                {/*block 1*/}
                                <div className="col-lg-4 col-md-4">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-black">
                                                <span className="counter">
<CountUp end={5} duration={10} />
</span>M+</div>
                                            <p className="icon-content-info">Million daily active users</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 2*/}
                                <div className="col-lg-4 col-md-4">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-black">
                                                <span className="counter">
<CountUp end={9} duration={10} />
</span>K+</div>
                                            <p className="icon-content-info">Open job positions</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 3*/}
                                <div className="col-lg-4 col-md-4">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-black">
                                                <span className="counter">
<CountUp end={2} duration={10} />
</span>M+</div>
                                            <p className="icon-content-info">Million stories shared</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* TOP COMPANIES END */}
            {/* JOB POST START */}
            <div className="section-full p-t120 p-b90 site-bg-light-purple twm-bg-ring-wrap">
                <div className="twm-bg-ring-right" />
                <div className="twm-bg-ring-left" />
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>All Jobs Post</div>
                        </div>
                        <h2 className="wt-title">Find Your Career You Deserve it</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-jobs-list-wrap">
                            <ul>
                                <li>
                                    <div className="twm-jobs-list-style1 mb-5">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Senior Web Designer , Developer  <span className="twm-job-post-duration">/ 1 days ago</span></h4>
                                            </NavLink>
                                            <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                                            <div className="twm-jobs-amount">$2500 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="twm-jobs-list-style1 mb-5">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Need Senior Rolling Stock Technician<span className="twm-job-post-duration">/ 15 days ago</span></h4>
                                            </NavLink>
                                            <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-jobs-category green"><span className="twm-bg-brown">Intership</span></div>
                                            <div className="twm-jobs-amount">$2000<span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="twm-jobs-list-style1 mb-5">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4 className="twm-job-title">IT Department Manager &amp; Blogger-Entrepenour  <span className="twm-job-post-duration">/ 6 Month ago</span></h4>
                                            </NavLink>
                                            <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-jobs-category green"><span className="twm-bg-purple">Fulltime</span></div>
                                            <div className="twm-jobs-amount">$1500 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="twm-jobs-list-style1 mb-5">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4 className="twm-job-title">Art Production Specialist   <span className="twm-job-post-duration">/ 2 days ago</span></h4>
                                            </NavLink>
                                            <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-jobs-category green"><span className="twm-bg-sky">Freelancer</span></div>
                                            <div className="twm-jobs-amount">$1200<span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="twm-jobs-list-style1 mb-5">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic5.jpg" alt="#" />
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4 className="twm-job-title">Recreation &amp; Fitness Worker   <span className="twm-job-post-duration">/ 1 days ago</span></h4>
                                            </NavLink>
                                            <p className="twm-job-address">1363-1385 Sunset Blvd Los Angeles, CA 90026, USA</p>
                                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-jobs-category green"><span className="twm-bg-golden">Temporary</span></div>
                                            <div className="twm-jobs-amount">$1700 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div className="text-center m-b30">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">Browse All Jobs</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOB POST END */}
            {/* EXPLORE NEW LIFE START */}
            <div className="section-full p-t120 p-b120 site-bg-white twm-explore-area2">
                <div className="container">
                    <div className="section-content">
                        <div className="twm-explore-content-2">
                            <div className="row">
                                <div className="col-lg-8 col-md-12">
                                    <div className="twm-explore-content-outer2">
                                        <div className="twm-explore-top-section">
                                            <div className="twm-title-small">For Employee</div>
                                            <div className="twm-title-large">
                                                <h2>We help you connect
                                                    with the organizer</h2>
                                                <p>Get paid easily and security. Use our resources to become
                                                    independent and showcase your professional skills.</p>
                                            </div>
                                            <div className="twm-read-more">
                                                <NavLink to={publicUser.pages.ABOUT} className="site-button">Read More</NavLink>
                                            </div>
                                        </div>
                                        <div className="twm-explore-bottom-section">
                                            <div className="row">
                                                {/*block 1*/}
                                                <div className="col-lg-4 col-md-6">
                                                    <div className="counter-outer-two">
                                                        <div className="icon-content">
                                                            <div className="tw-count-number text-clr-yellow-2">
                                                                <span className="counter">
<CountUp end={5} duration={10} />
</span>M+</div>
                                                            <p className="icon-content-info">Million daily active users</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*block 2*/}
                                                <div className="col-lg-4 col-md-6">
                                                    <div className="counter-outer-two">
                                                        <div className="icon-content">
                                                            <div className="tw-count-number text-clr-green">
                                                                <span className="counter">
<CountUp end={9} duration={10} />
</span>K+</div>
                                                            <p className="icon-content-info">Open job positions</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*block 3*/}
                                                <div className="col-lg-4 col-md-12">
                                                    <div className="counter-outer-two">
                                                        <div className="icon-content">
                                                            <div className="tw-count-number text-clr-pink">
                                                                <span className="counter">
<CountUp end={2} duration={10} />
</span>M+</div>
                                                            <p className="icon-content-info">Million stories shared</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-12">
                                    <div className="twm-explore-media-wrap2">
                                        <div className="twm-media">
                                            <JobZImage src="images/gir-large-2.png" alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* EXPLORE NEW LIFE END */}
        </>
    )
}

export default Home10Page;
