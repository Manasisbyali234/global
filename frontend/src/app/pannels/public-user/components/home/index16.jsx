import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import CountUp from "react-countup";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadScript, updateSkinStyle } from "../../../../../globals/constants";
import api from "../../../../../utils/api";
import HeroBody from "../../../../../components/HeroBody";
import { Container, Row, Col } from "react-bootstrap";
import HomeJobCard from "../../../../../components/HomeJobCard";
import useDebounce from "../../../../../utils/useDebounce";
import { SkeletonContainer, JobCardSkeleton, StatsSkeleton, RecruiterSkeleton } from "../../../../../components/SkeletonLoader";
import "../../../../../new-job-card.css";
import "../../../../../home-responsive.css";
import "../../../../../category-cards-mobile.css";
import "../../../../../mobile-responsive-fixes.css";
import "../../../../../employer-how-it-works.css";
import "../../../../../ux-improvements.css";
import "../../../../../container-fixes.css";
import "../../../../../how-it-works-improvements.css";
import "../../../../../mobile-section-spacing.css";
import "./naukri-preview.css";
import "../../../../../home-alignment.css";

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';

// Add error boundary to catch rendering errors
const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        const handleError = (error) => {
            if (error.message && error.message.includes('Objects are not valid as a React child')) {
                setHasError(true);
                console.error('Notification rendering error caught:', error);
            }
        };
        
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);
    
    if (hasError) {
        return <div>Loading...</div>;
    }
    
    return children;
};
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

    // Safe notification wrapper functions
    const safeShowError = (message) => {
        try {
            showError(message);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };
    
    const safeShowSuccess = (message) => {
        try {
            showSuccess(message);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };
    
    const safeShowWarning = (message) => {
        try {
            showWarning(message);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };
    
    const safeShowInfo = (message) => {
        try {
            showInfo(message);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };

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
                navbar.style.cssText = 'background: transparent !important; background-color: transparent !important; box-shadow: none !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 10000 !important; transition: all 0.3s ease !important;';
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
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/candidate/applications`, {
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
                showError('Unable to search jobs. Please refresh the page.');
                return;
            }

            let filtered = [...allJobs];

            // Filter by search term (job title, company name, or description)
            if (filters.search) {
                // Sanitize search term
                const searchTerm = String(filters.search).trim().toLowerCase();

                if (searchTerm.length < 2) {
                    safeShowWarning('Search term must be at least 2 characters');
                    return;
                }

                if (searchTerm.length > 100) {
                    safeShowWarning('Search term is too long (max 100 characters)');
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
                    safeShowWarning('Job type filter is invalid');
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
                    safeShowWarning('Location must be at least 2 characters');
                    return;
                }

                if (location.length > 100) {
                    safeShowWarning('Location filter is too long (max 100 characters)');
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

            // Filter by education
            if (filters.education) {
                const education = String(filters.education).trim().toLowerCase();

                if (education.length > 50) {
                    safeShowWarning('Education filter is invalid');
                    return;
                }

                filtered = filtered.filter(job => {
                    try {
                        // Check if job has education requirements that match
                        const jobEducation = job.education || job.educationRequirement || job.qualifications || '';
                        return jobEducation.toLowerCase().includes(education) ||
                               job.requirements?.toLowerCase().includes(education) ||
                               job.description?.toLowerCase().includes(education);
                    } catch (err) {
                        return false;
                    }
                });
            }

            // Filter by category
            if (filters.category) {
                const category = String(filters.category).trim().toLowerCase();

                if (category.length > 100) {
                    safeShowWarning('Category filter is too long');
                    return;
                }

                filtered = filtered.filter(job => {
                    try {
                        return job.category?.toLowerCase().includes(category);
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
                safeShowSuccess(`Found ${filtered.length} job(s) matching your criteria`);

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
            safeShowError('An error occurred while searching. Please try again.');
        }
    }, [allJobs]);
    
    const handleShowMore = useCallback(() => {
        try {
            // Validate current state
            if (!Array.isArray(allJobs) || !Array.isArray(filteredJobs)) {
                setError('Unable to load more jobs. Please refresh the page.');
                safeShowError('Unable to load more jobs. Please refresh the page.');
                return;
            }

            const newCount = showingCount + 6;

            // Validate newCount
            if (newCount < 0 || newCount > 1000) {
                safeShowInfo('No more jobs to load');
                return;
            }

            const sourceJobs = isFiltered ? filteredJobs : allJobs;
            const newJobs = sourceJobs.slice(0, newCount);

            setJobs(newJobs);
            setShowingCount(newCount);

            // Show feedback to user
            const loadedCount = Math.min(6, sourceJobs.length - showingCount);
            safeShowInfo(`Loaded ${loadedCount} more job(s)`);
        } catch (error) {
            setError('An error occurred while loading more jobs.');
            safeShowError('An error occurred while loading more jobs.');
        }
    }, [showingCount, isFiltered, filteredJobs, allJobs]);

    return (
        <ErrorBoundary>
        <div className="home-page-alignment">
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
            <HeroBody className="mt-0 mt-md-4" onSearch={handleSearch} />

            {/* JOBS CATEGORIES SECTION START */}
            <div className="section-full p-t20 p-b20 twm-job-categories-hpage-6-area animate-on-scroll" style={{background: 'transparent !important', backgroundColor: 'transparent !important', paddingTop: 'clamp(5px, 1vw, 10px)', paddingBottom: 'clamp(5px, 1vw, 10px)'}}>
                <Container style={{background: 'transparent !important', backgroundColor: 'transparent !important'}}>
                <div className="section-head center wt-small-separator-outer mb-3" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs by Categories</div>
                    </div>
                    <h2 className="wt-title">Choose a Relevant Category</h2>
                </div>
                <div style={{background: 'transparent', backgroundColor: 'transparent'}}>
                    <div className="category-cards-container">
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
                    <div className="category-cards-container category-cards-second-row">
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
                </Container>
            </div>
            {/* JOBS CATEGORIES SECTION END */}

            {/* JOB POST START */}
            <div className="section-full p-t20 p-b20 twm-bg-ring-wrap2 animate-on-scroll" style={{background: 'transparent !important', backgroundColor: 'transparent !important', paddingTop: 'clamp(5px, 1vw, 10px)', paddingBottom: 'clamp(5px, 1vw, 10px)'}}>
                <div className="twm-bg-ring-right" />
                <div className="twm-bg-ring-left" />
                <div style={{background: 'transparent !important', backgroundColor: 'transparent !important'}}>
                    <Container style={{background: 'transparent !important', backgroundColor: 'transparent !important'}}>
                    <div className="wt-separator-two-part" style={{background: 'transparent'}}>
                        <Row className="wt-separator-two-part-row" style={{alignItems: 'center'}}>
                            <Col xs={12} className="mb-4">
                                <div className="section-header-with-btn">
                                    <div className="section-head center wt-small-separator-outer" style={{margin: 0}}>
                                        <div className="wt-small-separator site-text-primary">
                                            <div>Top Jobs</div>
                                        </div>
                                        <h2 className="wt-title">Discover your next career move</h2>
                                    </div>
                                    <div className="header-btn-container">
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
                                        <NavLink to="/job-grid" className="site-button" style={{padding: '0.5rem 1rem', fontSize: '14px', display: 'inline-flex', width: 'auto', whiteSpace: 'nowrap'}}>
                                            Browse All Jobs
                                        </NavLink>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="section-content">
                        <div className="twm-jobs-grid-wrap" data-section="top-jobs">
                            <div style={{background: 'transparent', width: '100%', margin: '0'}}>
                                <Row style={{'--bs-gutter-x': '20px', marginLeft: '0', marginRight: '0'}}>
                                {jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <Col lg={4} md={6} sm={12} xs={12} key={job._id} className="mb-2" style={{padding: '0.3rem'}}>
                                            <div className="new-job-card">
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
                                                                    safeShowError('Invalid job ID. Cannot navigate to job details.');
                                                                }
                                                            } else {
                                                                safeShowError('Job ID is missing. Cannot navigate to job details.');
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
                    </Container>
                </div>
            </div>
            {/* JOB POST END */}

            {/* SECTION 1: Top Recruiters Hiring Now */}
            <div className="section-full redesign-section bg-peach animate-on-scroll">
                <Container>
                    <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
                        <div className="text-left">
                            <span className="badge-orange">Hiring now</span>
                            <h2 className="section-title-large">
                                Top Recruiters <span className="text-orange">Hiring Now</span>
                            </h2>
                            <p className="section-subtitle mb-0">Discover your next career move with these industry leaders</p>
                        </div>
                        <NavLink to="/emp-grid" className="view-all-companies-btn">
                            View all companies
                        </NavLink>
                    </div>

                    <Row className="g-4 justify-content-center">
                        {loading ? (
                            <Col xs={12}><RecruiterSkeleton count={6} /></Col>
                        ) : recruiters.length > 0 ? (
                            recruiters.slice(0, 6).map((recruiter) => (
                                <Col xl={2} lg={3} md={4} sm={6} xs={12} key={recruiter._id}>
                                    <NavLink to={`/emp-detail/${recruiter._id}`} className="text-decoration-none">
                                        <div className="recruiter-card">
                                            <div className="recruiter-logo-circle">
                                                {recruiter.logo ? (
                                                    <img src={recruiter.logo} alt={recruiter.companyName} />
                                                ) : (
                                                    <div style={{fontSize: '24px', fontWeight: 'bold', color: '#FF6A3D'}}>
                                                        {(recruiter.companyName || 'C').charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="recruiter-name text-truncate w-100">{recruiter.companyName}</h4>
                                            <p className="recruiter-location mb-1">{recruiter.location || 'Location not specified'}</p>
                                            <p className="job-posts-count mb-0">{recruiter.jobCount || 0} job posts</p>
                                        </div>
                                    </NavLink>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12} className="text-center py-5">
                                <p className="text-muted">No recruiters available at the moment.</p>
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>

            {/* SECTION 2: How It Works for Candidates */}
            <div className="section-full redesign-section animate-on-scroll" style={{
                background: '#FFF7F3',
                backgroundImage: "linear-gradient(rgba(255, 247, 243, 0.85), rgba(255, 247, 243, 0.85)), url('/assets/images/photo_2025-10-09_11-01-43.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}>
                <Container>
                    <div className="section-head center wt-small-separator-outer mb-5 text-center">
                        <span className="badge-orange" style={{background: '#FFEBE3', color: '#FF6A3D'}}>Process</span>
                        <h2 className="section-title-large">How It Works for Candidates</h2>
                        <p className="section-subtitle">Follow these simple steps to land your dream job</p>
                    </div>

                    <Row className="g-4">
                        <Col lg={3} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(255, 106, 61, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <h4>Register Account</h4>
                                <p>Create your profile and upload your resume to get started with your job search.</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(59, 130, 246, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <h4>Search & Apply</h4>
                                <p>Browse through thousands of jobs and apply to the ones that match your skills.</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(139, 92, 246, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h4>Take Assessment</h4>
                                <p>Complete skill assessments to stand out from other candidates and show your expertise.</p>
                            </div>
                        </Col>
                        <Col lg={3} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                </div>
                                <h4>Get Hired</h4>
                                <p>Attend interviews and get hired by top companies in your preferred industry.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* HOW IT WORK FOR EMPLOYERS SECTION START */}
            <div className="section-full redesign-section animate-on-scroll" style={{background: '#F9FAFB'}}>
                <Container>
                    <div className="section-head center wt-small-separator-outer mb-5 text-center">
                        <span className="badge-orange">For Employers</span>
                        <h2 className="section-title-large">How It Works for Employers</h2>
                        <p className="section-subtitle">Streamline your hiring process with these simple steps</p>
                    </div>

                    <Row className="g-4">
                        <Col lg={4} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(255, 106, 61, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </div>
                                <h4>Post Your Job</h4>
                                <p>Create account and post job openings with details and requirements.</p>
                            </div>
                        </Col>
                        <Col lg={4} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(59, 130, 246, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h4>Hire the Best</h4>
                                <p>Review profiles, shortlist candidates and schedule interviews.</p>
                            </div>
                        </Col>
                        <Col lg={4} md={6}>
                            <div className="process-card-light">
                                <div className="process-icon-circle" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </div>
                                <h4>Build Your Team</h4>
                                <p>Onboard new hires and build your dream team successfully.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* HOW IT WORK FOR EMPLOYERS SECTION END */}

            {/* SECTION 3 & 4: Recruit Smarter & Workflow Illustrations */}
            <div className="section-full redesign-section workflow-section animate-on-scroll">
                <Container>
                    <div className="row align-items-center mb-5">
                        <Col lg={8}>
                            <div className="text-left">
                                <span className="badge-orange">For Employers</span>
                                <h2 className="section-title-large mb-4">
                                    Recruit smarter with our <span className="text-orange">streamlined workflow</span>
                                </h2>
                                <p className="section-subtitle mb-4" style={{maxWidth: '600px'}}>
                                    Our platform provides a seamless experience for employers to find, assess, and hire the best talent in the industry.
                                </p>
                            </div>
                        </Col>
                        <Col lg={4} className="text-end">
                            <NavLink to="/login?tab=employer" className="btn-dark-pill">
                                Start recruiting now
                            </NavLink>
                        </Col>
                    </div>

                    <Row className="g-5 justify-content-center">
                        <Col lg={4} md={6}>
                            <div className="workflow-illustration-card text-center">
                                <div className="illustration-circle mx-auto mb-4" style={{background: '#FFF7F3'}}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h5 className="text-center mb-3">Find the right talent</h5>
                                <p className="text-center">Discover exceptional talent through our comprehensive candidate database.
Leverage advanced filtering capabilities to identify qualified professionals.</p>
                            </div>
                        </Col>
                        <Col lg={4} md={6}>
                            <div className="workflow-illustration-card text-center">
                                <div className="illustration-circle mx-auto mb-4" style={{background: '#EBF5FF'}}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h5 className="text-center mb-3">Effortless screening</h5>
                                <p className="text-center">Streamline your hiring process with our automated screening tools and candidate management system.</p>
                            </div>
                        </Col>
                        <Col lg={4} md={6}>
                            <div className="workflow-illustration-card text-center">
                                <div className="illustration-circle mx-auto mb-4" style={{background: '#F0FDF4'}}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </div>
                                <h5 className="text-center mb-3">Hire with confidence</h5>
                                <p className="text-center">Make informed decisions with detailed candidate profiles, assessment results, and interview feedback.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* SECTION 5: Final Call-to-Action (CTA) */}
            <div className="section-full redesign-section animate-on-scroll" style={{background: '#F9FAFB'}}>
                <Container>
                    <div className="cta-container-box text-center">
                        <span className="badge-orange mb-3">Get Started</span>
                        <h2 className="cta-heading text-center mb-4">Ready to find your next great hire?</h2>
                        <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
                            <NavLink to="/login?tab=employer" className="btn-orange-pill">
                                Post a Job for Free
                            </NavLink>
                            <NavLink to="/contact-us" className="btn-outline-pill">
                                Learn More
                            </NavLink>
                        </div>
                        
                    </div>
                </Container>
            </div>

            {/* SECTION 6: Footer Section */}
        </div>
        </ErrorBoundary>
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
    
    /* Redesign Styles */
    .redesign-section {
        padding: 40px 0 !important;
        position: relative !important;
        overflow: hidden !important;
    }
    .bg-peach {
        background-color: #FFF7F3 !important;
    }
    .text-orange {
        color: #FF6A3D !important;
    }
    .badge-orange {
        background: #FFEBE3 !important;
        color: #FF6A3D !important;
        padding: 4px 12px !important;
        border-radius: 999px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        display: inline-block !important;
        margin-bottom: 12px !important;
    }
    .section-title-large {
        font-size: clamp(24px, 4vw, 36px) !important;
        font-weight: 700 !important;
        color: #000 !important;
        line-height: 1.2 !important;
    }
    .section-subtitle {
        font-size: 14px !important;
        color: #6B7280 !important;
    }
    .view-all-companies-btn {
        border: 1px solid #FF6A3D !important;
        color: #FF6A3D !important;
        background: #fff !important;
        padding: 10px 28px !important;
        border-radius: 999px !important;
        font-weight: 600 !important;
        transition: all 0.3s ease !important;
        text-decoration: none !important;
        display: inline-block !important;
        white-space: nowrap !important;
        max-width: none !important;
        width: auto !important;
    }
    .view-all-companies-btn:hover {
        background: #FF6A3D !important;
        color: #fff !important;
    }
    .recruiter-card {
        background: #fff !important;
        border-radius: 12px !important;
        padding: 24px !important;
        text-align: center !important;
        transition: all 0.3s ease !important;
        border: 1px solid #E5E7EB !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
    }
    .recruiter-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    }
    .recruiter-logo-circle {
        width: 64px !important;
        height: 64px !important;
        border-radius: 50% !important;
        background: #F3F4F6 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-bottom: 16px !important;
        overflow: hidden !important;
    }
    .recruiter-logo-circle img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
    }
    .recruiter-name {
        font-weight: 700 !important;
        font-size: 16px !important;
        color: #111827 !important;
        margin-bottom: 4px !important;
    }
    .hiring-text {
        font-size: 12px !important;
        color: #6B7280 !important;
    }
    .recruiter-location {
        font-size: 12px !important;
        color: #6B7280 !important;
        margin-bottom: 4px !important;
    }
    .job-posts-count {
        font-size: 12px !important;
        color: #FF6A3D !important;
        font-weight: 600 !important;
    }
    /* How It Works Dark */
    .bg-dark-navy {
        background: linear-gradient(180deg, #0B1220 0%, #0E1A2B 100%) !important;
        color: #fff !important;
    }
    .process-card-dark {
        background: #111827 !important;
        border-radius: 16px !important;
        padding: 32px 24px !important;
        height: 100% !important;
        border: 1px solid rgba(255,255,255,0.05) !important;
        transition: all 0.3s ease !important;
        text-align: center !important;
    }
    .process-icon-circle {
        width: 56px !important;
        height: 56px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto 20px !important;
    }
    .process-card-dark h4 {
        color: #fff !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        margin-bottom: 12px !important;
    }
    .process-card-dark p {
        color: #9CA3AF !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        margin-bottom: 0 !important;
    }
    /* How It Works Light */
    .process-card-light {
        background: #fff !important;
        border-radius: 16px !important;
        padding: 32px 24px !important;
        height: 100% !important;
        border: 1px solid #E5E7EB !important;
        transition: all 0.3s ease !important;
        text-align: center !important;
    }
    .process-card-light:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
        border-color: #FF6A3D !important;
    }
    .process-card-light h4 {
        color: #111827 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        margin-bottom: 12px !important;
    }
    .process-card-light p {
        color: #6B7280 !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        margin-bottom: 0 !important;
    }
    /* Workflow Section */
    .workflow-section {
        background: #fff !important;
    }
    .btn-dark-pill {
        background: #0B1220 !important;
        color: #fff !important;
        padding: 12px 32px !important;
        border-radius: 999px !important;
        font-weight: 600 !important;
        border: none !important;
        transition: all 0.3s ease !important;
        display: inline-block !important;
        text-decoration: none !important;
    }
    .btn-dark-pill:hover {
        background: #1a253a !important;
        color: #fff !important;
    }
    .workflow-illustration-card {
        text-align: center !important;
        padding: 20px !important;
    }
    .illustration-circle {
        width: 120px !important;
        height: 120px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 auto 24px !important;
        transition: all 0.3s ease !important;
    }
    .workflow-illustration-card h5 {
        font-weight: 600 !important;
        color: #111827 !important;
        margin-bottom: 12px !important;
    }
    .workflow-illustration-card p {
        color: #6B7280 !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
    }
    
    /* Section 5: CTA */
    .cta-container-box {
        border: 2px solid #FF6A3D !important;
        border-radius: 32px !important;
        background: #FFEBE3 !important;
        padding: 48px 32px !important;
        text-align: center !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
    }
    .cta-heading {
        color: #0B1220 !important;
        font-weight: 700 !important;
        font-size: clamp(24px, 4vw, 32px) !important;
        margin-bottom: 24px !important;
    }
    .btn-orange-pill {
        background: #FF6A3D !important;
        color: #fff !important;
        padding: 12px 24px !important;
        border-radius: 999px !important;
        font-weight: 600 !important;
        border: none !important;
        transition: all 0.3s ease !important;
        display: inline-block !important;
        text-decoration: none !important;
    }
    .btn-orange-pill:hover {
        background: #e55a2f !important;
        color: #fff !important;
    }
    .btn-outline-pill {
        background: #fff !important;
        color: #0B1220 !important;
        padding: 12px 24px !important;
        border-radius: 999px !important;
        font-weight: 600 !important;
        border: 1px solid #E5E7EB !important;
        transition: all 0.3s ease !important;
        display: inline-block !important;
        text-decoration: none !important;
    }
    .btn-outline-pill:hover {
        background: #F9FAFB !important;
        color: #0B1220 !important;
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