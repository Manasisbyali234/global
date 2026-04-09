import { useState, useEffect, useRef } from "react";
import { api } from "../../../../../utils/api";
import { showError, showWarning } from '../../../../../utils/popupNotification';
import { candidateResumeSkillOptions } from "../../../../../utils/candidateResumeSkillOptions";
function SectionCanKeySkills({ profile }) {
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const predefinedSkills = candidateResumeSkillOptions;

    const dropdownRef = useRef(null);

    useEffect(() => {
        setSkills(profile?.skills || []);
    }, [profile]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addMultipleSkills = async (skillsToAdd) => {
        if (!skillsToAdd || skillsToAdd.length === 0) return;
        
        // Filter out duplicates (case-insensitive)
        const newSkills = skillsToAdd.filter(skillToAdd => 
            !skills.some(skill => skill.toLowerCase() === skillToAdd.toLowerCase())
        );
        
        if (newSkills.length === 0) {
            showWarning('All selected skills are already added!');
            return;
        }
        
        setLoading(true);
        try {
            const updatedSkills = [...skills, ...newSkills];
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                setSelectedSkills([]);
                setCustomSkill('');
                setShowCustomInput(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to add skills');
        } finally {
            setLoading(false);
        }
    };

    const addSkill = async (skillToAdd) => {
        if (!skillToAdd) return;
        
        // Case-insensitive duplicate check
        const skillExists = skills.some(skill => skill.toLowerCase() === skillToAdd.toLowerCase());
        if (skillExists) {
            showWarning(`Skill "${skillToAdd}" is already added!`);
            return;
        }
        
        setLoading(true);
        try {
            const updatedSkills = [...skills, skillToAdd];
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                setCustomSkill('');
                setShowCustomInput(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to add skill');
        } finally {
            setLoading(false);
        }
    };

    const removeSkill = async (skillToRemove) => {
        setLoading(true);
        try {
            const updatedSkills = skills.filter(skill => skill !== skillToRemove);
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to remove skill');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromDropdown = () => {
        if (selectedSkills.length > 0) {
            addMultipleSkills(selectedSkills);
        } else {
            showError('Please select skills from the dropdown first.');
        }
    };

    const toggleSkillSelection = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) 
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleAddCustom = () => {
        const trimmedSkill = customSkill.trim();
        if (trimmedSkill) {
            const matchesPredefined = predefinedSkills.some(
                (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase()
            );
            if (matchesPredefined) {
                setSearchTerm(trimmedSkill);
                setShowDropdown(true);
                showWarning('This skill already exists in the list. Please select it from the dropdown.');
                return;
            }
            addSkill(trimmedSkill);
        }
    };

    const normalizedExistingSkills = new Set(skills.map((skill) => skill.toLowerCase()));
    const availableSkills = predefinedSkills.filter(
        (skill) => !normalizedExistingSkills.has(skill.toLowerCase()) && skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 d-flex justify-content-between align-items-center">
                <h4 className="panel-tittle m-a0">
                    Key Skills<span style={{ color: 'red' }}>*</span>
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-12 col-md-6 mb-2">
                                <label><i className="fa fa-cogs me-1"></i> Select a skill from list</label>
                                <div style={{position: 'relative'}} ref={dropdownRef}>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder={selectedSkills.length > 0 ? `${selectedSkills.length} skill selected` : "Search and select skills..."}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (selectedSkills.length > 0) {
                                                    handleAddFromDropdown();
                                                    setShowDropdown(false);
                                                }
                                            }
                                        }}
                                        disabled={loading}
                                    />
                                    {showDropdown && (
                                        <div className="candidate-skills-dropdown-menu" style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #ddd',
                                            borderTop: 'none',
                                            zIndex: 2000,
                                            borderRadius: '0 0 4px 4px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            {/* Select All / Clear All Controls */}
                                            {availableSkills.length > 0 && (
                                                <div className="candidate-skills-dropdown-actions" style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '2px solid #e0e0e0',
                                                    backgroundColor: '#f8f9fa',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{fontSize: '12px', color: '#666', fontWeight: '500'}}>
                                                        {selectedSkills.length} of {availableSkills.length} selected
                                                    </span>
                                                    <div className="candidate-skills-dropdown-actions-buttons">
                                                        <button
                                                            type="button"
                                                            className="dropdown-clear-all"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setSelectedSkills([]);
                                                            }}
                                                        >
                                                            Clear All
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="dropdown-clear-all"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                handleAddFromDropdown();
                                                                setShowDropdown(false);
                                                            }}
                                                            disabled={selectedSkills.length === 0 || loading}
                                                        >
                                                            Add Skills ({selectedSkills.length})
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="candidate-skills-dropdown-list">
                                            {availableSkills.map(skill => (
                                                    <div
                                                        key={skill}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            toggleSkillSelection(skill);
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #f0f0f0',
                                                            transition: 'background 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            backgroundColor: selectedSkills.includes(skill) ? '#e3f2fd' : 'white'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!selectedSkills.includes(skill)) {
                                                                e.currentTarget.style.background = '#f5f5f5';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = selectedSkills.includes(skill) ? '#e3f2fd' : 'white';
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSkills.includes(skill)}
                                                            onChange={() => {}}
                                                            style={{
                                                                margin: 0,
                                                                cursor: 'pointer',
                                                                accentColor: '#0056b3'
                                                            }}
                                                        />
                                                        <span style={{flex: 1}}>{skill}</span>
                                                    </div>
                                                ))}
                                            {availableSkills.length === 0 && searchTerm && (
                                                <div style={{padding: '10px 12px', color: '#999', textAlign: 'center'}}>No skills found</div>
                                            )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!showCustomInput && (
                                <div className="col-12 col-md-6 mt-1">
                                    <label className="d-none d-md-block invisible">Select a skill from list</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCustomInput(true)}
                                        className="btn btn-outline-primary w-100" 
                                        disabled={loading}
                                        style={{backgroundColor: 'transparent'}}
                                    >
                                        <i className="fa fa-keyboard me-1"></i>
                                        Add Custom Skill
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {showCustomInput && (
                            <div className="row mt-3">
                                <div className="col-12 col-md-6 mb-2">
                                    <label><i className="fa fa-keyboard me-1"></i> Enter custom skill</label>
                                    <input 
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter your custom skill"
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                                        onFocus={() => setShowDropdown(false)}
                                        autoFocus
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="d-none d-md-block invisible">Enter custom skill</label>
                                    <div className="d-flex flex-column flex-md-row align-items-stretch gap-2 mt-2">
                                    <button 
                                        type="button"
                                        className="btn btn-outline-primary flex-fill"
                                        onClick={handleAddCustom}
                                        disabled={!customSkill.trim() || loading}
                                        style={{backgroundColor: 'transparent', marginRight: '8px'}}
                                    >
                                        <i className="fa fa-plus me-1"></i>
                                        Add
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={() => {setShowCustomInput(false); setCustomSkill('');}}
                                        style={{backgroundColor: 'transparent'}}
                                    >
                                        <i className="fa fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {skills.length > 0 ? (
                            <div className="mt-4">
                                <label><i className="fa fa-tags me-1"></i> Your Skills</label>
                                <style>{`
                                    html body .skill-badge .skill-delete-btn {
                                        background-color: transparent !important;
                                        background: transparent !important;
                                        border: none !important;
                                        color: #FF7A00 !important;
                                        cursor: pointer !important;
                                        padding: 0 !important;
                                        margin: 0 !important;
                                        width: 16px !important;
                                        height: 16px !important;
                                        min-width: 16px !important;
                                        min-height: 16px !important;
                                        display: inline-flex !important;
                                        align-items: center !important;
                                        justify-content: center !important;
                                        flex-shrink: 0 !important;
                                        line-height: 1 !important;
                                        font-size: 12px !important;
                                        border-radius: 50% !important;
                                        transition: none !important;
                                        box-shadow: none !important;
                                        outline: none !important;
                                        position: relative !important;
                                        top: auto !important;
                                        right: auto !important;
                                        transform: none !important;
                                    }
                                    html body .skill-badge .skill-delete-btn:hover,
                                    html body .skill-badge .skill-delete-btn:focus,
                                    html body .skill-badge .skill-delete-btn:active {
                                        background-color: transparent !important;
                                        background: none !important;
                                        color: #FF7A00 !important;
                                        box-shadow: none !important;
                                        outline: none !important;
                                    }
                                    html body .skill-badge .skill-delete-btn::before,
                                    html body .skill-badge .skill-delete-btn::after {
                                        display: none !important;
                                        content: none !important;
                                    }
                                    html body .skill-badge .skill-delete-btn i {
                                        background: transparent !important;
                                        background-color: transparent !important;
                                    }
                                    html body .dropdown-clear-all {
                                        background-color: transparent !important;
                                        background: transparent !important;
                                        border: none !important;
                                        color: #dc3545 !important;
                                        font-size: 11px !important;
                                        cursor: pointer !important;
                                        padding: 2px 6px !important;
                                        border-radius: 3px !important;
                                        min-width: auto !important;
                                        min-height: auto !important;
                                        width: auto !important;
                                        height: auto !important;
                                        box-shadow: none !important;
                                        font-weight: 400 !important;
                                    }
                                    @media (max-width: 768px) {
                                        .skill-badge {
                                            width: auto !important;
                                            max-width: 100% !important;
                                            display: inline-flex !important;
                                            margin-right: 8px !important;
                                            margin-bottom: 8px !important;
                                        }
                                    }
                                    @media (max-width: 576px) {
                                        .skill-badge {
                                            font-size: 12px !important;
                                            padding: 6px 10px !important;
                                        }
                                        .skill-badge .skill-text {
                                            max-width: calc(100% - 40px);
                                        }
                                        .skill-badge .btn-sm {
                                            width: 18px !important;
                                            height: 18px !important;
                                            font-size: 10px !important;
                                            margin-left: 10px !important;
                                            display: flex !important;
                                            align-items: center;
                                            justify-content: center;
                                            flex-shrink: 0 !important;
                                        }
                                    }
                                `}</style>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {skills.map((skill, index) => (
                                        <span key={index} className="badge bg-light skill-badge" style={{fontSize: '13px', padding: '6px 12px', borderRadius: '20px', color: '#333', border: '1px solid #ddd', display: 'inline-flex', alignItems: 'center', gap: '6px', flexDirection: 'row', maxWidth: '100%'}}>
                                            <span className="skill-text" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0, lineHeight: '1.2'}}>{skill}</span>
                                            <button 
                                                type="button"
                                                className="skill-delete-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeSkill(skill);
                                                }}
                                                disabled={loading}
                                                title="Remove skill"
                                                style={{
                                                    background: 'none !important',
                                                    backgroundColor: 'transparent !important',
                                                    border: 'none !important',
                                                    boxShadow: 'none !important',
                                                    padding: '0 !important',
                                                    margin: '0 !important',
                                                    display: 'flex !important',
                                                    alignItems: 'center !important',
                                                    justifyContent: 'center !important',
                                                    width: '16px !important',
                                                    height: '16px !important',
                                                    minWidth: '16px !important',
                                                    minHeight: '16px !important',
                                                    cursor: 'pointer !important',
                                                    color: '#FF7A00 !important',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <i className="fa fa-times" style={{
                                                    lineHeight: '1', 
                                                    display: 'block', 
                                                    background: 'none', 
                                                    backgroundColor: 'transparent',
                                                    fontSize: '12px',
                                                    color: '#FF7A00',
                                                    marginTop: '1px'
                                                }}></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-center py-3">
                                <i className="fa fa-info-circle text-muted mb-2" style={{fontSize: '20px'}}></i>
                                <p className="text-muted mb-0">No skills added yet. Select from the list above or add custom skills.</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </>
    )
}
export default SectionCanKeySkills;
