import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import { formatDate, formatTimeToAMPM } from "../../../../utils/dateFormatter";
import SearchBar from "../../../../components/SearchBar";
import "./admin-search-styles.css";
import "./admin-overview.css";

const INTERVIEW_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Interview Statuses" },
  { value: "pending", label: "Pending" },
  { value: "shortlisted_for_next_round", label: "Shortlisted for Next Round" },
  { value: "on_hold", label: "On Hold" },
  { value: "no_show", label: "No Show" },
  { value: "rejected", label: "Not Advanced to Next Step" }
];

const normalizeInterviewStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const mapInterviewStatusToFilterValue = (value) => {
  const normalizedValue = normalizeInterviewStatus(value);

  if (!normalizedValue || normalizedValue === "pending") {
    return "pending";
  }

  if (normalizedValue === "shortlisted for next round") {
    return "shortlisted_for_next_round";
  }

  if (normalizedValue === "on hold") {
    return "on_hold";
  }

  if (normalizedValue === "no show") {
    return "no_show";
  }

  if (
    [
      "rejected",
      "not advanced to next stage",
      "not advanced to next step",
      "not eligible for next round",
      "not eligibal for next round"
    ].includes(normalizedValue)
  ) {
    return "rejected";
  }

  return normalizedValue.replace(/\s+/g, "_");
};

const getApplicantInterviewStatus = (applicant = {}) => {
  const interviewRounds = Array.isArray(applicant?.interviewRounds) ? applicant.interviewRounds : [];
  let fallbackStatus = "";

  for (let index = interviewRounds.length - 1; index >= 0; index -= 1) {
    const mappedStatus = mapInterviewStatusToFilterValue(interviewRounds[index]?.status);

    if (!mappedStatus || mappedStatus === "pending") {
      continue;
    }

    if (INTERVIEW_STATUS_FILTER_OPTIONS.some((option) => option.value === mappedStatus)) {
      return mappedStatus;
    }

    if (!fallbackStatus) {
      fallbackStatus = mappedStatus;
    }
  }

  return fallbackStatus || "pending";
};

