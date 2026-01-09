import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PlacementNavigationButtons from './PlacementNavigationButtons';

function AdminExcelUploads() {
    const navigate = useNavigate();
    const [excelUploads, setExcelUploads] = useState([]);
    const [filteredUploads, setFilteredUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExcelUploads();
    }, []);

    const fetchExcelUploads = async () => {
        try {
            setLoading(true);
            const response = await api.getAllPlacements();
            if (response.success) {
                // Get all placements and show only those who uploaded files
                const placementsWithUploads = [];
                response.data.forEach(placement => {
                    const hasUploads = placement.fileHistory && placement.fileHistory.length > 0;
                    placementsWithUploads.push({
                        _id: placement._id,
                        collegeName: placement.collegeName,
                        name: placement.name,
                        email: placement.email,
                        phone: placement.phone || 'N/A',
                        joinDate: placement.createdAt,
                        status: hasUploads ? 'Uploaded' : 'Not Uploaded',
                        approvedBy: placement.approvedBy,
                        approvedByModel: placement.approvedByModel,
                        hasUploads: hasUploads,
                        placementId: placement._id
                    });
                });
                
                setExcelUploads(placementsWithUploads);
                setFilteredUploads(placementsWithUploads);
            } else {
                setError(response.message || 'Failed to fetch Excel uploads');
            }
        } catch (error) {
            setError('Error fetching Excel uploads');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredUploads(excelUploads);
            return;
        }
        
        const filtered = excelUploads.filter(upload => 
            upload.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            upload.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            upload.collegeName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUploads(filtered);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Uploaded': { class: 'status-approved', text: 'Uploaded' },
            'Not Uploaded': { class: 'status-rejected', text: 'Not Uploaded' }
        };
        
        const statusInfo = statusMap[status] || { class: 'status-pending', text: 'Unknown' };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
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
                <h2>Excel Uploads</h2>
                <p>View and manage all Excel file uploads from placement officers</p>
            </div>
            
            <PlacementNavigationButtons />

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                        <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Excel Uploads ({filteredUploads.length})</h4>
                        <div className="search-section" style={{marginLeft: 'auto'}}>
                            <label className="search-label">
                                <i className="fa fa-filter"></i> Search by Name, Email, or College
                            </label>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search Excel uploads..."
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
                                {filteredUploads.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                            <i className="fa fa-file-excel-o" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No placement officers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUploads.map((upload) => (
                                        <tr key={upload._id}>
                                            <td style={{textAlign: 'center', fontSize: '0.9rem'}}>{upload.collegeName || 'N/A'}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <span className="company-name">
                                                    {upload.name}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{upload.email}</td>
                                            <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{upload.phone}</td>
                                            <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDate(upload.joinDate)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                {getStatusBadge(upload.status)}
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                {(() => {
                                                    const approverName = upload.approvedBy?.name || upload.approvedBy?.username || null;
                                                    const approverType = upload.approvedByModel || 'Admin';
                                                    const displayText = approverName || approverType;
                                                    
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
                                                    onClick={() => navigate(`/admin/placement-details/${upload.placementId}`, {
                                                        state: { from: '/admin/excel-uploads' }
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

export default AdminExcelUploads;