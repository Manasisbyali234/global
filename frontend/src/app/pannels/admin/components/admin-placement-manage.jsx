import { useState, useEffect } from 'react';
import { formatDate } from '../../../../utils/dateFormatter';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import './button-override.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import PlacementNavigationButtons from './PlacementNavigationButtons';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminPlacementOfficersAllRequest() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const allPlacements = response.data || [];
                setPlacements(allPlacements);
                applyFilters(allPlacements, statusFilter);
            } else {
                setError(response.message || 'Failed to fetch Placement Dean');
            }
        } catch (error) {
            setError('Error fetching Placement Dean: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (placementList, status) => {
        let filtered = placementList;
        
        if (status !== 'all') {
            if (status === 'pending') {
                filtered = placementList.filter(p => p.status === 'pending' || (!p.status && !p.isApproved));
            } else if (status === 'approved') {
                filtered = placementList.filter(p => p.status === 'approved' || p.status === 'active' || p.isApproved);
            } else if (status === 'rejected') {
                filtered = placementList.filter(p => p.status === 'rejected');
            }
        }
        
        setFilteredPlacements(filtered);
    };

    const handleSearch = (searchTerm) => {
        setCurrentPage(1);
        let baseList = placements;
        
        if (statusFilter !== 'all') {
            if (statusFilter === 'pending') {
                baseList = placements.filter(p => p.status === 'pending' || (!p.status && !p.isApproved));
            } else if (statusFilter === 'approved') {
                baseList = placements.filter(p => p.status === 'approved' || p.status === 'active' || p.isApproved);
            } else if (statusFilter === 'rejected') {
                baseList = placements.filter(p => p.status === 'rejected');
            }
        }
        
        if (!searchTerm.trim()) {
            setFilteredPlacements(baseList);
            return;
        }
        
        const filtered = baseList.filter(placement => 
            placement.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.phone?.includes(searchTerm)
        );
        setFilteredPlacements(filtered);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
        applyFilters(placements, status);
    };

    const handleApprove = async (placementId) => {
        if (processingId === placementId) return;
        
        setProcessingId(placementId);
        try {
            const response = await api.updatePlacementStatus(placementId, 'approved');
            if (response.success) {
                const updatedPlacements = placements.filter(placement => placement._id !== placementId);
                setPlacements(updatedPlacements);
                applyFilters(updatedPlacements, statusFilter);
                showSuccess('Placement Dean approved successfully! Approval email sent. Once approved, you cannot reject or retake this action.');
            } else {
                showError('Failed to approve Placement Dean');
            }
        } catch (error) {
            showError('Error approving Placement Dean');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (placementId) => {
        if (processingId === placementId) return;
        
        setProcessingId(placementId);
        try {
            const response = await api.updatePlacementStatus(placementId, 'rejected');
            if (response.success) {
                const updatedPlacements = placements.filter(placement => placement._id !== placementId);
                setPlacements(updatedPlacements);
                applyFilters(updatedPlacements, statusFilter);
                showSuccess('Placement Dean rejected successfully! Once rejected, you cannot approve or retake this action.');
            } else {
                showError('Failed to reject Placement Dean');
            }
        } catch (error) {
            showError('Error rejecting Placement Dean');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="admin-emp-manage-container">
                <PageLoader pageName="Placement Dean" />
            </div>
        );
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header">
                <h2>Placement Dean Management</h2>
                <p>Manage and review Placement Dean applications</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="page-toolbar">
                        <h4 className="panel-tittle m-a0 page-toolbar__title">Placement Dean ({filteredPlacements.length})</h4>
                        <div className="page-toolbar__controls page-toolbar__controls--dual">
                        <div className="search-section page-toolbar__section">
                            <label className="page-toolbar__label"><i className="fa fa-filter"></i> Filter by Status</label>
                            <div className="page-toolbar__control-wrap">
                            <select 
                                className="page-toolbar__select"
                                value={statusFilter} 
                                onChange={(e) => handleStatusFilter(e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            </div>
                        </div>
                        
                        <div className="search-section page-toolbar__section">
                            <label className="search-label page-toolbar__label">
                                <i className="fa fa-filter"></i> Search by Name or Email
                            </label>
                            <div className="page-toolbar__control-wrap">
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search Placement Dean..."
                                    className="placement-search"
                                />
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="panel-body wt-panel-body">
                    {error && (
                        <div className="alert alert-danger m-b20">{error}</div>
                    )}
                    <div className="p-a20 table-responsive table-container">
                        <table className="table emp-table">
                            <thead>
                                <tr>
                                    <th>College Name</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-graduation-cap" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No Placement Dean found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center', fontSize: '0.9rem'}}>{placement.collegeName || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="company-name">
                                                    {placement.name}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{placement.email}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{placement.phone || 'N/A'}</td>
                                            <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDate(placement.createdAt)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge status-pending">
                                                    {placement.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <div className="action-buttons" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', padding: '6px 4px'}}>
                                                    {(placement.status === 'pending' || (!placement.status && !placement.isApproved)) && (
                                                        <>
                                                            <button
                                                                className="placement-action-btn btn-approve"
                                                                disabled={processingId === placement._id}
                                                                onClick={() => handleApprove(placement._id)}
                                                            >
                                                                {processingId === placement._id ? (
                                                                    <><i className="fa fa-spinner fa-spin"></i> Wait...</>
                                                                ) : (
                                                                    <><i className="fa fa-check"></i> Approve</>
                                                                )}
                                                            </button>
                                                            <button
                                                                className="placement-action-btn btn-reject"
                                                                disabled={processingId === placement._id}
                                                                onClick={() => handleReject(placement._id)}
                                                            >
                                                                {processingId === placement._id ? (
                                                                    <><i className="fa fa-spinner fa-spin"></i> Wait...</>
                                                                ) : (
                                                                    <><i className="fa fa-times"></i> Reject</>
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="placement-action-btn btn-view"
                                                        onClick={() => navigate(`/manage/xK9mP2/placement-details/${placement._id}`)}
                                                    >
                                                        <i className="fa fa-eye"></i> View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
                        <div style={{ color: "#6c757d", fontSize: "13px" }}>
                            Showing {filteredPlacements.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredPlacements.length)} of {filteredPlacements.length} record{filteredPlacements.length !== 1 ? "s" : ""}
                        </div>
                        {Math.ceil(filteredPlacements.length / PAGE_SIZE) > 1 && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
                                {Array.from({ length: Math.ceil(filteredPlacements.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
                                ))}
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredPlacements.length / PAGE_SIZE)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === Math.ceil(filteredPlacements.length / PAGE_SIZE) ? "#f8f9fa" : "#fff", color: currentPage === Math.ceil(filteredPlacements.length / PAGE_SIZE) ? "#adb5bd" : "#495057", cursor: currentPage === Math.ceil(filteredPlacements.length / PAGE_SIZE) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPlacementOfficersAllRequest;
