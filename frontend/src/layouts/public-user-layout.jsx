
import { useLocation } from "react-router-dom";
import "../cls-fix.css";
import PublicUserRoutes from "../routing/public-user-routes";
import InnerPageBanner from "../app/common/inner-page-banner";
import { showBanner, setBanner } from "../globals/banner-data";
import { publicUser } from "../globals/route-names";
import { showHeader, showFooter, setFooterType, setHeaderType } from "../globals/layout-config";
import "../public-pages-mobile-responsive.css";

function PublicUserLayout() {
    const currentpath = useLocation().pathname;
    const isEmpGrid = currentpath === '/emp-grid';
    const isContactPage = currentpath === '/contact-us';
    const isAboutPage = currentpath === '/about-us';
    const isTermsPage = currentpath === '/terms-conditions';
    const isPrivacyPage = currentpath === '/privacy-policy';
    const isJobGridPage = currentpath.startsWith('/job-grid');
    const isJobDetailPage = currentpath.startsWith('/job-detail/');
    const isCreatePasswordPage = currentpath === '/create-password';
    const isPublicAuthPage = [
        publicUser.pages.LOGIN_CANDIDATE,
        publicUser.pages.LOGIN_EMPLOYER,
        publicUser.pages.LOGIN_PLACEMENT,
        publicUser.pages.SIGNUP_CANDIDATE,
        publicUser.pages.SIGNUP_EMPLOYER,
        publicUser.pages.SIGNUP_PLACEMENT
    ].includes(currentpath);
    const pageClass = isContactPage
        ? 'contact-page-active'
        : isAboutPage
            ? 'about-page-active'
            : isTermsPage
                ? 'terms-page-active'
            : isPrivacyPage
                ? 'privacy-page-active'
            : isJobGridPage
                ? 'job-grid-banner-active'
            : isJobDetailPage
                ? 'job-detail-banner-active'
            : isCreatePasswordPage
                ? 'create-password-banner-active'
            : isEmpGrid
                ? 'employer-grid-active'
                : '';
    const layoutClassName = ['page-wraper', 'public-page-layout', pageClass, isPublicAuthPage ? 'public-auth-layout' : '']
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <div className={layoutClassName}>
                {/* Header */}
                {
                    showHeader(currentpath) &&
                    setHeaderType(currentpath)
                }

                <div className="page-content public-page-content" style={{ minHeight: '60vh' }}>
                    {
                        showBanner(currentpath) &&
                        setBanner(currentpath)?.title &&
                        <InnerPageBanner _data={setBanner(currentpath)} />
                    }
                    <PublicUserRoutes />
                </div>

                {/* Footer — always rendered to prevent CLS from slot collapsing to 0 */}
                <div className="footer-slot" style={showFooter(currentpath) ? {} : { visibility: 'hidden', position: 'absolute', pointerEvents: 'none', zIndex: -1 }}>
                    {setFooterType(currentpath)}
                </div>
            </div>
        </>
    )
}

export default PublicUserLayout;
