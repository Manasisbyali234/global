import { publicUrlFor } from "../../../../../globals/constants";

function SectionOfficeVideo1() {
    return (
        <>
            <h4 className="twm-s-title">Video</h4>
            <div className="video-section-first" style={{ backgroundImage: `url(${publicUrlFor("images/video-bg.jpg")})` }}>
                <a href="https://www.youtube.com/watch?v=c1XNqw2gSbU" className="mfp-video play-now-video">
                    <i className="icon feather-play" />
                    <span className="ripple" />
                </a>
            </div>
        </>
    )
}

export default SectionOfficeVideo1;
