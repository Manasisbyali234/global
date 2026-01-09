import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";
import SectionPagination from "../common/section-pagination";

function SectionJobsGrid({ filters, onTotalChange }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        try {
            const params = new URLSearchParams();
            // Handle search parameter (from HeroBody or sidebar)
            if (filters?.search) params.append('search', filters.search);
            if (filters?.keyword) params.append('keyword', filters.keyword);
            
            // Handle location parameter
            if (filters?.location) params.append('location', filters.location);
            
            // Handle job type parameter (from HeroBody or sidebar)
            if (filters?.jobType) {
                if (Array.isArray(filters.jobType)) {
                    filters.jobType.forEach(type => {
                        params.append('jobType', type);
                    });
                } else {
                    params.append('jobType', filters.jobType);
                }
            }
            if (filters?.employmentType) {
                params.append('employmentType', filters.employmentType);
            }
            
            // Handle other parameters
            if (filters?.jobTitle) params.append('jobTitle', filters.jobTitle);
            if (filters?.skills && filters.skills.length > 0) {
                filters.skills.forEach(skill => params.append('skills', skill));
            }
            if (filters?.category) {
                params.append('category', filters.category);
                
            }
            if (filters?.sortBy) {
                params.append('sortBy', filters.sortBy);
            }
            if (filters?.itemsPerPage) {
                params.append('limit', filters.itemsPerPage.toString());
            }

            const url = `http://localhost:5000/api/public/jobs?${params.toString()}`;
            
            
            const response = await fetch(url);
            const data = await response.json();
            
            
            if (data.success) {
                let jobList = data.jobs || data.data || [];
                setJobs(jobList);
                if (onTotalChange) {
                    onTotalChange(jobList.length);
                }
            } else {
                setJobs([]);
                if (onTotalChange) {
                    onTotalChange(0);
                }
            }
        } catch (error) {
            
            setJobs([]);
            if (onTotalChange) {
                onTotalChange(0);
            }
        } finally {
            setLoading(false);
            setIsFirstLoad(false);
        }
    };



    return (
        <>
            <Row>
                {loading && isFirstLoad && (
                    [...Array(4)].map((_, idx) => (
                        <Col key={`skeleton-${idx}`} lg={6} md={12} className="mb-4">
                            <div className="twm-jobs-grid-style1 job-card-skeleton">
                                <div className="skeleton-logo" />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line short" />
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line" />
                                </div>
                            </div>
                        </Col>
                    ))
                )}

                {!loading && jobs.length > 0 ? jobs.map((job, index) => (
                    <Col key={job._id} lg={6} md={12} className="mb-4" data-aos="fade-up" data-aos-delay={index * 80}>
                        <div className="twm-jobs-grid-style1 hover-card job-card">
                            <div className="twm-media">
                                {job.employerProfile?.logo ? (
                                    <img src={job.employerProfile.logo} alt="Company Logo" />
                                ) : (
                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                )}
                            </div>

                            <div className="twm-jobs-category green">
                                <span className={`twm-bg-${job.jobType === 'Full-time' ? 'green' : job.jobType === 'Part-time' ? 'brown' : job.jobType === 'Contract' ? 'purple' : job.jobType === 'Internship' ? 'sky' : 'golden'}`}>
                                    {job.jobType || job.employmentType || 'Full-time'}
                                </span>
                            </div>

                            <div className="twm-mid-content">
                                <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-job-title">
                                    <h4>{job.title}</h4>
                                </NavLink>
                                <div className="twm-job-address">
                                    <i className="feather-map-pin" />
                                    &nbsp;{job.location}
                                </div>
                            </div>

                            <div className="twm-right-content twm-job-right-group">
                                <div className="twm-salary-and-apply mb-2">
                                    <div className="twm-jobs-amount">
                                        {job.ctc && job.ctc.min && job.ctc.max ? (
                                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1967d2', marginBottom: '4px' }}>
                                                Annual CTC: {job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA`}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1967d2', marginBottom: '4px' }}>
                                                CTC: Not specified
                                            </div>
                                        )}
                                    </div>
                                    <span className="vacancy-text">Vacancies: {job.vacancies || 'N/A'}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <h6 className="twm-job-address posted-by-company mb-0">
                                        Posted by {job.employerId?.employerType === 'consultant' || job.companyName ? 'Consultancy' : 'Company'}
                                    </h6>
                                    <button 
                                        className="btn btn-sm apply-now-button"
                                        onClick={() => {
                                            window.location.href = `/job-detail/${job._id}`;
                                        }}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Col>
                )) : (
                    <Col xs={12} className="text-center py-5" data-aos="fade-up">
                        <h5>No jobs found</h5>
                        <p>Please check back later for new opportunities.</p>
                    </Col>
                )}

			</Row>
				<SectionPagination />
			</>
		);
}

export default SectionJobsGrid;
