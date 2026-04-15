import { useState, useEffect } from "react";
import { formatDate as formatDateUtil } from '../../../../utils/dateFormatter';
import { useNavigate, useParams } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { showSuccess, showError } from '../../../../utils/popupNotification';
import PageLoader from '../../../../components/PageLoader';
import './employer-details-styles.css';

function EmployerDetails() {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
    console.log('API_BASE_URL configured as:', API_BASE_URL);
    const navigate = useNavigate();
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState('');
    const [currentImageType, setCurrentImageType] = useState('');
    const [currentPreviewName, setCurrentPreviewName] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [activeJobCount, setActiveJobCount] = useState(0);
    const [jobsLoading, setJobsLoading] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
        fetchEmployerProfile();
        fetchEmployerJobs();
    }, [id]);

    const fetchEmployerProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/employers/${id}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                
                
                // Set default verification status for existing profiles
                const profileWithDefaults = {
                    ...data.profile,
                    panCardVerified: data.profile.panCardVerified || 'pending',
                    cinVerified: data.profile.cinVerified || 'pending',
                    gstVerified: data.profile.gstVerified || 'pending',
                    incorporationVerified: data.profile.incorporationVerified || 'pending',
                    authorizationVerified: data.profile.authorizationVerified || 'pending'
                };
                
                setProfile(profileWithDefaults);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date ? formatDateUtil(date) : 'N/A';
    };

    const formatOptionalPhone = (phoneValue) => {
        const rawValue = String(phoneValue || '').trim();
        if (!rawValue) return 'N/A';

        const digitsOnly = rawValue.replace(/\D/g, '');
        if (!digitsOnly || digitsOnly === '91') return 'N/A';

        return rawValue;
    };

    const resolveMediaSrc = (mediaValue) => {
        if (!mediaValue || typeof mediaValue !== 'string') return '';
        const trimmed = mediaValue.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('data:')) return trimmed;
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
        if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
            const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            return `${API_ORIGIN}${normalizedPath}`;
        }
        return `data:image/jpeg;base64,${trimmed}`;
    };

    const getPreviewType = (documentValue, fileName = '') => {
        const normalizedValue = String(documentValue || '').trim().toLowerCase();
        const normalizedFileName = String(fileName || '').trim().toLowerCase();

        if (normalizedValue.startsWith('data:application/pdf')) return 'application/pdf';
        if (normalizedValue.startsWith('data:image/')) return 'image';
        if (/\.(pdf)(\?|#|$)/.test(normalizedValue) || normalizedFileName.endsWith('.pdf')) {
            return 'application/pdf';
        }
        if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(normalizedValue) || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(normalizedFileName)) {
            return 'image';
        }

        return '';
    };

    const openDocumentPreview = (documentValue, fileName = 'Document Preview') => {
        const resolvedSrc = resolveMediaSrc(documentValue);
        const previewType = getPreviewType(documentValue, fileName);

        if (!resolvedSrc || !previewType) {
            showError('This document format cannot be previewed.');
            return;
        }

        setCurrentImage(resolvedSrc);
        setCurrentImageType(previewType);
        setCurrentPreviewName(fileName);
        setShowImageModal(true);
        setIsMinimized(false);
        setIsMaximized(false);
    };

    const closeImageModal = () => {
        if (currentImage && currentImage.startsWith('blob:')) {
            window.URL.revokeObjectURL(currentImage);
        }

        setShowImageModal(false);
        setCurrentImage('');
        setCurrentImageType('');
        setCurrentPreviewName('');
        setIsMinimized(false);
        setIsMaximized(false);
    };

    const normalizeCompanyName = (value) => String(value || '').trim().toLowerCase();

    const getLetterCompanyName = (letter) => (
        letter?.companyName
        || profile?.companyName
        || profile?.employerId?.companyName
        || 'N/A'
    );

    const downloadDocument = async (employerId, documentType) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/download-document/${employerId}/${documentType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${documentType}_${employerId}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                showError('Failed to download document');
            }
        } catch (error) {
            showError('Error downloading document');
        }
    };

    const viewDocumentImage = async (employerId, documentType) => {
        try {
            console.log(`Attempting to view document: ${documentType} for employer: ${employerId}`);
            
            const token = localStorage.getItem('adminToken');
            if (!token) {
                showError('Authentication token not found. Please login again.');
                return;
            }

            const url = `${API_BASE_URL}/admin/employers/${employerId}/view-document/${documentType}`;
            console.log(`Request URL: ${url}`);
            
            const response = await fetch(url, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'image/*,application/pdf,*/*'
                }
            });
            
            console.log(`Response status: ${response.status}`);
            console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                
                if (response.status === 404) {
                    showError('Document not found or not uploaded yet.');
                } else if (response.status === 401) {
                    showError('Authentication failed. Please login again.');
                } else if (response.status === 500) {
                    showError('Server error while loading document. Please try again.');
                } else {
                    showError(`Failed to load document: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const contentType = response.headers.get('content-type');
            console.log(`Content-Type: ${contentType}`);

            const blob = await response.blob();
            console.log(`Blob created, size: ${blob.size} bytes, type: ${blob.type}`);
            
            if (blob.size === 0) {
                showError('Document appears to be empty.');
                return;
            }

            const imageUrl = window.URL.createObjectURL(blob);
            console.log('Object URL created successfully:', imageUrl.substring(0, 50) + '...');
            
            setCurrentImage(imageUrl);
            // Better content type detection
            if (contentType && contentType.includes('pdf')) {
                setCurrentImageType('application/pdf');
                console.log('Document detected as PDF');
            } else if (blob.type && blob.type.includes('pdf')) {
                setCurrentImageType('application/pdf');
                console.log('Document detected as PDF from blob type');
            } else {
                setCurrentImageType('image');
                console.log('Document detected as image');
            }
            setCurrentPreviewName(documentType);
            setShowImageModal(true);
        } catch (error) {
            console.error('Error loading document image:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showError('Network error. Please check your internet connection and try again.');
            } else if (error.name === 'AbortError') {
                showError('Request was cancelled. Please try again.');
            } else {
                showError(`Error loading document: ${error.message}`);
            }
        }
    };

    const fetchEmployerJobs = async () => {
        try {
            setJobsLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/employers/${id}/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Employer Jobs Response:', data);
            if (data.success) {
                console.log('Active Job Count:', data.activeJobCount);
                setActiveJobCount(data.activeJobCount || 0);
            } else {
                console.error('Failed to fetch jobs:', data.message);
                setActiveJobCount(0);
            }
        } catch (error) {
            console.error('Error fetching employer jobs:', error);
            setActiveJobCount(0);
        } finally {
            setJobsLoading(false);
        }
    };

    const updateDocumentStatus = async (employerId, field, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/employers/${employerId}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [field]: status })
            });
            
            if (response.ok) {
                setProfile(prev => ({ ...prev, [field]: status }));
                showSuccess(`Document ${status} successfully`);
            } else {
                showError('Failed to update document status');
            }
        } catch (error) {
            showError('Error updating document status');
        }
    };

    const handleApproveAuthorizationLetter = async (letterId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/employers/${id}/authorization-letters/${letterId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Update the local state
                setProfile(prev => ({
                    ...prev,
                    authorizationLetters: prev.authorizationLetters.map(letter => 
                        letter._id === letterId 
                            ? { ...letter, status: 'approved', approvedAt: new Date() }
                            : letter
                    )
                }));
                showSuccess('Authorization letter approved successfully! Notification sent to employer.');
            } else {
                const data = await response.json();
                showError(data.message || 'Failed to approve authorization letter');
            }
        } catch (error) {
            showError('Error approving authorization letter');
        }
    };

    const handleRejectAuthorizationLetter = async (letterId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/employers/${id}/authorization-letters/${letterId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Update the local state
                setProfile(prev => ({
                    ...prev,
                    authorizationLetters: prev.authorizationLetters.map(letter => 
                        letter._id === letterId 
                            ? { ...letter, status: 'rejected', rejectedAt: new Date() }
                            : letter
                    )
                }));
                showSuccess('Authorization letter rejected successfully! Notification sent to employer.');
            } else {
                const data = await response.json();
                showError(data.message || 'Failed to reject authorization letter');
            }
        } catch (error) {
            showError('Error rejecting authorization letter');
        }
    };

    if (loading) {
        return <PageLoader pageName="Employer Details" />;
    }
    
    if (!profile) {
        return (
            <div className="employer-details-container">
                <div className="not-found-container" data-aos="fade-up">
                    <i className="fa fa-exclamation-triangle not-found-icon"></i>
                    <h3>Employer Profile Not Found</h3>
                    <p>The requested employer profile could not be found.</p>
                </div>
            </div>
        );
    }

    const getSingleDocumentMeta = (documentField) => {
        const documentConfigMap = {
            panCardImage: { status: 'panCardVerified', reuploadedAt: 'panCardReuploadedAt' },
            cinImage: { status: 'cinVerified', reuploadedAt: 'cinReuploadedAt' },
            gstImage: { status: 'gstVerified', reuploadedAt: 'gstReuploadedAt' },
            certificateOfIncorporation: { status: 'incorporationVerified', reuploadedAt: 'incorporationReuploadedAt' },
            companyIdCardPicture: { status: 'companyIdCardVerified', reuploadedAt: 'companyIdCardReuploadedAt' }
        };

        const config = documentConfigMap[documentField];
        const uploaded = Boolean(profile[documentField]);
        const verificationStatus = config ? (profile[config.status] || 'pending') : 'pending';
        const reuploadedAt = config ? profile[config.reuploadedAt] : null;
        const isResubmitted = Boolean(uploaded && reuploadedAt && verificationStatus === 'pending');

        return {
            uploaded,
            verificationStatus,
            reuploadedAt,
            isResubmitted
        };
    };

    const panCardMeta = getSingleDocumentMeta('panCardImage');
    const cinMeta = getSingleDocumentMeta('cinImage');
    const gstMeta = getSingleDocumentMeta('gstImage');
    const incorporationMeta = getSingleDocumentMeta('certificateOfIncorporation');
    const companyIdMeta = getSingleDocumentMeta('companyIdCardPicture');
    const isConsultantProfile = ['consultancy', 'consultant'].includes(
        String(profile.employerCategory || '').trim().toLowerCase()
    );
    const renderDocumentType = (iconClass, label) => (
        <span className="documents-table__type-label">
            <span className="documents-table__type-icon">
                <i className={`${iconClass} text-muted`} aria-hidden="true"></i>
            </span>
            <span className="documents-table__type-text">{label}</span>
        </span>
    );
    const authorizationLetters = Array.isArray(profile.authorizationLetters) ? profile.authorizationLetters : [];
    const approvedAuthorizationCompanies = new Set(
        authorizationLetters
            .filter((letter) => letter?.status === 'approved')
            .map((letter) => normalizeCompanyName(getLetterCompanyName(letter)))
            .filter(Boolean)
    );
    const newConsultantCompanyKeys = new Set(
        approvedAuthorizationCompanies.size > 0
            ? authorizationLetters
                .filter((letter) => letter?.status !== 'approved')
                .map((letter) => normalizeCompanyName(getLetterCompanyName(letter)))
                .filter((companyKey) => companyKey && !approvedAuthorizationCompanies.has(companyKey))
            : []
    );
    const consultantCompanies = Array.from(
        new Map(
            [
                ...(Array.isArray(profile.hiringCompanies) ? profile.hiringCompanies : []),
                ...authorizationLetters.map((letter) => getLetterCompanyName(letter))
            ]
                .map((companyName) => String(companyName || '').trim())
                .filter(Boolean)
                .map((companyName) => [normalizeCompanyName(companyName), companyName])
        ).values()
    ).sort((left, right) => {
        const leftIsNew = newConsultantCompanyKeys.has(normalizeCompanyName(left));
        const rightIsNew = newConsultantCompanyKeys.has(normalizeCompanyName(right));
        if (leftIsNew !== rightIsNew) return leftIsNew ? -1 : 1;
        return left.localeCompare(right);
    });
    const hasNewConsultantCompanies = newConsultantCompanyKeys.size > 0;
    const isNewConsultantCompany = (companyName) => newConsultantCompanyKeys.has(normalizeCompanyName(companyName));

    return (
        <div className="employer-details-container">
            <div className="employer-details-header" data-aos="fade-down" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ color: 'white !important' }}>
                        <i className="fa fa-building me-3"></i>
                        Employer Profile Details
                    </h2>
                    <p className="employer-details-subtitle mb-0">
                        <i className="fa fa-info-circle me-2"></i>
                        Complete employer information and document verification
                    </p>
                </div>
                <button className="btn btn-outline-primary" onClick={() => navigate(-1)} style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35', whiteSpace: 'nowrap' }}>
                    <i className="fa fa-arrow-left"></i>
                    Back to Management
                </button>
            </div>
            
            {/* Logo and Cover Images Section */}
            <div className="profile-info-card" data-aos="fade-up" data-aos-delay="100">
                <h4 className="profile-section-title">
                    <i className="fa fa-image"></i>
                    Logo and Cover Images
                </h4>
                
                <div className="row">
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="200">
                            <h6><i className="fa fa-image"></i>Company Logo</h6>
                            {profile.logo ? (
                                <button
                                    type="button"
                                    className="media-preview-card media-preview-card--logo"
                                    onClick={() => viewDocumentImage(id, 'logo')}
                                >
                                    <div className="media-preview-frame media-preview-frame--logo">
                                        <img
                                            src={resolveMediaSrc(profile.logo)}
                                            alt={`${profile.companyName || 'Company'} logo`}
                                            className="media-preview-image"
                                        />
                                    </div>
                                    <div className="media-preview-meta">
                                        <span className="media-preview-status">Logo uploaded</span>
                                        <span className="media-preview-hint">Click to open preview</span>
                                    </div>
                                </button>
                            ) : (
                                <p className="text-muted">No logo uploaded</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="200">
                            <h6><i className="fa fa-images"></i>Cover Image</h6>
                            {profile.coverImage ? (
                                <button
                                    type="button"
                                    className="media-preview-card media-preview-card--cover"
                                    onClick={() => viewDocumentImage(id, 'coverImage')}
                                >
                                    <div className="media-preview-frame media-preview-frame--cover">
                                        <img
                                            src={resolveMediaSrc(profile.coverImage)}
                                            alt={`${profile.companyName || 'Company'} cover`}
                                            className="media-preview-image"
                                        />
                                    </div>
                                    <div className="media-preview-meta">
                                        <span className="media-preview-status">Cover image uploaded</span>
                                        <span className="media-preview-hint">Click to open preview</span>
                                    </div>
                                </button>
                            ) : (
                                <p className="text-muted">No cover image uploaded</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Basic Information Section */}
            <div className="profile-info-card" data-aos="fade-up" data-aos-delay="150">
                <h4 className="profile-section-title">
                    <i className="fa fa-info-circle"></i>
                    Basic Information
                </h4>
                
                <div className="row">
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="200">
                            <h6><i className="fa fa-tag"></i>Employer Category</h6>
                            <p>{profile.employerCategory || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="225">
                            <h6><i className="fa fa-building"></i>Company Name</h6>
                            <p>{profile.companyName || profile.employerId?.companyName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="250">
                            <h6><i className="fa fa-phone"></i>Phone</h6>
                            <p>{profile.phone || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="275">
                            <h6><i className="fa fa-envelope"></i>Email</h6>
                            <p>{profile.email || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="300">
                            <h6><i className="fa fa-globe"></i>Website</h6>
                            <p>
                                {profile.website ? (
                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" style={{color: '#ff6b35', textDecoration: 'none'}}>
                                        {profile.website}
                                    </a>
                                ) : 'N/A'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="200">
                            <h6><i className="fa fa-calendar"></i>Established Since</h6>
                            <p>{profile.establishedSince || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="225">
                            <h6><i className="fa fa-users"></i>Team Size</h6>
                            <p>{profile.teamSize || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="250">
                            <h6><i className="fa fa-map-marker-alt"></i>Primary Office Location</h6>
                            <p>{profile.location || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="275">
                            <h6><i className="fa fa-clock"></i>Created At</h6>
                            <p>{formatDate(profile.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Details Section */}
            <div className="profile-info-card" data-aos="fade-up" data-aos-delay="200">
                <h4 className="profile-section-title">
                    <i className="fa fa-building"></i>
                    Company Details
                </h4>
                
                <div className="row">
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="250">
                            <h6><i className="fa fa-map-marker-alt"></i>Corporate Address</h6>
                            <p>{profile.corporateAddress || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="275">
                            <h6><i className="fa fa-map-marked"></i>Branch Locations</h6>
                            <p>{profile.branchLocations || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="300">
                            <h6><i className="fa fa-map-pin"></i>Pincode</h6>
                            <p>{profile.pincode || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="312">
                            <h6><i className="fa fa-city"></i>City</h6>
                            <p>{profile.city || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="325">
                            <h6><i className="fa fa-map"></i>State</h6>
                            <p>{profile.state || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="337">
                            <h6><i className="fa fa-envelope-open"></i>Official Email</h6>
                            <p>{profile.officialEmail || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="350">
                            <h6><i className="fa fa-mobile-alt"></i>Official Mobile</h6>
                            <p>{profile.officialMobile || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="250">
                            <h6><i className="fa fa-industry"></i>Company Type</h6>
                            <p>{profile.companyType || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="275">
                            <h6><i className="fa fa-certificate"></i>CIN</h6>
                            <p>{profile.cin || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="300">
                            <h6><i className="fa fa-receipt"></i>GST Number</h6>
                            <p>{profile.gstNumber || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="325">
                            <h6><i className="fa fa-cogs"></i>Industry Sector</h6>
                            <p style={{textTransform: 'uppercase'}}>{profile.industrySector || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="350">
                            <h6><i className="fa fa-id-card"></i>PAN Number</h6>
                            <p>{profile.panNumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="description-section" data-aos="fade-up" data-aos-delay="375">
                    <h6><i className="fa fa-align-left"></i>About Company</h6>
                    <div className="description-text" dangerouslySetInnerHTML={{ __html: profile.description || 'No description provided' }} />
                </div>

                <div className="description-section" data-aos="fade-up" data-aos-delay="400">
                    <h6><i className="fa fa-briefcase"></i>Why Join Us</h6>
                    <div className="description-text" dangerouslySetInnerHTML={{ __html: profile.whyJoinUs || 'No information provided' }} />
                </div>
            </div>

            {/* Google Maps Section */}
            {profile.googleMapsEmbed && (() => {
                const srcMatch = profile.googleMapsEmbed.match(/src=["']([^"']+)["']/);
                if (srcMatch) {
                    return (
                        <div className="profile-info-card" data-aos="fade-up" data-aos-delay="225">
                            <h4 className="profile-section-title">
                                <i className="fa fa-map-marked-alt"></i>
                                Company Location
                            </h4>
                            <div className="map-container">
                                <iframe
                                    src={srcMatch[1]}
                                    width="100%"
                                    height="400"
                                    style={{border: '1px solid #ddd', borderRadius: '8px'}}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Company Location"
                                ></iframe>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Primary Contact Person Section */}
            <div className="profile-info-card" data-aos="fade-up" data-aos-delay="250">
                <h4 className="profile-section-title">
                    <i className="fa fa-user-tie"></i>
                    Primary Contact Person
                </h4>
                
                <div className="row">
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="300">
                            <h6><i className="fa fa-user"></i>Contact First Name</h6>
                            <p>{profile.contactFullName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="325">
                            <h6><i className="fa fa-user"></i>Contact Middle Name</h6>
                            <p>{profile.contactMiddleName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="350">
                            <h6><i className="fa fa-user"></i>Contact Last Name</h6>
                            <p>{profile.contactLastName || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-right" data-aos-delay="375">
                            <h6><i className="fa fa-id-badge"></i>Contact Designation</h6>
                            <p>{profile.contactDesignation || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="300">
                            <h6><i className="fa fa-envelope"></i>Contact Official Email</h6>
                            <p>{profile.contactOfficialEmail || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="325">
                            <h6><i className="fa fa-mobile"></i>Contact Mobile</h6>
                            <p>{profile.contactMobile || 'N/A'}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="350">
                            <h6><i className="fa fa-phone-alt"></i>Alternate Contact</h6>
                            <p>{formatOptionalPhone(profile.alternateContact)}</p>
                        </div>
                        <div className="profile-field" data-aos="fade-left" data-aos-delay="375">
                            <h6><i className="fa fa-id-badge"></i>Employer Code</h6>
                            <p>{profile.employerCode || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                {/* Company ID Card Picture */}
                {profile.companyIdCardPicture && (
                    <div className="row mt-3">
                        <div className="col-lg-12">
                            <div className="profile-field" data-aos="fade-up" data-aos-delay="400">
                                <h6><i className="fa fa-id-card"></i>Company ID Card Picture</h6>
                                <div>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'companyIdCardPicture')}
                                        style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                        View ID Card
                                    </button>
                                    <p className="text-success mt-1"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isConsultantProfile && consultantCompanies.length > 0 && (
                <div className="profile-info-card" data-aos="fade-up" data-aos-delay="275">
                    <h4 className="profile-section-title">
                        <i className="fa fa-building-circle-check"></i>
                        Consultant Hiring Companies
                    </h4>
                    <p className="consultant-company-note">
                        {hasNewConsultantCompanies
                            ? 'New companies added after approval are highlighted for admin review.'
                            : 'Approved and linked companies are listed below.'}
                    </p>
                    <div className="consultant-company-list">
                        {consultantCompanies.map((companyName, index) => {
                            const isNewCompany = isNewConsultantCompany(companyName);

                            return (
                                <div
                                    key={`${normalizeCompanyName(companyName)}-${index}`}
                                    className={`consultant-company-chip ${isNewCompany ? 'consultant-company-chip--new' : ''}`}
                                >
                                    <span className={`consultant-company-dot ${isNewCompany ? 'consultant-company-dot--new' : ''}`}></span>
                                    <span className="consultant-company-chip__name">{companyName}</span>
                                    {isNewCompany && (
                                        <span className="consultant-company-chip__badge">New</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="documents-section" data-aos="fade-up" data-aos-delay="300">
                <h4 className="profile-section-title">
                    <i className="fa fa-file-alt"></i>
                    Document Verification
                </h4>
                <div className="table-responsive">
                    <table className="table documents-table">
                        <thead>
                            <tr>
                                <th><i className="fa fa-file me-2"></i>Document Type</th>
                                <th><i className="fa fa-upload me-2"></i>Upload Status</th>
                                <th><i className="fa fa-check-circle me-2"></i>Verification Status</th>
                                <th style={{textAlign: 'center'}}><i className="fa fa-eye me-2"></i>View</th>
                                <th style={{textAlign: 'center'}}><i className="fa fa-cogs me-2"></i>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr data-aos="fade-left" data-aos-delay="400">
                                <td className="documents-table__type-cell">{renderDocumentType('fa fa-id-card', 'PAN Card Image')}</td>
                                <td>
                                    {panCardMeta.uploaded ? 
                                        <span className="status-badge badge-uploaded">
                                            <i className={`fa ${panCardMeta.isResubmitted ? 'fa-rotate-right' : 'fa-check'}`}></i>
                                            {panCardMeta.isResubmitted ? 'Resubmitted' : 'Uploaded'}
                                        </span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        panCardMeta.verificationStatus === 'approved' ? 'badge-approved' : 
                                        panCardMeta.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                    }`}>
                                        {panCardMeta.verificationStatus !== 'approved' && (
                                            <i className={`fa ${
                                                panCardMeta.verificationStatus === 'rejected' ? 'fa-times' : 'fa-clock'
                                            }`}></i>
                                        )}
                                        {panCardMeta.verificationStatus === 'approved' ? 'Approved' : 
                                         panCardMeta.verificationStatus === 'rejected' ? 'Rejected' :
                                         panCardMeta.isResubmitted ? 'Resubmitted' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'panCardImage')}
                                        disabled={!profile.panCardImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <div className="action-buttons-container">
                                        {panCardMeta.uploaded && panCardMeta.verificationStatus === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'panCardVerified', 'approved')}
                                                    style={{ marginRight: '5px' }}
                                                    title="Approve Document"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'panCardVerified', 'rejected')}
                                                    title="Reject Document"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </>
                                        )}
                                        {panCardMeta.uploaded && panCardMeta.verificationStatus === 'rejected' && (
                                            <span className="text-muted">Awaiting resubmission</span>
                                        )}
                                        {panCardMeta.uploaded && panCardMeta.verificationStatus === 'approved' && (
                                            <span className="text-success">Verified</span>
                                        )}
                                        {!panCardMeta.uploaded && (
                                            <span className="text-muted">No document</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="450">
                                <td className="documents-table__type-cell">{renderDocumentType('fa fa-certificate', 'CIN Document')}</td>
                                <td>
                                    {cinMeta.uploaded ? 
                                        <span className="status-badge badge-uploaded">
                                            <i className={`fa ${cinMeta.isResubmitted ? 'fa-rotate-right' : 'fa-check'}`}></i>
                                            {cinMeta.isResubmitted ? 'Resubmitted' : 'Uploaded'}
                                        </span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        cinMeta.verificationStatus === 'approved' ? 'badge-approved' : 
                                        cinMeta.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                    }`}>
                                        {cinMeta.verificationStatus !== 'approved' && (
                                            <i className={`fa ${
                                                cinMeta.verificationStatus === 'rejected' ? 'fa-times' : 'fa-clock'
                                            }`}></i>
                                        )}
                                        {cinMeta.verificationStatus === 'approved' ? 'Approved' : 
                                         cinMeta.verificationStatus === 'rejected' ? 'Rejected' :
                                         cinMeta.isResubmitted ? 'Resubmitted' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'cinImage')}
                                        disabled={!profile.cinImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <div className="action-buttons-container">
                                        {cinMeta.uploaded && cinMeta.verificationStatus === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'cinVerified', 'approved')}
                                                    style={{ marginRight: '5px' }}
                                                    title="Approve Document"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'cinVerified', 'rejected')}
                                                    title="Reject Document"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </>
                                        )}
                                        {cinMeta.uploaded && cinMeta.verificationStatus === 'rejected' && (
                                            <span className="text-muted">Awaiting resubmission</span>
                                        )}
                                        {cinMeta.uploaded && cinMeta.verificationStatus === 'approved' && (
                                            <span className="text-success">Verified</span>
                                        )}
                                        {!cinMeta.uploaded && (
                                            <span className="text-muted">No document</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="500">
                                <td className="documents-table__type-cell">{renderDocumentType('fa fa-receipt', 'GST Certificate')}</td>
                                <td>
                                    {gstMeta.uploaded ? 
                                        <span className="status-badge badge-uploaded">
                                            <i className={`fa ${gstMeta.isResubmitted ? 'fa-rotate-right' : 'fa-check'}`}></i>
                                            {gstMeta.isResubmitted ? 'Resubmitted' : 'Uploaded'}
                                        </span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        gstMeta.verificationStatus === 'approved' ? 'badge-approved' : 
                                        gstMeta.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                    }`}>
                                        {gstMeta.verificationStatus !== 'approved' && (
                                            <i className={`fa ${
                                                gstMeta.verificationStatus === 'rejected' ? 'fa-times' : 'fa-clock'
                                            }`}></i>
                                        )}
                                        {gstMeta.verificationStatus === 'approved' ? 'Approved' : 
                                         gstMeta.verificationStatus === 'rejected' ? 'Rejected' :
                                         gstMeta.isResubmitted ? 'Resubmitted' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'gstImage')}
                                        disabled={!profile.gstImage}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <div className="action-buttons-container">
                                        {gstMeta.uploaded && gstMeta.verificationStatus === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'gstVerified', 'approved')}
                                                    style={{ marginRight: '5px' }}
                                                    title="Approve Document"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'gstVerified', 'rejected')}
                                                    title="Reject Document"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </>
                                        )}
                                        {gstMeta.uploaded && gstMeta.verificationStatus === 'rejected' && (
                                            <span className="text-muted">Awaiting resubmission</span>
                                        )}
                                        {gstMeta.uploaded && gstMeta.verificationStatus === 'approved' && (
                                            <span className="text-success">Verified</span>
                                        )}
                                        {!gstMeta.uploaded && (
                                            <span className="text-muted">No document</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="550">
                                <td className="documents-table__type-cell">{renderDocumentType('fa fa-file-contract', 'Certificate of Incorporation')}</td>
                                <td>
                                    {incorporationMeta.uploaded ? 
                                        <span className="status-badge badge-uploaded">
                                            <i className={`fa ${incorporationMeta.isResubmitted ? 'fa-rotate-right' : 'fa-check'}`}></i>
                                            {incorporationMeta.isResubmitted ? 'Resubmitted' : 'Uploaded'}
                                        </span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        incorporationMeta.verificationStatus === 'approved' ? 'badge-approved' : 
                                        incorporationMeta.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                    }`}>
                                        {incorporationMeta.verificationStatus !== 'approved' && (
                                            <i className={`fa ${
                                                incorporationMeta.verificationStatus === 'rejected' ? 'fa-times' : 'fa-clock'
                                            }`}></i>
                                        )}
                                        {incorporationMeta.verificationStatus === 'approved' ? 'Approved' : 
                                         incorporationMeta.verificationStatus === 'rejected' ? 'Rejected' :
                                         incorporationMeta.isResubmitted ? 'Resubmitted' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'certificateOfIncorporation')}
                                        disabled={!profile.certificateOfIncorporation}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <div className="action-buttons-container">
                                        {incorporationMeta.uploaded && incorporationMeta.verificationStatus === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'incorporationVerified', 'approved')}
                                                    style={{ marginRight: '5px' }}
                                                    title="Approve Document"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'incorporationVerified', 'rejected')}
                                                    title="Reject Document"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </>
                                        )}
                                        {incorporationMeta.uploaded && incorporationMeta.verificationStatus === 'rejected' && (
                                            <span className="text-muted">Awaiting resubmission</span>
                                        )}
                                        {incorporationMeta.uploaded && incorporationMeta.verificationStatus === 'approved' && (
                                            <span className="text-success">Verified</span>
                                        )}
                                        {!incorporationMeta.uploaded && (
                                            <span className="text-muted">No document</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr data-aos="fade-left" data-aos-delay="600">
                                <td className="documents-table__type-cell">{renderDocumentType('fa fa-address-card', 'Company ID Card')}</td>
                                <td>
                                    {companyIdMeta.uploaded ? 
                                        <span className="status-badge badge-uploaded">
                                            <i className={`fa ${companyIdMeta.isResubmitted ? 'fa-rotate-right' : 'fa-check'}`}></i>
                                            {companyIdMeta.isResubmitted ? 'Resubmitted' : 'Uploaded'}
                                        </span> : 
                                        <span className="status-badge badge-not-uploaded"><i className="fa fa-times"></i>Not Uploaded</span>
                                    }
                                </td>
                                <td>
                                    <span className={`status-badge ${
                                        companyIdMeta.verificationStatus === 'approved' ? 'badge-approved' : 
                                        companyIdMeta.verificationStatus === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                    }`}>
                                        {companyIdMeta.verificationStatus !== 'approved' && (
                                            <i className={`fa ${
                                                companyIdMeta.verificationStatus === 'rejected' ? 'fa-times' : 'fa-clock'
                                            }`}></i>
                                        )}
                                        {companyIdMeta.verificationStatus === 'approved' ? 'Approved' : 
                                         companyIdMeta.verificationStatus === 'rejected' ? 'Rejected' :
                                         companyIdMeta.isResubmitted ? 'Resubmitted' : 'Pending'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => viewDocumentImage(id, 'companyIdCardPicture')}
                                        disabled={!profile.companyIdCardPicture}
                                        style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <div className="action-buttons-container">
                                        {companyIdMeta.uploaded && companyIdMeta.verificationStatus === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'companyIdCardVerified', 'approved')}
                                                    style={{ marginRight: '5px' }}
                                                    title="Approve Document"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => updateDocumentStatus(id, 'companyIdCardVerified', 'rejected')}
                                                    title="Reject Document"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </>
                                        )}
                                        {companyIdMeta.uploaded && companyIdMeta.verificationStatus === 'rejected' && (
                                            <span className="text-muted">Awaiting resubmission</span>
                                        )}
                                        {companyIdMeta.uploaded && companyIdMeta.verificationStatus === 'approved' && (
                                            <span className="text-success">Verified</span>
                                        )}
                                        {!companyIdMeta.uploaded && (
                                            <span className="text-muted">No document</span>
                                        )}
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Multiple Authorization Letters Section */}
            {authorizationLetters.length > 0 && (
                <div className="documents-section" data-aos="fade-up" data-aos-delay="450">
                    <h4 className="profile-section-title">
                        <i className="fa fa-file-signature"></i>
                        Authorization Letters
                    </h4>
                    <div className="table-responsive">
                        <table className="table documents-table">
                            <thead>
                                <tr>
                                    <th><i className="fa fa-building me-2"></i>Authorization Company Name</th>
                                    <th><i className="fa fa-file me-2"></i>File Name</th>
                                    <th><i className="fa fa-calendar me-2"></i>Upload Date</th>
                                    <th><i className="fa fa-check-circle me-2"></i>Status</th>
                                    <th><i className="fa fa-cogs me-2"></i>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {authorizationLetters.map((doc, index) => {
                                    const companyName = getLetterCompanyName(doc);
                                    const isNewCompany = isConsultantProfile && isNewConsultantCompany(companyName);

                                    return (
                                    <tr
                                        key={doc._id || index}
                                        data-aos="fade-left"
                                        data-aos-delay={500 + (index * 50)}
                                        className={isNewCompany ? 'documents-table__row--new-company' : ''}
                                    >
                                        <td>
                                            <div className={`authorization-company-cell ${isNewCompany ? 'authorization-company-cell--new' : ''}`}>
                                                <i className="fa fa-building me-2 text-muted"></i>
                                                {isNewCompany && (
                                                    <span className="consultant-company-dot consultant-company-dot--new"></span>
                                                )}
                                                <span className="authorization-company-name">{companyName}</span>
                                                {isNewCompany && (
                                                    <span className="consultant-company-chip__badge">New</span>
                                                )}
                                            </div>
                                        </td>
                                        <td><i className="fa fa-file-alt me-2 text-muted"></i>{doc.fileName}</td>
                                        <td><i className="fa fa-clock me-2 text-muted"></i>{formatDate(doc.uploadedAt)}</td>
                                        <td>
                                            <span className={`status-badge ${
                                                doc.status === 'approved' ? 'badge-approved' : 
                                                doc.status === 'rejected' && doc.isResubmitted ? 'badge-pending' :
                                                doc.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                            }`}>
                                                {doc.status !== 'approved' && (
                                                    <i className={`fa ${
                                                        doc.status === 'rejected' && !doc.isResubmitted ? 'fa-times' : 'fa-clock'
                                                    }`}></i>
                                                )}
                                                {doc.status === 'approved' ? 'Approved' : 
                                                 doc.status === 'rejected' && doc.isResubmitted ? 'Resubmitted' :
                                                 doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-container">
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => openDocumentPreview(doc.fileData, doc.fileName)}
                                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35', marginRight: '5px' }}
                                                    title="View Document"
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </button>
                                                {(doc.status === 'pending' || (doc.status === 'rejected' && doc.isResubmitted)) && (
                                                    <>
                                                        <button 
                                                            className="btn btn-outline-success btn-sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleApproveAuthorizationLetter(doc._id);
                                                            }}
                                                            style={{ marginRight: '5px' }}
                                                            title="Approve Authorization Letter"
                                                        >
                                                            <i className="fa fa-check"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleRejectAuthorizationLetter(doc._id);
                                                            }}
                                                            title="Reject Authorization Letter"
                                                        >
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                    </>
                                                )}
                                                {doc.status === 'rejected' && !doc.isResubmitted && (
                                                    <span className="text-muted rejected-status-text">Awaiting resubmission</span>
                                                )}
                                                {doc.status === 'approved' && (
                                                    <span className="text-success ms-2">Verified</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Company Gallery Section */}
            {profile.gallery && profile.gallery.length > 0 && (
                <div className="documents-section" data-aos="fade-up" data-aos-delay="350">
                    <h4 className="profile-section-title">
                        <i className="fa fa-images"></i>
                        Company Gallery
                    </h4>
                    <div className="gallery-preview mt-3">
                        <div className="gallery-container">
                            {profile.gallery.map((image, index) => (
                                <div key={image._id || index} className="gallery-item">
                                    <img 
                                        src={image.url} 
                                        alt={`Gallery ${index + 1}`}
                                        className="gallery-image"
                                        onClick={() => {
                                            setCurrentImage(image.url);
                                            setCurrentImageType('image');
                                            setCurrentPreviewName(image.fileName || `Gallery ${index + 1}`);
                                            setShowImageModal(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Posted Jobs Section */}
            <div className="documents-section" data-aos="fade-up" data-aos-delay="400">
                <h4 className="profile-section-title">
                    <i className="fa fa-briefcase"></i>
                    Posted Jobs
                </h4>
                <div className="job-count-container">
                    <div
                        className="job-count-card"
                        onClick={() => navigate(`/admin/overview?employerId=${id}`)}
                        style={{cursor: 'pointer'}}
                    >
                        <div className="job-count-info">
                            <div className="job-count-number">
                                {jobsLoading ? (
                                    <div className="loading-spinner-small"></div>
                                ) : (
                                    <span className="count-value">{activeJobCount || 0}</span>
                                )}
                            </div>
                            <div className="job-count-label">
                                <i className="fa fa-briefcase me-2"></i>
                                Active Jobs Posted
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && (
                <div className="image-modal" onClick={closeImageModal}>
                    <div className={`image-modal-content ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="image-modal-header">
                            <h5 className="image-modal-title">
                                <i className={`fa ${currentImageType === 'application/pdf' ? 'fa-file-pdf' : 'fa-image'} me-2`}></i>
                                {currentPreviewName || (currentImageType === 'application/pdf' ? 'Document Preview' : 'Image Preview')}
                            </h5>
                            <div className="image-modal-controls">
                                <button className="modal-control-btn minimize-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Restore" : "Minimize"}>
                                    {isMinimized ? '□' : '_'}
                                </button>
                                <button className="modal-control-btn maximize-btn" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore" : "Maximize"}>
                                    {isMaximized ? '❐' : '□'}
                                </button>
                                <button className="modal-close-btn" onClick={closeImageModal}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                        </div>
                        {!isMinimized && (
                            <div className="text-center" style={{ width: '100%' }}>
                                {currentImageType === 'application/pdf' ? (
                                    <div className="pdf-container" style={{ width: '100%', height: '600px', position: 'relative' }}>
                                        <iframe 
                                            src={currentImage} 
                                            className="pdf-viewer" 
                                            title="PDF Preview"
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <img src={currentImage} alt="Preview" className="modal-image" style={{
                                        maxWidth: '100%',
                                        maxHeight: '600px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployerDetails;
