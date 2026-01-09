import JobZImage from "../../../../../common/jobz-img";
import { publicUrlFor } from "../../../../../../globals/constants";

function SectionCandidateShortIntro1() {
    return (
        <>
            <div className="twm-candi-self-wrap overlay-wraper" style={{ backgroundImage: `url(${publicUrlFor("images/candidates/candidate-bg.jpg")})` }}>
                <div className="overlay-main site-bg-primary opacity-01" />
                <div className="twm-candi-self-info">
                    <div className="twm-candi-self-top">
                        <div className="twm-candi-fee">$20 / Day</div>
                        <div className="twm-media">
                            <JobZImage src="images/candidates/pic2.jpg" alt="#" />
                        </div>
                        <div className="twm-mid-content">
                            <h4 className="twm-job-title">Wanda Montgomery </h4>
                            <p>Senior UI / UX Designer and Developer at Google INC</p>
                            <p className="twm-candidate-address"><i className="feather-map-pin" />United States</p>
                        </div>
                    </div>
                    <div className="twm-candi-self-bottom">
                        <a href="#" className="site-button outline-white">Hire Me Now</a>
                        <a href="#" className="site-button secondry">Download CV</a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionCandidateShortIntro1;
