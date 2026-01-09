import React, { useState, useRef, useCallback } from 'react';
import { Crop, RotateCcw, ZoomIn, ZoomOut, Download, X, Move } from 'lucide-react';
import './ImageResizer.css';

const ImageResizer = ({ 
  src, 
  isOpen, 
  onClose, 
  onSave, 
  aspectRatio = null, 
  maxWidth = 800, 
  maxHeight = 600,
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

  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('crop-area') || e.target.classList.contains('resize-handle')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (isDraggingCrop) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.cropX, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.cropY, rect.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
    
    if (isResizingCrop && resizeHandle) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setCropArea(prev => {
        let newArea = { ...prev };
        
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
      });
    }
  }, [isDragging, isDraggingCrop, isResizingCrop, dragStart, cropArea, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingCrop(false);
    setIsResizingCrop(false);
    setResizeHandle(null);
  }, []);

  const handleCropMouseDown = useCallback((e) => {
    e.stopPropagation();
    setIsDraggingCrop(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      cropX: e.clientX - rect.left,
      cropY: e.clientY - rect.top
    });
  }, []);

  const handleResizeMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    setIsResizingCrop(true);
    setResizeHandle(handle);
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setCropArea({ x: 100, y: 100, width: 200, height: 200 });
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
    
    // Set output canvas size
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // Draw the cropped portion
    ctx.drawImage(
      image,
      Math.max(0, cropX),
      Math.max(0, cropY),
      Math.min(cropWidth, image.naturalWidth),
      Math.min(cropHeight, image.naturalHeight),
      0,
      0,
      cropArea.width,
      cropArea.height
    );
    
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => onSave(reader.result);
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', quality);
  }, [cropArea, quality, onSave]);

  if (!isOpen) return null;

  return (
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
                height: cropArea.height
              }}
              onMouseDown={handleCropMouseDown}
            >
              <div className="crop-overlay"></div>
              
              {/* Resize Handles */}
              <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}></div>
              <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}></div>
              <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}></div>
              <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}></div>
              
              <div className="crop-center">
                <Move size={16} />
              </div>
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
};

export default ImageResizer;