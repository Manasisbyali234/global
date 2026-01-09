import JobZImage from "../../../../common/jobz-img";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { publicUser } from "../../../../../globals/route-names";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";

function Home18Page() {

    useEffect(() => {
        updateSkinStyle("10", false, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="twm-home18-banner-section">
                <div className="row" style={{ backgroundImage: `url(${publicUrlFor("images/home-18/banner/dot-map.png")})` }}>
                    {/*Left Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12">
                        <div className="twm-bnr-left-section">
                            <div className="twm-bnr-title-small">We Have <span className="site-text-primary">208,000+</span> Live Jobs</div>
                            <div className="twm-bnr-title-large">Find the <span className="site-text-primary">job</span> that fits your life</div>
                            <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
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
                                                <input name="username" type="text" required className="form-control" placeholder="Search..." />
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
                        </div>
                    </div>
                    {/*right Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12">
                        <div className="twm-h-page-18-bnr-right-section">
                            <div className="twm-h-page18-bnr-pic">
                                <JobZImage src="images/home-18/banner/bnr-pic.png" alt="#" />
                            </div>
                            <div className="twm-h-page-18-bnr-noti">
                                {/* Swiper */}
                                <div className="swiper v-notiinfoSwiper v-noti-slider-h-page-18">
                                    <div className="swiper-wrapper">
                                        {/*SLide 1*/}
                                        <div className="swiper-slide">
                                            <div className="v-noti-wrap">
                                                <div className="v-media">
                                                    <i className="far fa-check-circle twm-bg-purple" />
                                                </div>
                                                <div className="v-content">
                                                    <h4 className="wt-title">Congratulations</h4>
                                                    <p>Your admission successfully completed</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/*SLide 2*/}
                                        <div className="swiper-slide">
                                            <div className="v-noti-wrap">
                                                <div className="v-media">
                                                    <i className="far fa-envelope twm-bg-green" />
                                                </div>
                                                <div className="v-content">
                                                    <h4 className="wt-title">Congrats</h4>
                                                    <p>Your have got an Email</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Add Pagination */}
                                    <div className="swiper-pagination" />
                                </div>
                            </div>
                            {/*Samll Ring Left*/}
                            <div className="twm-shape-l bounce" />
                            <div className="twm-shape-2 bounce2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TOP COMPANIES START */}
            <div className="section-full p-t120  site-bg-white twm-companies-wrap">
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
                        <div className="owl-carousel home-client-carousel2 owl-btn-vertical-center">
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w1.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w2.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w3.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w4.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w5.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w6.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w1.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w2.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w3.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ow-client-logo">
                                    <div className="client-logo client-logo-media">
                                        <NavLink to={publicUser.employer.LIST}><JobZImage src="images/client-logo/w5.png" alt="" /></NavLink></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-company-approch-outer">
                    <div className="twm-company-approch">
                        <div className="row">
                            {/*block 1*/}
                            <div className="col-lg-4 col-md-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-sky">
                                            <span className="counter">5</span>M+</div>
                                        <p className="icon-content-info">Million daily active users</p>
                                    </div>
                                </div>
                            </div>
                            {/*block 2*/}
                            <div className="col-lg-4 col-md-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-pink">
                                            <span className="counter">9</span>K+</div>
                                        <p className="icon-content-info">Open job positions</p>
                                    </div>
                                </div>
                            </div>
                            {/*block 3*/}
                            <div className="col-lg-4 col-md-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-green">
                                            <span className="counter">2</span>M+</div>
                                        <p className="icon-content-info">Million stories shared</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* JOB POST START */}
            <div className="section-full p-t120 p-b90 site-bg-light-purple twm-bg-ring-wrap">
                <div className="twm-bg-ring-right" />
                <div className="twm-bg-ring-left" />
                <div className="container">
                    {/* TITLE START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>All Jobs Post</div>
                        </div>
                        <h2 className="wt-title">Find Your Career You Deserve it</h2>
                    </div>
                    {/* TITLE END*/}
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
            {/* PRICING TABLE SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white tw-pricing-area">
                <div className="container">
                    {/* TITLE START*/}
                    <div className="section-head left wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Choose Your Plan</div>
                        </div>
                        <h2 className="wt-title">Save up to 10%</h2>
                    </div>
                    {/* TITLE END*/}
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
            {/* FEATURED Cities SECTION START */}
            <div className="section-full p-t120 pos-relative site-bg-white twm-featured-city-area">
                <div className="twm-bg-section-box" />
                <div className="container">
                    {/* TITLE START*/}
                    <div className="wt-separator-two-part content-white">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-5 col-lg-5 col-md-12 wt-separator-two-part-left">
                                {/* TITLE START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs by location</div>
                                    </div>
                                    <h2 className="wt-title">Find your favourite jobs and get.</h2>
                                </div>
                                {/* TITLE END*/}
                            </div>
                            <div className="col-xl-7 col-lg-7 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button white">View All Locations</NavLink>
                            </div>
                        </div>
                    </div>
                    {/* TITLE END*/}
                    <div className="twm-featured-city2-section">
                        <div className="row">
                            <div className="col-xl-4 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city1.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>London, England</NavLink></h4>
                                        <div className="twm-city-jobs">125 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city2.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Paris, France</NavLink></h4>
                                        <div className="twm-city-jobs">260 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city3.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>New York, USA</NavLink></h4>
                                        <div className="twm-city-jobs">300 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city4.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Bankok, Thailand</NavLink></h4>
                                        <div className="twm-city-jobs">2k Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-4 col-md-6">
                                <div className="twm-featured-city2">
                                    <div className="twm-media" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/featured-cities/city5.jpg")})` }}>
                                    </div>
                                    <div className="twm-city-info">
                                        <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Helsinki , Finland</NavLink></h4>
                                        <div className="twm-city-jobs">1.5k Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
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
            </div>
            {/* FEATURED SECTION END */}
            {/* OUR BLOG START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                    {/* TITLE START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>News and Blogs</div>
                        </div>
                        <h2 className="wt-title">Get the latest news,
                            updates and tips</h2>
                    </div>
                    {/* TITLE END*/}
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
export default Home18Page;
