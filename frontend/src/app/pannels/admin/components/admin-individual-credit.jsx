import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../utils/api';
import SearchBar from '../../../../components/SearchBar';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import '../../../../admin-credits-button-fix.css';
function AdminIndividualCredit() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [credits, setCredits] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await api.getCandidatesForCredits();
            if (response.success) {
                setCandidates(response.candidates || []);
            }
        } catch (error) {
            showError('Error fetching candidates');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCandidate || !credits) {
            showWarning('Please select a candidate and enter credits');
            return;
        }

        setLoading(true);
        try {
            const response = await api.updateCandidateCredits(selectedCandidate, { creditsToAdd: parseInt(credits) });
            if (response.success) {
                showSuccess('Credits updated successfully!');
                setSelectedCandidate('');
                setCredits('');
                setShowUpdateForm(false);
                fetchCandidates();
            } else {
                showError('Failed to update credits');
            }
        } catch (error) {
            showError('Error updating credits');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const isAdminOrPlacement = c.registrationMethod === 'admin' || c.registrationMethod === 'placement' || c.placementId;
        return matchesSearch && isAdminOrPlacement;
    });

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h2>Individual Candidate Credit Upload</h2>
                    <p>Manually assign credits to individual candidates</p>
                </div>
                <button
                    className="site-button"
                    onClick={() => navigate('/admin/placement-credits/add-candidate')}
                    style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fa fa-plus"></i>
                    Add New Candidate
                </button>
            </div>

            {showUpdateForm && (
            <div className="panel panel-default site-bg-white" style={{marginBottom: '20px'}}>
                <div className="panel-heading wt-panel-heading p-a20">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h4 className="panel-tittle m-a0">Update Credits</h4>
                        <button
                            onClick={() => {
                                setShowUpdateForm(false);
                                setSelectedCandidate('');
                                setCredits('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#6c757d'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div className="panel-body wt-panel-body p-a20">
                    <form onSubmit={handleSubmit} style={{maxWidth: '600px', margin: '0 auto'}}>
                        {selectedCandidate && (
                            <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px', border: '1px solid #b3d9ff'}}>
                                <strong style={{color: '#004085'}}>Current Credits: </strong>
                                <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#004085'}}>
                                    {candidates.find(c => c._id === selectedCandidate)?.credits || 0}
                                </span>
                            </div>
                        )}

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Credits to Add</label>
                            <input 
                                type="number"
                                className="form-control"
                                placeholder="Enter credits (positive or negative)"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                required
                                style={{padding: '10px'}}
                            />
                            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                                Enter positive number to add credits, negative to deduct
                            </small>
                        </div>

                        <button 
                            type="submit" 
                            className="site-button"
                            disabled={loading}
                            style={{width: '100%', padding: '12px', fontSize: '16px'}}
                        >
                            {loading ? 'Updating...' : 'Update Credits'}
                        </button>
                    </form>
                </div>
            </div>
            )}

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '15px', width: '100%'}}>
                        <h4 className="panel-tittle m-a0" style={{marginRight: 'auto'}}>All Candidates ({filteredCandidates.length})</h4>
                        <div className="search-section" style={{marginLeft: 'auto'}}>
                            <label className="search-label">
                                <i className="fa fa-filter"></i> Search by Name or Email
                            </label>
                            <SearchBar 
                                onSearch={handleSearch}
                                placeholder="Search candidates..."
                                className="placement-search"
                            />
                        </div>
                    </div>
                </div>
                <div className="panel-body wt-panel-body">
                    <div className="p-a20 table-responsive table-container">
                        <table className="table emp-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Credits</th>
                                    <th>Registration Method</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#6c757d'}}>
                                            <i className="fa fa-users" style={{fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#dee2e6'}}></i>
                                            No candidates found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((candidate) => (
                                        <tr key={candidate._id}>
                                            <td style={{textAlign: 'center', verticalAlign: 'middle'}}>{candidate.name}</td>
                                            <td style={{textAlign: 'center', verticalAlign: 'middle', fontFamily: 'monospace', fontSize: '0.85rem'}}>{candidate.email}</td>
                                            <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                                <span style={{
                                                    backgroundColor: candidate.credits > 0 ? '#d4edda' : '#f8d7da',
                                                    color: candidate.credits > 0 ? '#155724' : '#721c24',
                                                    padding: '5px 15px',
                                                    borderRadius: '20px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    display: 'inline-block'
                                                }}>
                                                    {candidate.credits || 0}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                                <span style={{
                                                    backgroundColor: candidate.registrationMethod === 'admin' ? '#cfe2ff' : 
                                                                   (candidate.registrationMethod === 'placement' || candidate.placementId) ? '#fff3cd' : '#e2e3e5',
                                                    color: candidate.registrationMethod === 'admin' ? '#084298' : 
                                                          (candidate.registrationMethod === 'placement' || candidate.placementId) ? '#664d03' : '#41464b',
                                                    padding: '4px 12px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    textTransform: 'capitalize',
                                                    display: 'inline-block'
                                                }}>
                                                    {candidate.registrationMethod === 'admin' ? 'Admin' : 
                                                     (candidate.registrationMethod === 'placement' || candidate.placementId) ? 'Placement' : 
                                                     (candidate.registrationMethod || 'signup')}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCandidate(candidate._id);
                                                        setShowUpdateForm(true);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    style={{
                                                        backgroundColor: '#fd7e14',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        whiteSpace: 'nowrap',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                    <span>Update Credits</span>
                                                </button>
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
    );
}

export default AdminIndividualCredit;
