import JobZImage from "../../../../common/jobz-img";

function SectionCanChat() {
    return (
        <>
            <div className="wt-dashboard-msg-box">
                <div className="single-msg-user-name-box">
                    <div className="single-msg-short-discription">
                        <h4 className="single-msg-user-name">Randall Henderson </h4>
                        IT Contractor
                    </div>
                    <a href="#" className="message-action"><i className="far fa-trash-alt" /> Delete Conversation</a>
                </div>
                <div id="msg-chat-wrap" className="single-user-msg-conversation scrollbar-macosx">
                    <div className="single-user-comment-wrap">
                        <div className="row">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                                    <div className="single-user-com-text">Breaking the endless cycle of meaningless text message conversations starts with only talking to someone who offers interesting topics opinions.</div>
                                    <div className="single-user-msg-time">12:13 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-user-comment-wrap sigle-user-reply">
                        <div className="row justify-content-end">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                    <div className="single-user-com-text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.</div>
                                    <div className="single-user-msg-time">12:37 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-user-comment-wrap">
                        <div className="row">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                                    <div className="single-user-com-text">Breaking the endless cycle of meaningless text message conversations starts with only talking to someone who offers interesting topics opinions.</div>
                                    <div className="single-user-msg-time">12:13 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-user-comment-wrap sigle-user-reply">
                        <div className="row justify-content-end">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                    <div className="single-user-com-text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.</div>
                                    <div className="single-user-msg-time">12:37 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-user-comment-wrap">
                        <div className="row">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                                    <div className="single-user-com-text">Breaking the endless cycle of meaningless text message conversations starts with only talking to someone who offers interesting topics opinions.</div>
                                    <div className="single-user-msg-time">12:13 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="single-user-comment-wrap sigle-user-reply">
                        <div className="row justify-content-end">
                            <div className="col-xl-9 col-lg-12">
                                <div className="single-user-comment-block clearfix">
                                    <div className="single-user-com-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                    <div className="single-user-com-text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.</div>
                                    <div className="single-user-msg-time">12:37 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="single-msg-reply-comment">
                    <div className="input-group">
                        <textarea className="form-control" placeholder="Type a message here" defaultValue={""} />
                        <button className="btn" type="button"><i className="fa fa-paper-plane" /></button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanChat;
