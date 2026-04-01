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

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                const allPlacements = response.data || [];
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
            <div className="dashboard-content">
                <PageLoader pageName="Batch Uploads" />
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>Batch Uploads Management</h2>
                <p>Monitor student data files submitted by Placement Officers</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="page-toolbar">
                        <h4 className="panel-tittle m-a0 page-toolbar__title">Batch Uploads Summary ({filteredPlacements.length})</h4>
                        <div className="page-toolbar__controls page-toolbar__controls--single">
                        <div className="search-section page-toolbar__section">
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
                                    <th style={{textAlign: 'center'}}>College Name</th>
                                    <th style={{textAlign: 'center'}}>Placement Officer</th>
                                    <th style={{textAlign: 'center'}}>Total Files</th>
                                    <th style={{textAlign: 'center'}}>Approved</th>
                                    <th style={{textAlign: 'center'}}>Rejected</th>
                                    <th style={{textAlign: 'center'}}>Pending</th>
                                    <th style={{textAlign: 'center'}}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlacements.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-file-excel" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No batch uploads found
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
                                                <div style={{fontSize: '0.75rem', color: '#666'}}>{placement.email}</div>
                                            </td>
                                            <td style={{textAlign: 'center', fontWeight: 'bold'}}>{placement.totalFiles}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge" style={{backgroundColor: '#e6f4ea', color: '#1e7e34', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600'}}>
                                                    {placement.approvedFiles}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="status-badge" style={{backgroundColor: '#fce8e6', color: '#d93025', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600'}}>
                                                    {placement.rejectedFiles}
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
                                                    onClick={() => navigate(`/admin/placement-details/${placement._id}`)}
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
                </div>
            </div>
        </div>
    );
}

export default AdminBatchUploads;
