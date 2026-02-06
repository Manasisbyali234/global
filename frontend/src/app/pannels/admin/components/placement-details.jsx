import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../../utils/api';
import { useWebSocket } from '../../../../contexts/WebSocketContext';
import './placement-details.css';
import '../../../../table-id-fix.css';
import '../../../../placement-rejection-styles.css';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
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
    const [studentData, setStudentData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [processingFiles, setProcessingFiles] = useState({});
    const [viewingFile, setViewingFile] = useState(null);
    const [fileStudentData, setFileStudentData] = useState([]);
    const [loadingFileData, setLoadingFileData] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileCredits, setFileCredits] = useState(0);
    const [showingStudentRecords, setShowingStudentRecords] = useState(false);
    const [currentViewingFileId, setCurrentViewingFileId] = useState(null);
    const [showBulkCreditsModal, setShowBulkCreditsModal] = useState(false);
    const [bulkCredits, setBulkCredits] = useState(0);
    const [showStoredDataModal, setShowStoredDataModal] = useState(false);
    const [storedData, setStoredData] = useState([]);
    const [loadingStoredData, setLoadingStoredData] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingFile, setRejectingFile] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPlacementDetails();
        
        // Join admin room for real-time updates
        joinAdminRoom();
    }, [id, joinAdminRoom]);

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
                showSuccess('Placement officer approved successfully!');
                fetchPlacementDetails();
            } else {
                showError('Failed to approve placement officer');
            }
        } catch (error) {
            showError('Error approving placement officer');
            
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
                const displayName = placement?.fileHistory?.find(f => f._id === fileId)?.customName || fileName;
                showSuccess(`File "${displayName}" approved and processed successfully! ${data.message}`);
                // Force immediate refresh
                setTimeout(() => {
                    fetchPlacementDetails();
                }, 500);
                // Refresh student data if currently viewing this file
                if (currentViewingFileId === fileId) {
                    setTimeout(() => {
                        handleViewFileData(fileId, fileName);
                    }, 1000);
                }
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
                showSuccess('Placement officer rejected successfully!');
                fetchPlacementDetails();
            } else {
                showError('Failed to reject placement officer');
            }
        } catch (error) {
            showError('Error rejecting placement officer');
            
        }
    };

    // Global credits assignment removed - now using file-specific credits

    const handleViewFileData = async (fileId, fileName) => {
        try {
            setLoadingData(true);
            setShowingStudentRecords(true);
            setCurrentViewingFileId(fileId);
            
            const response = await fetch(`http://localhost:5000/api/admin/placements/${id}/files/${fileId}/data`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            const data = await response.json();
            if (response.ok && data.success) {
                console.log('Student data received:', data.students);
                console.log('First student sample:', data.students?.[0]);
                setStudentData(data.students || []);
                
                // Scroll to student records table
                setTimeout(() => {
                    const tableElement = document.querySelector('.modern-card.p-4:last-of-type');
                    if (tableElement) {
                        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            } else {
                console.error('Failed to load student data:', data);
                setStudentData([]);
            }
        } catch (error) {
            
            setStudentData([]);
        } finally {
            setLoadingData(false);
        }
    };

    const handleFileCreditsManagement = (file) => {
        setSelectedFile(file);
        setFileCredits(file.credits || 0);
        setShowCreditsModal(true);
    };

    const handleUpdateFileCredits = async () => {
        // Check if file is rejected
        if (selectedFile.status === 'rejected') {
            showWarning('Cannot update credits for rejected files');
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
                const count = data.candidatesUpdated || 0;
                let message = `File credits updated to ${fileCredits}.`;
                if (count > 0) {
                    message += ` ${count} candidates updated successfully.`;
                } else {
                    message += ` Credits will be applied when file is processed.`;
                }
                showSuccess(message);
                setShowCreditsModal(false);
                fetchPlacementDetails();
                // Refresh student data if currently viewing this file
                if (currentViewingFileId === selectedFile._id) {
                    setTimeout(() => {
                        handleViewFileData(selectedFile._id, selectedFile.fileName);
                    }, 500);
                }
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
                showPopup(`File processed successfully! Created: ${data.stats.created}, Skipped: ${data.stats.skipped}. Candidates can now login.`, 'success', 5000);
                
                fetchPlacementDetails();
                if (currentViewingFileId === fileId) {
                    setTimeout(() => {
                        handleViewFileData(fileId, fileName);
                    }, 1000);
                }
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
                // Refresh student data if currently viewing a file
                if (currentViewingFileId) {
                    const currentFile = placement?.fileHistory?.find(f => f._id === currentViewingFileId);
                    if (currentFile && currentFile.status === 'processed') {
                        setTimeout(() => {
                            handleViewFileData(currentViewingFileId, currentFile.fileName);
                        }, 500);
                    }
                }
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

    if (loading) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Loading...</h2>
            </div>
        );
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
                        Placement Officer Details
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
                            </div>
                            <div style={{flex: 1}}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>College Name</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-university me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeName || 'Not Available'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>Placement Officer Name</h4>
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
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>Official Placement Officer Email</h4>
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
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>ID Card</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    {placement.idCard ? (
                                        <>
                                            <i className="fa fa-id-card me-2"></i>
                                            Uploaded
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-id-card me-2"></i>
                                            Not Uploaded
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h4 className="mb-1" style={{color: '#2c3e50', fontWeight: '600', fontSize: '0.95rem'}}>College Official Email ID</h4>
                                <p className="mb-0" style={{color: '#6c757d', fontSize: '1rem'}}>
                                    <i className="fa fa-envelope me-2" style={{color: '#fd7e14'}}></i>
                                    {placement.collegeOfficialEmail || 'Not Available'}
                                </p>
                            </div>
                        </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1">
                                <i className="fa fa-phone me-2" style={{color: '#fd7e14'}}></i>Phone Number
                            </label>
                            <p className="mb-0 font-weight-bold">{placement.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1">
                                <i className="fa fa-calendar me-2" style={{color: '#fd7e14'}}></i>Registration Date
                            </label>
                            <p className="mb-0 font-weight-bold">{new Date(placement.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}</p>
                        </div>
                    </div>
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1">
                                <i className={`fa ${placement.status === 'approved' ? 'fa-check-circle' : 'fa-clock-o'} me-2`} style={{color: '#fd7e14'}}></i>Status
                            </label>
                            <p className="mb-0 font-weight-bold" style={{
                                color: placement.status === 'approved' ? '#28a745' :
                                       placement.status === 'rejected' ? '#dc3545' : '#ffc107'
                            }}>
                                {placement.status || 'Pending'}
                            </p>
                        </div>
                    </div>
                    <div className="info-card" style={{minHeight: '100px', background: 'transparent'}}>
                        <div>
                            <label className="text-muted mb-1">
                                <i className="fa fa-files-o me-2" style={{color: '#fd7e14'}}></i>Files Uploaded
                            </label>
                            <p className="mb-0 font-weight-bold">{placement.fileHistory?.length || 0}</p>
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
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="mb-0" style={{
                                color: '#2c3e50',
                                fontWeight: '600',
                                fontSize: '1.3rem'
                            }}>
                                <i className="fa fa-cloud-upload me-3" style={{fontSize: '1.2rem'}}></i>
                                File Upload History
                            </h5>
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
                                    {placement.fileHistory.length} files
                                </span>
                            </div>
                        </div>
                        <div className="timeline" style={{
                            maxHeight: '450px',
                            overflowY: 'auto',
                            paddingRight: '8px'
                        }}>
                            {placement.fileHistory.slice().reverse().map((file, index) => {
                                console.log('File object:', file); // Debug log
                                return (
                                <div key={file._id || index} className="timeline-item mb-4">
                                    <div style={{
                                        background: 'rgba(255,255,255,0.95)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="d-flex align-items-start">
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                border: '1px solid #dee2e6'
                                            }}>
                                                <i className={`fa ${
                                                    file.status === 'processed' ? 'fa-check-circle' : 
                                                    file.status === 'approved' ? 'fa-check' : 
                                                    file.status === 'rejected' ? 'fa-times' : 'fa-clock-o'
                                                }`} style={{fontSize: '18px', color: '#000'}}></i>
                                            </div>
                                            <div className="ms-4 flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-2" style={{
                                                            color: '#2c3e50',
                                                            fontWeight: '600',
                                                            fontSize: '1.1rem',
                                                            lineHeight: '1.3'
                                                        }}>
                                                            <i className="fa fa-file-excel-o me-2" style={{color: '#1e7e34'}}></i>
                                                            {file.customName || file.fileName}
                                                        </h6>
                                                        {file.customName && (
                                                            <p className="mb-2" style={{
                                                                fontSize: '0.85rem',
                                                                color: '#6c757d',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                Original: {file.fileName}
                                                            </p>
                                                        )}
                                                        {file.isResubmitted && (
                                                            <div style={{marginBottom: '8px'}}>
                                                                <span style={{
                                                                    background: 'linear-gradient(135deg, #17a2b8, #138496)',
                                                                    color: 'white',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600',
                                                                    boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)',
                                                                    display: 'inline-block'
                                                                }}>
                                                                    <i className="fa fa-refresh me-1"></i>
                                                                    RESUBMITTED
                                                                </span>
                                                            </div>
                                                        )}
                                                        {file.university && (
                                                            <p className="mb-1" style={{
                                                                fontSize: '0.85rem',
                                                                color: '#6c757d'
                                                            }}>
                                                                <i className="fa fa-university me-2" style={{color: '#007bff'}}></i>
                                                                {file.university}
                                                            </p>
                                                        )}
                                                        {file.batch && (
                                                            <p className="mb-2" style={{
                                                                fontSize: '0.85rem',
                                                                color: '#6c757d'
                                                            }}>
                                                                <i className="fa fa-users me-2" style={{color: '#6f42c1'}}></i>
                                                                Batch: {file.batch}
                                                            </p>
                                                        )}
                                                        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                                                            <div className="d-flex align-items-center">
                                                                <i className="fa fa-calendar me-2" style={{color: '#007bff'}}></i>
                                                                <span style={{fontSize: '0.85rem', color: '#495057'}}>
                                                                    {new Date(file.uploadedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <i className="fa fa-clock-o me-2" style={{color: '#6f42c1'}}></i>
                                                                <span style={{fontSize: '0.85rem', color: '#495057'}}>
                                                                    {new Date(file.uploadedAt).toLocaleTimeString()}
                                                                </span>
                                                            </div>
                                                            {file.processedAt && (
                                                                <div className="d-flex align-items-center">
                                                                    <i className="fa fa-check-circle me-2" style={{color: '#28a745'}}></i>
                                                                    <span style={{fontSize: '0.85rem', color: '#495057'}}>
                                                                        Processed: {new Date(file.processedAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2 ms-3">
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={() => handleViewFileData(file._id, file.fileName)}
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
                                                            title="View file data in Student Records section"
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
                                                </div>
                                                <div className="mt-3">
                                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                                        {file.status === 'processed' ? (
                                                            <>
                                                                <span style={{
                                                                    background: '#f8f9fa',
                                                                    color: '#000',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '500',
                                                                    border: '1px solid #dee2e6'
                                                                }}>
                                                                    <i className="fa fa-check-circle me-2" style={{color: '#000'}}></i>
                                                                    Processed - Login Ready
                                                                </span>
                                                                {file.candidatesCreated > 0 && (
                                                                    <span style={{
                                                                        background: '#f8f9fa',
                                                                        color: '#000',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '20px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '500',
                                                                        border: '1px solid #dee2e6'
                                                                    }}>
                                                                        <i className="fa fa-users me-2" style={{color: '#000'}}></i>
                                                                        {file.candidatesCreated} candidates can login
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : file.status === 'approved' ? (
                                                            <>
                                                                <span style={{
                                                                    background: 'linear-gradient(135deg, #007bff, #0056b3)',
                                                                    color: 'white',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
                                                                }}>
                                                                    <i className="fa fa-check me-2"></i>
                                                                    Approved
                                                                </span>
                                                                {file.candidatesCreated > 0 && (
                                                                    <span style={{
                                                                        background: 'linear-gradient(135deg, #6c757d, #545b62)',
                                                                        color: 'white',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '20px',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: '500',
                                                                        boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)'
                                                                    }}>
                                                                        <i className="fa fa-user-plus me-2"></i>
                                                                        {file.candidatesCreated} candidates created
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : file.status === 'rejected' ? (
                                                            <>
                                                                <span style={{
                                                                    background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                                                    color: 'white',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                                                                }}>
                                                                    <i className="fa fa-times me-2"></i>
                                                                    Rejected
                                                                </span>
                                                                {file.rejectionReason && (
                                                                    <div style={{
                                                                        marginTop: '8px',
                                                                        padding: '8px 12px',
                                                                        background: '#fff3cd',
                                                                        border: '1px solid #ffc107',
                                                                        borderRadius: '8px',
                                                                        fontSize: '0.85rem',
                                                                        color: '#856404'
                                                                    }}>
                                                                        <i className="fa fa-info-circle me-2"></i>
                                                                        <strong>Reason:</strong> {file.rejectionReason}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : file.status === 'resubmitted' || file.resubmitted === true || file.isResubmitted === true ? (
                                                            <span style={{
                                                                background: 'linear-gradient(135deg, #17a2b8, #138496)',
                                                                color: 'white',
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)'
                                                            }}>
                                                                <i className="fa fa-refresh me-2"></i>
                                                                Resubmitted
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                background: '#FDC360',
                                                                color: '#000',
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                border: '1px solid #FDC360'
                                                            }}>
                                                                <i className="fa fa-clock-o me-2" style={{color: '#000'}}></i>
                                                                Waiting for Admin Approval
                                                            </span>
                                                        )}
                                                        {file.status !== 'rejected' && (
                                                            <span style={{
                                                                background: '#f8f9fa',
                                                                color: '#000',
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                border: '1px solid #dee2e6'
                                                            }}>
                                                                <i className="fa fa-credit-card me-2" style={{color: '#000'}}></i>
                                                                Credits: {file.credits || 0}
                                                            </span>
                                                        )}
                                                        {file.status === 'processed' && (
                                                            <span style={{
                                                                background: 'rgba(253, 126, 20, 0.1)',
                                                                color: '#fd7e14',
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500',
                                                                border: '1px solid rgba(253, 126, 20, 0.2)'
                                                            }}>
                                                                <i className="fa fa-sign-in me-2"></i>
                                                                Ready for Login
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                ) : null}

                {(!placement.fileHistory || placement.fileHistory.length === 0) && (
                    <div className="mt-3 p-3" style={{background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7'}}>
                        <div className="text-center">
                            <i className="fa fa-upload fa-2x text-warning mb-2"></i>
                            <p className="mb-0 text-muted">No Excel/CSV files uploaded yet</p>
                            <small className="text-muted">Files must contain: ID | Candidate Name | College Name | Email | Phone | Course | Password | Credits Assigned</small>
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
                            {placement.status === 'pending' && (
                                <button
                                    className="btn btn-success"
                                    onClick={handleApprove}
                                    style={{borderRadius: '8px'}}
                                >
                                    <i className="fa fa-check me-2"></i>
                                    Approve Officer
                                </button>
                            )}
                            {placement.status === 'approved' && (
                                <div className="alert alert-success mb-0" style={{borderRadius: '8px', padding: '10px 15px'}}>
                                    <i className="fa fa-check-circle me-2"></i>
                                    Officer Approved - Can now login and upload files
                                </div>
                            )}

                            {placement.fileHistory && placement.fileHistory.filter(f => f.status === 'processed').length > 1 && (
                                <button
                                    className="btn btn-warning"
                                    onClick={() => setShowBulkCreditsModal(true)}
                                    style={{borderRadius: '8px'}}
                                    title="Assign credits to all processed files at once"
                                >
                                    <i className="fa fa-credit-card me-2"></i>
                                    Bulk Credits ({placement.fileHistory.filter(f => f.status === 'processed').length} files)
                                </button>
                            )}
                            {placement.fileHistory && placement.fileHistory.length > 0 && (
                                <button
                                    className="btn btn-info"
                                    onClick={handleStoreExcelData}
                                    disabled={processing}
                                    style={{borderRadius: '8px'}}
                                    title="Store complete Excel data in MongoDB"
                                >
                                    {processing ? (
                                        <><i className="fa fa-spinner fa-spin me-2"></i>Storing...</>
                                    ) : (
                                        <><i className="fa fa-database me-2"></i>Store Excel Data</>
                                    )}
                                </button>
                            )}
                            {placement.fileHistory && placement.fileHistory.some(f => f.structuredData && f.structuredData.length > 0) && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleViewStoredData}
                                    style={{borderRadius: '8px'}}
                                    title="View stored Excel data from MongoDB"
                                >
                                    <i className="fa fa-eye me-2"></i>
                                    View Stored Data
                                </button>
                            )}
                        </div>
                        <div className="alert alert-info mb-3" style={{borderRadius: '8px', fontSize: '0.9rem'}}>
                            <i className="fa fa-info-circle me-2"></i>
                            <strong>Excel Format Required:</strong> Files must contain these 4 columns: ID, Candidate Name,  Email, Phone to assign credits per file and "View" to see student records.
                        </div>

                    </div>
                </div>
            </div>

            {/* Student Data */}
            <div className="modern-card p-4" id="studentRecordsTable">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{color: '#2c3e50'}}>
                        <i className="fa fa-graduation-cap me-2"></i>
                        Student Records
                        {studentData.length > 0 && (
                            <span className="badge badge-primary ms-2">{studentData.length}</span>
                        )}
                        {showingStudentRecords && currentViewingFileId && (
                            <small className="text-muted ms-2">
                                (Showing data from selected file)
                            </small>
                        )}
                    </h5>
                    {showingStudentRecords && (
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                                setShowingStudentRecords(false);
                                setCurrentViewingFileId(null);
                                setStudentData([]);
                            }}
                            style={{borderRadius: '6px'}}
                        >
                            <i className="fa fa-times me-2"></i>
                            Clear View
                        </button>
                    )}
                </div>
                
                {loadingData ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-2" role="status"></div>
                        <p className="text-muted">Loading student data...</p>
                    </div>
                ) : studentData.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped" style={{minWidth: '600px'}}>
                            <thead className="thead-light">
                                <tr>
                                    <th style={{minWidth: '80px', width: '80px'}}>ID</th>
                                    <th style={{minWidth: '150px'}}>Name</th>
                                    <th style={{minWidth: '200px'}}>Email</th>
                                    <th style={{minWidth: '120px'}}>Phone</th>
                                    <th style={{minWidth: '80px'}}>Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.map((student, index) => (
                                    <tr key={index}>
                                        <td style={{minWidth: '80px', width: '80px', fontWeight: 'bold', backgroundColor: '#f8f9fa'}}>
                                            <span className="badge badge-primary" style={{fontSize: '12px', padding: '4px 8px', display: 'inline-block'}}>
                                                {student.id || student.ID || student.candidateId || (index + 1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-sm me-2" style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#FDC36020',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#FDC360',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {(student.name || 'N').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="company-name">{student.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {student.email || 'N/A'}
                                        </td>
                                        <td>
                                            {student.phone || '-'}
                                        </td>
                                        <td style={{verticalAlign: 'top', paddingTop: '12px'}}>
                                            <span className="status-badge status-approved">
                                                {student.credits || (() => {
                                                    if (currentViewingFileId) {
                                                        const currentFile = placement?.fileHistory?.find(f => f._id === currentViewingFileId);
                                                        return currentFile?.credits || 0;
                                                    }
                                                    return 0;
                                                })()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="fa fa-users fa-3x text-muted mb-3"></i>
                        <h6 className="text-muted">
                            {showingStudentRecords ? 'No data in selected file' : 'No student data to display'}
                        </h6>
                        <p className="text-muted mb-0">
                            {showingStudentRecords 
                                ? 'The selected file appears to be empty or has no valid student data' 
                                : 'Click the "View" button next to any uploaded file to see its student records here'
                            }
                        </p>
                    </div>
                )}
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
                                        onChange={(e) => setFileCredits(Math.min(10000, Math.max(0, parseInt(e.target.value) || 0)))}
                                        min="0"
                                        max="10000"
                                        placeholder="Enter new credits"
                                    />
                                    <small className="text-muted">Credits will be applied to all students in this file and updated in their candidate dashboard</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreditsModal(false)}>Cancel</button>
                                <button type="button" className="btn" onClick={handleUpdateFileCredits} style={{backgroundColor: '#FDC360', border: '1px solid #FDC360', color: '#000'}}>
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
                                        onChange={(e) => setBulkCredits(Math.min(10000, Math.max(0, parseInt(e.target.value) || 0)))}
                                        min="0"
                                        max="10000"
                                        placeholder="Enter credits for all files"
                                    />
                                    <small className="text-muted">Credits will be applied to all students in all uploaded files and updated in their candidate dashboards</small>
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
                                <button type="button" className="btn btn-warning" onClick={handleBulkCreditsUpdate}>
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
                                                                {record.processedAt ? new Date(record.processedAt).toLocaleDateString() : '-'}
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
                                    Please provide a clear reason for rejecting this file. The placement officer will see this reason and can resubmit a corrected version.
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
