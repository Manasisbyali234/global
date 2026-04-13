const MAX_SKIPPED_EMAILS_IN_POPUP = 5;

const normalizeSkippedEmails = (emails = []) => (
  [...new Set(
    emails
      .map(email => String(email || '').trim())
      .filter(Boolean)
  )]
);

export const buildPlacementUploadPopup = (message, skippedEmails = [], fallbackMessage = '') => {
  const normalizedMessage = String(message || fallbackMessage || '').trim();
  const normalizedSkippedEmails = normalizeSkippedEmails(skippedEmails);

  if (normalizedSkippedEmails.length === 0) {
    return {
      message: normalizedMessage,
      duration: 5000
    };
  }

  if (/will be skipped during processing|skipped emails:/i.test(normalizedMessage)) {
    return {
      message: normalizedMessage,
      duration: 8000
    };
  }

  const skippedEmailList = normalizedSkippedEmails.slice(0, MAX_SKIPPED_EMAILS_IN_POPUP).join(', ');
  const remainingSkippedCount = normalizedSkippedEmails.length - MAX_SKIPPED_EMAILS_IN_POPUP;

  return {
    message: `${normalizedMessage} Skipped emails: ${skippedEmailList}${remainingSkippedCount > 0 ? ` and ${remainingSkippedCount} more` : ''}.`.trim(),
    duration: 8000
  };
};
