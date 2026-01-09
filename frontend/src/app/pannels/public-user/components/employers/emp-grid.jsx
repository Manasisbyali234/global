import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import SectionEmployerSidebar from "../../sections/employers/section-employer-sidebar";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionPagination from "../../sections/common/section-pagination";
import { loadScript } from "../../../../../globals/constants";
import { requestCache } from "../../../../../utils/requestCache";
import { performanceMonitor } from "../../../../../utils/performanceMonitor";
import "../../../../../job-grid-optimizations.css";
import "../../../../../emp-grid-optimizations.css";
import "../../../../../emp-grid-mobile-fix.css";
import "../../../../../new-job-card.css";

const EmployersGridPage = memo(() => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEmployers, setTotalEmployers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [establishedYears, setEstablishedYears] = useState([]);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        industry: '',
        teamSize: '',
        companyType: '',
        establishedSince: ''
    });
    const navigate = useNavigate();
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);

    const _filterConfig = useMemo(() => {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalEmployers);
        return {
            prefix: "Showing",
            type: "employers",
            showRange: true,
            rangeStart: startItem,
            rangeEnd: endItem,
            total: totalEmployers
        };
    }, [totalEmployers, currentPage, itemsPerPage]);

    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        loadScript("js/custom.js");
    }, []);

    const fetchEmployers = useCallback(async () => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear previous debounce
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Debounce API calls
        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            abortControllerRef.current = new AbortController();
            
            const apiStartTime = performance.now();
            
            try {
                const params = new URLSearchParams({
                    sortBy,
                    limit: itemsPerPage.toString(),
                    page: currentPage.toString()
                });
                
                if (filters.keyword) params.append('keyword', filters.keyword);
                if (filters.location) params.append('location', filters.location);
                if (Array.isArray(filters.industry) && filters.industry.length > 0) {
                    filters.industry.forEach(ind => params.append('industry', ind));
                }
                if (Array.isArray(filters.teamSize) && filters.teamSize.length > 0) {
                    filters.teamSize.forEach(size => params.append('teamSize', size));
                }
                if (Array.isArray(filters.companyType) && filters.companyType.length > 0) {
                    filters.companyType.forEach(type => params.append('companyType', type));
                }
                if (filters.establishedSince) params.append('establishedSince', filters.establishedSince);

                const url = `http://localhost:5000/api/public/employers?${params.toString()}`;
                const data = await requestCache.get(url, {
                    ttl: 180000, // 3 minutes cache
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: abortControllerRef.current.signal
                });
                
                // Monitor API performance
                performanceMonitor.monitorAPICall(url, apiStartTime);
                
                if (data.success) {
                    setEmployers(data.employers || []);
                    setTotalEmployers(data.totalCount || data.employers?.length || 0);
                    setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));
                    
                    // Extract unique established years
                    const years = [...new Set(
                        (data.employers || [])
                            .map(emp => emp.establishedSince || emp.profile?.establishedSince || emp.profile?.foundedYear)
                            .filter(year => year && year !== 'Not specified')
                            .sort((a, b) => b - a)
                    )];
                    setEstablishedYears(years);
                } else {
                    setEmployers([]);
                    setTotalEmployers(0);
                    setTotalPages(1);
                    setEstablishedYears([]);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    
                    setEmployers([]);
                    setTotalEmployers(0);
                    setTotalPages(1);
                }
            } finally {
                setLoading(false);
                setIsFirstLoad(false);
            }
        }, 200); // 200ms debounce for employers
    }, [sortBy, itemsPerPage, currentPage, filters]);

    useEffect(() => {
        fetchEmployers();
        
        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchEmployers]);

    const EmployerCard = memo(({ employer }) => {
        const handleViewClick = useCallback(() => {
            navigate(`/emp-detail/${employer._id}`);
        }, [employer._id, navigate]);

        return (
            <Col lg={6} md={6} sm={12} xs={12} className="mb-2">
                <div className="new-job-card" style={{borderRadius: '12px', overflow: 'hidden'}}>
                    <div className="job-card-header">
                        <div className="job-card-left">
                            <div className="company-logo">
                                {employer.profile?.logo ? (
                                    <img src={employer.profile.logo} alt="Company Logo" />
                                ) : (
                                    <div className="logo-placeholder">
                                        {(employer.companyName || "C").charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="job-info">
                                <h4 className="job-title">{employer.companyName}</h4>
                                <div className="job-location">
                                    <i className="feather-map-pin" />
                                    {employer.profile?.location || employer.profile?.corporateAddress || 'Multiple Locations'}
                                </div>
                            </div>
                        </div>
                        <div className="job-type-badge">
                            <span className="job-type-pill full-time">
                                {employer.profile?.industry || employer.profile?.industrySector || 'Company'}
                            </span>
                        </div>
                    </div>
                    <div className="job-card-middle">
                        <div className="ctc-info">
                            <span className="ctc-text">Active Jobs: {employer.jobCount || 0}</span>
                        </div>
                        <div className="vacancy-info">
                            <span className="vacancy-text">
                                Team Size: {employer.profile?.teamSize || 'Growing'}
                            </span>
                        </div>
                    </div>
                    <div className="job-card-footer">
                        <div className="company-info">
                            <div className="posted-by-label">Est. Since:</div>
                            <div className="company-name">{employer.establishedSince || employer.profile?.establishedSince || employer.profile?.foundedYear || 'Not specified'}</div>
                            <div className="poster-type">{employer.profile?.companyType || 'Company'}</div>
                        </div>
                        <button className="apply-now-btn" onClick={handleViewClick}>
                            View Details
                        </button>
                    </div>
                </div>
            </Col>
        );
    });

    const skeletonCards = useMemo(() =>
        [...Array(6)].map((_, idx) => (
            <Col key={`skeleton-${idx}`} lg={6} md={6} sm={12} xs={12} className="mb-2">
                <div className="new-job-card job-card-skeleton" style={{borderRadius: '12px', overflow: 'hidden'}}>
                    <div className="job-card-header">
                        <div className="job-card-left">
                            <div className="skeleton-logo" />
                            <div className="skeleton-lines">
                                <div className="skeleton-line short" />
                                <div className="skeleton-line" />
                            </div>
                        </div>
                        <div className="skeleton-badge" />
                    </div>
                    <div className="job-card-middle">
                        <div className="skeleton-line" />
                        <div className="skeleton-line short" />
                    </div>
                    <div className="job-card-footer">
                        <div className="skeleton-line" />
                        <div className="skeleton-button" />
                    </div>
                </div>
            </Col>
        )), []
    );

    return (
        <div className="section-full py-3 site-bg-white emp-grid-page" style={{paddingLeft: '20px', paddingRight: '20px'}}>
            <Row className="mb-4">
                    <Col lg={4} md={12} className="rightSidebar">
                        <SectionEmployerSidebar onFilterChange={setFilters} />
                    </Col>

                    <Col lg={8} md={12}>
                        <div className="mb-4">
                            <SectionRecordsFilter
                                _config={_filterConfig}
                                onSortChange={handleSortChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                establishedYears={establishedYears}
                            />
                        </div>

                        <div className="twm-employer-list-wrap">
                            <Row style={{'--bs-gutter-x': '6px'}}>
                                {loading && isFirstLoad && skeletonCards}

                                {!loading && employers.length > 0 ? 
                                    employers.map((employer, index) => (
                                        <EmployerCard key={employer._id} employer={employer} index={index} />
                                    )) : !loading && (
                                        <Col xs={12} className="text-center py-5">
                                            <h5>No employers found</h5>
                                            <p>Please check back later for new companies.</p>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <SectionPagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </Col>
                </Row>
        </div>
    );
});

export default EmployersGridPage;
