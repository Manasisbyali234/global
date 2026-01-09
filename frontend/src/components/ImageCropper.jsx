import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Crop, X } from 'lucide-react';
import './ImageCropper.css';

const ImageCropper = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  cropShape = 'rect',
  minZoom = 1,
  maxZoom = 3,
  title = 'Crop Image',
  targetWidth = 300,
  targetHeight = 300
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRadianAngle = (degreeValue) => {
    return (degreeValue * Math.PI) / 180;
  };

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      return null;
    }

    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve) => {
      croppedCanvas.toBlob((file) => {
        resolve({ file, url: croppedCanvas.toDataURL('image/jpeg', 0.9) });
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, minZoom));
  };

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-modal">
        <div className="image-cropper-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="image-cropper-content">
          <div className="crop-container">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              cropShape={cropShape}
              showGrid={true}
              restrictPosition={false}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#000',
                  borderRadius: '8px'
                },
                cropAreaStyle: {
                  border: '2px solid #f97316',
                  borderRadius: cropShape === 'round' ? '50%' : '4px'
                },
                mediaStyle: {
                  transform: 'none'
                }
              }}
            />
          </div>

          <div className="crop-controls">
            <div className="control-group">
              <label>Zoom: {zoom.toFixed(1)}x</label>
              <div className="zoom-controls">
                <button onClick={handleZoomOut} disabled={zoom <= minZoom}>
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="zoom-slider"
                />
                <button onClick={handleZoomIn} disabled={zoom >= maxZoom}>
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Rotation: {rotation}°</label>
              <div className="rotation-controls">
                <button onClick={handleRotateLeft}>
                  <RotateCcw size={16} />
                  <span>90°</span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="rotation-slider"
                />
                <button onClick={handleRotateRight}>
                  <RotateCw size={16} />
                  <span>90°</span>
                </button>
              </div>
            </div>
          </div>

          <div className="size-info">
            <p><strong>Instructions:</strong></p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.875rem' }}>
              <li>Drag the image to reposition it within the frame</li>
              <li>Use zoom controls to resize the image</li>
              <li>Rotate the image using the rotation controls</li>
              <li>The orange border shows your crop area</li>
            </ul>
            <p><strong>Output:</strong> {targetWidth} × {targetHeight} pixels</p>
            <p><strong>Aspect ratio:</strong> {aspectRatio === 1 ? '1:1 (Square)' : `${aspectRatio}:1`}</p>
          </div>
        </div>

        <div className="image-cropper-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn-save" 
            onClick={handleCropSave}
            disabled={isProcessing || !croppedAreaPixels}
          >
            {isProcessing ? 'Processing...' : 'Crop & Save'}
            <Crop size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;