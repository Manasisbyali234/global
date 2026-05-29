export const formatJobTitle = (value, fallback = "Job Title") => {
  if (typeof value !== "string") return fallback;

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return fallback;

  return normalized
    .toLowerCase()
    .replace(/(^|[\s\-/&([{])([a-z])/g, (_, separator, letter) => `${separator}${letter.toUpperCase()}`);
};

export const formatDesignation = (value, fallback = "N/A") => formatJobTitle(value, fallback);
