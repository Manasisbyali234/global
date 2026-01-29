
import { useLocation } from "react-router-dom";
import PublicUserRoutes from "../routing/public-user-routes";
import InnerPageBanner from "../app/common/inner-page-banner";
import { showBanner, setBanner } from "../globals/banner-data";
import { showHeader, showFooter, setFooterType, setHeaderType } from "../globals/layout-config";

function PublicUserLayout() {
    const currentpath = useLocation().pathname;
    const pageClass = currentpath === '/contact-us' ? 'contact-page-active' : '';

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
