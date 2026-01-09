import { NavLink } from "react-router-dom";
import JobZImage from "../../../../../common/jobz-img";
import { publicUser } from "../../../../../../globals/route-names";
import { publicUrlFor } from "../../../../../../globals/constants";

function SectionCandidateShortIntro2() {
    return (
        <>
            <div className="twm-candi-self-wrap-2 overlay-wraper" style={{ backgroundImage: `url(${publicUrlFor("images/candidates/candidate-bg2.jpg")})` }}>
                <div className="overlay-main site-bg-primary opacity-01" />
                <div className="container">
                    <div className="twm-candi-self-info-2">
                        <div className="twm-candi-self-top">
                            <div className="twm-candi-fee">$20 / Day</div>
                            <div className="twm-media">
                                <JobZImage src="images/candidates/pic-l1.jpg" alt="#" />
                            </div>
                            <div className="twm-mid-content">
                                <h4 className="twm-job-title">Wanda Montgomery </h4>
                                <p>Senior UI / UX Designer and Developer at Google INC</p>
                                <p className="twm-candidate-address"><i className="feather-map-pin" />United States</p>
                            </div>
                        </div>
                        <div className="twm-ep-detail-tags">
                            <button className="de-info twm-bg-green"><i className="fa fa-share-alt" /> Share</button>
                            <button className="de-info twm-bg-brown"><i className="fa fa-file-signature" /> Shortlist</button>
                            <button className="de-info twm-bg-purple"><i className="fa fa-exclamation-triangle" /> Report</button>
                            <button className="de-info twm-bg-sky"><i className="fa fa-save" /> Save</button>
                        </div>
                        <div className="twm-candi-self-bottom">
                            <NavLink to={publicUser.pages.CONTACT} className="site-button">Contact Us</NavLink>
                            <a href={publicUrlFor("files/pdf-sample.pdf")} className="site-button secondry">Download CV</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionCandidateShortIntro2;
