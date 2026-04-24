const API_ORIGIN = ((process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, ""));

const pickFirstNonEmptyString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

export const resolveJobMediaSrc = (mediaValue) => {
  if (!mediaValue || typeof mediaValue !== "string") return "";

  const trimmed = mediaValue.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  if (trimmed.startsWith("/uploads") || trimmed.startsWith("uploads/")) {
    const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${API_ORIGIN}${normalizedPath}`;
  }

  return `data:image/jpeg;base64,${trimmed}`;
};

export const isConsultantJobPost = (job) => {
  const rawPostedBy = job?.postedBy || job?.employerId?.employerType || job?.employerType;
  const normalized = String(rawPostedBy || "").trim().toLowerCase();
  return normalized === "consultant" || normalized === "consultancy";
};

export const getJobDisplayLogo = (job) => {
  const rawLogo = isConsultantJobPost(job)
    ? pickFirstNonEmptyString(job?.companyLogo)
    : pickFirstNonEmptyString(job?.companyLogo, job?.employerProfile?.logo);

  return resolveJobMediaSrc(rawLogo);
};

export const getJobDisplayBanner = (job) => {
  const rawBanner = isConsultantJobPost(job)
    ? pickFirstNonEmptyString(job?.companyBanner)
    : pickFirstNonEmptyString(job?.companyBanner, job?.employerProfile?.coverImage);

  return resolveJobMediaSrc(rawBanner);
};
