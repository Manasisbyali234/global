import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBody.css';
import { Megaphone, Banknote, Users, Settings, Tag, Terminal, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const DEFAULT_DESIGNATIONS = [
  'Data Entry Operator', 'Computer Operator', 'IT Support Assistant', 'Junior Web Developer', 'Software Developer',
  'Full-Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Network Administrator', 'Cybersecurity Analyst',
  'Data Analyst', 'Data Scientist', 'AI/ML Engineer', 'UI/UX Designer', 'Graphic Designer',
  'Motion Designer', '3D Artist', 'Video Editor', 'Digital Marketing Specialist', 'SEO Specialist',
  'Social Media Manager', 'Content Writer', 'Performance Marketer', 'Brand Manager', 'Sales Executive',
  'Business Development Executive', 'Regional Sales Manager', 'Inside Sales Specialist', 'Tele Sales Executive', 'HR Executive',
  'Talent Acquisition Specialist', 'HR Manager', 'L&D Manager', 'Accountant', 'Auditor',
  'Tax Consultant', 'Finance Manager', 'Billing Executive', 'Site Engineer', 'Safety Officer',
  'Doctor', 'Nurse', 'Lab Technician', 'IVF Specialist', 'Pharmacist',
  'Medical Equipment Specialist', 'Teacher', 'Professor', 'HOD', 'Principal',
  'Logistics Coordinator', 'Warehouse Manager', 'Supply Chain Executive', 'Receptionist', 'Chef',
  'Housekeeping Staff', 'Store Manager', 'Cashier', 'Delivery Executive', 'Legal Advisor',
  'Compliance Officer', 'Office Administrator', 'Operations Manager', 'Security Guard', 'Social Worker',
  'Program Coordinator (NGO)', 'Machine Operator', 'Welder', 'Electrician', 'Plumber',
  'Carpenter', 'Technician'
];

const HeroBody = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    what: '',
    category: '',
    type: '',
    location: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [industrySuggestions, setIndustrySuggestions] = useState([]);
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);
  const [educationSuggestions, setEducationSuggestions] = useState([]);
  const [showEducationSuggestions, setShowEducationSuggestions] = useState(false);
  const [designationCatalog, setDesignationCatalog] = useState([]);
  const [designationSuggestions, setDesignationSuggestions] = useState([]);
  const [showDesignationSuggestions, setShowDesignationSuggestions] = useState(false);
  const [errors, setErrors] = useState({
    what: '',
    category: '',
    type: '',
    location: ''
  });
  const [touched, setTouched] = useState({
    what: false,
    category: false,
    type: false,
    location: false
  });

  const locations = [
    'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Allahabad', 'Amritsar', 'Aurangabad', 'Bangalore', 'Bareilly', 'Belgaum',
    'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bilaspur', 'Chandigarh', 'Chennai', 'Coimbatore', 'Cuttack', 'Dehradun', 'Delhi',
    'Dhanbad', 'Durgapur', 'Erode', 'Faridabad', 'Firozabad', 'Ghaziabad', 'Gorakhpur', 'Gulbarga', 'Guntur', 'Gurgaon',
    'Guwahati', 'Gwalior', 'Hubli', 'Hyderabad', 'Indore', 'Jabalpur', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamnagar',
    'Jamshedpur', 'Jodhpur', 'Kanpur', 'Kochi', 'Kolhapur', 'Kolkata', 'Kota', 'Kozhikode', 'Kurnool', 'Lucknow',
    'Ludhiana', 'Madurai', 'Mangalore', 'Meerut', 'Moradabad', 'Mumbai', 'Mysore', 'Nagpur', 'Nashik', 'Nellore',
    'New Delhi', 'Noida', 'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Salem', 'Sangli',
    'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur',
    'Udaipur', 'Ujjain', 'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Remote', 'Work From Home'
  ];

  const industries = [
    'Information Technology (IT) & Software', 'Design & Creative', 'Marketing & Advertising', 'Sales & Business Development',
    'Customer Support & Service', 'Finance & Accounting', 'Human Resources (HR) & Recruitment', 'Engineering & Manufacturing',
    'Construction & Real Estate', 'Healthcare & Medical', 'Education & Training', 'Hospitality & Travel',
    'Retail & Commerce', 'Logistics & Supply Chain', 'Legal & Compliance', 'Administration & Operations',
    'Government & Public Sector', 'Media & Journalism', 'Agriculture & Environment', 'Energy & Utilities',
    'Automobile', 'E-commerce', 'Non-Profit & Social Work', 'Product & Project Management',
    'Cybersecurity', 'Data Science & Analytics', 'AI & Machine Learning', 'Skilled Trades',
    'Security Services', 'Domestic & Care Services'
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchDesignationSuggestions = async () => {
      try {
        const jobsData = await api.getJobs({ limit: 200 });
        const jobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs : [];
        const liveDesignations = Array.from(
          new Map(
            jobs
              .flatMap((job) => [
                String(job?.title || '').trim(),
                String(job?.jobTitle || '').trim(),
                String(job?.designation || '').trim()
              ])
              .filter(Boolean)
              .map((designation) => [designation.toLowerCase(), designation])
          ).values()
        );

        if (isMounted) {
          setDesignationCatalog(liveDesignations.length > 0 ? liveDesignations : DEFAULT_DESIGNATIONS);
        }
      } catch (error) {
        console.error('Error fetching hero designation suggestions:', error);
        if (isMounted) {
          setDesignationCatalog(DEFAULT_DESIGNATIONS);
        }
      }
    };

    fetchDesignationSuggestions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'category':
        // Category is optional, no validation needed
        break;
      case 'what':
        if (value && value.length < 2) {
          error = 'Job title must be at least 2 characters';
        } else if (value && value.length > 100) {
          error = 'Job title must not exceed 100 characters';
        } else if (value && !/^[a-zA-Z0-9\s/\-().&+,]+$/.test(value)) {
          error = 'Job title contains invalid characters';
        }
        break;
      case 'type':
        // Type is optional, no validation needed
        break;
      case 'location':
        if (value && value.length < 2) {
          error = 'Location must be at least 2 characters';
        } else if (value && value.length > 100) {
          error = 'Location must not exceed 100 characters';
        } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Location should only contain letters and spaces';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateAllFields = () => {
    const newErrors = {
      what: validateField('what', searchData.what),
      category: validateField('category', searchData.category),
      type: validateField('type', searchData.type),
      location: validateField('location', searchData.location)
    };
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleFieldChange = (name, value) => {
    setSearchData({...searchData, [name]: value});
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({...errors, [name]: error});
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({...touched, [name]: true});
    const error = validateField(name, searchData[name]);
    setErrors({...errors, [name]: error});
  };

  const handleLocationChange = (value) => {
    handleFieldChange('location', value);
    
    if (value.length > 0) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setSearchData({...searchData, location});
    setShowSuggestions(false);
    setErrors({...errors, location: ''});
    setTouched({...touched, location: true});
  };

  const handleIndustryChange = (value) => {
    handleFieldChange('category', value);
    
    if (value.length > 0) {
      const filtered = industries.filter(industry => 
        industry.toLowerCase().includes(value.toLowerCase())
      );
      setIndustrySuggestions(filtered);
      setShowIndustrySuggestions(true);
    } else {
      setShowIndustrySuggestions(false);
    }
  };

  const educationOptions = [
    '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Polytechnic', 'Certificate Course',
    'B.E', 'B.Tech', 'B.Sc', 'BCA', 'BBA', 'B.Com', 'BA', 'B.Pharm', 'B.Arch', 'BDS',
    'MBBS', 'BAMS (Ayurveda)', 'BHMS (Homeopathy)', 'B.V.Sc (Veterinary)', 'B.Sc Nursing',
    'GNM (Nursing)', 'ANM (Nursing)', 'BHM (Hotel Management)', 'B.Des (Design)',
    'B.F.Tech (Fashion)', 'B.Sc Agriculture', 'LLB (Law)', 'B.Ed', 'B.P.Ed (Physical Education)',
    'BFA (Fine Arts)', 'B.Lib (Library Science)', 'Journalism', 'CA (Chartered Accountant)',
    'CS (Company Secretary)', 'CMA (Cost Management)', 'M.E', 'M.Tech', 'M.Sc', 'MCA', 'MBA',
    'M.Com', 'MA', 'M.Pharm', 'M.Arch', 'MDS', 'MD', 'MS (Surgery)', 'M.V.Sc (Veterinary)',
    'M.Sc Nursing', 'MHM (Hotel Management)', 'M.Des (Design)', 'M.Sc Agriculture', 'LLM (Law)',
    'M.Ed', 'M.P.Ed (Physical Education)', 'MFA (Fine Arts)', 'M.Lib (Library Science)',
    'M.Phil', 'PhD', 'Post Doctoral'
  ];

  const handleEducationChange = (value) => {
    handleFieldChange('type', value);
    if (value.length > 0) {
      const filtered = educationOptions.filter(edu =>
        edu.toLowerCase().includes(value.toLowerCase())
      );
      setEducationSuggestions(filtered);
      setShowEducationSuggestions(true);
    } else {
      setEducationSuggestions(educationOptions.slice(0, 8));
      setShowEducationSuggestions(true);
    }
  };

  const selectEducation = (edu) => {
    setSearchData({...searchData, type: edu});
    setShowEducationSuggestions(false);
    setErrors({...errors, type: ''});
    setTouched({...touched, type: true});
  };

  const selectIndustry = (industry) => {
    setSearchData({...searchData, category: industry});
    setShowIndustrySuggestions(false);
    setErrors({...errors, category: ''});
    setTouched({...touched, category: true});
  };

  const handleDesignationChange = (value) => {
    handleFieldChange('what', value);
    const designationSource = designationCatalog.length > 0 ? designationCatalog : DEFAULT_DESIGNATIONS;
    
    if (value.length > 0) {
      const filtered = designationSource.filter(designation => 
        designation.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setDesignationSuggestions(filtered);
      setShowDesignationSuggestions(true);
    } else {
      setDesignationSuggestions(designationSource.slice(0, 8));
      setShowDesignationSuggestions(true);
    }
  };

  const selectDesignation = (designation) => {
    setSearchData({...searchData, what: designation});
    setShowDesignationSuggestions(false);
    setErrors({...errors, what: ''});
    setTouched({...touched, what: true});
  };

  const jobCategories = [
    { icon: Megaphone, name: 'Marketing', filterValue: 'Marketing', count: '1.2k', iconColor: '#2563EB', bgColor: '#EEF4FF' },
    { icon: Banknote, name: 'Finance', filterValue: 'Finance', count: '850', iconColor: '#059669', bgColor: '#ECFDF5' },
    { icon: Users, name: 'HR', filterValue: 'HR', count: '420', iconColor: '#7C3AED', bgColor: '#F5F3FF' },
    { icon: Settings, name: 'Operations', filterValue: 'Operations', count: '1.1k', iconColor: '#EA580C', bgColor: '#FFF7ED' },
    { icon: Tag, name: 'Design', filterValue: 'Design', count: '930', iconColor: '#DB2777', bgColor: '#FDF2F8' },
    { icon: Terminal, name: 'IT', filterValue: 'IT', count: '2.4k', iconColor: '#4F46E5', bgColor: '#EEF2FF' },
    { icon: TrendingUp, name: 'Sales', filterValue: 'Sales', count: '1.5k', iconColor: '#D97706', bgColor: '#FFFBEB' }
  ];

  const handleCategoryClick = (category) => {
    const queryString = new URLSearchParams({
      category: category.filterValue || category.name
    }).toString();

    navigate(`/job-grid?${queryString}`);
  };

  const buildSearchFilters = () => {
    const filters = {};
    if (searchData.what && searchData.what !== '') filters.search = searchData.what.trim();
    if (searchData.category && searchData.category !== '') filters.category = searchData.category;
    if (searchData.type && searchData.type !== '') filters.education = searchData.type;
    if (searchData.location && searchData.location !== '') filters.location = searchData.location.trim();

    return filters;
  };

  const handleHomeSearch = () => {
    const filters = buildSearchFilters();

    if (onSearch && typeof onSearch === 'function') {
      onSearch(filters);
    } else {
      const queryString = Object.keys(filters)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');

      navigate(`/job-grid${queryString ? '?' + queryString : ''}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    e.stopPropagation();
    handleHomeSearch();
  };

  return (
    <div className="hero-body" style={{
      backgroundImage: "url('/assets/images/photo_2025-10-09_11-01-43.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "500px"
    }}>
      {/* Hero Section */}
      <div className="hero-content">
        <div className="hero-layout">
          <div className="hero-text" style={{ flex: 1, textAlign: 'left' }}>
            <h1 className="hero-title">
              Find the <span className="highlight">job</span> that fits your life
            </h1>
            <p className="hero-subtitle" style={{ color: '#ff9c00' }}>
              Type your keyword, then click search to find your perfect job.
            </p>
            <button 
              onClick={() => navigate('/job-grid')}
              className="hero-cta"
            >
              Explore Jobs
            </button>
          </div>
          <div className="hero-illustration">
            <img 
              src="/assets/images/Resume-amico.svg" 
              alt="Find Job" 
              className="hero-image"
            />
          </div>
        </div>


        {/* Search Bar */}
        <div className="search-container">
          <div className="search-field location-field">
            <label className="search-label">EDUCATION</label>
            <div className="location-input">
              <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                className={`search-select location-select${touched.type && errors.type ? ' has-error' : ''}`}
                value={searchData.type}
                onChange={(e) => handleEducationChange(e.target.value)}
                onFocus={() => {
                  const filtered = searchData.type
                    ? educationOptions.filter(edu => edu.toLowerCase().includes(searchData.type.toLowerCase())).slice(0, 8)
                    : educationOptions.slice(0, 8);
                  setEducationSuggestions(filtered);
                  setShowEducationSuggestions(filtered.length > 0);
                }}
                onBlur={() => {
                  handleFieldBlur('type');
                  setTimeout(() => setShowEducationSuggestions(false), 200);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter Education"
              />
              {showEducationSuggestions && educationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {educationSuggestions.map((edu, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => { e.preventDefault(); selectEducation(edu); }}
                    >
                      {edu}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {touched.type && errors.type && (
              <div className="search-error">
                {errors.type}
              </div>
            )}
          </div>
          
          <div className="search-field location-field">
            <label className="search-label">INDUSTRY</label>
            <div className="location-input">
              <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                className={`search-select location-select${touched.category && errors.category ? ' has-error' : ''}`}
                value={searchData.category}
                onChange={(e) => handleIndustryChange(e.target.value)}
                onFocus={() => searchData.category && setShowIndustrySuggestions(true)}
                onBlur={() => {
                  handleFieldBlur('category');
                  setTimeout(() => setShowIndustrySuggestions(false), 200);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter Industry"
              />
              {showIndustrySuggestions && industrySuggestions.length > 0 && (
                <div className="location-suggestions">
                  {industrySuggestions.map((industry, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => { e.preventDefault(); selectIndustry(industry); }}
                    >
                      {industry}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {touched.category && errors.category && (
              <div className="search-error">
                {errors.category}
              </div>
            )}
          </div>
          
          <div className="search-field location-field">
            <label className="search-label">DESIGNATION</label>
            <div className="location-input">
              <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                className={`search-select location-select${touched.what && errors.what ? ' has-error' : ''}`}
                value={searchData.what}
                onChange={(e) => handleDesignationChange(e.target.value)}
                onFocus={() => {
                  const designationSource = designationCatalog.length > 0 ? designationCatalog : DEFAULT_DESIGNATIONS;
                  const filtered = searchData.what
                    ? designationSource.filter((designation) => designation.toLowerCase().includes(searchData.what.toLowerCase())).slice(0, 8)
                    : designationSource.slice(0, 8);
                  setDesignationSuggestions(filtered);
                  setShowDesignationSuggestions(filtered.length > 0);
                }}
                onBlur={() => {
                  handleFieldBlur('what');
                  setTimeout(() => setShowDesignationSuggestions(false), 200);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter Designation"
              />
              {showDesignationSuggestions && designationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {designationSuggestions.map((designation, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => { e.preventDefault(); selectDesignation(designation); }}
                    >
                      {designation}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {touched.what && errors.what && (
              <div className="search-error">
                {errors.what}
              </div>
            )}
          </div>
          
          <div className="search-field location-field">
            <label className="search-label">LOCATION</label>
            <div className="location-input">
              <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" fill="none"/>
                <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" fill="none"/>
              </svg>
              <input
                type="text"
                className={`search-select location-select${touched.location && errors.location ? ' has-error' : ''}`}
                value={searchData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => searchData.location && setShowSuggestions(true)}
                onBlur={() => {
                  handleFieldBlur('location');
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter Location"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {locationSuggestions.map((location, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => { e.preventDefault(); selectLocation(location); }}
                    >
                      {location}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {touched.location && errors.location && (
              <div className="search-error">
                {errors.location}
              </div>
            )}
          </div>
          
          <button className="search-btn" type="button" onClick={handleHomeSearch}>
            Find Jobs
          </button>
        </div>

        {/* Job Categories Carousel */}
        <div className="categories-container" style={{
          overflow: 'hidden',
          width: '100%'
        }}>
          <div className="categories-carousel" style={{
            width: '100%',
            overflow: 'hidden'
          }}>
            <div className="categories-track">
              {jobCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-icon small">
                    {category.icon && React.createElement(category.icon, { size: 20 })}
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBody;
