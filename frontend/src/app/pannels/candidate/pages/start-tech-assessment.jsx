import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaClock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { api } from "../../../../utils/api";
import TermsModal from "../components/TermsModal";
import ViolationModal from "../components/ViolationModal";
import AssessmentTerminated from "../components/AssessmentTerminated";
import { usePopupNotification } from "../../../../hooks/usePopupNotification";
import PopupNotification from "../../../../components/PopupNotification";

const ASSESSMENT_SESSION_KEY = 'candidateCurrentAssessment';
const ASSESSMENT_ATTEMPT_KEY = 'candidateCurrentAssessmentAttempt';

const StartAssessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState = location.state || {};
    const { popup, showSuccess, hidePopup } = usePopupNotification();

    const getSessionInfo = () => {
        const params = new URLSearchParams(location.search);
        let stored = {};
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                stored = JSON.parse(window.sessionStorage.getItem(ASSESSMENT_SESSION_KEY) || '{}');
            } catch (err) {
                stored = {};
            }
        }
        return {
            assessmentId: navigationState.assessmentId || params.get('assessmentId') || stored.assessmentId || null,
            jobId: navigationState.jobId || params.get('jobId') || stored.jobId || null,
            applicationId: navigationState.applicationId || params.get('applicationId') || stored.applicationId || null
        };
    };

    const [sessionInfo, setSessionInfo] = useState(getSessionInfo);
    const { assessmentId, jobId, applicationId } = sessionInfo;

    // Assessment state
    const [assessment, setAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        setSessionInfo(getSessionInfo());
    }, [location.search, location.state]);

    useEffect(() => {
        if (assessmentId && jobId && applicationId && typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.setItem(ASSESSMENT_SESSION_KEY, JSON.stringify({ assessmentId, jobId, applicationId }));
            } catch (err) {}
        }
    }, [assessmentId, jobId, applicationId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                const savedAttemptId = window.sessionStorage.getItem(ASSESSMENT_ATTEMPT_KEY);
                if (savedAttemptId) {
                    setAttemptId(savedAttemptId);
                }
            } catch (err) {}
        }
    }, []);

    const clearStoredAssessment = useCallback(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.removeItem(ASSESSMENT_SESSION_KEY);
                window.sessionStorage.removeItem(ASSESSMENT_ATTEMPT_KEY);
            } catch (err) {}
        }
        setAttemptId(null);
    }, []);

    // Security and modal state
    const [assessmentState, setAssessmentState] = useState('not_started'); // not_started, terms_pending, in_progress, terminated, completed
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [currentViolation, setCurrentViolation] = useState(null);
    const [isTerminated, setIsTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState(null);
    const [terminationTimestamp, setTerminationTimestamp] = useState(null);

    // Refs for event listeners
    const assessmentContainerRef = useRef(null);
    const visibilityChangeListener = useRef(null);
    const blurListener = useRef(null);
    const focusListener = useRef(null);
    const contextMenuListener = useRef(null);
    const copyListener = useRef(null);
    const pasteListener = useRef(null);
    const saveTimeoutRef = useRef(null);
    
    // Webcam capture refs and state
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [captureCount, setCaptureCount] = useState(0);
    const [webcamStatus, setWebcamStatus] = useState('initializing'); // initializing, active, failed, disabled
    const webcamInitialized = useRef(false);
    const capturesStarted = useRef(false);
    const captureIntervalRef = useRef(null);

    // Violation detection functions
    const logViolation = useCallback(async (violationType, details = '') => {
        if (!attemptId || assessmentState !== 'in_progress') return;

        try {
            const timestamp = new Date().toISOString();
            const response = await api.logAssessmentViolation({
                attemptId,
                violationType,
                timestamp,
                details
            });

            if (response.success) {
                console.log('Violation logged successfully:', violationType);
            }
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    }, [attemptId, assessmentState]);

    const handleVisibilityChange = useCallback(() => {
        if (document.hidden && assessmentState === 'in_progress') {
            console.log('Tab switch detected!');
            logViolation('tab_switch', 'User switched browser tabs');
        }
    }, [assessmentState, logViolation]);

    const handleWindowBlur = useCallback(() => {
        if (assessmentState === 'in_progress') {
            console.log('Window blur detected!');
            logViolation('window_blur', 'Browser window lost focus');
        }
    }, [assessmentState, logViolation]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        if (assessmentState === 'in_progress') {
            logViolation('right_click', 'Right-click attempted');
            setCurrentViolation({
                type: 'right_click',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handleCopy = useCallback((e) => {
        if (assessmentState === 'in_progress') {
            e.preventDefault();
            logViolation('copy_attempt', 'Copy action attempted');
            setCurrentViolation({
                type: 'copy_attempt',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);

    const handlePaste = useCallback((e) => {
        if (assessmentState === 'in_progress') {
            e.preventDefault();
            logViolation('copy_attempt', 'Paste action attempted');
            setCurrentViolation({
                type: 'copy_attempt',
                timestamp: new Date()
            });
            setShowViolationModal(true);
        }
    }, [assessmentState, logViolation]);
    
    // Webcam capture functions
    const initWebcam = useCallback(async () => {
        console.log('🎥 Initializing webcam...');
        
        try {
            console.log('🎥 Initializing webcam silently...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('⚠️ getUserMedia not supported, continuing without capture');
                setWebcamStatus('failed');
                return;
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { min: 320, ideal: 640, max: 1280 }, 
                    height: { min: 240, ideal: 480, max: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: false
            });
            
            console.log('📹 Media stream obtained:', {
                active: stream.active,
                videoTracks: stream.getVideoTracks().length
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                
                const playVideo = async () => {
                    try {
                        await videoRef.current.play();
                        console.log('✅ Video playing successfully');
                        setWebcamStatus('active');
                    } catch (playError) {
                        console.error('🎥 Video play error:', playError);
                        setWebcamStatus('failed');
                    }
                };
                
                videoRef.current.onloadedmetadata = () => {
                    console.log('📹 Video metadata loaded:', {
                        videoWidth: videoRef.current.videoWidth,
                        videoHeight: videoRef.current.videoHeight,
                        readyState: videoRef.current.readyState
                    });
                    playVideo();
                };
                
                videoRef.current.oncanplay = () => {
                    console.log('📹 Video can play');
                    if (videoRef.current.paused) {
                        playVideo();
                    }
                };
                
                videoRef.current.onerror = (error) => {
                    console.error('📹 Video element error:', error);
                    setWebcamStatus('failed');
                };
                
                // If metadata is already loaded, play immediately
                if (videoRef.current.readyState >= 1) {
                    playVideo();
                }
            }
        } catch (error) {
            console.warn('⚠️ Webcam initialization failed:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint
            });
            
            // Provide user-friendly error messages
            if (error.name === 'NotAllowedError') {
                console.log('🚫 Camera access denied by user');
            } else if (error.name === 'NotFoundError') {
                console.log('📷 No camera device found');
            } else if (error.name === 'NotReadableError') {
                console.log('🔒 Camera is being used by another application');
            }
            
            // Continue assessment without webcam if not available
            setWebcamStatus('failed');
            webcamInitialized.current = false;
        }
    }, []);
    
    const captureImage = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !attemptId || captureCount >= 5) {
            console.log('🚫 Capture skipped:', {
                hasVideo: !!videoRef.current,
                hasCanvas: !!canvasRef.current,
                hasAttemptId: !!attemptId,
                captureCount,
                maxReached: captureCount >= 5
            });
            return;
        }
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn('⚠️ Video not ready, retrying...', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState
            });
            setTimeout(() => captureImage(), 2000);
            return;
        }
        
        try {
            // Wait a moment for video to be fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Check if video is actually playing
            const videoTracks = video.srcObject?.getVideoTracks();
            const hasActiveTrack = videoTracks && videoTracks.length > 0 && videoTracks[0].readyState === 'live';
            
            if (video.paused || video.ended || !hasActiveTrack) {
                console.warn('⚠️ Video not ready for capture:', {
                    paused: video.paused,
                    ended: video.ended,
                    hasActiveTrack,
                    trackState: videoTracks?.[0]?.readyState
                });
                return;
            }
            
            ctx.drawImage(video, 0, 0);
            
            console.log(`📸 Capturing image ${captureCount + 1}/5`, {
                videoSize: `${video.videoWidth}x${video.videoHeight}`,
                canvasSize: `${canvas.width}x${canvas.height}`
            });
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error('❌ Failed to create blob from canvas');
                    return;
                }
                
                // Check if blob is too small (likely corrupted/black image)
                if (blob.size < 1000) {
                    console.warn('⚠️ Blob size very small, image might be black:', blob.size);
                }
                
                console.log('📦 Blob created:', {
                    size: blob.size,
                    type: blob.type
                });
                
                try {
                    const token = localStorage.getItem('candidateToken');
                    if (!token) {
                        console.error('❌ No auth token found');
                        return;
                    }
                    
                    const formData = new FormData();
                    formData.append('capture', blob, `capture_${Date.now()}.jpg`);
                    formData.append('attemptId', attemptId);
                    formData.append('captureIndex', captureCount.toString());
                    
                    console.log('📤 Uploading capture...', {
                        attemptId,
                        captureIndex: captureCount,
                        blobSize: blob.size,
                        hasAttemptId: !!attemptId,
                        attemptIdLength: attemptId?.length
                    });
                    
                    // Use backend URL
                    const response = await axios.post('http://localhost:5000/api/candidate/assessments/capture', formData, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 30000 // 30 second timeout
                    });
                    
                    console.log('📡 Upload response:', response.data);
                    
                    if (response.data.success) {
                        console.log(`✅ Capture uploaded successfully:`, response.data);
                        // Use backend's capture count to stay in sync
                        const backendCount = response.data.captureCount || 0;
                        setCaptureCount(backendCount);
                        console.log(`📊 Capture count synced with backend: ${backendCount}`);
                    } else {
                        console.error('❌ Upload failed:', response.data.message);
                    }
                } catch (error) {
                    console.error('❌ Capture upload failed:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        fullError: error.response
                    });
                    
                    // Log the specific backend error message
                    if (error.response?.data?.message) {
                        console.error('📝 Backend error:', error.response.data.message);
                    }
                    
                    // Don't increment capture count on failure, but continue with assessment
                    if (error.response?.status === 401) {
                        console.error('🔐 Authentication failed - token may be expired');
                    }
                }
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('❌ Capture error:', {
                message: error.message,
                stack: error.stack
            });
        }
    }, [attemptId]);

    const startPeriodicCapture = useCallback(() => {
        if (!assessment || webcamStatus !== 'active' || captureIntervalRef.current) {
            console.log('🚫 Periodic capture not started:', {
                hasAssessment: !!assessment,
                webcamStatus,
                alreadyRunning: !!captureIntervalRef.current
            });
            return;
        }
        
        const interval = 300000; // 5 minutes = 300,000 milliseconds
        
        console.log(`⏰ Starting captures every ${interval/1000} seconds`, {
            interval: interval/1000,
            webcamStatus
        });
        
        // First capture after 2 seconds
        setTimeout(() => captureImage(), 2000);
        
        let count = 1;
        captureIntervalRef.current = setInterval(() => {
            if (count < 5) {
                captureImage();
                count++;
            } else {
                console.log('✅ All captures completed');
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        }, interval);
    }, [assessment, webcamStatus]);

    // Security listeners management
    const addSecurityListeners = useCallback(() => {
        if (assessmentState !== 'in_progress') return;

        // Tab/window visibility change
        visibilityChangeListener.current = handleVisibilityChange;
        document.addEventListener('visibilitychange', visibilityChangeListener.current);

        // Window blur/focus
        blurListener.current = handleWindowBlur;
        window.addEventListener('blur', blurListener.current);

        // Right-click prevention
        contextMenuListener.current = handleContextMenu;
        document.addEventListener('contextmenu', contextMenuListener.current);

        // Copy-paste prevention
        copyListener.current = handleCopy;
        document.addEventListener('copy', copyListener.current);

        pasteListener.current = handlePaste;
        document.addEventListener('paste', pasteListener.current);
    }, [assessmentState, handleVisibilityChange, handleWindowBlur, handleContextMenu, handleCopy, handlePaste]);

    const removeSecurityListeners = useCallback(() => {
        if (visibilityChangeListener.current) {
            document.removeEventListener('visibilitychange', visibilityChangeListener.current);
        }
        if (blurListener.current) {
            window.removeEventListener('blur', blurListener.current);
        }
        if (contextMenuListener.current) {
            document.removeEventListener('contextmenu', contextMenuListener.current);
        }
        if (copyListener.current) {
            document.removeEventListener('copy', copyListener.current);
        }
        if (pasteListener.current) {
            document.removeEventListener('paste', pasteListener.current);
        }
    }, []);

	useEffect(() => {
		if (!assessmentId || !jobId || !applicationId) {
			setError("Missing assessment information. Please go back and try again.");
			clearStoredAssessment();
			setLoading(false);
			return;
		}

		fetchAssessment();
	}, [assessmentId, jobId, applicationId]);



	// Add security listeners when assessment starts
	useEffect(() => {
		if (assessmentState === 'in_progress') {
			addSecurityListeners();
			// Initialize webcam immediately
			initWebcam();
		} else {
			removeSecurityListeners();
			// Stop webcam when assessment ends
			if (videoRef.current && videoRef.current.srcObject) {
				videoRef.current.srcObject.getTracks().forEach(track => track.stop());
				setWebcamStatus('disabled');
			}
			if (captureIntervalRef.current) {
				clearInterval(captureIntervalRef.current);
				captureIntervalRef.current = null;
			}
		}

		return () => {
			removeSecurityListeners();
			if (videoRef.current && videoRef.current.srcObject) {
				videoRef.current.srcObject.getTracks().forEach(track => track.stop());
				setWebcamStatus('disabled');
			}
		};
	}, [assessmentState, addSecurityListeners, removeSecurityListeners, initWebcam]);

	// Start captures when both webcam is active and assessment is loaded
	useEffect(() => {
		if (webcamStatus === 'active' && assessment && assessmentState === 'in_progress' && !capturesStarted.current) {
			console.log('🚀 Starting periodic capture - conditions met');
			capturesStarted.current = true;
			setTimeout(() => startPeriodicCapture(), 2000);
		}
	}, [webcamStatus, assessment, assessmentState, startPeriodicCapture]);



	// Timer effect with violation logging for time expiration
	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted && assessmentState === 'in_progress') {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						handleTimeExpired();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft, isSubmitted, assessmentState]);

	const fetchAssessment = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch assessment questions first (without starting attempt)
			const assessmentResponse = await api.getAssessmentForCandidate(assessmentId);
			if (assessmentResponse.success) {
				const assessmentData = assessmentResponse.assessment;
				setAssessment(assessmentData);
				setAnswers(new Array(assessmentData.questions.length).fill(null));
				setAssessmentState('terms_pending');
				setShowTermsModal(true);
			} else {
				setError("Failed to load assessment questions");
			}
		} catch (err) {
			console.error("Error fetching assessment:", err);
			setError("Failed to load assessment. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleTermsAccept = async () => {
		try {
			setShowTermsModal(false);

			const startResponse = await api.startAssessment({
				assessmentId,
				jobId,
				applicationId
			});

			if (startResponse.success && startResponse.attempt && startResponse.attempt._id) {
				setAttemptId(startResponse.attempt._id);
				if (typeof window !== 'undefined' && window.sessionStorage) {
					try {
						window.sessionStorage.setItem(ASSESSMENT_ATTEMPT_KEY, startResponse.attempt._id);
					} catch (err) {}
				}
				setStartTime(new Date());
				const timerSeconds = Number(assessment?.timer || 0) * 60;
				setTimeLeft(timerSeconds);
				setAssessmentState('in_progress');
				setError(null);
			} else {
				setError(startResponse.message || "Failed to start assessment. No attempt ID received.");
				setShowTermsModal(true);
				setAssessmentState('terms_pending');
			}
		} catch (err) {
			console.error("Error starting assessment:", err);
			setError("Failed to start assessment. Please try again.");
			setShowTermsModal(true);
			setAssessmentState('terms_pending');
		}
	};

	const handleTermsDecline = () => {
		setShowTermsModal(false);
		clearStoredAssessment();
		navigate(-1);
	};

	const handleViolationAcknowledge = () => {
		setShowViolationModal(false);
		// Assessment is already terminated, component will show termination screen
	};

	const handleTimeExpired = async () => {
		if (!isSubmitted) {
			setIsSubmitted(true);
			await logViolation('time_expired', 'Assessment time expired');
			const success = await submitAssessment();
			if (!success) {
				setIsSubmitted(false);
			}
		}
	};

	const submitAssessment = async () => {
		if (!attemptId) {
			setError("Assessment session not started. Please restart the assessment.");
			setShowTermsModal(true);
			setAssessmentState('terms_pending');
			return false;
		}
		
		try {
			const submitResponse = await api.submitAssessment(attemptId, []);
			if (submitResponse.success) {
				setAssessmentState('completed');
				removeSecurityListeners();
				clearStoredAssessment();
				
				// Show success message
				showSuccess('Assessment submitted successfully! Redirecting to results...');
				
				// Redirect after 2 seconds
				setTimeout(() => {
					navigate(`/candidate/assessment-result/${applicationId}`, {
						state: {
							result: submitResponse.result,
							assessment: assessment
						},
					});
				}, 2000);
				
				return true;
			}
			setError(submitResponse.message || "Failed to submit assessment");
			return false;
		} catch (err) {
			console.error("Error submitting assessment:", err);
			setError(err.message || "Failed to submit assessment");
			return false;
		}
	};

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};

	const handleOptionChange = async (option) => {
		if (isSubmitted) return;
		if (!attemptId) return;

		const updated = [...answers];
		updated[currentQuestionIndex] = option;
		setAnswers(updated);

		try {
			await api.submitAnswer(attemptId, currentQuestionIndex, option, null, 0);
		} catch (err) {
			console.error("Error submitting answer:", err);
			if (err.message.includes('404') || err.message.includes('not found')) {
				setError("Assessment session expired. Please restart the assessment.");
			}
		}
	};

	const handleTextAnswerChange = (text) => {
		if (isSubmitted) return;
		if (!attemptId) return;

		const updated = [...answers];
		updated[currentQuestionIndex] = text;
		setAnswers(updated);

		// Clear existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Debounce save - wait 500ms after user stops typing
		saveTimeoutRef.current = setTimeout(async () => {
			try {
				console.log('Saving subjective answer:', { attemptId, questionIndex: currentQuestionIndex, textLength: text?.length });
				await api.submitAnswer(attemptId, currentQuestionIndex, null, text, 0);
			} catch (err) {
				console.error("Error submitting answer:", err);
				if (err.message.includes('404') || err.message.includes('not found')) {
					setError("Assessment session expired. Please restart the assessment.");
				}
			}
		}, 500);
	};

	const handleSubmit = async () => {
		if (isSubmitted) return;
		
		setIsSubmitted(true);
		const success = await submitAssessment();
		if (!success) {
			setIsSubmitted(false);
		}
	};

	if (loading) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", marginBottom: "20px" }}>Loading Assessment...</div>
				<div style={{ fontSize: "16px", color: "#666" }}>Please wait while we prepare your assessment.</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", color: "#e74c3c", marginBottom: "20px" }}>Error</div>
				<div style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>{error}</div>
				<button
					onClick={() => navigate("/candidate/status")}
					style={{
						background: "#3498db",
						color: "#fff",
						border: "none",
						padding: "10px 20px",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Back to Status
				</button>
			</div>
		);
	}

	if (assessmentState === 'terminated') {
		return (
			<AssessmentTerminated
				violationType={terminationReason}
				violationTimestamp={terminationTimestamp}
				assessmentTitle={assessment?.title}
			/>
		);
	}

	if (!assessment) {
		return (
			<div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
				<div style={{ fontSize: "18px", color: "#e74c3c" }}>Assessment Not Found</div>
			</div>
		);
	}

	const question = assessment.questions[currentQuestionIndex];

	return (
		<>
			{/* Webcam elements for capture - visible for testing */}
			<video 
				ref={videoRef} 
				style={{
					position: 'fixed', 
					top: '10px', 
					right: '10px', 
					width: '200px', 
					height: '150px', 
					border: '2px solid #ff6b35', 
					zIndex: '9999',
					borderRadius: '8px',
					backgroundColor: '#000'
				}} 
				autoPlay 
				playsInline 
				muted
				onLoadedData={() => console.log('📹 Video loaded data')}
				onCanPlay={() => console.log('📹 Video can play')}
			/>
			<canvas ref={canvasRef} style={{display: 'none'}} />
			{webcamStatus && (
				<div style={{
					position: 'fixed',
					top: '170px',
					right: '10px',
					background: webcamStatus === 'active' ? '#4CAF50' : webcamStatus === 'failed' ? '#f44336' : '#ff9800',
					color: 'white',
					padding: '4px 8px',
					borderRadius: '4px',
					fontSize: '12px',
					zIndex: '9999'
				}}>
					📹 {webcamStatus} ({captureCount}/5)
				</div>
			)}
			
			<PopupNotification
				show={popup.show}
				message={popup.message}
				type={popup.type}
				onClose={hidePopup}
			/>
			<TermsModal
				isOpen={showTermsModal}
				onAccept={handleTermsAccept}
				onDecline={handleTermsDecline}
				assessment={assessment}
			/>
			<ViolationModal
				isOpen={showViolationModal}
				violationType={currentViolation?.type}
				timestamp={currentViolation?.timestamp}
				onAcknowledge={handleViolationAcknowledge}
			/>
			<div
				ref={assessmentContainerRef}
				style={{
					padding: "20px",
					fontFamily: "Arial, sans-serif",
					backgroundColor: "#f5f6fa",
					minHeight: "100vh",
				}}
			>
				<div style={{ maxWidth: "900px", margin: "0 auto" }}>
				{/* Title Bar */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
						marginBottom: "15px",
					}}
				>
					<h2 style={{ margin: "0", fontSize: "20px", fontWeight: "bold" }}>
						{assessment.title}
					</h2>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "10px",
							alignItems: "center",
						}}
					>
						<div style={{ fontSize: "14px", color: "#555" }}>
							Progress:{" "}
							{Math.round(
								((currentQuestionIndex + 1) / assessment.questions.length) * 100
							)}
							% complete
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								fontWeight: "bold",
								color: "#e74c3c",
							}}
						>
							<FaClock style={{ marginRight: "5px" }} />
							{formatTime(timeLeft)}
						</div>
					</div>
					{/* Progress Bar */}
					<div
						style={{
							height: "6px",
							background: "#e0e0e0",
							borderRadius: "3px",
							marginTop: "10px",
						}}
					>
						<div
							style={{
								width: `${
									((currentQuestionIndex + 1) / assessment.questions.length) *
									100
								}%`,
								height: "100%",
								background: "#2c3e50",
								borderRadius: "3px",
							}}
						></div>
					</div>
				</div>

				{/* Question Card */}
				<div
					style={{
						background: "#fff",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
					}}
				>
					<div
						style={{
							marginBottom: "10px",
							fontSize: "16px",
							fontWeight: "bold",
						}}
					>
						{currentQuestionIndex + 1}. {question.question.replace(/<[^>]*>/g, '')}
					</div>
					{question.imageUrl && (
						<div style={{ marginBottom: "15px", textAlign: "center" }}>
							<img 
								src={question.imageUrl} 
								alt="Question illustration" 
								style={{
									maxWidth: "100%",
									maxHeight: "400px",
									borderRadius: "8px",
									border: "1px solid #e0e0e0",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
								}}
							/>
						</div>
					)}
					<div style={{ display: "flex", flexDirection: "column" }}>
						{question.type === 'subjective' ? (
							<textarea
								style={{
									width: "100%",
									minHeight: "200px",
									padding: "12px",
									border: "1px solid #ccc",
									borderRadius: "5px",
									fontSize: "14px",
									fontFamily: "Arial, sans-serif",
									resize: "vertical"
								}}
								placeholder="Type your answer here..."
								value={answers[currentQuestionIndex] || ''}
								onChange={(e) => handleTextAnswerChange(e.target.value)}
								disabled={isSubmitted}
							/>
						) : question.options && question.options.length > 0 ? (
							question.options.map((option, idx) => (
								<label
									key={idx}
									style={{
										border:
											answers[currentQuestionIndex] === idx
												? "2px solid #3498db"
												: "1px solid #ccc",
										borderRadius: "5px",
										padding: "10px",
										marginBottom: "8px",
										cursor: isSubmitted ? "not-allowed" : "pointer",
										backgroundColor:
											answers[currentQuestionIndex] === idx
												? "#ecf6fd"
												: "#fff",
										display: "flex",
										alignItems: "flex-start",
									}}
								>
									<input
										type="radio"
										name={`q-${currentQuestionIndex}`}
										value={idx}
										checked={answers[currentQuestionIndex] === idx}
										onChange={() => handleOptionChange(idx)}
										disabled={isSubmitted}
										style={{ marginRight: "10px", marginTop: "2px" }}
									/>
									<div style={{ flex: 1 }}>
										<div>{String.fromCharCode(65 + idx)}.{question.type !== 'questionary-image-mcq' && ` ${option}`}</div>
										{(question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') && question.optionImages && question.optionImages[idx] && (
											<div style={{ marginTop: "8px" }}>
												<img 
													src={question.optionImages[idx]} 
													alt={`Option ${String.fromCharCode(65 + idx)}`} 
													style={{
														maxWidth: "200px", 
														maxHeight: "150px", 
														borderRadius: "4px", 
														border: "1px solid #ddd"
													}} 
												/>
											</div>
										)}
									</div>
								</label>
							))
						) : (
							<textarea
								style={{
									width: "100%",
									minHeight: "200px",
									padding: "12px",
									border: "1px solid #ccc",
									borderRadius: "5px",
									fontSize: "14px",
									fontFamily: "Arial, sans-serif",
									resize: "vertical"
								}}
								placeholder="Type your answer here..."
								value={answers[currentQuestionIndex] || ''}
								onChange={(e) => handleTextAnswerChange(e.target.value)}
								disabled={isSubmitted}
							/>
						)}
					</div>

					{/* Navigation */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginTop: "20px",
							alignItems: "center",
						}}
					>
						{/* Left side - Previous button */}
						<button
							onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
							disabled={currentQuestionIndex === 0 || isSubmitted}
							style={{
								background: "transparent",
								border: "1px solid #ccc",
								padding: "8px 15px",
								borderRadius: "5px",
								cursor:
									currentQuestionIndex === 0 || isSubmitted
										? "not-allowed"
										: "pointer",
							}}
						>
							← Previous
						</button>

						{/* Center - Question Navigator */}
						<div style={{ display: "flex", gap: "5px" }}>
							{assessment.questions.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setCurrentQuestionIndex(idx)}
									disabled={isSubmitted}
									style={{
										padding: "5px 10px",
										borderRadius: "4px",
										border:
											idx === currentQuestionIndex ? "none" : "1px solid #ccc",
										background:
											idx === currentQuestionIndex ? "#3498db" : "#fff",
										color: idx === currentQuestionIndex ? "#fff" : "#000",
										cursor: isSubmitted ? "not-allowed" : "pointer",
									}}
								>
									{idx + 1}
								</button>
							))}
						</div>

						{/* Right side - Next/Submit buttons */}
						<div style={{ display: "flex", gap: "10px" }}>
							{currentQuestionIndex < assessment.questions.length - 1 ? (
								<button
									onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
									disabled={isSubmitted}
									style={{
										background: "#3498db",
										color: "#fff",
										border: "none",
										padding: "8px 15px",
										borderRadius: "5px",
										cursor: isSubmitted ? "not-allowed" : "pointer",
									}}
								>
									Next →
								</button>
							) : (
								<button
									onClick={handleSubmit}
									disabled={isSubmitted}
									style={{
										background: "#2ecc71",
										color: "#fff",
										border: "none",
										padding: "8px 15px",
										borderRadius: "5px",
										cursor: isSubmitted ? "not-allowed" : "pointer",
									}}
								>
									Submit Assessment
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
);
};

export default StartAssessment;
