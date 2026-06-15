// Utility function to get the correct image URL
export const getImageUrl = (imagePath, fallbackImage = null) => {
  if (!imagePath) return fallbackImage;
  
  // If the path already starts with http/https or /uploads/, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // If it's a relative path, add /uploads/ prefix
  return `/uploads/${imagePath}`;
};

// Helper for profile pictures with fallback
export const getProfileImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-avatar.png');
};

// Helper for company logos with fallback
export const getLogoImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-company-logo.png');
};

// Helper for cover images with fallback
export const getCoverImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-cover.jpg');
};

// Helper for document/resume files
export const getDocumentUrl = (documentPath) => {
  return getImageUrl(documentPath);
};