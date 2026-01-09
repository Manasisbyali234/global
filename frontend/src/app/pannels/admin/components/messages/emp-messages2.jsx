import JobZImage from "../../../../common/jobz-img";

function EmpMessages2Page() {
    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Messages</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dasboard</a><span>Messages</span></div>
            </div>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><i className="far fa-envelope" />Inbox</h4>
                </div>
                <div className="panel-body wt-panel-body bg-white">
                    <div className="dashboard-messages-box">
                        <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                        <div className="dashboard-message-area">
                            <h5>Lucy Smith - <span>24 April 2023</span></h5>
                            <p>Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps. Nanotechnology immersion along the information highway will close the loop. Bring to the table win-win survival strategies to ensure proactive domination.</p>
                            <div className="dropdown">
                                <a href="#" className="dropdown-toggle" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    Reply
                                </a>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <div className="dashboard-message-reply-textarea p-a20">
                                        <div className="form-group wt-input-icon">
                                            <div className="input-group">
                                                <i className="input-group-addon fa fa-pencil v-align-t " />
                                                <textarea aria-required="true" rows={4} cols={45} name="comment" className="form-control" placeholder="Message *" defaultValue={""} />
                                            </div>
                                        </div>
                                        <div className="form-submit m-t10">
                                            <button className="site-button" type="submit">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-messages-box">
                        <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic3.jpg" alt="" /></div>
                        <div className="dashboard-message-area">
                            <h5>Richred paul - <span>30 April 2023</span></h5>
                            <p>Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation is on the runway heading towards a streamlined cloud solution user generated content. Capitalize on low hanging fruit to identify a ballpark value added activity to beta test.</p>
                        </div>
                    </div>
                    <div className="dashboard-messages-box">
                        <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                        <div className="dashboard-message-area">
                            <h5>Jon Doe - <span>01 June 2023</span></h5>
                            <p>Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps. Nanotechnology immersion along the information highway will close the loop. Bring to the table win-win survival strategies to ensure proactive domination.</p>
                        </div>
                    </div>
                    <div className="dashboard-messages-box">
                        <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                        <div className="dashboard-message-area">
                            <h5>Thomas Smith - <span>05 June 2023</span></h5>
                            <p>Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation is on the runway heading towards a streamlined cloud solution user generated content. Capitalize on low hanging fruit to identify a ballpark value added activity to beta test.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default EmpMessages2Page;
