import { useEffect, useState } from "react";

function ShortlistedCandidatesPage() {
    const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShortlistedCandidates();
    }, []);

    const fetchShortlistedCandidates = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/applications?status=shortlisted', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setShortlistedCandidates(data.data);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Shortlisted Candidates</h2>
            </div>

            <div className="twm-dash-b-blocks">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="panel panel-default">
                            <div className="panel-body wt-panel-body">
                                {loading ? (
                                    <div className="text-center p-4">Loading...</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Candidate Name</th>
                                                    <th>Candidate Email</th>
                                                    <th>Employer Name</th>
                                                    <th>Employer Email</th>
                                                    <th>Location</th>
                                                    <th>Job Title</th>
                                                    <th>Applied Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shortlistedCandidates.length > 0 ? (
                                                    shortlistedCandidates.map((application) => (
                                                        <tr key={application._id}>
                                                            <td>{application.candidateId?.name || 'N/A'}</td>
                                                            <td>{application.candidateId?.email || 'N/A'}</td>
                                                            <td>{application.employerId?.companyName || 'N/A'}</td>
                                                            <td>{application.employerId?.email || 'N/A'}</td>
                                                            <td>{application.jobId?.location || 'N/A'}</td>
                                                            <td>{application.jobId?.title || 'N/A'}</td>
                                                            <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center">
                                                            No shortlisted candidates found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ShortlistedCandidatesPage;
