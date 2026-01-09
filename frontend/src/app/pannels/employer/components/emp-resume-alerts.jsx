function EmpResumeAlertsPage() {
    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Resume Alerts!</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dasboard</a><span>Resume Alerts</span></div>
            </div>
            <div className="panel panel-default site-bg-white m-t30">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><i className="far fa-bell" />Alerts</h4>
                </div>
                <div className="panel-body wt-panel-body">
                    <div className="p-a20 table-responsive">
                        <table className="table twm-table table-striped table-borderless">
                            <thead>
                                <tr>
                                    <th>Number Jobs</th>
                                    <th>Title</th>
                                    <th>Jobs Description</th>
                                    <th>Times</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*1*/}
                                <tr>
                                    <td>5</td>
                                    <td>Web Developer</td>
                                    <td>A strategic approach to website design and development.</td>
                                    <td>Weekly</td>
                                    <td>
                                        <button type="button" title="View" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button title="delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                                {/*2*/}
                                <tr>
                                    <td>3</td>
                                    <td>SEO Experts</td>
                                    <td>Providing the best SEO practices.</td>
                                    <td>Hourly</td>
                                    <td>
                                        <button title="View" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button title="delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                                {/*3*/}
                                <tr>
                                    <td>5</td>
                                    <td>Web Developer</td>
                                    <td>As promised, we’re the most professional website designing company.</td>
                                    <td>Weekly</td>
                                    <td>
                                        <button title="View" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button title="delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                                {/*4*/}
                                <tr>
                                    <td>5</td>
                                    <td>Web Designer</td>
                                    <td>Custom web design solutions websites with personality.</td>
                                    <td>Weekly</td>
                                    <td>
                                        <button title="View" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button title="delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                                {/*5*/}
                                <tr>
                                    <td>5</td>
                                    <td>Web Developer</td>
                                    <td>A strategic approach to website design and development.</td>
                                    <td>Weekly</td>
                                    <td>
                                        <button title="View" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-eye" />
                                        </button>
                                        <button title="delete" data-bs-toggle="tooltip" data-bs-placement="top">
                                            <i className="fa fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
export default EmpResumeAlertsPage;
