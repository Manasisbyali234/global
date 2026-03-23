import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../utils/popupNotification';
import { formatDate } from '../../../../utils/dateFormatter';
import { formatInterviewTime } from '../../../../utils/timeUtils';
import { formatTimeToAMPM } from '../../../../utils/dateFormatter';
// Route: /candidate/status

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { pubRoute, publicUser, canRoute, candidate } from "../../../../globals/route-names";
import CanPostedJobs from "./can-posted-jobs";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import TermsModal from "../../../../components/TermsModal";
import "./status-styles.css";
import "../../../../table-overflow-fix.css";

function CanStatusPage() {
	const navigate = useNavigate();
	const { applicationId } = useParams();
	const isInterviewDetailsPage = !!applicationId;
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
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

	const getEmployerDisplayCompanyName = (application) =>
		application?.employerId?.companyName ||
		application?.employerId?.brandName ||
		'Company Name Not Available';

	const getAssessmentWindowInfo = (job) => {
		const now = new Date();
		const startRaw = job?.assessmentStartDate ? new Date(job.assessmentStartDate) : null;
		const endRaw = job?.assessmentEndDate ? new Date(job.assessmentEndDate) : null;
		const isValid = (date) => date instanceof Date && !isNaN(date.getTime());
		let startDate = isValid(startRaw) ? startRaw : null;
		let endDate = isValid(endRaw) ? endRaw : null;
		
		// Apply time if available
		if (startDate && job?.assessmentStartTime) {
			const [hours, minutes] = job.assessmentStartTime.split(':').map(Number);
			if (!isNaN(hours) && !isNaN(minutes)) {
				startDate = new Date(startDate);
				startDate.setHours(hours, minutes, 0, 0);
			}
		}
		if (endDate && job?.assessmentEndTime) {
			const [hours, minutes] = job.assessmentEndTime.split(':').map(Number);
			if (!isNaN(hours) && !isNaN(minutes)) {
				endDate = new Date(endDate);
				// Set to end of the minute (59 seconds, 999 milliseconds)
				endDate.setHours(hours, minutes, 59, 999);
			} else {
				// If no valid time, set to end of day
				endDate = new Date(endDate);
				endDate.setHours(23, 59, 59, 999);
			}
		} else if (endDate) {
			// If no end time specified, set to end of day
			endDate = new Date(endDate);
			endDate.setHours(23, 59, 59, 999);
		}
		
		const isBeforeStart = startDate ? now < startDate : false;
		const isAfterEnd = endDate ? now > endDate : false;
		return {
			isBeforeStart,
			isAfterEnd,
			isWithinWindow: startDate && endDate ? (now >= startDate && now <= endDate) : !isBeforeStart && !isAfterEnd,
			startDate,
			endDate
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
			const withTime = new Date(dateObj);
			if (!timeValue || typeof timeValue !== 'string') {
				withTime.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
				return withTime;
			}

			const matches = timeValue.match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
			if (!matches) {
				withTime.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
				return withTime;
			}

			let hours = Number(matches[1]);
			const minutes = Number(matches[2]);
			const meridian = matches[3]?.toUpperCase();
			if (meridian === 'PM' && hours < 12) hours += 12;
			if (meridian === 'AM' && hours === 12) hours = 0;

			if (isNaN(hours) || isNaN(minutes)) {
				withTime.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
				return withTime;
			}

			withTime.setHours(hours, minutes, isEnd ? 59 : 0, isEnd ? 999 : 0);
			return withTime;
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

		const scheduleObject = roundDetails.scheduleObject || roundDetails.schedule || roundDetails.Schedule || {};
		const nestedSchedule = scheduleObject.schedule || scheduleObject.Schedule || {};
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
			nestedSchedule,
			nestedSchedule.Schedule,
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

			if (hasBookedMarker && candidateMatched) {
				return true;
			}

			const nestedKeys = [
				'bookedSlot', 'bookedSlots', 'slots', 'schedules', 'schedulesArray',
				'daySchedules', 'daySchedulesArray', 'rooms', 'roomsArray', 'schedule', 'Schedule'
			];

			return nestedKeys.some((key) => value[key] && scanValue(value[key]));
		};

		const scheduleObject = roundDetails.scheduleObject || roundDetails.schedule || roundDetails.Schedule || {};
		const nestedSchedule = scheduleObject.schedule || scheduleObject.Schedule || {};
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
			nestedSchedule,
			nestedSchedule.Schedule,
			bookedSlots
		];

		return sources.some((source) => scanValue(source));
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
			`Are you sure you want to ${action.toLowerCase()} this job offer?`,
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
				technical: 'Technical',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group',
				situational: 'Situational / Behavioral',
				others: 'Others – Specify.',
				assessment: 'Assessment'
			};
			
			// Extract type from keys like "assessment_1770487959181"
			const extractedType = key.includes('_') ? key.split('_')[0] : key;
			return roundNames[extractedType] || roundNames[key] || 'Interview Round';
		};
		
		// Helper function to get round name from stage type or stage name
		const getProperRoundName = (stageType, stageName) => {
			const roundNames = {
				technical: 'Technical',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group',
				situational: 'Situational / Behavioral',
				others: 'Others – Specify.',
				assessment: 'Assessment',
				nonTechnical: 'Non-Technical',
				managerial: 'Managerial',
				final: 'Final',
				hr: 'HR',
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
		
		// PRIORITY 1: Check if application has interviewProcess.stages from InterviewProcessManager
		if (application?.interviewProcess?.stages && application.interviewProcess.stages.length > 0) {
			console.log('Using interviewProcess.stages:', application.interviewProcess.stages);
			return application.interviewProcess.stages.map(stage => ({
				name: getProperRoundName(stage.stageType, stage.stageName),
				uniqueKey: stage._id || stage.stageType,
				roundType: stage.stageType
			}));
		}
		
		// PRIORITY 2: Check if application has interviewProcesses from employer review (legacy)
		if (application?.interviewProcesses && application.interviewProcesses.length > 0) {
			console.log('Using interviewProcesses from application:', application.interviewProcesses);
			return application.interviewProcesses.map(process => {
				let name = process.name || getRoundNameFromKey(process.type);
				
				// Sanitize name: if it looks like a unique key, extract the actual type
				if (name && (name.includes('_') || /^\d+$/.test(name))) {
					const stageNames = {
						assessment: 'Assessment',
						technical: 'Technical',
						oneOnOne: 'One-to-One',
						panel: 'Panel',
						group: 'Group',
						situational: 'Situational / Behavioral',
						others: 'Others – Specify.',
						nonTechnical: 'Non-Technical',
						managerial: 'Managerial',
						final: 'Final',
						hr: 'HR'
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
					uniqueKey: process.id || process.type,
					roundType: process.type
				};
			});
		}
		
		// PRIORITY 2: Check if job has interviewRoundOrder (new format)
		if (job?.interviewRoundOrder && job.interviewRoundOrder.length > 0) {
			const rounds = [];
			const stageNames = {
				technical: 'Technical',
				oneOnOne: 'One-to-One',
				oneonone: 'One-to-One',
				"one-on-one": 'One-to-One',
				one_on_one: 'One-to-One',
				oneOnOnePanel: 'One-on-One / Panel',
				oneononepanel: 'One-on-One / Panel',
				"one-on-one-panel": 'One-on-One / Panel',
				one_on_one_panel: 'One-on-One / Panel',
				panel: 'Panel',
				group: 'Group',
				situational: 'Situational / Behavioral',
				others: 'Others – Specify.',
				assessment: 'Assessment',
				nonTechnical: 'Non-Technical',
				managerial: 'Managerial',
				final: 'Final',
				hr: 'HR',
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
					name = stageNames[roundType] || getRoundNameFromKey(roundType);
					finalRoundType = roundType;
				} else if (roundType) {
					// roundType looks like a unique key, extract it
					const extractedType = roundType.includes('_') ? roundType.split('_')[0] : roundType;
					name = stageNames[extractedType] || getRoundNameFromKey(extractedType);
					finalRoundType = extractedType;
				} else {
					// No roundType, use extracted baseType
					name = stageNames[baseType] || getRoundNameFromKey(baseType);
					finalRoundType = baseType;
				}
				
				// CRITICAL: Ensure we NEVER display a unique key directly
				if (!name || name === uniqueKey || name.includes('_') || /^\d+$/.test(name)) {
					name = stageNames[baseType] || stageNames[finalRoundType] || 'Interview Round';
				}
				
				rounds.push({
					name: normalizeRoundDisplayName(name),
					uniqueKey: uniqueKey,
					roundType: finalRoundType
				});
			});
			
			if (rounds.length > 0) return rounds;
		}
		
		// PRIORITY 4: Fallback to old format
		if (job?.interviewRoundTypes) {
			const rounds = [];
			const roundTypes = job.interviewRoundTypes;

			if (job.assessmentId) rounds.push({ name: 'Assessment', uniqueKey: 'assessment', roundType: 'assessment' });
			if (roundTypes.oneOnOne) rounds.push({ name: 'One-to-One', uniqueKey: 'oneOnOne', roundType: 'oneOnOne' });
			if (roundTypes.panel) rounds.push({ name: 'Panel', uniqueKey: 'panel', roundType: 'panel' });
			if (roundTypes.group) rounds.push({ name: 'Group', uniqueKey: 'group', roundType: 'group' });
			if (roundTypes.technical) rounds.push({ name: 'Technical', uniqueKey: 'technical', roundType: 'technical' });
			if (roundTypes.situational) rounds.push({ name: 'Situational / Behavioral', uniqueKey: 'situational', roundType: 'situational' });
			if (roundTypes.others) rounds.push({ name: 'Others – Specify.', uniqueKey: 'others', roundType: 'others' });

			if (rounds.length > 0) return rounds;
		}

		// PRIORITY 5: Check if job has assessment before falling back to defaults
		if (job?.assessmentId) {
			return [{ name: 'Assessment', uniqueKey: 'assessment', roundType: 'assessment' }];
		}

		// Default rounds for testing
		return [{ name: 'Technical', uniqueKey: 'technical', roundType: 'technical' }, { name: 'HR', uniqueKey: 'hr', roundType: 'hr' }, { name: 'Final', uniqueKey: 'final', roundType: 'final' }];
	};

	const getRoundStatus = (application, roundIndex, roundName, isPopup = false) => {
		const formatProcessStatusLabel = (rawStatus) => {
			const status = String(rawStatus || '').toLowerCase();
			const labels = {
				shortlisted_for_next_round: 'Shortlisted for next Round',
				under_review: 'Under Review',
				on_hold: 'On Hold',
				selected: 'Selected',
				pending_decision: 'Pending Decision',
				no_show: 'No Show',
				rejected: 'Not Advanced to Next Stage'
			};
			if (labels[status]) return labels[status];
			return String(rawStatus || '').replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
		};

		const mapProcessStatusToBadge = (rawStatus) => {
			const status = String(rawStatus || '').toLowerCase();
			const mappings = {
				shortlisted: { text: 'Shortlisted', class: 'bg-info bg-opacity-10 text-info border border-info' },
				shortlisted_for_next_round: { text: 'Shortlisted for next Round', class: 'bg-info bg-opacity-10 text-info border border-info' },
				under_review: { text: 'Under Review', class: 'bg-warning bg-opacity-10 text-warning border border-warning' },
				pending_decision: { text: 'Pending Decision', class: 'bg-warning bg-opacity-10 text-warning border border-warning' },
				interview_scheduled: { text: 'Interview Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info' },
				interview_completed: { text: 'Interview Completed', class: 'bg-success bg-opacity-10 text-success border border-success' },
				selected: { text: 'Selected', class: 'bg-success bg-opacity-10 text-success border border-success' },
				no_show: { text: 'No Show', class: 'bg-danger bg-opacity-10 text-danger border border-danger' },
				rejected: { text: 'Not Advanced to Next Stage', class: 'bg-danger bg-opacity-10 text-danger border border-danger' },
				on_hold: { text: 'On Hold', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' },
				scheduled: { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info' },
				in_progress: { text: 'In Progress', class: 'bg-warning bg-opacity-10 text-warning border border-warning' },
				completed: { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success' },
				pending: { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' }
			};
			return mappings[status] || { text: formatProcessStatusLabel(rawStatus), class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' };
		};

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

		// Check assessment status for Assessment rounds
		if (roundName === 'Assessment' && application.assessmentStatus) {
			const status = application.assessmentStatus?.toLowerCase?.() || application.assessmentStatus;
			
			// Check if assessment window has expired
			const windowInfo = getAssessmentWindowInfo(application.jobId);
			if (windowInfo.isAfterEnd && status !== 'completed' && status !== 'in_progress') {
				return { text: 'Expired', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
			}
			
			// Check if assessment window hasn't started yet (only in popup)
			if (isPopup && windowInfo.isBeforeStart && (status === 'available' || status === 'not_required' || status === 'pending')) {
				return { text: 'Assessment scheduled. Test will open on the scheduled date and time.', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
			
			// Map all possible assessment status values
			const statusMappings = {
				'completed': { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' },
				'in_progress': { text: 'In Progress', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' },
				'available': { text: 'Started', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' },
				'expired': { text: 'Expired', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' },
				'pending': { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' },
				'not_required': { text: 'Started', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' },
				'not_started': { text: 'Assessment scheduled. Test will open on the scheduled date and time.', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' }
			};
			
			const result = statusMappings[status];
			if (!result) {
				console.warn(`Unknown assessment status: "${application.assessmentStatus}", defaulting to Pending`);
				return { text: 'Pending', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
			}
			return result;
		}

		// Check if there are actual interview rounds data from employer review
		if (application.interviewRounds && application.interviewRounds.length > 0) {
			const round = application.interviewRounds.find(r => r.round === roundIndex + 1);
			if (round) {
				switch (round.status) {
					case 'passed':
						return { 
							text: 'Pass', 
							class: 'bg-success bg-opacity-10 text-success border border-success',
							feedback: round.feedback || ''
						};
					case 'failed':
						return { 
							text: 'Fail', 
							class: 'bg-danger bg-opacity-10 text-danger border border-danger',
							feedback: round.feedback || ''
						};
					case 'pending':
					default:
						return { 
							text: 'Scheduled', 
							class: 'bg-info bg-opacity-10 text-info border border-info',
							feedback: round.feedback || ''
						};
				}
			}
		}

		// Use current interview process status when available
		if (Array.isArray(application.interviewProcesses) && application.interviewProcesses.length > 0) {
			const roundType = getRoundTypeFromName(roundName);
			const relatedProcess =
				application.interviewProcesses.find((p) => p?.type === roundType) ||
				application.interviewProcesses.find((p) => String(p?.name || '').toLowerCase().includes(String(roundName || '').toLowerCase())) ||
				application.interviewProcesses[roundIndex];

			const mapped = mapProcessStatusToBadge(relatedProcess?.status);
			if (mapped) {
				return { ...mapped, feedback: '' };
			}
		}
		
		// Enhanced status logic based on application status
		const status = application.status;
		
		// For pending status, check if candidate is selected for process
		if (status === 'pending' && application.isSelectedForProcess) {
			return { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
		}
		
		if (status === 'shortlisted') {
			return { text: 'Scheduled', class: 'bg-info bg-opacity-10 text-info border border-info', feedback: '' };
		} else if (status === 'interviewed') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'hired') {
			return { text: 'Completed', class: 'bg-success bg-opacity-10 text-success border border-success', feedback: '' };
		} else if (status === 'rejected') {
			return { text: 'Rejected', class: 'bg-danger bg-opacity-10 text-danger border border-danger', feedback: '' };
		} else if (status === 'pending') {
			return { text: 'Under Review', class: 'bg-warning bg-opacity-10 text-warning border border-warning', feedback: '' };
		}
		
		return { text: 'Submitted', class: 'bg-secondary bg-opacity-10 text-secondary border border-secondary', feedback: '' };
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

	const handleStartAssessment = (application) => {
		showInfo('🚀 ALL THE BEST  Not starting assessment...', 3000);
		console.log('=== HANDLE START ASSESSMENT CALLED ===');
		const job = application.jobId;
		const windowInfo = getAssessmentWindowInfo(job);
		if (!windowInfo.isWithinWindow) {
			if (windowInfo.isBeforeStart) {
				const startLabel = windowInfo.startDate ? windowInfo.startDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;
				showWarning(startLabel ? `⏰ Assessment Not Yet Available\n\nThe assessment will open on ${startLabel}. Please log in 5 minutes before the scheduled time.` : '⏰ Assessment is not yet available. Please wait for the scheduled time.');
				return;
			}
			const endLabel = windowInfo.endDate ? windowInfo.endDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null;
			showError(endLabel ? `⛔ Assessment Window Closed\n\nThe assessment window ended on ${endLabel}. You can no longer take this assessment.` : '⛔ Assessment window has ended. You can no longer access this assessment.');
			return;
		}
		const assessmentId = job?.assessmentId;
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
			navigate(`/candidate/start-tech-assessment?${params.toString()}`, {
				state: sessionPayload
			});
		}
	};

	const getRoundStatusPillStyle = (statusText = '') => {
		const status = String(statusText).toLowerCase();
		if (['selected', 'completed', 'passed'].includes(status)) {
			return { backgroundColor: '#e6f4ea', color: '#1e7e34', border: '1px solid #1e7e34' };
		}
		if (['rejected', 'failed', 'expired', 'no show', 'not advanced to next stage'].includes(status)) {
			return { backgroundColor: '#fdeaea', color: '#c82333', border: '1px solid #c82333' };
		}
		if (['scheduled', 'started', 'interview scheduled'].includes(status)) {
			return { backgroundColor: '#e7f1ff', color: '#0d6efd', border: '1px solid #0d6efd' };
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

	return (
		<>
			{!isInterviewDetailsPage && (
			<div className="twm-right-section-panel site-bg-gray">
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
					<div className="d-flex justify-content-end align-items-center mb-3">
						<button 
							className="btn btn-sm btn-outline-primary refresh-btn"
							onClick={fetchApplications}
							disabled={loading}
							style={{backgroundColor: 'transparent'}}
						>
							<i className="fa fa-refresh me-1" />
							{loading ? 'Refreshing...' : 'Refresh Now'}
						</button>
					</div>
			
					<div className="twm-pro-view-chart-wrap">
						<div className="col-lg-12 col-md-12 mb-4">
							<div className="card card-shadow border-0">
								<div className="card-body p-0">
									<div className="table-responsive">
									<table className="table table-hover mb-0">
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
													Offer Action
												</th>
											</tr>
										</thead>

										<tbody>
											{loading ? (
												<tr>
													<td colSpan="7" className="text-center py-5">
														<div className="d-flex flex-column align-items-center">
															<i className="fa fa-spinner fa-spin fa-3x mb-3" style={{color: '#ff6b35'}}></i>
															<p className="text-muted mb-0">Loading your applications...</p>
														</div>
													</td>
												</tr>
											) : applications.length === 0 ? (
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
											) : (
												applications.map((app, index) => {
													const interviewRounds = getInterviewRounds(app.jobId, app);
													const isShortlisted = app.status === 'shortlisted';
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
																<div className="d-flex align-items-center">
																	<div className="me-3">
																		<div className="rounded-circle" style={{width: '45px', height: '45px', minWidth: '45px', minHeight: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
																			{app.jobId?.companyLogo ? (
																				<img src={app.jobId.companyLogo} alt="Company Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
																			) : (
																				<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0', padding: '0', lineHeight: '1'}}></i>
																			)}
																		</div>
																	</div>
																	<div>
																		<a href={`/emp-detail/${app.employerId?._id}`} className="text-decoration-none">
																			<h6 className="mb-1 fw-semibold text-dark hover-primary" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
																				{getEmployerDisplayCompanyName(app)}
																				{app.jobId?.companyName && app.jobId.companyName !== app.employerId?.companyName && (
																					<span className="badge bg-info bg-opacity-10 text-info border border-info ms-1" style={{ fontSize: '10px', padding: '2px 6px', fontWeight: '500', textTransform: 'none' }}>
																						Hiring for: {app.jobId.companyName}
																					</span>
																				)}
																			</h6>
																		</a>
																		<small className="text-muted d-block mt-1">
																			<i className="fas fa-map-marker-alt me-1"></i>
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
																	{app.jobId?.title || 'Position Not Available'}
																</span>
															</td>
															<td className="px-4 py-3">
																<div className="interview-progress-wrapper" style={{display: 'flex', flexDirection: 'row', gap: '8px', overflowX: 'auto', alignItems: 'flex-start'}}>
																	{interviewRounds.length > 0 ? (
																		interviewRounds.map((round, roundIndex) => {
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
																						technical: 'Technical',
																						oneOnOne: 'One-to-One',
																						panel: 'Panel',
																						group: 'Group',
																						situational: 'Situational / Behavioral',
																						others: 'Others – Specify.',
																						assessment: 'Assessment',
																						nonTechnical: 'Non-Technical',
																						managerial: 'Managerial',
																						final: 'Final',
																						hr: 'HR',
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
																			
																			const roundStatus = getRoundStatus(app, roundIndex, roundName);
																			
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
																				
																				// For Assessment rounds, also check if there are assessment-specific details
																				if (roundName === 'Assessment' && !roundDetails) {
																					// Check for assessment details in various possible keys
																					const assessmentKeys = ['assessment', 'Assessment', 'technical_assessment', 'online_assessment'];
																					for (const key of assessmentKeys) {
																						if (app.jobId.interviewRoundDetails[key]) {
																							roundDetails = app.jobId.interviewRoundDetails[key];
																							break;
																						}
																					}
																					
																					// If still no details, create a basic one from job assessment info
																					if (!roundDetails && app.jobId?.assessmentId) {
																						roundDetails = {
																							description: app.jobId.assessmentInstructions || 'Complete the technical assessment within the given timeframe',
																							fromDate: app.jobId.assessmentStartDate,
																							toDate: app.jobId.assessmentEndDate
																						};
																					}
																				}
																			}
																			const formatDate = (dateStr) => {
																				if (!dateStr) return null;
																				try {
																					return formatDate(dateStr);
																				} catch (error) {
																					return null;
																				}
																			};
																			// For Assessment, use job-level dates
																			let startDate, endDate, dateDisplay;
																			
																			if (roundName === 'Assessment') {
																				// Try multiple possible field names for assessment dates
																				startDate = formatDate(app.jobId?.assessmentStartDate || roundDetails?.fromDate);
																				endDate = formatDate(app.jobId?.assessmentEndDate || roundDetails?.toDate);
																			} else {
																				startDate = formatDate(roundDetails?.fromDate || roundDetails?.date);
																				endDate = formatDate(roundDetails?.toDate);
																			}
																			
																			dateDisplay = startDate && endDate ? `${startDate} - ${endDate}` : 
																						  startDate ? `From: ${startDate}` : 
																						  endDate ? `Until: ${endDate}` : null;
																			
																			return (
																				<div key={roundIndex} className="interview-round-item" style={{minWidth: '120px', padding: '4px', flexShrink: 0}}>
																					<div className="round-name" style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#232323'}}>{roundName}</div>
																					<div style={{display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center'}}>
																						{/* Show countdown timer if assessment hasn't started yet */}
																						{roundName === 'Assessment' && roundStatus.text === 'Started' && (() => {
																							const windowInfo = getAssessmentWindowInfo(app.jobId);
																							if (windowInfo.isBeforeStart && windowInfo.startDate) {
																								const now = new Date().getTime();
																								const timeUntilStart = windowInfo.startDate.getTime() - now;
																								return (
																									<AssessmentTimer 
																										timerInfo={{
																											isBeforeStart: true,
																											timeUntilStart: timeUntilStart,
																											startDate: windowInfo.startDate
																										}}
																										onTimerEnd={() => fetchApplications()}
																									/>
																								);
																							}
																							return null;
																						})()}
																						{/* Show status badge only if not showing countdown */}
																						{!(roundName === 'Assessment' && roundStatus.text === 'Started' && getAssessmentWindowInfo(app.jobId).isBeforeStart) && (
																							<span className={`badge ${roundStatus.class}`} style={{fontSize: '12px', padding: '4px 8px', minWidth: 'fit-content', textAlign: 'center'}}>
																								{roundStatus?.text || 'Pending'}
																							</span>
																						)}
																						{/* Show pass/fail result for completed assessments */}
																						{roundName === 'Assessment' && (app.assessmentResult === 'pass' || app.assessmentResult === 'fail') && (
																							<span className={`badge ${app.assessmentResult === 'pass' ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '9px', padding: '2px 6px', marginTop: '2px'}}>
																								{app.assessmentResult === 'pass' ? 'Pass' : 'Fail'}
																							</span>
																						)}

																						{/* Show assessment remarks if available - removed from table, only in modal */}
																					</div>
																				</div>
																			);
																		})
																	) : (
																		<span className="text-muted fst-italic">No rounds specified</span>
																	)}
																</div>
															</td>
															<td className="px-4 py-3">
																<span className={
																	(app.status === 'pending' && app.isSelectedForProcess) ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'pending' ? 'badge bg-warning bg-opacity-10 text-warning border border-warning' :
																	app.status === 'shortlisted' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'interviewed' ? 'badge bg-primary bg-opacity-10 text-primary border border-primary' :
																	app.status === 'hired' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	app.status === 'offer_sent' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																	app.status === 'accepted' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																	app.status === 'rejected' ? 'badge bg-danger bg-opacity-10 text-danger border border-danger' : 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary'
																} style={{fontSize: '12px', padding: '6px 12px'}}>
																	{(app.status === 'pending' && app.isSelectedForProcess) ? 'Shortlisted' : 
																	 app.status === 'hired' ? 'Hired' :
																	 app.status === 'offer_sent' ? 'Offer Letter Sent' :
																	 app.status === 'accepted' ? 'Accepted' :
																	 app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
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
																{app.status === 'offer_sent' ? (
																	<div className="d-flex gap-2 justify-content-center">
																		<button 
																			className="btn btn-sm btn-success" 
																			onClick={() => handleOfferResponse(app._id, 'accepted')}
																			title="Accept Offer"
																		>
																			<i className="fa fa-check"></i>
																		</button>
																		<button 
																			className="btn btn-sm btn-danger" 
																			onClick={() => handleOfferResponse(app._id, 'rejected')}
																			title="Reject Offer"
																		>
																			<i className="fa fa-times"></i>
																		</button>
																	</div>
																) : app.status === 'accepted' ? (
																	<span className="text-success fw-bold" title="Accepted">
																		<i className="fa fa-check-circle"></i>
																	</span>
																) : app.status === 'rejected' && app.statusHistory?.some(h => h.status === 'offer_sent') ? (
																	<span className="text-danger fw-bold" title="Offer Rejected">
																		<i className="fa fa-times-circle"></i>
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
					</div>
				</div>
			</div>
			)}

			{isInterviewDetailsPage && !selectedApplication && (
				<div className="twm-right-section-panel site-bg-gray">
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
							<div className="text-center py-4">
								<i className="fa fa-spinner fa-spin fa-2x mb-3" style={{color: '#ff6b35'}}></i>
								<p className="mb-0 text-muted">Loading interview process details...</p>
							</div>
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
					className="twm-right-section-panel site-bg-gray"
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
											<strong>Position:</strong> {selectedApplication.jobId?.title || 'N/A'}
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
											<strong>Status:</strong> 
											<span className={
												selectedApplication.status === 'pending' ? 'badge bg-warning ms-2' :
												selectedApplication.status === 'shortlisted' ? 'badge bg-info ms-2' :
												selectedApplication.status === 'interviewed' ? 'badge bg-primary ms-2' :
												selectedApplication.status === 'hired' ? 'badge bg-success ms-2' :
												selectedApplication.status === 'rejected' ? 'badge bg-danger ms-2' : 'badge bg-secondary ms-2'
											}>
												{selectedApplication.status?.charAt(0).toUpperCase() + selectedApplication.status?.slice(1) || 'Pending'}
											</span>
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
										return roundsList.map((round, roundIndex) => {
										let roundName = typeof round === 'string' ? round : round.name;
										const uniqueKey = typeof round === 'string' ? round.toLowerCase() : round.uniqueKey;
										
										// Safety check: ensure roundName is not a unique key
										if (roundName && (roundName.includes('_') || roundName.match(/^[0-9a-f]{24}$/i) || /^\d+$/.test(roundName))) {
											const stageNameMap = {
												technical: 'Technical',
												oneOnOne: 'One-to-One',
												panel: 'Panel',
												group: 'Group',
												situational: 'Situational / Behavioral',
												others: 'Others – Specify.',
												assessment: 'Assessment',
												nonTechnical: 'Non-Technical',
												managerial: 'Managerial',
												final: 'Final',
												hr: 'HR',
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
											
											roundName = extractedType && stageNameMap[extractedType] ? stageNameMap[extractedType] : 'Interview Round';
										}
										
										const roundStatus = getRoundStatus(selectedApplication, roundIndex, roundName, true);
										const roundType = (typeof round === 'object' ? round.roundType : round.toLowerCase()).replace(/[^a-z]/gi, '');
										
										// Find round details from job interviewRoundDetails
										let roundDetails = null;
										if (selectedApplication.jobId?.interviewRoundDetails) {
											const allDetails = selectedApplication.jobId.interviewRoundDetails;
											const normalized = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
											const roundTypeRaw = typeof round === 'object' ? round.roundType : round.toLowerCase();
											const baseRoundType = String(roundTypeRaw || '').split('_')[0];
											const mappedRoundId =
												selectedApplication.interviewRoundIds?.[roundTypeRaw] ||
												selectedApplication.interviewRoundIds?.[baseRoundType] ||
												null;
											// Try direct key/id matches first
											roundDetails =
												allDetails[uniqueKey] ||
												allDetails[roundTypeRaw] ||
												allDetails[baseRoundType] ||
												(mappedRoundId ? allDetails[String(mappedRoundId)] : null);
											// Search all keys/details for normalized and id-based match
											if (!roundDetails) {
												for (const [key, details] of Object.entries(allDetails)) {
													const keyNorm = normalized(key);
													const typeNorm = normalized(roundTypeRaw);
													const baseTypeNorm = normalized(baseRoundType);
													const detailTypeNorm = normalized(details?.roundType || details?.key || details?.name || '');
													const detailRoundId = details?.interviewRoundId ? String(details.interviewRoundId) : '';
													const mappedId = mappedRoundId ? String(mappedRoundId) : '';
													const matches =
														(keyNorm && (keyNorm.includes(typeNorm) || keyNorm.includes(baseTypeNorm))) ||
														(detailTypeNorm && (detailTypeNorm === typeNorm || detailTypeNorm === baseTypeNorm)) ||
														(mappedId && detailRoundId && mappedId === detailRoundId) ||
														(mappedId && key === mappedId);
													if (matches && details) {
														roundDetails = details;
														break;
													}
												}
											}
										}
										// Merge with processRemarks if available
										if (selectedApplication.interviewProcesses?.[roundIndex]) {
											const roundTypeRaw = typeof round === 'object' ? round.roundType : round.toLowerCase();
											const remarks = resolveProcessRemarks(
												selectedApplication.interviewProcesses[roundIndex],
												roundName,
												roundTypeRaw,
												selectedApplication.processRemarks
											);
											if (remarks) {
												roundDetails = { ...roundDetails, employerRemarks: remarks };
											}
										}
										
										const assessmentId = selectedApplication.jobId?.assessmentId;

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
														{(selectedApplication.jobId?.assessmentStartDate || selectedApplication.jobId?.assessmentEndDate) && (
															<div className="mb-2">
																{(() => {
																	const interviewStartDate = selectedApplication.jobId?.assessmentStartDate || selectedApplication.jobId?.assessmentEndDate;
																	const startTime = selectedApplication.jobId?.assessmentStartTime;
																	const endTime = selectedApplication.jobId?.assessmentEndTime;
																	if (!interviewStartDate || !startTime || !endTime) {
																		return (
																			<div>
																				{selectedApplication.jobId?.assessmentStartDate && (
																					<span><strong>Date:</strong> {formatDate(selectedApplication.jobId.assessmentStartDate)} {selectedApplication.jobId?.assessmentStartTime && `at ${formatTimeToAMPM(selectedApplication.jobId.assessmentStartTime)}`}</span>
																				)}
																			</div>
																		);
																	}
																	const startDateLabel = formatDate(interviewStartDate);
																	const dateLabel = startDateLabel;
																	const timingLabel = `${formatTimeToAMPM(startTime)} - ${formatTimeToAMPM(endTime)}`;
																	const [startHours, startMinutes] = startTime.split(':').map(Number);
																	const [endHours, endMinutes] = endTime.split(':').map(Number);
																	const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
																	const durationLabel = `${Math.max(0, totalMinutes)}mins`;
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

														{/* Assessment Process Description */}
														{roundDetails && roundDetails.description && (
															<div className="mb-3 p-2" style={{backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef'}}>
																<small className="text-muted d-block mb-1"><i className="fa fa-clipboard-check me-1" style={{color: '#ff6b35'}}></i><strong>Assessment Process Description:</strong></small>
																<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{roundDetails.description}</div>
															</div>
														)}

														{/* Assessment Employer Remarks */}
														{(() => {
															const assessmentProcess = selectedApplication.interviewProcesses?.find(p => p.type === 'assessment' || p.name?.toLowerCase().includes('assessment'));
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
															{(selectedApplication.assessmentStatus === 'completed' || selectedApplication.assessmentResult === 'pass' || selectedApplication.assessmentResult === 'fail') ? (
																<button 
																	className="btn btn-sm btn-success"
																	onClick={() => {
																		navigate(canRoute(candidate.RESULT.replace(':applicationId', selectedApplication._id)));
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-bar-chart me-1"></i>
																	View Result
																</button>
															) : (selectedApplication.assessmentStatus === 'expired' || getAssessmentWindowInfo(selectedApplication.jobId).isAfterEnd) ? (
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
																		The assessment window has ended. You can no longer take this assessment.
																	</div>
																</div>
															) : selectedApplication.assessmentStatus === 'in_progress' ? (
																<button 
																	className="btn btn-sm btn-warning"
																	onClick={() => {
																		handleStartAssessment(selectedApplication);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Continue Assessment
																</button>
															) : (
																<button 
																	className="btn btn-sm btn-primary"
																	onClick={() => {
																		handleStartAssessment(selectedApplication);
																	}}
																	style={{borderRadius: '6px'}}
																>
																	<i className="fa fa-play me-1"></i>
																	Start Assessment
																</button>
															)}
														</div>
													</div>
												)}

												{/* Round Details - Always show if we have any details */}
												{roundName !== 'Assessment' && (
													<div className="mt-2">
														{roundDetails && (
															<>
																{(roundDetails.fromDate || roundDetails.toDate) && (
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
																		<div style={{fontSize: '14px', lineHeight: '1.5', color: '#495057'}}>{roundDetails.description}</div>
																	</div>
																)}
																{(() => {
																	const roundTypeRaw = typeof round === 'object' ? round.roundType : round.toLowerCase();
																	const process = selectedApplication.interviewProcesses?.find(p => p.type === roundTypeRaw);
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
													const roundType = typeof round === 'object' ? round.roundType : round.toLowerCase();
													const roundId = selectedApplication.interviewRoundIds?.[roundType] || uniqueKey;
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
													const roundWindowInfo = getInterviewRoundWindowInfo(roundDetails);
													const normalizedRoundType = (roundType || '').toString().split('_')[0];
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
													
													const relatedProcess = selectedApplication.interviewProcesses?.find((process) => {
														const processType = (process?.type || '').toString().split('_')[0];
														return processType === normalizedRoundType || String(process?.id) === String(uniqueKey);
													});
													
													const relatedStage = selectedApplication.interviewProcess?.stages?.find((stage) => {
														const stageType = (stage?.stageType || '').toString().split('_')[0];
														return String(stage?._id) === String(uniqueKey) || stageType === normalizedRoundType;
													});
													
													const processStatus = (relatedProcess?.status || '').toLowerCase();
													const stageStatus = (relatedStage?.status || '').toLowerCase();
													const currentRoundStatusText = (roundStatus?.text || '').toLowerCase();
													const currentRoundCompletedStates = [
														'interview_completed', 'completed', 'selected', 'rejected',
														'failed', 'passed', 'expired'
													];
													const isCurrentRoundCompleted =
														currentRoundCompletedStates.includes(processStatus) ||
														currentRoundCompletedStates.includes(stageStatus) ||
														currentRoundCompletedStates.includes(currentRoundStatusText);
													const candidateSlotIdentity = selectedApplication?.candidateId || {
														_id: candidateId,
														candidateEmail: selectedApplication?.candidateEmail || selectedApplication?.applicantEmail,
														candidateName: selectedApplication?.candidateName || selectedApplication?.applicantName
													};
													const extractedBookedSlot = extractBookedSlot(roundDetails, candidateSlotIdentity, selectedApplication?.bookedSlots, roundId);
													const directBookedSlot = normalizeBookedSlotForDisplay(
														roundDetails?.bookedSlot,
														roundDetails?.fromDate || roundDetails?.date
													);
													const bookedSlot = extractedBookedSlot || directBookedSlot;
													const bookedSlotDate = bookedSlot?.date;
													const bookedSlotStart = bookedSlot?.startTime;
													const bookedSlotEnd = bookedSlot?.endTime;
													const bookedSlotInterviewer = bookedSlot?.interviewerName;
													const bookedSlotEndDateTime = (() => {
														if (!bookedSlotDate || !bookedSlotEnd) return null;
														const dateObj = new Date(bookedSlotDate);
														if (isNaN(dateObj.getTime())) return null;
														const matches = String(bookedSlotEnd).match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
														if (!matches) return null;
														let hours = Number(matches[1]);
														const minutes = Number(matches[2]);
														const meridian = matches[3]?.toUpperCase();
														if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
														if (meridian === 'PM' && hours < 12) hours += 12;
														if (meridian === 'AM' && hours === 12) hours = 0;
														dateObj.setHours(hours, minutes, 0, 0);
														return dateObj;
													})();
													const isBookedSlotExpired = bookedSlotEndDateTime ? Date.now() > bookedSlotEndDateTime.getTime() : false;

													const hasBookedSlot = Boolean(
														bookedSlot ||
														roundDetails?.bookedSlot ||
														roundDetails?.candidateSlotBooked ||
														roundDetails?.isBooked ||
														roundDetails?.bookingConfirmed ||
														hasBookedReferenceForCandidate(roundDetails, candidateSlotIdentity, selectedApplication?.bookedSlots) ||
														hasCandidateRef(roundDetails?.scheduleObject) ||
														hasCandidateRef(roundDetails?.formDataObject) ||
														hasCandidateRef(roundDetails?.schedulesArray) ||
														hasCandidateRef(roundDetails?.daySchedulesArray) ||
														hasCandidateRef(roundDetails?.roomsArray)
													);
													const joinUrl =
														hasBookedSlot
															? (relatedStage?.meetingLink ||
																roundDetails?.meetingLink ||
																roundDetails?.joinLink ||
																roundDetails?.meetingUrl ||
																bookSlotUrl)
															: bookSlotUrl;
													const buttonLabel = hasBookedSlot ? 'Join Now' : 'Book Your Slot';
													const buttonIcon = hasBookedSlot ? 'fa-video-camera' : 'fa-calendar';
													let canBookThisRound = true;
													const assessmentResult = String(selectedApplication.assessmentResult || '').toLowerCase();
													const assessmentStatus = String(selectedApplication.assessmentStatus || '').toLowerCase();
													const assessmentFailed = assessmentResult === 'fail' || assessmentResult === 'failed' || assessmentStatus === 'failed';
													const assessmentPassed = assessmentResult === 'pass' || assessmentResult === 'passed' || assessmentStatus === 'completed';

													if (roundIndex > 0) {
														const previousRound = roundsList[roundIndex - 1];
														const previousRoundName = typeof previousRound === 'string' ? previousRound : previousRound.name;
														const normalizeType = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
														const previousRoundTypeRaw = typeof previousRound === 'object' ? previousRound.roundType : previousRoundName.toLowerCase();
														const previousRoundType = normalizeType(previousRoundTypeRaw);
														const previousRoundKey = typeof previousRound === 'object' ? previousRound.uniqueKey : previousRoundType;
														
														const previousRelatedProcess = selectedApplication.interviewProcesses?.find((process) => {
															const processType = normalizeType(process?.type || '');
															const processName = normalizeType(process?.name || '');
															const roundNameNorm = normalizeType(previousRoundName || '');
															return processType === previousRoundType ||
																processName.includes(roundNameNorm) ||
																String(process?.id) === String(previousRoundKey) ||
																String(process?._id) === String(previousRoundKey);
														});
														
														const previousRelatedStage = selectedApplication.interviewProcess?.stages?.find((stage) => {
															const stageType = normalizeType(stage?.stageType || '');
															return String(stage?._id) === String(previousRoundKey) || stageType === previousRoundType;
														});
														
														const previousProcessStatus = (previousRelatedProcess?.status || '').toLowerCase();
														const previousStageStatus = (previousRelatedStage?.status || '').toLowerCase();
														const previousRoundStatus = getRoundStatus(selectedApplication, roundIndex - 1, previousRoundName, true);
														const previousStatusText = (previousRoundStatus?.text || '').toLowerCase();

														const invalidStatusStates = ['', 'pending'];
														const positiveStatusStates = ['shortlisted_for_next_round', 'selected', 'shortlisted'];
														const hasValidProcessStatus =
															Boolean(previousProcessStatus) && !invalidStatusStates.includes(previousProcessStatus);
														const hasValidStageStatus =
															Boolean(previousStageStatus) && !invalidStatusStates.includes(previousStageStatus);
														const previousStatusUpdated = hasValidProcessStatus || hasValidStageStatus;
														const isPreviousShortlisted = positiveStatusStates.includes(previousProcessStatus) || 
															positiveStatusStates.includes(previousStageStatus) || 
															positiveStatusStates.some(s => previousStatusText.includes(s.replace('_', ' ')));

														const previousRemarks =
															(previousRelatedProcess?.id && selectedApplication.processRemarks?.[previousRelatedProcess.id]) ||
															(previousRelatedProcess?._id && selectedApplication.processRemarks?.[previousRelatedProcess._id]) ||
															previousRelatedProcess?.remarks ||
															previousRelatedProcess?.feedback ||
															previousRelatedStage?.remarks ||
															previousRelatedStage?.feedback ||
															'';
														const previousRemarksUpdated = typeof previousRemarks === 'string' && previousRemarks.trim().length > 0;

														// For assessment, remarks may not exist; keep completion-based gating.
														const isPreviousAssessment = previousRoundName === 'Assessment';
														const completedStates = ['completed', 'passed', 'failed', 'rejected', 'expired'];
														const previousCompleted = completedStates.includes(previousStatusText);

														canBookThisRound = isPreviousAssessment
															? (previousCompleted && assessmentPassed && !assessmentFailed)
															: isPreviousShortlisted;
													}
													
													if (isCurrentRoundCompleted) {
														return null;
													}

													if (assessmentFailed) {
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
																	Not eligible for next round (Assessment failed).
																</span>
															</div>
														);
													}

													if (roundWindowInfo.isAfterEnd || (bookedSlot && isBookedSlotExpired)) {
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
																	<i className="fa fa-clock-o me-2"></i>
																	Session Expired
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
								
								{/* Overall Employer Remarks */}
								<div className="mb-3 p-3" style={{backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffe0b3'}}>
									<h6 className="mb-3" style={{color: '#232323', fontWeight: '600'}}>
										Overall Employer Remarks
									</h6>
									<div style={{fontSize: '14px', lineHeight: '1.6', color: '#495057', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%'}}>
										{selectedApplication.employerRemarks?.trim()
											? selectedApplication.employerRemarks
											: 'No remarks provided.'}
									</div>
								</div>
							</div>
						</div>
					</div>
			)}
		</>
	);
}

export default CanStatusPage;
