function SectionCanEmployment() {
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Present Employment</h4>
                <a data-bs-toggle="modal" href="#Employment" role="button" title="Edit" className="site-text-primary">
                    <span className="fa fa-edit" />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p><b>Senior UI / UX Designer and Developer</b></p>
                    <p>Google INC</p>
                    <p>Experience (6 Year)</p>
                    <p>Available to join in 1 Months</p>
                </div>
            </div>
            {/*Employment */}
            <div className="modal fade twm-saved-jobs-view" id="Employment" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">Add Present Employment Deatails</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Your Designation</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter Your Designation" />
                                                <i className="fs-input-icon fa fa-address-card" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Your Organization</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control" type="text" placeholder="Enter Your Organization" />
                                                <i className="fs-input-icon fa fa-building" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Is this your current company?</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                                                        Yes
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="S_no" defaultChecked />
                                                    <label className="form-check-label" htmlFor="S_no">
                                                        No
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
                                            <label>Describe your Job Profile</label>
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
export default SectionCanEmployment;
