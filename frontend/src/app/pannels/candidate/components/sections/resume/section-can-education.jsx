import { useState, useRef, useEffect } from 'react';
import { api } from '../../../../../utils/api';
import { showConfirmation, showSuccess, showError } from '../../../../../utils/popupNotification';

const LOCATIONS = [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
    'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
    'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu',
    'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir',
    'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad'
];

// Conversion functions
const convertPercentageToCGPA = (percentage) => {
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 40) return 5;
    return 4;
};

const convertCGPAToPercentage = (cgpa) => {
    return (cgpa * 9.5).toFixed(1);
};

const convertPercentageToGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

function SectionCanEducation({ profile }) {
    const [educationList, setEducationList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (profile && profile.education) {
            const mappedEducation = profile.education.map(edu => ({
                id: edu._id,
                schoolName: edu.degreeName || '',
                location: edu.collegeName || '',
                passoutYear: edu.passYear || '',
                percentage: edu.percentage || '',
                cgpa: edu.cgpa || '',
                sgpa: edu.sgpa || '',
                grade: edu.grade || ''
            }));
            setEducationList(mappedEducation);
        }
    }, [profile]);

    const [formData, setFormData] = useState({
        schoolName: '',
        location: '',
        passoutYear: '',
        percentage: '',
        cgpa: '',
        sgpa: '',
        grade: '',
        marksheet: null
    });
    const [locationSearch, setLocationSearch] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [filteredLocations, setFilteredLocations] = useState(LOCATIONS);
    const locationInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };
        
        // Auto-convert when percentage is entered
        if (name === 'percentage' && value) {
            const percentageValue = parseFloat(value);
            if (!isNaN(percentageValue)) {
                updatedData.cgpa = convertPercentageToCGPA(percentageValue);
                updatedData.sgpa = convertPercentageToCGPA(percentageValue); // Assuming SGPA same as CGPA for simplicity
                updatedData.grade = convertPercentageToGrade(percentageValue);
            }
        }
        // Auto-convert when CGPA is entered
        else if (name === 'cgpa' && value) {
            const cgpaValue = parseFloat(value);
            if (!isNaN(cgpaValue)) {
                updatedData.percentage = convertCGPAToPercentage(cgpaValue);
                updatedData.sgpa = cgpaValue; // Assuming SGPA same as CGPA
                updatedData.grade = convertPercentageToGrade(parseFloat(updatedData.percentage));
            }
        }
        
        setFormData(updatedData);
    };

    const handleLocationSearch = (e) => {
        const value = e.target.value;
        setLocationSearch(value);
        setFormData(prev => ({ ...prev, location: value }));
        
        const filtered = LOCATIONS.filter(location => 
            location.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLocations(filtered);
        setShowLocationDropdown(true);
    };

    const selectLocation = (location) => {
        setLocationSearch(location);
        setFormData(prev => ({ ...prev, location: location }));
        setShowLocationDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSave = async () => {
        if (!formData.schoolName || !formData.location || !formData.passoutYear || !formData.percentage) {
            showError('Please fill all required fields');
            return;
        }
        
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('schoolName', formData.schoolName);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('passoutYear', formData.passoutYear);
            formDataToSend.append('percentage', formData.percentage);
            formDataToSend.append('cgpa', formData.cgpa);
            formDataToSend.append('sgpa', formData.sgpa);
            formDataToSend.append('grade', formData.grade);
            
            if (formData.marksheet) {
                formDataToSend.append('marksheet', formData.marksheet);
            }
            
            const response = await api.addEducation(formDataToSend);
            
            if (response.success) {
                const newEducation = {
                    id: response.education._id || Date.now(),
                    schoolName: response.education.degreeName || formData.schoolName,
                    location: response.education.collegeName || formData.location,
                    passoutYear: response.education.passYear || formData.passoutYear,
                    percentage: response.education.percentage || formData.percentage,
                    cgpa: response.education.cgpa || formData.cgpa,
                    sgpa: response.education.sgpa || formData.sgpa,
                    grade: response.education.grade || formData.grade
                };
                
                setEducationList([...educationList, newEducation]);
                setFormData({
                    schoolName: '',
                    location: '',
                    passoutYear: '',
                    percentage: '',
                    cgpa: '',
                    sgpa: '',
                    grade: '',
                    marksheet: null
                });
                setLocationSearch('');
                setShowLocationDropdown(false);
                
                // Trigger profile refresh
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                showSuccess('Education details saved successfully!');
            } else {
                showError('Failed to save education details');
            }
        } catch (error) {
            showError('Error saving education details');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (educationId) => {
        showConfirmation(
            'Are you sure you want to delete this education entry? This action cannot be undone.',
            async () => {
                setLoading(true);
                try {
                    const response = await api.deleteEducation(educationId);
                    if (response.success) {
                        setEducationList(educationList.filter(e => e.id !== educationId));
                        // Trigger profile refresh
                        window.dispatchEvent(new CustomEvent('profileUpdated'));
                        showSuccess('Education record deleted successfully!');
                    } else {
                        showError('Failed to delete education record');
                    }
                } catch (error) {
                    showError('Error deleting education record');
                } finally {
                    setLoading(false);
                }
            },
            null,
            'warning'
        );
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">Educational Qualification Details</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <div className="education-form mb-4">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>School Name</label>
                                    <input 
                                        className="form-control" 
                                        name="schoolName" 
                                        type="text" 
                                        placeholder="Enter 10th School Name" 
                                        value={formData.schoolName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3" style={{position: 'relative'}} ref={dropdownRef}>
                                    <label>Board/Institution</label>
                                    <input 
                                        ref={locationInputRef}
                                        className="form-control" 
                                        name="locationSearch" 
                                        type="text" 
                                        placeholder="Type board name (e.g., CBSE, ICSE, State Board)..." 
                                        value={locationSearch}
                                        onChange={handleLocationSearch}
                                        onFocus={() => setShowLocationDropdown(true)}
                                        autoComplete="off"
                                    />
                                    {showLocationDropdown && filteredLocations.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'white',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            {filteredLocations.map((location, index) => (
                                                <div 
                                                    key={index}
                                                    onClick={() => selectLocation(location)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: index < filteredLocations.length - 1 ? '1px solid #eee' : 'none'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                >
                                                    {location}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Passout Year</label>
                                    <input 
                                        className="form-control" 
                                        name="passoutYear" 
                                        type="text" 
                                        placeholder="Enter Passout Year" 
                                        value={formData.passoutYear}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Percentage</label>
                                    <input 
                                        className="form-control" 
                                        name="percentage" 
                                        type="number" 
                                        placeholder="Enter percentage"
                                        value={formData.percentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>CGPA (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="cgpa" 
                                        type="number" 
                                        placeholder="CGPA"
                                        value={formData.cgpa}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>SGPA (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="sgpa" 
                                        type="number" 
                                        placeholder="SGPA"
                                        value={formData.sgpa}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>Grade (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="grade" 
                                        type="text" 
                                        placeholder="Grade"
                                        value={formData.grade}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group mb-3">
                                    <label>Upload Marksheet (PDF only, max 50MB)</label>
                                    <input 
                                        className="form-control" 
                                        name="marksheet" 
                                        type="file" 
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                // Validate file type
                                                if (file.type !== 'application/pdf') {
                                                    showError('Only PDF files are allowed');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                // Validate file size (50MB limit)
                                                if (file.size > 50 * 1024 * 1024) {
                                                    showError('File size must be less than 50MB');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setFormData(prev => ({ ...prev, marksheet: file }));
                                            }
                                        }}
                                    />
                                    <small className="text-muted">Upload your marksheet (PDF only, max 50MB)</small>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleSave} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Add Education'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {educationList.length > 0 && <hr />}
                    {educationList.map((education) => (
                        <div key={education.id} className="education-item mb-3 p-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                    <h5 className="mb-2"><b>{education.schoolName || 'Not provided'}</b></h5>
                                    <p className="mb-2"><i className="fa fa-building text-primary me-2"></i><strong>Board/Institution:</strong> {education.location || 'Not provided'}</p>
                                    <p className="mb-2"><i className="fa fa-calendar text-primary me-2"></i><strong>Passout Year:</strong> {education.passoutYear || 'Not provided'}</p>
                                    <div className="row mt-2">
                                        <div className="col-md-3 col-6 mb-2">
                                            <small className="text-muted">Percentage:</small>
                                            <div><strong>{education.percentage ? `${education.percentage}%` : 'N/A'}</strong></div>
                                        </div>
                                        <div className="col-md-3 col-6 mb-2">
                                            <small className="text-muted">CGPA:</small>
                                            <div><strong>{education.cgpa || 'N/A'}</strong></div>
                                        </div>
                                        <div className="col-md-3 col-6 mb-2">
                                            <small className="text-muted">SGPA:</small>
                                            <div><strong>{education.sgpa || 'N/A'}</strong></div>
                                        </div>
                                        <div className="col-md-3 col-6 mb-2">
                                            <small className="text-muted">Grade:</small>
                                            <div><strong>{education.grade || 'N/A'}</strong></div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-sm btn-outline-danger ms-3"
                                    onClick={() => handleDelete(education.id)}
                                    title="Delete"
                                    disabled={loading}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}
export default SectionCanEducation;
