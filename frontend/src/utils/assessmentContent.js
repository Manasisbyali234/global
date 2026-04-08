const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const formatAssessmentContent = (value = "") => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  if (HTML_TAG_PATTERN.test(normalizedValue)) {
    return normalizedValue;
  }

  return escapeHtml(normalizedValue)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "<br />");
};
