import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript, publicUrlFor, updateSkinStyle } from "../../../../../globals/constants";
import { useEffect } from "react";

function Home17Page() {

    useEffect(() => {
        updateSkinStyle("9", false, false)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home-17-banner-section">
                <div className="container">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-left-section">
                            <div className="twm-bnr-left-content">
                                <div className="bnr-media">
                                    <JobZImage src="images/home-17/banner/pic.png" alt="#" />
                                </div>
                                <div className="bnr-bg-circle">
                                    <span />
                                </div>
                            </div>
                        </div>
                        {/*right Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12">
                            <div className="twm-bnr-right-section">
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
                    </div>
                </div>
                {/*right verticle text*/}
                <div className="twm-home-17-v-text-wrap">
                    <div className="twm-17-v-text">
                        <span>You Deserve!</span>
                    </div>
                </div>
            </div>
            {/*Banner End*/}
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
            {/* GET JOBS SECTION START */}
            <div className="section-full site-bg-white h-page6-getjobs-wrap">
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
                        <div className="testimonial-outline-text">
                            <span>Testimonial</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Testimonial END */}
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
        </>
    )
}

export default Home17Page;
