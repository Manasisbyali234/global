import { useState, useEffect } from 'react';
import { api } from '../../../../../utils/api';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import SearchableSelect from '../../../../../components/SearchableSelect';
import '../../../../../searchable-select-overflow-fix.css';

function SectionCanWorkLocation({ profile, onUpdate }) {
    const [workLocationData, setWorkLocationData] = useState({
        preferredLocations: []
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const locationOptions = [
        // Popular Metro Cities (Top Priority)
        { value: 'Mumbai', label: 'Mumbai', category: 'Metro Cities', popular: true },
        { value: 'Delhi', label: 'Delhi', category: 'Metro Cities', popular: true },
        { value: 'Bangalore', label: 'Bangalore', category: 'Metro Cities', popular: true },
        { value: 'Hyderabad', label: 'Hyderabad', category: 'Metro Cities', popular: true },
        { value: 'Chennai', label: 'Chennai', category: 'Metro Cities', popular: true },
        { value: 'Kolkata', label: 'Kolkata', category: 'Metro Cities', popular: true },
        { value: 'Pune', label: 'Pune', category: 'Metro Cities', popular: true },
        { value: 'Gurgaon', label: 'Gurgaon', category: 'Metro Cities', popular: true },
        { value: 'Noida', label: 'Noida', category: 'Metro Cities', popular: true },
        { value: 'Navi Mumbai', label: 'Navi Mumbai', category: 'Metro Cities', popular: true },
        
        // Major Cities
        { value: 'Ahmedabad', label: 'Ahmedabad', category: 'Major Cities' },
        { value: 'Jaipur', label: 'Jaipur', category: 'Major Cities' },
        { value: 'Surat', label: 'Surat', category: 'Major Cities' },
        { value: 'Lucknow', label: 'Lucknow', category: 'Major Cities' },
        { value: 'Kanpur', label: 'Kanpur', category: 'Major Cities' },
        { value: 'Nagpur', label: 'Nagpur', category: 'Major Cities' },
        { value: 'Indore', label: 'Indore', category: 'Major Cities' },
        { value: 'Bhopal', label: 'Bhopal', category: 'Major Cities' },
        { value: 'Visakhapatnam', label: 'Visakhapatnam', category: 'Major Cities' },
        { value: 'Patna', label: 'Patna', category: 'Major Cities' },
        { value: 'Vadodara', label: 'Vadodara', category: 'Major Cities' },
        { value: 'Ludhiana', label: 'Ludhiana', category: 'Major Cities' },
        { value: 'Agra', label: 'Agra', category: 'Major Cities' },
        { value: 'Nashik', label: 'Nashik', category: 'Major Cities' },
        { value: 'Faridabad', label: 'Faridabad', category: 'Major Cities' },
        { value: 'Meerut', label: 'Meerut', category: 'Major Cities' },
        { value: 'Rajkot', label: 'Rajkot', category: 'Major Cities' },
        { value: 'Varanasi', label: 'Varanasi', category: 'Major Cities' },
        { value: 'Srinagar', label: 'Srinagar', category: 'Major Cities' },
        { value: 'Aurangabad', label: 'Aurangabad', category: 'Major Cities' },
        { value: 'Dhanbad', label: 'Dhanbad', category: 'Major Cities' },
        { value: 'Amritsar', label: 'Amritsar', category: 'Major Cities' },
        { value: 'Allahabad', label: 'Allahabad', category: 'Major Cities' },
        { value: 'Ranchi', label: 'Ranchi', category: 'Major Cities' },
        { value: 'Coimbatore', label: 'Coimbatore', category: 'Major Cities' },
        { value: 'Jabalpur', label: 'Jabalpur', category: 'Major Cities' },
        { value: 'Gwalior', label: 'Gwalior', category: 'Major Cities' },
        { value: 'Vijayawada', label: 'Vijayawada', category: 'Major Cities' },
        { value: 'Jodhpur', label: 'Jodhpur', category: 'Major Cities' },
        { value: 'Madurai', label: 'Madurai', category: 'Major Cities' },
        { value: 'Raipur', label: 'Raipur', category: 'Major Cities' },
        { value: 'Kota', label: 'Kota', category: 'Major Cities' },
        { value: 'Guwahati', label: 'Guwahati', category: 'Major Cities' },
        { value: 'Chandigarh', label: 'Chandigarh', category: 'Major Cities' },
        { value: 'Mysore', label: 'Mysore', category: 'Major Cities' },
        { value: 'Tiruchirappalli', label: 'Tiruchirappalli', category: 'Major Cities' },
        { value: 'Bhubaneswar', label: 'Bhubaneswar', category: 'Major Cities' },
        { value: 'Salem', label: 'Salem', category: 'Major Cities' },
        { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram', category: 'Major Cities' },
        { value: 'Guntur', label: 'Guntur', category: 'Major Cities' },
        { value: 'Bikaner', label: 'Bikaner', category: 'Major Cities' },
        { value: 'Amravati', label: 'Amravati', category: 'Major Cities' },
        { value: 'Jamshedpur', label: 'Jamshedpur', category: 'Major Cities' },
        { value: 'Bhilai', label: 'Bhilai', category: 'Major Cities' },
        { value: 'Cuttack', label: 'Cuttack', category: 'Major Cities' },
        { value: 'Kochi', label: 'Kochi', category: 'Major Cities' },
        { value: 'Nellore', label: 'Nellore', category: 'Major Cities' },
        { value: 'Bhavnagar', label: 'Bhavnagar', category: 'Major Cities' },
        { value: 'Dehradun', label: 'Dehradun', category: 'Major Cities' },
        { value: 'Durgapur', label: 'Durgapur', category: 'Major Cities' },
        { value: 'Asansol', label: 'Asansol', category: 'Major Cities' },
        { value: 'Rourkela', label: 'Rourkela', category: 'Major Cities' },
        { value: 'Nanded', label: 'Nanded', category: 'Major Cities' },
        { value: 'Kolhapur', label: 'Kolhapur', category: 'Major Cities' },
        { value: 'Ajmer', label: 'Ajmer', category: 'Major Cities' },
        { value: 'Akola', label: 'Akola', category: 'Major Cities' },
        { value: 'Gulbarga', label: 'Gulbarga', category: 'Major Cities' },
        { value: 'Jamnagar', label: 'Jamnagar', category: 'Major Cities' },
        { value: 'Ujjain', label: 'Ujjain', category: 'Major Cities' },
        { value: 'Siliguri', label: 'Siliguri', category: 'Major Cities' },
        { value: 'Jhansi', label: 'Jhansi', category: 'Major Cities' },
        { value: 'Jammu', label: 'Jammu', category: 'Major Cities' },
        { value: 'Mangalore', label: 'Mangalore', category: 'Major Cities' },
        { value: 'Erode', label: 'Erode', category: 'Major Cities' },
        { value: 'Belgaum', label: 'Belgaum', category: 'Major Cities' },
        { value: 'Tirunelveli', label: 'Tirunelveli', category: 'Major Cities' },
        { value: 'Gaya', label: 'Gaya', category: 'Major Cities' },
        { value: 'Jalgaon', label: 'Jalgaon', category: 'Major Cities' },
        { value: 'Udaipur', label: 'Udaipur', category: 'Major Cities' },
        
        // Other Cities
        { value: 'Thane', label: 'Thane', category: 'Other Cities' },
        { value: 'Pimpri-Chinchwad', label: 'Pimpri-Chinchwad', category: 'Other Cities' },
        { value: 'Ghaziabad', label: 'Ghaziabad', category: 'Other Cities' },
        { value: 'Kalyan-Dombivali', label: 'Kalyan-Dombivali', category: 'Other Cities' },
        { value: 'Vasai-Virar', label: 'Vasai-Virar', category: 'Other Cities' },
        { value: 'Howrah', label: 'Howrah', category: 'Other Cities' },
        { value: 'Solapur', label: 'Solapur', category: 'Other Cities' },
        { value: 'Hubli-Dharwad', label: 'Hubli-Dharwad', category: 'Other Cities' },
        { value: 'Bareilly', label: 'Bareilly', category: 'Other Cities' },
        { value: 'Moradabad', label: 'Moradabad', category: 'Other Cities' },
        { value: 'Aligarh', label: 'Aligarh', category: 'Other Cities' },
        { value: 'Jalandhar', label: 'Jalandhar', category: 'Other Cities' },
        { value: 'Mira-Bhayandar', label: 'Mira-Bhayandar', category: 'Other Cities' },
        { value: 'Warangal', label: 'Warangal', category: 'Other Cities' },
        { value: 'Bhiwandi', label: 'Bhiwandi', category: 'Other Cities' },
        { value: 'Saharanpur', label: 'Saharanpur', category: 'Other Cities' },
        { value: 'Gorakhpur', label: 'Gorakhpur', category: 'Other Cities' },
        { value: 'Firozabad', label: 'Firozabad', category: 'Other Cities' },
        { value: 'Loni', label: 'Loni', category: 'Other Cities' },
        { value: 'Ulhasnagar', label: 'Ulhasnagar', category: 'Other Cities' },
        { value: 'Sangli-Miraj & Kupwad', label: 'Sangli-Miraj & Kupwad', category: 'Other Cities' },
        { value: 'Ambattur', label: 'Ambattur', category: 'Other Cities' },
        { value: 'Malegaon', label: 'Malegaon', category: 'Other Cities' },
        { value: 'Maheshtala', label: 'Maheshtala', category: 'Other Cities' }
    ];



    useEffect(() => {
        if (profile) {
            setWorkLocationData({
                preferredLocations: profile.jobPreferences?.preferredLocations || []
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setWorkLocationData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (value === 'true')
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLocationChange = (selectedLocations) => {
        setWorkLocationData(prev => ({
            ...prev,
            preferredLocations: selectedLocations
        }));
        
        if (errors.preferredLocations) {
            setErrors(prev => ({ ...prev, preferredLocations: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!Array.isArray(workLocationData.preferredLocations) || workLocationData.preferredLocations.length === 0) {
            newErrors.preferredLocations = 'At least one preferred location is required';
            isValid = false;
        }



        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            const errorMessages = Object.values(errors).filter(e => e);
            showError(errorMessages.join(', '));
            return;
        }

        try {
            setLoading(true);

            const response = await api.updateWorkLocationPreferences({
                preferredLocations: workLocationData.preferredLocations
            });

            if (response.success) {
                setEditMode(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                showSuccess('Work location preferences saved successfully!');
                if (onUpdate) onUpdate();
            } else {
                showError(response.message || 'Failed to save work location preferences');
            }
        } catch (error) {
            console.error('Save error:', error);
            showError('Failed to save work location preferences: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to original data
        if (profile) {
            setWorkLocationData({
                preferredLocations: profile.jobPreferences?.preferredLocations || []
            });
        }
        setEditMode(false);
        setErrors({});
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">Desired Work Location</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="twm-panel-inner">
                    {editMode ? (
                        <div className="row g-3">
                            {/* Preferred Locations */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Preferred Work Locations *</label>
                                <SearchableSelect
                                    options={locationOptions}
                                    value={workLocationData.preferredLocations}
                                    onChange={handleLocationChange}
                                    placeholder="Search and select your preferred work locations..."
                                    isMulti={true}
                                    className={`form-select ${errors.preferredLocations ? 'is-invalid' : ''}`}
                                    showCategories={true}
                                />
                                {errors.preferredLocations && <div className="invalid-feedback d-block">{errors.preferredLocations}</div>}
                                <small className="text-muted">
                                    <i className="fa fa-info-circle me-1"></i>
                                    Select multiple locations to increase your job opportunities. Popular metro cities are shown first.
                                </small>
                            </div>







                            {/* Action Buttons */}
                            <div className="col-12 mt-4">
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="site-button"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fa fa-spinner fa-spin me-1"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-save me-1"></i>
                                                Save
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        <i className="fa fa-times me-1"></i>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="twm-panel-inner">
                            {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.length > 0 ? (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="fa fa-map-marker-alt text-primary me-2" style={{ fontSize: '1.2em' }}></i>
                                                <strong style={{ fontSize: '1.1em' }}>Preferred Work Locations</strong>
                                                <span className="badge bg-success ms-2">{workLocationData.preferredLocations.length} selected</span>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.map((location, index) => (
                                                    <span key={index} className="d-inline-flex align-items-center" style={{
                                                        backgroundColor: '#f8f9fa',
                                                        border: '2px solid #007bff',
                                                        borderRadius: '25px',
                                                        padding: '8px 16px',
                                                        fontSize: '0.9em',
                                                        fontWeight: '500',
                                                        color: '#0056b3'
                                                    }}>
                                                        <i className="fa fa-map-marker me-2" style={{ fontSize: '0.8em' }}></i>
                                                        {location}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                                <small className="text-muted">
                                                    <i className="fa fa-info-circle me-1"></i>
                                                    These locations will be visible to employers when they search for candidates. Having multiple preferred locations increases your job opportunities.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', border: '2px dashed #dee2e6' }}>
                                    <div className="mb-4">
                                        <i className="fa fa-map-marker-alt" style={{ fontSize: '3em', color: '#6c757d', opacity: 0.5 }}></i>
                                    </div>
                                    <h5 className="text-muted mb-3">No work location preferences added yet</h5>
                                    <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                                        Add your preferred work locations to help employers find you more easily. You can select multiple cities to increase your job opportunities.
                                    </p>
                                    <div className="d-flex justify-content-center gap-3 text-muted" style={{ fontSize: '0.9em', flexWrap: 'nowrap', alignItems: 'center' }}>
                                        <div style={{ whiteSpace: 'nowrap' }}><i className="fa fa-star text-warning me-1"></i>Metro Cities</div>
                                        <div style={{ whiteSpace: 'nowrap' }}><i className="fa fa-building text-info me-1"></i>Major Cities</div>
                                        <div style={{ whiteSpace: 'nowrap' }}><i className="fa fa-plus-circle text-success me-1"></i>Custom Locations</div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <button
                                    type="button"
                                    className="site-button btn-sm"
                                    onClick={() => setEditMode(true)}
                                >
                                    <i className="fa fa-edit me-1"></i>
                                    {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.length > 0 ? 'Edit' : 'Add'} Work Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SectionCanWorkLocation;