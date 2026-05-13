import { useEffect, useState, useMemo, useRef } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { ArrowLeft, ListChecks } from "lucide-react";
import { api } from "../../../../utils/api";
import { getAssessmentOutcome, isAssessmentOutcomeRejected } from "../../../../utils/assessmentOutcome";
import './emp-candidates.css';

function SearchableFilterDropdown({
  value,
  options = [],
  placeholder = "",
  searchPlaceholder = "Search...",
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value) || null;

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchTerm]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setSearchTerm("");
  };

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div ref={containerRef} className="emp-candidates-filter-dropdown">
      <div
        className={`form-select page-toolbar__select emp-candidates-filter-dropdown__trigger${isOpen ? " is-open" : ""}`}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={`emp-candidates-filter-dropdown__trigger-text${selectedOption ? "" : " is-placeholder"}`}>
          {selectedOption?.label || placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="emp-candidates-filter-menu" role="listbox">
          <div className="emp-candidates-filter-menu__search">
            <input
              ref={searchInputRef}
              type="text"
              className="form-control page-toolbar__input emp-candidates-filter-menu__search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          <div className="emp-candidates-filter-menu__options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={`${option.value || "all"}-${option.label}`}
                  className={`emp-candidates-filter-option${option.value === value ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="emp-candidates-filter-menu__empty">No matching results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmpCandidatesPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employerType, setEmployerType] = useState("company");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [currentJob, setCurrentJob] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusClock, setStatusClock] = useState(() => Date.now());
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadScript("js/custom.js");
    fetchEmployerType();
    fetchApplications();
  }, []);



  useEffect(() => {
    fetchApplications();
  }, [selectedCompany, jobId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStatusClock(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const fetchEmployerType = async () => {
    try {
      const data = await api.getEmployerProfile();
      if (data.success && data.profile?.employerId) {
        const type = data.profile.employerId.employerType || "company";
        setEmployerType(type);
        if (type === "consultant" && !jobId) {
          fetchConsultantCompanies();
        }
      }
    } catch (error) {
      console.error("Error fetching employer type:", error);
    }
  };

  const fetchConsultantCompanies = async () => {
    try {
      const data = await api.getConsultantCompanies();
      if (data.success) {
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Error fetching consultant companies:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let data;
      if (jobId) {
        data = await api.getJobApplications(jobId);
      } else {
        const params = {};
        if (selectedCompany && selectedCompany.trim() !== "") {
          params.companyName = selectedCompany;
        }
        data = await api.getAllEmployerApplications(params);
      }

      if (data.success) {
        setApplications(data.applications || []);
        if (data.job) {
          setCurrentJob(data.job);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "twm-bg-yellow";
      case "shortlisted":
        return "twm-bg-purple";
      case "interviewed":
        return "twm-bg-orange";
      case "hired":
        return "twm-bg-green";
      case "offer_sent":
        return "twm-bg-purple";
      case "accepted":
        return "twm-bg-green";
      case "rejected":
        return "twm-bg-red";
      default:
        return "twm-bg-light-blue";
    }
  };

  const normalizeStatusValue = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  const isRejectedLikeStatus = (value = "") => {
    const normalized = normalizeStatusValue(value);
    if (!normalized) return false;

    return [
      "rejected",
      "failed",
      "fail",
      "field",
      "expired",
      "suspended",
      "session expired",
      "no show",
      "not eligibal for next round",
      "not eligible for next round"
    ].includes(normalized);
  };

  const isAssessmentProcess = (process = {}) =>
    normalizeStatusValue(process?.type) === "assessment";

  const wasAutoRejectedFromStageStatus = (application = {}) =>
    Array.isArray(application?.statusHistory) &&
    application.statusHistory.some((entry) =>
      normalizeStatusValue(entry?.status) === "rejected" &&
      normalizeStatusValue(entry?.notes).includes("auto updated from interview stage status")
    );

  const getAssessmentRoundOrderKeys = (job = {}) =>
    (Array.isArray(job?.interviewRoundOrder) ? job.interviewRoundOrder : []).filter(
      (key) => String(job?.interviewRoundTypes?.[key] || "").toLowerCase() === "assessment"
    );

  const getAssessmentScheduleSource = (job = {}) => {
    const assessmentRoundKey = getAssessmentRoundOrderKeys(job)[0];
    const roundDetails = assessmentRoundKey
      ? job?.interviewRoundDetails?.[assessmentRoundKey] || null
      : null;

    return {
      startDate: roundDetails?.fromDate || roundDetails?.date || job?.assessmentStartDate || null,
      endDate: roundDetails?.toDate || roundDetails?.fromDate || roundDetails?.date || job?.assessmentEndDate || null,
      startTime: roundDetails?.startTime || job?.assessmentStartTime || null,
      endTime: roundDetails?.endTime || job?.assessmentEndTime || null
    };
  };

  const getAssessmentWindowInfo = (job = {}, nowTimestamp = Date.now()) => {
    const now = new Date(nowTimestamp);
    const scheduleSource = getAssessmentScheduleSource(job);
    const startRaw = scheduleSource.startDate ? new Date(scheduleSource.startDate) : null;
    const endRaw = scheduleSource.endDate ? new Date(scheduleSource.endDate) : null;
    const isValid = (date) => date instanceof Date && !Number.isNaN(date.getTime());
    let startDate = isValid(startRaw) ? startRaw : null;
    let endDate = isValid(endRaw) ? endRaw : null;

    if (startDate && scheduleSource.startTime) {
      const [hours, minutes] = String(scheduleSource.startTime).split(":").map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        startDate = new Date(startDate);
        startDate.setHours(hours, minutes, 0, 0);
      }
    }

    if (endDate && scheduleSource.endTime) {
      const [hours, minutes] = String(scheduleSource.endTime).split(":").map(Number);
      endDate = new Date(endDate);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        endDate.setHours(hours, minutes, 59, 999);
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
    } else if (endDate) {
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    return {
      isAfterEnd: endDate ? now > endDate : false
    };
  };

  const getAssessmentCompletionInfo = (application = {}) => {
    const assessmentProcess = Array.isArray(application?.interviewProcesses)
      ? application.interviewProcesses.find((process) => {
          const normalizedType = normalizeStatusValue(process?.type);
          const normalizedName = normalizeStatusValue(process?.name);
          return normalizedType === "assessment" || normalizedName.includes("assessment");
        }) || null
      : null;

    const primaryStatus = normalizeStatusValue(application?.assessmentStatus);
    const processStatus = normalizeStatusValue(assessmentProcess?.status);
    const effectiveStatus =
      ((!primaryStatus || ["pending", "available", "not required", "not started", "scheduled"].includes(primaryStatus)) &&
        processStatus)
        ? processStatus
        : primaryStatus;
    const result = normalizeStatusValue(application?.assessmentResult || assessmentProcess?.result);
    const outcome = getAssessmentOutcome({ status: effectiveStatus, result });

    return {
      status: effectiveStatus,
      isPassed: outcome.isPassed,
      isFailed: outcome.isFailed,
      isCompleted: outcome.isCompleted,
      isNoShow: outcome.isNoShow,
      isInProgress: outcome.isInProgress,
      isSuspended: outcome.isSuspended
    };
  };

  const getApplicationDisplayStatus = (application = {}, nowTimestamp = Date.now()) => {
    const baseStatus = String(application?.status || "").trim().toLowerCase() || "pending";
    if (["accepted", "hired", "offer_sent"].includes(baseStatus)) {
      return baseStatus;
    }

    const processes = Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [];
    const hasAssessmentRound =
      Boolean(application?.jobId?.assessmentId) ||
      getAssessmentRoundOrderKeys(application?.jobId).length > 0 ||
      processes.some((process) => isAssessmentProcess(process));

    // Only show rejected from non-assessment stage if it was manually set (not auto-restored)
    const hasRejectedNonAssessmentStage = processes.some(
      (process) => !isAssessmentProcess(process) && isRejectedLikeStatus(process?.status)
    );
    if (hasRejectedNonAssessmentStage && baseStatus === "rejected" && !wasAutoRejectedFromStageStatus(application)) {
      return "rejected";
    }

    // If application was directly rejected by employer (not auto from stage status), show rejected
    if (baseStatus === "rejected" && !wasAutoRejectedFromStageStatus(application)) {
      return "rejected";
    }

    if (hasAssessmentRound) {
      const completionInfo = getAssessmentCompletionInfo(application);
      const assessmentWindowInfo = getAssessmentWindowInfo(application?.jobId, nowTimestamp);
      const assessmentNoShow =
        Boolean(completionInfo?.isNoShow) ||
        (Boolean(assessmentWindowInfo?.isAfterEnd) &&
          !completionInfo?.isCompleted &&
          !completionInfo?.isInProgress &&
          !completionInfo?.isSuspended);

      if (
        completionInfo?.isFailed ||
        completionInfo?.isSuspended ||
        assessmentNoShow ||
        isAssessmentOutcomeRejected({
          status: application?.assessmentStatus,
          result: application?.assessmentResult,
        })
      ) {
        return "rejected";
      }

      if (baseStatus === "rejected" && wasAutoRejectedFromStageStatus(application)) {
        return "pending";
      }
    }

    // If auto-rejected from stage status but stages are now pending, restore to pending
    if (baseStatus === "rejected" && wasAutoRejectedFromStageStatus(application)) {
      return "pending";
    }

    return baseStatus;
  };

  const applicationsWithDisplayStatus = useMemo(
    () =>
      applications.map((application) => ({
        ...application,
        displayStatus: getApplicationDisplayStatus(application, statusClock)
      })),
    [applications, statusClock]
  );

  const emailSuggestions = useMemo(() => {
    if (searchText.trim().length < 2) return [];
    const q = searchText.trim().toLowerCase();
    const emails = new Set();
    applications.forEach((app) => {
      const email = app.candidateId?.email;
      if (email && email.toLowerCase().includes(q)) emails.add(email);
    });
    return Array.from(emails).slice(0, 8);
  }, [applications, searchText]);

  // Derived filtering
  const filteredCompanies = useMemo(() => {
    if (!searchText || searchText.trim().length < 3) return [];
    const q = searchText.trim().toLowerCase();
    return companies.filter(company => 
      company && typeof company === "string" && company.toLowerCase().includes(q)
    );
  }, [companies, searchText]);

  useEffect(() => { setCurrentPage(1); }, [searchText, statusFilter, designationFilter]);

  const filteredApplications = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return applicationsWithDisplayStatus.filter((application) => {
      const email = application.candidateId?.email?.toLowerCase() || "";
      const matchesSearch = q ? email.includes(q) : true;
      const matchesStatus = statusFilter
        ? application.displayStatus === statusFilter
        : true;
      const matchesDesignation = designationFilter
        ? String(application.jobId?.title || "").trim().toLowerCase() === designationFilter.toLowerCase()
        : true;
      return matchesSearch && matchesStatus && matchesDesignation;
    });
  }, [applicationsWithDisplayStatus, searchText, statusFilter, designationFilter]);

  const jobTitleOptions = useMemo(() => {
    const titles = new Set();
    applications.forEach((application) => {
      const title = application.jobId?.title;
      if (title && String(title).trim() !== "") {
        titles.add(String(title).trim());
      }
    });
    return Array.from(titles).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const designationOptions = useMemo(
    () => [
      { value: "", label: "All Designation" },
      ...jobTitleOptions.map((title) => ({ value: title, label: title }))
    ],
    [jobTitleOptions]
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All Status " },
      { value: "pending", label: "Pending" },
      { value: "shortlisted", label: "Shortlisted" },
      { value: "offer_sent", label: "Offer Letter Sent" },
      { value: "accepted", label: "Offer Accepted" },
      { value: "rejected", label: "Rejected" }
    ],
    []
  );

  return (
    <div className="twm-right-section-panel site-bg-gray emp-candidates-page" style={{
      width: '100%',
      margin: 0,
      padding: 0,
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="employer-page-shell employer-page-shell--header">
        <div className="wt-admin-right-page-header clearfix employer-page-header-card" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="employer-page-title">
                {jobId && currentJob
                  ? `Applicants for ${currentJob.title}`
                  : "Applicants Details"}
              </h2>
              {jobId && currentJob && (
                <span className="employer-page-subtitle text-muted mt-2 d-block">{currentJob.location}</span>
              )}
            </div>
            {jobId && currentJob && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate("/employer/manage-jobs")}
              >
                <ArrowLeft size={16} className="me-1" /> Back to Jobs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="employer-page-shell employer-page-shell--content">
        <div className="panel panel-default site-bg-white p-3 employer-page-content-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
        <div className="panel-heading wt-panel-heading mb-3">
          <div>
            <h4 className="panel-tittle d-flex align-items-center m-0">
              <ListChecks
                size={18}
                style={{ color: "#f97316" }}
                className="me-2"
              />
              Job Applications
            </h4>
            <p className="text-muted mb-0 mt-1">
              Review and manage candidate applications
            </p>
          </div>
        </div>

        <div className="panel-body wt-panel-body">
          <div className="page-toolbar mb-3">
            <div className="emp-candidates-toolbar">
              <div className="page-toolbar__section" style={{ flex: '1 1 260px', minWidth: '200px' }}>
                <label className="page-toolbar__label">
                  <i className="fa fa-search"></i> Search Applicants
                </label>
                <div className="emp-candidates-search-control" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control page-toolbar__input emp-candidates-search-input"
                    placeholder="Search by email"
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setShowSuggestions(true); }}
                    style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', width: '100%' }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; setTimeout(() => {}, 150); }}
                    autoComplete="off"
                  />
                  {showSuggestions && emailSuggestions.length > 0 && (
                    <ul style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: 0, padding: 0,
                      listStyle: 'none', maxHeight: '220px', overflowY: 'auto'
                    }}>
                      {emailSuggestions.map((email) => (
                        <li
                          key={email}
                          onMouseDown={() => { setSearchText(email); setShowSuggestions(false); }}
                          style={{
                            padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                            borderBottom: '1px solid #f3f4f6'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f7ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        >
                          {email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
                <div className="emp-candidates-toolbar__filters">
                  {employerType === "consultant" && !jobId && (
                    <div className="page-toolbar__section" style={{ minWidth: '180px' }}>
                      <label className="page-toolbar__label">
                        <i className="fa fa-building"></i> Company
                      </label>
                      <select
                        className="form-select page-toolbar__select"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                      >
                        <option value="">All Companies</option>
                        {companies.map((company) => (
                          <option key={company} value={company}>{company.charAt(0).toUpperCase() + company.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="page-toolbar__section" style={{ minWidth: '180px' }}>
                    <label className="page-toolbar__label">
                      <i className="fa fa-briefcase"></i> Designation
                    </label>
                    <SearchableFilterDropdown
                      value={designationFilter}
                      options={designationOptions}
                      placeholder="All Designation"
                      searchPlaceholder="Search designation"
                      onChange={setDesignationFilter}
                    />
                  </div>
                  <div className="page-toolbar__section" style={{ minWidth: '180px' }}>
                    <label className="page-toolbar__label">
                      <i className="fa fa-filter"></i> Application Status
                    </label>
                    <SearchableFilterDropdown
                      value={statusFilter}
                      options={statusOptions}
                      placeholder="All Status "
                      searchPlaceholder="Search status"
                      onChange={setStatusFilter}
                    />
                  </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row emp-candidates-grid" style={{maxWidth: '1200px', margin: '0 auto'}}>
              {filteredApplications.length === 0 ? (
                <div className="col-12 text-center py-4">
                  <p className="text-muted">
                    {jobId && currentJob
                      ? `No applications received for ${currentJob.title} yet.`
                      : "No applications match your filters."}
                  </p>
                </div>
              ) : (
                filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((application) => (
                  <div className="col-lg-6 col-12" key={application._id}>
                    <div 
                      className="emp-candidates-card d-flex justify-content-between align-items-center p-3 border rounded mb-3 shadow-sm"
                      style={{cursor: "pointer"}}
                      onClick={() => navigate(`/employer/candidates-list/${application.jobId?._id}`)}
                    >
                      <div className="emp-candidates-card__body d-flex align-items-center gap-3" style={{flex: '1', minWidth: '0', marginRight: '1rem'}}>
                        <div
                          className="twm-media-pic rounded-circle overflow-hidden"
                          style={{ width: "50px", height: "50px", flexShrink: 0 }}
                        >
                          {application.candidateId?.profilePicture ? (
                            <img
                              src={application.candidateId.profilePicture}
                              alt={application.candidateId?.name || "Candidate"}
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                        </div>

                        <div className="emp-candidates-card__details" style={{minWidth: '0', flex: 1}}>
                          <h5 className="mb-1" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {application.candidateId?.name || "Unknown"}
                          </h5>
                          <p className="mb-0 text-muted" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {application.candidateId?.email || "No email"}
                          </p>
                          <small className="text-muted">
                            Applied for {application.jobId?.title || "Unknown Job"}
                          </small>{" "}
                          <br />
                          {application.jobId?.companyName && (
                            <>
                              <small
                                className="text-muted d-block"
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                Company: {application.jobId.companyName}
                              </small>
                            </>
                          )}
                          <small className="text-muted">
                            Submitted {formatDate(application.createdAt)}
                          </small>{" "}
                          <br />
                          <span
                            className={`badge ${getStatusBadge(
                              application.displayStatus
                            )} text-capitalize`}
                          >
                            {application.displayStatus === 'offer_sent' ? 'Offer Letter Sent' :
                             application.displayStatus === 'accepted' ? 'Offer Accepted' :
                             application.displayStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="emp-candidates-card__action" style={{flexShrink: 0}}>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employer/emp-candidate-review/${application._id}`);
                          }}
                          style={{whiteSpace: 'nowrap'}}
                        >
                          <i className="fa fa-eye me-1" style={{ color: '#000000' }}></i> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {!loading && filteredApplications.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
              <div style={{ color: "#6c757d", fontSize: "13px" }}>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredApplications.length)} of {filteredApplications.length} applicant{filteredApplications.length !== 1 ? "s" : ""}
              </div>
              {Math.ceil(filteredApplications.length / PAGE_SIZE) > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
                  {Array.from({ length: Math.ceil(filteredApplications.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "#f8f9fa" : "#fff", color: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "#adb5bd" : "#495057", cursor: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default EmpCandidatesPage;
