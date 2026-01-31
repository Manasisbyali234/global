import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { debugAuth, testAPIConnection, testPlacementAuth } from '../../../utils/authDebug';
import PlacementNotificationsRedesigned from './sections/PlacementNotificationsRedesigned';
import './placement-dashboard-redesigned.css';
import '../../../placement-mobile-fix.css';
import '../../../placement-rejection-styles.css';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../utils/popupNotification';
import NotificationBell from '../../../components/NotificationBell';
import JobZImage from '../../common/jobz-img';
import YesNoPopup from '../../common/popups/popup-yes-no';
import { popupType } from '../../../globals/constants';

function PlacementDashboardRedesigned() {
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
    const [batch, setBatch] = useState('');
    const [viewingFileId, setViewingFileId] = useState(null);
    const [viewingFileName, setViewingFileName] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        phone: '',
        collegeName: '',
        collegeAddress: '',
        collegeOfficialEmail: '',
        collegeOfficialPhone: ''
    });
    const [updating, setUpdating] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState(null);
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
    const [stats, setStats] = useState({
        totalStudents: 0,
        avgCredits: 0,
        activeBatches: 0,
        coursesCovered: 0
    });

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
                const students = data.students || [];
                console.log('Total students:', students.length);
                console.log('Sample student data:', students[0]);
                console.log('All course values from backend:', students.map(s => ({ name: s.name, course: s.course })));
                console.log('Credits distribution:', students.map(s => ({ name: s.name, credits: s.credits })));
                
                // Fix course display issue - change "Not Specified" to "Not Provided"
                const fixedStudents = students.map(student => ({
                    ...student,
                    course: student.course === 'Not Specified' ? 'Not Provided' : student.course
                }));
                
                setStudentData(fixedStudents);
                calculateStats(fixedStudents);
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
                showSuccess('Student data uploaded successfully! Waiting for admin approval.');
                setSelectedFile(null);
                setSelectedFileName('');
                setCourseName('');
                setCourseNameOption('');
                setUniversity('');
                setUniversityOption('');
                setBatch('');
                await Promise.all([
                    fetchPlacementDetails(), // Refresh placement data to show new file
                    fetchStudentData() // Refresh student data
                ]);
            } else {
                showError(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError(error.message || 'Upload failed. Please try again.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleEditProfile = () => {
        let firstName = placementData?.firstName || '';
        let lastName = placementData?.lastName || '';
        
        if (!firstName && !lastName && placementData?.name) {
            const nameParts = placementData.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        
        setEditFormData({
            name: placementData?.name || '',
            firstName: firstName,
            lastName: lastName,
            phone: placementData?.phone || '',
            collegeName: placementData?.collegeName || '',
            collegeAddress: placementData?.collegeAddress || '',
            collegeOfficialEmail: placementData?.collegeOfficialEmail || '',
            collegeOfficialPhone: placementData?.collegeOfficialPhone || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateProfile = async () => {
        if (!editFormData.firstName.trim()) {
            showWarning('First Name is required');
            return;
        }
        if (!editFormData.lastName.trim()) {
            showWarning('Last Name is required');
            return;
        }
        if (!editFormData.phone.trim()) {
            showWarning('Phone Number is required');
            return;
        }
        if (!editFormData.collegeName.trim()) {
            showWarning('College Name is required');
            return;
        }
        if (!editFormData.collegeAddress.trim()) {
            showWarning('College Address is required');
            return;
        }
        if (!editFormData.collegeOfficialEmail.trim()) {
            showWarning('College Official Email is required');
            return;
        }
        if (!editFormData.collegeOfficialPhone.trim()) {
            showWarning('College Official Phone is required');
            return;
        }

        setUpdating(true);
        try {
            // Upload images first if any are selected
            if (logoPreview || idCardPreview) {
                const uploadPromises = [];
                if (logoPreview) {
                    uploadPromises.push(api.uploadLogo(logoPreview));
                }
                if (idCardPreview) {
                    uploadPromises.push(api.uploadIdCard(idCardPreview));
                }
                await Promise.all(uploadPromises);
            }
            
            // Then update profile
            const response = await api.updatePlacementProfile(editFormData);
            
            if (response && response.success) {
                showSuccess('Profile updated successfully!');
                setShowEditModal(false);
                setLogoPreview(null);
                setIdCardPreview(null);
                await fetchPlacementDetails();
            } else {
                showError(response?.message || 'Failed to update profile');
            }
        } catch (error) {
            showError(error.message || 'Error updating profile. Please try again.');
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
            const uploadPromises = [];

            if (logoPreview) {
                uploadPromises.push(api.uploadLogo(logoPreview));
            }

            if (idCardPreview) {
                uploadPromises.push(api.uploadIdCard(idCardPreview));
            }

            await Promise.all(uploadPromises);
            
            showSuccess('Images uploaded successfully!');
            setLogoPreview(null);
            setIdCardPreview(null);
            await fetchPlacementDetails();
        } catch (error) {
            showError(error.message || 'Error uploading images. Please try again.');
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
                if (data.success && data.fileData) {
                    console.log('Raw file data sample:', data.fileData[0]); // Debug: see actual column names
                    console.log('Available columns:', Object.keys(data.fileData[0] || {})); // Debug: list all columns
                    
                    const cleanedData = data.fileData.map(row => {
                        const courseValue = row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || row['Course Name'] || row['course name'] || row['COURSE NAME'] || row.Program || row.program || row.PROGRAM || row.Department || row.department || row.DEPARTMENT || row.Stream || row.stream || row.STREAM || 'Not Provided';
                        console.log('Course mapping for row:', { originalRow: row, mappedCourse: courseValue }); // Debug course mapping
                        
                        return {
                            name: row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
                            email: row.Email || row.email || row.EMAIL || '',
                            phone: row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
                            course: courseValue,
                            credits: row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || '0'
                        };
                    });
                    console.log('Cleaned data sample:', cleanedData[0]); // Debug: see final mapped data
                    console.log('Course distribution:', cleanedData.map(s => s.course)); // Debug: see all course values
                    
                    setStudentData(cleanedData);
                    setViewingFileId(fileId);
                    setViewingFileName(fileName);
                    setActiveTab('students');
                    showSuccess(`Loaded data from ${fileName}`);
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
                showSuccess('File resubmitted successfully! Waiting for admin approval.');
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
                showError(data.message || 'Resubmission failed');
            }
        } catch (error) {
            console.error('Resubmit error:', error);
            const errorMessage = error.message || 'Resubmission failed. Please try again.';
            // Remove HTTP status codes and related error prefixes from error message
            const cleanMessage = errorMessage
                .replace(/HTTP\s*\d+/gi, '')
                .replace(/\d{3}\s*-?\s*/g, '')
                .replace(/^[:\s-]+|[:\s-]+$/g, '')
                .trim();
            showError(cleanMessage || 'Resubmission failed. Please try again.');
        } finally {
            setResubmitting(false);
        }
    };



    const recalculateStats = () => {
        calculateStats(studentData);
        showSuccess('Statistics recalculated successfully!');
    };

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
                    <p>Please login with valid placement officer credentials.</p>
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
                        <JobZImage id="skin_header_logo" src="images/skins-logo/logo-skin-8.png" alt="Logo" style={{height: '40px', width: 'auto'}} />
                    </div>
                    <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                
                <nav className="sidebar-nav">
                    <div 
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('overview');
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-dashboard"></i>
                        <span>Overview</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('students');
                            setViewingFileId(null);
                            setViewingFileName(null);
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
                            setIsSidebarOpen(false);
                        }}
                    >
                        <i className="fa fa-upload"></i>
                        <span>Batch Upload</span>
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
                {/* Top Header */}
                <div className="top-header">
                    <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
                        <i className="fa fa-bars"></i>
                    </button>
                    <div className="header-actions">
                        <NotificationBell userRole="placement" />
                        <div className="user-profile">
                            <div className="profile-avatar">
                                {placementData?.logo ? (
                                    <img 
                                        src={placementData.logo.startsWith('data:') ? placementData.logo : `data:image/jpeg;base64,${placementData.logo}`} 
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
                                                                src={placementData.logo.startsWith('data:') ? placementData.logo : `data:image/jpeg;base64,${placementData.logo}`} 
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
                                                                src={placementData.idCard.startsWith('data:') ? placementData.idCard : `data:image/jpeg;base64,${placementData.idCard}`} 
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
                                                <div className="role-label">PLACEMENT OFFICER</div>
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
                                                <div className="stat-icon">
                                                    <i className="fa fa-users"></i>
                                                </div>
                                                <div className="stat-content">
                                                    <p className="stat-label">Total Students</p>
                                                    <h3 className="stat-value">{stats.totalStudents}</h3>
                                                </div>
                                            </div>
                                            <div className="stats-card">
                                                <div className="stat-icon">
                                                    <i className="fa fa-graduation-cap"></i>
                                                </div>
                                                <div className="stat-content">
                                                    <p className="stat-label">Active Batches</p>
                                                    <h3 className="stat-value">{stats.activeBatches}</h3>
                                                </div>
                                            </div>
                                            <div className="stats-card">
                                                <div className="stat-icon">
                                                    <i className="fa fa-book"></i>
                                                </div>
                                                <div className="stat-content">
                                                    <p className="stat-label">Courses Covered</p>
                                                    <h3 className="stat-value">{stats.coursesCovered}</h3>
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
                                            <a href="#" className="manage-all-link">Manage All Batches</a>
                                        </div>
                                        <div className="activity-list">
                                            {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                                placementData.fileHistory
                                                    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)) // Sort by newest first
                                                    .slice(0, 5)
                                                    .map((file, index) => (
                                                    <div key={file._id || index} className="activity-item">
                                                        <div className="activity-content">
                                                            <div className="batch-name">{file.customName || file.fileName}</div>
                                                            <div className="file-name">{file.fileName}</div>
                                                            <div className="activity-metadata">
                                                                <span><i className="fa fa-university"></i>{file.university || placementData?.collegeName || 'University'}</span>
                                                                <span><i className="fa fa-calendar"></i>{file.batch || 'Batch 2024'}</span>
                                                                <span><i className="fa fa-clock-o"></i>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                                <span className={`status-indicator ${
                                                                    file.status === 'processed' ? 'status-processed' : 
                                                                    file.status === 'approved' ? 'status-approved' : 
                                                                    file.status === 'rejected' ? 'status-rejected' : 'status-pending'
                                                                }`}>
                                                                    <i className={`fa ${
                                                                        file.status === 'processed' ? 'fa-check-circle' : 
                                                                        file.status === 'approved' ? 'fa-thumbs-up' : 
                                                                        file.status === 'rejected' ? 'fa-times-circle' : 'fa-clock-o'
                                                                    }`}></i>
                                                                    {file.status === 'processed' ? 'Processed' : 
                                                                     file.status === 'approved' ? 'Approved' : 
                                                                     file.status === 'rejected' ? 'Rejected' : 'Pending'}
                                                                </span>
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
                                    {studentData.length > 0 ? (
                                        <div className="students-table">
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
                                                    {studentData.map((student, index) => (
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
                                                <li>Ensure your file contains columns: Name, Email, Phone, Course, Credits</li>
                                                <li>Use CSV or Excel format (.csv, .xlsx, .xls)</li>
                                                <li>Maximum file size: 10MB</li>
                                                <li>Remove empty rows and special characters</li>
                                                <li>Verify all email addresses are valid</li>
                                            </ul>
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
                                                    <div className="field-group">
                                                        <label className="field-label">Course Name</label>
                                                        <select 
                                                            className="form-input"
                                                            value={courseNameOption}
                                                            onChange={(e) => {
                                                                setCourseNameOption(e.target.value);
                                                                if (e.target.value !== 'other') {
                                                                    setCourseName(e.target.value);
                                                                } else {
                                                                    setCourseName('');
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select course name</option>
                                                            <option value="Computer Science Engineering">Computer Science Engineering</option>
                                                            <option value="Information Technology">Information Technology</option>
                                                            <option value="Electronics and Communication">Electronics and Communication</option>
                                                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                            <option value="Civil Engineering">Civil Engineering</option>
                                                            <option value="Electrical Engineering">Electrical Engineering</option>
                                                            <option value="Business Administration">Business Administration</option>
                                                            <option value="Commerce">Commerce</option>
                                                            <option value="Arts">Arts</option>
                                                            <option value="other">Other-Specify</option>
                                                        </select>
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
                                                    
                                                    <div className="field-group">
                                                        <label className="field-label">University</label>
                                                        <select 
                                                            className="form-input"
                                                            value={universityOption}
                                                            onChange={(e) => {
                                                                setUniversityOption(e.target.value);
                                                                if (e.target.value !== 'other') {
                                                                    setUniversity(e.target.value);
                                                                } else {
                                                                    setUniversity('');
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select university</option>
                                                            <option value="Delhi University">Delhi University</option>
                                                            <option value="Jawaharlal Nehru University">Jawaharlal Nehru University</option>
                                                            <option value="University of Mumbai">University of Mumbai</option>
                                                            <option value="University of Calcutta">University of Calcutta</option>
                                                            <option value="Anna University">Anna University</option>
                                                            <option value="Bangalore University">Bangalore University</option>
                                                            <option value="Pune University">Pune University</option>
                                                            <option value="Osmania University">Osmania University</option>
                                                            <option value="Andhra University">Andhra University</option>
                                                            <option value="other">Other-Specify</option>
                                                        </select>
                                                        {universityOption === 'other' && (
                                                            <input 
                                                                type="text" 
                                                                className="form-input" 
                                                                style={{marginTop: '8px'}}
                                                                placeholder="Enter custom university name"
                                                                value={university}
                                                                onChange={(e) => setUniversity(e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="field-group">
                                                        <label className="field-label">Batch</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-input"
                                                            placeholder="Enter batch information (e.g., 2024, Spring 2024)"
                                                            value={batch}
                                                            onChange={(e) => setBatch(e.target.value)}
                                                        />
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
                                                    Files will be processed automatically after admin approval. Default naming will be used if custom name is not provided.
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

                                    {/* Upload History Table */}
                                    <div className="upload-history-section">
                                        <div className="section-header">
                                            <h3>Upload History</h3>
                                            <div className="history-count">{placementData?.fileHistory?.length || 0} Files</div>
                                        </div>
                                        <div className="upload-history-table">
                                            {console.log('File history data:', placementData?.fileHistory)}
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>File Name</th>
                                                        <th>Course Name</th>
                                                        <th>University</th>
                                                        <th>Batch</th>
                                                        <th>Upload Date</th>
                                                        <th>Status</th>
                                                        <th>Rejection Reason</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {placementData?.fileHistory && placementData.fileHistory.length > 0 ? (
                                                        placementData.fileHistory.map((file, index) => {
                                                            console.log('Rendering file:', file);
                                                            return (
                                                            <tr key={file._id || index}>
                                                                <td>{file.fileName}</td>
                                                                <td>{file.customName || '-'}</td>
                                                                <td>{file.university || '-'}</td>
                                                                <td>{file.batch || '-'}</td>
                                                                <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                                                                <td>
                                                                    <span className={`status-badge ${
                                                                        file.status === 'processed' ? 'status-success' : 
                                                                        file.status === 'approved' ? 'status-info' : 
                                                                        file.status === 'rejected' ? 'status-danger' : 'status-warning'
                                                                    }`}>
                                                                        {file.status || 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {file.status === 'rejected' && file.rejectionReason ? (
                                                                        <button 
                                                                            className="eye-btn"
                                                                            onClick={() => {
                                                                                setSelectedRejectionReason(file.rejectionReason);
                                                                                setShowRejectionModal(true);
                                                                            }}
                                                                            title="View rejection reason"
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: '#dc3545',
                                                                                fontSize: '16px',
                                                                                cursor: 'pointer',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px',
                                                                                transition: 'background-color 0.2s'
                                                                            }}
                                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fff5f5'}
                                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                        >
                                                                            <i className="fa fa-eye"></i>
                                                                        </button>
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <button 
                                                                            className="view-btn"
                                                                            onClick={() => handleViewFile(file._id, file.fileName)}
                                                                            title="View file data"
                                                                        >
                                                                            <i className="fa fa-eye"></i>
                                                                        </button>
                                                                        {file.status === 'rejected' && (
                                                                            <button 
                                                                                className="reupload-btn"
                                                                                onClick={() => handleResubmitFile(file)}
                                                                                title="Reupload corrected file"
                                                                                style={{
                                                                                    backgroundColor: '#28a745',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    padding: '6px 10px',
                                                                                    fontSize: '0.8rem',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                <i className="fa fa-upload"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            );
                                                        })
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
                            <h4 className="modal-section-title">Personal Information</h4>
                            <div className="form-group">
                                <label>First Name <span className="required" style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.firstName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.lastName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="tel"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            
                            <h4 className="modal-section-title">Placement Information</h4>
                            <div className="form-group">
                                <label>College Name <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="text"
                                    value={editFormData.collegeName || ''}
                                    onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})}
                                    placeholder="Enter your college name"
                                />
                            </div>
                            <div className="form-group">
                                <label>College Address <span style={{color: 'red'}}>*</span></label>
                                <textarea
                                    value={editFormData.collegeAddress || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length > 200) {
                                            showWarning('College Address cannot exceed 200 characters');
                                            return;
                                        }
                                        setEditFormData({...editFormData, collegeAddress: value});
                                    }}
                                    placeholder="Enter your college address (max 200 characters)"
                                    rows="3"
                                    maxLength="200"
                                />
                                <small style={{color: editFormData.collegeAddress?.length > 180 ? '#d97706' : 'var(--text-muted)'}}>
                                    {editFormData.collegeAddress?.length || 0}/200 characters
                                </small>
                            </div>
                            <div className="form-group">
                                <label>College Official Email <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="email"
                                    value={editFormData.collegeOfficialEmail || ''}
                                    onChange={(e) => setEditFormData({...editFormData, collegeOfficialEmail: e.target.value})}
                                    placeholder="Enter college official email"
                                />
                            </div>
                            <div className="form-group">
                                <label>College Official Phone <span style={{color: 'red'}}>*</span></label>
                                <input
                                    type="tel"
                                    value={editFormData.collegeOfficialPhone || ''}
                                    onChange={(e) => setEditFormData({...editFormData, collegeOfficialPhone: e.target.value})}
                                    placeholder="Enter college official phone number"
                                />
                            </div>

                            <div className="form-divider">
                                <hr />
                                <span>Upload Images (Optional)</span>
                                <hr />
                            </div>

                            <div className="form-group">
                                <label>College Logo</label>
                                <div className="image-upload-preview">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="preview-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <i className="fa fa-image"></i>
                                            <p>Logo Preview</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="file-input"
                                    disabled={uploadingImages}
                                />
                                <small>Upload a logo image for your college (JPG, PNG, etc.)</small>
                            </div>

                            <div className="form-group">
                                <label>ID Card</label>
                                <div className="image-upload-preview">
                                    {idCardPreview ? (
                                        <img src={idCardPreview} alt="ID Card Preview" className="preview-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <i className="fa fa-id-card"></i>
                                            <p>ID Card Preview</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleIdCardChange}
                                    className="file-input"
                                    disabled={uploadingImages}
                                />
                                <small>Upload your ID card image (JPG, PNG, etc.)</small>
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
                                <input
                                    type="text"
                                    value={resubmitBatch}
                                    onChange={(e) => setResubmitBatch(e.target.value)}
                                    placeholder="Enter batch information"
                                />
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