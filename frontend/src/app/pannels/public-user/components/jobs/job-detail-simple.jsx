import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function JobDetailSimple() {
    const { id } = useParams();
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/public/jobs/${id || '68c016cff2e8ea3aca542c27'}`);
                const data = await response.json();
                
                if (data.success) {
                    setJob(data.job);
                }
            } catch (error) {
                
            }
        };
        fetchJob();
    }, [id]);

    if (!job) return <div>Loading...</div>;

    return (
        <div style={{padding: '20px'}}>
            <h1>{job.title}</h1>
            <p>Company: {job.employerId?.companyName}</p>
            
            <div style={{marginTop: '20px'}}>
                <h3>Cover Image:</h3>
                {job.employerProfile?.coverImage ? (
                    <img 
                        src={job.employerProfile.coverImage} 
                        alt="Cover" 
                        style={{maxWidth: '400px', border: '2px solid green'}}
                    />
                ) : (
                    <p style={{color: 'red'}}>No cover image</p>
                )}
            </div>
            
            <div style={{marginTop: '20px'}}>
                <h3>Logo:</h3>
                {job.employerProfile?.logo ? (
                    <img 
                        src={job.employerProfile.logo} 
                        alt="Logo" 
                        style={{maxWidth: '200px', border: '2px solid blue'}}
                    />
                ) : (
                    <p style={{color: 'red'}}>No logo</p>
                )}
            </div>
        </div>
    );
}

export default JobDetailSimple;
