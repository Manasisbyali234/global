import { useState, useEffect, useRef } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanKeySkills({ profile }) {
    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [customSkill, setCustomSkill] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const predefinedSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'Rust', 'Scala', 'Perl', 'R', 'MATLAB', 'Groovy', 'Clojure', 'Elixir', 'Haskell',
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Bootstrap', 'jQuery', 'Next.js', 'Nuxt.js', 'Tailwind CSS', 'Material UI', 'Redux', 'Svelte', 'Ember.js', 'Backbone.js', 'Preact', 'Lit', 'Astro',
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis', 'Firebase', 'Cassandra', 'DynamoDB', 'MariaDB', 'CouchDB', 'Elasticsearch', 'Neo4j', 'InfluxDB', 'Memcached',
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'Terraform', 'Ansible', 'CI/CD', 'GitLab', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Heroku', 'DigitalOcean',
        'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'FastAPI', 'Pyramid', 'Tornado', 'Bottle', 'Falcon', 'Gin', 'Echo', 'Fiber',
        'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Android', 'iOS', 'SwiftUI', 'Jetpack Compose', 'NativeScript', 'Cordova',
        'GraphQL', 'REST API', 'Microservices', 'WebSockets', 'gRPC', 'SOAP', 'Protocol Buffers', 'Message Queues', 'RabbitMQ', 'Apache Kafka',
        'Selenium', 'Cypress', 'Jest', 'Mocha', 'Pytest', 'JUnit', 'Postman', 'TestNG', 'Cucumber', 'Appium', 'Playwright', 'Puppeteer',
        'Linux', 'Unix', 'Windows Server', 'Shell Scripting', 'PowerShell', 'Bash', 'Zsh', 'Fish', 'macOS',
        'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Azure DevOps',
        'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'Affinity Designer', 'Protopie', 'Framer',
        'Salesforce', 'SAP', 'ServiceNow', 'Workday', 'Oracle ERP', 'NetSuite', 'Dynamics 365',
        'Power BI', 'Tableau', 'Excel', 'Google Analytics', 'Looker', 'Qlik', 'Sisense', 'Metabase', 'Superset',
        'Hadoop', 'Spark', 'Kafka', 'Airflow', 'ETL', 'Talend', 'Informatica', 'Apache Beam', 'Flink',
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'NLTK', 'Spacy', 'XGBoost', 'LightGBM',
        'Blockchain', 'Ethereum', 'Solidity', 'Web3', 'Bitcoin', 'Hyperledger', 'Truffle', 'Hardhat', 'Foundry',
        'Penetration Testing', 'Ethical Hacking', 'OWASP', 'Security Auditing', 'Burp Suite', 'Metasploit', 'Wireshark', 'Nmap',
        'Project Management', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking', 'Mentoring', 'Coaching',
        'Data Analysis', 'Business Analysis', 'Financial Analysis', 'Marketing', 'Sales', 'Accounting', 'Audit', 'Compliance',
        'Digital Marketing', 'Content Writing', 'SEO', 'Social Media Marketing', 'Email Marketing', 'PPC', 'SEM', 'Copywriting',
        'Software Testing', 'Quality Assurance', 'System Administration', 'Network Administration', 'Database Administration', 'Cloud Administration',
        'Cybersecurity', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning',
        'API Development', 'Web Development', 'Mobile Development', 'Desktop Development', 'Game Development', 'IoT Development',
        'Version Control', 'Code Review', 'Debugging', 'Performance Optimization', 'Refactoring', 'Design Patterns', 'SOLID Principles',
        'Accessibility', 'Responsive Design', 'Progressive Web Apps', 'Server-Side Rendering', 'Static Site Generation', 'Jamstack'
    ];

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
                showSuccess(`${newSkills.length} skill(s) added successfully!`);
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
            addSkill(trimmedSkill);
        }
    };

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
                                        placeholder={selectedSkills.length > 0 ? `${selectedSkills.length} skill(s) selected` : "Search and select skills..."}
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
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #ddd',
                                            borderTop: 'none',
                                            maxHeight: '250px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            borderRadius: '0 0 4px 4px'
                                        }}>
                                            {/* Select All / Clear All Controls */}
                                            {predefinedSkills.filter(skill => !skills.includes(skill) && skill.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 && (
                                                <div style={{
                                                    padding: '8px 12px',
                                                    borderBottom: '2px solid #e0e0e0',
                                                    backgroundColor: '#f8f9fa',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{fontSize: '12px', color: '#666', fontWeight: '500'}}>
                                                        {selectedSkills.length} of {predefinedSkills.filter(skill => !skills.includes(skill) && skill.toLowerCase().includes(searchTerm.toLowerCase())).length} selected
                                                    </span>
                                                    <div style={{display: 'flex', gap: '8px'}}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                const availableSkills = predefinedSkills.filter(skill => !skills.includes(skill) && skill.toLowerCase().includes(searchTerm.toLowerCase()));
                                                                setSelectedSkills(availableSkills);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#0056b3',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px'
                                                            }}
                                                        >
                                                            Select All
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setSelectedSkills([]);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#dc3545',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px'
                                                            }}
                                                        >
                                                            Clear All
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {predefinedSkills
                                                .filter(skill => !skills.includes(skill) && skill.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map(skill => (
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
                                            {predefinedSkills.filter(skill => !skills.includes(skill) && skill.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && searchTerm && (
                                                <div style={{padding: '10px 12px', color: '#999', textAlign: 'center'}}>No skills found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-12 col-md-6 d-flex align-items-end gap-2">
                                <button 
                                    type="button"
                                    className="btn btn-outline-primary flex-fill"
                                    onClick={() => {
                                        handleAddFromDropdown();
                                        setShowDropdown(false);
                                    }}
                                    disabled={selectedSkills.length === 0 || loading}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <i className="fa fa-plus me-1"></i>
                                    Add Skills ({selectedSkills.length})
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                    className="btn btn-outline-primary flex-fill" 
                                    disabled={loading}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <i className="fa fa-keyboard me-1"></i>
                                    Add Custom Skill
                                </button>
                            </div>
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
                                <div className="col-12 col-md-6 d-flex align-items-end" style={{gap: '10px'}}>
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
                        )}

                        {skills.length > 0 ? (
                            <div className="mt-4">
                                <label><i className="fa fa-tags me-1"></i> Your Skills</label>
                                <style>{`
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
                                            max-width: calc(100vw - 110px);
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
                                        <span key={index} className="badge bg-light skill-badge" style={{fontSize: '13px', padding: '8px 12px', borderRadius: '20px', color: '#333', border: '1px solid #ddd', display: 'inline-flex', alignItems: 'center', flexDirection: 'row', maxWidth: '100%'}}>
                                            <i className="fa fa-tag me-2" style={{color: '#0056b3', fontSize: '11px', flexShrink: 0}}></i>
                                            <span className="skill-text" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0}}>{skill}</span>
                                            <button 
                                                className="btn btn-sm ms-2 p-0"
                                                style={{background: 'none', border: 'none', color: '#dc3545', fontSize: '12px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '10px'}}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeSkill(skill);
                                                }}
                                                disabled={loading}
                                                title="Remove skill"
                                                type="button"
                                            >
                                                <i className="fa fa-times"></i>
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
