import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../utils/popupNotification';
import { formatDate } from '../../../../utils/dateFormatter';
import { formatInterviewTime } from '../../../../utils/timeUtils';
import { formatTimeToAMPM } from '../../../../utils/dateFormatter';
// Route: /candidate/status

import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { getAssessmentOutcome } from "../../../../utils/assessmentOutcome";
import { getCanonicalStatusKey, getStatusLabel } from "../../../../utils/statusDisplay";
import { buildUtcDateTimeFromIst } from "../../../../utils/timezoneUtils";
import { formatJobTitle } from "../../../../utils/jobTitleFormatter";
import { pubRoute, publicUser, canRoute, candidate } from "../../../../globals/route-names";
import CanPostedJobs from "./can-posted-jobs";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import TermsModal from "../../../../components/TermsModal";
import PageLoader from "../../../../components/PageLoader";
import "./status-styles.css";
import "../../../../table-overflow-fix.css";

const APPLICATION_STATUS_FILTER_OPTIONS = [
	{ value: 'all', label: 'All Status' },
	{ value: 'shortlisted', label: 'Shortlisted' },
	{ value: 'interviewed', label: 'Interviewed' },
	{ value: 'offer_sent', label: 'Offer Letter Sent' },
	{ value: 'accepted', label: 'Offer Accepted' },
	{ value: 'hired', label: 'Hired' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'pending', label: 'Pending' },
];

const ASSESSMENT_CLOSE_AUTO_SUBMIT_MESSAGE = 'Closing the assessment tab is a violation. Your assessment has been submitted automatically.';
const ASSESSMENT_CLOSE_VIOLATION_TYPES = new Set(['assessment_close_confirmed', 'tab_close']);

const hasAssessmentCloseAutoSubmitViolation = (attempt = {}) =>
	Array.isArray(attempt?.violations) &&
	attempt.violations.some((violation) =>
		ASSESSMENT_CLOSE_VIOLATION_TYPES.has(String(violation?.type || '').trim().toLowerCase())
	);

