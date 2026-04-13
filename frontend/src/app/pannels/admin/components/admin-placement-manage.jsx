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
                setError(response.message || 'Failed to fetch Placement Deans');
            }
        } catch (error) {
            setError('Error fetching Placement Deans: ' + error.message);
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
            <div className="dashboard-content">
                <PageLoader pageName="Placement Deans" />
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Placement Deans Management</h2>
                <p>Manage and review Placement Dean applications</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="page-toolbar">
                        <h4 className="panel-tittle m-a0 page-toolbar__title">Placement Deans ({filteredPlacements.length})</h4>
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
                                    placeholder="Search Placement Deans..."
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
                                            No Placement Deans found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.map((placement) => (
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
                                                <div style={{display: 'flex', justifyContent: 'center', gap: '4px'}}>
                                                    {(placement.status === 'pending' || (!placement.status && !placement.isApproved)) && (
                                                        <>
                                                            <button
                                                                disabled={processingId === placement._id}
                                                                style={{
                                                                    all: 'unset',
                                                                    backgroundColor: processingId === placement._id ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 122, 0, 0.08)',
                                                                    color: processingId === placement._id ? '#999' : '#FF7A00',
                                                                    border: processingId === placement._id ? '1px solid #ccc' : '1px solid #FF7A00',
                                                                    borderRadius: '6px',
                                                                    width: '70px',
                                                                    height: '28px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '600',
                                                                    cursor: processingId === placement._id ? 'not-allowed' : 'pointer',
                                                                    display: 'inline-block',
                                                                    textAlign: 'center',
                                                                    lineHeight: '26px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={() => handleApprove(placement._id)}
                                                            >
                                                                {processingId === placement._id ? (
                                                                    <>
                                                                        <i className="fa fa-spinner fa-spin" style={{marginRight: '4px'}}></i>
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    'Approve'
                                                                )}
                                                            </button>
                                                            <button
                                                                disabled={processingId === placement._id}
                                                                style={{
                                                                    all: 'unset',
                                                                    backgroundColor: processingId === placement._id ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 122, 0, 0.08)',
                                                                    color: processingId === placement._id ? '#999' : '#FF7A00',
                                                                    border: processingId === placement._id ? '1px solid #ccc' : '1px solid #FF7A00',
                                                                    borderRadius: '6px',
                                                                    width: '70px',
                                                                    height: '28px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '600',
                                                                    cursor: processingId === placement._id ? 'not-allowed' : 'pointer',
                                                                    display: 'inline-block',
                                                                    textAlign: 'center',
                                                                    lineHeight: '26px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={() => handleReject(placement._id)}
                                                            >
                                                                {processingId === placement._id ? (
                                                                    <>
                                                                        <i className="fa fa-spinner fa-spin" style={{marginRight: '4px'}}></i>
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    'Reject'
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        style={{
                                                            all: 'unset',
                                                            backgroundColor: 'rgba(255, 122, 0, 0.08)',
                                                            color: '#FF7A00',
                                                            border: '1px solid #FF7A00',
                                                            borderRadius: '6px',
                                                            width: '70px',
                                                            height: '28px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            textAlign: 'center',
                                                            lineHeight: '26px'
                                                        }}
                                                        onClick={() => navigate(`/admin/placement-details/${placement._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPlacementOfficersAllRequest;
