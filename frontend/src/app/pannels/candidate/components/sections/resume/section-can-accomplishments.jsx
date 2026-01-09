function SectionCanAccomplishments() {
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Accomplishments</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>Online Profile</b>
                            <a data-bs-toggle="modal" href="#Online_Profile" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add link to Online profiles (e.g. Linkedin, Facebook etc.).</p>
                    </div>
                    {/*Online Profile Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Online_Profile" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Online Profiles</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Social Profile</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Social Profile Name" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>URL</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Url" />
                                                        <i className="fs-input-icon fa fa-globe-americas" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label>Description</label>
                                                    <textarea className="form-control" rows={3} placeholder="Type Description" defaultValue={""} />
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
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>Work Sample</b>
                            <a data-bs-toggle="modal" href="#Work_Sample" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add link to your Projects (e.g. Github links etc.).</p>
                    </div>
                    {/*Work Sample Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Work_Sample" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Work Sample</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Work Title</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Work Title" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>URL</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Url" />
                                                        <i className="fs-input-icon fa fa-globe-americas" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/*Start Date*/}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Duration From</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                        <i className="fs-input-icon far fa-calendar" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/*End Date*/}
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Duration to</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                        <i className="fs-input-icon far fa-calendar" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <input className="form-check-input" type="checkbox" name="flexRadioDefault" id="Working_on" defaultChecked />
                                                    <label className="form-check-label" htmlFor="Working_on">
                                                        I am currently working on this
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label>Description</label>
                                                    <textarea className="form-control" rows={3} placeholder="Type Description" defaultValue={""} />
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
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>White Paper / Research Publication / Journal Entry</b>
                            <a data-bs-toggle="modal" href="#Research_Publication" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add links to your Online publications.</p>
                    </div>
                    {/*White Paper / Research Publication / Journal Entry Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Research_Publication" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">White Paper / Research Publication / Journal Entry</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Title</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Title" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>URL</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Url" />
                                                        <i className="fs-input-icon fa fa-globe-americas" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/*Start Date*/}
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Published On</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                        <i className="fs-input-icon far fa-calendar" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label>Description</label>
                                                    <textarea className="form-control" rows={3} placeholder="Type Description" defaultValue={""} />
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
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>Presentation</b>
                            <a data-bs-toggle="modal" href="#Presentation_modal" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add links to your Online presentations (e.g. Slideshare presentation links etc.).</p>
                    </div>
                    {/*Presentation Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Presentation_modal" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Presentation</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Social Profile</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Social Profile Name" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>URL</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Url" />
                                                        <i className="fs-input-icon fa fa-globe-americas" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label>Description</label>
                                                    <textarea className="form-control" rows={3} placeholder="Type Description" defaultValue={""} />
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
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>Certification</b>
                            <a data-bs-toggle="modal" href="#Certification_modal" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add details of Certification you have filed.</p>
                    </div>
                    {/*Certification Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Certification_modal" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Certification</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Certification Name</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Certification Name" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Certification Body</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Certification Body" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group mb-0">
                                                    <label>Year Onlabel</label>
                                                    <div className="ls-inputicon-box">
                                                        <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                            <option className="bs-title-option" value>Year</option>
                                                            <option>2021</option>
                                                            <option>2020</option>
                                                            <option>2019</option>
                                                            <option>2018</option>
                                                            <option>2017</option>
                                                            <option>2016</option>
                                                            <option>2015</option>
                                                            <option>2014</option>
                                                            <option>2013</option>
                                                            <option>2012</option>
                                                            <option>2011</option>
                                                        </select>
                                                        <i className="fs-input-icon fa fa-calendar-alt" />
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
                    <div className="twm-list-wrap">
                        <div className="twm-list-inner d-flex justify-content-between">
                            <b>Patent</b>
                            <a data-bs-toggle="modal" href="#Patent_modal" role="button" title="Edit" className="site-text-primary">
                                <span className="fa fa-edit" />
                            </a>
                        </div>
                        <p>Add details of Patents you have filed.</p>
                    </div>
                    {/*Patent Modal */}
                    <div className="modal fade twm-saved-jobs-view" id="Patent_modal" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header">
                                        <h2 className="modal-title">Patent</h2>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Title</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Title" />
                                                        <i className="fs-input-icon fa fa-address-card" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Url</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Url " />
                                                        <i className="fs-input-icon fa fa-globe-americas" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Patent Office</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Patent Office" />
                                                        <i className="fs-input-icon fa fa-building" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Application Number</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control" type="text" placeholder="Enter Application Number" />
                                                        <i className="fs-input-icon fa fa-dice-d6" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="form-group">
                                                    <label>Status</label>
                                                    <div className="row twm-form-radio-inline">
                                                        <div className="col-md-6">
                                                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="Patent_Issued" />
                                                            <label className="form-check-label" htmlFor="Patent_Issued">
                                                                Patent Issued
                                                            </label>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="Patent_pending" defaultChecked />
                                                            <label className="form-check-label" htmlFor="Patent_pending">
                                                                Patent pending
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/*Start Date*/}
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Published On</label>
                                                    <div className="ls-inputicon-box">
                                                        <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                        <i className="fs-input-icon far fa-calendar" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label>Description</label>
                                                    <textarea className="form-control" rows={3} placeholder="Type Description" defaultValue={""} />
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
                </div>
            </div>
        </>
    )
}

export default SectionCanAccomplishments;
