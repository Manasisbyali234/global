import { Briefcase, Building, Calendar, FileText, Globe, Hash, IdCard, Image as ImageIcon, Mail, MapPin, Phone, Upload, User as UserIcon, Users as UsersIcon, Images, Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { loadScript } from "../../../../globals/constants";
import CountryCodeSelector from "../../../../components/CountryCodeSelector";
import { ErrorDisplay, GlobalErrorDisplay } from "../../../../components/ErrorDisplay";
import { validateField, validateForm, displayError, safeApiCall, getErrorMessage } from "../../../../utils/errorHandler";
import RichTextEditor from "../../../../components/RichTextEditor";
import TermsModal from '../../../../components/TermsModal';
import ImageResizer from '../../../../components/ImageResizer';
import { useImageResizer } from '../../../../hooks/useImageResizer';

import './emp-company-profile.css';
import '../../../../components/ErrorDisplay.css';
import '../../../../remove-profile-hover-effects.css';

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../utils/popupNotification';
import ConfirmationDialog from '../../../../components/ConfirmationDialog';
function EmpCompanyProfilePage() {
    const {
        isResizerOpen,
        currentImage,
        resizeConfig,
        closeResizer,
        handleSave: handleResizerSave,
        openLogoResizer,
        openBannerResizer,
        openProfileResizer,
        openGalleryResizer,
        handleFileWithResize
    } = useImageResizer();
    
    const [formData, setFormData] = useState({
        // Basic Information
        employerCategory: '',
        companyName: '',
        phone: '',
        phoneCountryCode: '+91',
        email: '',
        website: '',
        establishedSince: '',
        teamSize: '',
        customTeamSize: '',

        description: '',
        location: '',
        googleMapsEmbed: '',
        whyJoinUs: '',

        // Company Details
        legalEntityCode: '',
        corporateAddress: '',
        branchLocations: '',
        pincode: '',
        city: '',
        state: '',
        officialEmail: '',
        officialMobile: '',
        officialMobileCountryCode: '+91',
        companyType: '',
        cin: '',
        gstNumber: '',
        industrySector: '',
        panNumber: '',
        agreeTerms: '',

        // Primary Contact
        contactFullName: '',
        contactMiddleName: '',
        contactLastName: '',
        contactDesignation: '',
        contactOfficialEmail: '',
        contactMobile: '',
        contactMobileCountryCode: '+91',
        companyIdCardPicture: '',
        alternateContact: '',
        alternateContactCountryCode: '+91',
        employerCode: '',
        
        // Images
        logo: '',
        coverImage: '',
        
        // Authorization Letters
        authorizationLetters: [],
        
        // Gallery
        gallery: []
    });

    const [loading, setLoading] = useState(false);
    const [authSections, setAuthSections] = useState([{ id: 1, companyName: '' }]);
    const [errors, setErrors] = useState({});
    const [globalErrors, setGlobalErrors] = useState([]);
    const [fetchingCity, setFetchingCity] = useState(false);
    const [fetchingGST, setFetchingGST] = useState(false);
    const [gstAutoFilled, setGstAutoFilled] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [validationRules] = useState({
        companyName: { required: true, minLength: 2 },
        phone: { required: true, phone: true },
        email: { required: true, email: true },
        website: { required: true, url: true },
        establishedSince: { year: true },
        teamSize: { required: true },
        description: { required: true, minLength: 10 },
        location: { required: true, minLength: 2 },
        corporateAddress: { required: true, minLength: 10 },
        pincode: { required: true, pattern: /^\d{6}$/, patternMessage: 'Pincode must be 6 digits' },
        city: { required: true, minLength: 2 },
        state: { required: true },
        officialEmail: { required: true, email: true },
        officialMobile: { required: true, phone: true },
        companyType: { required: true },
        cin: { pattern: /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, patternMessage: 'Invalid CIN format. Must be 21 characters (e.g., U12345AB1234ABC123456)' },
        gstNumber: { required: true, pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, patternMessage: 'Invalid GST format. Must be 15 characters (e.g., 12ABCDE1234F1Z5)' },
        industrySector: { required: true },
        panNumber: { required: true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, patternMessage: 'Invalid PAN format. Must be 10 characters (e.g., ABCDE1234F)' },
        contactFullName: { required: true, minLength: 2 },
        contactLastName: { required: true, minLength: 2 },
        contactDesignation: { required: true, minLength: 2 },
        contactOfficialEmail: { required: true, email: true },
        contactMobile: { required: true, phone: true },
        companyIdCardPicture: { required: true },
        employerCode: { required: true, minLength: 3, maxLength: 20 }
    });

    useEffect(() => {
        loadScript("js/custom.js");
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login to access your profile.');
                window.location.href = '/employer/login';
                return;
            }
            
            const data = await safeApiCall('http://localhost:5000/api/employer/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (data.success && data.profile) {
                const profileData = { ...data.profile };

                // Split phone numbers into country code and number parts
                if (profileData.phone) {
                    const phoneStr = String(profileData.phone).trim();
                    if (phoneStr.startsWith('+')) {
                        // For +91, extract exactly 3 chars as country code
                        if (phoneStr.startsWith('+91')) {
                            profileData.phoneCountryCode = '+91';
                            profileData.phone = phoneStr.substring(3);
                        } else if (phoneStr.startsWith('+1')) {
                            profileData.phoneCountryCode = '+1';
                            profileData.phone = phoneStr.substring(2);
                        } else {
                            // For other codes, try to match pattern
                            const phoneMatch = phoneStr.match(/^(\+\d{1,4})(\d{8,15})$/);
                            if (phoneMatch) {
                                profileData.phoneCountryCode = phoneMatch[1];
                                profileData.phone = phoneMatch[2];
                            } else {
                                profileData.phoneCountryCode = '+91';
                                profileData.phone = phoneStr.replace(/^\+/, '');
                            }
                        }
                    } else {
                        profileData.phoneCountryCode = '+91';
                        profileData.phone = phoneStr;
                    }
                } else {
                    profileData.phoneCountryCode = '+91';
                    profileData.phone = '';
                }

                if (profileData.officialMobile) {
                    const officialStr = String(profileData.officialMobile).trim();
                    if (officialStr.startsWith('+')) {
                        if (officialStr.startsWith('+91')) {
                            profileData.officialMobileCountryCode = '+91';
                            profileData.officialMobile = officialStr.substring(3);
                        } else if (officialStr.startsWith('+1')) {
                            profileData.officialMobileCountryCode = '+1';
                            profileData.officialMobile = officialStr.substring(2);
                        } else {
                            const officialMatch = officialStr.match(/^(\+\d{1,4})(\d{8,15})$/);
                            if (officialMatch) {
                                profileData.officialMobileCountryCode = officialMatch[1];
                                profileData.officialMobile = officialMatch[2];
                            } else {
                                profileData.officialMobileCountryCode = '+91';
                                profileData.officialMobile = officialStr.replace(/^\+/, '');
                            }
                        }
                    } else {
                        profileData.officialMobileCountryCode = '+91';
                        profileData.officialMobile = officialStr;
                    }
                } else {
                    profileData.officialMobileCountryCode = '+91';
                    profileData.officialMobile = '';
                }

                if (profileData.contactMobile) {
                    const contactStr = String(profileData.contactMobile).trim();
                    if (contactStr.startsWith('+')) {
                        if (contactStr.startsWith('+91')) {
                            profileData.contactMobileCountryCode = '+91';
                            profileData.contactMobile = contactStr.substring(3);
                        } else if (contactStr.startsWith('+1')) {
                            profileData.contactMobileCountryCode = '+1';
                            profileData.contactMobile = contactStr.substring(2);
                        } else {
                            const contactMatch = contactStr.match(/^(\+\d{1,4})(\d{8,15})$/);
                            if (contactMatch) {
                                profileData.contactMobileCountryCode = contactMatch[1];
                                profileData.contactMobile = contactMatch[2];
                            } else {
                                profileData.contactMobileCountryCode = '+91';
                                profileData.contactMobile = contactStr.replace(/^\+/, '');
                            }
                        }
                    } else {
                        profileData.contactMobileCountryCode = '+91';
                        profileData.contactMobile = contactStr;
                    }
                } else {
                    profileData.contactMobileCountryCode = '+91';
                    profileData.contactMobile = '';
                }

                if (profileData.alternateContact) {
                    const alternateStr = String(profileData.alternateContact).trim();
                    if (alternateStr.startsWith('+')) {
                        if (alternateStr.startsWith('+91')) {
                            profileData.alternateContactCountryCode = '+91';
                            profileData.alternateContact = alternateStr.substring(3);
                        } else if (alternateStr.startsWith('+1')) {
                            profileData.alternateContactCountryCode = '+1';
                            profileData.alternateContact = alternateStr.substring(2);
                        } else {
                            const alternateMatch = alternateStr.match(/^(\+\d{1,4})(\d{8,15})$/);
                            if (alternateMatch) {
                                profileData.alternateContactCountryCode = alternateMatch[1];
                                profileData.alternateContact = alternateMatch[2];
                            } else {
                                profileData.alternateContactCountryCode = '+91';
                                profileData.alternateContact = alternateStr.replace(/^\+/, '');
                            }
                        }
                    } else {
                        profileData.alternateContactCountryCode = '+91';
                        profileData.alternateContact = alternateStr;
                    }
                } else {
                    profileData.alternateContactCountryCode = '+91';
                    profileData.alternateContact = '';
                }

                // Handle team size - if it's not a predefined option, set it as custom
                const predefinedSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
                if (profileData.teamSize && !predefinedSizes.includes(profileData.teamSize)) {
                    profileData.customTeamSize = profileData.teamSize;
                    profileData.teamSize = 'custom';
                }

                setFormData(prev => ({ ...prev, ...profileData }));

                // Populate authSections from existing authorization letters
                if (data.profile.authorizationLetters && data.profile.authorizationLetters.length > 0) {
                    const existingSections = data.profile.authorizationLetters.map((letter, index) => ({
                        id: index + 1,
                        companyName: letter.companyName || ''
                    }));
                    setAuthSections(existingSections.length > 0 ? existingSections : [{ id: 1, companyName: '' }]);
                }
            }
        } catch (error) {
            if (error.name === 'AuthError') {
                showWarning('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            displayError(error, { useToast: true });
        }
    };

    const handleInputChange = async (field, value) => {
        // Handle uppercase conversion for specific fields
        if (['cin', 'gstNumber', 'panNumber'].includes(field)) {
            value = value.toUpperCase();
        }
        
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear global errors when user starts making changes
        if (globalErrors.length > 0) {
            setGlobalErrors([]);
        }
        
        // Real-time validation
        const fieldRules = validationRules[field];
        if (fieldRules) {
            const fieldErrors = validateField(field, value, fieldRules);
            setErrors(prev => ({
                ...prev,
                [field]: fieldErrors.length > 0 ? fieldErrors : undefined
            }));
        } else {
            // Clear error for fields without validation rules
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        
        // Fetch city when pincode is entered
        if (field === 'pincode' && value.length === 6) {
            await fetchCityFromPincode(value);
        }
        
        // Fetch GST info when GST number is entered (15 characters)
        if (field === 'gstNumber' && value.length === 15) {
            await fetchGSTInfo(value);
        }
    };

    const fetchCityFromPincode = async (pincode) => {
        if (!/^\d{6}$/.test(pincode)) return;
        
        setFetchingCity(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            
            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const city = data[0].PostOffice[0].District;
                const state = data[0].PostOffice[0].State;
                
                // Update form data
                setFormData(prev => ({ 
                    ...prev, 
                    city, 
                    // Only auto-fill state if it's not already selected
                    state: prev.state || state 
                }));
                
                // Clear validation errors for city and state since they're now populated
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.city;
                    delete newErrors.state;
                    return newErrors;
                });
            } else {
                setFormData(prev => ({ ...prev, city: '' }));
                showWarning('Invalid pincode or city not found');
            }
        } catch (error) {
            console.error('Error fetching city:', error);
            showError('Failed to fetch city from pincode');
        } finally {
            setFetchingCity(false);
        }
    };

    const fetchGSTInfo = async (gstNumber) => {
        // Validate GST format first
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstNumber)) {
            return;
        }
        
        setFetchingGST(true);
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login to access GST information.');
                return;
            }
            
            const response = await fetch(`http://localhost:5000/api/employer/gst/${gstNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            console.log('GST API Response:', data);
            
            if (data.success) {
                showSuccess('GST Number is Valid');
            } else {
                showError('GST Number is Invalid');
            }
        } catch (error) {
            console.error('Error fetching GST info:', error);
            showError('GST Number is Invalid');
        } finally {
            setFetchingGST(false);
        }
    };

    const validateFormData = () => {
        const formErrors = validateForm(formData, validationRules);
        
        // Add document upload validation
        const requiredDocuments = {
            panCardImage: 'PAN Card Image',
            cinImage: 'CIN Document',
            gstImage: 'GST Certificate',
            certificateOfIncorporation: 'Certificate of Incorporation (Issued by RoC)'
        };
        
        Object.entries(requiredDocuments).forEach(([field, label]) => {
            if (!formData[field] || formData[field].trim() === '') {
                if (!formErrors[field]) {
                    formErrors[field] = [];
                }
                if (Array.isArray(formErrors[field])) {
                    formErrors[field].push(`${label} is required`);
                } else {
                    formErrors[field] = [`${label} is required`];
                }
            }
        });
        
        // For consultancy employers, validate hiring company names
        if (formData.employerCategory === 'consultancy') {
            const emptyCompanyNames = authSections.filter(section => !section.companyName?.trim());
            if (emptyCompanyNames.length > 0) {
                if (!formErrors.hiringCompanyNames) {
                    formErrors.hiringCompanyNames = [];
                }
                formErrors.hiringCompanyNames.push('All hiring company names are required for consultancy employers');
            }
        }
        
        setErrors(formErrors);
        
        const errorCount = Object.keys(formErrors).length;
        if (errorCount > 0) {
            const errorMessages = [];
            Object.entries(formErrors).forEach(([field, fieldErrors]) => {
                if (Array.isArray(fieldErrors)) {
                    fieldErrors.forEach(error => {
                        errorMessages.push(`${field}: ${error}`);
                    });
                } else {
                    errorMessages.push(`${field}: ${fieldErrors}`);
                }
            });
            setGlobalErrors(errorMessages);
        }
        
        return errorCount === 0;
    };

    // Validate image file by size, type, and minimum dimensions
    const validateImageFile = (file, { maxSizeMB, minWidth, minHeight, allowedTypes }) => {
        return new Promise((resolve) => {
            // Size check
            const maxBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxBytes) {
                resolve({ ok: false, message: `File is too large. Max size is ${maxSizeMB}MB.` });
                return;
            }

            // Type check
            if (allowedTypes && !allowedTypes.includes(file.type)) {
                resolve({ ok: false, message: `Invalid file type. Allowed: ${allowedTypes.join(", ")}.` });
                return;
            }

            // Dimension check (images only)
            try {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                img.onload = () => {
                    const { width, height } = img;
                    URL.revokeObjectURL(objectUrl);
                    if (width < minWidth || height < minHeight) {
                        resolve({ ok: false, message: `Image too small. Minimum ${minWidth}x${minHeight}px required.` });
                    } else {
                        resolve({ ok: true });
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({ ok: false, message: 'Unable to read image. Please try a different file.' });
                };
                img.src = objectUrl;
            } catch (err) {
                resolve({ ok: false, message: 'Validation failed. Please try again.' });
            }
        });
    };

    const handleDocumentUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Only use resizer for logo and coverImage
        const resizerFields = ['logo', 'coverImage'];
        const useResizer = resizerFields.includes(fieldName) && file.type.startsWith('image/');

        if (useResizer) {
            try {
                const resizerType = fieldName === 'logo' ? 'logo' : 'banner';
                await handleFileWithResize(file, resizerType, (processedImage) => {
                    uploadProcessedImage(processedImage, fieldName);
                });
            } catch (error) {
                showError(error.message);
            }
            return;
        }

        // Handle all other files normally
        const maxBytes = 5 * 1024 * 1024;
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (file.size > maxBytes) {
            showError('Document is too large. Max size is 5MB.');
            return;
        }
        if (!allowed.includes(file.type)) {
            showPopup('Invalid document type. Allowed: JPEG, PNG, PDF.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('fieldName', fieldName);
        
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login again to upload files.');
                return;
            }
            
            const response = await fetch('http://localhost:5000/api/employer/profile/document', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                handleInputChange(fieldName, data.filePath);
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
                
                // Show specific document name in success message
                const documentNames = {
                    'panCardImage': 'PAN Card',
                    'cinImage': 'CIN Document',
                    'gstImage': 'GST Certificate',
                    'certificateOfIncorporation': 'Certificate of Incorporation',
                    'companyIdCardPicture': 'Company ID Card',
                    'logo': 'Company Logo',
                    'coverImage': 'Background Banner'
                };
                
                const documentName = documentNames[fieldName] || 'Document';
                showSuccess(`${documentName} uploaded successfully!`);
            } else {
                showError(data.message || 'Document upload failed');
            }
        } catch (error) {
            console.error('Document upload error:', error);
            showError('Document upload failed. Please try again.');
        }
    };

    const uploadProcessedImage = async (processedImageDataURL, fieldName) => {
        try {
            // Convert data URL to blob
            const response = await fetch(processedImageDataURL);
            const blob = await response.blob();
            
            const formData = new FormData();
            formData.append('document', blob, `${fieldName}.jpg`);
            formData.append('fieldName', fieldName);
            
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login again to upload files.');
                return;
            }
            
            const uploadResponse = await fetch('http://localhost:5000/api/employer/profile/document', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await uploadResponse.json();
            
            if (data.success) {
                handleInputChange(fieldName, data.filePath);
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
                showSuccess('Image processed and uploaded successfully!');
            } else {
                showError(data.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Processed image upload error:', error);
            showError('Image upload failed. Please try again.');
        }
    };

    const handleAuthorizationLetterUpload = async (e, sectionId) => {
        const file = e.target.files[0];
        if (!file) return;

        // Get company name for this section
        const section = authSections.find(s => s.id === sectionId);
        const companyName = section?.companyName || '';

        // For consultancy, require company name
        if (formData.employerCategory === 'consultancy' && !companyName.trim()) {
            showWarning('Please enter the hiring company name before uploading the authorization letter.');
            return;
        }

        // Validate documents: <=5MB, allow images (jpg/png/jpeg) and PDF
        const maxBytes = 5 * 1024 * 1024;
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (file.size > maxBytes) {
            showError('Document is too large. Max size is 5MB.');
            return;
        }
        if (!allowed.includes(file.type)) {
            showPopup('Invalid document type. Allowed: JPEG, PNG, PDF.', 'error');
            return;
        }

        const formDataObj = new FormData();
        formDataObj.append('document', file);
        if (companyName) {
            formDataObj.append('companyName', companyName);
        }
        
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login again to upload files.');
                return;
            }
            
            const response = await fetch('http://localhost:5000/api/employer/profile/authorization-letter', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
                },
                body: formDataObj
            });
            
            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    authorizationLetters: data.profile.authorizationLetters || []
                }));
                showSuccess('Authorization letter uploaded successfully!');
                // Clear the file input
                e.target.value = '';
            } else {
                showError(data.message || 'Document upload failed');
            }
        } catch (error) {
            console.error('Authorization letter upload error:', error);
            showError('Authorization letter upload failed. Please try again.');
        }
    };

    const handleDeleteAuthorizationLetter = async (documentId) => {
        // Show confirmation toast instead of window.confirm
        const confirmDelete = () => {
            return new Promise((resolve) => {
                showWarning('Click "Delete" to confirm or wait 5 seconds to cancel');
                
                // Create confirmation buttons
                const container = document.getElementById('toast-container');
                if (container) {
                    const lastToast = container.lastElementChild;
                    if (lastToast) {
                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.cssText = 'margin-top: 10px; display: flex; gap: 10px;';
                        
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;';
                        deleteBtn.onclick = () => {
                            lastToast.remove();
                            resolve(true);
                        };
                        
                        const cancelBtn = document.createElement('button');
                        cancelBtn.textContent = 'Cancel';
                        cancelBtn.style.cssText = 'background: #6c757d; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;';
                        cancelBtn.onclick = () => {
                            lastToast.remove();
                            resolve(false);
                        };
                        
                        buttonContainer.appendChild(deleteBtn);
                        buttonContainer.appendChild(cancelBtn);
                        lastToast.appendChild(buttonContainer);
                        
                        // Auto-cancel after 5 seconds
                        setTimeout(() => {
                            if (lastToast.parentNode) {
                                lastToast.remove();
                                resolve(false);
                            }
                        }, 5000);
                    }
                }
            });
        };
        
        const shouldDelete = await confirmDelete();
        if (!shouldDelete) {
            return;
        }

        try {
            const token = localStorage.getItem('employerToken');
            if (!token) {
                showWarning('Please login again to delete files.');
                return;
            }
            
            const data = await safeApiCall(`http://localhost:5000/api/employer/profile/authorization-letter/${documentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    authorizationLetters: data.profile.authorizationLetters || []
                }));
                showSuccess('Authorization letter deleted successfully!');
            } else {
                showError(data.message || 'Failed to delete document');
            }
        } catch (error) {
            if (error.name === 'AuthError') {
                showWarning('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            displayError(error, { useToast: true });
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const currentCount = formData.gallery?.length || 0;
        if (currentCount + files.length > 10) {
            showWarning(`Maximum 10 images allowed. Current: ${currentCount}`);
            return;
        }

        // Validate each file before upload
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > maxSize) {
                showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                showPopup(`File "${file.name}" has invalid type. Only JPG, PNG, and SVG are allowed.`, 'error');
                return;
            }
        }

        try {
            const token = localStorage.getItem('employerToken');
            const formDataObj = new FormData();
            files.forEach(file => formDataObj.append('gallery', file));

            const response = await fetch('http://localhost:5000/api/employer/profile/gallery', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataObj
            });
            
            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({ ...prev, gallery: data.gallery }));
                showSuccess(`Successfully uploaded ${files.length} images!`);
                e.target.value = '';
            } else {
                showError(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            showError('Upload failed. Please try again.');
        }
    };

    const uploadGalleryImage = async (processedImageDataURL, originalFileName) => {
        try {
            const response = await fetch(processedImageDataURL);
            const blob = await response.blob();
            
            const formDataObj = new FormData();
            formDataObj.append('gallery', blob, originalFileName);

            const token = localStorage.getItem('employerToken');
            const uploadResponse = await fetch('http://localhost:5000/api/employer/profile/gallery', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataObj
            });
            
            const data = await uploadResponse.json();
            
            if (data.success) {
                setFormData(prev => ({ ...prev, gallery: data.gallery }));
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Gallery image upload error:', error);
            throw error;
        }
    };

    const handleDeleteGalleryImage = (imageId) => {
        setImageToDelete(imageId);
        setShowDeleteDialog(true);
    };

    const confirmDeleteImage = async () => {
        if (!imageToDelete) return;
        
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`http://localhost:5000/api/employer/profile/gallery/${imageToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({ ...prev, gallery: data.gallery }));
                showSuccess('Image deleted successfully!');
            } else {
                showError(data.message || 'Failed to delete image');
            }
        } catch (error) {
            showError('Delete failed. Please try again.');
        }
        
        setShowDeleteDialog(false);
        setImageToDelete(null);
    };

    const cancelDeleteImage = () => {
        setShowDeleteDialog(false);
        setImageToDelete(null);
    };

    const addNewAuthSection = () => {
        const newId = Math.max(...authSections.map(s => s.id)) + 1;
        setAuthSections(prev => [...prev, { id: newId, companyName: '' }]);
    };

    const handleAuthSectionCompanyNameChange = (sectionId, companyName) => {
        setAuthSections(prev => prev.map(section => 
            section.id === sectionId ? { ...section, companyName } : section
        ));
    };

    const removeAuthSection = (id) => {
        if (authSections.length > 1) {
            setAuthSections(prev => prev.filter(section => section.id !== id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check gallery minimum requirement
        const galleryCount = formData.gallery?.length || 0;
        if (galleryCount < 5) {
            showWarning(`Please upload at least 5 images in the company gallery. Currently uploaded: ${galleryCount}/5`);
            // Scroll to gallery section using a more compatible approach
            const galleryElements = document.querySelectorAll('.panel-tittle');
            for (let element of galleryElements) {
                if (element.textContent.includes('Company Gallery')) {
                    element.closest('.panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
            return;
        }
        
        if (!validateFormData()) {
            // Scroll to first error
            const firstErrorField = document.querySelector('.is-invalid');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            showWarning('Please fix the validation errors before submitting');
            return;
        }
        
        if (!termsAccepted) {
            setShowTermsModal(true);
            return;
        }
        
        await saveProfile();
    };

    const saveProfile = async () => {
        
        setLoading(true);
        try {
            const token = localStorage.getItem('employerToken');
            
            // Update authorization letters with current company names from authSections
            if (formData.authorizationLetters && formData.authorizationLetters.length > 0) {
                const updatedAuthLetters = formData.authorizationLetters.map((letter, index) => {
                    const correspondingSection = authSections[index];
                    return {
                        ...letter,
                        companyName: correspondingSection?.companyName || letter.companyName || ''
                    };
                });
                
                // Update authorization letters with company names
                await fetch('http://localhost:5000/api/employer/profile/update-authorization-companies', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ authorizationLetters: updatedAuthLetters })
                });
            }
            
            // Create a copy of formData excluding large Base64 files to prevent request size issues
            const profileData = { ...formData };

            // Handle custom team size
            if (formData.teamSize === 'custom' && formData.customTeamSize) {
                profileData.teamSize = formData.customTeamSize;
            }

            // Combine country codes with phone numbers
            profileData.phone = formData.phoneCountryCode + formData.phone;
            profileData.officialMobile = formData.officialMobileCountryCode + formData.officialMobile;
            profileData.contactMobile = formData.contactMobileCountryCode + formData.contactMobile;
            profileData.alternateContact = formData.alternateContactCountryCode + formData.alternateContact;

            // Explicitly ensure whyJoinUs and googleMapsEmbed are included
            profileData.whyJoinUs = formData.whyJoinUs || '';
            profileData.googleMapsEmbed = formData.googleMapsEmbed || '';

            // Remove Base64 encoded files and UI-only fields from the request (these are uploaded separately)
            delete profileData.logo;
            delete profileData.coverImage;
            delete profileData.panCardImage;
            delete profileData.cinImage;
            delete profileData.gstImage;
            delete profileData.certificateOfIncorporation;
            delete profileData.companyIdCardPicture;
            delete profileData.authorizationLetters;
            delete profileData.gallery;
            delete profileData.customTeamSize; // Remove UI-only field
            
            // Log the data being sent (for debugging)
            console.log('Sending profile data:', {
                whyJoinUs: profileData.whyJoinUs?.substring(0, 50),
                googleMapsEmbed: profileData.googleMapsEmbed?.substring(0, 50),
                whyJoinUsLength: profileData.whyJoinUs?.length,
                googleMapsEmbedLength: profileData.googleMapsEmbed?.length,
                companyName: profileData.companyName,
                description: profileData.description?.substring(0, 50)
            });
            console.log('Full whyJoinUs:', profileData.whyJoinUs);
            console.log('Full googleMapsEmbed:', profileData.googleMapsEmbed);
            console.log('All profile data keys:', Object.keys(profileData));
            
            const data = await safeApiCall('http://localhost:5000/api/employer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (data.success) {
                showSuccess('Profile updated successfully!');
                // Refresh profile data to get latest state
                fetchProfile();
                // Trigger event to update header
                window.dispatchEvent(new Event('employerProfileUpdated'));
            } else {
                showError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            if (error.name === 'AuthError') {
                showWarning('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer/login';
                return;
            }
            
            const errorMessage = getErrorMessage(error, 'profile');
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="emp-company-profile orange-icons">
            <div style={{ padding: '2rem 2rem 0 2rem' }}>
            <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                <h2>Company Details</h2>
                
                <div className="alert alert-info mt-3" style={{fontSize: '14px'}}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Important:</strong> Complete all required fields and upload all required documents (PAN Card, CIN Document, GST Certificate, and Certificate of Incorporation) before clicking "Save Profile". You can post jobs only after admin approval.
                </div>
                
                {globalErrors.length > 0 && (
                    <GlobalErrorDisplay 
                        errors={globalErrors}
                        onDismiss={() => setGlobalErrors([])}
                        className="mt-3"
                    />
                )}
            </div>
            </div>

            {/*Logo and Cover image*/}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><ImageIcon size={18} className="me-2" /> Logo and Cover image</h4>
                </div>
                
                <div className="panel-body wt-panel-body p-a20 p-b0 m-b30">
                    <div className="row">
                        <div className="col-lg-6 col-md-12">
                            <div className="form-group">
                                <label><ImageIcon size={16} className="me-2" /> Company Logo (300x300px)</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentUpload(e, 'logo')}
                                />
                                {formData.logo && (
                                    <div className="mt-2">
                                        <div className="d-inline-block">
                                            <img 
                                                src={formData.logo.startsWith('data:') ? formData.logo : `data:image/jpeg;base64,${formData.logo}`} 
                                                alt="Company Logo" 
                                                style={{
                                                    width: '150px', 
                                                    height: '150px', 
                                                    objectFit: 'cover', 
                                                    objectPosition: 'center',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    display: 'block'
                                                }} 
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                style={{
                                                    background: 'rgba(255, 107, 53, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '6px 12px',
                                                    marginRight: '8px',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => {
                                                    const imgSrc = formData.logo.startsWith('data:') ? formData.logo : `data:image/jpeg;base64,${formData.logo}`;
                                                    openLogoResizer(imgSrc, (processedImage) => {
                                                        uploadProcessedImage(processedImage, 'logo');
                                                    });
                                                }}
                                                title="Resize & Crop Image"
                                            >
                                                <Edit3 size={12} className="me-1" /> Resize & Crop
                                            </button>
                                        </div>
                                        <p className="text-success mt-2">✓ Company Logo uploaded</p>
                                    </div>
                                )}
                                <small className="text-muted">Square logo for your company profile (300x300px, JPG, PNG, max 5MB)</small>
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12">
                            <div className="form-group">
                                <label><ImageIcon size={16} className="me-2" /> Background Banner Image (1200x675px)</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => handleDocumentUpload(e, 'coverImage')}
                                />
                                {formData.coverImage && (
                                    <div className="mt-2">
                                        <div className="d-inline-block">
                                            <img 
                                                src={formData.coverImage.startsWith('data:') ? formData.coverImage : `data:image/jpeg;base64,${formData.coverImage}`} 
                                                alt="Background Banner" 
                                                style={{
                                                    width: '200px', 
                                                    height: '120px', 
                                                    objectFit: 'cover', 
                                                    objectPosition: 'center',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    display: 'block'
                                                }} 
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                style={{
                                                    background: 'rgba(255, 107, 53, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '6px 12px',
                                                    marginRight: '8px',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => {
                                                    const imgSrc = formData.coverImage.startsWith('data:') ? formData.coverImage : `data:image/jpeg;base64,${formData.coverImage}`;
                                                    openBannerResizer(imgSrc, (processedImage) => {
                                                        uploadProcessedImage(processedImage, 'coverImage');
                                                    });
                                                }}
                                                title="Resize & Crop Image"
                                            >
                                                <Edit3 size={12} className="me-1" /> Resize & Crop
                                            </button>
                                        </div>
                                        <p className="text-success mt-2">✓ Background Banner uploaded</p>
                                    </div>
                                )}
                                <small className="text-muted">Widescreen banner for your company profile (1200x675px, JPG, PNG, max 5MB)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/*Basic Information*/}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><Briefcase size={18} className="me-2" /> Basic Informations</h4>
                    </div>

                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label>Employer Category</label>
                                    <div className="form-control" style={{backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#495057'}}>
                                        {formData.employerCategory ? 
                                            (formData.employerCategory === 'company' ? 'Company' : 'Consultancy') 
                                            : 'Not specified'
                                        }
                                    </div>
                                    <small className="text-muted">This field cannot be edited after registration</small>
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field">
                                        <Building size={16} className="me-2" /> 
                                        Company Name
                                        {gstAutoFilled && <i className="fas fa-robot text-success ms-2" title="Auto-filled from GST"></i>}
                                    </label>
                                    <input
                                        className={`form-control ${errors.companyName ? 'is-invalid' : ''} ${gstAutoFilled ? 'border-success' : ''}`}
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        placeholder="Enter company name"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="companyName" />
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Phone size={16} className="me-2" /> Phone</label>
                                    <div style={{position: 'relative'}}>
                                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', zIndex: 10}}>
                                            <CountryCodeSelector
                                                value={formData.phoneCountryCode}
                                                onChange={(value) => handleInputChange('phoneCountryCode', value)}
                                            />
                                        </div>
                                        <input
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="9087654321"
                                            style={{ paddingLeft: '130px', height: '50px' }}
                                        />
                                    </div>
                                    <ErrorDisplay errors={errors} fieldName="phone" />
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Mail size={16} className="me-2" /> Email Address</label>
                                    <input
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="company@example.com"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="email" />
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><Globe size={16} className="me-2" /> Website</label>
                                    <input
                                        className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <ErrorDisplay errors={errors} fieldName="website" />
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label><Calendar size={16} className="me-2" /> Est. Since</label>
                                    <input
                                        className={`form-control ${errors.establishedSince ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.establishedSince}
                                        onChange={(e) => handleInputChange('establishedSince', e.target.value)}
                                        placeholder="2020"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="establishedSince" />
                                </div>
                            </div>

                            <div className="col-xl-4 col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><UsersIcon size={16} className="me-2" /> Team Size</label>
                                    <select
                                        className={`form-control ${errors.teamSize ? 'is-invalid' : ''}`}
                                        value={formData.teamSize}
                                        onChange={(e) => handleInputChange('teamSize', e.target.value)}
                                    >
                                        <option value="">Select team size</option>
                                        <option value="1-10">1-10 (Startup)</option>
                                        <option value="11-50">11-50 (Small)</option>
                                        <option value="51-200">51-200 (Medium)</option>
                                        <option value="201-500">201-500 (Large)</option>
                                        <option value="501-1000">501-1000 (Enterprise)</option>
                                        <option value="1000+">1000+ (Enterprise)</option>
                                        <option value="custom">Other (Enter manually)</option>
                                    </select>
                                    <ErrorDisplay errors={errors} fieldName="teamSize" />
                                    {formData.teamSize === 'custom' && (
                                        <input
                                            className="form-control mt-2"
                                            type="text"
                                            value={formData.customTeamSize || ''}
                                            onChange={(e) => handleInputChange('customTeamSize', e.target.value)}
                                            placeholder="Enter custom team size (e.g., 25, 150, 2500+)"
                                        />
                                    )}
                                </div>
                            </div>



                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="required-field"><FileText size={16} className="me-2" /> About Company</label>
                                    <RichTextEditor
                                        value={formData.description || 'We are a dynamic company focused on delivering excellent services and creating opportunities for talented professionals.'}
                                        onChange={(value) => handleInputChange('description', value)}
                                        placeholder="Enter company description..."
                                        className={`form-control-editor ${errors.description ? 'is-invalid' : ''}`}
                                    />
                                    <ErrorDisplay errors={errors} fieldName="description" />
                                    <small className="text-muted mt-1">Use the toolbar above to format your company description with bold, italic, lists, and alignment options.</small>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><MapPin size={16} className="me-2" /> Primary Office Location</label>
                                    <input
                                        className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.location || 'Bangalore, India'}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="e.g., Bangalore, India"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="location" />
                                    <small className="text-muted">A default location has been provided. You can edit it as needed.</small>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Google Maps Embed Code</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={formData.googleMapsEmbed || ''}
                                        onChange={(e) => handleInputChange('googleMapsEmbed', e.target.value)}
                                        placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                                    />
                                    <small className="text-muted mt-1">Paste Google Maps embed iframe code here</small>
                                    
                                    {formData.googleMapsEmbed && (() => {
                                        const srcMatch = formData.googleMapsEmbed.match(/src=["']([^"']+)["']/);
                                        if (srcMatch) {
                                            return (
                                                <div className="mt-3">
                                                    <iframe
                                                        src={srcMatch[1]}
                                                        width="100%"
                                                        height="200"
                                                        style={{border: '1px solid #ddd', borderRadius: '4px'}}
                                                        allowFullScreen=""
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        title="Company Location Preview"
                                                    ></iframe>
                                                    <p className="text-success mt-2">✓ Map preview loaded successfully</p>
                                                </div>
                                            );
                                        }
                                        return <p className="text-warning mt-2">Invalid embed code format</p>;
                                    })()}
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="form-group">
                                    <label><Briefcase size={16} className="me-2" /> Why join us</label>
                                    <RichTextEditor
                                        value={formData.whyJoinUs}
                                        onChange={(value) => handleInputChange('whyJoinUs', value)}
                                        placeholder="Highlight the benefits of working with your company..."
                                        className="form-control-editor"
                                    />
                                    <small className="text-muted mt-1" style={{color: '#000000 !important'}}>Use the toolbar above to format your text with bold, italic, lists, and alignment options.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Details */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><IdCard size={18} className="me-2" /> Company Details</h4>
                    </div>

                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">


                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field">
                                        <MapPin size={16} className="me-2" /> 
                                        Corporate Office Address
                                        {gstAutoFilled && <i className="fas fa-robot text-success ms-2" title="Auto-filled from GST"></i>}
                                    </label>
                                    <input
                                        className={`form-control ${errors.corporateAddress ? 'is-invalid' : ''} ${gstAutoFilled ? 'border-success' : ''}`}
                                        type="text"
                                        value={formData.corporateAddress}
                                        onChange={(e) => handleInputChange('corporateAddress', e.target.value)}
                                        placeholder="Enter corporate address"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="corporateAddress" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><MapPin size={16} className="me-2" /> Branch Office Locations (if any)</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.branchLocations}
                                        onChange={(e) => handleInputChange('branchLocations', e.target.value)}
                                        placeholder="Enter branch locations"
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><MapPin size={16} className="me-2" /> Pincode</label>
                                    <input
                                        className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                                        placeholder="Enter 6-digit pincode"
                                        maxLength="6"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="pincode" />
                                    {fetchingCity && <small className="text-info">Fetching city...</small>}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><MapPin size={16} className="me-2" /> City</label>
                                    <input
                                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        placeholder="Enter city or auto-fill from pincode"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="city" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><MapPin size={16} className="me-2" /> State</label>
                                    <select 
                                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                    >
                                        <option value="">Select State</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                        <option value="Assam">Assam</option>
                                        <option value="Bihar">Bihar</option>
                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                        <option value="Goa">Goa</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Haryana">Haryana</option>
                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                        <option value="Jharkhand">Jharkhand</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Manipur">Manipur</option>
                                        <option value="Meghalaya">Meghalaya</option>
                                        <option value="Mizoram">Mizoram</option>
                                        <option value="Nagaland">Nagaland</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Sikkim">Sikkim</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Tripura">Tripura</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Uttarakhand">Uttarakhand</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                        <option value="Chandigarh">Chandigarh</option>
                                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                        <option value="Ladakh">Ladakh</option>
                                        <option value="Lakshadweep">Lakshadweep</option>
                                        <option value="Puducherry">Puducherry</option>
                                    </select>
                                    <ErrorDisplay errors={errors} fieldName="state" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Mail size={16} className="me-2" /> Official Email ID</label>
                                    <input
                                        className={`form-control ${errors.officialEmail ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.officialEmail}
                                        onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                                        placeholder="email@company.com"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="officialEmail" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Phone size={16} className="me-2" /> Official Mobile Number</label>
                                    <div style={{position: 'relative'}}>
                                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', zIndex: 10}}>
                                            <CountryCodeSelector
                                                value={formData.officialMobileCountryCode}
                                                onChange={(value) => handleInputChange('officialMobileCountryCode', value)}
                                            />
                                        </div>
                                        <input
                                            className={`form-control ${errors.officialMobile ? 'is-invalid' : ''}`}
                                            type="text"
                                            value={formData.officialMobile}
                                            onChange={(e) => handleInputChange('officialMobile', e.target.value)}
                                            placeholder="9876543210"
                                            style={{ paddingLeft: '130px', height: '50px' }}
                                        />
                                    </div>
                                    <ErrorDisplay errors={errors} fieldName="officialMobile" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Briefcase size={16} className="me-2" /> Type of Company / Business</label>
                                    <select 
                                        className={`form-control ${errors.companyType ? 'is-invalid' : ''}`}
                                        value={formData.companyType}
                                        onChange={(e) => handleInputChange('companyType', e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Private Limited">Private Limited</option>
                                        <option value="LLP">LLP</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Proprietorship">Proprietorship</option>
                                        <option value="Government">Government</option>
                                        <option value="NGO">NGO</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <ErrorDisplay errors={errors} fieldName="companyType" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label><Hash size={16} className="me-2" /> Corporate Identification Number (CIN) <span className="text-muted">(Optional)</span></label>
                                    <input
                                        className={`form-control ${errors.cin ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.cin}
                                        onChange={(e) => handleInputChange('cin', e.target.value)}
                                        placeholder="U12345AB1234ABC123456"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="cin" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Hash size={16} className="me-2" /> GST Number</label>
                                    <div className="position-relative">
                                        <input
                                            className={`form-control ${errors.gstNumber ? 'is-invalid' : ''} ${gstAutoFilled ? 'border-success' : ''}`}
                                            type="text"
                                            value={formData.gstNumber}
                                            onChange={(e) => {
                                                handleInputChange('gstNumber', e.target.value);
                                                if (gstAutoFilled && e.target.value !== formData.gstNumber) {
                                                    setGstAutoFilled(false);
                                                }
                                            }}
                                            placeholder="12ABCDE1234F1Z5"
                                            maxLength="15"
                                        />
                                        {fetchingGST && (
                                            <div className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        )}
                                        {gstAutoFilled && !fetchingGST && (
                                            <div className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                                                <i className="fas fa-check-circle text-success" title="Information auto-filled from GST database"></i>
                                            </div>
                                        )}
                                    </div>
                                    <ErrorDisplay errors={errors} fieldName="gstNumber" />
                                    {fetchingGST && <small className="text-info">Fetching company information from GST database...</small>}
                                    {gstAutoFilled && !fetchingGST && (
                                        <small className="text-success">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Company information auto-filled from GST database. Please verify and update if needed.
                                        </small>
                                    )}
                                    <small className="text-muted d-block mt-1">
                                        Enter your 15-digit GST number to auto-fill company information
                                    </small>
                                    {formData.gstNumber && formData.gstNumber.length === 15 && !gstAutoFilled && (
                                        <div className="mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => fetchGSTInfo(formData.gstNumber)}
                                                disabled={fetchingGST}
                                            >
                                                {fetchingGST ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Fetching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-search me-2"></i>
                                                        Fetch Company Info
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Briefcase size={16} className="me-2" /> Industry Sector</label>
                                    <select 
                                        className={`form-control ${errors.industrySector ? 'is-invalid' : ''}`}
                                        value={formData.industrySector}
                                        onChange={(e) => handleInputChange('industrySector', e.target.value)}
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="it">IT</option>
                                        <option value="non-it">Non-IT</option>
                                        <option value="education">Education</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <ErrorDisplay errors={errors} fieldName="industrySector" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Hash size={16} className="me-2" /> Company PAN Card Number</label>
                                    <input
                                        className={`form-control ${errors.panNumber ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.panNumber}
                                        onChange={(e) => handleInputChange('panNumber', e.target.value)}
                                        placeholder="ABCDE1234F"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="panNumber" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Upload size={16} className="me-2" /> Upload PAN Card Image</label>
                                    <input
                                        className={`form-control ${errors.panCardImage ? 'is-invalid' : ''}`}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'panCardImage')}
                                    />
                                    {formData.panCardImage ? (
                                        <p className="text-success mt-1">✓ PAN Card uploaded</p>
                                    ) : (
                                        <p className="text-muted mt-1">No file chosen</p>
                                    )}
                                    <ErrorDisplay errors={errors} fieldName="panCardImage" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Upload size={16} className="me-2" /> Upload CIN Document</label>
                                    <input
                                        className={`form-control ${errors.cinImage ? 'is-invalid' : ''}`}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'cinImage')}
                                    />
                                    {formData.cinImage ? (
                                        <p className="text-success mt-1">✓ CIN Document uploaded</p>
                                    ) : (
                                        <p className="text-muted mt-1">No file chosen</p>
                                    )}
                                    <ErrorDisplay errors={errors} fieldName="cinImage" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Upload size={16} className="me-2" /> Upload GST Certificate</label>
                                    <input
                                        className={`form-control ${errors.gstImage ? 'is-invalid' : ''}`}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'gstImage')}
                                    />
                                    {formData.gstImage ? (
                                        <p className="text-success mt-1">✓ GST Certificate uploaded</p>
                                    ) : (
                                        <p className="text-muted mt-1">No file chosen</p>
                                    )}
                                    <ErrorDisplay errors={errors} fieldName="gstImage" />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Upload size={16} className="me-2" /> Certificate of Incorporation (Issued by RoC)</label>
                                    <input
                                        className={`form-control ${errors.certificateOfIncorporation ? 'is-invalid' : ''}`}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleDocumentUpload(e, 'certificateOfIncorporation')}
                                    />
                                    {formData.certificateOfIncorporation ? (
                                        <p className="text-success mt-1">✓ Certificate of Incorporation uploaded</p>
                                    ) : (
                                        <p className="text-muted mt-1">No file chosen</p>
                                    )}
                                    <ErrorDisplay errors={errors} fieldName="certificateOfIncorporation" />
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="mb-3">
                                        <FileText size={16} className="me-2" /> 
                                        {formData.employerCategory === 'consultancy' 
                                            ? 'List of hiring company names' 
                                            : 'Authorization Letters (if registering on behalf of someone else)'
                                        }
                                    </label>
                                    
                                    <div className="row">
                                    {/* Dynamic Authorization Letter Sections */}
                                    {authSections.map((section, index) => (
                                        <div key={section.id} className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <label>
                                                        <Upload size={16} className="me-2" /> 
                                                        {formData.employerCategory === 'consultancy' 
                                                            ? `Hiring Company #${index + 1}` 
                                                            : `Authorization Letter #${index + 1}`
                                                        }
                                                    </label>
                                                    {authSections.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeAuthSection(section.id)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {formData.employerCategory === 'consultancy' && (
                                                    <div className="mb-2">
                                                        <label className="required-field"><Building size={14} className="me-1" /> Hiring Company Name</label>
                                                        <input
                                                            className={`form-control ${!section.companyName?.trim() ? 'is-invalid' : ''}`}
                                                            type="text"
                                                            value={section.companyName}
                                                            onChange={(e) => handleAuthSectionCompanyNameChange(section.id, e.target.value)}
                                                            placeholder="Enter hiring company name"
                                                            required
                                                        />
                                                        {!section.companyName?.trim() && (
                                                            <div className="invalid-feedback">
                                                                Hiring company name is required
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <input
                                                    className="form-control"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={(e) => handleAuthorizationLetterUpload(e, section.id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    </div>
                                    
                                    {formData.employerCategory === 'consultancy' && (
                                        <div className="mt-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm"
                                                style={{backgroundColor: '#ffb366', color: 'white', border: 'none'}}
                                                onClick={addNewAuthSection}
                                            >
                                                <i className="fas fa-plus me-1"></i> 
                                                {formData.employerCategory === 'consultancy' 
                                                    ? 'Add New Hiring Company' 
                                                    : 'Add New Authorization Letter'
                                                }
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Display uploaded authorization letters */}
                                    {formData.authorizationLetters && formData.authorizationLetters.length > 0 && (
                                        <div className="uploaded-documents mt-4">
                                            <h6 className="text-success">
                                                <i className="fas fa-check-circle me-2"></i>
                                                {formData.employerCategory === 'consultancy' 
                                                    ? 'Uploaded Hiring Company Documents' 
                                                    : 'Uploaded Authorization Letters'
                                                }
                                            </h6>
                                            <div className="row">
                                                {formData.authorizationLetters.map((doc, index) => (
                                                    <div key={doc._id || index} className="col-md-6 mb-2">
                                                        <div className="document-card p-3 border rounded shadow-sm" style={{backgroundColor: '#fff'}}>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <i className="fas fa-file-alt text-primary me-2"></i>
                                                                        <span className="fw-bold">{doc.fileName}</span>
                                                                    </div>
                                                                    {doc.companyName && (
                                                                        <div className="mb-1">
                                                                            <small className="text-info">
                                                                                <i className="fas fa-building me-1"></i>
                                                                                {doc.companyName}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                    <small className="text-muted">
                                                                        <i className="fas fa-calendar me-1"></i>
                                                                        {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                                                                    </small>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleDeleteAuthorizationLetter(doc._id)}
                                                                    title="Delete document"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Primary Contact Person */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><UserIcon size={18} className="me-2" /> Primary Contact Person</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><UserIcon size={16} className="me-2" /> First Name</label>
                                    <input
                                        className={`form-control ${errors.contactFullName ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactFullName}
                                        onChange={(e) => handleInputChange('contactFullName', e.target.value)}
                                        placeholder="Enter Full Name"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="contactFullName" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label><UserIcon size={16} className="me-2" /> Middle Name</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.contactMiddleName}
                                        onChange={(e) => handleInputChange('contactMiddleName', e.target.value)}
                                        placeholder="Enter Middle Name (Optional)"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><UserIcon size={16} className="me-2" /> Last Name</label>
                                    <input
                                        className={`form-control ${errors.contactLastName ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactLastName}
                                        onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                                        placeholder="Enter Last Name"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="contactLastName" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Briefcase size={16} className="me-2" /> Designation</label>
                                    <input
                                        className={`form-control ${errors.contactDesignation ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.contactDesignation}
                                        onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                                        placeholder="e.g., HR Manager, Recruitment Lead, Founder"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="contactDesignation" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Mail size={16} className="me-2" /> Official Email ID</label>
                                    <input
                                        className={`form-control ${errors.contactOfficialEmail ? 'is-invalid' : ''}`}
                                        type="email"
                                        value={formData.contactOfficialEmail}
                                        onChange={(e) => handleInputChange('contactOfficialEmail', e.target.value)}
                                        placeholder="Enter official email"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="contactOfficialEmail" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group" style={{overflow: 'visible'}}>
                                    <label className="required-field"><Phone size={16} className="me-2" /> Mobile Number</label>
                                    <div style={{position: 'relative'}}>
                                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', zIndex: 10}}>
                                            <CountryCodeSelector
                                                value={formData.contactMobileCountryCode}
                                                onChange={(value) => handleInputChange('contactMobileCountryCode', value)}
                                            />
                                        </div>
                                        <input
                                            className={`form-control ${errors.contactMobile ? 'is-invalid' : ''}`}
                                            type="tel"
                                            value={formData.contactMobile}
                                            onChange={(e) => handleInputChange('contactMobile', e.target.value)}
                                            placeholder="9876543210"
                                            style={{ paddingLeft: '130px', height: '50px' }}
                                        />
                                    </div>
                                    <ErrorDisplay errors={errors} fieldName="contactMobile" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><IdCard size={16} className="me-2" /> Company ID Card Picture</label>
                                    <input
                                        className={`form-control ${errors.companyIdCardPicture ? 'is-invalid' : ''}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleDocumentUpload(e, 'companyIdCardPicture')}
                                    />
                                    {formData.companyIdCardPicture && (
                                        <div className="mt-2">
                                            <img 
                                                src={formData.companyIdCardPicture.startsWith('data:') ? formData.companyIdCardPicture : `data:image/jpeg;base64,${formData.companyIdCardPicture}`} 
                                                alt="Company ID Card" 
                                                style={{
                                                    width: '200px', 
                                                    height: '120px', 
                                                    objectFit: 'cover', 
                                                    objectPosition: 'center',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px'
                                                }} 
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <p className="text-success mt-1">✓ Company ID Card uploaded</p>
                                        </div>
                                    )}
                                    <ErrorDisplay errors={errors} fieldName="companyIdCardPicture" />
                                    <p className="text-muted mt-1">Upload any company identification document (Max 5MB)</p>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group" style={{overflow: 'visible'}}>
                                    <label><Phone size={16} className="me-2" /> Alternate Contact (Optional)</label>
                                    <div style={{position: 'relative'}}>
                                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', zIndex: 5}}>
                                            <CountryCodeSelector
                                                value={formData.alternateContactCountryCode}
                                                onChange={(value) => handleInputChange('alternateContactCountryCode', value)}
                                            />
                                        </div>
                                        <input
                                            className={`form-control ${errors.alternateContact ? 'is-invalid' : ''}`}
                                            type="tel"
                                            value={formData.alternateContact}
                                            onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                                            placeholder="9876543210"
                                            style={{ paddingLeft: '130px', height: '50px' }}
                                        />
                                    </div>
                                    <ErrorDisplay errors={errors} fieldName="alternateContact" />
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6">
                                <div className="form-group">
                                    <label className="required-field"><Hash size={16} className="me-2" /> Employer Code</label>
                                    <input
                                        className={`form-control ${errors.employerCode ? 'is-invalid' : ''}`}
                                        type="text"
                                        value={formData.employerCode}
                                        onChange={(e) => handleInputChange('employerCode', e.target.value)}
                                        placeholder="Enter employer code"
                                    />
                                    <ErrorDisplay errors={errors} fieldName="employerCode" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><Images size={18} className="me-2" /> Company Gallery</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label><Upload size={16} className="me-2" /> Upload Gallery Images (Minimum 5 required, Max 10 images)</label>
                                    <div className="upload-gallery-container" style={{border: '2px dashed #ddd', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa'}}>
                                        <input
                                            className="form-control"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/svg+xml,.jpg,.jpeg,.png,.svg"
                                            multiple
                                            onChange={handleGalleryUpload}
                                            disabled={formData.gallery?.length >= 10}
                                            style={{marginBottom: '10px'}}
                                        />
                                        <div className="upload-info">
                                            <Images size={24} className="text-muted mb-2" />
                                            <p className="text-muted mb-1">
                                                <strong>Select multiple images at once</strong>
                                            </p>
                                            <p className="text-muted small">
                                                Upload up to {10 - (formData.gallery?.length || 0)} more images (JPG, PNG, SVG). Max 10MB per image.
                                            </p>
                                            <p className="text-info small">
                                                <strong>Tip:</strong> Large files are uploaded in batches of 3 for better reliability.
                                            </p>
                                            {formData.gallery?.length >= 10 && (
                                                <p className="text-warning small">
                                                    Maximum 10 images reached. Delete some images to upload more.
                                                </p>
                                            )}
                                            {(formData.gallery?.length || 0) < 5 && (
                                                <p className="text-danger small">
                                                    <strong>Minimum 5 images required.</strong> Currently uploaded: {formData.gallery?.length || 0}/5
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            

                            
                            {formData.gallery && formData.gallery.length > 0 && (
                                <div className="col-md-12">
                                    <div className="gallery-preview mt-3">
                                        <h6 className={`mb-3 ${(formData.gallery?.length || 0) >= 5 ? 'text-success' : 'text-danger'}`}>
                                            <i className="fas fa-images me-2"></i>
                                            Gallery Images ({formData.gallery.length}/10)
                                            {(formData.gallery?.length || 0) < 5 && (
                                                <span className="text-danger ms-2">
                                                    <i className="fas fa-exclamation-circle"></i> Need {5 - (formData.gallery?.length || 0)} more
                                                </span>
                                            )}
                                            {(formData.gallery?.length || 0) >= 5 && (
                                                <span className="text-success ms-2">
                                                    <i className="fas fa-check-circle"></i> Minimum requirement met
                                                </span>
                                            )}
                                        </h6>
                                        <div className="d-flex flex-wrap gap-3">
                                            {formData.gallery.map((image, index) => (
                                                <div key={image._id || index} className="gallery-item position-relative" style={{width: '150px', height: '150px', position: 'relative'}}>
                                                    <img 
                                                        src={image.url} 
                                                        alt={`Gallery ${index + 1}`}
                                                        className="img-fluid rounded"
                                                        style={{width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ddd'}}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger btn-sm position-absolute gallery-delete-btn"
                                                        style={{
                                                            top: '5px', 
                                                            right: '5px', 
                                                            width: '30px', 
                                                            height: '30px', 
                                                            padding: '0', 
                                                            fontSize: '12px', 
                                                            border: '2px solid #ffffff', 
                                                            borderRadius: '50%', 
                                                            backgroundColor: '#dc3545', 
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            opacity: '1', 
                                                            visibility: 'visible',
                                                            zIndex: '999',
                                                            cursor: 'pointer',
                                                            color: '#ffffff'
                                                        }}
                                                        onClick={() => handleDeleteGalleryImage(image._id || index)}
                                                        title="Delete image"
                                                    >
                                                        <i className="fas fa-times" style={{color: '#ffffff', fontSize: '12px'}}></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-lg-12 col-md-12">
                                <div className="text-left">
                                    <button type="submit" className="site-button" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            </div>

            <TermsModal 
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                    saveProfile();
                }}
                role="employerProfile"
            />
            
            {showDeleteDialog && (
                <ConfirmationDialog
                    message="Delete this image? Click 'Yes' to confirm"
                    onConfirm={confirmDeleteImage}
                    onCancel={cancelDeleteImage}
                    type="warning"
                />
            )}
            
            <ImageResizer
                src={currentImage}
                isOpen={isResizerOpen}
                onClose={closeResizer}
                onSave={handleResizerSave}
                aspectRatio={resizeConfig.aspectRatio}
                maxWidth={resizeConfig.maxWidth}
                maxHeight={resizeConfig.maxHeight}
                quality={resizeConfig.quality}
            />
        </div>
    );
}

export default EmpCompanyProfilePage;
