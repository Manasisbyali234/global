import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, Move, ZoomIn, ZoomOut } from 'lucide-react';

const NewImageCropper = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  targetWidth = 300,
  targetHeight = 300,
  title = 'Crop Image'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);

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

  const updatePreview = () => {
    if (!imageRef.current || !previewCanvasRef.current || !containerRef.current) return;
    
    try {
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (!img.complete || img.naturalWidth === 0) return;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Calculate crop area
      const containerRect = containerRef.current.getBoundingClientRect();
      const cropSize = Math.min(containerRect.width, containerRect.height) * 0.7;
      const imgRect = img.getBoundingClientRect();
      const containerCenter = {
        x: containerRect.width / 2,
        y: containerRect.height / 2
      };
      
      // Calculate source crop area
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      const cropX = (containerCenter.x - cropSize/2 - position.x) * scaleX;
      const cropY = (containerCenter.y - cropSize/2 - position.y) * scaleY;
      const cropWidth = cropSize * scaleX;
      const cropHeight = cropSize * scaleY;
      
      ctx.drawImage(
        img,
        Math.max(0, cropX), Math.max(0, cropY),
        Math.min(cropWidth, img.naturalWidth), Math.min(cropHeight, img.naturalHeight),
        0, 0, targetWidth, targetHeight
      );
    } catch (error) {
      console.error('Preview update error:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePreview, 200);
    return () => clearTimeout(timer);
  }, [position, zoom]);

  const handleCrop = async () => {
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Use same logic as preview
      const containerRect = containerRef.current.getBoundingClientRect();
      const cropSize = Math.min(containerRect.width, containerRect.height) * 0.7;
      const imgRect = img.getBoundingClientRect();
      const containerCenter = {
        x: containerRect.width / 2,
        y: containerRect.height / 2
      };
      
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      const cropX = (containerCenter.x - cropSize/2 - position.x) * scaleX;
      const cropY = (containerCenter.y - cropSize/2 - position.y) * scaleY;
      const cropWidth = cropSize * scaleX;
      const cropHeight = cropSize * scaleY;
      
      ctx.drawImage(
        img,
        Math.max(0, cropX), Math.max(0, cropY),
        Math.min(cropWidth, img.naturalWidth), Math.min(cropHeight, img.naturalHeight),
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
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
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
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
              color: '#6b7280'
            }}
          >
            <X size={20} />
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
            <p style={{ margin: 0 }}>
              <strong>Preview:</strong> The image will be cropped to fit {targetWidth} × {targetHeight} pixels
            </p>
          </div>

          {/* Crop Container */}
          <div 
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
              marginBottom: '20px',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imageRef}
              src={image}
              alt="Crop preview"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                maxWidth: 'none',
                maxHeight: 'none',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
              onLoad={updatePreview}
            />
            
            {/* Crop Frame */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              aspectRatio: aspectRatio,
              border: '3px solid #f97316',
              borderRadius: '8px',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#f97316',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                CROP AREA
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                disabled={zoom <= 0.5}
                style={{
                  background: '#f97316',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: zoom <= 0.5 ? 0.5 : 1
                }}
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ fontWeight: 600, minWidth: '80px', textAlign: 'center' }}>
                Zoom: {zoom.toFixed(1)}x
              </span>
              <button 
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                disabled={zoom >= 3}
                style={{
                  background: '#f97316',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  opacity: zoom >= 3 ? 0.5 : 1
                }}
              >
                <ZoomIn size={16} />
              </button>
            </div>
            
            <button 
              onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }}
              style={{
                background: '#6b7280',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>

          {/* Live Preview */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', fontWeight: 600 }}>
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
              <canvas
                ref={previewCanvasRef}
                width={targetWidth}
                height={targetHeight}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
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
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0 }}>
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
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.875rem',
              background: 'white',
              border: '1px solid #d1d5db',
              color: '#374151'
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
              fontWeight: 500,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              background: isProcessing ? '#9ca3af' : '#f97316',
              border: '1px solid ' + (isProcessing ? '#9ca3af' : '#f97316'),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isProcessing ? 'Processing...' : 'Crop & Save'}
            {!isProcessing && <Crop size={16} />}
          </button>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default NewImageCropper;