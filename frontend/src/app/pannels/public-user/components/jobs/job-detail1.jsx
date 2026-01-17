import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";
import ApplyJobPopup from "../../../../common/popups/popup-apply-job";
import SectionShareProfile from "../../sections/common/section-share-profile";
import SectionJobsSidebar2 from "../../sections/jobs/sidebar/section-jobs-sidebar2";
import TermsModal from "../../../../../components/TermsModal";
import "./job-detail.css";
import "../../../../../job-detail-spacing.css";

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';

function JobDetail1Page() {
    const { id, param1 } = useParams();
    const jobId = id || param1;
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [candidateId, setCandidateId] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [pendingJobApplication, setPendingJobApplication] = useState(false);
    const [razorpayKey, setRazorpayKey] = useState(null);

    const authState = useMemo(() => {
        const token = localStorage.getItem('candidateToken');
        const storedCandidateId = localStorage.getItem('candidateId');
        return { token, candidateId: storedCandidateId, isLoggedIn: !!token };
    }, []);

    const { limitReached, isEnded, isExpired } = useMemo(() => {
        if (!job) return { limitReached: false, isEnded: false, isExpired: false };
        const limitReached = typeof job.applicationLimit === 'number' && job.applicationLimit > 0 && (job.applicationCount || 0) >= job.applicationLimit;
        const isExpired = job.lastDateOfApplication && new Date(job.lastDateOfApplication) < new Date();
        const isEnded = (job.status && job.status !== 'active') || limitReached || isExpired;
        return { limitReached, isEnded, isExpired };
    }, [job]);

    const fetchJobDetails = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/jobs/${jobId}`);
            const data = await response.json();
            if (data.success) {
                setJob(data.job);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    const checkApplicationStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            const response = await fetch(`http://localhost:5000/api/candidate/applications/status/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setHasApplied(data.hasApplied);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    }, [jobId]);

    useEffect(() => {
        setIsLoggedIn(authState.isLoggedIn);
        setCandidateId(authState.candidateId);
        
        if (authState.token && authState.candidateId && jobId) {
            checkApplicationStatus();
        }
    }, [jobId, authState.token, authState.candidateId, checkApplicationStatus]);

    const sidebarConfig = {
        showJobInfo: true
    };

    const handleScroll = useCallback(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((window.scrollY / totalHeight) * 100, 100);
        setScrollProgress(progress);
    }, []);

    useEffect(() => {
        loadScript("js/custom.js");
        loadScript("https://checkout.razorpay.com/v1/checkout.js", false);
        
        const fetchRazorpayKey = async () => {
            try {
                const token = localStorage.getItem('candidateToken');
                if (!token) return;
                const response = await fetch('http://localhost:5000/api/payments/key', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setRazorpayKey(data.publicKey);
                }
            } catch (error) {
                console.error('Error fetching Razorpay key:', error);
            }
        };

        if (jobId) {
            fetchJobDetails();
            fetchRazorpayKey();
        }
        
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', throttledScroll, { passive: true });
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [jobId, handleScroll, fetchJobDetails]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p style={{marginLeft: '16px', color: '#6c757d'}}>Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center p-5" style={{animation: 'fadeInUp 0.6s ease-out'}}>
                <h3 style={{color: '#6c757d'}}>Job not found</h3>
                <p style={{color: '#9ca3af'}}>The job you're looking for doesn't exist or has been removed.</p>
            </div>
        );
    }

    const submitJobApplication = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            
            const profileResponse = await fetch('http://localhost:5000/api/candidate/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileResponse.json();
            
            if (!profileData.success || !profileData.profile?.resume) {
                showWarning('Please upload your resume before applying for jobs.');
                navigate('/candidate/my-resume');
                return;
            }
            
            // Payment is required for every job application
            handlePayment();
        } catch (error) {
            console.error('Error applying for job:', error);
            showError('Failed to submit application');
        }
    };

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            
            // 1. Create Order
            const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId })
            });
            const orderData = await orderResponse.json();
            
            if (!orderData.success) {
                showError(orderData.message || 'Failed to initiate payment');
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: razorpayKey,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'TaleGlobal',
                description: `Job Application fee for ${job.title}`,
                order_id: orderData.order.id,
                handler: async (response) => {
                    // 3. Verify Payment
                    try {
                        const verifyResponse = await fetch('http://localhost:5000/api/payments/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                ...response,
                                jobId,
                                coverLetter: "" 
                            })
                        });
                        const verifyData = await verifyResponse.json();
                        
                        if (verifyData.success) {
                            setHasApplied(true);
                            showSuccess('Payment successful and application submitted!');
                            fetchJobDetails();
                        } else {
                            showError(verifyData.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Error verifying payment:', error);
                        showError('Payment verification failed');
                    }
                },
                theme: {
                    color: '#ff6b35'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Error in payment flow:', error);
            showError('Failed to initiate payment');
        }
    };

    const handleApplyClick = async () => {
        if (isEnded) return;
        if (!isLoggedIn) {
            showWarning('Please login first to apply for jobs!');
            return;
        } else if (hasApplied) {
            showInfo('You have already applied for this job!');
        } else {
            setTermsAccepted(false);
            setPendingJobApplication(true);
            setShowTermsModal(true);
        }
    };

    return (
        <>
            <div className="scroll-progress" style={{width: `${scrollProgress}%`}}></div>
            
            <div className="section-full p-t120 p-b90 bg-white">
                <div className="container">
                    <div className="section-content">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-8 col-md-12">
                                <div className="cabdidate-de-info">
                                    <div className="twm-job-self-wrap">
                                        <div className="twm-job-self-info">
                                            <div className="twm-job-self-top">
                                                <div className="twm-media-bg">
                                                    {job.employerProfile?.coverImage ? (
                                                        <img src={job.employerProfile.coverImage} alt="Company Cover" />
                                                    ) : (
                                                        <JobZImage src="images/employer-bg.jpg" alt="#" />
                                                    )}
                                                    <div className="twm-jobs-category green">
                                                        <span className="twm-bg-green">New</span>
                                                    </div>
                                                </div>

                                                <div className="twm-mid-content">
                                                    <div className="twm-media">
                                                        {(job.companyLogo || job.employerProfile?.logo) ? (
                                                            <img src={job.companyLogo || job.employerProfile.logo} alt="Company Logo" />
                                                        ) : (
                                                            <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                                        )}
                                                    </div>

                                                    <h4 className="twm-job-title">
                                                        {job.title}
                                                    </h4>
                                                    <p className="twm-job-company">
                                                        <strong>Company: </strong>
                                                        {job.employerId?._id ? (
                                                            <span 
                                                                style={{color: '#007bff', cursor: 'pointer'}}
                                                                onClick={() => navigate(`/emp-detail/${job.employerId._id}`)}
                                                            >
                                                                {job.companyName || job.employerId?.companyName || 'Not specified'}
                                                            </span>
                                                        ) : (
                                                            <span>{job.companyName || job.employerId?.companyName || 'Not specified'}</span>
                                                        )}
                                                    </p>
                                                    <p className="twm-job-address"><i className="feather-map-pin" />{job.location}</p>
                                                    
                                                    {job.shift && (
                                                        <p className="twm-job-shift" style={{marginTop: '10px'}}>
                                                            <i className="feather-clock" style={{marginRight: '8px', color: '#ff6b35'}}></i>
                                                            <strong>Work Shift: </strong>
                                                            <span style={{color: '#495057', textTransform: 'capitalize'}}>
                                                                {job.shift === 'day' ? 'Day Shift' : 
                                                                 job.shift === 'night' ? 'Night Shift' : 
                                                                 job.shift === 'rotational' ? 'Rotational Shift' : job.shift}
                                                            </span>
                                                        </p>
                                                    )}
                                                    
                                                    <div className="hiring-type-badge" style={{marginTop: '15px', marginBottom: '10px'}}>
                                                        <span className={`badge ${job.employerId?.employerType === 'consultant' ? 'badge-warning' : 'badge-success'}`} 
                                                            style={{fontSize: '14px', padding: '8px 16px', fontWeight: '600'}}>
                                                            <i className={`feather-${job.employerId?.employerType === 'consultant' ? 'users' : 'building'}`} style={{marginRight: '6px'}}></i>
                                                            {job.employerId?.employerType === 'consultant' ? 'Hiring through Consultancy' : 'Direct Company Hiring'}
                                                        </span>
                                                    </div>
                                                    
                                                    {((typeof job.salary === 'string' || typeof job.salary === 'number') || job.minSalary || job.maxSalary) && (
                                                        <div className="salary-info">
                                                            <span className="salary-amount">
                                                                {typeof job.salary === 'string' || typeof job.salary === 'number' ? `₹${job.salary}` : 
                                                                 (job.minSalary && job.maxSalary) ? `₹${job.minSalary} - ₹${job.maxSalary}` :
                                                                 job.minSalary ? `₹${job.minSalary}+` :
                                                                 `₹${job.maxSalary}`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="twm-job-self-bottom" style={{marginTop: '40px', paddingTop: '20px', textAlign: 'right', paddingRight: '20px'}}>
                                                        <button
                                                            className={`btn btn-outline-primary ${(hasApplied || isEnded) ? 'disabled' : ''}`}
                                                            onClick={handleApplyClick}
                                                            disabled={hasApplied || isEnded}
                                                        >
                                                            {hasApplied ? 'Already Applied' : isExpired ? 'Application Closed' : isEnded ? 'Job Closed' : 'Apply Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    <div style={{marginBottom: '40px'}}>
                                        <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                            <i className="feather-file-text" style={{marginRight: '10px', color: '#3498db'}}></i>
                                            Job Description
                                        </h4>
                                        <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{__html: job.description || 'No job description available.'}}>
                                        </div>
                                    </div>

                                    {job.rolesAndResponsibilities && job.rolesAndResponsibilities.trim() !== '' && (
                                        <div style={{marginBottom: '40px'}}>
                                            <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                                <i className="feather-list" style={{marginRight: '10px', color: '#e74c3c'}}></i>
                                                Roles and Responsibilities
                                            </h4>
                                            <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{__html: job.rolesAndResponsibilities}}>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{marginBottom: '40px'}}>
                                        <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                            <i className="feather-code" style={{marginRight: '10px', color: '#9b59b6'}}></i>
                                            Required Skills
                                        </h4>
                                        <div className="job-skills-container" style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                            {job?.requiredSkills && job.requiredSkills.length > 0 ? (
                                                job.requiredSkills.map((skill, index) => (
                                                    <span 
                                                        key={index} 
                                                        className="skill-tag" 
                                                        style={{
                                                            backgroundColor: '#e8f4fd',
                                                            color: '#2980b9',
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            border: '1px solid #bde0ff',
                                                            display: 'inline-block'
                                                        }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <p style={{color: '#6c757d', fontStyle: 'italic'}}>No specific skills mentioned for this position</p>
                                            )}
                                        </div>
                                        
                                        {(job?.transportation && (job.transportation.oneWay || job.transportation.twoWay || job.transportation.noCab)) || job?.workMode ? (
                                            <div style={{marginTop: '25px', display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
                                                {job?.transportation && (job.transportation.oneWay || job.transportation.twoWay || job.transportation.noCab) && (
                                                    <div style={{flex: '1', minWidth: '200px'}}>
                                                        <h5 style={{color: '#2c3e50', marginBottom: '15px', fontSize: '18px', fontWeight: '600'}}>
                                                            Transportation
                                                        </h5>
                                                        <p style={{color: '#495057', fontSize: '16px', lineHeight: '1.6'}}>
                                                            {[
                                                                job.transportation.oneWay && 'One-way Cab',
                                                                job.transportation.twoWay && 'Two-way Cab',
                                                                job.transportation.noCab && 'No Cab Facility'
                                                            ].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {job?.workMode && (
                                                    <div style={{flex: '1', minWidth: '200px'}}>
                                                        <h5 style={{color: '#2c3e50', marginBottom: '15px', fontSize: '18px', fontWeight: '600'}}>
                                                            <i className="feather-home" style={{marginRight: '8px', color: '#ff6b35'}}></i>
                                                            Work Mode
                                                        </h5>
                                                        <p style={{color: '#495057', fontSize: '16px', lineHeight: '1.6', textTransform: 'capitalize'}}>
                                                            {job.workMode === 'work-from-home' ? 'Work from Home' : 
                                                             job.workMode === 'remote' ? 'Remote' : 
                                                             job.workMode === 'hybrid' ? 'Hybrid' : job.workMode}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>

                                    {job.employerId?.employerType === 'consultant' && job.employerProfile && (
                                        <>
                                            <h4 className="twm-s-title">About the Consultancy:</h4>
                                            <ul className="description-list-2">
                                                <li><strong>Company:</strong> {job.employerId?.companyName || 'Consultant'}</li>
                                                {job.employerProfile.description && (
                                                    <li><strong>Description:</strong> <div dangerouslySetInnerHTML={{__html: job.employerProfile.description}} /></li>
                                                )}
                                                {job.employerProfile.website && (
                                                    <li><strong>Website:</strong> <a href={job.employerProfile.website} target="_blank" rel="noopener noreferrer">{job.employerProfile.website}</a></li>
                                                )}
                                                {job.employerProfile.location && (
                                                    <li><strong>Location:</strong> {job.employerProfile.location}</li>
                                                )}
                                            </ul>
                                        </>
                                    )}



                                    {job.responsibilities && job.responsibilities.length > 0 && (
                                        <>
                                            <h4 className="twm-s-title">Responsibilities:</h4>
                                            <ul className="description-list-2">
                                                {job.responsibilities.map((resp, index) => (
                                                    <li key={index}>{resp}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    {job.benefits && job.benefits.length > 0 && (
                                        <>
                                            <h4 className="twm-s-title">Benefits:</h4>
                                            <ul className="description-list-2">
                                                {job.benefits.map((benefit, index) => (
                                                    <li key={index}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    <SectionShareProfile />
                                </div>
                            </div>
                            
                            <div className="col-lg-4 col-md-12 rightSidebar">
                                <SectionJobsSidebar2 _config={sidebarConfig} job={job} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ApplyJobPopup />
            <TermsModal 
                isOpen={showTermsModal}
                onClose={() => {
                    setShowTermsModal(false);
                    setPendingJobApplication(false);
                    setTermsAccepted(false);
                }}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                    submitJobApplication();
                }}
                role="candidateApplication"
            />
        </>
    );
}

export default JobDetail1Page;