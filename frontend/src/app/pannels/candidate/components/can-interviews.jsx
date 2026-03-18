import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { loadScript } from "../../../../globals/constants";
import { api, BACKEND_URL } from "../../../../utils/api";
import { canRoute, candidate } from "../../../../globals/route-names";
import "../../../../emp-grid-optimizations.css";
import "./can-interviews.css";

const ROUND_NAME_MAP = {
  technical: "Technical",
  oneOnOne: "One-to-One",
  oneonone: "One-to-One",
  "one-on-one": "One-to-One",
  one_on_one: "One-to-One",
  oneOnOnePanel: "One-on-One / Panel",
  oneononepanel: "One-on-One / Panel",
  "one-on-one-panel": "One-on-One / Panel",
  one_on_one_panel: "One-on-One / Panel",
  panel: "Panel",
  group: "Group",
  situational: "Situational / Behavioral",
  others: "Others",
  nonTechnical: "Non-Technical",
  managerial: "Managerial",
  final: "Final",
  hr: "HR",
  assessment: "Assessment"
};

const STATUS_BADGES = {
  scheduled: { text: "Scheduled", className: "bg-info bg-opacity-10 text-info border border-info" },
  interview_scheduled: { text: "Interview Scheduled", className: "bg-info bg-opacity-10 text-info border border-info" },
  interview_completed: { text: "Interview Completed", className: "bg-success bg-opacity-10 text-success border border-success" },
  completed: { text: "Completed", className: "bg-success bg-opacity-10 text-success border border-success" },
  selected: { text: "Selected", className: "bg-success bg-opacity-10 text-success border border-success" },
  shortlisted: { text: "Shortlisted", className: "bg-info bg-opacity-10 text-info border border-info" },
  shortlisted_for_next_round: { text: "Shortlisted for next Round", className: "bg-info bg-opacity-10 text-info border border-info" },
  under_review: { text: "Under Review", className: "bg-warning bg-opacity-10 text-warning border border-warning" },
  pending_decision: { text: "Pending Decision", className: "bg-warning bg-opacity-10 text-warning border border-warning" },
  rejected: { text: "Rejected", className: "bg-danger bg-opacity-10 text-danger border border-danger" },
  no_show: { text: "No Show", className: "bg-danger bg-opacity-10 text-danger border border-danger" },
  on_hold: { text: "On Hold", className: "bg-secondary bg-opacity-10 text-secondary border border-secondary" },
  pending: { text: "Pending", className: "bg-secondary bg-opacity-10 text-secondary border border-secondary" }
};

const normalizeRoundName = (value) => {
  if (!value || typeof value !== "string") return "Interview Round";
  const raw = value.trim();
  if (!raw) return "Interview Round";
  const lower = raw.toLowerCase();
  return ROUND_NAME_MAP[raw] || ROUND_NAME_MAP[lower] || raw;
};

const getCompanyName = (application) =>
  application?.jobId?.brandName ||
  application?.jobId?.companyName ||
  application?.employerId?.brandName ||
  application?.employerId?.companyName ||
  application?.employerId?.name ||
  "Company";

const getEmployerId = (application) => {
  const raw = application?.employerId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return raw._id || raw.id || "";
};

const getCompanyLogo = (application, employerLogoMap = {}) =>
  application?.jobId?.companyLogo ||
  application?.jobId?.companyLogoUrl ||
  application?.job?.companyLogo ||
  employerLogoMap[getEmployerId(application)] ||
  "";

