import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, ZoomIn, ZoomOut, Download, X, Move } from 'lucide-react';
import './ImageResizer.css';

const ImageResizer = ({ 
  src, 
  isOpen, 
  onClose, 
  onSave, 
  aspectRatio = null, 
  maxWidth = 800, 
  maxHeight = 600,
  lockCropArea = false,
  quality = 0.9 
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 100, y: 100, width: 200, height: 200 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizingCrop, setIsResizingCrop] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const getInitialCropArea = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (!container || !image) {
      return { x: 100, y: 100, width: 200, height: 200 };
    }

    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const imageBounds = {
      x: Math.max(0, imageRect.left - containerRect.left),
      y: Math.max(0, imageRect.top - containerRect.top),
      width: Math.max(50, Math.min(imageRect.width, containerRect.width)),
      height: Math.max(50, Math.min(imageRect.height, containerRect.height))
    };

    if (!aspectRatio) {
      const width = Math.max(50, imageBounds.width * 0.8);
      const height = Math.max(50, imageBounds.height * 0.8);

      return {
        x: imageBounds.x + (imageBounds.width - width) / 2,
        y: imageBounds.y + (imageBounds.height - height) / 2,
        width,
        height
      };
    }

    let width = imageBounds.width;
    let height = width / aspectRatio;

    if (height > imageBounds.height) {
      height = imageBounds.height;
      width = height * aspectRatio;
    }

    return {
      x: imageBounds.x + (imageBounds.width - width) / 2,
      y: imageBounds.y + (imageBounds.height - height) / 2,
      width: Math.max(50, width),
      height: Math.max(50, height)
    };
  }, [aspectRatio]);

  const syncCropAreaToImage = useCallback(() => {
    setCropArea(getInitialCropArea());
  }, [getInitialCropArea]);

  const handleMouseDown = useCallback((e) => {
    const clickedResizeHandle = e.target.classList.contains('resize-handle');
    const clickedCropArea = e.target.closest('.crop-area');

    if (clickedResizeHandle) return;
    if (!lockCropArea && clickedCropArea) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position, lockCropArea]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (!lockCropArea && isDraggingCrop) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.cropX, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.cropY, rect.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
    
    if (!lockCropArea && isResizingCrop && resizeHandle) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setCropArea(prev => {
        if (!aspectRatio) {
          const newArea = { ...prev };
          
          if (resizeHandle.includes('right')) {
            newArea.width = Math.max(50, Math.min(mouseX - prev.x, rect.width - prev.x));
          }
          if (resizeHandle.includes('bottom')) {
            newArea.height = Math.max(50, Math.min(mouseY - prev.y, rect.height - prev.y));
          }
          if (resizeHandle.includes('left')) {
            const newWidth = prev.width + (prev.x - mouseX);
            if (newWidth >= 50 && mouseX >= 0) {
              newArea.x = mouseX;
              newArea.width = newWidth;
            }
          }
          if (resizeHandle.includes('top')) {
            const newHeight = prev.height + (prev.y - mouseY);
            if (newHeight >= 50 && mouseY >= 0) {
              newArea.y = mouseY;
              newArea.height = newHeight;
            }
          }
          
          return newArea;
        }

        const minWidth = 50;
        const minHeight = minWidth / aspectRatio;
        const right = prev.x + prev.width;
        const bottom = prev.y + prev.height;
        let nextArea = { ...prev };

        if (resizeHandle === 'top-left') {
          const maxWidth = Math.max(0, right);
          const maxHeight = Math.max(0, bottom);
          const rawWidth = Math.max(minWidth, right - mouseX);
          const rawHeight = Math.max(minHeight, bottom - mouseY);
          const width = Math.min(rawWidth, rawHeight * aspectRatio, maxWidth, maxHeight * aspectRatio);
          const height = width / aspectRatio;
          nextArea = { x: right - width, y: bottom - height, width, height };
        }

        if (resizeHandle === 'top-right') {
          const maxWidth = Math.max(0, rect.width - prev.x);
          const maxHeight = Math.max(0, bottom);
          const rawWidth = Math.max(minWidth, mouseX - prev.x);
          const rawHeight = Math.max(minHeight, bottom - mouseY);
          const width = Math.min(rawWidth, rawHeight * aspectRatio, maxWidth, maxHeight * aspectRatio);
          const height = width / aspectRatio;
          nextArea = { x: prev.x, y: bottom - height, width, height };
        }

        if (resizeHandle === 'bottom-left') {
          const maxWidth = Math.max(0, right);
          const maxHeight = Math.max(0, rect.height - prev.y);
          const rawWidth = Math.max(minWidth, right - mouseX);
          const rawHeight = Math.max(minHeight, mouseY - prev.y);
          const width = Math.min(rawWidth, rawHeight * aspectRatio, maxWidth, maxHeight * aspectRatio);
          const height = width / aspectRatio;
          nextArea = { x: right - width, y: prev.y, width, height };
        }

        if (resizeHandle === 'bottom-right') {
          const maxWidth = Math.max(0, rect.width - prev.x);
          const maxHeight = Math.max(0, rect.height - prev.y);
          const rawWidth = Math.max(minWidth, mouseX - prev.x);
          const rawHeight = Math.max(minHeight, mouseY - prev.y);
          const width = Math.min(rawWidth, rawHeight * aspectRatio, maxWidth, maxHeight * aspectRatio);
          const height = width / aspectRatio;
          nextArea = { x: prev.x, y: prev.y, width, height };
        }

        nextArea.x = Math.max(0, Math.min(nextArea.x, rect.width - nextArea.width));
        nextArea.y = Math.max(0, Math.min(nextArea.y, rect.height - nextArea.height));

        return nextArea;
      });
    }
  }, [isDragging, isDraggingCrop, isResizingCrop, dragStart, cropArea, resizeHandle, aspectRatio, lockCropArea]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingCrop(false);
    setIsResizingCrop(false);
    setResizeHandle(null);
  }, []);

  const handleCropMouseDown = useCallback((e) => {
    if (lockCropArea) return;
    e.stopPropagation();
    setIsDraggingCrop(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      cropX: e.clientX - rect.left,
      cropY: e.clientY - rect.top
    });
  }, [lockCropArea]);

  const handleResizeMouseDown = useCallback((e, handle) => {
    if (lockCropArea) return;
    e.stopPropagation();
    setIsResizingCrop(true);
    setResizeHandle(handle);
  }, [lockCropArea]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    requestAnimationFrame(() => {
      syncCropAreaToImage();
    });
  };

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;
    
    if (!canvas || !image || !container) return;

    const ctx = canvas.getContext('2d');
    
    // Get container and image dimensions
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    
    // Calculate scale factors
    const scaleX = image.naturalWidth / imageRect.width;
    const scaleY = image.naturalHeight / imageRect.height;
    
    // Calculate crop coordinates relative to the original image
    const cropX = (cropArea.x - (imageRect.left - containerRect.left)) * scaleX;
    const cropY = (cropArea.y - (imageRect.top - containerRect.top)) * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;
    
    // Export at the requested fixed dimensions.
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    try {
      // Draw the cropped portion
        ctx.drawImage(
          image,
          Math.max(0, cropX),
          Math.max(0, cropY),
          Math.min(cropWidth, image.naturalWidth),
          Math.min(cropHeight, image.naturalHeight),
          0,
          0,
          maxWidth,
          maxHeight
        );
      
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => onSave(reader.result);
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', quality);
    } catch (error) {
      console.error('Image crop export failed:', error);
      window.alert('Unable to crop this image. Please re-upload the image and try again.');
    }
  }, [cropArea, quality, onSave, maxWidth, maxHeight]);

  useEffect(() => {
    if (!isOpen) return undefined;

    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });

    const frameId = requestAnimationFrame(() => {
      syncCropAreaToImage();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, src, aspectRatio, syncCropAreaToImage]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;

    document.body.classList.add('image-resizer-open');

    return () => {
      document.body.classList.remove('image-resizer-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="image-resizer-overlay">
      <div className="image-resizer-modal">
        <div className="image-resizer-header">
          <h3>Resize & Crop Image</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="image-resizer-content">
          <div 
            ref={containerRef}
            className="image-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={src}
              alt="Preview"
              crossOrigin="anonymous"
              onLoad={syncCropAreaToImage}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              draggable={false}
            />
            
            {/* Crop Area */}
            <div
              className="crop-area"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                cursor: lockCropArea ? 'default' : 'move'
              }}
              onMouseDown={lockCropArea ? undefined : handleCropMouseDown}
            >
              <div className="crop-overlay"></div>
               
              {!lockCropArea && (
                <>
                  <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}></div>
                  <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}></div>
                  <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}></div>
                  <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}></div>
                  
                  <div className="crop-center">
                    <Move size={16} />
                  </div>
                </>
              )}
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          <div className="controls">
            <div className="control-group">
              <button onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut size={16} />
              </button>
              <span className="scale-display">{Math.round(scale * 100)}%</span>
              <button onClick={handleZoomIn} title="Zoom In">
                <ZoomIn size={16} />
              </button>
            </div>
            
            <div className="control-group">
              <button onClick={handleRotate} title="Rotate 90°">
                <RotateCcw size={16} />
              </button>
              <button onClick={handleReset} title="Reset">
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <div className="image-resizer-footer">
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-save">
            <Download size={16} />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
};

export default ImageResizer;
