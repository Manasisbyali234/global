
import { publicUrlFor } from "../../globals/constants";
import { NavLink, useLocation } from "react-router-dom";

function InnerPageBanner({_data}) {
    const currentpath = useLocation().pathname;
    const isJobGridPage = currentpath.startsWith("/job-grid");
    const bannerStyle = isJobGridPage ? {
        height: "72px",
        minHeight: "72px",
        padding: "0",
        boxSizing: "border-box",
        overflow: "hidden"
    } : undefined;
    const entryStyle = isJobGridPage ? {
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        verticalAlign: "middle"
    } : undefined;
    const titleOuterStyle = isJobGridPage ? {
        margin: "0",
        position: "static"
    } : undefined;
    const titleNameStyle = isJobGridPage ? {
        display: "block",
        margin: "0"
    } : undefined;
    const titleStyle = isJobGridPage ? {
        margin: "0",
        lineHeight: "1.1"
    } : undefined;

    return (
        <>
            <div className="wt-bnr-inr overlay-wraper bg-center" style={{ backgroundImage: `url(${publicUrlFor("images/banner/1.jpg")})`, ...bannerStyle }}>
                <div className="overlay-main site-bg-white opacity-01" />

                    <div className="wt-bnr-inr-entry" style={entryStyle}>
                        {/* BREADCRUMB ROW */}
                        {_data.crumb && _data.title !== 'About TaleGlobal' && (
                            <div style={{display: 'none'}}>
                                <ul className="wt-breadcrumb breadcrumb-style-2">
                                    <li><NavLink to="/">Home</NavLink></li>
                                    <li>{_data.crumb}</li>
                                </ul>
                            </div>
                        )}
                        {/* BREADCRUMB ROW END */}

                        <div className="banner-title-outer" style={titleOuterStyle}>
                            <div className="banner-title-name" style={titleNameStyle}>
                                <h2 className="wt-title" style={titleStyle}>{_data.title}</h2>
                            </div>
                        </div>

                    </div>
            </div>
        </>
    )
}

export default InnerPageBanner;
