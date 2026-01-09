import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import CountUp from "react-countup";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadScript, updateSkinStyle } from "../../../../../globals/constants";
import api from "../../../../../utils/api";
import HeroBody from "../../../../../components/HeroBody";
import { Container, Row, Col } from "react-bootstrap";
import HomeJobCard from "../../../../../components/HomeJobCard";
import showToast from "../../../../../utils/toastNotification";
import useDebounce from "../../../../../utils/useDebounce";
import { SkeletonContainer, JobCardSkeleton, StatsSkeleton, RecruiterSkeleton } from "../../../../../components/SkeletonLoader";
import "../../../../../new-job-card.css";
import "../../../../../home-responsive.css";
import "../../../../../employer-how-it-works.css";
import "../../../../../ux-improvements.css";
import "./naukri-preview.css";

function Home16Page() {
    const [jobs, setJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [stats, setStats] = useState({ totalJobs: 0, totalEmployers: 0, totalApplications: 0 });
    const [categories, setCategories] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);
    const [showingCount, setShowingCount] = useState(6);
    const [error, setError] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const dataLoadErrorRef = useRef({});
    const [dataLoadError, setDataLoadError] = useState({
        jobs: false,
        stats: false,
        recruiters: false
    });
    const [appliedJobs, setAppliedJobs] = useState(new Set());

    useEffect(() => {
        updateSkinStyle("8", false, false)
        loadScript("js/custom.js")
        fetchHomeData();
        fetchAppliedJobs();
        
        // Initialize navbar transparency
        setTimeout(() => {
            const navbars = document.querySelectorAll('header, .site-header, .navbar, .twm-header-style-1, .header-fixed, .main-header');
            navbars.forEach(navbar => {
                navbar.classList.add('navbar-transparent');
                navbar.style.cssText = 'background: transparent !important; background-color: transparent !important; box-shadow: none !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1000 !important; transition: all 0.3s ease !important;';
            });
        }, 100);

        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all sections that should animate
        const sections = document.querySelectorAll('.animate-on-scroll');
        sections.forEach(section => observer.observe(section));

        return () => {
            sections.forEach(section => observer.unobserve(section));
        };
    }, [])

    const fetchAppliedJobs = async () => {
        const token = localStorage.getItem('candidateToken');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/candidate/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const jobIds = new Set(data.applications.map(app => app.jobId._id || app.jobId));
                setAppliedJobs(jobIds);
            }
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        }
    };

    const fetchHomeData = async () => {
        setLoading(true);
        setError(null);
        const errors = { jobs: false, stats: false, recruiters: false };

        try {
            // Fetch jobs with error handling
            try {
                const jobsData = await api.getJobs({ limit: 50 });
                
                if (!jobsData) {
                    throw new Error('No response from jobs API');
                }
                
                if (jobsData.success) {
                    // Validate jobs data
                    if (!Array.isArray(jobsData.jobs)) {
                        throw new Error('Invalid jobs data format');
                    }
                    
                    // Show all jobs without filtering
                    const validJobs = jobsData.jobs || [];
                    
                    
                    setAllJobs(validJobs);
                    setJobs(validJobs.slice(0, 6));
                    
                    // Calculate category counts
                    const categoryCount = {};
                    validJobs.forEach(job => {
                        const category = job.category || 'Other';
                        categoryCount[category] = (categoryCount[category] || 0) + 1;
                    });
                    
                    const categoryList = [
                        { name: 'IT', count: categoryCount['IT'] || 0 },
                        { name: 'Content', count: categoryCount['Content'] || 0 },
                        { name: 'Sales', count: categoryCount['Sales'] || 0 },
                        { name: 'Healthcare', count: categoryCount['Healthcare'] || 0 },
                        { name: 'HR', count: categoryCount['HR'] || 0 },
                        { name: 'Finance', count: categoryCount['Finance'] || 0 },
                        { name: 'Education', count: categoryCount['Education'] || 0 },
                        { name: 'Design', count: categoryCount['Design'] || 0 },
                        { name: 'Operations', count: categoryCount['Operations'] || 0 }
                    ];
                    
                    setCategories(categoryList);
                } else {
                    throw new Error(jobsData.message || 'Failed to fetch jobs');
                }
            } catch (jobError) {
                
                errors.jobs = true;
                setAllJobs([]);
                setJobs([]);
            }

            // Fetch stats with error handling
            try {
                const pub = await api.getPublicStats();
                if (pub && pub.success && pub.stats) {
                    // Validate stats data
                    const validStats = {
                        totalJobs: Number(pub.stats.totalJobs) || 0,
                        totalEmployers: Number(pub.stats.totalEmployers) || 0,
                        totalApplications: Number(pub.stats.totalApplications) || 0
                    };
                    setStats(validStats);
                } else {
                    // Try admin stats as fallback
                    const adm = await api.getAdminStats();
                    if (adm && adm.success && adm.stats) {
                        const validStats = {
                            totalJobs: Number(adm.stats.totalJobs) || 0,
                            totalEmployers: Number(adm.stats.totalEmployers) || 0,
                            totalApplications: Number(adm.stats.totalApplications) || 0
                        };
                        setStats(validStats);
                    } else {
                        throw new Error('Failed to fetch stats');
                    }
                }
            } catch (statsError) {
                
                errors.stats = true;
                setStats({ totalJobs: 0, totalEmployers: 0, totalApplications: 0 });
            }

            // Fetch recruiters with error handling
            try {
                const recruitersData = await api.getTopRecruiters({ limit: 12 });
                
                if (recruitersData && recruitersData.success) {
                    // Validate recruiters data
                    if (!Array.isArray(recruitersData.recruiters)) {
                        throw new Error('Invalid recruiters data format');
                    }
                    
                    // Sanitize recruiters data
                    const validRecruiters = recruitersData.recruiters.filter(recruiter => {
                        return recruiter && 
                               typeof recruiter === 'object' && 
                               recruiter._id && 
                               recruiter.companyName;
                    });
                    
                    setRecruiters(validRecruiters);
                } else {
                    throw new Error(recruitersData.message || 'Failed to fetch recruiters');
                }
            } catch (recruitersError) {
                
                errors.recruiters = true;
                setRecruiters([]);
            }

            setDataLoadError(errors);
            
            // Set general error if all data failed to load
            if (errors.jobs && errors.stats && errors.recruiters) {
                setError('Unable to load page data. Please check your connection and try again.');
            }
        } catch (error) {
            
            setError('An unexpected error occurred. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback((filters) => {
        try {
            // Validate filters object
            if (!filters || typeof filters !== 'object') {
                return;
            }

            // Validate allJobs array
            if (!Array.isArray(allJobs)) {
                setError('Unable to search jobs. Please refresh the page.');
                showToast('Unable to search jobs. Please refresh the page.', 'error');
                return;
            }

            let filtered = [...allJobs];

            // Filter by search term (job title, company name, or description)
            if (filters.search) {
                // Sanitize search term
                const searchTerm = String(filters.search).trim().toLowerCase();

                if (searchTerm.length < 2) {
                    showToast('Search term must be at least 2 characters', 'warning');
                    return;
                }

                if (searchTerm.length > 100) {
                    showToast('Search term is too long (max 100 characters)', 'warning');
                    return;
                }

                filtered = filtered.filter(job => {
                    try {
                        return job.title?.toLowerCase().includes(searchTerm) ||
                            job.companyName?.toLowerCase().includes(searchTerm) ||
                            job.employerId?.companyName?.toLowerCase().includes(searchTerm) ||
                            job.description?.toLowerCase().includes(searchTerm) ||
                            job.category?.toLowerCase().includes(searchTerm);
                    } catch (err) {
                        return false;
                    }
                });
            }

            // Filter by job type
            if (filters.jobType) {
                const jobType = String(filters.jobType).trim().toLowerCase();

                if (jobType.length > 50) {
                    showToast('Job type filter is invalid', 'warning');
                    return;
                }

                filtered = filtered.filter(job => {
                    try {
                        const jobTypeField = job.jobType || job.type || '';
                        return jobTypeField.toLowerCase().includes(jobType);
                    } catch (err) {
                        return false;
                    }
                });
            }

            // Filter by location
            if (filters.location) {
                const location = String(filters.location).trim().toLowerCase();

                if (location.length < 2) {
                    showToast('Location must be at least 2 characters', 'warning');
                    return;
                }

                if (location.length > 100) {
                    showToast('Location filter is too long (max 100 characters)', 'warning');
                    return;
                }

                filtered = filtered.filter(job => {
                    try {
                        return job.location?.toLowerCase().includes(location);
                    } catch (err) {
                        return false;
                    }
                });
            }

            setFilteredJobs(filtered);
            setJobs(filtered.slice(0, 6)); // Show first 6 filtered results
            setShowingCount(6);
            setIsFiltered(Object.keys(filters).length > 0);

            // Show success message with result count
            if (Object.keys(filters).length > 0) {
                showToast(`Found ${filtered.length} job(s) matching your criteria`, 'success', 2000);

                // Scroll to jobs section when search is performed
                setTimeout(() => {
                    const jobsSection = document.querySelector('.twm-jobs-grid-wrap');
                    if (jobsSection) {
                        jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        } catch (error) {
            setError('An error occurred while searching. Please try again.');
            showToast('An error occurred while searching. Please try again.', 'error');
        }
    }, [allJobs]);
    
    const handleShowMore = useCallback(() => {
        try {
            // Validate current state
            if (!Array.isArray(allJobs) || !Array.isArray(filteredJobs)) {
                setError('Unable to load more jobs. Please refresh the page.');
                showToast('Unable to load more jobs. Please refresh the page.', 'error');
                return;
            }

            const newCount = showingCount + 6;

            // Validate newCount
            if (newCount < 0 || newCount > 1000) {
                showToast('No more jobs to load', 'info');
                return;
            }

            const sourceJobs = isFiltered ? filteredJobs : allJobs;
            const newJobs = sourceJobs.slice(0, newCount);

            setJobs(newJobs);
            setShowingCount(newCount);

            // Show feedback to user
            const loadedCount = Math.min(6, sourceJobs.length - showingCount);
            showToast(`Loaded ${loadedCount} more job(s)`, 'info', 1500);
        } catch (error) {
            setError('An error occurred while loading more jobs.');
            showToast('An error occurred while loading more jobs.', 'error');
        }
    }, [showingCount, isFiltered, filteredJobs, allJobs]);

    return (
        <>
            {/* Error Alert */}
            {error && (
                <div className="error-alert-container">
                    <div className="error-alert-content">
                        <div className="error-alert-message">
                            <svg className="error-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="error-alert-close"
                            aria-label="Close alert"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <HeroBody className="mt-4 mt-md-5" onSearch={handleSearch} />

            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t20 p-b20 twm-job-categories-hpage-6-area animate-on-scroll" style={{background: 'transparent', backgroundColor: 'transparent', paddingLeft: '20px', paddingRight: '20px'}}>
                <div className="section-head center wt-small-separator-outer mb-3" style={{paddingLeft: '20px'}}>
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs by Categories</div>
                    </div>
                    <h2 className="wt-title">Choose a Relevant Category</h2>
                </div>
                <div style={{background: 'transparent', backgroundColor: 'transparent'}}>
                    <div className="category-cards-container" style={{marginLeft: '10px', marginRight: '10px'}}>
                        <NavLink to="/job-grid?category=IT" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Programming</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[0]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Content" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Content Writer</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[1]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Sales" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Sales & Marketing</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[2]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Healthcare" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Healthcare</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[3]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=HR" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Human Resources</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[4]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>

                    </div>
                    
                    {/* Second Row */}
                    <div className="category-cards-container" style={{marginLeft: '10px', marginRight: '10px', marginTop: '20px'}}>
                        <NavLink to="/job-grid?category=Finance" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Finance</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories[5]?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Education" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Education</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories.find(cat => cat.name === 'Education')?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Design" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Design</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories.find(cat => cat.name === 'Design')?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>
                        <NavLink to="/job-grid?category=Operations" style={{textDecoration: 'none'}}>
                            <div className="category-card" style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '16px 22px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0px 4px 18px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0px 8px 22px rgba(0,0,0,0.12)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0px 4px 18px rgba(0,0,0,0.06)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}>
                                <div>
                                    <div className="category-text-title" style={{
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>Operations</div>
                                    <div className="category-text-sub" style={{
                                        fontSize: '13px',
                                        color: '#A0A7B0',
                                        marginTop: '3px'
                                    }}>{categories.find(cat => cat.name === 'Operations')?.count || 0} Jobs</div>
                                </div>
                                <div className="plus-badge" style={{
                                    background: 'rgba(255, 153, 0, 0.12)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF9D00',
                                    fontSize: '18px'
                                }}>+</div>
                            </div>
                        </NavLink>

                    </div>
                </div>
            </div>
            {/* JOBS CATEGORIES SECTION END */}

            {/* JOB POST START */}
            <div className="section-full p-t20 p-b20 twm-bg-ring-wrap2 animate-on-scroll" style={{background: 'transparent', backgroundColor: 'transparent', paddingLeft: '30px', paddingRight: '30px'}}>
                <div className="twm-bg-ring-right" />
                <div className="twm-bg-ring-left" />
                <div style={{background: 'transparent', backgroundColor: 'transparent'}}>
                    <div className="wt-separator-two-part" style={{background: 'transparent'}}>
                        <Row className="wt-separator-two-part-row">
                            <Col
                                xl={6}
                                lg={6}
                                md={12}
                                className="wt-separator-two-part-left mb-4"
                            >
                                {/* title="" START*/}
                                  <div className="recruiters-header-section" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingLeft: '30px'}}>
                                  <div className="text-left">
                                  <div className="wt-small-separator site-text-primary">
                                <div>Top Recruiters</div>
                            </div>
                            <h2 className="wt-title mb-0">Discover your next career move</h2>
                        </div>
                        </div>
                            {/* title="" END*/}
                            </Col>

                            <Col
                                xl={6}
                                lg={6}
                                md={12}
                                className="wt-separator-two-part-right text-right mb-4"
                            >
                                {isFiltered && (
                                    <button
                                        className="site-button site-button-sm me-3"
                                        onClick={() => {
                                            setJobs(allJobs.slice(0, 6));
                                            setFilteredJobs([]);
                                            setIsFiltered(false);
                                            setShowingCount(6);
                                            // Reset search form
                                            const searchForm =
                                                document.querySelector(".search-container");
                                            if (searchForm) {
                                                const selects = searchForm.querySelectorAll("select");
                                                selects.forEach((select) => (select.value = ""));
                                            }
                                        }}
                                        style={{ marginRight: "10px" }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                                <NavLink to="/job-grid" className=" site-button" style={{padding: '0.5rem 1rem', fontSize: '14px', display: 'inline-flex', width: 'auto', whiteSpace: 'nowrap', marginRight: '30px'}}>
                                    Browse All Jobs
                                </NavLink>
                            </Col>
                        </Row>
                    </div>

                    <div className="section-content">
                        <div className="twm-jobs-grid-wrap">
                            <div style={{padding: '0 45px', background: 'transparent', width: '100%'}}>
                                <Row style={{'--bs-gutter-x': '6px', flexWrap: 'wrap', justifyContent: 'center'}}>
                                {jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <Col key={job._id} style={{flex: '0 0 auto', width: '350px', maxWidth: '350px'}} className="mb-2">
                                            <div className="new-job-card" style={{borderRadius: '12px', overflow: 'hidden'}}>
                                                {/* Top Row */}
                                                <div className="job-card-header">
                                                    <div className="job-card-left">
                                                        <div className="company-logo">
                                                            {job.employerProfile?.logo ? (
                                                                <img
                                                                    src={
                                                                        job.companyLogo ||
                                                                        (job.employerProfile.logo?.startsWith("data:")
                                                                            ? job.employerProfile.logo
                                                                            : `data:image/jpeg;base64,${job.employerProfile.logo}`)
                                                                    }
                                                                    alt="Company Logo"
                                                                />
                                                            ) : (
                                                                <div className="logo-placeholder">
                                                                    {(job.employerId?.companyName || "C").charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="job-info">
                                                            <h4 className="job-title">{job.title}</h4>
                                                            <div className="job-location">
                                                                <i className="feather-map-pin" />
                                                                {job.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="job-type-badge">
                                                        <span className={`job-type-pill ${
                                                            job.jobType === "Full-Time" ? "full-time" :
                                                            job.jobType === "Part-Time" ? "part-time" :
                                                            job.jobType === "Contract" ? "contract" :
                                                            job.jobType?.includes("Internship") ? "internship" :
                                                            job.jobType === "Work From Home" ? "wfh" : "full-time"
                                                        }`}>
                                                            {job.jobType || "Full-Time"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Middle Row */}
                                                <div className="job-card-middle">
                                                    <div className="ctc-info">
                                                        {job.ctc && typeof job.ctc === "object" && job.ctc.min > 0 && job.ctc.max > 0 ? (
                                                            <span className="ctc-text">
                                                                Annual CTC: {job.ctc.min === job.ctc.max
                                                                    ? `₹${Math.floor(job.ctc.min / 100000)}LPA`
                                                                    : `₹${Math.floor(job.ctc.min / 100000)} - ${Math.floor(job.ctc.max / 100000)} LPA`}
                                                            </span>
                                                        ) : (
                                                            <span className="ctc-text">CTC: Not specified</span>
                                                        )}
                                                    </div>
                                                    <div className="vacancy-info">
                                                        <span className="vacancy-text">
                                                            Vacancies: {job.vacancies || "Not specified"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Bottom Row */}
                                                <div className="job-card-footer">
                                                    <div className="company-info">
                                                        <div className="posted-by-label">Posted by:</div>
                                                        <div className="company-name">
                                                            {job.employerId?.companyName || "Company"}
                                                        </div>
                                                        <div className="poster-type">
                                                            {job.postedBy || (job.employerId?.employerType === "consultant" ? "Consultancy" : "Company")}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="apply-now-btn"
                                                        style={{
                                                            backgroundColor: appliedJobs.has(job._id) ? '#6c757d' : '',
                                                            cursor: appliedJobs.has(job._id) ? 'not-allowed' : 'pointer'
                                                        }}
                                                        disabled={appliedJobs.has(job._id)}
                                                        onClick={() => {
                                                            if (appliedJobs.has(job._id)) return;
                                                            if (job._id && String(job._id).trim()) {
                                                                const sanitizedJobId = String(job._id).replace(/[^a-zA-Z0-9]/g, '');
                                                                if (sanitizedJobId) {
                                                                    window.location.href = `/job-detail/${sanitizedJobId}`;
                                                                } else {
                                                                    showToast('Invalid job ID. Cannot navigate to job details.', 'error');
                                                                }
                                                            } else {
                                                                showToast('Job ID is missing. Cannot navigate to job details.', 'error');
                                                            }
                                                        }}
                                                    >
                                                        {appliedJobs.has(job._id) ? 'Already Applied' : 'Apply Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))
                                ) : (
                                    <Col xs={12} className="text-center">
                                        <p>
                                            {isFiltered
                                                ? "No jobs found matching your search criteria."
                                                : "No jobs available at the moment."}
                                        </p>
                                        {isFiltered && (
                                            <button
                                                className="site-button site-button-sm mt-3"
                                                onClick={() => {
                                                    setJobs(allJobs.slice(0, 6));
                                                    setFilteredJobs([]);
                                                    setIsFiltered(false);
                                                    setShowingCount(6);
                                                    // Reset search form
                                                    const searchForm =
                                                        document.querySelector(".search-container");
                                                    if (searchForm) {
                                                        const selects =
                                                            searchForm.querySelectorAll("select");
                                                        selects.forEach((select) => (select.value = ""));
                                                    }
                                                }}
                                            >
                                                View All Jobs
                                            </button>
                                        )}
                                    </Col>
                                )}
                                </Row>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* JOB POST END */}

            {/* Recruiters START */}
            <div className="section-full p-t20 p-b20 animate-on-scroll" style={{background: 'transparent', backgroundColor: 'transparent', paddingLeft: '30px', paddingRight: '30px'}}>
                <div style={{background: 'transparent', backgroundColor: 'transparent'}}>
                    {/* title="" START*/}
                    <div className="recruiters-header-section" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'transparent', paddingLeft: '30px'}}>
                        <div className="text-left">
                            <div className="wt-small-separator site-text-primary">
                                <div>Top Recruiters</div>
                            </div>
                            <h2 className="wt-title mb-0">Discover your next career move</h2>
                        </div>
                        <NavLink to="/emp-grid" className="site-button" style={{padding: '0.5rem 1rem', fontSize: '14px', display: 'inline-flex', width: 'auto', whiteSpace: 'nowrap', marginRight: '30px'}}>
                            View All
                        </NavLink>
                    </div>
                    {/* title="" END*/}

                    <div className="section-content">
                        <div className="twm-recruiters5-wrap" style={{marginLeft: '15px', marginRight: '15px'}}>
                            <div
                                className="twm-column-5 m-b30"
                                style={{
                                    "--cards-per-row": "6",
                                    padding: "10px 0"
                                }}
                            >
                                <ul>
                                    {loading ? (
                                        <li>
                                            <div className="text-center py-4">
                                                <div className="spinner-border" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        </li>
                                    ) : recruiters.length > 0 ? (
                                        recruiters.slice(0, 8).map((recruiter, index) => {
                                            const generateCompanyLogo = (companyName) => {
                                                const colors = [
                                                    "#007bff",
                                                    "#28a745",
                                                    "#dc3545",
                                                    "#ffc107",
                                                    "#17a2b8",
                                                    "#6f42c1",
                                                ];
                                                const color =
                                                    colors[companyName.length % colors.length];
                                                const initials = companyName
                                                    .split(" ")
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .substring(0, 2)
                                                    .toUpperCase();

                                                return (
                                                    <div
                                                        style={{
                                                            width: "60px",
                                                            height: "60px",
                                                            backgroundColor: color,
                                                            color: "white",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "18px",
                                                            fontWeight: "bold",
                                                            borderRadius: "8px",
                                                        }}
                                                    >
                                                        {initials}
                                                    </div>
                                                );
                                            };

                                            return (
                                                <li key={recruiter._id} style={{marginBottom: '15px'}}>
                                                    <div className="twm-recruiters5-box">
                                                        <div className="twm-rec-top">
                                                            <div className="twm-rec-media">
                                                                {recruiter.logo ? (
                                                                    <img
                                                                        src={recruiter.logo}
                                                                        alt={recruiter.companyName}
                                                                        style={{
                                                                            width: "60px",
                                                                            height: "60px",
                                                                            objectFit: "cover",
                                                                            borderRadius: "8px"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    generateCompanyLogo(recruiter.companyName)
                                                                )}
                                                            </div>
                                                            <div className="twm-rec-jobs">
                                                                {recruiter.jobCount} {recruiter.jobCount === 1 ? 'Job' : 'Jobs'}
                                                            </div>
                                                        </div>
                                                        <div className="twm-rec-content">
                                                            <h4 className="twm-title">
                                                                <NavLink
                                                                    to={`/job-grid?employerId=${recruiter._id}`}
                                                                >
                                                                    {recruiter.companyName}
                                                                </NavLink>
                                                            </h4>
                                                            <div className="twm-job-address" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '20px'}}>
                                                                <i className="feather-map-pin" />
                                                                {recruiter.location || "Multiple Locations"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li>
                                            <div className="text-center py-4">
                                                <p className="text-muted">No recruiters available at the moment.</p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            {/* Recruiters END */}

            {/* HOW IT WORK SECTION START */}
            <div className="section-full p-t20 p-b20 twm-how-it-work-area animate-on-scroll" style={{backgroundColor: 'white', paddingLeft: '20px', paddingRight: '20px'}}>
                <div>
                    {/* title="" START*/}
                    <div className="section-head center wt-small-separator-outer mb-3" style={{paddingLeft: '20px'}}>
                        <div className="wt-small-separator site-text-primary">
                            <div>For Candidates</div>
                        </div>

                        <h2 className="wt-title">How It Works for Candidates</h2>
                    </div>
                    {/* title="" END*/}

                    <div className="twm-how-it-work-section3">
                        <Row style={{marginLeft: '10px', marginRight: '10px'}}>
                            <Col xl={3} lg={6} md={6} sm={12} xs={12} className="mb-4">
                                <div className="twm-w-process-steps3 hover-card" style={{display: 'flex', alignItems: 'center', padding: '25px', borderRadius: '12px', minHeight: '140px'}}>
                                    <div className="twm-media" style={{flexShrink: '0', marginRight: '20px'}}>
                                        <div style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A00 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{flex: '1'}}>
                                        <h4 className="twm-title" style={{marginBottom: '10px', fontSize: '18px'}}>1. Register Your Account</h4>
                                        <p style={{marginBottom: '0', fontSize: '14px', lineHeight: '1.5'}}>You need to create an account to find the best jobs.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} lg={6} md={6} sm={12} xs={12} className="mb-4">
                                <div className="twm-w-process-steps3 hover-card" style={{display: 'flex', alignItems: 'center', padding: '25px', borderRadius: '12px', minHeight: '140px'}}>
                                    <div className="twm-media" style={{flexShrink: '0', marginRight: '20px'}}>
                                        <div style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A00 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{flex: '1'}}>
                                        <h4 className="twm-title" style={{marginBottom: '10px', fontSize: '18px'}}>2. Search and Apply</h4>
                                        <p style={{marginBottom: '0', fontSize: '14px', lineHeight: '1.5'}}>Search your preferred jobs and apply the best jobs.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} lg={6} md={6} sm={12} xs={12} className="mb-4">
                                <div className="twm-w-process-steps3 hover-card" style={{display: 'flex', alignItems: 'center', padding: '25px', borderRadius: '12px', minHeight: '140px'}}>
                                    <div className="twm-media" style={{flexShrink: '0', marginRight: '20px'}}>
                                        <div style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A00 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{flex: '1'}}>
                                        <h4 className="twm-title" style={{marginBottom: '10px', fontSize: '18px'}}>3. Take Assessment</h4>
                                        <p style={{marginBottom: '0', fontSize: '14px', lineHeight: '1.5'}}>Take assessment curated based on the job profile.</p>
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} lg={6} md={6} sm={12} xs={12} className="mb-4">
                                <div className="twm-w-process-steps3 hover-card" style={{display: 'flex', alignItems: 'center', padding: '25px', borderRadius: '12px', minHeight: '140px'}}>
                                    <div className="twm-media" style={{flexShrink: '0', marginRight: '20px'}}>
                                        <div style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A00 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18218 2.99721 7.13677 4.39828 5.49707C5.79935 3.85736 7.69279 2.71548 9.79619 2.24015C11.8996 1.76482 14.1003 1.98186 16.07 2.86" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M22 4L12 14.01L9 11.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style={{flex: '1'}}>
                                        <h4 className="twm-title" style={{marginBottom: '10px', fontSize: '18px'}}>4. Get Hired</h4>
                                        <p style={{marginBottom: '0', fontSize: '14px', lineHeight: '1.5'}}>Interviews and discussion rounds scheduled by the company team.</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            {/* HOW IT WORK SECTION END */}

            {/* HOW IT WORK FOR EMPLOYERS SECTION START */}
            <div className="section-full p-t20 p-b20 twm-how-it-work-area animate-on-scroll" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                <div>
                    {/* title START */}
                    <div className="section-head center wt-small-separator-outer mb-3" style={{paddingLeft: '20px'}}>
                        <div className="wt-small-separator">
                            <div style={{fontWeight: 'normal'}}>For Employers</div>
                        </div>
                        <h2 className="wt-title" style={{fontWeight: 'normal'}}>How It Works for Employers</h2>
                    </div>
                    {/* title END */}

                    <div className="twm-how-it-work-section3">
                        <Row className="g-4" style={{marginLeft: '20px', marginRight: '20px'}}>
                            {/* Card 1: Post Your Job */}
                            <Col xl={4} lg={4} md={6} sm={12} xs={12}>
                                <div className="twm-w-process-steps3">
                                    <div className="twm-media">
                                        <div>
                                            <img 
                                                src="https://static.vecteezy.com/system/resources/previews/067/381/647/non_2x/job-posting-announcement-recruitment-hiring-application-candidate-employment-vector.jpg" 
                                                alt="Post Your Job"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="twm-title">1. Post Your Job</h4>
                                        <p>Create your employer account and post job openings in just a few clicks. Add job details, skills required, salary range, and company information to attract the right talent.</p>
                                    </div>
                                </div>
                            </Col>

                            {/* Card 2: Hire the Best */}
                            <Col xl={4} lg={4} md={6} sm={12} xs={12}>
                                <div className="twm-w-process-steps3">
                                    <div className="twm-media">
                                        <div>
                                            <img 
                                                src="https://i.pinimg.com/736x/57/2e/14/572e1453e353f60c803bd01c4ea68a05.jpg" 
                                                alt="Hire the Best"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="twm-title">2. Hire the Best</h4>
                                        <p>Get instant access to qualified candidates. Review profiles, shortlist top talent, schedule interviews, and finalize your perfect hire from one easy-to-use dashboard.</p>
                                    </div>
                                </div>
                            </Col>

                            {/* Card 3: Build Your Team */}
                            <Col xl={4} lg={4} md={6} sm={12} xs={12}>
                                <div className="twm-w-process-steps3">
                                    <div className="twm-media">
                                        <div>
                                            <img 
                                                src="https://i.pinimg.com/736x/c3/10/17/c31017b46cfd17082e7ab29ba1df4f55.jpg" 
                                                alt="Build Your Team"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="twm-title">3. Build Your Team</h4>
                                        <p>Successfully onboard new hires and build your dream team. Access analytics and insights to improve your hiring process continuously. Implement smarter recruitment strategies.</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            {/* HOW IT WORK FOR EMPLOYERS SECTION END */}
        </>
    );
}

export default Home16Page;

const navbarStyle = document.createElement('style');
navbarStyle.textContent = `
    .navbar-transparent,
    .navbar-transparent * {
        background: transparent !important;
        background-color: transparent !important;
    }
    .navbar-scrolled {
        background: #fff !important;
        background-color: #fff !important;
    }
`;
document.head.appendChild(navbarStyle);

const handleNavbarScroll = () => {
    const navbars = document.querySelectorAll('header, .site-header, .navbar, .twm-header-style-1, .header-fixed, .main-header');
    
    navbars.forEach(navbar => {
        if (window.scrollY > 50) {
            navbar.classList.remove('navbar-transparent');
            navbar.classList.add('navbar-scrolled');
            navbar.style.cssText = 'background: #fff !important; background-color: #fff !important; box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1000 !important; transition: all 0.3s ease !important;';
        } else {
            navbar.classList.remove('navbar-scrolled');
            navbar.classList.add('navbar-transparent');
            navbar.style.cssText = 'background: transparent !important; background-color: transparent !important; box-shadow: none !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 1000 !important; transition: all 0.3s ease !important;';
        }
    });
};

window.addEventListener('scroll', handleNavbarScroll);
setTimeout(handleNavbarScroll, 100);