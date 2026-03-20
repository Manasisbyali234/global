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

const COMPLETED_STATUSES = new Set([
  "completed",
  "interview_completed",
  "selected",
  "rejected",
  "no_show",
  "expired",
  "cancelled",
  "canceled",
  "failed"
]);

export const normalizeRoundName = (value) => {
  if (!value || typeof value !== "string") return "Interview Round";
  const raw = value.trim();
  if (!raw) return "Interview Round";
  const lower = raw.toLowerCase();
  return ROUND_NAME_MAP[raw] || ROUND_NAME_MAP[lower] || raw;
};

const parseTimeParts = (value) => {
  if (!value) return null;
  const matches = String(value).match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
  if (!matches) return null;

  let hours = Number(matches[1]);
  const minutes = Number(matches[2]);
  const meridian = matches[3]?.toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
};

const normalizeTimeValue = (value) => {
  const parts = parseTimeParts(value);
  if (!parts) return "";
  return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`;
};

const parseTimeLabel = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("-")) {
    const [start, end] = trimmed.split("-").map((item) => item.trim()).filter(Boolean);
    if (start && end) {
      return {
        startTime: normalizeTimeValue(start),
        endTime: normalizeTimeValue(end)
      };
    }
  }
  return null;
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
      return {
        startTime: normalizeTimeValue(directStart),
        endTime: normalizeTimeValue(directEnd)
      };
    }

    const timeRange = parseTimeLabel(value.time);
    if (timeRange) return timeRange;

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

const formatJobLocation = (locationValue) => {
  if (Array.isArray(locationValue)) {
    const filtered = locationValue.filter(Boolean);
    return filtered.length ? filtered.join(", ") : "";
  }
  return locationValue || "";
};

const getCandidateId = (application) => {
  const raw = application?.candidateId;
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return raw._id || raw.id || raw.candidateId || "";
};

export const getInterviewRounds = (job, application) => {
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

export const getRoundDetails = (application, round, index) => {
  const job = application?.jobId || {};
  const stage =
    application?.interviewProcess?.stages?.find((item) =>
      String(item?._id || item?.stageType || item?.stageName) === String(round.uniqueKey || round.roundType || round.name)
    ) || application?.interviewProcess?.stages?.[index];
  const process =
    application?.interviewProcesses?.find((item) =>
      String(item?._id || item?.id || item?.type || item?.name) === String(round.uniqueKey || round.roundType || round.name)
    ) || application?.interviewProcesses?.[index];
  const roundDetails =
    job?.interviewRoundDetails?.[round.uniqueKey] ||
    job?.interviewRoundDetails?.[round.roundType] ||
    job?.interviewRoundDetails?.[round.name] ||
    {};

  const nestedTime = findNestedTimeWindow(roundDetails);

  return {
    fromDate:
      stage?.fromDate ||
      stage?.scheduledDate ||
      process?.fromDate ||
      process?.scheduledDate ||
      roundDetails?.fromDate ||
      roundDetails?.date ||
      roundDetails?.fromdate,
    toDate: stage?.toDate || process?.toDate || roundDetails?.toDate || roundDetails?.todate,
    scheduledDate: stage?.scheduledDate || process?.scheduledDate || roundDetails?.scheduledDate || null,
    startTime: normalizeTimeValue(stage?.startTime || process?.startTime || roundDetails?.startTime) || nestedTime?.startTime || "",
    endTime: normalizeTimeValue(stage?.endTime || process?.endTime || roundDetails?.endTime) || nestedTime?.endTime || "",
    timeLabel: stage?.scheduledTime || process?.scheduledTime || roundDetails?.time || "",
    location:
      stage?.location ||
      process?.location ||
      roundDetails?.location ||
      formatJobLocation(job?.location),
    interviewerName: stage?.interviewerName || process?.interviewerName || roundDetails?.interviewerName || "",
    status: stage?.status || process?.status || application?.status || "pending"
  };
};

export const extractBookedSlot = (roundDetails, candidateId, bookedSlots = [], roundId = null) => {
  if (!roundDetails || !candidateId) return null;

  const candidateIdStr = String(candidateId);
  const isCandidateMatch = (value) => {
    if (!value) return false;
    const raw = String(value);
    return raw === candidateIdStr || raw.includes(candidateIdStr);
  };

  const hasSlotShape = (obj) =>
    obj && (obj.startTime || obj.start || obj.fromTime) && (obj.endTime || obj.end || obj.toTime);

  const normalizeSlot = (obj, fallbackDate) => {
    if (!obj) return null;
    const date = obj.date || obj.fromDate || obj.toDate || obj.day || obj.interviewDate || fallbackDate;
    const startTime = normalizeTimeValue(obj.startTime || obj.start || obj.fromTime || obj.interviewTime?.start);
    const endTime = normalizeTimeValue(obj.endTime || obj.end || obj.toTime || obj.interviewTime?.end);
    const interviewerName = obj.interviewerName || obj.interviewer || obj.HR || obj.interviewerId?.name || "";

    if (!date || !startTime || !endTime) return null;

    return { date, startTime, endTime, interviewerName };
  };

  const scanValue = (value, fallbackDate) => {
    if (!value) return null;

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = scanValue(item, fallbackDate);
        if (found) return found;
      }
      return null;
    }

    if (typeof value === "object") {
      const candidateFields = ["candidateId", "candidate", "candidate_id", "applicantId", "userId", "user_id", "bookedBy"];
      const matched = candidateFields.some((key) => isCandidateMatch(value[key]));

      if (matched && hasSlotShape(value)) {
        return normalizeSlot(value, fallbackDate);
      }

      const nestedKeys = [
        "bookedSlot",
        "bookedSlots",
        "slots",
        "schedules",
        "schedulesArray",
        "daySchedules",
        "daySchedulesArray",
        "rooms",
        "roomsArray",
        "schedule"
      ];

      for (const key of nestedKeys) {
        if (value[key]) {
          const found = scanValue(value[key], value.date || fallbackDate);
          if (found) return found;
        }
      }
    }

    return null;
  };

  const scheduleObject = roundDetails.scheduleObject || roundDetails.schedule || {};
  const nestedSchedule = scheduleObject.schedule || {};
  const sources = [
    roundDetails,
    roundDetails.schedulesArray,
    roundDetails.schedules,
    roundDetails.daySchedulesArray,
    roundDetails.daySchedules,
    roundDetails.roomsArray,
    roundDetails.rooms,
    scheduleObject,
    scheduleObject.schedulesArray,
    scheduleObject.schedules,
    scheduleObject.daySchedulesArray,
    scheduleObject.daySchedules,
    scheduleObject.roomsArray,
    scheduleObject.rooms,
    nestedSchedule,
    bookedSlots
  ];

  for (const source of sources) {
    const found = scanValue(source, roundDetails.fromDate || roundDetails.date);
    if (found) return found;
  }

  if (Array.isArray(bookedSlots) && bookedSlots.length > 0 && roundId) {
    const normalizedRoundId = String(roundId);
    const matched = bookedSlots.find((slot) => slot?.roundId && String(slot.roundId) === normalizedRoundId);
    if (matched) {
      return normalizeSlot(matched, matched.date || roundDetails.fromDate || roundDetails.date);
    }
  }

  return null;
};

const getReminderStartDate = (roundDetails, bookedSlot) => {
  const eventDate = bookedSlot?.date || roundDetails?.scheduledDate || roundDetails?.fromDate || roundDetails?.date;
  const eventTime = bookedSlot?.startTime || roundDetails?.startTime || parseTimeLabel(roundDetails?.timeLabel)?.startTime;

  if (!eventDate || !eventTime) return null;

  const parsedDate = new Date(eventDate);
  const timeParts = parseTimeParts(eventTime);

  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime()) || !timeParts) {
    return null;
  }

  parsedDate.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  return parsedDate;
};

export const getCandidateInterviewReminderAlerts = (applications = [], acknowledgedAlertIds = [], nowMs = Date.now()) => {
  const acknowledgedSet = new Set(acknowledgedAlertIds);
  const alerts = [];

  applications.forEach((application) => {
    const job = application?.jobId || application?.job || {};
    const rounds = getInterviewRounds(job, application);
    const candidateId = getCandidateId(application);
    const bookedSlots = application?.bookedSlots || application?.bookedSlot || [];

    rounds.forEach((round, index) => {
      if (String(round?.name || "").toLowerCase() === "assessment") return;

      const roundDetails = getRoundDetails(application, round, index);
      const normalizedStatus = String(roundDetails?.status || "").toLowerCase();
      if (COMPLETED_STATUSES.has(normalizedStatus)) return;

      const roundTypeKey = round?.roundType || round?.uniqueKey || round?.name;
      const roundId =
        application?.interviewRoundIds?.[roundTypeKey] ||
        application?.interviewRoundIds?.[String(roundTypeKey).split("_")[0]] ||
        round?.uniqueKey;
      const bookedSlot = extractBookedSlot(roundDetails, candidateId, bookedSlots, roundId);
      const startDate = getReminderStartDate(roundDetails, bookedSlot);

      if (!startDate) return;

      const diffMs = startDate.getTime() - nowMs;
      if (diffMs <= 0) return;

      const thresholdMinutes = diffMs <= 5 * 60 * 1000 ? 5 : diffMs <= 10 * 60 * 1000 ? 10 : null;
      if (!thresholdMinutes) return;

      const alertId = [
        application?._id || "application",
        round?.uniqueKey || round?.roundType || index,
        startDate.toISOString(),
        thresholdMinutes
      ].join(":");

      if (acknowledgedSet.has(alertId)) return;

      alerts.push({
        id: alertId,
        thresholdMinutes,
        applicationId: application?._id || "",
        startsAtMs: startDate.getTime(),
        roleTitle: job?.title || job?.designation || "Job Role",
        roundName: round?.name || "Interview",
        companyName: job?.companyName || job?.brandName || application?.employerId?.companyName || "Company",
        date: bookedSlot?.date || roundDetails?.scheduledDate || roundDetails?.fromDate || roundDetails?.date || "",
        startTime: bookedSlot?.startTime || roundDetails?.startTime || "",
        endTime: bookedSlot?.endTime || roundDetails?.endTime || "",
        interviewerName: bookedSlot?.interviewerName || roundDetails?.interviewerName || ""
      });
    });
  });

  return alerts.sort((left, right) => {
    if (left.startsAtMs !== right.startsAtMs) return left.startsAtMs - right.startsAtMs;
    return left.thresholdMinutes - right.thresholdMinutes;
  });
};
