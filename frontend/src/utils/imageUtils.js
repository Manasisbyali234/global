/**
 * Image utility functions for resizing, cropping, and optimization
 */

export const imageUtils = {
  /**
   * Convert file to data URL
   */
  fileToDataURL: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Create image element from source
   */
  createImage: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Resize image to fit within bounds while maintaining aspect ratio
   */
  resizeImage: async (src, maxWidth, maxHeight, quality = 0.9) => {
    const img = await imageUtils.createImage(src);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate new dimensions
    let { width, height } = img;
    const aspectRatio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
  },

  /**
   * Crop image to specific aspect ratio
   */
  cropToAspectRatio: async (src, aspectRatio, quality = 0.9) => {
    const img = await imageUtils.createImage(src);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img;
    const imgAspectRatio = imgWidth / imgHeight;

    let cropWidth, cropHeight, cropX, cropY;

    if (imgAspectRatio > aspectRatio) {
      // Image is wider than target aspect ratio
      cropHeight = imgHeight;
      cropWidth = cropHeight * aspectRatio;
      cropX = (imgWidth - cropWidth) / 2;
      cropY = 0;
    } else {
      // Image is taller than target aspect ratio
      cropWidth = imgWidth;
      cropHeight = cropWidth / aspectRatio;
      cropX = 0;
      cropY = (imgHeight - cropHeight) / 2;
    }

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    return canvas.toDataURL('image/jpeg', quality);
  },

  /**
   * Compress image while maintaining quality
   */
  compressImage: async (src, maxSizeKB = 500, quality = 0.9) => {
    let currentQuality = quality;
    let compressedDataURL = src;
    
    while (currentQuality > 0.1) {
      const img = await imageUtils.createImage(src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0);

      compressedDataURL = canvas.toDataURL('image/jpeg', currentQuality);
      
      // Check file size (approximate)
      const sizeKB = (compressedDataURL.length * 0.75) / 1024;
      
      if (sizeKB <= maxSizeKB) {
        break;
      }
      
      currentQuality -= 0.1;
    }

    return compressedDataURL;
  },

  /**
   * Generate thumbnail from image
   */
  generateThumbnail: async (src, size = 150, quality = 0.8) => {
    const img = await imageUtils.createImage(src);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;

    const { naturalWidth: imgWidth, naturalHeight: imgHeight } = img;
    const minDimension = Math.min(imgWidth, imgHeight);
    const cropX = (imgWidth - minDimension) / 2;
    const cropY = (imgHeight - minDimension) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      cropX, cropY, minDimension, minDimension,
      0, 0, size, size
    );

    return canvas.toDataURL('image/jpeg', quality);
  },

  /**
   * Validate image file
   */
  validateImage: (file, options = {}) => {
    const {
      maxSizeMB = 10,
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      minWidth = 100,
      minHeight = 100
    } = options;

    return new Promise((resolve, reject) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
        return;
      }

      // Check file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        reject(new Error(`File too large. Maximum size: ${maxSizeMB}MB`));
        return;
      }

      // Check image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < minWidth || img.height < minHeight) {
          reject(new Error(`Image too small. Minimum ${minWidth}x${minHeight}px required`));
          return;
        }
        
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          valid: true
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Invalid image file'));
      };
      
      img.src = objectUrl;
    });
  },

  /**
   * Convert data URL to blob
   */
  dataURLToBlob: (dataURL) => {
    return new Promise((resolve) => {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      resolve(new Blob([u8arr], { type: mime }));
    });
  },

  /**
   * Get optimal image dimensions for different use cases
   */
  getOptimalDimensions: (type) => {
    const presets = {
      logo: { width: 300, height: 300, aspectRatio: 1 },
      banner: { width: 1200, height: 675, aspectRatio: 16/9 },
      profile: { width: 400, height: 400, aspectRatio: 1 },
      gallery: { width: 800, height: 600, aspectRatio: null },
      thumbnail: { width: 150, height: 150, aspectRatio: 1 },
      document: { width: 1000, height: 1400, aspectRatio: null }
    };

    return presets[type] || presets.gallery;
  },

  /**
   * Apply image filters and enhancements
   */
  enhanceImage: async (src, options = {}) => {
    const {
      brightness = 1,
      contrast = 1,
      saturation = 1,
      blur = 0,
      sharpen = false
    } = options;

    const img = await imageUtils.createImage(src);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply filters
    ctx.filter = `
      brightness(${brightness})
      contrast(${contrast})
      saturate(${saturation})
      blur(${blur}px)
    `;

    ctx.drawImage(img, 0, 0);

    // Apply sharpening if requested
    if (sharpen) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sharpened = imageUtils.applySharpenFilter(imageData);
      ctx.putImageData(sharpened, 0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  },

  /**
   * Apply sharpen filter to image data
   */
  applySharpenFilter: (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);
    
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];
            
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        
        const outputIdx = (y * width + x) * 4;
        output.data[outputIdx] = Math.max(0, Math.min(255, r));
        output.data[outputIdx + 1] = Math.max(0, Math.min(255, g));
        output.data[outputIdx + 2] = Math.max(0, Math.min(255, b));
        output.data[outputIdx + 3] = data[outputIdx + 3]; // Alpha
      }
    }

    return output;
  }
};

export default imageUtils;