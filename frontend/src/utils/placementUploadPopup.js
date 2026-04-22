const MAX_DUPLICATE_EMAILS_IN_POPUP = 5;

const normalizeDuplicateEmails = (emails = []) => (
  [...new Set(
    emails
      .map(email => String(email || '').trim())
      .filter(Boolean)
  )]
);

const normalizeDuplicateEmailMessage = (message = '') => String(message || '')
  .replace(/Skipped emails:/gi, 'Duplicate emails:')
  .replace(
    /are repeated in this file and will be skipped during processing/gi,
    'are duplicate emails in this file'
  )
  .replace(
    /already exist in the system and will be skipped during processing/gi,
    'already exist in the system as duplicate emails'
  )
  .trim();

const buildEmailSection = (title, emails = []) => {
  const normalizedEmails = normalizeDuplicateEmails(emails);
  if (normalizedEmails.length === 0) {
    return '';
  }

  const visibleEmails = normalizedEmails.slice(0, MAX_DUPLICATE_EMAILS_IN_POPUP);
  const remainingCount = normalizedEmails.length - visibleEmails.length;

  return [
    title,
    ...visibleEmails,
    remainingCount > 0 ? `and ${remainingCount} more` : ''
  ]
    .filter(Boolean)
    .join('\n');
};

export const buildPlacementUploadPopup = (message, skippedEmails = [], fallbackMessage = '') => {
  const normalizedMessage = normalizeDuplicateEmailMessage(message || fallbackMessage || '');
  const normalizedDuplicateEmails = normalizeDuplicateEmails(skippedEmails);

  if (normalizedDuplicateEmails.length === 0) {
    return {
      message: normalizedMessage,
      duration: 5000
    };
  }

  if (/duplicate emails?:/i.test(normalizedMessage)) {
    return {
      message: normalizedMessage,
      duration: 8000
    };
  }

  const duplicateEmailList = normalizedDuplicateEmails.slice(0, MAX_DUPLICATE_EMAILS_IN_POPUP).join(', ');
  const remainingDuplicateCount = normalizedDuplicateEmails.length - MAX_DUPLICATE_EMAILS_IN_POPUP;

  return {
    message: `${normalizedMessage} Duplicate emails: ${duplicateEmailList}${remainingDuplicateCount > 0 ? ` and ${remainingDuplicateCount} more` : ''}.`.trim(),
    duration: 8000
  };
};

export const buildPlacementUploadErrorPopup = ({
  message,
  duplicateEmails = [],
  existingEmails = [],
  fallbackMessage = 'Upload failed. Please try again.'
} = {}) => {
  const normalizedMessage = normalizeDuplicateEmailMessage(message || fallbackMessage || '');
  const duplicateSection = buildEmailSection('Duplicate emails:', duplicateEmails);
  const existingSection = buildEmailSection('Already registered emails:', existingEmails);

  return {
    message: [normalizedMessage, duplicateSection, existingSection].filter(Boolean).join('\n\n'),
    duration: duplicateSection || existingSection ? 10000 : 5000
  };
};
