import { NavLink } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import { useEffect } from "react";
import CountUp from "react-countup";

function Home2Page() {

    useEffect(() => {
        loadScript("js/custom.js");
    })

    return (
        <>
            <div className="twm-home2-banner-section site-bg-gray bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/main-slider/slider2/bg1.jpg")})` }}>
                <div className="row">
                    {/*Left Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12">
                        <div className="twm-bnr-left-section">
                            <div className="twm-bnr-title-small">We Have <span className="site-text-secondry">208,000+</span> Live Jobs</div>
                            <div className="twm-bnr-title-large">Your <span className="site-text-primary">Dream Job </span> in one place</div>
                            <div className="twm-bnr-discription">Find jobs that match your interests with us. Jobzilla provides a place you to find your Job.</div>
                            <NavLink to={publicUser.jobs.LIST} className="site-button">Get Started</NavLink>
                        </div>
                    </div>
                    {/*right Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
                        <div className="twm-bnr2-right-content">
                            <div className="twm-img-bg-circle-area2">
                                <div className="twm-outline-ring-wrap">
                                    <div className="twm-outline-ring-dott-wrap">
                                        <span className="outline-dot-1" />
                                        <span className="outline-dot-2" />
                                        <span className="outline-dot-3" />
                                        {/*Samll Ring Left*/}
                                        <div className="twm-small-ring-l scale-up-center" />
                                    </div>
                                </div>
                            </div>
                            <div className="twm-home-2-bnr-images">
                                <div className="bnr-image-1">
                                    <JobZImage src="images/main-slider/slider2/right-pic-1.jpg" alt="" />
                                </div>
                                <div className="bnr-image-2">
                                    <JobZImage src="images/main-slider/slider2/right-pic-2.jpg" alt="" />
                                </div>
                                <div className="twm-small-ring-2 scale-up-center" />
                            </div>
                            {/*icon-block-1*/}
                            <div className="twm-bnr-blocks twm-bnr-blocks-position-1">
                                <div className="twm-icon">
                                    <JobZImage src="images/main-slider/slider2/icon-1.png" alt="" />
                                </div>
                                <div className="twm-content">
                                    <div className="tw-count-number text-clr-sky">
                                        <span className="counter">
                                            <CountUp end={12} duration={10} />    
                                        </span>K+
                                    </div>
                                    <p className="icon-content-info">Companies Jobs</p>
                                </div>
                            </div>
                            {/*icon-block-2*/}
                            <div className="twm-bnr-blocks twm-bnr-blocks-position-2">
                                <div className="twm-icon pink">
                                    <JobZImage src="images/main-slider/slider2/icon-2.png" alt="" />
                                </div>
                                <div className="twm-content">
                                    <div className="tw-count-number text-clr-pink">
                                        <span className="counter">
                                            <CountUp end={98} duration={10} />
                                        </span> +
                                    </div>
                                    <p className="icon-content-info">Job For Countries </p>
                                </div>
                            </div>
                            {/*icon-block-3*/}
                            <div className="twm-bnr-blocks-3 twm-bnr-blocks-position-3">
                                <div className="twm-pics">
                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                </div>
                                <div className="twm-content">
                                    <div className="tw-count-number text-clr-green">
                                        <span className="counter">
                                            <CountUp end={3} duration={10} />
                                        </span>K+
                                    </div>
                                    <p className="icon-content-info">Jobs Done</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Search Bar*/}
            <div className="twm-search-bar-2-wrap">
                <div className="container">
                    <div className="twm-search-bar-2-inner">
                        <div className="row">
                            <div className="col-lg-9 col-md-12">
                                <div className="twm-bnr-search-bar">
                                    <form>
                                        <div className="row">
                                            {/*Title*/}
                                            <div className="form-group col-lg-3 col-md-6">
                                                <label>What</label>
                                                <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                                                    <option disabled value="">Select Category</option>
                                                    <option selected>Job Title</option>
                                                    <option>Web Designer</option>
                                                    <option>Developer</option>
                                                    <option>Acountant</option>
                                                </select>
                                            </div>
                                            {/*All Category*/}
                                            <div className="form-group col-lg-3 col-md-6">
                                                <label>Type</label>
                                                <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                                                    <option disabled value="">Select Category</option>
                                                    <option selected>All Category</option>
                                                    <option>Web Designer</option>
                                                    <option>Developer</option>
                                                    <option>Acountant</option>
                                                </select>
                                            </div>
                                            {/*Location*/}
                                            <div className="form-group col-lg-3 col-md-6">
                                                <label>Location</label>
                                                <div className="twm-inputicon-box">
                                                    <input name="username" type="text" required className="form-control" placeholder="Location" />
                                                    <i className="twm-input-icon fas fa-map-marker-alt" />
                                                </div>
                                            </div>
                                            {/*Find job btn*/}
                                            <div className="form-group col-lg-3 col-md-6">
                                                <button type="button" className="site-button">Find Job</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-12">
                                <div className="twm-trusted-by-wrap">
                                    <div className="twm-trusted-by-title">Trusted By :</div>
                                    <div className="owl-carousel trusted-logo owl-btn-vertical-center">
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-1.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-2.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-3.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-1.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-2.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="twm-trusted-logo">
                                                <NavLink to={publicUser.employer.LIST}>
                                                    <JobZImage src="images/trusted/logo-3.png" alt="" />
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="twm-bnr-popular-search">
                            <span className="twm-title">Popular Searches:</span>
                            <NavLink to={publicUser.jobs.LIST}>Developer</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Designer</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Architect</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Engineer</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>PHP</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Banking</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Ios</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Freelance</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Writing</NavLink> ,
                            <NavLink to={publicUser.jobs.LIST}>Accountancy</NavLink>...
                        </div>
                    </div>
                </div>
            </div>
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

            {/* JOB POST START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-bg-ring-wrap2">
                <div className="twm-bg-ring-right" />
                <div className="twm-bg-ring-left" />
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>All Jobs Post</div>
                                    </div>
                                    <h2 className="wt-title">Find Your Career You Deserve it</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">Browse All Jobs</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="twm-jobs-grid-wrap">
                            <div className="row">
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1  m-b30">
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
                                            <div className="twm-jobs-amount">$2000 - $2500 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1 m-b30">
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
                                            <div className="twm-jobs-amount">$7 <span>/ Hour</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1  m-b30">
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
                                            <div className="twm-jobs-amount">$2000 - $2500 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1 m-b30">
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
                                            <div className="twm-jobs-amount">$1500 - $1800 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1  m-b30">
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
                                            <div className="twm-jobs-amount">$500 - $1000 <span>/ Month</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-grid-style1 m-b30">
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
                                            <div className="twm-jobs-amount">$19 <span>/ Hour</span></div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOB POST END */}
            
            {/* FOR EMPLOYEE START */}
            <div className="section-full p-t120 p-b120 twm-for-employee-area site-bg-white">
                <div className="container">
                    <div className="section-content">
                        <div className="row">
                            <div className="col-lg-5 col-md-12">
                                <div className="twm-explore-media-wrap">
                                    <div className="twm-media">
                                        <JobZImage src="images/boy-large.png" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-explore-content-outer-3">
                                    <div className="twm-explore-content-3">
                                        <div className="twm-title-small">Explore New Life</div>
                                        <div className="twm-title-large">
                                            <h2>Build your personal account profile</h2>
                                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry
                                                the standard dummy text ever since the  when an printer took. lorem Ipsum is
                                                simply dummy text of the printing and typesetting industry.</p>
                                        </div>
                                        <div className="twm-upload-file">
                                            <button type="button" className="site-button">Upload Your Resume <i className="feather-upload" /></button>
                                        </div>
                                    </div>
                                    <div className="twm-l-line-1" />
                                    <div className="twm-l-line-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* FOR EMPLOYEE END */}
            {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-testimonial-2-area">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Clients Testimonials</div>
                    </div>
                    <h2 className="wt-title">What Our Customers Say About Us</h2>
                </div>
                {/* title="" END*/}
                <div className="container">
                    <div className="section-content">
                        <div className="owl-carousel twm-testimonial-2-carousel owl-btn-bottom-center ">
                            {/* COLUMNS 1 */}
                            <div className="item ">
                                <div className="twm-testimonial-2">
                                    <div className="twm-testimonial-2-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-1.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 2 */}
                            <div className="item ">
                                <div className="twm-testimonial-2">
                                    <div className="twm-testimonial-2-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-2.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Collis Pong</div>
                                                <div className="twm-testi-position">UI/UX Designer</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 3 */}
                            <div className="item ">
                                <div className="twm-testimonial-2">
                                    <div className="twm-testimonial-2-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-3.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 4 */}
                            <div className="item ">
                                <div className="twm-testimonial-2">
                                    <div className="twm-testimonial-2-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-4.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Collis Pong</div>
                                                <div className="twm-testi-position">UI/UX Designer</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* TESTIMONIAL SECTION END */}
            {/* OUR BLOG START */}
            <div className="section-full p-t120 p-b90 site-bg-gray bg-cover overlay-wraper" style={{ backgroundImage: `url(${publicUrlFor("images/background/bg-2.jpg")})` }}>
                <div className="overlay-main site-bg-primary opacity-01" />
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Our Blogs</div>
                        </div>
                        <h2 className="wt-title site-text-white">Latest Article</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-5 col-md-12 m-b30">
                                {/*Block one*/}
                                <div className="blog-post twm-blog-post-2-outer">
                                    <div className="wt-post-media">
                                        <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest-2/l-1.jpg" alt="" /></NavLink>
                                    </div>
                                    <div className="wt-post-info">
                                        <div className="wt-post-meta ">
                                            <ul>
                                                <li className="post-date">April 05, 2023</li>
                                            </ul>
                                        </div>
                                        <div className="wt-post-title ">
                                            <h4 className="post-title">
                                                <NavLink to={publicUser.blog.DETAIL}>
                                                    How to convince recruiters and get your
                                                    dream job. Get behind the wheel!
                                                </NavLink>
                                            </h4>
                                        </div>
                                        <div className="wt-post-readmore ">
                                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-secondry">Read More</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-blog-post-wrap-right">
                                    {/*Block two*/}
                                    <div className="blog-post twm-blog-post-1-outer shadow-none  m-b30">
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>David Wish</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the March
                                                        2023 jobs report</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis.
                                                </p>
                                            </div>
                                            <div className="wt-post-readmore ">
                                                <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Block three*/}
                                    <div className="blog-post twm-blog-post-1-outer shadow-none  m-b30">
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>Mike Doe</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>Job Board is the most important
                                                        sector in the world</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis.
                                                </p>
                                            </div>
                                            <div className="wt-post-readmore ">
                                                <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Block four*/}
                                    <div className="blog-post twm-blog-post-1-outer shadow-none  m-b30">
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>David Wish</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the March
                                                        2023 jobs report</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis.
                                                </p>
                                            </div>
                                            <div className="wt-post-readmore ">
                                                <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* OUR BLOG END */}
        </>
    )
}

export default Home2Page;
