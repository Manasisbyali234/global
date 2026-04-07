import { DropzoneComponent } from "react-dropzone-component";

function SectionCanAttachment() {

    var componentConfig = {
        postUrl: 'upload.php'
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Attach Resume</h4><span style={{ color: 'red' }}>*</span>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p>Resume upload is mandatory. May be downloaded by recruiters as per company policies</p>
                    <div className="dashboard-cover-pic">
                        <DropzoneComponent config={componentConfig} />
                        <p>Upload Resume File size is 3 MB</p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanAttachment;
