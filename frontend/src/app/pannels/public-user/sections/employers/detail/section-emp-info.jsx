import JobZImage from "../../../../../common/jobz-img";
import { publicUrlFor } from "../../../../../../globals/constants";

function SectionEmployerInfo({ employer }) {
    if (!employer) return null;

    return (
        <>
            <div className="twm-top-wide-banner overlay-wraper" style={{ backgroundImage: `url(${employer.coverImage || publicUrlFor("images/detail-pic/company-bnr1.jpg")})` }}>
                <div className="overlay-main site-bg-primary opacity-09" />
                <div className="twm-top-wide-banner-content container ">
                    <div className="twm-mid-content">
                        <div className="twm-employer-self-top">
                            <div className="twm-media">
                                {employer.logo ? (
                                    <img src={employer.logo} alt={employer.companyName} style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover' }} />
                                ) : (
                                    <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                )}
                            </div>
                            <h3 className="twm-job-title">{employer.companyName || employer.employerId?.companyName}</h3>
                            <p className="twm-employer-address"><i className="feather-map-pin" />{employer.corporateAddress || employer.location || 'Location not specified'}</p>
                            {employer.website && (
                                <a href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`} className="twm-employer-websites" target="_blank" rel="noopener noreferrer">
                                    {employer.website}
                                </a>
                            )}
                            <div className="twm-ep-detail-tags">
                                <button className="de-info twm-bg-green"><i className="fa fa-check" /> Verified</button>
                                {employer.employerId?.employerType === 'consultant' && (
                                    <button className="de-info twm-bg-brown">Recruitment Consultancy</button>
                                )}
                            </div>
                        </div>
                        <div className="twm-employer-self-bottom">
                            <div className="twm-social-btns">
                                {employer.socialLinks?.facebook && <a className="btn facebook" href={employer.socialLinks.facebook}><i className="fab fa-facebook-f" /></a>}
                                {employer.socialLinks?.twitter && <a className="btn twitter" href={employer.socialLinks.twitter}><i className="fab fa-twitter" /></a>}
                                {employer.socialLinks?.linkedin && <a className="btn linkedin" href={employer.socialLinks.linkedin}><i className="fab fa-linkedin-in" /></a>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ani-circle-1 rotate-center" />
                <div className="ani-circle-2 rotate-center" />
            </div>
        </>
    )
}

export default SectionEmployerInfo;
