import { publicUrlFor } from "../../../../../globals/constants";
import JobZImage from "../../../../common/jobz-img";

function SectionOfficePhotos3() {
    return (
        <>
            <h4 className="twm-s-title">Office Photos</h4>
            <div className="tw-sidebar-gallery-2">
                <div className="row">
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic1.jpg")} title="Title 1" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic1.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic1.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic2.jpg")} title="Title 2" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic2.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic2.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb ">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic3.jpg")} title="Title 3" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic3.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic3.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic4.jpg")} title="Title 4" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic4.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic4.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic5.jpg")} title="Title 5" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic5.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic5.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic6.jpg")} title="Title 6" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic6.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic6.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic1.jpg")} title="Title 7" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic1.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic7.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                        <div className="tw-service-gallery-thumb">
                            <a className="elem" href={publicUrlFor("images/gallery/thumb/pic2.jpg")} title="Title 8" data-lcl-author data-lcl-thumb={publicUrlFor("images/gallery/thumb/pic2.jpg")}>
                                <JobZImage src="images/gallery/thumb/pic8.jpg" alt="" />
                                <i className="fa fa-file-image" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionOfficePhotos3;
