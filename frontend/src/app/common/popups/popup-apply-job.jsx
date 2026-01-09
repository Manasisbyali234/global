import SectionApplyJob from "../../pannels/public-user/sections/jobs/section-apply-job";
import { useEffect } from "react";
import { disableBodyScroll, enableBodyScroll } from "../../../utils/scrollUtils";

function ApplyJobPopup() {
    useEffect(() => {
        const modal = document.getElementById('apply_job_popup');
        const handleModalShow = () => disableBodyScroll();
        const handleModalHide = () => enableBodyScroll();

        if (modal) {
            modal.addEventListener('show.bs.modal', handleModalShow);
            modal.addEventListener('hide.bs.modal', handleModalHide);

            return () => {
                modal.removeEventListener('show.bs.modal', handleModalShow);
                modal.removeEventListener('hide.bs.modal', handleModalHide);
            };
        }
    }, []);

    return (
        <>
            <div className="modal fade" id="apply_job_popup" aria-hidden="true" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="sign_up_popupLabel">Apply For This Job</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <div className="apl-job-inpopup">
                                {/*Basic Information*/}
                                <div className="panel panel-default">
                                    <div className="panel-body wt-panel-body p-a20 ">
                                        <SectionApplyJob />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ApplyJobPopup;
