import { useEffect } from "react";
import JobZImage from "../../../common/jobz-img";
import JobViewPopup from "../../../common/popups/popup-job-view";
import { loadScript } from "../../../../globals/constants";

function CanSavedJobsPage() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="twm-right-section-panel candidate-save-job site-bg-gray">
                <div className="twm-D_table table-responsive">
                    <table id="jobs_bookmark_table" className="table table-bordered twm-candidate-save-job-list-wrap">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/*1*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Senior Web Designer</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Herbal Ltd</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*2*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Sr. Rolling Stock Technician</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Dot Circle PVT Ltd</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*3*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>IT Department Manager</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Microsoft solution</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*4*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Art Production Specialist</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Coderbotics solutions</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*5*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic5.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Recreation &amp; Fitness Worker</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Galaxy IT Solution</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*6*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Senior Web Designer</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Robo Tech</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            {/*7*/}
                            <tr>
                                <td>
                                    <div className="twm-candidate-save-job-list">
                                        <div className="twm-media">
                                            <div className="twm-media-pic">
                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                            </div>
                                        </div>
                                        <div className="twm-mid-content">
                                            <a href="#" className="twm-job-title">
                                                <h4>Sr. Rolling Stock Technician</h4>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td><a href="#">Wins Developers</a></td>
                                <td>
                                    <div>28/06/2023</div>
                                </td>
                                <td>
                                    <div className="twm-table-controls">
                                        <ul className="twm-DT-controls-icon list-unstyled">
                                            <li>
                                                <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                                    <span className="fa fa-eye" />
                                                    <span className="custom-toltip-block">Veiw</span>
                                                </a>
                                            </li>
                                            <li>
                                                <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                                    <span className="far fa-trash-alt" />
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <JobViewPopup />
        </>
    )
}

export default CanSavedJobsPage;
