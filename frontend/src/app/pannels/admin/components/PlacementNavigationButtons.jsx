import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../../utils/api';
import './placement-navigation-buttons.css';

function PlacementNavigationButtons() {
    const navigate = useNavigate();
    const location = useLocation();
    const [hasPendingBatchUploads, setHasPendingBatchUploads] = useState(false);

    useEffect(() => {
        const fetchPendingBatchUploads = async () => {
            try {
                const response = await api.getAllPlacements();
                if (response.success) {
                    const placements = response.data || [];
                    const hasPendingUploads = placements.some((placement) =>
                        (placement.fileHistory || []).some((file) => file.status === 'pending')
                    );
                    setHasPendingBatchUploads(hasPendingUploads);
                }
            } catch (error) {
                console.error('Error checking pending batch uploads:', error);
            }
        };

        fetchPendingBatchUploads();
    }, []);

    const buttons = [
        {
            id: 'approved',
            label: 'Approved',
            path: '/manage/xK9mP2/admin-placement-approved',
            icon: 'fa-check-circle'
        },
        {
            id: 'excel',
            label: 'Excel Uploads',
            path: '/manage/xK9mP2/excel-uploads',
            icon: 'fa-file-excel-o'
        },
        {
            id: 'batch-uploads',
            label: 'Batch Uploads',
            path: '/manage/xK9mP2/placement-batch-upload',
            icon: 'fa-list-alt'
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
                    {button.id === 'batch-uploads' && hasPendingBatchUploads && (
                        <span className="placement-nav-btn__dot" title="New batch uploads pending approval"></span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default PlacementNavigationButtons;
