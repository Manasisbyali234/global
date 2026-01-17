import { useState, useEffect, useRef } from 'react';
import { api } from '../../../../utils/api';
import { useNavigate } from 'react-router-dom';
import './registered-candidates-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';

function RegisteredCandidatesPage() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [shortlistedApplications, setShortlistedApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [candidatesResponse, shortlistedResponse] = await Promise.all([
                api.getRegisteredCandidates(),
                api.getShortlistedApplications()
            ]);
            
            if (candidatesResponse.success) {
                setCandidates(candidatesResponse.data);
                setFilteredCandidates(candidatesResponse.data);
            }
            if (shortlistedResponse.success) {
                setShortlistedApplications(shortlistedResponse.data);
            }
        } catch (err) {
            
        } finally {
            setLoading(false);
        }
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

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredCandidates(candidates);
            return;
        }
        
        const filtered = candidates.filter(candidate => 
            candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.phone?.includes(searchTerm) ||
            candidate.profile?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.profile?.skills?.some(skill => 
                skill.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredCandidates(filtered);
    };

    const viewCandidateDetails = (candidate) => {
        setSelectedCandidate(candidate);
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
    };

    if (loading) {
        return (
            <div className="dashboard-content">

                <div className="text-center">Loading...</div>
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
                                        <div className="col-6"><strong>Total Paid:</strong> ₹{selectedCandidate.totalPaidAmount || 0}</div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6"><strong>Location:</strong> {selectedCandidate.profile?.location || 'Not specified'}</div>
                                        <div className="col-6"><strong>Registered:</strong> {new Date(selectedCandidate.createdAt).toLocaleString()}</div>
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
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
                        <h4>
                            <i className="fa fa-list-alt"></i>
                            All Registered Candidates ({filteredCandidates.length})
                        </h4>
                        <div className="search-section">
                            <label className="search-label">
                                <i className="fa fa-filter"></i> Search by Name or Email
                            </label>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search candidates by name, email, phone, location, or skills..."
                                className="candidates-search"
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {filteredCandidates.length === 0 ? (
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
                                        <th><i className="fa fa-money"></i> Total Paid</th>
                                        <th><i className="fa fa-id-card"></i> Profile Status</th>
                                        <th><i className="fa fa-map-marker-alt"></i> Location</th>
                                        <th><i className="fa fa-calendar"></i> Registered Date</th>
                                        <th><i className="fa fa-cogs"></i> Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.map((candidate, index) => {
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
                                                    <span className="status-badge badge-total-paid">
                                                        ₹{candidate.totalPaidAmount || 0}
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
                                                    {new Date(candidate.createdAt).toLocaleDateString()}
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
                </div>
            </div>
        </div>
    );
}

export default RegisteredCandidatesPage;
