// Replace the webcam initialization and capture functions with this simplified version

const initWebcam = useCallback(async () => {
    if (webcamInitialized.current) return;
    
    try {
        webcamInitialized.current = true;
        console.log('🎥 Initializing webcam...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' },
            audio: false
        });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            
            await new Promise((resolve) => {
                videoRef.current.onloadedmetadata = resolve;
            });
            
            await videoRef.current.play();
            console.log('✅ Webcam ready');
            setWebcamStatus('active');
        }
    } catch (error) {
        console.error('❌ Webcam failed:', error.message);
        setWebcamStatus('failed');
        webcamInitialized.current = false;
    }
}, []);

const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !attemptId || webcamStatus !== 'active') {
        return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('⚠️ Video not ready');
        return;
    }
    
    try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        console.log('📸 Capturing image');
        
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            try {
                const token = localStorage.getItem('candidateToken');
                const formData = new FormData();
                formData.append('capture', blob, `capture_${Date.now()}.jpg`);
                formData.append('attemptId', attemptId);
                formData.append('captureIndex', captureCount.toString());
                
                const response = await axios.post('http://localhost:5000/api/candidate/assessments/capture', formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                if (response.data.success) {
                    console.log('✅ Capture uploaded');
                    setCaptureCount(response.data.captureCount || 0);
                }
            } catch (error) {
                console.error('❌ Upload failed:', error.response?.data?.message);
            }
        }, 'image/jpeg', 0.8);
    } catch (error) {
        console.error('❌ Capture error:', error.message);
    }
}, [attemptId, captureCount, webcamStatus]);

// And change the video element to:
<video 
    ref={videoRef} 
    style={{position: 'fixed', bottom: '10px', right: '10px', width: '160px', height: '120px', border: '2px solid red', zIndex: '9999'}} 
    autoPlay 
    playsInline 
    muted
/>