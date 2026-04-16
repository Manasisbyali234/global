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