function CanStatusPage() {
	const navigate = useNavigate();
	const { applicationId } = useParams();
	const isInterviewDetailsPage = !!applicationId;
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedStatus, setSelectedStatus] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [positionQuery, setPositionQuery] = useState('');
	const [activeTab, setActiveTab] = useState('applications');
	const [highlightShortlisted, setHighlightShortlisted] = useState(false);
	const [highlightCompanyPosition, setHighlightCompanyPosition] = useState(false);
	const [showRoundDetails, setShowRoundDetails] = useState(false);
	const [selectedRoundDetails, setSelectedRoundDetails] = useState(null);
	const [selectedRoundType, setSelectedRoundType] = useState(null);
	const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [showInterviewInstructionsModal, setShowInterviewInstructionsModal] = useState(false);
	const [pendingInterviewApplicationId, setPendingInterviewApplicationId] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const PAGE_SIZE = 10;

	const getEmployerDisplayCompanyName = (application) =>
		application?.employerId?.companyName ||
		application?.employerId?.brandName ||
		'Company Name Not Available';

	const normalizeStatusValue = (value) =>
		String(value || '')
			.trim()
			.toLowerCase()
			.replace(/[_-]+/g, ' ')
			.replace(/\s+/g, ' ');

	const normalizeRoundLookupKey = (value = '') =>
		String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

	const getBaseRoundType = (value = '') => String(value || '').split('_')[0];

	const getRoundTypeCount = (application, roundTypeRaw) => {
		const targetType = normalizeRoundLookupKey(getBaseRoundType(roundTypeRaw));
		if (!targetType) return 0;

		const job = application?.jobId || {};
		const orderedKeys = Array.isArray(job?.interviewRoundOrder) ? job.interviewRoundOrder : [];
		if (orderedKeys.length > 0) {
			const orderedCount = orderedKeys.filter((roundKey) => {
				const configuredType = job?.interviewRoundTypes?.[roundKey] || roundKey;
				return (
					normalizeRoundLookupKey(getBaseRoundType(configuredType)) === targetType ||
					normalizeRoundLookupKey(getBaseRoundType(roundKey)) === targetType
				);
			}).length;
			if (orderedCount > 0) return orderedCount;
		}

		const trackedProcesses = Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [];
		return trackedProcesses.filter((process) =>
			normalizeRoundLookupKey(getBaseRoundType(process?.type || process?.name)) === targetType
		).length;
	};

	const isDuplicateRoundType = (application, roundTypeRaw) => getRoundTypeCount(application, roundTypeRaw) > 1;

	const resolveTrackedRoundKey = (application, process = {}, processIndex = -1) => {
		const job = application?.jobId || {};
		const orderedKeys = Array.isArray(job?.interviewRoundOrder) ? job.interviewRoundOrder : [];
		const orderKey = processIndex >= 0 ? orderedKeys[processIndex] : null;
		const processType = process?.type || process?.stageType || '';
		const processTypeKey = normalizeRoundLookupKey(getBaseRoundType(processType || process?.name));

		if (orderKey) {
			const orderType = job?.interviewRoundTypes?.[orderKey] || orderKey;
			const orderTypeKey = normalizeRoundLookupKey(getBaseRoundType(orderType));
			const orderKeyBase = normalizeRoundLookupKey(getBaseRoundType(orderKey));
			if (!processTypeKey || processTypeKey === orderTypeKey || processTypeKey === orderKeyBase) {
				return orderKey;
			}
		}

		const processId = String(process?.id || process?._id || '').trim();
		if (processId) {
			if (orderedKeys.includes(processId) || job?.interviewRoundDetails?.[processId]) {
				return processId;
			}

			const initialMatch = processId.match(/^initial-(.+)-\d+$/);
			if (initialMatch?.[1]) {
				return initialMatch[1];
			}

			const normalizedProcessId = normalizeRoundLookupKey(processId);
			const containedOrderKey = orderedKeys.find((roundKey) => {
				const normalizedRoundKey = normalizeRoundLookupKey(roundKey);
				return normalizedRoundKey && normalizedProcessId.includes(normalizedRoundKey);
			});
			if (containedOrderKey) return containedOrderKey;

			return processId;
		}

		return processType || process?.name || '';
	};

	const getInterviewRoundIdForRound = (application, uniqueKey, roundTypeRaw, roundDetails = {}) => {
		const baseRoundType = getBaseRoundType(roundTypeRaw);
		const allowTypeFallback = !isDuplicateRoundType(application, roundTypeRaw || uniqueKey);
		return (
			application?.interviewRoundIds?.[uniqueKey] ||
			roundDetails?.interviewRoundId ||
			(allowTypeFallback
				? application?.interviewRoundIds?.[roundTypeRaw] || application?.interviewRoundIds?.[baseRoundType]
				: null) ||
			uniqueKey
		);
	};

	const processMatchesRound = (application, process, roundContext, processIndex = -1) => {
		if (!process) return false;
		const { uniqueKey, processId, roundId, roundType, roundName, index } = roundContext || {};

		// For duplicate round types, only match by position (index) or exact unique key.
		// Never fall back to type-based matching — that would make both rounds show the same status.
		const isDuplicate = isDuplicateRoundType(application, roundType);

		const normalizedUniqueKey = normalizeRoundLookupKey(uniqueKey);
		const normalizedProcessId = normalizeRoundLookupKey(processId || roundId);
		const processIdKey = normalizeRoundLookupKey(process?.id || process?._id);
		const processRoundKey = resolveTrackedRoundKey(application, process, processIndex);
		const normalizedProcessRoundKey = normalizeRoundLookupKey(processRoundKey);
		const exactIdentityMatches = Boolean(
			(normalizedProcessId && processIdKey && processIdKey === normalizedProcessId) ||
			(normalizedUniqueKey &&
				(normalizedProcessRoundKey === normalizedUniqueKey ||
					processIdKey === normalizedUniqueKey ||
					processIdKey.includes(normalizedUniqueKey)))
		);

		if (exactIdentityMatches) {
			return true;
		}

		// For duplicate round types: only position-based match is allowed
		const targetType = normalizeRoundLookupKey(getBaseRoundType(roundType));
		const processType = normalizeRoundLookupKey(getBaseRoundType(process?.type || process?.name));
		if (isDuplicate) {
			if (Number.isInteger(index) && index >= 0 && processIndex === index && (!targetType || processType === targetType)) {
				return true;
			}
			return false;
		}

		// Position-based match (same index + compatible type)
		if (Number.isInteger(index) && index >= 0 && processIndex === index && (!targetType || processType === targetType)) {
			return true;
		}

		const processName = normalizeRoundLookupKey(process?.name);
		const targetName = normalizeRoundLookupKey(roundName);
		return (
			(targetType && processType === targetType) ||
			(targetName && processName.includes(targetName))
		);
	};

	const findRelatedInterviewProcessIndex = (application, roundContext) => {
		const trackedProcesses = Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [];
		const { processId, roundId, roundType, index } = roundContext || {};
		const normalizedProcessId = normalizeRoundLookupKey(processId || roundId);
		if (normalizedProcessId) {
			const exactIndex = trackedProcesses.findIndex((process) =>
				normalizeRoundLookupKey(process?.id || process?._id) === normalizedProcessId
			);
			if (exactIndex !== -1) return exactIndex;
		}

		// For duplicate round types, always match strictly by position (index) to avoid
		// both rounds resolving to the same process entry.
		if (isDuplicateRoundType(application, roundType) && Number.isInteger(index) && index >= 0) {
			const targetType = normalizeRoundLookupKey(getBaseRoundType(roundType));
			if (trackedProcesses[index]) {
				const processType = normalizeRoundLookupKey(getBaseRoundType(trackedProcesses[index]?.type || trackedProcesses[index]?.name));
				if (!targetType || processType === targetType) {
					return index;
				}
			}
		}
		return trackedProcesses.findIndex((process, processIndex) =>
			processMatchesRound(application, process, roundContext, processIndex)
		);
	};

	const findRelatedInterviewProcess = (application, roundContext) => {
		const trackedProcesses = Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [];
		const processIndex = findRelatedInterviewProcessIndex(application, roundContext);
		return processIndex !== -1 ? trackedProcesses[processIndex] : null;
	};

	const findRelatedInterviewStage = (application, roundContext) => {
		const trackedStages = Array.isArray(application?.interviewProcess?.stages) ? application.interviewProcess.stages : [];
		const { uniqueKey, roundType, index } = roundContext || {};
		const normalizedUniqueKey = normalizeRoundLookupKey(uniqueKey);
		const targetType = normalizeRoundLookupKey(getBaseRoundType(roundType));
		const isDuplicate = isDuplicateRoundType(application, roundType);

		return trackedStages.find((stage, stageIndex) => {
			const stageKey = normalizeRoundLookupKey(stage?._id || stage?.id || stage?.key);
			if (normalizedUniqueKey && stageKey === normalizedUniqueKey) return true;

			const stageType = normalizeRoundLookupKey(getBaseRoundType(stage?.stageType || stage?.type));
			const isSamePosition = Number.isInteger(index) && index >= 0
				? stageIndex === index || Number(stage?.stageOrder || 0) === index + 1
				: false;
			if (isSamePosition && (!targetType || stageType === targetType)) return true;
			// For duplicate round types never fall back to type-only matching
			if (isDuplicate) return false;
			return targetType && stageType === targetType;
		}) || null;
	};

	const isDeferredInterviewAttendanceStatus = (value, isAssessment = false) => {
		const normalized = normalizeStatusValue(value);
		if (!normalized) return false;
		// For assessment rounds, no_show/expired are auto-derived and deferred
		// For manual interview rounds (set by employer), no_show is intentional and should be shown
		if (!isAssessment) return false;
		return ['no show', 'expired', 'session expired'].includes(normalized);
	};

	const isRejectedInterviewProcessStatus = (value) => {
		const normalized = normalizeStatusValue(value);
		if (!normalized) return false;

		return [
			'rejected',
			'not advanced to next stage',
			'not advanced to next round',
			'failed',
			'fail',
			'field',
			'no show',
			'no_show',
			'expired',
			'suspended',
			'session expired',
			'not eligibal for next round',
			'not eligible for next round'
		].includes(normalized);
	};

	const isPositiveInterviewProcessStatus = (value) => {
		const normalized = normalizeStatusValue(value);
		if (!normalized) return false;

		return [
			'shortlisted for next round',
			'shortlisted',
			'selected'
		].includes(normalized);
	};

	const isAssessmentAttemptDerivedStatus = (value) => {
		const normalized = normalizeStatusValue(value);
		if (!normalized) return false;

		return [
			'passed',
			'failed',
			'completed',
			'in progress',
			'expired',
			'suspended',
			'session expired',
			'no show'
		].includes(normalized);
	};

	const isAssessmentEmployerDecisionStatus = (value) => {
		const normalized = normalizeStatusValue(value);
		if (!normalized) return false;

		return [
			'shortlisted for next round',
			'shortlisted',
			'selected',
			'on hold',
			'pending decision',
			'no show',
			'rejected',
			'not advanced to next stage',
			'not advanced to next round'
		].includes(normalized);
	};

	const getApplicationOnlyStatus = (application = {}) => {
		const rawStatus = getCanonicalStatusKey(application?.status || 'pending');
		if (['accepted', 'hired', 'offer_sent'].includes(rawStatus)) {
			return rawStatus;
		}
		const derivedStatus = getCanonicalStatusKey(
			application?.applicationStatus ||
				application?.applicationDisplayStatus ||
				application?.displayStatus ||
				'',
			''
		);
		if (derivedStatus) {
			return derivedStatus;
		}
		if (rawStatus === 'rejected') {
			return rawStatus;
		}
		const rounds = getInterviewRounds(application?.jobId, application);
		if (
			Array.isArray(rounds) &&
			rounds.some((round, roundIndex) => getBlockingRoundStatus(application, round, roundIndex, rounds))
		) {
			return 'rejected';
		}
		return rawStatus || 'pending';
	};

	const formatStatusLabel = (status) => getStatusLabel(status);

	const getApplicationFilterStatus = (application = {}) => getApplicationOnlyStatus(application);

	const getAssessmentScheduleSource = (job, roundDetails = null) => ({
		startDate: roundDetails?.fromDate || roundDetails?.date || job?.assessmentStartDate || null,
		endDate: roundDetails?.toDate || roundDetails?.fromDate || roundDetails?.date || job?.assessmentEndDate || null,
		startTime: roundDetails?.startTime || job?.assessmentStartTime || null,
		endTime: roundDetails?.endTime || job?.assessmentEndTime || null
	});

	const getAssessmentWindowInfo = (job, roundDetails = null) => {
		const now = Date.now();
		const scheduleSource = getAssessmentScheduleSource(job, roundDetails);
		const startDate = scheduleSource.startDate
			? buildUtcDateTimeFromIst(scheduleSource.startDate, scheduleSource.startTime || '', 'start')
			: null;
		const endDate = scheduleSource.endDate
			? buildUtcDateTimeFromIst(scheduleSource.endDate, scheduleSource.endTime || '', 'end')
			: null;

		const isBeforeStart = startDate ? now < startDate.getTime() : false;
		const isAfterEnd = endDate ? now > endDate.getTime() : false;
		return {
			isBeforeStart,
			isAfterEnd,
			isWithinWindow: startDate && endDate ? (now >= startDate.getTime() && now <= endDate.getTime()) : !isBeforeStart && !isAfterEnd,
			startDate,
			endDate
		};
	};

	const normalizeAssessmentId = (value) => {
		if (!value) return '';
		if (typeof value === 'object') {
			return String(value?._id || value?.id || '').trim();
		}
		return String(value).trim();
	};

	const getAssessmentRoundOrderKeys = (job = {}) =>
		(Array.isArray(job?.interviewRoundOrder) ? job.interviewRoundOrder : []).filter(
			(key) => String(job?.interviewRoundTypes?.[key] || '').toLowerCase() === 'assessment'
		);

	const getTrackedAssessmentProcess = (application = {}, roundDetails = null) => {
		const embeddedProcesses = Array.isArray(application?.interviewProcesses) ? application.interviewProcesses : [];
		const stageProcesses = Array.isArray(application?.interviewProcess?.stages)
			? application.interviewProcess.stages.map((stage) => ({
				id: stage?._id,
				name: stage?.stageName,
				type: stage?.stageType,
				status: stage?.status,
				assessmentId: stage?.assessmentId,
				assessmentAttemptId: stage?.assessmentAttemptId
			}))
			: [];
		const trackedProcesses = embeddedProcesses.length > 0
			? embeddedProcesses
			: stageProcesses;
		if (trackedProcesses.length === 0) {
			return null;
		}

		const requestedKey = String(roundDetails?.__uniqueKey || '').trim();
		const requestedAssessmentId = normalizeAssessmentId(roundDetails?.assessmentId);
		const roundIndex = typeof roundDetails?.__roundIndex === 'number' ? roundDetails.__roundIndex : null;
		const assessmentOrderIndex = typeof roundDetails?.__assessmentOrderIndex === 'number'
			? roundDetails.__assessmentOrderIndex
			: null;
		const assessmentProcesses = trackedProcesses.filter((process) => {
			const normalizedType = normalizeStatusValue(process?.type);
			const normalizedName = normalizeStatusValue(process?.name);
			return normalizedType === 'assessment' || normalizedName.includes('assessment');
		});

		if (requestedAssessmentId) {
			const matchedByAssessmentId = assessmentProcesses.find(
				(process) => normalizeAssessmentId(process?.assessmentId) === requestedAssessmentId
			);
			if (matchedByAssessmentId) {
				return matchedByAssessmentId;
			}
		}

		if (requestedKey) {
			const matchedById = assessmentProcesses.find((process) => String(process?.id || '').trim() === requestedKey);
			if (matchedById) {
				return matchedById;
			}
		}

		if (roundIndex !== null) {
			const matchedByIndex = trackedProcesses[roundIndex];
			if (matchedByIndex && (normalizeStatusValue(matchedByIndex?.type) === 'assessment' || normalizeStatusValue(matchedByIndex?.name).includes('assessment'))) {
				return matchedByIndex;
			}
		}

		if (assessmentOrderIndex !== null && assessmentProcesses[assessmentOrderIndex]) {
			return assessmentProcesses[assessmentOrderIndex];
		}

		return assessmentProcesses.length === 1 ? assessmentProcesses[0] : null;
	};

	const getTrackedAssessmentDecisionStatus = (application = {}, roundDetails = null) => {
		const trackedProcess = getTrackedAssessmentProcess(application, roundDetails);
		const trackedStatus = trackedProcess?.status || '';
		return isAssessmentEmployerDecisionStatus(trackedStatus) ? trackedStatus : '';
	};

	const getAssessmentCompletionInfo = (source = {}) => {
		const status = String(source?.assessmentStatus ?? source?.assessmentAttemptStatus ?? source?.status ?? '').toLowerCase();
		const result = String(source?.assessmentResult ?? source?.result ?? '').toLowerCase();
		const outcome = getAssessmentOutcome({ status, result });

		return {
			status,
			normalizedStatus: outcome.normalizedStatus,
			result,
			isPassed: outcome.isPassed,
			isFailed: outcome.isFailed,
			isNoShow: outcome.isNoShow,
			isCompleted: outcome.isCompleted,
			isExpired: outcome.isExpired,
			isInProgress: outcome.isInProgress,
			isSuspended: outcome.isSuspended
		};
	};

	const getAssessmentRoundInfo = (application = {}, roundName = 'Assessment', roundDetails = null) => {
		const stageOrder = typeof roundDetails?.__roundIndex === 'number' ? roundDetails.__roundIndex + 1 : null;
		const stages = Array.isArray(application?.interviewProcess?.stages) ? application.interviewProcess.stages : [];
		const assessmentStages = stages.filter((stage) => stage?.stageType === 'assessment');
		const totalAssessmentRounds = Math.max(
			assessmentStages.length,
			getAssessmentRoundOrderKeys(application?.jobId).length
		);
		const requestedAssessmentId = normalizeAssessmentId(roundDetails?.assessmentId);

		let relatedStage = null;
		if (requestedAssessmentId) {
			relatedStage = assessmentStages.find((stage) => normalizeAssessmentId(stage?.assessmentId) === requestedAssessmentId) || null;
		}
		if (!relatedStage && stageOrder !== null) {
			relatedStage = assessmentStages.find((stage) => Number(stage?.stageOrder) === stageOrder) || null;
		}
		if (!relatedStage && assessmentStages.length === 1) {
			relatedStage = assessmentStages[0];
		}

		const attemptsByAssessmentId = application?.assessmentAttemptsByAssessmentId || {};
		const knownAssessmentIds = Array.from(new Set([
			...assessmentStages.map((stage) => normalizeAssessmentId(stage?.assessmentId)),
			...Object.keys(attemptsByAssessmentId || {}),
			normalizeAssessmentId(application?.jobId?.assessmentId)
		].filter(Boolean)));

		const fallbackAssessmentId = totalAssessmentRounds <= 1 && knownAssessmentIds.length <= 1 ? knownAssessmentIds[0] || '' : '';
		const assessmentId =
			requestedAssessmentId ||
			normalizeAssessmentId(relatedStage?.assessmentId) ||
			fallbackAssessmentId;
		const attempt = assessmentId ? attemptsByAssessmentId[assessmentId] || null : null;

		const shouldUseApplicationFallback =
			totalAssessmentRounds <= 1 &&
			knownAssessmentIds.length <= 1 &&
			(!assessmentId || assessmentId === normalizeAssessmentId(application?.jobId?.assessmentId));

		const trackedAssessmentDecisionStatus = getTrackedAssessmentDecisionStatus(application, roundDetails);

		const applicationFallbackStatus = shouldUseApplicationFallback
			? String(application?.assessmentStatus || '').toLowerCase()
			: '';
		const stageStatus = String(relatedStage?.status || '').toLowerCase();
		const shouldPreferApplicationStatus =
			Boolean(applicationFallbackStatus) &&
			['', 'pending', 'scheduled', 'not_started', 'available'].includes(stageStatus) &&
			['suspended', 'expired', 'session_expired', 'session expired', 'no_show', 'no show', 'in_progress', 'completed', 'passed', 'failed'].includes(applicationFallbackStatus);

		const completionInfo = getAssessmentCompletionInfo({
			status:
				(trackedAssessmentDecisionStatus && !isAssessmentAttemptDerivedStatus(trackedAssessmentDecisionStatus)
					? trackedAssessmentDecisionStatus
					: '') ||
				attempt?.status ||
				relatedStage?.assessmentAttemptStatus ||
				(shouldPreferApplicationStatus ? applicationFallbackStatus : relatedStage?.status) ||
				applicationFallbackStatus,
			result: attempt?.result || relatedStage?.assessmentResult || (shouldUseApplicationFallback ? application?.assessmentResult : '')
		});

		return {
			assessmentId,
			attempt,
			relatedStage,
			trackedDecisionStatus: trackedAssessmentDecisionStatus,
			completionInfo,
			score: attempt?.score ?? relatedStage?.assessmentScore ?? (shouldUseApplicationFallback ? application?.assessmentScore : null),
			percentage: attempt?.percentage ?? relatedStage?.assessmentPercentage ?? (shouldUseApplicationFallback ? application?.assessmentPercentage : null),
			roundName
		};
	};

	const resolveRoundDetails = (application, round, roundIndex, roundsList = []) => {
		const roundName = typeof round === 'string' ? round : round?.name;
		const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round?.uniqueKey;
		const roundTypeRaw = typeof round === 'object' ? round?.roundType : round?.toLowerCase();
		const roundAssessmentId = normalizeAssessmentId(typeof round === 'object' ? round?.assessmentId : '');
		const normalized = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
		const job = application?.jobId || {};
		const allDetails = job?.interviewRoundDetails || {};
		const detailEntries = Object.entries(allDetails);
		const baseRoundType = String(roundTypeRaw || '').split('_')[0];
		const allowTypeFallback = !isDuplicateRoundType(application, roundTypeRaw || uniqueKey);
		const mappedRoundId =
			application?.interviewRoundIds?.[uniqueKey] ||
			(allowTypeFallback
				? application?.interviewRoundIds?.[roundTypeRaw] || application?.interviewRoundIds?.[baseRoundType]
				: null) ||
			null;

		const assessmentRoundIndex = roundsList
			.slice(0, roundIndex + 1)
			.filter((listRound) => {
				const type = typeof listRound === 'object' ? listRound?.roundType : listRound;
				return String(type || '').toLowerCase().includes('assessment');
			}).length - 1;

		const orderedAssessmentKeys = roundName === 'Assessment' ? getAssessmentRoundOrderKeys(job) : [];
		const orderedAssessmentKey = assessmentRoundIndex >= 0 ? orderedAssessmentKeys[assessmentRoundIndex] : null;

		const findAssessmentDetailsById = (assessmentId) => {
			if (!assessmentId) return null;
			const matchedEntry = detailEntries.find(([, details]) => normalizeAssessmentId(details?.assessmentId) === assessmentId);
			return matchedEntry ? matchedEntry[1] : null;
		};

		let roundDetails = null;

		if (roundName === 'Assessment') {
			roundDetails =
				findAssessmentDetailsById(roundAssessmentId) ||
				(orderedAssessmentKey ? allDetails[orderedAssessmentKey] : null) ||
				allDetails[uniqueKey] ||
				null;

			if (!roundDetails && orderedAssessmentKeys.length <= 1) {
				roundDetails =
					allDetails[roundTypeRaw] ||
					allDetails[baseRoundType] ||
					(mappedRoundId ? allDetails[String(mappedRoundId)] : null) ||
					null;
			}
		} else {
			roundDetails =
				allDetails[uniqueKey] ||
				(mappedRoundId ? allDetails[String(mappedRoundId)] : null) ||
				(allowTypeFallback ? allDetails[roundTypeRaw] || allDetails[baseRoundType] : null) ||
				null;
		}

		if (!roundDetails) {
			for (const [key, details] of detailEntries) {
				const keyNorm = normalized(key);
				const uniqueKeyNorm = normalized(uniqueKey);
				const typeNorm = normalized(roundTypeRaw);
				const baseTypeNorm = normalized(baseRoundType);
				const detailTypeNorm = normalized(details?.roundType || details?.key || details?.name || '');
				const detailRoundId = details?.interviewRoundId ? String(details.interviewRoundId) : '';
				const mappedId = mappedRoundId ? String(mappedRoundId) : '';
				const exactMatches =
					(uniqueKeyNorm && (
						keyNorm === uniqueKeyNorm ||
						normalized(details?.key || '') === uniqueKeyNorm ||
						normalized(details?.interviewRoundId || '') === uniqueKeyNorm
					)) ||
					(mappedId && detailRoundId && mappedId === detailRoundId) ||
					(mappedId && key === mappedId);
				const matches =
					exactMatches ||
					(allowTypeFallback && (
						(keyNorm && ((typeNorm && keyNorm.includes(typeNorm)) || (baseTypeNorm && keyNorm.includes(baseTypeNorm)))) ||
						(detailTypeNorm && (detailTypeNorm === typeNorm || detailTypeNorm === baseTypeNorm))
					));
				if (matches && details) {
					roundDetails = details;
					break;
				}
			}
		}

		if (roundName === 'Assessment') {
			if ((!roundDetails || !roundDetails.assessmentId) && orderedAssessmentKey && allDetails[orderedAssessmentKey]) {
				roundDetails = allDetails[orderedAssessmentKey];
			}

			if (!roundDetails) {
				const assessmentKeys = ['assessment', 'Assessment', 'technical_assessment', 'online_assessment'];
				for (const key of assessmentKeys) {
					if (allDetails[key]) {
						roundDetails = allDetails[key];
						break;
					}
				}
			}

			if (!roundDetails && orderedAssessmentKeys.length <= 1 && job?.assessmentId) {
				roundDetails = {
					description: job.assessmentInstructions || 'Complete the technical assessment within the given timeframe',
					fromDate: job.assessmentStartDate,
					toDate: job.assessmentEndDate,
					assessmentId: job.assessmentId
				};
			}
		}

		return {
			...(roundDetails || {}),
			__uniqueKey: uniqueKey,
			__processId: typeof round === 'object' ? (round?.processId || round?.id || round?._id || '') : '',
			__roundType: roundTypeRaw,
			__roundName: roundName,
			__roundIndex: roundIndex,
			__roundStatus: typeof round === 'object' ? round?.status : '',
			__assessmentOrderIndex: assessmentRoundIndex
		};
	};

	const getBlockingRoundStatus = (application, round, roundIndex, roundsList = []) => {
		const roundName = typeof round === 'string' ? round : round?.name;
		const roundDetails = resolveRoundDetails(application, round, roundIndex, roundsList);
		const directStatuses = [
			typeof round === 'object' ? round?.status : '',
			roundDetails?.__roundStatus
		];

		const relatedProcess = findRelatedInterviewProcess(application, {
			uniqueKey: roundDetails?.__uniqueKey,
			processId: roundDetails?.__processId,
			roundType: roundDetails?.__roundType,
			roundName,
			index: roundIndex
		});
		const relatedStage = findRelatedInterviewStage(application, {
			uniqueKey: roundDetails?.__uniqueKey,
			roundType: roundDetails?.__roundType,
			index: roundIndex
		});

		directStatuses.push(relatedProcess?.status, relatedStage?.status);

		if (roundName === 'Assessment') {
			const assessmentInfo = getAssessmentRoundInfo(application, roundName, roundDetails);
			const completionInfo = assessmentInfo?.completionInfo || {};
			const windowInfo = getAssessmentWindowInfo(application?.jobId, roundDetails);
			directStatuses.push(
				assessmentInfo?.trackedDecisionStatus,
				completionInfo.status,
				completionInfo.result
			);

			if (
				completionInfo.isFailed ||
				completionInfo.isNoShow ||
				completionInfo.isExpired ||
				completionInfo.isSuspended
			) {
				return 'rejected';
			}

			if (
				windowInfo?.isAfterEnd &&
				!completionInfo.isCompleted &&
				!completionInfo.isInProgress &&
				!completionInfo.isSuspended
			) {
				return 'rejected';
			}
		}

		return directStatuses.find((status) => isRejectedInterviewProcessStatus(status)) || '';
	};

	const hasRejectedPriorRound = (application, roundIndex, roundsList = null) => {
		if (!application || roundIndex <= 0) return false;
		const resolvedRounds =
			Array.isArray(roundsList) && roundsList.length > 0
				? roundsList
				: getInterviewRounds(application?.jobId, application);

		for (let index = 0; index < roundIndex; index += 1) {
			if (getBlockingRoundStatus(application, resolvedRounds[index], index, resolvedRounds)) {
				return true;
			}
		}

		return false;
	};

	const getRoundActivationState = (application, roundIndex, roundsList = null) => {
		if (!application || roundIndex <= 0) {
			return {
				canStart: false,
				previousAssessmentFailed: false
			};
		}

		const resolvedRounds =
			Array.isArray(roundsList) && roundsList.length > 0
				? roundsList
				: getInterviewRounds(application?.jobId, application);
		const previousRound = resolvedRounds?.[roundIndex - 1];

		if (!previousRound) {
			return {
				canStart: false,
				previousAssessmentFailed: false
			};
		}

		if (hasRejectedPriorRound(application, roundIndex, resolvedRounds)) {
			return {
				canStart: false,
				previousAssessmentFailed: true
			};
		}

		const previousRoundName = typeof previousRound === 'string' ? previousRound : previousRound?.name;
		const normalizeType = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
		const previousRoundTypeRaw =
			typeof previousRound === 'object'
				? previousRound?.roundType
				: previousRoundName?.toLowerCase();
		const previousRoundType = normalizeType(previousRoundTypeRaw);
		const previousRoundKey = typeof previousRound === 'object' ? previousRound?.uniqueKey : previousRoundType;
		const previousRelatedProcess = findRelatedInterviewProcess(application, {
			uniqueKey: previousRoundKey,
			processId: typeof previousRound === 'object' ? (previousRound.processId || previousRound.id || previousRound._id) : '',
			roundType: previousRoundTypeRaw,
			roundName: previousRoundName,
			index: roundIndex - 1
		});
		const previousRelatedStage = findRelatedInterviewStage(application, {
			uniqueKey: previousRoundKey,
			roundType: previousRoundTypeRaw,
			index: roundIndex - 1
		});
		const previousProcessStatus = normalizeStatusValue(previousRelatedProcess?.status);
		const previousStageStatus = normalizeStatusValue(previousRelatedStage?.status);
		const previousLegacyRound = Array.isArray(application?.interviewRounds)
			? application.interviewRounds.find((round) => Number(round?.round) === roundIndex)
			: null;
		const previousLegacyRoundStatus = normalizeStatusValue(previousLegacyRound?.status);

		if (previousRoundName === 'Assessment') {
			const previousRoundDetails = resolveRoundDetails(application, previousRound, roundIndex - 1, resolvedRounds);
			const previousAssessmentInfo = getAssessmentRoundInfo(application, previousRoundName, previousRoundDetails);
			const completionInfo = previousAssessmentInfo?.completionInfo || {};
			const trackedDecisionStatus = normalizeStatusValue(previousAssessmentInfo?.trackedDecisionStatus);
			if (trackedDecisionStatus) {
				const previousAssessmentFailed = isRejectedInterviewProcessStatus(trackedDecisionStatus);
				return {
					canStart: isPositiveInterviewProcessStatus(trackedDecisionStatus) && !previousAssessmentFailed,
					previousAssessmentFailed
				};
			}
			if (getTrackedAssessmentProcess(application, previousRoundDetails)) {
				return {
					canStart: false,
					previousAssessmentFailed: false
				};
			}
			const assessmentStatus = normalizeStatusValue(completionInfo.status);
			const previousAssessmentFailed = Boolean(completionInfo.isFailed);
			const previousAssessmentPassed = Boolean(completionInfo.isPassed);
			const previousCompleted = ['completed', 'passed', 'failed', 'expired', 'session expired', 'no show'].includes(assessmentStatus);

			return {
				canStart: previousCompleted && previousAssessmentPassed && !previousAssessmentFailed,
				previousAssessmentFailed
			};
		}

		const hasPositiveProgress =
			isPositiveInterviewProcessStatus(previousProcessStatus) ||
			isPositiveInterviewProcessStatus(previousStageStatus) ||
			previousLegacyRoundStatus === 'passed';
		const hasRejectedProgress =
			isRejectedInterviewProcessStatus(previousProcessStatus) ||
			isRejectedInterviewProcessStatus(previousStageStatus) ||
			previousLegacyRoundStatus === 'failed';

		return {
			canStart: hasPositiveProgress && !hasRejectedProgress,
			previousAssessmentFailed: false
		};
	};

	const getInterviewRoundWindowInfo = (roundDetails) => {
		const now = new Date();
		if (!roundDetails) {
			return {
				startDate: null,
				endDate: null,
				isBeforeStart: false,
				isAfterEnd: false,
				isWithinWindow: true
			};
		}

		const parseBaseDate = (value) => {
			if (!value) return null;
			const parsed = new Date(value);
			return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
		};

		const applyTimeToDate = (dateObj, timeValue, isEnd = false) => {
			if (!dateObj) return null;
			return buildUtcDateTimeFromIst(dateObj, timeValue || '', isEnd ? 'end' : 'start');
		};

		const startBase = parseBaseDate(roundDetails.fromDate || roundDetails.date);
		const endBase = parseBaseDate(roundDetails.toDate || roundDetails.date);
		const stageList =
			roundDetails.subStages ||
			roundDetails.subStagesArray ||
			roundDetails.days ||
			roundDetails.daysArray ||
			[];
		const stageWindows = Array.isArray(stageList)
			? stageList
				.map((stage) => {
					const stageDate = parseBaseDate(stage?.fromDate || stage?.fromdate || stage?.date);
					return {
						start: applyTimeToDate(stageDate, stage?.startTime, false),
						end: applyTimeToDate(stageDate, stage?.endTime, true)
					};
				})
				.filter((window) => window.start || window.end)
			: [];

		const baseStartDate = applyTimeToDate(startBase, roundDetails.startTime, false);
		const baseEndDate = applyTimeToDate(endBase, roundDetails.endTime, true);
		const stageStartDates = stageWindows.map((window) => window.start).filter(Boolean);
		const stageEndDates = stageWindows.map((window) => window.end).filter(Boolean);
		const startDate = [baseStartDate, ...stageStartDates]
			.filter(Boolean)
			.sort((a, b) => a.getTime() - b.getTime())[0] || null;
		const endDate = [baseEndDate, ...stageEndDates]
			.filter(Boolean)
			.sort((a, b) => b.getTime() - a.getTime())[0] || null;
		const isBeforeStart = startDate ? now < startDate : false;
		const isAfterEnd = endDate ? now > endDate : false;

		return {
			startDate,
			endDate,
			isBeforeStart,
			isAfterEnd,
			isWithinWindow: startDate && endDate ? now >= startDate && now <= endDate : !isBeforeStart && !isAfterEnd
		};
	};

	const normalizeBookedSlotForDisplay = (slot, fallbackDate = null) => {
		if (!slot) return null;
		const date = slot.date || slot.fromDate || slot.toDate || slot.day || slot.interviewDate || fallbackDate;
		const startTime = slot.startTime || slot.start || slot.fromTime || slot.interviewTime?.start || '';
		const endTime = slot.endTime || slot.end || slot.toTime || slot.interviewTime?.end || '';
		const interviewerName = slot.interviewerName || slot.interviewer || slot.HR || slot.interviewerId?.name || '';

		if (!date || !startTime || !endTime) return null;

		return {
			date,
			startTime,
			endTime,
			interviewerName
		};
	};

	const extractBookedSlot = (roundDetails, candidateId, bookedSlots = [], roundId = null) => {
		if (!roundDetails) return null;

		const candidateIdentity = (() => {
			const ids = new Set();
			const emails = new Set();
			const names = new Set();

			const addId = (value) => {
				if (!value) return;
				const normalized = String(value).trim();
				if (normalized) ids.add(normalized);
			};

			const addEmail = (value) => {
				if (!value) return;
				const normalized = String(value).trim().toLowerCase();
				if (normalized) emails.add(normalized);
			};

			const addName = (value) => {
				if (!value) return;
				const normalized = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
				if (normalized) names.add(normalized);
			};

			const addCandidateLikeObject = (value) => {
				if (!value) return;
				if (typeof value !== 'object') {
					addId(value);
					return;
				}

				addId(value._id || value.id || value.candidateId || value.userId || value.user?._id || value.profile?._id);
				addEmail(
					value.email ||
					value.emailAddress ||
					value.applicantEmail ||
					value.candidateEmail ||
					value.user?.email ||
					value.profile?.email
				);
				addName(value.name || value.fullName || value.username || value.applicantName || value.candidateName);
				addName([value.firstName, value.middleName, value.lastName].filter(Boolean).join(' '));

				if (value.candidateId && value.candidateId !== value) {
					addCandidateLikeObject(value.candidateId);
				}
				if (value.user && value.user !== value) {
					addCandidateLikeObject(value.user);
				}
				if (value.profile && value.profile !== value) {
					addCandidateLikeObject(value.profile);
				}
				if (value.candidateProfile && value.candidateProfile !== value) {
					addCandidateLikeObject(value.candidateProfile);
				}
			};

			addCandidateLikeObject(candidateId);

			try {
				const storedCandidateUser = JSON.parse(localStorage.getItem('candidateUser') || '{}');
				addCandidateLikeObject(storedCandidateUser);
				addId(localStorage.getItem('candidateId'));
			} catch (error) {
				// Ignore malformed local storage; slot detection can still rely on application data.
			}

			return { ids, emails, names };
		})();
		const parseTimeParts = (value) => {
			if (!value) return null;
			const matches = String(value).match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
			if (!matches) return null;
			let hours = Number(matches[1]);
			const minutes = Number(matches[2]);
			const meridian = matches[3]?.toUpperCase();
			if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
			if (meridian === 'PM' && hours < 12) hours += 12;
			if (meridian === 'AM' && hours === 12) hours = 0;
			return { hours, minutes };
		};

		const normalizeTimeValue = (value) => {
			const parts = parseTimeParts(value);
			if (!parts) return value;
			return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`;
		};
		const isCandidateMatch = (value) => {
			if (!value || candidateIdentity.ids.size === 0) return false;
			const raw = String(value).trim();
			if (!raw) return false;
			return Array.from(candidateIdentity.ids).some((candidateValue) => raw === candidateValue || raw.includes(candidateValue));
		};

		const isCandidateEmailMatch = (value) => {
			if (!value || candidateIdentity.emails.size === 0) return false;
			return candidateIdentity.emails.has(String(value).trim().toLowerCase());
		};

		const isCandidateNameMatch = (value) => {
			if (!value || candidateIdentity.names.size === 0) return false;
			const normalized = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
			return candidateIdentity.names.has(normalized);
		};

		const hasSlotShape = (obj) =>
			obj && (obj.startTime || obj.start || obj.fromTime) && (obj.endTime || obj.end || obj.toTime);

		const normalizeSlot = (obj, fallbackDate) => {
			if (!obj) return null;
			const date = obj.date || obj.fromDate || obj.toDate || obj.day || obj.interviewDate || fallbackDate;
			const startTime = normalizeTimeValue(obj.startTime || obj.start || obj.fromTime || obj.interviewTime?.start);
			const endTime = normalizeTimeValue(obj.endTime || obj.end || obj.toTime || obj.interviewTime?.end);
			const interviewerName = obj.interviewerName || obj.interviewer || obj.HR || obj.interviewerId?.name;
			if (!date || !startTime || !endTime) return null;
			return { date, startTime, endTime, interviewerName };
		};

		const scanValue = (value, fallbackDate) => {
			if (!value) return null;
			if (Array.isArray(value)) {
				for (const item of value) {
					const found = scanValue(item, fallbackDate);
					if (found) return found;
				}
				return null;
			}
			if (typeof value === 'object') {
				// Direct candidate match
				const candidateFields = ['candidateId', 'candidate', 'candidate_id', 'applicantId', 'userId', 'user_id', 'bookedBy'];
				const candidateEmailFields = ['candidateEmail', 'email', 'applicantEmail', 'bookedEmail'];
				const candidateNameFields = ['candidateName', 'name', 'applicantName', 'bookedName'];
				const matched =
					candidateFields.some((key) => isCandidateMatch(value[key])) ||
					candidateEmailFields.some((key) => isCandidateEmailMatch(value[key])) ||
					candidateNameFields.some((key) => isCandidateNameMatch(value[key]));
				if (matched && hasSlotShape(value)) {
					return normalizeSlot(value, fallbackDate);
				}

				// Common nested slot containers
				const nestedKeys = [
					'bookedSlot', 'bookedSlots', 'slots', 'schedules', 'schedulesArray',
					'daySchedules', 'daySchedulesArray', 'rooms', 'roomsArray', 'schedule', 'Schedule'
				];
				for (const key of nestedKeys) {
					if (value[key]) {
						const found = scanValue(value[key], value.date || fallbackDate);
						if (found) return found;
					}
				}
			}
			return null;
		};

		const scheduleObject = roundDetails.scheduleObject || {};
		const schedule = roundDetails.schedule || {};
		const legacySchedule = roundDetails.Schedule || {};
		const nestedScheduleObject = scheduleObject.schedule || scheduleObject.Schedule || {};
		const nestedSchedule = schedule.schedule || schedule.Schedule || {};
		const nestedLegacySchedule = legacySchedule.schedule || legacySchedule.Schedule || {};
		const sources = [
			roundDetails,
			roundDetails.Schedule,
			roundDetails.schedulesArray,
			roundDetails.schedules,
			roundDetails.daySchedulesArray,
			roundDetails.daySchedules,
			roundDetails.roomsArray,
			roundDetails.rooms,
			scheduleObject,
			scheduleObject.Schedule,
			scheduleObject.schedulesArray,
			scheduleObject.schedules,
			scheduleObject.daySchedulesArray,
			scheduleObject.daySchedules,
			scheduleObject.roomsArray,
			scheduleObject.rooms,
			nestedScheduleObject,
			nestedScheduleObject.Schedule,
			schedule,
			schedule.Schedule,
			schedule.schedulesArray,
			schedule.schedules,
			schedule.daySchedulesArray,
			schedule.daySchedules,
			schedule.roomsArray,
			schedule.rooms,
			nestedSchedule,
			nestedSchedule.Schedule,
			legacySchedule,
			legacySchedule.schedulesArray,
			legacySchedule.schedules,
			legacySchedule.daySchedulesArray,
			legacySchedule.daySchedules,
			legacySchedule.roomsArray,
			legacySchedule.rooms,
			nestedLegacySchedule,
			nestedLegacySchedule.Schedule,
			bookedSlots
		];

		for (const src of sources) {
			const found = scanValue(src, roundDetails.fromDate || roundDetails.date);
			if (found) return found;
		}
		if (Array.isArray(bookedSlots) && bookedSlots.length > 0) {
			const normalizedRoundId = roundId ? String(roundId) : null;
			const matched = bookedSlots.find((slot) => {
				if (normalizedRoundId && slot.roundId) {
					return String(slot.roundId) === normalizedRoundId;
				}
				return false;
			});
			if (matched) {
				return normalizeSlot(matched, matched.date || roundDetails.fromDate || roundDetails.date);
			}
		}
		return null;
	};

	const hasBookedReferenceForCandidate = (roundDetails, candidateId, bookedSlots = []) => {
		if (!roundDetails) return false;

		const candidateIdentity = (() => {
			const ids = new Set();
			const emails = new Set();
			const names = new Set();

			const addId = (value) => {
				if (!value) return;
				const normalized = String(value).trim();
				if (normalized) ids.add(normalized);
			};

			const addEmail = (value) => {
				if (!value) return;
				const normalized = String(value).trim().toLowerCase();
				if (normalized) emails.add(normalized);
			};

			const addName = (value) => {
				if (!value) return;
				const normalized = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
				if (normalized) names.add(normalized);
			};

			const addCandidateLikeObject = (value) => {
				if (!value) return;
				if (typeof value !== 'object') {
					addId(value);
					return;
				}

				addId(value._id || value.id || value.candidateId || value.userId || value.user?._id || value.profile?._id);
				addEmail(
					value.email ||
					value.emailAddress ||
					value.applicantEmail ||
					value.candidateEmail ||
					value.user?.email ||
					value.profile?.email
				);
				addName(value.name || value.fullName || value.username || value.applicantName || value.candidateName);
				addName([value.firstName, value.middleName, value.lastName].filter(Boolean).join(' '));

				if (value.candidateId && value.candidateId !== value) addCandidateLikeObject(value.candidateId);
				if (value.user && value.user !== value) addCandidateLikeObject(value.user);
				if (value.profile && value.profile !== value) addCandidateLikeObject(value.profile);
				if (value.candidateProfile && value.candidateProfile !== value) addCandidateLikeObject(value.candidateProfile);
			};

			addCandidateLikeObject(candidateId);

			try {
				const storedCandidateUser = JSON.parse(localStorage.getItem('candidateUser') || '{}');
				addCandidateLikeObject(storedCandidateUser);
				addId(localStorage.getItem('candidateId'));
			} catch (error) {}

			return { ids, emails, names };
		})();

		const isIdMatch = (value) => {
			if (!value || candidateIdentity.ids.size === 0) return false;
			const raw = String(value).trim();
			if (!raw) return false;
			return Array.from(candidateIdentity.ids).some((candidateValue) => raw === candidateValue || raw.includes(candidateValue));
		};

		const isEmailMatch = (value) => {
			if (!value || candidateIdentity.emails.size === 0) return false;
			return candidateIdentity.emails.has(String(value).trim().toLowerCase());
		};

		const isNameMatch = (value) => {
			if (!value || candidateIdentity.names.size === 0) return false;
			const normalized = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
			return candidateIdentity.names.has(normalized);
		};

		const scanValue = (value) => {
			if (!value) return false;
			if (Array.isArray(value)) return value.some((item) => scanValue(item));
			if (typeof value !== 'object') return false;

			const bookingStatus = String(value.status || '').trim().toLowerCase();
			const hasBookedMarker = bookingStatus === 'booked' || Boolean(value.bookedAt);
			const candidateMatched =
				['candidateId', 'candidate', 'candidate_id', 'applicantId', 'userId', 'user_id', 'bookedBy', 'bookedById']
					.some((key) => isIdMatch(value[key])) ||
				['candidateEmail', 'email', 'applicantEmail', 'bookedEmail', 'candidate_email']
					.some((key) => isEmailMatch(value[key])) ||
				['candidateName', 'name', 'applicantName', 'bookedName', 'candidate_name']
					.some((key) => isNameMatch(value[key]));

			const hasSlotShape = Boolean((value.startTime || value.start || value.fromTime) && (value.endTime || value.end || value.toTime));
			if (candidateMatched && (hasBookedMarker || hasSlotShape)) {
				return true;
			}

			const nestedKeys = [
				'bookedSlot', 'bookedSlots', 'slots', 'schedules', 'schedulesArray',
				'daySchedules', 'daySchedulesArray', 'rooms', 'roomsArray', 'schedule', 'Schedule'
			];

			return nestedKeys.some((key) => value[key] && scanValue(value[key]));
		};

		const scheduleObject = roundDetails.scheduleObject || {};
		const schedule = roundDetails.schedule || {};
		const legacySchedule = roundDetails.Schedule || {};
		const nestedScheduleObject = scheduleObject.schedule || scheduleObject.Schedule || {};
		const nestedSchedule = schedule.schedule || schedule.Schedule || {};
		const nestedLegacySchedule = legacySchedule.schedule || legacySchedule.Schedule || {};
		const sources = [
			roundDetails,
			roundDetails.Schedule,
			roundDetails.schedulesArray,
			roundDetails.schedules,
			roundDetails.daySchedulesArray,
			roundDetails.daySchedules,
			roundDetails.roomsArray,
			roundDetails.rooms,
			scheduleObject,
			scheduleObject.Schedule,
			scheduleObject.schedulesArray,
			scheduleObject.schedules,
			scheduleObject.daySchedulesArray,
			scheduleObject.daySchedules,
			scheduleObject.roomsArray,
			scheduleObject.rooms,
			nestedScheduleObject,
			nestedScheduleObject.Schedule,
			schedule,
			schedule.Schedule,
			schedule.schedulesArray,
			schedule.schedules,
			schedule.daySchedulesArray,
			schedule.daySchedules,
			schedule.roomsArray,
			schedule.rooms,
			nestedSchedule,
			nestedSchedule.Schedule,
			legacySchedule,
			legacySchedule.schedulesArray,
			legacySchedule.schedules,
			legacySchedule.daySchedulesArray,
			legacySchedule.daySchedules,
			legacySchedule.roomsArray,
			legacySchedule.rooms,
			nestedLegacySchedule,
			nestedLegacySchedule.Schedule,
			bookedSlots
		];

		return sources.some((source) => scanValue(source));
	};

	const resolveBookedRoundContext = (application, currentRoundDetails, uniqueKey, roundType, roundId, candidateIdentity) => {
		const allRoundDetails = application?.jobId?.interviewRoundDetails;
		if (!allRoundDetails || typeof allRoundDetails !== 'object') {
			const directBookedSlot = normalizeBookedSlotForDisplay(
				currentRoundDetails?.bookedSlot,
				currentRoundDetails?.fromDate || currentRoundDetails?.date
			);
			return {
				roundDetails: currentRoundDetails,
				bookedSlot: directBookedSlot,
				hasBookedSlot: Boolean(
					directBookedSlot ||
					currentRoundDetails?.bookedSlot ||
					currentRoundDetails?.candidateSlotBooked ||
					currentRoundDetails?.isBooked ||
					currentRoundDetails?.bookingConfirmed
				)
			};
		}

		const normalizeKey = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
		const baseRoundType = String(roundType || '').split('_')[0];
		const allowTypeFallback = !isDuplicateRoundType(application, roundType || uniqueKey);
		const exactIdentifiers = [
			uniqueKey,
			roundId,
			currentRoundDetails?.key,
			currentRoundDetails?.interviewRoundId
		].filter(Boolean).map((value) => String(value));
		const fallbackIdentifiers = allowTypeFallback
			? [roundType, baseRoundType].filter(Boolean).map((value) => String(value))
			: [];
		const normalizedExactIdentifiers = new Set(exactIdentifiers.map((value) => normalizeKey(value)).filter(Boolean));
		const normalizedFallbackIdentifiers = new Set(fallbackIdentifiers.map((value) => normalizeKey(value)).filter(Boolean));
		const candidateBookedSlots = application?.bookedSlots || [];
		const detailEntries = [
			['__current__', currentRoundDetails],
			...Object.entries(allRoundDetails)
		];

		for (const [detailKey, details] of detailEntries) {
			if (!details || typeof details !== 'object') continue;

			const detailRoundId = details?.interviewRoundId ? String(details.interviewRoundId) : '';
			const detailIdentifiers = [
				detailKey,
				details?.roundType,
				details?.key,
				details?.name,
				detailRoundId
			]
				.filter(Boolean)
				.map((value) => String(value));
			const exactMatch = detailIdentifiers.some((value) => {
				const normalizedValue = normalizeKey(value);
				return exactIdentifiers.includes(value) || (normalizedValue && normalizedExactIdentifiers.has(normalizedValue));
			});
			const fallbackMatch = allowTypeFallback && detailIdentifiers.some((value) => {
				const normalizedValue = normalizeKey(value);
				return fallbackIdentifiers.includes(value) || (normalizedValue && normalizedFallbackIdentifiers.has(normalizedValue));
			});
			const matchesRound = exactMatch || fallbackMatch;

			if (!matchesRound) continue;

			const extractedBookedSlot = extractBookedSlot(details, candidateIdentity, candidateBookedSlots, roundId);
			const directBookedSlot = normalizeBookedSlotForDisplay(
				details?.bookedSlot,
				details?.fromDate || details?.date
			);
			const hasBookedSlot = Boolean(
				extractedBookedSlot ||
				directBookedSlot ||
				details?.bookedSlot ||
				details?.candidateSlotBooked ||
				details?.isBooked ||
				details?.bookingConfirmed ||
				hasBookedReferenceForCandidate(details, candidateIdentity, candidateBookedSlots)
			);

			if (hasBookedSlot) {
				return {
					roundDetails: details,
					bookedSlot: extractedBookedSlot || directBookedSlot,
					hasBookedSlot: true
				};
			}
		}

		const directBookedSlot = normalizeBookedSlotForDisplay(
			currentRoundDetails?.bookedSlot,
			currentRoundDetails?.fromDate || currentRoundDetails?.date
		);
		return {
			roundDetails: currentRoundDetails,
			bookedSlot: directBookedSlot,
			hasBookedSlot: Boolean(
				directBookedSlot ||
				currentRoundDetails?.bookedSlot ||
				currentRoundDetails?.candidateSlotBooked ||
				currentRoundDetails?.isBooked ||
				currentRoundDetails?.bookingConfirmed
			)
		};
	};

	// Timer component for assessment countdown
	const AssessmentTimer = ({ timerInfo, onTimerEnd }) => {
		const [timeLeft, setTimeLeft] = useState(null);
		const [isActive, setIsActive] = useState(false);

		useEffect(() => {
			if (!timerInfo) return;

			const updateTimer = () => {
				const now = new Date().getTime();
				
				if (timerInfo.isBeforeStart && timerInfo.startDate) {
					const startTs = new Date(timerInfo.startDate).getTime();
					const remaining = Math.max(0, startTs - now);
					setTimeLeft(remaining);
					setIsActive(false);
				} else if (timerInfo.isActive && timerInfo.endDate) {
					const endTs = new Date(timerInfo.endDate).getTime();
					const remaining = Math.max(0, endTs - now);
					setTimeLeft(remaining);
					setIsActive(true);
					if (remaining <= 0 && onTimerEnd) {
						onTimerEnd();
					}
				} else {
					setTimeLeft(null);
					setIsActive(false);
				}
			};

			updateTimer();
			const interval = setInterval(updateTimer, 1000);

			return () => clearInterval(interval);
		}, [timerInfo, onTimerEnd]);

		if (!timeLeft) return null;

		const formatTime = (milliseconds) => {
			const totalSeconds = Math.floor(milliseconds / 1000);
			const days = Math.floor(totalSeconds / (24 * 3600));
			const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;

			if (days > 0) {
				return `${days}d ${hours}h ${minutes}m`;
			} else if (hours > 0) {
				return `${hours}h ${minutes}m ${seconds}s`;
			} else {
				return `${minutes}m ${seconds}s`;
			}
		};

		return (
			<div style={{
				padding: '8px 12px',
				background: isActive ? '#fef3c7' : '#dbeafe',
				border: `1px solid ${isActive ? '#f59e0b' : '#3b82f6'}`,
				borderRadius: '6px',
				marginTop: '4px',
				display: 'flex',
				alignItems: 'center',
				gap: '6px',
				fontSize: '12px',
				fontWeight: '600'
			}}>
				<i className={`fa ${isActive ? 'fa-hourglass-half' : 'fa-clock'}`} style={{color: isActive ? '#f59e0b' : '#3b82f6'}}></i>
				<span style={{color: isActive ? '#92400e' : '#1e40af'}}>
					{isActive ? 'Time Remaining: ' : 'Starts in: '}{formatTime(timeLeft)}
				</span>
			</div>
		);
	};

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplications();
		
		
		// Check if we should highlight shortlisted applications
		const shouldHighlight = sessionStorage.getItem('highlightShortlisted');
		if (shouldHighlight === 'true') {
			setHighlightShortlisted(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightShortlisted(false);
				sessionStorage.removeItem('highlightShortlisted');
			}, 5000);
		}
		
		// Check if we should highlight company and position columns
		const shouldHighlightCP = sessionStorage.getItem('highlightCompanyPosition');
		if (shouldHighlightCP === 'true') {
			setHighlightCompanyPosition(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightCompanyPosition(false);
				sessionStorage.removeItem('highlightCompanyPosition');
			}, 5000);
		}
		

	}, []);

	useEffect(() => {
		if (!applicationId || applications.length === 0) return;
		const matchedApplication = applications.find((app) => String(app._id) === String(applicationId));
		if (matchedApplication) {
			setSelectedApplication(matchedApplication);
		}
	}, [applicationId, applications]);

	// Re-fetch when the interview details page is opened so candidate always sees the latest status
	useEffect(() => {
		if (isInterviewDetailsPage) {
			fetchApplications();
		}
	}, [isInterviewDetailsPage]);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const response = await api.getCandidateApplicationsWithInterviews();
			if (response.success) {
				const apps = response.applications || response.data || [];
				console.log('Applications received:', apps);
				if (apps.length > 0) {
					console.log('First application job data:', apps[0].jobId);
					console.log('Assessment ID:', apps[0].jobId?.assessmentId);
					console.log('Interview Round Types:', apps[0].jobId?.interviewRoundTypes);
					// Log all applications with assessment info
					apps.forEach((app, idx) => {
						console.log(`App ${idx + 1} - Job: ${app.jobId?.title}, Has Assessment: ${!!app.jobId?.assessmentId}, Assessment ID: ${app.jobId?.assessmentId}`);
					});
				}
				setApplications(apps);
			}
		} catch (error) {
			console.error('Error fetching applications with interviews:', error);
			// Fallback to regular applications if new endpoint fails
			try {
				console.log('Falling back to regular applications endpoint');
				const fallbackResponse = await api.getCandidateApplications();
				if (fallbackResponse.success) {
					const apps = fallbackResponse.applications || fallbackResponse.data || [];
					console.log('Fallback applications received:', apps);
					setApplications(apps);
				}
			} catch (fallbackError) {
				console.error('Fallback also failed:', fallbackError);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleOfferResponse = async (applicationId, response) => {
		const action = response === 'accepted' ? 'Accept' : 'Reject';
		
		showConfirmation(
			`Are you sure you want to ${action.toLowerCase()} this job offer? ${action.toLowerCase() === 'reject' ? 'Once rejected, it cannot be accepted later.' : ''}`,
			async () => {
				try {
					const res = await api.respondToOffer(applicationId, { status: response });
					if (res.success) {
						showSuccess(`Offer ${response} successfully`);
						fetchApplications();
					} else {
						showError(res.message || `Failed to ${response} offer`);
					}
				} catch (error) {
					console.error(`Error ${response}ing offer:`, error);
					showError(`An error occurred while ${response}ing the offer`);
				}
			},
			null,
			'warning'
		);
	};

	const getInterviewRounds = (job, application) => {
		const allDetails = job?.interviewRoundDetails || {};
		const normalizeRoundDisplayName = (name) => {
			if (!name || typeof name !== 'string') return name;
			const normalized = name.trim().toLowerCase();
			if (
				normalized === 'one-to-one/panel' ||
				normalized === 'one-to-one / panel' ||
				normalized === 'one-on-one/panel' ||
				normalized === 'one-on-one / panel'
			) {
				return 'One-on-One / Panel';
			}
			return name;
		};

		// Helper function to extract proper round name from uniqueKey
		const getRoundNameFromKey = (key) => {
			const roundNames = {
				technical: 'Technical Round',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group Discussion',
				situational: 'Situational / Behavioral Round',
				others: 'Others � Specify.',
				assessment: 'Assessment'
			};
			
			// Extract type from keys like "assessment_1770487959181"
			const extractedType = key.includes('_') ? key.split('_')[0] : key;
			return roundNames[extractedType] || roundNames[key] || 'Interview Round';
		};

		if (application?.interviewRounds && application.interviewRounds.length > 0) {
			return application.interviewRounds.map((round, roundIndex) => ({
				...round,
				name: normalizeRoundDisplayName(round.name || getRoundNameFromKey(round.type || round.roundType || round.id)),
				uniqueKey: round.uniqueKey || round.id || round.key || round.type || `round_${roundIndex}`,
				processId: round.processId || round.id || round._id || null,
				roundType: round.roundType || round.type || round.name,
				assessmentId: round.assessmentId || null
			}));
		}
		
		// Helper function to get round name from stage type or stage name
		const getProperRoundName = (stageType, stageName) => {
			const roundNames = {
				technical: 'Technical Round',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group Discussion',
				situational: 'Situational / Behavioral Round',
				others: 'Others � Specify.',
				assessment: 'Assessment',
				nonTechnical: 'Non-Technical',
				managerial: 'Managerial Round',
				final: 'Final',
				hr: 'HR Round',
				aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
				coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
			};
			
			const normalizedStageName = stageName ? stageName.trim() : '';
			const normalizedStageNameLower = normalizedStageName.toLowerCase();
			const genericStageNames = new Set(['interview round', 'interview round details', 'interview rounds', 'interview']);
			const isGenericStageName = !normalizedStageName || genericStageNames.has(normalizedStageNameLower);
			
			if (!isGenericStageName && !normalizedStageName.includes('_') && !normalizedStageName.match(/^[0-9a-f]{24}$/i) && !/^\d+$/.test(normalizedStageName)) {
				return normalizeRoundDisplayName(normalizedStageName);
			}
			
			// Extract actual type if stageType looks like a unique key (e.g., "assessment_1234" -> "assessment")
			let actualStageType = stageType;
			if (stageType && (stageType.includes('_') || /^\d+$/.test(stageType))) {
				actualStageType = stageType.split('_')[0];
			}
			
			// Fallback to stageType mapping
			return normalizeRoundDisplayName(roundNames[actualStageType] || roundNames[stageType] || 'Interview Round');
		};
		
		// PRIORITY 1: Employer Manual Tracking statuses are stored on the application.
		if (application?.interviewProcesses && application.interviewProcesses.length > 0) {
			console.log('Using interviewProcesses from application:', application.interviewProcesses);
			return application.interviewProcesses.map((process, processIndex) => {
				let name = process.name || getRoundNameFromKey(process.type);
				
				// Sanitize name: if it looks like a unique key, extract the actual type
				if (name && (name.includes('_') || /^\d+$/.test(name))) {
					const stageNames = {
						assessment: 'Assessment',
						technical: 'Technical Round',
						oneOnOne: 'One-to-One',
						panel: 'Panel',
						group: 'Group Discussion',
						situational: 'Situational / Behavioral Round',
						others: 'Others � Specify.',
						nonTechnical: 'Non-Technical',
						managerial: 'Managerial Round',
						final: 'Final',
						hr: 'HR Round'
					};
					
					const lowerName = name.toLowerCase();
					let extractedType = null;
					
					if (lowerName.includes('assessment')) extractedType = 'assessment';
					else if (lowerName.includes('technical')) extractedType = 'technical';
					else if (lowerName.includes('oneonone') || lowerName.includes('one-on-one') || lowerName.includes('one_on_one')) extractedType = 'oneOnOne';
					else if (lowerName.includes('panel')) extractedType = 'panel';
					else if (lowerName.includes('group')) extractedType = 'group';
					else if (lowerName.includes('situational')) extractedType = 'situational';
					else if (lowerName.includes('others')) extractedType = 'others';
					else if (lowerName.includes('nontechnical')) extractedType = 'nonTechnical';
					else if (lowerName.includes('managerial')) extractedType = 'managerial';
					else if (lowerName.includes('final')) extractedType = 'final';
					else if (lowerName.includes('hr')) extractedType = 'hr';
					
					if (extractedType && stageNames[extractedType]) {
						name = stageNames[extractedType];
					}
				}
				
				return {
					name: normalizeRoundDisplayName(name),
					uniqueKey: resolveTrackedRoundKey(application, process, processIndex) || process.id || process.type,
					processId: process.id || process._id || null,
					roundType: process.type,
					assessmentId: process.assessmentId || null,
					status: process.status || null
				};
			});
		}

		// PRIORITY 2: Check if application has interviewProcess.stages from InterviewProcessManager
		if (application?.interviewProcess?.stages && application.interviewProcess.stages.length > 0) {
			console.log('Using interviewProcess.stages:', application.interviewProcess.stages);
			return application.interviewProcess.stages.map((stage, stageIndex) => {
				const uniqueKey = resolveTrackedRoundKey(application, {
					id: stage._id,
					name: stage.stageName,
					type: stage.stageType
				}, stageIndex);
				return {
					name: getProperRoundName(stage.stageType, stage.stageName),
					uniqueKey: uniqueKey || stage._id || stage.stageType,
					processId: stage._id || null,
					roundType: stage.stageType,
					assessmentId: stage.assessmentId || null
				};
			});
		}
		
		// PRIORITY 3: Check if job has interviewRoundOrder (new format)
		if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
			const rounds = [];
			const stageNames = {
				technical: 'Technical Round',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group Discussion',
				situational: 'Situational / Behavioral Round',
				others: 'Others � Specify.',
				assessment: 'Assessment',
				nonTechnical: 'Non-Technical',
				managerial: 'Managerial Round',
				final: 'Final',
				hr: 'HR Round',
				aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
				coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
			};
			
			// Map unique keys to round names - ALWAYS return a proper name
			job.interviewRoundOrder.forEach(uniqueKey => {
				const roundType = job.interviewRoundTypes?.[uniqueKey];
				let name = '';
				let finalRoundType = roundType || uniqueKey;
				
				// Extract actual type from unique key if needed (e.g., "assessment_123456" -> "assessment")
				let baseType = uniqueKey;
				if (uniqueKey && uniqueKey.includes('_')) {
					baseType = uniqueKey.split('_')[0];
				}
				
				if (roundType && !roundType.includes('_') && !/^\d+$/.test(roundType)) {
					// roundType is a proper type, use it
					finalRoundType = roundType;
					const customType = allDetails?.[uniqueKey]?.customType;
					name = (roundType === 'others' && customType && customType.trim()) ? customType.trim() : (stageNames[roundType] || getRoundNameFromKey(roundType));
				} else if (roundType) {
					// roundType looks like a unique key, extract it
					const extractedType = roundType.includes('_') ? roundType.split('_')[0] : roundType;
					finalRoundType = extractedType;
					const customType = allDetails?.[uniqueKey]?.customType;
					name = (extractedType === 'others' && customType && customType.trim()) ? customType.trim() : (stageNames[extractedType] || getRoundNameFromKey(extractedType));
				} else {
					// No roundType, use extracted baseType
					finalRoundType = baseType;
					const customType = allDetails?.[uniqueKey]?.customType;
					name = (baseType === 'others' && customType && customType.trim()) ? customType.trim() : (stageNames[baseType] || getRoundNameFromKey(baseType));
				}
				
				// CRITICAL: Ensure we NEVER display a unique key directly
				if (!name || name === uniqueKey || name.includes('_') || /^\d+$/.test(name)) {
					name = stageNames[baseType] || stageNames[finalRoundType] || 'Interview Round';
				}
				
				rounds.push({
					name: normalizeRoundDisplayName(name),
					uniqueKey: uniqueKey,
					roundType: finalRoundType,
					assessmentId: allDetails?.[uniqueKey]?.assessmentId || null
				});
			});
			
			if (rounds.length > 0) return rounds;
		}
		
		// PRIORITY 4: Fallback to old format
		if (job?.interviewRoundTypes) {
			const rounds = [];
			const roundTypes = job.interviewRoundTypes;

			if (job.assessmentId) rounds.push({ name: 'Assessment', uniqueKey: 'assessment', roundType: 'assessment', assessmentId: job.assessmentId });
			if (roundTypes.oneOnOne) rounds.push({ name: 'One-to-One', uniqueKey: 'oneOnOne', roundType: 'oneOnOne' });
			if (roundTypes.panel) rounds.push({ name: 'Panel', uniqueKey: 'panel', roundType: 'panel' });
			if (roundTypes.group) rounds.push({ name: 'Group Discussion', uniqueKey: 'group', roundType: 'group' });
			if (roundTypes.technical) rounds.push({ name: 'Technical Round', uniqueKey: 'technical', roundType: 'technical' });
			if (roundTypes.situational) rounds.push({ name: 'Situational / Behavioral Round', uniqueKey: 'situational', roundType: 'situational' });
			if (roundTypes.others) rounds.push({ name: 'Others � Specify.', uniqueKey: 'others', roundType: 'others' });

			if (rounds.length > 0) return rounds;
		}

		// PRIORITY 5: Check if job has assessment before falling back to defaults
		if (job?.assessmentId) {
			return [{ name: 'Assessment', uniqueKey: 'assessment', roundType: 'assessment', assessmentId: job.assessmentId }];
		}

		// Default rounds for testing
		return [{ name: 'Technical Round', uniqueKey: 'technical', roundType: 'technical' }, { name: 'HR Round', uniqueKey: 'hr', roundType: 'hr' }, { name: 'Final', uniqueKey: 'final', roundType: 'final' }];
	};

	const formatAssessmentScheduleMessage = (startDate) => {
		if (!startDate) return 'Assessment scheduled. Test will open on the scheduled date and time.';
		try {
			const date = new Date(startDate);
			if (isNaN(date.getTime())) return 'Assessment scheduled. Test will open on the scheduled date and time.';
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: 'Asia/Kolkata',
				day: 'numeric',
				month: 'long',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			}).formatToParts(date);
			const getPart = (type) => parts.find((part) => part.type === type)?.value || '';
			const day = Number(getPart('day'));
			const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
			const month = getPart('month');
			const hours = getPart('hour');
			const minutes = Number(getPart('minute'));
			const ampm = getPart('dayPeriod').toLowerCase();
			const timeStr = minutes === 0 ? `${hours}${ampm}` : `${hours}:${String(minutes).padStart(2, '0')}${ampm}`;
			return `Assessment will be live on ${day}${suffix} ${month} at ${timeStr}`;
		} catch (e) {
			return 'Assessment scheduled. Test will open on the scheduled date and time.';
		}
	};

	const getRoundStatus = (application, roundIndex, roundName, isPopup = false, roundDetails = null) => {
		const formatProcessStatusLabel = (rawStatus) => {
			const status = String(rawStatus || '').toLowerCase();
			const labels = {
				shortlisted_for_next_round: 'Shortlisted for next Round',
				under_review: 'Pending',
				on_hold: 'On Hold',
				selected: 'Selected',
				pending_decision: 'Pending Decision',
				no_show: 'No Show',
				rejected: 'Not Advanced to Next Stage'
			};
			if (labels[status]) return labels[status];
			return String(rawStatus || '').replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
		};

		const mapProcessStatusToBadge = (rawStatus, options = {}) => {
			const status = normalizeStatusValue(rawStatus).replace(/\s+/g, '_');
			const { isFinalStage = false, treatDeferredAttendanceStatusAsPending = false, isAssessment = false } = options;
			if (treatDeferredAttendanceStatusAsPending && isDeferredInterviewAttendanceStatus(rawStatus, isAssessment)) {
				return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' };
			}
			const mappings = {
				shortlisted: { text: 'Shortlisted', class: 'bg-info bg-opacity-10 text-info border border-info' },
				shortlisted_for_next_round: { text: 'Shortlisted for next Round', class: 'bg-info bg-opacity-10 text-info border border-info' },
				under_review: { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' },
				pending_decision: { text: 'Pending Decision', class: 'bg-warning bg-opacity-10 text-warning border border-warning' },
				interview_scheduled: { text: 'Interview Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info' },
				interview_completed: { text: 'Interview Completed', class: 'bg-success bg-opacity-10 text-success border border-success' },
				selected: { text: 'Selected', class: 'bg-success bg-opacity-10 text-success border border-success' },
				no_show: { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger' },
				rejected: {
					text: isFinalStage ? 'Rejected' : 'Not Advanced to Next Stage',
					class: 'bg-danger bg-opacity-10 text-danger border border-danger'
				},
				not_advanced_to_next_stage: { text: 'Not Advanced to Next Stage', class: 'bg-danger bg-opacity-10 text-danger border border-danger' },
				not_advanced_to_next_round: { text: 'Not Advanced to Next Stage', class: 'bg-danger bg-opacity-10 text-danger border border-danger' },
				on_hold: { text: 'On Hold', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' },
				scheduled: { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info' },
				in_progress: { text: 'In Progress', class: 'bg-warning bg-opacity-10 text-warning border border-warning' },
				completed: { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success' },
				pending: { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' }
			};
			return mappings[status] || { text: formatProcessStatusLabel(rawStatus), class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' };
		};

		const isSlotBookingStatus = (rawStatus) => {
			const status = normalizeStatusValue(rawStatus).replace(/\s+/g, '_');
			return status === 'scheduled' || status === 'interview_scheduled';
		};

		const scheduleSlotStatus = { text: 'Schedule', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' };

		const getRoundTypeFromName = (name = '') => {
			const n = String(name).toLowerCase();
			if (n.includes('assessment')) return 'assessment';
			if (n.includes('one-to-one') || n.includes('one on one')) return 'oneOnOne';
			if (n.includes('panel')) return 'panel';
			if (n.includes('group')) return 'group';
			if (n.includes('technical')) return 'technical';
			if (n.includes('situational')) return 'situational';
			if (n.includes('behavioral')) return 'situational';
			if (n.includes('hr')) return 'hr';
			if (n.includes('final')) return 'final';
			if (n.includes('other')) return 'others';
			return '';
		};

		const getBookedSlotStatus = () => {
			if (roundName === 'Assessment') return null;
			const roundTypeRaw = roundDetails?.__roundType || getRoundTypeFromName(roundName);
			const uniqueKey = roundDetails?.__uniqueKey || roundTypeRaw;
			const roundId = getInterviewRoundIdForRound(application, uniqueKey, roundTypeRaw, roundDetails);
			const candidateId = application?.candidateId?._id || application?.candidateId;
			const candidateSlotIdentity = application?.candidateId || {
				_id: candidateId,
				candidateEmail: application?.candidateEmail || application?.applicantEmail,
				candidateName: application?.candidateName || application?.applicantName
			};
			const bookedRoundContext = resolveBookedRoundContext(
				application,
				roundDetails,
				uniqueKey,
				roundTypeRaw,
				roundId,
				candidateSlotIdentity
			);

			return bookedRoundContext?.hasBookedSlot
				? { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' }
				: null;
			// Note: returns null when no slot booked so callers can show 'Schedule' instead
		};

		if (roundIndex > 0 && hasRejectedPriorRound(application, roundIndex)) {
			return { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
		}

		// Check assessment status for Assessment rounds
		if (roundName === 'Assessment') {
			const assessmentRoundInfo = getAssessmentRoundInfo(application, roundName, roundDetails);
			const roundProvidedStatus = roundDetails?.__roundStatus || '';
			const trackedDecisionStatus = assessmentRoundInfo?.trackedDecisionStatus || (
				roundProvidedStatus &&
				normalizeStatusValue(roundProvidedStatus) !== 'pending' &&
				!isAssessmentAttemptDerivedStatus(roundProvidedStatus)
					? roundProvidedStatus
					: ''
			);
			if (trackedDecisionStatus) {
				const mappedDecision = mapProcessStatusToBadge(trackedDecisionStatus, {
					isFinalStage: false
				});
				return { ...mappedDecision, feedback: '' };
			}
			const { status, isPassed, isFailed, isCompleted, isInProgress, isExpired, isSuspended, isNoShow } = assessmentRoundInfo.completionInfo;
			const assessmentActivationState = roundIndex > 0
				? getRoundActivationState(application, roundIndex)
				: { canStart: true, previousAssessmentFailed: false };
			
			// Check if assessment window has expired
			const windowInfo = getAssessmentWindowInfo(application.jobId, roundDetails);
			if (isPassed) {
				return { text: 'Pass', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
			}
			if (isFailed) {
				return { text: 'Fail', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
			}
			if (
				roundIndex > 0 &&
				!assessmentActivationState.canStart &&
				!isCompleted &&
				!isInProgress &&
				!isSuspended
			) {
				return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
			if ((isNoShow || isExpired || windowInfo.isAfterEnd) && !isCompleted && !isInProgress && !isSuspended) {
				// If expired but result is pending (subjective awaiting evaluation), show Completed
				const assessmentResult = String(assessmentRoundInfo?.attempt?.result || '').toLowerCase();
				if (isExpired && assessmentResult === 'pending') {
					return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
				}
				return { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
			}

			if (
				windowInfo.isWithinWindow &&
				!windowInfo.isBeforeStart &&
				!windowInfo.isAfterEnd &&
				!isCompleted &&
				!isInProgress &&
				!isSuspended &&
				['', 'pending', 'not_required', 'not_started', 'available'].includes(status)
			) {
				return { text: 'Started', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
			}
			
			if (
				windowInfo.isBeforeStart &&
				['', 'available', 'not_required', 'not_started', 'pending'].includes(status) &&
				!isCompleted &&
				!isInProgress &&
				!isSuspended
			) {
				const schedMsg = formatAssessmentScheduleMessage(windowInfo.startDate);
				return isPopup
					? { text: schedMsg, class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' }
					: { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
			
			// Map all possible assessment status values
			const statusMappings = {
				'completed': { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' },
				'in_progress': { text: 'In Progress', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' },
				'available': windowInfo.isBeforeStart
					? { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' }
					: { text: 'Started', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' },
				'no_show': { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'session_expired': { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'session expired': { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'expired': { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'suspended': { text: 'Suspended', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'pending': { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' },
				'not_required': windowInfo.isBeforeStart
					? { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' }
					: { text: 'Started', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' },
				'not_started': { text: formatAssessmentScheduleMessage(windowInfo.startDate), class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' }
			};
			
			const result = statusMappings[status];
			if (!result) {
				console.warn(`Unknown assessment status: "${status}", defaulting to Pending`);
				return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
			return result;
		}

		// Check if there are actual interview rounds data from employer review
		if (application.interviewRounds && application.interviewRounds.length > 0) {
			const normalizeRoundKey = (value = '') => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
			const targetType = normalizeRoundKey(roundDetails?.__roundType || getRoundTypeFromName(roundName));
			const targetKey = normalizeRoundKey(roundDetails?.__uniqueKey || targetType);
			const targetProcessId = normalizeRoundKey(roundDetails?.__processId);
			const round = application.interviewRounds.find((r, candidateIndex) => {
				const legacyRoundNumber = Number(r?.round);
				if (legacyRoundNumber && legacyRoundNumber === roundIndex + 1) return true;
				const candidateProcessId = normalizeRoundKey(r?.processId || r?.id || r?._id);
				if (targetProcessId && candidateProcessId && candidateProcessId === targetProcessId) return true;
				const candidateKey = normalizeRoundKey(r?.uniqueKey || r?.id || r?.key);
				const candidateType = normalizeRoundKey(r?.roundType || r?.type || r?.name);
				if (targetKey && candidateKey && candidateKey === targetKey) return true;
				if (targetType && candidateType && candidateType === targetType && candidateIndex === roundIndex) return true;
				return candidateIndex === roundIndex;
			});
			if (round) {
				switch (normalizeStatusValue(round.status).replace(/\s+/g, '_')) {
					case 'passed':
					case 'pass':
						return { 
							text: 'Pass', 
							class: 'bg-success bg-opacity-10 text-success border border-success',
							feedback: round.feedback || ''
						};
					case 'failed':
					case 'fail':
						return { 
							text: 'Fail', 
							class: 'bg-danger bg-opacity-10 text-danger border border-danger',
							feedback: round.feedback || ''
						};
					case 'pending':
					default:
						if (round.status && normalizeStatusValue(round.status) !== 'pending') {
							return { ...mapProcessStatusToBadge(round.status), feedback: round.feedback || round.remark || '' };
						}
						if (roundName !== 'Assessment' && ['shortlisted', 'pending'].includes(String(application.status || '').toLowerCase())) {
							const bookedSlotStatusEarly = getBookedSlotStatus();
							return bookedSlotStatusEarly || scheduleSlotStatus;
						}
						return mapProcessStatusToBadge(round.status || 'pending');
				}
			}
		}

		// Use current tracked stage status when available
		const bookedSlotStatus = getBookedSlotStatus();
		if (
			(Array.isArray(application.interviewProcesses) && application.interviewProcesses.length > 0) ||
			(Array.isArray(application.interviewProcess?.stages) && application.interviewProcess.stages.length > 0)
		) {
			const roundType = getRoundTypeFromName(roundName);
			const trackedProcesses = Array.isArray(application.interviewProcesses) ? application.interviewProcesses : [];
			const trackedStages = Array.isArray(application.interviewProcess?.stages) ? application.interviewProcess.stages : [];
			const relatedProcessIndex = findRelatedInterviewProcessIndex(application, {
				uniqueKey: roundDetails?.__uniqueKey,
				processId: roundDetails?.__processId,
				roundType: roundDetails?.__roundType || roundType,
				roundName,
				index: roundIndex
			});
			const relatedProcess =
				relatedProcessIndex !== -1
					? trackedProcesses[relatedProcessIndex]
					: null;
			const relatedStage = findRelatedInterviewStage(application, {
				uniqueKey: roundDetails?.__uniqueKey,
				roundType: roundDetails?.__roundType || roundType,
				index: roundIndex
			}) || null;
			// Only use the status from the process that belongs to THIS round (matched by index).
			// If no match found (-1), treat as no tracked status.
			const trackedStatus = relatedProcessIndex !== -1
				? (relatedProcess?.status || relatedStage?.status || '')
				: (relatedStage?.status || '');
			const normalizedTrackedStatus = normalizeStatusValue(trackedStatus);
			const isFinalTrackedStage =
				relatedProcessIndex !== -1
					? relatedProcessIndex === trackedProcesses.length - 1
					: relatedStage
						? Number(relatedStage?.stageOrder || 0) === trackedStages.length
						: false;

			if (trackedStatus && normalizedTrackedStatus !== 'pending') {
				if (isSlotBookingStatus(trackedStatus)) {
					return bookedSlotStatus || scheduleSlotStatus;
				}
				const mapped = mapProcessStatusToBadge(trackedStatus, {
					isFinalStage: isFinalTrackedStage,
					treatDeferredAttendanceStatusAsPending: false
				});
				return { ...mapped, feedback: '' };
			}

			if (bookedSlotStatus) {
				return bookedSlotStatus;
			}

			// For duplicate round types, never show 'Schedule' for the second untouched round
			// based on the first round's shortlisted status — each round is independent.
			const effectiveRoundType = roundDetails?.__roundType || roundType;
			const isThisRoundDuplicate = isDuplicateRoundType(application, effectiveRoundType);
			if (!isThisRoundDuplicate && roundIndex > 0 && getRoundActivationState(application, roundIndex).canStart) {
				return scheduleSlotStatus;
			}

			if (trackedStatus) {
				if (isSlotBookingStatus(trackedStatus)) {
					return bookedSlotStatus || scheduleSlotStatus;
				}
				const mapped = mapProcessStatusToBadge(trackedStatus, {
					isFinalStage: isFinalTrackedStage,
					treatDeferredAttendanceStatusAsPending: false
				});
				return { ...mapped, feedback: '' };
			}
		}

		if (bookedSlotStatus) {
			return bookedSlotStatus;
		}
		
		// Enhanced status logic based on application status
		const status = application.status;
		
		// For pending status, check if candidate is selected for process AND slot is booked
		if (status === 'pending' && application.isSelectedForProcess) {
			const slotStatus = getBookedSlotStatus();
			if (slotStatus) return slotStatus;
			return scheduleSlotStatus;
		}
		
		if (status === 'shortlisted') {
			return bookedSlotStatus || scheduleSlotStatus;
		} else if (status === 'interviewed') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'hired') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'rejected') {
			return { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
		} else if (status === 'pending') {
			return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
		}
		
		return { text: 'Submitted', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
	};

	const hasRejectedRoundStatus = (application = {}, roundsList = null) => {
		const resolvedRounds =
			Array.isArray(roundsList) && roundsList.length > 0
				? roundsList
				: getInterviewRounds(application?.jobId, application);

		return resolvedRounds.some((round, roundIndex) => {
			const roundName = typeof round === 'string' ? round : round?.name;
			const roundDetails = resolveRoundDetails(application, round, roundIndex, resolvedRounds);
			const roundStatus = getRoundStatus(application, roundIndex, roundName, false, roundDetails);
			return isRejectedInterviewProcessStatus(roundStatus?.text);
		});
	};

	const handleViewRoundDetails = (roundType, roundDetails, assessmentId = null) => {
		setSelectedRoundType(roundType);
		setSelectedRoundDetails(roundDetails);
		setSelectedAssessmentId(assessmentId);
		setShowRoundDetails(true);
	};

	const handleViewAllDetails = (application) => {
		if (!application?._id) return;
		setPendingInterviewApplicationId(application._id);
		setShowInterviewInstructionsModal(true);
	};

	const handleAcceptInterviewInstructions = () => {
		if (!pendingInterviewApplicationId) {
			setShowInterviewInstructionsModal(false);
			return;
		}
		const targetApplicationId = pendingInterviewApplicationId;
		setShowInterviewInstructionsModal(false);
		setPendingInterviewApplicationId(null);
		navigate(canRoute(candidate.STATUS) + `/interview-details/${targetApplicationId}`);
	};

	const handleCloseInterviewInstructions = () => {
		setShowInterviewInstructionsModal(false);
		setPendingInterviewApplicationId(null);
	};

	const handleStartAssessment = (application, roundDetails = null) => {
		const roundIndex = typeof roundDetails?.__roundIndex === 'number' ? roundDetails.__roundIndex : -1;
		if (roundIndex > 0) {
			const activationState = getRoundActivationState(application, roundIndex);
			if (!activationState.canStart) {
				showWarning('This assessment will be enabled after the previous round is marked Shortlisted for Next Round or Selected.');
				return;
			}
		}

		const assessmentRoundInfo = getAssessmentRoundInfo(application, 'Assessment', roundDetails);
		if (hasAssessmentCloseAutoSubmitViolation(assessmentRoundInfo?.attempt)) {
			showWarning(ASSESSMENT_CLOSE_AUTO_SUBMIT_MESSAGE, 6000);
			return;
		}

		showInfo(' ALL THE BEST ...', 3000);
		console.log('=== HANDLE START ASSESSMENT CALLED ===');
		const job = application.jobId;
		const windowInfo = getAssessmentWindowInfo(job, roundDetails);
		if (!windowInfo.isWithinWindow) {
			if (windowInfo.isBeforeStart) {
				const startLabel = windowInfo.startDate ? windowInfo.startDate.toLocaleString('en-IN', {
					timeZone: 'Asia/Kolkata',
					dateStyle: 'medium',
					timeStyle: 'short'
				}) : null;
				showWarning(startLabel ? ` Assessment Not Yet Available\n\nThe assessment will open on ${startLabel}. Please log in 5 minutes before the scheduled time.` : '? Assessment is not yet available. Please wait for the scheduled time.');
				return;
			}
			const endLabel = windowInfo.endDate ? windowInfo.endDate.toLocaleString('en-IN', {
				timeZone: 'Asia/Kolkata',
				dateStyle: 'medium',
				timeStyle: 'short'
			}) : null;
			showError(endLabel ? `Assessment Window Closed\n\nThe assessment window ended on ${endLabel}.` : '? Assessment window has ended.');
			return;
		}
		const assessmentId = getAssessmentRoundInfo(application, 'Assessment', roundDetails).assessmentId || job?.assessmentId;
		const jobId = job?._id || job;
		const applicationId = application._id;
		if (assessmentId && jobId && applicationId) {
			const sessionPayload = { assessmentId, jobId, applicationId };
			try {
				sessionStorage.setItem('candidateCurrentAssessment', JSON.stringify(sessionPayload));
			} catch (err) {}
			const params = new URLSearchParams();
			Object.entries(sessionPayload).forEach(([key, value]) => {
				if (value) {
					params.set(key, value);
				}
			});
			const assessmentUrl = `${window.location.origin}/candidate/start-tech-assessment?${params.toString()}`;
			
			// Define window features for a popup-style window (no tabs/address bar)
			const windowFeatures = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${window.screen.availWidth}, height=${window.screen.availHeight}, fullscreen=yes`;
			
			const assessmentWindow = window.open(assessmentUrl, 'AssessmentWindow', windowFeatures);
			if (!assessmentWindow) {
				showWarning('Popup blocked. Please allow popups for this site to launch the assessment in a secure tab.');
				navigate(`/candidate/start-tech-assessment?${params.toString()}`, {
					state: sessionPayload
				});
			}
		}
	};

	const getRoundStatusPillStyle = (statusText = '') => {
		const status = String(statusText).toLowerCase();
		if (['selected', 'completed', 'passed', 'pass'].includes(status)) {
			return { backgroundColor: '#e6f4ea', color: '#1e7e34', border: '1px solid #1e7e34' };
		}
		if (['rejected', 'failed', 'fail', 'expired', 'suspended', 'no show', 'not advanced to next stage'].includes(status)) {
			return { backgroundColor: '#fdeaea', color: '#c82333', border: '1px solid #c82333' };
		}
		if (['scheduled', 'started', 'interview scheduled'].includes(status)) {
			return { backgroundColor: '#e7f1ff', color: '#0d6efd', border: '1px solid #0d6efd' };
		}
		if (status === 'schedule') {
			return { backgroundColor: '#fff8e1', color: '#b26a00', border: '1px solid #b26a00' };
		}
		if (['in progress', 'under review', 'shortlisted', 'shortlisted for next round', 'pending decision'].includes(status)) {
			return { backgroundColor: '#fff8e1', color: '#b26a00', border: '1px solid #b26a00' };
		}
		return { backgroundColor: '#f1f3f5', color: '#495057', border: '1px solid #adb5bd' };
	};

	const resolveProcessRemarks = (process, roundName, roundType, remarksMap = {}) => {
		if (!remarksMap || typeof remarksMap !== 'object') return '';
		const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
		const exactCandidates = [
			process?.id,
			process?._id,
			process?.type,
			roundType,
			roundName
		].filter(Boolean);

		for (const key of exactCandidates) {
			const direct = remarksMap[key];
			if (typeof direct === 'string' && direct.trim()) return direct;
		}

		const normalizedCandidates = exactCandidates.map(normalizeKey).filter(Boolean);
		for (const [key, value] of Object.entries(remarksMap)) {
			if (typeof value !== 'string' || !value.trim()) continue;
			const normalizedKey = normalizeKey(key);
			if (normalizedCandidates.some((candidate) => candidate && normalizedKey.includes(candidate))) {
				return value;
			}
		}
		return '';
	};

	const statusOptions = useMemo(() => {
		const seen = new Set(APPLICATION_STATUS_FILTER_OPTIONS.map((option) => option.value));
		const options = [...APPLICATION_STATUS_FILTER_OPTIONS];

		applications.forEach((application) => {
			const normalizedStatus = String(getApplicationFilterStatus(application) || 'pending').trim().toLowerCase();
			if (!normalizedStatus || seen.has(normalizedStatus)) {
				return;
			}

			seen.add(normalizedStatus);
			options.push({
				value: normalizedStatus,
				label: formatStatusLabel(normalizedStatus)
			});
		});

		return options;
	}, [applications]);

	const getInterviewRoundStatuses = (application) => {
		const rounds = getInterviewRounds(application.jobId, application);
		return rounds.map((round, roundIndex) => {
			const roundName = typeof round === 'string' ? round : round.name;
			const roundDetails = resolveRoundDetails(application, round, roundIndex, rounds);
			const roundStatus = getRoundStatus(application, roundIndex, roundName, false, roundDetails);
			return normalizeStatusValue(roundStatus?.text || '');
		});
	};

	const filteredApplications = useMemo(() => {
		let result = selectedStatus === 'all'
			? applications
			: applications.filter((application) => {
				if (getApplicationFilterStatus(application) === selectedStatus) return true;
				const roundStatuses = getInterviewRoundStatuses(application);
				return roundStatuses.some((s) => s === normalizeStatusValue(selectedStatus));
			});

		if (searchQuery.trim()) {
			const query = searchQuery.trim().toLowerCase();
			result = result.filter((application) => {
				const company = (getEmployerDisplayCompanyName(application) || '').toLowerCase();
				return company.includes(query);
			});
		}

		if (positionQuery.trim()) {
			const query = positionQuery.trim().toLowerCase();
			result = result.filter((application) => {
				const position = (application.jobId?.title || '').toLowerCase();
				return position.includes(query);
			});
		}

		return result;
	}, [applications, selectedStatus, searchQuery, positionQuery]);

	const paginatedApplications = useMemo(() => {
		return filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
	}, [filteredApplications, currentPage]);

	return (
		<>
			{!isInterviewDetailsPage && (
			<div className="twm-right-section-panel site-bg-gray candidate-status-page">
				{/* Status Page Header */}
				<div className="status-page-header-container">
					<div className="status-page-header-card">
						<div style={{ textAlign: 'center' }}>
							<h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
								<i className="fa fa-clipboard-list me-2" style={{color: '#f97316'}}></i>
								Application Status
							</h2>
							<p style={{ color: '#6b7280', margin: 0 }}>
								Track your job applications and interview progress
							</p>
						</div>
					</div>
				</div>

				{/* Status Content */}
				<div className="status-page-content-container">
					{loading ? (
						<PageLoader pageName="Application Status" />
					) : (
						<>

					{/* Highlight notification */}
					{highlightShortlisted && (
						<div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
							<i className="fa fa-star me-2"></i>
							<strong>Shortlisted Applications Highlighted!</strong> Your shortlisted applications are highlighted below.
						</div>
					)}
					
					{highlightCompanyPosition && (
						<div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
							<i className="fa fa-building me-2"></i>
							<strong>Company & Position Columns Highlighted!</strong> View your applied companies and positions below.
						</div>
					)}

					{/* Refresh Controls */}
					<div className="status-page-toolbar mb-3" style={{ justifyContent: 'flex-start' }}>
						<div className="status-page-filter-group">
							<label className="status-page-filter-label" htmlFor="candidate-search-filter" onClick={() => setCurrentPage(1)}>
								Search
							</label>
							<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
								<i className="fa fa-search" style={{ position: 'absolute', left: '10px', color: '#adb5bd', fontSize: '13px' }}></i>
								<input
									id="candidate-search-filter"
									type="text"
									className="status-page-filter-select"
									placeholder="Search by company name..."
									value={searchQuery}
									onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
									style={{ paddingLeft: '30px', minWidth: '220px' }}
								/>
							</div>
						</div>
						<div className="status-page-filter-group">
							<label className="status-page-filter-label" htmlFor="candidate-position-search">
								Position
							</label>
							<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
								<i className="fa fa-briefcase" style={{ position: 'absolute', left: '10px', color: '#adb5bd', fontSize: '13px' }}></i>
								<input
									id="candidate-position-search"
									type="text"
									className="status-page-filter-select"
									placeholder="Search by position..."
									value={positionQuery}
									onChange={(e) => { setPositionQuery(e.target.value); setCurrentPage(1); }}
									style={{ paddingLeft: '30px', minWidth: '220px' }}
								/>
							</div>
						</div>
						<div className="status-page-filter-group">
							<label className="status-page-filter-label" htmlFor="candidate-status-filter">
								Status
							</label>
							<select
								id="candidate-status-filter"
								className="status-page-filter-select"
								value={selectedStatus}
								onChange={(event) => { setSelectedStatus(event.target.value); setCurrentPage(1); }}
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

					</div>
			
					<div className="twm-pro-view-chart-wrap">
						<div className="col-lg-12 col-md-12 mb-4">
							<div className="card card-shadow border-0">
								<div className="card-body p-0">
									<div className="table-responsive candidate-status-table-wrap">
									<table className="table table-hover mb-0 candidate-status-table">
										<thead style={{backgroundColor: '#f8f9fa'}}>
											<tr>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
													Applied Date
												</th>
												<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
													<i className="fa fa-building me-2" style={{color: '#ff6b35'}}></i>
													Company
												</th>
												<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
													<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
													Position
												</th>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
													Interview Progress
												</th>
												<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
													<i className="fa fa-flag me-2" style={{color: '#ff6b35'}}></i>
													Status
												</th>
												<th className="border-0 px-4 py-3 fw-semibold text-center" style={{color: '#232323'}}>
													<i className="fa fa-eye me-2" style={{color: '#ff6b35'}}></i>
													Book Slots
												</th>
												<th className="border-0 px-4 py-3 fw-semibold text-center" style={{color: '#232323'}}>
													<i className="fa fa-handshake me-2" style={{color: '#ff6b35'}}></i>
													Offer Letter
												</th>
											</tr>
										</thead>

										<tbody>
											{applications.length === 0 ? (
												<tr>
													<td colSpan="7" className="text-center py-5">
														<div className="d-flex flex-column align-items-center">
															<i className="fa fa-search fa-3x mb-3" style={{color: '#ff6b35'}}></i>
															<h5 style={{color: '#232323'}}>No Applications Yet</h5>
															<p className="text-muted mb-3">Start applying to jobs to see your application status here</p>
															<button className="btn btn-outline-primary" onClick={() => navigate(pubRoute(publicUser.jobs.GRID))} style={{backgroundColor: 'transparent'}}>
																<i className="fa fa-search me-2"></i>
																Browse Jobs
															</button>
														</div>
													</td>
												</tr>
											) : filteredApplications.length === 0 ? (
												<tr>
													<td colSpan="7" className="text-center py-5">
														<div className="d-flex flex-column align-items-center">
															<i className="fa fa-filter fa-3x mb-3" style={{color: '#ff6b35'}}></i>
															<h5 style={{color: '#232323'}}>No Matching Applications</h5>
															<p className="text-muted mb-0">No applications match the selected status filter.</p>
														</div>
													</td>
												</tr>
											) : (
												paginatedApplications.map((app, index) => {
													const interviewRounds = getInterviewRounds(app.jobId, app);
													const applicationDisplayStatus = getApplicationOnlyStatus(app);
													const isShortlisted = applicationDisplayStatus === 'shortlisted';
													const shouldHighlightRow = highlightShortlisted && isShortlisted;
													return (
														<tr 
															key={index} 
															className={`border-bottom ${shouldHighlightRow ? 'highlight-shortlisted' : ''}`}
															style={{
																backgroundColor: shouldHighlightRow ? '#e8f5e9' : 'transparent',
																transition: 'background-color 0.3s ease',
																border: shouldHighlightRow ? '2px solid #4caf50' : 'none'
															}}
														>
															<td className="px-4 py-3">
																<span className="text-dark fw-medium">
																	{formatDate(app.createdAt || app.appliedAt)}
																</span>
															</td>
															<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
																<div className="d-flex align-items-center status-company-cell-wrapper">
																	<div className="me-3">
																		<div className="rounded-circle" style={{width: '45px', height: '45px', minWidth: '45px', minHeight: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
																			{app.jobId?.companyLogo ? (
																				<img src={app.jobId.companyLogo} alt="Company Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
																			) : (
																				<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0', padding: '0', lineHeight: '1'}}></i>
																			)}
																		</div>
																	</div>
																	<div className="status-name-location-wrap">
																		<a href={`/emp-detail/${app.employerId?._id}`} className="text-decoration-none">
																			<h6 className="mb-0 fw-semibold text-dark hover-primary" style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '5px' }}>
																				{getEmployerDisplayCompanyName(app)}
																				{app.jobId?.companyName && app.jobId.companyName !== app.employerId?.companyName && (
																					<span className="badge bg-info bg-opacity-10 text-info border border-info ms-1" style={{ fontSize: '10px', padding: '2px 6px', fontWeight: '500', textTransform: 'none', whiteSpace: 'nowrap' }}>
																						Hiring for: {app.jobId.companyName}
																					</span>
																				)}
																			</h6>
																		</a>
																		<small className="text-muted d-inline-flex align-items-center">
																			<i className="fas fa-map-marker-alt mx-1"></i>
																			{(() => {
																				const locations = app.jobId?.location;
																				if (Array.isArray(locations)) {
																					if (locations.length === 1) {
																						return locations[0];
																					} else if (locations.length > 1) {
																						return `${locations[0]} +${locations.length - 1} more`;
																					}
																				}
																				return locations || 'Location Not Available';
																			})()}
																		</small>
																	</div>
																</div>
															</td>
															<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
																<span className="fw-medium text-dark">
																	{formatJobTitle(app.jobId?.title, 'Position Not Available')}
																</span>
															</td>
															<td className="px-4 py-3">
																<div className="interview-progress-wrapper" style={{display: 'flex', flexDirection: 'column', gap: '0', alignItems: 'center'}}>
																	{interviewRounds.length > 0 ? (() => {
																		return interviewRounds.map((round, roundIndex) => {
																			// Get interview details for this round
																			let roundName = typeof round === 'string' ? round : round.name;
																			const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round.uniqueKey;
																			
																			// CRITICAL Safety check: if roundName looks like a unique key, replace it immediately
																			if (roundName) {
																				// Check if it's a unique key pattern: contains _ , is all digits, or is MongoDB ObjectId
																				const isUniqueKey = roundName.includes('_') || 
																					roundName.match(/^[0-9a-f]{24}$/i) || 
																					/^\d+$/.test(roundName);
																				
																				if (isUniqueKey) {
																					const stageNameMap = {
																						technical: 'Technical Round',
																						oneOnOne: 'One-to-One',
																						panel: 'Panel',
																						group: 'Group Discussion',
																						situational: 'Situational / Behavioral Round',
																						others: 'Others � Specify.',
																						assessment: 'Assessment',
																						nonTechnical: 'Non-Technical',
																						managerial: 'Managerial Round',
																						final: 'Final',
																						hr: 'HR Round',
																						aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
																						coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
																					};
																					
																					// Better extraction: look for known keywords in the unique key
																					let extractedType = null;
																					const lowerKey = uniqueKey.toLowerCase();
																					
																					if (lowerKey.includes('assessment')) extractedType = 'assessment';
																					else if (lowerKey.includes('technical')) extractedType = 'technical';
																					else if (lowerKey.includes('oneonone') || lowerKey.includes('one-on-one') || lowerKey.includes('one_on_one')) extractedType = 'oneOnOne';
																					else if (lowerKey.includes('panel')) extractedType = 'panel';
																					else if (lowerKey.includes('group')) extractedType = 'group';
																					else if (lowerKey.includes('situational')) extractedType = 'situational';
																					else if (lowerKey.includes('others')) extractedType = 'others';
																					else if (lowerKey.includes('nontechnical')) extractedType = 'nonTechnical';
																					else if (lowerKey.includes('managerial')) extractedType = 'managerial';
																					else if (lowerKey.includes('final')) extractedType = 'final';
																					else if (lowerKey.includes('hr')) extractedType = 'hr';
																					else {
																						// Fallback: try splitting by underscore/dash
																						const parts = uniqueKey.split(/[_-]/);
																						extractedType = parts.find(p => stageNameMap[p.toLowerCase()]);
																					}
																					
																					if (!extractedType && typeof round === 'object' && round.roundType) {
												const fallbackType = round.roundType.includes('_') ? round.roundType.split('_')[0] : round.roundType;
												extractedType = fallbackType;
											}
											console.log('Round ' + roundIndex + ' - extractedType:', extractedType);
																					roundName = extractedType && stageNameMap[extractedType] ? stageNameMap[extractedType] : 'Interview Round';
																					console.log('Round ' + roundIndex + ' - Final roundName after conversion:', roundName);
																				}
																			}
																			
																			// Try to find round details with multiple possible keys
																			let roundDetails = null;
																			if (app.jobId?.interviewRoundDetails) {
																				// First try the uniqueKey
																				roundDetails = app.jobId.interviewRoundDetails[uniqueKey];
																				
																				// If not found, try to find by round type in any key
																				if (!roundDetails) {
																					const roundType = typeof round === 'object' ? round.roundType : round.toLowerCase();
																					for (const [key, details] of Object.entries(app.jobId.interviewRoundDetails)) {
																						if (key.includes(roundType) && details && (details.description || details.fromDate || details.toDate)) {
																							roundDetails = details;
																							break;
																						}
																					}
																				}
																				
																		}
																		roundDetails = resolveRoundDetails(app, round, roundIndex, interviewRounds);
																		const assessmentRoundInfo = roundName === 'Assessment'
																			? getAssessmentRoundInfo(app, roundName, roundDetails)
																			: null;
																			let roundStatus = getRoundStatus(app, roundIndex, roundName, false, roundDetails);
																			// Only override pending->rejected if THIS round itself has a blocking status.
																			if (applicationDisplayStatus === 'rejected' && normalizeStatusValue(roundStatus?.text) === 'pending') {
																				if (getBlockingRoundStatus(app, round, roundIndex, interviewRounds)) {
																					roundStatus = { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
																				}
																			}
																			const assessmentSchedule = roundName === 'Assessment'
																				? getAssessmentScheduleSource(app.jobId, roundDetails)
																				: null;
																			const assessmentWindowInfo = roundName === 'Assessment'
																				? getAssessmentWindowInfo(app.jobId, roundDetails)
																				: null;
																								const isPreviousRoundRejected = roundIndex > 0 && (() => {
																				const prevRound = interviewRounds[roundIndex - 1];
																				const prevRoundName = typeof prevRound === 'string' ? prevRound : prevRound?.name;
																				const prevRoundDetails = resolveRoundDetails(app, prevRound, roundIndex - 1, interviewRounds);
																				const prevRoundStatus = getRoundStatus(app, roundIndex - 1, prevRoundName, false, prevRoundDetails);
																				return isRejectedInterviewProcessStatus(prevRoundStatus?.text);
																			})();
														const shouldShowAssessmentCountdown =
																				roundName === 'Assessment' &&
																				Boolean(assessmentWindowInfo?.isBeforeStart && assessmentWindowInfo?.startDate) &&
																				!assessmentRoundInfo?.completionInfo?.isCompleted &&
																				!assessmentRoundInfo?.completionInfo?.isInProgress &&
																				!assessmentRoundInfo?.completionInfo?.isSuspended &&
																				!isPreviousRoundRejected &&
																				applicationDisplayStatus !== 'rejected';
																			const formatRoundDate = (dateStr) => {
																				if (!dateStr) return null;
																				try {
																					return formatDate(dateStr);
																				} catch (error) {
																					return null;
																				}
																			};
																			let startDate, endDate, dateDisplay;
																			
																			if (roundName === 'Assessment') {
																				startDate = formatRoundDate(assessmentSchedule?.startDate);
																				endDate = formatRoundDate(assessmentSchedule?.endDate);
																			} else {
																				startDate = formatRoundDate(roundDetails?.fromDate || roundDetails?.date);
																				endDate = formatRoundDate(roundDetails?.toDate);
																			}
																			
																			dateDisplay = startDate && endDate ? `${startDate} - ${endDate}` : 
																						  startDate ? `From: ${startDate}` : 
																						  endDate ? `Until: ${endDate}` : null;
																			
																			return (
																				<div key={roundIndex} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: roundIndex > 0 ? '8px' : '0'}}>
																					<div className="interview-round-item" style={{padding: '4px 0', textAlign: 'center'}}>
																						<div className="round-name" style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#232323'}}>{roundName}</div>
																						<div style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center'}}>
																							{shouldShowAssessmentCountdown && (() => {
																								const windowInfo = assessmentWindowInfo;
																								if (windowInfo.isBeforeStart && windowInfo.startDate) {
																									const now = new Date().getTime();
																									const timeUntilStart = windowInfo.startDate.getTime() - now;
																									return (
																										<AssessmentTimer
																											timerInfo={{ isBeforeStart: true, timeUntilStart, startDate: windowInfo.startDate }}
																											onTimerEnd={() => fetchApplications()}
																										/>
																									);
																								}
																								return null;
																							})()}
																							<span className={`badge ${roundStatus.class}`} style={{fontSize: '12px', padding: '4px 8px'}}>
																								{roundStatus?.text || 'Pending'}
																							</span>
																						</div>
																					</div>
																				</div>
																			);
																		});
																	})() : (
																		<span className="text-muted fst-italic">No rounds specified</span>
																	)}
																</div>
															</td>
															<td className="px-4 py-3">
																<span className={
																	applicationDisplayStatus === 'pending' ? 'badge bg-warning bg-opacity-10 text-warning border border-warning' :
																	['shortlisted', 'shortlisted_for_next_round'].includes(applicationDisplayStatus) ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	applicationDisplayStatus === 'interviewed' ? 'badge bg-primary bg-opacity-10 text-primary border border-primary' :
																	applicationDisplayStatus === 'hired' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	applicationDisplayStatus === 'offer_sent' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	applicationDisplayStatus === 'accepted' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	applicationDisplayStatus === 'rejected' ? 'badge bg-danger bg-opacity-10 text-danger border border-danger' : 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary'
																} style={{fontSize: '12px', padding: '6px 12px'}}>
																	{applicationDisplayStatus === 'hired' ? 'Hired' :
																	 applicationDisplayStatus === 'offer_sent' ? 'Offer Letter Sent' :
																	 applicationDisplayStatus === 'accepted' ? 'Offer Accepted' :
																	 formatStatusLabel(applicationDisplayStatus) || 'Pending'}
																</span>
															</td>
															<td className="px-4 py-3 text-center" style={{ verticalAlign: 'middle', textAlign: 'center', minWidth: '92px', width: '92px' }}>
																<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
																	<div
																		className="status-view-interviews-action"
																		role="button"
																		tabIndex={0}
																		onClick={() => handleViewAllDetails(app)}
																		onKeyDown={(e) => {
																			if (e.key === 'Enter' || e.key === ' ') {
																				e.preventDefault();
																				handleViewAllDetails(app);
																			}
																		}}
																		title="View all interview process details"
																		aria-label="View interviews"
																	>
																		<span>View</span>
																		<span>Interviews</span>
																	</div>
																</div>
															</td>
															<td className="px-4 py-3 text-center">
																{applicationDisplayStatus === 'offer_sent' ? (
																	<div className="d-flex gap-2 justify-content-center">
																		<button 
																			className="btn btn-sm btn-success" 
																			onClick={() => handleOfferResponse(app._id, 'accepted')}
																			title="Accept Offer"
																		>
																			Accept
																		</button>
																		<button 
																			className="btn btn-sm btn-danger" 
																			onClick={() => handleOfferResponse(app._id, 'rejected')}
																			title="Reject Offer"
																		>
																			Reject
																		</button>
																	</div>
																) : applicationDisplayStatus === 'accepted' ? (
																	<span className="btn btn-sm btn-outline-success disabled" title="Accepted Offer">
																		Accepted Offer
																	</span>
																) : applicationDisplayStatus === 'rejected' && app.statusHistory?.some(h => h.status === 'offer_sent') ? (
																	<span className="btn btn-sm btn-outline-danger disabled" title="Rejected Offer">
																		Rejected Offer
																	</span>
																) : (
																	<span className="text-muted small">-</span>
																)}
															</td>
														</tr>
													);
												})
											)}

										</tbody>
									</table>
									</div>
								</div>
							</div>
						</div>
						<div className="status-page-pagination-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px", borderTop: "1px solid #e9ecef", paddingTop: "14px", flexWrap: "wrap", gap: "10px", flexDirection: "row" }}>
							<div style={{ color: "#6c757d", fontSize: "13px" }}>
								Showing {filteredApplications.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}�{Math.min(currentPage * PAGE_SIZE, filteredApplications.length)} of {filteredApplications.length} record{filteredApplications.length !== 1 ? "s" : ""}
							</div>
							{Math.ceil(filteredApplications.length / PAGE_SIZE) > 1 && (
								<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
									<button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === 1 ? "#f8f9fa" : "#fff", color: currentPage === 1 ? "#adb5bd" : "#495057", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8249;</button>
									{Array.from({ length: Math.ceil(filteredApplications.length / PAGE_SIZE) }, (_, i) => i + 1).map(page => (
										<button key={page} onClick={() => setCurrentPage(page)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: page === currentPage ? "1px solid #ff8c00" : "1px solid #dee2e6", background: page === currentPage ? "#ff8c00" : "#fff", color: page === currentPage ? "#fff" : "#495057", fontWeight: page === currentPage ? 700 : 400, cursor: "pointer", fontSize: "13px" }}>{page}</button>
									))}
									<button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "6px", border: "1px solid #dee2e6", background: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "#f8f9fa" : "#fff", color: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "#adb5bd" : "#495057", cursor: currentPage === Math.ceil(filteredApplications.length / PAGE_SIZE) ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>&#8250;</button>
								</div>
							)}
						</div>
					</div>
						</>
					)}
				</div>
			</div>
			)}

			{isInterviewDetailsPage && !selectedApplication && (
				<div className="twm-right-section-panel site-bg-gray candidate-status-page candidate-status-details-page">
					<div style={{padding: '16px 20px'}}>
						<button
							type="button"
							className="btn btn-outline-secondary mb-3"
							onClick={() => navigate(canRoute(candidate.STATUS))}
						>
							<i className="fa fa-arrow-left me-2"></i>
							Back to Status
						</button>
						{loading ? (
							<PageLoader pageName="Interview Details" />
						) : (
							<div className="text-center py-4">
								<i className="fa fa-info-circle fa-2x mb-3" style={{color: '#ff6b35'}}></i>
								<p className="mb-0 text-muted">Interview process details not found for this application.</p>
							</div>
						)}
						</div>
					</div>
			)}
			
			{/* Interview Round Details Popup */}
			<PopupInterviewRoundDetails
				isOpen={showRoundDetails}
				onClose={() => setShowRoundDetails(false)}
				roundDetails={selectedRoundDetails}
				roundType={selectedRoundType}
				assessmentId={selectedAssessmentId}
			/>

			<TermsModal
				isOpen={showInterviewInstructionsModal}
				onClose={handleCloseInterviewInstructions}
				onAccept={handleAcceptInterviewInstructions}
				role="candidateInterviewInstructions"
			/>

			{/* All Interview Details Modal */}
			{isInterviewDetailsPage && selectedApplication && (
				<div
					className="twm-right-section-panel site-bg-gray candidate-status-page candidate-status-details-page"
					style={{ display: 'block' }}
				>
					<div style={{ padding: '16px 20px' }}>
						<div style={{backgroundColor: '#f5f5f5', color: '#000', borderRadius: '8px', marginBottom: '16px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
							<h5 style={{margin: 0, fontWeight: '600'}}>
									<i className="fa fa-clipboard-list me-2" style={{color: '#ff6b35'}}></i>
									Interview Process Details
							</h5>
							<button
								type="button"
								className="btn btn-outline-secondary btn-sm"
								onClick={() => navigate(canRoute(candidate.STATUS))}
							>
								<i className="fa fa-arrow-left me-2"></i>
								Back to Status
							</button>
						</div>
						<div style={{padding: '0'}}>
								{/* Job Information */}
								<div className="mb-4 p-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
										Job Information
									</h6>
									<div className="row">
										<div className="col-md-6 mb-2">
											<strong>Company:</strong> {getEmployerDisplayCompanyName(selectedApplication)}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Position:</strong> {formatJobTitle(selectedApplication.jobId?.title, 'N/A')}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Location:</strong> {(() => {
												const locations = selectedApplication.jobId?.location;
												if (Array.isArray(locations)) {
													if (locations.length === 1) {
														return locations[0];
													} else if (locations.length > 1) {
														return `${locations[0]} +${locations.length - 1} more`;
													}
												}
												return locations || 'N/A';
											})()}
										</div>
										<div className="col-md-6 mb-2">
											<strong>Applied Date:</strong> {formatDate(selectedApplication.createdAt || selectedApplication.appliedAt)}
										</div>
										<div className="col-md-12 mb-2">
											{(() => {
												const selectedApplicationDisplayStatus = getApplicationOnlyStatus(selectedApplication);
												const hasRejectedOffer = selectedApplication.statusHistory?.some((history) => history?.status === 'offer_sent') && selectedApplicationDisplayStatus === 'rejected';

												return (
													<>
														<strong>Status:</strong>
														<span className="ms-2">{formatStatusLabel(selectedApplicationDisplayStatus)}</span>
														{selectedApplicationDisplayStatus === 'offer_sent' ? (
															<div className="d-flex gap-2 flex-wrap mt-3">
																<button
																	type="button"
																	className="btn btn-success btn-sm"
																	onClick={() => handleOfferResponse(selectedApplication._id, 'accepted')}
																>
																	Accept Offer
																</button>
																<button
																	type="button"
																	className="btn btn-danger btn-sm"
																	onClick={() => handleOfferResponse(selectedApplication._id, 'rejected')}
																>
																	Reject Offer
																</button>
															</div>
														) : hasRejectedOffer ? (
															<div className="mt-3">
																<span className="btn btn-sm btn-outline-danger disabled">Offer Rejected</span>
															</div>
														) : null}
													</>
												);
											})()}
										</div>
									</div>
								</div>

								{/* Interview Rounds */}
								<div className="mb-3">
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
										Interview Rounds
									</h6>
									{(() => {
										const roundsList = getInterviewRounds(selectedApplication.jobId, selectedApplication);
										const selectedAppDisplayStatus = getApplicationOnlyStatus(selectedApplication);
										return roundsList.map((round, roundIndex) => {
										let roundName = typeof round === 'string' ? round : round.name;
										const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round.uniqueKey;
										
										// Safety check: ensure roundName is not a unique key
										if (roundName && (roundName.includes('_') || roundName.match(/^[0-9a-f]{24}$/i) || /^\d+$/.test(roundName))) {
											const stageNameMap = {
												technical: 'Technical Round',
												oneOnOne: 'One-to-One',
												panel: 'Panel',
												group: 'Group Discussion',
												situational: 'Situational / Behavioral Round',
												others: 'Others � Specify.',
												assessment: 'Assessment',
												nonTechnical: 'Non-Technical',
												managerial: 'Managerial Round',
												final: 'Final',
												hr: 'HR Round',
												aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
												coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
											};
											
											// Better extraction: look for known keywords in the unique key
											let extractedType = null;
											const lowerKey = uniqueKey.toLowerCase();
											
											if (lowerKey.includes('assessment')) extractedType = 'assessment';
											else if (lowerKey.includes('technical')) extractedType = 'technical';
											else if (lowerKey.includes('oneonone') || lowerKey.includes('one-on-one') || lowerKey.includes('one_on_one')) extractedType = 'oneOnOne';
											else if (lowerKey.includes('panel')) extractedType = 'panel';
											else if (lowerKey.includes('group')) extractedType = 'group';
											else if (lowerKey.includes('situational')) extractedType = 'situational';
											else if (lowerKey.includes('others')) extractedType = 'others';
											else if (lowerKey.includes('nontechnical')) extractedType = 'nonTechnical';
											else if (lowerKey.includes('managerial')) extractedType = 'managerial';
											else if (lowerKey.includes('final')) extractedType = 'final';
											else if (lowerKey.includes('hr')) extractedType = 'hr';
											else {
												// Fallback: try splitting by underscore/dash
												const parts = uniqueKey.split(/[_-]/);
												extractedType = parts.find(p => stageNameMap[p.toLowerCase()]);
											}
											
											const customType = selectedApplication.jobId?.interviewRoundDetails?.[uniqueKey]?.customType;
											roundName = (extractedType === 'others' && customType && customType.trim())
												? customType.trim()
												: (extractedType && stageNameMap[extractedType] ? stageNameMap[extractedType] : 'Interview Round');
										}
										
										const roundType = (typeof round === 'object' ? round.roundType : round.toLowerCase()).replace(/[^a-z]/gi, '');
										
										let roundDetails = resolveRoundDetails(selectedApplication, round, roundIndex, roundsList);
										// Merge with processRemarks if available
										if (selectedApplication.interviewProcesses?.[roundIndex]) {
											const remarks = resolveProcessRemarks(
												selectedApplication.interviewProcesses[roundIndex],
												roundName,
												typeof round === 'object' ? round.roundType : round.toLowerCase(),
												selectedApplication.processRemarks
											);
											if (remarks) {
												roundDetails = { ...roundDetails, employerRemarks: remarks };
											}
										}
										const roundTypeRaw = typeof round === 'object' ? round.roundType : round.toLowerCase();
										const roundId = getInterviewRoundIdForRound(selectedApplication, uniqueKey, roundTypeRaw, roundDetails);
										const candidateId = (() => {
											const directCandidateId = selectedApplication.candidateId?._id || selectedApplication.candidateId;
											if (directCandidateId) return directCandidateId;
											try {
												const storedCandidateUser = JSON.parse(localStorage.getItem('candidateUser') || '{}');
												return storedCandidateUser?._id || localStorage.getItem('candidateId');
											} catch (error) {
												return localStorage.getItem('candidateId');
											}
										})();
										const candidateSlotIdentity = selectedApplication?.candidateId || {
											_id: candidateId,
											candidateEmail: selectedApplication?.candidateEmail || selectedApplication?.applicantEmail,
											candidateName: selectedApplication?.candidateName || selectedApplication?.applicantName
										};
										const bookedRoundContext = roundName !== 'Assessment'
											? resolveBookedRoundContext(
												selectedApplication,
												roundDetails,
												uniqueKey,
												roundTypeRaw,
												roundId,
												candidateSlotIdentity
											)
											: null;
										const activeRoundDetails = bookedRoundContext?.roundDetails || roundDetails;
										const bookedSlot = bookedRoundContext?.bookedSlot || null;
										const assessmentRoundInfo = roundName === 'Assessment'
											? getAssessmentRoundInfo(selectedApplication, roundName, roundDetails)
											: null;
										let roundStatus = getRoundStatus(selectedApplication, roundIndex, roundName, true, roundDetails);
										// Only override pending->rejected if THIS round itself has a blocking status.
										if (selectedAppDisplayStatus === 'rejected' && normalizeStatusValue(roundStatus?.text) === 'pending') {
											if (getBlockingRoundStatus(selectedApplication, round, roundIndex, roundsList)) {
												roundStatus = { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
											}
										}
										const assessmentSchedule = roundName === 'Assessment'
											? getAssessmentScheduleSource(selectedApplication.jobId, roundDetails)
											: null;
										const assessmentWindowInfo = roundName === 'Assessment'
											? getAssessmentWindowInfo(selectedApplication.jobId, roundDetails)
											: null;
										
										const assessmentId = assessmentRoundInfo?.assessmentId || selectedApplication.jobId?.assessmentId;
										const activationState = roundIndex > 0
											? getRoundActivationState(selectedApplication, roundIndex, roundsList)
											: { canStart: true, previousAssessmentFailed: false };

										return (
											<div key={roundIndex} className="mb-3 p-3" style={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
												<div className="d-flex justify-content-between align-items-center mb-2">
													<h6 className="mb-0" style={{color: '#232323', fontWeight: '600'}}>
														<i className="fa fa-circle me-2" style={{color: '#ff6b35', fontSize: '8px'}}></i>
														{roundName}
													</h6>
													<div className="d-flex gap-2 align-items-center">
														<span style={{fontSize: '13px', fontWeight: '600', padding: '6px 10px', minWidth: '84px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.2, borderRadius: '999px', ...getRoundStatusPillStyle(roundStatus.text)}}>
															{roundStatus.text}
														</span>
													</div>
												</div>
												
												{/* Assessment Details */}
												{roundName === 'Assessment' && (
													<div className="mt-2">
														{/* Assessment Period */}
														{(assessmentSchedule?.startDate || assessmentSchedule?.endDate) && (
															<div className="mb-2">
																{(() => {
																	const interviewStartDate = assessmentSchedule?.startDate;
																	const startTime = assessmentSchedule?.startTime;
																	const endTime = assessmentSchedule?.endTime;
																	if (!interviewStartDate || !startTime || !endTime) {
																		return (
																			<div>
																				{assessmentSchedule?.startDate && (
																					<span><strong>Date:</strong> {formatDate(assessmentSchedule.startDate)} {assessmentSchedule?.startTime && `at ${formatTimeToAMPM(assessmentSchedule.startTime)}`}</span>
																				)}
																			</div>
																		);
																	}
																	const startDateLabel = formatDate(interviewStartDate);
																	const dateLabel = startDateLabel;
																	const timingLabel = `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
																	const assessmentTimerMinutes = roundDetails?.assessmentTimer ?? selectedApplication.jobId?.assessmentTimer ?? null;
																	const [startHours, startMinutes] = startTime.split(':').map(Number);
																	const [endHours, endMinutes] = endTime.split(':').map(Number);
																	const computedMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
																	const durationMinutes = (assessmentTimerMinutes != null && assessmentTimerMinutes > 0) ? assessmentTimerMinutes : Math.max(0, computedMinutes);
																	const durationLabel = `${durationMinutes}mins`;
																			return (
																				<div className="mb-2" style={{ fontSize: '14px' }}>
																					<div className="d-flex align-items-start" style={{ gap: '10px' }}>
																						<span className="text-muted" style={{ minWidth: '70px', display: 'inline-block' }}>Date</span>
																						<span className="fw-bold text-dark">{dateLabel}</span>
																					</div>
																					<div className="d-flex align-items-start" style={{ gap: '10px' }}>
																						<span className="text-muted" style={{ minWidth: '70px', display: 'inline-block' }}>Timing</span>
																						<span className="fw-bold text-dark">{timingLabel}</span>
																					</div>
																					<div className="d-flex align-items-start" style={{ gap: '10px' }}>
																						<span className="text-muted" style={{ minWidth: '70px', display: 'inline-block' }}>Duration</span>
																						<span className="fw-bold text-dark">{durationLabel}</span>
																					</div>
																				</div>
																			);
																})()}
															</div>
														)}

														{/* Assessment Employer Remarks */}
														{(() => {
															const assessmentProcess =
																selectedApplication.interviewProcesses?.[roundIndex] ||
																selectedApplication.interviewProcesses?.find(p => p.type === 'assessment' || p.name?.toLowerCase().includes('assessment'));
															const processRemarks = resolveProcessRemarks(
																assessmentProcess,
																'Assessment',
																'assessment',
																selectedApplication.processRemarks
															);
															const remarks = processRemarks || roundDetails?.employerRemarks;
															
															if (!remarks || typeof remarks !== 'string') {
																return (
																	<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																		<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Employer Remarks:</strong></small>
																		<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>No remarks provided.</div>
																	</div>
																);
															}
															return (
																<div className="mb-3 p-2" style={{backgroundColor: '#fff3e0', borderRadius: '6px', border: '1px solid #ffe0b3'}}>
																	<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Employer Remarks:</strong></small>
																	<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%'}}>{remarks}</div>
																</div>
															);
														})()}

														{/* Assessment Action Buttons */}
														<div className="mt-3 pt-2 border-top d-flex gap-2 flex-wrap">
															{(() => {
																const assessmentInfo = assessmentRoundInfo?.completionInfo || getAssessmentCompletionInfo(selectedApplication);
																const attemptResult = String(assessmentRoundInfo?.attempt?.result || '').toLowerCase();
																const isSubjectiveAutoSubmitted = assessmentInfo.isExpired && attemptResult === 'pending';
																const hasFinalAssessmentResult = assessmentInfo.isCompleted || isSubjectiveAutoSubmitted;
																const assessmentWindowClosed = assessmentWindowInfo?.isAfterEnd && !isSubjectiveAutoSubmitted;
																const isAssessmentLockedByPreviousRound = roundIndex > 0 && !activationState.canStart && !assessmentInfo.isInProgress;
																const wasAutoSubmittedAfterTabClose = hasAssessmentCloseAutoSubmitViolation(assessmentRoundInfo?.attempt);

																if (hasFinalAssessmentResult) {
																	return (
																<button 
																	className="btn btn-sm btn-success"
																	onClick={() => {
																		const resultUrl = canRoute(candidate.RESULT.replace(':applicationId', selectedApplication._id));
																		navigate(assessmentId ? `${resultUrl}?assessmentId=${encodeURIComponent(assessmentId)}` : resultUrl);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-bar-chart me-1"></i>
																	View Result
																</button>
																	);
																}

																if (isAssessmentLockedByPreviousRound) {
																	return (
																		<>
																			<button
																				type="button"
																				className="btn btn-sm btn-secondary"
																				disabled
																				title="This assessment will be enabled after the previous round is marked Shortlisted for Next Round or Selected"
																				style={{ borderRadius: '6px', cursor: 'not-allowed' }}
																			>
																				<i className="fa fa-lock me-1"></i>
																				Start Assessment
																			</button>
																		</>
																	);
																}

																if (assessmentInfo.isExpired || assessmentWindowClosed) {
																	return (
																	<div>
																	<button 
																		className="btn btn-sm btn-danger"
																		disabled
																		style={{borderRadius: '6px'}}
																	>
																		<i className="fa fa-times me-1"></i>
																		Assessment Expired
																	</button>
																	<div className="alert alert-danger mt-2 mb-0" style={{fontSize: '13px', padding: '8px 12px'}}>
																		<i className="fa fa-exclamation-circle me-1"></i>
																		The assessment window has ended.
																	</div>
																</div>
																	);
																}

																if (assessmentInfo.isSuspended) {
																	return (
																		<>
																		<button 
																			className="btn btn-sm btn-danger"
																			disabled
																			style={{borderRadius: '6px'}}
																		>
																			<i className="fa fa-ban me-1"></i>
																			Assessment Suspended
																		</button>
																		<div className="alert alert-danger mt-2 mb-0" style={{fontSize: '13px', padding: '8px 12px'}}>
																			<i className="fa fa-exclamation-triangle me-1"></i>
																			This assessment was suspended after repeated rule violations and cannot be resumed.
																		</div>
																		</>
																	);
																}

																if (assessmentInfo.isInProgress && wasAutoSubmittedAfterTabClose) {
																	return (
																	<div>
																		<button 
																		type="button"
																		className="btn btn-sm btn-warning"
																		aria-disabled="true"
																		onClick={() => showWarning(ASSESSMENT_CLOSE_AUTO_SUBMIT_MESSAGE, 6000)}
																		style={{borderRadius: '6px', cursor: 'not-allowed'}}
																	>
																		<i className="fa fa-exclamation-triangle me-1"></i>
																		Continue Assessment
																	</button>
																		<div className="alert alert-warning mt-2 mb-0" style={{fontSize: '13px', padding: '8px 12px'}}>
																			<i className="fa fa-exclamation-triangle me-1"></i>
																			{ASSESSMENT_CLOSE_AUTO_SUBMIT_MESSAGE}
																		</div>
																	</div>
																	);
																}

																if (assessmentInfo.isInProgress) {
																	return (
																	<button 
																	className="btn btn-sm btn-warning"
																	onClick={() => {
																		handleStartAssessment(selectedApplication, roundDetails);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Continue Assessment
																</button>
																	);
																}

																return (
																<button 
																	className="btn btn-sm btn-primary"
																	onClick={() => {
																		handleStartAssessment(selectedApplication, roundDetails);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Start Assessment
																</button>
																);
															})()}
														</div>
													</div>
												)}

												{/* Round Details - Always show if we have any details */}
												{roundName !== 'Assessment' && (
													<div className="mt-2">
														{roundDetails && (
															<>
																{!bookedSlot && (roundDetails.fromDate || roundDetails.toDate) && (
																	<div className="mb-2">
																		{(() => {
																			const interviewStartDate = roundDetails.fromDate || roundDetails.date;
																			const interviewEndDate = roundDetails.toDate || roundDetails.date;
																			const startTime = roundDetails.startTime;
																			const endTime = roundDetails.endTime;
																			if (!interviewStartDate || !startTime || !endTime) {
																				return null;
																			}
																			const startDateLabel = formatDate(interviewStartDate);
																			const endDateLabel = interviewEndDate ? formatDate(interviewEndDate) : null;
																			const dateLabel = endDateLabel
																				? `${startDateLabel} - ${endDateLabel}`
																				: startDateLabel;
																			const timingLabel = `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
																			const [startHours, startMinutes] = startTime.split(':').map(Number);
																			const [endHours, endMinutes] = endTime.split(':').map(Number);
																			const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
																			const durationLabel = `${Math.max(0, totalMinutes)}mins`;
																			return (
																				<div className="mb-2" style={{ fontSize: '14px' }}>
																					<div><span className="text-muted">Date</span> <span className="fw-bold text-dark ms-2">{dateLabel}</span></div>
																					<div><span className="text-muted">Timing</span> <span className="fw-bold text-dark ms-2">{timingLabel}</span></div>
																					<div><span className="text-muted">Duration</span> <span className="fw-bold text-dark ms-2">{durationLabel}</span></div>
																				</div>
																			);
																		})()}
																		<small className="text-muted"><i className="fa fa-calendar me-1"></i>Interview Period:</small>
																		<div>
																			{roundDetails.fromDate && <span><strong>From:</strong> {formatDate(roundDetails.fromDate)} {roundDetails.startTime && `at ${formatTimeToAMPM(roundDetails.startTime)}`}</span>}
																			{roundDetails.fromDate && roundDetails.toDate && <span className="mx-2">-</span>}
																			{roundDetails.toDate && <span><strong>To:</strong> {formatDate(roundDetails.toDate)} {roundDetails.endTime && `at ${formatTimeToAMPM(roundDetails.endTime)}`}</span>}
																			{roundDetails.startTime && roundDetails.endTime && (() => {
																				const [startHours, startMinutes] = roundDetails.startTime.split(':').map(Number);
																				const [endHours, endMinutes] = roundDetails.endTime.split(':').map(Number);
																				const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
																				const hours = Math.floor(totalMinutes / 60);
																				const minutes = totalMinutes % 60;
																				return <div className="mt-1"><strong>Duration:</strong> {hours > 0 && `${hours}h `}{minutes > 0 && `${minutes}m`}</div>;
																			})()}
																			{roundDetails.time && <div className="mt-1"><strong>Time:</strong> {formatInterviewTime(roundDetails.time, roundDetails.fromDate)} - This timing continues until {roundDetails.toDate ? formatDate(roundDetails.toDate) : 'end date'}</div>}
																		</div>
																	</div>
																)}
																{roundDetails.description && typeof roundDetails.description === 'string' && (
																	<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																		<small className="text-muted d-block mb-1"><i className="fa fa-clipboard-check me-1" style={{color: '#ff6b35'}}></i><strong>Interview Process Description:</strong></small>
																		<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%'}}>{roundDetails.description}</div>
																	</div>
																)}
																{(() => {
																	const roundTypeRaw = typeof round === 'object' ? round.roundType : round.toLowerCase();
																	const process = findRelatedInterviewProcess(selectedApplication, {
																		uniqueKey,
																		processId: typeof round === 'object' ? (round.processId || round.id || round._id) : '',
																		roundType: roundTypeRaw,
																		roundName,
																		index: roundIndex
																	});
																	const processRemarks = resolveProcessRemarks(
																		process,
																		roundName,
																		roundTypeRaw,
																		selectedApplication.processRemarks
																	);
																	const remarks = roundDetails?.employerRemarks || processRemarks;
																	return (
																		<>
																			{remarks ? (
																				<div className="mb-3 p-2" style={{backgroundColor: '#fff3e0', borderRadius: '6px', border: '1px solid #ffe0b3'}}>
																					<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Employer Remarks:</strong></small>
																					<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%'}}>{remarks}</div>
																				</div>
																			) : (
																				<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																					<small className="text-muted d-block mb-1"><i className="fa fa-comment me-1" style={{color: '#ff6b35'}}></i><strong>Employer Remarks:</strong></small>
																					<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>No remarks provided.</div>
																				</div>
																			)}
																		</>
																	);
																})()}
																{!roundDetails.fromDate && !roundDetails.toDate && roundDetails.date && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-calendar me-1"></i>Date:</small>
																		<div>{formatDate(roundDetails.date)}</div>
																	</div>
																)}
																{roundDetails.location && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-map-marker me-1"></i>Location:</small>
																		<div>{roundDetails.location}</div>
																	</div>
																)}
																{roundDetails.interviewerName && (
																	<div className="mb-2">
																		<small className="text-muted"><i className="fa fa-user me-1"></i>Interviewer:</small>
																		<div>{roundDetails.interviewerName}</div>
																	</div>
																)}
															</>
														)}
														{!roundDetails && (
															<div className="mb-2 p-2" style={{backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7'}}>
																<small className="text-muted"><i className="fa fa-info-circle me-1"></i>Interview details will be updated by the employer soon.</small>
															</div>
														)}
													</div>
												)}

												{/* Feedback */}
												{roundStatus.feedback && (
													<div className="mt-2 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
														<small className="text-muted"><i className="fa fa-comment me-1"></i>Feedback:</small>
														<div className="mt-1">{roundStatus.feedback}</div>
													</div>
												)}
												
												{/* Schedule Button - Below the card */}
												{roundName !== 'Assessment' && (() => {
													const roundWindowInfo = getInterviewRoundWindowInfo(roundDetails);
													const bookSlotUrl = `https://schedule.taleglobal.net/scheduler/book/${roundId}/${candidateId}`;
													const candidateSearchTokens = [
														candidateId,
														selectedApplication?.candidateEmail,
														selectedApplication?.applicantEmail,
														selectedApplication?.candidateName,
														selectedApplication?.applicantName
													]
														.filter(Boolean)
														.map((value) => String(value).trim().toLowerCase())
														.filter(Boolean);
													const hasCandidateRef = (payload) => {
														if (!payload || candidateSearchTokens.length === 0) return false;
														try {
															const serializedPayload = JSON.stringify(payload).toLowerCase();
															return candidateSearchTokens.some((token) => serializedPayload.includes(token));
														} catch (error) {
															return false;
														}
													};
													
													const relatedProcess = findRelatedInterviewProcess(selectedApplication, {
														uniqueKey,
														processId: typeof round === 'object' ? (round.processId || round.id || round._id) : '',
														roundType: roundTypeRaw,
														roundName,
														index: roundIndex
													});
													
													const relatedStage = findRelatedInterviewStage(selectedApplication, {
														uniqueKey,
														roundType: roundTypeRaw,
														index: roundIndex
													});
													
													const processStatus = (relatedProcess?.status || '').toLowerCase();
													const stageStatus = (relatedStage?.status || '').toLowerCase();
													const currentRoundStatusText = (roundStatus?.text || '').toLowerCase();
													const currentRoundCompletedStates = [
														'interview_completed', 'completed', 'selected', 'rejected',
														'failed', 'passed'
													];
													const isRoundShortlistedForNext = ['shortlisted for next round', 'shortlisted_for_next_round'].includes(
														currentRoundStatusText.replace(/\s+/g, ' ')
													);
													const isCurrentRoundCompleted =
														isRoundShortlistedForNext ||
														currentRoundCompletedStates.includes(processStatus) ||
														currentRoundCompletedStates.includes(stageStatus) ||
														currentRoundCompletedStates.includes(currentRoundStatusText);
													const bookedSlotDate = bookedSlot?.date;
													const bookedSlotStart = bookedSlot?.startTime;
													const bookedSlotEnd = bookedSlot?.endTime;
													const bookedSlotInterviewer = bookedSlot?.interviewerName;
													const bookedSlotEndDateTime = (() => {
														if (!bookedSlotDate || !bookedSlotEnd) return null;
														return buildUtcDateTimeFromIst(bookedSlotDate, bookedSlotEnd, 'start');
													})();
													const isBookedSlotExpired = bookedSlotEndDateTime ? Date.now() > bookedSlotEndDateTime.getTime() : false;

													const hasBookedSlot = Boolean(
														bookedRoundContext?.hasBookedSlot ||
														bookedSlot ||
														activeRoundDetails?.bookedSlot ||
														activeRoundDetails?.candidateSlotBooked ||
														activeRoundDetails?.isBooked ||
														activeRoundDetails?.bookingConfirmed ||
														hasBookedReferenceForCandidate(activeRoundDetails, candidateSlotIdentity, selectedApplication?.bookedSlots) ||
														hasCandidateRef(activeRoundDetails?.scheduleObject) ||
														hasCandidateRef(activeRoundDetails?.schedule) ||
														hasCandidateRef(activeRoundDetails?.formDataObject) ||
														hasCandidateRef(activeRoundDetails?.schedulesArray) ||
														hasCandidateRef(activeRoundDetails?.daySchedulesArray) ||
														hasCandidateRef(activeRoundDetails?.roomsArray)
													);
													const joinUrl =
														hasBookedSlot
															? (relatedStage?.meetingLink ||
																activeRoundDetails?.meetingLink ||
																activeRoundDetails?.joinLink ||
																activeRoundDetails?.meetingUrl ||
																bookSlotUrl)
															: bookSlotUrl;
													const buttonLabel = hasBookedSlot ? 'Join Now' : 'Book Your Slot';
													const buttonIcon = hasBookedSlot ? 'fa-video-camera' : 'fa-calendar';
													let canBookThisRound = true;
													let previousAssessmentFailed = false;

													if (roundIndex > 0) {
														canBookThisRound = activationState.canStart;
														previousAssessmentFailed = activationState.previousAssessmentFailed;
													}
													
													if (isCurrentRoundCompleted) {
														return null;
													}

													if (previousAssessmentFailed) {
														return (
															<div style={{marginTop: '12px', display: 'flex', justifyContent: 'center'}}>
																<span
																	className="badge"
																	style={{
																		fontSize: '13px',
																		padding: '8px 12px',
																		backgroundColor: '#fdeaea',
																		color: '#c82333',
																		border: '1px solid #c82333'
																	}}
																>
																	<i className="fa fa-ban me-2"></i>
																	Not eligible for this round.
																</span>
															</div>
														);
													}

													const isShortlistedForNextRound =
														['shortlisted for next round', 'shortlisted_for_next_round'].includes(
															(roundStatus?.text || '').toLowerCase().replace(/\s+/g, ' ')
														);
													const shouldShowPendingBadge =
														!isShortlistedForNextRound &&
														((!hasBookedSlot && roundWindowInfo.isAfterEnd) ||
														(Boolean(bookedSlot) && isBookedSlotExpired));

													if (shouldShowPendingBadge) {
														return (
															<div style={{marginTop: '12px', display: 'flex', justifyContent: 'center'}}>
																<span
																	className="badge"
																	style={{
																		fontSize: '13px',
																		padding: '8px 12px',
																		backgroundColor: '#f1f3f5',
																		color: '#495057',
																		border: '1px solid #adb5bd'
																	}}
																>
																	<i className="fa fa-clock-o me-2"></i>
																	Pending
																</span>
															</div>
														);
													}

													if (bookedSlot) {
														return (
															<div style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center'}}>
																<div className="p-2" style={{background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', width: '100%'}}>
																	<div className="mb-1"><strong>Interview Details</strong></div>
																	<div>Date: {formatDate(bookedSlotDate)}</div>
																	<div>Time: {formatTimeToAMPM(bookedSlotStart)} - {formatTimeToAMPM(bookedSlotEnd)}</div>
																	{bookedSlotInterviewer && <div>Interviewer: {bookedSlotInterviewer}</div>}
																</div>
																<a 
																	href={joinUrl}
																	onClick={() => {
																	}}
																	className="btn btn-primary"
																	style={{
																		fontSize: '14px',
																		padding: '8px 16px',
																		borderRadius: '6px',
																		whiteSpace: 'nowrap'
																	}}
																>
																	<i className={`fa ${buttonIcon} me-2`} style={{fontSize: '14px'}}></i>
																	{buttonLabel}
																</a>
															</div>
														);
													}

													return (
														<div style={{marginTop: '12px', display: 'flex', justifyContent: 'center'}}>
															{canBookThisRound ? (
																<a 
																	href={joinUrl}
																	onClick={() => {
																	}}
																	className="btn btn-primary"
																	style={{
																		fontSize: '14px',
																		padding: '8px 16px',
																		borderRadius: '6px',
																		whiteSpace: 'nowrap'
																	}}
																>
																	<i className={`fa ${buttonIcon} me-2`} style={{fontSize: '14px'}}></i>
																	{buttonLabel}
																</a>
															) : (
																<button
																	type="button"
																	className="btn btn-secondary"
																	disabled
																	title="Complete the previous interview round first"
																	style={{
																		fontSize: '14px',
																		padding: '8px 16px',
																		borderRadius: '6px',
																		whiteSpace: 'nowrap',
																		cursor: 'not-allowed'
																	}}
																>
																	<i className="fa fa-lock me-2" style={{fontSize: '14px'}}></i>
																	{buttonLabel}
																</button>
															)}
														</div>
													);
												})()}
											</div>
										);
									});
									})()}
								</div>
								
							</div>
						</div>
					</div>
			)}
		</>
	);
}

export default CanStatusPage;
