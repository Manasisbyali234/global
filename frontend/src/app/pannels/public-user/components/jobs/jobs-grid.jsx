
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Col, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import { loadScript } from "../../../../../globals/constants";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionJobsGrid from "../../sections/jobs/section-jobs-grid";
import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import "../../../../../job-grid-optimizations.css";
import "../../../../../job-grid-spacing-fix.css";
import "../../../../../job-grid-mobile-sidebar-fix.css";

function JobsGridPage() {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({});
    const [totalJobs, setTotalJobs] = useState(0);
    const [sortBy, setSortBy] = useState("Most Recent");
    const [itemsPerPage, setItemsPerPage] = useState(14);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const lastMobileFilterInteractionRef = useRef(null);

    const memoizedFilters = useMemo(() => {
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const search = searchParams.get('search');
        const jobType = searchParams.get('jobType');
        
        // Check if this is the specific URL pattern that should show IT category jobs
        const isSpecificPattern = search === 'Software Developer' && 
                                 jobType === 'Full Time' && 
                                 location === 'Bangalore';
        
        const newFilters = {
            sortBy,
            itemsPerPage
        };
        
        if (isSpecificPattern) {
            newFilters.category = 'IT';
        } else {
            if (category) newFilters.category = category;
            if (location) newFilters.location = location;
            if (search) newFilters.search = search;
            if (jobType) {
                newFilters.jobType = jobType.toLowerCase().replace(/\s+/g, '-');
            }
        }
        
        return newFilters;
    }, [searchParams, sortBy, itemsPerPage]);

    useEffect(() => {
        setFilters(memoizedFilters);
    }, [memoizedFilters]);

    const _filterConfig = useMemo(() => ({
        prefix: "Showing",
        type: "jobs",
        total: totalJobs.toString(),
        showRange: false,
        showingUpto: ""
    }), [totalJobs]);

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

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));

        const lastInteraction = lastMobileFilterInteractionRef.current;
        const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 992;

        if (isMobileFilterOpen && isMobileViewport && lastInteraction && !lastInteraction.isTextEntry) {
            closeMobileFilters();
        }
    }, [closeMobileFilters, isMobileFilterOpen]);

    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
    }, []);

    const handleTotalChange = useCallback((total) => {
        setTotalJobs(total);
    }, []);

    const mobileFilterDrawer = typeof document !== "undefined"
        ? createPortal(
            <div className={`d-lg-none mobile-jobs-filter-sidebar-shell${isMobileFilterOpen ? " is-open" : ""}`}>
                <button
                    type="button"
                    className="mobile-jobs-filter-overlay"
                    aria-label="Close filters"
                    onClick={closeMobileFilters}
                />
                <div
                    id="mobile-job-filters-drawer"
                    className="mobile-jobs-filter-sidebar"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Job filters"
                    onPointerDownCapture={recordMobileFilterInteraction}
                    onChangeCapture={recordMobileFilterInteraction}
                    onClickCapture={recordMobileFilterInteraction}
                >
                    <div className="mobile-jobs-filter-sidebar__header">
                        <div className="mobile-jobs-filter-sidebar__title">
                            <FiFilter aria-hidden="true" />
                            <span>Filters</span>
                        </div>
                        <button
                            type="button"
                            className="mobile-jobs-filter-sidebar__close"
                            aria-label="Close filters"
                            onClick={closeMobileFilters}
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mobile-jobs-filter-sidebar__body">
                        <SectionJobsSidebar1 onFilterChange={handleFilterChange} />
                    </div>
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div className="section-full py-3 site-bg-white job-grid-page" data-aos="fade-up" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                {mobileFilterDrawer}
                <Row className="mb-4">
                        <Col lg={4} md={12} className="rightSidebar d-none d-lg-block" data-aos="fade-right" data-aos-delay="100">
                            <SectionJobsSidebar1 onFilterChange={handleFilterChange} />
                        </Col>

                        <Col lg={8} md={12} data-aos="fade-left" data-aos-delay="200">
                            <div className="d-lg-none job-grid-mobile-controls">
                                <button
                                    type="button"
                                    className="job-grid-mobile-filter-trigger"
                                    aria-controls="mobile-job-filters-drawer"
                                    aria-expanded={isMobileFilterOpen}
                                    onClick={openMobileFilters}
                                >
                                    <FiFilter aria-hidden="true" />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/*Filter Short By - Desktop & Mobile*/}
                            <div className="mb-4 job-grid-records-filter">
                                <SectionRecordsFilter
                                    _config={_filterConfig}
                                    onSortChange={handleSortChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                            <SectionJobsGrid filters={filters} onTotalChange={handleTotalChange} />
                        </Col>
                    </Row>
            </div>

        </>
    )
}

export default JobsGridPage;
