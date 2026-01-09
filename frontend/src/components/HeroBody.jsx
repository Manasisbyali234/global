import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBody.css';
import { Megaphone, Banknote, Users, Settings, Tag, Terminal, TrendingUp } from 'lucide-react';

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

  const designations = [
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

  const selectIndustry = (industry) => {
    setSearchData({...searchData, category: industry});
    setShowIndustrySuggestions(false);
    setErrors({...errors, category: ''});
    setTouched({...touched, category: true});
  };

  const handleDesignationChange = (value) => {
    handleFieldChange('what', value);
    
    if (value.length > 0) {
      const filtered = designations.filter(designation => 
        designation.toLowerCase().includes(value.toLowerCase())
      );
      setDesignationSuggestions(filtered);
      setShowDesignationSuggestions(true);
    } else {
      setShowDesignationSuggestions(false);
    }
  };

  const selectDesignation = (designation) => {
    setSearchData({...searchData, what: designation});
    setShowDesignationSuggestions(false);
    setErrors({...errors, what: ''});
    setTouched({...touched, what: true});
  };

  const jobCategories = [
    { icon: Megaphone, name: 'Marketing', count: '1.2k', iconColor: '#2563EB', bgColor: '#EEF4FF' },
    { icon: Banknote, name: 'Finance', count: '850', iconColor: '#059669', bgColor: '#ECFDF5' },
    { icon: Users, name: 'HR', count: '420', iconColor: '#7C3AED', bgColor: '#F5F3FF' },
    { icon: Settings, name: 'Operations', count: '1.1k', iconColor: '#EA580C', bgColor: '#FFF7ED' },
    { icon: Tag, name: 'Design', count: '930', iconColor: '#DB2777', bgColor: '#FDF2F8' },
    { icon: Terminal, name: 'IT', count: '2.4k', iconColor: '#4F46E5', bgColor: '#EEF2FF' },
    { icon: TrendingUp, name: 'Sales', count: '1.5k', iconColor: '#D97706', bgColor: '#FFFBEB' }
  ];

  const handleSearch = () => {
    // Mark all fields as touched
    setTouched({
      what: true,
      category: true,
      type: true,
      location: true
    });
    
    // Validate all fields
    if (!validateAllFields()) {
      alert('Please fix the validation errors before searching');
      return;
    }
    
    const filters = {};
    if (searchData.what && searchData.what !== '') filters.search = searchData.what.trim();
    if (searchData.category && searchData.category !== '') filters.category = searchData.category;
    if (searchData.type && searchData.type !== '') filters.jobType = searchData.type;
    if (searchData.location && searchData.location !== '') filters.location = searchData.location.trim();
    
    // If onSearch prop exists, use it for home page filtering
    if (onSearch && typeof onSearch === 'function') {
      onSearch(filters);
    } else {
      // Navigate to job grid page with filters
      const queryString = Object.keys(filters)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');
      
      navigate(`/job-grid${queryString ? '?' + queryString : ''}`);
    }
  };

  const scrollToTopJobs = () => {
    // Try multiple selectors to find the Top Jobs section
    const selectors = [
      '.twm-jobs-grid-wrap',
      '[data-section="top-jobs"]',
      '.section-content .twm-jobs-grid-wrap',
      '.twm-jobs-list-wrap'
    ];
    
    let topJobsSection = null;
    for (const selector of selectors) {
      topJobsSection = document.querySelector(selector);
      if (topJobsSection) break;
    }
    
    if (topJobsSection) {
      // Ensure smooth scrolling is enabled
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // Calculate offset to account for fixed header
      const headerHeight = 80; // Approximate header height
      const elementPosition = topJobsSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      // Use both methods for better browser compatibility
      try {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } catch (e) {
        // Fallback for older browsers
        topJobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      console.warn('Top Jobs section not found. Available sections:', 
        Array.from(document.querySelectorAll('[class*="job"], [class*="section"]')).map(el => el.className)
      );
    }
  };

  return (
    <div className="hero-body" style={{
      backgroundImage: "url('/assets/images/photo_2025-10-09_11-01-43.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
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
          <div className="search-field">
            <label className="search-label">EDUCATION</label>
            <select 
              className={`search-select${touched.type && errors.type ? ' has-error' : ''}`}
              value={searchData.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              onBlur={() => handleFieldBlur('type')}
            >
              <option value="">Select</option>
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="ITI">ITI</option>
              <option value="Diploma">Diploma</option>
              <option value="Polytechnic">Polytechnic</option>
              <option value="Certificate Course">Certificate Course</option>
              <option value="B.E">B.E</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="B.Com">B.Com</option>
              <option value="BA">BA</option>
              <option value="B.Pharm">B.Pharm</option>
              <option value="B.Arch">B.Arch</option>
              <option value="BDS">BDS</option>
              <option value="MBBS">MBBS</option>
              <option value="BAMS">BAMS (Ayurveda)</option>
              <option value="BHMS">BHMS (Homeopathy)</option>
              <option value="B.V.Sc">B.V.Sc (Veterinary)</option>
              <option value="B.Sc Nursing">B.Sc Nursing</option>
              <option value="GNM">GNM (Nursing)</option>
              <option value="ANM">ANM (Nursing)</option>
              <option value="BHM">BHM (Hotel Management)</option>
              <option value="B.Des">B.Des (Design)</option>
              <option value="B.F.Tech">B.F.Tech (Fashion)</option>
              <option value="B.Sc Agriculture">B.Sc Agriculture</option>
              <option value="LLB">LLB (Law)</option>
              <option value="B.Ed">B.Ed</option>
              <option value="B.P.Ed">B.P.Ed (Physical Education)</option>
              <option value="BFA">BFA (Fine Arts)</option>
              <option value="B.Lib">B.Lib (Library Science)</option>
              <option value="Journalism">Journalism</option>
              <option value="CA">CA (Chartered Accountant)</option>
              <option value="CS">CS (Company Secretary)</option>
              <option value="CMA">CMA (Cost Management)</option>
              <option value="M.E">M.E</option>
              <option value="M.Tech">M.Tech</option>
              <option value="M.Sc">M.Sc</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="M.Com">M.Com</option>
              <option value="MA">MA</option>
              <option value="M.Pharm">M.Pharm</option>
              <option value="M.Arch">M.Arch</option>
              <option value="MDS">MDS</option>
              <option value="MD">MD</option>
              <option value="MS">MS (Surgery)</option>
              <option value="M.V.Sc">M.V.Sc (Veterinary)</option>
              <option value="M.Sc Nursing">M.Sc Nursing</option>
              <option value="MHM">MHM (Hotel Management)</option>
              <option value="M.Des">M.Des (Design)</option>
              <option value="M.Sc Agriculture">M.Sc Agriculture</option>
              <option value="LLM">LLM (Law)</option>
              <option value="M.Ed">M.Ed</option>
              <option value="M.P.Ed">M.P.Ed (Physical Education)</option>
              <option value="MFA">MFA (Fine Arts)</option>
              <option value="M.Lib">M.Lib (Library Science)</option>
              <option value="M.Phil">M.Phil</option>
              <option value="PhD">PhD</option>
              <option value="Post Doctoral">Post Doctoral</option>
            </select>
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
                placeholder="Enter Industry"
              />
              {showIndustrySuggestions && industrySuggestions.length > 0 && (
                <div className="location-suggestions">
                  {industrySuggestions.map((industry, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectIndustry(industry)}
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
                onFocus={() => searchData.what && setShowDesignationSuggestions(true)}
                onBlur={() => {
                  handleFieldBlur('what');
                  setTimeout(() => setShowDesignationSuggestions(false), 200);
                }}
                placeholder="Enter Designation"
              />
              {showDesignationSuggestions && designationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {designationSuggestions.map((designation, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectDesignation(designation)}
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
                placeholder="Enter Location"
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="location-suggestions">
                  {locationSuggestions.map((location, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => selectLocation(location)}
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
          
          <button className="search-btn" onClick={() => {
            // Apply current filters without strict validation for Find Jobs button
            const filters = {};
            if (searchData.what && searchData.what.trim() !== '') filters.search = searchData.what.trim();
            if (searchData.category && searchData.category !== '') filters.category = searchData.category;
            if (searchData.type && searchData.type !== '') filters.education = searchData.type; // Map to education filter
            if (searchData.location && searchData.location.trim() !== '') filters.location = searchData.location.trim();
            
            // Apply filters if onSearch prop exists (for home page)
            if (onSearch && typeof onSearch === 'function') {
              onSearch(filters);
            }
            
            // Scroll to Top Jobs section with a slight delay to ensure filtering is complete
            setTimeout(() => scrollToTopJobs(), 200);
          }}>
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
              {/* Duplicate categories for seamless loop */}
              {[...jobCategories, ...jobCategories].map((category, index) => (
                <div key={index} className="category-card">
                  <div className="category-icon small">
                    {category.icon && React.createElement(category.icon, { size: 20 })}
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes scroll-categories {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default HeroBody;
