import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../../globals/route-names";
import SectionSideAdvert from "./section-side-advert";
import { useState, useEffect } from "react";
import "../../../../../../custom-tags.css";
import "../../../../../../remove-tag-hover.css";
import "../../../../../../circular-checkbox.css";

function SectionJobsSidebar1 ({ onFilterChange }) {
    const [jobTypes, setJobTypes] = useState([]);
    const [jobTitles, setJobTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: [],
        employmentType: [],
        jobTitle: '',
        skills: [],
        category: [],
        education: []
    });

    const educationLevels = ["Any", "10th Pass", "12th Pass", "Diploma", "B.E", "B.Tech", "B.Sc", "BCA", "BBA", "B.Com", "BA", "M.E", "M.Tech", "M.Sc", "MCA", "MBA", "M.Com", "MA", "PhD"];

    const skillCategories = [
        'Developer',
        'Python',
        'React',
        'JavaScript',
        'Node.js',
        'Java',
        'Tester',
        'QA Engineer',
        'DevOps',
        'UI/UX Designer',
        'Data Analyst',
        'Machine Learning',
        'Angular',
        'Vue.js',
        'PHP',
        'C++',
        '.NET',
        'Mobile Developer',
        'Flutter',
        'React Native',
        'TypeScript',
        'MongoDB',
        'MySQL',
        'PostgreSQL',
        'AWS',
        'Azure',
        'Docker',
        'Kubernetes',
        'Git',
        'HTML',
        'CSS',
        'Bootstrap',
        'Express',
        'Django',
        'Spring Boot',
        'Laravel',
        'Ruby on Rails',
        'Golang',
        'Rust',
        'Swift',
        'Kotlin',
        'C#',
        'Redux',
        'GraphQL',
        'REST API',
        'Microservices',
        'CI/CD',
        'Jenkins',
        'Terraform',
        'Ansible',
        'Linux',
        'Agile',
        'Scrum',
        'Figma',
        'Adobe XD',
        'Salesforce',
        'Power BI',
        'Tableau',
        'Excel',
        'AI',
        'Deep Learning',
        'Data Science',
        'Big Data',
        'Hadoop',
        'Spark',
        'Blockchain',
        'Cybersecurity',
        'Penetration Testing',
        'Cloud Computing',
        'Serverless',
        'Firebase',
        'Next.js',
        'Nuxt.js',
        'Tailwind CSS',
        'Material UI',
        'Selenium',
        'Cypress',
        'Jest',
        'Mocha',
        'Postman',
        'Jira',
        'Confluence'
    ];

    useEffect(() => {
        fetchJobTypes();
        fetchJobTitles();
        fetchLocations();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success && data.jobs && data.jobs.length > 0) {
                const categoryCounts = {};
                data.jobs.forEach(job => {
                    if (job.category) {
                        categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
                    }
                });
                
                setCategories(Object.entries(categoryCounts));
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success && data.jobs && data.jobs.length > 0) {
                const allLocations = [];
                data.jobs.forEach(job => {
                    if (job.location) {
                        if (Array.isArray(job.location)) {
                            allLocations.push(...job.location);
                        } else {
                            allLocations.push(job.location);
                        }
                    }
                });
                const dbLocations = [...new Set(allLocations)].filter(location => location).sort();
                setLocations(dbLocations);
            } else {
                setLocations([]);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocations([]);
        }
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setFilters({...filters, location: value});
        setShowLocationSuggestions(value.length > 0);
    };

    const selectLocation = (location) => {
        setFilters({...filters, location});
        setShowLocationSuggestions(false);
    };

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const fetchJobTypes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success && data.jobs && data.jobs.length > 0) {
                // Count job types
                const typeCounts = {};
                data.jobs.forEach(job => {
                    const type = job.jobType || 'Full-Time';
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                
                setJobTypes(Object.entries(typeCounts).filter(([type, count]) => count > 0));
            } else {
                setJobTypes([]);
            }
        } catch (error) {
            console.error('Error fetching job types:', error);
            setJobTypes([]);
        }
    };

    const fetchJobTitles = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs?limit=1000');
            const data = await response.json();
            if (data.success && data.jobs && data.jobs.length > 0) {
                const allKeywords = new Set();
                
                data.jobs.forEach(job => {
                    if (job.title) allKeywords.add(job.title);
                    if (job.requiredSkills && Array.isArray(job.requiredSkills)) {
                        job.requiredSkills.forEach(skill => allKeywords.add(skill));
                    }
                    if (job.description) {
                        const techWords = ['React', 'Angular', 'Vue', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Django', 'Spring', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Bootstrap', 'jQuery', 'Express', 'API', 'REST', 'GraphQL', 'Redux', 'DevOps', 'Linux', 'Windows', 'iOS', 'Android', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'C++', 'C#', '.NET', 'Ruby', 'Rails', 'Golang', 'Rust', 'Scala', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Jira', 'Figma', 'Photoshop', 'Illustrator', 'Unity', 'Salesforce', 'Tableau', 'Power BI', 'Excel', 'Machine Learning', 'AI', 'Data Science', 'Big Data', 'Cloud', 'Cybersecurity', 'Blockchain', 'UI', 'UX', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Web', 'Database', 'Testing', 'QA', 'Automation'];
                        techWords.forEach(word => {
                            if (job.description.toLowerCase().includes(word.toLowerCase())) {
                                allKeywords.add(word);
                            }
                        });
                    }
                });
                
                setJobTitles(Array.from(allKeywords).sort());
            } else {
                setJobTitles([]);
            }
        } catch (error) {
            console.error('Error fetching job titles:', error);
            setJobTitles([]);
        }
    };

    return (
        <>
            <div className="side-bar" style={{backgroundColor: 'transparent', background: 'transparent'}}>
                <style>{`
                    .search-bx .form-control {
                        padding-left: 65px !important;
                    }
                    .search-bx i[class^="feather-"] {
                        left: 20px !important;
                        font-size: 18px !important;
                    }
                    .side-bar {
                        background-color: transparent !important;
                        background: transparent !important;
                    }
                `}</style>
                <div className="sidebar-elements search-bx">
                    <form>
                        <div className="form-group mb-4 position-relative">
                            <h4 className="section-head-small mb-4">Designation ({jobTitles.length} available)</h4>
                            <div className="position-relative">
                                <i className="feather-search" style={{
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    color: '#666'
                                }} />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search job title" 
                                    value={filters.keyword}
                                    onChange={(e) => {
                                        setFilters({...filters, keyword: e.target.value});
                                        setShowJobTitleSuggestions(e.target.value.length > 0);
                                    }}
                                    onFocus={() => setShowJobTitleSuggestions(filters.keyword.length > 0)}
                                    onBlur={() => setTimeout(() => setShowJobTitleSuggestions(false), 200)}
                                    style={{
                                        background: 'transparent', 
                                        border: '1px solid #ddd',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            {showJobTitleSuggestions && jobTitles.length > 0 && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                    {jobTitles
                                        .filter(title => title && title.toLowerCase().includes(filters.keyword.toLowerCase()))
                                        .slice(0, 10)
                                        .map((title) => (
                                            <div 
                                                key={title} 
                                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                onClick={() => {
                                                    setFilters({...filters, keyword: title});
                                                    setShowJobTitleSuggestions(false);
                                                }}
                                                style={{cursor: 'pointer'}}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <i className="feather-briefcase me-2"></i>{title}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        <div className="form-group mb-4 position-relative">
                            <h4 className="section-head-small mb-4">Location ({locations.length} available)</h4>
                            <div className="position-relative">
                                <i className="feather-map-pin" style={{
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    color: '#666'
                                }} />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search location" 
                                    value={filters.location}
                                    onChange={handleLocationChange}
                                    onFocus={() => setShowLocationSuggestions(filters.location.length > 0)}
                                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                    style={{
                                        background: 'transparent', 
                                        border: '1px solid #ddd',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                            {showLocationSuggestions && (
                                <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                                    {locations
                                        .filter(location => location.toLowerCase().includes(filters.location.toLowerCase()))
                                        .slice(0, 10)
                                        .map((location, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                onClick={() => selectLocation(location)}
                                                style={{cursor: 'pointer'}}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <i className="feather-map-pin me-2"></i>{location}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Job Type</h4>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="jobTypeAll"
                                            checked={!filters.jobType || filters.jobType.length === 0}
                                            onChange={() => setFilters({...filters, jobType: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="jobTypeAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.jobType || filters.jobType.length === 0) ? '600' : 'normal'}}>
                                            All Types
                                        </label>
                                    </div>
                                </li>
                                {jobTypes.length > 0 ? jobTypes.map(([type, count], index) => (
                                    <li key={type} style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id={`jobType${index}`}
                                                value={type}
                                                checked={filters.jobType.includes(type)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({...filters, jobType: [...filters.jobType, type]});
                                                    } else {
                                                        setFilters({...filters, jobType: filters.jobType.filter(t => t !== type)});
                                                    }
                                                }}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`jobType${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.jobType.includes(type) ? '600' : 'normal'}}>
                                                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </label>
                                        </div>
                                        <span className="twm-job-type-count" style={{fontSize: '14px', color: '#000', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'}}>{count}</span>
                                    </li>
                                )) : (
                                    <li style={{color: '#666', fontSize: '14px', padding: '10px 0'}}>Loading job types...</li>
                                )}
                            </ul>
                        </div>
                        
                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Skills & Technologies</h4>
                            <ul style={{maxHeight: '300px', overflowY: 'auto', listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="skillAll"
                                            checked={!filters.skills || filters.skills.length === 0}
                                            onChange={() => setFilters({...filters, skills: []})}
                                        />
                                        <label className="form-check-label" htmlFor="skillAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.skills || filters.skills.length === 0) ? '600' : 'normal'}}>
                                            All Skills
                                        </label>
                                    </div>
                                </li>
                                {skillCategories.map((skill, index) => (
                                    <li key={skill} style={{marginBottom: '10px'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id={`skill${index}`}
                                                value={skill}
                                                checked={filters.skills.includes(skill)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({...filters, skills: [...filters.skills, skill]});
                                                    } else {
                                                        setFilters({...filters, skills: filters.skills.filter(s => s !== skill)});
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`skill${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.skills.includes(skill) ? '600' : 'normal'}}>
                                                {skill}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Qualification</h4>
                            <ul style={{listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto'}}>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="educationAll"
                                            checked={!filters.education || filters.education.length === 0}
                                            onChange={() => setFilters({...filters, education: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="educationAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.education || filters.education.length === 0) ? '600' : 'normal'}}>
                                            Any Qualification
                                        </label>
                                    </div>
                                </li>
                                {educationLevels.filter(level => level !== "Any").map((level, index) => (
                                    <li key={level} style={{marginBottom: '10px'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id={`education${index}`}
                                                value={level}
                                                checked={filters.education.includes(level)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({...filters, education: [...filters.education, level]});
                                                    } else {
                                                        setFilters({...filters, education: filters.education.filter(edu => edu !== level)});
                                                    }
                                                }}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`education${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.education.includes(level) ? '600' : 'normal'}}>
                                                {level}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Type of Employment</h4>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="AllEmployment" 
                                            checked={!filters.employmentType || filters.employmentType.length === 0}
                                            onChange={() => setFilters({...filters, employmentType: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="AllEmployment" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.employmentType || filters.employmentType.length === 0) ? '600' : 'normal'}}>All Types</label>
                                    </div>
                                </li>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="Permanent1" 
                                            value="permanent"
                                            checked={filters.employmentType.includes('permanent')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, employmentType: [...filters.employmentType, 'permanent']});
                                                } else {
                                                    setFilters({...filters, employmentType: filters.employmentType.filter(t => t !== 'permanent')});
                                                }
                                            }}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="Permanent1" style={{fontSize: '14px', color: '#333', fontWeight: filters.employmentType.includes('permanent') ? '600' : 'normal'}}>Permanent</label>
                                    </div>
                                </li>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="Temporary1" 
                                            value="temporary"
                                            checked={filters.employmentType.includes('temporary')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, employmentType: [...filters.employmentType, 'temporary']});
                                                } else {
                                                    setFilters({...filters, employmentType: filters.employmentType.filter(t => t !== 'temporary')});
                                                }
                                            }}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="Temporary1" style={{fontSize: '14px', color: '#333', fontWeight: filters.employmentType.includes('temporary') ? '600' : 'normal'}}>Temporary</label>
                                    </div>
                                </li>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="Freelance1" 
                                            value="freelance"
                                            checked={filters.employmentType.includes('freelance')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, employmentType: [...filters.employmentType, 'freelance']});
                                                } else {
                                                    setFilters({...filters, employmentType: filters.employmentType.filter(t => t !== 'freelance')});
                                                }
                                            }}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="Freelance1" style={{fontSize: '14px', color: '#333', fontWeight: filters.employmentType.includes('freelance') ? '600' : 'normal'}}>Freelance</label>
                                    </div>
                                </li>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="Consultant1" 
                                            value="consultant"
                                            checked={filters.employmentType.includes('consultant')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, employmentType: [...filters.employmentType, 'consultant']});
                                                } else {
                                                    setFilters({...filters, employmentType: filters.employmentType.filter(t => t !== 'consultant')});
                                                }
                                            }}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="Consultant1" style={{fontSize: '14px', color: '#333', fontWeight: filters.employmentType.includes('consultant') ? '600' : 'normal'}}>Consultant</label>
                                    </div>
                                </li>
                                <li style={{marginBottom: '10px'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="Trainee1" 
                                            value="trainee"
                                            checked={filters.employmentType.includes('trainee')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, employmentType: [...filters.employmentType, 'trainee']});
                                                } else {
                                                    setFilters({...filters, employmentType: filters.employmentType.filter(t => t !== 'trainee')});
                                                }
                                            }}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="Trainee1" style={{fontSize: '14px', color: '#333', fontWeight: filters.employmentType.includes('trainee') ? '600' : 'normal'}}>Trainee</label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="twm-sidebar-ele-filter">
                            <h4 className="section-head-small mb-4">Job Category</h4>
                            <ul style={{listStyle: 'none', padding: 0}}>
                                <li style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div className="form-check" style={{margin: 0}}>
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id="categoryAll"
                                            checked={!filters.category || filters.category.length === 0}
                                            onChange={() => setFilters({...filters, category: []})}
                                            style={{marginRight: '8px'}}
                                        />
                                        <label className="form-check-label" htmlFor="categoryAll" style={{fontSize: '14px', color: '#333', fontWeight: (!filters.category || filters.category.length === 0) ? '600' : 'normal'}}>
                                            All Categories
                                        </label>
                                    </div>
                                </li>
                                {categories.length > 0 ? categories.map(([category, count], index) => (
                                    <li key={category} style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div className="form-check" style={{margin: 0}}>
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                id={`category${index}`}
                                                value={category}
                                                checked={filters.category.includes(category)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({...filters, category: [...filters.category, category]});
                                                    } else {
                                                        setFilters({...filters, category: filters.category.filter(c => c !== category)});
                                                    }
                                                }}
                                                style={{marginRight: '8px'}}
                                            />
                                            <label className="form-check-label" htmlFor={`category${index}`} style={{fontSize: '14px', color: '#333', fontWeight: filters.category.includes(category) ? '600' : 'normal'}}>
                                                {category}
                                            </label>
                                        </div>
                                        <span className="twm-job-type-count" style={{fontSize: '14px', color: '#000', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'}}>{count}</span>
                                    </li>
                                )) : (
                                    <li style={{color: '#666', fontSize: '14px', padding: '10px 0'}}>Loading categories...</li>
                                )}
                            </ul>
                        </div>



                        <div className="form-group mt-4">
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary btn-sm w-100"
                                onClick={() => {
                                    setFilters({
                                        keyword: '',
                                        location: '',
                                        jobType: [],
                                        employmentType: [],
                                        jobTitle: '',
                                        skills: [],
                                        category: [],
                                        education: []
                                    });
                                    setShowLocationSuggestions(false);
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </form>
                </div>
                

            </div>
            {/* <SectionSideAdvert />    */}
        </>
    )
}

export default SectionJobsSidebar1;
