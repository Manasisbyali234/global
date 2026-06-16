import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import { formatDate } from '../../../../utils/dateFormatter';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import './admin-placement-manage-tabs.css';
function AdminPlacementOfficersTabs() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

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
            }
        } catch (error) {
            showError('Error fetching Placement Dean');
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
        const filtered = baseList.filter(p => 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm) ||
            p.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlacements(filtered);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        applyFilters(placements, status);
    };

    const handleApprove = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'approved');
            if (response.success) {
                const updatedPlacements = placements.filter(p => p._id !== placementId);
                setPlacements(updatedPlacements);
                applyFilters(updatedPlacements, statusFilter);
                showSuccess('Placement Dean approved successfully! Once approved, you cannot reject or retake this action.');
            } else {
                showError('Failed to approve Placement Dean');
            }
        } catch (error) {
            showError('Error approving Placement Dean');
        }
    };

    const handleReject = async (placementId) => {
        try {
            const response = await api.updatePlacementStatus(placementId, 'rejected');
            if (response.success) {
                showSuccess('Placement Dean rejected successfully! Once rejected, you cannot approve or retake this action.');
                navigate('/admin/admin-placement-rejected');
            } else {
                showError('Failed to reject Placement Dean');
            }
        } catch (error) {
            showError('Error rejecting Placement Dean');
        }
    };

    if (loading) {
        return <div className="dashboard-content"><PageLoader pageName="Placement Management" /></div>;
    }

    return (
        <div className="dashboard-content admin-placement-manage-page">
            <div className="wt-admin-right-page-header">
                <h2>Placement Dean Management</h2>
                <p>Manage Placement Dean applications and uploads</p>
            </div>

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
                            </select>
                            </div>
                        </div>
                        
                        <div className="search-section page-toolbar__section">
                            <label className="search-label page-toolbar__label">
                                <i className="fa fa-filter"></i> Search by Name, Email or College
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
                    <div className="p-a20 table-responsive">
                        <table className="table emp-table">
                            <thead>
                                <tr>
                                    <th>University/College Name</th>
                                    <th>Placement Dean</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center" style={{padding: '40px'}}>No records found</td></tr>
                                ) : (
                                    filteredPlacements.map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center'}}>{placement.collegeName || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>{placement.name}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace'}}>{placement.email}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace'}}>{placement.phone || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>{formatDate(placement.createdAt)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className={`status-badge status-${placement.status || 'pending'}`}>{placement.status || 'Pending'}</span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <div className="action-buttons">
                                                    {(placement.status === 'pending' || (!placement.status && !placement.isApproved)) && (
                                                        <>
                                                            <button className="action-btn btn-approve" onClick={() => handleApprove(placement._id)}>
                                                                <i className="fa fa-check"></i> Approve
                                                            </button>
                                                            <button className="action-btn btn-reject" onClick={() => handleReject(placement._id)}>
                                                                <i className="fa fa-times"></i> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="action-btn btn-view" onClick={() => navigate(`/admin/placement-details/${placement._id}`)}>
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
                </div>
            </div>
        </div>
    );
}

export default AdminPlacementOfficersTabs;
