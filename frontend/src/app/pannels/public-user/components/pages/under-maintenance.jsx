import { NavLink } from "react-router-dom";
import { publicUrlFor } from "../../../../../globals/constants";
import JobzImage from "../../../../common/jobz-img";
import { publicUser } from "../../../../../globals/route-names";

function UnderMaintenancePage() {
    return (
        <>
            <div className="section-full site-bg-gray twm-u-maintenance-area" style={{ backgroundImage: `url(${publicUrlFor("images/background/bg-1.jpg")})` }}>
                <div className="twm-u-maintenance-wrap">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className="twm-u-maintenance-content">
                                <div className="media">
                                    <NavLink to={publicUser.HOME1}>
                                        <JobzImage id="skin_maintain_logo" src="images/logo-light-2.png" alt="" />
                                    </NavLink>
                                </div>
                                <h2 className="twm-u-maintenance-title">Website is under <span className="site-text-primary">Maintenance</span></h2>
                                <p className="twm-u-maintenance-title2">We apologize for any Inconvenience caused.
                                    We've almost done.</p>
                                <ul className="social-icons">
                                <li><a href="https://www.facebook.com/" className="fab fa-facebook-f" /></li>
                                <li><a href="https://www.twitter.com/" className="fab fa-twitter" /></li>
                                <li><a href="https://www.instagram.com/" className="fab fa-instagram" /></li>
                                <li><a href="https://www.youtube.com/" className="fab fa-youtube" /></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-7 col-md-12">
                            <div className="twm-u-maintenance-image">
                                <JobzImage src="images/under-m.png" alt="#" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default UnderMaintenancePage;
