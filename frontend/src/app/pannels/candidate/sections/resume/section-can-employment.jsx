import React, { useEffect, useState, memo, useRef } from "react";
import ReactDOM from "react-dom";
import { api } from "../../../../../utils/api";
import { showSuccess, showError } from '../../../../../utils/popupNotification';
import "./employment-card-styles.css";

const NOTICE_PERIOD_OPTIONS = [
    "30 Days",
    "40 Days",
    "60 Days",
    "Custom"
];

const createEmptyEmployment = () => ({
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
});

const hasEmploymentContent = (emp = {}) => Boolean(
    (emp.organizationName || emp.organization || "").trim() ||
    (emp.designation || "").trim() ||
    Number(emp.yearsOfExperience) > 0 ||
    Number(emp.monthsOfExperience) > 0 ||
    String(emp.presentCTC || "").trim() ||
    String(emp.expectedCTC || "").trim() ||
    String(emp.noticePeriod || "").trim() ||
    String(emp.customNoticePeriod || "").trim() ||
    String(emp.description || "").trim() ||
    String(emp.projectDetails || "").trim() ||
    emp.isCurrentCompany
);

function AutoResizingTextarea({ isVisible = true, style, ...props }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!isVisible || !textareaRef.current) {
            return undefined;
        }

        const syncHeight = () => {
            const textarea = textareaRef.current;
            if (!textarea) {
                return;
            }

            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        syncHeight();
        const frameId = window.requestAnimationFrame(syncHeight);

        return () => window.cancelAnimationFrame(frameId);
    }, [props.value, isVisible]);

    return (
        <textarea
            ref={textareaRef}
            {...props}
            style={{
                resize: "none",
                overflow: "hidden",
                ...style
            }}
        />
    );
}

