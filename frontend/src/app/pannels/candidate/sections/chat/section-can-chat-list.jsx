import JobZImage from "../../../../common/jobz-img";

function SectionCanChatList() {
    return (
        <>
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
                            <div className="msg-user-timing">16/07/2023</div>
                            <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                            <div className="msg-user-info-text">
                                <div className="msg-user-name">Randall Warren</div>
                                <div className="msg-user-discription">All created by our Global</div>
                            </div>
                        </a>
                    </div>
                    <div className="wt-dashboard-msg-search-list-wrap">
                        <a href="#" className="msg-user-info clearfix">
                            <div className="msg-user-timing">16/07/2023</div>
                            <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic2.jpg" alt="" /></div>
                            <div className="msg-user-info-text">
                                <div className="msg-user-name">Christina Fischer </div>
                                <div className="msg-user-discription">All created by our Global</div>
                            </div>
                        </a>
                    </div>
                    <div className="wt-dashboard-msg-search-list-wrap">
                        <a href="#" className="msg-user-info clearfix">
                            <div className="msg-user-timing">16/07/2023</div>
                            <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic3.jpg" alt="" /></div>
                            <div className="msg-user-info-text">
                                <div className="msg-user-name">Wanda Willis</div>
                                <div className="msg-user-discription">All created by our Global</div>
                            </div>
                        </a>
                    </div>
                    <div className="wt-dashboard-msg-search-list-wrap">
                        <a href="#" className="msg-user-info clearfix">
                            <div className="msg-user-timing">16/07/2023</div>
                            <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic4.jpg" alt="" /></div>
                            <div className="msg-user-info-text">
                                <div className="msg-user-name">Peter Hawkins</div>
                                <div className="msg-user-discription">All created by our Global</div>
                            </div>
                        </a>
                    </div>
                    <div className="wt-dashboard-msg-search-list-wrap">
                        <a href="#" className="msg-user-info clearfix">
                            <div className="msg-user-timing">16/07/2023</div>
                            <div className="msg-user-info-pic"><JobZImage src="images/user-avtar/pic1.jpg" alt="" /></div>
                            <div className="msg-user-info-text">
                                <div className="msg-user-name">Kathleen Moreno</div>
                                <div className="msg-user-discription">All created by our Global</div>
                            </div>
                        </a>
                    </div>
                    <div className="wt-dashboard-msg-search-list-wrap">
                        <a href="#" className="msg-user-info clearfix">
                            <div className="msg-user-timing">16/07/2023</div>
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
        </>
    )
}
export default SectionCanChatList;
