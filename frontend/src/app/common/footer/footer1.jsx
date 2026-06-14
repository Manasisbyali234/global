import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { Container, Row, Col } from "react-bootstrap";
import "./footer1.css";

function Footer1() {
    return (
        <>
            <div style={{
                width: '100%',
                height: '1px',
                background: '#E5E7EB'
            }}></div>
            <footer className="site-footer-new" style={{
                background: '#F9FAFB',
                padding: '64px 0 0',
                color: '#000000',
                fontFamily: 'Poppins, sans-serif'
            }}>

                <Container className="site-footer-new__container">
                    <Row className="g-4 gx-lg-5">
                        {/* Column 1: Brand & Contact */}
                        <Col lg={4} md={6}>
                            <div className="footer-brand mb-4">
                                                <div className="logo-footer footer-brand-logo mb-3">
                                    <NavLink to={publicUser.INITIAL}>
                                        <img
                                            id="skin_footer_light_logo"
                                            src={`${process.env.PUBLIC_URL}/assets/images/skins-logo/logo-skin-8.gif`}
                                            alt="TaleGlobal"
                                            width="160"
                                            height="80"
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </NavLink>
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                                    A smarter way to search, apply, and succeed. Explore thousands of opportunities tailored to your goals.
                                </p>
                                <div className="contact-info">
                                    <div className="footer-contact-item">
                                        <i className="feather-map-pin" style={{ color: '#FF6A3D' }}></i>
                                        <span>C/o, FCG ADVISORS LLP, No.10, 1st main Road, J lingaiah Road, Seshadripuram, bangalore - 560020</span>
                                    </div>
                                    <div className="footer-contact-item">
                                        <i className="feather-mail" style={{ color: '#FF6A3D' }}></i>
                                        <span>support@taleglobal.net</span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Column 2: Quick Links */}
                        <Col lg={2} md={6}>
                            <h4 className="footer-col-title">Quick Links</h4>
                            <ul className="footer-link-list" style={{ paddingLeft: '0' }}>
                                <li><NavLink to={publicUser.INITIAL}>Home</NavLink></li>
                                <li><NavLink to={publicUser.jobs.GRID}>Jobs</NavLink></li>
                                <li><NavLink to={publicUser.employer.GRID}>Companies</NavLink></li>
                                <li><NavLink to={publicUser.pages.ABOUT}>About Us</NavLink></li>
                                <li><NavLink to={publicUser.pages.CONTACT}>Contact Us</NavLink></li>
                            </ul>
                        </Col>

                        {/* Column 3: Helpful Links */}
                        <Col lg={3} md={6}>
                            <h4 className="footer-col-title">Helpful Links</h4>
                            <ul className="footer-link-list" style={{ paddingLeft: '0' }}>
                                <li><NavLink to={publicUser.pages.LOGIN_CANDIDATE}>Candidate Dashboard</NavLink></li>
                                <li><NavLink to={publicUser.pages.LOGIN_EMPLOYER}>Employers Dashboard</NavLink></li>
                                <li><NavLink to={publicUser.pages.LOGIN_PLACEMENT}>Placement Dashboard</NavLink></li>
                                <li><NavLink to={publicUser.pages.TERMS}>Terms & Conditions</NavLink></li>
                                <li><NavLink to={publicUser.pages.PRIVACY}>Privacy Policy</NavLink></li>
                            </ul>
                        </Col>

                        {/* Column 4: Stay Connected */}
                        <Col lg={2} md={6}>
                            <h4 className="footer-col-title" style={{ whiteSpace: 'nowrap' }}>Stay Connected</h4>
                            <div className="social-links d-flex align-items-center" style={{ marginTop: '0' }}>
                                <a href="https://www.facebook.com/TaleGlobal/" target="_blank" rel="noopener noreferrer" className="social-icon-outline" style={{ marginLeft: '0', marginRight: '12px' }}>
                                    <i className="feather-facebook"></i>
                                </a>
                                <a href="https://www.instagram.com/taleglobal/" target="_blank" rel="noopener noreferrer" className="social-icon-outline" style={{ marginLeft: '0', marginRight: '12px' }}>
                                    <i className="feather-instagram"></i>
                                </a>
                                <a href="https://www.linkedin.com/company/taleglobal" target="_blank" rel="noopener noreferrer" className="social-icon-outline" style={{ marginLeft: '0', marginRight: '12px' }}>
                                    <i className="feather-linkedin"></i>
                                </a>
                                <a href="https://www.youtube.com/@TaleGlobal" target="_blank" rel="noopener noreferrer" className="social-icon-outline" style={{ marginLeft: '0', marginRight: '12px' }}>
                                    <i className="feather-youtube"></i>
                                </a>
                            </div>
                        </Col>
                    </Row>

                    {/* Bottom Footer Bar */}
                    <div className="footer-bottom-bar d-flex justify-content-center align-items-center flex-wrap gap-3">
                        <div className="copyright-text" style={{ fontSize: '14px' }}>
                            Copyright © {new Date().getFullYear()} by Tale Global. All Rights Reserved.
                        </div>
                    </div>
                </Container>
            </footer>
        </>
    );
}

export default Footer1;
