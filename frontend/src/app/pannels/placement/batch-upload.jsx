import { useState, useEffect } from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { showSuccess, showError, showWarning } from '../../../utils/popupNotification';
import { buildPlacementUploadPopup, buildPlacementUploadErrorPopup } from '../../../utils/placementUploadPopup';
import { normalizePlacementUploadErrorMessage } from '../../../utils/placementStudentData';
import { privateUniversityOptions } from '../../../utils/privateUniversityOptions';
import './batch-upload.css';

const legacyBatchUploadUniversityOptions = [
    'Indian Institute of Technology (IIT) Delhi',
    'Indian Institute of Technology (IIT) Bombay',
    'Indian Institute of Technology (IIT) Madras',
    'Indian Institute of Technology (IIT) Kanpur',
    'Indian Institute of Technology (IIT) Kharagpur',
    'Indian Institute of Technology (IIT) Roorkee',
    'Indian Institute of Technology (IIT) Guwahati',
    'Indian Institute of Technology (IIT) Hyderabad',
    'Indian Institute of Science (IISc) Bangalore',
    'National Institute of Technology (NIT) Trichy',
    'National Institute of Technology (NIT) Warangal',
    'National Institute of Technology (NIT) Surathkal',
    'Delhi Technological University (DTU)',
    'Netaji Subhas University of Technology (NSUT)',
    'Birla Institute of Technology and Science (BITS) Pilani',
    'Vellore Institute of Technology (VIT)',
    'Manipal Institute of Technology',
    'SRM Institute of Science and Technology',
    'Amity University',
    'Lovely Professional University (LPU)',
    'Chandigarh University',
    'Thapar Institute of Engineering and Technology',
    'Jadavpur University',
    'Anna University',
    'University of Delhi',
    'Jawaharlal Nehru University (JNU)',
    'Banaras Hindu University (BHU)',
    'Aligarh Muslim University (AMU)',
    'Jamia Millia Islamia'
];

const batchUploadUniversityOptions = Array.from(new Set([
    ...legacyBatchUploadUniversityOptions,
    ...privateUniversityOptions,
    'Other'
]));

