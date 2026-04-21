import { useState, useEffect } from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { debugAuth, testAPIConnection, testPlacementAuth } from '../../../utils/authDebug';
import { getPlacementFileStudents, normalizePlacementStudents, normalizePlacementUploadErrorMessage } from '../../../utils/placementStudentData';
import PlacementNotificationsRedesigned from './sections/PlacementNotificationsRedesigned';
import PlacementSupportSection from './sections/PlacementSupportSection';
import UnifiedHeader from '../../../components/UnifiedHeader';
import './placement-dashboard-redesigned.css';
import '../../../placement-rejection-styles.css';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../utils/popupNotification';
import NotificationBell from '../../../components/NotificationBell';
import JobZImage from '../../common/jobz-img';
import YesNoPopup from '../../common/popups/popup-yes-no';
import { popupType } from '../../../globals/constants';
import { privateUniversityOptions } from '../../../utils/privateUniversityOptions';
import { buildPlacementUploadPopup } from '../../../utils/placementUploadPopup';

function PlacementDashboardRedesigned() {
    const MAX_PROFILE_IMAGE_SIZE_MB = 20;
    const MAX_PROFILE_IMAGE_SIZE_BYTES = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;

    const isFileSizeError = (message = '') => /file size|too large|exceeds|smaller than\s+\d+(\.\d+)?\s*mb|limit/i.test(String(message));

    const normalizeImageUploadErrorMessage = (message = '') => {
        const safeMessage = String(message || '').trim();
        if (!isFileSizeError(safeMessage)) return safeMessage;
        if (/\d+(\.\d+)?\s*mb/i.test(safeMessage)) return safeMessage;
        return `File size exceeds the limit. Please upload an image smaller than ${MAX_PROFILE_IMAGE_SIZE_MB}MB.`;
    };

    const showImageUploadError = (message, fallbackMessage) => {
        const normalizedMessage = normalizeImageUploadErrorMessage(message || fallbackMessage);
        if (isFileSizeError(normalizedMessage)) {
            showWarning(normalizedMessage);
            return;
        }
        showError(normalizedMessage || fallbackMessage);
    };

    const { user, userType, isAuthenticated, loading: authLoading } = useAuth();
    const [placementData, setPlacementData] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseNameOption, setCourseNameOption] = useState('');
    const [university, setUniversity] = useState('');
    const [universityOption, setUniversityOption] = useState('');
    const [universitySearch, setUniversitySearch] = useState('');
    const [batch, setBatch] = useState('');
    const [viewingFileId, setViewingFileId] = useState(null);
    const [viewingFileName, setViewingFileName] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        collegeName: '',
        collegeAddress: '',
        collegeOfficialEmail: '',
        additionalOfficialEmail: '',
        collegeOfficialPhone: ''
    });
    const [updating, setUpdating] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [showResubmitModal, setShowResubmitModal] = useState(false);
    const [resubmittingFile, setResubmittingFile] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);
    const [resubmitFileName, setResubmitFileName] = useState('');
    const [resubmitCourseName, setResubmitCourseName] = useState('');
    const [resubmitUniversity, setResubmitUniversity] = useState('');
    const [resubmitBatch, setResubmitBatch] = useState('');
    const [resubmitting, setResubmitting] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [activitySearch, setActivitySearch] = useState('');
    const [activityBatchFilter, setActivityBatchFilter] = useState('');
    const [uploadHistorySearch, setUploadHistorySearch] = useState('');
    const [uploadHistoryBatchFilter, setUploadHistoryBatchFilter] = useState('');
    const [uploadHistoryUniversitySearch, setUploadHistoryUniversitySearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');

    const [stats, setStats] = useState({
        totalStudents: 0,
        avgCredits: 0,
        activeBatches: 0,
        coursesCovered: 0
    });

    const getImagePreviewSrc = (imageValue) => {
        const backendBaseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
        if (!imageValue || typeof imageValue !== 'string') return '';
        if (imageValue.startsWith('data:')) return imageValue;
        if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) return imageValue;
        if (imageValue.startsWith('/uploads') || imageValue.startsWith('uploads/')) {
            const normalizedPath = imageValue.startsWith('/') ? imageValue : `/${imageValue}`;
            return `${backendBaseUrl}${normalizedPath}`;
        }
        return `data:image/jpeg;base64,${imageValue}`;
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            if (!authLoading && isAuthenticated() && userType === 'placement') {
                try {
                    setLoading(true);
                    await Promise.all([
                        fetchPlacementDetails(),
                        fetchStudentData()
                    ]);
                } catch (error) {
                    console.error('Initialization error:', error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        };
        
        initializeDashboard();
    }, [authLoading, userType, isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchPlacementDetails();
            fetchStudentData();
        } else if (activeTab === 'students' && !viewingFileId) {
            fetchStudentData();
        }
    }, [activeTab, viewingFileId]);

    const fetchPlacementDetails = async () => {
        try {
            const token = localStorage.getItem('placementToken');
            if (!token) return;
            
            const profileData = await api.getPlacementProfile();
            if (profileData && profileData.success) {
                setPlacementData(profileData.placement);
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            if (error.message.includes('401')) {
                localStorage.removeItem('placementToken');
                localStorage.removeItem('placementUser');
                window.location.href = '/login';
            }
        }
    };

    const fetchStudentData = async () => {
        try {
            const token = localStorage.getItem('placementToken');
            if (!token) return;
            
            console.log('Fetching student data...');
            const data = await api.getMyPlacementData();
            console.log('Student data received:', data);
            
            if (data.success) {
                const students = normalizePlacementStudents(data.students || []);
                console.log('Total students:', students.length);
                console.log('Sample student data:', students[0]);
                console.log('All course values from backend:', students.map(s => ({ name: s.name, course: s.course })));
                console.log('Credits distribution:', students.map(s => ({ name: s.name, credits: s.credits })));

                setStudentData(students);
                calculateStats(students);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    const calculateStats = (students) => {
        const totalStudents = students.length;
        const totalCredits = students.reduce((sum, student) => sum + (parseInt(student.credits) || 0), 0);
        const avgCredits = totalStudents > 0 ? Math.round(totalCredits / totalStudents) : 0;
        const courses = [...new Set(students.map(s => s.course).filter(c => c && c !== 'Not Provided' && c !== 'Not Specified'))];
        const batches = [...new Set(students.map(s => s.batch).filter(b => b))];
        
        console.log('Calculating stats:', {
            totalStudents,
            avgCredits,
            activeBatches: batches.length,
            coursesCovered: courses.length,
            batches,
            courses
        });
        
        setStats({
            totalStudents,
            avgCredits,
            activeBatches: batches.length,
            coursesCovered: courses.length
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            showWarning('Please select a file to upload.');
            return;
        }
        
        // Check if profile is complete
        if (!placementData?.collegeName || !placementData?.collegeAddress || 
            !placementData?.collegeOfficialEmail || !placementData?.collegeOfficialPhone) {
            showWarning('Please complete your profile in Edit Profile before uploading CSV files.');
            setTimeout(() => setActiveTab('overview'), 1500);
            return;
        }
        
        // Validate required fields
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
        
        console.log('File selected:', file.name, file.type, file.size);
        
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('studentData', file);
            formData.append('customFileName', courseName);
            formData.append('university', university);
            formData.append('batch', batch);
            
            console.log('Uploading file...');
            const data = await api.uploadStudentData(formData);
            console.log('Upload response:', data);
             
            if (data.success) {
                const popup = buildPlacementUploadPopup(
                    data.message,
                    data.skippedEmails,
                    'Student data uploaded successfully! Waiting for admin approval.'
                );
                showSuccess(popup.message, popup.duration);
                setSelectedFile(null);
                setSelectedFileName('');
                setCourseName('');
                setCourseNameOption('');
                setCourseSearch('');
                setUniversity('');
                setUniversityOption('');
                setUniversitySearch('');
                setBatch('');
                await Promise.all([
                    fetchPlacementDetails(), // Refresh placement data to show new file
                    fetchStudentData() // Refresh student data
                ]);
            } else {
                showError(normalizePlacementUploadErrorMessage(data.message, 'Upload failed'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError(
                normalizePlacementUploadErrorMessage(
                    error.response?.data?.message || error.message,
                    'Upload failed. Please try again.'
                )
            );
        } finally {
            setUploadingFile(false);
        }
    };

    const handleEditProfile = () => {
        const nameParts = (placementData?.name || '').split(' ');
        // Remove +91 prefix from phone number if present
        const phoneNumber = placementData?.phone || '';
        const cleanPhone = phoneNumber.startsWith('+91') ? phoneNumber.substring(3) : phoneNumber;
        
        setEditFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: placementData?.email || '',
            phone: cleanPhone,
            collegeName: placementData?.collegeName || '',
            collegeAddress: placementData?.collegeAddress || '',
            collegeOfficialEmail: placementData?.collegeOfficialEmail || '',
            additionalOfficialEmail: placementData?.additionalOfficialEmail || '',
            collegeOfficialPhone: placementData?.collegeOfficialPhone || ''
        });
        setLogoPreview(null);
        setIdCardPreview(null);
        setShowEditModal(true);
    };

    const handleUpdateProfile = async () => {
        const errors = {};
        const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
        if (!editFormData.firstName.trim()) errors.firstName = 'First Name is required';
        if (!editFormData.lastName.trim()) errors.lastName = 'Last Name is required';
        if (!editFormData.phone.trim()) errors.phone = 'Phone Number is required';
        if (!editFormData.collegeName.trim()) errors.collegeName = 'College Name is required';
        if (!editFormData.collegeAddress.trim()) errors.collegeAddress = 'College Address is required';
        if (!editFormData.collegeOfficialEmail.trim()) errors.collegeOfficialEmail = 'College Official Email is required';
        if (!editFormData.collegeOfficialPhone.trim()) errors.collegeOfficialPhone = 'College Official Phone is required';
        if (!logoPreview && !placementData?.logo) errors.logo = 'College Logo is required';
        if (!idCardPreview && !placementData?.idCard) errors.idCard = 'ID Card is required';

        const primaryPhone = normalizePhone(editFormData.phone);
        const officialPhone = normalizePhone(editFormData.collegeOfficialPhone);
        if (primaryPhone && officialPhone && primaryPhone === officialPhone) {
            errors.phone = 'Primary phone number  must be different from college official phone number';
            errors.collegeOfficialPhone = 'College official phone number must be different from primary phone number';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setFormErrors({});
        setUpdating(true);
        try {
            // Upload images first if they exist
            if (logoPreview || idCardPreview) {
                if (logoPreview) {
                    try {
                        await api.uploadLogo(logoPreview);
                    } catch (logoError) {
                        throw new Error(logoError.message || 'Failed to upload college logo');
                    }
                }
                
                if (idCardPreview) {
                    try {
                        await api.uploadIdCard(idCardPreview);
                    } catch (idCardError) {
                        throw new Error(idCardError.message || 'Failed to upload ID card');
                    }
                }
            }

            const response = await api.updatePlacementProfile(editFormData);
            
            if (response && response.success) {
                showSuccess('Profile updated successfully!');
                setShowEditModal(false);
                setLogoPreview(null);
                setIdCardPreview(null);
                await fetchPlacementDetails();
                window.dispatchEvent(new Event('PlacementProfileUpdated'));
            } else {
                showError(response?.message || 'Failed to update profile');
            }
        } catch (error) {
            showImageUploadError(error.message, 'Error updating profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file');
            return;
        }

        if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
            showWarning(`File size exceeds the limit. Please upload an image smaller than ${MAX_PROFILE_IMAGE_SIZE_MB}MB.`);
            e.target.value = '';
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setLogoPreview(base64);
        } catch (error) {
            showError('Error reading file');
        }
    };

    const handleIdCardChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file');
            return;
        }

        if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
            showWarning(`File size exceeds the limit. Please upload an image smaller than ${MAX_PROFILE_IMAGE_SIZE_MB}MB.`);
            e.target.value = '';
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            setIdCardPreview(base64);
        } catch (error) {
            showError('Error reading file');
        }
    };

    const handleUploadImages = async () => {
        if (!logoPreview && !idCardPreview) {
            showWarning('Please select at least one image to upload');
            return;
        }

        setUploadingImages(true);
        try {
            if (logoPreview) {
                try {
                    await api.uploadLogo(logoPreview);
                } catch (logoError) {
                    throw new Error(logoError.message || 'Failed to upload college logo');
                }
            }

            if (idCardPreview) {
                try {
                    await api.uploadIdCard(idCardPreview);
                } catch (idCardError) {
                    throw new Error(idCardError.message || 'Failed to upload ID card');
                }
            }
            
            showSuccess('Images uploaded successfully!');
            setLogoPreview(null);
            setIdCardPreview(null);
            await fetchPlacementDetails();
        } catch (error) {
            showImageUploadError(error.message, 'Error uploading images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleViewFile = async (fileId, fileName) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('placementToken')}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const cleanedData = getPlacementFileStudents(data);

                if (data.success) {
                    console.log('Raw file data sample:', (data.students || data.fileData || [])[0]);
                    console.log('Cleaned data sample:', cleanedData[0]);
                    console.log('Course distribution:', cleanedData.map(s => s.course));

                    setStudentData(cleanedData);
                    setViewingFileId(fileId);
                    setViewingFileName(fileName);
                    setActiveTab('students');
                } else {
                    showWarning('File data not available or file not processed yet.');
                }
            } else {
                showError('Unable to view file. Please try again.');
            }
        } catch (error) {
            console.error('Error viewing file:', error);
            showError('Error viewing file. Please try again.');
        }
    };

    const handleResubmitFile = (file) => {
        setResubmittingFile(file);
        setResubmitCourseName(file.customName || '');
        setResubmitUniversity(file.university || '');
        setResubmitBatch(file.batch || '');
        setResubmitFile(null);
        setResubmitFileName('');
        setShowResubmitModal(true);
    };

    const handleResubmitUpload = async () => {
        if (!resubmitFile) {
            showWarning('Please select a file to resubmit.');
            return;
        }
        
        if (!resubmitCourseName.trim()) {
            showWarning('Course Name is required.');
            return;
        }
        
        if (!resubmitUniversity.trim()) {
            showWarning('University name is required.');
            return;
        }
        
        if (!resubmitBatch.trim()) {
            showWarning('Batch information is required.');
            return;
        }
        
        setResubmitting(true);
        try {
            const formData = new FormData();
            formData.append('studentData', resubmitFile);
            formData.append('customFileName', resubmitCourseName);
            formData.append('university', resubmitUniversity);
            formData.append('batch', resubmitBatch);
            
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/files/${resubmittingFile._id}/resubmit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`
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
                setShowResubmitModal(false);
                setResubmittingFile(null);
                setResubmitFile(null);
                setResubmitFileName('');
                setResubmitCourseName('');
                setResubmitUniversity('');
                setResubmitBatch('');
                await Promise.all([
                    fetchPlacementDetails(),
                    fetchStudentData()
                ]);
            } else {
                showError(normalizePlacementUploadErrorMessage(data.message, 'Resubmission failed'));
            }
        } catch (error) {
            console.error('Resubmit error:', error);
            showError(
                normalizePlacementUploadErrorMessage(
                    error.response?.data?.message || error.message,
                    'Resubmission failed. Please try again.'
                )
            );
        } finally {
            setResubmitting(false);
        }
    };



    const recalculateStats = () => {
        calculateStats(studentData);
        showSuccess('Statistics recalculated successfully!');
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.field-group') && !e.target.closest('.form-group')) {
                const courseDD = document.getElementById('course-dropdown');
                const uniDD = document.getElementById('university-dropdown');
                if (courseDD) courseDD.style.display = 'none';
                if (uniDD) uniDD.style.display = 'none';
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activitySearchTerm = activitySearch.trim().toLowerCase();
    const activityBatchOptions = [...new Set((placementData?.fileHistory || []).map(f => f.batch).filter(Boolean))];
    const filteredRecentActivity = (placementData?.fileHistory || [])
        .filter((file) => {
            const matchesSearch = !activitySearchTerm || String(file.customName || '').toLowerCase().includes(activitySearchTerm);
            const matchesBatch = !activityBatchFilter || file.batch === activityBatchFilter;
            return matchesSearch && matchesBatch;
        })
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 5);

    const uploadHistorySearchTerm = uploadHistorySearch.trim().toLowerCase();
    const uploadHistoryUniversitySearchTerm = uploadHistoryUniversitySearch.trim().toLowerCase();
    const uploadHistoryBatchOptions = [...new Set((placementData?.fileHistory || []).map(f => f.batch).filter(Boolean))];
    const filteredFileHistory = (placementData?.fileHistory || []).filter((file) => {
        const matchesFile = !uploadHistorySearchTerm || String(file.customName || '').toLowerCase().includes(uploadHistorySearchTerm);
        const matchesBatch = !uploadHistoryBatchFilter || file.batch === uploadHistoryBatchFilter;
        const matchesUniversity = !uploadHistoryUniversitySearchTerm || String(file.university || '').toLowerCase().includes(uploadHistoryUniversitySearchTerm);
        return matchesFile && matchesBatch && matchesUniversity;
    });

    if (authLoading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <h4>Authenticating...</h4>
                </div>
            </div>
        );
    }

    if (!authLoading && (!isAuthenticated() || userType !== 'placement')) {
        return (
            <div className="dashboard-container">
                <div className="access-denied">
                    <i className="fa fa-lock"></i>
                    <h3>Access Denied</h3>
                    <p>Please login with valid Placement Dean credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Left Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo" onClick={() => window.location.href = '/'} style={{cursor: 'pointer'}}>
                        <JobZImage id="skin_header_logo" src="images/skins-logo/logo-skin-8.gif" alt="Logo" style={{height: '60px', width: 'auto'}} />
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div 
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('overview');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-home"></i>
                        <span>Dashboard</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('students');
                            setViewingFileId(null);
                            setViewingFileName(null);
                            setStudentSearch('');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-users"></i>
                        <span>Student Directory</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('upload');
                            if (!university && placementData?.collegeName) {
                                setUniversity(placementData.collegeName);
                                setUniversityOption(privateUniversityOptions.includes(placementData.collegeName) ? placementData.collegeName : 'other');
                            }
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-upload"></i>
                        <span>Batch Upload</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('history');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-history"></i>
                        <span>Batch History</span>
                        {(placementData?.fileHistory || []).some(f => f.status === 'rejected') && (
                            <span className="nav-resubmit-dot"></span>
                        )}
                    </div>
                    <div
                        className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('support');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-headset"></i>
                        <span>Support</span>
                    </div>
                    <div 
                        className="nav-item logout"
                        data-bs-toggle="modal" 
                        data-bs-target="#logout-dash-profile"
                    >
                        <i className="fa fa-sign-out"></i>
                        <span>Logout</span>
                    </div>
                </nav>

            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Desktop Header */}
                <div className="top-header">
                    
                    <div className="header-actions">
                        <NotificationBell userRole="placement" />
                        <div className="user-profile">
                            <div className="profile-avatar">
                                {placementData?.logo ? (
                                    <img 
                                        src={getImagePreviewSrc(placementData.logo)} 
                                        alt="Profile" 
                                    />
                                ) : (
                                    <i className="fa fa-user"></i>
                                )}
                            </div>
                            <span>{placementData?.name || 'Profile'}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <UnifiedHeader 
                    userRole="placement"
                    userData={placementData}
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />

                {/* Content Area */}
                <div className="content-area">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <h4>Loading dashboard data...</h4>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <>
                                    {/* Profile Card with Notifications */}
                                    <div className="profile-notifications-container">
                                        <div className="profile-card">
                                            <div className="profile-left">
                                                <div className="profile-image-container">
                                                    <div className="profile-image">
                                                        {placementData?.logo ? (
                                                            <img 
                                                                src={getImagePreviewSrc(placementData.logo)} 
                                                                alt="College Logo" 
                                                            />
                                                        ) : (
                                                            <i className="fa fa-university"></i>
                                                        )}
                                                    </div>
                                                    <small className="image-label">College Logo</small>
                                                </div>
                                                <div className="profile-image-container">
                                                    <div className="id-card-image">
                                                        {placementData?.idCard ? (
                                                            <img 
                                                                src={getImagePreviewSrc(placementData.idCard)} 
                                                                alt="ID Card" 
                                                            />
                                                        ) : (
                                                            <i className="fa fa-id-card"></i>
                                                        )}
                                                    </div>
                                                    <small className="image-label">ID Card</small>
                                                </div>
                                            </div>
                                            <div className="profile-center">
                                                <div className="role-label">Placement Dean</div>
                                                <h2 className="officer-name">
                                                    {placementData?.name || user?.name || 'Name not available'}
                                                </h2>
                                                <div className="contact-info">
                                                    <div className="contact-item">
                                                        <i className="fa fa-envelope"></i>
                                                        <span>{placementData?.email || user?.email || 'Email not available'}</span>
                                                    </div>
                                                    <div className="contact-item">
                                                        <i className="fa fa-phone"></i>
                                                        <span>{placementData?.phone || 'Phone not available'}</span>
                                                    </div>
                                                    <div className="contact-item">
                                                        <i className="fa fa-graduation-cap"></i>
                                                        <span>{placementData?.collegeName || 'College Name Not Available'}</span>
                                                    </div>
                                                    {placementData?.collegeAddress && (
                                                        <div className="contact-item">
                                                            <i className="fa fa-map-marker"></i>
                                                            <span>{placementData.collegeAddress}</span>
                                                        </div>
                                                    )}
                                                    {placementData?.collegeOfficialEmail && (
                                                        <div className="contact-item">
                                                            <i className="fa fa-envelope"></i>
                                                            <span>Official Email: {placementData.collegeOfficialEmail}</span>
                                                        </div>
                                                    )}
                                                    {placementData?.additionalOfficialEmail && (
                                                        <div className="contact-item">
                                                            <i className="fa fa-envelope"></i>
                                                            <span>Add Official Email: {placementData.additionalOfficialEmail}</span>
                                                        </div>
                                                    )}
                                                    {placementData?.collegeOfficialPhone && (
                                                        <div className="contact-item">
                                                            <i className="fa fa-phone-square"></i>
                                                            <span>Official Number: {placementData.collegeOfficialPhone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="profile-right">
                                                <button className="directory-btn" onClick={handleEditProfile}>
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Notifications Panel - Beside Profile */}
                                        <div className="notifications-panel">
                                            <PlacementNotificationsRedesigned />
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="stats-overview-section">
                                        <h3 className="section-title">Overview & Performance</h3>
                                        <div className="stats-cards-container">
                                            <div className="stats-card">
                                                <div className="stats-card-top">
                                                    <div className="stat-icon">
                                                        <i className="fa fa-users"></i>
                                                    </div>
                                                    <h3 className="stat-value">{stats.totalStudents}</h3>
                                                </div>
                                                <div className="stat-content">
                                                    <p className="stat-label">Total Students</p>
                                                </div>
                                            </div>
                                            <div className="stats-card">
                                                <div className="stats-card-top">
                                                    <div className="stat-icon">
                                                        <i className="fa fa-graduation-cap"></i>
                                                    </div>
                                                    <h3 className="stat-value">{placementData?.fileHistory?.length || 0}</h3>
                                                </div>
                                                <div className="stat-content">
                                                    <p className="stat-label">Total Batches</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Batch Activity */}
                                    <div className="activity-section">
                                        <div className="activity-header">
                                            <div className="header-left">
                                                <h3>Recent Batch Activity</h3>
                                                <p className="activity-subtitle">Track your latest batch uploads and processing status</p>
                                            </div>
                                            <div className="activity-header-actions">
                                                <a href="#" className="manage-all-link">Manage All Batches</a>
                                            </div>
                                        </div>
                                        <div className="activity-search">
                                            <label className="activity-search-label">Search :</label>
                                            <input
                                                type="text"
                                                value={activitySearch}
                                                onChange={(e) => setActivitySearch(e.target.value)}
                                                placeholder="Search by course name"
                                                aria-label="Search recent batch activity"
                                            />
                                            <select
                                                value={activityBatchFilter}
                                                onChange={(e) => setActivityBatchFilter(e.target.value)}
                                                aria-label="Filter by batch"
                                                style={{marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px'}}
                                            >
                                                <option value="">All Batches</option>
                                                {activityBatchOptions.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="activity-list">
                                            {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                                filteredRecentActivity.length > 0 ? (
                                                    filteredRecentActivity.map((file, index) => (
                                                    <div key={file._id || index} className="activity-item">
                                                        <div className="activity-content">
                                                            <div className="batch-name">{file.customName || file.fileName}</div>
                                                            <div className="file-name">{file.fileName}</div>
                                                            <div className="activity-metadata">
                                                                <span><i className="fa fa-university"></i>{file.university || placementData?.collegeName || 'University'}</span>
                                                                <span><i className="fa fa-calendar"></i>{file.batch || 'Batch 2024'}</span>
                                                                <span><i className="fa fa-clock-o"></i>{formatDate(file.uploadedAt)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="activity-action">
                                                            <button className="view-btn" onClick={() => handleViewFile(file._id, file.fileName)}>
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                                ) : (
                                                    <div className="no-activity">
                                                        <i className="fa fa-search"></i>
                                                        <p>No recent batch activity matches your search</p>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="no-activity">
                                                    <i className="fa fa-history"></i>
                                                    <p>No recent activity</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'students' && (
                                <div className="students-section">
                                    <div className="section-header">
                                        <div className="header-left">
                                            <h3>Student Directory</h3>
                                            {viewingFileId && (
                                                <div className="viewing-file-info">
                                                    <i className="fa fa-file-excel-o"></i>
                                                    <span>Viewing: {viewingFileName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="student-count">{studentData.length} Students</div>
                                    </div>
                                    {studentData.length > 0 && (
                                        <div className="activity-search" style={{marginBottom: '16px'}}>
                                            <label className="activity-search-label">Search :</label>
                                            <input
                                                type="text"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                placeholder="Search by name or email"
                                                aria-label="Search students by name or email"
                                            />
                                        </div>
                                    )}
                                    {studentData.length > 0 ? (
                                        <div className="table-responsive">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>Credits</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(studentSearch.trim()
                                                        ? studentData.filter(s =>
                                                            (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                            (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                                                          )
                                                        : studentData
                                                    ).map((student, index) => (
                                                        <tr key={index}>
                                                            <td>{student.name || '-'}</td>
                                                            <td>{student.email || '-'}</td>
                                                            <td>{student.phone || '-'}</td>
                                                            <td>
                                                                <span className="credits-badge" title={`Available Credits: ${student.credits || 0}`}>
                                                                    {student.credits !== undefined && student.credits !== null ? student.credits : 0}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {studentSearch.trim() && studentData.filter(s =>
                                                        (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                        (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                                                    ).length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#888'}}>
                                                                <i className="fa fa-search" style={{marginRight: '8px'}}></i>
                                                                No students match your search
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="no-data">
                                            <i className="fa fa-users"></i>
                                            <h4>No student data available</h4>
                                            <p>Upload a file and wait for admin approval to see students here</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'upload' && (
                                <div className="upload-page">
                                    <div className="upload-container">
                                        <div className="upload-tips">
                                            <h5>Upload Tips:</h5>
                                            <ul>
                                                <li>Ensure your file contains columns: ID, Candidate Name, Email, Phone Number </li>
                                                <li>Upload in (CSV or Excel format). If duplicate emails are detected, remove them as shown in the pop-up and re-upload the file.</li>
                                                <li>Maximum file size: 10MB</li>
                                                <li>Remove empty rows and special characters</li>
                                                <li>Verify all email addresses are valid</li>
                                            </ul>
                                        </div>

                                        <div className="sample-download">
                                            <button 
                                                className="sample-btn"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = '/assets/sample-student-data.csv';
                                                    link.download = 'sample-student-data.csv';
                                                    link.click();
                                                }}
                                            >
                                                <i className="fa fa-download"></i>
                                                Download Sample Data
                                            </button>
                                            <p className="sample-note">
                                                <i className="fa fa-info-circle"></i>
                                                Download this sample file to see the required format before uploading your student data.
                                            </p>
                                        </div>
                                        
                                        {/* Configuration & Details Form */}
                                        <div className="config-form-card">
                                            <div className="form-header">
                                                <h3>Configuration & Details</h3>
                                                <p className="form-subtitle">Upload and configure student data files for batch processing</p>
                                            </div>
                                            
                                            <div className="form-content">
                                                {/* Form Fields */}
                                                <div className="form-fields">
                                                    <div className="field-group" style={{position: 'relative'}}>
                                                        <label className="field-label">Course Name</label>
                                                        <div
                                                            className="form-input"
                                                            style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', background: '#fff'}}
                                                            onClick={() => { setCourseSearch(''); setCourseName(prev => prev); document.getElementById('course-dropdown').style.display = document.getElementById('course-dropdown').style.display === 'block' ? 'none' : 'block'; }}
                                                        >
                                                            <span style={{color: courseNameOption ? '#232323' : '#aaa'}}>
                                                                {courseNameOption && courseNameOption !== 'other' ? courseNameOption : courseNameOption === 'other' ? 'Other-Specify' : 'Select course name'}
                                                            </span>
                                                            <i className="fa fa-chevron-down" style={{fontSize: '12px', color: '#888'}}></i>
                                                        </div>
                                                        <div
                                                            id="course-dropdown"
                                                            style={{display: 'none', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '2px'}}
                                                        >
                                                            <div style={{padding: '8px', borderBottom: '1px solid #eee', position: 'relative'}}>
                                                                <i className="fa fa-search" style={{position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '13px'}}></i>
                                                                <input
                                                                    type="text"
                                                                    style={{width: '100%', padding: '6px 8px 6px 28px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none'}}
                                                                    placeholder="Search course..."
                                                                    value={courseSearch}
                                                                    onChange={(e) => setCourseSearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            <ul style={{listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto'}}>
                                                                {[{label: 'Select course name', value: ''}, ...[
                                                                    // Engineering - UG
                                                                    'B.E - Computer Science Engineering',
                                                                    'B.E - Information Technology',
                                                                    'B.E - Electronics and Communication Engineering',
                                                                    'B.E - Electrical Engineering',
                                                                    'B.E - Electrical and Electronics Engineering',
                                                                    'B.E - Mechanical Engineering',
                                                                    'B.E - Civil Engineering',
                                                                    'B.E - Chemical Engineering',
                                                                    'B.E - Aerospace Engineering',
                                                                    'B.E - Aeronautical Engineering',
                                                                    'B.E - Automobile Engineering',
                                                                    'B.E - Biomedical Engineering',
                                                                    'B.E - Biotechnology',
                                                                    'B.E - Environmental Engineering',
                                                                    'B.E - Industrial Engineering',
                                                                    'B.E - Instrumentation Engineering',
                                                                    'B.E - Marine Engineering',
                                                                    'B.E - Mechatronics Engineering',
                                                                    'B.E - Mining Engineering',
                                                                    'B.E - Petroleum Engineering',
                                                                    'B.E - Production Engineering',
                                                                    'B.E - Textile Engineering',
                                                                    'B.E - Artificial Intelligence and Machine Learning',
                                                                    'B.E - Artificial Intelligence and Data Science',
                                                                    'B.E - Data Science',
                                                                    'B.E - Cyber Security',
                                                                    'B.E - Internet of Things',
                                                                    'B.E - Robotics and Automation',
                                                                    'B.E - Computer Science and Business Systems',
                                                                    // Engineering - PG
                                                                    'M.Tech - Computer Science Engineering',
                                                                    'M.Tech - Information Technology',
                                                                    'M.Tech - Electronics and Communication Engineering',
                                                                    'M.Tech - Electrical Engineering',
                                                                    'M.Tech - Mechanical Engineering',
                                                                    'M.Tech - Civil Engineering',
                                                                    'M.Tech - Structural Engineering',
                                                                    'M.Tech - VLSI Design',
                                                                    'M.Tech - Embedded Systems',
                                                                    'M.Tech - Power Systems',
                                                                    'M.Tech - Artificial Intelligence',
                                                                    'M.Tech - Data Science',
                                                                    'M.Tech - Cyber Security',
                                                                    'M.Tech - Robotics and Automation',
                                                                    'M.Tech - Internet of Things',
                                                                    'M.Tech - Artificial Intelligence and Machine Learning',
                                                                    'M.Tech - Computer Networks',
                                                                    'M.Tech - Software Engineering',
                                                                    // Management
                                                                    'BBA - Bachelor of Business Administration',
                                                                    'MBA - Master of Business Administration',
                                                                    'MBA - Finance',
                                                                    'MBA - Marketing',
                                                                    'MBA - Human Resource Management',
                                                                    'MBA - Operations Management',
                                                                    'MBA - Information Technology',
                                                                    'MBA - Business Analytics',
                                                                    'MBA - International Business',
                                                                    'MBA - Supply Chain Management',
                                                                    'MBA - Entrepreneurship',
                                                                    'PGDM - Post Graduate Diploma in Management',
                                                                    // Computer Applications
                                                                    'BCA - Bachelor of Computer Applications',
                                                                    'MCA - Master of Computer Applications',
                                                                    // Science - UG
                                                                    'B.Sc - Computer Science',
                                                                    'B.Sc - Information Technology',
                                                                    'B.Sc - Data Science',
                                                                    'B.Sc - Physics',
                                                                    'B.Sc - Chemistry',
                                                                    'B.Sc - Mathematics',
                                                                    'B.Sc - Statistics',
                                                                    'B.Sc - Biology',
                                                                    'B.Sc - Biotechnology',
                                                                    'B.Sc - Microbiology',
                                                                    'B.Sc - Biochemistry',
                                                                    'B.Sc - Nursing',
                                                                    'B.Sc - Agriculture',
                                                                    'B.Sc - Horticulture',
                                                                    'B.Sc - Forestry',
                                                                    'B.Sc - Food Technology',
                                                                    'B.Sc - Environmental Science',
                                                                    'B.Sc - Psychology',
                                                                    'B.Sc - Electronics',
                                                                    // Science - PG
                                                                    'M.Sc - Computer Science',
                                                                    'M.Sc - Information Technology',
                                                                    'M.Sc - Data Science',
                                                                    'M.Sc - Physics',
                                                                    'M.Sc - Chemistry',
                                                                    'M.Sc - Mathematics',
                                                                    'M.Sc - Statistics',
                                                                    'M.Sc - Biotechnology',
                                                                    'M.Sc - Microbiology',
                                                                    'M.Sc - Biochemistry',
                                                                    'M.Sc - Nursing',
                                                                    'M.Sc - Agriculture',
                                                                    'M.Sc - Environmental Science',
                                                                    'M.Sc - Psychology',
                                                                    // Commerce
                                                                    'B.Com - Bachelor of Commerce',
                                                                    'B.Com - Accounting and Finance',
                                                                    'B.Com - Computer Applications',
                                                                    'B.Com - Banking and Insurance',
                                                                    'M.Com - Master of Commerce',
                                                                    // Arts / Humanities
                                                                    'B.A. - English',
                                                                    'B.A. - Economics',
                                                                    'B.A. - History',
                                                                    'B.A. - Political Science',
                                                                    'B.A. - Sociology',
                                                                    'B.A. - Psychology',
                                                                    'B.A. - Geography',
                                                                    'B.A. - Philosophy',
                                                                    'B.A. - Journalism and Mass Communication',
                                                                    'B.A. - Social Work',
                                                                    'M.A. - English',
                                                                    'M.A. - Economics',
                                                                    'M.A. - History',
                                                                    'M.A. - Political Science',
                                                                    'M.A. - Sociology',
                                                                    'M.A. - Psychology',
                                                                    'M.A. - Journalism and Mass Communication',
                                                                    // Law
                                                                    'B.A. LLB - Bachelor of Arts and Law',
                                                                    'B.B.A. LLB - Bachelor of Business Administration and Law',
                                                                    'B.Com LLB - Bachelor of Commerce and Law',
                                                                    'LLB - Bachelor of Laws',
                                                                    'LLM - Master of Laws',
                                                                    // Medical / Pharmacy / Health
                                                                    'MBBS - Bachelor of Medicine and Bachelor of Surgery',
                                                                    'BDS - Bachelor of Dental Surgery',
                                                                    'BAMS - Bachelor of Ayurvedic Medicine and Surgery',
                                                                    'BHMS - Bachelor of Homeopathic Medicine and Surgery',
                                                                    'B.Pharm - Bachelor of Pharmacy',
                                                                    'M.Pharm - Master of Pharmacy',
                                                                    'Pharm.D - Doctor of Pharmacy',
                                                                    'BPT - Bachelor of Physiotherapy',
                                                                    'MPT - Master of Physiotherapy',
                                                                    'BMLT - Bachelor of Medical Laboratory Technology',
                                                                    'DMLT - Diploma in Medical Laboratory Technology',
                                                                    // Architecture and Design
                                                                    'B.Arch - Bachelor of Architecture',
                                                                    'M.Arch - Master of Architecture',
                                                                    'B.Des - Bachelor of Design',
                                                                    'M.Des - Master of Design',
                                                                    'B.F.A. - Bachelor of Fine Arts',
                                                                    'M.F.A. - Master of Fine Arts',
                                                                    // Education
                                                                    'B.Ed - Bachelor of Education',
                                                                    'M.Ed - Master of Education',
                                                                    'D.El.Ed - Diploma in Elementary Education',
                                                                    // Hotel Management / Hospitality
                                                                    'BHM - Bachelor of Hotel Management',
                                                                    'MHM - Master of Hotel Management',
                                                                    // Diploma Programs
                                                                    'Diploma - Computer Science Engineering',
                                                                    'Diploma - Mechanical Engineering',
                                                                    'Diploma - Civil Engineering',
                                                                    'Diploma - Electrical Engineering',
                                                                    'Diploma - Electronics and Communication',
                                                                    'Diploma - Information Technology',
                                                                    // Research
                                                                    'Ph.D - Computer Science',
                                                                    'Ph.D - Engineering',
                                                                    'Ph.D - Management',
                                                                    'Ph.D - Science',
                                                                    'Ph.D - Arts and Humanities',
                                                                    'Ph.D - Commerce',
                                                                    'Ph.D - Law',
                                                                    'Ph.D - Education'
                                                                ].filter(c => c.toLowerCase().includes(courseSearch.toLowerCase())).map(c => ({label: c, value: c})),
                                                                {label: 'Other-Specify', value: 'other'}]
                                                                .map((item) => (
                                                                    <li
                                                                        key={item.value}
                                                                        style={{padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: item.value === '' ? '#aaa' : '#232323', background: courseNameOption === item.value ? '#f0f4ff' : 'transparent'}}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.background = courseNameOption === item.value ? '#f0f4ff' : 'transparent'}
                                                                        onClick={() => {
                                                                            setCourseNameOption(item.value);
                                                                            setCourseName(item.value !== 'other' ? item.value : '');
                                                                            setCourseSearch('');
                                                                            document.getElementById('course-dropdown').style.display = 'none';
                                                                        }}
                                                                    >
                                                                        {item.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        {courseNameOption === 'other' && (
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                style={{marginTop: '8px'}}
                                                                placeholder="Enter custom course name"
                                                                value={courseName}
                                                                onChange={(e) => setCourseName(e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="field-group" style={{position: 'relative'}}>
                                                        <label className="field-label">University</label>
                                                        <div
                                                            className="form-input"
                                                            style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', background: '#fff'}}
                                                            onClick={() => { setUniversitySearch(''); document.getElementById('university-dropdown').style.display = document.getElementById('university-dropdown').style.display === 'block' ? 'none' : 'block'; }}
                                                        >
                                                            <span style={{color: '#aaa'}}>Please select the university if you need to make any changes.</span>
                                                            <i className="fa fa-chevron-down" style={{fontSize: '12px', color: '#888'}}></i>
                                                        </div>
                                                        <div
                                                            id="university-dropdown"
                                                            style={{display: 'none', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '2px'}}
                                                        >
                                                            <div style={{padding: '8px', borderBottom: '1px solid #eee', position: 'relative'}}>
                                                                <i className="fa fa-search" style={{position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '13px'}}></i>
                                                                <input
                                                                    type="text"
                                                                    style={{width: '100%', padding: '6px 8px 6px 28px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none'}}
                                                                    placeholder="Search university..."
                                                                    value={universitySearch}
                                                                    onChange={(e) => setUniversitySearch(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            <ul style={{listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto'}}>
                                                                {[{label: 'Select university', value: ''},
                                                                  ...privateUniversityOptions
                                                                    .filter(o => o.toLowerCase().includes(universitySearch.toLowerCase()))
                                                                    .map(o => ({label: o, value: o})),
                                                                  {label: 'Other-Specify', value: 'other'}
                                                                ].map((item) => (
                                                                    <li
                                                                        key={item.value}
                                                                        style={{padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: item.value === '' ? '#aaa' : '#232323', background: universityOption === item.value ? '#f0f4ff' : 'transparent'}}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.background = universityOption === item.value ? '#f0f4ff' : 'transparent'}
                                                                        onClick={() => {
                                                                            setUniversityOption(item.value);
                                                                            setUniversity(item.value !== 'other' ? item.value : '');
                                                                            setUniversitySearch('');
                                                                            document.getElementById('university-dropdown').style.display = 'none';
                                                                        }}
                                                                    >
                                                                        {item.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        {universityOption && (
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                style={{marginTop: '8px'}}
                                                                placeholder="Enter your custom university name"
                                                                value={university}
                                                                onChange={(e) => setUniversity(e.target.value)}
                                                                readOnly={universityOption !== 'other'}
                                                            />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="field-group">
                                                        <label className="field-label">Batch</label>
                                                        <select
                                                            className="form-input"
                                                            value={batch}
                                                            onChange={(e) => setBatch(e.target.value)}
                                                        >
                                                            <option value="">Select batch year</option>
                                                            {Array.from({length: 12}, (_, i) => 2024 + i).map(year => (
                                                                <option key={year} value={String(year)}>{year}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* File Upload Area */}
                                                <div className="upload-field">
                                                    <label className="field-label">Student Data File </label>
                                                    <div 
                                                        className="file-upload-area"
                                                        onClick={() => !uploadingFile && document.getElementById('fileInput').click()}
                                                    >
                                                        <i className="fa fa-file-excel-o upload-icon"></i>
                                                        <span className="upload-text">
                                                            {uploadingFile ? 'Uploading...' : 
                                                             selectedFileName ? selectedFileName : 
                                                             'Click to select student data file (CSV, XLSX)'}
                                                        </span>
                                                        {uploadingFile && <div className="upload-spinner"></div>}
                                                    </div>
                                                    <input 
                                                        id="fileInput"
                                                        type="file" 
                                                        accept=".xlsx,.xls,.csv"
                                                        style={{display: 'none'}}
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setSelectedFile(file);
                                                                setSelectedFileName(file.name);
                                                                console.log('File selected:', file.name);
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <div className="helper-text">
                                                    <i className="fa fa-info-circle"></i>
                                                    Files will be processed automatically after admin approval.
                                                </div>
                                                
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="form-actions">
                                                <button className="btn-cancel">Cancel</button>
                                                <button className="btn-upload" onClick={() => {
                                                    if (selectedFile) {
                                                        console.log('Manual upload triggered for:', selectedFileName);
                                                        handleFileUpload({ target: { files: [selectedFile] } });
                                                    } else {
                                                        console.log('No file selected for upload');
                                                        showWarning('Please select a file first');
                                                    }
                                                }} disabled={uploadingFile || !selectedFile}>
                                                    <i className="fa fa-upload"></i>
                                                    Upload Dataset
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="upload-page">
                                    <div className="upload-history-section">
                                        <div className="section-header">
                                            <h3>Batch History</h3>
                                            <div className="upload-history-header-actions">
                                                <div className="upload-history-search" style={{display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                                                    <div style={{flex: 1, minWidth: '150px'}}>
                                                        <label style={{fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block'}}>Course Name</label>
                                                        <input
                                                            type="text"
                                                            value={uploadHistorySearch}
                                                            onChange={(e) => setUploadHistorySearch(e.target.value)}
                                                            placeholder="Search by course name"
                                                        />
                                                    </div>
                                                    <div style={{flex: 1, minWidth: '150px'}}>
                                                        <label style={{fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block'}}>University</label>
                                                        <input
                                                            type="text"
                                                            value={uploadHistoryUniversitySearch}
                                                            onChange={(e) => setUploadHistoryUniversitySearch(e.target.value)}
                                                            placeholder="Search by university"
                                                        />
                                                    </div>
                                                    <div style={{flex: 1, minWidth: '150px'}}>
                                                        <label style={{fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block'}}>Batch</label>
                                                        <select
                                                            value={uploadHistoryBatchFilter}
                                                            onChange={(e) => setUploadHistoryBatchFilter(e.target.value)}
                                                        >
                                                            <option value="">All Batches</option>
                                                            {uploadHistoryBatchOptions.map(b => (
                                                                <option key={b} value={b}>{b}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="history-count">
                                                    {filteredFileHistory.length}
                                                    {uploadHistorySearchTerm ? ` of ${placementData?.fileHistory?.length || 0}` : ''}
                                                    {' '}Files
                                                </div>
                                            </div>
                                        </div>
                                        <div className="upload-history-table table-responsive">
                                            <table>
                                                <colgroup>
                                                    <col className="upload-history-col-file" />
                                                    <col className="upload-history-col-balanced" />
                                                    <col className="upload-history-col-balanced" />
                                                    <col className="upload-history-col-balanced" />
                                                    <col className="upload-history-col-date" />
                                                    <col className="upload-history-col-status" />
                                                    <col className="upload-history-col-rejection" />
                                                    <col className="upload-history-col-actions" />
                                                </colgroup>
                                                <thead>
                                                    <tr>
                                                        <th>File Name</th>
                                                        <th className="upload-history-balanced-cell">Course Name</th>
                                                        <th className="upload-history-balanced-cell">University</th>
                                                        <th className="upload-history-balanced-cell">Batch</th>
                                                        <th>Upload Date</th>
                                                        <th>Status</th>
                                                        <th>Rejection Reason</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                                        filteredFileHistory.length > 0 ? (
                                                            filteredFileHistory.map((file, index) => (
                                                                <tr key={file._id || index}>
                                                                    <td>{file.fileName}</td>
                                                                    <td className="upload-history-balanced-cell">{file.customName || '-'}</td>
                                                                    <td className="upload-history-balanced-cell">{file.university || '-'}</td>
                                                                    <td className="upload-history-balanced-cell">{file.batch || '-'}</td>
                                                                    <td>{formatDate(file.uploadedAt)}</td>
                                                                    <td>
                                                                        <span className={`status-badge ${
                                                                            file.status === 'processed' ? 'status-success' :
                                                                            file.status === 'approved' ? 'status-info' :
                                                                            file.status === 'rejected' ? 'status-danger' : 'status-warning'
                                                                        }`}>
                                                                            {file.status === 'processed' ? 'Approved' : file.status || 'Pending'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {file.status === 'rejected' && file.rejectionReason ? (
                                                                            <button
                                                                                className="eye-btn"
                                                                                onClick={() => { setSelectedRejectionReason(file.rejectionReason); setShowRejectionModal(true); }}
                                                                                title="View rejection reason"
                                                                                style={{background: 'none', border: 'none', color: '#dc3545', fontSize: '16px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px'}}
                                                                            >
                                                                                <i className="fa fa-eye"></i>
                                                                            </button>
                                                                        ) : '-'}
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex gap-2 upload-history-actions">
                                                                            <button className="view-btn" onClick={() => handleViewFile(file._id, file.fileName)} title="View file data">
                                                                                <i className="fa fa-eye"></i>
                                                                            </button>
                                                                            {file.status === 'rejected' && (
                                                                                <button
                                                                                    className="reupload-btn"
                                                                                    onClick={() => handleResubmitFile(file)}
                                                                                    title="Reupload corrected file"
                                                                                    style={{backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer'}}
                                                                                >
                                                                                    <i className="fa fa-upload"></i>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                                                                    <i className="fa fa-search" style={{fontSize: '32px', marginBottom: '12px', opacity: '0.5'}}></i>
                                                                    <p>No upload history matches your search</p>
                                                                </td>
                                                            </tr>
                                                        )
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                                                                <i className="fa fa-history" style={{fontSize: '32px', marginBottom: '12px', opacity: '0.5'}}></i>
                                                                <p>No upload history yet</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div className="support-section">
                                    <PlacementSupportSection placementData={placementData} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>First Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.firstName || ''}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, firstName: e.target.value});
                                        if (formErrors.firstName) setFormErrors({...formErrors, firstName: ''});
                                    }}
                                    placeholder="Enter your first name"
                                    style={{borderColor: formErrors.firstName ? '#dc3545' : ''}}
                                />
                                {formErrors.firstName && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.firstName}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Last Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.lastName || ''}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, lastName: e.target.value});
                                        if (formErrors.lastName) setFormErrors({...formErrors, lastName: ''});
                                    }}
                                    placeholder="Enter your last name"
                                    style={{borderColor: formErrors.lastName ? '#dc3545' : ''}}
                                />
                                {formErrors.lastName && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.lastName}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Placement Dean Email <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="email"
                                    value={editFormData.email || ''}
                                    disabled={true}
                                    style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="tel"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => {
                                        const newPhone = e.target.value;
                                        setEditFormData({...editFormData, phone: newPhone});
                                        const p1 = newPhone.replace(/\D/g, '');
                                        const p2 = (editFormData.collegeOfficialPhone || '').replace(/\D/g, '');
                                        if (p1 && p2 && p1 === p2) {
                                            setFormErrors({...formErrors, phone: 'Primary phone must be different from college official phone', collegeOfficialPhone: 'College official phone must be different from primary phone'});
                                        } else {
                                            setFormErrors({...formErrors, phone: '', collegeOfficialPhone: formErrors.collegeOfficialPhone === 'College official phone must be different from primary phone' ? '' : formErrors.collegeOfficialPhone});
                                        }
                                    }}
                                    placeholder="Enter your phone number"
                                    style={{borderColor: formErrors.phone ? '#dc3545' : ''}}
                                />
                                {formErrors.phone && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.phone}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>College Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.collegeName || ''}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, collegeName: e.target.value});
                                        if (formErrors.collegeName) setFormErrors({...formErrors, collegeName: ''});
                                    }}
                                    placeholder="Enter your college name"
                                    style={{borderColor: formErrors.collegeName ? '#dc3545' : ''}}
                                />
                                {formErrors.collegeName && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.collegeName}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>College Address <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.collegeAddress || ''}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, collegeAddress: e.target.value});
                                        if (formErrors.collegeAddress) setFormErrors({...formErrors, collegeAddress: ''});
                                    }}
                                    placeholder="Enter college address"
                                    style={{borderColor: formErrors.collegeAddress ? '#dc3545' : ''}}
                                />
                                {formErrors.collegeAddress && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.collegeAddress}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>College Official Email <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="email"
                                    value={editFormData.collegeOfficialEmail || ''}
                                    onChange={(e) => {
                                        setEditFormData({...editFormData, collegeOfficialEmail: e.target.value});
                                        if (formErrors.collegeOfficialEmail) setFormErrors({...formErrors, collegeOfficialEmail: ''});
                                    }}
                                    placeholder="Enter college official email"
                                    style={{borderColor: formErrors.collegeOfficialEmail ? '#dc3545' : ''}}
                                />
                                {formErrors.collegeOfficialEmail && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.collegeOfficialEmail}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Additional College Official Email</label>
                                <input
                                    type="email"
                                    value={editFormData.additionalOfficialEmail || ''}
                                    onChange={(e) => setEditFormData({...editFormData, additionalOfficialEmail: e.target.value})}
                                    placeholder="Enter additional  college official email"
                                />
                            </div>
                            <div className="form-group">
                                <label>College Official Phone Number <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="tel"
                                    value={editFormData.collegeOfficialPhone || ''}
                                    onChange={(e) => {
                                        const newOfficialPhone = e.target.value;
                                        setEditFormData({...editFormData, collegeOfficialPhone: newOfficialPhone});
                                        const p1 = (editFormData.phone || '').replace(/\D/g, '');
                                        const p2 = newOfficialPhone.replace(/\D/g, '');
                                        if (p1 && p2 && p1 === p2) {
                                            setFormErrors({...formErrors, collegeOfficialPhone: 'College official phone must be different from primary phone', phone: 'Primary phone must be different from college official phone'});
                                        } else {
                                            setFormErrors({...formErrors, collegeOfficialPhone: '', phone: formErrors.phone === 'Primary phone must be different from college official phone' ? '' : formErrors.phone});
                                        }
                                    }}
                                    placeholder="Enter college official phone"
                                    style={{borderColor: formErrors.collegeOfficialPhone ? '#dc3545' : ''}}
                                />
                                {formErrors.collegeOfficialPhone && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>
                                        {formErrors.collegeOfficialPhone}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>College Logo <span style={{color: 'red'}}>*</span></label>
                                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                    {(logoPreview || placementData?.logo) && (
                                        <img src={logoPreview || getImagePreviewSrc(placementData.logo)} alt="Logo Preview" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd'}} />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => { handleLogoChange(e); if (formErrors.logo) setFormErrors({...formErrors, logo: ''}); }}
                                        style={{flex: 1, borderColor: formErrors.logo ? '#dc3545' : ''}}
                                    />
                                </div>
                                {formErrors.logo && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>{formErrors.logo}</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>ID Card <span style={{color: 'red'}}>*</span></label>
                                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                    {(idCardPreview || placementData?.idCard) && (
                                        <img src={idCardPreview || getImagePreviewSrc(placementData.idCard)} alt="ID Card Preview" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd'}} />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => { handleIdCardChange(e); if (formErrors.idCard) setFormErrors({...formErrors, idCard: ''}); }}
                                        style={{flex: 1, borderColor: formErrors.idCard ? '#dc3545' : ''}}
                                    />
                                </div>
                                {formErrors.idCard && (
                                    <small style={{color: '#dc3545', display: 'block', marginTop: '4px'}}>{formErrors.idCard}</small>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={updating}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleUpdateProfile} disabled={updating}>
                                {updating ? (
                                    <>
                                        <div className="spinner-sm"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-save"></i>
                                        Update Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {showRejectionModal && (
                <div className="modal-overlay" onClick={() => setShowRejectionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                        <div className="modal-header">
                            <h3>
                                <i className="fa fa-exclamation-triangle me-2" style={{color: '#dc3545'}}></i>
                                Rejection Reason
                            </h3>
                            <button className="close-btn" onClick={() => setShowRejectionModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="rejection-reason-content" style={{
                                padding: '20px',
                                backgroundColor: '#fff5f5',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                color: '#dc3545'
                            }}>
                                {selectedRejectionReason}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowRejectionModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resubmit File Modal */}
            {showResubmitModal && resubmittingFile && (
                <div className="modal-overlay" onClick={() => setShowResubmitModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <i className="fa fa-upload me-2" style={{color: '#28a745'}}></i>
                                Resubmit File: {resubmittingFile.fileName}
                            </h3>
                            <button className="close-btn" onClick={() => setShowResubmitModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            {resubmittingFile.rejectionReason && (
                                <div className="alert alert-warning mb-3">
                                    <h6><i className="fa fa-exclamation-triangle me-2"></i>Rejection Reason:</h6>
                                    <p className="mb-0">{resubmittingFile.rejectionReason}</p>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label>Course Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={resubmitCourseName}
                                    onChange={(e) => setResubmitCourseName(e.target.value)}
                                    placeholder="Enter course name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>University <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={resubmitUniversity}
                                    onChange={(e) => setResubmitUniversity(e.target.value)}
                                    placeholder="Enter university name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Batch <span style={{color: 'red'}}>*</span></label>
                                <select
                                    value={resubmitBatch}
                                    onChange={(e) => setResubmitBatch(e.target.value)}
                                    style={{width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px'}}
                                >
                                    <option value="">Select batch year</option>
                                    {Array.from({length: 12}, (_, i) => 2024 + i).map(year => (
                                        <option key={year} value={String(year)}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Select Corrected File <span style={{color: 'red'}}>*</span></label>
                                <div 
                                    className="file-upload-area"
                                    onClick={() => !resubmitting && document.getElementById('resubmitFileInput').click()}
                                    style={{
                                        border: '2px dashed #ccc',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: resubmitting ? 'not-allowed' : 'pointer',
                                        background: resubmitting ? '#f5f5f5' : '#fafafa'
                                    }}
                                >
                                    <i className="fa fa-file-excel-o" style={{fontSize: '24px', marginBottom: '8px'}}></i>
                                    <p className="mb-0">
                                        {resubmitting ? 'Uploading...' : 
                                         resubmitFileName ? resubmitFileName : 
                                         'Click to select corrected file (CSV, XLSX)'}
                                    </p>
                                    {resubmitting && <div className="spinner-sm mt-2"></div>}
                                </div>
                                <input 
                                    id="resubmitFileInput"
                                    type="file" 
                                    accept=".xlsx,.xls,.csv"
                                    style={{display: 'none'}}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setResubmitFile(file);
                                            setResubmitFileName(file.name);
                                        }
                                    }}
                                    disabled={resubmitting}
                                />
                                <small className="text-muted">
                                    Please upload the corrected version of your file addressing the rejection reason above.
                                </small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={() => {
                                    setShowResubmitModal(false);
                                    setResubmittingFile(null);
                                    setResubmitFile(null);
                                    setResubmitFileName('');
                                    setResubmitCourseName('');
                                    setResubmitUniversity('');
                                    setResubmitBatch('');
                                }} 
                                disabled={resubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={handleResubmitUpload} 
                                disabled={resubmitting || !resubmitFile || !resubmitCourseName.trim() || !resubmitUniversity.trim() || !resubmitBatch.trim()}
                                style={{backgroundColor: '#28a745', borderColor: '#28a745'}}
                            >
                                {resubmitting ? (
                                    <>
                                        <div className="spinner-sm"></div>
                                        Resubmitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-upload"></i>
                                        Resubmit File
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Do you want to Logout your profile?"} />
        </div>
    );
}

export default PlacementDashboardRedesigned;
