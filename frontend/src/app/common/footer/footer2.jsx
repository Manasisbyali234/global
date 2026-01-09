import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";

function Footer2() {
    return (
        <>
            <footer className="footer-light" style={{fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 'bold'}}>
    
                    {/* NEWS LETTER SECTION START */}
                    <div className="ftr-nw-content">
                        <div className="container">
                            <div className="row">
                            <div className="col-md-5">
                                <div className="ftr-nw-title">
                                    Join our email subscription now to get updates
                                    on new jobs and notifications.
                                </div>
                            </div>
                            <div className="col-md-7">
                                <form>
                                    <div className="ftr-nw-form">
                                        <input name="news-letter" className="form-control" placeholder="Enter Your Email" type="text" />
                                        <button className="ftr-nw-subcribe-btn">Subscribe Now</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                    {/* NEWS LETTER SECTION END */}
                    {/* FOOTER BLOCKES START */}
                    <div className="footer-top">
                        <style>{`
                            .footer-light p, 
                            .footer-light a, 
                            .footer-light span:not(.logo-footer *), 
                            .footer-light li,
                            .footer-light h3,
                            .footer-light .ftr-nw-title {
                                font-weight: 600 !important;
                            }
                            .logo-footer, .logo-footer * {
                                font-weight: normal !important;
                            }
                            .ftr-list {
                                padding-left: 0 !important;
                                margin-left: 0 !important;
                            }
                        `}</style>
                        <div className="container">
                            <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <div className="widget widget_about">
                                    <div className="logo-footer clearfix">
                                        <NavLink to={publicUser.INITIAL}><JobZImage id="skin_footer_light_logo" src="images/skins-logo/logo-skin-8.png" alt="" /></NavLink>
                                    </div>
                                    <p>Many desktop publishing packages and web page editors now.</p>
                                    <ul className="ftr-list">
                                        <li><p><span>Address :</span>65 Sunset CA 90026, USA </p></li>
                                        <li><p><span>Email :</span>example@max.com</p></li>
                                        <li><p><span>Call :</span>555-555-1234</p></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-9 col-md-12">
                                <div className="row">
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">For Candidate</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.pages.LOGIN}>User Dashboard</NavLink></li>
                                                <li><NavLink to={publicUser.candidate.GRID}>Candidates</NavLink></li>
                                                <li><NavLink to={publicUser.blog.LIST}>Blog List</NavLink></li>
                                                <li><NavLink to={publicUser.blog.DETAIL}>Blog single</NavLink></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">For Employers</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.blog.GRID1}>Blog Grid</NavLink></li>
                                                <li><NavLink to={publicUser.pages.CONTACT}>Contact</NavLink></li>
                                                <li><NavLink to={publicUser.jobs.LIST}>Jobs Listing</NavLink></li>
                                                <li><NavLink to={publicUser.jobs.DETAIL1}>Jobs details</NavLink></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">Helpful Resources</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.pages.FAQ}>FAQs</NavLink></li>
                                                <li><NavLink to={publicUser.pages.LOGIN}>Profile</NavLink></li>
                                                <li><NavLink to={publicUser.pages.ERROR404}>404 Page</NavLink></li>
                                                <li><NavLink to={publicUser.pages.PRICING}>Pricing</NavLink></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="widget widget_services ftr-list-center">
                                            <h3 className="widget-title">Quick Links</h3>
                                            <ul>
                                                <li><NavLink to={publicUser.HOME1}>Home</NavLink></li>
                                                <li><NavLink to={publicUser.pages.ABOUT}>About us</NavLink></li>
                                                <li><NavLink to={publicUser.jobs.GRID}>Jobs</NavLink></li>
                                                <li><NavLink to={publicUser.employer.LIST}>Employer</NavLink></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    {/* FOOTER COPYRIGHT */}
                    <div className="footer-bottom">
                        <div className="container">
                            <div className="footer-bottom-info">
                            <div className="footer-copy-right">
                                <span className="copyrights-text">Copyright © 2025 by thewebmax All Rights Reserved.</span>
                            </div>
                            <ul className="social-icons">
                                <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="fab fa-facebook-f" /></li>
                                <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="fab fa-instagram" /></li>
                                <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="fab fa-linkedin-in" /></li>
                                <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="fab fa-x-twitter" /></li>
                                <li><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="fab fa-youtube" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}

export default Footer2;
