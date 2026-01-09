import { useState } from 'react';

function SectionCanPersonalDetail() {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        gender: '',
        residentialAddress: '',
        permanentAddress: '',
        hometown: '',
        pincode: '',
        maritalStatus: '',
        passportNumber: '',
        assistance: '',
        workPermit: ''
    });
    const [sameAsResidential, setSameAsResidential] = useState(false);
    const [dobError, setDobError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDobChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            setDobError('Date of birth cannot be in the future');
            return;
        }
        setDobError('');
        setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
    };

    const handleCheckboxChange = (e) => {
        setSameAsResidential(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, permanentAddress: prev.residentialAddress }));
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Personal Details</h4>
                <a data-bs-toggle="modal" href="#Personal_Details" role="button" title="Edit" className="site-text-primary">
                    <span className="fa fa-edit" />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Date of Birth</div>
                                <span className="twm-s-info-discription">31 July 1998</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Permanent Address</div>
                                <span className="twm-s-info-discription">Add Permanent Address</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Gender</div>
                                <span className="twm-s-info-discription">Male</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Area Pin Code</div>
                                <span className="twm-s-info-discription">302021</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Marital Status</div>
                                <span className="twm-s-info-discription">Single / unmarried</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Hometown</div>
                                <span className="twm-s-info-discription">USA</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Passport Number</div>
                                <span className="twm-s-info-discription">+123 456 7890</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Work permit of other country</div>
                                <span className="twm-s-info-discription">UK</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Differently Abled</div>
                                <span className="twm-s-info-discription">None</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="twm-s-detail-section">
                                <div className="twm-title">Languages</div>
                                <span className="twm-s-info-discription">English</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Personal Details Modal */}
            <div className="modal fade twm-saved-jobs-view" id="Personal_Details" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">Personal Detail</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/*Birth Date*/}
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    name="dateOfBirth" 
                                                    type="date" 
                                                    value={formData.dateOfBirth}
                                                    onChange={handleDobChange}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                            {dobError && <small className="text-danger">{dobError}</small>}
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="gender" id="S_male" value="male" onChange={handleInputChange} />
                                                    <label className="form-check-label" htmlFor="S_male">
                                                        Male
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input className="form-check-input" type="radio" name="gender" id="S_female" value="female" onChange={handleInputChange} />
                                                    <label className="form-check-label" htmlFor="S_female">
                                                        Female
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Residential Address</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    name="residentialAddress"
                                                    value={formData.residentialAddress}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Residential Address" 
                                                />
                                                <i className="fs-input-icon fa fa-map-marker-alt" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <div className="form-check mb-2">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id="sameAsResidential"
                                                    checked={sameAsResidential}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label className="form-check-label" htmlFor="sameAsResidential">
                                                    Permanent address same as residential address
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Permanent Address</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    name="permanentAddress"
                                                    value={formData.permanentAddress}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Permanent Address" 
                                                    disabled={sameAsResidential}
                                                />
                                                <i className="fs-input-icon fa fa-map-marker-alt" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Hometown</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    name="hometown"
                                                    value={formData.hometown}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Hometown" 
                                                />
                                                <i className="fs-input-icon fa fa-map-marker-alt" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Pincode" 
                                                />
                                                <i className="fs-input-icon fa fa-map-pin" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Marital Status</label>
                                            <div className="ls-inputicon-box">
                                                <select 
                                                    className="wt-select-box selectpicker" 
                                                    name="maritalStatus"
                                                    value={formData.maritalStatus}
                                                    onChange={handleInputChange}
                                                    data-live-search="true" 
                                                    title="" 
                                                    data-bv-field="size"
                                                >
                                                    <option className="bs-title-option" value>Select Category</option>
                                                    <option>Married</option>
                                                    <option>Single</option>
                                                </select>
                                                <i className="fs-input-icon fa fa-user" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Passport Number</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    name="passportNumber"
                                                    value={formData.passportNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Passport Number" 
                                                />
                                                <i className="fs-input-icon fa fa-star-of-life" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label>What assistance do you need</label>
                                            <textarea 
                                                className="form-control" 
                                                rows={3} 
                                                name="assistance"
                                                value={formData.assistance}
                                                onChange={handleInputChange}
                                                placeholder="Describe" 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group mb-0">
                                            <label>Work Permit for Other Countries</label>
                                            <div className="ls-inputicon-box">
                                                <select 
                                                    className="wt-select-box selectpicker" 
                                                    name="workPermit"
                                                    value={formData.workPermit}
                                                    onChange={handleInputChange}
                                                    data-live-search="true" 
                                                    title="" 
                                                    data-bv-field="size"
                                                >
                                                    <option className="bs-title-option" value>Country</option>
                                                    <option>Afghanistan</option>
                                                    <option>Albania</option>
                                                    <option>Algeria</option>
                                                    <option>Andorra</option>
                                                    <option>Angola</option>
                                                    <option>Antigua and Barbuda</option>
                                                    <option>Argentina</option>
                                                    <option>Armenia</option>
                                                    <option>Australia</option>
                                                    <option>Austria</option>
                                                    <option>Azerbaijan</option>
                                                    <option>The Bahamas</option>
                                                    <option>Bahrain</option>
                                                    <option>Bangladesh</option>
                                                    <option>Barbados</option>
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
export default SectionCanPersonalDetail;
