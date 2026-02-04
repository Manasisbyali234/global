import { publicUrlFor } from "../../../globals/constants";
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { Container, Row, Col } from "react-bootstrap";

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
            <style>{`
                .footer-col-title {
                    color: #0B1220;
                    font-size: 16px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 24px;
                    letter-spacing: 0.05em;
                }
                .footer-link-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-link-list li {
                    margin-bottom: 12px;
                }
                .footer-link-list a {
                    color: #000000;
                    text-decoration: none !important;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                .footer-link-list a:hover {
                    color: #FF6A3D;
                }
                .footer-contact-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #000000;
                    justify-content: flex-start;
                }
                @media (max-width: 768px) {
                    .footer-contact-item {
                        justify-content: flex-start;
                        text-align: left;
                    }
                    .contact-info {
                        align-items: flex-start !important;
                    }
                }
                .newsletter-input-group {
                    display: flex;
                    align-items: center;
                    background: #fff;
                    border: 1px solid #E5E7EB;
                    border-radius: 999px;
                    padding: 4px;
                    transition: border-color 0.3s ease;
                }
                .newsletter-input-group:focus-within {
                    border-color: #FF6A3D;
                }
                .newsletter-input-group input {
                    border: none;
                    padding: 8px 16px;
                    flex: 1;
                    font-size: 14px;
                    outline: none;
                    background: transparent;
                }
                .newsletter-submit-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #FF6A3D;
                    border: none;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    padding: 0;
                }
                .newsletter-submit-btn:hover {
                    background: #e55a2f;
                }
                .footer-bottom-bar {
                    border-top: 1px solid #E5E7EB;
                    padding: 20px 0;
                    margin-top: 64px;
                }
                .social-icon-outline {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #E5E7EB;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #000000;
                    margin-left: 12px;
                    transition: all 0.3s ease;
                    text-decoration: none !important;
                }
                .social-icon-outline:hover {
                    border-color: #FF6A3D;
                    color: #FF6A3D;
                    background: rgba(255, 106, 61, 0.05);
                }
            `}</style>
            
            <Container>
                <Row className="g-4 gx-lg-5">
                    {/* Column 1: Brand & Contact */}
                    <Col lg={3} md={6}>
                        <div className="footer-brand mb-4">
                            <div className="logo-footer mb-3">
                                <NavLink to={publicUser.INITIAL}>
                                    <JobZImage
                                        id="skin_footer_light_logo"
                                        src="images/skins-logo/logo-skin-8.png"
                                        alt=""
                                        style={{ height: '70px', width: 'auto' }}
                                    />
                                </NavLink>
                            </div>
                            <p style={{fontSize: '14px', lineHeight: '1.6', marginBottom: '24px'}}>
                                A smarter way to search, apply, and succeed. Explore thousands of opportunities tailored to your goals.
                            </p>
                            <div className="contact-info">
                                <div className="footer-contact-item">
                                    <i className="feather-map-pin" style={{color: '#FF6A3D'}}></i>
                                    <span>C/o, FCG ADVISORS LLP, No.10, 1st main Road, J lingaiah Road, Seshadripuram, bangalore - 560020</span>
                                </div>
                                <div className="footer-contact-item">
                                    <i className="feather-mail" style={{color: '#FF6A3D'}}></i>
                                    <span>info@taleglobal.net</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Column 2: Quick Links */}
                    <Col lg={2} md={6}>
                        <h4 className="footer-col-title">Quick Links</h4>
                        <ul className="footer-link-list">
                            <li><NavLink to={publicUser.INITIAL}>Home</NavLink></li>
                            <li><NavLink to={publicUser.jobs.GRID}>Jobs</NavLink></li>
                            <li><NavLink to={publicUser.employer.GRID}>Employers</NavLink></li>
                            <li><NavLink to={publicUser.pages.ABOUT}>About Us</NavLink></li>
                            <li><NavLink to={publicUser.pages.CONTACT}>Contact Us</NavLink></li>
                        </ul>
                    </Col>

                    {/* Column 3: Helpful Links */}
                    <Col lg={3} md={6}>
                        <h4 className="footer-col-title">Helpful Links</h4>
                        <ul className="footer-link-list">
                            <li><NavLink to={publicUser.pages.LOGIN_CANDIDATE}>Candidate Dashboard</NavLink></li>
                            <li><NavLink to={publicUser.pages.LOGIN_EMPLOYER}>Employers Dashboard</NavLink></li>
                            <li><NavLink to={publicUser.pages.LOGIN_PLACEMENT}>Placement Dashboard</NavLink></li>
                            <li><NavLink to={publicUser.pages.TERMS}>Terms & Conditions</NavLink></li>
                            <li><NavLink to={publicUser.pages.PRIVACY}>Privacy Policy</NavLink></li>
                        </ul>
                    </Col>

                    {/* Column 4: Stay Connected */}
                    <Col lg={4} md={6}>
                        <h4 className="footer-col-title">Stay Connected</h4>
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
                    <div className="copyright-text" style={{fontSize: '14px'}}>
                        Copyright © {new Date().getFullYear()} by Tale Global. All Rights Reserved.
                    </div>
                </div>
            </Container>
        </footer>
        </>
    );
}

export default Footer1;
