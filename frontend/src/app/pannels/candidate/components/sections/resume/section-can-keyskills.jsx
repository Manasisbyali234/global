import { useState, useEffect } from "react";
import { api } from "../../../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../../../utils/popupNotification';

function SectionCanKeySkills({ profile }) {
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [customSkill, setCustomSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const predefinedSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Bootstrap', 'jQuery',
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Project Management', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
        'Data Analysis', 'Business Analysis', 'Financial Analysis', 'Marketing', 'Sales', 'Accounting',
        'Digital Marketing', 'Content Writing', 'SEO', 'Social Media Marketing',
        'Software Testing', 'Quality Assurance', 'System Administration', 'Network Administration',
        'Cybersecurity', 'Data Science', 'Machine Learning', 'Artificial Intelligence'
    ];

    useEffect(() => {
        setSkills(profile?.skills || []);
    }, [profile]);

    const addSkill = async (skillToAdd) => {
        if (!skillToAdd) return;
        
        if (skills.includes(skillToAdd)) {
            showWarning(`Skill "${skillToAdd}" is already added!`);
            return;
        }
        
        setLoading(true);
        try {
            const updatedSkills = [...skills, skillToAdd];
            const response = await api.updateCandidateProfile({ skills: updatedSkills });
            if (response.success) {
                setSkills(updatedSkills);
                setSelectedSkill('');
                setCustomSkill('');
                setShowCustomInput(false);
                showSuccess(`Skill "${skillToAdd}" added successfully!`);
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
                showSuccess(`Skill "${skillToRemove}" removed successfully!`);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            showError('Failed to remove skill');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromDropdown = () => {
        if (selectedSkill === 'custom') {
            setShowCustomInput(true);
        } else if (selectedSkill) {
            addSkill(selectedSkill);
        }
    };

    const handleAddCustom = () => {
        if (customSkill.trim()) {
            addSkill(customSkill.trim());
        }
    };
    
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0 mb-3">
                    <i className="fa fa-cogs site-text-primary me-2"></i>
                    Key Skills
                </h4>
                
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <select 
                        className="form-select" 
                        style={{width: '300px', height: '40px', fontSize: '13px', padding: '8px 12px'}}
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select a skill from list</option>
                        {predefinedSkills.filter(skill => !skills.includes(skill)).map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                        ))}
                    </select>
                    
                    <button 
                        type="button"
                        className="btn btn-sm"
                        style={{backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '6px 16px', fontSize: '13px', height: '36px', minWidth: '70px', lineHeight: '1.2'}}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddFromDropdown();
                        }}
                        disabled={!selectedSkill || loading}
                    >
                        <i className="fa fa-plus me-1" style={{color: 'white'}}></i>
                        Add
                    </button>
                    
                    <button 
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        style={{padding: '6px 16px', fontSize: '13px', height: '36px', minWidth: '90px', lineHeight: '1.2'}}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowCustomInput(true);
                        }}
                        disabled={loading || showCustomInput}
                    >
                        <i className="fa fa-keyboard me-1"></i>
                        Manual
                    </button>
                </div>
                
                {showCustomInput && (
                    <div className="p-3 mb-3 bg-light rounded border">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <input 
                                className="form-control"
                                style={{width: '250px', height: '36px', fontSize: '13px'}}
                                type="text"
                                placeholder="Enter your custom skill"
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                                autoFocus
                            />
                            <button 
                                className="btn btn-sm"
                                style={{backgroundColor: '#ff9966', color: 'white', border: 'none', padding: '6px 16px', fontSize: '13px', height: '36px', minWidth: '70px', lineHeight: '1.2'}}
                                onClick={handleAddCustom}
                                disabled={!customSkill.trim() || loading}
                            >
                                <i className="fa fa-check me-1" style={{color: 'white'}}></i>
                                Add
                            </button>
                            <button 
                                className="btn btn-sm btn-secondary"
                                style={{padding: '6px 16px', fontSize: '13px', height: '36px', minWidth: '80px', lineHeight: '1.2'}}
                                onClick={() => {setShowCustomInput(false); setCustomSkill(''); setSelectedSkill('');}}
                            >
                                <i className="fa fa-times me-1"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="panel-body wt-panel-body p-a20">
                {skills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span key={index} className="badge bg-white d-flex align-items-center" style={{fontSize: '13px', padding: '6px 10px', borderRadius: '15px', color: '#333', border: '1px solid #ddd'}}>
                                <i className="fa fa-tag me-2" style={{color: '#0056b3', fontSize: '11px'}}></i>
                                {skill}
                                <button 
                                    className="btn btn-sm ms-2 p-0"
                                    style={{background: 'none', border: 'none', color: '#000', fontSize: '11px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                    onClick={() => removeSkill(skill)}
                                    disabled={loading}
                                    title="Remove skill"
                                >
                                    <i className="fa fa-times"></i>
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <i className="fa fa-info-circle text-muted mb-2" style={{fontSize: '20px'}}></i>
                        <p className="text-muted mb-0" style={{fontSize: '14px'}}>No skills added yet. Use the options above to add your skills.</p>
                    </div>
                )}
            </div>
        </>
    )
}
export default SectionCanKeySkills;