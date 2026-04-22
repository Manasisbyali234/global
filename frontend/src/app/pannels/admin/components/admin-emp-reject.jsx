import { useState, useEffect } from 'react';
import { formatDate as formatDisplayDate } from '../../../../utils/dateFormatter';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';

function AdminEmployersRejected() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchRejectedEmployers();
    }, []);

    const fetchRejectedEmployers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployers();
            if (response.success) {
                const rejectedEmployers = response.data.filter(emp => 
                    emp.status === 'rejected' || (emp.isApproved === false && emp.status === 'inactive')
                );
                setEmployers(rejectedEmployers);
                setFilteredEmployers(rejectedEmployers);
            } else {
                setError(response.message || 'Failed to fetch rejected employers');
            }
        } catch (error) {
            setError('Error fetching rejected employers');
            
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        setCurrentPage(1);
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

    const totalPages = Math.ceil(filteredEmployers.length / PAGE_SIZE);
    const paginated = filteredEmployers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (loading) {
        return <PageLoader pageName="Rejected Employers" />;
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header clearfix">
                <h2>Rejected Employers</h2>
            </div>

            <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <div className="page-toolbar">
                            <h4 className="panel-tittle m-a0 page-toolbar__title">Rejected Employers ({filteredEmployers.length})</h4>
                            <div className="page-toolbar__controls page-toolbar__controls--single">
                            <div className="search-section page-toolbar__section">
                                <label className="search-label page-toolbar__label">
                                    <i className="fa fa-search"></i> Search by Name or Email
                                </label>
                                <div className="page-toolbar__control-wrap">
                                <SearchBar 
                                    onSearch={handleSearch}
                                    placeholder="Search rejected employers..."
                                    className="employer-search"
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
                                        <th>Company Name</th>
                                        <th>Type</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Rejected Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-times-circle" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No rejected employers found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((employer) => (
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
                                                <td style={{textAlign: 'center', fontSize: '0.85rem'}}>{formatDisplayDate(employer.updatedAt || employer.createdAt)}</td>
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

export default AdminEmployersRejected;
