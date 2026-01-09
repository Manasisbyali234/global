import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home11Page() {

    useEffect(()=>{
        updateSkinStyle("2", false, true)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home-11-banner-section">
                <div className="container">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12">
                            <div className="twm-bnr-left-section">
                                <div className="twm-bnr-title-large">It’s Easy to Find Your <span className="site-text-primary">Dream Job </span></div>
                                <div className="twm-bnr-discription">You dream job is waiting for you.</div>
                                <div className="twm-bnr-search-bar">
                                    <form>
                                        <div className="row">
                                            {/*All Category*/}
                                            <div className="form-group col-xl-4 col-lg-12 col-md-12">
                                                <label>Type</label>
                                                <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                                                    <option>Select Category</option>
                                                    <option>All Category</option>
                                                    <option>Web Designer</option>
                                                    <option>Developer</option>
                                                    <option>Acountant</option>
                                                </select>
                                            </div>
                                            {/*Location*/}
                                            <div className="form-group col-xl-5 col-lg-12 col-md-12">
                                                <label>Location</label>
                                                <div className="twm-inputicon-box">
                                                    <input name="username" type="text" required className="form-control" placeholder="Search..." />
                                                    <i className="twm-input-icon fas fa-map-marker-alt" />
                                                </div>
                                            </div>
                                            {/*Find job btn*/}
                                            <div className="form-group col-xl-3 col-lg-6 col-md-6 col-sm-6">
                                                <button type="button" className="site-button">Find Job</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="twm-bnr-5-blocks">
                                    <span className="twm-title">Our More Candidates</span>
                                    <div className="twm-bnr-5-blocks-inner">
                                        <div className="twm-pics">
                                            <span><JobZImage src="images/main-slider/slider1/user/u-1.jpg" alt="" /></span>
                                            <span><JobZImage src="images/main-slider/slider1/user/u-2.jpg" alt="" /></span>
                                            <span><JobZImage src="images/main-slider/slider1/user/u-3.jpg" alt="" /></span>
                                            <span><JobZImage src="images/main-slider/slider1/user/u-4.jpg" alt="" /></span>
                                            <span><JobZImage src="images/main-slider/slider1/user/u-5.jpg" alt="" /></span>
                                            <span><JobZImage src="images/main-slider/slider1/user/u-6.jpg" alt="" /></span>
                                        </div>
                                        <div className="twm-content">
                                            <div className="tw-count-number text-clr-green">
                                                <span className="counter">
<CountUp end={5000} duration={10} />
</span>+
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*right Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-main">
                            <div className="twm-bnr-right-content">
                                <div className="bnr-media-wrap">
                                    <div className="bnr-media">
                                        <JobZImage src="images/home-11/banner-bg/right-pic1.jpg" alt="#" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* ABOUT SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-about-1-area">
                <div className="container">
                    <div className="twm-about-1-section-wrap">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-about-1-section">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-11/about-pic1.png" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-about-1-section-right">
                                    {/* title="" START*/}
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <div>About </div>
                                        </div>
                                        <h2 className="wt-title">Millions of jobs. Find the
                                            one that’s right for you.</h2>
                                    </div>
                                    {/* title="" END*/}
                                    <ul className="description-list">
                                        <li>
                                            <i className="feather-check" />
                                            Full lifetime access
                                        </li>
                                        <li>
                                            <i className="feather-check" />
                                            20+ downloadable resources
                                        </li>
                                        <li>
                                            <i className="feather-check" />
                                            Certificate of completion
                                        </li>
                                        <li>
                                            <i className="feather-check" />
                                            Free Trial 7 Days
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-about-1-bottom-wrap">
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                {/*icon-block-1*/}
                                <div className="twm-card-blocks">
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
                            </div>
                            <div className="col-lg-4 col-md-6">
                                {/*icon-block-2*/}
                                <div className="twm-card-blocks-2">
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
                            <div className="col-lg-4 col-md-6">
                                {/*icon-block-3*/}
                                <div className="twm-card-blocks">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ABOUT SECTION END */}
            {/* HOW TO GET YOUR JOB SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-light twm-how-t-get-wrap7">
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
                                        <JobZImage src="images/home-8/hig-pic2.png" alt="#" />
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
            {/* Jobs Category START */}
            <div className="section-full p-t120 p-b90 site-bg-white job-categories-home-5-wrap twm-bdr-bottom-1">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Browse By Category</div>
                        </div>
                        <h2 className="wt-title">Find the job that’s perfect for you.</h2>
                    </div>
                    {/* title="" END*/}
                </div>
                <div className="section-content twm-jobs-grid-h5-section-outer">
                    <div className="twm-jobs-grid-h5-section overlay-wraper" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/cate-bg.jpg")})` }}>
                        <div className="overlay-main site-bg-primary opacity-09" />
                        <div className="swiper-container category-5-slider">
                            <div className="swiper-wrapper">
                                {/*1*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-deal" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sale</NavLink>
                                            <div className="twm-jobs-available">1526 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*2*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Customer Help</NavLink>
                                            <div className="twm-jobs-available">1526 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*3*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Finance</NavLink>
                                            <div className="twm-jobs-available">168 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*4*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                            <div className="twm-jobs-available">300 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*5*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-hr" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Human Resource</NavLink>
                                            <div className="twm-jobs-available">125 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*6*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Management</NavLink>
                                            <div className="twm-jobs-available">450 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*7*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Retail &amp; Products</NavLink>
                                            <div className="twm-jobs-available">95 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*8*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-repair" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Security Analyst</NavLink>
                                            <div className="twm-jobs-available">35 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*9*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer</NavLink>
                                            <div className="twm-jobs-available">200 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*10*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-coding" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Market Research</NavLink>
                                            <div className="twm-jobs-available">140 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*11*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-job" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sale</NavLink>
                                            <div className="twm-jobs-available">80 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*12*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-hr-manager" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Customer Help</NavLink>
                                            <div className="twm-jobs-available">160 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*13*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-deal" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sale</NavLink>
                                            <div className="twm-jobs-available">1526 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*14*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Customer Help</NavLink>
                                            <div className="twm-jobs-available">1526 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*15*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Finance</NavLink>
                                            <div className="twm-jobs-available">168 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*16*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                            <div className="twm-jobs-available">300 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*17*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-hr" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Human Resource</NavLink>
                                            <div className="twm-jobs-available">125 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*18*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Management</NavLink>
                                            <div className="twm-jobs-available">450 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*19*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Retail &amp; Products</NavLink>
                                            <div className="twm-jobs-available">95 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*20*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-repair" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Security Analyst</NavLink>
                                            <div className="twm-jobs-available">35 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*21*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-3">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer</NavLink>
                                            <div className="twm-jobs-available">200 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*22*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-2">
                                            <div className="flaticon-coding" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Market Research</NavLink>
                                            <div className="twm-jobs-available">140 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*23*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-4">
                                            <div className="flaticon-job" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sale</NavLink>
                                            <div className="twm-jobs-available">80 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                                {/*24*/}
                                <div className="swiper-slide">
                                    <div className="job-categories-home-5">
                                        <div className="twm-media cat-bg-clr-1">
                                            <div className="flaticon-hr-manager" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Customer Help</NavLink>
                                            <div className="twm-jobs-available">160 Jobs Available</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Add Pagination */}
                            <div className="swiper-button-prev" />
                            <div className="swiper-button-next" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Recruiters END */}
            {/* OUR BLOG START */}
            <div className="section-full p-t120 p-b90 site-bg-light-purple">
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
            <div className="section-full p-t120 p-b90 site-bg-white twm-testimonial-page8-wrap">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Testimonials</div>
                        </div>
                        <h2 className="wt-title">Jobseeker reviews through Jobzilla.</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-testimonial-page8-section">
                        <div className="row">
                            <div className="col-lg-5 col-md-12">
                                <div className="twm-testimonial-page8-left">
                                    <div className="twm-media bounce2">
                                        <JobZImage src="images/home-8/testimonial-3d-pic.png" alt="#" />
                                    </div>
                                    <div className="testimonial-outline-text-small">
                                        <span>Jobseeker</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-testimonial-page8-right">
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
                                                            directly.</div>
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
                                                            directly.</div>
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
                                                            directly.</div>
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
                                                            directly.</div>
                                                        <div className="twm-testi-detail">
                                                            <div className="twm-testi-name">Peter Hawkins</div>
                                                            <div className="twm-testi-position">Medical Professed</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div thumbsslider className="swiper testimonial-thumbpic-1">
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
                    </div>
                </div>
            </div>
            {/* Testimonial END */}
        </>
    )
}

export default Home11Page;
