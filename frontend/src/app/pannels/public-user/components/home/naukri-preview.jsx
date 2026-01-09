import JobZImage from "../../../../common/jobz-img";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadScript, updateSkinStyle } from "../../../../../globals/constants";
import api from "../../../../../utils/api";
import "./naukri-preview.css";

// Naukri-style preview homepage using existing theme classes/colors
function HomeNaukriPreview() {
  // Search state
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  // Data state
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // helpers for preview-only UI
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randFloat = (min, max, d = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(d));

  useEffect(() => {
    updateSkinStyle("8", false, false);
    loadScript("js/custom.js");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.all([
        api.getJobs({ limit: 12 }),
        api.getCompanies({ limit: 12 }),
      ]);
      if (jobsRes?.success && Array.isArray(jobsRes.jobs)) setJobs(jobsRes.jobs);
      if (companiesRes?.success && Array.isArray(companiesRes.companies))
        setCompanies(companiesRes.companies);
    } catch (e) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = encodeURIComponent(keywords || "");
    const loc = encodeURIComponent(location || "");
    navigate(`/job-grid?q=${q}&loc=${loc}`);
  };

  // Static UI chips to mirror Naukri structure
  const trending = [
    "Frontend Developer",
    "Backend Developer",
    "Java",
    "Python",
    "React",
    "Sales",
    "Marketing",
  ];

  const popularRoles = [
    "Software Engineer",
    "Data Analyst",
    "DevOps Engineer",
    "Project Manager",
    "UI/UX Designer",
    "Business Analyst",
    "QA Engineer",
    "Full Stack Developer",
  ];

  const topCategories = [
    "IT & Software",
    "Banking & Finance",
    "Sales & Marketing",
    "Operations",
    "HR & Admin",
    "Design & Creative",
    "Analytics",
    "Customer Support",
  ];

  return (
    <div className="naukri-preview-page">
      {/* HERO + SEARCH */}
      <div className="nk-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="nk-hero-copy">
                <h1 className="nk-hero-title">
                  Find your dream job now
                </h1>
                <div className="nk-hero-sub">5 lakh+ jobs for you to explore</div>
              </div>

              <form className="nk-search" onSubmit={handleSearch}>
                <div className="nk-search-row">
                  <div className="nk-search-col">
                    <i className="fas fa-briefcase" />
                    <input
                      type="text"
                      placeholder="Enter skills / designations / companies"
                      aria-label="What (skills, designations, companies)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>
                  <div className="nk-search-col">
                    <i className="fas fa-map-marker-alt" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      aria-label="Where (location)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="nk-search-btn" aria-label="Search">Search</button>
                </div>
              </form>

              <div className="nk-trending">
                <span>Trending searches:</span>
                {trending.map((tag, idx) => (
                  <NavLink key={idx} to={`/job-grid?q=${encodeURIComponent(tag)}`}>
                    {tag}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="nk-hero-illustration" role="img" aria-label="Illustration">
                <JobZImage src="images/home-16/banner/bnr-pic.png" alt="hero" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLORE BY TOP CATEGORIES */}
      <div className="section-full site-bg-white p-t30 p-b10">
        <div className="container">
          <div className="naukri-section-head">
            <h2 className="naukri-title">Top Categories</h2>
            <div className="naukri-sub">Explore by</div>
          </div>

          <div className="row g-3">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="col-auto">
                <NavLink to={`/job-grid?q=${encodeURIComponent(cat)}`} className="nk-chip">
                  {cat}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP COMPANIES HIRING NOW */}
      <div className="section-full site-bg-gray p-t40 p-b40">
        <div className="container">
          <div className="naukri-section-head d-flex justify-content-between align-items-end">
            <div>
              <h2 className="naukri-title">Top companies hiring now</h2>
              <div className="naukri-sub">Explore Companies</div>
            </div>
            <NavLink to="/emp-list" className="nk-link">View all</NavLink>
          </div>

          <div className="row g-3">
            {(loading ? Array.from({ length: 8 }) : companies).map((c, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="nk-card h-100 d-flex align-items-center">
                  <div className="nk-company-avatar">
                    {c?.logo ? (
                      <img src={c.logo} alt={c?.name || "Company"} />
                    ) : (
                      <span>{(c?.name || "C").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="m-l15">
                    <div className="nk-title-sm">
                      {c?.name || "Company"}
                    </div>
                    <NavLink to={c?._id ? `/emp-detail/${c._id}` : "/emp-list"} className="nk-link">
                      View jobs
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPULAR ROLES */}
      <div className="section-full site-bg-white p-t30 p-b10">
        <div className="container">
          <div className="naukri-section-head">
            <h2 className="naukri-title">Popular Roles</h2>
            <div className="naukri-sub">Discover jobs across</div>
          </div>
          <div className="row g-3">
            {popularRoles.map((role, idx) => (
              <div key={idx} className="col-auto">
                <NavLink to={`/job-grid?q=${encodeURIComponent(role)}`} className="nk-chip">
                  {role}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECOMMENDED JOBS */}
      <div className="section-full site-bg-gray p-t40 p-b50">
        <div className="container">
          <div className="naukri-section-head d-flex justify-content-between align-items-end">
            <div>
              <h2 className="naukri-title">Recommended jobs for you</h2>
              <div className="naukri-sub">Based on demand</div>
            </div>
            <NavLink to="/job-grid" className="nk-link">View all</NavLink>
          </div>

          <div className="row g-3">
            {(loading ? Array.from({ length: 6 }) : jobs).map((job, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="nk-card nk-job-card h-100">
                  <div className="nk-job-top">
                    <div className="nk-job-avatar">
                      <i className="fas fa-briefcase" />
                    </div>
                    <div className="nk-job-meta">
                      <NavLink
                        to={job?._id ? `/job-detail/${job._id}` : "/job-grid"}
                        className="nk-job-title"
                      >
                        {job?.title || "Job Title"}
                      </NavLink>
                      <div className="nk-job-sub">
                        {job?.companyName || job?.company || "Company"} • {job?.location || "Location"}
                      </div>
                    </div>
                  </div>
                  <div className="nk-job-bottom">
                    <div className="nk-job-tags">
                      <span className="nk-tag">{job?.jobType || "Full Time"}</span>
                      <span className="nk-tag">Exp: {rand(0, 8)}-{rand(9, 14)} yrs</span>
                    </div>
                    <NavLink to={job?._id ? `/job-detail/${job._id}` : "/job-grid"} className="nk-cta">
                      Apply
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CALL TO ACTIONS */}
      <div className="nk-ctas">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="nk-cta">
                <div className="nk-cta-title">For candidates</div>
                <div className="nk-cta-sub">Create your profile and get matched with the right opportunities.</div>
                <NavLink to="/login" className="nk-cta-btn">Register / Login</NavLink>
              </div>
            </div>
            <div className="col-md-6">
              <div className="nk-cta">
                <div className="nk-cta-title">For employers</div>
                <div className="nk-cta-sub">Post jobs and find the best candidates faster.</div>
                <NavLink to="/employer/login" className="nk-cta-btn">Post a Job</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeNaukriPreview;
