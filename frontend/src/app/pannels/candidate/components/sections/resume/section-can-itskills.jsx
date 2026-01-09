function SectionCanITSkills() {
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">IT Skills</h4>
                <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                    <span className="fa fa-edit" />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p>Mention your employment detail including your current and previous company work experience</p>
                    <div className="table-responsive">
                        <table className="table twm-table table-striped table-borderless">
                            <thead>
                                <tr>
                                    <th>Skills</th>
                                    <th>Version</th>
                                    <th>Last Used</th>
                                    <th>Experience</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*1*/}
                                <tr>
                                    <td>Python</td>
                                    <td>13</td>
                                    <td>2020</td>
                                    <td>1 Year</td>
                                    <td>
                                        <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                                            <span className="fa fa-edit" />
                                        </a>
                                    </td>
                                </tr>
                                {/*2*/}
                                <tr>
                                    <td>Bootstrap</td>
                                    <td>5</td>
                                    <td>2021</td>
                                    <td>1 Year</td>
                                    <td>
                                        <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                                            <span className="fa fa-edit" />
                                        </a>
                                    </td>
                                </tr>
                                {/*3*/}
                                <tr>
                                    <td>HTML</td>
                                    <td>5</td>
                                    <td>2020</td>
                                    <td>1 Year</td>
                                    <td>
                                        <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                                            <span className="fa fa-edit" />
                                        </a>
                                    </td>
                                </tr>
                                {/*4*/}
                                <tr>
                                    <td>Photoshop</td>
                                    <td>CC-2023</td>
                                    <td>2023</td>
                                    <td>1 Year</td>
                                    <td>
                                        <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                                            <span className="fa fa-edit" />
                                        </a>
                                    </td>
                                </tr>
                                {/*5*/}
                                <tr>
                                    <td>Css</td>
                                    <td>3</td>
                                    <td>2018</td>
                                    <td>1 Year</td>
                                    <td>
                                        <a data-bs-toggle="modal" href="#IT_skills" role="button" title="Edit" className="site-text-primary">
                                            <span className="fa fa-edit" />
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/*IT_skills */}
            <div className="modal fade twm-saved-jobs-view" id="IT_skills" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">IT Skills</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>IT Skills</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter IT Skills" />
                                                <i className="fs-input-icon fa fa-address-card" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Version</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter Version" />
                                                <i className="fs-input-icon fa fa-info" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Last Used</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>2021</option>
                                                    <option>2020</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Experience year</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>2021</option>
                                                    <option>2020</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-user-edit" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Month</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>January</option>
                                                    <option>February</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-user-edit" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="site-button" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="site-button">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanITSkills;