const getInterviewStatusLabel = (status) => {
  const matchingOption = INTERVIEW_STATUS_FILTER_OPTIONS.find((option) => option.value === status);
  if (matchingOption) {
    return matchingOption.label;
  }

  return String(status || "Pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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
  const [employerTypeFilter, setEmployerTypeFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantInterviewStatusFilter, setApplicantInterviewStatusFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const autoOpenedEmployerIdRef = useRef(null);
  const visibleEmployerJobs = employerJobs.filter((job) => {
    if (job.status === "draft") return false;
    if (!job.title.toLowerCase().includes(jobSearch.toLowerCase())) return false;
    if (jobStatusFilter === "active") return job.status === "active";
    if (jobStatusFilter === "closed") return job.status === "closed";
    return true;
  });
  const showJobCompanyColumn =
    selectedEmployer?.employerType === "consultant" ||
    visibleEmployerJobs.some((job) => String(job.companyName || "").trim());
  const visibleJobApplicants = jobApplicants.filter((applicant) => {
    const matchesSearch = String(applicant?.applicantEmail || "")
      .toLowerCase()
      .includes(applicantSearch.toLowerCase());

    if (!matchesSearch) {
      return false;
    }

    if (applicantInterviewStatusFilter === "all") {
      return true;
    }

    return getApplicantInterviewStatus(applicant) === applicantInterviewStatusFilter;
  });

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

  const formatEmployerType = (employerType) =>
    String(employerType || "").trim().toLowerCase() === "consultant" ? "Consultant" : "Company";

  const getApplicationTypeBadge = (applicationType) => {
    const normalizedType = String(applicationType || "").toLowerCase();

    if (normalizedType === "credit") {
      return {
        label: "Credit",
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "74px",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 700,
          backgroundColor: "#fff4cc",
          color: "#8a5a00",
          border: "1px solid #f0c14b"
        }
      };
    }

    if (normalizedType === "paid") {
      return {
        label: "Paid",
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "74px",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 700,
          backgroundColor: "#e7f7ee",
          color: "#146c43",
          border: "1px solid #8fd19e"
        }
      };
    }

    return {
      label: "Unknown",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "74px",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        backgroundColor: "#f1f3f5",
        color: "#495057",
        border: "1px solid #ced4da"
      }
    };
  };

  const formatRoundTime = (round = {}) => {
    const timeLabel = String(round?.scheduledTime || "").trim();
    if (timeLabel) {
      if (timeLabel.includes("-")) {
        const [startTime, endTime] = timeLabel.split("-").map((value) => value.trim()).filter(Boolean);
        if (startTime && endTime) {
          return `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
        }
      }
      return formatTimeToAMPM(timeLabel);
    }

    if (round?.startTime && round?.endTime) {
      return `${formatTimeToAMPM(round.startTime)} - ${formatTimeToAMPM(round.endTime)}`;
    }

    if (round?.startTime) {
      return formatTimeToAMPM(round.startTime);
    }

    return "";
  };

  const formatRoundDate = (round = {}) => {
    const fromDate = round?.fromDate || round?.scheduledDate;
    const toDate = round?.toDate;

    if (fromDate && toDate) {
      const fromLabel = formatDate(fromDate);
      const toLabel = formatDate(toDate);
      if (fromLabel !== toLabel) {
        return `${fromLabel} - ${toLabel}`;
      }
      return fromLabel;
    }

    if (fromDate) {
      return formatDate(fromDate);
    }

    return "";
  };

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

  const handleViewEmployerJobs = useCallback(async (employer) => {
    if (selectedEmployer?.employerId === employer.employerId) {
      setSelectedEmployer(null);
      setEmployerJobs([]);
      setJobsError("");
      setJobStatusFilter("all");
      setApplicantInterviewStatusFilter("all");
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
      setJobStatusFilter("all");
      setApplicantInterviewStatusFilter("all");
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
  }, [selectedEmployer?.employerId]);

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
  }, [loading, error, employers, searchParams, handleViewEmployerJobs]);

  const handleViewApplicants = async (job) => {
    if (selectedJob?.jobId === job.jobId) {
      setSelectedJob(null);
      setJobApplicants([]);
      setApplicantsError("");
      setApplicantSearch("");
      setApplicantInterviewStatusFilter("all");
      setViewMode("jobs");
      return;
    }

    try {
      setApplicantsLoading(true);
      setApplicantsError("");
      setApplicantSearch("");
      setApplicantInterviewStatusFilter("all");
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
            <i className="fa fa-table me-2" style={{ color: "orange" }} />
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
            <div className="admin-overview-filter-grid m-b20">
              <div className="admin-overview-filter-control">
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
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-building me-2 text-primary" />
                  Filter by Type
                </label>
                <select
                  className="form-control admin-overview-filter-select"
                  value={employerTypeFilter}
                  onChange={(e) => setEmployerTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="company">Company</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>
            </div>

            {loading && <div className="text-center">Loading overview...</div>}
            {!loading && error && <div className="alert alert-danger m-b0">{error}</div>}

            {!loading && !error && (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Employer Name</th>
                      <th>Employer Type</th>
                      <th>Number of Jobs</th>
                      <th>Number of Applicants</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.filter(emp =>
                        emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()) &&
                        (employerTypeFilter === "all" || String(emp.employerType || "").toLowerCase() === employerTypeFilter)
                      ).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          {employerSearch || employerTypeFilter !== "all" ? "No matching employer records found." : "No employer records found."}
                        </td>
                      </tr>
                    ) : (
                      employers
                        .filter(emp =>
                          emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()) &&
                          (employerTypeFilter === "all" || String(emp.employerType || "").toLowerCase() === employerTypeFilter)
                        )
                        .map((employer) => (
                          <tr key={employer.employerId}>
                            <td>{employer.employerName}</td>
                            <td>{formatEmployerType(employer.employerType)}</td>
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
          <div className="panel-body wt-panel-body p-a20">
            <div className="admin-overview-filter-grid m-b20">
              <div className="admin-overview-filter-control">
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
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-list-alt me-2 text-primary" />
                  Filter by Application Status
                </label>
                <select
                  className="form-control admin-overview-filter-select"
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {jobsLoading && <div className="text-center">Loading jobs...</div>}
            {!jobsLoading && jobsError && <div className="alert alert-danger m-b0">{jobsError}</div>}

            {!jobsLoading && !jobsError && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Posted Date</th>
                      {showJobCompanyColumn && <th>Company Name</th>}
                      <th>Job Title</th>
                      <th>Applications</th>
                      <th>Paid Applicants</th>
                      <th>Credit Applicants</th>
                      <th>Application Status</th>
                      <th>Last Date of Application</th>
                      <th>Offer Letter Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEmployerJobs.length === 0 ? (
                      <tr>
                        <td colSpan={showJobCompanyColumn ? 10 : 9} className="text-center">
                          {jobSearch ? "No matching jobs found." : "No jobs found for this employer."}
                        </td>
                      </tr>
                    ) : (
                      visibleEmployerJobs.map((job) => (
                          <tr key={job.jobId}>
                            <td>{job.createdAt ? formatDate(job.createdAt) : "N/A"}</td>
                            {showJobCompanyColumn && <td>{job.companyName || selectedEmployer?.employerName || "N/A"}</td>}
                            <td>{job.title}</td>
                            <td>{job.applicationsCount}</td>
                            <td>{job.paidApplicationsCount ?? 0}</td>
                            <td>{job.creditApplicationsCount ?? 0}</td>
                            <td>{job.status}</td>
                            <td>{job.lastDateOfApplication ? formatDate(job.lastDateOfApplication) : 'N/A'}</td>
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
          <div className="panel-body wt-panel-body p-a20">
            <div className="admin-overview-filter-grid m-b20">
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-filter me-2 text-primary" />
                  Search by Applicant Email
                </label>
                <SearchBar
                  onSearch={setApplicantSearch}
                  placeholder="Search Applicant Email..."
                  className="employer-search"
                />
              </div>
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-list-alt me-2 text-primary" />
                  Filter by Interview Status
                </label>
                <select
                  className="form-control admin-overview-filter-select"
                  value={applicantInterviewStatusFilter}
                  onChange={(event) => setApplicantInterviewStatusFilter(event.target.value)}
                >
                  {INTERVIEW_STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {applicantsLoading && <div className="text-center">Loading applicants...</div>}
            {!applicantsLoading && applicantsError && <div className="alert alert-danger m-b0">{applicantsError}</div>}

            {!applicantsLoading && !applicantsError && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Interviews</th>
                      <th>Interview Status</th>
                      <th>Round Status, Schedule & Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleJobApplicants.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          {applicantSearch || applicantInterviewStatusFilter !== "all"
                            ? "No applicants match the selected filters."
                            : "No applicants found for this job."}
                        </td>
                      </tr>
                    ) : (
                      visibleJobApplicants.map((applicant) => {
                        const badge = getApplicationTypeBadge(applicant.applicationType);
                        const interviewStatus = getApplicantInterviewStatus(applicant);

                        return (
                          <tr key={applicant.applicationId}>
                            <td>{applicant.applicantName}</td>
                            <td>{applicant.applicantEmail}</td>
                            <td>
                              <span style={badge.style}>{badge.label}</span>
                            </td>
                            <td>{applicant.status}</td>
                            <td>{formatDate(applicant.appliedAt)}</td>
                            <td>{applicant.interviewRoundsCount ?? 0}</td>
                            <td>
                              <span className={`admin-overview-status-badge admin-overview-status-${interviewStatus}`}>
                                {getInterviewStatusLabel(interviewStatus)}
                              </span>
                            </td>
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
                                      <div className="admin-overview-round-detail">
                                        <strong>Status:</strong> {round.status || "pending"}
                                      </div>
                                      <div className="admin-overview-round-schedule">
                                        {(() => {
                                          const dateLabel = formatRoundDate(round);
                                          const timeLabel = formatRoundTime(round);
                                          const hasSchedule = dateLabel || timeLabel;

                                          if (!hasSchedule) {
                                            return (
                                              <div className="admin-overview-round-schedule-line">
                                                <span className="admin-overview-round-schedule-value">Not scheduled</span>
                                              </div>
                                            );
                                          }

                                          return (
                                            <div className="admin-overview-round-schedule-meta">
                                              <div className="admin-overview-round-schedule-line">
                                                <strong>Date:</strong>
                                                <span className="admin-overview-round-schedule-value">
                                                  {dateLabel || "Not set"}
                                                </span>
                                              </div>
                                              <div className="admin-overview-round-schedule-line">
                                                <strong>Time:</strong>
                                                <span className="admin-overview-round-schedule-value">
                                                  {timeLabel || "Not set"}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                      <div className="admin-overview-round-detail admin-overview-round-remarks">
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
                        );
                      })
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
