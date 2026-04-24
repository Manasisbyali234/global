import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { Crop, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';
import './ImageResizer.css';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.crossOrigin = 'anonymous';
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const rotateSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
};

const renderCroppedImage = async (imageSrc, pixelCrop, rotation, outputWidth, outputHeight, quality) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to initialize the cropper canvas.');
  }

  const rotRad = getRadianAngle(rotation);
  const { width: boundingWidth, height: boundingHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = boundingWidth;
  canvas.height = boundingHeight;

  ctx.translate(boundingWidth / 2, boundingHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const exportCanvas = document.createElement('canvas');
  const exportCtx = exportCanvas.getContext('2d');

  if (!exportCtx) {
    throw new Error('Unable to initialize the export canvas.');
  }

  exportCanvas.width = outputWidth;
  exportCanvas.height = outputHeight;

  exportCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return exportCanvas.toDataURL('image/jpeg', quality);
};

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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const effectiveAspectRatio = aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0
    ? aspectRatio
    : maxWidth / Math.max(maxHeight, 1);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);

    if (typeof document !== 'undefined') {
      document.body.classList.add('image-resizer-open');
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('image-resizer-open');
      }
    };
  }, [isOpen, src]);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  const handleSave = useCallback(async () => {
    if (!src || !croppedAreaPixels || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const processedImage = await renderCroppedImage(
        src,
        croppedAreaPixels,
        rotation,
        maxWidth,
        maxHeight,
        quality
      );

      onSave(processedImage);
    } catch (error) {
      console.error('Image crop export failed:', error);
      window.alert('Unable to crop this image. Please re-upload it and try again.');
    } finally {
      setIsSaving(false);
    }
  }, [croppedAreaPixels, isSaving, maxHeight, maxWidth, onSave, quality, rotation, src]);

  if (!isOpen || !src) {
    return null;
  }

  const modalContent = (
    <div className="image-resizer-overlay" role="dialog" aria-modal="true" aria-label="Resize and crop image">
      <div className="image-resizer-modal">
        <div className="image-resizer-header">
          <h3>Resize & Crop Image</h3>
          <button type="button" onClick={onClose} className="image-resizer-close-btn" aria-label="Close cropper">
            <X size={20} />
          </button>
        </div>

        <div className="image-resizer-content">
          <div className="image-container image-container--cropper">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={effectiveAspectRatio}
              minZoom={1}
              maxZoom={4}
              restrictPosition={lockCropArea}
              showGrid={true}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#111827'
                },
                cropAreaStyle: {
                  border: '2px solid #f97316',
                  borderRadius: '6px'
                }
              }}
            />
          </div>

          <div className="controls">
            <div className="control-group control-group--wide">
              <label htmlFor="image-resizer-zoom">Zoom: {zoom.toFixed(1)}x</label>
              <div className="control-row">
                <button type="button" onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))} title="Zoom out">
                  <ZoomOut size={16} />
                </button>
                <input
                  id="image-resizer-zoom"
                  className="image-resizer-slider"
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(parseFloat(event.target.value))}
                />
                <button type="button" onClick={() => setZoom((prev) => Math.min(4, prev + 0.1))} title="Zoom in">
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div className="control-group control-group--wide">
              <label htmlFor="image-resizer-rotation">Rotation: {rotation}deg</label>
              <div className="control-row">
                <button type="button" onClick={() => setRotation((prev) => prev - 90)} title="Rotate left">
                  <RotateCcw size={16} />
                </button>
                <input
                  id="image-resizer-rotation"
                  className="image-resizer-slider"
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(event) => setRotation(parseInt(event.target.value, 10))}
                />
                <button type="button" onClick={() => setRotation((prev) => prev + 90)} title="Rotate right">
                  <RotateCw size={16} />
                </button>
              </div>
            </div>

            <div className="control-group">
              <button type="button" onClick={handleReset} title="Reset cropper">
                Reset
              </button>
            </div>
          </div>

          <div className="image-resizer-meta">
            <p><strong>Instructions:</strong> Drag to reposition, zoom to resize, and crop inside the orange frame.</p>
            <p><strong>Output:</strong> {maxWidth} x {maxHeight} pixels</p>
          </div>
        </div>

        <div className="image-resizer-footer">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-save" disabled={isSaving || !croppedAreaPixels}>
            {isSaving ? 'Processing...' : 'Apply Crop'}
            <Crop size={16} />
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
