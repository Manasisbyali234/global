
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../../globals/route-names";
import SectionSideAdvert from "./section-side-advert";
import JobZImage from "../../../../../common/jobz-img";
import { formatDate, formatTimeToAMPM } from "../../../../../../utils/dateFormatter";

function SectionJobsSidebar2 ({ _config, job }) {
    return (
			<>
				<div className="side-bar mb-4">
					<div className="twm-s-info2-wrap mb-5">
						<div className="twm-s-info2">
							<h4 className="section-head-small mb-4" style={{fontSize: '22px', fontWeight: 'bold'}}>Job Information</h4>
							
							<ul className="twm-job-hilites">
								<li>
									<i className="fa-solid fa-users" />
									<span className="twm-title">{job?.vacancies || 'Not specified'} Vacancies</span>
								</li>

								<li>
									<i className="fa-solid fa-file-signature" />
									<span className="twm-title">{job?.applicationCount || 0} Applications{(typeof job?.applicationLimit === 'number' && job.applicationLimit > 0) ? ` / Limit: ${job.applicationLimit}` : ''}</span>
								</li>
							</ul>

							<ul className="twm-job-hilites2">
								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-calendar-days" />
										<span className="twm-title">Date Posted</span>
										<div className="twm-s-info-discription">{formatDate(new Date())}</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-calendar-check" />
										<span className="twm-title">Application Last Date</span>
										<div className="twm-s-info-discription" style={{fontWeight: 'bold', color: 'red'}}>
											{job?.lastDateOfApplication ? (
												<>
													{formatDate(job.lastDateOfApplication)}
													{job?.lastDateOfApplicationTime && (
														<span style={{fontSize: '12px', marginLeft: '8px'}}>
															at {formatTimeToAMPM(job.lastDateOfApplicationTime)}
													</span>
													)}
												</>
											) : 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-user-tie" />
										<span className="twm-title">Job Title</span>
										<div className="twm-s-info-discription">{job?.title || 'Not specified'}</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-user-graduate" />
										<span className="twm-title">Experience</span>
										<div className="twm-s-info-discription">
											{job?.experienceLevel === 'freshers' ? 'Freshers' :
											 job?.experienceLevel === 'both' ? 'Freshers & Experienced' :
											 job?.experienceLevel === 'minimum' && job?.minExperience && job?.maxExperience ? 
												`${job.minExperience}-${job.maxExperience} Year(s)` :
											 job?.experienceLevel === 'minimum' && job?.minExperience ? 
												`${job.minExperience}+ Year(s)` :
											 job?.minExperience || job?.maxExperience ? 
												`${job.minExperience || 0}-${job.maxExperience || job.minExperience || 0} Year(s)` :
											 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-graduation-cap" />
										<span className="twm-title">Qualification</span>
										<div className="twm-s-info-discription">
											{Array.isArray(job?.education) ? job.education.join(', ') : (job?.education || 'Not specified')}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-triangle-exclamation" />
										<span className="twm-title">Backlogs Allowed</span>
										<div className="twm-s-info-discription">
											{job?.backlogsAllowed ? 'Yes' : 'No'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-tags" />
										<span className="twm-title">Job Category</span>
										<div className="twm-s-info-discription">
											{job?.category || 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-business-time" />
										<span className="twm-title">Job Type</span>
										<div className="twm-s-info-discription">
											{job?.jobType || 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-briefcase" />
										<span className="twm-title">Type of Employment</span>
										<div className="twm-s-info-discription">
											{job?.typeOfEmployment ? job.typeOfEmployment.charAt(0).toUpperCase() + job.typeOfEmployment.slice(1) : 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-house" />
										<span className="twm-title">Work Mode</span>
										<div className="twm-s-info-discription">
											{job?.workMode ? (job.workMode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) : 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-bus" />
										<span className="twm-title">Transportation</span>
										<div className="twm-s-info-discription">
											{job?.transportation ? (
												[
													job.transportation.oneWay && 'One-way Cab',
													job.transportation.twoWay && 'Two-way Cab',
													job.transportation.noCab && 'No Cab Facility'
												].filter(Boolean).join(', ') || 'Not specified'
											) : 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-clock" />
										<span className="twm-title">Work Shift</span>
										<div className="twm-s-info-discription">
											{job?.shift ? (job.shift.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) : 'Not specified'}
										</div>
									</div>
								</li>

								<li>
									<div className="twm-s-info-inner">
										<i className="fa-solid fa-money-bill-wave" />
										<span className="twm-title">Offered Salary</span>
										<div className="twm-s-info-discription">
											{job?.ctc && typeof job.ctc === 'object' && job.ctc.min > 0 && job.ctc.max > 0 ? (
												job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA`
											) : 'Not specified'}
											{job?.netSalary && (job.netSalary.min > 0 || job.netSalary.max > 0) && (
												<div style={{fontSize: '12px', color: '#6c757d', marginTop: '3px'}}>
													<strong>Net Monthly: </strong>
													{job.netSalary.min === job.netSalary.max ? 
														`₹${(job.netSalary.min/1000).toFixed(0)}K` : 
														`₹${(job.netSalary.min/1000).toFixed(0)}K - ${(job.netSalary.max/1000).toFixed(0)}K`
													}
												</div>
											)}
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>



				{/* <SectionSideAdvert /> */}
			</>
		);
}

export default SectionJobsSidebar2;
