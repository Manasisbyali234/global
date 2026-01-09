import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home14Page() {

    useEffect(() => {
        updateSkinStyle("5", false, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home3-banner-section twm-bnr-hpage-14" style={{ backgroundImage: `url(${publicUrlFor("images/home-14/banner-bg/dotted-patern.png")})` }}>
                <div className="container-fluid">
                    <div className="twm-home3-inner-section">
                        <div className="row">
                            <div className="col-xl-6 col-lg-7 col-md-12 twm-hpage-14-bnr-left-content">
                                <div className="twm-bnr-mid-section">
                                    <div className="twm-bnr-title-large">We Are Looking</div>
                                    <div className="twm-bnr-title-light-2">For New <span className="site-text-primary">Job</span></div>
                                    <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
                                    <div className="twm-bnr-search-bar">
                                        <form>
                                            <div className="row">
                                                {/*Title*/}
                                                <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                                    <label>What</label>
                                                    <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                                                        <option disabled value="">Job Title</option>
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
                                                        <option disabled value="">All Category</option>
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
                                    <div className="twm-bnr-popular-search">
                                        <span className="twm-title">Popular Searches:</span>
                                        <NavLink to={publicUser.jobs.LIST}>Developer</NavLink> ,
                                        <NavLink to={publicUser.jobs.LIST}>Designer</NavLink> ,
                                        <NavLink to={publicUser.jobs.LIST}>Architect</NavLink> ,
                                        <NavLink to={publicUser.jobs.LIST}>Engineer</NavLink> ...
                                    </div>
                                    <div className="twm-bnr14-blocks-wrap">
                                        <div className="twm-bnr-blocks-wrap">
                                            {/*icon-block-1*/}
                                            <div className="twm-bnr-blocks twm-bnr-blocks-position-1">
                                                <div className="twm-content">
                                                    <div className="tw-count-number text-clr-pink">
                                                        <span className="counter">
<CountUp end={12} duration={10} />
</span>K+
                                                    </div>
                                                    <p className="icon-content-info">Companies Jobs</p>
                                                </div>
                                            </div>
                                            {/*icon-block-3*/}
                                            <div className="twm-bnr-blocks-3 twm-bnr-blocks-position-3">
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
                            <div className="col-xl-6 col-lg-5 col-md-12 twm-hpage-14-bnr-right-content">
                                <div className="twm-hpage-14-bnr-right">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-14/banner-bg/right-pic.png" alt="Image" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-job-categories-area3">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs by Categories</div>
                                    </div>
                                    <h2 className="wt-title">Choose Your Desire Category</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">All Categories</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="twm-job-categories-section-3 m-b30">
                        <div className="job-categories-style3">
                            <div className="row">
                                {/* COLUMNS 1 */}
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
                                <div className="col-xl-2 col-lg-4 col-md-6 col-sm-6 m-b30">
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
            </div>
            {/* JOBS CATEGORIES SECTION END */}
            {/* EXPLORE NEW LIFE START */}
            <div className="section-full p-t120 p-b120 twm-explore-area bg-cover " style={{ backgroundImage: `url(${publicUrlFor("images/background/bg-1.jpg")})` }}>
                <div className="container">
                    <div className="section-content">
                        <div className="row">
                            <div className="col-lg-4 col-md-12">
                                <div className="twm-explore-media-wrap">
                                    <div className="twm-media">
                                        <JobZImage src="images/gir-large.png" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12">
                                <div className="twm-explore-content-outer">
                                    <div className="twm-explore-content">
                                        <div className="twm-l-line-1" />
                                        <div className="twm-l-line-2" />
                                        <div className="twm-r-circle-1" />
                                        <div className="twm-r-circle-2" />
                                        <div className="twm-title-small">Explore New Life</div>
                                        <div className="twm-title-large">
                                            <h2>Don’t just find. be found
                                                put your CV in front of
                                                great employers </h2>
                                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since the  when an printer took.</p>
                                        </div>
                                        <div className="twm-upload-file">
                                            <button type="button" className="site-button">Upload Your Resume <i className="feather-upload" /></button>
                                        </div>
                                    </div>
                                    <div className="twm-bold-circle-right" />
                                    <div className="twm-bold-circle-left" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* EXPLORE NEW LIFE END */}
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
            {/* PRICING TABLE SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white tw-pricing-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head left wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Choose Your Plan</div>
                        </div>
                        <h2 className="wt-title">Save up to 10%</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-tabs-style-1">
                            <ul className="nav nav-tabs" id="myTab3" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="Monthly" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab">Monthly</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="annual" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile">Annual</button>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTab3Content">
                                <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="Monthly">
                                    <div className="pricing-block-outer">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-4 col-md-6 m-b30">
                                                <div className="pricing-table-1">
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Basic
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$90/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li className="disable"><i className="feather-x" />0 featured job</li>
                                                                <li className="disable"><i className="feather-x" />job displayed fo 20 days</li>
                                                                <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 col-md-6 p-table-highlight m-b30">
                                                <div className="pricing-table-1 circle-yellow">
                                                    <div className="p-table-recommended">Recommended</div>
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Standard
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$248/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li><i className="feather-check" />0 featured job</li>
                                                                <li><i className="feather-check" />job displayed fo 20 days</li>
                                                                <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 col-md-6 m-b30">
                                                <div className="pricing-table-1 circle-pink">
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Extended
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$499/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li><i className="feather-check" />0 featured job</li>
                                                                <li><i className="feather-check" />job displayed fo 20 days</li>
                                                                <li><i className="feather-check" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="annual">
                                    <div className="pricing-block-outer">
                                        <div className="row justify-content-center">
                                            <div className="col-lg-4 col-md-6 m-b30">
                                                <div className="pricing-table-1">
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Basic
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$149/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li className="disable"><i className="feather-x" />0 featured job</li>
                                                                <li className="disable"><i className="feather-x" />job displayed fo 20 days</li>
                                                                <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 col-md-6 p-table-highlight m-b30">
                                                <div className="pricing-table-1 circle-yellow">
                                                    <div className="p-table-recommended">Recommended</div>
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Standard
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$499/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li><i className="feather-check" />0 featured job</li>
                                                                <li><i className="feather-check" />job displayed fo 20 days</li>
                                                                <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 col-md-6 m-b30">
                                                <div className="pricing-table-1 circle-pink">
                                                    <div className="p-table-title">
                                                        <h4 className="wt-title">
                                                            Extended
                                                        </h4>
                                                    </div>
                                                    <div className="p-table-inner">
                                                        <div className="p-table-price">
                                                            <span>$1499/</span>
                                                            <p>Monthly</p>
                                                        </div>
                                                        <div className="p-table-list">
                                                            <ul>
                                                                <li><i className="feather-check" />1 job posting</li>
                                                                <li><i className="feather-check" />0 featured job</li>
                                                                <li><i className="feather-check" />job displayed fo 20 days</li>
                                                                <li><i className="feather-check" />Premium support 24/7</li>
                                                            </ul>
                                                        </div>
                                                        <div className="p-table-btn">
                                                            <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
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
            </div>
            {/* PRICING TABLE SECTION END */}
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
        </>
    )
}

export default Home14Page;
