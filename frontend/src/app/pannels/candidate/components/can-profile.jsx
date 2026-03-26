import SectionCandicateBasicInfo from "../sections/profile/section-can-basic-info";
import "./profile-styles.css";
import "./mobile-text-overflow-fix.css";
import "../../../../mobile-profile-fix.css";
import { validatePhoneNumber } from "../../../../utils/phoneValidation";

function CanProfilePage() {
    return (
        <>
            <div className="twm-right-section-panel site-bg-gray candidate-profile-page">
                {/* Profile Page Header */}
                <div className="candidate-page-shell candidate-profile-shell candidate-page-shell--header">
                    <div className="candidate-page-header-card">
                        <div style={{ textAlign: 'center' }}>
                            <h2 className="candidate-page-title">
                                <i className="fa fa-user-circle me-2" style={{color: '#f97316'}}></i>
                                My Profile
                            </h2>
                            <p className="candidate-page-subtitle">
                                Manage your personal information and contact details
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Profile Content */}
                <div className="candidate-page-shell candidate-profile-shell candidate-page-shell--content">
                    <SectionCandicateBasicInfo />
                </div>
            </div>
        </>
    )
}

export default CanProfilePage;
