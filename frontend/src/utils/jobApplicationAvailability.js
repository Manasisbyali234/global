import { buildUtcDateTimeFromIst } from "./timezoneUtils";

const getPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : null;
};

export const isJobApplicationClosed = (job = {}, now = Date.now()) => {
  if (!job) return false;

  if (job.status && String(job.status).toLowerCase() !== "active") {
    return true;
  }

  const applicationDeadline = job.lastDateOfApplication
    ? buildUtcDateTimeFromIst(job.lastDateOfApplication, job.lastDateOfApplicationTime || "", "end")
    : null;

  if (applicationDeadline && applicationDeadline.getTime() < now) {
    return true;
  }

  const offerLetterEnd = job.offerLetterDate
    ? buildUtcDateTimeFromIst(job.offerLetterDate, "", "end")
    : null;

  if (offerLetterEnd && offerLetterEnd.getTime() < now) {
    return true;
  }

  const applicationCount = getPositiveInteger(job.applicationCount) || 0;
  const applicationLimit = getPositiveInteger(job.applicationLimit);
  if (applicationLimit && applicationCount >= applicationLimit) {
    return true;
  }

  const vacancies = getPositiveInteger(job.vacancies);
  return Boolean(vacancies && applicationCount >= vacancies);
};
