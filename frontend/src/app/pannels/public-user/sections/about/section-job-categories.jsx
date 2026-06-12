import { NavLink, useNavigate } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { useState, useEffect } from "react";
import "../../../../../job-categories-consolidated.css";


function SectionJobCategories() {
    const navigate = useNavigate();
    const [categoryCounts, setCategoryCounts] = useState({});

    const categories = [
        { name: 'Information Technology', label: 'Programming', icon: 'flaticon-coding' },
        { name: 'Writing and Editing', label: 'Content Writing', icon: 'flaticon-note' },
        { name: 'Marketing and Sales', label: 'Sales & Marketing', icon: 'flaticon-bars' },
        { name: 'Health Care', label: 'Healthcare', icon: 'flaticon-customer-support' },
        { name: 'Human Resources', label: 'Human Resources', icon: 'flaticon-user', hideOnMobile: true }
    ];

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs/filter-counts');
            const data = await response.json();
            if (data.success && data.counts && data.counts.categories) {
                const counts = {};
                data.counts.categories.forEach(([name, count]) => {
                    counts[name] = count;
                });
                setCategoryCounts(counts);
            }
        } catch (error) {
            
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`${publicUser.jobs.GRID}?category=${encodeURIComponent(categoryName)}`);
    };

    return (
        <>
            <div className="section-full p-t120 p-b90 site-bg-gray twm-job-categories-hpage-6-area">
                {/* title="" START*/}
                <div className="section-head center wt-small-separator-outer">
                    <div className="wt-small-separator site-text-primary">
                        <div>Jobs by Categories</div>
                    </div>
                    <h2 className="wt-title">Choose Your Desire Category</h2>
                </div>
                {/* title="" END*/}
                <div className="container">
                    <div className="twm-job-categories-section-2 m-b30">
                        <div className="job-categories-style1 m-b30">
                            <div className="row">
                                {categories.map((category, index) => (
                                    <div key={index} className={`col-lg-3 col-md-6${category.hideOnMobile ? ' d-none d-md-block' : ''}`}>
                                        <div className="job-categories-block-2 m-b30" 
                                             style={{cursor: 'pointer'}} 
                                             onClick={() => handleCategoryClick(category.name)}>
                                            <div className="twm-media">
                                                <div className={category.icon} />
                                            </div>
                                            <div className="twm-content">
                                                <div className="twm-jobs-available">
                                                    {categoryCounts[category.name] || 0} Jobs
                                                </div>
                                                <span style={{color: '#1967d2', textDecoration: 'none'}}>
                                                    {category.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                        <div className="text-center job-categories-btn">
                            <NavLink to={publicUser.jobs.GRID} className="site-button">All Categories</NavLink>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default SectionJobCategories;
