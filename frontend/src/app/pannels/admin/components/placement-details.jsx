import { useMemo, useState, useEffect } from 'react';
import { formatDate } from '../../../../utils/dateFormatter';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../../utils/api';
import { useWebSocket } from '../../../../contexts/WebSocketContext';
import PageLoader from '../../../../components/PageLoader';
import './placement-details.css';
import '../../../../table-id-fix.css';
import '../../../../placement-rejection-styles.css';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';

const FILE_STATUS_CONFIG = {
    pending: {
        badgeClass: 'is-pending',
        iconClass: 'fa-clock-o',
        label: 'Waiting for Admin Approval'
    },
    approved: {
        badgeClass: 'is-approved',
        iconClass: 'fa-check',
        label: 'Approved'
    },
    processed: {
        badgeClass: 'is-processed',
        iconClass: 'fa-check-circle',
        label: 'Processed - Login Ready'
    },
    rejected: {
        badgeClass: 'is-rejected',
        iconClass: 'fa-times',
        label: 'Rejected'
    },
    resubmitted: {
        badgeClass: 'is-resubmitted',
        iconClass: 'fa-refresh',
        label: 'Resubmitted'
    }
};

const FILE_STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'resubmitted', label: 'Resubmitted' }
];

const getNormalizedFileStatus = (file) => {
    const rawStatus = String(file?.status || '').trim().toLowerCase();

    if (rawStatus === 'processed') {
        return 'processed';
    }

    if (rawStatus === 'approved') {
        return 'approved';
    }

    if (rawStatus === 'rejected') {
        return 'rejected';
    }

    if (rawStatus === 'resubmitted' || file?.resubmitted === true || file?.isResubmitted === true) {
        return 'resubmitted';
    }

    return 'pending';
};

function PlacementDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { joinAdminRoom } = useWebSocket();
    const [placement, setPlacement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Removed global credits state - now using file-specific credits
    const [processing, setProcessing] = useState(false);
    const [processingFiles, setProcessingFiles] = useState({});
    const [viewingFile, setViewingFile] = useState(null);
    const [fileStudentData, setFileStudentData] = useState([]);
    const [loadingFileData, setLoadingFileData] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileCredits, setFileCredits] = useState(0);
    const [showBulkCreditsModal, setShowBulkCreditsModal] = useState(false);
    const [bulkCredits, setBulkCredits] = useState(0);
    const [showStoredDataModal, setShowStoredDataModal] = useState(false);
    const [storedData, setStoredData] = useState([]);
    const [loadingStoredData, setLoadingStoredData] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingFile, setRejectingFile] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedCourseName, setSelectedCourseName] = useState('all');

    const [viewImageModal, setViewImageModal] = useState(null); // { src, title }

    const [selectedFileStatus, setSelectedFileStatus] = useState('all');

    useEffect(() => {
        fetchPlacementDetails();
        
        // Join admin room for real-time updates
        joinAdminRoom();
    }, [id, joinAdminRoom]);

    const courseNameOptions = useMemo(() => {
        const courseNames = new Set();
        (placement?.fileHistory || []).forEach((file) => {
            const courseName = String(file?.customName || '').trim();
            if (courseName) {
                courseNames.add(courseName);
            }
        });

        return Array.from(courseNames).sort((a, b) => a.localeCompare(b));
    }, [placement]);

    const filteredFileHistory = useMemo(() => {
        let files = placement?.fileHistory || [];

        if (selectedCourseName !== 'all') {
            files = files.filter((file) => String(file?.customName || '').trim().toLowerCase() === selectedCourseName);
        }

        if (selectedFileStatus !== 'all') {
            files = files.filter((file) => getNormalizedFileStatus(file) === selectedFileStatus);
        }

        return files;
    }, [placement, selectedCourseName, selectedFileStatus]);

    const displayedFileHistory = useMemo(() => (
        filteredFileHistory.slice().reverse()
    ), [filteredFileHistory]);

    const fetchPlacementDetails = async () => {
        try {
            setLoading(true);
            const response = await api.getPlacementDetails(id);
            
            if (response.success) {
                
                
                
                setPlacement(response.placement);
                // Credits are now managed per file, not globally
            } else {
                setError(response.message || 'Failed to fetch placement details');
            }
        } catch (error) {
            setError('Error fetching placement details');
            
        } finally {
            setLoading(false);
        }
    };

    // Removed global view data functionality - only file-specific viewing is allowed

    const handleApprove = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'approved', isApproved: true })
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('Placement Dean approved successfully!');
                fetchPlacementDetails();
            } else {
                showError('Failed to approve Placement Dean');
            }
        } catch (error) {
            showError('Error approving Placement Dean');
            
        }
    };



    const handleFileApprove = async (fileId, fileName) => {
        const file = placement?.fileHistory?.find(f => f._id === fileId);
        const displayName = file?.customName || fileName;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'approving'}));
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/files/${fileId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName })
            });
            const data = await response.json();
            if (data.success) {
                showSuccess(data.message);
                // Force immediate refresh
                setTimeout(() => {
                    fetchPlacementDetails();
                }, 500);
            } else {
                showError(`Failed to approve file: ${data.message}`);
            }
        } catch (error) {
            showError(`Error approving file: ${error.message}`);
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
        }
    };

    const handleFileReject = async (fileId, fileName) => {
        const file = placement?.fileHistory?.find(f => f._id === fileId);
        setRejectingFile({ id: fileId, name: file?.customName || fileName });
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const confirmFileRejection = async () => {
        if (!rejectionReason.trim()) {
            showWarning('Rejection reason is required');
            return;
        }
        
        try {
            setProcessingFiles(prev => ({...prev, [rejectingFile.id]: 'rejecting'}));
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/files/${rejectingFile.id}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
            });
            const data = await response.json();
            if (data.success) {
                showSuccess(`File "${rejectingFile.name}" rejected successfully!`);
                setShowRejectModal(false);
                setRejectingFile(null);
                setRejectionReason('');
                // Force immediate refresh
                setTimeout(() => {
                    fetchPlacementDetails();
                }, 500);
            } else {
                showError(`Failed to reject file: ${data.message}`);
            }
        } catch (error) {
            showError(`Error rejecting file: ${error.message}`);
        } finally {
            setProcessingFiles(prev => ({...prev, [rejectingFile.id]: null}));
        }
    };

    const handleReject = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'rejected', isApproved: false })
            });
            const data = await response.json();
            if (data.success) {
                showSuccess('Placement Dean rejected successfully!');
                fetchPlacementDetails();
            } else {
                showError('Failed to reject Placement Dean');
            }
        } catch (error) {
            showError('Error rejecting Placement Dean');
            
        }
    };

    // Global credits assignment removed - now using file-specific credits

    const handleOpenFileRecordsPage = (fileId) => {
        navigate(`/admin/placement-details/${id}/files/${fileId}`);
    };

    const handleFileCreditsManagement = (file) => {
        setSelectedFile(file);
        setFileCredits(Math.max(file.credits || 0, 1));
        setShowCreditsModal(true);
    };

    const handleUpdateFileCredits = async () => {
        // Check if file is rejected
        if (selectedFile.status === 'rejected') {
            showWarning('Cannot update credits for rejected files');
            return;
        }

        if (fileCredits <= 0) {
            showWarning('Credits must be greater than 0');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/files/${selectedFile._id}/credits`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credits: fileCredits })
            });
            
            const data = await response.json();
            if (data.success) {
                const message = `${fileCredits} credit assigned .Credits will be processed successfully upon approval.`;
                showSuccess(message);
                setShowCreditsModal(false);
                fetchPlacementDetails();
            } else {
                showError(`Failed to update credits: ${data.message}`);
            }
        } catch (error) {
            showError(`Error updating credits: ${error.message}`);
        }
    };

    const handleProcessData = async (fileId, fileName) => {
        const file = placement?.fileHistory?.find(f => f._id === fileId);
        const displayName = file?.customName || fileName;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'processing'}));
            
            const url = `http://localhost:5000/api/admin/placements/${id}/files/${fileId}/process`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const createdCount = data.stats?.created ?? 0;
                const skippedCount = data.stats?.skipped ?? 0;
                const successMessage = `${displayName} processed successfully. Created: ${createdCount}, Skipped: ${skippedCount}. Candidates can now login.`;
                showPopup(successMessage, 'success', 5000);
                fetchPlacementDetails();
            } else {
                showError(`Failed to process file: ${data.message}`);
            }
        } catch (error) {
            showError(`Error processing file: ${error.message}`);
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
        }
    };

    const handleBulkCreditsUpdate = async () => {
        if (bulkCredits <= 0) {
            showWarning('Credits must be greater than 0');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/bulk-credits`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credits: bulkCredits })
            });
            
            const data = await response.json();
            if (data.success) {
                const nonProcessedCount = placement?.fileHistory?.filter(f => f.status !== 'processed').length || 0;
                let message = `Bulk credits updated successfully! ${data.message}`;
                if (nonProcessedCount > 0) {
                    message += ` Note: ${nonProcessedCount} non-processed file(s) excluded.`;
                }
                showSuccess(message);
                setShowBulkCreditsModal(false);
                fetchPlacementDetails();
            } else {
                showError(`Failed to update bulk credits: ${data.message}`);
            }
        } catch (error) {
            showError(`Error updating bulk credits: ${error.message}`);
        }
    };

    const handleStoreExcelData = async () => {
        try {
            setProcessing(true);
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/store-excel-data`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                showPopup(`Excel data stored successfully! Files: ${data.stats.totalFilesProcessed}, Records: ${data.stats.totalRecordsStored}`, 'success', 5000);
                fetchPlacementDetails();
            } else {
                showError(`Failed to store Excel data: ${data.message}`);
            }
        } catch (error) {
            showError(`Error storing Excel data: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleViewStoredData = async () => {
        try {
            setLoadingStoredData(true);
            setShowStoredDataModal(true);
            
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/stored-excel-data`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setStoredData(data.data || []);
            } else {
                showError(`Failed to load stored data: ${data.message}`);
                setStoredData([]);
            }
        } catch (error) {
            showError(`Error loading stored data: ${error.message}`);
            setStoredData([]);
        } finally {
            setLoadingStoredData(false);
        }
    };

    const formatFileTime = (value) => {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderFileStatus = (file) => {
        const normalizedStatus = getNormalizedFileStatus(file);
        const { badgeClass, iconClass, label } = FILE_STATUS_CONFIG[normalizedStatus];

        return (
            <div className="placement-file-history-status-stack">
                <span className={`placement-file-history-status-badge ${badgeClass}`}>
                    <i className={`fa ${iconClass} me-2`}></i>
                    {label}
                </span>
                {normalizedStatus === 'approved' && file.candidatesCreated > 0 && (
                    <span className="placement-file-history-status-meta">
                        {file.candidatesCreated} candidate{file.candidatesCreated === 1 ? '' : 's'} created
                    </span>
                )}
                {normalizedStatus === 'rejected' && file.rejectionReason && (
                    <div className="placement-file-history-status-note">
                        <strong>Reason:</strong> {file.rejectionReason}
                    </div>
                )}
            </div>
        );
    };

    const renderFileActions = (file) => (
        <div className="placement-file-history-actions">
            <button
                className="btn btn-sm"
                onClick={() => handleOpenFileRecordsPage(file._id)}
                style={{
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#FDC360',
                    border: '1px solid #FDC360',
                    color: '#000'
                }}
                title="View file data on a new page"
            >
                <i className="fa fa-eye me-2" style={{color: '#000'}}></i>View
            </button>
            {file.status !== 'rejected' && (
                <button
                    className="btn btn-sm"
                    onClick={() => handleFileCreditsManagement(file)}
                    style={{
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#FDC360',
                        border: '1px solid #FDC360',
                        color: '#000'
                    }}
                    title="Manage credits for this file"
                >
                    <i className="fa fa-credit-card me-2" style={{color: '#000'}}></i>Credits
                </button>
            )}
            {file.status === 'pending' && (
                <>
                    <button
                        className="btn btn-sm"
                        onClick={() => handleFileApprove(file._id, file.fileName)}
                        disabled={processingFiles[file._id]}
                        style={{
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            backgroundColor: '#FDC360',
                            border: '1px solid #FDC360',
                            color: '#000'
                        }}
                        title="Approve and process this file"
                    >
                        {processingFiles[file._id] === 'approving' ? (
                            <i className="fa fa-spinner fa-spin"></i>
                        ) : (
                            <><i className="fa fa-check me-2"></i>Approve</>
                        )}
                    </button>
                    <button
                        className="btn btn-sm"
                        onClick={() => handleFileReject(file._id, file.fileName)}
                        disabled={processingFiles[file._id]}
                        style={{
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            backgroundColor: '#FDC360',
                            border: '1px solid #FDC360',
                            color: '#000'
                        }}
                        title="Reject this file"
                    >
                        {processingFiles[file._id] === 'rejecting' ? (
                            <i className="fa fa-spinner fa-spin"></i>
                        ) : (
                            <><i className="fa fa-times me-2"></i>Reject</>
                        )}
                    </button>
                </>
            )}
        </div>
    );

    if (loading) {
        return <PageLoader pageName="Placement Details" />;
    }

    if (error) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Error: {error}</h2>
            </div>
        );
    }

    return (
        <div className="placement-details-page container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
            {/* Header */}
            <div className="modern-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0" style={{color: '#2c3e50', fontWeight: '600'}}>
                        <i className="fa fa-user-circle me-2"></i>
                        Placement Dean Details
                    </h2>
                    <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                            // Check if we came from approved section or use browser history
                            const referrer = location.state?.from || document.referrer;
                            if (referrer && referrer.includes('admin-placement-approved')) {
                                navigate('/admin/admin-placement-approved');
                            } else if (referrer && referrer.includes('admin-placement-rejected')) {
                                navigate('/admin/admin-placement-rejected');
                            } else {
                                // Default to all submissions (manage) or go back in history
                                navigate(-1);
                            }
                        }}
                        style={{borderRadius: '8px'}}
                    >
                        <i className="fa fa-arrow-left me-2"></i>
                        Back
                    </button>
                </div>
            </div>

            {/* Officer Information */}
            <div className="modern-card mb-4 p-4">
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="d-flex align-items-start gap-4">
                            <div className="text-center">
                                {placement.logo ? (
                                    <img 
                                        src={placement.logo} 
                                        alt="College Logo" 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'contain',
                                            borderRadius: '12px',
                                            border: '2px solid #e9ecef',
                                            background: '#f8f9fa'
                                        }}
                                    />
                                ) : (
                                    <div 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '12px',
                                            border: '2px dashed #ccc',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <i className="fa fa-university fa-2x text-muted"></i>
                                    </div>
                                )}
                                <small className="text-muted d-block mt-2">College Logo</small>
                                {placement.logo && (
                                    <button
                                        className="btn btn-sm mt-1"
                                        onClick={() => setViewImageModal({ src: placement.logo, title: 'College Logo' })}
                                        style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#FDC360', border: '1px solid #FDC360', color: '#000', borderRadius: '6px' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                )}
                            </div>
                            <div className="text-center">
                                {placement.idCard ? (
                                    <img 
                                        src={placement.idCard} 
                                        alt="ID Card" 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'contain',
                                            borderRadius: '12px',
                                            border: '2px solid #e9ecef',
                                            background: '#f8f9fa'
                                        }}
                                    />
                                ) : (
                                    <div 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '12px',
                                            border: '2px dashed #ccc',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <i className="fa fa-id-card fa-2x text-muted"></i>
                                    </div>
                                )}
                                <small className="text-muted d-block mt-2">ID Card</small>
                                {placement.idCard && (
                                    <button
                                        className="btn btn-sm mt-1"
                                        onClick={() => setViewImageModal({ src: placement.idCard, title: 'ID Card' })}
                                        style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#FDC360', border: '1px solid #FDC360', color: '#000', borderRadius: '6px' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                )}
                            </div>
                            <div style={{flex: 1}}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>University/College Name</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-university me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeName || 'Not Available'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>Placement Dean Name</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-user me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.name}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>College Address</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-map-marker me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeAddress || 'Not Available'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>Official Placement Dean Email</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-envelope me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.email}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>College Official Phone Number</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-phone me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeOfficialPhone || 'Not Available'}
                                </p>
                            </div>

                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>College Official Email ID</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-envelope me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeOfficialEmail || 'Not Available'}
                                </p>
                            </div>
                            {placement.additionalOfficialEmail && (
                                <div className="col-md-6 mb-3">
                                    <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>Additional College Official Email</h4>
                                    <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                        <i className="fa fa-envelope me-2" style={{color: '#fd7e14'}}></i>
                                        {placement.additionalOfficialEmail}
                                    </p>
                                </div>
                            )}
                        </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1 placement-summary-label">
                                <i className="fa fa-phone me-2" style={{color: '#fd7e14'}}></i>Phone Number
                            </label>
                            <p className="mb-0 font-weight-bold placement-summary-value">{placement.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1 placement-summary-label">
                                <i className="fa fa-calendar me-2" style={{color: '#fd7e14'}}></i>Registration Date
                            </label>
                            <p className="mb-0 font-weight-bold placement-summary-value">{formatDate(placement.createdAt)}</p>
                        </div>
                    </div>
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1 placement-summary-label">
                                <i className="fa fa-file-text me-2" style={{color: '#fd7e14'}}></i>Files Uploaded
                            </label>
                            <p className="mb-0 font-weight-bold placement-summary-value">{placement.fileHistory?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* File Upload History */}
                {placement.fileHistory && placement.fileHistory.length > 0 ? (
                    <div className="mt-4" style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="placement-file-history-toolbar mb-4">
                            <h5 className="mb-0" style={{
                                color: '#2c3e50',
                                fontWeight: '600',
                                fontSize: '1.3rem'
                            }}>
                                <i className="fa fa-cloud-upload me-3" style={{fontSize: '1.2rem'}}></i>
                                File Upload History
                            </h5>
                            <div className="placement-file-history-toolbar-controls">
                                <div style={{
                                    background: '#f8f9fa',
                                    borderRadius: '20px',
                                    padding: '8px 16px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        color: '#495057',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>
                                        {filteredFileHistory.length} of {placement.fileHistory.length} files
                                    </span>
                                </div>
                                <div className="placement-file-history-filter-wrap">
                                    <label className="placement-file-history-filter-label" htmlFor="placement-university-filter">
                                        Course Name
                                    </label>
                                    <select
                                        id="placement-university-filter"
                                        className="form-select placement-file-history-filter-select"
                                        value={selectedCourseName}
                                        onChange={(event) => setSelectedCourseName(event.target.value)}
                                    >
                                        <option value="all">All Course Name</option>
                                        {courseNameOptions.map((courseName) => (
                                            <option key={courseName} value={courseName.toLowerCase()}>
                                                {courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="placement-file-history-filter-wrap">
                                    <label className="placement-file-history-filter-label" htmlFor="placement-file-status-filter">
                                        Status
                                    </label>
                                    <select
                                        id="placement-file-status-filter"
                                        className="form-select placement-file-history-filter-select"
                                        value={selectedFileStatus}
                                        onChange={(event) => setSelectedFileStatus(event.target.value)}
                                    >
                                        {FILE_STATUS_FILTER_OPTIONS.map((statusOption) => (
                                            <option key={statusOption.value} value={statusOption.value}>
                                                {statusOption.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="placement-file-history-table-scroll">
                            {filteredFileHistory.length === 0 ? (
                                <div className="placement-file-history-empty">
                                    <i className="fa fa-filter"></i>
                                    <span>No uploaded files match the selected filters.</span>
                                </div>
                                                        ) : (
                                <table className="table placement-file-history-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Course / File</th>
                                            <th scope="col">University</th>
                                            <th scope="col">Batch</th>
                                            <th scope="col">Uploaded</th>
                                            <th scope="col">Processed</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Credits</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedFileHistory.map((file, index) => (
                                            <tr key={file._id || index}>
                                                <td className="placement-file-history-index-cell">{index + 1}</td>
                                                <td className="placement-file-history-primary-cell">
                                                    <div className="placement-file-history-file-name">
                                                        <i className="fa fa-file-excel-o me-2" style={{color: '#1e7e34'}}></i>
                                                        {file.customName || file.fileName}
                                                    </div>
                                                    {file.customName && file.fileName && file.customName !== file.fileName && (
                                                        <div className="placement-file-history-secondary-text">
                                                            Source file: {file.fileName}
                                                        </div>
                                                    )}
                                                    {file.isResubmitted && (
                                                        <span className="placement-file-history-inline-badge">
                                                            <i className="fa fa-refresh me-1"></i>
                                                            Resubmitted
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="placement-file-history-secondary-text">
                                                        {file.university || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="placement-file-history-secondary-text">
                                                        {file.batch || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="placement-file-history-date">
                                                        {file.uploadedAt ? formatDate(file.uploadedAt) : '-'}
                                                    </div>
                                                    <div className="placement-file-history-secondary-text">
                                                        {formatFileTime(file.uploadedAt)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="placement-file-history-date">
                                                        {file.processedAt ? formatDate(file.processedAt) : '-'}
                                                    </div>
                                                    <div className="placement-file-history-secondary-text">
                                                        {formatFileTime(file.processedAt)}
                                                    </div>
                                                </td>
                                                <td>{renderFileStatus(file)}</td>
                                                <td>
                                                    {file.status !== 'rejected' ? (
                                                        <span className="placement-file-history-credit-badge">
                                                            <i className="fa fa-credit-card me-2"></i>
                                                            {file.credits || 0}
                                                        </span>
                                                    ) : (
                                                        <span className="placement-file-history-secondary-text">-</span>
                                                    )}
                                                </td>
                                                <td className="placement-file-history-actions-cell">
                                                    {renderFileActions(file)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ) : null}

                {(!placement.fileHistory || placement.fileHistory.length === 0) && (
                    <div className="mt-3 p-3" style={{background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7'}}>
                        <div className="text-center">
                            <i className="fa fa-upload fa-2x text-warning mb-2"></i>
                            <p className="mb-0 text-muted">No Excel/CSV files uploaded yet</p>
                            <small className="text-muted">Files must contain: ID |  Candidate Name |  Email | Phone Number </small>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="modern-card p-4">
                        <h5 className="mb-3" style={{color: '#2c3e50'}}>
                            <i className="fa fa-cogs me-2"></i>
                            Actions
                            <button 
                                className="btn btn-sm btn-outline-secondary ms-2"
                                onClick={fetchPlacementDetails}
                                style={{borderRadius: '6px'}}
                            >
                                <i className="fa fa-refresh"></i>
                            </button>
                        </h5>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {placement.status === 'approved' && (
                                <div className="alert alert-success mb-0" style={{borderRadius: '8px', padding: '10px 15px'}}>
                                    <i className="fa fa-check-circle me-2"></i>
                                    Officer Approved - Can now login and upload files
                                </div>
                            )}

                            {placement.fileHistory && placement.fileHistory.filter(f => f.status === 'processed').length > 1 && (
                                <button
                                    className="btn btn-warning"
                                    onClick={() => {
                                        setBulkCredits((current) => Math.max(current || 0, 1));
                                        setShowBulkCreditsModal(true);
                                    }}
                                    style={{borderRadius: '8px'}}
                                    title="Assign credits to all processed files at once"
                                >
                                    <i className="fa fa-credit-card me-2"></i>
                                    Bulk Credits ({placement.fileHistory.filter(f => f.status === 'processed').length} files)
                                </button>
                            )}

                        </div>
                        <div className="alert alert-info mb-3" style={{borderRadius: '8px', fontSize: '0.9rem'}}>
                            <i className="fa fa-info-circle me-2"></i>
                            <strong>Excel Format Required:</strong> Files must contain these 4 columns: ID, Candidate Name, Email, Phone Number to assign credits per file and "View" to see student records.
                        </div>

                    </div>
                </div>
            </div>

            {/* File Data Modal */}
            {viewingFile && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}} onClick={() => setViewingFile(null)}>
                    <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-file-excel-o me-2"></i>
                                    {viewingFile.name} - Student Data
                                </h5>
                                <button type="button" className="close" onClick={() => setViewingFile(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {loadingFileData ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary mb-2"></div>
                                        <p>Loading file data...</p>
                                    </div>
                                ) : fileStudentData.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                    <th>Password</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fileStudentData.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{student.name || 'N/A'}</td>
                                                        <td>{student.phone || '-'}</td>
                                                        <td>{student.email || 'N/A'}</td>
                                                        <td>
                                                            <code style={{background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px'}}>
                                                                {student.password || 'N/A'}
                                                            </code>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fa fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                                        <p>No data found in this file</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setViewingFile(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credits Management Modal */}
            {showCreditsModal && selectedFile && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}} onClick={() => setShowCreditsModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-credit-card me-2"></i>
                                    File Credits Management - {selectedFile.fileName}
                                </h5>
                                <button type="button" className="close" onClick={() => setShowCreditsModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Current Credits: <strong>{selectedFile.credits || 0}</strong></label>
                                    <input
                                        type="number"
                                        className="form-control mt-2"
                                        value={fileCredits}
                                        onChange={(e) => setFileCredits(Math.min(10000, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                        min="1"
                                        max="10000"
                                        placeholder="Enter credits greater than 0"
                                    />
                                    <small className="text-muted">Credits must be greater than 0 and will be applied to all students in this file</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreditsModal(false)}>Cancel</button>
                                <button type="button" className="btn" onClick={handleUpdateFileCredits} disabled={fileCredits <= 0} style={{backgroundColor: '#FDC360', border: '1px solid #FDC360', color: '#000'}}>
                                    <i className="fa fa-save me-2" style={{color: '#000'}}></i>Update File Credits
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Credits Management Modal */}
            {showBulkCreditsModal && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}} onClick={() => setShowBulkCreditsModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-credit-card me-2"></i>
                                    Bulk Credits Assignment - All Files
                                </h5>
                                <button type="button" className="close" onClick={() => setShowBulkCreditsModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <i className="fa fa-info-circle me-2"></i>
                                    This will update credits for all {placement?.fileHistory?.filter(f => f.status === 'processed').length || 0} processed files and their associated students.
                                </div>
                                <div className="form-group">
                                    <label>Credits to Assign:</label>
                                    <input
                                        type="number"
                                        className="form-control mt-2"
                                        value={bulkCredits}
                                        onChange={(e) => setBulkCredits(Math.min(10000, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                        min="1"
                                        max="10000"
                                        placeholder="Enter credits greater than 0"
                                    />
                                    <small className="text-muted">Credits must be greater than 0 and will be applied to all students in processed files</small>
                                </div>
                                <div className="mt-3">
                                    <strong>Files that will be updated:</strong>
                                    <ul className="list-unstyled mt-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                        {placement?.fileHistory?.filter(f => f.status === 'processed').map((file, index) => (
                                            <li key={file._id || index} className="mb-1">
                                                <i className="fa fa-file-excel-o me-2 text-success"></i>
                                                {file.fileName} 
                                                <span className="badge badge-secondary ms-2">Current: {file.credits || 0}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {placement?.fileHistory?.filter(f => f.status !== 'processed').length > 0 && (
                                        <div className="alert alert-warning mt-2">
                                            <i className="fa fa-exclamation-triangle me-2"></i>
                                            Only processed files will be updated. {placement?.fileHistory?.filter(f => f.status !== 'processed').length} file(s) excluded (pending/rejected).
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkCreditsModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-warning" onClick={handleBulkCreditsUpdate} disabled={bulkCredits <= 0}>
                                    <i className="fa fa-save me-2"></i>Update All Files Credits
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stored Data Modal */}
            {showStoredDataModal && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}} onClick={() => setShowStoredDataModal(false)}>
                    <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-database me-2"></i>
                                    Stored Excel Data from MongoDB
                                </h5>
                                <button type="button" className="close" onClick={() => setShowStoredDataModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {loadingStoredData ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary mb-2"></div>
                                        <p>Loading stored data from MongoDB...</p>
                                    </div>
                                ) : storedData.length > 0 ? (
                                    <div className="table-responsive">
                                        <div className="alert alert-success mb-3">
                                            <i className="fa fa-check-circle me-2"></i>
                                            Found {storedData.length} records stored in MongoDB
                                        </div>
                                        <table className="table table-hover table-sm">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Row</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Course</th>
                                                    <th>Credits</th>
                                                    <th>Stored At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {storedData.slice(0, 100).map((record, index) => (
                                                    <tr key={index}>
                                                        <td>{record.rowIndex}</td>
                                                        <td>{record.candidateName || 'N/A'}</td>
                                                        <td>{record.email || 'N/A'}</td>
                                                        <td>{record.phone || '-'}</td>
                                                        <td>{record.course || '-'}</td>
                                                        <td>
                                                            <span className="badge badge-info">
                                                                {record.creditsAssigned || 0}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {record.processedAt ? formatDate(record.processedAt) : '-'}
                                                            </small>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {storedData.length > 100 && (
                                            <div className="alert alert-info">
                                                <i className="fa fa-info-circle me-2"></i>
                                                Showing first 100 records. Total: {storedData.length} records
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fa fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                                        <p>No stored data found in MongoDB</p>
                                        <small className="text-muted">Use the "Store Excel Data" button to save Excel data to MongoDB first</small>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowStoredDataModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image View Modal */}
            {viewImageModal && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.7)'}} onClick={() => setViewImageModal(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-image me-2"></i>
                                    {viewImageModal.title}
                                </h5>
                                <button type="button" className="close" onClick={() => setViewImageModal(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body text-center">
                                <img
                                    src={viewImageModal.src}
                                    alt={viewImageModal.title}
                                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setViewImageModal(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Rejection Modal */}
            {showRejectModal && rejectingFile && (
                <div className="modal fade show" style={{display: 'block', background: 'rgba(0,0,0,0.5)'}} onClick={() => setShowRejectModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-times-circle me-2" style={{color: '#dc3545'}}></i>
                                    Reject File: {rejectingFile.name}
                                </h5>
                                <button type="button" className="close" onClick={() => setShowRejectModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-warning">
                                    <i className="fa fa-exclamation-triangle me-2"></i>
                                    Please provide a clear reason for rejecting this file. The Placement Dean will see this reason and can resubmit a corrected version.
                                </div>
                                <div className="form-group">
                                    <label htmlFor="rejectionReason">Rejection Reason *</label>
                                    <textarea
                                        id="rejectionReason"
                                        className="form-control"
                                        rows="4"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter the reason for rejection (e.g., Invalid data format, Missing required columns, Duplicate entries, etc.)"
                                        maxLength="500"
                                    />
                                    <small className="text-muted">
                                        {rejectionReason.length}/500 characters
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectingFile(null);
                                        setRejectionReason('');
                                    }}
                                    disabled={processingFiles[rejectingFile?.id]}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger reject-file-btn" 
                                    onClick={confirmFileRejection}
                                    disabled={!rejectionReason.trim() || processingFiles[rejectingFile?.id]}
                                >
                                    {processingFiles[rejectingFile?.id] ? (
                                        <><i className="fa fa-spinner fa-spin me-2"></i>Rejecting...</>
                                    ) : (
                                        <><i className="fa fa-times me-2"></i>Reject File</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlacementDetails;