const getLogoSrc = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads") || value.startsWith("uploads/")) {
    const backendBaseUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000/api")
      .replace(/\/api\/?$/, "");
    const normalizedPath = value.startsWith("/") ? value : `/${value}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }
  return value;
};

const getInterviewRounds = (job, application) => {
  if (application?.interviewProcess?.stages?.length) {
    return application.interviewProcess.stages.map((stage) => ({
      name: normalizeRoundName(stage.stageName || stage.stageType),
      uniqueKey: stage._id || stage.stageType || stage.stageName,
      roundType: stage.stageType || stage.stageName
    }));
  }

  if (application?.interviewProcesses?.length) {
    return application.interviewProcesses.map((process) => ({
      name: normalizeRoundName(process.name || process.type),
      uniqueKey: process.id || process._id || process.type || process.name,
      roundType: process.type || process.name
    }));
  }

  if (job?.interviewRoundOrder?.length) {
    return job.interviewRoundOrder.map((uniqueKey) => {
      const roundType = job?.interviewRoundTypes?.[uniqueKey] || uniqueKey;
      const baseType = uniqueKey?.includes("_") ? uniqueKey.split("_")[0] : uniqueKey;
      const cleanType = roundType?.includes("_") ? roundType.split("_")[0] : roundType;
      const name = normalizeRoundName(ROUND_NAME_MAP[cleanType] || ROUND_NAME_MAP[baseType] || cleanType || baseType);
      return { name, uniqueKey, roundType: cleanType || baseType };
    });
  }

  if (job?.interviewRoundTypes && typeof job.interviewRoundTypes === "object") {
    const entries = Object.entries(job.interviewRoundTypes || {});
    const hasStringTypes = entries.some(([, value]) => typeof value === "string");

    if (hasStringTypes) {
      return entries.map(([uniqueKey, roundType]) => {
        const baseType = uniqueKey?.includes("_") ? uniqueKey.split("_")[0] : uniqueKey;
        const cleanType = roundType?.includes("_") ? roundType.split("_")[0] : roundType;
        const name = normalizeRoundName(ROUND_NAME_MAP[cleanType] || ROUND_NAME_MAP[baseType] || cleanType || baseType);
        return { name, uniqueKey, roundType: cleanType || baseType };
      });
    }

    const rounds = [];
    if (job.assessmentId) rounds.push({ name: "Assessment", uniqueKey: "assessment", roundType: "assessment" });
    if (job.interviewRoundTypes.oneOnOne) rounds.push({ name: "One-to-One", uniqueKey: "oneOnOne", roundType: "oneOnOne" });
    if (job.interviewRoundTypes.panel) rounds.push({ name: "Panel", uniqueKey: "panel", roundType: "panel" });
    if (job.interviewRoundTypes.group) rounds.push({ name: "Group", uniqueKey: "group", roundType: "group" });
    if (job.interviewRoundTypes.technical) rounds.push({ name: "Technical", uniqueKey: "technical", roundType: "technical" });
    if (job.interviewRoundTypes.situational) rounds.push({ name: "Situational / Behavioral", uniqueKey: "situational", roundType: "situational" });
    if (job.interviewRoundTypes.others) rounds.push({ name: "Others", uniqueKey: "others", roundType: "others" });
    return rounds;
  }

  return [];
};

const formatJobLocation = (locationValue) => {
  if (Array.isArray(locationValue)) {
    const filtered = locationValue.filter(Boolean);
    return filtered.length ? filtered.join(", ") : "";
  }
  return locationValue || "";
};

const parseTimeLabel = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("-")) {
    const [start, end] = trimmed.split("-").map((item) => item.trim()).filter(Boolean);
    if (start && end) return { startTime: start, endTime: end };
  }
  return { label: trimmed };
};

const findNestedTimeWindow = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNestedTimeWindow(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const directStart =
      value.startTime ||
      value.fromTime ||
      value.start ||
      value.from ||
      value?.interviewTime?.start;
    const directEnd =
      value.endTime ||
      value.toTime ||
      value.end ||
      value.to ||
      value?.interviewTime?.end;
    if (directStart && directEnd) {
      return { startTime: directStart, endTime: directEnd };
    }

    const labelCandidate = parseTimeLabel(value.time);
    if (labelCandidate) return labelCandidate;

    const nestedKeys = [
      "subStages",
      "subStagesArray",
      "days",
      "daysArray",
      "schedulesArray",
      "daySchedulesArray",
      "roomsArray",
      "scheduleObject",
      "schedule",
      "schedules",
      "daySchedules",
      "rooms"
    ];
    for (const key of nestedKeys) {
      if (value[key]) {
        const found = findNestedTimeWindow(value[key]);
        if (found) return found;
      }
    }
  }
  return null;
};

const getRoundDetails = (application, round, index) => {
  const job = application?.jobId || {};
  const stage =
    application?.interviewProcess?.stages?.find((s) =>
      String(s?._id || s?.stageType || s?.stageName) === String(round.uniqueKey || round.roundType || round.name)
    ) || application?.interviewProcess?.stages?.[index];
  const process =
    application?.interviewProcesses?.find((p) =>
      String(p?._id || p?.id || p?.type || p?.name) === String(round.uniqueKey || round.roundType || round.name)
    ) || application?.interviewProcesses?.[index];
  const roundDetails =
    job?.interviewRoundDetails?.[round.uniqueKey] ||
    job?.interviewRoundDetails?.[round.roundType] ||
    job?.interviewRoundDetails?.[round.name] ||
    {};

  const fromDate =
    stage?.fromDate ||
    stage?.scheduledDate ||
    process?.fromDate ||
    process?.scheduledDate ||
    roundDetails?.fromDate ||
    roundDetails?.date ||
    roundDetails?.fromdate;
  const toDate = stage?.toDate || process?.toDate || roundDetails?.toDate || roundDetails?.todate;
  const scheduledDate = stage?.scheduledDate || process?.scheduledDate || roundDetails?.scheduledDate || null;
  const startTime = stage?.startTime || process?.startTime || roundDetails?.startTime;
  const endTime = stage?.endTime || process?.endTime || roundDetails?.endTime;
  const timeLabel = stage?.scheduledTime || process?.scheduledTime || roundDetails?.time;
  const nestedTime = findNestedTimeWindow(roundDetails);
  const resolvedStartTime = startTime || nestedTime?.startTime;
  const resolvedEndTime = endTime || nestedTime?.endTime;
  const resolvedTimeLabel = timeLabel || nestedTime?.label;
  const location =
    stage?.location ||
    process?.location ||
    roundDetails?.location ||
    formatJobLocation(job?.location);
  const interviewerName = stage?.interviewerName || process?.interviewerName || roundDetails?.interviewerName;
  const status = stage?.status || process?.status || application?.status || "pending";

  return {
    fromDate,
    toDate,
    scheduledDate,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime,
    timeLabel: resolvedTimeLabel,
    location,
    interviewerName,
    status
  };
};

const getStatusBadge = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  return STATUS_BADGES[normalized] || {
    text: String(status || "Pending").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
    className: "bg-secondary bg-opacity-10 text-secondary border border-secondary"
  };
};

function CanInterviewsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employerLogos, setEmployerLogos] = useState({});

  useEffect(() => {
    loadScript("js/custom.js");
    fetchInterviewApplications();
  }, []);

  const fetchInterviewApplications = async () => {
    setLoading(true);
    try {
      const response = await api.getCandidateApplicationsWithInterviews();
      if (response?.success) {
        setApplications(response.applications || response.data || []);
        return;
      }
    } catch (error) {
      try {
        const fallback = await api.getCandidateApplications();
        if (fallback?.success) {
          setApplications(fallback.applications || fallback.data || []);
        }
      } catch (fallbackError) {
        setApplications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!applications.length) return;
    const employerIds = Array.from(
      new Set(applications.map(getEmployerId).filter(Boolean))
    );
    const idsToFetch = employerIds.filter((id) => !(id in employerLogos)).filter((id) => {
      const app = applications.find((item) => getEmployerId(item) === id);
      const hasLogo = Boolean(
        app?.jobId?.companyLogo ||
          app?.jobId?.companyLogoUrl ||
          app?.job?.companyLogo
      );
      return !hasLogo;
    });

    if (!idsToFetch.length) return;
    let isMounted = true;

    const fetchLogos = async () => {
      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/public/employers/${id}`);
            const data = await response.json();
            if (data?.success) {
              return {
                id,
                logo: data.profile?.logo || data.profile?.companyLogo || ""
              };
            }
          } catch (error) {
          }
          return { id, logo: "" };
        })
      );

      if (!isMounted) return;
      setEmployerLogos((prev) => {
        const next = { ...prev };
        results.forEach((item) => {
          if (item?.id) {
            next[item.id] = item.logo || null;
          }
        });
        return next;
      });
    };

    fetchLogos();
    return () => {
      isMounted = false;
    };
  }, [applications, employerLogos]);

  const interviewCards = useMemo(() => {
    const cards = [];
    applications.forEach((application) => {
      const job = application?.jobId || application?.job || {};
      const rounds = getInterviewRounds(job, application);
      if (!rounds.length) return;
      rounds.forEach((round, index) => {
        const details = getRoundDetails(application, round, index);
        cards.push({
          key: `${application?._id || "app"}-${round.uniqueKey || round.roundType || index}`,
          applicationId: application?._id,
          jobTitle: job?.title || "Job Title",
          companyName: getCompanyName(application),
          companyLogo: getCompanyLogo(application, employerLogos),
          roundName: round.name || "Interview Round",
          details
        });
      });
    });
    return cards;
  }, [applications, employerLogos]);

  return (
    <div className="twm-right-section-panel site-bg-gray candidate-interviews">
      <div className="candidate-interviews-header">
        <div>
          <h2>Interviews</h2>
          <p>All your interview rounds in one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="candidate-interviews-empty">Loading interviews...</div>
      ) : interviewCards.length === 0 ? (
        <div className="candidate-interviews-empty">No interviews available yet.</div>
      ) : (
        <div className="twm-employer-list-wrap">
          <Row className="justify-content-start">
            {interviewCards.map((card) => {
              const { details } = card;
              const badge = getStatusBadge(details.status);
              const companyInitial = (card.companyName || "C").charAt(0);
              const logoSrc = getLogoSrc(card.companyLogo);
              return (
                <Col lg={4} md={6} sm={12} className="mb-4" key={card.key}>
                  <div className="company-card interview-company-card">
                    <div className="company-avatar-container">
                      <div className="company-avatar-circle interview-avatar-circle">
                        {logoSrc ? (
                          <img src={logoSrc} alt={card.companyName} className="company-avatar-img" />
                        ) : (
                          companyInitial
                        )}
                      </div>
                    </div>

                    <h4 className="company-card-name">{card.companyName}</h4>
                    <div className="company-card-subtitle">
                      {card.jobTitle}
                    </div>

                    <div className="company-card-location">
                      <i className="feather-map-pin" />
                      {details.location || "Location to be announced"}
                    </div>

                    <div className="industry-tag-pill interview-status-pill">
                      {badge.text}
                    </div>

                    {details.interviewerName && (
                      <div className="company-card-interviewer">
                        <i className="fa fa-user" />
                        {details.interviewerName}
                      </div>
                    )}

                    {card.applicationId && (
                      <NavLink
                        to={canRoute(
                          candidate.INTERVIEW_DETAILS.replace(":applicationId", card.applicationId)
                        )}
                        className="view-details-btn-orange"
                      >
                        Book Your Slot/Assessment
                      </NavLink>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
}

export default CanInterviewsPage;
