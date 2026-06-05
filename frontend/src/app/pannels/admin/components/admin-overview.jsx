import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import { getAssessmentOutcome } from "../../../../utils/assessmentOutcome";
import { formatDate, formatTimeToAMPM } from "../../../../utils/dateFormatter";
import { getAdminApplicantTableStatusKey, getStatusLabel } from "../../../../utils/statusDisplay";
import { buildUtcDateTimeFromIst } from "../../../../utils/timezoneUtils";
import { formatJobTitle } from "../../../../utils/jobTitleFormatter";
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
  const [employerTypeFilter, setEmployerTypeFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobFromDate, setJobFromDate] = useState("");
  const [jobToDate, setJobToDate] = useState("");
  const [employerPage, setEmployerPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [applicantPage, setApplicantPage] = useState(1);
  const PAGE_SIZE = 10;
  const autoOpenedEmployerIdRef = useRef(null);
  const renderPagination = (currentPage, setPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
        <div style={{ color: "#6c757d", fontSize: "13px" }}>
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
          <button onClick={() => setPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={currentPage === totalPages} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === totalPages ? "#f8f9fa" : "#fff", color: currentPage === totalPages ? "#adb5bd" : "#495057", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
        </div>
      </div>
    );
  };

  const visibleEmployerJobs = employerJobs.filter((job) => {
    if (job.status === "draft") return false;
    const searchLower = jobSearch.toLowerCase();
    const matchesTitle = job.title.toLowerCase().includes(searchLower);
    const matchesCompany = String(job.companyName || selectedEmployer?.employerName || "").toLowerCase().includes(searchLower);
    if (!matchesTitle && !matchesCompany) return false;
    if (jobStatusFilter === "active" && job.status !== "active") return false;
    if (jobStatusFilter === "closed" && job.status !== "closed") return false;
    if ((jobFromDate || jobToDate) && job.createdAt) {
      const jobDate = new Date(job.createdAt);
      if (jobFromDate) {
        if (jobDate < new Date(jobFromDate)) return false;
      }
      if (jobToDate) {
        const toEnd = new Date(jobToDate);
        toEnd.setHours(23, 59, 59, 999);
        if (jobDate > toEnd) return false;
      }
    }
    return true;
  });
  const showJobCompanyColumn =
    selectedEmployer?.employerType === "consultant" ||
    visibleEmployerJobs.some((job) => String(job.companyName || "").trim());
  const visibleJobApplicants = jobApplicants.filter((applicant) => {
    const applicantStatusKey = getAdminApplicantTableStatusKey(applicant);
    if (!String(applicant?.applicantEmail || "").toLowerCase().includes(applicantSearch.toLowerCase())) return false;
    if (applicantStatusFilter !== "all") {
      if (applicantStatusKey !== applicantStatusFilter) return false;
    }
    return true;
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

  const normalizeStatusValue = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  const formatStatusLabel = (value = "pending") =>
    String(value || "pending")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Pending";

  const badgeStyles = {
    neutral: { background: "#f1f3f5", color: "#495057", border: "1px solid #adb5bd" },
    info: { background: "#e7f1ff", color: "#0d6efd", border: "1px solid #0d6efd" },
    success: { background: "#e6f4ea", color: "#1e7e34", border: "1px solid #1e7e34" },
    warning: { background: "#fff8e1", color: "#b26a00", border: "1px solid #b26a00" },
    danger: { background: "#fdeaea", color: "#c82333", border: "1px solid #c82333" },
    secondary: { background: "#eceff1", color: "#546e7a", border: "1px solid #b0bec5" }
  };

  const assessmentPendingStatuses = new Set([
    "",
    "pending",
    "available",
    "scheduled",
    "not started"
  ]);

  const getAssessmentRoundEndDate = (round = {}) => {
    const endDateValue = round?.toDate || round?.fromDate || round?.scheduledDate || null;
    if (!endDateValue) {
      return null;
    }

    const scheduledTimeParts = String(round?.scheduledTime || "")
      .split("-")
      .map((value) => value.trim())
      .filter(Boolean);
    const endTimeValue = round?.endTime || scheduledTimeParts[1] || scheduledTimeParts[0] || "";
    return buildUtcDateTimeFromIst(endDateValue, endTimeValue, "end");
  };

  const getInterviewRoundStatusLabel = (status = "pending", index = -1, totalRounds = 0) => {
    const normalizedStatus = normalizeStatusValue(status);
    const isFinalRound = totalRounds > 0 && index === totalRounds - 1;

    if (!normalizedStatus) return "Pending";
    if (normalizedStatus === "rejected") {
      return isFinalRound ? "Rejected" : "Not Advanced to Next Stage";
    }
    if (normalizedStatus === "shortlisted for next round") return "Shortlisted for next Round";
    if (normalizedStatus === "not advanced to next stage") return "Not Advanced to Next Stage";
    if (normalizedStatus === "not advanced to next round") return "Not Advanced to Next Round";
    if (normalizedStatus === "on hold") return "On Hold";
    if (normalizedStatus === "pending decision") return "Pending Decision";
    if (normalizedStatus === "under review") return "Under Review";
    if (normalizedStatus === "no show") return "No Show";
    if (normalizedStatus === "in progress") return "In Progress";
    return getStatusLabel(status || "pending");
  };

  const getInterviewRoundStatusStyle = (status = "pending") => {
    const normalizedStatus = normalizeStatusValue(status);

    if ([
      "rejected",
      "not advanced to next stage",
      "not advanced to next round",
      "no show",
      "failed",
      "fail",
      "suspended",
      "expired",
      "session expired"
    ].includes(normalizedStatus)) {
      return badgeStyles.danger;
    }
    if (["selected", "passed", "completed", "interview completed"].includes(normalizedStatus)) {
      return badgeStyles.success;
    }
    if (["shortlisted", "shortlisted for next round", "scheduled", "interview scheduled"].includes(normalizedStatus)) {
      return badgeStyles.info;
    }
    if (["pending", "pending decision", "under review", "in progress"].includes(normalizedStatus)) {
      return badgeStyles.warning;
    }
    if (normalizedStatus === "on hold") {
      return badgeStyles.secondary;
    }
    return badgeStyles.neutral;
  };

  const isEmployerDecisionRoundStatus = (status = "") => [
    "shortlisted for next round",
    "shortlisted",
    "selected",
    "on hold",
    "pending decision",
    "under review",
    "no show",
    "rejected",
    "not advanced to next stage",
    "not advanced to next round"
  ].includes(normalizeStatusValue(status));

  const getRoundStatusPresentation = (round = {}, index = -1, totalRounds = 0) => {
    const normalizedStatus = normalizeStatusValue(round?.status);
    const isAssessmentRound =
      normalizeStatusValue(round?.type) === "assessment" ||
      normalizeStatusValue(round?.name).includes("assessment");

    // For assessment rounds, use assessment-specific logic
    if (isAssessmentRound) {
      if (isEmployerDecisionRoundStatus(round?.status)) {
        return {
          label: getInterviewRoundStatusLabel(round?.status, index, totalRounds),
          style: getInterviewRoundStatusStyle(round?.status)
        };
      }

      const normalizedResult = normalizeStatusValue(round?.assessmentResult);
      const outcome = getAssessmentOutcome({
        status: round?.status,
        result: round?.assessmentResult
      });
      const assessmentEndDate = getAssessmentRoundEndDate(round);
      const isWindowExpired = Boolean(assessmentEndDate && Date.now() > assessmentEndDate.getTime());
      const hasPendingReviewResult = normalizedResult === "pending";
      const hasExplicitResult = Boolean(normalizedResult && normalizedResult !== "pending");

      if (outcome.isPassed) {
        return { label: "Passed", style: badgeStyles.success };
      }
      if (outcome.isFailed) {
        return { label: "Failed", style: badgeStyles.danger };
      }
      if (outcome.isSuspended) {
        return { label: "Suspended", style: badgeStyles.danger };
      }
      if (outcome.isInProgress) {
        return { label: "In Progress", style: badgeStyles.warning };
      }
      if (outcome.isCompleted || outcome.isPendingReview) {
        return { label: "Completed", style: badgeStyles.success };
      }
      if (outcome.isNoShow) {
        return { label: "No Show", style: badgeStyles.danger };
      }
      // Treat expired status as No Show when the window has passed and there's no explicit pass/fail result
      // But if result is "pending", candidate submitted subjective answers awaiting employer evaluation
      if (["expired", "session expired"].includes(normalizedStatus)) {
        if (hasPendingReviewResult || hasExplicitResult) {
          return { label: "Completed", style: badgeStyles.success };
        }
        return { label: "No Show", style: badgeStyles.danger };
      }
      if (isWindowExpired && assessmentPendingStatuses.has(normalizedStatus)) {
        if (hasPendingReviewResult) {
          return { label: "Completed", style: badgeStyles.success };
        }
        if (!hasExplicitResult) {
          return { label: "No Show", style: badgeStyles.danger };
        }
      }
      
      // Default for assessment
      return {
        label: getInterviewRoundStatusLabel(round?.status || "pending", index, totalRounds),
        style: getInterviewRoundStatusStyle(round?.status || "pending")
      };
    }

    return {
      label: getInterviewRoundStatusLabel(round?.status || "pending", index, totalRounds),
      style: getInterviewRoundStatusStyle(round?.status || "pending")
    };
  };

  const isRejectedAssessmentOutcome = (status = "", result = "") => {
    const s = normalizeStatusValue(status);
    const r = normalizeStatusValue(result);
    return (
      ["fail", "failed"].includes(r) ||
      ["fail", "failed", "suspended", "no show", "expired", "session expired"].includes(s)
    );
  };

  const getAssessmentResultPresentation = (round = {}) => {
    const normalizedStatus = normalizeStatusValue(round?.status);
    const normalizedResult = normalizeStatusValue(round?.assessmentResult);

    // Status is ground truth — completed/passed/failed status always wins over stale assessmentResult
    if (normalizedStatus === "completed") {
      return { label: "Completed", style: badgeStyles.success };
    }
    if (normalizedStatus === "passed" || ["pass", "passed"].includes(normalizedResult)) {
      return { label: "Passed", style: badgeStyles.success };
    }
    if (normalizedStatus === "failed" || ["fail", "failed"].includes(normalizedResult)) {
      return { label: "Failed", style: badgeStyles.danger };
    }
    if (normalizedResult === "suspended" || normalizedStatus === "suspended") {
      return { label: "Suspended", style: badgeStyles.danger };
    }
    // pending result = subjective/upload questions awaiting employer marks
    if (normalizedResult === "pending") {
      return { label: "Completed", style: badgeStyles.success };
    }
    if (
      ["no show", "session expired", "expired"].includes(normalizedResult) ||
      ["no show", "expired", "session expired"].includes(normalizedStatus)
    ) {
      return { label: "No Show", style: badgeStyles.danger };
    }
    if (normalizedResult === "completed") {
      return { label: "Completed", style: badgeStyles.success };
    }
    if (normalizedStatus === "in progress") {
      return { label: "In Progress", style: badgeStyles.warning };
    }

    return { label: "Pending", style: badgeStyles.neutral };
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
      setViewMode("employers");
      setJobPage(1);
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
      setJobFromDate("");
      setJobToDate("");
      setJobPage(1);
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
      setApplicantStatusFilter("all");
      setViewMode("jobs");
      setApplicantPage(1);
      return;
    }

    try {
      setApplicantsLoading(true);
      setApplicantsError("");
      setApplicantSearch("");
      setApplicantStatusFilter("all");
      setApplicantPage(1);
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
                  onSearch={(val) => { setEmployerSearch(val); setEmployerPage(1); }}
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
                  onChange={(e) => { setEmployerTypeFilter(e.target.value); setEmployerPage(1); }}
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
                      <th>Company Name</th>
                      <th>Employer Type</th>
                      <th>Number of Jobs</th>
                      <th>Active Jobs</th>
                      <th>Number of Applicants</th>
                      <th>Hired </th>
                      <th>Offer Letter Rejected</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.filter(emp =>
                        emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()) &&
                        (employerTypeFilter === "all" || String(emp.employerType || "").toLowerCase() === employerTypeFilter)
                      ).length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          {employerSearch || employerTypeFilter !== "all" ? "No matching employer records found." : "No employer records found."}
                        </td>
                      </tr>
                    ) : (
                      employers
                        .filter(emp =>
                          emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()) &&
                          (employerTypeFilter === "all" || String(emp.employerType || "").toLowerCase() === employerTypeFilter)
                        )
                        .slice((employerPage - 1) * PAGE_SIZE, employerPage * PAGE_SIZE)
                        .map((employer) => (
                          <tr key={employer.employerId}>
                            <td>{employer.employerName}</td>
                            <td>{formatEmployerType(employer.employerType)}</td>
                            <td>{employer.jobsCount}</td>
                            <td>{employer.activeJobsCount ?? 0}</td>
                            <td>{employer.applicationsCount}</td>
                            <td>{employer.acceptedOfferCount ?? 0}</td>
                            <td>{employer.rejectedOfferCount ?? 0}</td>
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
            {!loading && !error && renderPagination(employerPage, setEmployerPage, employers.filter(emp =>
              emp.employerName.toLowerCase().includes(employerSearch.toLowerCase()) &&
              (employerTypeFilter === "all" || String(emp.employerType || "").toLowerCase() === employerTypeFilter)
            ).length)}
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
                  Search by Job  or Company
                </label>
                <SearchBar
                  onSearch={setJobSearch}
                  placeholder="Search by job name or company..."
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
                  onChange={(e) => { setJobStatusFilter(e.target.value); setJobPage(1); }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-calendar me-2 text-primary" />
                  From Date
                </label>
                <input
                  type="date"
                  className="form-control admin-overview-filter-select"
                  value={jobFromDate}
                  max={jobToDate || undefined}
                  onChange={(e) => { setJobFromDate(e.target.value); setJobPage(1); }}
                />
              </div>
              <div className="admin-overview-filter-control">
                <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                  <i className="fa fa-calendar me-2 text-primary" />
                  To Date
                </label>
                <input
                  type="date"
                  className="form-control admin-overview-filter-select"
                  value={jobToDate}
                  min={jobFromDate || undefined}
                  onChange={(e) => { setJobToDate(e.target.value); setJobPage(1); }}
                />
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
                      <th>Offer Accepted</th>
                      <th>Offer Not Accepted</th>
                      <th>Rejected</th>
                      <th>Application Status</th>
                      <th>Last Date of Application</th>
                      <th>Offer Letter Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEmployerJobs.length === 0 ? (
                      <tr>
                        <td colSpan={showJobCompanyColumn ? 13 : 12} className="text-center">
                          {jobSearch ? "No jobs match your search." : "No jobs found for this employer."}
                        </td>
                      </tr>
                    ) : (
                      visibleEmployerJobs.slice((jobPage - 1) * PAGE_SIZE, jobPage * PAGE_SIZE).map((job) => (
                          <tr key={job.jobId}>
                            <td>{job.createdAt ? formatDate(job.createdAt) : "N/A"}</td>
                            {showJobCompanyColumn && <td>{job.companyName || selectedEmployer?.employerName || "N/A"}</td>}
                            <td>{formatJobTitle(job.title)}</td>
                            <td>{job.applicationsCount}</td>
                            <td>{job.paidApplicationsCount ?? 0}</td>
                            <td>{job.creditApplicationsCount ?? 0}</td>
                            <td>{job.acceptedOfferCount ?? 0}</td>
                            <td>{job.notAcceptedOfferCount ?? 0}</td>
                            <td>{job.rejectedApplicationsCount ?? 0}</td>
                            <td>{job.status}</td>
                            <td>{job.lastDateOfApplication ? formatDate(job.lastDateOfApplication) : 'N/A'}</td>
                            <td>{job.offerLetterDate ? formatDate(job.offerLetterDate) : 'N/A'}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewApplicants(job)}
                                aria-label={`View applicants for ${formatJobTitle(job.title)}`}
                                title={`View applicants for ${formatJobTitle(job.title)}`}
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
            {!jobsLoading && !jobsError && renderPagination(jobPage, setJobPage, visibleEmployerJobs.length)}
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
                  Filter by Status
                </label>
                <select
                  className="form-control admin-overview-filter-select"
                  value={applicantStatusFilter}
                  onChange={(e) => { setApplicantStatusFilter(e.target.value); setApplicantPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="offer_sent">offer letter sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
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
                      <th>#</th>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Payment Method</th>
                      <th>Applied Date</th>
                      <th>Interviews</th>
                      <th>Round Status, Schedule & Remarks</th>
                      <th>Offer Letter Status</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleJobApplicants.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center">
                          {applicantSearch
                            ? "No applicants match the search."
                            : "No applicants found for this job."}
                        </td>
                      </tr>
                    ) : (
                      visibleJobApplicants.slice((applicantPage - 1) * PAGE_SIZE, applicantPage * PAGE_SIZE).map((applicant, index) => {
                        const badge = getApplicationTypeBadge(applicant.applicationType);
                        let applicantStatusKey = getAdminApplicantTableStatusKey(applicant);
                        if (Array.isArray(applicant.interviewRounds)) {
                          const rounds = applicant.interviewRounds;
                          const hasPassedAssessment = rounds.some((round) => {
                            const isAssessment =
                              normalizeStatusValue(round?.type) === 'assessment' ||
                              normalizeStatusValue(round?.name).includes('assessment');
                            if (!isAssessment) return false;
                            const result = getAssessmentResultPresentation(round);
                            return result.label === 'Passed';
                          });
                          if (hasPassedAssessment) {
                            applicantStatusKey = 'pending';
                          } else if (applicantStatusKey !== 'rejected') {
                            const presentations = rounds.map((round, roundIndex) =>
                              getRoundStatusPresentation(round, roundIndex, rounds.length)
                            );
                            const hasNoShowRound = presentations.some((p) => p.label === 'No Show');
                            if (hasNoShowRound) applicantStatusKey = 'rejected';
                          }
                        }

                        return (
                          <tr key={applicant.applicationId}>
                            <td>{(applicantPage - 1) * PAGE_SIZE + index + 1}</td>
                            <td>{applicant.applicantName}</td>
                            <td>{applicant.applicantEmail}</td>
                            <td>
                              <span style={badge.style}>{badge.label}</span>
                            </td>
                            <td>{formatDate(applicant.appliedAt)}</td>
                            <td>{applicant.interviewRoundsCount ?? 0}</td>
                            <td>
                              {Array.isArray(applicant.interviewRounds) && applicant.interviewRounds.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {applicant.interviewRounds.map((round, index) => (
                                    (() => {
                                      const roundStatus = getRoundStatusPresentation(round, index, applicant.interviewRounds.length);
                                      const assessmentResult = getAssessmentResultPresentation(round);
                                      const isAssessmentRound =
                                        normalizeStatusValue(round?.type) === "assessment" ||
                                        normalizeStatusValue(round?.name).includes("assessment");
                                      return (
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
                                        <strong>Status:</strong>{" "}
                                        <span style={{
                                          display: 'inline-block',
                                          padding: '2px 8px',
                                          borderRadius: '999px',
                                          fontSize: '11px',
                                          fontWeight: 600,
                                          marginLeft: '4px',
                                          ...roundStatus.style
                                        }}>
                                          {roundStatus.label}
                                        </span>
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
                                      {isAssessmentRound && (() => {
                                        return (
                                          <div className="admin-overview-round-detail" style={{ marginTop: '4px' }}>
                                            <strong>Assessment Result:</strong>{' '}
                                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, marginLeft: '4px', ...assessmentResult.style }}>
                                              {assessmentResult.label}
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                      );
                                    })()
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No interview rounds</span>
                              )}
                            </td>
                            <td>{applicant.offerLetterStatus || 'Pending'}</td>
                            <td>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 600,
                                ...(applicantStatusKey === 'rejected' ? badgeStyles.danger :
                                  applicantStatusKey === 'accepted' || applicantStatusKey === 'hired' ? badgeStyles.success :
                                  applicantStatusKey === 'offer_sent' || applicantStatusKey === 'shortlisted' ? badgeStyles.info :
                                  applicantStatusKey === 'interviewed' ? badgeStyles.info :
                                  badgeStyles.warning)
                              }}>
                                {getStatusLabel(applicantStatusKey)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!applicantsLoading && !applicantsError && renderPagination(applicantPage, setApplicantPage, visibleJobApplicants.length)}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOverviewPage;
