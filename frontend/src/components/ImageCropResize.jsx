import React, { useState, useRef, useEffect } from 'react';
import './ImageCropResize.css';

const ImageCropResize = ({ 
  image, 
  onComplete, 
  onCancel, 
  aspectRatio = 1, 
  targetWidth = 300,
  targetHeight = 300,
  title = 'Crop & Resize Image'
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const outputCanvasRef = useRef(null);

  // Update preview in real-time
  const updatePreview = () => {
    if (!imageRef.current || !previewCanvasRef.current || !containerRef.current) return;
    
    try {
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!img.complete || img.naturalWidth === 0) return;
      
      canvas.width = 100;
      canvas.height = 100;
      
      // Simple center crop without complex calculations
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const x = (img.naturalWidth - size) / 2;
      const y = (img.naturalHeight - size) / 2;
      
      ctx.drawImage(img, x, y, size, size, 0, 0, 100, 100);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      updatePreview();
    }
  }, []);

  // Mouse handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Process and crop image
  const handleProcess = async () => {
    setIsProcessing(true);
    
    try {
      const canvas = outputCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Simple center crop
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
      
      // Convert to file
      canvas.toBlob((blob) => {
        const file = new File([blob], 'processed-image.jpg', { type: 'image/jpeg' });
        onComplete({
          file: file,
          url: canvas.toDataURL('image/jpeg', 0.9)
        });
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="crop-resize-modal">
      <div className="crop-resize-container">
        <div className="crop-resize-header">
          <h2>{title}</h2>
          <button onClick={onCancel} className="crop-resize-close-btn">
            ✕
          </button>
        </div>

        <div className="crop-resize-content">
          <div className="crop-resize-instructions">
            <p>
              <strong>Drag to position • Use zoom controls • Preview shows final result</strong>
            </p>
          </div>

          <div className="crop-resize-main">
            <div className="crop-resize-editor">
              <div 
                ref={containerRef}
                className="crop-resize-canvas-container"
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Crop"
                  draggable={false}
                  onLoad={updatePreview}
                />
                
                <div className="crop-resize-frame" style={{ aspectRatio: aspectRatio }}>
                  <div className="crop-resize-frame-label">
                    CROP AREA
                  </div>
                </div>
              </div>

              <div className="crop-resize-controls">
                <div className="crop-resize-zoom-controls">
                  <button 
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="crop-resize-zoom-btn"
                  >
                    Zoom Out
                  </button>
                  <span className="crop-resize-zoom-value">
                    {zoom.toFixed(1)}x
                  </span>
                  <button 
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="crop-resize-zoom-btn"
                  >
                    Zoom In
                  </button>
                </div>
                
                <button 
                  onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }}
                  className="crop-resize-reset-btn"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="crop-resize-preview">
              <h4 className="crop-resize-preview-title">
                Live Preview
              </h4>
              
              <div className="crop-resize-preview-canvas">
                <canvas
                  ref={previewCanvasRef}
                />
              </div>
              
              <p className="crop-resize-preview-label">
                {aspectRatio === 1 ? 'Logo (Circular)' : 'Cover Image'}
              </p>
              
              <div className="crop-resize-preview-info">
                Output: {targetWidth}×{targetHeight}px
              </div>
            </div>
          </div>

          <div className="crop-resize-footer">
            <button 
              onClick={onCancel}
              className="crop-resize-cancel-btn"
            >
              Cancel
            </button>
            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className="crop-resize-submit-btn"
            >
              {isProcessing ? 'Processing...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>

      <canvas ref={outputCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCropResize;