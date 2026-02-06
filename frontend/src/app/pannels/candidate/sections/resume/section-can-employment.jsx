import React, { useEffect, useState, memo } from "react";
import { api } from "../../../../../utils/api";
import { showSuccess, showError } from '../../../../../utils/popupNotification';
import "./employment-card-styles.css";

const NOTICE_PERIOD_OPTIONS = [
    "30 Days",
    "40 Days",
    "60 Days",
    "Custom"
];

const EmploymentCard = ({ 
    emp, 
    index, 
    isOnly, 
    onUpdate, 
    onDelete 
}) => {
    const [isOpen, setIsOpen] = useState(index === 0);

    const handleInputChange = (field, value) => {
        onUpdate(index, { ...emp, [field]: value });
    };

    return (
        <div className={`employment-card ${isOpen ? 'open' : ''} mb-4`}>
            <div className="employment-card-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                <div className="d-flex align-items-center">
                    <h4 className="employment-card-title m-0">
                        {index + 1}. {emp.organizationName || emp.organization || "Enter Company Name"}
                        {emp.designation ? ` - ${emp.designation}` : ""}
                        {emp.isCurrentCompany ? " (Current)" : ""}
                    </h4>
                </div>
                <div className="d-flex align-items-center">
                    {!isOnly && (
                        <button 
                            type="button"
                            className="btn btn-link text-danger p-0 me-3 delete-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(index);
                            }}
                        >
                            <i className="fa fa-trash-alt me-1"></i>
                            Delete
                        </button>
                    )}
                    <i className={`fa ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </div>
            </div>
            
            <div className="employment-card-body" style={{ display: isOpen ? 'block' : 'none', padding: '20px' }}>
                <div className="row">
                    {/* Basic Company Information */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Company Name <span style={{color: 'red'}}>*</span></label>
                        <input 
                            type="text" 
                            className="form-control"
                            value={emp.organizationName || emp.organization || ""}
                            onChange={(e) => handleInputChange('organizationName', e.target.value)}
                            placeholder="e.g. Google"
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Designation <span style={{color: 'red'}}>*</span></label>
                        <input 
                            type="text" 
                            className="form-control"
                            value={emp.designation || ""}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            placeholder="e.g. Software Engineer"
                        />
                    </div>

                    <div className="col-12 mb-3">
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={emp.isCurrentCompany || false}
                                onChange={(e) => handleInputChange('isCurrentCompany', e.target.checked)}
                                id={`isCurrentCompany-${index}`}
                            />
                            <label className="form-check-label" htmlFor={`isCurrentCompany-${index}`}>
                                This is my current company
                            </label>
                        </div>
                    </div>

                    {/* Experience Duration */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Years of Experience</label>
                        <input 
                            type="number" 
                            className="form-control"
                            min="0"
                            max="50"
                            value={emp.yearsOfExperience || 0}
                            onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Months of Experience</label>
                        <input 
                            type="number" 
                            className="form-control"
                            min="0"
                            max="11"
                            value={emp.monthsOfExperience || 0}
                            onChange={(e) => handleInputChange('monthsOfExperience', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    {/* Compensation & Exit Details - Only for Current Company */}
                    {emp.isCurrentCompany && (
                        <div className="col-12 mt-2">
                            <h5 className="mb-3 border-bottom pb-2">Compensation & Exit</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Present CTC (Annual)</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={emp.presentCTC || ""}
                                        onChange={(e) => handleInputChange('presentCTC', e.target.value)}
                                        placeholder="e.g. 75,000"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Expected CTC</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={emp.expectedCTC || ""}
                                        onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                                        placeholder="e.g. 95,000"
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Notice Period</label>
                                    <select 
                                        className="form-control wt-select-bar-2"
                                        value={emp.noticePeriod || ""}
                                        onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                                    >
                                        <option value="">Select Notice Period</option>
                                        {NOTICE_PERIOD_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                {emp.noticePeriod === "Custom" && (
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Custom Notice Period</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={emp.customNoticePeriod || ""}
                                            onChange={(e) => handleInputChange('customNoticePeriod', e.target.value)}
                                            placeholder="e.g. 45 Days"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Key Responsibilities and Project Details - Now at the bottom */}
                    <div className="col-12 mb-3 mt-3">
                        <label className="form-label">Job Responsibilities</label>
                        <textarea 
                            className="form-control"
                            rows="3"
                            value={emp.description || ""}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your role and main responsibilities..."
                        ></textarea>
                    </div>

                    <div className="col-12 mb-3">
                        <label className="form-label">Project Details</label>
                        <textarea 
                            className="form-control"
                            rows="3"
                            value={emp.projectDetails || ""}
                            onChange={(e) => handleInputChange('projectDetails', e.target.value)}
                            placeholder="Mention key projects you worked on..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

function SectionCanEmployment({ profile, onUpdate }) {
    const [employmentList, setEmploymentList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile?.employment && profile.employment.length > 0) {
            setEmploymentList(profile.employment);
        } else {
            setEmploymentList([{
                organizationName: "",
                designation: "",
                isCurrentCompany: false,
                yearsOfExperience: 0,
                monthsOfExperience: 0,
                presentCTC: "",
                expectedCTC: "",
                noticePeriod: "",
                customNoticePeriod: "",
                description: "",
                projectDetails: ""
            }]);
        }
    }, [profile]);

    const handleUpdate = (index, updatedEmp) => {
        const newList = [...employmentList];
        newList[index] = updatedEmp;
        setEmploymentList(newList);
    };

    const handleDelete = (index) => {
        if (employmentList.length > 1) {
            const newList = employmentList.filter((_, i) => i !== index);
            setEmploymentList(newList);
        }
    };

    const handleAdd = () => {
        setEmploymentList([...employmentList, {
            organizationName: "",
            designation: "",
            isCurrentCompany: false,
            yearsOfExperience: 0,
            monthsOfExperience: 0,
            presentCTC: "",
            expectedCTC: "",
            noticePeriod: "",
            customNoticePeriod: "",
            description: "",
            projectDetails: ""
        }]);
    };

    const handleSave = async () => {
        for (let i = 0; i < employmentList.length; i++) {
            const emp = employmentList[i];
            if (!emp.organizationName && !emp.organization) {
                showError(`Company Name is required for entry #${i + 1}`);
                return;
            }
            if (!emp.designation) {
                showError(`Designation is required for entry #${i + 1}`);
                return;
            }
        }

        setLoading(true);
        try {
            const updateData = { 
                employment: employmentList.map(emp => ({
                    ...emp,
                    organization: emp.organizationName || emp.organization
                }))
            };
            
            const response = await api.updateCandidateProfile(updateData);
            
            if (response && (response.success || response.candidate)) {
                showSuccess("Employment history saved successfully!");
                if (onUpdate) onUpdate();
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showError(response?.message || "Failed to save employment history");
            }
        } catch (error) {
            showError("An error occurred while saving your profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wt-admin-dashboard-msg p-a20 mb-4">
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">Employment History</h4>
                <button 
                    type="button" 
                    className="site-button-link text-primary" 
                    onClick={handleAdd}
                >
                    <i className="fa fa-plus me-2"></i>
                    Add More
                </button>
            </div>
            
            <div className="panel-body wt-panel-body p-a20">
                <div className="employment-flow-container mb-4">
                    {employmentList.map((emp, index) => (
                        <EmploymentCard 
                            key={index}
                            emp={emp}
                            index={index}
                            isOnly={employmentList.length === 1}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                <div className="text-right">
                    <button 
                        type="button" 
                        className="site-button" 
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(SectionCanEmployment);
