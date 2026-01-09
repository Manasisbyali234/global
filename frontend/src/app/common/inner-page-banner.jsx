
import { publicUrlFor } from "../../globals/constants";
import { NavLink } from "react-router-dom";

function InnerPageBanner({_data}) {
    return (
        <>
            <div className="wt-bnr-inr overlay-wraper bg-center" style={{ backgroundImage: `url(${publicUrlFor("images/banner/1.jpg")})` }}>
                <div className="overlay-main site-bg-white opacity-01" />

                    <div className="wt-bnr-inr-entry">
                        {/* BREADCRUMB ROW */}
                        {_data.crumb && _data.title !== 'About TaleGlobal' && (
                            <div>
                                <ul className="wt-breadcrumb breadcrumb-style-2">
                                    <li><NavLink to="/">Home</NavLink></li>
                                    <li>{_data.crumb}</li>
                                </ul>
                            </div>
                        )}
                        {/* BREADCRUMB ROW END */}

                        <div className="banner-title-outer">
                            <div className="banner-title-name">
                                <h2 className="wt-title">{_data.title}</h2>
                            </div>
                        </div>

                    </div>
            </div>
        </>
    )
}

export default InnerPageBanner;
