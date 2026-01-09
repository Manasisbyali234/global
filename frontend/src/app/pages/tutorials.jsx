import { useState } from 'react';
import { publicUrlFor } from '../../globals/constants';

function TutorialsPage() {
    const [selectedVideo, setSelectedVideo] = useState(null);

    const videos = [
        {
            id: 1,
            module: "Candidate Module",
            title: "Candidate Signup and Login Tutorial",
            description: "Learn how to register and login as a candidate on Tale Global platform.",
            videoUrl: "https://www.youtube.com/embed/53wKp3-8lDM",
            thumbnail: "https://img.youtube.com/vi/53wKp3-8lDM/maxresdefault.jpg"
        },
        {
            id: 2,
            module: "Employer Module",
            title: "Employee Signup and Login Tutorial",
            description: "Step-by-step guide for employee registration and login.",
            videoUrl: "https://www.youtube.com/embed/6HzUsIREfOM",
            thumbnail: "https://img.youtube.com/vi/6HzUsIREfOM/maxresdefault.jpg"
        },
        {
            id: 3,
            module: "Employer Module",
            title: "Consultancy Signup and Login Tutorial",
            description: "Learn how to register and login as a consultancy on Tale Global.",
            videoUrl: "https://www.youtube.com/embed/bMJw5NnjLBI",
            thumbnail: "https://img.youtube.com/vi/bMJw5NnjLBI/maxresdefault.jpg"
        },
        {
            id: 4,
            module: "Placement Module",
            title: "Placement Officer Signup and Login Tutorial",
            description: "Complete guide for placement officer registration and login.",
            videoUrl: "https://www.youtube.com/embed/R5bk-6wFDr0",
            thumbnail: "https://img.youtube.com/vi/R5bk-6wFDr0/maxresdefault.jpg"
        }
    ];

    const mainVideo = selectedVideo || videos[0];

    return (
        <div className="page-wraper">
            <div className="page-content" style={{ backgroundColor: '#ffffff' }}>
                <div style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', padding: '60px 0' }}>
                    <div className="container">
                        <div className="text-center">
                            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#fd7e14', marginBottom: '15px' }}>
                                Tale Global Tutorials
                            </h1>
                            <p style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
                                Master the platform with comprehensive step-by-step video tutorials
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '60px 0' }}>
                    <div className="container">
                        <div style={{ backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '2px solid #fd7e14' }}>
                            <div style={{ paddingBottom: '56.25%', height: 0, position: 'relative' }}>
                                <iframe src={mainVideo.videoUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title={mainVideo.title} />
                            </div>
                        </div>
                        <div style={{ marginTop: '30px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>{mainVideo.title}</h2>
                            <p style={{ fontSize: '16px', color: '#666' }}>{mainVideo.description}</p>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
                    <div className="container">
                        <div className="text-center" style={{ marginBottom: '50px' }}>
                            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>Training Modules</h2>
                            <p style={{ fontSize: '16px', color: '#666' }}>Explore our comprehensive video tutorials</p>
                            <div style={{ width: '80px', height: '4px', background: 'linear-gradient(to right, #fd7e14, #ff9800)', margin: '20px auto', borderRadius: '2px' }}></div>
                        </div>

                        <div className="row">
                            {videos.map((video) => (
                                <div key={video.id} className="col-lg-4 col-md-6 mb-4">
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#fd7e14', marginBottom: '8px', textTransform: 'uppercase' }}>{video.module}</div>
                                    <div onClick={() => { setSelectedVideo(video); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s', border: selectedVideo?.id === video.id ? '2px solid #fd7e14' : '2px solid transparent' }}>
                                        <div style={{ position: 'relative', paddingBottom: '56.25%', backgroundColor: '#000' }}>
                                            <img src={video.thumbnail} alt={video.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', backgroundColor: 'rgba(253,126,20,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa fa-play" style={{ color: '#fff', fontSize: '24px', marginLeft: '4px' }}></i>
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>{video.title}</h3>
                                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{video.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TutorialsPage;
