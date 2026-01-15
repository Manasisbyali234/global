import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './admin-emp-manage-styles.css';
import './admin-search-styles.css';
import SearchBar from '../../../../components/SearchBar';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminEmployersAllRequest() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({});
    const [statusFilter, setStatusFilter] = useState('incomplete');

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchEmployers();
    }, []);

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
        let filtered = [];
        
        switch(status) {
            case 'pending':
                filtered = employersList.filter(emp => 
                    emp.isApproved !== true && 
                    emp.status !== 'approved' && 
                    emp.status !== 'rejected' &&
                    emp.status !== 'inactive' &&
                    emp.profileSubmittedForReview
                );
                break;
            case 'incomplete':
                filtered = employersList.filter(emp => 
                    !emp.profileSubmittedForReview &&
                    emp.isApproved !== true && 
                    emp.status !== 'approved'
                );
                break;
            case 'approved':
                filtered = employersList.filter(emp => 
                    emp.isApproved === true || emp.status === 'approved'
                );
                break;
            case 'rejected':
                filtered = employersList.filter(emp => 
                    emp.status === 'rejected'
                );
                break;
            case 'all':
            default:
                filtered = employersList;
                break;
        }
        
        setFilteredEmployers(filtered);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        filterEmployersByStatus(employers, status);
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
                
                // Force immediate removal from UI
                const updatedEmployers = employers.filter(emp => emp._id !== employerId);
                console.log('Employers before filter:', employers.length);
                console.log('Employers after filter:', updatedEmployers.length);
                
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
                const updatedEmployers = employers.filter(emp => emp._id !== employerId);
                setEmployers(updatedEmployers);
                filterEmployersByStatus(updatedEmployers, statusFilter);
                showSuccess('Employer rejected successfully! Once rejected, you cannot approve or retake this action.');
            } else {
                showError('Failed to reject employer');
            }
        } catch (error) {
            showError('Error rejecting employer');
        } finally {
            setActionLoading(prev => ({ ...prev, [employerId]: false }));
        }
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
            <div>
                <div className="wt-admin-right-page-header clearfix">
                    <h2>Employers Details</h2>
                </div>

                <div className="panel panel-default site-bg-white">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                            <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>Employers ({filteredEmployers.length})</h4>
                            
                            <div className="status-filter" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <label style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>Filter by Status:</label>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        background: '#fff'
                                    }}
                                >
                                    <option value="pending">Under Review</option>
                                    <option value="incomplete">Profile Incomplete</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            
                            <div className="search-section" style={{marginLeft: 'auto'}}>
                                <label className="search-label">
                                    <i className="fa fa-filter"></i> Search by Name or Email
                                </label>
                                <div style={{width: '200px'}}>
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
                                                        const reuploadedDocs = docs.filter(doc => doc.uploaded && doc.reuploadedAt);
                                                        
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
                                                                case 'pending':
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                                case 'incomplete':
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                                default:
                                                                    return { background: 'rgba(255, 122, 0, 0.08)', color: '#FF7A00', borderColor: '#FF7A00' };
                                                            }
                                                        };
                                                        
                                                        const status = employer.isApproved ? 'approved' : 
                                                                      employer.profileSubmittedForReview ? 'pending' : 'incomplete';
                                                        const statusText = employer.isApproved ? 'Approved' : 
                                                                          employer.profileSubmittedForReview ? 'Under Review' : 'Profile Incomplete';
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
                                                        {employer.isProfileComplete && employer.profileSubmittedForReview && !employer.isApproved && employer.status !== 'rejected' ? (
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
                                                        ) : (
                                                            <span style={{color: '#dc3545', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                                                <i className="fa fa-exclamation-circle"></i>
                                                                Profile not completed
                                                            </span>
                                                        )}
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
        </>
    );
}

export default AdminEmployersAllRequest;
