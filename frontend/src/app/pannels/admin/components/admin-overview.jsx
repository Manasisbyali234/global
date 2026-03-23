import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import { formatDate } from "../../../../utils/dateFormatter";
import SearchBar from "../../../../components/SearchBar";
import "./admin-search-styles.css";
import "./admin-overview.css";

function AdminOverviewPage() {
  const [searchParams] = useSearchParams();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const jobsSectionRef = useRef(null);
  const applicantsSectionRef = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState("");
  const [viewMode, setViewMode] = useState("employers"); // employers | jobs | applicants
  const [employerSearch, setEmployerSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const autoOpenedEmployerIdRef = useRef(null);
  const visibleEmployerJobs = employerJobs.filter(
    (job) => job.status !== "draft" && job.title.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const headerTitle =
    viewMode === "applicants" && selectedJob
      ? `Actual Applicants for ${selectedJob.title}`
      : viewMode === "jobs" && selectedEmployer
        ? `Jobs posted by ${selectedEmployer.employerName}`
        : "Employer Overview";

  const headerSubtitle =
    viewMode === "applicants"
      ? "Review applicant records, application status, and interview round updates for the selected job."
      : viewMode === "jobs"
        ? "Review all posted jobs for the selected employer and drill down into applicant activity."
        : "Review employer activity, total job postings, and applicant counts in one place.";

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedEmployer && jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedEmployer]);

  useEffect(() => {
    if (selectedJob && applicantsSectionRef.current) {
      applicantsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedJob]);

  useEffect(() => {
    const employerId = searchParams.get("employerId");

    if (loading || error || !employerId || employers.length === 0) {
      return;
    }

    if (autoOpenedEmployerIdRef.current === employerId) {
      return;
    }

    const employer = employers.find((item) => String(item.employerId) === String(employerId));
    if (!employer) {
      return;
    }

    autoOpenedEmployerIdRef.current = employerId;
    handleViewEmployerJobs(employer);
  }, [loading, error, employers, searchParams]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getAdminEmployerOverview();
      if (response.success) {
        setEmployers(response.data || []);
      } else {
        setError(response.message || "Failed to load overview data");
      }
    } catch (err) {
      setError(err.message || "Failed to load overview data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployerJobs = async (employer) => {
    if (selectedEmployer?.employerId === employer.employerId) {
      setSelectedEmployer(null);
      setEmployerJobs([]);
      setJobsError("");
      setViewMode("employers");
      return;
    }

    try {
      setJobsLoading(true);
      setJobsError("");
      setSelectedJob(null);
      setJobApplicants([]);
      setApplicantsError("");
      setJobSearch("");
      const response = await api.getAdminEmployerOverviewJobs(employer.employerId);
      if (response.success) {
        setSelectedEmployer(response.employer);
        setEmployerJobs(response.data || []);
        setViewMode("jobs");
      } else {
        setJobsError(response.message || "Failed to load employer jobs");
      }
    } catch (err) {
      setJobsError(err.message || "Failed to load employer jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  const handleViewApplicants = async (job) => {
    if (selectedJob?.jobId === job.jobId) {
      setSelectedJob(null);
      setJobApplicants([]);
      setApplicantsError("");
      setViewMode("jobs");
      return;
    }

    try {
      setApplicantsLoading(true);
      setApplicantsError("");
      const response = await api.getAdminJobApplicants(job.jobId);
      if (response.success) {
        setSelectedJob(response.job);
        setJobApplicants(response.data || []);
        setViewMode("applicants");
      } else {
        setApplicantsError(response.message || "Failed to load applicants");
      }
    } catch (err) {
      setApplicantsError(err.message || "Failed to load applicants");
    } finally {
      setApplicantsLoading(false);
    }
  };

  return (
    <div className="admin-overview-page">
      <div className="admin-overview-header">
        <div>
          <h2>
            <i className="fa fa-table me-2" />
            {headerTitle}
          </h2>
          <p>{headerSubtitle}</p>
        </div>
        {viewMode !== "employers" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary admin-overview-back-btn"
            onClick={() => setViewMode(viewMode === "applicants" ? "jobs" : "employers")}
          >
            <i className="fa fa-arrow-left me-1" />
            {viewMode === "applicants" ? "Back to Jobs" : "Back to Employers"}
          </button>
        )}
      </div>

      {viewMode === "employers" && (
        <div className="panel panel-default site-bg-white">
          <div className="panel-body wt-panel-body p-a20">
            <div className="m-b20">
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-filter me-2 text-primary" />
                Search by Company Name
              </label>
              <SearchBar
                onSearch={setEmployerSearch}
                placeholder="Search Company Name..."
                className="employer-search"
              />
            </div>

            {loading && <div className="text-center">Loading overview...</div>}
            {!loading && error && <div className="alert alert-danger m-b0">{error}</div>}

            {!loading && !error && (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Employer Name</th>
                      <th>Number of Jobs</th>
                      <th>Number Applicants</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.filter(emp => emp.employerName.toLowerCase().includes(employerSearch.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          {employerSearch ? "No matching company records found." : "No employer records found."}
                        </td>
                      </tr>
                    ) : (
                      employers
                        .filter(emp => emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()))
                        .map((employer) => (
                          <tr key={employer.employerId}>
                            <td>{employer.employerName}</td>
                            <td>{employer.jobsCount}</td>
                            <td>{employer.applicationsCount}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                onClick={() => handleViewEmployerJobs(employer)}
                                
                              >
                                <i className="fa fa-eye me-1" />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "jobs" && selectedEmployer && (
        <div ref={jobsSectionRef} className="panel panel-default site-bg-white m-t20">
          <div className="panel-heading wt-panel-heading p-a20">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="panel-tittle m-a0">
                <i className="fa fa-briefcase me-2" />
                Jobs posted by {selectedEmployer.employerName}
              </h4>
            </div>
          </div>
          <div className="panel-body wt-panel-body p-a20">
            <div className="m-b20">
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-filter me-2 text-primary" />
                Search by Job Name
              </label>
              <SearchBar
                onSearch={setJobSearch}
                placeholder="Search Job Name..."
                className="employer-search"
              />
            </div>

            {jobsLoading && <div className="text-center">Loading jobs...</div>}
            {!jobsLoading && jobsError && <div className="alert alert-danger m-b0">{jobsError}</div>}

            {!jobsLoading && !jobsError && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Applications</th>
                      <th>Status</th>
                      <th>Posted Date</th>
                      <th>Offer Letter Sent Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEmployerJobs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {jobSearch ? "No matching jobs found." : "No jobs found for this employer."}
                        </td>
                      </tr>
                    ) : (
                      visibleEmployerJobs.map((job) => (
                          <tr key={job.jobId}>
                            <td>{job.title}</td>
                            <td>{job.applicationsCount}</td>
                            <td>{job.status}</td>
                            <td>{formatDate(job.createdAt)}</td>
                            <td>{job.offerLetterDate ? formatDate(job.offerLetterDate) : 'N/A'}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewApplicants(job)}
                                aria-label={`View applicants for ${job.title}`}
                                title={`View applicants for ${job.title}`}
                              >
                                <i className="fa fa-eye" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "applicants" && selectedJob && (
        <div ref={applicantsSectionRef} className="panel panel-default site-bg-white m-t20">
          <div className="panel-heading wt-panel-heading p-a20">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="panel-tittle m-a0">
                <i className="fa fa-users me-2" />
                Actual Applicants for {selectedJob.title}
              </h4>
            </div>
          </div>
          <div className="panel-body wt-panel-body p-a20">
            {applicantsLoading && <div className="text-center">Loading applicants...</div>}
            {!applicantsLoading && applicantsError && <div className="alert alert-danger m-b0">{applicantsError}</div>}

            {!applicantsLoading && !applicantsError && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Interviews</th>
                      <th>Round Status & Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApplicants.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No applicants found for this job.
                        </td>
                      </tr>
                    ) : (
                      jobApplicants.map((applicant) => (
                        <tr key={applicant.applicationId}>
                          <td>{applicant.applicantName}</td>
                          <td>{applicant.applicantEmail}</td>
                          <td>{applicant.status}</td>
                          <td>{formatDate(applicant.appliedAt)}</td>
                          <td>{applicant.interviewRoundsCount ?? 0}</td>
                          <td>
                            {Array.isArray(applicant.interviewRounds) && applicant.interviewRounds.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {applicant.interviewRounds.map((round, index) => (
                                  <div
                                    key={`${applicant.applicationId}-${round.id || round.type || index}`}
                                    style={{
                                      border: "1px solid #e9ecef",
                                      borderRadius: "6px",
                                      padding: "6px 8px",
                                      background: "#f8f9fa"
                                    }}
                                  >
                                    <div style={{ fontWeight: 600, fontSize: "12px", color: "#232323" }}>
                                      {round.name || round.type || `Round ${index + 1}`}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#495057" }}>
                                      <strong>Status:</strong> {round.status || "pending"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#495057", whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                                      <strong>Remarks:</strong> {round.remark || "No remarks"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">No interview rounds</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOverviewPage;
