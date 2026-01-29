import { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../utils/api';
import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../../utils/popupNotification';
import SearchableSelect from '../../../../../components/SearchableSelect';
function SectionCanEducation({ profile, onUpdate }) {
    const [selectedEducationLevel, setSelectedEducationLevel] = useState('');
    const [educationEntries, setEducationEntries] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Additional state variables for the table-based education management
    const [additionalRows, setAdditionalRows] = useState([]);
    const [additionalEditMode, setAdditionalEditMode] = useState([]);
    const [editMode, setEditMode] = useState({ tenth: false, diploma: false, degree: false });
    const [educationData, setEducationData] = useState({
        tenth: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
        diploma: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
        degree: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null }
    });
    const [additionalErrors, setAdditionalErrors] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const indianStates = [
        { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
        { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
        { value: 'Assam', label: 'Assam' },
        { value: 'Bihar', label: 'Bihar' },
        { value: 'Chhattisgarh', label: 'Chhattisgarh' },
        { value: 'Goa', label: 'Goa' },
        { value: 'Gujarat', label: 'Gujarat' },
        { value: 'Haryana', label: 'Haryana' },
        { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
        { value: 'Jharkhand', label: 'Jharkhand' },
        { value: 'Karnataka', label: 'Karnataka' },
        { value: 'Kerala', label: 'Kerala' },
        { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
        { value: 'Maharashtra', label: 'Maharashtra' },
        { value: 'Manipur', label: 'Manipur' },
        { value: 'Meghalaya', label: 'Meghalaya' },
        { value: 'Mizoram', label: 'Mizoram' },
        { value: 'Nagaland', label: 'Nagaland' },
        { value: 'Odisha', label: 'Odisha' },
        { value: 'Punjab', label: 'Punjab' },
        { value: 'Rajasthan', label: 'Rajasthan' },
        { value: 'Sikkim', label: 'Sikkim' },
        { value: 'Tamil Nadu', label: 'Tamil Nadu' },
        { value: 'Telangana', label: 'Telangana' },
        { value: 'Tripura', label: 'Tripura' },
        { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
        { value: 'Uttarakhand', label: 'Uttarakhand' },
        { value: 'West Bengal', label: 'West Bengal' },
        { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
        { value: 'Chandigarh', label: 'Chandigarh' },
        { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
        { value: 'Delhi', label: 'Delhi' },
        { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
        { value: 'Ladakh', label: 'Ladakh' },
        { value: 'Lakshadweep', label: 'Lakshadweep' },
        { value: 'Puducherry', label: 'Puducherry' }
    ];

    const educationLevels = [
        { value: '10th_pass', label: '10th Pass / SSLC' },
        { value: '12th_pass', label: '12th Pass / PUC / Higher Secondary' },
        { value: 'diploma_general', label: 'Diploma (General)' },
        { value: 'iti_trade', label: 'ITI / Trade Certification' },
        { value: 'polytechnic_diploma', label: 'Polytechnic Diploma' },
        { value: 'vocational_training', label: 'Vocational Training' },
        { value: 'certification_courses', label: 'Certification Courses (Technical/Non-Technical)' },
        { value: 'apprenticeship', label: 'Apprenticeship Programs' },
        { value: 'be', label: 'B.E. (Bachelor of Engineering)' },
        { value: 'btech', label: 'B.Tech (Bachelor of Technology)' },
        { value: 'bsc', label: 'B.Sc (Bachelor of Science)' },
        { value: 'bca', label: 'BCA (Bachelor of Computer Applications)' },
        { value: 'bba', label: 'BBA (Bachelor of Business Administration)' },
        { value: 'bcom', label: 'B.Com (Bachelor of Commerce)' },
        { value: 'ba', label: 'BA (Bachelor of Arts)' },
        { value: 'bba_llb', label: 'BBA-LLB' },
        { value: 'bsc_nursing', label: 'B.Sc Nursing' },
        { value: 'bpharm', label: 'Bachelor of Pharmacy (B.Pharm)' },
        { value: 'bds', label: 'BDS (Dentistry)' },
        { value: 'mbbs', label: 'MBBS (Medicine)' },
        { value: 'bams', label: 'BAMS (Ayurvedic Medicine)' },
        { value: 'bhms', label: 'BHMS (Homeopathy)' },
        { value: 'bums', label: 'BUMS (Unani Medicine)' },
        { value: 'bpt', label: 'BPT (Physiotherapy)' },
        { value: 'bot', label: 'BOT (Occupational Therapy)' },
        { value: 'bvsc', label: 'B.V.Sc (Veterinary Science)' },
        { value: 'barch', label: 'B.Arch (Architecture)' },
        { value: 'bfa', label: 'BFA (Fine Arts)' },
        { value: 'bsw', label: 'BSW (Social Work)' },
        { value: 'bhm', label: 'BHM (Hotel Management)' },
        { value: 'bttm', label: 'BTTM (Travel & Tourism)' },
        { value: 'bba_it', label: 'BBA (IT Management)' },
        { value: 'bsc_it', label: 'B.Sc (IT)' },
        { value: 'bsc_cs', label: 'B.Sc (Computer Science)' },
        { value: 'bsc_data_science', label: 'B.Sc (Data Science / AI / ML)' },
        { value: 'btech_ai', label: 'B.Tech (AI / Data Science / ML / Cybersecurity)' },
        { value: 'be_specializations', label: 'B.E (Specializations: CSE, ECE, EEE, Mech, Civil, etc.)' },
        { value: 'bca_cloud', label: 'BCA (Cloud Computing / Cybersecurity tracks)' },
        { value: 'bca_data_analytics', label: 'BCA (Data Analytics / AI tracks)' },
        { value: 'bcom_finance', label: 'B.Com (Finance)' },
        { value: 'bcom_banking', label: 'B.Com (Banking & Insurance)' },
        { value: 'bba_finance', label: 'BBA (Finance)' },
        { value: 'bba_marketing', label: 'BBA (Marketing)' },
        { value: 'bba_hr', label: 'BBA (HR)' },
        { value: 'bba_hospital', label: 'BBA (Hospital Administration)' },
        { value: 'bba_retail', label: 'BBA (Retail Management)' },
        { value: 'bba_entrepreneurship', label: 'BBA (Entrepreneurship)' },
        { value: 'bsc_biology', label: 'B.Sc (Biology)' },
        { value: 'bsc_biotech', label: 'B.Sc (Biotechnology)' },
        { value: 'bsc_microbiology', label: 'B.Sc (Microbiology)' },
        { value: 'bsc_genetics', label: 'B.Sc (Genetics)' },
        { value: 'bsc_biochemistry', label: 'B.Sc (Biochemistry)' },
        { value: 'clinical_research', label: 'Clinical Research Certification' },
        { value: 'paramedical', label: 'Paramedical Courses' },
        { value: 'llb', label: 'LLB (Bachelor of Law)' },
        { value: 'aviation', label: 'Aviation Courses' },
        { value: 'me', label: 'M.E. (Master of Engineering)' },
        { value: 'mtech', label: 'M.Tech (Master of Technology)' },
        { value: 'mba', label: 'MBA (Master of Business Administration)' },
        { value: 'mba_finance', label: 'MBA (Finance)' },
        { value: 'mba_marketing', label: 'MBA (Marketing)' },
        { value: 'mba_hr', label: 'MBA (HR)' },
        { value: 'mba_operations', label: 'MBA (Operations)' },
        { value: 'mba_systems', label: 'MBA (Systems / IT)' },
        { value: 'msc', label: 'M.Sc (Master of Science)' },
        { value: 'mca', label: 'MCA (Master of Computer Applications)' },
        { value: 'mcom', label: 'M.Com (Master of Commerce)' },
        { value: 'ma', label: 'MA (Master of Arts)' },
        { value: 'mph', label: 'MPH (Public Health)' },
        { value: 'ms', label: 'MS (Master of Surgery)' },
        { value: 'md', label: 'MD (Doctor of Medicine)' },
        { value: 'mds', label: 'MDS (Master of Dental Surgery)' },
        { value: 'mpt', label: 'MPT (Master of Physiotherapy)' },
        { value: 'phd', label: 'PhD (Doctorate)' },
        { value: 'doctoral_research', label: 'Doctoral Research Fellow' },
        { value: 'post_doctoral', label: 'Post-Doctoral Programs' }
    ];

    const [formData, setFormData] = useState({
        educationLevel: '',
        schoolCollegeName: '',
        boardUniversityName: '',
        registrationNumber: '',
        state: '',
        result: '',
        percentage: '',
        cgpa: '',
        securedMarks: '',
        maximumMarks: '',
        courseName: '',
        yearOfPassing: '',
        specialization: '',
        document: null,
        documentName: '',
        documentBase64: null
    });

    useEffect(() => {
        if (profile && profile.education) {
            const entries = profile.education.map((edu, index) => {
                return {
                    id: `edu_${index}_${Date.now()}`,
                    educationLevel: edu.educationLevel || 'degree',
                    schoolCollegeName: edu.degreeName || '',
                    boardUniversityName: edu.collegeName || '',
                    registrationNumber: edu.registrationNumber || '',
                    state: edu.state || '',
                    result: edu.grade || (edu.percentage ? 'Passed' : ''),
                    percentage: edu.percentage || '',
                    cgpa: edu.cgpa || '',
                    securedMarks: '',
                    maximumMarks: '',
                    courseName: edu.specialization || '',
                    yearOfPassing: edu.passYear || '',
                    specialization: edu.specialization || '',
                    documentBase64: edu.marksheet || null,
                    documentName: edu.marksheet ? 'Uploaded Document' : ''
                };
            });
            console.log('Loaded education entries from profile:', entries);
            setEducationEntries(entries);

            // Initialize educationData for table-based management
            const initialEducationData = {
                tenth: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
                diploma: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
                degree: { schoolName: '', location: '', passoutYear: '', registrationNumber: '', state: '', specialization: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null }
            };

            // Map profile education data to the table structure
            profile.education.forEach((edu, index) => {
                if (index === 0) {
                    initialEducationData.tenth = {
                        schoolName: edu.degreeName || '',
                        location: edu.collegeName || '',
                        passoutYear: edu.passYear || '',
                        registrationNumber: edu.registrationNumber || '',
                        state: edu.state || '',
                        specialization: edu.specialization || '',
                        percentage: edu.percentage || '',
                        cgpa: edu.cgpa || '',
                        grade: edu.grade || '',
                        marksheet: null,
                        marksheetBase64: edu.marksheet || null
                    };
                } else if (index === 1) {
                    initialEducationData.diploma = {
                        schoolName: edu.degreeName || '',
                        location: edu.collegeName || '',
                        passoutYear: edu.passYear || '',
                        registrationNumber: edu.registrationNumber || '',
                        state: edu.state || '',
                        specialization: edu.specialization || '',
                        percentage: edu.percentage || '',
                        cgpa: edu.cgpa || '',
                        grade: edu.grade || '',
                        marksheet: null,
                        marksheetBase64: edu.marksheet || null
                    };
                } else if (index === 2) {
                    initialEducationData.degree = {
                        schoolName: edu.degreeName || '',
                        location: edu.collegeName || '',
                        passoutYear: edu.passYear || '',
                        registrationNumber: edu.registrationNumber || '',
                        state: edu.state || '',
                        specialization: edu.specialization || '',
                        percentage: edu.percentage || '',
                        cgpa: edu.cgpa || '',
                        grade: edu.grade || '',
                        marksheet: null,
                        marksheetBase64: edu.marksheet || null
                    };
                } else {
                    // Additional rows beyond the main three
                    const additionalRow = {
                        id: Date.now() + index,
                        educationType: 'Degree',
                        schoolName: edu.degreeName || '',
                        location: edu.collegeName || '',
                        passoutYear: edu.passYear || '',
                        registrationNumber: edu.registrationNumber || '',
                        state: edu.state || '',
                        specialization: edu.specialization || '',
                        percentage: edu.percentage || '',
                        cgpa: edu.cgpa || '',
                        grade: edu.grade || '',
                        marksheet: null,
                        marksheetBase64: edu.marksheet || null
                    };
                    setAdditionalRows(prev => [...prev, additionalRow]);
                    setAdditionalEditMode(prev => [...prev, false]);
                }
            });

            setEducationData(initialEducationData);
        }
    }, [profile]);

    const convertPercentageToCGPA = (percentage) => {
        if (percentage >= 90) return 10;
        if (percentage >= 80) return 9;
        if (percentage >= 70) return 8;
        if (percentage >= 60) return 7;
        if (percentage >= 50) return 6;
        if (percentage >= 40) return 5;
        return 4;
    };

    const getResultFromPercentage = (percentage) => {
        return percentage >= 35 ? 'Passed' : 'Failed';
    };

    const handleEducationChange = (level, field, value, index = null) => {
        // Validate enrollment number for alphanumeric characters only
        if (field === 'registrationNumber') {
            const alphanumericRegex = /^[a-zA-Z0-9]*$/;
            if (value && !alphanumericRegex.test(value)) {
                if (index !== null) {
                    const updatedAdditionalErrors = [...additionalErrors];
                    if (!updatedAdditionalErrors[index]) {
                        updatedAdditionalErrors[index] = {};
                    }
                    updatedAdditionalErrors[index][field] = 'Only alphabets and numbers are allowed';
                    setAdditionalErrors(updatedAdditionalErrors);
                } else {
                    setErrors(prev => ({ ...prev, [`${level}_${field}`]: 'Only alphabets and numbers are allowed' }));
                }
                return;
            }
        }

        if (index !== null) {
            // Handle additional rows
            const updatedRows = [...additionalRows];
            updatedRows[index][field] = value;
            
            // Auto-calculate CGPA and result from percentage
            if (field === 'percentage' && value) {
                const percentageValue = parseFloat(value);
                if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                    const cgpa = convertPercentageToCGPA(percentageValue);
                    const result = getResultFromPercentage(percentageValue);
                    updatedRows[index].cgpa = cgpa.toString();
                    updatedRows[index].grade = result;
                }
            }
            
            setAdditionalRows(updatedRows);
        } else {
            // Handle main education levels
            const updatedData = { ...educationData };
            updatedData[level][field] = value;
            
            // Auto-calculate CGPA and result from percentage
            if (field === 'percentage' && value) {
                const percentageValue = parseFloat(value);
                if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                    const cgpa = convertPercentageToCGPA(percentageValue);
                    const result = getResultFromPercentage(percentageValue);
                    updatedData[level].cgpa = cgpa.toString();
                    updatedData[level].grade = result;
                }
            }
            
            setEducationData(updatedData);
        }
        
        // Clear validation errors for this field
        validateEducationField(level, field, value, index);
    };

    const handleEducationLevelChange = (level) => {
        setSelectedEducationLevel(level);
        setFormData(prev => ({
            ...prev,
            educationLevel: level,
            courseName: '',
            specialization: ''
        }));
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'document') {
            const file = files[0];
            if (file) {
                // Validate file type first
                if (file.type !== 'application/pdf') {
                    showError('Only PDF files are allowed');
                    e.target.value = ''; // Clear the input
                    return;
                }
                // Validate file size (50MB limit)
                if (file.size > 50 * 1024 * 1024) {
                    showError('File size must be less than 50MB');
                    e.target.value = ''; // Clear the input
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    document: file,
                    documentName: file.name
                }));

                // Upload document immediately
                uploadDocument(file);
            }
        } else {
            // Validate enrollment number for alphanumeric characters only
            if (name === 'registrationNumber') {
                const alphanumericRegex = /^[a-zA-Z0-9]*$/;
                if (value && !alphanumericRegex.test(value)) {
                    setErrors(prev => ({ ...prev, [name]: 'Only alphabets and numbers are allowed' }));
                    return;
                }
            }

            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // Auto-calculate CGPA and result from percentage
            if (name === 'percentage' && value) {
                const percentageValue = parseFloat(value);
                if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                    const cgpa = convertPercentageToCGPA(percentageValue);
                    const result = getResultFromPercentage(percentageValue);
                    setFormData(prev => ({
                        ...prev,
                        cgpa: cgpa.toString(),
                        result: result
                    }));
                }
            }

            // Clear error for this field
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Required fields for all levels with specific error messages
        const requiredFields = {
            schoolCollegeName: 'School/College Name is required',
            boardUniversityName: 'Board/University Name is required', 
            registrationNumber: 'Enrollment Number is required',
            state: 'State is required',
            result: 'Result is required',
            yearOfPassing: 'Year of Passing is required'
        };

        Object.entries(requiredFields).forEach(([field, errorMessage]) => {
            if (!formData[field] || !formData[field].trim()) {
                newErrors[field] = errorMessage;
                isValid = false;
            }
        });

        // Document validation
        if (!formData.document && !formData.documentBase64) {
            // Document is optional, no error
        }

        // Percentage or CGPA validation - at least one is required
        if (!formData.percentage && !formData.cgpa) {
            newErrors.percentage = 'Either Percentage or CGPA is required';
            newErrors.cgpa = 'Either Percentage or CGPA is required';
            isValid = false;
        }

        if (formData.percentage) {
            const percentage = parseFloat(formData.percentage);
            if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                newErrors.percentage = 'Percentage must be between 0 and 100';
                isValid = false;
            }
        }

        if (formData.cgpa) {
            const cgpa = parseFloat(formData.cgpa);
            if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
                newErrors.cgpa = 'CGPA must be between 0 and 10';
                isValid = false;
            }
        }

        // Course Name is required for all education levels except 10th/SSLC where it's now required
        if (selectedEducationLevel && (!formData.courseName || !formData.courseName.trim())) {
            newErrors.courseName = 'Course Name is required';
            isValid = false;
        }

        // Check for duplicate entries only when adding new entries (not when editing)
        if (!editingEntry) {
            const isDuplicate = educationEntries.some(entry =>
                entry.educationLevel === selectedEducationLevel
            );

            if (isDuplicate) {
                newErrors.educationLevel = 'This education level already exists';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return { isValid, errors: newErrors };
    };

    const uploadDocument = async (file) => {
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('marksheet', file);

            const token = localStorage.getItem('candidateToken');
            const response = await fetch('http://localhost:5000/api/candidate/upload-marksheet', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            if (response.ok) {
                const result = await response.json();
                setFormData(prev => ({
                    ...prev,
                    documentBase64: result.filePath
                }));
                showSuccess('Document uploaded successfully!');
            } else {
                showError('Failed to upload document');
            }
        } catch (error) {
            showError('Error uploading document');
        }
    };

    const handleAddEducation = () => {
        if (!selectedEducationLevel) {
            showError('Please select an education level first');
            return;
        }

        const validation = validateForm();
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).filter(e => e);
            if (errorMessages.length > 0) {
                showPopup(errorMessages.join(', '), 'error', 4000);
            } else {
                showError('Please fill in all required fields');
            }
            return;
        }

        const newEntry = {
            id: `edu_new_${Date.now()}`,
            ...formData
        };

        setEducationEntries(prev => [...prev, newEntry]);
        setHasUnsavedChanges(true);

        // Reset form
        setFormData({
            educationLevel: '',
            schoolCollegeName: '',
            boardUniversityName: '',
            registrationNumber: '',
            state: '',
            result: '',
            percentage: '',
            cgpa: '',
            securedMarks: '',
            maximumMarks: '',
            courseName: '',
            yearOfPassing: '',
            specialization: '',
            document: null,
            documentName: '',
            documentBase64: null
        });
        setSelectedEducationLevel('');
        setErrors({});

        showSuccess('Education entry added successfully! Please click "Save All Education Details" to save changes.');
    };

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
        setFormData({ ...entry });
        setSelectedEducationLevel(entry.educationLevel);
    };

    const handleUpdateEducation = () => {
        const validation = validateForm();
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).filter(e => e);
            if (errorMessages.length > 0) {
                showPopup(errorMessages.join(', '), 'error', 4000);
            } else {
                showError('Please fill in all required fields');
            }
            return;
        }

        setEducationEntries(prev =>
            prev.map(entry =>
                entry.id === editingEntry.id
                    ? { ...formData, id: editingEntry.id }
                    : entry
            )
        );
        setHasUnsavedChanges(true);

        // Reset form
        setFormData({
            educationLevel: '',
            schoolCollegeName: '',
            boardUniversityName: '',
            registrationNumber: '',
            state: '',
            result: '',
            percentage: '',
            cgpa: '',
            securedMarks: '',
            maximumMarks: '',
            courseName: '',
            yearOfPassing: '',
            specialization: '',
            document: null,
            documentName: '',
            documentBase64: null
        });
        setSelectedEducationLevel('');
        setEditingEntry(null);
        setErrors({});

        showSuccess('Education entry updated successfully! Please click "Save All Education Details" to save changes.');
    };

    const handleDeleteEntry = (id) => {
        showConfirmation(
            'Are you sure you want to delete this education entry? This action cannot be undone.',
            () => {
                setEducationEntries(prev => prev.filter(entry => entry.id !== id));
                setHasUnsavedChanges(true);
                showSuccess('Education entry deleted successfully! Please click "Save All Education Details" to save changes.');
            },
            null,
            'warning'
        );
    };

    const handleSaveAll = async () => {
        if (educationEntries.length === 0) {
            showWarning('Please add at least one education entry');
            return;
        }

        try {
            setLoading(true);

            // Sort entries by year of passing before saving
            const sortedEntries = [...educationEntries].sort((a, b) => {
                const yearA = parseInt(a.yearOfPassing) || 0;
                const yearB = parseInt(b.yearOfPassing) || 0;
                return yearA - yearB;
            });

            // Convert to backend format
            const educationArray = sortedEntries.map(entry => ({
                educationLevel: entry.educationLevel,
                degreeName: entry.schoolCollegeName,
                collegeName: entry.boardUniversityName,
                passYear: entry.yearOfPassing,
                registrationNumber: entry.registrationNumber,
                state: entry.state,
                specialization: entry.courseName || entry.specialization,
                percentage: entry.percentage,
                cgpa: entry.cgpa,
                grade: entry.result,
                marksheet: entry.documentBase64
            }));

            console.log('Saving education data:', educationArray);
            const response = await api.updateCandidateProfile({ education: educationArray });
            console.log('Save response:', response);

            if (response.success) {
                setEducationEntries(sortedEntries);
                setHasUnsavedChanges(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                showSuccess('All education details saved successfully!');
            } else {
                const errorMessage = response.message || response.error || 'Failed to save education details';
                console.error('Save failed:', errorMessage);
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Save error:', error);
            showError('Failed to save education details: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const validateEducationField = (level, field, value, index = null) => {
        const errors = {};

        switch (field) {
            case 'schoolName':
                if (!value || !value.trim()) {
                    errors[field] = 'School/College name is required';
                } else if (value.trim().length < 2) {
                    errors[field] = 'School/College name must be at least 2 characters';
                }
                break;
            case 'location':
                if (!value || !value.trim()) {
                    errors[field] = 'Location is required';
                } else if (value.trim().length < 2) {
                    errors[field] = 'Location must be at least 2 characters';
                }
                break;
            case 'registrationNumber':
                if (value) {
                    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
                    if (!alphanumericRegex.test(value)) {
                        errors[field] = 'Only alphabets and numbers are allowed';
                    }
                }
                break;
            case 'passoutYear':
                // No validation for passout year
                break;
            case 'percentage':
                if (value) {
                    const percentage = parseFloat(value);
                    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                        errors[field] = 'Percentage must be between 0 and 100';
                    }
                }
                break;
            default:
                break;
        }

        // Set errors in appropriate state
        if (index !== null) {
            // Additional row error
            const updatedAdditionalErrors = [...additionalErrors];
            if (!updatedAdditionalErrors[index]) {
                updatedAdditionalErrors[index] = {};
            }
            updatedAdditionalErrors[index][field] = errors[field] || null;
            setAdditionalErrors(updatedAdditionalErrors);
        } else {
            // Main education level error
            setErrors(prev => ({ ...prev, [`${level}_${field}`]: errors[field] || null }));
        }

        return !errors[field]; // Return true if valid, false if invalid
    };

    const addNewRow = () => {
        const newRow = {
            id: Date.now(),
            educationType: 'Degree',
            schoolName: '',
            location: '',
            passoutYear: '',
            registrationNumber: '',
            state: '',
            specialization: '',
            percentage: '',
            cgpa: '',
            grade: '',
            marksheet: null,
            marksheetBase64: null
        };
        setAdditionalRows([...additionalRows, newRow]);
        setAdditionalEditMode([...additionalEditMode, true]);

        // Scroll to the newly added row after a short delay to allow DOM update
        setTimeout(() => {
            const tableBody = document.querySelector('.table tbody');
            if (tableBody) {
                const lastRow = tableBody.lastElementChild;
                if (lastRow) {
                    lastRow.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }, 100);
    };

    const removeRow = (index) => {
        const updatedRows = additionalRows.filter((_, i) => i !== index);
        const updatedEditMode = additionalEditMode.filter((_, i) => i !== index);
        setAdditionalRows(updatedRows);
        setAdditionalEditMode(updatedEditMode);
    };

    const toggleEdit = async (level, index = null) => {
        if (index !== null) {
            const updatedEditMode = [...additionalEditMode];
            if (updatedEditMode[index]) {
                // Save individual row
                const success = await handleIndividualSave(null, index);
                if (success) {
                    updatedEditMode[index] = false; // Switch to Edit mode after saving
                }
            } else {
                updatedEditMode[index] = true; // Switch to Save mode for editing
            }
            setAdditionalEditMode(updatedEditMode);
        } else {
            if (editMode[level]) {
                // Save individual row
                const success = await handleIndividualSave(level);
                if (success) {
                    setEditMode(prev => ({ ...prev, [level]: false })); // Switch to Edit mode after saving
                }
            } else {
                setEditMode(prev => ({ ...prev, [level]: true })); // Switch to Save mode for editing
            }
        }
    };

    const uploadMarksheet = async (file, level, index = null) => {
        // File validation
        if (!file) {
            showWarning('Please select a file to upload.');
            return;
        }

        // Check file type first
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showError('Only PDF files are allowed.');
            return;
        }

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            showError('File size must be less than 50MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('marksheet', file);
            
            let educationIndex;
            let educationDataToSend;
            
            if (index !== null) {
                // Additional row
                educationIndex = 3 + index; // After tenth, diploma, degree
                educationDataToSend = additionalRows[index];
            } else {
                // Main education levels
                if (level === 'tenth') educationIndex = 0;
                else if (level === 'diploma') educationIndex = 1;
                else if (level === 'degree') educationIndex = 2;
                
                educationDataToSend = {
                    degreeName: educationData[level].schoolName,
                    collegeName: educationData[level].location,
                    passYear: educationData[level].passoutYear,
                    percentage: educationData[level].percentage,
                    cgpa: educationData[level].cgpa,
                    grade: educationData[level].grade
                };
            }
            
            formData.append('educationIndex', educationIndex);
            formData.append('educationData', JSON.stringify(educationDataToSend));
            
            const token = localStorage.getItem('candidateToken');
            const response = await fetch('http://localhost:5000/api/candidate/education/marksheet', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local state with the uploaded marksheet
                if (index !== null) {
                    const updatedRows = [...additionalRows];
                    updatedRows[index].marksheetBase64 = result.marksheet;
                    setAdditionalRows(updatedRows);
                } else {
                    const updatedData = { ...educationData };
                    updatedData[level].marksheetBase64 = result.marksheet;
                    setEducationData(updatedData);
                }
                
                // Show success toast notification
                showSuccess('Marksheet uploaded successfully!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Upload failed with status: ${response.status}`;
                showError(`Failed to upload marksheet: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError(`Error uploading marksheet: ${error.message || 'Network error. Please check your connection and try again.'}`);
        }
    };

    const validateAllFields = () => {
        let hasErrors = false;
        const newErrors = {};
        const newAdditionalErrors = [];

        // Validate main education fields - all required for saving
        ['tenth', 'diploma', 'degree'].forEach(level => {
            // Check if any field has data for this level
            const hasAnyData = educationData[level].schoolName || educationData[level].location || educationData[level].passoutYear || educationData[level].percentage;
            
            if (hasAnyData) {
                // If any field has data, only school name and location are required
                ['schoolName', 'location'].forEach(field => {
                    const value = educationData[level][field];
                    if (!value || !value.trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location'};
                        const levelNames = {tenth: '10th School', diploma: 'Diploma/PUC', degree: 'Degree'};
                        newErrors[`${level}_${field}`] = `${levelNames[level]} - ${fieldNames[field]} is required`;
                        hasErrors = true;
                    } else if (!validateEducationField(level, field, value)) {
                        hasErrors = true;
                    }
                });
            }



            // Validate percentage if provided
            if (educationData[level].percentage && !validateEducationField(level, 'percentage', educationData[level].percentage)) {
                hasErrors = true;
            }
        });

        // Validate additional rows - all required for saving if any field has data
        additionalRows.forEach((row, index) => {
            const rowErrors = {};
            const hasAnyData = row.schoolName || row.location || row.passoutYear || row.percentage;
            
            if (hasAnyData) {
                ['schoolName', 'location'].forEach(field => {
                    if (!row[field] || !row[field].trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location'};
                        rowErrors[field] = `Additional Education Row ${index + 1} - ${fieldNames[field]} is required`;
                        hasErrors = true;
                    } else if (!validateEducationField('additional', field, row[field], index)) {
                        hasErrors = true;
                    }
                });
                
                const updatedAdditionalErrors = [...additionalErrors];
                updatedAdditionalErrors[index] = rowErrors;
                setAdditionalErrors(updatedAdditionalErrors);
            }



            if (row.percentage && !validateEducationField('additional', 'percentage', row.percentage, index)) {
                hasErrors = true;
            }

            newAdditionalErrors.push(rowErrors);
        });

        // Set errors in state
        setErrors(newErrors);
        setAdditionalErrors(newAdditionalErrors);
        
        // Return validation result with errors
        const allErrors = [];
        Object.values(newErrors).forEach(error => {
            if (error) allErrors.push(error);
        });
        newAdditionalErrors.forEach((rowErrors) => {
            if (rowErrors) {
                Object.values(rowErrors).forEach(error => {
                    if (error) allErrors.push(error);
                });
            }
        });
        
        return { isValid: !hasErrors, errors: allErrors };
    };

    const handleIndividualSave = async (level, index = null) => {
        // Validate only the specific row
        let hasErrors = false;
        const newErrors = {};
        const newAdditionalErrors = [...additionalErrors];

        if (index !== null) {
            // Validate additional row
            const row = additionalRows[index];
            const rowErrors = {};
            const hasAnyData = row.schoolName || row.location || row.passoutYear || row.percentage;
            
            if (hasAnyData) {
                ['schoolName', 'location'].forEach(field => {
                    if (!row[field] || !row[field].trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location'};
                        rowErrors[field] = `${fieldNames[field]} is required`;
                        hasErrors = true;
                    }
                });
            }
            newAdditionalErrors[index] = rowErrors;
            setAdditionalErrors(newAdditionalErrors);
        } else {
            // Validate main education level
            const hasAnyData = educationData[level].schoolName || educationData[level].location || educationData[level].passoutYear || educationData[level].percentage;
            
            if (hasAnyData) {
                ['schoolName', 'location', 'passoutYear'].forEach(field => {
                    const value = educationData[level][field];
                    if (!value || !value.trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location', passoutYear: 'Passout year'};
                        newErrors[`${level}_${field}`] = `${fieldNames[field]} is required`;
                        hasErrors = true;
                    }
                });
            }
            setErrors(newErrors);
        }

        if (hasErrors) {
            const errorMessages = Object.values(newErrors).concat(newAdditionalErrors.flatMap(e => Object.values(e || {}))).filter(e => e).join(', ');
            showError(errorMessages || 'Please correct the highlighted fields');
            return false;
        }

        return true; // Individual validation passed
    };

    const handleSave = async () => {
        // Validate all fields before saving
        const validationResult = validateAllFields();
        if (!validationResult.isValid) {
            const errorMessages = validationResult.errors.join(', ');
            showError(errorMessages || 'Please correct the highlighted fields');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('candidateToken');

            const educationArray = [
                {
                    degreeName: educationData.tenth.schoolName?.trim(),
                    collegeName: educationData.tenth.location?.trim(),
                    passYear: educationData.tenth.passoutYear,
                    registrationNumber: educationData.tenth.registrationNumber,
                    state: educationData.tenth.state,
                    specialization: educationData.tenth.specialization,
                    percentage: educationData.tenth.percentage,
                    cgpa: educationData.tenth.cgpa,
                    grade: educationData.tenth.grade,
                    marksheet: educationData.tenth.marksheetBase64
                },
                {
                    degreeName: educationData.diploma.schoolName?.trim(),
                    collegeName: educationData.diploma.location?.trim(),
                    passYear: educationData.diploma.passoutYear,
                    registrationNumber: educationData.diploma.registrationNumber,
                    state: educationData.diploma.state,
                    specialization: educationData.diploma.specialization,
                    percentage: educationData.diploma.percentage,
                    cgpa: educationData.diploma.cgpa,
                    grade: educationData.diploma.grade,
                    marksheet: educationData.diploma.marksheetBase64
                },
                {
                    degreeName: educationData.degree.schoolName?.trim(),
                    collegeName: educationData.degree.location?.trim(),
                    passYear: educationData.degree.passoutYear,
                    registrationNumber: educationData.degree.registrationNumber,
                    state: educationData.degree.state,
                    specialization: educationData.degree.specialization,
                    percentage: educationData.degree.percentage,
                    cgpa: educationData.degree.cgpa,
                    grade: educationData.degree.grade,
                    marksheet: educationData.degree.marksheetBase64
                },
                ...additionalRows.map(row => ({
                    degreeName: row.schoolName?.trim(),
                    collegeName: row.location?.trim(),
                    passYear: row.passoutYear,
                    registrationNumber: row.registrationNumber,
                    state: row.state,
                    specialization: row.specialization,
                    percentage: row.percentage,
                    cgpa: row.cgpa,
                    grade: row.grade,
                    marksheet: row.marksheetBase64
                }))
            ];

            const response = await api.updateCandidateProfile({ education: educationArray });

            if (response.success) {
                // Set all rows to non-edit mode after successful save
                setEditMode({ tenth: false, diploma: false, degree: false });
                setAdditionalEditMode(additionalRows.map(() => false));
                
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                showSuccess('All education details saved successfully!');
            } else {
                const errorMessage = response.message || response.error || 'Failed to save education details. Please try again.';
                showError(errorMessage);
            }
        } catch (error) {
            showError('Failed to save education details. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getEducationLevelLabel = (level) => {
        const levelMap = {
            '10th_pass': '10th Pass / SSLC',
            '12th_pass': '12th Pass / PUC / Higher Secondary',
            'diploma_general': 'Diploma (General)',
            'iti_trade': 'ITI / Trade Certification',
            'polytechnic_diploma': 'Polytechnic Diploma',
            'vocational_training': 'Vocational Training',
            'certification_courses': 'Certification Courses (Technical/Non-Technical)',
            'apprenticeship': 'Apprenticeship Programs',
            'be': 'B.E. (Bachelor of Engineering)',
            'btech': 'B.Tech (Bachelor of Technology)',
            'bsc': 'B.Sc (Bachelor of Science)',
            'bca': 'BCA (Bachelor of Computer Applications)',
            'bba': 'BBA (Bachelor of Business Administration)',
            'bcom': 'B.Com (Bachelor of Commerce)',
            'ba': 'BA (Bachelor of Arts)',
            'bba_llb': 'BBA-LLB',
            'bsc_nursing': 'B.Sc Nursing',
            'bpharm': 'Bachelor of Pharmacy (B.Pharm)',
            'bds': 'BDS (Dentistry)',
            'mbbs': 'MBBS (Medicine)',
            'bams': 'BAMS (Ayurvedic Medicine)',
            'bhms': 'BHMS (Homeopathy)',
            'bums': 'BUMS (Unani Medicine)',
            'bpt': 'BPT (Physiotherapy)',
            'bot': 'BOT (Occupational Therapy)',
            'bvsc': 'B.V.Sc (Veterinary Science)',
            'barch': 'B.Arch (Architecture)',
            'bfa': 'BFA (Fine Arts)',
            'bsw': 'BSW (Social Work)',
            'bhm': 'BHM (Hotel Management)',
            'bttm': 'BTTM (Travel & Tourism)',
            'bba_it': 'BBA (IT Management)',
            'bsc_it': 'B.Sc (IT)',
            'bsc_cs': 'B.Sc (Computer Science)',
            'bsc_data_science': 'B.Sc (Data Science / AI / ML)',
            'btech_ai': 'B.Tech (AI / Data Science / ML / Cybersecurity)',
            'be_specializations': 'B.E (Specializations: CSE, ECE, EEE, Mech, Civil, etc.)',
            'bca_cloud': 'BCA (Cloud Computing / Cybersecurity tracks)',
            'bca_data_analytics': 'BCA (Data Analytics / AI tracks)',
            'bcom_finance': 'B.Com (Finance)',
            'bcom_banking': 'B.Com (Banking & Insurance)',
            'bba_finance': 'BBA (Finance)',
            'bba_marketing': 'BBA (Marketing)',
            'bba_hr': 'BBA (HR)',
            'bba_hospital': 'BBA (Hospital Administration)',
            'bba_retail': 'BBA (Retail Management)',
            'bba_entrepreneurship': 'BBA (Entrepreneurship)',
            'bsc_biology': 'B.Sc (Biology)',
            'bsc_biotech': 'B.Sc (Biotechnology)',
            'bsc_microbiology': 'B.Sc (Microbiology)',
            'bsc_genetics': 'B.Sc (Genetics)',
            'bsc_biochemistry': 'B.Sc (Biochemistry)',
            'clinical_research': 'Clinical Research Certification',
            'paramedical': 'Paramedical Courses',
            'llb': 'LLB (Bachelor of Law)',
            'aviation': 'Aviation Courses',
            'me': 'M.E. (Master of Engineering)',
            'mtech': 'M.Tech (Master of Technology)',
            'mba': 'MBA (Master of Business Administration)',
            'mba_finance': 'MBA (Finance)',
            'mba_marketing': 'MBA (Marketing)',
            'mba_hr': 'MBA (HR)',
            'mba_operations': 'MBA (Operations)',
            'mba_systems': 'MBA (Systems / IT)',
            'msc': 'M.Sc (Master of Science)',
            'mca': 'MCA (Master of Computer Applications)',
            'mcom': 'M.Com (Master of Commerce)',
            'ma': 'MA (Master of Arts)',
            'mph': 'MPH (Public Health)',
            'ms': 'MS (Master of Surgery)',
            'md': 'MD (Doctor of Medicine)',
            'mds': 'MDS (Master of Dental Surgery)',
            'mpt': 'MPT (Master of Physiotherapy)',
            'phd': 'PhD (Doctorate)',
            'doctoral_research': 'Doctoral Research Fellow',
            'post_doctoral': 'Post-Doctoral Programs',
            // Legacy mappings for backward compatibility
            'sslc': 'SSLC / 10th',
            'puc': 'PUC / 12th / Diploma',
            'degree': 'Degree / Graduation',
            'masters': 'Masters / Post Graduation'
        };
        return levelMap[level] || level;
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">Educational Qualification Details</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 education-section-body" style={{overflow: 'visible', zIndex: 1000, position: 'relative'}}>
                <div className="twm-panel-inner" style={{overflow: 'visible', position: 'relative', zIndex: 100}}>
                    {/* Education Level Dropdown */}
                    <div className="mb-4" style={{ maxWidth: '300px', position: 'relative', zIndex: 1001 }}>
                        <label className="form-label fw-bold">Select Education Level</label>
                        <SearchableSelect
                            options={educationLevels}
                            value={selectedEducationLevel}
                            onChange={handleEducationLevelChange}
                            placeholder="Choose Education Level"
                            className={`form-control ${errors.educationLevel ? 'is-invalid' : ''}`}
                        />
                        {errors.educationLevel && <div className="invalid-feedback d-block">{errors.educationLevel}</div>}
                    </div>

                    {/* Dynamic Form */}
                    {selectedEducationLevel && (
                        <div className="card mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                            <div className="card-body">
                                <h5 className="card-title mb-3">{getEducationLevelLabel(selectedEducationLevel)}</h5>
                                <div className="row g-3">
                                    {/* Common Fields */}
                                    <div className="col-md-6">
                                        <label className="form-label required-field">School/College Name</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.schoolCollegeName ? 'is-invalid' : ''}`}
                                            name="schoolCollegeName"
                                            value={formData.schoolCollegeName}
                                            onChange={handleInputChange}
                                            placeholder="Enter school/college name"
                                            required
                                        />
                                        {errors.schoolCollegeName && <div className="invalid-feedback">{errors.schoolCollegeName}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label required-field">Name of Board / University</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.boardUniversityName ? 'is-invalid' : ''}`}
                                            name="boardUniversityName"
                                            value={formData.boardUniversityName}
                                            onChange={handleInputChange}
                                            placeholder="Enter board/university name"
                                            required
                                        />
                                        {errors.boardUniversityName && <div className="invalid-feedback">{errors.boardUniversityName}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label required-field">Enrollment Number</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.registrationNumber ? 'is-invalid' : ''}`}
                                            name="registrationNumber"
                                            value={formData.registrationNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter enrollment number"
                                            required
                                        />
                                        {errors.registrationNumber && <div className="invalid-feedback">{errors.registrationNumber}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label required-field">State </label>
                                        <select
                                            className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {indianStates.map(state => (
                                                <option key={state.value} value={state.value}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label required-field">Result</label>
                                        <select
                                            className={`form-select ${errors.result ? 'is-invalid' : ''}`}
                                            name="result"
                                            value={formData.result}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Result</option>
                                            <option value="Passed">Passed</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                        {errors.result && <div className="invalid-feedback">{errors.result}</div>}
                                    </div>

                                    {/* Percentage/CGPA */}
                                    <div className="col-md-6">
                                        <label className="form-label">Percentage (%)</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.percentage ? 'is-invalid' : ''}`}
                                            name="percentage"
                                            value={formData.percentage}
                                            onChange={handleInputChange}
                                            placeholder="Enter percentage"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            required
                                        />
                                        {errors.percentage && <div className="invalid-feedback">{errors.percentage}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">CGPA</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.cgpa ? 'is-invalid' : ''}`}
                                            name="cgpa"
                                            value={formData.cgpa}
                                            onChange={handleInputChange}
                                            placeholder="Enter CGPA"
                                            min="0"
                                            max="10"
                                            step="0.01"
                                            readOnly
                                        />
                                        {errors.cgpa && <div className="invalid-feedback">{errors.cgpa}</div>}
                                    </div>

                                    {/* Course Name/Stream for 10th pass/SSLC */}
                                    {(selectedEducationLevel === '10th_pass' || selectedEducationLevel === 'sslc') && (
                                        <div className="col-md-6">
                                            <label className="form-label required-field">Course Name / Stream</label>
                                            <select
                                                className={`form-select ${errors.courseName ? 'is-invalid' : ''}`}
                                                name="courseName"
                                                value={formData.courseName}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Board</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="State Board">State Board</option>
                                                <option value="ICSE">ICSE</option>
                                            </select>
                                            {errors.courseName && <div className="invalid-feedback">{errors.courseName}</div>}
                                        </div>
                                    )}

                                    {/* Year of Passing for basic education levels */}
                                    {(selectedEducationLevel === '10th_pass' || selectedEducationLevel === 'sslc') && (
                                        <div className="col-md-6">
                                            <label className="form-label required-field">Year of Passing</label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.yearOfPassing ? 'is-invalid' : ''}`}
                                                name="yearOfPassing"
                                                value={formData.yearOfPassing}
                                                onChange={handleInputChange}
                                                placeholder="Enter year of passing (e.g., 2023)"
                                                title="Enter the year you passed/completed this qualification"
                                                required
                                            />
                                            {errors.yearOfPassing && <div className="invalid-feedback">{errors.yearOfPassing}</div>}
                                        </div>
                                    )}

                                    {/* Additional fields for higher education levels */}
                                    {(selectedEducationLevel !== '10th_pass' && selectedEducationLevel !== 'sslc' && selectedEducationLevel) && (
                                        <>
                                            <div className="col-md-6">
                                                <label className="form-label required-field">Course Name / Stream</label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.courseName ? 'is-invalid' : ''}`}
                                                    name="courseName"
                                                    value={formData.courseName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter course name/stream (optional for SSLC)"
                                                />
                                                {errors.courseName && <div className="invalid-feedback">{errors.courseName}</div>}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label required-field">Year of Passing</label>
                                                <input
                                                    type="number"
                                                    className={`form-control ${errors.yearOfPassing ? 'is-invalid' : ''}`}
                                                    name="yearOfPassing"
                                                    value={formData.yearOfPassing}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter year of passing (e.g., 2023)"
                                                    title="Enter the year you passed/completed this qualification"
                                                    required
                                                />
                                                {errors.yearOfPassing && <div className="invalid-feedback">{errors.yearOfPassing}</div>}
                                            </div>
                                        </>
                                    )}

                                    {/* Document Upload */}
                                    <div className="col-12">
                                        <label className="form-label">Upload Supporting Document (PDF only, max 50MB)</label>
                                        <input
                                            type="file"
                                            className={`form-control ${errors.document ? 'is-invalid' : ''}`}
                                            name="document"
                                            accept=".pdf"
                                            onChange={handleInputChange}
                                        />
                                        {errors.document && <div className="invalid-feedback">{errors.document}</div>}
                                        {formData.documentName && (
                                            <small className="text-success mt-1 d-block">
                                                <i className="fa fa-check"></i> {formData.documentName}
                                            </small>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-4 d-flex gap-2 flex-wrap">
                                    {editingEntry ? (
                                        <>
                                            <button
                                                type="button"
                                                className="site-button"
                                                onClick={handleUpdateEducation}
                                            >
                                                <i className="fa fa-save me-1"></i> Update Education
                                            </button>
                                            <button
                                                type="button"
                                                className="site-button"
                                                onClick={() => {
                                                    setEditingEntry(null);
                                                    setFormData({
                                                        educationLevel: '',
                                                        schoolCollegeName: '',
                                                        boardUniversityName: '',
                                                        registrationNumber: '',
                                                        state: '',
                                                        result: '',
                                                        percentage: '',
                                                        cgpa: '',
                                                        securedMarks: '',
                                                        maximumMarks: '',
                                                        courseName: '',
                                                        yearOfPassing: '',
                                                        specialization: '',
                                                        document: null,
                                                        documentName: '',
                                                        documentBase64: null
                                                    });
                                                    setSelectedEducationLevel('');
                                                    setErrors({});
                                                }}
                                            >
                                                <i className="fa fa-times me-1"></i> Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="site-button"
                                            onClick={handleAddEducation}
                                        >
                                            <i className="fa fa-plus me-1"></i> Save Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Table */}
                    {educationEntries.length > 0 && (
                        <div className="mt-4">
                            <h5 className="mb-3">Education Summary</h5>
                            <style>{`
                                .education-section-body {
                                    overflow: visible !important;
                                }
                                .twm-panel-inner {
                                    overflow: visible !important;
                                }
                                .education-table-wrapper {
                                    overflow-x: auto !important;
                                    -webkit-overflow-scrolling: touch !important;
                                    max-width: 100% !important;
                                    scrollbar-width: thin !important;
                                    scrollbar-color: #888 #f1f1f1 !important;
                                    padding: 2px 2px 2px 8px !important;
                                    background: white !important;
                                    border-radius: 8px !important;
                                }
                                .education-table-wrapper table {
                                    border: 1px solid #dee2e6 !important;
                                    background: white !important;
                                }
                                .education-table-wrapper table th,
                                .education-table-wrapper table td {
                                    border: 1px solid #dee2e6 !important;
                                    background: white !important;
                                    vertical-align: middle !important;
                                }
                                .education-table-wrapper table thead th {
                                    background: #f8f9fa !important;
                                    font-weight: 600 !important;
                                    position: sticky !important;
                                    top: 0 !important;
                                    z-index: 10 !important;
                                }
                                .education-table-wrapper::-webkit-scrollbar {
                                    height: 14px !important;
                                    -webkit-appearance: none !important;
                                    display: block !important;
                                }
                                .education-table-wrapper::-webkit-scrollbar-track {
                                    background: #f1f1f1 !important;
                                    border-radius: 4px !important;
                                    display: block !important;
                                }
                                .education-table-wrapper::-webkit-scrollbar-thumb {
                                    background: #888 !important;
                                    border-radius: 4px !important;
                                    display: block !important;
                                    min-width: 50px !important;
                                }
                                @media (max-width: 768px) {
                                    .education-table-wrapper {
                                        padding-bottom: 5px !important;
                                    }
                                    .education-table-wrapper::-webkit-scrollbar {
                                        height: 16px !important;
                                    }
                                }
                            `}</style>
                            <div className="table-responsive education-table-wrapper" style={{border: '2px solid #dee2e6', borderRadius: '4px', marginBottom: '10px', marginLeft: '2px'}}>
                                <table className="table table-bordered table-sm mb-0" style={{minWidth: '800px', fontSize: '14px', width: '100%'}}>
                                <style>{`
                                    .table tbody tr:hover {
                                        background-color: transparent !important;
                                    }
                                    .table tbody tr:hover td {
                                        background-color: transparent !important;
                                    }
                                `}</style>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{minWidth: '120px', whiteSpace: 'nowrap'}}>Qualification</th>
                                            <th style={{minWidth: '150px'}}>Degree/Course/Board</th>
                                            <th style={{minWidth: '120px'}}>Institution</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Enrollment No.</th>
                                            <th style={{minWidth: '80px'}}>State</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Year</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Score</th>
                                            <th style={{minWidth: '70px'}}>Result</th>
                                            <th style={{minWidth: '100px', whiteSpace: 'nowrap'}}>Document</th>
                                            <th style={{minWidth: '100px', whiteSpace: 'nowrap'}}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {educationEntries.map(entry => (
                                            <tr key={entry.id}>
                                                <td style={{fontWeight: '600', fontSize: '13px'}}>
                                                    {getEducationLevelLabel(entry.educationLevel)}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {entry.courseName || entry.schoolCollegeName}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {entry.boardUniversityName}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {entry.registrationNumber || '-'}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {entry.state}
                                                </td>
                                                <td style={{fontSize: '13px', textAlign: 'center'}}>
                                                    {entry.yearOfPassing || '-'}
                                                </td>
                                                <td style={{fontSize: '13px', textAlign: 'center'}}>
                                                    {entry.percentage || entry.cgpa}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`badge ${entry.result === 'Passed' ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '11px'}}>
                                                        {entry.result}
                                                    </span>
                                                </td>
                                                <td style={{fontSize: '12px', textAlign: 'center'}}>
                                                    {entry.documentBase64 ? (
                                                        <span className="badge bg-success" style={{fontSize: '10px'}}>
                                                            <i className="fa fa-file-pdf-o me-1"></i>
                                                            Uploaded
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning" style={{fontSize: '10px'}}>
                                                            No Document
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1 justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="site-button"
                                                            onClick={() => handleEditEntry(entry)}
                                                            title="Edit"
                                                            style={{padding: '4px 8px', fontSize: '12px'}}
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => handleDeleteEntry(entry.id)}
                                                            title="Delete"
                                                            style={{padding: '4px 8px', fontSize: '12px'}}
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Unsaved Changes Warning */}
                    {hasUnsavedChanges && (
                        <div className="alert alert-warning mt-4" role="alert">
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            <strong>You have unsaved changes!</strong> Please click "Save All Education Details" button to save your changes.
                        </div>
                    )}

                    {/* Save All Button */}
                    {educationEntries.length > 0 && (
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                className={`site-button ${hasUnsavedChanges ? 'btn-warning' : ''}`}
                                onClick={handleSaveAll}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px', 
                                    fontSize: '16px',
                                    backgroundColor: hasUnsavedChanges ? '#ff6600' : '',
                                    border: hasUnsavedChanges ? '2px solid #ff6600' : '',
                                    animation: hasUnsavedChanges ? 'pulse 2s infinite' : 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin"></i>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-save"></i>
                                        <span>Save All Education Details</span>
                                        {hasUnsavedChanges && <span className="badge bg-light text-dark">Required</span>}
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <style>{`
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.7); }
                            70% { box-shadow: 0 0 0 10px rgba(255, 102, 0, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); }
                        }
                    `}</style>
                </div>
            </div>
        </>
    )
}
export default SectionCanEducation;
