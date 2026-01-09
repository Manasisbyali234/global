import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';

function AdminEmployersApproved() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchApprovedEmployers();
        
        // Listen for employer approval events
        const handleEmployerApproved = () => {
            fetchApprovedEmployers();
        };
        
        window.addEventListener('employerApproved', handleEmployerApproved);
        
        return () => {
            window.removeEventListener('employerApproved', handleEmployerApproved);
        };
    }, []);

    const fetchApprovedEmployers = async () => {
        try {
            setLoading(true);
            console.log('Fetching approved employers...');
            const response = await api.getAllEmployers({ approvalStatus: 'approved' });
            console.log('Approved employers response:', response);
            
            if (response.success) {
                console.log('All employers from API:', response.data.length);
                const approvedEmployers = response.data.filter(emp => emp.isApproved === true);
                console.log('Filtered approved employers:', approvedEmployers.length);
                console.log('Sample approved employer:', approvedEmployers[0]);
                
                setEmployers(approvedEmployers);
                setFilteredEmployers(approvedEmployers);
            } else {
                setError(response.message || 'Failed to fetch approved employers');
            }
        } catch (error) {
            console.error('Error fetching approved employers:', error);
            setError('Error fetching approved employers');
            
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredEmployers(employers);
            return;
        }
        
        const filtered = employers.filter(employer => 
            employer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.phone?.includes(searchTerm) ||
            employer.employerType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployers(filtered);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Approved Employers</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => {
                        console.log('Manual refresh clicked');
                        fetchApprovedEmployers();
                    }}
                    style={{float: 'right'}}
                >
                    <i className="fa fa-refresh"></i> Refresh
                </button>
            </div>

            <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                            <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Approved Employers ({filteredEmployers.length})</h4>
                            <div className="search-section" style={{marginLeft: 'auto'}}>
                                <label className="search-label">
                                    <i className="fa fa-filter"></i> Search by Name or Email
                                </label>
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search approved employers..."
                                    className="employer-search"
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
                                        <th>Company Name</th>
                                        <th>Type</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Approved Date</th>
                                        <th>Approved By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-check-circle" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No approved employers found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployers.map((employer) => (
                                            <tr key={employer._id}>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className="company-name">
                                                        {employer.companyName || employer.email}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span style={{
                                                        background: 'transparent',
                                                        color: '#000000',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {employer.employerType === 'consultant' ? 'Consultant' : 'Company'}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{employer.email}</td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>{employer.phone || 'N/A'}</td>
                                                <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDate(employer.updatedAt || employer.createdAt)}</td>
                                                <td style={{textAlign: 'center'}}>
                                                    {(() => {
                                                        const approver = employer.approvedBy;
                                                        const model = employer.approvedByModel;
                                                        let displayText = 'Not Available';

                                                        if (approver && typeof approver === 'object') {
                                                            displayText = approver.name || 
                                                                        (approver.firstName && approver.lastName ? `${approver.firstName} ${approver.lastName}` : null) ||
                                                                        approver.firstName || 
                                                                        approver.username || 
                                                                        (model === 'Admin' ? 'System Admin' : model === 'SubAdmin' ? 'Sub-Admin' : 'Default Admin');
                                                        } else if (employer.isApproved || employer.status === 'active' || employer.status === 'approved') {
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
                                                        onClick={() => navigate(`/admin/employer-details/${employer._id}`)}
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
        </>
    );
}

export default AdminEmployersApproved;
