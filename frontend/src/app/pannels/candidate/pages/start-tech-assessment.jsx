import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaClock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { api } from "../../../../utils/api";
import { decodeAssessmentText } from "../../../../utils/assessmentContent";
import TermsModal from "../components/TermsModal";
import ViolationModal from "../components/ViolationModal";
import AssessmentTerminated from "../components/AssessmentTerminated";
import { usePopupNotification } from "../../../../hooks/usePopupNotification";
import PopupNotification from "../../../../components/PopupNotification";

const ASSESSMENT_SESSION_KEY = 'candidateCurrentAssessment';
const ASSESSMENT_ATTEMPT_KEY = 'candidateCurrentAssessmentAttempt';
const ASSESSMENT_PROGRESS_KEY = 'candidateCurrentAssessmentProgress';
const RESTRICTION_WARNING_LIMIT = 4;
const RESTRICTION_SUSPEND_THRESHOLD = 5;
const IMMEDIATE_RESTRICTION_TYPES = new Set(['screen_capture']);
const LOCKED_CAPTURE_KEYS = ['PrintScreen', 'MetaLeft', 'MetaRight'];
const CAMERA_START_REQUIRED_MESSAGE = 'Camera access is required before the assessment can begin.';
const CAMERA_RESUME_REQUIRED_MESSAGE = 'Camera access is required to continue this assessment.';
const CAMERA_HELP_MESSAGE = 'Allow camera access in your browser and close any other app that may be using the webcam.';

const getStoredAttemptId = () => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
        return null;
    }

    try {
        return window.sessionStorage.getItem(ASSESSMENT_ATTEMPT_KEY);
    } catch (err) {
        return null;
    }
};

const getStoredProgress = () => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
        return null;
    }

    try {
        return JSON.parse(window.sessionStorage.getItem(ASSESSMENT_PROGRESS_KEY) || 'null');
    } catch (err) {
        return null;
    }
};

const StartAssessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState = location.state || {};
    const { popup, showSuccess, showError, showWarning, hidePopup } = usePopupNotification();

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
    const [attemptId, setAttemptId] = useState(getStoredAttemptId);
    const [startTime, setStartTime] = useState(null);
    const [deadlineAt, setDeadlineAt] = useState(null);

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

    const clearStoredAssessment = useCallback(() => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                window.sessionStorage.removeItem(ASSESSMENT_SESSION_KEY);
                window.sessionStorage.removeItem(ASSESSMENT_ATTEMPT_KEY);
                window.sessionStorage.removeItem(ASSESSMENT_PROGRESS_KEY);
            } catch (err) {}
        }
        setAttemptId(null);
    }, []);

    const storeAttemptId = useCallback((nextAttemptId) => {
        if (!nextAttemptId || typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        try {
            window.sessionStorage.setItem(ASSESSMENT_ATTEMPT_KEY, nextAttemptId);
        } catch (err) {}
    }, []);

    const buildResumedAnswers = useCallback((assessmentData, attemptData) => {
        const hydratedAnswers = new Array(assessmentData.questions.length).fill(null);

        (attemptData.answers || []).forEach((answer) => {
            const questionIndex = Number(answer.questionIndex);
            if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= hydratedAnswers.length) {
                return;
            }

            if (answer.uploadedFile?.originalName) {
                hydratedAnswers[questionIndex] = {
                    uploaded: true,
                    fileName: answer.uploadedFile.originalName,
                    filePath: answer.uploadedFile.path || ''
                };
                return;
            }

            if (answer.textAnswer !== null && answer.textAnswer !== undefined && answer.textAnswer !== '') {
                hydratedAnswers[questionIndex] = answer.textAnswer;
                return;
            }

            if (answer.selectedAnswer !== null && answer.selectedAnswer !== undefined) {
                hydratedAnswers[questionIndex] = answer.selectedAnswer;
            }
        });

        const storedProgress = getStoredProgress();
        if (
            storedProgress?.attemptId === attemptData._id &&
            Array.isArray(storedProgress.answers) &&
            storedProgress.answers.length === hydratedAnswers.length
        ) {
            storedProgress.answers.forEach((answer, index) => {
                if (answer !== null && answer !== undefined && !(typeof answer === 'string' && answer === '')) {
                    hydratedAnswers[index] = answer;
                }
            });
        }

        return hydratedAnswers;
    }, []);

    const getResumedQuestionIndex = useCallback((assessmentData, attemptData) => {
        const maxIndex = Math.max(0, assessmentData.questions.length - 1);
        const storedProgress = getStoredProgress();

        if (
            storedProgress?.attemptId === attemptData._id &&
            Number.isInteger(storedProgress.currentQuestionIndex)
        ) {
            return Math.min(Math.max(storedProgress.currentQuestionIndex, 0), maxIndex);
        }

        return Math.min(Math.max(Number(attemptData.currentQuestion || 0), 0), maxIndex);
    }, []);

    const getRemainingTimeSeconds = useCallback((assessmentData, attemptData) => {
        const serverRemainingSeconds = Number(attemptData?.timeRemaining);
        if (Number.isFinite(serverRemainingSeconds)) {
            return Math.max(0, Math.floor(serverRemainingSeconds));
        }

        const totalSeconds = Number(assessmentData?.timer || 0) * 60;
        if (!attemptData?.startTime) {
            return totalSeconds;
        }

        const startedAt = new Date(attemptData.startTime).getTime();
        if (Number.isNaN(startedAt)) {
            return totalSeconds;
        }

        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        return Math.max(0, totalSeconds - elapsedSeconds);
    }, []);

    const restoreAttemptState = useCallback((assessmentData, attemptData) => {
        storeAttemptId(attemptData._id);
        setAttemptId(attemptData._id);
        setAnswers(buildResumedAnswers(assessmentData, attemptData));
        setCurrentQuestionIndex(getResumedQuestionIndex(assessmentData, attemptData));
        setTimeLeft(getRemainingTimeSeconds(assessmentData, attemptData));
        setStartTime(attemptData.startTime ? new Date(attemptData.startTime) : new Date());
        if (attemptData.deadlineAt) {
            setDeadlineAt(new Date(attemptData.deadlineAt));
        } else if (attemptData.windowEndAt) {
            setDeadlineAt(new Date(attemptData.windowEndAt));
        }
        setAssessmentState('in_progress');
        setShowTermsModal(false);
        setIsSubmitted(false);
        setError(null);

        const existingWarnings = Number(
            attemptData.warningCount ??
            attemptData.restrictionWarningCount ??
            0
        );
        restrictionWarningCountRef.current = existingWarnings;
        setRestrictionWarningCount(existingWarnings);
        setCaptureCount(Number(attemptData.captureCount || 0));
        capturesStarted.current = false;
    }, [buildResumedAnswers, getRemainingTimeSeconds, getResumedQuestionIndex, storeAttemptId]);

    const applyAttemptResponse = useCallback((assessmentData, attemptData) => {
        if (!attemptData) {
            return false;
        }

        if (attemptData.status === 'in_progress') {
            restoreAttemptState(assessmentData, attemptData);
            return true;
        }

        clearStoredAssessment();

        if (attemptData.status === 'suspended') {
            setTerminationReason('suspended');
            setTerminationTimestamp(attemptData.suspendedAt ? new Date(attemptData.suspendedAt) : new Date());
            setIsTerminated(true);
            setAssessmentState('terminated');
            return true;
        }

        if (attemptData.status === 'completed') {
            setError('This assessment has already been completed.');
            return true;
        }

        if (attemptData.status === 'expired') {
            setError('This assessment has expired.');
            return true;
        }

        return false;
    }, [clearStoredAssessment, restoreAttemptState]);

    const tryResumeAttempt = useCallback(async (assessmentData, activeAttemptId) => {
        if (!activeAttemptId) {
            return false;
        }

        try {
            const response = await api.getCandidateAssessmentAttempt(activeAttemptId);
            const attemptData = response?.attempt;

            if (!response?.success || !attemptData) {
                return false;
            }

            return applyAttemptResponse(assessmentData, attemptData);
        } catch (err) {
            console.error('Error restoring assessment attempt:', err);
            clearStoredAssessment();
            return false;
        }
    }, [applyAttemptResponse, clearStoredAssessment]);

    const tryResumeAttemptByContext = useCallback(async (assessmentData) => {
        if (!assessmentId || !applicationId) {
            return false;
        }

        try {
            const response = await api.getCurrentCandidateAssessmentAttempt({
                assessmentId,
                applicationId,
                jobId
            });

            if (!response?.success || !response.attempt) {
                return false;
            }

            return applyAttemptResponse(assessmentData, response.attempt);
        } catch (err) {
            console.error('Error restoring current assessment attempt:', err);
            return false;
        }
    }, [applicationId, assessmentId, applyAttemptResponse, jobId]);

    // Security and modal state
    const [assessmentState, setAssessmentState] = useState('not_started'); // not_started, terms_pending, in_progress, terminated, completed
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [currentViolation, setCurrentViolation] = useState(null);
    const [isTerminated, setIsTerminated] = useState(false);
    const [terminationReason, setTerminationReason] = useState(null);
    const [terminationTimestamp, setTerminationTimestamp] = useState(null);
    const [showCameraRequiredOverlay, setShowCameraRequiredOverlay] = useState(false);
    const [cameraRequiredMessage, setCameraRequiredMessage] = useState(CAMERA_START_REQUIRED_MESSAGE);
    const [cameraRecoveryMode, setCameraRecoveryMode] = useState('before_start'); // before_start, during_assessment
    const [isRecoveringCamera, setIsRecoveringCamera] = useState(false);
    const [showCameraNotice, setShowCameraNotice] = useState(false);

    // Refs for event listeners
    const assessmentContainerRef = useRef(null);
    const visibilityChangeListener = useRef(null);
    const blurListener = useRef(null);
    const fullscreenChangeListener = useRef(null);
    const resizeListener = useRef(null);
    const focusListener = useRef(null);
    const contextMenuListener = useRef(null);
    const copyListener = useRef(null);
    const pasteListener = useRef(null);
    const screenCaptureKeyListener = useRef(null);
    const saveTimeoutRef = useRef(null);
    const restrictionWarningCountRef = useRef(0);
    const violationCooldownRef = useRef({ type: '', timestamp: 0 });
    const multiScreenMonitorRef = useRef(null);
    const screenDetailsRef = useRef(null);
    const fileDialogOpenRef = useRef(false);
    const cameraHealthMonitorRef = useRef(null);
    const deviceChangeListenerRef = useRef(null);
    const webcamFailureStreakRef = useRef(0);
    
    // Webcam capture refs and state
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const webcamStreamRef = useRef(null);
    const [captureCount, setCaptureCount] = useState(0);
    const captureCountRef = useRef(0);
    const attemptIdRef = useRef(attemptId);
    const [webcamStatus, setWebcamStatus] = useState('initializing'); // initializing, active, failed, disabled
    const [restrictionWarningCount, setRestrictionWarningCount] = useState(0);
    const webcamInitialized = useRef(false);
    const capturesStarted = useRef(false);
    const captureIntervalRef = useRef(null);

    useEffect(() => {
        captureCountRef.current = captureCount;
    }, [captureCount]);

    useEffect(() => {
        attemptIdRef.current = attemptId;
        if (!attemptId) {
            capturesStarted.current = false;
        }
    }, [attemptId]);

    // Violation detection functions
    const logViolation = useCallback(async (violationType, details = '') => {
        if (!attemptId || assessmentState !== 'in_progress' || !violationType) {
            return null;
        }

        try {
            return await api.logAssessmentViolation({
                attemptId,
                type: violationType,
                details
            });
        } catch (error) {
            console.error('Failed to log violation:', error.message || error);
            return null;
        }
    }, [attemptId, assessmentState]);

    const lockRestrictedKeys = useCallback(async () => {
        const keyboardApi = typeof navigator === 'undefined' ? null : navigator.keyboard;
        if (typeof keyboardApi?.lock !== 'function') {
            return;
        }

        try {
            await keyboardApi.lock(LOCKED_CAPTURE_KEYS);
        } catch (error) {
            console.warn('Unable to lock screenshot keys:', error);
        }
    }, []);

    const unlockRestrictedKeys = useCallback(() => {
        const keyboardApi = typeof navigator === 'undefined' ? null : navigator.keyboard;
        if (typeof keyboardApi?.unlock !== 'function') {
            return;
        }

        try {
            keyboardApi.unlock();
        } catch (error) {}
    }, []);

    const cleanupSecureMode = useCallback(() => {
        unlockRestrictedKeys();
        if (typeof document !== 'undefined' && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }, [unlockRestrictedKeys]);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        const previousBackground = document.body.style.backgroundColor;
        const previousUserSelect = document.body.style.userSelect;

        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.userSelect = 'none';

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.backgroundColor = previousBackground;
            document.body.style.userSelect = previousUserSelect;
        };
    }, []);

    const suspendAssessment = useCallback((violationType, message) => {
        cleanupSecureMode();
        clearStoredAssessment();
        setTerminationReason(violationType);
        setTerminationTimestamp(new Date());
        setError(null);
        setIsTerminated(true);
        setAssessmentState('terminated');
        if (message) {
            showError(message);
        }
    }, [cleanupSecureMode, clearStoredAssessment, showError]);

    const showCameraRequiredNotice = useCallback((message, mode = 'during_assessment') => {
        setCameraRecoveryMode(mode);
        setCameraRequiredMessage(message);
        setShowCameraRequiredOverlay(true);
    }, []);

    const clearCameraRequiredNotice = useCallback(() => {
        webcamFailureStreakRef.current = 0;
        setShowCameraRequiredOverlay(false);
        setCameraRequiredMessage(CAMERA_START_REQUIRED_MESSAGE);
        setCameraRecoveryMode('before_start');
    }, []);

    const registerRestrictionViolation = useCallback(async (violationType, userMessage, details = '') => {
        if (assessmentState !== 'in_progress' || !attemptId) {
            return;
        }

        const now = Date.now();
        const previousViolation = violationCooldownRef.current;
        if (now - previousViolation.timestamp < 1500) {
            return;
        }
        violationCooldownRef.current = { type: violationType, timestamp: now };

        const response = await logViolation(violationType, details || userMessage);
        const nextWarningCount = Number(
            response?.warningCount ??
            response?.restrictionWarningCount ??
            (restrictionWarningCountRef.current + 1)
        );
        const isImmediateRestriction = IMMEDIATE_RESTRICTION_TYPES.has(violationType);

        restrictionWarningCountRef.current = nextWarningCount;
        setRestrictionWarningCount(nextWarningCount);

        if (response?.suspended || isImmediateRestriction || nextWarningCount >= RESTRICTION_SUSPEND_THRESHOLD) {
            suspendAssessment(
                violationType,
                response?.message || (
                    isImmediateRestriction
                        ? 'Screenshot or screen-recording activity was detected. Your assessment has been suspended immediately.'
                        : `${userMessage} This was your 5th mistake. Your assessment has been suspended.`
                )
            );
            return;
        }

        showWarning(`${userMessage} Warning ${nextWarningCount}/${RESTRICTION_WARNING_LIMIT}. On the 5th restricted activity, your assessment will be suspended.`);
    }, [assessmentState, attemptId, logViolation, showWarning, suspendAssessment]);

    const requestAssessmentFullscreen = useCallback(async () => {
        if (typeof document === 'undefined') {
            return false;
        }

        if (document.fullscreenElement) {
            await lockRestrictedKeys();
            return true;
        }

        const rootElement = document.documentElement;
        if (!rootElement?.requestFullscreen) {
            return false;
        }

        try {
            await rootElement.requestFullscreen({ navigationUI: 'hide' });
            await lockRestrictedKeys();
            return true;
        } catch (error) {
            console.error('Failed to enter fullscreen mode:', error);
            return false;
        }
    }, [lockRestrictedKeys]);

    const checkMultiScreenUsage = useCallback(async () => {
        if (assessmentState !== 'in_progress') {
            return;
        }

        let multiScreenDetected = false;
        let details = '';

        try {
            if (typeof window.getScreenDetails === 'function') {
                if (!screenDetailsRef.current) {
                    screenDetailsRef.current = await window.getScreenDetails();
                }
                if ((screenDetailsRef.current?.screens?.length || 0) > 1) {
                    multiScreenDetected = true;
                    details = `Multiple displays detected (${screenDetailsRef.current.screens.length} screens connected).`;
                }
            }
        } catch (error) {
            console.warn('Unable to query screen details:', error);
        }

        if (!multiScreenDetected && typeof window.screen?.isExtended === 'boolean' && window.screen.isExtended) {
            multiScreenDetected = true;
            details = 'Extended display mode detected.';
        }

        if (multiScreenDetected) {
            registerRestrictionViolation(
                'multi_screen',
                'Multiple screens are not allowed during the assessment.',
                details
            );
        }
    }, [assessmentState, registerRestrictionViolation]);

    const handleVisibilityChange = useCallback(() => {
        if (document.hidden && assessmentState === 'in_progress') {
            registerRestrictionViolation(
                'tab_switch',
                'Tab switching is not allowed during the assessment.',
                'Candidate switched away from the assessment tab.'
            );
        }
    }, [assessmentState, registerRestrictionViolation]);

    const handleWindowBlur = useCallback(() => {
        if (fileDialogOpenRef.current) {
            return;
        }
        if (assessmentState === 'in_progress') {
            registerRestrictionViolation(
                'window_blur',
                'Warning: Unnecessary activity detected.',
                'Candidate moved focus away from the assessment window.'
            );
        }
    }, [assessmentState, registerRestrictionViolation]);

    const handleFullscreenChange = useCallback(() => {
        if (assessmentState === 'in_progress' && !document.fullscreenElement) {
            registerRestrictionViolation(
                'fullscreen_exit',
                'Exiting fullscreen is not allowed during the assessment.',
                'Candidate exited fullscreen mode.'
            );
        }
    }, [assessmentState, registerRestrictionViolation]);

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

    const handleScreenCaptureAttempt = useCallback((source) => {
        if (assessmentState !== 'in_progress') {
            return;
        }

        registerRestrictionViolation(
            'screen_capture',
            'Screenshot or screen-recording shortcuts are not allowed during the assessment.',
            `Screen capture shortcut detected via ${source}.`
        );
    }, [assessmentState, registerRestrictionViolation]);

    const handleScreenCaptureKey = useCallback((e) => {
        if (assessmentState !== 'in_progress') return;

        const key = e.key || '';
        const keyCode = e.keyCode || e.which;
        const normalizedKey = String(key).toLowerCase();
        const platform = typeof navigator === 'undefined'
            ? ''
            : navigator.userAgentData?.platform || navigator.platform || '';
        const isWindowsPlatform = /win/i.test(platform);
        const isMacPlatform = /mac/i.test(platform);
        const isPrintScreen = key === 'PrintScreen' || keyCode === 44;
        const isWindowsSnippingShortcut = isWindowsPlatform && e.metaKey && e.shiftKey && normalizedKey === 's';
        const isMacCaptureShortcut = isMacPlatform && e.metaKey && e.shiftKey && ['3', '4', '5'].includes(normalizedKey);
        const isWindowsGameBarShortcut = isWindowsPlatform && e.metaKey && normalizedKey === 'g';
        const isWindowsRecordShortcut = isWindowsPlatform && e.metaKey && e.altKey && normalizedKey === 'r';

        let captureSource = '';
        if (isPrintScreen) {
            captureSource = e.altKey ? 'alt_print_screen' : 'print_screen';
        } else if (isWindowsSnippingShortcut) {
            captureSource = 'windows_snipping_tool';
        } else if (isMacCaptureShortcut) {
            captureSource = normalizedKey === '5' ? 'mac_capture_toolbar' : `mac_capture_${normalizedKey}`;
        } else if (isWindowsGameBarShortcut) {
            captureSource = 'windows_game_bar';
        } else if (isWindowsRecordShortcut) {
            captureSource = 'windows_game_bar_record';
        }

        if (captureSource) {
            e.preventDefault();
            e.stopPropagation();
            handleScreenCaptureAttempt(captureSource);
        }
    }, [assessmentState, handleScreenCaptureAttempt]);
    
    // Webcam capture functions
    const stopAssessmentWebcam = useCallback((nextStatus = 'disabled') => {
        webcamInitialized.current = false;
        capturesStarted.current = false;

        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }

        if (webcamStreamRef.current) {
            webcamStreamRef.current.getTracks().forEach((track) => track.stop());
            webcamStreamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.pause?.();
            videoRef.current.srcObject = null;
            videoRef.current.onloadedmetadata = null;
            videoRef.current.onloadeddata = null;
            videoRef.current.oncanplay = null;
            videoRef.current.onerror = null;
        }

        setWebcamStatus(nextStatus);
    }, []);

    const isWebcamActive = useCallback(() => {
        const stream = webcamStreamRef.current || videoRef.current?.srcObject;
        const videoTrack =
            stream?.getVideoTracks?.()?.[0] ||
            videoRef.current?.srcObject?.getVideoTracks?.()?.[0];

        return Boolean(
            stream?.active &&
            videoTrack &&
            videoTrack.readyState === 'live' &&
            videoTrack.enabled !== false &&
            !videoTrack.muted
        );
    }, []);

    const ensureWebcamStarted = useCallback(async () => {
        const videoElement = videoRef.current;

        if (webcamInitialized.current && webcamStreamRef.current?.active && videoElement) {
            try {
                if (videoElement.srcObject !== webcamStreamRef.current) {
                    videoElement.srcObject = webcamStreamRef.current;
                }
                if (videoElement.paused) {
                    await videoElement.play();
                }
                setWebcamStatus('active');
                return true;
            } catch (error) {
                console.error('Existing webcam stream could not resume:', error);
                stopAssessmentWebcam('failed');
            }
        }

        setWebcamStatus('initializing');

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('getUserMedia not supported, continuing without capture');
                setWebcamStatus('failed');
                return false;
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

            if (!videoElement) {
                stream.getTracks().forEach((track) => track.stop());
                setWebcamStatus('failed');
                return false;
            }

            webcamStreamRef.current = stream;
            videoElement.srcObject = stream;
            videoElement.autoplay = true;
            videoElement.muted = true;
            videoElement.defaultMuted = true;
            videoElement.playsInline = true;
            videoElement.setAttribute('playsinline', 'true');
            videoElement.setAttribute('webkit-playsinline', 'true');

            const playVideo = async () => {
                try {
                    await videoElement.play();
                    webcamInitialized.current = true;
                    setWebcamStatus('active');
                    return true;
                } catch (playError) {
                    console.error('Video play error:', playError);
                    stopAssessmentWebcam('failed');
                    return false;
                }
            };

            if (videoElement.readyState >= 2) {
                return await playVideo();
            }

            return await new Promise((resolve) => {
                let settled = false;

                const finish = (result) => {
                    if (settled) return;
                    settled = true;
                    videoElement.onloadedmetadata = null;
                    videoElement.onloadeddata = null;
                    videoElement.oncanplay = null;
                    videoElement.onerror = null;
                    resolve(result);
                };

                videoElement.onloadedmetadata = async () => finish(await playVideo());
                videoElement.onloadeddata = async () => finish(await playVideo());
                videoElement.oncanplay = async () => finish(await playVideo());
                videoElement.onerror = (error) => {
                    console.error('Video element error:', error);
                    stopAssessmentWebcam('failed');
                    finish(false);
                };
            });
        } catch (error) {
            console.warn('Webcam initialization failed:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint
            });

            if (error.name === 'NotAllowedError') {
                console.log('Camera access denied by user');
            } else if (error.name === 'NotFoundError') {
                console.log('No camera device found');
            } else if (error.name === 'NotReadableError') {
                console.log('Camera is being used by another application');
            }

            setWebcamStatus('failed');
            webcamInitialized.current = false;
            webcamStreamRef.current = null;
            return false;
        }
    }, [stopAssessmentWebcam]);

    const initWebcam = useCallback(async () => {
        return ensureWebcamStarted();
        console.log('🎥 Initializing webcam...');
        
        try {
            console.log('🎥 Initializing webcam silently...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn(' getUserMedia not supported, continuing without capture');
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
            console.warn(' Webcam initialization failed:', {
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
    }, [ensureWebcamStarted]);

    const canvasToBlob = useCallback((canvas, type = 'image/jpeg', quality = 0.85) => (
        new Promise((resolve) => {
            canvas.toBlob(resolve, type, quality);
        })
    ), []);
    
    const captureImage = useCallback(async () => {
        const currentCaptureCount = captureCountRef.current;
        const activeAttemptId = attemptIdRef.current;

        if (!videoRef.current || !canvasRef.current || !activeAttemptId || currentCaptureCount >= 5) {
            console.log('🚫 Capture skipped:', {
                hasVideo: !!videoRef.current,
                hasCanvas: !!canvasRef.current,
                hasAttemptId: !!activeAttemptId,
                captureCount: currentCaptureCount,
                maxReached: currentCaptureCount >= 5
            });
            return;
        }
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const activeTrack =
            webcamStreamRef.current?.getVideoTracks?.()?.[0] ||
            video.srcObject?.getVideoTracks?.()?.[0];

        if (video.paused && activeTrack?.readyState === 'live') {
            await video.play().catch(() => {});
        }
        
        if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn(' Video not ready, retrying...', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState
            });
            setTimeout(() => captureImage(), 1500);
            return;
        }
        
        try {
            // Wait a moment for video to be fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Check if video is actually playing
            const hasActiveTrack = activeTrack?.readyState === 'live';
            
            if (video.ended || !hasActiveTrack) {
                console.warn(' Video not ready for capture:', {
                    paused: video.paused,
                    ended: video.ended,
                    hasActiveTrack,
                    trackState: activeTrack?.readyState
                });
                return;
            }
            
            ctx.drawImage(video, 0, 0);
            
            console.log(`📸 Capturing image ${currentCaptureCount + 1}/5`, {
                videoSize: `${video.videoWidth}x${video.videoHeight}`,
                canvasSize: `${canvas.width}x${canvas.height}`
            });
            
            canvas.toBlob(async (blob) => {
                let captureBlob = blob;

                if ((!captureBlob || captureBlob.size < 1500) && typeof window !== 'undefined' && window.ImageCapture && activeTrack) {
                    try {
                        const imageCapture = new window.ImageCapture(activeTrack);

                        if (typeof imageCapture.takePhoto === 'function') {
                            captureBlob = await imageCapture.takePhoto();
                        } else if (typeof imageCapture.grabFrame === 'function') {
                            const frame = await imageCapture.grabFrame();
                            canvas.width = frame.width;
                            canvas.height = frame.height;
                            ctx.drawImage(frame, 0, 0, frame.width, frame.height);
                            if (typeof frame.close === 'function') {
                                frame.close();
                            }
                            captureBlob = await canvasToBlob(canvas);
                        }
                    } catch (fallbackError) {
                        console.warn(' ImageCapture fallback failed:', fallbackError);
                    }
                }
                if (!captureBlob) {
                    console.error('❌ Failed to create blob from canvas');
                    return;
                }
                
                // Check if blob is too small (likely corrupted/black image)
                if (captureBlob.size < 1000) {
                    console.warn(' Blob size very small, image might be black:', captureBlob.size);
                }
                
                console.log('📦 Blob created:', {
                    size: captureBlob.size,
                    type: captureBlob.type
                });
                
                try {
                    const token = localStorage.getItem('candidateToken');
                    if (!token) {
                        console.error('❌ No auth token found');
                        return;
                    }
                    
                    const formData = new FormData();
                    formData.append('capture', captureBlob, `capture_${Date.now()}.jpg`);
                    formData.append('attemptId', activeAttemptId);
                    formData.append('captureIndex', currentCaptureCount.toString());
                    
                    console.log('📤 Uploading capture...', {
                        attemptId: activeAttemptId,
                        captureIndex: currentCaptureCount,
                        blobSize: captureBlob.size,
                        hasAttemptId: !!activeAttemptId,
                        attemptIdLength: activeAttemptId?.length
                    });
                    
                    // Use backend URL (will be rewritten by axios interceptor)
                    const response = await axios.post('/api/candidate/assessments/capture', formData, {
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
    }, [canvasToBlob]);

    const startPeriodicCapture = useCallback(() => {
        if (!assessment || webcamStatus !== 'active' || !attemptIdRef.current || captureIntervalRef.current) {
            console.log('🚫 Periodic capture not started:', {
                hasAssessment: !!assessment,
                webcamStatus,
                hasAttemptId: !!attemptIdRef.current,
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
        
        captureIntervalRef.current = setInterval(() => {
            if (captureCountRef.current < 5) {
                captureImage();
            } else {
                console.log('✅ All captures completed');
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        }, interval);
    }, [assessment, webcamStatus, captureImage]);

    const beginAssessmentSession = useCallback(async () => {
        if (!assessment) {
            setError('Assessment data is unavailable. Please reload and try again.');
            return false;
        }

        if (assessment) {
            const activeAttemptId = attemptIdRef.current || getStoredAttemptId();
            if (await tryResumeAttempt(assessment, activeAttemptId)) {
                return true;
            }

            if (await tryResumeAttemptByContext(assessment)) {
                return true;
            }
        }

        const startResponse = await api.startAssessment({
            assessmentId,
            jobId,
            applicationId
        });

        if (startResponse.success && startResponse.attempt && startResponse.attempt._id) {
            restoreAttemptState(assessment, startResponse.attempt);
            return true;
        }

        stopAssessmentWebcam();
        cleanupSecureMode();

        const msg = startResponse.message || 'Failed to start assessment.';
        const isSchedulingError =
            msg.includes('not started yet') ||
            msg.includes('scheduled start time') ||
            msg.includes('window has ended') ||
            msg.includes('cannot start this assessment');

        if (isSchedulingError) {
            showWarning(msg);
            setShowTermsModal(true);
            setAssessmentState('terms_pending');
        } else {
            setError(msg);
            setShowTermsModal(false);
            setAssessmentState('not_started');
        }
        return false;
    }, [
        applicationId,
        assessment,
        assessmentId,
        jobId,
        cleanupSecureMode,
        restoreAttemptState,
        showWarning,
        stopAssessmentWebcam,
        tryResumeAttempt,
        tryResumeAttemptByContext
    ]);

    const handleCameraRecovery = useCallback(async () => {
        setIsRecoveringCamera(true);

        try {
            const fullscreenGranted = await requestAssessmentFullscreen();
            if (!fullscreenGranted) {
                setCameraRequiredMessage('Fullscreen permission is required before the assessment can continue.');
                return;
            }

            const webcamReady = await initWebcam();
            if (!webcamReady) {
                setCameraRequiredMessage(
                    cameraRecoveryMode === 'before_start'
                        ? CAMERA_START_REQUIRED_MESSAGE
                        : CAMERA_RESUME_REQUIRED_MESSAGE
                );
                return;
            }

            clearCameraRequiredNotice();

            if (cameraRecoveryMode === 'before_start') {
                await beginAssessmentSession();
                return;
            }

            showSuccess('Camera is active again. You can continue the assessment.');
        } finally {
            setIsRecoveringCamera(false);
        }
    }, [
        beginAssessmentSession,
        cameraRecoveryMode,
        clearCameraRequiredNotice,
        initWebcam,
        requestAssessmentFullscreen,
        showSuccess
    ]);

    // Security listeners management
    const addSecurityListeners = useCallback(() => {
        if (assessmentState !== 'in_progress') return;

        // Tab/window visibility change
        visibilityChangeListener.current = handleVisibilityChange;
        document.addEventListener('visibilitychange', visibilityChangeListener.current);

        // Window blur/focus
        blurListener.current = handleWindowBlur;
        window.addEventListener('blur', blurListener.current);

        focusListener.current = () => {
            fileDialogOpenRef.current = false;
        };
        window.addEventListener('focus', focusListener.current);

        fullscreenChangeListener.current = handleFullscreenChange;
        document.addEventListener('fullscreenchange', fullscreenChangeListener.current);

        resizeListener.current = () => {
            checkMultiScreenUsage();
        };
        window.addEventListener('resize', resizeListener.current);

        // Right-click prevention
        contextMenuListener.current = handleContextMenu;
        document.addEventListener('contextmenu', contextMenuListener.current);

        // Copy-paste prevention
        copyListener.current = handleCopy;
        document.addEventListener('copy', copyListener.current);

        pasteListener.current = handlePaste;
        document.addEventListener('paste', pasteListener.current);

        // Screen capture key detection (best-effort)
        screenCaptureKeyListener.current = handleScreenCaptureKey;
        window.addEventListener('keydown', screenCaptureKeyListener.current);
        window.addEventListener('keyup', screenCaptureKeyListener.current);

        checkMultiScreenUsage();
        if (!multiScreenMonitorRef.current) {
            multiScreenMonitorRef.current = window.setInterval(() => {
                checkMultiScreenUsage();
            }, 3000);
        }
    }, [assessmentState, handleVisibilityChange, handleWindowBlur, handleFullscreenChange, handleContextMenu, handleCopy, handlePaste, handleScreenCaptureKey, checkMultiScreenUsage]);

    const removeSecurityListeners = useCallback(() => {
        if (visibilityChangeListener.current) {
            document.removeEventListener('visibilitychange', visibilityChangeListener.current);
        }
        if (blurListener.current) {
            window.removeEventListener('blur', blurListener.current);
        }
        if (focusListener.current) {
            window.removeEventListener('focus', focusListener.current);
        }
        if (fullscreenChangeListener.current) {
            document.removeEventListener('fullscreenchange', fullscreenChangeListener.current);
        }
        if (resizeListener.current) {
            window.removeEventListener('resize', resizeListener.current);
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
        if (screenCaptureKeyListener.current) {
            window.removeEventListener('keydown', screenCaptureKeyListener.current);
            window.removeEventListener('keyup', screenCaptureKeyListener.current);
        }
        if (multiScreenMonitorRef.current) {
            window.clearInterval(multiScreenMonitorRef.current);
            multiScreenMonitorRef.current = null;
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
		} else {
			removeSecurityListeners();
		}

		return () => {
			removeSecurityListeners();
		};
	}, [assessmentState, addSecurityListeners, removeSecurityListeners]);

	useEffect(() => {
        let cancelled = false;

		if (assessmentState === 'in_progress') {
			if (!webcamInitialized.current) {
				initWebcam().then((ready) => {
                    if (cancelled) return;
                    if (!ready) {
                        setShowCameraNotice(true);
                    }
				});
			}

			return () => {
                    cancelled = true;
				stopAssessmentWebcam();
			};
		}

        cancelled = true;
        setShowCameraNotice(false);
		stopAssessmentWebcam();
        cleanupSecureMode();

		return undefined;
	}, [assessmentState, cleanupSecureMode, initWebcam, stopAssessmentWebcam]);

    useEffect(() => {
        if (assessmentState !== 'in_progress') {
            webcamFailureStreakRef.current = 0;

            if (cameraHealthMonitorRef.current) {
                window.clearInterval(cameraHealthMonitorRef.current);
                cameraHealthMonitorRef.current = null;
            }

            if (deviceChangeListenerRef.current && navigator.mediaDevices?.removeEventListener) {
                navigator.mediaDevices.removeEventListener('devicechange', deviceChangeListenerRef.current);
                deviceChangeListenerRef.current = null;
            }

            return undefined;
        }

        const verifyCameraHealth = () => {
            if (isWebcamActive()) {
                webcamFailureStreakRef.current = 0;
                setShowCameraNotice(false);
                return;
            }

            webcamFailureStreakRef.current += 1;
            if (webcamFailureStreakRef.current < 2) {
                return;
            }

            stopAssessmentWebcam('failed');
            setShowCameraNotice(true);
        };

        verifyCameraHealth();
        cameraHealthMonitorRef.current = window.setInterval(verifyCameraHealth, 2000);

        if (navigator.mediaDevices?.addEventListener) {
            deviceChangeListenerRef.current = () => {
                verifyCameraHealth();
            };
            navigator.mediaDevices.addEventListener('devicechange', deviceChangeListenerRef.current);
        }

        return () => {
            webcamFailureStreakRef.current = 0;

            if (cameraHealthMonitorRef.current) {
                window.clearInterval(cameraHealthMonitorRef.current);
                cameraHealthMonitorRef.current = null;
            }

            if (deviceChangeListenerRef.current && navigator.mediaDevices?.removeEventListener) {
                navigator.mediaDevices.removeEventListener('devicechange', deviceChangeListenerRef.current);
                deviceChangeListenerRef.current = null;
            }
        };
    }, [assessmentState, isWebcamActive, stopAssessmentWebcam]);

	// Auto-dismiss camera notice when webcam becomes active
	useEffect(() => {
		if (webcamStatus === 'active' && showCameraNotice) {
			setShowCameraNotice(false);
		}
	}, [webcamStatus, showCameraNotice]);

	// Start captures when both webcam is active and assessment is loaded
	useEffect(() => {
		if (webcamStatus === 'active' && assessment && assessmentState === 'in_progress' && attemptId && !capturesStarted.current) {
			console.log('🚀 Starting periodic capture - conditions met');
			capturesStarted.current = true;
			setTimeout(() => startPeriodicCapture(), 2000);
		}
	}, [webcamStatus, assessment, assessmentState, attemptId, startPeriodicCapture]);



	// Timer effect with violation logging for time expiration
	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted && assessmentState === 'in_progress') {
			const timer = setInterval(() => {
				const remaining = deadlineAt
					? Math.max(0, Math.ceil((deadlineAt.getTime() - Date.now()) / 1000))
					: null;
				if (remaining !== null) {
					if (remaining <= 0) {
						setTimeLeft(0);
						handleTimeExpired();
					} else {
						setTimeLeft(remaining);
					}
				} else {
					setTimeLeft((prev) => {
						if (prev <= 1) {
							handleTimeExpired();
							return 0;
						}
						return prev - 1;
					});
				}
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft, isSubmitted, assessmentState, deadlineAt]);

    useEffect(() => {
        if (!attemptId || assessmentState !== 'in_progress' || typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        try {
            window.sessionStorage.setItem(ASSESSMENT_PROGRESS_KEY, JSON.stringify({
                attemptId,
                currentQuestionIndex,
                answers
            }));
        } catch (err) {}
    }, [attemptId, currentQuestionIndex, answers, assessmentState]);

	const fetchAssessment = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch assessment questions first (without starting attempt)
			const assessmentResponse = await api.getAssessmentForCandidate(assessmentId);
			if (assessmentResponse.success) {
				const assessmentData = assessmentResponse.assessment;
				setAssessment(assessmentData);

                const activeAttemptId = attemptId || getStoredAttemptId();
                if (await tryResumeAttempt(assessmentData, activeAttemptId)) {
                    return;
                }

                if (await tryResumeAttemptByContext(assessmentData)) {
                    return;
                }

				setAnswers(new Array(assessmentData.questions.length).fill(null));
                setCurrentQuestionIndex(0);
                setTimeLeft(Number(assessmentData.timer || 0) * 60);
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
			const fullscreenGranted = await requestAssessmentFullscreen();
			if (!fullscreenGranted) {
				showWarning('Fullscreen permission is required before the assessment can begin. Please allow fullscreen and try again.');
				return;
			}

			setShowTermsModal(false);

            // Try camera before starting — show notice if unavailable, but still start
            const webcamReady = await initWebcam();
            if (!webcamReady) {
                setShowCameraNotice(true);
            }

            // Start assessment session regardless of camera status
            await beginAssessmentSession();
		} catch (err) {
			console.error("Error starting assessment:", err);
			stopAssessmentWebcam();
			setError("Failed to start assessment. Please try again.");
			setShowTermsModal(true);
			setAssessmentState('terms_pending');
		}
	};

	const handleTermsDecline = useCallback(() => {
		setShowTermsModal(false);
		clearStoredAssessment();
		stopAssessmentWebcam();
		cleanupSecureMode();

		if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
			try {
				window.opener.focus();
			} catch (err) {}

			try {
				window.close();
			} catch (err) {}

			if (window.closed) {
				return;
			}
		}

		navigate('/candidate/status', { replace: true });
	}, [clearStoredAssessment, cleanupSecureMode, navigate, stopAssessmentWebcam]);

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

	const handleFileUpload = async (e) => {
		fileDialogOpenRef.current = false;
		const file = e.target.files[0];
		if (!file) return;

		const maxSize = 15 * 1024 * 1024; // 15MB
		if (file.size > maxSize) {
			showError('File size exceeds 15MB limit. Please upload a smaller file.');
			e.target.value = '';
			return;
		}

		try {
			const formData = new FormData();
			formData.append('answerFile', file);
			formData.append('attemptId', attemptId);
			formData.append('questionIndex', currentQuestionIndex);

			const token = localStorage.getItem('candidateToken');
			const response = await axios.post('/api/candidate/assessments/upload-answer', formData, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'multipart/form-data'
				}
			});

			if (response.data.success) {
				const updated = [...answers];
				updated[currentQuestionIndex] = { uploaded: true, fileName: file.name };
				setAnswers(updated);
				showSuccess('Image uploaded successfully!');
			} else {
				showError(response.data.message || 'Failed to upload file');
			}
		} catch (err) {
			console.error('File upload error:', err);
			showError('Failed to upload file. Please try again.');
		}
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
	const instructionsRaw = assessment?.instructions || assessment?.description || '';
	const instructionsText = decodeAssessmentText(
		String(instructionsRaw || '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/li>/gi, '\n')
			.replace(/<li[^>]*>/gi, '• ')
			.replace(/<\/(p|div|ul|ol)>/gi, '\n')
			.replace(/<[^>]*>/g, ''),
		{ preserveWhitespace: true }
	);

	return (
		<>
			{/* Webcam elements for capture - visible for testing */}
			<video 
				ref={videoRef} 
				style={{
					position: 'fixed', 
					top: 'clamp(8px, 2vw, 10px)', 
					right: 'clamp(8px, 2vw, 10px)', 
					width: 'clamp(96px, 28vw, 200px)', 
					height: 'clamp(72px, 21vw, 150px)', 
					border: '2px solid #ff6b35', 
					zIndex: '9999',
					borderRadius: '8px',
					backgroundColor: '#000',
					objectFit: 'cover',
					overflow: 'hidden'
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
					top: 'calc(clamp(72px, 21vw, 150px) + 20px)',
					right: 'clamp(8px, 2vw, 10px)',
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
			{showCameraNotice && (
				<div style={{
					position: 'fixed', inset: 0, zIndex: 99999,
					background: 'rgba(0,0,0,0.55)',
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					padding: '16px'
				}}>
					<div style={{
						background: '#fff', borderRadius: '12px', maxWidth: '520px', width: '100%',
						boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden'
					}}>
						<div style={{ background: '#dc3545', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
							<span style={{ fontSize: '22px' }}>📷</span>
							<h5 style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '16px' }}>Camera Access Required</h5>
						</div>
						<div style={{ padding: '20px 24px' }}>
							<p style={{ margin: '0 0 12px', color: '#333', fontWeight: '500' }}>
								Turn on your camera to continue. Your camera is currently turned off, disconnected, or blocked by your browser or system settings.
							</p>
							<p style={{ margin: '0 0 6px', fontWeight: '600', color: '#2c3e50' }}>Enable camera access:</p>
							<ul style={{ margin: '0 0 14px', paddingLeft: '20px', color: '#444', lineHeight: '1.8' }}>
								<li>Click the site settings icon (sliders icon) in the address bar</li>
								<li>Find <strong>Camera</strong> and set it to <strong>Allow</strong></li>
								<li>Reload the page</li>
							</ul>
							<p style={{ margin: '0 0 6px', fontWeight: '600', color: '#2c3e50' }}>If disabled in Chrome settings:</p>
							<ul style={{ margin: '0 0 14px', paddingLeft: '20px', color: '#444', lineHeight: '1.8' }}>
								<li><strong>Windows:</strong> Settings → Privacy → Camera → Turn ON access and allow your browser</li>
								<li><strong>Mac:</strong> System Settings → Privacy &amp; Security → Camera → Enable access for your browser</li>
							</ul>
							<div style={{ background: '#fff8e1', border: '1px solid #ffc107', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px', color: '#856404' }}>
								<strong>Note:</strong> Close any applications using the camera (Zoom, Teams, etc.), ensure your camera is connected, and refresh the page after enabling access.
							</div>
							<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
								<button
									onClick={() => setShowCameraNotice(false)}
									style={{
										background: '#6c757d', color: '#fff', border: 'none',
										padding: '9px 24px', borderRadius: '6px',
										fontWeight: '600', cursor: 'pointer', fontSize: '14px'
									}}
								>
									OK, Continue Assessment
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			<ViolationModal
				isOpen={showViolationModal}
				violationType={currentViolation?.type}
				timestamp={currentViolation?.timestamp}
				onAcknowledge={handleViolationAcknowledge}
			/>

			<div
				ref={assessmentContainerRef}
				style={{
					padding: "clamp(12px, 3vw, 20px)",
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
						borderRadius: "12px",
						boxShadow: "0px 10px 30px rgba(15,23,42,0.08)",
						marginBottom: "15px",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							gap: "16px",
							alignItems: "flex-start",
							flexWrap: "wrap"
						}}
					>
						<div style={{ flex: "1 1 420px" }}>
							<div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#f97316", marginBottom: "8px" }}>
								Secure Assessment Mode
							</div>
							<h2 style={{ margin: "0", fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>
						{decodeAssessmentText(assessment.title)}
							</h2>
							<div style={{ fontSize: "14px", color: "#555", marginTop: "10px" }}>
								Progress:{" "}
								{Math.round(
									((currentQuestionIndex + 1) / assessment.questions.length) * 100
								)}
								% complete
							</div>
							<div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", lineHeight: "1.5" }}>
								Assessment is running in a dedicated tab. Fullscreen, single-screen use, and staying on this tab are required throughout the test.
							</div>
						</div>
						<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
							<div style={{
								minWidth: "150px",
								padding: "12px 14px",
								borderRadius: "10px",
								background: "#fff7ed",
								border: "1px solid rgba(249, 115, 22, 0.18)",
								color: "#c2410c"
							}}>
								<div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
									Warnings
								</div>
								<div style={{ fontSize: "22px", fontWeight: "700" }}>
									{restrictionWarningCount}/{RESTRICTION_WARNING_LIMIT}
								</div>
								<div style={{ fontSize: "12px", lineHeight: "1.4", marginTop: "4px" }}>
									5th mistake suspends the assessment
								</div>
							</div>
							<div style={{
								minWidth: "150px",
								padding: "12px 14px",
								borderRadius: "10px",
								background: "#fef2f2",
								border: "1px solid rgba(239, 68, 68, 0.14)",
								color: "#b91c1c"
							}}>
								<div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
									Time Left
								</div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										fontWeight: "700",
										fontSize: "22px"
									}}
								>
									<FaClock style={{ marginRight: "8px" }} />
									{formatTime(timeLeft)}
								</div>
							</div>
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

				{instructionsText && (
					<div
						style={{
							background: "#fff",
							padding: "16px 20px",
							borderRadius: "8px",
							boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
							marginBottom: "15px",
							borderLeft: "4px solid #3b82f6"
						}}
					>
						<div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>Instructions</div>
						<div style={{ color: "#374151", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
							{instructionsText}
						</div>
					</div>
				)}

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
						{currentQuestionIndex + 1}. {decodeAssessmentText(String(question.question || '').replace(/<[^>]*>/g, ''))}
					</div>
					{question.imageUrl && (
						<div style={{ marginBottom: "15px", textAlign: "center" }}>
							<img 
								src={question.imageUrl} 
								alt="Question illustration" 
								onError={(e) => {
									console.error('Failed to load image:', question.imageUrl);
									e.target.style.display = 'none';
								}}
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
									resize: "vertical",
									boxSizing: "border-box"
								}}
								placeholder="Type your answer here..."
								value={answers[currentQuestionIndex] || ''}
								onChange={(e) => handleTextAnswerChange(e.target.value)}
								disabled={isSubmitted}
							/>
						) : question.type === 'upload' ? (
							<>
								<div style={{
									border: "2px dashed #ccc",
									borderRadius: "8px",
									padding: "30px",
									textAlign: "center",
									marginBottom: "15px",
									backgroundColor: answers[currentQuestionIndex]?.uploaded ? "#e8f5e9" : "#f9f9f9",
									cursor: "pointer",
									boxSizing: "border-box"
								}}>
									<input
										type="file"
										id="file-upload"
										style={{ display: "none" }}
										accept=".pdf,.doc,.docx,image/*"
										onClick={() => {
											fileDialogOpenRef.current = true;
										}}
										onChange={handleFileUpload}
										disabled={isSubmitted}
									/>
									<label htmlFor="file-upload" style={{ cursor: "pointer", display: "block", width: "100%" }}>
										{answers[currentQuestionIndex]?.uploaded ? (
											<>
												<i className="fa fa-check-circle" style={{ fontSize: "48px", color: "#4CAF50", marginBottom: "10px", display: "block" }}></i>
												<p style={{ margin: "10px 0", color: "#4CAF50", fontSize: "16px", fontWeight: "bold" }}>File Uploaded: {answers[currentQuestionIndex]?.fileName}</p>
												<small style={{ color: "#666" }}>Click to upload a different file</small>
											</>
										) : (
											<>
												<i className="fa fa-cloud-upload" style={{ fontSize: "48px", color: "#999", marginBottom: "10px", display: "block" }}></i>
												<p style={{ margin: "10px 0", color: "#666", fontSize: "16px" }}>Click to upload or drag and drop</p>
												<small style={{ color: "#999" }}>PDF, DOC, DOCX, JPG, PNG, GIF (Max: 15MB)</small>
											</>
										)}
									</label>
								</div>
								<div style={{ marginBottom: "15px" }}>
									<label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px", textAlign: "left" }}>Or write your answer:</label>
									<textarea
										style={{
											width: "100%",
											minHeight: "150px",
											padding: "12px",
											border: "1px solid #ccc",
											borderRadius: "5px",
											fontSize: "14px",
											fontFamily: "Arial, sans-serif",
											resize: "vertical",
											boxSizing: "border-box"
										}}
										placeholder="Type your answer here..."
										value={typeof answers[currentQuestionIndex] === 'string' ? answers[currentQuestionIndex] : ''}
										onChange={(e) => handleTextAnswerChange(e.target.value)}
										disabled={isSubmitted}
									/>
								</div>
								{question.options && question.options.length > 0 && question.options.some(opt => opt && opt.trim()) && (
									<div style={{ marginTop: "20px" }}>
										<div style={{ marginBottom: "10px", fontWeight: "500", fontSize: "14px" }}>Answer Options:</div>
										{question.options.map((option, idx) => (
											option && option.trim() ? (
												<label
													key={idx}
													style={{
														border: answers[currentQuestionIndex] === idx ? "2px solid #3498db" : "1px solid #ccc",
														borderRadius: "5px",
														padding: "10px",
														marginBottom: "8px",
														cursor: isSubmitted ? "not-allowed" : "pointer",
														backgroundColor: answers[currentQuestionIndex] === idx ? "#ecf6fd" : "#fff",
														display: "flex",
														alignItems: "center",
														boxSizing: "border-box"
													}}
												>
													<input
														type="radio"
														name={`q-${currentQuestionIndex}`}
														value={idx}
														checked={answers[currentQuestionIndex] === idx}
														onChange={() => handleOptionChange(idx)}
														disabled={isSubmitted}
														style={{ marginRight: "10px", flexShrink: 0 }}
													/>
													<span style={{ wordBreak: "break-word" }}>{String.fromCharCode(65 + idx)}. {decodeAssessmentText(option)}</span>
												</label>
											) : null
										))}
									</div>
								)}
							</>
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
										<div>{String.fromCharCode(65 + idx)}.{question.type !== 'questionary-image-mcq' && ` ${decodeAssessmentText(option)}`}</div>
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
