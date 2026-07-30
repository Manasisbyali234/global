import { useState, useEffect } from 'react';
import { formatDate } from '../../../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import PlacementNavigationButtons from './PlacementNavigationButtons';

function AdminPlacementOfficersApproved() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchApprovedPlacements();
    }, []);

    const fetchApprovedPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const approvedPlacements = response.data.filter(placement => 
                    placement.isApproved === true && placement.status === 'active'
                );
                setPlacements(approvedPlacements);
                setFilteredPlacements(approvedPlacements);
            } else {
                setError(response.message || 'Failed to fetch Placement Dean');
            }
        } catch (error) {
            setError('Error fetching Placement Dean');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        setCurrentPage(1);
        if (!searchTerm.trim()) {
            setFilteredPlacements(placements);
            return;
        }
        const filtered = placements.filter(placement =>
            placement.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            placement.phone?.includes(searchTerm) ||
            placement.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlacements(filtered);
    };

    const getUniqueCourseLabels = (files = []) => {
        const seen = new Set();

        return files
            .map((file) => String(file?.customName || file?.batch || '').trim())
            .filter((label) => {
                if (!label) {
                    return false;
                }

                const normalizedLabel = label.toLowerCase();
                if (seen.has(normalizedLabel)) {
                    return false;
                }

                seen.add(normalizedLabel);
                return true;
            });
    };



    if (loading) {
        return (
            <div className="admin-emp-manage-container">
                <PageLoader pageName="Approved Placement Dean" />
            </div>
        );
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header">
                <h2>Approved Placement Dean</h2>
                <p>View and manage approved Placement Dean accounts</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white" style={{marginTop: '20px'}}>
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="page-toolbar">
                        <h4 className="panel-tittle m-a0 page-toolbar__title">Approved Placement Dean ({filteredPlacements.length})</h4>
                        <div className="page-toolbar__controls page-toolbar__controls--single">
                        <div className="search-section page-toolbar__section">
                            <label className="search-label page-toolbar__label">
                                <i className="fa fa-filter"></i> Search by Name, Email or College
                            </label>
                            <div className="page-toolbar__control-wrap">
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search approved Placement Dean..."
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
                                    <th>University/College Name</th>
                                    <th>Placement Dean</th>
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
                                            No approved Placement Dean found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((placement) => (
                                        <tr
                                            key={placement._id}
                                            className={placement.hasNewBatchUploads ? 'emp-table-row--new-upload' : ''}
                                        >
                                            <td style={{textAlign: 'center', fontSize: '0.9rem'}}>
                                                <div className={`company-name-wrap ${placement.hasNewBatchUploads ? 'company-name-wrap--new' : ''}`}>
                                                    <span className="company-name">
                                                        {placement.collegeName || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
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
                                                    onClick={() => navigate(`/manage/xK9mP2/placement-details/${placement._id}`, {
                                                        state: { from: '/manage/xK9mP2/admin-placement-approved' }
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

export default AdminPlacementOfficersApproved;
