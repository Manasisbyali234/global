import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobZImage from "../../../common/jobz-img";
import CountUp from "react-countup";
import AdminDashboardActivityChart from "../common/admin-graph";
import { api } from "../../../../utils/api";
import "./admin-dashboard-styles.css";

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        completedProfileCandidates: 0,
        approvedEmployers: 0,
        activeJobs: 0,
        totalPlacements: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subAdminProfile, setSubAdminProfile] = useState(null);
    const [isSubAdmin, setIsSubAdmin] = useState(false);

    useEffect(() => {
        checkUserRole();
        fetchStats();
    }, []);

    const checkUserRole = () => {
        const subAdminData = localStorage.getItem('subAdminData');
        if (subAdminData) {
            setIsSubAdmin(true);
            fetchSubAdminProfile();
        }
    };

    const fetchSubAdminProfile = async () => {
        try {
            const data = await api.getSubAdminProfile();
            if (data.success) {
                setSubAdminProfile(data.subAdmin);
            }
        } catch (error) {
            console.error('Error fetching sub-admin profile:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAdminStats();
            if (data.success) {
                setStats(data.stats);
            } else {
                setError(data.message || 'Failed to fetch dashboard statistics');
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setError('Could not connect to the server. Please check your internet connection or API settings.');
        } finally {
            setLoading(false);
        }
    };

    if (error && !isSubAdmin) {
        return (
            <div className="admin-dashboard-container">
                <div className="alert alert-danger m-a30">
                    <h4 className="alert-heading"><i className="fa fa-exclamation-circle me-2"></i>Dashboard Error</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-danger" onClick={fetchStats}>
                        <i className="fa fa-refresh me-2"></i>Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="admin-dashboard-container">
                <div className="admin-dashboard-header">
                    <h2>
                        <i className="fa fa-tachometer-alt me-3" style={{color: '#fd7e14'}}></i>
                        {isSubAdmin ? 'Sub Admin Dashboard' : 'Admin Dashboard'}
                    </h2>
                    <p className="dashboard-subtitle mb-0">
                        <i className="fa fa-chart-line me-2" style={{color: '#fd7e14'}}></i>
                        {isSubAdmin ? 'Welcome to your sub-admin panel' : 'Monitor and manage your platform\'s performance'}
                    </p>
                </div>

                {isSubAdmin && subAdminProfile && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="panel panel-default" style={{background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                                <div className="panel-body wt-panel-body p-4">
                                    <h3 className="mb-4" style={{color: '#333', fontWeight: '600'}}>
                                        <i className="fa fa-user-shield me-2" style={{color: '#fd7e14'}}></i>
                                        Sub Admin Profile
                                    </h3>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-user me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Full Name</small>
                                                    <strong style={{color: '#000', fontSize: '15px'}}>{subAdminProfile.name}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-at me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Username</small>
                                                    <strong style={{color: '#000', fontSize: '15px'}}>{subAdminProfile.username}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-envelope me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Email</small>
                                                    <strong style={{color: '#000', fontSize: '15px'}}>{subAdminProfile.email}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-phone me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Phone</small>
                                                    <strong style={{color: '#000', fontSize: '15px'}}>{subAdminProfile.phone}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-building me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Employer Code</small>
                                                    <strong style={{color: '#000', fontSize: '15px'}}>{subAdminProfile.employerCode}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-check-circle me-3 mt-1" style={{fontSize: '18px', color: '#28a745'}}></i>
                                                <div>
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '4px'}}>Status</small>
                                                    <strong style={{color: '#28a745', fontSize: '15px'}}>
                                                        <i className="fa fa-circle me-1" style={{fontSize: '8px'}}></i>
                                                        {subAdminProfile.status === 'active' ? 'Active' : 'Inactive'}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 mt-3">
                                            <div className="d-flex align-items-start">
                                                <i className="fa fa-shield-alt me-3 mt-1" style={{fontSize: '18px', color: '#fd7e14'}}></i>
                                                <div className="w-100">
                                                    <small className="d-block" style={{color: '#666', fontSize: '12px', marginBottom: '8px'}}>Permissions</small>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {subAdminProfile.permissions && subAdminProfile.permissions.map((permission, index) => (
                                                            <span key={index} className="badge px-3 py-2" style={{backgroundColor: '#fd7e14', color: '#fff', fontSize: '12px', fontWeight: '500'}}>
                                                                <i className="fa fa-check-circle me-1"></i>
                                                                {permission.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!isSubAdmin && (
                <div className="twm-dash-b-blocks mb-5">
                <div className="row">
                    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
                        <div className="panel panel-default dashboard-stats-card" onClick={() => navigate('/admin/registered-candidates')} style={{cursor: 'pointer'}}>
                            <div className="panel-body wt-panel-body gradi-1">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-users" style={{color: '#fd7e14'}} />
                                    </div>

                                    <div className="wt-card-right wt-total-active-listing counter">
                                        {loading ? <div className="loading-spinner"></div> : <CountUp end={stats.completedProfileCandidates} duration={2} />}
                                    </div>

                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Total Candidates</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
                        <div className="panel panel-default dashboard-stats-card" onClick={() => navigate('/admin/admin-emp-approved')} style={{cursor: 'pointer'}}>
                            <div className="panel-body wt-panel-body gradi-2">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-building" style={{color: '#fd7e14'}} />
                                    </div>

                                    <div className="wt-card-right wt-total-listing-view counter">
                                        {loading ? <div className="loading-spinner"></div> : <CountUp end={stats.approvedEmployers} duration={2} />}
                                    </div>

                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Approved Employers</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
                        <div className="panel panel-default dashboard-stats-card" onClick={() => navigate('/admin/admin-emp-approved')} style={{cursor: 'pointer'}}>
                            <div className="panel-body wt-panel-body gradi-3">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-briefcase" style={{color: '#fd7e14'}} />
                                    </div>
                                    
                                    <div className="wt-card-right wt-total-listing-review counter">
                                        {loading ? <div className="loading-spinner"></div> : <CountUp end={stats.activeJobs} duration={2} />}
                                    </div>

                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Active Jobs</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-xl-3 col-lg-6 col-md-12 mb-4">
                        <div className="panel panel-default dashboard-stats-card" onClick={() => navigate('/admin/admin-placement-approved')} style={{cursor: 'pointer'}}>
                            <div className="panel-body wt-panel-body gradi-4">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-graduation-cap" style={{color: '#fd7e14'}} />
                                    </div>

                                    <div className="wt-card-right wt-total-listing-bookmarked counter">
                                        {loading ? <div className="loading-spinner"></div> : <CountUp end={stats.totalPlacements} duration={2} />}
                                    </div>

                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Number of Colleges</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                )}

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-12 mb-4">
                        <div className="chart-section">
                            <div className="chart-header">
                                <h3>
                                    <i className="fa fa-chart-area me-3" style={{color: '#fd7e14'}}></i>
                                    Platform Analytics
                                </h3>
                            </div>
                            <AdminDashboardActivityChart />
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
}

export default AdminDashboardPage;
