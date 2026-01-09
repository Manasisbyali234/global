import { useEffect } from "react";
import JobViewPopup from "../../../common/popups/popup-job-view";
import { loadScript } from "../../../../globals/constants";

function CanJobAlertsPage() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="twm-right-section-panel candidate-save-job site-bg-gray">
                {/*Filter Short By*/}
                <div className="product-filter-wrap d-flex justify-content-between align-items-center">
                    <span className="woocommerce-result-count-left">Job Alerts</span>
                    <form className="woocommerce-ordering twm-filter-select" method="get">
                        <span className="woocommerce-result-count">Short By</span>
                        <select className="wt-select-bar-2 selectpicker" data-live-search="true" data-bv-field="size">
                            <option>Last 2 Months</option>
                            <option>Last 1 Months</option>
                            <option>15 days ago</option>
                            <option>Weekly</option>
                            <option>Yesterday</option>
                            <option>Today</option>
                        </select>
                    </form>
                </div>
                <div className="table-responsive">
                    <table className="table twm-table table-striped table-borderless">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Jobs Description</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/*1*/}
                            <tr>
                                <td>Web Developer</td>
                                <td>A strategic approach to website design..</td>
                                <td>28/06/2023</td>
                                <td>
                                    <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                        <span className="fa fa-eye" />
                                        <span className="custom-toltip-block">Veiw</span>
                                    </a>
                                    <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></button>
                                </td>
                            </tr>
                            {/*2*/}
                            <tr>
                                <td>SEO Experts</td>
                                <td>Providing the best SEO practices.</td>
                                <td>28/06/2023</td>
                                <td>
                                    <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                        <span className="fa fa-eye" />
                                        <span className="custom-toltip-block">Veiw</span>
                                    </a>
                                    <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></button>
                                </td>
                            </tr>
                            {/*3*/}
                            <tr>
                                <td>Web Developer</td>
                                <td>As promised, we’re the most professional..</td>
                                <td>Weekly</td>
                                <td>
                                    <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                        <span className="fa fa-eye" />
                                        <span className="custom-toltip-block">Veiw</span>
                                    </a>
                                    <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></button>
                                </td>
                            </tr>
                            {/*4*/}
                            <tr>
                                <td>Web Designer</td>
                                <td>Custom web design solutions websites..</td>
                                <td>28/06/2023</td>
                                <td>
                                    <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                        <span className="fa fa-eye" />
                                        <span className="custom-toltip-block">Veiw</span>
                                    </a>
                                    <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></button>
                                </td>
                            </tr>
                            {/*5*/}
                            <tr>
                                <td>Web Developer</td>
                                <td>A strategic approach to website design..</td>
                                <td>28/06/2023</td>
                                <td>
                                    <a data-bs-toggle="modal" href="#saved-jobs-view" role="button" className="custom-toltip">
                                        <span className="fa fa-eye" />
                                        <span className="custom-toltip-block">Veiw</span>
                                    </a>
                                    <button title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <JobViewPopup />
        </>
    )
}

export default CanJobAlertsPage;
