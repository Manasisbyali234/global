import { publicUser } from "../../../../../../globals/route-names";
import JobZImage from "../../../../../common/jobz-img";
import { NavLink } from "react-router-dom";

function SectionBlogsSidebar() {
    return (
        <>
            <div className="side-bar">
                <div className="widget search-bx">
                    <form role="search" method="post">
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Search" />
                            <button className="btn" type="button" id="button-addon2"><i className="feather-search" /></button>
                        </div>
                    </form>
                </div>
                <div className="widget all_services_list">
                    <h4 className="section-head-small mb-4">Categories</h4>
                    <div className="all_services m-b30">
                        <ul>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Categories</NavLink> <span className="badge">08</span></li>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Education</NavLink> <span className="badge">12</span></li>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Information</NavLink><span className="badge">15</span></li>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Jobs</NavLink><span className="badge">25</span></li>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Learn</NavLink><span className="badge">36</span></li>
                            <li><NavLink to={publicUser.jobs.DETAIL1}>Skill</NavLink><span className="badge">12</span></li>
                        </ul>
                    </div>
                </div>
                <div className="widget recent-posts-entry">
                    <h4 className="section-head-small mb-4">Recent Article</h4>
                    <div className="section-content">
                        <div className="widget-post-bx">
                            <div className="widget-post clearfix">
                                <div className="wt-post-media">
                                    <JobZImage src="images/blog/recent-blog/pic1.jpg" alt="" />
                                </div>
                                <div className="wt-post-info">
                                    <div className="wt-post-header">
                                        <span className="post-date">April 08, 2023</span>
                                        <span className="post-title">
                                            <NavLink to={publicUser.blog.DETAIL}>Equipment you can count on. People you can trust.</NavLink>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="widget-post clearfix">
                                <div className="wt-post-media">
                                    <JobZImage src="images/blog/recent-blog/pic2.jpg" alt="" />
                                </div>
                                <div className="wt-post-info">
                                    <div className="wt-post-header">
                                        <span className="post-date">April 12, 2023</span>
                                        <span className="post-title">
                                            <NavLink to={publicUser.blog.DETAIL}>Advanced Service Functions by Air Transport</NavLink>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="widget-post clearfix">
                                <div className="wt-post-media">
                                    <JobZImage src="images/blog/recent-blog/pic3.jpg" alt="" />
                                </div>
                                <div className="wt-post-info">
                                    <div className="wt-post-header">
                                        <span className="post-date">April 15, 2023</span>
                                        <span className="post-title">
                                            <NavLink to={publicUser.blog.DETAIL}>Proper arrangement for keeping the goods in the warehouse</NavLink>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="widget-post clearfix">
                                <div className="wt-post-media">
                                    <JobZImage src="images/blog/recent-blog/pic4.jpg" alt="" />
                                </div>
                                <div className="wt-post-info">
                                    <div className="wt-post-header">
                                        <span className="post-date">April 18, 2023</span>
                                        <span className="post-title">
                                            <NavLink to={publicUser.blog.DETAIL}>Equipment you can count on. People you can trust.</NavLink>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="widget-post clearfix">
                                <div className="wt-post-media">
                                    <JobZImage src="images/blog/recent-blog/pic5.jpg" alt="" />
                                </div>
                                <div className="wt-post-info">
                                    <div className="wt-post-header">
                                        <span className="post-date">April 20, 2023</span>
                                        <span className="post-title">
                                            <NavLink to={publicUser.blog.DETAIL}>Proper arrangement for keeping the goods in the warehouse</NavLink>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="widget tw-sidebar-tags-wrap">
                    <h4 className="section-head-small mb-4">Tags</h4>
                    <div className="tagcloud">
                        <NavLink to={publicUser.jobs.LIST}>General</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Jobs </NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Payment</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Application </NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Work</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Recruiting</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Employer</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Income</NavLink>
                        <NavLink to={publicUser.jobs.LIST}>Tips</NavLink>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionBlogsSidebar;
