import JobZImage from "../../../../common/jobz-img";
import SectionJobsSidebar2 from "../../sections/jobs/sidebar/section-jobs-sidebar2";
import SectionRelatedJobs from "../../sections/jobs/detail/section-related-jobs";
import SectionShareProfile from "../../sections/common/section-share-profile";
import SectionJobLocation from "../../sections/jobs/detail/section-job-location";
import SectionOfficePhotos2 from "../../sections/common/section-office-photos2";
import SectionOfficeVideo2 from "../../sections/common/section-office-video2";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";
import ApplyJobPopup from "../../../../common/popups/popup-apply-job";

function JobDetail2Page() {

    const sidebarConfig = {
        showJobInfo: false
    }

    useEffect(()=>{
        loadScript("js/custom.js");
    })

    return (
        <>
            {/* Job Detail V.2 START */}
            <div className="section-full  p-t50 p-b90 bg-white">
                <div className="container">
                    {/* BLOG SECTION START */}
                    <div className="section-content">
                        <div className="twm-job-self-wrap twm-job-detail-v2">
                            <div className="twm-job-self-info">
                                <div className="twm-job-self-top">
                                    <div className="twm-media-bg">
                                        <JobZImage src="images/job-detail-bg-2.jpg" alt="#" />
                                        <div className="twm-jobs-category green"><span className="twm-bg-green">New</span></div>
                                        <div className="twm-job-self-bottom">
                                            <a className="site-button" data-bs-toggle="modal" href="#apply_job_popup" role="button">
                                                Apply Now
                                            </a>
                                        </div>
                                    </div>
                                    <div className="twm-mid-content">
                                        <div className="twm-media">
                                            <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                        </div>
                                        <h4 className="twm-job-title">Senior Web Designer , Developer</h4>
                                        <p className="twm-job-address"><i className="feather-map-pin" />#56 Sunset Blvd Sahakar Nagar, Bengaluru, 560902</p>
                                        <div className="twm-job-self-mid">
                                            <div className="twm-job-self-mid-left">
                                                <a href="https://themeforest.net/user/thewebmax/portfolio" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                <div className="twm-jobs-amount">₹2000 - ₹2500</div>
                                            </div>
                                            <div className="twm-job-apllication-area">Application ends:
                                                <span className="twm-job-apllication-date">October 1, 2025</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="twm-job-detail-2-wrap">
                            <div className="row d-flex justify-content-center">
                                <div className="col-lg-4 col-md-12 rightSidebar">
                                    <SectionJobsSidebar2 _config={sidebarConfig} />
                                </div>
                                <div className="col-lg-8 col-md-12">
                                    {/* Candidate detail START */}
                                    <div className="cabdidate-de-info">
                                        <h4 className="twm-s-title m-t0">Company Description:</h4>
                                        <p>
                                            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? there are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
                                        </p>
                                        <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.</p>
                                        <h4>Job Overview</h4>
                                        <p>
                                            Our development team focuses on unit testing, TDD, CI, design patterns and refactoring. Internal and external training is encouraged through mentoring, guided self-learning, conferences, user groups and training courses. We maintain and improve existing codebases, and create new systems, exposing developers to constant variety.
                                        </p>
                                        <p>
                                            Our team understands the performance implications of serving more than 25,000 page requests per-hour, crafting awesome user experiences. While we leverage existing tech, we also research new technologies to overcome technical and business challenges, to maintain our industry-leading status.
                                        </p>
                                        <h4 className="twm-s-title">Requirments:</h4>
                                        <ul className="description-list-2">
                                            <li>
                                                <i className="feather-check" />
                                                Must be able to communicate with others to convey information effectively.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Personally passionate and up to date with current trends and technologies, committed to quality and comfortable working with adult media.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Rachelor or Master degree level educational background.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                4 years relevant PHP dev experience.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Troubleshooting, testing and maintaining the core product software and databases.
                                            </li>
                                        </ul>
                                        <h4 className="twm-s-title">Responsabilities:</h4>
                                        <ul className="description-list-2">
                                            <li>
                                                <i className="feather-check" />
                                                Establish and promote design guidelines, best practices and standards.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Accurately estimate design tickets during planning sessions.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Partnering with product and engineering to translate business and user goals into elegant and practical designs. that can deliver on key business and user metrics.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Create wireframes, storyboards, user flows, process flows and site maps to communicate interaction and design.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Present and defend designs and key deliverables to peers and executive level stakeholders.
                                            </li>
                                            <li>
                                                <i className="feather-check" />
                                                Execute all visual design stages from concept to final hand-off to engineering.
                                            </li>
                                        </ul>

                                        <SectionShareProfile />
                                        <SectionJobLocation />
                                        <SectionOfficePhotos2 />
                                        <SectionOfficeVideo2 />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Job Detail V.2 END */}

            {/* Related Jobs START */}
            <div className="section-full p-t120 p-b90 site-bg-light-purple twm-related-jobs-carousel-wrap">
                <SectionRelatedJobs />
            </div>
            {/* Related Jobs END */}

            <ApplyJobPopup />
        </>
    )
}

export default JobDetail2Page;
