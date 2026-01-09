import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PlacementNavigationButtons from './PlacementNavigationButtons';

function AdminPlacementOfficersApproved() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApprovedPlacements();
    }, []);

    const fetchApprovedPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const approvedPlacements = response.data.filter(placement => 
                    placement.status === 'active' || placement.isApproved
                );
                setPlacements(approvedPlacements);
                setFilteredPlacements(approvedPlacements);
            } else {
                setError(response.message || 'Failed to fetch placement officers');
            }
        } catch (error) {
            setError('Error fetching placement officers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredPlacements(placements);
            return;
        }
        
        const filtered = placements.filter(placement => 
            placement.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.phone?.includes(searchTerm)
        );
        setFilteredPlacements(filtered);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Approved Placement Officers</h2>
                <p>View and manage approved placement officer accounts</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                        <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Approved Placement Officers ({filteredPlacements.length})</h4>
                        <div className="search-section" style={{marginLeft: 'auto'}}>
                            <label className="search-label">
                                <i className="fa fa-filter"></i> Search by Name or Email
                            </label>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search approved placement officers..."
                                className="placement-search"
                            />
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
                                    <th>Approved By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-check-circle" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No approved placement officers found
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
                                                <span className="status-badge status-approved">Approved</span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                {(() => {
                                                    const approver = placement.approvedBy;
                                                    const model = placement.approvedByModel;
                                                    let displayText = 'Not Available';

                                                    if (approver && typeof approver === 'object') {
                                                        displayText = approver.name || 
                                                                    (approver.firstName && approver.lastName ? `${approver.firstName} ${approver.lastName}` : null) ||
                                                                    approver.firstName || 
                                                                    approver.username || 
                                                                    (model === 'Admin' ? 'System Admin' : model === 'SubAdmin' ? 'Sub-Admin' : 'Default Admin');
                                                    } else if (placement.isApproved || placement.status === 'active' || placement.status === 'approved') {
                                                        displayText = model === 'Admin' ? 'System Admin' : model === 'SubAdmin' ? 'Sub-Admin' : 'Default Admin';
                                                    }
                                                    
                                                    const approverType = model || 'Admin';
                                                    
                                                    return (
                                                        <span style={{
                                                            background: approverType === 'Admin' ? '#e3f2fd' : '#fff3e0',
                                                            color: approverType === 'Admin' ? '#1976d2' : '#f57c00',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {displayText}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <button
                                                    className="action-btn btn-view"
                                                    onClick={() => navigate(`/admin/placement-details/${placement._id}`, {
                                                        state: { from: '/admin/admin-placement-approved' }
                                                    })}
                                                >
                                                    <i className="fa fa-eye"></i>
                                                    View
                                                </button>
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

export default AdminPlacementOfficersApproved;