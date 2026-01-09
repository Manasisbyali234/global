import SectionEmployerInfo from "../../sections/employers/detail/section-emp-info";
import SectionEmployersCandidateSidebar from "../../sections/common/section-emp-can-sidebar";
import SectionOfficeVideo1 from "../../sections/common/section-office-video1";
import SectionOfficePhotos3 from "../../sections/common/section-office-photos3";
import SectionAvailableJobsGrid from "../../sections/employers/detail/section-available-jobs-grid";
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function EmployersDetail2Page() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="section-full  p-t0 p-b90 bg-white">
                {/*Top Wide banner Start*/}
                <SectionEmployerInfo />
                {/*Top Wide banner End*/}
                <div className="container">
                    <div className="section-content">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-4 col-md-12 rightSidebar">
                                <SectionEmployersCandidateSidebar type="2" />
                            </div>
                            <div className="col-lg-8 col-md-12">
                                {/* Candidate detail START */}
                                <div className="cabdidate-de-info">
                                    <h4 className="twm-s-title m-t0">About Company</h4>
                                    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae
                                        consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? </p>
                                    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui  officia deserunt mollitia animi.</p>
                                    <p>Opossum but dramatically despite expeditiously that jeepers loosely yikes that as or eel underneath kept and slept compactly far purred sure abidingly up above fitting to strident wiped set waywardly far the and pangolin horse approving paid chuckled cassowary oh above a much opposite far much hypnotically more therefore wasp less that  hey apart well like while superbly orca and far hence one.Far much that one rank beheld bluebird after outside ignobly  allegedly more when oh arrogantly vehement irresistibly fussy.? </p>
                                    <h4 className="twm-s-title">Responsabilities</h4>
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
                                            Partnering with product and engineering to translate business and user goals.
                                        </li>
                                    </ul>
                                    <div className="twm-two-part-section">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 m-b30">
                                                <SectionOfficeVideo1 />
                                            </div>
                                            <div className="col-lg-12 col-md-12">
                                                <SectionOfficePhotos3 />
                                            </div>
                                        </div>
                                    </div>
                                    <SectionAvailableJobsGrid />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EmployersDetail2Page;
