import SectionCandicateBasicInfo from "../sections/profile/section-can-basic-info";
import "./profile-styles.css";
import "../../../../mobile-profile-fix.css";
import { validatePhoneNumber } from "../../../../utils/phoneValidation";

function CanProfilePage() {
    return (
        <>
            <div className="twm-right-section-panel site-bg-gray">
                {/* Profile Page Header */}
                <div style={{ padding: '2rem 2rem 0 2rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                                <i className="fa fa-user-circle me-2" style={{color: '#f97316'}}></i>
                                My Profile
                            </h2>
                            <p style={{ color: '#6b7280', margin: 0 }}>
                                Manage your personal information and contact details
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Profile Content */}
                <div style={{ padding: '0 2rem 2rem 2rem' }}>
                    <SectionCandicateBasicInfo />
                </div>
            </div>
        </>
    )
}

export default CanProfilePage;
