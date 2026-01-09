import JobZImage from "../../../../common/jobz-img";

function SectionHowItWorks() {
    return (
        <>
            <div className="section-full p-t120 p-b90 site-bg-white twm-how-it-work-area2">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-12">
                            {/* title="" START*/}
                            <div className="section-head left wt-small-separator-outer">
                                <div className="wt-small-separator site-text-primary">
                                    <div>How It Works for Candidates </div>
                                </div>
                                <h2 className="wt-title">Follow our steps we will help you.</h2>
                            </div>
                            <ul className="description-list">
                                <li>
                                    <i className="feather-check" />
                                    Trusted &amp; Quality Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    International Job
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    No Extra Charge
                                </li>
                                <li>
                                    <i className="feather-check" />
                                    Top Companies
                                </li>
                            </ul>
                            {/* title="" END*/}
                        </div>
                        <div className="col-lg-8 col-md-12">
                            <div className="twm-w-process-steps-2-wrap">
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-sky-light bg-sky-light-shadow">
                                                <span className="twm-large-number text-clr-sky">01</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon1.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Register<br />Your Account</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-yellow-light bg-yellow-light-shadow">
                                                <span className="twm-large-number text-clr-yellow">02</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon4.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Search <br />
                                                    Your Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-pink-light bg-pink-light-shadow">
                                                <span className="twm-large-number text-clr-pink">03</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Apply <br />For Dream Job</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-6 col-lg-6 col-md-6">
                                        <div className="twm-w-process-steps-2">
                                            <div className="twm-w-pro-top bg-clr-green-light bg-clr-light-shadow">
                                                <span className="twm-large-number text-clr-green">04</span>
                                                <div className="twm-media">
                                                    <span><JobZImage src="images/work-process/icon3.png" alt="icon1" /></span>
                                                </div>
                                                <h4 className="twm-title">Upload <br />Your Resume</h4>
                                                <p>You need to create an account to find the best and preferred job.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="twm-how-it-work-section">
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionHowItWorks;
