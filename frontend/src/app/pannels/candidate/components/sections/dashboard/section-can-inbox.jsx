import JobZImage from "../../../../common/jobz-img";

function SectionCandidateInbox() {
    return (
        <>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Inbox</h4>
                </div>
                <div className="panel-body wt-panel-body bg-white">
                    <div className="dashboard-messages-box-scroll scrollbar-macosx">
                        <div className="dashboard-messages-box">
                            <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                            <div className="dashboard-message-area">
                                <h5>Lucy Smith<span>18 June 2023</span></h5>
                                <p>Bring to the table win-win survival strategies to ensure proactive domination. at the end of the day, going forward, a new normal that has evolved from generation.</p>
                            </div>
                        </div>
                        <div className="dashboard-messages-box">
                            <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic3.jpg" alt="" /></div>
                            <div className="dashboard-message-area">
                                <h5>Richred paul<span>19 June 2023</span></h5>
                                <p>Bring to the table win-win survival strategies to ensure proactive domination. at the end of the day, going forward, a new normal that has evolved from generation.</p>
                            </div>
                        </div>
                        <div className="dashboard-messages-box">
                            <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                            <div className="dashboard-message-area">
                                <h5>Jon Doe<span>20 June 2023</span></h5>
                                <p>Bring to the table win-win survival strategies to ensure proactive domination. at the end of the day, going forward, a new normal that has evolved from generation.</p>
                            </div>
                        </div>
                        <div className="dashboard-messages-box">
                            <div className="dashboard-message-avtar"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                            <div className="dashboard-message-area">
                                <h5>Thomas Smith<span>22 June 2023</span></h5>
                                <p>Bring to the table win-win survival strategies to ensure proactive domination. at the end of the day, going forward, a new normal that has evolved from generation. </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionCandidateInbox;
