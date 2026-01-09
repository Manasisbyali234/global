import JobZImage from "../../../../common/jobz-img";

function EmpMessages1Page() {
    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Messages</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dasboard</a><span>Messages</span></div>
            </div>
            <div className="wt-admin-dashboard-msg-2">
                {/*Left Msg section*/}
                <div className="wt-dashboard-msg-user-list">
                    <div className="user-msg-list-btn-outer">
                        <button className="user-msg-list-btn-close">Close</button>
                        <button className="user-msg-list-btn-open">User Message</button>
                    </div>
                    {/* Search Section Start*/}
                    <div className="wt-dashboard-msg-search">
                        <div className="input-group">
                            <input className="form-control" placeholder="Search Messages" type="text" />
                            <button className="btn" type="button"><i className="fa fa-search" /></button>
                        </div>
                    </div>
                    {/* Search Section End*/}
                    {/* Search Section End*/}
                    <div className="msg-find-list">
                        <select className="wt-select-box bs-select-hidden">
                            <option>Recent Chats</option>
                            <option>Short by Time</option>
                            <option>Short by Unread</option>
                        </select>
                    </div>
                    {/* Search Section End*/}
                    {/* user msg list start*/}
                    <div id="msg-list-wrap" className="wt-dashboard-msg-search-list scrollbar-macosx">
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">2 hours ago</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Rustin Duza</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">4 hours ago</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic2.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Peter Hawkins</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">Fri</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic3.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Ralph Johnson</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">Thu</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Randall Henderson</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Randall Warren</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic2.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Christina Fischer </div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic3.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Wanda Willis</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Peter Hawkins</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Kathleen Moreno</div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                        <div className="wt-dashboard-msg-search-list-wrap">
                            <a href="#" className="msg-user-info clearfix">
                                <div className="msg-user-timing">16/07/2019</div>
                                <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic2.jpg" alt="" /></div>
                                <div className="msg-user-info-text">
                                    <div className="msg-user-name">Wanda Montgomery </div>
                                    <div className="msg-user-discription">All created by our Global</div>
                                </div>
                            </a>
                        </div>
                    </div>
                    {/* user msg list End*/}
                </div>
                {/*Right Msg section*/}
                <div className="wt-dashboard-msg-box">
                    <div className="single-msg-user-name-box">
                        <div className="single-msg-short-discription">
                            <h4 className="single-msg-user-name">Rustin Duza</h4>
                            Independent Web Designers and Developers.
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
            </div>
        </>
    )
}
export default EmpMessages1Page;
