import { useEffect, useState } from "react";
import { api } from "../../../../utils/api";
import { formatDate } from "../../../../utils/dateFormatter";

function AdminJobsPostedPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getAdminJobsPosted();
      if (response.success) {
        setJobs(response.data || []);
      } else {
        setError(response.message || "Failed to load jobs");
      }
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const formatEmployerType = (type) =>
    String(type || "").toLowerCase() === "consultant" ? "Consultancy" : "Company";

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const style = {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
    };
    if (s === "active") return <span style={{ ...style, background: "#e7f7ee", color: "#146c43", border: "1px solid #8fd19e" }}>Active</span>;
    if (s === "closed") return <span style={{ ...style, background: "#fde8e8", color: "#b91c1c", border: "1px solid #fca5a5" }}>Closed</span>;
    return <span style={{ ...style, background: "#f1f3f5", color: "#495057", border: "1px solid #ced4da" }}>{status}</span>;
  };

  const filtered = jobs.filter(job => {
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || String(job.employerType || "").toLowerCase() === typeFilter;
    const matchStatus = statusFilter === "all" || String(job.status || "").toLowerCase() === statusFilter;
    if (fromDate || toDate) {
      const posted = job.postedDate ? new Date(job.postedDate) : null;
      if (!posted) return false;
      if (fromDate && posted < new Date(fromDate)) return false;
      if (toDate) {
        const toEnd = new Date(toDate);
        toEnd.setHours(23, 59, 59, 999);
        if (posted > toEnd) return false;
      }
    }
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="admin-overview-page">
      <div className="admin-overview-header">
        <div>
          <h2>
            <i className="fa fa-briefcase me-2" style={{ color: "orange" }} />
            Jobs Posted
          </h2>
          <p>View all jobs posted by employers — company type, posted date, last application date, offer letter sent date, and status.</p>
        </div>
      </div>

      <div className="panel panel-default site-bg-white">
        <div className="panel-body wt-panel-body p-a20">
          <div className="admin-overview-filter-grid m-b20" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div className="admin-overview-filter-control" style={{ flex: "1 1 200px" }}>
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-search me-2 text-primary" />Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by job title or company..."
                value={search}
                onChange={handleFilterChange(setSearch)}
              />
            </div>
            <div className="admin-overview-filter-control" style={{ flex: "1 1 160px" }}>
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-building me-2 text-primary" />Company Type
              </label>
              <select className="form-control" value={typeFilter} onChange={handleFilterChange(setTypeFilter)}>
                <option value="all">All Types</option>
                <option value="company">Company</option>
                <option value="consultant">Consultancy</option>
              </select>
            </div>
            <div className="admin-overview-filter-control" style={{ flex: "1 1 160px" }}>
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-list-alt me-2 text-primary" />Status
              </label>
              <select className="form-control" value={statusFilter} onChange={handleFilterChange(setStatusFilter)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="admin-overview-filter-control" style={{ flex: "1 1 150px" }}>
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-calendar me-2 text-primary" />From Date
              </label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                max={toDate || undefined}
                onChange={handleFilterChange(setFromDate)}
              />
            </div>
            <div className="admin-overview-filter-control" style={{ flex: "1 1 150px" }}>
              <label className="d-block m-b10" style={{ fontWeight: 600, color: "#232323" }}>
                <i className="fa fa-calendar me-2 text-primary" />To Date
              </label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                min={fromDate || undefined}
                onChange={handleFilterChange(setToDate)}
              />
            </div>
          </div>

          {loading && <div className="text-center p-a20">Loading jobs...</div>}
          {!loading && error && <div className="alert alert-danger m-b0">{error}</div>}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Posted Date</th>
                    <th>Job Title</th>
                    <th>Company Name</th>
                    <th>Company Type</th>
                    <th>Last Application Date</th>
                    <th>Offer Letter Sent Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {search || typeFilter !== "all" || statusFilter !== "all" || fromDate || toDate
                          ? "No jobs match your filters."
                          : "No jobs found."}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((job, index) => (
                      <tr key={job.jobId}>
                        <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                        <td>{job.postedDate ? formatDate(job.postedDate) : "N/A"}</td>
                        <td>{job.title}</td>
                        <td>{job.companyName}</td>
                        <td>{formatEmployerType(job.employerType)}</td>
                        <td>{job.lastDateOfApplication ? formatDate(job.lastDateOfApplication) : "N/A"}</td>
                        <td>{job.offerLetterDate ? formatDate(job.offerLetterDate) : "N/A"}</td>
                        <td>{getStatusBadge(job.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
                <div style={{ color: "#6c757d", fontSize: "13px" }}>
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} job{filtered.length !== 1 ? "s" : ""}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={currentPage === 1}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "34px", height: "34px", borderRadius: "6px",
                        border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff",
                        color: currentPage === 1 ? "#adb5bd" : "#495057",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        fontSize: "13px", fontWeight: 600, lineHeight: 1
                      }}
                    >
                      &#8249;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "34px", height: "34px", borderRadius: "6px",
                          border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6",
                          background: page === currentPage ? "#ff8c00" : "#fff",
                          color: page === currentPage ? "#fff" : "#495057",
                          fontWeight: page === currentPage ? 700 : 400,
                          cursor: "pointer", fontSize: "13px", lineHeight: 1
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "34px", height: "34px", borderRadius: "6px",
                        border: "1px solid #dee2e6", background: currentPage === totalPages ? "#f8f9fa" : "#fff",
                        color: currentPage === totalPages ? "#adb5bd" : "#495057",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        fontSize: "13px", fontWeight: 600, lineHeight: 1
                      }}
                    >
                      &#8250;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminJobsPostedPage;
