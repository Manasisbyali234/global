import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import './button-override.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import PlacementNavigationButtons from './PlacementNavigationButtons';

function AdminBatchUploads() {
    const navigate = useNavigate();
    const [placements, setPlacements] = useState([]);
    const [filteredPlacements, setFilteredPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                const allPlacements = (response.data || []).filter(p => p.status === 'active');
                // Process placements to get upload stats
                const processedPlacements = allPlacements.map(p => {
                    const fileHistory = p.fileHistory || [];
                    return {
                        ...p,
                        totalFiles: fileHistory.length,
                        approvedFiles: fileHistory.filter(f => f.status === 'approved' || f.status === 'processed').length,
                        rejectedFiles: fileHistory.filter(f => f.status === 'rejected').length,
                        pendingFiles: fileHistory.filter(f => f.status === 'pending').length
                    };
                });
                setPlacements(processedPlacements);
                setFilteredPlacements(processedPlacements);
            } else {
                setError(response.message || 'Failed to fetch batch uploads');
            }
        } catch (error) {
            setError('Error fetching batch uploads: ' + error.message);
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
        const filtered = placements.filter(p =>
            p.collegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPlacements(filtered);
    };

    if (loading) {
        return (
            <div className="admin-emp-manage-container">
                <PageLoader pageName="Batch Uploads" />
            </div>
        );
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header">
                <h2>Batch Uploads Management</h2>
                <p>Monitor student data files submitted by Placement Dean</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="page-toolbar">
                        <h4 className="panel-tittle m-a0 page-toolbar__title">Batch Uploads({filteredPlacements.length})</h4>
                        <div className="page-toolbar__controls page-toolbar__controls--single">
                        <div className="search-section page-toolbar__section">
                            <label className="search-label page-toolbar__label">
                                <i className="fa fa-filter"></i> Search by Name, Email or College
                            </label>
                            <div className="page-toolbar__control-wrap">
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search by College or Name..."
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
                                    <th style={{textAlign: 'center'}}>University/College Name</th>
                                    <th style={{textAlign: 'center'}}>Placement Dean</th>
                                    <th style={{textAlign: 'center'}}>Total Files</th>
                                    <th style={{textAlign: 'center'}}>Approved</th>
                                    <th style={{textAlign: 'center'}}>Pending</th>
                                    <th style={{textAlign: 'center'}}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-file-excel" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No batch uploads found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((placement) => (
                                        <tr key={placement._id}>
                                            <td style={{textAlign: 'center', fontSize: '0.9rem'}}>
                                                {placement.pendingFiles > 0 && (
                                                    <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF7A00', marginRight: '6px', verticalAlign: 'middle'}} title="Files uploaded"></span>
                                                )}
                                                {placement.collegeName || 'N/A'}
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="company-name">
                                                    {placement.name}
                                                </span>
                                                <div style={{fontSize: '0.75rem', color: '#666'}}>{placement.email}</div>
                                            </td>
                                            <td style={{textAlign: 'center', fontWeight: 'bold'}}>{placement.totalFiles}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge" style={{backgroundColor: '#e6f4ea', color: '#1e7e34', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600'}}>
                                                    {placement.approvedFiles}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge" style={{backgroundColor: '#fff4e5', color: '#b26a00', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600'}}>
                                                    {placement.pendingFiles}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <button
                                                    style={{
                                                        all: 'unset',
                                                        backgroundColor: 'rgba(255, 122, 0, 0.08)',
                                                        color: '#FF7A00',
                                                        border: '1px solid #FF7A00',
                                                        borderRadius: '6px',
                                                        padding: '4px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'inline-block'
                                                    }}
                                                    onClick={() => navigate(`/manage/xK9mP2/placement-details/${placement._id}`)}
                                                >
                                                    View Details
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

export default AdminBatchUploads;
