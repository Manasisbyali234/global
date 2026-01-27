import { useEffect, useState } from "react";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";
import CountUp from "react-countup";
import { publicUser } from "../../../../../globals/route-names";
import { NavLink } from "react-router-dom";
import MobileTestIndicator from "../../../../../components/MobileTestIndicator";
import HomeJobCard from "../../../../../components/HomeJobCard";
import { formatDate } from "../../../../../utils/dateFormatter";
// CSS is now in public/assets/css/home-job-cards.css
import "../../../../../categories-mobile-grid-fix.css";
import "../../../../../remove-carousel-hover-effects.css";

function TopRecruitersSection() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopJobs();
    }, []);

    const fetchTopJobs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=8');
            const data = await response.json();
            
            if (data.success) {
                setJobs(data.jobs);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const displayJobs = jobs.slice(0, 8);

    return (
        <div className="section-full p-t120 site-bg-white twm-companies-wrap">
            <div className="container">
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Top Recruiters</div>
                    </div>
                    <h2 className="wt-title">Discover your next career move</h2>
                </div>
            </div>
            <div className="container">
                <div className="section-content" style={{marginTop: '40px'}}>
                    {loading ? (
                        <div className="text-center p-5">Loading jobs...</div>
                    ) : displayJobs.length > 0 ? (
                        <div className="home-jobs-grid">
                            {displayJobs.map((job) => (
                                <HomeJobCard key={job._id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-5">
                            <p>No jobs found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad'
];

function HomeJobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=5');
            const data = await response.json();
            if (data.success) {
                
                setJobs(data.jobs.slice(0, 5));
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="section-content">
                <div className="text-center p-5">Loading jobs...</div>
            </div>
        );
    }

    return (
        <div className="section-content">
            <div className="twm-jobs-list-wrap">
                <ul>
                    {jobs.length > 0 ? jobs.map((job) => (
                        <li key={job._id}>
                            <div className="twm-jobs-list-style1 mb-5">
                                <div className="twm-media">
                                    {(job.companyLogo || job.employerProfile?.logo) ? (
                                        <img src={job.companyLogo || job.employerProfile.logo} alt="Company Logo" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                    ) : (
                                        <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                    )}
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-job-title">
                                        <h4>{job.title}<span className="twm-job-post-duration">/ {formatDate(job.createdAt)}</span></h4>
                                    </NavLink>
                                    <p className="twm-job-address">{Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'Location not specified')}</p>
                                    {(job.companyName || job.employerId?.companyName) && (
                                        <a href="#" className="twm-job-websites site-text-primary">{job.companyName || job.employerId?.companyName}</a>
                                    )}
                                    <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                                        Posted by: <strong>{job.employerId?.employerType === 'consultant' ? 'Consultancy' : 'Company'}</strong>
                                    </div>
                                </div>
                                <div className="twm-right-content">
                                    <div className="twm-jobs-category green">
                                        <span className="twm-bg-green">
                                            {job.jobType || 'Full-time'}
                                        </span>
                                    </div>
                                    <div className="twm-jobs-amount">
                                        {job.salary ? (
                                            typeof job.salary === 'object' && job.salary.currency ? 
                                                `${job.salary.currency === 'USD' ? '$' : '₹'}${job.salary.min || job.salary.max || ''}` :
                                                typeof job.salary === 'string' && job.salary.includes('₹') ? 
                                                    job.salary : 
                                                    `₹${job.salary}`
                                        ) : '₹4.25-5.5'} <span>LPA</span>
                                    </div>
                                    <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                </div>
                            </div>
                        </li>
                    )) : (
                        <li>
                            <div className="text-center p-5">
                                <h5>No jobs found</h5>
                                <p>Please check back later for new opportunities.</p>
                            </div>
                        </li>
                    )}
                </ul>
                <div className="text-center m-b30">
                    <NavLink to={publicUser.jobs.LIST} className="site-button">View All</NavLink>
                </div>
            </div>
        </div>
    );
}

function Home1Page() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs');
            const data = await response.json();
            
            if (data.success) {
                const categoryCount = {};
                data.jobs.forEach(job => {
                    const category = job.category || 'Other';
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
                
                const categoryList = Object.entries(categoryCount).map(([name, count]) => ({
                    name,
                    count,
                    icon: getCategoryIcon(name)
                }));
                
                
                setCategories(categoryList);
            }
        } catch (error) {
            
            // Fallback categories
            setCategories([
                {name: 'IT', count: 5, icon: 'flaticon-coding'},
                {name: 'Sales', count: 4, icon: 'flaticon-user'},
                {name: 'Marketing', count: 3, icon: 'flaticon-bars'},
                {name: 'Finance', count: 2, icon: 'flaticon-money'},
                {name: 'HR', count: 3, icon: 'flaticon-hr'},
                {name: 'Operations', count: 2, icon: 'flaticon-dashboard'},
                {name: 'Design', count: 1, icon: 'flaticon-computer'}
            ]);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'IT': 'flaticon-coding',
            'Sales': 'flaticon-user',
            'Marketing': 'flaticon-bars',
            'Finance': 'flaticon-money',
            'HR': 'flaticon-hr',
            'Operations': 'flaticon-settings',
            'Design': 'flaticon-computer',
            'Content': 'flaticon-note',
            'Healthcare': 'flaticon-healthcare',
            'Other': 'flaticon-dashboard'
        };
        return icons[category] || 'flaticon-dashboard';
    };



    return (
        <div style={{fontFamily: '"Plus Jakarta Sans", sans-serif'}}>
            <MobileTestIndicator />
            {/*Banner Start*/}
            <div className="twm-home1-banner-section site-bg-gray bg-cover" style={{ backgroundImage: `url(${publicUrlFor("images/main-slider/slider1/bg1.jpg")})` }}>
                <div className="container-fluid">
                    <div className="row">
                        {/*Left Section*/}
                        <div className="col-xl-6 col-lg-6 col-md-12">
                            <div className="twm-bnr-left-section">
                                <div className="twm-bnr-title-small">We Have <span className="site-text-primary">208,000+</span> Live Jobs</div>
                                <div className="twm-bnr-title-large">Find the <span className="site-text-primary" style={{fontWeight: 'normal'}}>job</span> that fits your life</div>
                                <div className="twm-bnr-discription">Type your keyword, then click search to find your perfect job.</div>
                                <div className="twm-bnr-search-bar">
                                    <form>
                                        <div className="row">
                                            {/*Title*/}
                                            <div className="form-group col-xl-3 col-lg-6 col-md-6 col-sm-12">
                                                <label>What</label>
                                                <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-Job_Title" data-bv-field="size">
                                                    <option disabled value="" >Select Category</option>
                                                    <option>Job Title</option>
                                                    <option>Web Designer</option>
                                                    <option>Developer</option>
                                                    <option>Acountant</option>
                                                </select>
                                            </div>
                                            {/*All Category*/}
                                            <div className="form-group col-xl-3 col-lg-6 col-md-6 col-sm-12">
                                                <label>Type</label>
                                                <select className="wt-search-bar-select selectpicker" data-live-search="true" title="" id="j-All_Category" data-bv-field="size">
                                                    <option disabled value="" >Select Category</option>
                                                    <option>All Category</option>
                                                    <option>Web Designer</option>
                                                    <option>Developer</option>
                                                    <option>Acountant</option>
                                                </select>
                                            </div>
                                            {/*Location*/}
                                            <div className="form-group col-xl-3 col-lg-6 col-md-6 col-sm-12">
                                                <label>Location</label>
                                                <div className="twm-inputicon-box">
                                                    <input name="username" type="text" required className="form-control" placeholder="Search..." />
                                                    <i className="twm-input-icon fas fa-map-marker-alt" />
                                                </div>
                                            </div>
                                            {/*Find job btn*/}
                                            <div className="form-group col-xl-3 col-lg-6 col-md-6 col-sm-12">
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
                        <div className="col-xl-6 col-lg-6 col-md-12 twm-bnr-right-section">
                            <div className="twm-bnr-right-content">
                                <div className="twm-img-bg-circle-area">
                                    <div className="twm-img-bg-circle1 rotate-center"><span /></div>
                                    <div className="twm-img-bg-circle2 rotate-center-reverse"><span /></div>
                                    <div className="twm-img-bg-circle3"><span /></div>
                                </div>
                                <div className="twm-bnr-right-carousel">
                                    <div className="owl-carousel twm-h1-bnr-carousal">
                                        <div className="item">
                                            <div className="slide-img">
                                                <JobZImage src="images/main-slider/slider1/r-img1.png" alt="#" />
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="slide-img">
                                                <div className="slide-img">
                                                    <JobZImage src="images/main-slider/slider1/r-img2.png" alt="#" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="twm-bnr-blocks-position-wrap">
                                        {/*icon-block-1*/}
                                        <div className="twm-bnr-blocks twm-bnr-blocks-position-1">
                                            <div className="twm-icon">
                                                <JobZImage src="images/main-slider/slider1/icon-1.png" alt="" />
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
                                        {/*icon-block-2*/}
                                        <div className="twm-bnr-blocks twm-bnr-blocks-position-2">
                                            <div className="twm-icon">
                                                <JobZImage src="images/main-slider/slider1/icon-2.png" alt="" />
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
                                {/*Samll Ring Left*/}
                                <div className="twm-small-ring-l slide-top-animation" />
                                <div className="twm-small-ring-2 slide-top-animation" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="twm-gradient-text">
                    Jobs
                </div>
            </div>
            {/*Banner End*/}
            {/* HOW IT WORK SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-how-it-work-area2">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-12">
                            {/* title="" START*/}
                            <div className="section-head left wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <div>for candidates</div>
                                </div>
                                <h2 className="wt-title">How It Works for candidates</h2>
                            </div>
                            <ul className="description-list">
                                <li>
                                    <i className="feather-check" />
                                    Trusted &amp; Quality Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    International Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    No Extra Charge
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    Top Companies
                                </li>
                            </ul>
                            {/* title="" END*/}
                        </div>
                        <div className="col-lg-8 col-md-12">
                            <div className="twm-w-process-steps-2-wrap">
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-6" style={{paddingLeft: '8px', paddingRight: '8px'}}>
                                        <div className="twm-w-process-steps-2" style={{minHeight: '280px', padding: '25px 20px'}}>
                                            <div className="twm-w-pro-top bg-clr-sky-light bg-sky-light-shadow">
                                                <span className="twm-large-number text-clr-sky">01</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Register<br />Your Account</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6" style={{paddingLeft: '8px', paddingRight: '8px'}}>
                                        <div className="twm-w-process-steps-2" style={{minHeight: '280px', padding: '25px 20px'}}>
                                            <div className="twm-w-pro-top bg-clr-yellow-light bg-yellow-light-shadow">
                                                <span className="twm-large-number text-clr-yellow">02</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon4.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Search <br />
                                                    Your Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6" style={{paddingLeft: '8px', paddingRight: '8px'}}>
                                        <div className="twm-w-process-steps-2" style={{minHeight: '280px', padding: '25px 20px'}}>
                                            <div className="twm-w-pro-top bg-clr-pink-light bg-pink-light-shadow">
                                                <span className="twm-large-number text-clr-pink">03</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Apply <br />For Dream Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6" style={{paddingLeft: '8px', paddingRight: '8px'}}>
                                        <div className="twm-w-process-steps-2" style={{minHeight: '280px', padding: '25px 20px'}}>
                                            <div className="twm-w-pro-top bg-clr-green-light bg-clr-light-shadow">
                                                <span className="twm-large-number text-clr-green">04</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Upload <br />Your Resume</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-how-it-work-section">

                        <div className="row">
                            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                                <div className="twm-w-process-steps">
                                    <span className="twm-large-number">01</span>
                                    <div className="twm-w-pro-top bg-clr-sky">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                        </div>
                                        <h4 className="twm-title">Register<br />Your Account</h4>
                                    </div>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                                <div className="twm-w-process-steps">
                                    <span className="twm-large-number">02</span>
                                    <div className="twm-w-pro-top bg-clr-pink">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon2.png" alt="icon1" /></span>
                                        </div>
                                        <h4 className="twm-title">Apply <br />
                                            For Dream Job</h4>
                                    </div>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                                <div className="twm-w-process-steps">
                                    <span className="twm-large-number">03</span>
                                    <div className="twm-w-pro-top bg-clr-green">
                                        <div className="twm-media">
                                            <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                        </div>
                                        <h4 className="twm-title">Upload <br />Your Resume</h4>
                                    </div>
                                    <p>You need to create an account to find the best and preferred job.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* HOW IT WORK SECTION END */}
            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-gray twm-job-categories-area">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Jobs by Categories</div>
                                    </div>
                                    <h2 className="wt-title">Choose Your Desire Category</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 wt-separator-two-part-right">
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry the standard dummy text ever since the  when an printer took.</p>
                            </div>
                        </div>
                    </div>
                    <div className="twm-job-categories-section">
                        {/* Desktop Carousel */}
                        <div className="job-categories-style1 m-b30 desktop-categories">
                            <div className="owl-carousel job-categories-carousel owl-btn-left-bottom">
                                {categories.map((category, index) => (
                                    <div key={index} className="item">
                                        <div className="category-card">
                                            <div className="plus-badge">
                                                <div className={category.icon} />
                                            </div>
                                            <div>
                                                <div className="category-text-sub">{category.count}+ Posted new jobs</div>
                                                <NavLink to={`${publicUser.jobs.GRID}?category=${category.name}`} className="category-text-title">{category.name}</NavLink>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Grid Layout */}
                        <div className="mobile-categories" style={{display: 'block', width: '100%', padding: '0 10px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%', boxSizing: 'border-box'}}>
                                {categories.map((category, index) => (
                                    <div key={index} style={{background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', boxSizing: 'border-box'}}>
                                        <div style={{background: 'linear-gradient(135deg, #FF9D00, #FFB84D)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', marginBottom: '12px', flexShrink: 0}}>
                                            <div className={category.icon} />
                                        </div>
                                        <div style={{fontSize: '12px', color: '#999', marginBottom: '4px'}}>{category.count}+ Posted new jobs</div>
                                        <NavLink to={`${publicUser.jobs.GRID}?category=${category.name}`} style={{fontSize: '16px', fontWeight: '600', color: '#333', textDecoration: 'none'}}>{category.name}</NavLink>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-right job-categories-btn">
                            <NavLink to={publicUser.jobs.GRID} className="site-button">View All</NavLink>
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
                            <div className="col-lg-4 col-md-12 col-sm-12">
                                <div className="twm-explore-media-wrap">
                                    <div className="twm-media">
                                        <JobZImage src="images/gir-large.png" alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12 col-sm-12">
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
            {/* TOP RECRUITERS START */}
            <TopRecruitersSection />
            {/* TOP RECRUITERS END */
            {/* TOP COMPANIES START */}
            <div className="section-full p-t120 p-b90 site-bg-white">
                <div className="container">
                <div className="twm-company-approch-outer">
                    <div className="twm-company-approch">
                        <div className="row">
                            {/*block 1*/}
                            <div className="col-lg-4 col-md-12 col-sm-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-sky">
                                            <span className="counter">
                                                <CountUp end={5} duration={10} />
                                            </span>M+</div>
                                        <p className="icon-content-info">Million daily active users</p>
                                    </div>
                                </div>
                            </div>
                            {/*block 2*/}
                            <div className="col-lg-4 col-md-12 col-sm-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-pink">
                                            <span className="counter">
                                                <CountUp end={9} duration={10} />
                                            </span>K+</div>
                                        <p className="icon-content-info">Open job positions</p>
                                    </div>
                                </div>
                            </div>
                            {/*block 3*/}
                            <div className="col-lg-4 col-md-12 col-sm-12">
                                <div className="counter-outer-two">
                                    <div className="icon-content">
                                        <div className="tw-count-number text-clr-green">
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

            {/* TESTIMONIAL SECTION START */}
            <div className="section-full p-t120 p-b90 site-bg-white twm-testimonial-1-area">
                <div className="container">
                    <div className="wt-separator-two-part">
                        <div className="row wt-separator-two-part-row">
                            <div className="col-xl-5 col-lg-6 col-md-12 col-sm-12 wt-separator-two-part-left">
                                {/* title="" START*/}
                                <div className="section-head left wt-small-separator-outer">
                                    <div className="wt-small-separator site-text-primary">
                                        <div>Clients Testimonials</div>
                                    </div>
                                    <h2 className="wt-title">What Our Customers Say About Us</h2>
                                </div>
                                {/* title="" END*/}
                            </div>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="owl-carousel twm-testimonial-1-carousel owl-btn-bottom-center ">
                            {/* COLUMNS 1 */}
                            <div className="item ">
                                <div className="twm-testimonial-1">
                                    <div className="twm-testimonial-1-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-1.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 2 */}
                            <div className="item ">
                                <div className="twm-testimonial-1">
                                    <div className="twm-testimonial-1-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-2.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 3 */}
                            <div className="item ">
                                <div className="twm-testimonial-1">
                                    <div className="twm-testimonial-1-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-3.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 4 */}
                            <div className="item ">
                                <div className="twm-testimonial-1">
                                    <div className="twm-testimonial-1-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-2.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* COLUMNS 5 */}
                            <div className="item ">
                                <div className="twm-testimonial-1">
                                    <div className="twm-testimonial-1-content">
                                        <div className="twm-testi-media">
                                            <JobZImage src="images/testimonials/pic-1.png" alt="#" />
                                        </div>
                                        <div className="twm-testi-content">
                                            <div className="twm-quote">
                                                <JobZImage src="images/quote-dark.png" alt="" />
                                            </div>
                                            <div className="twm-testi-info">I just got a job that I applied for via careerfy! I used the site all the time during my job hunt.</div>
                                            <div className="twm-testi-detail">
                                                <div className="twm-testi-name">Nikola Tesla</div>
                                                <div className="twm-testi-position">Accountant</div>
                                            </div>
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
            <div className="section-full p-t120 p-b90 site-bg-gray">
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
                        <div className="twm-blog-post-1-outer-wrap">
                            <div className="owl-carousel twm-la-home-blog owl-btn-bottom-center">
                                <div className="item">
                                    {/*Block one*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg1.jpg" alt="" /></NavLink>
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
                                <div className="item">
                                    {/*Block two*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg2.jpg" alt="" /></NavLink>
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
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the March
                                                        2023 jobs report</NavLink>
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
                                <div className="item">
                                    {/*Block three*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg3.jpg" alt="" /></NavLink>
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
                                                    <NavLink to={publicUser.blog.DETAIL}>Job Board is the most important
                                                        sector in the world</NavLink>
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
                                <div className="item">
                                    {/*Block Four*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg1.jpg" alt="" /></NavLink>
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
                                <div className="item">
                                    {/*Block Five*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg2.jpg" alt="" /></NavLink>
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
                                                    <NavLink to={publicUser.blog.DETAIL}>5 things to know about the March
                                                        2023 jobs report</NavLink>
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
                                <div className="item">
                                    {/*Block Six*/}
                                    <div className="blog-post twm-blog-post-1-outer">
                                        <div className="wt-post-media">
                                            <NavLink to={publicUser.blog.DETAIL}><JobZImage src="images/blog/latest/bg3.jpg" alt="" /></NavLink>
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
                                                    <NavLink to={publicUser.blog.DETAIL}>Job Board is the most important
                                                        sector in the world</NavLink>
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
        </div>
    
    )

}

export default Home1Page;
