const fs = require('fs');
const XLSX = require('xlsx');

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const getRowEmail = (row = {}) => normalizeEmail(row.Email || row.email || row.EMAIL || '');
const getRowId = (row = {}) => (row.ID || row.id || row.Id || '').toString().trim();
const getRowName = (row = {}) => row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['full name'] || row['FULL NAME'] || row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '';
const getRowPhone = (row = {}) => row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '';
const getRowCourse = (row = {}) => row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified';
const getRowPassword = (row = {}) => row.Password || row.password || row.PASSWORD || '';
const getRowCredits = (row = {}, fallback = '0') => row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || fallback;

const collectDuplicateValues = (rows = [], getValue) => {
  const seen = new Set();
  const duplicates = [];

  rows.forEach(row => {
    const value = getValue(row);
    if (!value) return;

    if (seen.has(value)) {
      if (!duplicates.includes(value)) {
        duplicates.push(value);
      }
      return;
    }

    seen.add(value);
  });

  return duplicates;
};

const sanitizeRowsByEmail = (rows = [], { blockedEmails = [], allowedEmails = [] } = {}) => {
  const seenEmails = new Set();
  const blockedEmailSet = new Set(blockedEmails.map(normalizeEmail).filter(Boolean));
  const allowedEmailSet = new Set(allowedEmails.map(normalizeEmail).filter(Boolean));
  const duplicateEmails = [];
  const filteredBlockedEmails = [];

  const sanitizedRows = rows.filter(row => {
    const email = getRowEmail(row);
    if (!email) {
      return true;
    }

    if (blockedEmailSet.has(email) && !allowedEmailSet.has(email)) {
      if (!filteredBlockedEmails.includes(email)) {
        filteredBlockedEmails.push(email);
      }
      return false;
    }

    if (seenEmails.has(email)) {
      if (!duplicateEmails.includes(email)) {
        duplicateEmails.push(email);
      }
      return false;
    }

    seenEmails.add(email);
    return true;
  });

  return {
    rows: sanitizedRows,
    duplicateEmails,
    blockedEmails: filteredBlockedEmails,
    removedCount: rows.length - sanitizedRows.length
  };
};

const writeRowsToStoredFile = ({ rows = [], filePath, fileType, sheetName = 'Sheet1' }) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  if (fileType && fileType.includes('csv')) {
    fs.writeFileSync(filePath, XLSX.utils.sheet_to_csv(worksheet), 'utf8');
    return;
  }

  XLSX.writeFile(workbook, filePath);
};

const buildStructuredPlacementRows = (rows = [], { file, placement }) => rows.map((row, index) => ({
  rowIndex: index + 1,
  id: row.ID || row.id || row.Id || '',
  candidateName: getRowName(row),
  collegeName: row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
  email: row.Email || row.email || row.EMAIL || '',
  phone: getRowPhone(row),
  course: getRowCourse(row),
  password: getRowPassword(row),
  creditsAssigned: parseInt(getRowCredits(row, file?.credits || 0), 10) || 0,
  originalRowData: row,
  processedAt: new Date(),
  placementId: placement?._id,
  fileId: file?._id
}));

module.exports = {
  normalizeEmail,
  getRowEmail,
  getRowId,
  getRowName,
  getRowPhone,
  getRowCourse,
  getRowPassword,
  getRowCredits,
  collectDuplicateValues,
  sanitizeRowsByEmail,
  writeRowsToStoredFile,
  buildStructuredPlacementRows
};
