// import JobZImage from "../../../common/jobz-img";
// import { NavLink } from "react-router-dom";
// import { canRoute, candidate } from "../../../../globals/route-names";

// function CanHeaderSection(props) {
//     return (
//         <>
//             <header id="header-admin-wrap" className="header-admin-fixed">
//                 {/* Header Start */}
//                 <div id="header-admin" className={props.sidebarActive ? "" : "active"}>
//                     <div className="container">
//                         {/* Left Side Content */}
//                         <div className="header-left">
//                             <div className="nav-btn-wrap">
//                                 <a className="nav-btn-admin" id="sidebarCollapse" onClick={props.onClick}>
//                                     <span className="fa fa-angle-left" />
//                                 </a>
//                             </div>
//                         </div>
//                         {/* Left Side Content End */}
//                         {/* Right Side Content */}
//                         <div className="header-right">
//                             <ul className="header-widget-wrap">
//                                 {/*Message*/}
//                                 <li className="header-widget dashboard-message-dropdown">
//                                     <div className="dropdown">
//                                         <a href="#" className="dropdown-toggle jobzilla-admin-messange" id="ID-MSG_dropdown" data-bs-toggle="dropdown">
//                                             <i className="far fa-envelope" />
//                                             <span className="notification-animate">4</span>
//                                         </a>
//                                         <div className="dropdown-menu" aria-labelledby="ID-MSG_dropdown">
//                                             <div className="message-list dashboard-widget-scroll">
//                                                 <ul>
//                                                     <li className="clearfix">
//                                                         <span className="msg-avtar">
//                                                             <JobZImage src="images/user-avtar/pic1.jpg" alt="" />
//                                                         </span>
//                                                         <div className="msg-texting">
//                                                             <strong>Alexa Johnson</strong>
//                                                             <small className="msg-time">
//                                                                 <span className="far fa-clock p-r-5" />12 mins ago
//                                                             </small>
//                                                             <p>Lorem ipsum dolor sit amet, consectetur...</p>
//                                                         </div>
//                                                     </li>
//                                                     <li className="clearfix">
//                                                         <span className="msg-avtar">
//                                                             <JobZImage src="images/user-avtar/pic2.jpg" alt="" />
//                                                         </span>
//                                                         <div className="msg-texting">
//                                                             <strong>Johan Smith</strong>
//                                                             <small className="msg-time">
//                                                                 <span className="far fa-clock p-r-5" />2 hours ago
//                                                             </small>
//                                                             <p>Lorem ipsum dolor sit amet, consectetur...</p>
//                                                         </div>
//                                                     </li>
//                                                     <li className="clearfix">
//                                                         <span className="msg-avtar">
//                                                             <JobZImage src="images/user-avtar/pic3.jpg" alt="" />
//                                                         </span>
//                                                         <div className="msg-texting">
//                                                             <strong>Bobby Brown</strong>
//                                                             <small className="msg-time">
//                                                                 <span className="far fa-clock p-r-5" />3 hours ago
//                                                             </small>
//                                                             <p>Lorem ipsum dolor sit amet, consectetur...</p>
//                                                         </div>
//                                                     </li>
//                                                     <li className="clearfix">
//                                                         <span className="msg-avtar">
//                                                             <JobZImage src="images/user-avtar/pic4.jpg" alt="" />
//                                                         </span>
//                                                         <div className="msg-texting">
//                                                             <strong>David Deo</strong>
//                                                             <small className="msg-time">
//                                                                 <span className="far fa-clock p-r-5" />4 hours ago
//                                                             </small>
//                                                             <p>Lorem ipsum dolor sit amet, consectetur...</p>
//                                                         </div>
//                                                     </li>
//                                                 </ul>
//                                                 <div className="message-view-all">
//                                                     <a href="#">View All</a>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </li>
//                                 {/*Notification*/}
//                                 <li className="header-widget dashboard-noti-dropdown">
//                                     <div className="dropdown">
//                                         <a href="#" className="dropdown-toggle jobzilla-admin-notification" id="ID-NOTI_dropdown" data-bs-toggle="dropdown">
//                                             <i className="far fa-bell" />
//                                             <span className="notification-animate">8</span>
//                                         </a>
//                                         <div className="dropdown-menu" aria-labelledby="ID-NOTI_dropdown">
//                                             <div className="dashboard-widgets-header">You have 7 notifications</div>
//                                             <div className="noti-list dashboard-widget-scroll">
//                                                 <ul>
//                                                     <li>
//                                                         <a href="#">
//                                                             <span className="noti-icon"><i className="far fa-bell" /></span>
//                                                             <span className="noti-texting">Devid applied for <b>Webdesigner.</b> </span>
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#">
//                                                             <span className="noti-icon"><i className="far fa-bell" /></span>
//                                                             <span className="noti-texting">Nikol sent you a message. </span>
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#">
//                                                             <span className="noti-icon"><i className="far fa-bell" /></span>
//                                                             <span className="noti-texting">lucy bookmarked your <b>SEO Expert</b> Job! </span>
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#">
//                                                             <span className="noti-icon"><i className="far fa-bell" /></span>
//                                                             <span className="noti-texting">Your job for <b>teacher</b> has been approved! </span>
//                                                         </a>
//                                                     </li>
//                                                     <li>
//                                                         <a href="#">
//                                                             <span className="noti-icon"><i className="far fa-bell" /></span>
//                                                             <span className="noti-texting">Thor applied for <b>Team Leader</b>. </span>
//                                                         </a>
//                                                     </li>
//                                                 </ul>
//                                                 <div className="noti-view-all">
//                                                     <a href="#">View All</a>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </li>
//                                 {/*Account*/}
//                                 <li className="header-widget">
//                                     <div className="dashboard-user-section">
//                                         <div className="listing-user">
//                                             <div className="dropdown">
//                                                 <a href="#" className="dropdown-toggle" id="ID-ACCOUNT_dropdown" data-bs-toggle="dropdown">
//                                                     <div className="user-name text-black">
//                                                         <span>
//                                                             <JobZImage src="images/user-avtar/pic4.jpg" alt="" />
//                                                         </span>Nikola Tesla
//                                                     </div>
//                                                 </a>
//                                                 <div className="dropdown-menu" aria-labelledby="ID-ACCOUNT_dropdown">
//                                                     <ul>
//                                                         <li><NavLink to={canRoute(candidate.DASHBOARD)}><i className="fa fa-home" />Dashboard</NavLink></li>
//                                                         <li><NavLink to={canRoute(candidate.MESSAGES1)}><i className="fa fa-envelope" /> Messages</NavLink></li>
//                                                         <li><NavLink to={canRoute(candidate.PROFILE)}><i className="fa fa-user" /> Profile</NavLink></li>
//                                                         <li><a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile"><i className="fa fa-share-square" /> Logout</a></li>
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </li>
//                             </ul>
//                         </div>
//                         {/* Right Side Content End */}
//                     </div>
//                 </div>
//                 {/* Header End */}
//             </header>

//         </>
//     )
// }

// export default CanHeaderSection;
