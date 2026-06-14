
import { useLocation } from "react-router-dom";
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
            <div className={layoutClassName} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                {
                    showHeader(currentpath) &&
                    setHeaderType(currentpath)
                }

                <div className="page-content public-page-content" style={{ flex: '1 0 auto' }}>
                    {
                        showBanner(currentpath) &&
                        <InnerPageBanner _data={setBanner(currentpath)} />
                    }
                    <PublicUserRoutes />
                </div>

                {/* Footer: always in DOM, hidden via display:none when not needed.
                    Conditional mounting causes CLS because the footer appears after
                    first paint and pushes page-content upward. */}
                <div style={{ flexShrink: 0, display: showFooter(currentpath) ? 'block' : 'none' }}>
                    {setFooterType(currentpath)}
                </div>
            </div>
        </>
    )
}

export default PublicUserLayout;
