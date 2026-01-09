function SectionJobsSearch() {
    return (
        <>
            <form>
                {/*Search Bar*/}
                {/*Basic Information*/}
                <div className="panel panel-default">
                    <div className="panel-heading wt-panel-heading p-a20">
                        <h4 className="panel-tittle m-a0"><i className="fa fa-suitcase" />Find Jobs</h4>
                    </div>
                    <div className="panel-body wt-panel-body p-a20 m-b30 ">
                        <div className="row">
                            {/*Job title*/}
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_name" type="text" placeholder="Types of Jobs" />
                                        <i className="fs-input-icon fa fa-address-card" />
                                    </div>
                                </div>
                            </div>
                            {/*Job Category*/}
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group city-outer-bx has-feedback">
                                    <label>Job Category</label>
                                    <div className="ls-inputicon-box">
                                        <select className="wt-select-box selectpicker" data-live-search="true" title="" id="j-category" data-bv-field="size">
                                            <option disabled>Select Category</option>
                                            <option>Accounting and Finance</option>
                                            <option>Clerical &amp; Data Entry</option>
                                            <option>Counseling</option>
                                            <option>Court Administration</option>
                                            <option>Human Resources</option>
                                            <option>Investigative</option>
                                            <option>IT and Computers</option>
                                            <option>Law Enforcement</option>
                                            <option>Management</option>
                                            <option>Miscellaneous</option>
                                            <option>Public Relations</option>
                                        </select>
                                        <i className="fs-input-icon fa fa-border-all" />
                                    </div>
                                </div>
                            </div>
                            {/*Job Type*/}
                            <div className="col-xl-4 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Job Type</label>
                                    <div className="ls-inputicon-box">
                                        <select className="wt-select-box selectpicker" data-live-search="true" title="" id="s-category" data-bv-field="size">
                                            <option className="bs-title-option" value>Select Category</option>
                                            <option>Full Time</option>
                                            <option>Freelance</option>
                                            <option>Part Time</option>
                                            <option>Internship</option>
                                            <option>Temporary</option>
                                        </select>
                                        <i className="fs-input-icon fa fa-file-alt" />
                                    </div>
                                </div>
                            </div>
                            {/*Location*/}
                            <div className="col-xl-12 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Location</label>
                                    <div className="ls-inputicon-box">
                                        <input className="form-control" name="company_Email" type="text" placeholder="Type Address" />
                                        <i className="fs-input-icon fa fa-map-marker-alt" />
                                    </div>
                                </div>
                            </div>
                            {/*Salary*/}
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Salary</label>
                                    <div className="ls-inputicon-box">
                                        <select className="wt-select-box selectpicker" data-live-search="true" title="" id="salary" data-bv-field="size">
                                            <option className="bs-title-option" value>Salary</option>
                                            <option>$500</option>
                                            <option>$1000</option>
                                            <option>$1500</option>
                                            <option>$2000</option>
                                            <option>$2500</option>
                                        </select>
                                        <i className="fs-input-icon fa fa-dollar-sign" />
                                    </div>
                                </div>
                            </div>
                            {/*Radius*/}
                            <div className="col-xl-6 col-lg-6 col-md-12">
                                <div className="form-group">
                                    <label>Radius</label>
                                    <div className="twm-radius-range">
                                        <b>10 Km</b>
                                        <input id="ex2" type="text" className="span2" data-slider-min={10} data-slider-max={100} data-slider-step={5} data-slider-value="[20,80]" />
                                        <b>100 Km</b>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="text-left">
                                    <button type="button" className="site-button">Search Job</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SectionJobsSearch;
