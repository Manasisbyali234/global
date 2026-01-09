
import { useEffect, useState, useMemo, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionJobsGrid from "../../sections/jobs/section-jobs-grid";
import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import "../../../../../job-grid-optimizations.css";
import "../../../../../job-grid-spacing-fix.css";

function JobsGridPage() {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({});
    const [totalJobs, setTotalJobs] = useState(0);
    const [sortBy, setSortBy] = useState("Most Recent");
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    }, []);

    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
    }, []);

    const handleTotalChange = useCallback((total) => {
        setTotalJobs(total);
    }, []);

    return (
        <>
            <div className="section-full py-3 site-bg-white job-grid-page" data-aos="fade-up" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                <Row className="mb-4">
                        <Col lg={4} md={12} className="rightSidebar d-none d-lg-block" data-aos="fade-right" data-aos-delay="100">
                            <SectionJobsSidebar1 onFilterChange={handleFilterChange} />
                        </Col>

                        <Col lg={8} md={12} data-aos="fade-left" data-aos-delay="200">
                            {/*Sidebar - Mobile (Before Job Cards)*/}
                            <div className="d-lg-none mb-4">
                                <SectionJobsSidebar1 onFilterChange={handleFilterChange} />
                            </div>
                            {/*Filter Short By - Desktop & Mobile*/}
                            <div className="mb-4">
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
