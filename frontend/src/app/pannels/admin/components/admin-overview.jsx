import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api";
import { formatDate } from "../../../../utils/dateFormatter";
import "./admin-overview.css";

function AdminOverviewPage() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  useEffect(() => {
    fetchOverview();
  }, []);

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
      return;
    }

    try {
      setJobsLoading(true);
      setJobsError("");
      const response = await api.getAdminEmployerOverviewJobs(employer.employerId);
      if (response.success) {
        setSelectedEmployer(response.employer);
        setEmployerJobs(response.data || []);
      } else {
        setJobsError(response.message || "Failed to load employer jobs");
      }
    } catch (err) {
      setJobsError(err.message || "Failed to load employer jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <div className="admin-overview-page">
      <div className="admin-overview-header">
        <div>
          <h2>
            <i className="fa fa-table me-2" />
            Employer Overview
          </h2>
          <p>All employer name, number of jobs, and number of applicants.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/admin/dashboard")}>
          <i className="fa fa-arrow-left me-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="panel panel-default site-bg-white">
        <div className="panel-body wt-panel-body p-a20">
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
                  {employers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No employer records found.
                      </td>
                    </tr>
                  ) : (
                    employers.map((employer) => (
                      <tr key={employer.employerId}>
                        <td>{employer.employerName}</td>
                        <td>{employer.jobsCount}</td>
                        <td>{employer.applicationsCount}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewEmployerJobs(employer)}
                          >
                            <i className="fa fa-eye me-1" />
                            {selectedEmployer?.employerId === employer.employerId ? "Hide" : "View"}
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

      {selectedEmployer && (
        <div className="panel panel-default site-bg-white m-t20">
          <div className="panel-heading wt-panel-heading p-a20">
            <h4 className="panel-tittle m-a0">
              <i className="fa fa-briefcase me-2" />
              Jobs posted by {selectedEmployer.employerName}
            </h4>
          </div>
          <div className="panel-body wt-panel-body p-a20">
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
                    </tr>
                  </thead>
                  <tbody>
                    {employerJobs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No jobs found for this employer.
                        </td>
                      </tr>
                    ) : (
                      employerJobs.map((job) => (
                        <tr key={job.jobId}>
                          <td>{job.title}</td>
                          <td>{job.applicationsCount}</td>
                          <td>{job.status}</td>
                          <td>{formatDate(job.createdAt)}</td>
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
