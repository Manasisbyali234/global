import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home9Page() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home-9-banner-section" style={{ backgroundImage: `url(${publicUrlFor("images/home-9/banner-bg/pic1.jpg")})` }}>
                <div className="container">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-7 col-lg-12 col-md-12">
                            <div className="twm-bnr-left-section">
                                <div className="twm-bnr-title-large">
                                    <span>Find Your</span>
                                    <span className="typewrite site-text-primary" data-period={2000} data-type="[ &quot;Dream Job&quot; , &quot;Next Job&quot;]" />
                                    <div><span>Now It’s Easy.</span> </div>
                                </div>
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
                        <div className="col-xl-5 col-lg-12 col-md-12 twm-bnr-right-section">
                            <div className="twm-bnr-right-content">
                                <div className="bnr-media">
                                    <JobZImage src="images/home-9/banner-bg/right-pic1.png" alt="#" />
                                </div>
                                <div className="slider-thumb-wrap">
                                    <div className="slider-thumb" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full twm-job-categories-carousal-area-9">
                <div className="container">
                    <div className="twm-job-categories-carousal-section">
                        <div className="owl-carousel twm-job-categories-carousal">
                            {/* COLUMNS 1 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Business Development</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 2 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Project Management</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 3 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">2,100 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer &amp; Blogging</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 4 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">1,500 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Costomer Services</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 5 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Accounting Finance</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 6 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Sales and Marketing</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 7 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Business Development</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 8 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Project Management</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 9 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">2,100 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer &amp; Blogging</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 10 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">1,500 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Costomer Services</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 11 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">9,185 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Accounting Finance</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 12 */}
                            <div className="item">
                                <div className="job-categories-3-wrap">
                                    <div className="job-categories-3">
                                        <div className="twm-media">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <div className="twm-jobs-available">3,205 Jobs</div>
                                            <NavLink to={publicUser.jobs.DETAIL1}>Sales and Marketing</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOBS CATEGORIES SECTION END */}
            {/* ABOUT SECTION START */}
            <div className="section-full p-t120 p-b90 twm-about-8-area">
                <div className="container">
                    <div className="twm-about-9-section-wrap">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-about-9-section">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-9/pic1.png" alt="" />
                                    </div>
                                    <div className="img-bg-circle" />
                                    {/*icon-block-2*/}
                                    <div className="twm-card-blocks-2 bounce2">
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
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-about-9-section-right">
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
                                    <div className="twm-about-1-bottom-wrap">
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6">
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
                                            <div className="col-lg-6 col-md-6">
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
                        </div>
                    </div>
                </div>
            </div>
            {/* ABOUT SECTION END */}
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
            <div className="section-full p-t120 p-b120 twm-for-employee-9-area site-bg-white">
                <div className="container">
                    <div className="section-content">
                        <div className="twm-for-employee-9">
                            <div className="row">
                                <div className="col-lg-5 col-md-12">
                                    <div className="twm-explore-9-media-wrap">
                                        <div className="twm-media">
                                            <JobZImage src="images/gir-large-2.png" alt="" />
                                            <div className="rectangle1-wrap">
                                                <div className="rectangle1 rotate-center" />
                                            </div>
                                            <div className="rectangle2-wrap">
                                                <div className="rectangle2" />
                                            </div>
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
                                                    simply dummy text.
                                                </p>
                                            </div>
                                            <div className="twm-upload-file">
                                                <button type="button" className="site-button">Upload Your Resume <i className="feather-upload" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* FOR EMPLOYEE END */}
            {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-light twm-testimonial-8-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                        <div className="section-head center wt-small-separator-outer">
                            <div className="wt-small-separator site-text-primary">
                                <div>Client Testimonials</div>
                            </div>
                            <h2 className="wt-title">What Our Customers
                                Say About Us</h2>
                        </div>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="owl-carousel twm-testimonial-8-carousel m-b30 owl-btn-bottom-center ">
                            {/* COLUMNS 1 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/home-6/testimonial/pic1.jpg" alt="#" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">I have minim mollit non deserunt ullamco est sit aliqua
                                            dolor do Eam et sint. Velit officia consequat.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Guy Hawkins</div>
                                            <div className="twm-testi-position">UI/UX Designer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 2 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/home-6/testimonial/pic2.jpg" alt="#" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">I have minim mollit non deserunt ullamco est sit aliqua
                                            dolor do Eam et sint. Velit officia consequat.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Guy Hawkins</div>
                                            <div className="twm-testi-position">UI/UX Designer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 3 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/home-6/testimonial/pic3.jpg" alt="#" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">I have minim mollit non deserunt ullamco est sit aliqua
                                            dolor do Eam et sint. Velit officia consequat.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Guy Hawkins</div>
                                            <div className="twm-testi-position">UI/UX Designer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 4 */}
                            <div className="item ">
                                <div className="testimonials-v site-bg-white">
                                    <div className="twm-testi-media">
                                        <JobZImage src="images/home-6/testimonial/pic1.jpg" alt="#" />
                                    </div>
                                    <div className="testimonial-v-content">
                                        <div className="t-testimonial-top">
                                            <div className="t-quote"><i className="fa fa-quote-left" /></div>
                                            <div className="t-rating">
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                                <span><i className="fa fa-star" /></span>
                                            </div>
                                        </div>
                                        <div className="t-discription">I have minim mollit non deserunt ullamco est sit aliqua
                                            dolor do Eam et sint. Velit officia consequat.
                                        </div>
                                        <div className="twm-testi-detail">
                                            <div className="twm-testi-name">Guy Hawkins</div>
                                            <div className="twm-testi-position">UI/UX Designer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* TESTIMONIAL SECTION END */}
            {/* FEATURED Cities SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-carousal-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="wt-separator-two-part ">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs by location</div>
                                    </div>
                                    <h2 className="wt-title">Find your favourite jobs and get.</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">View All Locations</NavLink>
                            </div>
                        </div>
                    </div>
                    {/* title="" END*/}
                </div>
                <div className="twm-featured-city-carousal-wrap">
                    <div className="owl-carousel twm-featured-city-carousal">
                        <div className="item">
                            {/*1*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city1.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>London, England</NavLink></h4>
                                    <div className="twm-city-jobs">125 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*2*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city2.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Paris, France</NavLink></h4>
                                    <div className="twm-city-jobs">260 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*3*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city3.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>New York, USA</NavLink></h4>
                                    <div className="twm-city-jobs">300 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*4*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city4.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Bankok, Thailand</NavLink></h4>
                                    <div className="twm-city-jobs">2k Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*5*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city5.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Helsinki , Finland</NavLink></h4>
                                    <div className="twm-city-jobs">1.5k Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*6*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city6.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Berlin, Germany</NavLink></h4>
                                    <div className="twm-city-jobs">700 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*7*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city1.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>London, England</NavLink></h4>
                                    <div className="twm-city-jobs">125 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*8*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city2.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Paris, France</NavLink></h4>
                                    <div className="twm-city-jobs">260 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*9*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city3.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>New York, USA</NavLink></h4>
                                    <div className="twm-city-jobs">300 Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*10*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city4.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Bankok, Thailand</NavLink></h4>
                                    <div className="twm-city-jobs">2k Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*11*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city5.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Helsinki , Finland</NavLink></h4>
                                    <div className="twm-city-jobs">1.5k Jobs</div>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            {/*12*/}
                            <div className="twm-featured-city2">
                                <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city6.jpg")})` }}>
                                </div>
                                <div className="twm-city-info">
                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Berlin, Germany</NavLink></h4>
                                    <div className="twm-city-jobs">700 Jobs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* FEATURED SECTION END */}
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
                            <div className="col-lg-4 col-md-6 m-b30">
                                {/*Block one*/}
                                <div className="blog-post twm-blog-post-2-outer">
                                    <div className="wt-post-media">
                                        <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest-2/l-4.jpg" alt="" /></NavLink>
                                    </div>
                                    <div className="wt-post-info">
                                        <div className="wt-post-meta ">
                                            <ul>
                                                <li className="post-date">April 12, 2023</li>
                                            </ul>
                                        </div>
                                        <div className="wt-post-title ">
                                            <h4 className="post-title">
                                                <NavLink to={publicUser.blog.DETAIL}>
                                                    How to convince recruiters and get your
                                                    dream job.
                                                </NavLink>
                                            </h4>
                                        </div>
                                        <div className="wt-post-readmore ">
                                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-secondry">Read More</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 m-b30">
                                {/*Block Two*/}
                                <div className="blog-post twm-blog-post-2-outer">
                                    <div className="wt-post-media">
                                        <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest-2/l-5.jpg" alt="" /></NavLink>
                                    </div>
                                    <div className="wt-post-info">
                                        <div className="wt-post-meta ">
                                            <ul>
                                                <li className="post-date">April 14, 2023</li>
                                            </ul>
                                        </div>
                                        <div className="wt-post-title ">
                                            <h4 className="post-title">
                                                <NavLink to={publicUser.blog.DETAIL}>
                                                    How to convince recruiters and get your
                                                    dream job.
                                                </NavLink>
                                            </h4>
                                        </div>
                                        <div className="wt-post-readmore ">
                                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-secondry">Read More</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 m-b30">
                                {/*Block Three*/}
                                <div className="blog-post twm-blog-post-2-outer">
                                    <div className="wt-post-media">
                                        <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest-2/l-6.jpg" alt="" /></NavLink>
                                    </div>
                                    <div className="wt-post-info">
                                        <div className="wt-post-meta ">
                                            <ul>
                                                <li className="post-date">April 18, 2023</li>
                                            </ul>
                                        </div>
                                        <div className="wt-post-title ">
                                            <h4 className="post-title">
                                                <NavLink to={publicUser.blog.DETAIL}>
                                                    How to convince recruiters and get your
                                                    dream job.
                                                </NavLink>
                                            </h4>
                                        </div>
                                        <div className="wt-post-readmore ">
                                            <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-secondry">Read More</NavLink>
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

export default Home9Page;
