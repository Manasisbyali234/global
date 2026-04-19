const CREDIT_KEYS = [
  'credits',
  'availableCredits',
  'creditsAssigned',
  'Credits Assigned',
  'credits assigned',
  'CREDITS ASSIGNED',
  'Available Credits',
  'available credits',
  'AVAILABLE CREDITS',
  'Credits',
  'CREDITS',
  'Credit',
  'credit',
  'CREDIT'
];

const readFirstValue = (source = {}, keys = [], fallback = '') => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source[key] !== '') {
      return source[key];
    }
  }

  return fallback;
};

export const normalizePlacementCredits = (source = {}, fallback = 0) => {
  const rawValue = readFirstValue(source, CREDIT_KEYS, fallback);

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      return fallback;
    }

    const parsedValue = parseInt(trimmedValue.replace(/[^0-9-]/g, ''), 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const normalizePlacementStudent = (student = {}) => {
  const courseValue = readFirstValue(
    student,
    ['course', 'Course', 'COURSE', 'Branch', 'branch', 'BRANCH', 'Course Name', 'course name', 'COURSE NAME', 'Program', 'program', 'PROGRAM', 'Department', 'department', 'DEPARTMENT', 'Stream', 'stream', 'STREAM'],
    'Not Provided'
  );

  return {
    ...student,
    name: readFirstValue(student, ['name', 'Candidate Name', 'candidate name', 'CANDIDATE NAME', 'Name', 'name', 'NAME', 'Full Name', 'full name', 'FULL NAME', 'Student Name', 'student name', 'STUDENT NAME'], ''),
    email: readFirstValue(student, ['email', 'Email', 'EMAIL'], ''),
    phone: readFirstValue(student, ['phone', 'Phone', 'PHONE', 'Mobile', 'mobile', 'MOBILE'], ''),
    course: courseValue === 'Not Specified' ? 'Not Provided' : courseValue,
    credits: normalizePlacementCredits(student, 0),
    collegeName: readFirstValue(student, ['collegeName', 'College Name', 'college name', 'College', 'college'], 'Not Available')
  };
};

export const normalizePlacementStudents = (students = []) =>
  Array.isArray(students) ? students.map(normalizePlacementStudent) : [];

const dedupePlacementStudentsByEmail = (students = []) => {
  const seenEmails = new Set();

  return students.filter(student => {
    const email = String(student?.email || '').trim().toLowerCase();
    if (!email) return true;
    if (seenEmails.has(email)) return false;

    seenEmails.add(email);
    return true;
  });
};

export const getPlacementFileStudents = (payload = {}) =>
  dedupePlacementStudentsByEmail(
    normalizePlacementStudents(payload.students || payload.fileData || [])
  );

export const normalizePlacementUploadErrorMessage = (message = '', fallback = 'Upload failed. Please try again.') => {
  const safeMessage = String(message || '')
    .replace(/^HTTP\s*\d+:\s*/i, '')
    .replace(/^\d{3}\s*-?\s*/g, '')
    .replace(/^[:\s-]+|[:\s-]+$/g, '')
    .trim();

  if (!safeMessage) {
    return fallback;
  }

  if (
    /missing required fields|row\(s\) with missing required information|required fields for all rows|missing phone|missing email|missing candidate name|missing id|actual student data/i.test(
      safeMessage
    )
  ) {
    return 'Required fields are missing in the Excel sheet.';
  }

  return safeMessage;
};
