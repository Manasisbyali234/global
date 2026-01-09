import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function JobDetailDebug() {
    const { id } = useParams();
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/public/jobs/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    setJob(data.job);
                    
                    
                    
                }
            } catch (error) {
                
            }
        };
        
        if (id) fetchJob();
    }, [id]);

    if (!job) return <div>Loading...</div>;

    return (
        <div style={{padding: '20px'}}>
            <h2>Debug Job Images</h2>
            <p><strong>Job ID:</strong> {job._id}</p>
            <p><strong>Job Title:</strong> {job.title}</p>
            <p><strong>Company:</strong> {job.employerId?.companyName}</p>
            
            <h3>Employer Profile Data:</h3>
            <p><strong>Profile exists:</strong> {job.employerProfile ? 'YES' : 'NO'}</p>
            
            {job.employerProfile && (
                <>
                    <p><strong>Logo exists:</strong> {job.employerProfile.logo ? 'YES' : 'NO'}</p>
                    <p><strong>Cover exists:</strong> {job.employerProfile.coverImage ? 'YES' : 'NO'}</p>
                    
                    {job.employerProfile.logo && (
                        <div>
                            <h4>Logo:</h4>
                            <img 
                                src={job.employerProfile.logo} 
                                alt="Logo" 
                                style={{maxWidth: '200px', border: '1px solid #ccc'}}
                                onError={(e) => {
                                    
                                    e.target.style.border = '2px solid red';
                                }}
                                onLoad={() => }
                            />
                        </div>
                    )}
                    
                    {job.employerProfile.coverImage && (
                        <div>
                            <h4>Cover Image:</h4>
                            <img 
                                src={job.employerProfile.coverImage} 
                                alt="Cover" 
                                style={{maxWidth: '400px', border: '1px solid #ccc'}}
                                onError={(e) => {
                                    
                                    e.target.style.border = '2px solid red';
                                }}
                                onLoad={() => }
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default JobDetailDebug;
