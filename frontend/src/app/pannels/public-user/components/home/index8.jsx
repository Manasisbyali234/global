import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import CountUp from "react-countup";
import { useEffect } from "react";

function Home8Page() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home8-banner-section site-bg-white bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/home-8/h8-banner.jpg")})` }}>
                <div className="container">
                    <div className="twm-home8-inner-section">
                        <div className="row">
                            <div className="col-lg-7 col-md-12">
                                <div className="twm-bnr-left-section">
                                    <div className="twm-bnr-title-large">Got Talent ?</div>
                                    <div className="twm-bnr-title-large">Meet Opportunity</div>
                                    <div className="twm-bnr-discription">Over <span className="text-clr-pink">1800+ </span> jobs are waiting for you</div>
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
                                                <div className="form-group col-xl-3 col-lg-6 col-md-6">
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
                                                <div className="form-group col-xl-3 col-lg-6 col-md-6">
                                                    <button type="button" className="site-button">Find Job</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-12">
                                <div className="bnr-media bounce2">
                                    <JobZImage src="images/home-8/bnr-right-pic.png" alt="#" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-bnr-bottom-section">
                        <div className="twm-browse-jobs">Jobs</div>
                    </div>
                </div>
            </div>
            {/*Banner End*/}

            {/* Popular category SECTION START */}
            <div className="section-full p-t120 p-b0 site-bg-white twm-jobatglance-wrap8">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs at a glance</div>
                                    </div>
                                    <h2 className="wt-title">Recommended Jobs</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 wt-separator-two-part-right text-right">
                                <NavLink to={publicUser.jobs.LIST} className=" site-button">View All Jobs</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="twm-jobatglance-h8">
                        <div className="owl-carousel h-page8-jobs-slider">
                            <div className="item">
                                {/*1*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-hr" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Human Resource</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">45 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*2*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-user" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Management</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">70 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*3*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-bank" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Accountant</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">65 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*4*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-dashboard" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">55 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*5*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-dashboard" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Software</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">55 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*6*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-bars" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Marketing &amp; Sales</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">55 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*7*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-project-management" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Educational</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">86 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*8*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-project-management" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Educational</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">86 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*9*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-coding" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>UI/UX Designer</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">86 Jobs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="item">
                                {/*10*/}
                                <div className="job-categories-home-8">
                                    <div className="twm-media cat-bg-clr-3">
                                        <div className="flaticon-camera-tripod" />
                                    </div>
                                    <NavLink to={publicUser.jobs.DETAIL1}>Media Reporter</NavLink>
                                    <div className="twm-content">
                                        <div className="twm-jobs-available">86 Jobs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Popular category SECTION END */}
            
            {/* Jobs START */}
            <div className="section-full p-t120 p-b90 site-bg-white pos-relative twm-bdr-bottom-1">
                <div className="container">
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer">
                        <div className="wt-small-separator site-text-primary">
                            <div>Job of the day</div>
                        </div>
                        <h2 className="wt-title">Connect with the right candidates faster.</h2>
                    </div>
                    {/* title="" END*/}
                    <div className="section-content">
                        <div className="twm-jobs-grid-h5-wrap">
                            <div className="row">
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                                <div className="col-lg-6 col-md-6">
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
                            </div>
                            <div className="text-center m-b30">
                                <NavLink to={publicUser.jobs.GRID} className=" site-button">View All</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Recruiters END */}
            {/* TOP COMPANIES START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-companies-wrap twm-companies-wrap-h-page-7 pos-relative">
                <div className="twm-companies-wrap-bg-block2" />
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer content-white">
                    <div className="wt-small-separator site-text-primary">
                        <div>Top Companies</div>
                    </div>
                    <h2 className="wt-title">Get hired in top companies</h2>
                </div>
                {/* title="" END*/}
                <div className="container  block-background-white">
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
            {/* PRICING TABLE SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-light tw-pricing-area">
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

export default Home8Page;
