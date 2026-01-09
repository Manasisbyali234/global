// import JobZImage from "../../../../common/jobz-img";
// import { NavLink, useLocation } from "react-router-dom";
// import { setMenuActive } from "../../../../../globals/constants";
// import { candidate, canRoute, publicUser } from "../../../../../globals/route-names";

// function CanSidebarSection() {
//     const currentpath = useLocation().pathname;
//     return (
//         <>
//             <div className="twm-candidate-profile-pic">
//                 <JobZImage src="images/user-avtar/pic4.jpg" alt="" />
//                 <div className="upload-btn-wrapper">
//                     <div id="upload-image-grid" />
//                     <button className="site-button button-sm">Upload Photo</button>
//                     <input type="file" name="myfile" id="file-uploader" accept=".jpg, .jpeg, .png" />
//                 </div>
//             </div>
//             <div className="twm-mid-content text-center">
//                 <NavLink to={canRoute(publicUser.candidate.DETAIL1)} className="twm-job-title">
//                     <h4>Randall Henderson </h4>
//                 </NavLink>
//                 <p>IT Contractor</p>
//             </div>
//             <div className="twm-nav-list-1">
//                 <ul>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.DASHBOARD))}>
//                         <NavLink to={canRoute(candidate.DASHBOARD)}><i className="fa fa-tachometer-alt" />
//                             Dashboard
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.PROFILE))}>
//                         <NavLink to={canRoute(candidate.PROFILE)}><i className="fa fa-user" />
//                             My Profile
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.APPLIED_JOBS))}>
//                         <NavLink to={canRoute(candidate.APPLIED_JOBS)}><i className="fa fa-suitcase" />
//                             Applied Jobs
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.RESUME))}>
//                         <NavLink to={canRoute(candidate.RESUME)}><i className="fa fa-receipt" />
//                             My Resume
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.SAVED_JOBS))}>
//                         <NavLink to={canRoute(candidate.SAVED_JOBS)}><i className="fa fa-file-download" />
//                             Saved Jobs
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.CV_MANAGER))}>
//                         <NavLink to={canRoute(candidate.CV_MANAGER)}><i className="fa fa-paperclip" />
//                             CV Manager
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.ALERTS))}>
//                         <NavLink to={canRoute(candidate.ALERTS)}><i className="fa fa-bell" />
//                             Job Alerts
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.CHANGE_PASSWORD))}>
//                         <NavLink to={canRoute(candidate.CHANGE_PASSWORD)}><i className="fa fa-fingerprint" />
//                             Change Passeord
//                         </NavLink>
//                     </li>
//                     <li className={setMenuActive(currentpath, canRoute(candidate.CHAT))}>
//                         <NavLink to={canRoute(candidate.CHAT)}><i className="fa fa-comments" />
//                             Chat
//                         </NavLink>
//                     </li>
//                 </ul>
//             </div>
//         </>
//     )
// }

// export default CanSidebarSection;
