import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, default_skin, updateSkinStyle } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home7Page() {

    useEffect(()=>{
        updateSkinStyle(default_skin, true, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home7-banner-section site-bg-white bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/h7-banner.jpg")})` }}>
                <div className="container">
                    <div className="twm-home7-inner-section">
                        <div className="twm-bnr-mid-section">
                            <div className="twm-bnr-title-large">Find Top IT <span className="text-clr-pink">Jobs</span></div>
                            <div className="twm-bnr-title-light">For talent Developers</div>
                            <div className="twm-bnr-search-bar">
                                <form>
                                    <div className="row">
                                        {/*Title*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>What</label>
                                            <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                                                <option disabled value="">Select Category</option>
                                                <option>Job Title</option>
                                                <option>Web Designer</option>
                                                <option>Developer</option>
                                                <option>Acountant</option>
                                            </select>
                                        </div>
                                        {/*All Category*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>Type</label>
                                            <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                                                <option disabled value="">Select Category</option>
                                                <option>All Category</option>
                                                <option>Web Designer</option>
                                                <option>Developer</option>
                                                <option>Acountant</option>
                                            </select>
                                        </div>
                                        {/*Location*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <label>Location</label>
                                            <div className="twm-inputicon-box">
                                                <input name="username" type="text" required className="form-control" placeholder="Location" />
                                                <i className="twm-input-icon fas fa-map-marker-alt" />
                                            </div>
                                        </div>
                                        {/*Find job btn*/}
                                        <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                            <button type="button" className="site-button">Find Job</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
                        </div>
                    </div>
                    <div className="twm-bnr-bottom-section">
                        <div className="twm-browse-jobs">you deserve!</div>
                    </div>
                </div>
                <div className="twm-bnr-h-page7-jobs">
                    <div className="twm-hed-title">
                        <h4 className="twm-title">jobs at a glance</h4>
                    </div>
                    <div className="twm-bnr-h7-carousal">
                        <div className="swiper h-page7-jobs-slider">
                            <div className="swiper-wrapper">
                                <div className="swiper-slide">
                                    {/*1*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-hr" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">45 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Human Resource</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*2*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-user" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">70 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Management</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*3*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-bank" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">65 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Accountant</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*4*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-dashboard" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">55 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*5*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-dashboard" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">55 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*6*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-bars" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">55 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sales</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*7*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-project-management" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">86 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Educational</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*8*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-project-management" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">86 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Educational</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*9*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-coding" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">86 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>UI/UX Designer</NavLink>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    {/*10*/}
                                    <div className="job-categories-home-7">
                                        <div className="job-categories-home-7-top">
                                            <div className="twm-media cat-bg-clr-3">
                                                <div className="flaticon-camera-tripod" />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">86 Jobs</div>
                                            </div>
                                        </div>
                                        <NavLink to={publicUser.jobs.DETAIL1}>Media Reporter</NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* Recommended Jobs SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-recommended-Jobs-wrap7">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs Category</div>
                                    </div>
                                    <h2 className="wt-title">Recommended Jobs</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">All Jobs</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-recommended-Jobs-mid-wrap">
                    <div className="twm-recommended-Jobs-mid">
                        <div className="container">
                            <div className="filter-carousal">
                                {/* Filter Menu */}
                                <div className="twm-jobs-filter">
                                    <ul className="btn-filter-wrap">
                                        <li className="btn-filter btn-active" data-filter="*">All</li>
                                        <li className="btn-filter" data-filter=".col-one">Full-time</li>
                                        <li className="btn-filter" data-filter=".col-two">Part time</li>
                                        <li className="btn-filter" data-filter=".col-three">Monthly</li>
                                    </ul>
                                </div>
                                {/* Filter Menu */}
                                {/* IMAGE CAROUSEL START */}
                                <div className="section-content ">
                                    <div className="owl-carousel owl-carousel-filter mfp-gallery owl-btn-vertical-center">
                                        {/* COLUMNS 1 */}
                                        <div className="item  col-one">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/instagram.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Instagram</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">Backend Developer</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* COLUMNS 2 */}
                                        <div className="item  col-two">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/facebook.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Facebook</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">Web Developer</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* COLUMNS 3 */}
                                        <div className="item  col-three">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/google.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Google</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">SEO &amp; QA</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* COLUMNS 4 */}
                                        <div className="item  col-three">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/behance.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Behance</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">UI/UX Designer</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* COLUMNS 5 */}
                                        <div className="item  col-four col-two">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/pinterest.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Pinterest</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">Content Writer</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* COLUMNS 6 */}
                                        <div className="item  col-five">
                                            <div className="hpage-7-featured-block">
                                                <div className="inner-content">
                                                    <div className="top-content-wrap">
                                                        <div className="top-content">
                                                            <span className="job-time">Full Time</span>
                                                            <span className="job-post-time">1 Day ago</span>
                                                        </div>
                                                        <div className="mid-content">
                                                            <div className="company-logo">
                                                                <JobZImage src="images/home-6/featured-jobs/yahoo.png" alt="#" />
                                                            </div>
                                                            <div className="company-info">
                                                                <NavLink to={publicUser.jobs.DETAIL1} className="company-name">Yahoo!</NavLink>
                                                                <p className="company-address">Washington U.S.A.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bottom-content">
                                                        <h4 className="job-name-title">Team Leader</h4>
                                                        <div className="job-payment">
                                                            <span>$130</span>/ Month
                                                        </div>
                                                    </div>
                                                    <div className="aply-btn-area">
                                                        <NavLink to={publicUser.jobs.DETAIL2} className="aplybtn">
                                                            <i className="fa fa-check" />
                                                        </NavLink>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Recommended Jobs SECTION END */}
            {/* HOW TO GET YOUR JOB SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-how-t-get-wrap7">
                <div className="container">
                    <div className="twm-how-t-get-section">
                        <div className="row">
                            <div className="col-xl-5 col-lg-5 col-md-12">
                                <div className="twm-how-t-get-section-left">
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <div>How to get your job</div>
                                        </div>
                                        <h2 className="wt-title">Build Your Personal Account Profile</h2>
                                        <p>Create an account for job information that you wanted, get notification
                                            everyday and you can easily apply directly to the company you want
                                            create and account now for free.</p>
                                    </div>
                                    <div className="twm-how-t-get-bottom">
                                        <NavLink to={publicUser.pages.ABOUT} className="site-button">Edit Profile</NavLink>
                                        <div className="twm-left-icon-bx">
                                            <div className="twm-left-icon-media site-bg-primary">
                                                <i className="flaticon-bell site-text-white" />
                                            </div>
                                            <div className="twm-left-icon-content">
                                                <h4 className="icon-title">New Interview</h4>
                                                <p>You has new interview today</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-7 col-lg-7 col-md-12">
                                <div className="twm-how-t-get-section-right">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-7/hig-pic.png" alt="#" />
                                    </div>
                                    <div className="twm-left-img-bx bounce">
                                        <div className="twm-left-img-media">
                                            <JobZImage src="images/home-7/img-bx/pic1.jpg" alt="#" />
                                        </div>
                                        <div className="twm-left-img-content">
                                            <h4 className="icon-title">Complete your profile</h4>
                                            <p>95% Completed</p>
                                        </div>
                                    </div>
                                    <div className="twm-profile-card bounce2">
                                        <div className="twm-profile-pic"><JobZImage src="images/home-7/img-bx/pic3.jpg" alt="#" /></div>
                                        <div className="twm-profile-info">
                                            <h4 className="twm-profile-name">
                                                Devid Smith
                                            </h4>
                                            <div className="twm-profile-position">UI/UX Designer</div>
                                            <a className="site-button-link underline">Hire Me!</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* HOW TO GET YOUR JOB SECTION END */}
            {/* HOW IT WORK SECTION START */}
            <div className="section-full p-t120 p-b90 twm-how-it-work-area" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/hiw-bg.jpg")})` }}>
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer  content-white">
                        <div className="wt-small-separator">
                            <div>for candidates</div>
                        </div>
                        <h2 className="wt-title">Follow Our Steps, We Will Help You</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-how-it-work-section3">
                        <div className="row">
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps-h-page-7">
                                    <div className="twm-w-pro-top">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                        </div>
                                        <span className="twm-large-number  text-clr-sky">01</span>
                                    </div>
                                    <h4 className="twm-title">Register Your Account</h4>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps-h-page-7">
                                    <div className="twm-w-pro-top">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon2.png" alt="icon1" /></span>
                                        </div>
                                        <span className="twm-large-number text-clr-pink">02</span>
                                    </div>
                                    <h4 className="twm-title">Apply For Dream Job</h4>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps-h-page-7">
                                    <div className="twm-w-pro-top">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                        </div>
                                        <span className="twm-large-number  text-clr-green">03</span>
                                    </div>
                                    <h4 className="twm-title">Upload Your Resume</h4>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* HOW IT WORK SECTION END */}
            {/* CANDIDATES START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-candidate-h-page7-wrap pos-relative ">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Candidates</div>
                        </div>
                        <h2 className="wt-title">Featured Candidates</h2>
                    </div>
                    {/* title="" END*/}
                </div>
                <div className="container-fluid">
                    <div className="section-content">
                        <div className="twm-candidate-h-page7">
                            <div className="row d-flex justify-content-center m-b30">
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Wanda Smith</h4>
                                                </NavLink>
                                                <p>Charted Accountant</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$20<span>/ Day</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic2.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Peter Hawkins</h4>
                                                </NavLink>
                                                <p>Medical Professed</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$7<span>/ Hour</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic3.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Ralph Johnson</h4>
                                                </NavLink>
                                                <p>Bank Manger</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$180<span>/ Day</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic4.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Randall Henderson </h4>
                                                </NavLink>
                                                <p>IT Contractor</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$90<span>/ Week</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic5.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Randall Warren</h4>
                                                </NavLink>
                                                <p>Digital &amp; Creative</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$95<span>/ Day</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic6.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Christina Fischer </h4>
                                                </NavLink>
                                                <p>Charity &amp; Voluntary</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$19<span>/ Hour</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic7.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Wanda Willis </h4>
                                                </NavLink>
                                                <p>Marketing &amp; PR</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$12<span>/ Day</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="twm-candidates-grid-h-page7 m-b30">
                                        <div className="twm-top-section-content">
                                            <div className="twm-media">
                                                <div className="twm-media-pic">
                                                    <JobZImage src="images/candidates/pic8.jpg" alt="#" />
                                                </div>
                                            </div>
                                            <div className="twm-mid-content">
                                                <div className="twm-candidates-tag"><span>Featured</span></div>
                                                <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                    <h4>Peter Hawkins</h4>
                                                </NavLink>
                                                <p>Public Sector</p>
                                            </div>
                                        </div>
                                        <div className="twm-fot-content">
                                            <div className="twm-left-info">
                                                <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                <div className="twm-jobs-vacancies">$7<span>/ Hour</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center m-b30">
                                <NavLink to={publicUser.candidate.LIST} className=" site-button">All  Candidates</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-bg-candi-pattern" />
                <div className="container">
                    <div className="twm-j-ofr-wrap">
                        <div className="twm-j-ofr-content" style={{ backgroundImage: `url(${publicUrlFor("images/home-7/ofr-bg.jpg")})` }}>
                            <div className="row">
                                <div className="col-lg-7 col-md-12">
                                    <div className="twm-j-ofr-map-content">
                                        {/* title="" START*/}
                                        <div className="section-head left wt-small-separator-outer">
                                            <h2 className="wt-title">We also have <span className="site-text-primary">job offers</span> in other countries</h2>
                                        </div>
                                        {/* title="" END*/}
                                        <div className="twm-j-ofr-map-list">
                                            <ul>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/denmark.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Denmark</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/france.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">France</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/netherlands.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Netherlands</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/poland.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Poland</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/portugal.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Portugal</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/spain.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Spain</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/turkey.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">Turkey</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/uae.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">UAE</h4>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="flag-list">
                                                        <span><JobZImage src="images/home-7/flag-icon/united-kingdom.jpg" alt="#" /></span>
                                                        <h4 className="flat-name">UK</h4>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="twm-read-more">
                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">More Offers</NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-12">
                                    <div className="twm-j-ofr-map">
                                        <div className="twm-media">
                                            <JobZImage src="images/home-7/map-img.png" alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* CANDIDATES END */}
            {/* TOP COMPANIES START */}
            <div className="section-full p-t120 p-b0 site-bg-white twm-companies-wrap twm-companies-wrap-h-page-7 pos-relative">
                <div className="twm-companies-wrap-bg-block" />
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer content-white">
                    <div className="wt-small-separator site-text-primary">
                        <div>Top Companies</div>
                    </div>
                    <h2 className="wt-title">Get hired in top companies</h2>
                </div>
                {/* title="" END*/}
                <div className="container ">
                    <div className="twm-companies-h-page-7">
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
                                                <div className="tw-count-number site-text-primary">
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
                                                <div className="tw-count-number site-text-primary">
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
                                                <div className="tw-count-number site-text-primary">
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
            </div>
            {/* TOP COMPANIES END */}
            {/* OUR BLOG START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Our Blogs</div>
                        </div>
                        <h2 className="wt-title">Latest Article</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-blog-post-3-outer-wrap">
                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    {/*Block one*/}
                                    <div className="blog-post twm-blog-post-3-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg10.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>Mark Petter</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>How to convince recruiters.</NavLink>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    {/*Block two*/}
                                    <div className="blog-post twm-blog-post-3-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg11.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>David Wish</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the March.</NavLink>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6 col-sm-12">
                                    {/*Block three*/}
                                    <div className="blog-post twm-blog-post-3-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg12.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">March 05, 2023</li>
                                                    <li className="post-author">By <NavLink to={publicUser.candidate.DETAIL1}>Mike Doe</NavLink></li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>Job Board is the most important</NavLink>
                                                </h4>
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
            {/* Testimonial START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-testimonial-page7-wrap">
                <div className="container">
                    <div className="twm-testimonial-page7-section">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-testimonial-page7-left">
                                    {/* title="" START*/}
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <div>Testimonials</div>
                                        </div>
                                        <h2 className="wt-title">Jobseeker reviews through <span className="site-text-primary">Jobzilla</span></h2>
                                    </div>
                                    {/* title="" END*/}
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-testimonial-page7-right">
                                    <div className="testimonial-thumb-1-wrap">
                                        <div className="swiper testimonial-thumb-1">
                                            <div className="swiper-wrapper">
                                                {/*1*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-content">
                                                        <div className="t-testimonial-top">
                                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                                        </div>
                                                        <div className="t-discription">I just got a job that I applied for via careerfy! I used the site all the time
                                                            during my job hunt.get notification everyday and you can easily apply
                                                            directly to the company you want create and account now for free.</div>
                                                        <div className="twm-testi-detail">
                                                            <div className="twm-testi-name">Guy Hawkins</div>
                                                            <div className="twm-testi-position">Software Engineering at Google</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*2*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-content">
                                                        <div className="t-testimonial-top">
                                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                                        </div>
                                                        <div className="t-discription">I just got a job that I applied for via careerfy! I used the site all the time
                                                            during my job hunt.get notification everyday and you can easily apply
                                                            directly to the company you want create and account now for free.</div>
                                                        <div className="twm-testi-detail">
                                                            <div className="twm-testi-name">Collis Pong</div>
                                                            <div className="twm-testi-position">UI/UX Designer</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*3*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-content">
                                                        <div className="t-testimonial-top">
                                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                                        </div>
                                                        <div className="t-discription">I just got a job that I applied for via careerfy! I used the site all the time
                                                            during my job hunt.get notification everyday and you can easily apply
                                                            directly to the company you want create and account now for free.</div>
                                                        <div className="twm-testi-detail">
                                                            <div className="twm-testi-name">Nikola Tesla</div>
                                                            <div className="twm-testi-position">Accountant</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*4*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-content">
                                                        <div className="t-testimonial-top">
                                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                                        </div>
                                                        <div className="t-discription">I just got a job that I applied for via careerfy! I used the site all the time
                                                            during my job hunt.get notification everyday and you can easily apply
                                                            directly to the company you want create and account now for free.</div>
                                                        <div className="twm-testi-detail">
                                                            <div className="twm-testi-name">Peter Hawkins</div>
                                                            <div className="twm-testi-position">Medical Professed</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div thumbsslider="" className="swiper testimonial-thumbpic-1">
                                            <div className="swiper-wrapper">
                                                {/*thumb-1*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-media">
                                                        <JobZImage src="images/home-6/testimonial/pic1.jpg" alt="#" />
                                                    </div>
                                                </div>
                                                {/*thumb-2*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-media">
                                                        <JobZImage src="images/home-6/testimonial/pic2.jpg" alt="#" />
                                                    </div>
                                                </div>
                                                {/*thumb-3*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-media">
                                                        <JobZImage src="images/home-6/testimonial/pic3.jpg" alt="#" />
                                                    </div>
                                                </div>
                                                {/*thumb-4*/}
                                                <div className="swiper-slide">
                                                    <div className="twm-testi-media">
                                                        <JobZImage src="images/home-6/testimonial/pic2.jpg" alt="#" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-outline-text">
                            <span>Testimonial</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Testimonial END */}
        </>
    )
}

export default Home7Page;
