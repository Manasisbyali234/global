
import { useLocation } from "react-router-dom";
import PublicUserRoutes from "../routing/public-user-routes";
import InnerPageBanner from "../app/common/inner-page-banner";
import { showBanner, setBanner } from "../globals/banner-data";
import { showHeader, showFooter, setFooterType, setHeaderType } from "../globals/layout-config";

function PublicUserLayout() {
    const currentpath = useLocation().pathname;
    const isEmpGrid = currentpath === '/emp-grid';
    const isContactPage = currentpath === '/contact-us';
    const isAboutPage = currentpath === '/about-us';
    const isJobGridPage = currentpath.startsWith('/job-grid');
    const isCreatePasswordPage = currentpath === '/create-password';
    const pageClass = isContactPage
        ? 'contact-page-active'
        : isAboutPage
            ? 'about-page-active'
            : isJobGridPage
                ? 'job-grid-banner-active'
            : isCreatePasswordPage
                ? 'create-password-banner-active'
            : isEmpGrid
                ? 'employer-grid-active'
                : '';

    return (
        <>
            <div className={`page-wraper ${pageClass}`}>
                {/* Header */}
                {
                    showHeader(currentpath) &&
                    setHeaderType(currentpath)
                }

                <div className="page-content">
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