const EmploymentCard = ({ 
    emp, 
    index, 
    onUpdate, 
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
                        <AutoResizingTextarea
                            className="form-control"
                            rows="3"
                            value={emp.description || ""}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your role and main responsibilities..."
                            isVisible={isOpen}
                        />
                    </div>

                    <div className="col-12 mb-3">
                        <label className="form-label">Project Details</label>
                        <AutoResizingTextarea
                            className="form-control"
                            rows="3"
                            value={emp.projectDetails || ""}
                            onChange={(e) => handleInputChange('projectDetails', e.target.value)}
                            placeholder="Mention key projects you worked on..."
                            isVisible={isOpen}
                        />
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
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEmployment, setSelectedEmployment] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    const handleViewDetails = (emp) => {
        setSelectedEmployment(emp);
        setShowDetailsModal(true);
    };

    useEffect(() => {
        if (profile?.employment && profile.employment.length > 0) {
            setEmploymentList(profile.employment.filter(hasEmploymentContent));
            setIsEditMode(false);
        } else {
            setEmploymentList([createEmptyEmployment()]);
            setIsEditMode(true);
        }
    }, [profile]);

    const handleUpdate = (index, updatedEmp) => {
        const newList = [...employmentList];
        newList[index] = updatedEmp;
        setEmploymentList(newList);
    };

    const handleDeleteFromTable = async (index) => {
        setDeleteIndex(index);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        const index = deleteIndex;
        const previousList = [...employmentList];
        const updatedList = employmentList.filter((_, i) => i !== index);
        setEmploymentList(updatedList);
        setLoading(true);

        try {
            const response = await api.updateCandidateProfile({
                employment: updatedList
            });

            if (response && (response.success || response.candidate)) {
                showSuccess("Employment entry deleted successfully!");
                if (onUpdate) onUpdate();
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                setEmploymentList(previousList);
                showError(response?.message || "Failed to delete employment entry");
            }
        } catch (error) {
            setEmploymentList(previousList);
            showError("An error occurred while deleting employment entry");
        } finally {
            setLoading(false);
            setDeleteIndex(null);
        }
    };

    const [newCardIndex, setNewCardIndex] = useState(null);
    const visibleEmploymentRows = employmentList
        .map((emp, originalIndex) => ({ emp, originalIndex }))
        .filter(({ emp }) => hasEmploymentContent(emp));

    const handleCancel = () => {
        const persistedEmployment = Array.isArray(profile?.employment)
            ? profile.employment.filter(hasEmploymentContent)
            : [];

        setEmploymentList(persistedEmployment);
        setIsEditMode(false);
        setNewCardIndex(null);
    };

    const handleAdd = () => {
        const newIndex = employmentList.length;
        setEmploymentList([...employmentList, createEmptyEmployment()]);
        setNewCardIndex(newIndex);
        setTimeout(() => setNewCardIndex(null), 500);
    };

    const handleSave = async () => {
        const entriesToSave = employmentList.filter(hasEmploymentContent);

        for (let i = 0; i < entriesToSave.length; i++) {
            const emp = entriesToSave[i];
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
                employment: entriesToSave.map(emp => ({
                    ...emp,
                    organization: emp.organizationName || emp.organization
                }))
            };
            
            const response = await api.updateCandidateProfile(updateData);
            
            if (response && (response.success || response.candidate)) {
                showSuccess("Employment history saved successfully!");
                setEmploymentList(entriesToSave);
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
            <p style={{ color: 'red', marginBottom: '15px', fontWeight: '500' }}>Note: Not applicable for freshers.</p>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">Employment History</h4>
                <div className="d-flex gap-2">
                    {!isEditMode ? (
                        <>
                            <button 
                                type="button" 
                                className="site-button-link text-primary" 
                                onClick={() => setIsEditMode(true)}
                            >
                                <i className="fa fa-edit me-2"></i>
                                Edit Details
                            </button>
                            <button 
                                type="button" 
                                className="site-button-link text-primary" 
                                onClick={() => {
                                    setIsEditMode(true);
                                    handleAdd();
                                }}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Add More
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                type="button" 
                                className="site-button-link text-secondary" 
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
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
                    visibleEmploymentRows.length > 0 ? (
                        <div className="table-responsive employment-table-container">
                            <table className="table table-bordered custom-employment-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Organization & Designation</th>
                                        <th>Experience</th>
                                        <th>Compensation (Annual)</th>
                                        <th>Notice Period</th>
                                        <th className="text-center">Details</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleEmploymentRows
                                        .sort((a, b) => {
                                            if (a.emp.isCurrentCompany) return -1;
                                            if (b.emp.isCurrentCompany) return 1;
                                            return 0;
                                        })
                                        .map(({ emp, originalIndex }, index) => (
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
                                                {(emp.description || emp.projectDetails) ? (
                                                    <button 
                                                        className="btn btn-link p-0" 
                                                        onClick={() => handleViewDetails(emp)}
                                                        title="View Details"
                                                    >
                                                        <i className="fa fa-eye" style={{fontSize: '18px', color: '#1967d2'}}></i>
                                                    </button>
                                                ) : "—"}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-danger"
                                                    onClick={() => handleDeleteFromTable(originalIndex)}
                                                    disabled={loading}
                                                    title="Delete entry"
                                                >
                                                    <i className="fa fa-trash-alt" style={{fontSize: '17px'}}></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null
                ) : (
                    <>
                        <div className="employment-flow-container mb-4">
                            {employmentList.map((emp, index) => (
                                <EmploymentCard 
                                    key={index}
                                    emp={emp}
                                    index={index}
                                    onUpdate={handleUpdate}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && ReactDOM.createPortal(
                <div className="modal fade show" style={{
                    display: 'block',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 99999
                }} onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this employment entry?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedEmployment && ReactDOM.createPortal(
                <div className="modal fade show employment-details-modal" style={{
                    display: 'flex',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 99999,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-dialog modal-lg modal-dialog-centered employment-details-dialog" onClick={(e) => e.stopPropagation()} style={{ 
                        zIndex: 99999,
                        position: 'relative',
                        margin: '0 auto'
                    }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedEmployment.organizationName || selectedEmployment.organization} - {selectedEmployment.designation}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body employment-details-body">
                                <div className="employment-details-scroll-region">
                                    {selectedEmployment.description && (
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2">Job Responsibilities:</h6>
                                            <p className="text-muted employment-details-text" style={{whiteSpace: 'pre-wrap'}}>{selectedEmployment.description}</p>
                                        </div>
                                    )}
                                    {selectedEmployment.projectDetails && (
                                        <div>
                                            <h6 className="text-primary mb-2">Project Details:</h6>
                                            <p className="text-muted employment-details-text" style={{whiteSpace: 'pre-wrap'}}>{selectedEmployment.projectDetails}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default memo(SectionCanEmployment);

