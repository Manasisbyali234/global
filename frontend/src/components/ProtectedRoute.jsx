import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [], requiredRole = null }) => {
    const adminToken = localStorage.getItem('adminToken');
    const subAdminToken = localStorage.getItem('subAdminToken');
    const adminData = localStorage.getItem('adminData');
    const subAdminData = localStorage.getItem('subAdminData');
    const candidateToken = localStorage.getItem('candidateToken');
    const employerToken = localStorage.getItem('employerToken');
    const placementToken = localStorage.getItem('placementToken');

    // Handle role-specific authentication
    if (requiredRole) {
        switch (requiredRole) {
            case 'admin':
                const isAdminAuth = (adminToken && adminData) || (subAdminToken && subAdminData);
                if (!isAdminAuth) {
                    return <Navigate to="/admin-login" replace />;
                }
                break;
            case 'candidate':
                if (!candidateToken) {
                    return <Navigate to="/login" replace />;
                }
                break;
            case 'employer':
                if (!employerToken) {
                    return <Navigate to="/login?tab=employer" replace />;
                }
                break;
            case 'placement':
                if (!placementToken) {
                    return <Navigate to="/login?tab=placement" replace />;
                }
                break;
            default:
                return <Navigate to="/" replace />;
        }
    }

    // Legacy support for allowedRoles (for admin sub-pages)
    if (allowedRoles.length > 0) {
        let userRole = null;
        
        if (adminToken && adminData) {
            userRole = 'admin';
        } else if (subAdminToken && subAdminData) {
            userRole = 'sub-admin';
        }
        
        if (!userRole || !allowedRoles.includes(userRole)) {
            return (
                <div className="content-admin-main">
                    <div className="wt-admin-right-page-header">
                        <h2>Access Denied</h2>
                    </div>
                    <div className="alert alert-danger">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        You don't have permission to access this page. Only main administrators can manage sub-admins.
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;
