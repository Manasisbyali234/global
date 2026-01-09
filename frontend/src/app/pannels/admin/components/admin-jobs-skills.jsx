import { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
function AdminJobsSkills() {
    const [jobs, setJobs] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobsAndSkills();
    }, []);

    const fetchJobsAndSkills = async () => {
        try {
            setLoading(true);
            const response = await api.getAllJobs();
            if (response.success) {
                const allJobs = response.data || [];
                setJobs(allJobs);
                
                const skillsSet = new Set();
                allJobs.forEach(job => {
                    if (job.skills && Array.isArray(job.skills)) {
                        job.skills.forEach(skill => skillsSet.add(skill));
                    }
                });
                setSkills(Array.from(skillsSet).sort());
            }
        } catch (error) {
            showError('Error fetching jobs and skills');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="dashboard-content"><div className="text-center">Loading...</div></div>;
    }

    return (
        <div className="dashboard-content">
            <div className="wt-admin-right-page-header">
                <h2>All Skills & Technologies</h2>
                <p>Skills extracted from all job postings</p>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Total Skills: {skills.length}</h4>
                </div>
                <div className="panel-body wt-panel-body p-a20">
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px'}}>
                        {skills.map((skill, index) => (
                            <div key={index} style={{padding: '12px 16px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500'}}>
                                {skill}
                            </div>
                        ))}
                    </div>
                    {skills.length === 0 && (
                        <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                            No skills found in job postings
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminJobsSkills;
