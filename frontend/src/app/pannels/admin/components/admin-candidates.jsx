import { useState, useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import { loadScript } from "../../../../globals/constants";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminCandidates() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/users?type=candidates', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCandidates(data.users);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (candidateId) => {
        // Show confirmation toast instead of alert
        showWarning('Click delete again to confirm candidate deletion');
        
        // Add a confirmation flag to prevent accidental deletion
        const confirmDelete = () => {
            performDelete(candidateId);
        };
        
        // Set a timeout to allow user to click delete again
        setTimeout(() => {
            const deleteButton = document.querySelector(`[data-candidate-id="${candidateId}"]`);
            if (deleteButton) {
                deleteButton.onclick = confirmDelete;
                deleteButton.style.backgroundColor = '#dc3545';
                deleteButton.innerHTML = '<span class="far fa-trash-alt" /> Confirm Delete';
                
                // Reset after 5 seconds
                setTimeout(() => {
                    deleteButton.onclick = () => handleDelete(candidateId);
                    deleteButton.style.backgroundColor = '';
                    deleteButton.innerHTML = '<span class="far fa-trash-alt" />';
                }, 5000);
            }
        }, 100);
    };
    
    const performDelete = async (candidateId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/users/${candidateId}/candidate`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                showSuccess('Candidate deleted successfully!');
                fetchCandidates();
            } else {
                showError('Failed to delete candidate');
            }
        } catch (error) {
            
            showError('Failed to delete candidate');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Candidates</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dashboard</a><span>Candidates</span></div>
            </div>
            <div className="twm-pro-view-chart-wrap">
                <div className="col-lg-12 col-md-12 mb-4">
                    <div className="panel panel-default site-bg-white m-t30">
                        <div className="panel-heading wt-panel-heading p-a20">
                            <h4 className="panel-tittle m-a0"><i className="far fa-list-alt" />All Candidates ({candidates.length})</h4>
                        </div>
                        <div className="panel-body wt-panel-body">
                            <div className="twm-D_table p-a20 table-responsive">
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <table id="candidate_data_table" className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Joined Date</th>
                                                <th>Profile Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center">No candidates found</td>
                                                </tr>
                                            ) : (
                                                candidates.map((candidate) => (
                                                    <tr key={candidate._id}>
                                                        <td>
                                                            <div className="twm-DT-candidates-list">
                                                                <div className="twm-media">
                                                                    <div className="twm-media-pic">
                                                                        <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                                                    </div>
                                                                </div>
                                                                <div className="twm-mid-content">
                                                                    <a href="#" className="twm-job-title">
                                                                        <h4>{candidate.name}</h4>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{candidate.email}</td>
                                                        <td>{candidate.phone || 'N/A'}</td>
                                                        <td>{formatDate(candidate.createdAt)}</td>
                                                        <td>
                                                            <div className="twm-jobs-category">
                                                                <span className={`twm-bg-${candidate.isProfileComplete ? 'green' : 'yellow'}`}>
                                                                    {candidate.isProfileComplete ? 'Complete' : `Incomplete (${candidate.profileCompletionPercentage || 0}%)`}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="twm-table-controls">
                                                                <ul className="twm-DT-controls-icon list-unstyled">
                                                                    <li>
                                                                        <button 
                                                                            title="View profile" 
                                                                            data-bs-toggle="tooltip" 
                                                                            data-bs-placement="top"
                                                                            onClick={() => window.open(`/candidate/profile/${candidate._id}`, '_blank')}
                                                                        >
                                                                            <span className="fa fa-eye" />
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button 
                                                                            title="Delete" 
                                                                            data-bs-toggle="tooltip" 
                                                                            data-bs-placement="top"
                                                                            data-candidate-id={candidate._id}
                                                                            onClick={() => handleDelete(candidate._id)}
                                                                        >
                                                                            <span className="far fa-trash-alt" />
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default AdminCandidates;
