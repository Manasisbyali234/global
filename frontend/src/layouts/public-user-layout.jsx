
import { useLocation } from "react-router-dom";
import PublicUserRoutes from "../routing/public-user-routes";
import InnerPageBanner from "../app/common/inner-page-banner";
import { showBanner, setBanner } from "../globals/banner-data";
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
    const isCreatePasswordPage = currentpath === '/create-password';
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
            : isCreatePasswordPage
                ? 'create-password-banner-active'
            : isEmpGrid
                ? 'employer-grid-active'
                : '';

    return (
        <>
            <div className={`page-wraper public-page-layout ${pageClass}`}>
                {/* Header */}
                {
                    showHeader(currentpath) &&
                    setHeaderType(currentpath)
                }

                <div className="page-content public-page-content">
                    {
                        showBanner(currentpath) &&
                        <InnerPageBanner _data={setBanner(currentpath)} />
                    }
                    <PublicUserRoutes />
                </div>

                {/* Footer */}
                {
                    showFooter(currentpath) &&
                    setFooterType(currentpath)
                }
            </div>
        </>
    )
}

export default PublicUserLayout;
