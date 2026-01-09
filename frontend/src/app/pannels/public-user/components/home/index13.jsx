import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home13Page() {

    useEffect(() => {
        updateSkinStyle("4", false, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home3-banner-section twm-bnr-hpage-13">
                <div className="container">
                    <div className="twm-home3-inner-section">
                        <div className="row">
                            <div className="col-xl-6 col-lg-6 col-md-12 twm-hpage-12-v-bnr-left-content">
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
                                    <div className="twm-browse-jobs">7,000+ Browse Jobs</div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 twm-hpage-12-v-bnr-right-content">
                                <div className="twm-hpage-13-v-bnr" style={{ backgroundImage: `url(${publicUrlFor("images/home-13/banner-bg/right-pic1.jpg")})` }}>
                                    <div className="v-hpage-13-bnr-wrap">
                                        {/* Swiper */}
                                        <div className="v-easy-ticker">
                                            <div className="swiper v-jobSwiper v-easy-ticker-content">
                                                <div className="swiper-wrapper">
                                                    <div className="swiper-slide">
                                                        {/*block 1*/}
                                                        <div className="v-jobs-list">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/google.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">Sr. Product Designer</h3>
                                                                <p>Google LLC Company</p>
                                                            </div>
                                                            <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
                                                        </div>
                                                    </div>
                                                    <div className="swiper-slide">
                                                        {/*block 2*/}
                                                        <div className="v-jobs-list odd">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/behance.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">UI/UX Designer</h3>
                                                                <p>Behance</p>
                                                            </div>
                                                            <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
                                                        </div>
                                                    </div>
                                                    <div className="swiper-slide">
                                                        {/*block 3*/}
                                                        <div className="v-jobs-list">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/facebook.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">Product Manager</h3>
                                                                <p>Facebook</p>
                                                                <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="swiper-slide">
                                                        {/*block 4*/}
                                                        <div className="v-jobs-list odd">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/instagram.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">Video Editor</h3>
                                                                <p>Instagram</p>
                                                            </div>
                                                            <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
                                                        </div>
                                                    </div>
                                                    <div className="swiper-slide">
                                                        {/*block 5*/}
                                                        <div className="v-jobs-list">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/pinterest.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">Graphic Designer</h3>
                                                                <p>Pinterest</p>
                                                            </div>
                                                            <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
                                                        </div>
                                                    </div>
                                                    <div className="swiper-slide">
                                                        {/*block 6*/}
                                                        <div className="v-jobs-list odd">
                                                            <div className="v-jobs-list-icon">
                                                                <JobZImage src="images/home-6/featured-jobs/yahoo.png" alt="#" />
                                                            </div>
                                                            <div className="v-jobs-list-info">
                                                                <h3 className="twm-title">Product Manager</h3>
                                                                <p>Yahoo!</p>
                                                            </div>
                                                            <NavLink to={publicUser.jobs.DETAIL2} className="v-jobs-list-link" />
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
            {/*Banner End*/}
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
            {/* EXPLORE NEW LIFE START */}
            <div className="section-full site-bg-light-purple twm-for-employee-4">
                <div className="container">
                    <div className="section-content">
                        <div className="twm-for-employee-content">
                            <div className="row">
                                <div className="col-xl-5 col-lg-12 col-md-12">
                                    <div className="twm-explore-content-outer2">
                                        <div className="twm-explore-top-section">
                                            {/* title="" START*/}
                                            <div className="section-head left wt-small-separator-outer">
                                                <div className="wt-small-separator site-text-primary">
                                                    <div>About </div>
                                                </div>
                                                <h2>We help you connect with the organizer</h2>
                                                <p>Get paid easily and security. Use our resources to become independent and showcase your professional skills.</p>
                                            </div>
                                            {/* title="" END*/}
                                            <div className="twm-read-more">
                                                <NavLink to={publicUser.pages.ABOUT} className="site-button">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-7 col-lg-12 col-md-12">
                                    <div className="twm-explore-right-section">
                                        <div className="twm-media">
                                            <div className="twm-bg-circle"><JobZImage src="images/home-4/bg-circle.png" alt="" /></div>
                                            <div className="twm-employee-pic"><JobZImage src="images/home-4/employee.png" alt="" /></div>
                                            <div className="twm-shot-pic1  anm" data-speed-x={-4} data-speed-scale={-25}><JobZImage src="images/home-4/sq-1.png" alt="" /></div>
                                            <div className="twm-shot-pic2 anm" data-wow-delay="1000ms" data-speed-x={2} data-speed-y={2}><JobZImage src="images/home-4/triangle.png" alt="" /></div>
                                            <div className="twm-shot-pic3  anm" data-speed-x={-4} data-speed-scale={-25}><JobZImage src="images/home-4/circle.png" alt="" /></div>
                                        </div>
                                        {/*block 1*/}
                                        <div className="counter-outer-two one anm" data-speed-y={-2} data-speed-scale={15} data-speed-opacity={1}>
                                            <div className="icon-content">
                                                <div className="tw-count-number text-clr-yellow-2">
                                                    <span className="counter">
                                                        <CountUp end={5} duration={10} />
                                                    </span>M+</div>
                                                <p className="icon-content-info">Million daily active users</p>
                                            </div>
                                        </div>
                                        {/*block 2*/}
                                        <div className="counter-outer-two two anm" data-speed-y={2} data-speed-scale={15} data-speed-opacity={5}>
                                            <div className="icon-content">
                                                <div className="tw-count-number text-clr-green">
                                                    <span className="counter">
                                                        <CountUp end={9} duration={10} />
                                                    </span>K+</div>
                                                <p className="icon-content-info">Open job positions</p>
                                            </div>
                                        </div>
                                        {/*block 3*/}
                                        <div className="counter-outer-two three anm" data-speed-x={-4} data-speed-scale={-25}>
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
            {/* OUR BLOG START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>News and Blogs</div>
                        </div>
                        <h2 className="wt-title">Get the latest news,
                            updates and tips</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-blog-post-h5-wrap">
                            <div className="row">
                                <div className="col-lg-4 col-md-6">
                                    {/*Block one*/}
                                    <div className="blog-post twm-blog-post-h5-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-5/blog/pic1.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="post-author">
                                                <div className="post-author-pic">
                                                    <div className="p-a-pic"><JobZImage src="images/home-5/blog-avtar/pic1.jpg" alt="" /></div>
                                                    <div className="p-a-info">
                                                        <NavLink to={publicUser.blog.DETAIL}>Ralph Johnson</NavLink>
                                                        <p>12 January</p>
                                                    </div>
                                                </div>
                                                <div className="post-categories">
                                                    <NavLink to={publicUser.blog.DETAIL}>Events</NavLink>
                                                </div>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>How to convince recruiters and get your dream job</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis odit.
                                                </p>
                                            </div>
                                            <div className="wt-post-readmore ">
                                                <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    {/*Block two*/}
                                    <div className="blog-post twm-blog-post-h5-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-5/blog/pic2.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="post-author">
                                                <div className="post-author-pic">
                                                    <div className="p-a-pic"><JobZImage src="images/home-5/blog-avtar/pic2.jpg" alt="" /></div>
                                                    <div className="p-a-info">
                                                        <NavLink to={publicUser.blog.DETAIL}>Christina Fischer</NavLink>
                                                        <p>12 January</p>
                                                    </div>
                                                </div>
                                                <div className="post-categories">
                                                    <NavLink to={publicUser.blog.DETAIL}>Events</NavLink>
                                                </div>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>How to convince recruiters and get your dream job</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis odit.
                                                </p>
                                            </div>
                                            <div className="wt-post-readmore ">
                                                <NavLink to={publicUser.blog.DETAIL} className="site-button-link site-text-primary">Read More</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    {/*Block three*/}
                                    <div className="blog-post twm-blog-post-h5-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/home-5/blog/pic3.jpg" alt="" /></NavLink>
                                        </div>
                                        <div className="wt-post-info">
                                            <div className="post-author">
                                                <div className="post-author-pic">
                                                    <div className="p-a-pic"><JobZImage src="images/home-5/blog-avtar/pic3.jpg" alt="" /></div>
                                                    <div className="p-a-info">
                                                        <NavLink to={publicUser.blog.DETAIL}>Peter Hawkins</NavLink>
                                                        <p>12 January</p>
                                                    </div>
                                                </div>
                                                <div className="post-categories">
                                                    <NavLink to={publicUser.blog.DETAIL}>Events</NavLink>
                                                </div>
                                            </div>
                                            <div className="wt-post-title ">
                                                <h4 className="post-title">
                                                    <NavLink to={publicUser.blog.DETAIL}>How to convince recruiters and get your dream job</NavLink>
                                                </h4>
                                            </div>
                                            <div className="wt-post-text ">
                                                <p>
                                                    New chip traps clusters of migrating tumor cells asperiortenetur, blanditiis odit.
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

export default Home13Page;
