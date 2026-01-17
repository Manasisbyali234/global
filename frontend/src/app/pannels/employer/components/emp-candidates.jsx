import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import JobZImage from "../../../common/jobz-img";
import { ArrowLeft, ListChecks, Eye, Search } from "lucide-react";
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
      if (employerType === "consultant") {
        fetchConsultantCompanies();
      } else {
        // For regular companies, fetch all unique company names from their jobs
        fetchConsultantCompanies(); // This will get company names from jobs
      }
    }
  }, [employerType, jobId]);

  useEffect(() => {
    fetchApplications();
  }, [selectedCompany, jobId]);

  const fetchEmployerType = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      const response = await fetch("http://localhost:5000/api/employer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.profile?.employerId) {
        setEmployerType(data.profile.employerId.employerType || "company");
      }
    } catch (error) {
      
    }
  };

  const fetchConsultantCompanies = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      const response = await fetch(
        "http://localhost:5000/api/employer/consultant/companies",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCompanies(data.companies || []);
      }
    } catch (error) {
      
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      if (!token) {
        console.error('No employer token found');
        setLoading(false);
        return;
      }

      let url;
      if (jobId) {
        // Fetch applications for specific job
        url = `http://localhost:5000/api/employer/jobs/${jobId}/applications`;
      } else {
        // Fetch all applications
        url = "http://localhost:5000/api/employer/applications";
        if (selectedCompany && selectedCompany.trim() !== "") {
          url += `?companyName=${encodeURIComponent(selectedCompany)}`;
        }
      }

      console.log('Fetching applications from:', url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Applications data:', data);
        setApplications(data.applications || []);
        if (data.job) {
          setCurrentJob(data.job);
        }
      } else {
        console.error('Failed to fetch applications:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
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
      case "rejected":
        return "twm-bg-red";
      default:
        return "twm-bg-light-blue";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Derived filtering
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
        ? application.candidateId?.gender?.toLowerCase() === genderFilter.toLowerCase()
        : true;
      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [applications, searchText, statusFilter, genderFilter]);

  return (
    <div className="twm-right-section-panel site-bg-gray emp-candidates-page" style={{
      width: '100%',
      margin: 0,
      padding: 0,
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
        <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h2>
            {jobId && currentJob
              ? `Applicants for ${currentJob.title}`
              : "Applicants Details"}
          </h2>
          {jobId && currentJob && (
            <div className="d-flex align-items-center gap-2 mt-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate("/employer/manage-jobs")}
              >
                <ArrowLeft size={16} className="me-1" /> Back to Jobs
              </button>
              <span className="text-muted">| {currentJob.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        <div className="panel panel-default site-bg-white p-3" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
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
          <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="input-group" style={{ maxWidth: 360 }}>
              <span className="input-group-text bg-white">
                <Search size={16} style={{ color: "#f97316" }} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search applicants by name, email, or job"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="">All Status (Show All)</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="form-select"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
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
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded mb-3 shadow-sm">
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
                            {application.status}
                          </span>
                        </div>
                      </div>

                      <div style={{flexShrink: 0}}>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate(
                              `/employer/emp-candidate-review/${application._id}`
                            )
                          }
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
