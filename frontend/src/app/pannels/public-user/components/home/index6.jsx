import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import { useEffect } from "react";
import CountUp from "react-countup";

function Home6Page() {

    useEffect(() => {
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home-6-banner-section">
                <div className="container">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12">
                            <div className="twm-bnr-left-section">
                                <div className="twm-bnr-title-small">
                                    <div className="bnr-title-bedge">
                                        <i className="fa fa-check" />
                                    </div>
                                    Stay connect to get upcoming job with
                                    <span className="site-text-primary">Jobzilla</span>
                                </div>
                                <div className="twm-bnr-title-large">
                                    Find Your Perfect  <span className="site-text-white">Job</span> Platform</div>
                                <div className="twm-bnr-discription">
                                    Explore all the most exciting job roles based on your interest
                                    and study major. your dream job is waiting for you.
                                </div>
                                <div className="twm-bnr-search-bar">
                                    <form>
                                        <div className="row">
                                            {/*Title*/}
                                            {/*All Category*/}
                                            <div className="form-group col-xl-4 col-lg-12 col-md-12">
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
                            </div>
                        </div>
                        {/*right Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
                            <div className="twm-bnr-right-content">
                                <div className="bnr-media">
                                    <JobZImage src="images/home-6/banner-pic.png" alt="#" />
                                </div>
                                <div className="bnr-bg-circle">
                                    <span />
                                </div>
                                <div className="bnr-bg-icons">
                                    <div className="icon-plus1 bounce"><i className="fa fa-plus" /></div>
                                    <div className="icon-plus2 bounce2"><i className="fa fa-plus" /></div>
                                    <div className="icon-plus3 bounce"><i className="fa fa-plus" /></div>
                                    <div className="icon-ring1 bounce2" />
                                    <div className="icon-ring2 bounce" />
                                    <div className="icon-ring3 bounce2" />
                                    <div className="bnr-block-1 bounce">
                                        <div className="bnr-block-1-content">
                                            <div className="media"><JobZImage src="images/home-6/cv-icon.png" alt="" /></div>
                                            <h3 className="title">Upload CV</h3>
                                        </div>
                                    </div>
                                    <div className="bnr-block-2 bounce2">
                                        <div className="bnr-block-2-content">
                                            <div className="bnr-block-2-bag">
                                                <span><JobZImage src="images/home-6/bag.png" alt="" /></span>
                                            </div>
                                            <div className="bnr-block-2-content-top">
                                                <h3 className="title">25 k</h3>
                                                <div className="media"><JobZImage src="images/home-6/graph-icon.png" alt="" /></div>
                                            </div>
                                            <div className="bnr-block-2-content-bottom">People Got Hired</div>
                                        </div>
                                    </div>
                                    <div className="bnr-block-3 bounce">
                                        <JobZImage src="images/home-6/pdf-file.png" alt="#" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-job-categories-hpage-6-area">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs by Categories</div>
                    </div>
                    <h2 className="wt-title">Choose Your Desire Category</h2>
                </div>
                {/* title="" END*/}
                <div className="container">
                    <div className="twm-job-cat-hpage-6-wrap">
                        <div className="job-cat-block-hpage-6-section m-b30">
                            <div className="row">
                                {/* COLUMNS 1 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-dashboard" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Programming &amp; Tech</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 2 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-project-management" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Content Writer</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 3 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-note" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Graphic Designer</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 4 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-customer-support" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Health &amp; Fitness</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 5 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-bars" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Digital Marketing</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 6 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-user" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Sports &amp; Media</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 7 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-computer" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Video Editing</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 8 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-coding" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Education</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 9 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-computer" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Finance &amp; Account</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* COLUMNS 10 */}
                                <div className="col">
                                    <div className="job-cat-block-hpage-6 m-b30">
                                        <div className="twm-media">
                                            <div className="flaticon-coding" />
                                        </div>
                                        <div className="twm-content">
                                            <NavLink to={publicUser.jobs.DETAIL1}>Art &amp; Design</NavLink>
                                            <div className="twm-jobs-available"><span>100+</span> Posted new jobs</div>
                                            <div className="circle-line-wrap">
                                                <NavLink to={publicUser.jobs.DETAIL2} className="circle-line-btn"><i className="fa fa-arrow-right" /></NavLink>
                                            </div>
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
            {/* GET JOBS SECTION START */}
            <div className="section-full site-bg-white h-page6-getjobs-wrap">
                <div className="h-page6-client-slider-outer">
                    <div className="container">
                        <div className="h-page6-client-slider">
                            <div className="row">
                                <div className="col-xl-4 col-lg-12">
                                    <div className="h-page-6-client-slide-title">
                                        Trusted by more than <span className="site-text-primary">+100 companies</span>
                                    </div>
                                </div>
                                <div className="col-xl-8 col-lg-12">
                                    <div className="owl-carousel home-client-carousel6 owl-btn-vertical-center">
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
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="h-page-6-getjobs-wrap">
                        <div className="row">
                            <div className="col-lg-7 col-md-12">
                                <div className="h-page-6-getjobs-left">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-6/get-job-pic.png" alt="#" />
                                        <div className="twm-media-bg-circle" />
                                        <div className="twm-media-bg-circle2" />
                                        <div className="twm-media-bg-circle3">
                                            <div className="rotate-center">
                                                <span className="ring1" />
                                                <span className="ring2" />
                                                <span className="ring3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-12">
                                <div className="h-page-6-getjobs-right">
                                    {/* title="" START*/}
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <div>Get Jobs</div>
                                        </div>
                                        <h2 className="wt-title">Get World <span className="site-text-primary">1500+</span>
                                            Talented People in
                                            one place
                                        </h2>
                                        <p>You need to create an account to find the best and preferred job. lorem
                                            Ipsum is simply dummy text of the printing and typesetting industry
                                            the standard dummy text ever took.
                                        </p>
                                        <p>Find the best and preferred job. lorem
                                            Ipsum is simply dummy text of the printing and typesetting industry
                                            the standard dummy text ever since the  when an printer took.
                                        </p>
                                    </div>
                                    {/* title="" END*/}
                                    <div className="twm-read-more">
                                        <NavLink to={publicUser.pages.ABOUT} className="site-button">About More</NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* GET JOBS SECTION SECTION END */}
            {/* Featured Jobs SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-hpage-6-featured-outer">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs Category</div>
                    </div>
                    <h2 className="wt-title">Featured Jobs</h2>
                </div>
                {/* title="" END*/}
                <div className="twm-hpage-6-featured-area">
                    <div className="twm-hpage-6-featured-bg-warp">
                        <div className="twm-media">
                            <JobZImage src="images/home-6/featured-jobs/large-pic-1.png" alt="#" />
                        </div>
                    </div>
                    <div className="container">
                        <div className="twm-hpage-6-featured-content-warp m-b30">
                            <div className="row">
                                <div className="col-lg-8 col-md-12">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 m-b30">
                                            <div className="hpage-6-featured-block">
                                                <div className="inner-content">
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
                                        <div className="col-lg-6 col-md-6 m-b30">
                                            <div className="hpage-6-featured-block">
                                                <div className="inner-content">
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
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div className="hpage-6-featured-block">
                                        <div className="inner-content">
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
                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div className="hpage-6-featured-block">
                                        <div className="inner-content">
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
                                <div className="col-lg-4 col-md-6 m-b30">
                                    <div className="hpage-6-featured-block">
                                        <div className="inner-content">
                                            <div className="top-content">
                                                <span className="job-time">Full Time</span>
                                                <span className="job-post-time">1 Day ago</span>
                                            </div>
                                            <div className="mid-content">
                                                <div className="company-logo">
                                                    <JobZImage src="images/home-6/featured-jobs/google.png" alt="#" />
                                                </div>
                                                <div className="company-info">
                                                    <NavLink to={publicUser.jobs.DETAIL1} className="company-name">google</NavLink>
                                                    <p className="company-address">Washington U.S.A.</p>
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
                            </div>
                            <div className="text-center job-categories-btn">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">Show All Jobs</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Featured Jobs SECTION END */}
            {/* Our Comunity SECTION START */}
            <div className="section-full p-t120 site-bg-white twm-our-comu-hpage-6-area" style={{ backgroundImage: `url(${publicUrlFor("images/home-6/our-com-bg.jpg")})` }}>
                <div className="container">
                    {/* title="" START*/}
                    <div className="wt-separator-two-part content-white">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-8 col-lg-8 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Our Community</div>
                                    </div>
                                    <h2 className="wt-title">Join our community of talented and professionals by applying for a job today!.</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                        </div>
                    </div>
                    {/* title="" END*/}
                </div>
                <div className="hpage-6-comunity-counter-wrap">
                    <div className="container">
                        <div className="twm-company-approch6-outer">
                            <div className="twm-company-approch6">
                                <div className="row">
                                    {/*block 1*/}
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="counter-outer-two">
                                            <div className="icon-media-wrap">
                                                <div className="icon-media site-text-white">
                                                    <i className="flaticon-resume" />
                                                </div>
                                            </div>
                                            <div className="icon-content">
                                                <div className="tw-count-number site-text-white">
                                                    <span className="counter text-clr-green">
                                                        <CountUp end={1590} duration={20} />
                                                    </span>
                                                </div>
                                                <p className="icon-content-info">Completed Cases</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/*block 2*/}
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="counter-outer-two">
                                            <div className="icon-media-wrap">
                                                <div className="icon-media site-text-white">
                                                    <i className="flaticon-user" />
                                                </div>
                                            </div>
                                            <div className="icon-content">
                                                <div className="tw-count-number site-text-white">
                                                    <span className="counter text-clr-pink">
                                                        <CountUp end={1740} duration={20} />
                                                    </span>
                                                </div>
                                                <p className="icon-content-info">Our Office</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/*block 3*/}
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="counter-outer-two">
                                            <div className="icon-media-wrap">
                                                <div className="icon-media site-text-white">
                                                    <i className="flaticon-hr" />
                                                </div>
                                            </div>
                                            <div className="icon-content">
                                                <div className="tw-count-number site-text-white">
                                                    <span className="counter text-clr-yellow-2">
                                                        <CountUp end={800} duration={20} />
                                                    </span>
                                                </div>
                                                <p className="icon-content-info">Skilled People</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/*block 4*/}
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="counter-outer-two">
                                            <div className="icon-media-wrap">
                                                <div className="icon-media site-text-white">
                                                    <i className="flaticon-note" />
                                                </div>
                                            </div>
                                            <div className="icon-content">
                                                <div className="tw-count-number site-text-white">
                                                    <span className="counter text-clr-purple">
                                                        <CountUp end={16} duration={20} />
                                                    </span>
                                                </div>
                                                <p className="icon-content-info">Happy Client</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Our Comunity SECTION SECTION END */}
            {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-testimonial-v-area">
                <div className="container">
                    <div className="section-content">
                        <div className="twm-testimonial-v-section">
                            <div className="row">
                                <div className="col-xl-5 col-lg-12 col-md-12">
                                    <div className="twm-explore-content-outer2">
                                        <div className="twm-explore-top-section">
                                            {/* title="" START*/}
                                            <div className="section-head left wt-small-separator-outer">
                                                <div className="wt-small-separator site-text-primary">
                                                    <div>Testimonials </div>
                                                </div>
                                                <h2>Quotes from our
                                                    customer about us</h2>
                                                <p>You need to create an account to find the best and preferred job. lorem
                                                    Ipsum is simply dummy text of the printing and typesetting the standard dummy text ever since the  when an printer took.</p>
                                            </div>
                                            {/* title="" END*/}
                                            <div className="twm-read-more">
                                                <NavLink to={publicUser.pages.ABOUT} className="site-button">Show All Quotes</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-7 col-lg-12 col-md-12">
                                    <div className="v-testimonial-wrap">
                                        <div className="v-testi-dotted-pic">
                                            <JobZImage src="images/home-6/testimonial/dotted-block.png" alt="#" />
                                        </div>
                                        {/* Swiper */}
                                        <div className="swiper-container v-testimonial-slider">
                                            <div className="swiper-wrapper">
                                                {/*block 1*/}
                                                <div className="swiper-slide">
                                                    <div className="testimonials-v">
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
                                                {/*block 2*/}
                                                <div className="swiper-slide">
                                                    <div className="testimonials-v">
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
                                                {/*block 3*/}
                                                <div className="swiper-slide">
                                                    <div className="testimonials-v">
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
                                                {/*block 4*/}
                                                <div className="swiper-slide">
                                                    <div className="testimonials-v">
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
                                            {/* Add Pagination */}
                                            <div className="swiper-pagination" />
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
            <div className="section-full p-t120 p-b90 twm-blog-post-h-page6-wrap">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Latest Blog</div>
                                    </div>
                                    <h2 className="wt-title">Our Regular Updated Blog Posts</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">Explore All Blogs</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="twm-jobs-grid-wrap">
                            <div className="row masonry-wrap">
                                <div className="masonry-item col-lg-4 col-md-6 m-b30">
                                    {/*Block one*/}
                                    <div className="blog-post twm-blog-post-h-page6">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-6/blog/latest/bg1.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">12-02-2023</li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the May 2023 jobs report</NavLink>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="masonry-item col-lg-8 col-md-6 m-b30">
                                    {/*Block three*/}
                                    <div className="blog-post with-content twm-blog-post-h-page6">
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">16-02-2023</li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>How to convince recruiters and get your dream job</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text">
                                                <p>
                                                    Industry the standard dummy text ever since
                                                    the  when an printer took. simply and dummy text
                                                    of the printing and preferred text New chip
                                                    traps clusters.
                                                </p>
                                            </div>
                                            <div className="post-author">
                                                <div className="post-author-pic">
                                                    <div className="p-a-pic"><JobZImage src="images/home-6/blog-avtar/pic1.jpg" alt="" /></div>
                                                    <div className="p-a-info">
                                                        <NavLink to={publicUser.blog.DETAIL}>Ralph Johnson</NavLink>
                                                        <p>Job Seekers</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-6/blog/latest/bg2.jpg" alt="" /></NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="masonry-item col-lg-4 col-md-6 m-b30">
                                    {/*Block three*/}
                                    <div className="blog-post twm-blog-post-h-page6">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-6/blog/latest/bg3.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">16-02-2023</li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>JobBoard is the most important
                                                        sector in the world</NavLink>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="masonry-item col-lg-4 col-md-6 m-b30">
                                    {/*Block Four*/}
                                    <div className="blog-post twm-blog-post-h-page6">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-6/blog/latest/bg4.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">18-02-2023</li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>After-School educator and recess coach</NavLink>
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="masonry-item col-lg-4 col-md-6 m-b30">
                                    {/*Block five*/}
                                    <div className="blog-post twm-blog-post-h-page6">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-6/blog/latest/bg5.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="wt-post-meta ">
                                                <ul>
                                                    <li className="post-date">22-02-2023</li>
                                                </ul>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>Job That Has Never Been Revealed For The. </NavLink>
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
            {/* SUBSCRIBE SECTION START */}
            <div className="section-full twm-hpage-6-subs-wrap bg-cover " style={{ backgroundImage: `url(${publicUrlFor("images/home-6/subscribe-bg.jpg")})` }}>
                <div className="container">
                    <div className="section-content">
                        <div className="row">
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-hpage-6-getintouch">
                                    <div className="callus-bg-box">
                                        <div className="callus-bg-box-shadow" />
                                    </div>
                                    <div className="twm-hpage-6-getintouch-title">
                                        <div className="wt-title-small">Latest Blog</div>
                                        <h2 className="wt-title">
                                            Get your <span>Free</span>
                                            web consultation
                                        </h2>
                                    </div>
                                    <div className="twm-hpage-6-callus">
                                        <div className="callus-icon">
                                            <i className="flaticon-phone" />
                                        </div>
                                        <div className="callus-content">
                                            <div className="callus-number">555-281-5426</div>
                                            <div className="callus-email">Info@jobzilla.com</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-12">
                                <div className="twm-hpage-6-subscribe-wrap">
                                    <div className="hpage-6-nw-form-corner-wrap">
                                        <div className="twm-hpage-6-subscribe">
                                            <h3 className="twm-sub-title">Subscribe for free</h3>
                                            <div className="twm-sub-discription">
                                                Join our email subscription now to get updates
                                                on new jobs and notifications.
                                            </div>
                                            <form>
                                                <div className="hpage-6-nw-form">
                                                    <input name="news-letter" className="form-control" placeholder="Enter Your Email" type="text" />
                                                    <button className="hpage-6-nw-form-btn"><i className="fa fa-paper-plane" /></button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="hpage-6-nw-form-corner" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* SUBSCRIBE SECTION END */}
        </>
    )
}

export default Home6Page;
