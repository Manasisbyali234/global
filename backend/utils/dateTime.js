const INDIA_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const normalizeToDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  const parsed = new Date(value);
  return isValidDate(parsed) ? parsed : null;
};

const extractIstDateParts = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === 'string') {
    const trimmed = dateValue.trim();
    const directMatch = trimmed.match(DATE_ONLY_REGEX);
    if (directMatch) {
      return {
        year: Number(directMatch[1]),
        month: Number(directMatch[2]),
        day: Number(directMatch[3])
      };
    }
  }

  const raw = normalizeToDate(dateValue);
  if (!raw) {
    return null;
  }

  const istDate = new Date(raw.getTime() + IST_OFFSET_MS);
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth() + 1,
    day: istDate.getUTCDate()
  };
};

const parseBoundaryTime = (timeValue = '', boundary = 'start') => {
  const defaultTime = boundary === 'end'
    ? { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }
    : { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };

  if (!timeValue || typeof timeValue !== 'string') {
    return defaultTime;
  }

  const matches = String(timeValue).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!matches) {
    return defaultTime;
  }

  let hours = Number(matches[1]);
  const minutes = Number(matches[2]);
  const meridian = matches[3]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return defaultTime;
  }

  return {
    hours,
    minutes,
    seconds: boundary === 'end' ? 59 : 0,
    milliseconds: boundary === 'end' ? 999 : 0
  };
};

const buildUtcDateTimeFromIst = (dateValue, timeValue = '', boundary = 'start') => {
  const dateParts = extractIstDateParts(dateValue);
  if (!dateParts) {
    return null;
  }

  const timeParts = parseBoundaryTime(timeValue, boundary);
  const utcMs = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds,
    timeParts.milliseconds
  ) - IST_OFFSET_MS;

  return new Date(utcMs);
};

const getStartOfCurrentIstDayUtc = (referenceDate = new Date()) => (
  buildUtcDateTimeFromIst(referenceDate, '', 'start')
);

const formatDateInIst = (dateInput, locale = 'en-GB', options = {}) => {
  const date = normalizeToDate(dateInput);
  if (!date) return null;

  return date.toLocaleDateString(locale, {
    timeZone: INDIA_TIME_ZONE,
    ...options
  });
};

const formatDateTimeInIst = (dateInput, locale = 'en-IN', options = {}) => {
  const date = normalizeToDate(dateInput);
  if (!date) return null;

  return date.toLocaleString(locale, {
    timeZone: INDIA_TIME_ZONE,
    ...options
  });
};

module.exports = {
  INDIA_TIME_ZONE,
  buildUtcDateTimeFromIst,
  extractIstDateParts,
  formatDateInIst,
  formatDateTimeInIst,
  getStartOfCurrentIstDayUtc,
  normalizeToDate
};
