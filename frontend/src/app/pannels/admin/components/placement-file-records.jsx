import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../../../../utils/dateFormatter';
import { api, ADMIN_API_URL } from '../../../../utils/api';
import PageLoader from '../../../../components/PageLoader';
import './placement-details.css';

function PlacementFileRecords() {
    const { id, fileId } = useParams();
    const navigate = useNavigate();
    const [placement, setPlacement] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchFileRecords = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [placementResponse, fileResponse] = await Promise.all([
                api.getPlacementDetails(id),
                fetch(`${ADMIN_API_URL}/placements/${id}/files/${fileId}/data`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                })
            ]);

            const fileData = await fileResponse.json();

            if (!placementResponse.success) {
                setError(placementResponse.message || 'Failed to fetch placement details');
                return;
            }

            if (!fileResponse.ok || !fileData.success) {
                setError(fileData.message || 'Failed to load student records');
                return;
            }

            const file = placementResponse.placement?.fileHistory?.find(historyFile => historyFile._id === fileId);
            setPlacement(placementResponse.placement);
            setSelectedFile(file || null);
            setStudentData(fileData.students || []);
        } catch (error) {
            setError(error.message || 'Error loading student records');
        } finally {
            setLoading(false);
        }
    }, [id, fileId]);

    useEffect(() => {
        fetchFileRecords();
    }, [fetchFileRecords]);

    if (loading) {
        return <PageLoader pageName="Student Records" />;
    }

    if (error) {
        return (
            <div className="placement-details-page container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                <div className="modern-card p-4">
                    <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(`/manage/xK9mP2/placement-details/${id}`)}>
                        <i className="fa fa-arrow-left me-2"></i>
                        Back to Placement Details
                    </button>
                    <h2 style={{color: '#2c3e50'}}>Error: {error}</h2>
                </div>
            </div>
        );
    }

    const fileDisplayName = selectedFile?.customName || selectedFile?.fileName || 'Selected File';

    return (
        <div className="placement-details-page container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
            <div className="modern-card mb-4 p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <h2 className="mb-1" style={{color: '#2c3e50', fontWeight: '600'}}>
                            <i className="fa fa-graduation-cap me-2"></i>
                            Student Records
                        </h2>
                        <p className="text-muted mb-0">
                            {fileDisplayName}
                            {placement?.name && ` - ${placement.name}`}
                        </p>
                    </div>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(`/manage/xK9mP2/placement-details/${id}`)}
                        style={{borderRadius: '8px'}}
                    >
                        <i className="fa fa-arrow-left me-2"></i>
                        Back to Placement Details
                    </button>
                </div>
            </div>

            <div className="modern-card mb-4 p-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="text-muted small">File</div>
                        <div style={{fontWeight: 600, color: '#2c3e50'}}>{fileDisplayName}</div>
                    </div>
                    <div className="col-md-4">
                        <div className="text-muted small">Uploaded</div>
                        <div style={{fontWeight: 600, color: '#2c3e50'}}>
                            {selectedFile?.uploadedAt ? formatDate(selectedFile.uploadedAt) : 'N/A'}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="text-muted small">Credits</div>
                        <div style={{fontWeight: 600, color: '#2c3e50'}}>{selectedFile?.credits || 0}</div>
                    </div>
                </div>
            </div>

            <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{color: '#2c3e50'}}>
                        <i className="fa fa-table me-2"></i>
                        File Student Records
                        <span className="badge badge-primary ms-2">{studentData.length}</span>
                    </h5>
                </div>

                {studentData.length > 0 ? (
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
                                    <tr key={`${student.email || student.id || 'student'}-${index}`}>
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
                                        <td>{student.email || 'N/A'}</td>
                                        <td>{student.phone || '-'}</td>
                                        <td style={{verticalAlign: 'top', paddingTop: '12px'}}>
                                            <span className="status-badge status-approved">
                                                {student.credits || selectedFile?.credits || 0}
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
                        <h6 className="text-muted">No data in selected file</h6>
                        <p className="text-muted mb-0">The selected file appears to be empty or has no valid student data.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlacementFileRecords;
