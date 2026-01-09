import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { useState, useEffect } from "react";
import "../../../../../job-categories-consolidated.css";


// Category Roles Modal Component
function CategoryRolesModal({ category, roles, isOpen, onClose }) {
    if (!isOpen || !category) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{category} Job Roles</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {roles.length > 0 ? (
                            <div className="row">
                                {roles.map((role, index) => (
                                    <div key={index} className="col-md-6 mb-2">
                                        <div className="p-2 border rounded">
                                            <h6 className="mb-1">{role}</h6>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No job roles found for this category.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionJobCategories() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryRoles, setCategoryRoles] = useState([]);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [categoryCounts, setCategoryCounts] = useState({});

    const categories = [
        { name: 'Programming', icon: 'flaticon-coding' },
        { name: 'Content Writer', icon: 'flaticon-note' },
        { name: 'Sales & Marketing', icon: 'flaticon-bars' },
        { name: 'Healthcare', icon: 'flaticon-customer-support' },
        { name: 'Human Resources', icon: 'flaticon-user' }
    ];

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs');
            const data = await response.json();
            if (data.success) {
                const counts = {};
                data.jobs.forEach(job => {
                    if (job.category) {
                        counts[job.category] = (counts[job.category] || 0) + 1;
                    }
                });
                setCategoryCounts(counts);
            }
        } catch (error) {
            
        }
    };

    const handleCategoryClick = async (categoryName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/jobs/category/${categoryName}`);
            const data = await response.json();
            if (data.success) {
                setSelectedCategory(categoryName);
                setCategoryRoles(data.roles || []);
                setShowRolesModal(true);
            }
        } catch (error) {
            
        }
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
                                    <div key={index} className="col-lg-3 col-md-6">
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
                                                    {category.name}
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

                <CategoryRolesModal 
                    category={selectedCategory}
                    roles={categoryRoles}
                    isOpen={showRolesModal}
                    onClose={() => setShowRolesModal(false)}
                />
            </div>
        </>
    )
}

export default SectionJobCategories;
