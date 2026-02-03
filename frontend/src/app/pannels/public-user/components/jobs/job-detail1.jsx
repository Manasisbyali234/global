import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { loadScript } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";
import ApplyJobPopup from "../../../../common/popups/popup-apply-job";
import SectionShareProfile from "../../sections/common/section-share-profile";
import SectionJobsSidebar2 from "../../sections/jobs/sidebar/section-jobs-sidebar2";
import TermsModal from "../../../../../components/TermsModal";
import "./job-detail.css";
import "../../../../../job-detail-spacing.css";
import "../../../../../job-detail-section-spacing.css";

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
    const [candidateData, setCandidateData] = useState(null);

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

    const fetchCandidateData = useCallback(async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            if (!token) return;
            
            // Use a relative URL if possible, or a more robust way to get the base URL
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${baseUrl}/api/candidate/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Failed to fetch candidate stats');
            
            const data = await response.json();
            if (data.success) {
                console.log('Candidate data loaded for job detail:', data.candidate);
                setCandidateData(data.candidate);
            }
        } catch (error) {
            console.error('Error fetching candidate data:', error);
        }
    }, []);

    useEffect(() => {
        setIsLoggedIn(authState.isLoggedIn);
        setCandidateId(authState.candidateId);
        
        if (authState.token && authState.candidateId && jobId) {
            checkApplicationStatus();
            fetchCandidateData();
        }
    }, [jobId, authState.token, authState.candidateId, checkApplicationStatus, fetchCandidateData]);

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
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
                const response = await fetch(`${baseUrl}/api/payments/key`, {
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
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            
            // Fetch fresh candidate data to be sure about credits
            const statsResponse = await fetch(`${baseUrl}/api/candidate/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();
            let currentCandidateData = candidateData;
            
            if (statsData.success) {
                currentCandidateData = statsData.candidate;
                setCandidateData(statsData.candidate);
            }
            
            console.log('Applying for job. Candidate data:', currentCandidateData);

            const profileResponse = await fetch(`${baseUrl}/api/candidate/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profileData = await profileResponse.json();
            
            if (!profileData.success || !profileData.profile?.resume) {
                showWarning('Please Fill All the Details before applying for jobs.');
                navigate('/candidate/my-resume');
                return;
            }
            
            // Check if candidate is from Placement Officer and has credits
            // Robust check for placement candidate
            const registrationMethod = currentCandidateData?.registrationMethod?.toLowerCase();
            const isPlacementCandidate = currentCandidateData && 
                (registrationMethod === 'placement' || currentCandidateData.placement);
            
            const credits = Number(currentCandidateData?.credits || 0);
            const hasCredits = credits > 0;

            console.log('Condition check:', { 
                registrationMethod, 
                isPlacementCandidate, 
                credits,
                hasCredits,
                placementData: currentCandidateData?.placement 
            });

            if (isPlacementCandidate && hasCredits) {
                console.log('Placement candidate with credits detected. Using credit-based application.');
                showInfo(`Applying using 1 credit. Remaining credits: ${credits}`);
                handleCreditApplication();
            } else {
                // Payment is required for every job application
                console.log('Proceeding to Razorpay payment. Reason:', 
                    !isPlacementCandidate ? 'Not a placement candidate' : 'Insufficient credits');
                handlePayment();
            }
        } catch (error) {
            console.error('Error applying for job:', error);
            showError('Failed to submit application');
        }
    };

    const handleCreditApplication = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            
            console.log('Calling apply-with-credits endpoint...');
            const response = await fetch(`${baseUrl}/api/payments/apply-with-credits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId, coverLetter: "" })
            });
            
            const data = await response.json();
            console.log('Apply with credits response:', data);
            
            if (data.success) {
                setHasApplied(true);
                showSuccess('Application submitted successfully using credits!');
                fetchJobDetails();
                fetchCandidateData(); // Refresh credits
            } else {
                console.warn('Apply with credits failed:', data.message);
                showError(data.message || 'Failed to apply using credits');
                // Fallback to payment if credit application fails for some reason
                handlePayment();
            }
        } catch (error) {
            console.error('Error applying with credits:', error);
            showError('Failed to apply using credits');
            handlePayment();
        }
    };

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            
            // 1. Create Order
            const orderResponse = await fetch(`${baseUrl}/api/payments/create-order`, {
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
                        const verifyResponse = await fetch(`${baseUrl}/api/payments/verify-payment`, {
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
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate(publicUser.pages.LOGIN_CANDIDATE);
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
                                                        <i className="feather-briefcase" style={{marginRight: '8px', color: '#ff9c00'}}></i>
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
                                                    <p className="twm-job-address"><i className="feather-map-pin" />{Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'Location not specified')}</p>
                                                    
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
                                                            {(job.minSalary || job.maxSalary || job.salary) && (
                                                                <div style={{fontSize: '14px', color: '#6c757d', marginTop: '5px'}}>
                                                                    <strong>Net Monthly: </strong>
                                                                    {typeof job.salary === 'string' || typeof job.salary === 'number' ? 
                                                                        `₹${Math.round(Number(job.salary) / 12).toLocaleString()}` : 
                                                                        (job.minSalary && job.maxSalary) ? 
                                                                            `₹${Math.round(Number(job.minSalary) / 12).toLocaleString()} - ₹${Math.round(Number(job.maxSalary) / 12).toLocaleString()}` :
                                                                        job.minSalary ? 
                                                                            `₹${Math.round(Number(job.minSalary) / 12).toLocaleString()}+` :
                                                                            `₹${Math.round(Number(job.maxSalary) / 12).toLocaleString()}`
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="twm-job-self-bottom" style={{marginTop: '40px', paddingTop: '20px', textAlign: 'right', paddingRight: '20px'}}>
                                                        <button
                                                            className={`btn btn-outline-primary ${(hasApplied || isEnded) ? 'disabled' : ''}`}
                                                            onClick={handleApplyClick}
                                                            disabled={hasApplied || isEnded}
                                                        >
                                                            {hasApplied ? 'Already Applied' : 
                                                             isExpired ? 'Application Closed' : 
                                                             isEnded ? 'Application Closed' : 
                                                             (candidateData && (candidateData.registrationMethod === 'placement' || candidateData.placement) && candidateData.credits > 0) ? 
                                                             `Apply with 1 Credit (${candidateData.credits} left)` : 
                                                             'Apply Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    <div style={{marginBottom: '20px'}}>
                                        <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                            <i className="feather-file-text" style={{marginRight: '10px', color: '#3498db'}}></i>
                                            Job Description
                                        </h4>
                                        <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{__html: job.description || 'No job description available.'}}>
                                        </div>
                                    </div>

                                    {job.rolesAndResponsibilities && job.rolesAndResponsibilities.trim() !== '' && (
                                        <div style={{marginBottom: '20px'}}>
                                            <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                                <i className="feather-list" style={{marginRight: '10px', color: '#e74c3c'}}></i>
                                                Roles and Responsibilities
                                            </h4>
                                            <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{__html: job.rolesAndResponsibilities}}>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{marginBottom: '20px'}}>
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
                                    </div>

                                    <div style={{marginBottom: '20px'}}>
                                        <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                            <i className="feather-check-square" style={{marginRight: '10px', color: '#ff6b35'}}></i>
                                            Requirements & Qualifications
                                        </h4>
                                        <ul className="description-list-2">
                                            <li>
                                                <strong>Education:</strong> 
                                                {Array.isArray(job?.education) && job.education.length > 0 
                                                    ? job.education.map((edu, index) => (
                                                        <span key={index} style={{
                                                            display: 'inline-block',
                                                            background: '#e8f4fd',
                                                            color: '#2980b9',
                                                            padding: '4px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            border: '1px solid #bde0ff',
                                                            marginRight: '6px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {edu}
                                                        </span>
                                                    ))
                                                    : (job?.education || 'Not specified')
                                                }
                                            </li>
                                            <li>
                                                <strong>Backlogs Allowed:</strong> {job?.backlogsAllowed ? 'Yes' : 'No'}
                                            </li>
                                        </ul>
                                    </div>

                                    {job.employerProfile && (
                                        <div style={{marginTop: '30px', marginBottom: '30px'}}>
                                            <h4 className="twm-s-title" style={{color: '#2c3e50', marginBottom: '20px', fontSize: '24px', fontWeight: '600'}}>
                                                <i className="feather-info" style={{marginRight: '10px', color: '#f39c12'}}></i>
                                                About {job.employerId?.employerType === 'consultant' ? 'Hiring Company' : 'Company'}
                                            </h4>
                                            
                                            <div style={{marginBottom: '20px'}}>
                                                <h5 style={{fontSize: '18px', fontWeight: '600', color: '#34495e', marginBottom: '10px'}}>
                                                    {job.companyName || job.employerId?.companyName || 'Our Company'}
                                                </h5>
                                                <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{
                                                    __html: (job.employerId?.employerType === 'consultant' && job.aboutCompany) 
                                                        ? job.aboutCompany 
                                                        : (job.employerProfile.description || 'No description available.')
                                                }} />
                                            </div>

                                            {(job.employerId?.employerType === 'consultant' ? job.companyDescription : job.employerProfile.whyJoinUs) && (
                                                <div style={{marginBottom: '20px'}}>
                                                    <h5 style={{fontSize: '18px', fontWeight: '600', color: '#34495e', marginBottom: '10px'}}>Why Join Us</h5>
                                                    <div style={{lineHeight: '1.8', fontSize: '16px', color: '#495057'}} dangerouslySetInnerHTML={{
                                                        __html: (job.employerId?.employerType === 'consultant') 
                                                            ? job.companyDescription 
                                                            : job.employerProfile.whyJoinUs
                                                    }} />
                                                </div>
                                            )}

                                            <ul className="description-list-2">
                                                {job.employerProfile.website && (
                                                    <li><strong>Website:</strong> <a href={job.employerProfile.website.startsWith('http') ? job.employerProfile.website : `https://${job.employerProfile.website}`} target="_blank" rel="noopener noreferrer">{job.employerProfile.website}</a></li>
                                                )}
                                                {job.employerProfile.location && (
                                                    <li><strong>Location:</strong> {job.employerProfile.location}</li>
                                                )}
                                            </ul>
                                        </div>
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