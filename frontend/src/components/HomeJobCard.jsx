import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { publicUser } from "../globals/route-names";
import "../custom-tags.css";

const formatCtcText = (job) => {
    const rawSalary = job?.salary ?? job?.ctc ?? job?.salaryText ?? job?.ctcText;

    if (typeof rawSalary === "string" && rawSalary.trim().length > 0) {
        const trimmed = rawSalary.trim();
        return /ctc/i.test(trimmed) ? trimmed : `CTC: ${trimmed}`;
    }

    if (typeof rawSalary === "number" && Number.isFinite(rawSalary)) {
        const formatted = rawSalary.toLocaleString("en-IN");
        return `Annual CTC: ₹${formatted}`;
    }

    if (rawSalary && typeof rawSalary === "object") {
        const { min, max, currency } = rawSalary;
        const currencySymbol = currency === "USD" ? "$" : "₹";
        if (min && max) {
            return `Annual CTC: ${currencySymbol}${min} - ${currencySymbol}${max}`;
        }
        if (min || max) {
            const value = min || max;
            return `Annual CTC: ${currencySymbol}${value}`;
        }
    }

    return "CTC: Not specified";
};

const deriveVacancies = (job) => {
    const possibleFields = [job?.vacancies, job?.openings, job?.positions, job?.positionsAvailable];
    const value = possibleFields.find((field) => field !== undefined && field !== null && field !== "");

    if (value === undefined) {
        return "Not specified";
    }

    const numberValue = Number(value);
    if (!Number.isNaN(numberValue) && numberValue > 0) {
        return numberValue;
    }

    return value;
};

const normalizePostedBy = (job) => {
    const employerType = job?.employerId?.employerType || job?.employerType;
    if (!employerType) {
        return "Company";
    }

    const normalized = employerType.toString().trim().toLowerCase();
    switch (normalized) {
        case "consultant":
            return "Consultant";
        case "agency":
            return "Agency";
        case "recruiter":
            return "Recruiter";
        case "company":
            return "Company";
        default:
            return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
};

const sanitizeJobTypeClass = (jobType) => {
    if (!jobType) {
        return "full-time";
    }
    return jobType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const HomeJobCard = ({ job }) => {
    const title = job?.title || "Job title";
    const location = job?.location || job?.city || "Location not specified";
    const jobType = job?.jobType || job?.type || "Full-time";
    const jobTypeClass = sanitizeJobTypeClass(jobType);
    const ctcText = formatCtcText(job);
    const vacancies = deriveVacancies(job);
    const postedBy = normalizePostedBy(job);
    const companyName = job?.companyName || job?.employerProfile?.companyName || "Company";
    const logo = job?.companyLogo || job?.employerProfile?.logo;
    const placeholderInitial = companyName?.charAt(0)?.toUpperCase() || "?";

    return (
        <div className="home-job-card">
            <div className="card-top-row">
                <div className="logo-title-section">
                    {logo ? (
                        <img className="card-logo" src={logo} alt={companyName} />
                    ) : (
                        <div className="card-logo-placeholder" aria-hidden="true">
                            {placeholderInitial}
                        </div>
                    )}
                    <div className="title-location" title={title}>
                        <h4 className="card-job-title">{title}</h4>
                        <div className="card-location" title={location}>
                            <i className="fa fa-map-marker-alt" aria-hidden="true" />
                            <span>{location}</span>
                        </div>
                    </div>
                </div>
                <span className={`card-job-badge ${jobTypeClass}`}>
                    {jobType}
                </span>
            </div>

            <div className="card-middle-row">
                <div className="card-ctc">
                    <span className="card-ctc-value">{ctcText}</span>
                </div>
                <div className="card-vacancies">
                    Vacancies: <span>{vacancies}</span>
                </div>
            </div>

            <div className="card-bottom-row">
                <div className="card-posted-by">
                    <span className="card-company-name">{companyName}</span>
                    <span className="card-posted-text">Posted by: <strong>{postedBy}</strong></span>
                </div>
                <NavLink
                    to={`${publicUser.jobs.DETAIL1}/${job?._id ?? ""}`}
                    className="card-apply-btn"
                >
                    Apply Now
                </NavLink>
            </div>
        </div>
    );
};

HomeJobCard.propTypes = {
    job: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        location: PropTypes.string,
        jobType: PropTypes.string,
        type: PropTypes.string,
        salary: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.shape({
                min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                currency: PropTypes.string
            })
        ]),
        companyName: PropTypes.string,
        vacancies: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        employerProfile: PropTypes.shape({
            companyName: PropTypes.string,
            logo: PropTypes.string
        }),
        employerId: PropTypes.shape({
            employerType: PropTypes.string
        })
    }).isRequired
};

export default HomeJobCard;
