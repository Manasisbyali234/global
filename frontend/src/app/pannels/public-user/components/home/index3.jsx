import { NavLink } from "react-router-dom";
import { loadScript, publicUrlFor, default_skin, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home3Page() {

    useEffect(()=>{
        updateSkinStyle(default_skin, true, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home3-banner-section site-bg-white bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/home-3/banner1.jpg")})` }}>
                <div className="twm-home3-inner-section">
                    <div className="twm-bnr-mid-section">
                        <div className="twm-bnr-title-large">Find Top IT Jobs</div>
                        <div className="twm-bnr-title-light">For talent Developers</div>
                        <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
                        <div className="twm-bnr-search-bar">
                            <form>
                                <div className="row">
                                    {/*Title*/}
                                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
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
                                    <div className="form-group col-xl-4 col-lg-6 col-md-6">
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
                                    <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                        <label>Location</label>
                                        <div className="twm-inputicon-box">
                                            <input name="username" type="text" required className="form-control" placeholder="Location" />
                                            <i className="twm-input-icon fas fa-map-marker-alt" />
                                        </div>
                                    </div>
                                    {/*Find job btn*/}
                                    <div className="form-group col-xl-2 col-lg-6 col-md-6">
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
                    </div>
                    <div className="twm-bnr-bottom-section">
                        <div className="twm-browse-jobs">7,000+ Browse Jobs</div>
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
                            {/*icon-block-2*/}
                            <div className="twm-bnr-blocks twm-bnr-blocks-position-2">
                                <div className="twm-content">
                                    <div className="tw-count-number text-clr-yellow">
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
            {/*Banner End*/}
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
            {/* HOW IT WORK SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-how-it-work-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>for candidates</div>
                        </div>
                        <h2 className="wt-title">How It Works for Candidates</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-how-it-work-section3">
                        <div className="row">
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps3">
                                    <div className="twm-w-pro-top">
                                        <span className="twm-large-number  text-clr-sky">01</span>
                                        <div className="twm-media bg-clr-sky">
                                            <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                        </div>
                                    </div>
                                    <h4 className="twm-title">Register Your Account</h4>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps3">
                                    <div className="twm-w-pro-top">
                                        <span className="twm-large-number text-clr-pink">02</span>
                                        <div className="twm-media bg-clr-pink">
                                            <span><JobZImage src="images/work-process/icon2.png" alt="icon1" /></span>
                                        </div>
                                    </div>
                                    <h4 className="twm-title">Apply For Dream Job</h4>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6">
                                <div className="twm-w-process-steps3">
                                    <div className="twm-w-pro-top">
                                        <span className="twm-large-number  text-clr-green">03</span>
                                        <div className="twm-media  bg-clr-green">
                                            <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                        </div>
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
            {/* FEATURED SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-featured-city-area">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Featured Cities</div>
                        </div>
                        <h2 className="wt-title">Browse job offers by
                            popular locations</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="twm-featured-city-section">
                        <div className="row">
                            <div className="col-xl-8 col-lg-8 col-md-12">
                                <div className="twm-featured-city twm-large-block">
                                    <div className="twm-media">
                                        <JobZImage src="images/featured-cities/city1.jpg" alt="" />
                                        <div className="twm-city-info">
                                            <div className="twm-city-jobs">125 Jobs</div>
                                            <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>New York City</NavLink></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-12">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12">
                                        <div className="twm-featured-city">
                                            <div className="twm-media">
                                                <JobZImage src="images/featured-cities/city2.jpg" alt="" />
                                                <div className="twm-city-info">
                                                    <div className="twm-city-jobs">190 Jobs</div>
                                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Dubai</NavLink></h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12">
                                        <div className="twm-featured-city">
                                            <div className="twm-media">
                                                <JobZImage src="images/featured-cities/city3.jpg" alt="" />
                                                <div className="twm-city-info">
                                                    <div className="twm-city-jobs">220 Jobs</div>
                                                    <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Shanghai</NavLink></h4>
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
            {/* FEATURED SECTION END */}
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
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOB POST END */}
            {/* CANDIDATES START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Candidates</div>
                        </div>
                        <h2 className="wt-title">Featured Candidates</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-blog-post-3-outer-wrap">
                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block one*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Wanda Montgomery </h4>
                                            </NavLink>
                                            <p>Charted Accountant</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$20<span>/ Day</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block two*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic2.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Peter Hawkins</h4>
                                            </NavLink>
                                            <p>Medical Professed</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$7<span>/ Hour</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block three*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic3.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Ralph Johnson</h4>
                                            </NavLink>
                                            <p>Bank Manger</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$180<span>/ Day</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block Four*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic4.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Randall Henderson </h4>
                                            </NavLink>
                                            <p>IT Contractor</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$90<span>/ Week</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block Five*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic5.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Randall Warren</h4>
                                            </NavLink>
                                            <p>Digital &amp; Creative</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$95<span>/ Day</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12">
                                    {/*Block Six*/}
                                    <div className="twm-candidates-list-style1">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/candidates/pic6.jpg" alt="#" />
                                            </div>
                                            <div className="twm-candidates-tag"><span>Featured</span></div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                                <h4>Christina Fischer </h4>
                                            </NavLink>
                                            <p>Charity &amp; Voluntary</p>
                                            <div className="twm-fot-content">
                                                <div className="twm-left-info">
                                                    <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                                    <div className="twm-jobs-vacancies">$19<span>/ Hour</span></div>
                                                </div>
                                                <div className="twm-right-btn">
                                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-view-prifile site-text-primary">View Profile</NavLink>
                                                </div>
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
            </div>
            {/* CANDIDATES END */}
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
        </>
    )
}

export default Home3Page;
