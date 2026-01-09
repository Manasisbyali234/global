import { useEffect } from "react";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";

function ComingSoonPage() {

    useEffect(()=>{
        loadScript("js/countdown-timer.js");
    })

    return (
        <>
            <div className="section-full site-bg-gray twm-c-soon-area" style={{ backgroundImage: `url(${publicUrlFor("images/background/bg-3.jpg")})` }}>
                <div className="twm-c-soon-wrap">
                    <div className="row">
                        <div className="col-lg-12 col-md-12">
                            <div className="twm-c-soon-content">
                                <h2 className="twm-c-soon-title"><span className="site-text-primary">Coming Soon !</span> We're doing something amazing
                                    almost done...</h2>
                                <p className="twm-c-soon-title2">Type Your Email To Get Notified</p>
                                <form>
                                    <div className="cs-nw-form">
                                        <input name="news-letter" className="form-control" placeholder="Enter Your Email" type="text" />
                                        <button className="cs-subcribe-btn">Notify Me</button>
                                    </div>
                                </form>
                                <ul className="social-icons">
                                <li><a href="https://www.facebook.com/" className="fab fa-facebook-f" /></li>
                                <li><a href="https://www.twitter.com/" className="fab fa-twitter" /></li>
                                <li><a href="https://www.instagram.com/" className="fab fa-instagram" /></li>
                                <li><a href="https://www.youtube.com/" className="fab fa-youtube" /></li>
                                </ul>
                                <div className="twm-countdown-wrap">
                                    <div id="timer" data-endtime="28 December 2023 02:15:00 GMT+01:00" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ComingSoonPage;
