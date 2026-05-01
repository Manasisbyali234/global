import { useEffect, useState, useRef } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { useNavigate, useParams } from "react-router-dom";
import './emp-candidate-review.css';
import './emp-candidate-review-active-button-fix.css';
import './emp-candidate-review-back-button-mobile-fix.css';
import './emp-candidate-review-profile-card-mobile-fix.css';
import './emp-candidate-review-button-size-fix.css';
import './emp-candidate-review-stage-text-mobile-fix.css';
import './emp-candidate-review-mobile-fix.css';
import { showSuccess, showError } from '../../../../utils/popupNotification';
import { BACKEND_URL } from '../../../../utils/api';
import { getAssessmentOutcomeLabel } from '../../../../utils/assessmentOutcome';
import TermsModal from "../../../../components/TermsModal";

function EmpCandidateReviewPage() {
    const navigate = useNavigate();
    const { applicationId } = useParams();
    const API_BASE_URL = process.env.REACT_APP_API_URL
        || (window.location.hostname === 'localhost'
            ? 'http://localhost:5000/api'
            : `${window.location.origin}/api`);
    const [application, setApplication] = useState(null);
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('review');
    const [interviewProcesses, setInterviewProcesses] = useState([]);
    const [processRemarks, setProcessRemarks] = useState({});
    const [remarks, setRemarks] = useState('');
    const [isSelected, setIsSelected] = useState(false);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [documentModal, setDocumentModal] = useState({ isOpen: false, url: '', title: '' });
    const [capturesModal, setCapturesModal] = useState({ isOpen: false, captures: [] });
    const [descriptionModal, setDescriptionModal] = useState({ isOpen: false, description: '' });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, role: '', projects: '' });
    const autoSaveTimeoutRef = useRef(null);
    const [showStatusTermsModal, setShowStatusTermsModal] = useState(false);
    const [statusUpdateUnlocked, setStatusUpdateUnlocked] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const stageStatusOptions = [
        { value: 'shortlisted_for_next_round', label: 'Shortlisted for next Round' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'pending_decision', label: 'Pending Decision' },
        { value: 'no_show', label: 'No Show' },
        { value: 'rejected', label: 'Not Advanced to Next Stage' }
    ];
    const resolveBackendFileUrl = (fileData) => {
        if (!fileData || typeof fileData !== 'string') return '';
        if (fileData.startsWith('data:') || fileData.startsWith('http://') || fileData.startsWith('https://')) {
            return fileData;
        }
        let normalized = fileData.replace(/\\/g, '/');
        const uploadsIndex = normalized.indexOf('/uploads/');
        if (uploadsIndex !== -1) {
            normalized = normalized.slice(uploadsIndex);
        }
        if (!normalized.startsWith('/')) {
            normalized = `/${normalized}`;
        }
        return `${BACKEND_URL}${normalized}`;
    };

    const getStageStatusOptions = (index) => {
        const isFinalStage = index === interviewProcesses.length - 1;
        if (isFinalStage) {
            return [
                { value: 'selected', label: 'Selected' },
                { value: 'rejected', label: 'Rejected' }
            ];
        }
        return stageStatusOptions;
    };

    const normalizeStatusValue = (value) =>
        String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ');

    const isRejectedLikeStatus = (value) => {
        const normalized = normalizeStatusValue(value);
        if (!normalized) return false;

        return [
            'rejected',
            'failed',
            'fail',
            'field',
            'expired',
            'suspended',
            'session expired',
            'no show',
            'not eligibal for next round',
            'not eligible for next round'
        ].includes(normalized);
    };

    const isShortlistedForNextRoundStatus = (value) =>
        normalizeStatusValue(value) === 'shortlisted for next round';

    const formatStatusLabel = (value) => {
        const normalized = normalizeStatusValue(value);
        if (!normalized) return 'Pending';
        return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const normalizeTrackedProcessState = (process) => {
        const status = String(process?.status || 'pending');
        return {
            ...process,
            status,
            isCompleted: status !== 'pending'
        };
    };

    const normalizeManualTrackingSequence = (processes = []) => {
        const sanitized = [];

        processes.forEach((process, index) => {
            let nextProcess = normalizeTrackedProcessState(process);

            if (index > 0) {
                const hasRejectedBefore = sanitized.some((previousProcess) =>
                    isRejectedLikeStatus(previousProcess.status)
                );
                const allPreviousStagesShortlisted = sanitized.every((previousProcess) =>
                    isShortlistedForNextRoundStatus(previousProcess.status)
                );

                if (hasRejectedBefore || !allPreviousStagesShortlisted) {
                    nextProcess = {
                        ...nextProcess,
                        status: 'pending',
                        isCompleted: false
                    };
                }
            }

            sanitized.push(nextProcess);
        });

        return sanitized;
    };

    const applySavedManualStatuses = (baseProcesses = [], savedProcesses = []) => {
        const savedById = new Map(
            (Array.isArray(savedProcesses) ? savedProcesses : [])
                .filter((process) => process?.id)
                .map((process) => [String(process.id).trim(), process])
        );

        const mergedProcesses = baseProcesses.map((process, index) => {
            const processId = String(process?.id || '').trim();
            const savedProcess =
                (processId && savedById.get(processId)) ||
                (Array.isArray(savedProcesses) ? savedProcesses[index] : null) ||
                null;

            if (!savedProcess?.status) {
                return process;
            }

            const normalizedAssessmentStatus = normalizeStatusValue(process?.status);
            const shouldPreserveAssessmentStatus =
                process?.type === 'assessment' &&
                ['suspended', 'expired', 'in progress', 'completed', 'passed', 'failed'].includes(normalizedAssessmentStatus);

            if (shouldPreserveAssessmentStatus) {
                return normalizeTrackedProcessState(process);
            }

            return normalizeTrackedProcessState({
                ...process,
                status: savedProcess.status,
                result: process.type === 'assessment'
                    ? process.result || null
                    : (savedProcess.result || process.result || null)
            });
        });

        return normalizeManualTrackingSequence(mergedProcesses);
    };

    const getApplicationDeadline = (jobData = {}) => {
        if (!jobData?.lastDateOfApplication) return null;

        const deadline = new Date(jobData.lastDateOfApplication);
        if (Number.isNaN(deadline.getTime())) {
            return null;
        }

        if (jobData.lastDateOfApplicationTime && typeof jobData.lastDateOfApplicationTime === 'string') {
            const [hours, minutes] = jobData.lastDateOfApplicationTime.split(':').map((part) => Number(part));
            if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
                deadline.setHours(hours, minutes, 59, 999);
                return deadline;
            }
        }

        deadline.setHours(23, 59, 59, 999);
        return deadline;
    };

    const hasTrackedInterviewActivity = (applicationData = {}, processes = []) => {
        const nonConductedStatuses = new Set([
            '',
            'pending',
            'scheduled',
            'available',
            'not started',
            'not required'
        ]);

        const processActivity = (Array.isArray(processes) ? processes : []).some((process) => {
            const normalizedStatus = normalizeStatusValue(process?.status);
            if (normalizedStatus && !nonConductedStatuses.has(normalizedStatus)) {
                return true;
            }

            if (process?.isCompleted) {
                return true;
            }

            if (process?.type === 'assessment') {
                const normalizedResult = normalizeStatusValue(process?.result);
                return (
                    process?.assessmentScore !== null ||
                    process?.assessmentPercentage !== null ||
                    (normalizedResult && normalizedResult !== 'pending')
                );
            }

            return false;
        });

        if (processActivity) {
            return true;
        }

        const baseStatus = normalizeStatusValue(applicationData?.status);
        return ['interviewed', 'offer sent', 'accepted', 'hired', 'rejected'].includes(baseStatus);
    };

    const isApplicationSessionExpired = (applicationData = {}, processes = []) => {
        const baseStatus = normalizeStatusValue(applicationData?.status);
        if (['accepted', 'hired', 'offer sent', 'rejected', 'interviewed'].includes(baseStatus)) {
            return false;
        }

        const deadline = getApplicationDeadline(applicationData?.jobId);
        if (!deadline) {
            return false;
        }

        if (new Date() <= deadline) {
            return false;
        }

        return !hasTrackedInterviewActivity(applicationData, processes);
    };

    const buildAssessmentSummary = ({
        score = null,
        totalMarks = null,
        percentage = null,
        result = null,
        status = '',
        captures = [],
        manualEvaluationPendingCount = 0
    } = {}) => {
        const normalizedStatus = String(status || '').toLowerCase();
        const normalizedResult = String(result || '').trim().toLowerCase();
        const resultDisplay = getAssessmentResultDisplay(result, status, manualEvaluationPendingCount);

        return {
            hasData:
                score !== null ||
                percentage !== null ||
                (normalizedResult && normalizedResult !== 'pending') ||
                ['suspended', 'expired', 'in_progress', 'completed', 'passed', 'failed', 'no_show', 'session expired', 'session_expired'].includes(normalizedStatus),
            score,
            totalMarks,
            percentage,
            result,
            status: normalizedStatus,
            manualEvaluationPendingCount,
            captures: Array.isArray(captures) ? captures : [],
            resultDisplay,
            resultClass: getAssessmentResultClass(resultDisplay)
        };
    };

    const getAssessmentSummary = (applicationData) => {
        const assessmentAttempt = applicationData?.assessmentAttempt;
        return buildAssessmentSummary({
            score: assessmentAttempt?.score ?? applicationData?.assessmentScore ?? null,
            totalMarks: assessmentAttempt?.totalMarks ?? null,
            percentage: assessmentAttempt?.percentage ?? applicationData?.assessmentPercentage ?? null,
            result: assessmentAttempt?.result ?? applicationData?.assessmentResult ?? null,
            status: assessmentAttempt?.status ?? applicationData?.assessmentStatus ?? '',
            captures: assessmentAttempt?.captures || assessmentAttempt?.capturedImages || [],
            manualEvaluationPendingCount: assessmentAttempt?.manualEvaluationPendingCount ?? 0
        });
    };

    const resolveAssessmentValue = (primaryValue, fallbackValue) => {
        const normalizedPrimary = String(primaryValue || '').trim().toLowerCase();
        const normalizedFallback = String(fallbackValue || '').trim().toLowerCase();

        if (
            (!normalizedPrimary || normalizedPrimary === 'pending' || normalizedPrimary === 'not_required') &&
            normalizedFallback &&
            normalizedFallback !== 'pending' &&
            normalizedFallback !== 'not_required'
        ) {
            return fallbackValue;
        }

        return primaryValue ?? fallbackValue ?? null;
    };

    const getStageAssessmentSummary = (stageData, fallbackSummary = null) => buildAssessmentSummary({
        score: stageData?.assessmentScore ?? fallbackSummary?.score ?? null,
        totalMarks: stageData?.assessmentTotalMarks ?? fallbackSummary?.totalMarks ?? null,
        percentage: stageData?.assessmentPercentage ?? fallbackSummary?.percentage ?? null,
        result: resolveAssessmentValue(stageData?.assessmentResult ?? stageData?.result, fallbackSummary?.result),
        status: resolveAssessmentValue(stageData?.status ?? stageData?.assessmentAttemptStatus, fallbackSummary?.status) || '',
        captures: stageData?.assessmentCaptures || fallbackSummary?.captures || [],
        manualEvaluationPendingCount:
            stageData?.manualEvaluationPendingCount ??
            fallbackSummary?.manualEvaluationPendingCount ??
            0
    });

    const getAssessmentResultDisplay = (resultValue, statusValue, manualEvaluationPendingCount = 0) =>
        getAssessmentOutcomeLabel({
            status: statusValue,
            result: resultValue,
            manualEvaluationPendingCount
        });

    const getAssessmentResultClass = (resultLabel) =>
        String(resultLabel || 'pending').toLowerCase().replace(/\s+/g, '_');

    const parseScheduleTime = (value = '') => {
        const normalized = String(value || '').trim();
        if (!normalized) return null;

        const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);
        if (!match) return null;

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const meridiem = (match[3] || '').toLowerCase();

        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return null;
        }

        if (meridiem === 'pm' && hours < 12) {
            hours += 12;
        } else if (meridiem === 'am' && hours === 12) {
            hours = 0;
        }

        return { hours, minutes };
    };

    const buildScheduleDateTime = (dateValue, timeValue = '', boundary = 'start') => {
        if (!dateValue) return null;

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const parsedTime = parseScheduleTime(timeValue);
        if (parsedTime) {
            date.setHours(
                parsedTime.hours,
                parsedTime.minutes,
                boundary === 'end' ? 59 : 0,
                boundary === 'end' ? 999 : 0
            );
            return date;
        }

        if (boundary === 'end') {
            date.setHours(23, 59, 59, 999);
        } else {
            date.setHours(0, 0, 0, 0);
        }

        return date;
    };

    const getAssessmentDisplayState = (process = {}, applicationData = null) => {
        const defaultStatusValue = process?.status || 'pending';
        const defaultResultValue = process?.result || null;
        const resolvedResultValue = getAssessmentResultDisplay(defaultResultValue, defaultStatusValue);

        if (process?.type !== 'assessment') {
            return {
                statusValue: defaultStatusValue,
                statusLabel: formatStatusLabel(defaultStatusValue),
                statusClass: defaultStatusValue,
                resultValue: defaultResultValue,
                resultClass: process?.resultClass || 'pending',
                isWindowExpired: false
            };
        }

        const normalizedStatus = normalizeStatusValue(process?.status);
        const hasAssessmentData = Boolean(process?.assessmentHasData);
        const terminalStatuses = new Set([
            'suspended',
            'expired',
            'in progress',
            'completed',
            'passed',
            'failed',
            'cancelled'
        ]);
        const pendingStatuses = new Set([
            '',
            'pending',
            'available',
            'scheduled',
            'not started'
        ]);

        const fromDate =
            process?.fromDate ||
            process?.scheduledDate ||
            applicationData?.jobId?.assessmentStartDate ||
            null;
        const toDate =
            process?.toDate ||
            process?.fromDate ||
            process?.scheduledDate ||
            applicationData?.jobId?.assessmentEndDate ||
            fromDate;
        const startTime =
            process?.startTime ||
            process?.scheduledTime ||
            applicationData?.jobId?.assessmentStartTime ||
            '';
        const endTime =
            process?.endTime ||
            applicationData?.jobId?.assessmentEndTime ||
            '';

        const scheduledEnd = buildScheduleDateTime(toDate || fromDate, endTime, 'end');
        const isWindowExpired = Boolean(
            !hasAssessmentData &&
            !terminalStatuses.has(normalizedStatus) &&
            pendingStatuses.has(normalizedStatus) &&
            scheduledEnd &&
            new Date() > scheduledEnd
        );

        return {
            statusValue: isWindowExpired ? 'no_show' : defaultStatusValue,
            statusLabel: isWindowExpired ? 'No Show' : formatStatusLabel(defaultStatusValue),
            statusClass: isWindowExpired ? 'no_show' : defaultStatusValue,
            resultValue: isWindowExpired ? 'No Show' : resolvedResultValue,
            resultClass: isWindowExpired ? 'no_show' : getAssessmentResultClass(resolvedResultValue),
            isWindowExpired
        };
    };

    const getProcessEffectiveStatus = (process = {}, applicationData = null) =>
        getAssessmentDisplayState(process, applicationData).statusValue;

    const resolveAssessmentProcessStatus = (stageStatus, assessmentSummary) => {
        const normalizedStageStatus = String(stageStatus || '').toLowerCase();
        const normalizedAssessmentStatus = String(assessmentSummary?.status || '').toLowerCase();

        if (
            ['suspended', 'expired', 'in_progress', 'completed', 'passed', 'failed'].includes(normalizedAssessmentStatus) &&
            ['', 'pending', 'scheduled', 'available', 'not_started'].includes(normalizedStageStatus)
        ) {
            return normalizedAssessmentStatus;
        }

        return normalizedStageStatus || 'pending';
    };

    const getApplicationDisplayStatus = (applicationData, processes = []) => {
        const baseStatus = String(applicationData?.status || '').trim().toLowerCase() || 'pending';
        if (['accepted', 'hired', 'offer_sent'].includes(baseStatus)) {
            return baseStatus;
        }

        const processStatuses = (Array.isArray(processes) ? processes : []).map((process) => process?.status);
        if (processStatuses.some(isRejectedLikeStatus)) {
            return 'rejected';
        }

        const assessmentSummary = getAssessmentSummary(applicationData);
        if (isRejectedLikeStatus(assessmentSummary?.status) || isRejectedLikeStatus(assessmentSummary?.resultDisplay)) {
            return 'rejected';
        }

        if (isApplicationSessionExpired(applicationData, processes)) {
            return 'rejected';
        }

        return baseStatus;
    };

    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    useEffect(() => {
        if (interviewProcesses.length === 0) return;
        
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
            saveInterviewProcesses();
        }, 1000);
        
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [interviewProcesses, processRemarks, applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/employer/applications/${applicationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const assessmentSummary = getAssessmentSummary(data.application);
                setApplication(data.application);
                setCandidate(data.application.candidateId);
                
                if (data.application.employerRemarks) {
                    setRemarks(data.application.employerRemarks);
                }
                if (data.application.isSelectedForProcess) {
                    setIsSelected(data.application.isSelectedForProcess);
                }
                
                const savedManualProcesses = Array.isArray(data.application.interviewProcesses)
                    ? data.application.interviewProcesses.filter(process => process && process.name && process.type)
                    : [];

                // Load interview processes
                let processes = [];
                if (data.application.interviewProcess?.stages && data.application.interviewProcess.stages.length > 0) {
                    const assessmentStageCount = data.application.interviewProcess.stages.filter(stage => stage?.stageType === 'assessment').length;
                    processes = data.application.interviewProcess.stages
                        .filter(stage => stage && stage.stageName && stage.stageType)
                        .sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0))
                        .map(stage => {
                            const stageAssessmentSummary = stage.stageType === 'assessment'
                                ? getStageAssessmentSummary(stage, assessmentStageCount > 1 ? null : assessmentSummary)
                                : null;
                            const resolvedStatus = stage.stageType === 'assessment'
                                ? resolveAssessmentProcessStatus(stage.status || stage.assessmentAttemptStatus, stageAssessmentSummary)
                                : (stage.status || 'pending');

                            return normalizeTrackedProcessState({
                                id: stage._id || `${stage.stageType}-${stage.stageOrder}`,
                                name: stage.stageName,
                                type: stage.stageType,
                                description: stage.description || '',
                                status: resolvedStatus,
                                isCompleted: resolvedStatus === 'completed' || resolvedStatus === 'passed',
                                result: stage.stageType === 'assessment'
                                    ? stageAssessmentSummary.resultDisplay
                                    : null,
                                resultClass: stage.stageType === 'assessment'
                                    ? stageAssessmentSummary.resultClass
                                    : '',
                                assessmentHasData: stage.stageType === 'assessment' ? stageAssessmentSummary.hasData : false,
                                assessmentScore: stage.stageType === 'assessment' ? stageAssessmentSummary.score : null,
                                assessmentPercentage: stage.stageType === 'assessment' ? stageAssessmentSummary.percentage : null,
                                assessmentTotalMarks: stage.stageType === 'assessment' ? stageAssessmentSummary.totalMarks : null,
                                assessmentCaptures: stage.stageType === 'assessment' ? stageAssessmentSummary.captures : [],
                                assessmentId: stage.stageType === 'assessment' ? (stage.assessmentId || null) : null,
                                fromDate: stage.stageType === 'assessment' ? (stage.fromDate || null) : null,
                                toDate: stage.stageType === 'assessment' ? (stage.toDate || stage.fromDate || null) : null,
                                startTime: stage.stageType === 'assessment' ? (stage.startTime || stage.scheduledTime || '') : '',
                                endTime: stage.stageType === 'assessment' ? (stage.endTime || '') : '',
                                scheduledDate: stage.stageType === 'assessment' ? (stage.scheduledDate || null) : null,
                                scheduledTime: stage.stageType === 'assessment' ? (stage.scheduledTime || '') : ''
                            });
                        });
                    processes = applySavedManualStatuses(processes, savedManualProcesses);
                } else if (data.application.interviewProcesses && data.application.interviewProcesses.length > 0) {
                    const assessmentStageCount = data.application.interviewProcesses.filter(p => p?.type === 'assessment').length;
                    processes = data.application.interviewProcesses.filter(p => p && p.name && p.type).map(p => {
                        const stageAssessmentSummary = p.type === 'assessment'
                            ? getStageAssessmentSummary(p, assessmentStageCount > 1 ? null : assessmentSummary)
                            : null;
                        const resolvedStatus = p.type === 'assessment'
                            ? resolveAssessmentProcessStatus(p.status, stageAssessmentSummary)
                            : (p.status || 'pending');

                        return normalizeTrackedProcessState({
                            id: p.id,
                            name: p.name,
                            type: p.type,
                            status: resolvedStatus,
                            isCompleted: resolvedStatus === 'completed' || resolvedStatus === 'passed',
                            result: p.type === 'assessment'
                                ? stageAssessmentSummary.resultDisplay
                                : null,
                                resultClass: p.type === 'assessment'
                                    ? stageAssessmentSummary.resultClass
                                    : '',
                                assessmentHasData: p.type === 'assessment' ? stageAssessmentSummary.hasData : false,
                                assessmentScore: p.type === 'assessment' ? stageAssessmentSummary.score : null,
                                assessmentPercentage: p.type === 'assessment' ? stageAssessmentSummary.percentage : null,
                                assessmentTotalMarks: p.type === 'assessment' ? stageAssessmentSummary.totalMarks : null,
                                assessmentCaptures: p.type === 'assessment' ? stageAssessmentSummary.captures : [],
                                assessmentId: p.type === 'assessment' ? (p.assessmentId || null) : null,
                                fromDate: p.type === 'assessment' ? (p.fromDate || null) : null,
                                toDate: p.type === 'assessment' ? (p.toDate || p.fromDate || null) : null,
                                startTime: p.type === 'assessment' ? (p.startTime || p.scheduledTime || '') : '',
                                endTime: p.type === 'assessment' ? (p.endTime || '') : '',
                                scheduledDate: p.type === 'assessment' ? (p.scheduledDate || null) : null,
                                scheduledTime: p.type === 'assessment' ? (p.scheduledTime || '') : ''
                            });
                        });
                    processes = normalizeManualTrackingSequence(processes);
                } else if (data.application.jobId?.interviewRoundOrder && data.application.jobId.interviewRoundOrder.length > 0) {
                    const assessmentRoundCount = data.application.jobId.interviewRoundOrder.filter(roundKey => {
                        const roundType = data.application.jobId.interviewRoundTypes?.[roundKey] || roundKey;
                        return roundType === 'assessment';
                    }).length;
                    const roundNames = {
                        oneOnOne: 'One-to-One',
                        oneOnOnePanel: 'One-on-One / Panel',
                        panel: 'Panel',
                        group: 'Group',
                        technical: 'Technical',
                        managerial: 'Managerial Round',
                        hr: 'HR Round',
                        situational: 'Situational / Behavioral',
                        others: 'Others – Specify.',
                        assessment: 'Assessment'
                    };
                    processes = data.application.jobId.interviewRoundOrder.map((roundKey, index) => {
                        const roundType = data.application.jobId.interviewRoundTypes?.[roundKey] || roundKey;
                        const roundDetails = data.application.jobId.interviewRoundDetails?.[roundKey];
                        
                        let displayName = roundNames[roundType] || roundType;
                        if (roundType === 'others' && roundDetails?.customType) {
                            displayName = roundDetails.customType;
                        }

                        const stageAssessmentSummary = roundType === 'assessment'
                            ? getStageAssessmentSummary(roundDetails, assessmentRoundCount > 1 ? null : assessmentSummary)
                            : null;

                        return normalizeTrackedProcessState({
                            id: `initial-${roundKey}-${index}`,
                            name: displayName,
                            type: roundType,
                            status: roundType === 'assessment'
                                ? resolveAssessmentProcessStatus('pending', stageAssessmentSummary)
                                : 'pending',
                            isCompleted: false,
                            result: roundType === 'assessment' ? stageAssessmentSummary.resultDisplay : null,
                            resultClass: roundType === 'assessment' ? stageAssessmentSummary.resultClass : '',
                            assessmentHasData: roundType === 'assessment' ? stageAssessmentSummary.hasData : false,
                            assessmentScore: roundType === 'assessment' ? stageAssessmentSummary.score : null,
                            assessmentPercentage: roundType === 'assessment' ? stageAssessmentSummary.percentage : null,
                            assessmentTotalMarks: roundType === 'assessment' ? stageAssessmentSummary.totalMarks : null,
                            assessmentCaptures: roundType === 'assessment' ? stageAssessmentSummary.captures : [],
                            assessmentId: roundType === 'assessment' ? (roundDetails?.assessmentId || data.application.jobId?.assessmentId || null) : null,
                            fromDate: roundType === 'assessment' ? (roundDetails?.fromDate || roundDetails?.date || data.application.jobId?.assessmentStartDate || null) : null,
                            toDate: roundType === 'assessment' ? (roundDetails?.toDate || roundDetails?.fromDate || roundDetails?.date || data.application.jobId?.assessmentEndDate || null) : null,
                            startTime: roundType === 'assessment' ? (roundDetails?.startTime || data.application.jobId?.assessmentStartTime || '') : '',
                            endTime: roundType === 'assessment' ? (roundDetails?.endTime || data.application.jobId?.assessmentEndTime || '') : '',
                            scheduledDate: null,
                            scheduledTime: ''
                        });
                    });
                    processes = normalizeManualTrackingSequence(processes);
                }
                
                setInterviewProcesses(processes);

                const initialRemarks = {};
                if (data.application.processRemarks) {
                    const remarksData = data.application.processRemarks;
                    if (typeof remarksData === 'object') {
                        Object.keys(remarksData).forEach(key => {
                            initialRemarks[key] = remarksData[key] || '';
                        });
                    }
                }
                setProcessRemarks(initialRemarks);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        try {
            const date = new Date(dateString);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return 'Not provided';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
        } catch (error) {
            return 'Not provided';
        }
    };

    const calculateExperience = (startDateStr, endDateStr, isCurrent) => {
        if (!startDateStr) return "";
        const start = new Date(startDateStr);
        const end = isCurrent ? new Date() : (endDateStr ? new Date(endDateStr) : new Date());
        
        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (months < 0) months = 0;
        
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        let result = "";
        if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
        if (remainingMonths > 0) {
            if (result) result += " ";
            result += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
        return result || "0 months";
    };

    const viewDocument = (fileData, title = 'Document') => {
        if (!fileData) return;
        
        let documentUrl;
        if (fileData.startsWith('data:')) {
            const byteCharacters = atob(fileData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
            const blob = new Blob([byteArray], { type: mimeType });
            documentUrl = URL.createObjectURL(blob);
        } else {
            documentUrl = resolveBackendFileUrl(fileData);
        }
        
        setDocumentModal({ isOpen: true, url: documentUrl, title });
    };

    const closeDocumentModal = () => {
        if (documentModal.url && documentModal.url.startsWith('blob:')) {
            URL.revokeObjectURL(documentModal.url);
        }
        setDocumentModal({ isOpen: false, url: '', title: '' });
    };

    const handleOpenStatusUpdate = () => {
        if (statusUpdateUnlocked) return;
        setShowStatusTermsModal(true);
    };

    const handleAcceptStatusTerms = () => {
        setStatusUpdateUnlocked(true);
        setShowStatusTermsModal(false);
    };

    const saveReview = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const cleanedProcesses = interviewProcesses.map(p => ({
                id: String(p.id),
                name: String(p.name),
                type: String(p.type),
                status: String(p.status),
                isCompleted: Boolean(p.isCompleted),
                result: p.type === 'assessment' ? null : (p.result || null)
            }));
            
            const response = await fetch(`${API_BASE_URL}/employer/applications/${applicationId}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interviewRounds,
                    remarks,
                    isSelected,
                    interviewProcesses: cleanedProcesses,
                    processRemarks: processRemarks
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data?.application?.status) {
                    setApplication(prev => ({ ...prev, status: data.application.status }));
                }
                showSuccess('Review saved successfully!');
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Failed to save review');
            }
        } catch (error) {
            console.error('Error saving review:', error);
            showError('Network error while saving review.');
        }
    };

    const saveInterviewProcesses = async (processesOverride = null, showToast = false) => {
        try {
            const token = localStorage.getItem('employerToken');
            const sourceProcesses = Array.isArray(processesOverride) ? processesOverride : interviewProcesses;
            const cleanedProcesses = sourceProcesses.map(p => ({
                id: String(p.id),
                name: String(p.name),
                type: String(p.type),
                status: String(p.status),
                isCompleted: Boolean(p.isCompleted),
                result: p.type === 'assessment' ? null : (p.result || null)
            }));
            
            const response = await fetch(`${API_BASE_URL}/employer/applications/${applicationId}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    interviewProcesses: cleanedProcesses,
                    processRemarks: processRemarks
                })
            });

            if (response.ok) {
                const data = await response.json().catch(() => ({}));
                if (data?.application?.status) {
                    setApplication(prev => ({ ...prev, status: data.application.status }));
                }
            }

            if (showToast) {
                if (response.ok) {
                    showSuccess('Stage status updated successfully!');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    showError(errorData.message || 'Failed to update stage status');
                }
            }
        } catch (error) {
            console.error('Error saving interview processes:', error);
            if (showToast) {
                showError('Network error while updating stage status.');
            }
        }
    };

    const updateApplicationStatus = async (status) => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await fetch(`${API_BASE_URL}/employer/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            
            if (response.ok) {
                showSuccess(`Status updated to ${status.replace('_', ' ')}`);
                setApplication(prev => ({ ...prev, status }));
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showError('Network error while updating status.');
        }
    };

    const allProcessesCompleted = () => {
        if (!application || !application.jobId) return false;
        
        // If any stage is rejected, the whole process is considered terminal/completed
        if (interviewProcesses.some(p => isRejectedLikeStatus(p.status))) {
            return true;
        }
        
        const requiredRoundsCount = application.jobId.interviewRoundOrder?.length || 0;
        
        // If there are required rounds, we must have at least that many processes started
        if (requiredRoundsCount > 0 && interviewProcesses.length < requiredRoundsCount) {
            return false;
        }
        
        // If no processes have been started and none are required, allow actions
        if (interviewProcesses.length === 0) {
            return requiredRoundsCount === 0;
        }
        
        // All started processes must be completed
        return interviewProcesses.every(p => p.isCompleted);
    };

    const hasAnyStageTracked = () => {
        return interviewProcesses.some(p => p.isCompleted);
    };

    const allStagesHaveRemarks = () => {
        if (interviewProcesses.length === 0) return false;
        return interviewProcesses.every(p => processRemarks[p.id] && processRemarks[p.id].trim() !== '');
    };

    const hasShortlistedForNextRound = () => {
        return interviewProcesses.some(p => 
            p.status === 'shortlisted_for_next_round' || p.status === 'selected' || p.status === 'shortlisted'
        );
    };

    const hasNegativeStatus = () => {
        const negativeStatuses = new Set([
            'rejected',
            'no_show',
            'pending_decision',
            'on_hold',
            'pending',
            'suspended',
            'expired',
            'failed',
            'fail',
            'field',
            'session_expired',
            'session expired',
            'not_eligibal_for_next_round',
            'not_eligible_for_next_round'
        ]);
        return interviewProcesses.some((process) => {
            const effectiveStatus = getProcessEffectiveStatus(process, application);
            return negativeStatuses.has(effectiveStatus) || isRejectedLikeStatus(effectiveStatus);
        });
    };

    const isFinalStageShortlisted = () => {
        if (interviewProcesses.length === 0) return false;
        const lastProcess = interviewProcesses[interviewProcesses.length - 1];
        return lastProcess?.status === 'shortlisted_for_next_round' || lastProcess?.status === 'selected' || lastProcess?.status === 'shortlisted';
    };

    const updateProcessCompletion = (processId, isCompleted) => {
        setInterviewProcesses(prev => 
            prev.map(p => p.id === processId ? { ...p, isCompleted } : p)
        );
    };

    const updateProcessRemark = (processId, remark) => {
        setProcessRemarks(prev => ({ ...prev, [processId]: remark }));
    };

    const cleanProcessName = (name) => {
        if (!name) return name;
        // Remove assessment_ followed by numbers
        let cleanName = name.replace(/assessment_\d+/gi, 'Assessment');
        // Remove any trailing underscore followed by numbers (like technical_1769770751285)
        cleanName = cleanName.replace(/_\d+$/g, '');
        // Capitalize first letter of each word
        cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
        return cleanName;
    };

    const educationLevelLabels = {
        '10th_pass': '10th Pass / SSLC',
        '12th_pass': '12th Pass / PUC / Higher Secondary',
        'diploma_general': 'Diploma (General)',
        'iti_trade': 'ITI / Trade Certification',
        'polytechnic_diploma': 'Polytechnic Diploma',
        'vocational_training': 'Vocational Training',
        'certification_courses': 'Certification Courses',
        'apprenticeship': 'Apprenticeship Programs',
        'be': 'B.E. (Bachelor of Engineering)',
        'btech': 'B.Tech (Bachelor of Technology)',
        'bsc': 'B.Sc (Bachelor of Science)',
        'bca': 'BCA (Bachelor of Computer Applications)',
        'bba': 'BBA (Bachelor of Business Administration)',
        'bcom': 'B.Com (Bachelor of Commerce)',
        'ba': 'BA (Bachelor of Arts)',
        'bba_llb': 'BBA-LLB',
        'bsc_nursing': 'B.Sc Nursing',
        'bpharm': 'Bachelor of Pharmacy (B.Pharm)',
        'bds': 'BDS (Dentistry)',
        'mbbs': 'MBBS (Medicine)',
        'bams': 'BAMS (Ayurvedic Medicine)',
        'bhms': 'BHMS (Homeopathy)',
        'bums': 'BUMS (Unani Medicine)',
        'bpt': 'BPT (Physiotherapy)',
        'bot': 'BOT (Occupational Therapy)',
        'bvsc': 'B.V.Sc (Veterinary Science)',
        'barch': 'B.Arch (Architecture)',
        'bfa': 'BFA (Fine Arts)',
        'bsw': 'BSW (Social Work)',
        'bhm': 'BHM (Hotel Management)',
        'bttm': 'BTTM (Travel & Tourism)',
        'bba_it': 'BBA (IT Management)',
        'bsc_it': 'B.Sc (IT)',
        'bsc_cs': 'B.Sc (Computer Science)',
        'bsc_data_science': 'B.Sc (Data Science / AI / ML)',
        'btech_ai': 'B.Tech (AI / Data Science / ML / Cybersecurity)',
        'be_specializations': 'B.E (Specializations)',
        'bca_cloud': 'BCA (Cloud Computing)',
        'bca_data_analytics': 'BCA (Data Analytics)',
        'bcom_finance': 'B.Com (Finance)',
        'bcom_banking': 'B.Com (Banking & Insurance)',
        'bba_finance': 'BBA (Finance)',
        'bba_marketing': 'BBA (Marketing)',
        'bba_hr': 'BBA (HR)',
        'bba_hospital': 'BBA (Hospital Administration)',
        'bba_retail': 'BBA (Retail Management)',
        'bba_entrepreneurship': 'BBA (Entrepreneurship)',
        'bsc_biology': 'B.Sc (Biology)',
        'bsc_biotech': 'B.Sc (Biotechnology)',
        'bsc_microbiology': 'B.Sc (Microbiology)',
        'bsc_genetics': 'B.Sc (Genetics)',
        'bsc_biochemistry': 'B.Sc (Biochemistry)',
        'clinical_research': 'Clinical Research Certification',
        'paramedical': 'Paramedical Courses',
        'llb': 'LLB (Bachelor of Law)',
        'aviation': 'Aviation Courses',
        'me': 'M.E. (Master of Engineering)',
        'mtech': 'M.Tech (Master of Technology)',
        'mba': 'MBA (Master of Business Administration)',
        'mba_finance': 'MBA (Finance)',
        'mba_marketing': 'MBA (Marketing)',
        'mba_hr': 'MBA (HR)',
        'mba_operations': 'MBA (Operations)',
        'mba_systems': 'MBA (Systems / IT)',
        'msc': 'M.Sc (Master of Science)',
        'mca': 'MCA (Master of Computer Applications)',
        'mcom': 'M.Com (Master of Commerce)',
        'ma': 'MA (Master of Arts)',
        'mph': 'MPH (Public Health)',
        'ms': 'MS (Master of Surgery)',
        'md': 'MD (Doctor of Medicine)',
        'mds': 'MDS (Master of Dental Surgery)',
        'mpt': 'MPT (Master of Physiotherapy)',
        'phd': 'PhD (Doctorate)',
        'doctoral_research': 'Doctoral Research Fellow',
        'post_doctoral': 'Post-Doctoral Programs'
    };

    const getEducationLevelLabel = (edu, index) => {
        if (edu.educationLevel && educationLevelLabels[edu.educationLevel]) {
            return educationLevelLabels[edu.educationLevel];
        }
        if (edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) return '10th Standard';
            if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('puc')) return '12th Standard';
            return edu.degreeName;
        }
        return ['10th Standard', '12th Standard', 'Course'][index] || 'Education';
    };

    const getEducationPriority = (edu) => {
        const level = edu.educationLevel;
        if (level === '10th_pass') return 1;
        if (level === '12th_pass') return 2;
        
        const mastersLevels = ['me', 'mtech', 'mba', 'mba_finance', 'mba_marketing', 'mba_hr', 'mba_operations', 'mba_systems', 'msc', 'mca', 'mcom', 'ma', 'mph', 'ms', 'md', 'mds', 'mpt'];
        const phdLevels = ['phd', 'doctoral_research', 'post_doctoral'];
        
        if (mastersLevels.includes(level)) return 4;
        if (phdLevels.includes(level)) return 5;
        
        if (!level && edu.degreeName) {
            const degreeLower = edu.degreeName.toLowerCase();
            if (degreeLower.includes('10th') || degreeLower.includes('sslc') || degreeLower.includes('tenth')) return 1;
            if (degreeLower.includes('12th') || degreeLower.includes('hsc') || degreeLower.includes('twelfth') || degreeLower.includes('intermediate') || degreeLower.includes('puc')) return 2;
        }
        
        return 3;
    };

    if (loading) {
        return (
            <div className="candidate-review-loading">
                <div className="spinner"></div>
                <p>Loading application details...</p>
            </div>
        );
    }

    if (!application || !candidate) {
        return (
            <div className="candidate-review-error">
                <h3>Candidate or Application not found</h3>
                <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const applicationDisplayStatus = getApplicationDisplayStatus(application, interviewProcesses);
    const isAssessmentNoShowApplication = isApplicationSessionExpired(application, interviewProcesses);

    return (
        <div className="candidate-review-container emp-candidate-review-page">
            <div className="candidate-review-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Applications</span>
                </button>
                <div className="header-title">
                    <h2>Candidate Application Review</h2>
                    <p>Evaluating <strong>{candidate.name}</strong> for <strong>{application.jobId?.title}</strong></p>
                </div>
            </div>

            <div className="profile-section">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {candidate.profilePicture || candidate.profileImage ? (
                            <img src={candidate.profilePicture || candidate.profileImage} alt={candidate.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        <div className={`status-indicator ${applicationDisplayStatus === 'hired' || applicationDisplayStatus === 'accepted' ? 'active' : ''}`}></div>
                    </div>
                    <div className="profile-info">
                        <h3>{candidate.name}</h3>
                        <p className="email">{candidate.email}</p>
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="label">Applied Date</span>
                                <span className="value">{formatDate(application.createdAt)}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Application Status</span>
                                <span className={`value status ${applicationDisplayStatus}`}>
                                    {applicationDisplayStatus === 'offer_sent' ? 'Offer Letter Sent' :
                                     applicationDisplayStatus === 'accepted' ? 'Offer Accepted' :
                                     formatStatusLabel(applicationDisplayStatus)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tab-navigation">
                <button className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                    <i className="fas fa-tasks"></i>
                    Stages & Review
                </button>
                <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                    <i className="fas fa-user"></i>
                    Personal Info
                </button>
                <button className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
                    <i className="fas fa-graduation-cap"></i>
                    Education
                </button>
                <button className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`} onClick={() => setActiveTab('employment')}>
                    <i className="fas fa-briefcase"></i>
                    Experience
                </button>
                <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
                    <i className="fas fa-cogs"></i>
                    Skills & Summary
                </button>
                <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                    <i className="fas fa-file-alt"></i>
                    Documents
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'review' && (
                    <div className="tab-panel review-panel">
                        <div className="review-grid">
                            <div className="review-main">
                                {interviewProcesses.length > 0 && (
                                    <div className="section-card">
                                         <div className="section-header">
                                              <div style={{ display: "flex", flexDirection: "column" }}>
                                               <h4><i className="fas fa-tasks"></i> Manual Stage Tracking</h4>
                                               <h6></h6>
                                          </div>
                                          <button
                                            type="button"
                                            className={`btn btn-sm ${statusUpdateUnlocked ? 'btn-success' : 'btn-primary'}`}
                                            onClick={handleOpenStatusUpdate}
                                            disabled={statusUpdateUnlocked}
                                            title={statusUpdateUnlocked ? 'Status Enabled' : 'Open interview status instructions'}
                                          >
                                            {statusUpdateUnlocked ? 'Status Enabled' : 'Status update'}
                                          </button>
                                          </div>
                                        <div className="section-body">
                                            <div className="processes-grid">
                                                {interviewProcesses.map((process, index) => {
                                                    const assessmentDisplay = getAssessmentDisplayState(process, application);
                                                    const isPreviousRejected = interviewProcesses
                                                        .slice(0, index)
                                                        .some((previousProcess) => isRejectedLikeStatus(getProcessEffectiveStatus(previousProcess, application)));
                                                    const isPreviousIncomplete = index > 0 && !interviewProcesses
                                                        .slice(0, index)
                                                        .every((previousProcess) => isShortlistedForNextRoundStatus(previousProcess.status));
                                                    const isCurrentDisabled =
                                                        isAssessmentNoShowApplication ||
                                                        assessmentDisplay.isWindowExpired ||
                                                        isPreviousRejected ||
                                                        isPreviousIncomplete ||
                                                        (applicationDisplayStatus === 'rejected' && !isRejectedLikeStatus(process.status));

                                                    return (
                                                        <div key={process.id} className={`process-item ${process.isCompleted ? 'completed' : ''} ${isCurrentDisabled ? 'stage-disabled' : ''}`}>
                                                            <div className="process-header">
                                                                <div className="process-title-group">
                                                                    <span className="stage-number">Stage {index + 1}</span>
                                                                    <h6>{cleanProcessName(process.name)}</h6>
                                                                </div>
                                                                <span className={`status-badge ${assessmentDisplay.statusClass || 'pending'}`}>
                                                                    {assessmentDisplay.statusLabel}
                                                                </span>
                                                            </div>
                                                            {process.type === 'assessment' && (process.assessmentScore !== null || process.assessmentPercentage !== null || assessmentDisplay.resultValue) && (
                                                                <div className="assessment-process-summary">
                                                                    {process.assessmentScore !== null && process.assessmentTotalMarks !== null && (
                                                                        <div className="assessment-process-item">
                                                                            <span className="assessment-process-label">Score</span>
                                                                            <span className="assessment-process-value">
                                                                                {process.assessmentScore} / {process.assessmentTotalMarks}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {process.assessmentPercentage !== null && process.assessmentPercentage !== undefined && (
                                                                        <div className="assessment-process-item">
                                                                            <span className="assessment-process-label">Percentage</span>
                                                                            <span className="assessment-process-value">
                                                                                {Number(process.assessmentPercentage).toFixed(1)}%
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {assessmentDisplay.resultValue && (
                                                                        <div className="assessment-process-item">
                                                                            <span className="assessment-process-label">Result</span>
                                                                            <span className={`assessment-process-value result ${assessmentDisplay.resultClass || 'pending'}`}>
                                                                                {assessmentDisplay.resultValue}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {application.assessmentAttempt && (
                                                                        <div className="assessment-actions assessment-process-actions">
                                                                            <button 
                                                                                className="btn-view-answers"
                                                                                onClick={() => {
                                                                                    if (application.assessmentAttempt?._id) {
                                                                                        navigate(`/employer/view-answers/${application.assessmentAttempt._id}`);
                                                                                    } else {
                                                                                        showError('Assessment attempt ID not found');
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-file-alt"></i> View Answers
                                                                            </button>
                                                                            <button 
                                                                                className="btn-view-captures"
                                                                                onClick={() => {
                                                                                    const captures = application.assessmentAttempt.captures || application.assessmentAttempt.capturedImages || [];
                                                                                    setCapturesModal({ isOpen: true, captures });
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-camera"></i> View Captures
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="process-controls">
                                                                {statusUpdateUnlocked ? (
                                                                    <select 
                                                                        value={process.status || 'pending'}
                                                                        onChange={(e) => {
                                                                            const newStatus = e.target.value;
                                                                            setInterviewProcesses(prev => {
                                                                                const updated = normalizeManualTrackingSequence(
                                                                                    prev.map(p => p.id === process.id ? {
                                                                                        ...p,
                                                                                        status: newStatus,
                                                                                        isCompleted: newStatus !== 'pending'
                                                                                    } : p)
                                                                                );
                                                                                saveInterviewProcesses(updated, true);
                                                                                return updated;
                                                                            });
                                                                            
                                                                            // Do not auto-update overall status when a stage is rejected
                                                                        }}
                                                                        disabled={isCurrentDisabled}
                                                                    >
                                                                        {!getStageStatusOptions(index).some((option) => option.value === (process.status || 'pending')) && (
                                                                            <option value={process.status || 'pending'}>
                                                                                {(process.status || 'pending').replace(/_/g, ' ')}
                                                                            </option>
                                                                        )}
                                                                        {getStageStatusOptions(index).map((option) => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <div
                                                                        className="form-control"
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            color: '#6c757d',
                                                                            backgroundColor: '#f8f9fa',
                                                                            cursor: 'not-allowed'
                                                                        }}
                                                                    >
                                                                        Click "Status update" and accept terms to enable dropdown
                                                                    </div>
                                                                )}
                                                                <textarea 
                                                                    placeholder="Stage remarks..."
                                                                    value={processRemarks[process.id] || ''}
                                                                    onChange={(e) => updateProcessRemark(process.id, e.target.value)}
                                                                    disabled={isCurrentDisabled}
                                                                    rows="1"
                                                                    style={{ minHeight: '38px', resize: 'none', overflow: 'hidden' }}
                                                                    onInput={(e) => {
                                                                        e.target.style.height = 'auto';
                                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                                    }}
                                                                />
                                                            </div>
                                                            {isAssessmentNoShowApplication && (
                                                                <div className="stage-locked-info">
                                                                    <i className="fas fa-clock"></i>
                                                                    <span>Tracking locked because the application is marked as No Show.</span>
                                                                </div>
                                                            )}
                                                            {!isAssessmentNoShowApplication && assessmentDisplay.isWindowExpired && (
                                                                <div className="stage-locked-info">
                                                                    <i className="fas fa-clock"></i>
                                                                    <span>Assessment window ended before the candidate attended it.</span>
                                                                </div>
                                                            )}
                                                            {isPreviousRejected && (
                                                                <div className="stage-locked-info">
                                                                    <i className="fas fa-info-circle"></i>
                                                                    <span>Stage locked because a previous stage was rejected.</span>
                                                                </div>
                                                            )}
                                                            {!isPreviousRejected && isPreviousIncomplete && (
                                                                <div className="stage-locked-info">
                                                                    <i className="fas fa-info-circle"></i>
                                                                    <span>Stage locked until previous stage status is set to shortlisted.</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="review-sidebar">
                                <div className="section-card">
                                    <div className="section-header">
                                        <h4>Overall Actions</h4>
                                    </div>
                                    <div className="section-body">
                                        <div className="remarks-area">
                                            <label>Employer Remarks</label>
                                            <textarea 
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Enter overall feedback..."
                                                rows="1"
                                                style={{ minHeight: '60px', resize: 'none', overflow: 'hidden' }}
                                                onInput={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                            />
                                            <button onClick={saveReview}>
                                                <i className="fas fa-save"></i> Save Remarks
                                            </button>
                                        </div>
                                        <div className="action-buttons">
                                            {isAssessmentNoShowApplication && (
                                                <div className="alert alert-warning d-flex align-items-center mb-3" style={{ width: '100%', fontSize: '14px', padding: '10px' }}>
                                                    <i className="fas fa-clock me-2"></i>
                                                    <div>No interview stage was completed before the application deadline, so this session is expired.</div>
                                                </div>
                                            )}
                                            {application.status === 'accepted' && (
                                                <div className="alert alert-success d-flex align-items-center mb-3" style={{ width: '100%', fontSize: '14px', padding: '10px' }}>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    <div>Candidate has Accepted the Offer</div>
                                                </div>
                                            )}
                                            {!isAssessmentNoShowApplication && application.status === 'rejected' && application.statusHistory?.some(h => h.status === 'offer_sent') ? (
                                                <div className="alert alert-warning d-flex align-items-center mb-3" style={{ width: '100%', fontSize: '14px', padding: '10px' }}>
                                                    <i className="fas fa-times-circle me-2"></i>
                                                    <div>Candidate has Not Accepted the Offer</div>
                                                </div>
                                            ) : !isAssessmentNoShowApplication && hasNegativeStatus() ? (
                                                <>
                                                    <button 
                                                            className={`${applicationDisplayStatus === 'rejected' ? 'active' : ''}`}
                                                            onClick={() => setShowRejectConfirm(true)}
                                                        >
                                                            <i className="fas fa-times"></i> Reject
                                                        </button>
                                                </>
                                            ) : isFinalStageShortlisted() ? (
                                                <>
                                                    {application.status !== 'accepted' && application.status !== 'hired' && (
                                                        <button 
                                                            className={`${application.status === 'shortlisted' ? 'active shortlisted-btn' : ''}`}
                                                            onClick={() => updateApplicationStatus('shortlisted')}
                                                        >
                                                            <i className="fas fa-check"></i> Shortlist
                                                        </button>
                                                    )}
                                                    {application.status !== 'hired' && application.status !== 'accepted' && (
                                                        <button 
                                                            className={`${application.status === 'offer_sent' ? 'active' : ''}`}
                                                            onClick={() => updateApplicationStatus('offer_sent')}
                                                        >
                                                            <i className="fas fa-envelope"></i> Offer Letter Sent
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {(allProcessesCompleted() && hasShortlistedForNextRound() || application.status === 'accepted') && (
                                                        <>
                                                            {application.status !== 'accepted' && application.status !== 'hired' && (
                                                                <button 
                                                                    className={`${application.status === 'shortlisted' ? 'active shortlisted-btn' : ''}`}
                                                                    onClick={() => updateApplicationStatus('shortlisted')}
                                                                >
                                                                    <i className="fas fa-check"></i> Shortlist
                                                                </button>
                                                            )}
                                                            <button 
                                                                className={`${application.status === 'hired' ? 'active' : ''}`}
                                                                onClick={() => updateApplicationStatus('hired')}
                                                            >
                                                                <i className="fas fa-briefcase"></i> Mark as Hired
                                                            </button>
                                                        </>
                                                    )}
                                                    {application.status !== 'hired' && application.status !== 'accepted' && hasAnyStageTracked() && hasShortlistedForNextRound() && (
                                                        <button 
                                                            className={`${application.status === 'offer_sent' ? 'active' : ''}`}
                                                            onClick={() => updateApplicationStatus('offer_sent')}
                                                        >
                                                            <i className="fas fa-envelope"></i> Offer Letter Sent
                                                        </button>
                                                    )}
                                                    {application.status !== 'shortlisted' && application.status !== 'hired' && application.status !== 'accepted' && hasAnyStageTracked() && hasShortlistedForNextRound() && (
                                                        <button 
                                                                className={`${applicationDisplayStatus === 'rejected' ? 'active' : ''}`}
                                                                onClick={() => setShowRejectConfirm(true)}
                                                            >
                                                                <i className="fas fa-times"></i> Reject
                                                            </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {application.status !== 'accepted' && application.status !== 'hired' && !isAssessmentNoShowApplication && !hasNegativeStatus() && !isFinalStageShortlisted() && (!allProcessesCompleted() || !hasShortlistedForNextRound()) && (
                                            <p className="warning-text">
                                                {!hasShortlistedForNextRound()
                                                    ? 'Please select "Shortlisted for next Round" for at least one stage to enable actions.'
                                                    : 'Complete all interview stages to enable shortlist and hire actions.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'personal' && (
                    <div className="tab-panel personal-info">
                        <div className="info-section">
                            <div className="info-rows">
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-user"></i></div>
                                        <div className="field-content">
                                            <label>First Name</label>
                                            <span>{candidate.firstName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-user"></i></div>
                                        <div className="field-content">
                                            <label>Middle Name</label>
                                            <span>{candidate.middleName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-user"></i></div>
                                        <div className="field-content">
                                            <label>Last Name</label>
                                            <span>{candidate.lastName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-envelope"></i></div>
                                        <div className="field-content">
                                            <label>Email Address</label>
                                            <span>{candidate.email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-phone"></i></div>
                                        <div className="field-content">
                                            <label>Phone Number</label>
                                            <span>{candidate.phone || candidate.mobileNumber || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-calendar-alt"></i></div>
                                        <div className="field-content">
                                            <label>Date of Birth</label>
                                            <span>{formatDate(candidate.dateOfBirth)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-venus-mars"></i></div>
                                        <div className="field-content">
                                            <label>Gender</label>
                                            <span>{candidate.gender || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-clock"></i></div>
                                        <div className="field-content">
                                            <label>Registration Date</label>
                                            <span>{formatDate(candidate.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-male"></i></div>
                                        <div className="field-content">
                                            <label>Father's/Husband's Name</label>
                                            <span>{candidate.fatherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-female"></i></div>
                                        <div className="field-content">
                                            <label>Mother's Name</label>
                                            <span>{candidate.motherName || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon"><i className="fas fa-home"></i></div>
                                        <div className="field-content">
                                            <label>Residential Address</label>
                                            <span>{candidate.residentialAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row single-field">
                                    <div className="info-field full-width">
                                        <div className="field-icon"><i className="fas fa-building"></i></div>
                                        <div className="field-content">
                                            <label>Permanent Address</label>
                                            <span>{candidate.permanentAddress || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map-pin"></i></div>
                                        <div className="field-content">
                                            <label>Pincode</label>
                                            <span>{candidate.pincode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map-marker-alt"></i></div>
                                        <div className="field-content">
                                            <label>Location</label>
                                            <span>{candidate.location || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-field">
                                        <div className="field-icon"><i className="fas fa-map"></i></div>
                                        <div className="field-content">
                                            <label>State Code</label>
                                            <span>{candidate.stateCode || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="tab-panel education-info">
                        {!candidate.education || candidate.education.length === 0 ? (
                            <div className="no-data-content text-center py-5">
                                <i className="fas fa-graduation-cap fa-3x mb-3 text-muted"></i>
                                <h5>No Education Information</h5>
                            </div>
                        ) : (
                            <div className="table-responsive education-table-wrapper" style={{border: '1px solid #dee2e6', borderRadius: '8px'}}>
                                <table className="table table-bordered table-sm mb-0" style={{fontSize: '14px', width: '100%'}}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{minWidth: '120px', whiteSpace: 'nowrap'}}>Qualification</th>
                                            <th style={{minWidth: '150px'}}>Institution</th>
                                            <th style={{minWidth: '150px'}}>Degree / Board / Specialization</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Enrollment No.</th>
                                            <th style={{minWidth: '80px'}}>State</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Year</th>
                                            <th style={{minWidth: '80px', whiteSpace: 'nowrap'}}>Score</th>
                                            <th style={{minWidth: '70px'}}>Result</th>
                                            <th style={{minWidth: '100px', whiteSpace: 'nowrap'}}>Document</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...candidate.education]
                                            .sort((a, b) => getEducationPriority(a) - getEducationPriority(b))
                                            .map((edu, index) => (
                                            <tr key={index}>
                                                <td style={{fontWeight: '600', fontSize: '13px'}}>
                                                    {getEducationLevelLabel(edu, index)}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {edu.collegeName || '-'}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    <div>{edu.degreeName || '-'}</div>
                                                    {(edu.courseName || edu.specialization) && 
                                                        <div className="small text-muted">{edu.courseName || edu.specialization}</div>
                                                    }
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {edu.registrationNumber || '-'}
                                                </td>
                                                <td style={{fontSize: '13px'}}>
                                                    {edu.state || '-'}
                                                </td>
                                                <td style={{fontSize: '13px', textAlign: 'center'}}>
                                                    {edu.passYear || '-'}
                                                </td>
                                                <td style={{fontSize: '13px', textAlign: 'center'}}>
                                                    {edu.percentage && <div>{edu.percentage}%</div>}
                                                    {edu.cgpa && <div className="small text-muted">CGPA: {edu.cgpa}</div>}
                                                    {!edu.percentage && !edu.cgpa && (edu.scoreValue ? <div>{edu.scoreValue}{edu.scoreType === 'percentage' ? '%' : ''}</div> : '-')}
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <span className={`badge ${edu.grade === 'Passed' || edu.result === 'Passed' ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '11px'}}>
                                                        {edu.grade || edu.result || '-'}
                                                    </span>
                                                </td>
                                                <td style={{fontSize: '12px', textAlign: 'center'}}>
                                                    {edu.marksheet ? (
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary" 
                                                            onClick={() => viewDocument(edu.marksheet, `${getEducationLevelLabel(edu, index)} Marksheet`)}
                                                            style={{padding: '2px 8px', fontSize: '11px'}}
                                                        >
                                                            <i className="fa fa-file-pdf-o me-1"></i>
                                                            View
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted small">No Document</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'employment' && (
                    <div className="tab-panel employment-info">
                        <div className="section-header d-flex justify-content-between align-items-center">
                            <h4><i className="fas fa-briefcase"></i> Employment History</h4>
                            {candidate.totalExperience && (
                                <div className="total-exp-badge">
                                    <span className="text-muted">Total Experience:   </span>
                                    <span className="badge badge-info ml-2">{candidate.totalExperience}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="employment-history-container mt-4">
                            {(!candidate.employment || candidate.employment.length === 0) ? (
                                <p className="no-data-text">No employment history provided.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered custom-employment-table">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Organization & Designation</th>
                                                <th>Experience</th>
                                                <th>Compensation (Annual)</th>
                                                <th>Notice Period</th>
                                                <th className="text-center">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...candidate.employment].sort((a, b) => {
                                                if (a.isCurrentCompany) return -1;
                                                if (b.isCurrentCompany) return 1;
                                                return new Date(b.startDate || '1900-01-01') - new Date(a.startDate || '1900-01-01');
                                            }).map((emp, index) => (
                                                <tr key={index} className={emp.isCurrentCompany ? 'table-success-light' : ''}>
                                                    <td>
                                                        <div className="font-weight-bold text-primary">
                                                            {emp.organizationName || emp.organization || 'N/A'}
                                                        </div>
                                                        <div className="small text-muted">{emp.designation || 'N/A'}</div>
                                                        {emp.isCurrentCompany && <span className="badge-current mt-1">Current</span>}
                                                    </td>
                                                    <td>
                                                        {emp.yearsOfExperience !== undefined ? 
                                                            `${emp.yearsOfExperience}y ${emp.monthsOfExperience || 0}m` : 
                                                            calculateExperience(emp.startDate, emp.endDate, emp.isCurrentCompany)}
                                                    </td>
                                                    <td>
                                                        {emp.isCurrentCompany ? (
                                                            <div className="small">
                                                                <div><span className="text-muted">Pres:</span> {emp.presentCTC ? `₹${emp.presentCTC} LPA` : '—'}</div>
                                                                <div><span className="text-muted">Exp:</span> {emp.expectedCTC ? `₹${emp.expectedCTC} LPA` : '—'}</div>
                                                            </div>
                                                        ) : '—'}
                                                    </td>
                                                    <td>
                                                        {emp.isCurrentCompany ? (
                                                            emp.noticePeriod === 'Custom' ? emp.customNoticePeriod : (emp.noticePeriod || '—')
                                                        ) : '—'}
                                                    </td>
                                                    <td className="text-center">
                                                        {emp.description || emp.projectDetails ? (
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => setDetailsModal({ isOpen: true, role: emp.description || '', projects: emp.projectDetails || '' })}
                                                                style={{padding: '4px 10px', fontSize: '12px'}}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                        ) : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="experience-quick-stats mt-4">
                                {/* Preferred Locations remains here */}
                                <div className="locations-section">
                                    <div className="sub-section-header">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <h5>Preferred Locations</h5>
                                    </div>
                                    <div className="locations-tags-container">
                                        {candidate.preferredLocations && candidate.preferredLocations.length > 0 ? (
                                            candidate.preferredLocations.map((loc, index) => (
                                                <div key={index} className="location-tag-simple">
                                                    <i className="fas fa-map-pin"></i>
                                                    <span>{loc}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-data-text">No preferred locations provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="tab-panel skills-info">
                        <div className="section-header">
                        </div>

                        {candidate.skills && candidate.skills.length > 0 && (
                            <div className="skills-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-tools"></i>
                                    <h5>Technical Skills</h5>
                                </div>
                                <div className="skills-grid">
                                    {candidate.skills.map((skill, index) => (
                                        <div key={index} className="skill-tag">
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {candidate.resumeHeadline && (
                            <div className="summary-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-newspaper"></i>
                                    <h5>Resume Headline</h5>
                                </div>
                                <div className="summary-content">
                                    <p>{candidate.resumeHeadline}</p>
                                </div>
                            </div>
                        )}

                        {candidate.profileSummary && (
                            <div className="summary-section mt-4">
                                <div className="sub-section-header">
                                    <i className="fas fa-user-edit"></i>
                                    <h5>Profile Summary</h5>
                                </div>
                                <div className="summary-content">
                                    <p>{candidate.profileSummary}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="tab-panel documents-info">
                        <div className="documents-grid">
                            {candidate.resume && (
                                <div className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-file-pdf"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>Resume / CV</h5>
                                        <p>Candidate's complete resume</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(candidate.resume, 'Resume')}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </div>
                            )}

                            {candidate.experienceLetter && (
                                <div className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>Experience Letter</h5>
                                        <p>Previous employment proof</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(candidate.experienceLetter, 'Experience Letter')}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </div>
                            )}

                            {candidate.education?.map((edu, index) => edu.marksheet && (
                                <div key={index} className="document-card">
                                    <div className="document-icon">
                                        <i className="fas fa-certificate"></i>
                                    </div>
                                    <div className="document-info">
                                        <h5>{getEducationLevelLabel(edu, index)} Marksheet</h5>
                                        <p>Academic certificate</p>
                                    </div>
                                    <div className="document-actions">
                                        <button className="action-btn view" onClick={() => viewDocument(edu.marksheet, `${getEducationLevelLabel(edu, index)} Marksheet`)}>
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Captures Modal */}
            {capturesModal.isOpen && (
                <div className="document-modal-overlay" onClick={() => setCapturesModal({ isOpen: false, captures: [] })}>
                    <div className="captures-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Assessment Captures</h3>
                            <button className="modal-btn close" onClick={() => setCapturesModal({ isOpen: false, captures: [] })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="captures-modal-body">
                            {capturesModal.captures.length > 0 ? (
                                <div className="captures-grid">
                                    {capturesModal.captures.map((capture, index) => (
                                        <div key={index} className="capture-item">
                                            <img 
                                                src={resolveBackendFileUrl(capture)} 
                                                alt={`Capture ${index + 1}`}
                                                onClick={() => viewDocument(capture, `Capture ${index + 1}`)}
                                            />
                                            <p>Capture {index + 1}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-captures">
                                    <i className="fas fa-camera"></i>
                                    <p>No captures available for this assessment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {documentModal.isOpen && (
                <div className="document-modal-overlay" onClick={closeDocumentModal}>
                    <div className="document-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>{documentModal.title}</h3>
                            <div className="modal-controls">
                                <button className="modal-btn close" onClick={closeDocumentModal}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div className="document-modal-body">
                            <iframe src={documentModal.url} title={documentModal.title} />
                        </div>
                    </div>
                </div>
            )}

            {/* Description Modal */}
            {descriptionModal.isOpen && (
                <div className="document-modal-overlay" onClick={() => setDescriptionModal({ isOpen: false, description: '' })}>
                    <div className="document-modal-container" style={{ height: 'auto', maxHeight: '80%', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Job Description</h3>
                            <button className="modal-btn close" onClick={() => setDescriptionModal({ isOpen: false, description: '' })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="document-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563', fontSize: '15px' }}>
                                {descriptionModal.description}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {detailsModal.isOpen && (
                <div className="document-modal-overlay" onClick={() => setDetailsModal({ isOpen: false, role: '', projects: '' })}>
                    <div className="document-modal-container" style={{ height: 'auto', maxHeight: '80%', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Employment Details</h3>
                            <button className="modal-btn close" onClick={() => setDetailsModal({ isOpen: false, role: '', projects: '' })}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="document-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
                            {detailsModal.role && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h5 style={{ color: '#1f2937', marginBottom: '10px' }}><strong>Role Description:</strong></h5>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563', fontSize: '15px' }}>
                                        {detailsModal.role}
                                    </div>
                                </div>
                            )}
                            {detailsModal.projects && (
                                <div>
                                    <h5 style={{ color: '#1f2937', marginBottom: '10px' }}><strong>Project Details:</strong></h5>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563', fontSize: '15px' }}>
                                        {detailsModal.projects}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showRejectConfirm && (
                <div className="document-modal-overlay" onClick={() => setShowRejectConfirm(false)}>
                    <div className="document-modal-container" style={{ height: 'auto', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="document-modal-header">
                            <h3>Confirm Rejection</h3>
                            <button className="modal-btn close" onClick={() => setShowRejectConfirm(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="document-modal-body" style={{ padding: '24px', textAlign: 'center' }}>
                            <i className="fas fa-exclamation-triangle" style={{ fontSize: '40px', color: '#f59e0b', marginBottom: '16px' }}></i>
                            <p style={{ fontSize: '16px', color: '#374151', marginBottom: '24px' }}>
                                Are you sure you want to reject this candidate?
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { updateApplicationStatus('rejected'); setShowRejectConfirm(false); }}
                                    style={{ padding: '8px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <i className=""></i> Yes
                                </button>
                                <button
                                    onClick={() => setShowRejectConfirm(false)}
                                    style={{ padding: '8px 24px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    <i className=""></i> No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TermsModal
                isOpen={showStatusTermsModal}
                onClose={() => setShowStatusTermsModal(false)}
                onAccept={handleAcceptStatusTerms}
                role="employerInterviewStatusUpdate"
            />
        </div>
    );
}

export default EmpCandidateReviewPage;
