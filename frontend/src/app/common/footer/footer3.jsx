import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { publicUrlFor } from "../../../globals/constants";

function Footer3 () {
    return (
			<>
				<footer
					className="footer-light ftr-light-with-bg site-bg-cover"
					style={{
						backgroundImage: `url(${publicUrlFor("images/ftr-bg.jpg")})`,
						fontFamily: '"Plus Jakarta Sans", sans-serif',
						fontWeight: 'bold'
					}}
				>

						{/* FOOTER BLOCKES START */}
						<div className="footer-top" style={{padding: '40px 0'}}>
							<style>{`
								.footer-light p, 
								.footer-light a, 
								.footer-light span:not(.logo-footer *), 
								.footer-light li,
								.footer-light h3 {
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
								<div className="row" style={{margin: '0'}}>
								<div className="col-lg-4 col-md-12" style={{padding: '0 15px'}}>
									<div className="widget widget_about">
										<div className="logo-footer clearfix">
											<NavLink to={publicUser.INITIAL}>
												<JobZImage
													id="skin_footer_light_logo"
													src="images/skins-logo/logo-skin-8.png"
													alt=""
												/>
											</NavLink>
										</div>
										<p>
											A smarter way to search, apply, and succeed. Explore
											thousands of opportunities tailored to your goals.
										</p>
										<ul className="ftr-list">
											<li>
												<p>
													<span>Address:</span> Bangalore, 560092
												</p>
											</li>
											<li>
												<p>
													<span>Email:</span> <a href="mailto:info@taleglobal.net" style={{color: '#f97316', textDecoration: 'underline', cursor: 'pointer'}}>info@taleglobal.net</a>
												</p>
											</li>
											<li style={{display: 'none'}}>
												<p>
													<span>Call:</span> <a href="tel:+919876543210" style={{color: '#f97316', textDecoration: 'underline', cursor: 'pointer'}}>(+91) 9876543210</a>
												</p>
											</li>
										</ul>
									</div>
								</div>

								<div className="col-lg-8 col-md-12" style={{padding: '0 15px'}}>
									<div className="row" style={{margin: '0'}}>
										<div className="col-lg-6 col-md-6 col-sm-6" style={{padding: '0 10px'}}>
											<div className="widget widget_services ftr-list-center">
												<h3 className="widget-title">Quick Links</h3>
												<ul>
													<li>
														<NavLink to={publicUser.INITIAL}>Home</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.candidate.GRID}>
															Jobs
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.blog.LIST}>
															Employers
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.blog.DETAIL}>
															Contact Us
														</NavLink>
													</li>
												</ul>
											</div>
										</div>

										<div className="col-lg-6 col-md-6 col-sm-6" style={{padding: '0 10px'}}>
											<div className="widget widget_services ftr-list-center">
												<h3 className="widget-title">Helpful Links</h3>
												<ul>
													<li>
														<NavLink to={publicUser.pages.LOGIN_CANDIDATE}>
															Candidate Dashboard
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.pages.LOGIN_EMPLOYER}>
															Employers Dashboard
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.jobs.LIST}>
															Terms & Conditions
														</NavLink>
													</li>

													<li>
														<NavLink to={publicUser.jobs.DETAIL1}>
															Privacy Policy
														</NavLink>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

						{/* FOOTER COPYRIGHT */}
						<div className="footer-bottom" style={{padding: '20px 0'}}>
							<div className="container">
								<div className="footer-bottom-info" style={{margin: '0'}}>
								<div className="footer-copy-right">
									<span className="copyrights-text">
										Copyright © 2025 by Tale Global. All Rights Reserved.
									</span>
								</div>

								<ul className="social-icons">
									<li>
										<a
											href="https://www.facebook.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="fab fa-facebook-f"
										/>
									</li>

									<li>
										<a
											href="https://www.instagram.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="fab fa-instagram"
										/>
									</li>

									<li>
										<a
											href="https://www.linkedin.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="fab fa-linkedin-in"
										/>
									</li>

									<li>
										<a
											href="https://x.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="fab fa-x-twitter"
										/>
									</li>

									<li>
										<a
											href="https://www.youtube.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="fab fa-youtube"
										/>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</footer>
			</>
		);
}

export default Footer3;
