import JobZImage from "../../../../../common/jobz-img";
import { publicUrlFor } from "../../../../../../globals/constants";

function SectionEmployerInfo() {
    return (
        <>
            <div className="twm-top-wide-banner overlay-wraper" style={{ backgroundImage: `url(${publicUrlFor("images/detail-pic/company-bnr1.jpg")})` }}>
                <div className="overlay-main site-bg-primary opacity-09" />
                <div className="twm-top-wide-banner-content container ">
                    <div className="twm-mid-content">
                        <div className="twm-employer-self-top">
                            <div className="twm-media">
                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                            </div>
                            <h3 className="twm-job-title">Galaxy Software Development</h3>
                            <p className="twm-employer-address"><i className="feather-map-pin" />#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                            <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-employer-websites">https://thewebmax.com</a>
                            <div className="twm-ep-detail-tags">
                                <button className="de-info twm-bg-green"><i className="fa fa-check" /> Verified</button>
                                <button className="de-info twm-bg-brown"><i className="fa fa-heart" /> Add To Favorite</button>
                                <button className="de-info twm-bg-purple"><i className="fa fa-hand-o-right" /> Add Review</button>
                                <button className="de-info twm-bg-sky"><i className="fa fa-eye" /> Viewed</button>
                            </div>
                        </div>
                        <div className="twm-employer-self-bottom">
                            <div className="twm-social-btns">
                                <a className="btn facebook" href="https://www.facebook.com/"><i className="fab fa-facebook-f" /></a>
                                <a className="btn twitter" href="https://www.twitter.com/"><i className="fab fa-twitter" /></a>
                                <a className="btn google" href="https://www.google.com/"><i className="fab fa-google" /></a>
                                <a className="btn linkedin" href="https://in.linkedin.com/"><i className="fab fa-linkedin-in" /></a>
                                <a className="btn skype" href="https://www.skype.com/"><i className="fab fa-skype" /></a>
                            </div>
                            {/* <div className="twm-employer-btn-controls">
                                <a href="#" className="site-button outline-white">Add Review</a>
                                <a href="#" className="site-button secondry">Follow Us</a>
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="ani-circle-1 rotate-center" />
                <div className="ani-circle-2 rotate-center" />
            </div>
        </>
    )
}

export default SectionEmployerInfo;
