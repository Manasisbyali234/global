import { publicUrlFor } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";
import SectionApplyJob from "../../sections/jobs/section-apply-job";

function ApplyJobPage() {
    return (
        <>
            <div className="section-full p-t120  site-bg-white bg-cover twm-ac-fresher-wrap" style={{ backgroundImage: `url(${publicUrlFor("images/background/pattern.jpg")})` }}>
                <div className="container">
                    <div className="row d-flex justify-content-center">
                        <div className="col-lg-8 col-md-12">
                            <div className="twm-right-section-panel-wrap2">
                                
                                <div className="twm-right-section-panel site-bg-primary">
                                    {/*Basic Information*/}
                                    <div className="panel panel-default">
                                        <div className="panel-heading wt-panel-heading p-a20">
                                            <h4 className="panel-tittle m-a0">Apply For This Job</h4>
                                        </div>
                                        <div className="panel-body wt-panel-body p-a20 ">
                                            <SectionApplyJob />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="twm-section-bg-img2">
                    <JobZImage src="images/apply-job-bg.png" alt="" />
                </span>
            </div>

        </>
    )
}

export default ApplyJobPage;
