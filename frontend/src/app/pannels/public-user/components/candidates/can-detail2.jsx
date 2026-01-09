import SectionCandidateShortIntro2 from "../../sections/candidates/detail2/section-can-short-intro2";
import SectionCandidateSkills from "../../sections/candidates/section-can-skills";
import SectionCandidateExperience from "../../sections/candidates/section-can-experience";
import SectionCandidateEducation from "../../sections/candidates/section-can-education";
import SectionCandidateProfileInfo from "../../sections/candidates/detail2/section-can-profile-info";
import SectionCandidateAbout2 from "../../sections/candidates/detail2/section-can-about2";
import SectionLocation from "../../sections/common/section-location";
import SectionContact from "../../sections/common/section-contact";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function CandidateDetail2Page() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="section-full p-b90 bg-white">
                <SectionCandidateShortIntro2 />

                <div className="container">
                    <div className="section-content">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-9 col-md-12">
                                {/* Candidate detail START */}
                                <div className="cabdidate-de-info">
                                    <div className="twm-s-info-wrap mb-5">
                                        <SectionCandidateProfileInfo />
                                    </div>
                                    
                                    <SectionCandidateAbout2 />
                                    
                                    <SectionCandidateSkills />
                                    
                                    <SectionCandidateExperience />

                                    <SectionCandidateEducation />
                                </div>

                                <div className="twm-s-map mb-5">
                                    <SectionLocation />
                                </div>

                                <div className="twm-s-contact-wrap mb-5">
                                    <SectionContact />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CandidateDetail2Page;
