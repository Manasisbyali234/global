import { useState, useEffect, useMemo } from "react";

function SectionEmployerSidebar({ onFilterChange }) {
    const [industries, setIndustries] = useState([]);
    const [locations, setLocations] = useState([]);
    const [companyTypes, setCompanyTypes] = useState([]);
    const [establishedYears, setEstablishedYears] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        industry: [],
        teamSize: [],
        companyType: [],
        establishedSince: ''
    });

    // Predefined team size options - matching employer profile page
    const teamSizeOptions = useMemo(() => [
        '1-10',
        '11-50', 
        '51-200',
        '201-500',
        '501-1000',
        '1000+'
    ], []);

    useEffect(() => {
        fetchEmployerData();
    }, []);

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const fetchEmployerData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/employers');
            const data = await response.json();
            if (data.success) {
                const industrySet = new Set();
                const locationSet = new Set();
                const companyTypeSet = new Set();
                const establishedYearSet = new Set();

                data.employers.forEach(emp => {
                    // Extract industry from both industrySector and industry fields
                    const industry = emp.profile?.industrySector || emp.profile?.industry;
                    if (industry && industry !== 'Various Industries') {
                        industrySet.add(industry);
                    }
                    
                    // Extract location from both corporateAddress and location fields
                    const location = emp.profile?.corporateAddress || emp.profile?.location;
                    if (location && location !== 'Multiple Locations') {
                        locationSet.add(location);
                    }
                    
                    // Extract company type
                    if (emp.profile?.companyType) {
                        companyTypeSet.add(emp.profile.companyType);
                    }
                    
                    // Extract established year
                    const establishedYear = emp.establishedSince || emp.profile?.establishedSince;
                    if (establishedYear && establishedYear !== 'Not specified') {
                        establishedYearSet.add(establishedYear);
                    }
                });

                setIndustries(Array.from(industrySet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
                setLocations(Array.from(locationSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
                setCompanyTypes(Array.from(companyTypeSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
                setEstablishedYears(Array.from(establishedYearSet).sort((a, b) => b - a));
            }
        } catch (error) {
            console.error('Error fetching employer data:', error);
        }
    };

    return (
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
                        <h4 className="section-head-small mb-4">Company Name</h4>
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
                                placeholder="Search company" 
                                value={filters.keyword}
                                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                                style={{
                                    borderRadius: '8px'
                                }}
                            />
                        </div>
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
                                onChange={(e) => {
                                    setFilters({...filters, location: e.target.value});
                                    setShowLocationSuggestions(e.target.value.length > 0);
                                }}
                                onFocus={() => setShowLocationSuggestions(filters.location.length > 0)}
                                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                style={{
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
                                            onClick={() => {
                                                setFilters({...filters, location});
                                                setShowLocationSuggestions(false);
                                            }}
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
                        <h4 className="section-head-small mb-4">Industry</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="allIndustry"
                                        checked={!filters.industry || filters.industry.length === 0}
                                        onChange={() => setFilters({...filters, industry: []})}
                                    />
                                    <label className="form-check-label" htmlFor="allIndustry">All Industries</label>
                                </div>
                            </li>
                            {industries.map((industry, index) => (
                                <li key={industry}>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id={`industry${index}`}
                                            value={industry}
                                            checked={filters.industry.includes(industry)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, industry: [...filters.industry, industry]});
                                                } else {
                                                    setFilters({...filters, industry: filters.industry.filter(i => i !== industry)});
                                                }
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`industry${index}`}>
                                            {industry}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Team Size</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="allTeamSize"
                                        checked={!filters.teamSize || filters.teamSize.length === 0}
                                        onChange={() => setFilters({...filters, teamSize: []})}
                                    />
                                    <label className="form-check-label" htmlFor="allTeamSize">All Sizes</label>
                                </div>
                            </li>
                            {teamSizeOptions.map((size) => (
                                <li key={`teamsize-${size}`}>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id={`teamSize-${size}`}
                                            value={size}
                                            checked={filters.teamSize.includes(size)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, teamSize: [...filters.teamSize, size]});
                                                } else {
                                                    setFilters({...filters, teamSize: filters.teamSize.filter(s => s !== size)});
                                                }
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`teamSize-${size}`}>
                                            {size}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="twm-sidebar-ele-filter">
                        <h4 className="section-head-small mb-4">Company Type</h4>
                        <ul>
                            <li>
                                <div className="form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="allCompanyType"
                                        checked={!filters.companyType || filters.companyType.length === 0}
                                        onChange={() => setFilters({...filters, companyType: []})}
                                    />
                                    <label className="form-check-label" htmlFor="allCompanyType">All Types</label>
                                </div>
                            </li>
                            {companyTypes.map((type, index) => (
                                <li key={type}>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input" 
                                            id={`companyType${index}`}
                                            value={type}
                                            checked={filters.companyType.includes(type)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFilters({...filters, companyType: [...filters.companyType, type]});
                                                } else {
                                                    setFilters({...filters, companyType: filters.companyType.filter(t => t !== type)});
                                                }
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`companyType${index}`}>
                                            {type}
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="form-group mb-4">
                        <h4 className="section-head-small mb-4">Established Since</h4>
                        <select 
                            className="form-control"
                            value={filters.establishedSince}
                            onChange={(e) => setFilters({...filters, establishedSince: e.target.value})}
                        >
                            <option value="">All Years</option>
                            {establishedYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mt-4">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary btn-sm w-100"
                            onClick={() => setFilters({
                                keyword: '',
                                location: '',
                                industry: [],
                                teamSize: [],
                                companyType: [],
                                establishedSince: ''
                            })}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SectionEmployerSidebar;
