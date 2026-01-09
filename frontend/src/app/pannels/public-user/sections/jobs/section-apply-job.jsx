import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import { DropzoneComponent } from "react-dropzone-component";

function SectionApplyJob() {
    
    var componentConfig = {
        postUrl: 'upload.php'
    };

    return (
        <>
            <div className="twm-tabs-style-1">
                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12">
                        <div className="form-group">
                            <label>Your Name</label>
                            <div className="ls-inputicon-box">
                                <input className="form-control" name="company_name" type="text" placeholder="Devid Smith" />
                                <i className="fs-input-icon fa fa-user " />
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="ls-inputicon-box">
                                <input className="form-control" name="company_Email" type="email" placeholder="Devid@example.com" />
                                <i className="fs-input-icon fas fa-at" />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label>Message</label>
                            <textarea className="form-control" rows={3} placeholder="Message sent to the employer" defaultValue={""} />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12">
                        <div className="form-group">
                            <label>Upload Resume</label>
                            <DropzoneComponent config={componentConfig} />
                            <small>If you do not have a resume document, you may write your brief professional profile
                                <NavLink to={publicUser.pages.CONTACT} className="site-text-primary"> here</NavLink>
                            </small>
                        </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12">
                        <div className="text-left">
                            <button type="submit" className="site-button">Send Application</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default SectionApplyJob;
