import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import CountUp from "react-countup";
import { useEffect } from "react";
import { loadScript, updateSkinStyle } from "../../../../../globals/constants";

function Home12Page() {

    useEffect(()=>{
        updateSkinStyle("3", false, true)
        loadScript("js/custom.js")
    })

    return (
        <>
            {/*Banner Start*/}
            <div className="twm-home3-banner-section site-bg-primary twm-bnr-hpage-12">
                <div className="container">
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
                        </div>
                    </div>
                    <div className="twm-hpage12-bnr-pic">
                        <JobZImage src="images/home-12/banner-bg/building.png" alt="building" />
                    </div>
                    <div className="twm-hpage12-bnr-pic2">
                        <JobZImage src="images/home-12/banner-bg/job-men.png" alt="#" />
                    </div>
                </div>
                <h3 className="twm-banner-h12-r-outline-text">
                    Achieve
                </h3>
            </div>
            {/*Banner End*/}
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
            </div>
            {/* Recruiters END */}
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

export default Home12Page;
