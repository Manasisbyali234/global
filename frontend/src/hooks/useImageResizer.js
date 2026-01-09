import { useState, useCallback } from 'react';

export const useImageResizer = () => {
  const [isResizerOpen, setIsResizerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [resizeConfig, setResizeConfig] = useState({});
  const [onSaveCallback, setOnSaveCallback] = useState(null);

  const openResizer = useCallback((imageSrc, config = {}, onSave) => {
    setCurrentImage(imageSrc);
    setResizeConfig({
      aspectRatio: null,
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.9,
      ...config
    });
    setOnSaveCallback(() => onSave);
    setIsResizerOpen(true);
  }, []);

  const closeResizer = useCallback(() => {
    setIsResizerOpen(false);
    setCurrentImage(null);
    setResizeConfig({});
    setOnSaveCallback(null);
  }, []);

  const handleSave = useCallback((processedImage) => {
    if (onSaveCallback) {
      onSaveCallback(processedImage);
    }
    closeResizer();
  }, [onSaveCallback, closeResizer]);

  // Predefined configurations for different image types
  const configs = {
    logo: {
      aspectRatio: 1, // Square
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.95
    },
    banner: {
      aspectRatio: 16/9, // Widescreen
      maxWidth: 1200,
      maxHeight: 675,
      quality: 0.9
    },
    profile: {
      aspectRatio: 1, // Square
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.9
    },
    gallery: {
      aspectRatio: null, // Free aspect ratio
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.85
    },
    document: {
      aspectRatio: null, // Free aspect ratio
      maxWidth: 1000,
      maxHeight: 1400,
      quality: 0.9
    }
  };

  const openLogoResizer = useCallback((imageSrc, onSave) => {
    openResizer(imageSrc, configs.logo, onSave);
  }, [openResizer]);

  const openBannerResizer = useCallback((imageSrc, onSave) => {
    openResizer(imageSrc, configs.banner, onSave);
  }, [openResizer]);

  const openProfileResizer = useCallback((imageSrc, onSave) => {
    openResizer(imageSrc, configs.profile, onSave);
  }, [openResizer]);

  const openGalleryResizer = useCallback((imageSrc, onSave) => {
    openResizer(imageSrc, configs.gallery, onSave);
  }, [openResizer]);

  const openDocumentResizer = useCallback((imageSrc, onSave) => {
    openResizer(imageSrc, configs.document, onSave);
  }, [openResizer]);

  // Utility function to convert file to data URL
  const fileToDataURL = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Utility function to validate image file
  const validateImageFile = useCallback((file, maxSizeMB = 10) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxBytes) {
      throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
    }

    return true;
  }, []);

  // Enhanced file handler with automatic resizing
  const handleFileWithResize = useCallback(async (file, type = 'gallery', onSave) => {
    try {
      validateImageFile(file);
      const dataURL = await fileToDataURL(file);
      
      const config = configs[type] || configs.gallery;
      openResizer(dataURL, config, onSave);
    } catch (error) {
      console.error('File handling error:', error);
      throw error;
    }
  }, [validateImageFile, fileToDataURL, openResizer]);

  return {
    // State
    isResizerOpen,
    currentImage,
    resizeConfig,
    
    // Actions
    openResizer,
    closeResizer,
    handleSave,
    
    // Predefined openers
    openLogoResizer,
    openBannerResizer,
    openProfileResizer,
    openGalleryResizer,
    openDocumentResizer,
    
    // Utilities
    fileToDataURL,
    validateImageFile,
    handleFileWithResize,
    
    // Configs
    configs
  };
};

export default useImageResizer;