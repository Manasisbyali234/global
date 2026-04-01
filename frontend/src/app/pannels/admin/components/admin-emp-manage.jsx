import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import './admin-header-mobile-fix.css';
import SearchBar from '../../../../components/SearchBar';
import PageLoader from '../../../../components/PageLoader';
import { formatDate } from '../../../../utils/dateFormatter';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';

function AdminEmployersAllRequest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const getStatusFilterFromSearch = (search) => {
        const searchParams = new URLSearchParams(search);
        const requestedStatus = String(searchParams.get('status') || '').trim().toLowerCase();

        switch (requestedStatus) {
            case 'under-review':
            case 'under_review':
            case 'pending':
                return 'pending';
            case 'approved':
                return 'approved';
            case 'rejected':
                return 'rejected';
            case 'all':
                return 'all';
            case 'incomplete':
            default:
                return 'incomplete';
        }
    };
    const [statusFilter, setStatusFilter] = useState(() => getStatusFilterFromSearch(window.location.search));
    const isUnderReviewPage =
        String(new URLSearchParams(location.search).get('status') || '').trim().toLowerCase() === 'under-review';

    const getEmployerReviewStatus = (employer) => {
        if (!employer) return 'incomplete';
        if (employer.isApproved === true || employer.status === 'approved') {
            return 'approved';
        }
        if (
            employer.status === 'rejected' ||
            (employer.status === 'inactive' && employer.isApproved !== true)
        ) {
            return 'rejected';
        }
        if (employer.profileSubmittedForReview) {
            return 'pending';
        }
        return 'incomplete';
    };

    const getEmployerStatusText = (employer) => {
        const normalizedStatus = getEmployerReviewStatus(employer);
        switch (normalizedStatus) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Under Review';
            case 'incomplete':
            default:
                return 'Profile Incomplete';
        }
    };

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchEmployers();
    }, []);

    useEffect(() => {
        const nextStatusFilter = getStatusFilterFromSearch(location.search);
        setStatusFilter(nextStatusFilter);
        filterEmployersByStatus(employers, nextStatusFilter);
    }, [location.search]);

    const fetchEmployers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployers();
            if (response.success) {
                const employersWithProfiles = await Promise.all(
                    response.data.map(async (emp) => {
                        try {
                            const profileRes = await api.getEmployerProfile(emp._id);
                            if (profileRes.success && profileRes.profile) {
                                return { 
                                    ...emp, 
                                    companyName: profileRes.profile.companyName || emp.companyName,
                                    documents: profileRes.profile.documents || [],
                                    gallery: profileRes.profile.gallery || [],
                                    panCardImage: profileRes.profile.panCardImage,
                                    cinImage: profileRes.profile.cinImage,
                                    gstImage: profileRes.profile.gstImage,
                                    certificateOfIncorporation: profileRes.profile.certificateOfIncorporation,
                                    panCardVerified: profileRes.profile.panCardVerified || 'pending',
                                    cinVerified: profileRes.profile.cinVerified || 'pending',
                                    gstVerified: profileRes.profile.gstVerified || 'pending',
                                    incorporationVerified: profileRes.profile.incorporationVerified || 'pending',
                                    panCardReuploadedAt: profileRes.profile.panCardReuploadedAt,
                                    cinReuploadedAt: profileRes.profile.cinReuploadedAt,
                                    gstReuploadedAt: profileRes.profile.gstReuploadedAt,
                                    incorporationReuploadedAt: profileRes.profile.incorporationReuploadedAt
                                };
                            }
                        } catch (err) {}
                        return { ...emp, documents: [], gallery: [] };
                    })
                );
                
                setEmployers(employersWithProfiles);
                filterEmployersByStatus(employersWithProfiles, statusFilter);
            } else {
                setError(response.message || 'Failed to fetch employers');
            }
        } catch (error) {
            setError('Error fetching employers');
        } finally {
            setLoading(false);
        }
    };

    const filterEmployersByStatus = (employersList, status) => {
        const filtered = status === 'all'
            ? employersList
            : employersList.filter((emp) => getEmployerReviewStatus(emp) === status);

        setFilteredEmployers(filtered);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        filterEmployersByStatus(employers, status);
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            filterEmployersByStatus(employers, statusFilter);
            return;
        }

        const statusScopedEmployers = statusFilter === 'all'
            ? employers
            : employers.filter((employer) => getEmployerReviewStatus(employer) === statusFilter);

        const filtered = statusScopedEmployers.filter(employer => 
            employer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employer.phone?.includes(searchTerm) ||
            employer.employerType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployers(filtered);
    };

    const handleApprove = async (employerId) => {
        if (actionLoading[employerId]) return;
        
        try {
            setActionLoading(prev => ({ ...prev, [employerId]: true }));
            console.log('Approving employer:', employerId);
            
            const response = await api.updateEmployerStatus(employerId, { status: 'approved', isApproved: true });
            console.log('Approval response:', response);
            console.log('Employer after approval:', response.employer);
            
            if (response.success) {
                console.log('Employer status after approval:', {
                    isApproved: response.employer.isApproved,
                    status: response.employer.status
                });
                
                const updatedEmployers = employers.map((emp) =>
                    emp._id === employerId ? { ...emp, ...response.employer } : emp
                );
                console.log('Employers before update:', employers.length);
                console.log('Employers after update:', updatedEmployers.length);
                
                setEmployers(updatedEmployers);
                filterEmployersByStatus(updatedEmployers, statusFilter);
                
                // Dispatch event to notify other components
                window.dispatchEvent(new CustomEvent('employerApproved', { detail: { employerId } }));
                
                showSuccess('Employer approved successfully! Once approved, you cannot reject or retake this action.');
            } else {
                console.error('Approval failed:', response.message);
                showError(response.message || 'Failed to approve employer');
            }
        } catch (error) {
            console.error('Approval error:', error);
            showError('Error approving employer');
        } finally {
            setActionLoading(prev => ({ ...prev, [employerId]: false }));
        }
    };

    const handleReject = async (employerId) => {
        if (actionLoading[employerId]) return;
        
        try {
            setActionLoading(prev => ({ ...prev, [employerId]: true }));
            const response = await api.updateEmployerStatus(employerId, { status: 'rejected', isApproved: false });
            if (response.success) {
                const updatedEmployers = employers.map((emp) =>
                    emp._id === employerId ? { ...emp, ...response.employer } : emp
                );
                setEmployers(updatedEmployers);
                filterEmployersByStatus(updatedEmployers, statusFilter);
                showSuccess('Employer rejected successfully! Once rejected, you cannot approve or retake this action.');
                window.dispatchEvent(new CustomEvent('employerRejected', { detail: { employerId } }));
            } else {
                showError('Failed to reject employer');
            }
        } catch (error) {
            showError('Error rejecting employer');
        } finally {
            setActionLoading(prev => ({ ...prev, [employerId]: false }));
        }
    };



    if (loading) {
        return <PageLoader pageName="Employer Requests" />;
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header clearfix">
                <h2>Employers Details</h2>
            </div>

                <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="admin-emp-toolbar">
                        <h4 className="panel-tittle m-a0 toolbar-title">Employers ({filteredEmployers.length})</h4>
                             
                            {!isUnderReviewPage ? (
                                <div className="search-section status-filter-section">
                                    <label className="search-label">
                                        <i className="fa fa-filter"></i> Filter by Status
                                    </label>
                                    <div className="toolbar-control-wrap">
                                    <select 
                                        className="status-filter-select"
                                        value={statusFilter}
                                        onChange={(e) => handleStatusFilter(e.target.value)}
                                    >
                                        <option value="pending">Under Review</option>
                                        <option value="incomplete">Profile Incomplete</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="status-filter-placeholder"
                                    aria-hidden="true"
                                />
                            )}
                             
                            <div className="search-section employer-search-section">
                                <label className="search-label">
                                    <i className="fa fa-search"></i> Search by Name or Email
                                </label>
                                <div className="toolbar-control-wrap">
                                    <SearchBar 
                                        onSearch={handleSearch}
                                        placeholder="Search employers..."
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
                                        <th>Profile Submitted</th>
                                        <th>Document Status</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEmployers.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center" style={{padding: '40px', fontSize: '1rem', color: '#6c757d'}}>
                                                <i className="fa fa-building" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                                No employers found
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
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                                    {employer.email}
                                                </td>
                                                <td style={{textAlign: 'center', fontFamily: 'monospace', fontSize: '0.85rem'}}>
                                                    {employer.phone || 'N/A'}
                                                </td>
                                                <td style={{textAlign: 'center', fontSize: '0.85rem'}}>
                                                    {employer.profileSubmittedAt ? formatDate(employer.profileSubmittedAt) : 'Not submitted'}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    {(() => {
                                                        const docs = [
                                                            { name: 'PAN', uploaded: employer.panCardImage, status: employer.panCardVerified, reuploadedAt: employer.panCardReuploadedAt },
                                                            { name: 'CIN', uploaded: employer.cinImage, status: employer.cinVerified, reuploadedAt: employer.cinReuploadedAt },
                                                            { name: 'GST', uploaded: employer.gstImage, status: employer.gstVerified, reuploadedAt: employer.gstReuploadedAt },
                                                            { name: 'COI', uploaded: employer.certificateOfIncorporation, status: employer.incorporationVerified, reuploadedAt: employer.incorporationReuploadedAt }
                                                        ];
                                                        
                                                        const uploadedDocs = docs.filter(doc => doc.uploaded);
                                                        const approvedDocs = docs.filter(doc => doc.uploaded && doc.status === 'approved');
                                                        const rejectedDocs = docs.filter(doc => doc.uploaded && doc.status === 'rejected');
                                                        const pendingDocs = docs.filter(doc => doc.uploaded && (doc.status === 'pending' || !doc.status));
                                                        const reuploadedDocs = docs.filter(doc => doc.uploaded && doc.reuploadedAt && doc.status === 'rejected');
                                                        
                                                        if (uploadedDocs.length === 0) {
                                                            return <span style={{color: '#6b7280', fontSize: '0.8rem'}}>No documents</span>;
                                                        }
                                                        
                                                        return (
                                                            <div style={{fontSize: '0.75rem', lineHeight: '1.3'}}>
                                                                <div style={{fontWeight: '600', marginBottom: '3px', color: '#374151'}}>Total: {uploadedDocs.length}</div>
                                                                {approvedDocs.length > 0 && <div style={{color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'}}><span>✓</span> {approvedDocs.length} Approved</div>}
                                                                {rejectedDocs.length > 0 && <div style={{color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'}}><span>✗</span> {rejectedDocs.length} Rejected</div>}
                                                                {pendingDocs.length > 0 && <div style={{color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'}}><span>⏳</span> {pendingDocs.length} Pending</div>}
                                                                {reuploadedDocs.length > 0 && <div style={{color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px'}}><span>↻</span> {reuploadedDocs.length} Reuploaded</div>}
                                                            </div>
                                                        );
                                                    })()} 
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    {(() => {
                                                        const getStatusStyle = (status) => {
                                                            switch(status) {
                                                                case 'approved':
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                                case 'rejected':
                                                                    return { background: 'rgba(220, 53, 69, 0.08)', color: '#dc3545', borderColor: '#dc3545' };
                                                                case 'pending':
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                                case 'incomplete':
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                                default:
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                            }
                                                        };
                                                        
                                                        const status = getEmployerReviewStatus(employer);
                                                        const statusText = getEmployerStatusText(employer);
                                                        const style = getStatusStyle(status);
                                                        
                                                        return (
                                                            <span style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: '90px',
                                                                height: '28px',
                                                                lineHeight: '1',
                                                                border: '1px solid',
                                                                ...style
                                                            }}>
                                                                {statusText}
                                                            </span>
                                                        );
                                                    })()} 
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <div className="action-buttons">
                                                        {employer.isProfileComplete && getEmployerReviewStatus(employer) === 'pending' ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="action-btn btn-approve"
                                                                    onClick={() => handleApprove(employer._id)}
                                                                    disabled={actionLoading[employer._id]}
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="action-btn btn-reject"
                                                                    onClick={() => handleReject(employer._id)}
                                                                    disabled={actionLoading[employer._id]}
                                                                >
                                                                    <i className="fa fa-times"></i>
                                                                    Reject
                                                                </button>
                                                            </>
                                                        ) : (getEmployerReviewStatus(employer) === 'incomplete') ? (
                                                            <span style={{color: '#dc3545', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                                                <i className="fa fa-exclamation-circle"></i>
                                                                Profile not completed
                                                            </span>
                                                        ) : null}
                                                        <button
                                                            type="button"
                                                            className="action-btn btn-view"
                                                            onClick={() => navigate(`/admin/employer-details/${employer._id}`)}
                                                        >
                                                            <i className="fa fa-eye"></i>
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

export default AdminEmployersAllRequest;
