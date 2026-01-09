// Helper functions for Base64 file handling

/**
 * Convert Base64 string to downloadable buffer
 * @param {string} base64String - Base64 encoded file with data URL prefix
 * @returns {Object} - { buffer, mimeType, extension }
 */
const base64ToBuffer = (base64String) => {
  if (!base64String || !base64String.startsWith('data:')) {
    throw new Error('Invalid Base64 string format');
  }

  // Extract mime type and base64 data
  const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid Base64 data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Get file extension from mime type
  const extensionMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/csv': 'csv'
  };

  const extension = extensionMap[mimeType] || 'bin';

  return { buffer, mimeType, extension };
};

/**
 * Generate filename for download
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} - Generated filename
 */
const generateFilename = (prefix, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}_${timestamp}.${extension}`;
};

module.exports = {
  base64ToBuffer,
  generateFilename
};