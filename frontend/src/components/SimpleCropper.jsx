import React, { useState, useRef } from 'react';

const SimpleCropper = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  targetWidth = 300,
  targetHeight = 300,
  title = 'Crop Image'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleCrop = async () => {
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Calculate center crop
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cropAspect = aspectRatio;
      
      let cropWidth, cropHeight, cropX, cropY;
      
      if (imgAspect > cropAspect) {
        cropHeight = img.naturalHeight;
        cropWidth = cropHeight * cropAspect;
        cropX = (img.naturalWidth - cropWidth) / 2;
        cropY = 0;
      } else {
        cropWidth = img.naturalWidth;
        cropHeight = cropWidth / cropAspect;
        cropX = 0;
        cropY = (img.naturalHeight - cropHeight) / 2;
      }
      
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, targetWidth, targetHeight
      );
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCropComplete({
          file: file,
          url: canvas.toDataURL('image/jpeg', 0.9)
        });
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ 
            margin: '0px', 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827',
            fontFamily: 'Arial, sans-serif'
          }}>
            {title}
          </h3>
          <button 
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            <p style={{ margin: '0px', fontSize: '14px' }}>
              <strong>Preview:</strong> Image will be cropped to {targetWidth} × {targetHeight} pixels
            </p>
          </div>

          {/* Image Preview */}
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <img
              ref={imageRef}
              src={image}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Profile Preview */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ 
              margin: '0px 0px 12px 0px', 
              color: '#374151', 
              fontSize: '14px', 
              fontWeight: '600',
              fontFamily: 'Arial, sans-serif'
            }}>
              How it will appear on profile:
            </h4>
            <div style={{
              display: 'inline-block',
              position: 'relative',
              width: aspectRatio === 1 ? '80px' : '160px',
              height: aspectRatio === 1 ? '80px' : '90px',
              borderRadius: aspectRatio === 1 ? '50%' : '8px',
              overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#f3f4f6'
            }}>
              <img
                src={image}
                alt="Profile preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
            <p style={{ 
              margin: '8px 0px 0px 0px', 
              fontSize: '12px', 
              color: '#6b7280',
              fontFamily: 'Arial, sans-serif'
            }}>
              {aspectRatio === 1 ? 'Company Logo (Circular)' : 'Cover Image'}
            </p>
          </div>

          {/* Info */}
          <div style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            color: '#0369a1',
            fontWeight: '500'
          }}>
            <p style={{ margin: '0px', fontSize: '14px' }}>
              Output: {targetWidth} × {targetHeight} pixels | 
              Aspect Ratio: {aspectRatio === 1 ? '1:1 (Square)' : aspectRatio === 16/9 ? '16:9 (Widescreen)' : `${aspectRatio}:1`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              background: 'white',
              border: '1px solid #d1d5db',
              color: '#374151',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCrop}
            disabled={isProcessing}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              background: isProcessing ? '#9ca3af' : '#f97316',
              border: '1px solid ' + (isProcessing ? '#9ca3af' : '#f97316'),
              color: 'white',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {isProcessing ? 'Processing...' : 'Crop & Save ✂️'}
          </button>
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SimpleCropper;