function BatchUpload() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, userType, isAuthenticated } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [courseName, setCourseName] = useState('');
    const [university, setUniversity] = useState('');
    const [batch, setBatch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);
    const [placementData, setPlacementData] = useState(null);
    const [resubmitFileId, setResubmitFileId] = useState(null);
    const [showResubmitModal, setShowResubmitModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated() && userType === 'placement') {
            fetchUploadHistory();
        }
    }, [isAuthenticated, userType]);

    const fetchUploadHistory = async () => {
        try {
            const profileData = await api.getPlacementProfile();
            if (profileData && profileData.success) {
                setPlacementData(profileData.placement);
                setUploadHistory(profileData.placement?.fileHistory || []);
            }
        } catch (error) {
            console.error('Error fetching upload history:', error);
        }
    };

    const validateFile = (file) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            showError('Please upload only Excel (.xlsx, .xls) or CSV files.');
            return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showError('File size should be less than 5MB.');
            return false;
        }
        
        return true;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showWarning('Please select a file to upload.');
            return;
        }

        // Check if profile is complete
        if (!placementData?.collegeName || !placementData?.collegeAddress || 
            !placementData?.collegeOfficialEmail || !placementData?.collegeOfficialPhone) {
            showWarning('Please complete your profile in Edit Profile before uploading CSV files.');
            setTimeout(() => navigate('/placement/dashboard'), 1500);
            return;
        }

        if (!courseName.trim()) {
            showWarning('Course Name is required.');
            return;
        }

        if (!university.trim()) {
            showWarning('University name is required.');
            return;
        }

        if (!batch.trim()) {
            showWarning('Batch information is required.');
            return;
        }

        const token = localStorage.getItem('placementToken');
        if (!token) {
            showError('Authentication token missing. Please login again.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('studentData', selectedFile);
            if (courseName.trim()) {
                formData.append('customFileName', courseName.trim());
            }
            if (university.trim()) {
                formData.append('university', university.trim());
            }
            if (batch.trim()) {
                formData.append('batch', batch.trim());
            }

            const data = await api.uploadStudentData(formData);
             
            if (data.success) {
                const popup = buildPlacementUploadPopup(
                    data.message,
                    data.skippedEmails,
                    'Student data uploaded successfully! Waiting for admin approval.'
                );
                showSuccess(popup.message, popup.duration);
                resetForm();
                fetchUploadHistory();
            } else {
                const popup = buildPlacementUploadErrorPopup({
                    message: normalizePlacementUploadErrorMessage(data.message, 'Upload failed'),
                    duplicateEmails: data.duplicateEmails,
                    existingEmails: data.existingEmails,
                    fallbackMessage: 'Upload failed'
                });
                showError(popup.message, popup.duration);
            }
        } catch (error) {
            const popup = buildPlacementUploadErrorPopup({
                message: normalizePlacementUploadErrorMessage(
                    error.response?.data?.message || error.message,
                    'Upload failed. Please try again.'
                ),
                duplicateEmails: error.response?.data?.duplicateEmails,
                existingEmails: error.response?.data?.existingEmails,
                fallbackMessage: 'Upload failed. Please try again.'
            });
            showError(
                popup.message,
                popup.duration
            );
        } finally {
            setUploading(false);
        }
    };

    const handleResubmit = (fileId, fileName, customName) => {
        setResubmitFileId(fileId);
        setCourseName(customName || fileName);
        setShowResubmitModal(true);
    };

    const handleResubmitUpload = async () => {
        if (!selectedFile) {
            showWarning('Please select a file to resubmit.');
            return;
        }

        if (!courseName.trim()) {
            showWarning('Course Name is required.');
            return;
        }

        if (!university.trim()) {
            showWarning('University name is required.');
            return;
        }

        if (!batch.trim()) {
            showWarning('Batch information is required.');
            return;
        }

        const token = localStorage.getItem('placementToken');
        if (!token) {
            showError('Authentication token missing. Please login again.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('studentData', selectedFile);
            formData.append('customFileName', courseName.trim());
            formData.append('university', university.trim());
            formData.append('batch', batch.trim());

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/files/${resubmitFileId}/resubmit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
             
            if (data.success) {
                const popup = buildPlacementUploadPopup(
                    data.message,
                    data.skippedEmails,
                    'File resubmitted successfully! Waiting for admin approval.'
                );
                showSuccess(popup.message, popup.duration);
                resetForm();
                setShowResubmitModal(false);
                setResubmitFileId(null);
                fetchUploadHistory();
            } else {
                const popup = buildPlacementUploadErrorPopup({
                    message: normalizePlacementUploadErrorMessage(data.message, 'Resubmission failed'),
                    duplicateEmails: data.duplicateEmails,
                    existingEmails: data.existingEmails,
                    fallbackMessage: 'Resubmission failed'
                });
                showError(popup.message, popup.duration);
            }
        } catch (error) {
            const popup = buildPlacementUploadErrorPopup({
                message: normalizePlacementUploadErrorMessage(
                    error.response?.data?.message || error.message,
                    'Resubmission failed. Please try again.'
                ),
                duplicateEmails: error.response?.data?.duplicateEmails,
                existingEmails: error.response?.data?.existingEmails,
                fallbackMessage: 'Resubmission failed. Please try again.'
            });
            showError(
                popup.message,
                popup.duration
            );
        } finally {
            setUploading(false);
        }
    };

    const handleViewFile = async (fileId, fileName) => {
        try {
            console.log('Viewing file:', fileId, fileName);
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('placementToken');
            
            if (!token) {
                showError('Authentication token missing');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.fileData) {
                    showSuccess(`Loading ${fileName} data...`);
                } else {
                    showWarning('File data not available or file not processed yet.');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Unable to view file. Please try again.');
            }
        } catch (error) {
            console.error('Error viewing file:', error);
            showError('Error viewing file. Please try again.');
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setCourseName('');
        setUniversity('');
        setBatch('');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed':
                return <i className="fa fa-check-circle status-success"></i>;
            case 'approved':
                return <i className="fa fa-check status-info"></i>;
            case 'rejected':
                return <i className="fa fa-times-circle status-danger"></i>;
            default:
                return <i className="fa fa-clock-o status-warning"></i>;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'processed':
                return 'Approved';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h4 className="logo" onClick={() => window.location.href = '/'} style={{cursor: 'pointer'}}>Placement</h4>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${location.pathname === '/placement/dashboard' ? 'active' : ''}`} onClick={() => navigate('/placement/dashboard')}>
                        <i className="fa fa-tachometer"></i>
                        <span>Overview</span>
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-users"></i>
                        <span>Student Directory</span>
                    </div>
                    <div className={`nav-item ${location.pathname === '/placement/batch-upload' ? 'active' : ''}`} onClick={() => navigate('/placement/batch-upload')}>
                        <i className="fa fa-upload"></i>
                        <span>Batch Upload</span>
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <div className="nav-item logout" onClick={() => {
                        localStorage.removeItem('placementToken');
                        window.location.href = '/login';
                    }}>
                        <i className="fa fa-sign-out"></i>
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            <div className="batch-upload-container">
                <div className="batch-upload-content">
                    {/* Main Form Column */}
                    <div className="form-column">
                        <div className="form-card">
                            <div className="form-header">
                                <h2>Configuration & Details</h2>
                                <p>Upload student data files and configure batch settings for processing</p>
                            </div>

                            <div className="form-body">
                                {/* File Upload Field */}
                                <div className="upload-field">
                                    <label>Student Data File *</label>
                                    <div 
                                        className="file-upload-area"
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        <i className="fa fa-file-excel-o upload-icon"></i>
                                        <div className="upload-text">
                                            <span className="primary-text">
                                                {selectedFile ? selectedFile.name : 'Click to select student data file (CSV, XLSX)'}
                                            </span>
                                            <span className="secondary-text">Maximum file size: 5MB</span>
                                        </div>
                                    </div>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {/* Configuration Fields */}
                                <div className="config-fields">
                                    <div className="field-group">
                                        <label>Course Name *</label>
                                        <input
                                            type="text"
                                            value={courseName}
                                            onChange={(e) => setCourseName(e.target.value)}
                                            placeholder="Enter course name (e.g., 'B.Tech CSE', 'MBA')"
                                            maxLength="100"
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label>University *</label>
                                        <select
                                            value={university}
                                            onChange={(e) => setUniversity(e.target.value)}
                                            required
                                        >
                                            <option value="">Select University</option>
                                            {batchUploadUniversityOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-group">
                                        <label>Batch *</label>
                                        <input
                                            type="text"
                                            value={batch}
                                            onChange={(e) => setBatch(e.target.value)}
                                            placeholder="Enter batch information (e.g., '2024', 'Spring 2024')"
                                            maxLength="50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="sample-download">
                                    <button 
                                        className="btn-download-sample"
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = '/assets/sample-student-data.csv';
                                            link.download = 'sample-student-data.csv';
                                            link.click();
                                        }}
                                    >
                                        <i className="fa fa-download"></i>
                                        Download Sample File
                                    </button>
                                </div>
                            </div>

                            <div className="form-footer">
                                <button 
                                    className="btn-cancel"
                                    onClick={resetForm}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-upload"
                                    onClick={handleUpload}
                                    disabled={uploading || !selectedFile || !courseName.trim() || !university.trim() || !batch.trim()}
                                >
                                    {uploading ? (
                                        <>
                                            <div className="spinner-sm"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-upload"></i>
                                            Upload Dataset
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History Column */}
                    <div className="history-column">
                        <div className="history-card">
                            <div className="history-header">
                                <h3>Recent History</h3>
                                <button className="view-all-btn">View All</button>
                            </div>

                            <div className="history-list">
                                {uploadHistory.length > 0 ? (
                                    uploadHistory.slice().reverse().slice(0, 5).map((item, index) => (
                                        <div key={item._id || index} className="history-item">
                                            <div className="item-header">
                                                <h4>{item.customName || item.fileName}</h4>
                                                <div className="status-icon">
                                                    {getStatusIcon(item.status)}
                                                </div>
                                            </div>
                                            <div className="item-details">
                                                <span className="file-name">{item.fileName}</span>
                                                <span className="university">{item.university || placementData?.collegeName || 'Unknown University'}</span>
                                                <span className="batch-info">{item.batch || 'General Batch'}</span>
                                                <span className="upload-date">{formatDate(item.uploadedAt)}</span>
                                            </div>
                                            <div className="item-footer">
                                                {item.status === 'rejected' ? (
                                                    <>
                                                        <div className="rejection-reason">
                                                            <i className="fa fa-exclamation-circle"></i>
                                                            <span>{item.rejectionReason || 'No reason provided'}</span>
                                                        </div>
                                                        <button 
                                                            className="resubmit-btn" 
                                                            onClick={() => handleResubmit(item._id, item.fileName, item.customName)}
                                                        >
                                                            <i className="fa fa-refresh"></i>
                                                            Resubmit
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="details-btn" onClick={() => {
                                                        navigate('/placement/student-directory', { 
                                                            state: { 
                                                                fileId: item._id, 
                                                                fileName: item.fileName,
                                                                customName: item.customName 
                                                            } 
                                                        });
                                                    }}>Details</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-history">
                                        <i className="fa fa-history"></i>
                                        <p>No upload history yet</p>
                                        <span>Your uploaded files will appear here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resubmit Modal */}
            {showResubmitModal && (
                <div className="modal-overlay" onClick={() => setShowResubmitModal(false)}>
                    <div className="modal-content resubmit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Resubmit File</h3>
                            <button className="close-btn" onClick={() => {
                                setShowResubmitModal(false);
                                resetForm();
                                setResubmitFileId(null);
                            }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="upload-field">
                                <label>Student Data File</label>
                                <div 
                                    className="file-upload-area"
                                    onClick={() => document.getElementById('resubmitFileInput').click()}
                                >
                                    <i className="fa fa-file-excel-o upload-icon"></i>
                                    <div className="upload-text">
                                        <span className="primary-text">
                                            {selectedFile ? selectedFile.name : 'Click to select corrected file (CSV, XLSX)'}
                                        </span>
                                        <span className="secondary-text">Maximum file size: 5MB</span>
                                    </div>
                                </div>
                                <input
                                    id="resubmitFileInput"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className="config-fields">
                                <div className="field-group">
                                    <label>Course Name *</label>
                                    <input
                                        type="text"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        placeholder="Enter course name (e.g., 'B.Tech CSE', 'MBA')"
                                        maxLength="100"
                                        required
                                    />
                                </div>

                                <div className="field-group">
                                    <label>University *</label>
                                    <select
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        required
                                    >
                                        <option value="">Select University</option>
                                        {batchUploadUniversityOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label>Batch *</label>
                                    <input
                                        type="text"
                                        value={batch}
                                        onChange={(e) => setBatch(e.target.value)}
                                        placeholder="Enter batch information"
                                        maxLength="50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => {
                                    setShowResubmitModal(false);
                                    resetForm();
                                    setResubmitFileId(null);
                                }}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-upload"
                                onClick={handleResubmitUpload}
                                disabled={uploading || !selectedFile || !courseName.trim() || !university.trim() || !batch.trim()}
                            >
                                {uploading ? (
                                    <>
                                        <div className="spinner-sm"></div>
                                        Resubmitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-refresh"></i>
                                        Resubmit File
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BatchUpload;
