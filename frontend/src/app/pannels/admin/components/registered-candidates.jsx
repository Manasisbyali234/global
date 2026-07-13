import { useState, useEffect, useRef } from 'react';
import { formatDate } from '../../../../utils/dateFormatter';
import { api } from '../../../../utils/api';
import { useNavigate } from 'react-router-dom';
import './registered-candidates-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';

function RegisteredCandidatesPage() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const [shortlistedApplications, setShortlistedApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileStatusFilter, setProfileStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;
    const modalRef = useRef(null);
    const isFiltered = searchTerm || profileStatusFilter;

    useEffect(() => {
        fetchShortlisted();
    }, []);

    useEffect(() => {
        if (!isFiltered) {
            fetchCandidates(currentPage);
        }
    }, [currentPage]);

    useEffect(() => {
        if (isFiltered) {
            // When filters are active, fetch all to search client-side
            fetchAllCandidates();
        } else {
            fetchCandidates(currentPage);
        }
    }, [searchTerm, profileStatusFilter]);

    const fetchShortlisted = async () => {
        try {
            const res = await api.getShortlistedApplications();
            if (res.success) setShortlistedApplications(res.data);
        } catch (err) {}
    };

    const fetchCandidates = async (page) => {
        try {
            setLoading(true);
            const res = await api.getRegisteredCandidates({ page, limit: PAGE_SIZE });
            if (res.success) {
                setCandidates(res.data);
                setFilteredCandidates(res.data);
                setTotalCandidates(res.total || res.data.length);
            }
        } catch (err) {}
        finally { setLoading(false); }
    };

    const fetchAllCandidates = async () => {
        try {
            setLoading(true);
            const res = await api.getRegisteredCandidates({ page: 1, limit: 10000 });
            if (res.success) {
                const all = res.data;
                const normalizedSearch = searchTerm.trim().toLowerCase();
                const filtered = all.filter((candidate) => {
                    const matchesSearch = !normalizedSearch || (
                        candidate.name?.toLowerCase().includes(normalizedSearch) ||
                        candidate.email?.toLowerCase().includes(normalizedSearch) ||
                        candidate.phone?.includes(searchTerm) ||
                        candidate.profile?.location?.toLowerCase().includes(normalizedSearch) ||
                        candidate.profile?.skills?.some((skill) =>
                            skill.toLowerCase().includes(normalizedSearch)
                        )
                    );
                    const matchesProfileStatus = !profileStatusFilter || (
                        profileStatusFilter === 'completed'
                            ? candidate.isProfileComplete
                            : !candidate.isProfileComplete
                    );
                    return matchesSearch && matchesProfileStatus;
                });
                setCandidates(all);
                setFilteredCandidates(filtered);
                setTotalCandidates(res.total || res.data.length);
            }
        } catch (err) {}
        finally { setLoading(false); }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getCandidateShortlistInfo = (candidateId) => {
        const applications = shortlistedApplications.filter(
            app => app.candidateId?._id === candidateId || app.candidateId === candidateId
        );
        if (applications.length === 0) {
            return { status: 'Not Shortlisted', round: '-', selected: '-' };
        }
        const latestApp = applications[applications.length - 1];
        return {
            status: 'Shortlisted',
            round: latestApp.currentRound || 'Round 1',
            selected: latestApp.finalStatus === 'selected' ? 'Yes' :
                     latestApp.finalStatus === 'rejected' ? 'No' : 'Pending'
        };
    };

    const viewCandidateDetails = (candidate) => {
        setSelectedCandidate(candidate);
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
    };

    // Pagination logic
    const displayTotal = isFiltered ? filteredCandidates.length : totalCandidates;
    const totalPages = Math.ceil(displayTotal / PAGE_SIZE);
    const pagedCandidates = isFiltered
        ? filteredCandidates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        : filteredCandidates;
    const showStart = displayTotal === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const showEnd = Math.min(currentPage * PAGE_SIZE, displayTotal);

    if (loading) {
        return (
            <div className="dashboard-content">
                <PageLoader pageName="Registered Candidates" />
            </div>
        );
    }

    return (
        <div className="dashboard-content registered-candidates-container">
            {/* Header Section */}
            <div className="candidates-header" data-aos="fade-down">
                <h2>
                    Registered Candidates Management
                </h2>
                <p className="candidates-subtitle">
                    <i className=""></i>
                    Manage and monitor all registered candidates in the system
                </p>
            </div>

            {/* Candidate Details Modal */}
            <div className="modal fade" id="candidateDetailsModal" tabIndex={-1} aria-hidden="true" ref={modalRef}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Candidate Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedCandidate ? (
                                <div className="container-fluid">
                                    <div className="row mb-2">
                                        <div className="col-6"><strong>Name:</strong> {selectedCandidate.name}</div>
                                        <div className="col-6"><strong>Email:</strong> {selectedCandidate.email}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6"><strong>Phone:</strong> {selectedCandidate.phone || 'Not provided'}</div>
                                        <div className="col-6"><strong>Profile:</strong> {selectedCandidate.isProfileComplete ? 'Completed' : `Incomplete (${selectedCandidate.profileCompletionPercentage || 0}%)`}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6"><strong>Total Applications:</strong> {selectedCandidate.totalApplications || 0}</div>
                                        <div className="col-6"><strong>Location:</strong> {selectedCandidate.profile?.location || 'Not specified'}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-12"><strong>Skills:</strong> {selectedCandidate.profile?.skills?.length ? selectedCandidate.profile.skills.join(', ') : 'No skills listed'}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6"><strong>Shortlisted Status:</strong> {getCandidateShortlistInfo(selectedCandidate._id).status}</div>
                                        <div className="col-6"><strong>Current Round:</strong> {getCandidateShortlistInfo(selectedCandidate._id).round}</div>
                                    </div>
                                    {selectedCandidate.profile?.summary && (
                                        <div className="row mb-2">
                                            <div className="col-12"><strong>Summary:</strong> {selectedCandidate.profile.summary}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>Loading...</div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="site-button" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="candidates-table-container" data-aos="fade-up" data-aos-delay="200">
                <div className="candidates-table-header">
                    <div className="page-toolbar">
                        <h4 className="page-toolbar__title">
                            <i className="fa fa-list-alt"></i>
                            All Registered Candidates ({isFiltered ? filteredCandidates.length : totalCandidates})
                        </h4>
                        <div className="candidates-filters page-toolbar__controls page-toolbar__controls--dual">
                            <div className="search-section page-toolbar__section">
                                <label className="search-label page-toolbar__label">
                                    <i className="fa fa-filter"></i> Search by Name or Email
                                </label>
                                <div className="page-toolbar__control-wrap">
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search candidates by name, email, phone, location, or skills..."
                                    className="candidates-search"
                                />
                                </div>
                            </div>
                            <div className="search-section profile-status-filter-section page-toolbar__section">
                                <label className="search-label page-toolbar__label">
                                    <i className="fa fa-id-card"></i> Profile Status
                                </label>
                                <select
                                    className="profile-status-filter page-toolbar__select"
                                    value={profileStatusFilter}
                                    onChange={(event) => { setProfileStatusFilter(event.target.value); setCurrentPage(1); }}
                                >
                                    <option value="">All status</option>
                                    <option value="completed">Completed</option>
                                    <option value="incomplete">Incomplete</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {pagedCandidates.length === 0 ? (
                        <div className="empty-state" data-aos="fade-in">
                            <i className="fa fa-users"></i>
                            <h3>No Registered Candidates</h3>
                            <p>No candidates have registered yet.</p>
                        </div>
                    ) : (
                        <div className="candidates-table-responsive">
                            <table className="table candidates-table">
                                <thead>
                                    <tr>
                                        <th><i className="fa fa-user"></i> Name</th>
                                        <th><i className="fa fa-envelope"></i> Email</th>
                                        <th><i className="fa fa-phone"></i> Phone</th>
                                        <th><i className="fa fa-file-text"></i> Total Application</th>
                                        <th><i className="fa fa-id-card"></i> Profile Status</th>
                                        <th><i className="fa fa-map-marker-alt"></i> Location</th>
                                        <th><i className="fa fa-calendar"></i> Registered Date</th>
                                        <th><i className="fa fa-cogs"></i> Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedCandidates.map((candidate) => {
                                        const shortlistInfo = getCandidateShortlistInfo(candidate._id);
                                        return (
                                            <tr key={candidate._id}>
                                                <td>
                                                    <span className="candidate-name">
                                                        {candidate.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="candidate-email">
                                                        {candidate.email}
                                                    </span>
                                                </td>
                                                <td>
                                                    {candidate.phone || 'Not provided'}
                                                </td>
                                                <td>
                                                    <span className="status-badge badge-total-apps">
                                                        {candidate.totalApplications || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${
                                                        candidate.isProfileComplete ? 'badge-completed' : 'badge-incomplete'
                                                    }`}>
                                                        <i className={`fa ${
                                                            candidate.isProfileComplete ? 'fa-check' : 'fa-exclamation-triangle'
                                                        } me-1`}></i>
                                                        {candidate.isProfileComplete ? 'Completed' : `Incomplete (${candidate.profileCompletionPercentage || 0}%)`}
                                                    </span>
                                                </td>
                                                <td>
                                                    {candidate.profile?.location || 'Not specified'}
                                                </td>
                                                <td>
                                                    {formatDate(candidate.createdAt)}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="action-btn btn-view"
                                                        onClick={() => navigate(`/admin/candidate-review/${candidate._id}`)}
                                                        title="View Details"
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
                        <div style={{ color: "#6c757d", fontSize: "13px" }}>
                            Showing {showStart}–{showEnd} of {displayTotal} candidate{displayTotal !== 1 ? "s" : ""}
                        </div>
                        {totalPages > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => handlePageChange(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
                                ))}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === totalPages ? "#f8f9fa" : "#fff", color: currentPage === totalPages ? "#adb5bd" : "#495057", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisteredCandidatesPage;
