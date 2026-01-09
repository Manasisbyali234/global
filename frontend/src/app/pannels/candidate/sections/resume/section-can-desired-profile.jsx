import { useEffect, useRef } from "react";

function SectionCanDesiredProfile() {
    const modalRef = useRef(null);

    useEffect(() => {
        // Initialize Bootstrap modal when component mounts
        if (window.bootstrap && modalRef.current) {
            new window.bootstrap.Modal(modalRef.current);
        }
    }, []);
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Desired Career Profile</h4>
                <a data-bs-toggle="modal" href="#Desired_Career" role="button" title="Edit" className="site-text-primary btn-link" style={{textDecoration: 'none', cursor: 'pointer', transition: 'none', outline: 'none'}}>
                    <span className="fa fa-edit" style={{transition: 'none'}} />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Industry</div>
                                <span className="twm-s-info-discription">IT-Software/Software Services</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Functional Area</div>
                                <span className="twm-s-info-discription">Design / Creative / User Experience</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Role</div>
                                <span className="twm-s-info-discription">Web Designer</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Job Type</div>
                                <span className="twm-s-info-discription">permanent</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Employment Type</div>
                                <span className="twm-s-info-discription">Full Time</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Desired Shift</div>
                                <span className="twm-s-info-discription">Add Desired Shift</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Availability to Join</div>
                                <span className="twm-s-info-discription">06 August</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Expected Salary</div>
                                <span className="twm-s-info-discription">1 Lakhs</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Desired Location</div>
                                <span className="twm-s-info-discription">Add Desired Location</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Desired Industry</div>
                                <span className="twm-s-info-discription">Add Desired Industry</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Desired Career Profile */}
            <div className="modal fade twm-saved-jobs-view" id="Desired_Career" tabIndex={-1} ref={modalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">Desired Career Profile</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/*Industry*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Industry</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option>Accounting / Finance</option>
                                                    <option>Banking / Financial Services / Broking</option>
                                                    <option>Education / Teaching / Training</option>
                                                    <option>IT-Hardware / Networking</option>
                                                    <option>Other</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-industry" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*Functional Area / Department*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Functional Area / Department</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option>Agent</option>
                                                    <option>Architecture / Interior Design</option>
                                                    <option>Beauty / Fitness / Spa Services</option>
                                                    <option>IT Hardware / Technical Support</option>
                                                    <option>IT Software - System Programming</option>
                                                    <option>Other</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-building" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*Role*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Role</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option>Creative</option>
                                                    <option>Web Designer</option>
                                                    <option>Graphic Designer</option>
                                                    <option>National Creative Director</option>
                                                    <option>Fresher</option>
                                                    <option>Other</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-globe-americas" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*Job Type*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Job Type</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="Permanent" />
                                                    <label className="form-check-label" htmlFor="Permanent">
                                                        Permanent
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="Contractual" defaultChecked />
                                                    <label className="form-check-label" htmlFor="Contractual">
                                                        Contractual
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Employment Type*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Employment Type</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="Full_Time" />
                                                    <label className="form-check-label" htmlFor="Full_Time">
                                                        Full Time
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="part_Time" defaultChecked />
                                                    <label className="form-check-label" htmlFor="part_Time">
                                                        Part Time
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Preferred Shift*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Preferred Shift</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-4">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="S_day" />
                                                    <label className="form-check-label" htmlFor="S_day">
                                                        Day
                                                    </label>
                                                </div>
                                                <div className="col-md-4">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="S_night" defaultChecked />
                                                    <label className="form-check-label" htmlFor="S_night">
                                                        Night
                                                    </label>
                                                </div>
                                                <div className="col-md-4">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="s_part_time" defaultChecked />
                                                    <label className="form-check-label" htmlFor="s_part_time">
                                                        Part Time
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Availability to join*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Availability to Join</label>
                                            <div className="ls-inputicon-box">
                                                <input className="form-control datepicker" data-provide="datepicker" name="company_since" type="text" placeholder="mm/dd/yyyy" />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*Expected Salary*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Expected Salary</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="US_Dollars" />
                                                    <label className="form-check-label">
                                                        US Dollars
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="US_Dollars" id="indian_rpees" defaultChecked />
                                                    <label className="form-check-label" htmlFor="indian_rpees">
                                                        Indian Rupees
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Lakh</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>0 lakh</option>
                                                    <option>1 lakh</option>
                                                    <option>2 lakh</option>
                                                    <option>5 lakh</option>
                                                    <option>4 lakh</option>
                                                    <option>5 lakh</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-dollar-sign" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6">
                                        <div className="form-group">
                                            <label>Thousand</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option> 05 Thousand </option>
                                                    <option> 10 Thousand </option>
                                                    <option> 15 Thousand </option>
                                                    <option> 20 Thousand </option>
                                                    <option> 25 Thousand </option>
                                                    <option> 30 Thousand </option>
                                                    <option> 35 Thousand </option>
                                                    <option> 40 Thousand </option>
                                                    <option> 45 Thousand </option>
                                                    <option> 50 Thousand </option>
                                                </select>
                                                <i className="fs-input-icon fa fa-dollar-sign" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Desired Location</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Country</option>
                                                    <option>India</option>
                                                    <option>Australia</option>
                                                    <option>Bahrain</option>
                                                    <option>China</option>
                                                    <option>Dubai</option>
                                                    <option>France</option>
                                                    <option>Germany</option>
                                                    <option>Hong Kong</option>
                                                    <option>Kuwait</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-map-marker-alt" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group mb-0">
                                            <label>Desired Industry</label>
                                            <div className="ls-inputicon-box">
                                                <select className="wt-select-box selectpicker" data-live-search="true" title="" data-bv-field="size">
                                                    <option className="bs-title-option" value>Country</option>
                                                    <option>Software</option>
                                                    <option>Factory</option>
                                                    <option>Ngo</option>
                                                    <option>Other</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-globe-americas" />
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
export default SectionCanDesiredProfile;
