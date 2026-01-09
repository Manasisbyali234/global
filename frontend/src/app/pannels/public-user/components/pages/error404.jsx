import { NavLink } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import { publicUser } from "../../../../../globals/route-names";

function Error404Page() {
    return (
        <>
            <div className="section-full p-t120  p-b90 site-bg-white">
                <div className="container">
                    <div className="twm-error-wrap">
                        <div className="row">
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-error-image">
                                    <JobZImage src="images/error-404.png" alt="#" />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12">
                                <div className="twm-error-content">
                                    <h2 className="twm-error-title">404</h2>
                                    <h4 className="twm-error-title2 site-text-primary">We Are Sorry, Page Not Found</h4>
                                    <p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.</p>
                                    <NavLink to={publicUser.HOME16} className="site-button">Go To Home</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Error404Page;
