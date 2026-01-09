import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePopupNotification } from '../../../../hooks/usePopupNotification';
import PopupNotification from '../../../../components/PopupNotification';

export default function AssessmentQuiz({ assessment, attemptId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(assessment.timer * 60);
  const [violations, setViolations] = useState([]);
  const [startTime] = useState(Date.now());
  const { popup, showSuccess, hidePopup } = usePopupNotification();
  const [captureCount, setCaptureCount] = useState(0);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    console.log('🎬 Assessment Quiz mounted, initializing webcam...');
    initWebcam();
    return () => {
      console.log('🛑 Assessment Quiz unmounting, stopping webcam...');
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      // Clear capture interval
      if (window.captureInterval) {
        clearInterval(window.captureInterval);
      }
    };
  }, []);

  const initWebcam = async () => {
    try {
      console.log('🎥 Requesting webcam access...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ getUserMedia not supported');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      console.log('✅ Webcam access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          console.log('⏰ Starting captures in 3 seconds...');
          setTimeout(() => {
            startPeriodicCapture();
          }, 3000);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('📹 Video can play');
        };
        
        await videoRef.current.play();
        console.log('▶️ Video playing');
      } else {
        console.error('❌ Video ref not available');
      }
    } catch (error) {
      console.error('❌ Webcam initialization failed:', error);
      if (error.name === 'NotAllowedError') {
        console.error('❌ Camera permission denied by user');
      } else if (error.name === 'NotFoundError') {
        console.error('❌ No camera found');
      }
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn('⚠️ Video or canvas ref not available');
      return;
    }
    
    if (captureCount >= 5) {
      console.log('✅ Already captured 5 images');
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('⚠️ Video not ready yet, retrying in 2 seconds');
      setTimeout(() => captureImage(), 2000);
      return;
    }
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      console.log(`📸 Capturing image ${captureCount + 1}/5 (${video.videoWidth}x${video.videoHeight})`);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ Failed to create blob from canvas');
          return;
        }
        
        try {
          const token = localStorage.getItem('candidateToken');
          if (!token) {
            console.error('❌ No auth token found');
            return;
          }
          
          const formData = new FormData();
          formData.append('capture', blob, `capture_${Date.now()}.jpg`);
          formData.append('attemptId', attemptId);
          formData.append('captureIndex', captureCount);
          
          console.log(`📤 Uploading capture ${captureCount + 1}... (${(blob.size/1024).toFixed(2)}KB)`);
          
          const response = await axios.post('/api/candidate/assessments/capture', formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 10000
          });
          
          if (response.data.success) {
            console.log(`✅ Capture ${captureCount + 1} uploaded successfully:`, response.data.capturePath);
            setCaptureCount(prev => prev + 1);
          } else {
            console.error('❌ Upload failed:', response.data.message);
          }
        } catch (error) {
          console.error('❌ Capture upload failed:', error.response?.data || error.message);
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('❌ Error in captureImage:', error);
    }
  };

  const startPeriodicCapture = () => {
    const captureInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    console.log(`⏰ Starting periodic capture every 5 minutes`);
    console.log(`   - Assessment time: ${assessment.timer} minutes`);
    console.log(`   - Capture interval: 5 minutes`);
    
    // Take first capture after 30 seconds to allow user to settle
    setTimeout(() => {
      console.log('📸 Taking first capture...');
      captureImage();
    }, 30000);
    
    // Then capture every 5 minutes
    const interval = setInterval(() => {
      console.log(`📸 Taking periodic capture...`);
      captureImage();
    }, captureInterval);
    
    // Store interval ID for cleanup
    window.captureInterval = interval;
    
    // Cleanup on component unmount
    return () => {
      if (window.captureInterval) {
        clearInterval(window.captureInterval);
      }
    };
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('window_minimize');
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        recordViolation('copy_paste');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('right_click');
    };

    const handleBlur = () => {
      recordViolation('tab_switch');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          alert('⏰ Scheduled Time Expired! Your assessment has been submitted automatically.');
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const recordViolation = (type) => {
    const violation = {
      type,
      timestamp: new Date(),
      details: `Violation at question ${currentQuestion + 1}`
    };
    setViolations(prev => [...prev, violation]);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const question = assessment.questions[currentQuestion];
    
    if (question.type === 'image') {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedImageTypes.includes(file.type)) {
        alert('Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Maximum 5MB allowed');
        return;
      }
    } else {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum 10MB allowed');
        return;
      }
    }
    
    setUploading(true);
    try {
      const token = localStorage.getItem('candidateToken');
      const formData = new FormData();
      formData.append('answerFile', file);
      formData.append('attemptId', attemptId);
      formData.append('questionIndex', currentQuestion);
      formData.append('timeSpent', Date.now() - startTime);
      
      const response = await axios.post('/api/candidate/assessments/upload-answer', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setUploadedFile(response.data.uploadedFile);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    const question = assessment.questions[currentQuestion];
    
    // Validate answers before proceeding
    if (question.type === 'mcq' && selectedAnswer === null) {
      alert('Please select an answer before proceeding to the next question.');
      return;
    }
    
    if (question.type === 'subjective') {
      if (!textAnswer.trim() && !uploadedFile) {
        alert('Please provide a written answer or upload a file before proceeding.');
        return;
      }
    }
    
    if (question.type === 'upload' || question.type === 'image') {
      if (!uploadedFile) {
        alert('Please upload a file before proceeding to the next question.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('candidateToken');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }
      
      if (question.type !== 'upload') {
        const response = await axios.post('/api/candidate/assessments/answer', {
          attemptId,
          questionIndex: currentQuestion,
          selectedAnswer: question.type === 'mcq' ? selectedAnswer : null,
          textAnswer: question.type === 'subjective' ? textAnswer : null,
          timeSpent: Date.now() - startTime
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000 // 15 second timeout
        });
        
        if (!response.data.success) {
          console.error('Failed to save answer:', response.data.message);
          alert(`Failed to save answer: ${response.data.message}. Please try again.`);
          return;
        }
      }

      // Move to next question
      if (currentQuestion < assessment.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTextAnswer('');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      let errorMessage = 'Failed to save answer. ';
      
      if (error.response) {
        errorMessage += error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage + ' Please try again.');
    }
  };

  const handleSubmit = async () => {
    const question = assessment.questions[currentQuestion];
    
    // Submit current answer if provided
    if ((question.type === 'mcq' && selectedAnswer !== null) ||
        (question.type === 'subjective' && textAnswer.trim()) ||
        (question.type === 'upload' && uploadedFile)) {
      try {
        const token = localStorage.getItem('candidateToken');
        
        if (question.type !== 'upload') {
          const answerResponse = await axios.post('/api/candidate/assessments/answer', {
            attemptId,
            questionIndex: currentQuestion,
            selectedAnswer: question.type === 'mcq' ? selectedAnswer : null,
            textAnswer: question.type === 'subjective' ? textAnswer : null,
            timeSpent: Date.now() - startTime
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!answerResponse.data.success) {
            console.error('Failed to save final answer:', answerResponse.data.message);
          }
        }
      } catch (error) {
        console.error('Error submitting final answer:', error);
        // Continue with submission even if final answer fails
      }
    }
    
    // Submit assessment
    try {
      const token = localStorage.getItem('candidateToken');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }
      
      if (!attemptId) {
        alert('Assessment attempt ID not found. Please restart the assessment.');
        return;
      }
      
      const response = await axios.post('/api/candidate/assessments/submit', {
        attemptId,
        violations: violations || []
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        console.log('Assessment submitted successfully:', response.data);
        showSuccess('Assessment submitted successfully! Redirecting...');
        setTimeout(() => {
          onComplete(response.data.result);
        }, 2000);
      } else {
        console.error('Assessment submission failed:', response.data.message);
        alert(`Failed to submit assessment: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      
      let errorMessage = 'Failed to submit assessment. ';
      
      if (error.response) {
        // Server responded with error status
        errorMessage += error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage + ' Please try again or contact support if the problem persists.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = assessment.questions[currentQuestion];

  return (
    <>
      {/* Debug: Show video for testing - remove display:none to see webcam */}
      <video ref={videoRef} style={{display: 'none', position: 'fixed', top: '10px', right: '10px', width: '200px', zIndex: 9999}} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{display: 'none'}} />
      <PopupNotification
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={hidePopup}
      />
      <div className="mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              {assessment.title}{assessment.jobTitle && ` - ${assessment.jobTitle}`}
            </h5>
            <small className="text-muted">Question {currentQuestion + 1} of {assessment.questions.length}</small>
          </div>
          <div className={`badge ${timeRemaining < 300 ? 'bg-danger' : 'bg-primary'} fs-6`}>
            <i className="fa fa-clock me-2"></i>
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="card-body">
          <h6 className="mb-4">Q{currentQuestion + 1}. <span dangerouslySetInnerHTML={{ __html: question.question }} /></h6>
          {question.imageUrl && (
            <div className="mb-3">
              <img src={question.imageUrl} alt="Question" style={{maxWidth: '100%', maxHeight: '400px', borderRadius: '8px'}} />
            </div>
          )}
          
          {question.type === 'mcq' && (
            <div className="options">
              {question.options.map((option, index) => (
                <div key={index} className="form-check mb-3 p-3 border rounded" style={{cursor: 'pointer'}}
                  onClick={() => setSelectedAnswer(index)}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer"
                    id={`option-${index}`}
                    checked={selectedAnswer === index}
                    onChange={() => setSelectedAnswer(index)}
                  />
                  <label className="form-check-label w-100" htmlFor={`option-${index}`} style={{cursor: 'pointer'}}>
                    {String.fromCharCode(65 + index)}. {option}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'subjective' && (
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="6"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />
              <small className="text-muted d-block mb-3">Provide a detailed written answer to the question above.</small>
              
              <div className="border rounded p-3 bg-light">
                <label className="form-label fw-semibold">📎 Optional: Upload supporting files (diagrams, images, etc.)</label>
                {!uploadedFile ? (
                  <>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={uploading}
                    />
                    <small className="text-muted d-block mt-2">
                      Accepted: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </small>
                    {uploading && (
                      <div className="mt-2">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-success mb-0">
                    <i className="fa fa-check-circle me-2"></i>
                    File uploaded: {uploadedFile.originalName}
                    <button 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => setUploadedFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {question.type === 'upload' && (
            <div className="mb-3">
              <div className="border rounded p-4 text-center">
                {!uploadedFile ? (
                  <>
                    <input
                      type="file"
                      className="form-control mb-3"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={uploading}
                    />
                    <small className="text-muted d-block">
                      📎 Accepted file types: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </small>
                    {uploading && (
                      <div className="mt-2">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-success">
                    <i className="fa fa-check-circle me-2"></i>
                    File uploaded successfully: {uploadedFile.originalName}
                    <br />
                    <small>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {question.type === 'image' && (
            <div className="mb-3">
              <div className="border rounded p-4 text-center">
                {!uploadedFile ? (
                  <>
                    <input
                      type="file"
                      className="form-control mb-3"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={uploading}
                    />
                    <small className="text-muted d-block">
                      🖼️ Accepted image types: JPG, JPEG, PNG, GIF, WEBP (Max: 5MB)
                    </small>
                    {uploading && (
                      <div className="mt-2">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Uploading...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-success">
                    <i className="fa fa-check-circle me-2"></i>
                    Image uploaded successfully: {uploadedFile.originalName}
                    <br />
                    <small>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          {/* Debug capture button - remove in production */}
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              console.log('🧪 Manual capture test');
              captureImage();
            }}
            type="button"
          >
            🧪 Test Capture ({captureCount}/5)
          </button>
          
          <div>
            {currentQuestion === assessment.questions.length - 1 ? (
              <button 
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={uploading}
              >
                Submit Assessment
                <i className="fa fa-check ms-2"></i>
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleNext}
                disabled={
                  (question.type === 'mcq' && selectedAnswer === null) ||
                  (question.type === 'subjective' && !textAnswer.trim() && !uploadedFile) ||
                  (question.type === 'upload' && !uploadedFile) ||
                  uploading
                }
              >
                Next Question
                <i className="fa fa-arrow-right ms-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
