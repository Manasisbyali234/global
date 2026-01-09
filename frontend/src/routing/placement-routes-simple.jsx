import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { placement } from "../globals/route-names";
import { api } from "../utils/api";
import '../app/pannels/common/modern-dashboard.css';
import '../app/pannels/placement/placement-dashboard.css';

function PlacementDashboard() {
    const [placementData, setPlacementData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchPlacementDetails();
    }, []);

    const fetchPlacementDetails = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('placementToken');
            if (!token) {
                
                return;
            }
            
            const profileResponse = await fetch('http://localhost:5000/api/placement/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!profileResponse.ok) {
                
                return;
            }
            
            const profileData = await profileResponse.json();
            const userEmail = profileData.placement?.email;
            
            if (!userEmail) {
                
                return;
            }
            
            const allPlacementsResponse = await api.getAllPlacements();
            if (!allPlacementsResponse.success) {
                
                return;
            }
            
            const userPlacement = allPlacementsResponse.data.find(placement => 
                placement.email === userEmail
            );
            
            if (!userPlacement) {
                
                return;
            }
            
            const response = await api.getPlacementDetails(userPlacement._id);
            if (response.success) {
                const placementWithLogo = {
                    ...response.placement,
                    logo: localStorage.getItem('placementLogo')
                };
                setPlacementData(placementWithLogo);
                fetchStudentData(userPlacement._id);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentData = async (placementId) => {
        try {
            setLoadingData(true);
            const response = await fetch(`http://localhost:5000/api/admin/placements/${placementId}/data`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStudentData(data.students || []);
            }
        } catch (error) {
            
        } finally {
            setLoadingData(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/placements/${placementData._id}/download`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = placementData.fileName || 'student_data.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download file');
            }
        } catch (error) {
            alert('Error downloading file');
        }
    };

    const handleLogoUpload = (file) => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setPlacementData(prev => ({ ...prev, logo: e.target.result }));
            localStorage.setItem('placementLogo', e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('studentData', selectedFile);

            const response = await fetch('http://localhost:5000/api/placement/upload-student-data', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                alert('Student data uploaded successfully!');
                setSelectedFile(null);
                fetchPlacementDetails();
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            
            alert('Upload failed. Please try again.');
        } finally {
            setUploadingFile(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid p-4">
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <h4>Loading Dashboard...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (!placementData) {
        return (
            <div className="container-fluid p-4">
                <div className="card p-5 text-center">
                    <i className="fa fa-lock fa-3x text-danger mb-3"></i>
                    <h3>Access Denied</h3>
                    <p className="text-muted">Please login with valid placement officer credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{background: '#f8f9fa', minHeight: '100vh', padding: '2rem 0'}}>
            <div className="container-fluid px-4">
                {/* Header */}
                <div className="card mb-4 p-4">
                    <div className="row align-items-center">
                        <div className="col-md-2 text-center">
                            <div className="mb-3">
                                {placementData.logo ? (
                                    <img 
                                        src={placementData.logo} 
                                        alt="College Logo" 
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            border: '2px solid #dee2e6',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('logoInput').click()}
                                    />
                                ) : (
                                    <div 
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '8px',
                                            border: '2px dashed #dee2e6',
                                            background: '#f8f9fa',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onClick={() => document.getElementById('logoInput').click()}
                                    >
                                        <i className="fa fa-camera fa-2x text-muted"></i>
                                    </div>
                                )}
                                <input 
                                    id="logoInput"
                                    type="file" 
                                    accept="image/*" 
                                    style={{display: 'none'}}
                                    onChange={(e) => handleLogoUpload(e.target.files[0])}
                                />
                            </div>
                            <small className="text-muted" style={{cursor: 'pointer'}} onClick={() => document.getElementById('logoInput').click()}>
                                {placementData.logo ? 'Change Logo' : 'Upload Logo'}
                            </small>
                        </div>
                        <div className="col-md-10">
                            <h2 className="mb-3" style={{color: '#2c3e50', fontWeight: '600'}}>
                                Welcome, {placementData.name}
                            </h2>
                            <div className="d-flex flex-wrap gap-2">
                                <span className="badge badge-primary px-3 py-2">
                                    <i className="fa fa-university mr-2"></i>
                                    {placementData.collegeName || 'College Name Not Available'}
                                </span>
                                <span className="badge badge-secondary px-3 py-2">
                                    <i className="fa fa-envelope mr-2"></i>
                                    {placementData.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <div className="bg-success text-white rounded p-2 mr-3">
                                    <i className="fa fa-users"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">{studentData.length}</h4>
                                    <small className="text-muted">Total Students</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded p-2 mr-3">
                                    <i className="fa fa-credit-card"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">{placementData.credits || 0}</h4>
                                    <small className="text-muted">Available Credits</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <div className={`bg-${placementData.status === 'approved' ? 'success' : 'warning'} text-white rounded p-2 mr-3`}>
                                    <i className={`fa ${placementData.status === 'approved' ? 'fa-check-circle' : 'fa-clock-o'}`}></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 text-capitalize">{placementData.status || 'Pending'}</h6>
                                    <small className="text-muted">Account Status</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <div className={`bg-${placementData.isProcessed ? 'success' : 'danger'} text-white rounded p-2 mr-3`}>
                                    <i className={`fa ${placementData.isProcessed ? 'fa-check' : 'fa-times'}`}></i>
                                </div>
                                <div>
                                    <h6 className="mb-0">{placementData.isProcessed ? 'Processed' : 'Pending'}</h6>
                                    <small className="text-muted">Data Status</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <div className="card p-4">
                            <h5 className="mb-3">
                                <i className="fa fa-user-circle mr-2"></i>
                                Officer Information
                            </h5>
                            <div className="mb-3">
                                <label className="text-muted mb-1">Phone Number</label>
                                <p className="mb-0">{placementData.phone || 'Not provided'}</p>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted mb-1">Registration Date</label>
                                <p className="mb-0">{new Date(placementData.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                            
                            {/* File Upload */}
                            <div>
                                <label className="text-muted mb-2">Student Data File</label>
                                {placementData.fileName ? (
                                    <div className="alert alert-success p-2 mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <i className="fa fa-file-excel-o mr-2"></i>
                                                <small>{placementData.fileName}</small>
                                            </div>
                                            <button className="btn btn-sm btn-success" onClick={handleDownload}>
                                                <i className="fa fa-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning p-2 mb-3">
                                        <small>No file uploaded yet</small>
                                    </div>
                                )}
                                
                                <div className="border rounded p-3" style={{background: '#f8f9fa'}}>
                                    <div className="text-center mb-2">
                                        <i className="fa fa-cloud-upload fa-2x text-muted"></i>
                                        <p className="mb-0 text-muted">Upload Student Data</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="form-control mb-2"
                                    />
                                    <button 
                                        className="btn btn-primary btn-sm w-100"
                                        onClick={handleFileUpload}
                                        disabled={!selectedFile || uploadingFile}
                                    >
                                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8 mb-4">
                        <div className="card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    <i className="fa fa-graduation-cap mr-2"></i>
                                    Student Records
                                    {studentData.length > 0 && (
                                        <span className="badge badge-primary ml-2">{studentData.length}</span>
                                    )}
                                </h5>
                                {placementData.isProcessed && (
                                    <div className="alert alert-success mb-0 py-1 px-2">
                                        <small>
                                            <i className="fa fa-check-circle mr-1"></i>
                                            {placementData.candidatesCreated || 0} candidates created
                                        </small>
                                    </div>
                                )}
                            </div>
                            
                            {loadingData ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary mb-2" role="status"></div>
                                    <p className="text-muted">Loading student data...</p>
                                </div>
                            ) : studentData.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th>Password</th>
                                                <th>Credits</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentData.map((student, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.name || 'N/A'}</td>
                                                    <td>{student.phone || '-'}</td>
                                                    <td>{student.email || 'N/A'}</td>
                                                    <td>
                                                        <code className="small">{student.password || 'N/A'}</code>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info">
                                                            {placementData?.credits || student.credits || 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-users fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">No student data available</h6>
                                    <p className="text-muted mb-0">Upload an Excel or CSV file to see records here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlacementRoutes() {
    return (
        <Routes>
            <Route path={placement.INITIAL} element={<PlacementDashboard />} />
            <Route path={placement.DASHBOARD} element={<PlacementDashboard />} />
        </Routes>
    )
}

export default PlacementRoutes;
