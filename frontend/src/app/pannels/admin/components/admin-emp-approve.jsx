import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import { formatDate } from '../../../../utils/dateFormatter';

function AdminEmployersApproved() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

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

    const applyFilters = (searchTerm, type, list) => {
        let filtered = list;
        if (type !== 'all') {
            filtered = filtered.filter(emp => emp.employerType === type);
        }
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(employer =>
                employer.companyName?.toLowerCase().includes(term) ||
                employer.email?.toLowerCase().includes(term) ||
                employer.phone?.includes(searchTerm) ||
                employer.employerType?.toLowerCase().includes(term)
            );
        }
        setFilteredEmployers(filtered);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        applyFilters(term, typeFilter, employers);
    };

    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        setCurrentPage(1);
        applyFilters(searchTerm, type, employers);
    };

    const totalPages = Math.ceil(filteredEmployers.length / PAGE_SIZE);
    const paginated = filteredEmployers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);



    const companyCount = employers.filter(emp => emp.employerType !== 'consultant').length;
    const consultantCount = employers.filter(emp => emp.employerType === 'consultant').length;

    if (loading) {
        return <PageLoader pageName="Approved Employers" />;
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header clearfix">
                <h2>Approved Employers</h2>

            </div>

            <div className="approved-stats-row">
                <div className="approved-stat-card approved-stat-card--company">
                    <div className="approved-stat-icon-wrap">
                        <i className="fa fa-building"></i>
                    </div>
                    <div className="approved-stat-info">
                        <div className="approved-stat-number">{companyCount}</div>
                        <div className="approved-stat-label">Total Companies</div>
                    </div>
                </div>
                <div className="approved-stat-card approved-stat-card--consultant">
                    <div className="approved-stat-icon-wrap">
                        <i className="fa fa-users"></i>
                    </div>
                    <div className="approved-stat-info">
                        <div className="approved-stat-number">{consultantCount}</div>
                        <div className="approved-stat-label">Total Consultants</div>
                    </div>
                </div>
            </div>

            <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <div className="approved-toolbar">
                            <h4 className="panel-tittle m-a0">Approved Employers ({filteredEmployers.length})</h4>
                            <div className="approved-toolbar__controls">
                                <div className="approved-ctrl-group">
                                    <span className="approved-ctrl-label"><i className="fa fa-filter"></i> Filter by Type</span>
                                    <select
                                        className="status-filter-select"
                                        value={typeFilter}
                                        onChange={(e) => handleTypeFilter(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="company">Company</option>
                                        <option value="consultant">Consultant</option>
                                    </select>
                                </div>
                                <div className="approved-ctrl-group">
                                    <span className="approved-ctrl-label"><i className="fa fa-search"></i> Search by Name or Email</span>
                                    <SearchBar
                                        onSearch={handleSearch}
                                        placeholder="Search by name or email..."
                                        className="employer-search"
                                    />
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
                                        paginated.map((employer) => (
                                            <tr
                                                key={employer._id}
                                                className={employer.hasNewConsultantCompanies ? 'emp-table-row--new-company' : ''}
                                            >
                                                <td style={{textAlign: 'center'}}>
                                                    <div className={`company-name-wrap ${employer.hasNewConsultantCompanies ? 'company-name-wrap--new' : ''}`}>
                                                        <span className={`company-name ${employer.hasNewConsultantCompanies ? 'company-name--new' : ''}`}>
                                                            {employer.hasNewConsultantCompanies && (
                                                                <span className="company-name-dot" aria-hidden="true"></span>
                                                            )}
                                                            {employer.hasResubmittedDocuments && (
                                                                <span className="company-name-dot company-name-dot--resubmit" title="Document resubmitted" aria-hidden="true"></span>
                                                            )}
                                                            {employer.companyName || employer.email}
                                                        </span>
                                                        {employer.hasNewConsultantCompanies && employer.newConsultantCompanies?.length > 0 && (
                                                            <span className="company-name-subnote">
                                                                {employer.newConsultantCompanies.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
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
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
                            <div style={{ color: "#6c757d", fontSize: "13px" }}>
                                Showing {filteredEmployers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredEmployers.length)} of {filteredEmployers.length} employer{filteredEmployers.length !== 1 ? "s" : ""}
                            </div>
                            {totalPages > 1 && (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === totalPages ? "#f8f9fa" : "#fff", color: currentPage === totalPages ? "#adb5bd" : "#495057", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default AdminEmployersApproved;
