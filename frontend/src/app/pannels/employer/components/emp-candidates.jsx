import { useEffect, useState, useMemo } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import JobZImage from "../../../common/jobz-img";
import { ArrowLeft, ListChecks, Eye, Search } from "lucide-react";
import { api } from "../../../../utils/api";
import './emp-candidates.css';

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
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    loadScript("js/custom.js");
    fetchEmployerType();
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!jobId) {
      // Only fetch companies when not viewing specific job
      fetchConsultantCompanies();
    }
  }, [employerType, jobId]);

  useEffect(() => {
    fetchApplications();
  }, [selectedCompany, jobId]);

  const fetchEmployerType = async () => {
    try {
      const data = await api.getEmployerProfile();
      if (data.success && data.profile?.employerId) {
        setEmployerType(data.profile.employerId.employerType || "company");
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

  const normalizeGender = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, " ");



  // Derived filtering
  const filteredCompanies = useMemo(() => {
    if (!searchText || searchText.trim().length < 3) return [];
    const q = searchText.trim().toLowerCase();
    return companies.filter(company => 
      company && typeof company === "string" && company.toLowerCase().includes(q)
    );
  }, [companies, searchText]);

  const filteredApplications = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return applications.filter((application) => {
      const name = application.candidateId?.name?.toLowerCase() || "";
      const email = application.candidateId?.email?.toLowerCase() || "";
      const title = application.jobId?.title?.toLowerCase() || "";
      const matchesSearch = q
        ? name.includes(q) || email.includes(q) || title.includes(q)
        : true;
      const matchesStatus = statusFilter
        ? application.status === statusFilter
        : true;
      const matchesGender = genderFilter
        ? normalizeGender(application.candidateId?.gender) === normalizeGender(genderFilter)
        : true;
      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [applications, searchText, statusFilter, genderFilter]);

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
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
              <div className="page-toolbar__section" style={{ flex: '1 1 260px', minWidth: '200px' }}>
                <label className="page-toolbar__label">
                  <i className="fa fa-search"></i> Search Applicants
                </label>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                    <Search size={18} style={{ color: '#e66814' }} />
                  </div>
                  <input
                    type="text"
                    className="form-control page-toolbar__input"
                    placeholder="Search applicants by name, email, or job"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    list="candidate-job-title-suggestions"
                    style={{ paddingLeft: '40px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', width: '100%' }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <datalist id="candidate-job-title-suggestions">
                    {jobTitleOptions.map((title) => (
                      <option key={title} value={title} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="page-toolbar__section" style={{ minWidth: '180px' }}>
                  <label className="page-toolbar__label">
                    <i className="fa fa-filter"></i> Application Status
                  </label>
                  <select
                    className="form-select page-toolbar__select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status (Show All)</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offer_sent">Offer Letter Sent</option>
                    <option value="accepted">Offer Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="page-toolbar__section" style={{ minWidth: '150px' }}>
                  <label className="page-toolbar__label">
                    <i className="fa fa-user"></i> Gender
                  </label>
                  <select
                    className="form-select page-toolbar__select"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                  >
                    <option value="">All Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
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
            <div className="row" style={{maxWidth: '1200px', margin: '0 auto'}}>
              {filteredApplications.length === 0 ? (
                <div className="col-12 text-center py-4">
                  <p className="text-muted">
                    {jobId && currentJob
                      ? `No applications received for ${currentJob.title} yet.`
                      : "No applications match your filters."}
                  </p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div className="col-lg-6 col-12" key={application._id}>
                    <div 
                      className="d-flex justify-content-between align-items-center p-3 border rounded mb-3 shadow-sm"
                      style={{cursor: "pointer"}}
                      onClick={() => navigate(`/employer/candidates-list/${application.jobId?._id}`)}
                    >
                      <div className="d-flex align-items-center gap-3" style={{flex: '1', minWidth: '0', marginRight: '1rem'}}>
                        <div
                          className="twm-media-pic rounded-circle overflow-hidden"
                          style={{ width: "50px", height: "50px", flexShrink: 0 }}
                        >
                          {application.candidateId?.profilePicture ? (
                            <img
                              src={application.candidateId.profilePicture}
                              alt={
                                application.candidateId?.name || "Candidate"
                              }
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <JobZImage
                              src="images/candidates/pic1.jpg"
                              alt={
                                application.candidateId?.name || "Candidate"
                              }
                            />
                          )}
                        </div>

                        <div style={{minWidth: '0', flex: 1}}>
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
                          <small className="text-muted">
                            Submitted {formatDate(application.createdAt)}
                          </small>{" "}
                          <br />
                          <span
                            className={`badge ${getStatusBadge(
                              application.status
                            )} text-capitalize`}
                          >
                            {application.status === 'offer_sent' ? 'Offer Letter Sent' :
                             application.status === 'accepted' ? 'Offer Accepted' :
                             application.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div style={{flexShrink: 0}}>
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
        </div>
        </div>
      </div>
    </div>
  );
}

export default EmpCandidatesPage;
