import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { Col, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";
import SectionPagination from "../common/section-pagination";
import { requestCache } from "../../../../../utils/requestCache";
import { performanceMonitor } from "../../../../../utils/performanceMonitor";
import { formatCompanyName, getJobDisplayLogo } from "../../../../../utils/jobBranding";
import { formatJobTitle } from "../../../../../utils/jobTitleFormatter";
import { isJobApplicationClosed } from "../../../../../utils/jobApplicationAvailability";
import { API_BASE_URL } from "../../../../../utils/api";
import "../../../../../new-job-card.css";

const SectionJobsGrid = memo(({ filters, onTotalChange }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());

    const fetchAppliedJobs = useCallback(async () => {
        const token = localStorage.getItem('candidateToken');
        if (!token) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/candidate/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.applications) {
                const appliedJobIds = new Set(data.applications.map(app => app.jobId?._id || app.jobId));
                setAppliedJobs(appliedJobIds);
            }
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        }
    }, []);

    const fetchJobs = useCallback(async () => {
        if (!filters) return;
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            abortControllerRef.current = new AbortController();
            
            const apiStartTime = performance.now();
            
            try {
                const params = new URLSearchParams();
                
                const paramMap = {
                    search: filters.search,
                    keyword: filters.keyword,
                    location: filters.location,
                    employmentType: filters.employmentType,
                    jobTitle: filters.jobTitle,
                    category: filters.category,
                    sortBy: filters.sortBy,
                    limit: filters.itemsPerPage?.toString() || '10',
                    page: currentPage.toString()
                };
                
                if (filters.search) {
                    params.append('searchType', 'title');
                }
                
                Object.entries(paramMap).forEach(([key, value]) => {
                    if (value && value !== '') params.append(key, value);
                });
                
                if (filters.jobType && filters.jobType.length > 0) {
                    if (Array.isArray(filters.jobType)) {
                        filters.jobType.forEach(type => params.append('jobType', type));
                    } else {
                        params.append('jobType', filters.jobType);
                    }
                }
                
                if (filters.skills?.length > 0) {
                    filters.skills.forEach(skill => params.append('skills', skill));
                }

                if (filters.education?.length > 0) {
                    filters.education.forEach(edu => params.append('education', edu));
                }

                const url = `${API_BASE_URL}/public/jobs?${params.toString()}`;
                console.log('Fetching jobs with URL:', url);
                
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: abortControllerRef.current.signal
                });
                
                const data = await response.json();
                console.log('Jobs API response:', data);
                
                performanceMonitor.monitorAPICall(url, apiStartTime);
                
                if (data.success) {
                    const jobList = data.jobs || [];
                    setJobs(jobList);
                    setTotalPages(data.totalPages || 1);
                    console.log('Jobs on current page:', jobList.length);
                    onTotalChange?.(jobList.length);
                } else {
                    setJobs([]);
                    setTotalPages(1);
                    onTotalChange?.(0);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching jobs:', error);
                    setJobs([]);
                    onTotalChange?.(0);
                }
            } finally {
                setLoading(false);
                setIsFirstLoad(false);
            }
        }, 300);
    }, [filters, onTotalChange, currentPage]);

    useEffect(() => {
        fetchAppliedJobs();
        fetchJobs();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchJobs, fetchAppliedJobs]);



    const JobCard = memo(({ job, index }) => {
        const cardRef = useRef(null);

        const isClosed = useMemo(() => isJobApplicationClosed(job), [job]);
        
        useEffect(() => {
            const observer = performanceMonitor.setupIntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.setAttribute('data-visible', 'true');
                        } else {
                            entry.target.setAttribute('data-visible', 'false');
                        }
                    });
                },
                { rootMargin: '100px' }
            );
            
            if (cardRef.current) {
                observer.observe(cardRef.current);
            }
            
            return () => {
                if (cardRef.current) {
                    observer.unobserve(cardRef.current);
                }
            };
        }, []);

        const handleApplyClick = useCallback((e) => {
            e.preventDefault();
            navigate(`/job-detail/${job._id}`);
        }, [job._id, navigate]);

        const jobTypeClass = useMemo(() => {
            const typeMap = {
                'Full-time': 'green',
                'Part-time': 'brown', 
                'Contract': 'purple',
                'Internship': 'sky'
            };
            return typeMap[job.jobType] || 'golden';
        }, [job.jobType]);

        const formatJobType = (jobType) => {
            if (!jobType) return 'Full Time';
            return jobType
                .trim()
                .split(/[\s\-_]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        };

        const ctcDisplay = useMemo(() => {
            if (job.ctc?.min && job.ctc?.max) {
                const minLPA = (job.ctc.min / 100000).toFixed(1);
                const maxLPA = (job.ctc.max / 100000).toFixed(1);
                return job.ctc.min === job.ctc.max ? `₹${minLPA}LPA` : `₹${minLPA} - ${maxLPA} LPA`;
            }
            return 'Not specified';
        }, [job.ctc]);

        const logoSrc = getJobDisplayLogo(job);
        const companyName = formatCompanyName(job.companyName || job.employerId?.companyName, "Company");

        const handleCardClick = useCallback((e) => {
            if (e.target.closest('button')) return;
            navigate(`/job-detail/${job._id}`);
        }, [job._id]);

        return (
            <Col key={job._id} lg={6} md={12} className="mb-2">
                <div ref={cardRef} className="new-job-card" data-visible="true" onClick={handleCardClick} style={{cursor: 'pointer'}}>
                    <div className="job-card-header">
                        <div className="job-card-left">
                            <div className="company-logo">
                                {logoSrc ? (
                                    <img src={logoSrc} alt="Company Logo" />
                                ) : (
                                    <div className="logo-placeholder">
                                        {companyName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="job-info">
                                <h4 className="job-title">{formatJobTitle(job.title)}</h4>
                                <div className="job-location">
                                    <i className="feather-map-pin" />
                                    {(() => {
                                        if (Array.isArray(job.location)) {
                                            const locations = job.location.filter(loc => loc && loc.trim());
                                            if (locations.length <= 1) {
                                                return <span className="location-text">{locations.join(', ') || 'Location not specified'}</span>;
                                            } else {
                                                return (
                                                    <>
                                                        <span className="location-text">{locations[0]}</span>
                                                        <span 
                                                            className="location-more" 
                                                            title={locations.slice(1).join(', ')}
                                                        >
                                                            +{locations.length - 1} more
                                                        </span>
                                                    </>
                                                );
                                            }
                                        }
                                        return <span className="location-text">{job.location || 'Location not specified'}</span>;
                                    })()
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="job-type-badge">
                            <span className={`job-type-pill ${
                                job.jobType?.toLowerCase() === "full-time" ? "full-time" :
                                job.jobType?.toLowerCase() === "part-time" ? "part-time" :
                                job.jobType?.toLowerCase() === "contract" ? "contract" :
                                job.jobType?.toLowerCase().includes("internship") ? "internship" :
                                job.jobType?.toLowerCase() === "work-from-home" ? "wfh" : "full-time"
                            }`}>
                                {formatJobType(job.jobType)}
                            </span>
                        </div>
                    </div>

                    <div className="job-card-middle">
                        <div className="ctc-info">
                            {job.ctc && typeof job.ctc === "object" && job.ctc.min > 0 && job.ctc.max > 0 ? (
                                <span className="ctc-text">
                                    Annual CTC: {job.ctc.min === job.ctc.max
                                        ? `₹${(job.ctc.min / 100000).toFixed(1)}LPA`
                                        : `₹${(job.ctc.min / 100000).toFixed(1)} - ${(job.ctc.max / 100000).toFixed(1)} LPA`}
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

                    <div className="job-card-footer">
                        <div className="company-info">
                            <div className="posted-by-label">Posted by:</div>
                            <div className="company-name">
                                {job.postedBy === "Consultant"
                                    ? "Consultant"
                                    : companyName}
                            </div>
                        </div>
                        {appliedJobs.has(job._id) ? (
                            <button
                                className="apply-now-btn"
                                disabled
                                style={{backgroundColor: '#6c757d', cursor: 'not-allowed'}}
                            >
                                Already Applied
                            </button>
                        ) : isClosed ? (
                            <button
                                className="apply-now-btn"
                                disabled
                                style={{backgroundColor: '#6c757d', cursor: 'not-allowed'}}
                                title="Applications are closed for this job"
                            >
                                Application Closed
                            </button>
                        ) : (
                            <button
                                className="apply-now-btn"
                                onClick={handleApplyClick}
                            >
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>
            </Col>
        );
    });

    const skeletonCards = useMemo(() =>
        [...Array(4)].map((_, idx) => (
            <Col key={`skeleton-${idx}`} lg={6} md={12} className="mb-2">
                <div className="new-job-card job-card-skeleton" style={{borderRadius: '12px', overflow: 'hidden'}}>
                    <div className="job-card-header">
                        <div className="job-card-left">
                            <div className="company-logo skeleton-logo" />
                            <div className="job-info">
                                <div className="skeleton-line short" style={{height: '18px', marginBottom: '4px'}} />
                                <div className="skeleton-line" style={{height: '14px', width: '60%'}} />
                            </div>
                        </div>
                        <div className="job-type-badge">
                            <div className="skeleton-line" style={{height: '24px', width: '80px', borderRadius: '20px'}} />
                        </div>
                    </div>
                    <div className="job-card-middle">
                        <div className="skeleton-line" style={{height: '16px', marginBottom: '8px'}} />
                        <div className="skeleton-line" style={{height: '14px', width: '40%'}} />
                    </div>
                    <div className="job-card-footer">
                        <div className="company-info">
                            <div className="skeleton-line" style={{height: '12px', width: '60px', marginBottom: '4px'}} />
                            <div className="skeleton-line" style={{height: '14px', marginBottom: '4px'}} />
                            <div className="skeleton-line" style={{height: '12px', width: '70%'}} />
                        </div>
                        <div className="skeleton-line" style={{height: '36px', width: '100px', borderRadius: '8px'}} />
                    </div>
                </div>
            </Col>
        )), []
    );

    return (
        <>
            <Row style={{'--bs-gutter-x': '6px'}}>
                {loading && isFirstLoad && skeletonCards}

                {!loading && jobs.length > 0 ? 
                    jobs.filter(job => {
                        // Filter out jobs where offer letter date has passed
                        if (job.offerLetterDate) {
                            const offerLetterEnd = new Date(job.offerLetterDate).getTime();
                            if (offerLetterEnd < Date.now()) {
                                return false;
                            }
                        }
                        return true;
                    }).map((job, index) => (
                        <JobCard key={job._id} job={job} index={index} />
                    )) : !loading && (
                        <Col xs={12} className="text-center py-5">
                            <div style={{padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                                <i className="feather-search" style={{fontSize: '48px', color: '#ccc', marginBottom: '20px'}}></i>
                                <h5 style={{color: '#666', marginBottom: '10px'}}>Building Our Global Employer Network</h5>
                                <p style={{color: '#777', marginBottom: '10px'}}>
                                    <strong>TALEGLOBAL</strong> is currently onboarding <strong>employers</strong> from across industries. As companies complete their
                                    registration, their profiles will be displayed here.
                                </p>
                                <p style={{color: '#777', marginBottom: '10px'}}>
                                    Until then, we invite both <strong>employers</strong> and <strong>job seekers</strong> to register and become active on the platform.
                                    Employers can create their <strong>company profiles</strong> and start posting <strong>job opportunities</strong>, while <strong>candidates</strong> can
                                    complete their profiles, explore available opportunities, and stay prepared for upcoming openings.
                                </p>
                                <p style={{color: '#777', margin: 0}}>
                                    Our <strong>employer and company listings</strong> will continue to grow as more organizations join <strong>TALEGLOBAL</strong>,
                                    bringing more <strong>job postings</strong> and <strong>career opportunities</strong> from around the world.
                                </p>
                            </div>
                        </Col>
                    )
                }
            </Row>
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <SectionPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>
            )}
        </>
    );
});

export default SectionJobsGrid;
