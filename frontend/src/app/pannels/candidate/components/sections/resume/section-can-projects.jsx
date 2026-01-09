function SectionCanProjects() {
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Project</h4>
                <a data-bs-toggle="modal" href="#Pro_ject" role="button" title="Edit" className="site-text-primary">
                    <span className="fa fa-edit" />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p><b>Jobzilla</b></p>
                    <p>Google INC</p>
                    <p>January 2023 to Present</p>
                    <p>Jobjilla Template</p>
                </div>
            </div>
            {/*Project */}
            <div className="modal fade twm-saved-jobs-view" id="Pro_ject" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">Add Project</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Project Title</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter Project Title" />
                                                <i className="fs-input-icon fa fa-address-card" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Education</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>Graduation/Diploma</option>
                                                    <option>Masters/Post-Graduation</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-user-graduate" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Client</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter Client Name" />
                                                <i className="fs-input-icon fa fa-user" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Project Status</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="In_Progress" />
                                                    <label className="form-check-label" htmlFor="In_Progress">
                                                        In Progress
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="Finished" defaultChecked />
                                                    <label className="form-check-label" htmlFor="Finished">
                                                        Finished
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Start Date*/}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Started Working From</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*End Date*/}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Worked Till</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group mb-0">
                                            <label>Detail of Projects</label>
                                            <textarea className="form-control" rows={3} placeholder="Describe your Job" defaultValue={""} />
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
export default SectionCanProjects;
