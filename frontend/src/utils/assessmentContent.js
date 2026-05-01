const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const normalizeLegacyNbsp = (value = "") =>
  String(value || "").replace(/(?:&nbsp;|nbsp;|&#160;|\u00a0)+/gi, " ");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeAssessmentEntities = (value = "") => {
  let normalizedValue = String(value || "");

  for (let index = 0; index < 3; index += 1) {
    if (typeof document === "undefined") {
      normalizedValue = normalizeLegacyNbsp(normalizedValue);
      break;
    }

    const textarea = document.createElement("textarea");
    textarea.innerHTML = normalizedValue;
    const decodedValue = textarea.value;

    if (decodedValue === normalizedValue) {
      break;
    }

    normalizedValue = decodedValue;
  }

  return normalizeLegacyNbsp(normalizedValue);
};

export const decodeAssessmentText = (value = "", options = {}) => {
  const { preserveWhitespace = false } = options;
  if (!value || typeof value !== "string") {
    return "";
  }

  const decodedValue = decodeAssessmentEntities(value);

  if (typeof document === "undefined") {
    return preserveWhitespace
      ? decodedValue.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
      : decodedValue.replace(/\s+/g, " ").trim();
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = decodedValue;

  const textValue = normalizeLegacyNbsp(
    wrapper.textContent || wrapper.innerText || decodedValue
  );

  return preserveWhitespace
    ? textValue.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
    : textValue.replace(/\s+/g, " ").trim();
};

export const decodeAssessmentHtml = (value = "") =>
  decodeAssessmentEntities(String(value || "").trim());

export const formatAssessmentContent = (value = "") => {
  const normalizedValue = decodeAssessmentHtml(value);

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
