import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import './student-directory.css';

function StudentDirectory() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, userType } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated() && userType === 'placement') {
            const fileData = location.state;
            if (fileData?.fileId) {
                fetchSpecificFile(fileData.fileId, fileData.fileName);
            } else {
                fetchStudents();
            }
        }
    }, [isAuthenticated, userType, location.state]);

    const fetchSpecificFile = async (fileId, fileName) => {
        try {
            console.log('Fetching specific file:', fileId, fileName);
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('placementToken');
            
            const response = await fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.fileData) {
                    console.log('File data received:', data.fileData[0]);
                    const cleanedStudents = data.fileData.map(row => {
                        console.log('Processing row:', row);
                        return {
                            name: row['Candidate Name'] || row['candidate name'] || row.Name || row.name || '',
                            email: row.Email || row.email || '',
                            phone: row.Phone || row.phone || '',
                            course: row.Course || row.course || 'Not Specified',
                            credits: row['Credits Assigned'] || row.Credits || row.credits || '0',
                            collegeName: row['College Name'] || row['college name'] || row.College || row.college || 'Not Available'
                        };
                    });
                    setStudents(cleanedStudents);
                }
            }
        } catch (error) {
            console.error('Error fetching specific file:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            console.log('Fetching students for directory...');
            const data = await api.getMyPlacementData();
            console.log('Student directory data:', data);
            
            if (data.success) {
                const cleanedStudents = (data.students || []).map(student => {
                    console.log('Full student data:', JSON.stringify(student, null, 2));
                    return {
                        name: student.name || student['Candidate Name'] || student['candidate name'] || '',
                        email: student.email || student.Email || '',
                        phone: student.phone || student.Phone || '',
                        course: student.course || student.Course || student['Course'] || 'Not Specified',
                        credits: student.credits || student['Credits Assigned'] || '0',
                        collegeName: student.collegeName || student['College Name'] || 'Not Available'
                    };
                });
                setStudents(cleanedStudents);
                console.log('Cleaned students:', cleanedStudents);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudent = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'S';
    };

    return (
        <div className="dashboard-container">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h4 className="logo">Placement</h4>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${location.pathname === '/placement/dashboard' ? 'active' : ''}`} onClick={() => navigate('/placement/dashboard')}>
                        <i className="fa fa-tachometer"></i>
                        <span>Overview</span>
                    </div>
                    <div className={`nav-item ${location.pathname === '/placement/student-directory' ? 'active' : ''}`}>
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

            {/* Main Content */}
            <div className="main-content">
                {/* Top Header */}
                <div className="top-header">
                    <div className="header-actions">
                        <div className="notification-icon">
                            <i className="fa fa-bell"></i>
                        </div>
                        <div className="user-profile">
                            <span>Placement Officer</span>
                            <div className="user-avatar">
                                <i className="fa fa-user"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Directory Content */}
                <div className="directory-content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">
                            {location.state?.customName || location.state?.fileName ? 
                                `Students - ${location.state.customName || location.state.fileName}` : 
                                'Student Directory'
                            }
                        </h1>
                        <div className="student-count-badge">
                            {students.length} {location.state?.fileId ? 'Students' : 'Registered'}
                        </div>
                    </div>

                    {/* Student Table */}
                    <div className="table-responsive">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading students...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-users"></i>
                                <h4>No Students Found</h4>
                                <p>Upload student data to see directory</p>
                            </div>
                        ) : (
                            <table className="student-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>College</th>
                                        <th>Course</th>
                                        <th>Phone</th>
                                        <th>Credits</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={index} className="student-row">
                                            <td className="student-cell">
                                                <div className="student-info">
                                                    <div className="student-avatar">
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div className="student-details">
                                                        <div className="student-name">{student.name}</div>
                                                        <div className="student-email">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="college-cell">
                                                {student.collegeName || student['College Name'] || 'Not Available'}
                                            </td>
                                            <td className="course-cell">
                                                {student.course || 'Not Specified'}
                                            </td>
                                            <td className="phone-cell">
                                                {student.phone}
                                            </td>
                                            <td className="credits-cell">
                                                <span className="credits-badge">
                                                    {student.credits || '0'}
                                                </span>
                                            </td>
                                            <td className="status-cell">
                                                <span className="status-badge">
                                                    LOGIN READY
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showModal && selectedStudent && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Student Details</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="student-detail-card">
                                <div className="student-avatar-large">
                                    {getInitials(selectedStudent.name)}
                                </div>
                                <div className="student-info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <span>{selectedStudent.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <span>{selectedStudent.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone Number</label>
                                        <span>{selectedStudent.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Course</label>
                                        <span>{selectedStudent.course}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Credits</label>
                                        <span className="credits-badge">{selectedStudent.credits}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Status</label>
                                        <span className="status-badge">LOGIN READY</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentDirectory;