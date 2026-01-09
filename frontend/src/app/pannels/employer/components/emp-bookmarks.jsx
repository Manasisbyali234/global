import JobZImage from "../../../common/jobz-img";

function EmpBookmarksPage() {
    return (
        <>
            <div>
                <div className="wt-admin-right-page-header clearfix">
                    <h2>Bookmark</h2>
                    <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dasboard</a><span>Bookmarked Jobs</span></div>
                </div>
                <div className="twm-pro-view-chart-wrap">
                    <div className="col-lg-12 col-md-12 mb-4">
                        <div className="panel panel-default site-bg-white m-t30">
                            <div className="panel-heading wt-panel-heading p-a20">
                                <h4 className="panel-tittle m-a0"><i className="far fa-bookmark" />Bookmarked Jobs</h4>
                            </div>
                            <div className="panel-body wt-panel-body">
                                <div className="twm-D_table p-a20 table-responsive">
                                    <table id="jobs_bookmark_table" className="table table-bordered twm-bookmark-list-wrap">
                                        <thead>
                                            <tr>
                                                <th>Job Title</th>
                                                <th>Job Types</th>
                                                <th>Post Timing</th>
                                                <th>Applied Date</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/*1*/}
                                            <tr>
                                                <td>
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Senior Web Designer</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-green">New</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Sr. Rolling Stock Technician</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-brown">Intership</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic3.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>IT Department Manager</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-purple">Fulltime</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic4.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Art Production Specialist</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-sky">Freelancer</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic5.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Recreation &amp; Fitness Worker</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-golden">Temporary</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Senior Web Designer</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-green">New</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                    <div className="twm-bookmark-list">
                                                        <div className="twm-media">
                                                            <div className="twm-media-pic">
                                                                <JobZImage src="images/jobs-company/pic2.jpg" alt="#" />
                                                            </div>
                                                        </div>
                                                        <div className="twm-mid-content">
                                                            <a href="#" className="twm-job-title">
                                                                <h4>Sr. Rolling Stock Technician</h4>
                                                            </a>
                                                            <p className="twm-bookmark-address">
                                                                <i className="feather-map-pin" />1363-1385 Sunset Blvd Los Angeles, CA 90026, USA
                                                            </p>
                                                            <a href="#" className="twm-job-websites site-text-primary">https://thewebmax.com</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><div className="twm-jobs-category"><span className="twm-bg-green">New</span></div></td>
                                                <td><div className="twm-job-post-duration">20 days ago</div></td>
                                                <td>08/06/2023</td>
                                                <td><span className="text-clr-green2">Active</span></td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button title="View profile" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button title="Send message" data-bs-toggle="tooltip" data-bs-placement="top">
                                                                    <span className="far fa-envelope-open" />
                                                                </button>
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
                                                <th>Job Types</th>
                                                <th>Post Timing</th>
                                                <th>Applied Date</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default EmpBookmarksPage;
