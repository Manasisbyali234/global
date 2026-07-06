import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
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
import { getLogoImageUrl } from "../../../../../utils/imageUtils";

const INDUSTRY_LABELS = {
    "it": "IT",
    "non-it": "Non-IT",
    "education": "Education",
    "finance": "Finance",
    "healthcare": "Healthcare",
    "manufacturing": "Manufacturing",
    "others-specify": "Others",
};

const formatIndustryLabel = (value = "") => {
    const key = String(value || "").trim().toLowerCase();
    if (INDUSTRY_LABELS[key]) return INDUSTRY_LABELS[key];
    return String(value || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
            if (word.toUpperCase() === "IT") return "IT";
            if (/^[A-Z0-9&+-]{2,}$/.test(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

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
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const lastMobileFilterInteractionRef = useRef(null);

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

    const openMobileFilters = useCallback(() => {
        lastMobileFilterInteractionRef.current = null;
        setIsMobileFilterOpen(true);
    }, []);

    const closeMobileFilters = useCallback(() => {
        lastMobileFilterInteractionRef.current = null;
        setIsMobileFilterOpen(false);
    }, []);

    useEffect(() => {
        if (!isMobileFilterOpen) {
            return undefined;
        }

        const previousBodyOverflow = document.body.style.overflow;
        const handleEscapePress = (event) => {
            if (event.key === "Escape") {
                closeMobileFilters();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscapePress);

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            window.removeEventListener("keydown", handleEscapePress);
        };
    }, [closeMobileFilters, isMobileFilterOpen]);

    const recordMobileFilterInteraction = useCallback((event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        lastMobileFilterInteractionRef.current = {
            isTextEntry: Boolean(target.closest('input[type="text"], input[type="search"], textarea'))
        };
    }, []);

    const handleFilterChange = useCallback((nextFilters) => {
        setFilters(nextFilters);

        const lastInteraction = lastMobileFilterInteractionRef.current;
        const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 992;

        if (isMobileFilterOpen && isMobileViewport && lastInteraction && !lastInteraction.isTextEntry) {
            closeMobileFilters();
        }
    }, [closeMobileFilters, isMobileFilterOpen]);

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

        const companyInitial = (employer.companyName || "C").charAt(0);

        return (
            <Col lg={4} md={6} sm={12} className="mb-4 employer-col">
                <div className="company-card">
                    <div className="company-avatar-container">
                        <div className="company-avatar-circle">
                            {employer.profile?.logo ? (
                                <img src={getLogoImageUrl(employer.profile.logo)} alt={employer.companyName} className="company-avatar-img" />
                            ) : (
                                companyInitial
                            )}
                        </div>
                    </div>
                    
                    <h4 className="company-card-name">{employer.companyName}</h4>
                    
                    <div className="company-card-location">
                        <i className="feather-map-pin" />
                        {employer.profile?.location || employer.profile?.corporateAddress || 'Multiple Locations'}
                    </div>

                    <div className="industry-tag-pill">
                        {formatIndustryLabel(employer.profile?.industry || employer.profile?.industrySector || "Industry")}
                    </div>

                    <button className="view-details-btn-orange" onClick={handleViewClick}>
                        View Details
                    </button>
                </div>
            </Col>
        );
    });

    const skeletonCards = useMemo(() =>
        [...Array(6)].map((_, idx) => (
            <Col key={`skeleton-${idx}`} lg={4} md={6} sm={12} className="mb-4 employer-col">
                <div className="company-card skeleton">
                    <div className="skeleton-avatar" />
                    <div className="skeleton-text skeleton-name" />
                    <div className="skeleton-text skeleton-location" />
                    <div className="skeleton-tag" />
                    <div className="skeleton-btn" />
                </div>
            </Col>
        )), []
    );

    const mobileFilterDrawer = typeof document !== "undefined"
        ? createPortal(
            <div className={`d-lg-none mobile-employers-filter-sidebar-shell${isMobileFilterOpen ? " is-open" : ""}`}>
                <button
                    type="button"
                    className="mobile-employers-filter-overlay"
                    aria-label="Close filters"
                    onClick={closeMobileFilters}
                />
                <div
                    id="mobile-employer-filters-drawer"
                    className="mobile-employers-filter-sidebar"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Employer filters"
                    onPointerDownCapture={recordMobileFilterInteraction}
                    onChangeCapture={recordMobileFilterInteraction}
                    onClickCapture={recordMobileFilterInteraction}
                >
                    <div className="mobile-employers-filter-sidebar__header">
                        <div className="mobile-employers-filter-sidebar__title">
                            <FiFilter aria-hidden="true" />
                            <span>Filters</span>
                        </div>
                        <button
                            type="button"
                            className="mobile-employers-filter-sidebar__close"
                            aria-label="Close filters"
                            onClick={closeMobileFilters}
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mobile-employers-filter-sidebar__body">
                        <SectionEmployerSidebar onFilterChange={handleFilterChange} />
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <div className="section-full py-3 site-bg-white emp-grid-page" style={{paddingLeft: '20px', paddingRight: '20px'}}>
            {mobileFilterDrawer}
            <Row className="mb-4">
                    <Col lg={3} md={12} className="rightSidebar d-none d-lg-block">
                        <SectionEmployerSidebar onFilterChange={handleFilterChange} />
                    </Col>

                    <Col lg={9} md={12}>
                        <div className="d-lg-none emp-grid-mobile-controls">
                            <button
                                type="button"
                                className="emp-grid-mobile-filter-trigger"
                                aria-controls="mobile-employer-filters-drawer"
                                aria-expanded={isMobileFilterOpen}
                                onClick={openMobileFilters}
                            >
                                <FiFilter aria-hidden="true" />
                                <span>Filters</span>
                            </button>
                        </div>

                        <div className="mb-4 emp-grid-records-filter">
                            <SectionRecordsFilter
                                _config={_filterConfig}
                                onSortChange={handleSortChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                establishedYears={establishedYears}
                            />
                        </div>

                        <div className="twm-employer-list-wrap">
                            <Row className="justify-content-start" style={{'--bs-gutter-x': '6px'}}>
                                {loading && isFirstLoad && skeletonCards}

                                {!loading && employers.length > 0 ? 
                                    employers.map((employer, index) => (
                                        <EmployerCard key={employer._id} employer={employer} index={index} />
                                    )) : !loading && (
                                        <Col xs={12} className="text-center py-5">
                                            <h5>Building Our Global Employer Network</h5>
                                            <p>
                                                <strong>TALEGLOBAL</strong> is currently onboarding <strong>employers</strong> from across industries. As companies complete their
                                                registration, their profiles will be displayed here.
                                            </p>
                                            <p>
                                                Until then, we invite both <strong>employers</strong> and <strong>job seekers</strong> to register and become active on the platform.
                                                Employers can create their <strong>company profiles</strong> and start posting <strong>job opportunities</strong>, while <strong>candidates</strong> can
                                                complete their profiles, explore available opportunities, and stay prepared for upcoming openings.
                                            </p>
                                            <p>
                                                Our <strong>employer and company listings</strong> will continue to grow as more organizations join <strong>TALEGLOBAL</strong>,
                                                bringing more <strong>job postings</strong> and <strong>career opportunities</strong> from around the world.
                                            </p>
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
