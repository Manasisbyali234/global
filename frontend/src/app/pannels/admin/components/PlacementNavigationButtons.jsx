import { useNavigate, useLocation } from 'react-router-dom';
import './placement-navigation-buttons.css';

function PlacementNavigationButtons() {
    const navigate = useNavigate();
    const location = useLocation();

    const buttons = [
        {
            id: 'approved',
            label: 'Approved',
            path: '/admin/admin-placement-approved',
            icon: 'fa-check-circle'
        },
        {
            id: 'excel',
            label: 'Excel Uploads',
            path: '/admin/excel-uploads',
            icon: 'fa-file-excel-o'
        }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="placement-nav-buttons">
            {buttons.map((button) => (
                <button
                    key={button.id}
                    className={`placement-nav-btn ${isActive(button.path) ? 'active' : ''}`}
                    onClick={() => navigate(button.path)}
                >
                    <i className={`fa ${button.icon}`}></i>
                    <span>{button.label}</span>
                </button>
            ))}
        </div>
    );
}

export default PlacementNavigationButtons;