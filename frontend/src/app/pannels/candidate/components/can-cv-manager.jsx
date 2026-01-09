import { NavLink } from "react-router-dom";
import JobZImage from "../../../common/jobz-img";
import { publicUser } from "../../../../globals/route-names";
import { loadScript, publicUrlFor } from "../../../../globals/constants";
import SectionPagination from "../../public-user/sections/common/section-pagination";
import { useEffect } from "react";

function CanCVManagerPage() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="twm-right-section-panel candidate-save-job site-bg-gray">
                {/*Filter Short By*/}
                <div className="product-filter-wrap d-flex justify-content-between align-items-center">
                    <span className="woocommerce-result-count-left">CV Manager</span>
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
                <div className="twm-cv-manager-list-wrap">
                    <ul>
                        <li>
                            <div className="twm-cv-manager-list-style1">
                                <div className="twm-media">
                                    <div className="twm-media-pic">
                                        <JobZImage src="images/candidates/pic1.jpg" alt="#" />
                                    </div>
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                        <h4>Wanda Montgomery </h4>
                                    </NavLink>
                                    <p>Charted Accountant</p>
                                    <div className="twm-fot-content">
                                        <div className="twm-left-info">
                                            <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                            <div className="twm-job-post-duration">1 days ago</div>
                                            <div className="twm-candidates-tag"><span>Full Time</span></div>
                                        </div>
                                        <div className="twm-view-button">
                                            <a href={publicUrlFor("files/pdf-sample.pdf")} title="Download" target="blank" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-download" /></a>
                                            <a href="#" title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="twm-cv-manager-list-style1">
                                <div className="twm-media">
                                    <div className="twm-media-pic">
                                        <JobZImage src="images/candidates/pic2.jpg" alt="#" />
                                    </div>
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                        <h4>Peter Hawkins</h4>
                                    </NavLink>
                                    <p>Medical Professed</p>
                                    <div className="twm-fot-content">
                                        <div className="twm-left-info">
                                            <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                            <div className="twm-job-post-duration">1 days ago</div>
                                            <div className="twm-candidates-tag"><span>Full Time</span></div>
                                        </div>
                                        <div className="twm-view-button">
                                            <a href={publicUrlFor("files/pdf-sample.pdf")} title="Download" target="blank" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-download" /></a>
                                            <a href="#" title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="twm-cv-manager-list-style1">
                                <div className="twm-media">
                                    <div className="twm-media-pic">
                                        <JobZImage src="images/candidates/pic3.jpg" alt="#" />
                                    </div>
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                        <h4>Ralph Johnson</h4>
                                    </NavLink>
                                    <p>Bank Manger</p>
                                    <div className="twm-fot-content">
                                        <div className="twm-left-info">
                                            <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                            <div className="twm-job-post-duration">1 days ago</div>
                                            <div className="twm-candidates-tag"><span>Full Time</span></div>
                                        </div>
                                        <div className="twm-view-button">
                                            <a href={publicUrlFor("files/pdf-sample.pdf")} title="Download" target="blank" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-download" /></a>
                                            <a href="#" title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="twm-cv-manager-list-style1">
                                <div className="twm-media">
                                    <div className="twm-media-pic">
                                        <JobZImage src="images/candidates/pic4.jpg" alt="#" />
                                    </div>
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                        <h4>Randall Henderson </h4>
                                    </NavLink>
                                    <p>IT Contractor</p>
                                    <div className="twm-fot-content">
                                        <div className="twm-left-info">
                                            <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                            <div className="twm-job-post-duration">1 days ago</div>
                                            <div className="twm-candidates-tag"><span>Full Time</span></div>
                                        </div>
                                        <div className="twm-view-button">
                                            <a href={publicUrlFor("files/pdf-sample.pdf")} title="Download" target="blank" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-download" /></a>
                                            <a href="#" title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="twm-cv-manager-list-style1">
                                <div className="twm-media">
                                    <div className="twm-media-pic">
                                        <JobZImage src="images/candidates/pic5.jpg" alt="#" />
                                    </div>
                                </div>
                                <div className="twm-mid-content">
                                    <NavLink to={publicUser.candidate.DETAIL1} className="twm-job-title">
                                        <h4>Randall Warren</h4>
                                    </NavLink>
                                    <p>Digital &amp; Creative</p>
                                    <div className="twm-fot-content">
                                        <div className="twm-left-info">
                                            <p className="twm-candidate-address"><i className="feather-map-pin" />New York</p>
                                            <div className="twm-job-post-duration">1 days ago</div>
                                            <div className="twm-candidates-tag"><span>Full Time</span></div>
                                        </div>
                                        <div className="twm-view-button">
                                            <a href={publicUrlFor("files/pdf-sample.pdf")} title="Download" target="blank" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-download" /></a>
                                            <a href="#" title="Delete" data-bs-toggle="tooltip" data-bs-placement="top"><i className="fa fa-trash-alt" /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <SectionPagination />
            </div>

        </>
    )
}

export default CanCVManagerPage;
