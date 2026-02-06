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
    onDelete,
    autoOpen 
}) => {
    const [isOpen, setIsOpen] = useState(index === 0 || autoOpen);
    const cardRef = React.useRef(null);

    useEffect(() => {
        if (autoOpen && cardRef.current) {
            setTimeout(() => {
                cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [autoOpen]);

    const handleInputChange = (field, value) => {
        onUpdate(index, { ...emp, [field]: value });
    };

    return (
        <div ref={cardRef} className={`employment-card ${isOpen ? 'open' : ''} mb-4`}>
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
                        <label className="form-label">Is this your Current Company?</label>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name={`isCurrentCompany-${index}`}
                                    checked={emp.isCurrentCompany === true}
                                    onChange={() => handleInputChange('isCurrentCompany', true)}
                                    id={`isCurrentCompany-yes-${index}`}
                                />
                                <label className="form-check-label" htmlFor={`isCurrentCompany-yes-${index}`}>
                                    Yes
                                </label>
                            </div>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name={`isCurrentCompany-${index}`}
                                    checked={emp.isCurrentCompany === false}
                                    onChange={() => handleInputChange('isCurrentCompany', false)}
                                    id={`isCurrentCompany-no-${index}`}
                                />
                                <label className="form-check-label" htmlFor={`isCurrentCompany-no-${index}`}>
                                    No
                                </label>
                            </div>
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
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (profile?.employment && profile.employment.length > 0) {
            setEmploymentList(profile.employment);
            setIsEditMode(false);
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
            setIsEditMode(true);
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

    const [newCardIndex, setNewCardIndex] = useState(null);

    const handleAdd = () => {
        const newIndex = employmentList.length;
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
        setNewCardIndex(newIndex);
        setTimeout(() => setNewCardIndex(null), 500);
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
                setIsEditMode(false);
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
                <div className="d-flex gap-2">
                    {!isEditMode ? (
                        <button 
                            type="button" 
                            className="site-button-link text-primary" 
                            onClick={() => setIsEditMode(true)}
                        >
                            <i className="fa fa-edit me-2"></i>
                            Edit Details
                        </button>
                    ) : (
                        <>
                            {profile?.employment?.length > 0 && (
                                <button 
                                    type="button" 
                                    className="site-button-link text-secondary" 
                                    onClick={() => setIsEditMode(false)}
                                >
                                    Cancel
                                </button>
                            )}
                            <button 
                                type="button" 
                                className="site-button-link text-primary" 
                                onClick={handleAdd}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Add More
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="panel-body wt-panel-body p-a20">
                {!isEditMode ? (
                    <div className="table-responsive employment-table-container">
                        <table className="table table-bordered custom-employment-table">
                            <thead className="table-light">
                                <tr>
                                    <th>Organization & Designation</th>
                                    <th>Experience</th>
                                    <th>Compensation (Annual)</th>
                                    <th>Notice Period</th>
                                    <th className="text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...employmentList].sort((a, b) => {
                                    if (a.isCurrentCompany) return -1;
                                    if (b.isCurrentCompany) return 1;
                                    return 0; // Maintain relative order for previous companies
                                }).map((emp, index) => (
                                    <tr key={index} className={emp.isCurrentCompany ? 'table-success-light' : ''}>
                                        <td>
                                            <div className="font-weight-bold text-primary">
                                                {emp.organizationName || emp.organization || 'N/A'}
                                            </div>
                                            <div className="small text-muted">{emp.designation || 'N/A'}</div>
                                            {emp.isCurrentCompany && <span className="badge-current mt-1">Current</span>}
                                        </td>
                                        <td style={{fontSize: '13px'}}>
                                            {emp.yearsOfExperience || 0}y {emp.monthsOfExperience || 0}m
                                        </td>
                                        <td>
                                            {emp.isCurrentCompany ? (
                                                <div className="small">
                                                    <div><span className="text-muted">Pres:</span> {emp.presentCTC ? `₹${emp.presentCTC} LPA` : '—'}</div>
                                                    <div><span className="text-muted">Exp:</span> {emp.expectedCTC ? `₹${emp.expectedCTC} LPA` : '—'}</div>
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td style={{fontSize: '13px'}}>
                                            {emp.isCurrentCompany ? (
                                                emp.noticePeriod === 'Custom' ? emp.customNoticePeriod : (emp.noticePeriod || '—')
                                            ) : '—'}
                                        </td>
                                        <td className="text-center">
                                            <div className="job-details-summary text-left">
                                                {emp.description && (
                                                    <div className="mb-1">
                                                        <strong>Role:</strong> <span className="text-muted small text-truncate-2">{emp.description}</span>
                                                    </div>
                                                )}
                                                {emp.projectDetails && (
                                                    <div>
                                                        <strong>Projects:</strong> <span className="text-muted small text-truncate-2">{emp.projectDetails}</span>
                                                    </div>
                                                )}
                                                {!emp.description && !emp.projectDetails && "—"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        <div className="employment-flow-container mb-4">
                            {employmentList.map((emp, index) => (
                                <EmploymentCard 
                                    key={index}
                                    emp={emp}
                                    index={index}
                                    isOnly={employmentList.length === 1}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    autoOpen={index === newCardIndex}
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
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(SectionCanEmployment);
