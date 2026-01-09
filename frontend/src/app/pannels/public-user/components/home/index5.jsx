import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home5Page() {

    useEffect(()=>{
        loadScript("js/anm.js")
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home5-banner-section" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/slider/bg-1.jpg")})` }}>
                <div className="row">
                    {/*Left Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12 btm-bdr-banner">
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
<CountUp end={3} duration={10} />
</span>K+
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*right Section*/}
                    <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-main">
                        <div className="twm-bnr-right-section anm">
                            <div className="twm-bnr-right-section-inner anm" data-wow-delay="1000ms" data-speed-x={2} data-speed-y={2}>
                                <div className="twm-graphics-h5 twm-p1">
                                    <JobZImage src="images/home-5/slider/r-pic1.png" alt="" />
                                </div>
                                <div className="twm-graphics-h5 twm-p2">
                                    <JobZImage src="images/home-5/slider/r-pic2.png" alt="" />
                                </div>
                                <div className="twm-graphics-h5 twm-p3">
                                    <JobZImage src="images/home-5/slider/r-pic3.png" alt="" />
                                </div>
                                <div className="twm-graphics-h5 twm-p4">
                                    <JobZImage src="images/home-5/slider/r-pic4.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="twm-banner-h5-r-b-info">
                            <span>Your Latest Jobs</span>
                            <h3 className="twm-banner-h5-r-b-outline-text">
                                Find Jobs
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
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
            {/* Jobs START */}
            <div className="section-full p-t120 p-b90 site-bg-white pos-relative twm-bdr-bottom-1">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Job of the day</div>
                        </div>
                        <h2 className="wt-title">Connect with the right
                            candidates faster.</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-jobs-grid-h5-wrap">
                            <div className="row">
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$500 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic1.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Crystel Inc Pvt. Ltd.
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>UI / UX Designer fulltime</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>86<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$250 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic2.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Infosys BPM Ltd.
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Full Stack Engineer</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>50<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$250 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic3.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Accenture Plc
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Frontend Developer</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>200<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$150 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic4.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Infosys BPM Ltd.
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Products Manager</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>35<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$299 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic5.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Crystel Inc Pvt. Ltd.
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>React Native Web Developer</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>500<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="twm-jobs-st5  m-b30">
                                        <div className="twm-jobs-amount">$500 <span>/ hour</span></div>
                                        <div className="twm-job-st5-top">
                                            <div className="twm-media">
                                                <JobZImage src="images/home-5/jobs-company/pic6.jpg" alt="#" />
                                            </div>
                                            <div className="twm-com-info">
                                                <p className="twm-job-address">New York, US</p>
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-com-name site-text-primary">
                                                    Accenture Plc
                                                </a>
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-job-title">
                                                <h4>Lead Quality Control QA</h4>
                                            </NavLink>
                                            <div className="twm-job-duration">
                                                <ul>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="fa fa-calendar-alt" />Fulltime</span>
                                                    </li>
                                                    <li>
                                                        <span className="twm-job-post-duration"><i className="far fa-clock" />4 Minutes ago</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <p>Lorem Ipsum is simply dummy text of printing
                                                and typesetting industry
                                            </p>
                                        </div>
                                        <div className="twm-right-content">
                                            <div className="twm-candi-thum-content">
                                                <div className="twm-pics">
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-1.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-2.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-3.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-4.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-5.jpg" alt="" /></span>
                                                    <span><JobZImage src="images/main-slider/slider2/user/u-6.jpg" alt="" /></span>
                                                    <div className="tot-view"><b>1K<i>+</i></b></div>
                                                </div>
                                            </div>
                                            <NavLink to={publicUser.jobs.DETAIL1} className="twm-jobs-browse site-text-primary">Apply Job</NavLink>
                                        </div>
                                        <div className="twm-jobs-category outline">
                                            <a href="#">AdobeXd</a>
                                            <a href="#">Figma</a>
                                            <a href="#">Photoshop</a>
                                            <a href="#">Corel</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-bg-shape5-left" />
            </div>
            {/* Recruiters END */}
            {/* ABOUT SECTION START */}
            <div className="section-full p-t120 p-b0 site-bg-white twm-millions-1-area pos-relative">
                <div className="container">
                    <div className="twm-millions-section-wrap">
                        <div className="row">
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-millions-1-section">
                                    <div className="twm-media">
                                        <JobZImage src="images/home-5/millions-jobs/main-pic.png" alt="" />
                                        <div className="twm-circle-jobs-wrap">
                                            {/*1*/}
                                            <div className="twm-circle-jobs-box one bounce2">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-1.png" alt="#" />
                                                </div>
                                            </div>
                                            {/*2*/}
                                            <div className="twm-circle-jobs-box two bounce">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-2.png" alt="#" />
                                                </div>
                                            </div>
                                            {/*3*/}
                                            <div className="twm-circle-jobs-box three bounce2">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-3.png" alt="#" />
                                                </div>
                                            </div>
                                            {/*4*/}
                                            <div className="twm-circle-jobs-box four bounce">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-4.png" alt="#" />
                                                </div>
                                            </div>
                                            {/*5*/}
                                            <div className="twm-circle-jobs-box five bounce2">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-5.png" alt="#" />
                                                </div>
                                            </div>
                                            {/*6*/}
                                            <div className="twm-circle-jobs-box six bounce">
                                                <div className="twm-circle-job-pics">
                                                    <JobZImage src="images/home-5/millions-jobs/company-6.png" alt="#" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="twm-bg-circle-pic">
                                        <JobZImage src="images/home-5/millions-jobs/bg-circle.png" alt="#" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-12">
                                <div className="twm-millions-1-section-right">
                                    {/* title="" START*/}
                                    <div className="section-head left wt-small-separator-outer">
                                        <div className="wt-small-separator site-text-primary">
                                            <div>Millions of Jobs</div>
                                        </div>
                                        <h2 className="wt-title">
                                            Find The One That’s Right For You</h2>
                                        <p>You need to create an account to find the best and preferred job. lorem
                                            Ipsum is simply dummy text of the printing and typesetting industry
                                            the standard dummy text ever since took.
                                        </p>
                                    </div>
                                    {/* title="" END*/}
                                    <div className="twm-avail-jobs">
                                        <span>45 +</span> Jobs Available
                                    </div>
                                    <div className="twm-read-more cplumn-2">
                                        <NavLink to={publicUser.pages.ABOUT} className="site-button">Search Jobs</NavLink>
                                        <NavLink to={publicUser.pages.ABOUT} className="site-button-link underline">Learn More</NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-bg-shape5" />
            </div>
            {/* ABOUT SECTION END */}
            {/* Counter SECTION START */}
            <div className="section-full p-t0 p-b0 site-bg-white twm-counter-page-5-wrap">
                <div className="container">
                    <div className="twm-company-approch5-outer">
                        <div className="twm-company-approch5" style={{ backgroundImage: `url(${publicUrlFor("images/home-5/ctr-bg.jpg")})` }}>
                            <div className="row">
                                {/*block 1*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={25} duration={10} />
</span>k+</div>
                                            <p className="icon-content-info">Completed Cases</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 2*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={17} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">Our Office</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 3*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">86</span>+</div>
                                            <p className="icon-content-info">Skilled People</p>
                                        </div>
                                    </div>
                                </div>
                                {/*block 4*/}
                                <div className="col-lg-3 col-md-6 col-sm-6">
                                    <div className="counter-outer-two">
                                        <div className="icon-content">
                                            <div className="tw-count-number site-text-white">
                                                <span className="counter">
<CountUp end={28} duration={10} />
</span>+</div>
                                            <p className="icon-content-info">Happy Client</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Counter SECTION END */}
            {/* Recruiters START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Top Recruiters</div>
                        </div>
                        <h2 className="wt-title">Discover your next
                            career move</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-recruiters5-wrap">
                            <div className="twm-column-5 m-b30">
                                <ul>
                                    {/*1*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/1.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>LinkedIn</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*2*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/2.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Apple Inc.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*3*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/3.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Saudi Aramco</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*4*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/4.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Alphabet Inc.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*5*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/5.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Amazon.com Inc.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*6*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/6.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Tesla Inc.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*7*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/7.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>NVIDIA Corp.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*8*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/8.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Hathaway Inc.</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*9*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/9.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>NVIDIA  Corp</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*10*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/10.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Meta Platforms</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*11*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/11.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Youtube</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*12*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/12.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Instagram</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*13*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/13.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>McKesson</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*14*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/14.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Foxconn</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                    {/*15*/}
                                    <li>
                                        <div className="twm-recruiters5-box">
                                            <div className="twm-rec-top">
                                                <div className="twm-rec-media">
                                                    <JobZImage src="images/home-5/recruiters/15.jpg" alt="#" />
                                                </div>
                                                <div className="twm-rec-jobs">25 Jobs</div>
                                            </div>
                                            <div className="twm-rec-content">
                                                <h4 className="twm-title"><NavLink to={publicUser.jobs.LIST}>Microsoft</NavLink></h4>
                                                <div className="twm-rec-rating-wrap">
                                                    <div className="twm-rec-rating">
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                        <span><i className="fa fa-star" /></span>
                                                    </div>
                                                    <div className="twm-rec-rating-count">(68)</div>
                                                </div>
                                                <div className="twm-job-address"><i className="feather-map-pin" />New York, US</div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-center m-b30">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">View All</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Recruiters END */}
            {/* FEATURED Cities SECTION START */}
            <div className="section-full p-t120 pos-relative site-bg-white twm-featured-city-area">
                <div className="twm-bg-section-box" />
                <div className="container">
                    {/* title="" START*/}
                    <div className="wt-separator-two-part content-white">
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
                                <NavLink to={publicUser.jobs.LIST} className=" site-button white">View All Locations</NavLink>
                            </div>
                        </div>
                    </div>
                    {/* title="" END*/}
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
            {/* Newsletter Subscriber SECTION START */}
            <div className="section-full p-t60 site-bg-white twm-new-sub-section-wrap site-bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/dotted-map.png")})` }}>
                <div className="container">
                    <div className="section-content">
                        <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <div className="twm-nl-map-media-wrap">
                                    <div className="twm-nl-map-pointer">
                                        <div className="twm-nl-map-pic nw-pic1 bounce">
                                            <JobZImage src="images/nl-pic/pic1.jpg" alt="#" />
                                        </div>
                                        <div className="twm-nl-map-pic nw-pic2 bounce2">
                                            <JobZImage src="images/nl-pic/pic2.jpg" alt="#" />
                                        </div>
                                        <div className="twm-nl-map-pic nw-pic3 bounce">
                                            <JobZImage src="images/nl-pic/pic3.jpg" alt="#" />
                                        </div>
                                        <div className="twm-nl-map-pic nw-pic4 bounce2">
                                            <JobZImage src="images/nl-pic/pic4.jpg" alt="#" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-sub-2-section site-bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/nwl-bg.png")})` }}>
                                    <h3 className="twm-sub-title">Subscribe to Our Newsletter</h3>
                                    <div className="twm-sub-discription">Get the latest updates mailed to you</div>
                                    <form>
                                        <div className="form-group">
                                            <input name="news-letter" className="form-control" placeholder="Enter Your Email Address" type="text" />
                                        </div>
                                        <button className="site-button twm-sub-btn white">Subscribe Now</button>
                                    </form>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-12">
                                <div className="twm-nl-map-media-wrap">
                                    <div className="twm-nl-map-pointer">
                                        <div className="twm-nl-map-pic nw-pic5 bounce">
                                            <JobZImage src="images/nl-pic/pic5.jpg" alt="#" />
                                        </div>
                                        <div className="twm-nl-map-pic nw-pic6 bounce2">
                                            <JobZImage src="images/nl-pic/pic6.jpg" alt="#" />
                                        </div>
                                        <div className="twm-nl-map-pic nw-pic7 bounce">
                                            <JobZImage src="images/nl-pic/pic7.jpg" alt="#" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Newsletter Subscriber TABLE SECTION END */}
        </>
    )
}

export default Home5Page;
