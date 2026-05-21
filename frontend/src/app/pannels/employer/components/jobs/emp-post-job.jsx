import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../../utils/popupNotification';
import { formatDate } from '../../../../../utils/dateFormatter';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { employer, empRoute, publicUser } from "../../../../../globals/route-names";
import { holidaysApi } from "../../../../../utils/holidaysApi";
import { getLocalHolidayName, isWeekendDate, normalizeToYMD } from "../../../../../utils/holidayUtils";
import HolidayIndicator from "../../../../../components/HolidayIndicator";

import { api } from "../../../../../utils/api";
import InterviewDateTester from "../../../../../components/InterviewDateTester";
import { ErrorDisplay, GlobalErrorDisplay } from "../../../../../components/ErrorDisplay";
import { validateField, validateForm, displayError, safeApiCall, getErrorMessage } from "../../../../../utils/errorHandler";
import RichTextEditor from "../../../../../components/RichTextEditor";
import ImageResizer from "../../../../../components/ImageResizer";
import ImagePreviewModal from "../../../../../components/ImagePreviewModal";
import { formatTimeToAMPM } from "../../../../../utils/dateFormatter";
import { useImageResizer } from "../../../../../hooks/useImageResizer";
import {
	JOB_EDUCATION_LEVELS,
	formatJobEducationDisplay,
	getJobEducationSpecializationOptions,
	normalizeJobEducationSpecializations
} from "../../../../../utils/jobEducationOptions";

import "../../../../../components/ErrorDisplay.css";
import "./emp-post-job-mobile-fix.css";

// Location options array
const LOCATION_OPTIONS = [
	"Bangalore", "Bangalore - Yeshwantpur", "Bangalore - Whitefield", "Bangalore - Koramangala", "Bangalore - Indiranagar", "Bangalore - Electronic City", "Bangalore - Marathahalli", "Bangalore - BTM Layout", "Bangalore - Jayanagar", "Bangalore - HSR Layout", "Bangalore - Hebbal", "Bangalore - Yelahanka", "Bangalore - Banashankari", "Bangalore - JP Nagar", "Bangalore - Rajajinagar", "Bangalore - Malleshwaram",
	"Mumbai", "Mumbai - Andheri", "Mumbai - Bandra", "Mumbai - Borivali", "Mumbai - Powai", "Mumbai - Goregaon", "Mumbai - Malad", "Mumbai - Kandivali", "Mumbai - Dadar", "Mumbai - Kurla", "Mumbai - Vikhroli", "Mumbai - Mulund",
	"Delhi", "Delhi - Connaught Place", "Delhi - Dwarka", "Delhi - Rohini", "Delhi - Saket", "Delhi - Lajpat Nagar", "Delhi - Karol Bagh", "Delhi - Nehru Place", "Delhi - Janakpuri", "Delhi - Pitampura",
	"Hyderabad", "Hyderabad - Hitech City", "Hyderabad - Gachibowli", "Hyderabad - Madhapur", "Hyderabad - Kukatpally", "Hyderabad - Secunderabad", "Hyderabad - Banjara Hills", "Hyderabad - Jubilee Hills", "Hyderabad - Ameerpet",
	"Chennai", "Chennai - Anna Nagar", "Chennai - T Nagar", "Chennai - Velachery", "Chennai - Adyar", "Chennai - Tambaram", "Chennai - Porur", "Chennai - OMR", "Chennai - Guindy",
	"Pune", "Pune - Hinjewadi", "Pune - Kharadi", "Pune - Wakad", "Pune - Baner", "Pune - Viman Nagar", "Pune - Aundh", "Pune - Hadapsar", "Pune - Magarpatta",
	"Kolkata", "Kolkata - Salt Lake", "Kolkata - Rajarhat", "Kolkata - Park Street", "Kolkata - Howrah", "Kolkata - Ballygunge", "Kolkata - New Town", "Kolkata - Dum Dum",
	"Ahmedabad", "Ahmedabad - Satellite", "Ahmedabad - Vastrapur", "Ahmedabad - Maninagar", "Ahmedabad - Bopal", "Ahmedabad - Prahlad Nagar", "Ahmedabad - Navrangpura",
	"Surat", "Jaipur", "Jaipur - Malviya Nagar", "Jaipur - Vaishali Nagar", "Jaipur - Mansarovar", "Jaipur - C Scheme",
	"Lucknow", "Lucknow - Gomti Nagar", "Lucknow - Hazratganj", "Lucknow - Indira Nagar",
	"Kanpur", "Nagpur", "Indore", "Indore - Vijay Nagar", "Indore - Palasia", "Indore - Rau",
	"Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
	"Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
	"Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Navi Mumbai - Vashi", "Navi Mumbai - Kharghar", "Navi Mumbai - Nerul", "Navi Mumbai - Belapur",
	"Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
	"Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Thiruvananthapuram", "Solapur",
	"Hubballi-Dharwad", "Tiruchirappalli", "Bareilly", "Mysore", "Tiruppur", "Gurgaon", "Gurgaon - Cyber City", "Gurgaon - DLF Phase 1", "Gurgaon - DLF Phase 2", "Gurgaon - Sohna Road", "Gurgaon - Golf Course Road",
	"Aligarh", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Guntur", "Bhiwandi",
	"Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Noida - Sector 62", "Noida - Sector 18", "Noida - Sector 16", "Noida - Greater Noida",
	"Jamshedpur", "Bhilai Nagar", "Cuttack", "Firozabad", "Kochi", "Kochi - Kakkanad", "Kochi - Edappally",
	"Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri",
	"Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode",
	"Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur",
	"Maheshtala", "Remote", "Work From Home", "Hybrid"
];

const formatDateForInput = (dateObj) => {
	const y = dateObj.getFullYear();
	const m = String(dateObj.getMonth() + 1).padStart(2, '0');
	const d = String(dateObj.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

const getNextDayDateString = (dateString) => {
	if (!dateString) return '';
	const [y, m, d] = String(dateString).split('-').map(Number);
	if (!y || !m || !d) return '';
	const date = new Date(y, m - 1, d);
	date.setDate(date.getDate() + 1);
	return formatDateForInput(date);
};

const formatAssessmentTitle = (title = '') => {
	const value = String(title || '').trim();
	if (!value) return '';
	return value
		.toLowerCase()
		.split(/\s+/)
		.map((word) =>
			word
				.split('-')
				.map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
				.join('-')
		)
		.join(' ');
};

const getAssessmentDuration = (assessment = {}) =>
	assessment?.timer || assessment?.timeLimit || assessment?.duration || assessment?.totalTime || 'N/A';

const formatCountLabel = (count, singular, plural = `${singular}s`) =>
	`${count} ${count === 1 ? singular : plural}`;

const formatAssessmentOptionLabel = (assessment = {}, employerType = 'company') => {
	const companyName = String(assessment?.companyName || '').trim();
	const assessmentName = formatAssessmentTitle(assessment?.title) || 'Untitled Assessment';
	const designation = String(assessment?.designation || '').trim();
	const duration = getAssessmentDuration(assessment);
	const durationLabel = duration === 'N/A' ? 'Duration: N/A' : `${duration} min`;

	if (employerType === 'consultant') {
		// consultant: Company Name - Designation - Assessment Title (10 min)
		const parts = [companyName || 'N/A'];
		if (designation) parts.push(designation);
		parts.push(`${assessmentName} (${durationLabel})`);
		return parts.join(' - ');
	}

	// company: Designation - Assessment Title (10 min)
	if (designation) {
		return `${designation} - ${assessmentName} (${durationLabel})`;
	}
	return `${assessmentName} (${durationLabel})`;
};

const getAssessmentOptionId = (assessment = {}) => assessment?._id || assessment?.id || '';

const getAssessmentOptionSearchText = (assessment = {}, employerType = 'company') =>
	[
		formatAssessmentOptionLabel(assessment, employerType),
		assessment?.title,
		assessment?.designation,
		assessment?.companyName
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

const PREDEFINED_JOB_TITLES = [
	"Software Engineer", "Senior Software Engineer", "Frontend Developer", "Backend Developer", 
	"Full Stack Developer", "Data Scientist", "Data Analyst", "Product Manager", 
	"Project Manager", "Business Analyst", "UI/UX Designer", "Graphic Designer", 
	"Marketing Manager", "Sales Manager", "Sales Executive", "HR Manager", 
	"HR Executive", "Finance Manager", "Accountant", "Content Writer", 
	"Digital Marketing Specialist", "Customer Support Executive", "Operations Manager", 
	"Quality Assurance Engineer", "DevOps Engineer", "System Administrator", 
	"Network Administrator", "Telecaller"
];

const PREDEFINED_CATEGORIES = [
	"Agriculture", "Arts and Design", "Business and Management", "Construction",
	"Customer Service", "Education", "Engineering", "Finance and Accounting",
	"Health Care", "Hospitality and Tourism", "Human Resources", "Information Technology",
	"Legal", "Manufacturing", "Marketing and Sales", "Media and Communications",
	"Writing and Editing", "Science and Research", "Skilled Trades", "Transportation and Logistics"
];

const POST_JOB_TICKET_LIMIT = 10;

// LocationSearchInput Component
function LocationSearchInput({ value, onChange, error, style }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const [filteredLocations, setFilteredLocations] = useState(LOCATION_OPTIONS);

	const selectedLocations = Array.isArray(value) ? value : (value ? [value] : []);

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredLocations(LOCATION_OPTIONS.filter(loc => !selectedLocations.includes(loc)));
		} else {
			const filtered = LOCATION_OPTIONS.filter(location =>
				location.toLowerCase().includes(searchTerm.toLowerCase()) &&
				!selectedLocations.includes(location)
			);
			setFilteredLocations(filtered);
		}
	}, [searchTerm, selectedLocations]);

	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
		setShowDropdown(true);
	};

	const handleLocationSelect = (location) => {
		const updatedLocations = [...selectedLocations, location];
		onChange(updatedLocations);
		setSearchTerm('');
		setShowDropdown(false);
	};

	const removeLocation = (locationToRemove) => {
		const updatedLocations = selectedLocations.filter(loc => loc !== locationToRemove);
		onChange(updatedLocations);
	};

	const handleInputFocus = () => {
		setShowDropdown(true);
	};

	const handleInputBlur = () => {
		setTimeout(() => setShowDropdown(false), 200);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && searchTerm.trim() !== '') {
			e.preventDefault();
			if (!selectedLocations.includes(searchTerm.trim())) {
				handleLocationSelect(searchTerm.trim());
			} else {
				setSearchTerm('');
			}
		} else if (e.key === 'Backspace' && searchTerm === '' && selectedLocations.length > 0) {
			removeLocation(selectedLocations[selectedLocations.length - 1]);
		}
	};

	return (
		<div style={{ position: 'relative' }}>
			<div style={{
				...style,
				display: 'flex',
				flexWrap: 'wrap',
				gap: '8px',
				padding: '8px 12px',
				minHeight: '45px',
				alignItems: 'center',
				cursor: 'text'
			}} onClick={() => document.getElementById('location-input').focus()}>
				{selectedLocations.map((location, index) => (
					<div key={index} style={{
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						background: '#f3f4f6',
						border: '1px solid #e5e7eb',
						borderRadius: '16px',
						padding: '2px 10px',
						fontSize: '13px',
						color: '#374151'
					}}>
						<span>{location}</span>
						<i 
							className="fa fa-times" 
							style={{ cursor: 'pointer', color: '#9ca3af', fontSize: '11px' }}
							onClick={(e) => {
								e.stopPropagation();
								removeLocation(location);
							}}
						/>
					</div>
				))}
				<input
					id="location-input"
					style={{
						border: 'none',
						outline: 'none',
						flex: 1,
						minWidth: '120px',
						padding: '4px 0',
						fontSize: '14px',
						background: 'transparent'
					}}
					type="text"
					value={searchTerm}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					onKeyDown={handleKeyDown}
					placeholder={selectedLocations.length === 0 ? "    Search or select locations..." : ""}
					autoComplete="off"
				/>
				<i 
					className="fa fa-search" 
					style={{
						color: '#9ca3af',
						fontSize: '14px',
						marginLeft: 'auto'
					}}
				/>
			</div>

			{showDropdown && (filteredLocations.length > 0 || searchTerm.trim() !== '') && (
				<div style={{
					position: 'absolute',
					top: '100%',
					left: 0,
					right: 0,
					background: '#fff',
					border: '1px solid #d1d5db',
					borderRadius: '0 0 8px 8px',
					maxHeight: '200px',
					overflowY: 'auto',
					zIndex: 1000,
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					marginTop: '2px'
				}}>
					{filteredLocations.slice(0, 10).map((location, index) => (
						<div
							key={index}
							style={{
								padding: '10px 12px',
								cursor: 'pointer',
								borderBottom: '1px solid #f3f4f6',
								transition: 'background-color 0.2s'
							}}
							onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
							onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
							onMouseDown={(e) => {
								e.preventDefault();
								handleLocationSelect(location);
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<i className="fa fa-map-marker-alt" style={{ color: '#ff6b35', fontSize: '12px' }}></i>
								<span style={{ fontSize: '14px', color: '#374151' }}>{location}</span>
							</div>
						</div>
					))}
					{searchTerm.trim() !== '' && !LOCATION_OPTIONS.some(loc => loc.toLowerCase() === searchTerm.toLowerCase()) && !selectedLocations.includes(searchTerm.trim()) && (
						<div
							style={{
								padding: '10px 12px',
								cursor: 'pointer',
								color: '#ff6b35',
								fontWeight: '500',
								borderBottom: '1px solid #f3f4f6'
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								handleLocationSelect(searchTerm.trim());
							}}
						>
							<i className="fa fa-plus" style={{ marginRight: 8 }}></i>
							Add "{searchTerm}"
						</div>
					)}
					{filteredLocations.length === 0 && searchTerm.trim() === '' && (
						<div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
							All locations selected or none found.
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function AssessmentSearchSelect({
	assessments = [],
	value = '',
	onSelect,
	employerType = 'company',
	inputStyle = {},
	containerStyle = {},
	minWidth = '320px',
	placeholder = 'Search or choose an assessment...'
}) {
	const selectedAssessment = assessments.find(
		(assessment) => getAssessmentOptionId(assessment) === value
	);
	const selectedLabel = selectedAssessment
		? formatAssessmentOptionLabel(selectedAssessment, employerType)
		: '';
	const [searchTerm, setSearchTerm] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const [menuPosition, setMenuPosition] = useState({
		top: 0,
		bottom: 'auto',
		left: 0,
		width: 0,
		maxHeight: 280
	});
	const wrapperRef = useRef(null);
	const menuRef = useRef(null);

	const filteredAssessments = assessments.filter((assessment) =>
		getAssessmentOptionSearchText(assessment, employerType).includes(searchTerm.trim().toLowerCase())
	);
	const resolvedMinWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;

	const handleSelect = (assessmentId) => {
		if (!assessmentId) return;
		setShowDropdown(false);
		setSearchTerm('');
		onSelect(assessmentId);
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && filteredAssessments.length > 0) {
			event.preventDefault();
			handleSelect(getAssessmentOptionId(filteredAssessments[0]));
		}

		if (event.key === 'Escape') {
			setShowDropdown(false);
			setSearchTerm('');
		}
	};

	useEffect(() => {
		if (!showDropdown) {
			return undefined;
		}

		const handlePointerDown = (event) => {
			const clickedTrigger = wrapperRef.current && wrapperRef.current.contains(event.target);
			const clickedMenu = menuRef.current && menuRef.current.contains(event.target);

			if (!clickedTrigger && !clickedMenu) {
				setShowDropdown(false);
				setSearchTerm('');
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('touchstart', handlePointerDown);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('touchstart', handlePointerDown);
		};
	}, [showDropdown]);

	useEffect(() => {
		if (!showDropdown || !wrapperRef.current) {
			return undefined;
		}

		const updateMenuPosition = () => {
			if (!wrapperRef.current) {
				return;
			}

			const rect = wrapperRef.current.getBoundingClientRect();
			const viewportPadding = 8;
			const menuGap = 6;
			const preferredMenuHeight = Math.min(320, Math.max(180, filteredAssessments.length * 52 + 64));
			const spaceAbove = rect.top - viewportPadding;
			const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
			const shouldDropUp = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow;
			const maxHeight = Math.min(
				320,
				Math.max(160, shouldDropUp ? spaceAbove - menuGap : spaceBelow - menuGap)
			);
			const maxWidth = window.innerWidth - viewportPadding * 2;
			const width = Math.min(rect.width, maxWidth);
			const left = Math.min(
				Math.max(viewportPadding, rect.left),
				Math.max(viewportPadding, window.innerWidth - viewportPadding - width)
			);

			setMenuPosition({
				top: shouldDropUp ? 'auto' : rect.bottom + menuGap,
				bottom: shouldDropUp ? window.innerHeight - rect.top + menuGap : 'auto',
				left,
				width,
				maxHeight
			});
		};

		const frameId = window.requestAnimationFrame(updateMenuPosition);
		window.addEventListener('resize', updateMenuPosition);
		window.addEventListener('scroll', updateMenuPosition, true);

		return () => {
			window.cancelAnimationFrame(frameId);
			window.removeEventListener('resize', updateMenuPosition);
			window.removeEventListener('scroll', updateMenuPosition, true);
		};
	}, [showDropdown, filteredAssessments.length]);

	const optionsMaxHeight = Math.max(96, menuPosition.maxHeight - 68);

	const dropdownMenu = showDropdown && typeof document !== 'undefined'
		? createPortal(
			<div
				ref={menuRef}
				data-dropdown-menu="assessment-search-select"
				style={{
					position: 'fixed',
					top: menuPosition.top,
					bottom: menuPosition.bottom,
					left: menuPosition.left,
					width: menuPosition.width,
					background: '#fff',
					border: '1px solid #d1d5db',
					borderRadius: '12px',
					maxHeight: menuPosition.maxHeight,
					overflow: 'hidden',
					zIndex: 2147483646,
					boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)'
				}}
			>
				<div
					style={{
						padding: '10px 12px',
						borderBottom: '1px solid #e2e8f0',
						background: '#f8fafc'
					}}
				>
					<div style={{ position: 'relative' }}>
						<input
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							autoComplete="off"
							autoFocus
							style={{
								...inputStyle,
								minWidth: '100%',
								width: '100%',
								backgroundImage: 'none',
								appearance: 'none',
								WebkitAppearance: 'none',
								MozAppearance: 'none',
								paddingLeft: '36px',
								paddingRight: '12px',
								borderRadius: '8px',
								borderColor: '#cbd5e1',
								boxShadow: 'none'
							}}
						/>
						<div style={{
							position: 'absolute',
							left: '12px',
							top: '50%',
							transform: 'translateY(-50%)',
							pointerEvents: 'none',
							color: '#9ca3af'
						}}>
							<i className="fa fa-search" style={{ fontSize: 13 }}></i>
						</div>
					</div>
				</div>
				<div
					style={{
						maxHeight: optionsMaxHeight,
						overflowY: 'auto',
						overscrollBehavior: 'contain',
						WebkitOverflowScrolling: 'touch',
						touchAction: 'pan-y'
					}}
					onWheel={(event) => event.stopPropagation()}
					onTouchMove={(event) => event.stopPropagation()}
				>
					{filteredAssessments.length > 0 ? (
						filteredAssessments.map((assessment) => {
							const assessmentId = getAssessmentOptionId(assessment);
							const isSelected = assessmentId === value;

							return (
								<div
									key={assessmentId}
									style={{
										padding: '10px 12px',
										cursor: 'pointer',
										borderBottom: '1px solid #f1f5f9',
										background: isSelected ? '#f0fdf4' : '#fff'
									}}
									onMouseDown={(event) => {
										event.preventDefault();
									}}
									onClick={() => handleSelect(assessmentId)}
									onMouseEnter={(event) => {
										if (!isSelected) {
											event.currentTarget.style.backgroundColor = '#f8fafc';
										}
									}}
									onMouseLeave={(event) => {
										event.currentTarget.style.backgroundColor = isSelected ? '#f0fdf4' : '#fff';
									}}
								>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
										<div style={{ minWidth: 0 }}>
											<div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
												{formatAssessmentOptionLabel(assessment, employerType)}
											</div>
										</div>
										{isSelected && (
											<i className="fa fa-check-circle" style={{ color: '#059669', fontSize: 14, flexShrink: 0 }}></i>
										)}
									</div>
								</div>
							);
						})
					) : (
						<div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
							{assessments.length === 0 ? 'No assessments available.' : 'No matching assessments found.'}
						</div>
					)}
				</div>
			</div>,
			document.body
		)
		: null;

	return (
		<div
			ref={wrapperRef}
			style={{ position: 'relative', width: '100%', minWidth: 0, maxWidth: '100%', flexBasis: resolvedMinWidth, ...containerStyle }}
		>
			<div style={{ position: 'relative' }}>
				<button
					type="button"
					onClick={() => {
						setShowDropdown((prev) => !prev);
						setSearchTerm('');
					}}
					style={{
						...inputStyle,
						width: '100%',
						backgroundImage: 'none',
						appearance: 'none',
						WebkitAppearance: 'none',
						MozAppearance: 'none',
						paddingLeft: '14px',
						paddingRight: '40px',
						cursor: 'pointer',
						textAlign: 'left',
						display: 'flex',
						alignItems: 'center',
						minWidth: 0
					}}
				>
					<span style={{
						color: selectedLabel ? '#0f172a' : '#94a3b8',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						display: 'block',
						width: '100%',
						flex: 1,
						minWidth: 0
					}}>
						{selectedLabel || '-- Choose an Assessment --'}
					</span>
				</button>
				<div style={{
					position: 'absolute',
					right: '12px',
					top: '50%',
					transform: 'translateY(-50%)',
					pointerEvents: 'none',
					color: '#64748b'
				}}>
					<i className={`fa ${showDropdown ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 12 }}></i>
				</div>
			</div>
			{dropdownMenu}
		</div>
	);
}

export default function EmpPostJob({ onNext }) {
	const { id } = useParams();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const isEditMode = Boolean(id);
	const [currentJobId, setCurrentJobId] = useState(id);
	const today = new Date().toISOString().split('T')[0];
	const backendBaseUrl = process.env.REACT_APP_API_URL
		? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
		: (typeof window !== 'undefined'
			? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin)
			: '');
	const {
		isResizerOpen,
		currentImage,
		resizeConfig,
		closeResizer,
		handleSave: handleResizerSave,
		openLogoResizer,
		openResizer,
		fileToDataURL
	} = useImageResizer();

	const BANNER_RESIZE_CONFIG = {
		aspectRatio: 1128 / 191,
		maxWidth: 1128,
		maxHeight: 191,
		lockCropArea: true,
		quality: 0.9
	};

	const openBannerResizer = (imageSrc, onSave) => openResizer(imageSrc, BANNER_RESIZE_CONFIG, onSave);
	const [formData, setFormData] = useState({
		jobTitle: "",
		jobLocation: [],
		jobType: "",
		netSalary: "",
		ctc: "",
		vacancies: "",
		applicationLimit: "",
		jobDescription: "",
		rolesAndResponsibilities: "",
		education: [], // dropdown
		educationSpecializations: [],
		backlogsAllowed: false,
		requiredSkills: [],
		preferredLanguages: [],
		skillInput: "",
		experienceLevel: "freshers", // 'freshers' | 'minimum'
		minExperience: "",
		maxExperience: "",
		interviewRoundsCount: "",
		interviewRoundTypes: {
			oneOnOne: false,
			panel: false,
			group: false,
			technical: false,
			situational: false,
			others: false,
			assessment: false
		},
		interviewRoundOrder: [],
		interviewRoundDetails: {
			oneOnOne: { description: '', fromDate: '', startTime: '', endTime: '' },
			panel: { description: '', fromDate: '', startTime: '', endTime: '' },
			group: { description: '', fromDate: '', startTime: '', endTime: '' },
			technical: { description: '', fromDate: '', startTime: '', endTime: '' },
			situational: { description: '', fromDate: '', startTime: '', endTime: '' },
			others: { description: '', fromDate: '', startTime: '', endTime: '' },
			assessment: { description: '', fromDate: '', startTime: '', endTime: '' }
		},
		offerLetterDate: "",
		joiningDate: "",
		lastDateOfApplication: "",
		lastDateOfApplicationTime: "",
		transportation: {
			oneWay: false,
			twoWay: false,
			noCab: false,
		},
		interviewMode: {
			faceToFace: false,
			phone: false,
			videoCall: false,
			documentVerification: false,
		},
		// Consultant-specific fields
		companyLogo: "",
		companyBanner: "",
		companyName: "",
		companyDescription: "",
		aboutCompany: "",
		category: "",
		// Work Shift
		shift: "",
		// Work Mode
		workMode: ""
	});
	const minInterviewDate = formData.lastDateOfApplication ? formData.lastDateOfApplication : today;

	const getAssessmentMinDate = (lastDateOfApplication = formData.lastDateOfApplication) => {
		const normalizedLastDate = normalizeToYMD(lastDateOfApplication);
		if (!normalizedLastDate) return today;
		return getNextDayDateString(normalizedLastDate) || normalizedLastDate;
	};

	const getMinDateForRoundFromState = (state, roundKey) => {
		const baseMinDate = getAssessmentMinDate(state.lastDateOfApplication);
		const roundIndex = state.interviewRoundOrder.indexOf(roundKey);

		if (roundIndex <= 0) {
			return baseMinDate;
		}

		const prevRoundKey = state.interviewRoundOrder[roundIndex - 1];
		const prevRoundDetails = state.interviewRoundDetails?.[prevRoundKey];
		const prevEndDate = prevRoundDetails?.toDate || prevRoundDetails?.fromDate;

		if (!prevEndDate) {
			return baseMinDate;
		}

		const nextAllowedDate = getNextDayDateString(prevEndDate);
		if (!nextAllowedDate) {
			return baseMinDate;
		}

		return nextAllowedDate < baseMinDate ? baseMinDate : nextAllowedDate;
	};

	const getMinDateForRound = (roundKey) => {
		return getMinDateForRoundFromState(formData, roundKey);
	};

	const getSubStageDateRange = (subStages = [], fallbackFromDate = '', fallbackToDate = '') => {
		const dates = subStages
			.map((sub) => normalizeToYMD(sub?.fromDate || sub?.fromdate || sub?.date || ''))
			.filter(Boolean)
			.sort();

		return {
			fromDate: dates[0] || fallbackFromDate,
			toDate: dates[dates.length - 1] || fallbackToDate || fallbackFromDate
		};
	};

	const getMinDateForSubStage = (uniqueKey, subIndex) => {
		const roundMinDate = getMinDateForRound(uniqueKey);
		if (subIndex <= 0) {
			return roundMinDate;
		}

		const details = formData.interviewRoundDetails?.[uniqueKey] || {};
		const subStages = details.subStages || [];
		const previousSubStageDate = normalizeToYMD(subStages[subIndex - 1]?.fromDate || '');

		if (!previousSubStageDate) {
			return normalizeToYMD(details.fromDate || '') || roundMinDate;
		}

		const nextAllowedDate = getNextDayDateString(previousSubStageDate);
		return nextAllowedDate < roundMinDate ? roundMinDate : nextAllowedDate;
	};

	const applySubStageDateChange = (uniqueKey, subStageId, selectedDate) => {
		setFormData((prev) => {
			const details = prev.interviewRoundDetails?.[uniqueKey] || {};
			const subStages = details.subStages || [];
			const updatedSubStages = subStages.map((stage) =>
				stage.id === subStageId ? { ...stage, fromDate: selectedDate } : stage
			);
			const subStageDateRange = getSubStageDateRange(
				updatedSubStages,
				details.fromDate,
				details.toDate || details.fromDate
			);

			return {
				...prev,
				interviewRoundDetails: {
					...prev.interviewRoundDetails,
					[uniqueKey]: {
						...details,
						subStages: updatedSubStages,
						fromDate: subStageDateRange.fromDate || details.fromDate,
						toDate: subStageDateRange.toDate || details.toDate
					}
				}
			};
		});
	};

	const [employerType, setEmployerType] = useState('company');
	const [postJobAccess, setPostJobAccess] = useState({
		loading: true,
		isApproved: true,
		canPostJobs: true,
		hasMinimumApprovedDocuments: true,
		approvedDocumentCount: 0,
		minimumApprovedDocuments: 2,
		message: '',
		profileSubmittedForReview: false,
		candidateSupportTicketsCount: 0,
		error: ''
	});
	const [currentStep, setCurrentStep] = useState(parseInt(searchParams.get('step')) || 1);

	// Sync currentStep with URL step parameter
	useEffect(() => {
		const step = parseInt(searchParams.get('step'));
		if (step && step !== currentStep) {
			setCurrentStep(step);
		}
	}, [searchParams, currentStep]);

	const autoResizeTextarea = useCallback((element) => {
		if (!element) return;
		element.style.height = 'auto';
		element.style.height = `${element.scrollHeight}px`;
	}, []);

	useEffect(() => {
		const elements = document.querySelectorAll('[data-interview-round-description="true"]');
		elements.forEach((element) => autoResizeTextarea(element));
	}, [formData.interviewRoundDetails, formData.interviewRoundOrder, autoResizeTextarea]);
	const [logoFile, setLogoFile] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [previewAlt, setPreviewAlt] = useState('');
	const [isMobile, setIsMobile] = useState(false);
	const [availableAssessments, setAvailableAssessments] = useState([]);
	const [selectedAssessment, setSelectedAssessment] = useState('');
	const [errors, setErrors] = useState({});
	const [globalErrors, setGlobalErrors] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showSubStageConfirm, setShowSubStageConfirm] = useState(null);
	const [scheduledRounds, setScheduledRounds] = useState({});
	const [interviewRoundIds, setInterviewRoundIds] = useState({}); // Store created InterviewRound IDs
	const [interviewModal, setInterviewModal] = useState({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false });
	const isAssessmentFirst = Boolean(
		formData?.interviewRoundOrder?.length &&
		formData.interviewRoundTypes?.[formData.interviewRoundOrder[0]] === 'assessment'
	);
	const [locationSearchTerm, setLocationSearchTerm] = useState('');
	const [showLocationDropdown, setShowLocationDropdown] = useState(false);
	const [showEducationDropdown, setShowEducationDropdown] = useState(false);
	const [approvedCompanies, setApprovedCompanies] = useState([]);
	const [applicationLimitWarning, setApplicationLimitWarning] = useState('');
	const [ctcFormatError, setCtcFormatError] = useState('');
	const [selectedDayCount, setSelectedDayCount] = useState({});
	const [validationRules] = useState({
		jobTitle: { required: true, minLength: 3 },
		category: { required: true },
		jobType: { required: true },
		workMode: { required: true },
		shift: { required: true },
		ctc: { 
			required: true, 
			pattern: /^(\d+(?:\.\d+)?|\d+(?:\.\d+)?-\d+(?:\.\d+)?)$/,
			patternMessage: 'Enter CTC as number (e.g., 8) or range (e.g., 6-8) in lakhs. Max value is 500.'
		},
		netSalary: { required: true },
		jobLocation: { required: true },
		vacancies: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		applicationLimit: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		education: { required: true },
		requiredSkills: { required: true, customMessage: 'Required skills field cannot be empty. Please select at least one skill' },
		interviewRoundsCount: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		offerLetterDate: { required: true },
		lastDateOfApplication: { required: true },
		jobDescription: { required: true, minLength: 50, patternMessage: 'Must be at least 50 characters' },
		rolesAndResponsibilities: { required: true, minLength: 50, patternMessage: 'Must be at least 50 characters' }
	});

	/* Helpers */
	const update = (patch) => {
		setFormData((s) => ({ ...s, ...patch }));
		// Clear global errors when user makes changes
		if (globalErrors.length > 0) {
			setGlobalErrors([]);
		}
		// Clear field-specific errors
		Object.keys(patch).forEach(field => {
			if (errors[field]) {
				setErrors(prev => {
					const newErrors = { ...prev };
					delete newErrors[field];
					return newErrors;
				});
			}
		});
	};

	const getImagePreviewSrc = useCallback((imageValue) => {
		if (!imageValue || typeof imageValue !== 'string') return '';
		if (
			imageValue.startsWith('data:') ||
			imageValue.startsWith('blob:') ||
			imageValue.startsWith('http://') ||
			imageValue.startsWith('https://')
		) {
			return imageValue;
		}
		if (imageValue.startsWith('/uploads') || imageValue.startsWith('uploads/')) {
			const normalizedPath = imageValue.startsWith('/') ? imageValue : `/${imageValue}`;
			return `${backendBaseUrl}${normalizedPath}`;
		}
		if (/^[A-Za-z0-9+/=]+$/.test(imageValue)) {
			return `data:image/jpeg;base64,${imageValue}`;
		}
		return imageValue;
	}, [backendBaseUrl]);

	const openImagePreview = useCallback((imageSrc, altText) => {
		if (!imageSrc) return;
		setPreviewImage(imageSrc);
		setPreviewAlt(altText || 'Image preview');
	}, []);

	const closeImagePreview = useCallback(() => {
		setPreviewImage(null);
		setPreviewAlt('');
	}, []);

	const getImageDimensions = useCallback((file) => (
		new Promise((resolve, reject) => {
			const objectUrl = URL.createObjectURL(file);
			const image = new Image();

			image.onload = () => {
				const dimensions = { width: image.width, height: image.height };
				URL.revokeObjectURL(objectUrl);
				resolve(dimensions);
			};

			image.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('Unable to read the selected image. Please try another file.'));
			};

			image.src = objectUrl;
		})
	), []);

	const validateConsultantImage = useCallback(async (file, fieldName) => {
		const imageRules = fieldName === 'companyLogo'
			? {
				label: 'Company logo',
				maxSizeMB: 5,
				minWidth: 136,
				minHeight: 136
			}
			: {
				label: 'Company banner',
				maxSizeMB: 5,
				minWidth: 1128,
				minHeight: 191
			};
		const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

		if (!acceptedTypes.includes(file.type)) {
			throw new Error(`${imageRules.label} must be a JPG or PNG image.`);
		}

		if (file.size > imageRules.maxSizeMB * 1024 * 1024) {
			throw new Error(`${imageRules.label} must be ${imageRules.maxSizeMB}MB or smaller.`);
		}

		const { width, height } = await getImageDimensions(file);
		if (width < imageRules.minWidth || height < imageRules.minHeight) {
			throw new Error(
				`${imageRules.label} must be at least ${imageRules.minWidth}x${imageRules.minHeight}px.`
			);
		}
	}, [getImageDimensions]);

	const syncEducationSelection = (nextEducation) => {
		update({
			education: nextEducation,
			educationSpecializations: normalizeJobEducationSpecializations(
				formData.educationSpecializations,
				nextEducation
			)
		});
	};

	const getSelectedEducationSpecialization = (qualification) => {
		const normalizedSpecializations = normalizeJobEducationSpecializations(
			formData.educationSpecializations,
			formData.education
		);

		return normalizedSpecializations.find((entry) => entry.qualification === qualification)?.specialization
			|| getJobEducationSpecializationOptions(qualification)[0]
			|| '';
	};

	const handleEducationSpecializationChange = (qualification, specialization) => {
		const nextEntries = [
			...formData.educationSpecializations.filter((entry) => entry?.qualification !== qualification),
			{ qualification, specialization }
		];

		update({
			educationSpecializations: normalizeJobEducationSpecializations(
				nextEntries,
				formData.education
			)
		});
	};

	const sanitizeNonNegativeIntegerInput = (value) => value.replace(/\D/g, '');

	const blockInvalidNumberKeys = (event) => {
		if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
			event.preventDefault();
		}
	};

	const getHolidayConfirmationMessage = (fieldLabel = 'date', options = {}) => {
		const normalizedLabel = String(fieldLabel || 'date').trim();
		const displayLabel = normalizedLabel
			? normalizedLabel.charAt(0).toLowerCase() + normalizedLabel.slice(1)
			: 'date';
		const actionText = options.scheduling
			? 'Would you like to continue scheduling on this date?'
			: 'Would you like to continue with this date?';
		const reminderText = options.reminder ? ` ${options.reminder}` : '';

		return `The selected ${displayLabel} falls on a holiday. ${actionText}${reminderText}`;
	};

	const confirmHolidayDate = async (dateValue, onConfirm, fieldLabel = 'date', options = {}) => {
		let normalized = normalizeToYMD(dateValue);
		if (!normalized) normalized = dateValue;
		if (!normalized) return;

		const holidayCheck = await holidaysApi.checkHoliday(normalized);
		const localHolidayName = getLocalHolidayName(normalized);
		const isWeekend = isWeekendDate(normalized);
		const isHolidayLikeFromApi = Boolean(
			holidayCheck?.success && (holidayCheck.isHoliday || holidayCheck.isNonWorkingDay || holidayCheck.isWeekend)
		);
		const shouldConfirmHoliday = isHolidayLikeFromApi || Boolean(localHolidayName) || isWeekend;

		if (shouldConfirmHoliday) {
			showConfirmation(
				getHolidayConfirmationMessage(fieldLabel, options),
				onConfirm,
				null,
				'warning',
				{ confirmText: 'Yes, Continue', cancelText: 'No' }
			);
			return;
		}

		onConfirm();
	};

	// Auto-save CTC to localStorage with debouncing and calculate net salary
	const autoSaveCTC = useCallback((ctcValue) => {
		if (ctcValue && String(ctcValue).trim()) {
			localStorage.setItem('draft_ctc', ctcValue);
			
			// Auto-calculate net salary (CTC divided by 12 months)
			const calculateNetSalary = (ctc) => {
				const ctcStr = String(ctc).trim();
				if (!ctcStr) return '';
				
				// Handle range format (e.g., "6-8" or "6-8 L.P.A")
				if (ctcStr.includes('-')) {
					const parts = ctcStr.split('-');
					if (parts.length === 2) {
						const minCTC = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
						const maxCTC = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
						if (!isNaN(minCTC) && !isNaN(maxCTC)) {
							const minNet = Math.round((minCTC * 100000) / 12);
							const maxNet = Math.round((maxCTC * 100000) / 12);
							return `${minNet}-${maxNet}`;
						}
					}
				} else {
					// Handle single value (e.g., "8" or "8 L.P.A")
					const ctcNum = parseFloat(ctcStr.replace(/[^0-9.]/g, ''));
					if (!isNaN(ctcNum)) {
						const monthlyNet = Math.round((ctcNum * 100000) / 12);
						return monthlyNet.toString();
					}
				}
				return '';
			};
			
			const netSalary = calculateNetSalary(ctcValue);
			if (netSalary) {
				// Only update netSalary, don't modify the CTC value
				setFormData(prev => ({ ...prev, netSalary }));
			}
		} else {
			// Clear net salary when CTC is empty
			setFormData(prev => ({ ...prev, netSalary: '' }));
		}
	}, []);

	// Debounced auto-save - only trigger if CTC has a value
	useEffect(() => {
		const timer = setTimeout(() => {
			if (formData.ctc && formData.ctc.trim()) {
				autoSaveCTC(formData.ctc);
			}
		}, 500); // Save after 500ms of no typing

		return () => clearTimeout(timer);
	}, [formData.ctc, autoSaveCTC]);

	useEffect(() => {
		// Reset scroll position
		window.scrollTo(0, 0);
		
		if (id) {
			setCurrentJobId(id);
		}
		
		if (isEditMode) {
			fetchJobData();
		} else {
			// Don't load saved CTC from localStorage to prevent default values
			// const savedCTC = localStorage.getItem('draft_ctc');
			// if (savedCTC) {
			//		update({ ctc: savedCTC });
			// }
		}
		fetchEmployerType();
		fetchPostJobAccess();
		fetchAssessments();
		fetchApprovedCompanies();
		
		// Mobile detection
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 767);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, [id, isEditMode]);

	const fetchPostJobAccess = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			if (!token) {
				setPostJobAccess({
					loading: false,
					isApproved: false,
					canPostJobs: false,
					hasMinimumApprovedDocuments: false,
					approvedDocumentCount: 0,
					minimumApprovedDocuments: 2,
					message: '',
					profileSubmittedForReview: false,
					candidateSupportTicketsCount: 0,
					error: 'Please log in to post a job.'
				});
				return;
			}

			const completionData = await safeApiCall('http://localhost:5000/api/employer/profile/completion', {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			const ticketsData = await safeApiCall('http://localhost:5000/api/employer/support-tickets', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const tickets = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];
			const candidateSupportTicketsCount = tickets.filter(ticket => ticket.ticketType === 'candidate').length;

			setPostJobAccess({
				loading: false,
				isApproved: Boolean(completionData?.isApproved),
				canPostJobs: Boolean(completionData?.canPostJobs),
				hasMinimumApprovedDocuments: Boolean(completionData?.hasMinimumApprovedDocuments),
				approvedDocumentCount: Number(completionData?.approvedDocumentCount || 0),
				minimumApprovedDocuments: Number(completionData?.minimumApprovedDocuments || 2),
				message: completionData?.message || '',
				profileSubmittedForReview: Boolean(completionData?.profileSubmittedForReview),
				candidateSupportTicketsCount,
				error: ''
			});
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to verify post job access:', error);
			setPostJobAccess((prev) => ({
				...prev,
				loading: false,
				canPostJobs: false,
				error: 'Unable to verify account status. Please refresh or contact support.'
			}));
		}
	};

	const fetchAssessments = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/assessments', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				const selectableAssessments = (data.assessments || []).filter((assessment) => {
					const normalizedStatus = String(assessment?.status || 'published').toLowerCase();
					return normalizedStatus !== 'draft';
				});
				setAvailableAssessments(selectableAssessments);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch assessments:', error);
		}
	};

	const fetchApprovedCompanies = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/approved-authorization-companies', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				setApprovedCompanies(data.companies || []);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch approved companies:', error);
		}
	};

	const fetchJobData = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall(`http://localhost:5000/api/employer/jobs/${id}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				const job = data.job;

				// Populate form with job data
				update({
					jobTitle: job.title || '',
					jobLocation: Array.isArray(job.location) ? job.location : (job.location ? [job.location] : []),
					jobType: job.jobType || '',
					netSalary: job.netSalary ? (typeof job.netSalary === 'object' ? (job.netSalary.min === job.netSalary.max ? `${job.netSalary.min}` : `${job.netSalary.min}-${job.netSalary.max}`) : job.netSalary) : '',
					ctc: job.ctc ? (typeof job.ctc === 'object' ? (job.ctc.min === job.ctc.max ? `${job.ctc.min / 100000}` : `${job.ctc.min / 100000}-${job.ctc.max / 100000}`) : (job.ctc > 500 ? job.ctc / 100000 : job.ctc)) : '',
					vacancies: job.vacancies || '',
					applicationLimit: job.applicationLimit || '',
					jobDescription: job.description || '',
					rolesAndResponsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
					education: Array.isArray(job.education) ? job.education : (job.education ? [job.education] : []),
					educationSpecializations: normalizeJobEducationSpecializations(
						job.educationSpecializations,
						Array.isArray(job.education) ? job.education : (job.education ? [job.education] : [])
					),
					backlogsAllowed: job.backlogsAllowed || false,
					requiredSkills: job.requiredSkills || [],
					preferredLanguages: job.preferredLanguages || [],
					experienceLevel: job.experienceLevel || 'freshers',
					minExperience: job.minExperience || '',
					maxExperience: job.maxExperience || '',
					interviewRoundsCount: job.interviewRoundsCount || '',
					interviewRoundTypes: job.interviewRoundTypes || {
						technical: false,
						managerial: false,
						nonTechnical: false,
						final: false,
						hr: false,
					},
					interviewRoundDetails: (() => {
						const details = { ...formData.interviewRoundDetails };
						
						// If we have rounds in the new format, use them to populate details
						if (job.interviewRounds && job.interviewRounds.length > 0) {
							job.interviewRounds.forEach(round => {
								if (round.key) {
									details[round.key] = {
										description: round.description || '',
										fromDate: round.fromdate ? new Date(round.fromdate).toISOString().split('T')[0] : '',
										startTime: round.startTime || '',
										endTime: round.endTime || '',
										customType: round.name,
										assessmentId: round.assessmentId?._id || round.assessmentId || ''
									};
								}
							});
						} else if (job.interviewRoundDetails) {
							// Fallback to old format
							const oldDetails = job.interviewRoundDetails;
							Object.keys(oldDetails).forEach(key => {
								if (oldDetails[key]) {
									details[key] = {
										...oldDetails[key],
										assessmentId: oldDetails[key].assessmentId?._id || oldDetails[key].assessmentId || '',
										fromDate: oldDetails[key].fromDate ? new Date(oldDetails[key].fromDate).toISOString().split('T')[0] : ''
									};
								}
							});
						}
						return details;
					})(),
					interviewRoundOrder: job.interviewRoundOrder || [],
					offerLetterDate: job.offerLetterDate ? job.offerLetterDate.split('T')[0] : '',
					joiningDate: job.joiningDate ? job.joiningDate.split('T')[0] : '',
					lastDateOfApplication: job.lastDateOfApplication ? job.lastDateOfApplication.split('T')[0] : '',
					lastDateOfApplicationTime: '',
					transportation: job.transportation || {
						oneWay: false,
						twoWay: false,
						noCab: false,
					},
					interviewMode: job.interviewMode || {
						faceToFace: false,
						phone: false,
						videoCall: false,
						documentVerification: false,
					},
					companyLogo: job.companyLogo || '',
					companyBanner: job.companyBanner || '',
					companyName: job.companyName || '',
					companyDescription: job.companyDescription || '',
					aboutCompany: job.aboutCompany || '',
					category: job.category || '',
					shift: job.shift || '',
					workMode: job.workMode || ''
				});

				// Keep legacy selectedAssessment only for single-assessment jobs/edit flows
				if (job.assessmentId) {
					setSelectedAssessment(job.assessmentId._id || job.assessmentId);
				}
				
				// Load assessment dates into interview round details if they exist
				if (job.assessmentStartDate) {
					const assessmentRoundKey = job.interviewRoundOrder?.find(key => job.interviewRoundTypes?.[key] === 'assessment');
					if (assessmentRoundKey) {
						setFormData(prev => ({
							...prev,
							interviewRoundDetails: {
								...prev.interviewRoundDetails,
								[assessmentRoundKey]: {
									...prev.interviewRoundDetails[assessmentRoundKey],
									fromDate: job.assessmentStartDate ? new Date(job.assessmentStartDate).toISOString().split('T')[0] : '',
									startTime: job.assessmentStartTime || prev.interviewRoundDetails[assessmentRoundKey]?.startTime || '',
									endTime: job.assessmentEndTime || prev.interviewRoundDetails[assessmentRoundKey]?.endTime || ''
								}
							}
						}));
					}
				}
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			displayError(error, { useToast: true });
		}
	};

	const fetchEmployerType = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/profile', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			if (data.success && data.profile?.employerId) {
				const empType = data.profile.employerId.employerType || 'company';
				const empCategory = data.profile.employerCategory;
				
				
				// Check both employerType and employerCategory
				const finalType = (empType === 'consultant' || empCategory === 'consultancy') ? 'consultant' : 'company';
				
				setEmployerType(finalType);
				// For consultants, check if they have default company info in profile
				if (empType === 'consultant' && data.profile.consultantCompanyName) {
					setFormData((current) => ({
						...current,
						companyLogo: current.companyLogo || data.profile.consultantCompanyLogo || '',
						companyBanner: current.companyBanner || data.profile.consultantCompanyBanner || '',
						companyName: current.companyName || data.profile.consultantCompanyName || '',
						companyDescription: current.companyDescription || data.profile.consultantCompanyDescription || '',
						aboutCompany: current.aboutCompany || data.profile.consultantAboutCompany || ''
					}));
				}
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch employer type:', error);
		}
	};



	/* Skills logic - now handled by dropdown */
	const removeSkill = (skill) =>
		update({
			requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
		});

	const addSkill = () => {};

	/* Toggle nested checkbox groups */
	const toggleNested = (group, key) => {
		if (group === 'interviewRoundTypes') {
			setFormData((s) => {
				const isCurrentlyChecked = s[group][key];
				let newOrder = [...s.interviewRoundOrder];
				
				if (isCurrentlyChecked) {
					// Remove from order if unchecking
					newOrder = newOrder.filter(item => item !== key);
				} else {
					// Add to order if checking
					newOrder.push(key);
				}
				
				return {
					...s,
					[group]: { ...s[group], [key]: !s[group][key] },
					interviewRoundOrder: newOrder
				};
			});
		} else {
			setFormData((s) => ({
				...s,
				[group]: { ...s[group], [key]: !s[group][key] },
			}));
		}
	};

	/* Update interview round details */
	const updateRoundDetails = async (roundType, field, value, skipHolidayConfirmation = false) => {
		if ((field === 'fromDate' || field === 'toDate') && value) {
			const normalizedDate = normalizeToYMD(value);
			if (normalizedDate) value = normalizedDate;
		}

		// Validate interview date rules for start date
		if (field === 'fromDate' && value) {
			const isAssessment = formData.interviewRoundTypes[roundType] === 'assessment';
			const currentRoundIndex = formData.interviewRoundOrder.indexOf(roundType);
			const minAllowedInterviewDate = getMinDateForRoundFromState(formData, roundType);
			const applicationMinDate = getAssessmentMinDate(formData.lastDateOfApplication);

			if (minAllowedInterviewDate && value < minAllowedInterviewDate) {
				if (currentRoundIndex <= 0 && applicationMinDate === minAllowedInterviewDate) {
					showError(`${isAssessment ? 'Assessment' : 'Interview'} date must be on or after the Last Date of Application. Please select ${formatDate(minAllowedInterviewDate)} or later.`);
				} else {
					showError(`Interview date must be on or after ${formatDate(minAllowedInterviewDate)}.`);
				}
				return;
			}

			for (let i = 0; i < formData.interviewRoundOrder.length; i++) {
				if (i === currentRoundIndex) continue;
				const otherRoundKey = formData.interviewRoundOrder[i];
				const otherRoundDetails = formData.interviewRoundDetails[otherRoundKey];
				if (otherRoundDetails?.fromDate === value) {
					showWarning(`This date clashes with Stage ${i + 1}. Please choose a different date.`);
					return;
				}
			}

		}

		// Holiday confirmation for interview dates (start or end date)
		if ((field === 'fromDate' || field === 'toDate') && value && !skipHolidayConfirmation) {
			const holidayCheck = await holidaysApi.checkHoliday(value);
			const localHolidayName = getLocalHolidayName(value);
			const isWeekend = isWeekendDate(value);
			const isHolidayLikeFromApi = Boolean(
				holidayCheck?.success && (holidayCheck.isHoliday || holidayCheck.isNonWorkingDay || holidayCheck.isWeekend)
			);
			const shouldConfirmHoliday = isHolidayLikeFromApi || Boolean(localHolidayName) || isWeekend;

			if (shouldConfirmHoliday) {
				showConfirmation(
					getHolidayConfirmationMessage(
						field === 'fromDate' ? 'interview start date' : 'interview end date',
						{
							scheduling: true,
							reminder: 'Please also ensure the last date of application is updated accordingly.'
						}
					),
					() => updateRoundDetails(roundType, field, value, true),
					null,
					'warning',
					{ confirmText: 'Yes, Continue', cancelText: 'No' }
				);
				return;
			}
		}

		// Ensure the roundType exists in interviewRoundDetails
		setFormData(s => {
			let updatedValue = value;
			let additionalUpdates = {};



			// Validate date constraints when fromDate is changed
			if (field === 'fromDate' && value) {
				const isAssessmentRound = s.interviewRoundTypes[roundType] === 'assessment';
				const currentRoundIndex = s.interviewRoundOrder.indexOf(roundType);
				const minAllowedInterviewDate = getMinDateForRoundFromState(s, roundType);
				const applicationMinDate = getAssessmentMinDate(s.lastDateOfApplication);

				if (minAllowedInterviewDate && value < minAllowedInterviewDate) {
					if (currentRoundIndex <= 0 && applicationMinDate === minAllowedInterviewDate) {
						showWarning(`${isAssessmentRound ? 'Assessment' : 'Interview'} date must be on or after the Last Date of Application. Please select ${formatDate(minAllowedInterviewDate)} or later.`);
					} else {
						showWarning(`Interview date must be on or after ${formatDate(minAllowedInterviewDate)}.`);
					}
					return s;
				}

				// Check for overlapping dates with other rounds (sanity check)
				for (let i = 0; i < s.interviewRoundOrder.length; i++) {
					if (i === currentRoundIndex) continue;
					const otherRoundKey = s.interviewRoundOrder[i];
					const otherRoundDetails = s.interviewRoundDetails[otherRoundKey];
					if (otherRoundDetails?.fromDate === value) {
						showWarning(`This date clashes with Stage ${i + 1}. Please choose a different date.`);
						return s;
					}
				}
			}



			// Auto-calculate end time for assessments if startTime is changed
			if ((s.interviewRoundTypes[roundType] === 'assessment' || roundType === 'assessment' || String(roundType).startsWith('assessment_')) && field === 'startTime' && value) {
				const currentAssessmentId = s.interviewRoundDetails?.[roundType]?.assessmentId || selectedAssessment || s.assignedAssessment || s.assessmentId;
				if (currentAssessmentId) {
					const assessment = availableAssessments.find(a => (a._id === currentAssessmentId || a.id === currentAssessmentId));
					const duration = assessment?.timer || assessment?.timeLimit || assessment?.duration || assessment?.totalTime;
					
					if (duration) {
						try {
							const [hours, mins] = value.split(':').map(Number);
							if (!isNaN(hours) && !isNaN(mins)) {
								const date = new Date();
								date.setHours(hours);
								date.setMinutes(mins + parseInt(duration));
								const calculatedEndTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
								additionalUpdates.endTime = calculatedEndTime;
								console.log(`Auto-calculated assessment end time: ${calculatedEndTime} based on ${duration} min duration`);
							}
						} catch (e) {
							console.error('Error calculating end time:', e);
						}
					}
				}
			}

			// Auto-set toDate to fromDate if fromDate is changed
			if (field === 'fromDate' && value) {
				additionalUpdates.toDate = value;
			}

			const updatedDetails = {
				...s.interviewRoundDetails,
				[roundType]: {
					...s.interviewRoundDetails[roundType],
					[field]: updatedValue,
					...additionalUpdates
				}
			};

			// Propagate dates to subsequent rounds if fromDate or toDate changed
			if (field === 'fromDate' || field === 'toDate' || additionalUpdates.toDate) {
				const roundIndex = s.interviewRoundOrder.indexOf(roundType);
				if (roundIndex !== -1) {
					for (let i = roundIndex + 1; i < s.interviewRoundOrder.length; i++) {
						const prevKey = s.interviewRoundOrder[i - 1];
						const currentKey = s.interviewRoundOrder[i];
						const prevEndDate = updatedDetails[prevKey].toDate || updatedDetails[prevKey].fromDate;
						
						if (prevEndDate) {
							const nextDate = getNextDayDateString(prevEndDate);
							// Always set to next day to ensure consecutive scheduling
							updatedDetails[currentKey] = {
								...updatedDetails[currentKey],
								fromDate: nextDate,
								toDate: nextDate // Reset to 1 day by default
							};
							
							// Note: We don't automatically regenerate subStages here as that might be disruptive
							// But the main dates will be correctly set for the "next day only" rule
						}
					}
				}
			}
			
			// Log the update for debugging
			console.log(`Updated ${roundType} ${field}:`, value);
			console.log('Updated interview round details:', updatedDetails);
			
			return {
				...s,
				interviewRoundDetails: updatedDetails
			};
		});

	};

	const handleAssessmentRoundSelection = (roundKey, newAssessmentId) => {
		if (!newAssessmentId) return;

		// Check if the same assessment is already selected in another round
		const duplicateRoundKey = formData.interviewRoundOrder.find(
			(key) =>
				key !== roundKey &&
				formData.interviewRoundTypes[key] === 'assessment' &&
				formData.interviewRoundDetails?.[key]?.assessmentId === newAssessmentId
		);

		if (duplicateRoundKey) {
			const duplicateStage = formData.interviewRoundOrder.indexOf(duplicateRoundKey) + 1;
			const assessmentLabel = formatAssessmentOptionLabel(
				availableAssessments.find((a) => getAssessmentOptionId(a) === newAssessmentId),
				employerType
			);
			showWarning(
				`"${assessmentLabel}" is already selected in Stage ${duplicateStage}. Please choose a different assessment for this round.`
			);
			return;
		}

		showConfirmation(
			'Once this assessment is selected, you will not be able to edit or delete it from Create Assessment. Do you want to proceed?',
			() => {
				setSelectedAssessment(newAssessmentId);
				updateRoundDetails(roundKey, 'assessmentId', newAssessmentId);

				const assessment = availableAssessments.find(
					(item) => getAssessmentOptionId(item) === newAssessmentId
				);
				const duration = assessment?.timer || assessment?.timeLimit || assessment?.duration || assessment?.totalTime;

				if (duration) {
					setFormData((prev) => {
						const newDetails = { ...prev.interviewRoundDetails };
						const startTime = newDetails[roundKey]?.startTime;
						if (!startTime) {
							return prev;
						}

						const [hours, mins] = startTime.split(':').map(Number);
						if (isNaN(hours) || isNaN(mins)) {
							return prev;
						}

						const date = new Date();
						date.setHours(hours);
						date.setMinutes(mins + parseInt(duration, 10));
						const endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
						newDetails[roundKey] = { ...newDetails[roundKey], endTime };

						return { ...prev, interviewRoundDetails: newDetails };
					});
				}

				const currentDetails = formData.interviewRoundDetails[roundKey];
				if (currentDetails?.fromDate && currentDetails?.startTime && currentDetails?.endTime) {
					showInfo(`Assessment scheduled on ${formatDate(currentDetails.fromDate)} from ${formatTimeToAMPM(currentDetails.startTime)} to ${formatTimeToAMPM(currentDetails.endTime)}`, 4000);
				} else {
					showInfo('Please set assessment date and time below to complete the schedule.', 3000);
				}
			},
			null,
			'warning',
			{ confirmText: 'Yes', cancelText: 'No' }
		);
	};

	const generateSubStagesForDays = (uniqueKey, dayCount) => {
		const details = formData.interviewRoundDetails[uniqueKey];
		const startDate = details?.fromDate;

		if (!startDate || !dayCount || dayCount <= 0) {
			return;
		}

		const subStages = [];
		let lastDate = startDate;
		
		for (let i = 0; i < dayCount; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);
			const dateString = date.toISOString().split('T')[0];
			lastDate = dateString;

			subStages.push({
				id: `${uniqueKey}_sub_${Date.now()}_${i}`,
				fromDate: dateString,
				startTime: '',
				endTime: '',
				breakTime: 0
			});
		}

		setFormData(prev => ({
			...prev,
			interviewRoundDetails: {
				...prev.interviewRoundDetails,
				[uniqueKey]: {
					...prev.interviewRoundDetails[uniqueKey],
					subStages: subStages,
					toDate: lastDate
				}
			}
		}));

		showSuccess(`Added ${dayCount} day${dayCount > 1 ? 's' : ''} for scheduling`);
	};

	const handleLogoUpload = async (event) => {
		const inputElement = event.target;
		const file = inputElement.files?.[0];

		if (!file) return;

		try {
			await validateConsultantImage(file, 'companyLogo');
			setLogoFile(file);
			const dataUrl = await fileToDataURL(file);
			await openLogoResizer(dataUrl, (processedImage) => {
				update({ companyLogo: processedImage });
			});
		} catch (error) {
			showWarning(error.message || 'Unable to process the company logo.');
		} finally {
			inputElement.value = '';
		}
	};

	const handleBannerUpload = async (event) => {
		const inputElement = event.target;
		const file = inputElement.files?.[0];

		if (!file) return;

		try {
			await validateConsultantImage(file, 'companyBanner');
			const dataUrl = await fileToDataURL(file);
			await openBannerResizer(dataUrl, (processedImage) => {
				update({ companyBanner: processedImage });
			});
		} catch (error) {
			showWarning(error.message || 'Unable to process the company banner.');
		} finally {
			inputElement.value = '';
		}
	};

	const fieldLabelMap = {
		jobTitle: 'Job Title',
		category: 'Job Category',
		jobType: 'Job Type',
		workMode: 'Work Mode',
		shift: 'Work Shift',
		ctc: 'CTC',
		netSalary: 'Net Salary',
		jobLocation: 'Job Location',
		vacancies: 'Number of Vacancies',
		applicationLimit: 'Application Limit',
		education: 'Education',
		requiredSkills: 'Required Skills',
		interviewRoundsCount: 'Number of Interview Rounds',
		offerLetterDate: 'Offer Letter Date',
		lastDateOfApplication: 'Last Date of Application',
		jobDescription: 'Job Description',
		rolesAndResponsibilities: 'Roles and Responsibilities',
		minExperience: 'Minimum Experience',
		maxExperience: 'Maximum Experience',
		transportation: 'Transportation',
		companyName: 'Company Name',
		aboutCompany: 'About Company',
		companyDescription: 'Company Description',
		companyBanner: 'Company Banner'
	};

	const scrollToField = (fieldName) => {
		setTimeout(() => {
			const el =
				document.querySelector(`[data-field="${fieldName}"]`) ||
				document.querySelector(`[name="${fieldName}"]`) ||
				document.getElementById(fieldName);
			if (!el) return;
			const y = el.getBoundingClientRect().top + window.scrollY - 120;
			window.scrollTo({ top: y, behavior: 'smooth' });
		}, 50);
	};

	const extractPlainText = (htmlContent) => {
		if (!htmlContent) return '';
		try {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlContent;
			return tempDiv.textContent || tempDiv.innerText || '';
		} catch (e) {
			return htmlContent;
		}
	};

	const validateStep1 = () => {
		const newErrors = {};
		const errorMessages = [];

		// Check for CTC format error
		if (ctcFormatError) {
			newErrors.ctc = [ctcFormatError];
		}

		// Validation rules for step 1
		const step1Rules = { ...validationRules };
		
		const basicErrors = validateForm(formData, step1Rules);
		// We only care about step 1 errors here
		const step1Fields = [
			'jobTitle', 'category', 'jobType', 'workMode', 'shift', 
			'ctc', 'netSalary', 'jobLocation', 'vacancies', 'applicationLimit', 
			'education', 'requiredSkills',
			'jobDescription', 'rolesAndResponsibilities'
		];
		
		Object.keys(basicErrors).forEach(key => {
			if (step1Fields.includes(key)) {
				newErrors[key] = basicErrors[key];
			}
		});

		// Custom validation for CTC max value
		if (formData.ctc) {
			const ctcParts = String(formData.ctc).split('-');
			const maxCtcVal = parseFloat(ctcParts[ctcParts.length - 1]);
			if (!isNaN(maxCtcVal) && maxCtcVal > 500) {
				newErrors.ctc = ['CTC cannot exceed 500 lakhs'];
			}
		}

		// Custom validation for job title
		if (formData.jobTitle === 'Other - Specify' || (formData.jobTitle && formData.jobTitle.trim().length < 3)) {
			newErrors.jobTitle = ['Please enter a valid job title (minimum 3 characters)'];
		}

		// Custom validation for job category
		if (formData.category === 'Other - Specify' || (formData.category && formData.category.trim().length < 2)) {
			newErrors.category = ['Please enter a valid job category (minimum 2 characters)'];
		}

		// Custom validations
		if (formData.experienceLevel === 'minimum') {
			if (!formData.minExperience || parseInt(formData.minExperience) < 0) {
				newErrors.minExperience = ['Please enter valid minimum experience'];
			}
			if (formData.maxExperience && parseInt(formData.maxExperience) < parseInt(formData.minExperience)) {
				newErrors.maxExperience = ['Maximum experience cannot be less than minimum experience'];
			}
		}

		if (employerType === 'consultant') {
			if (!formData.companyName || formData.companyName.trim().length < 2) {
				newErrors.companyName = ['Please enter a valid company name (minimum 2 characters)'];
			}
			if (!formData.aboutCompany || formData.aboutCompany.trim().length < 10) {
				newErrors.aboutCompany = ['Please enter about company information (minimum 10 characters)'];
			}
			if (!formData.companyDescription || formData.companyDescription.trim().length < 10) {
				newErrors.companyDescription = ['Please enter why join us information (minimum 10 characters)'];
			}
		}

		if (!formData.transportation.oneWay && !formData.transportation.twoWay && !formData.transportation.noCab) {
			newErrors.transportation = ['Please select a transportation option'];
		}

		// Explicit validation for Job Description (extract plain text from HTML)
		const jobDescriptionPlainText = extractPlainText(formData.jobDescription).trim();
		if (!jobDescriptionPlainText || jobDescriptionPlainText.length === 0) {
			newErrors.jobDescription = ['Job Description is required'];
		} else if (jobDescriptionPlainText.length < 50) {
			newErrors.jobDescription = [`Job Description must be at least 50 characters (currently ${jobDescriptionPlainText.length})`];
		}

		// Explicit validation for Roles and Responsibilities (extract plain text from HTML)
		const rolesPlainText = extractPlainText(formData.rolesAndResponsibilities).trim();
		if (!rolesPlainText || rolesPlainText.length === 0) {
			newErrors.rolesAndResponsibilities = ['Roles and Responsibilities is required'];
		} else if (rolesPlainText.length < 50) {
			newErrors.rolesAndResponsibilities = [`Roles and Responsibilities must be at least 50 characters (currently ${rolesPlainText.length})`];
		}

		// Logical date validation for Step 1
		if (formData.offerLetterDate && formData.lastDateOfApplication) {
			const offerDate = new Date(formData.offerLetterDate);
			const lastAppDate = new Date(formData.lastDateOfApplication);
		}

		setErrors(newErrors);
		return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
	};

	const validateStep2 = () => {
		const errorMessages = [];
		const isSchedulingMeeting = hasSchedulableInterviewType();
		const newErrors = { ...errors };

		// Validate Interview Rounds Count using basic rules
		const basicErrors = validateForm(formData, validationRules);
		if (basicErrors.offerLetterDate) {
			newErrors.offerLetterDate = basicErrors.offerLetterDate;
			errorMessages.push(basicErrors.offerLetterDate[0]);
		} else {
			delete newErrors.offerLetterDate;
		}
		if (basicErrors.lastDateOfApplication) {
			newErrors.lastDateOfApplication = basicErrors.lastDateOfApplication;
			errorMessages.push(basicErrors.lastDateOfApplication[0]);
		} else {
			delete newErrors.lastDateOfApplication;
		}
		if (basicErrors.interviewRoundsCount) {
			newErrors.interviewRoundsCount = basicErrors.interviewRoundsCount;
			errorMessages.push(basicErrors.interviewRoundsCount[0]);
		} else {
			delete newErrors.interviewRoundsCount;
		}
		setErrors(newErrors);

		// Validate Interview Rounds Count vs Selection
		const specifiedRoundsCount = parseInt(formData.interviewRoundsCount) || 0;
		const selectedRoundsCount = formData.interviewRoundOrder.length;
		
		if (specifiedRoundsCount > 0 && selectedRoundsCount !== specifiedRoundsCount) {
			errorMessages.push(`You mentioned ${formatCountLabel(specifiedRoundsCount, 'interview round')} but selected ${formatCountLabel(selectedRoundsCount, 'round')}.`);
		}

		// Logical date validation for Step 2
		const lastAppDate = formData.lastDateOfApplication ? new Date(formData.lastDateOfApplication) : null;
		const allRoundDates = [];
		const roundDatesMap = {}; // Track dates for each round

		// Validate all selected interview rounds (including assessment rounds)
		const selectedRounds = formData.interviewRoundOrder;

		for (const uniqueKey of selectedRounds) {
			const roundType = formData.interviewRoundTypes[uniqueKey];
			const details = formData.interviewRoundDetails[uniqueKey];
			const roundNames = {
				technical: 'Technical',
				managerial: 'Managerial Round',
				hr: 'HR Round',
				oneOnOnePanel: 'One-on-One / Panel',
				group: 'Group',
				situational: 'Situational / Behavioral',
				assessment: 'Assessment',
				others: 'Others – Specify.'
			};
			const customType = roundType === 'others' ? details?.customType : null;
			const roundName = (roundType === 'others' && customType && customType.trim()) ? customType : (roundNames[roundType] || roundType);

			// Validate description for non-assessment rounds
			if (!details?.description?.trim() && roundType !== 'assessment') {
				errorMessages.push(`Please enter description for ${roundName}`);
			}
			
			// Validate date for all rounds (including assessment)
			if (!details?.fromDate) {
				errorMessages.push(`Please select Date for ${roundName}`);
			} else {
				const roundDate = new Date(details.fromDate);
				const dateStr = details.fromDate;
				const currentRoundIndex = selectedRounds.indexOf(uniqueKey);
				allRoundDates.push(roundDate);
				const minAllowedInterviewDate = getMinDateForRoundFromState(formData, uniqueKey);
				const applicationMinDate = getAssessmentMinDate(formData.lastDateOfApplication);
				if (minAllowedInterviewDate && dateStr < minAllowedInterviewDate) {
					if (currentRoundIndex <= 0 && applicationMinDate === minAllowedInterviewDate) {
						errorMessages.push(`${roundName} must be scheduled on or after the Last Date of Application. Select ${formatDate(minAllowedInterviewDate)} or later.`);
					} else {
						errorMessages.push(`${roundName} date must be on or after ${formatDate(minAllowedInterviewDate)}.`);
					}
				}
				
				// Check for duplicate dates with previous rounds (skip for scheduling meeting types)
				if (!isSchedulingMeeting && roundDatesMap[dateStr]) {
					errorMessages.push(`${roundName} cannot be scheduled on ${formatDate(dateStr)} as it conflicts with ${roundDatesMap[dateStr]}`);
				} else {
					roundDatesMap[dateStr] = roundName;
				}
			}
			
			// Validate start time only for assessment round
			if (!details?.startTime && roundType === 'assessment') {
				errorMessages.push(`Please select Start Time for ${roundName}`);
			}
			
			// Validate end time only for assessment round
			if (!details?.endTime && roundType === 'assessment') {
				errorMessages.push(`Please select End Time for ${roundName}`);
			}
			
			// Validate sub-stages if they exist
			if (details?.subStages && Array.isArray(details.subStages) && details.subStages.length > 0) {
				details.subStages.forEach((subStage, index) => {
					if (!subStage.fromDate) {
						errorMessages.push(`Please select Date for ${roundName} - Day ${index + 1}`);
					} else if (lastAppDate) {
						const minAllowedInterviewDate = getMinDateForSubStage(uniqueKey, index);
						if (subStage.fromDate < minAllowedInterviewDate) {
							const applicationMinDate = getAssessmentMinDate(formData.lastDateOfApplication);
							if (index === 0 && minAllowedInterviewDate === applicationMinDate) {
								errorMessages.push(`${roundName} - Day ${index + 1} must be scheduled on or after the Last Date of Application. Select ${formatDate(minAllowedInterviewDate)} or later.`);
							} else {
								errorMessages.push(`${roundName} - Day ${index + 1} date must be on or after ${formatDate(minAllowedInterviewDate)}.`);
							}
						}
					}
					if (!subStage.startTime) {
						errorMessages.push(`Please select Start Time for ${roundName} - Day ${index + 1}`);
					}
					if (!subStage.endTime) {
						errorMessages.push(`Please select End Time for ${roundName} - Day ${index + 1}`);
					}
					
				});
			}
		}

		// Each assessment round needs its own assigned assessment
		formData.interviewRoundOrder
			.filter((key) => formData.interviewRoundTypes[key] === 'assessment')
			.forEach((assessmentKey, assessmentIndex) => {
				if (!formData.interviewRoundDetails?.[assessmentKey]?.assessmentId) {
					errorMessages.push(`Please select an assessment for Assessment ${assessmentIndex + 1}.`);
				}
			});

		// Validate Offer Letter Date vs Interview Rounds
		if (formData.offerLetterDate && allRoundDates.length > 0) {
			const latestRoundDate = new Date(Math.max(...allRoundDates));
			const offerDate = new Date(formData.offerLetterDate);
			
			if (offerDate < latestRoundDate) {
				errorMessages.push(`Offer letter date (${formData.offerLetterDate}) must be on or after the last interview round (${latestRoundDate.toISOString().split('T')[0]})`);
			}
		}

		setGlobalErrors(errorMessages);
		return { valid: errorMessages.length === 0, errors: errorMessages };
	};

	const validateJobForm = () => {
		const { valid: s1, errors: step1Errors } = validateStep1();
		const { valid: s2, errors: step2Errors } = validateStep2();
		return { valid: s1 && s2, step1Errors, step2Errors };
	};
	const hasSchedulableInterviewType = () => {
		return formData.interviewRoundOrder.some(key => 
			formData.interviewRoundTypes[key] === 'oneOnOnePanel' || 
			formData.interviewRoundTypes[key] === 'group' ||
			String(formData.interviewRoundTypes[key]).toLowerCase().includes('group')
		);
	};

	const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

	const hasDbScheduleData = (round = {}) => {
		const scheduleObject = round.scheduleObject || round.schedule || {};
		const nestedSchedule = scheduleObject.schedule || {};

		const schedules = round.schedulesArray || round.schedules || scheduleObject.schedulesArray || scheduleObject.schedules || nestedSchedule.schedules;
		const daySchedules = round.daySchedulesArray || round.daySchedules || scheduleObject.daySchedulesArray || scheduleObject.daySchedules || nestedSchedule.daySchedules;
		const rooms = round.roomsArray || round.rooms || scheduleObject.roomsArray || scheduleObject.rooms || nestedSchedule.rooms;
		const subStages = round.subStages || round.subStagesArray || [];
		const hasTimedSubStages = Array.isArray(subStages) && subStages.some((sub) =>
			(sub?.fromDate || sub?.fromdate || sub?.date) && sub?.startTime && sub?.endTime
		);

		return isNonEmptyArray(schedules) || isNonEmptyArray(daySchedules) || isNonEmptyArray(rooms) || hasTimedSubStages;
	};

	const verifyDbInterviewScheduling = async () => {
		const activeJobId = currentJobId || id;
		if (!activeJobId) return false;

		const token = localStorage.getItem('employerToken');
		if (!token) return false;

		const data = await safeApiCall(`http://localhost:5000/api/employer/jobs/${activeJobId}`, {
			headers: { 'Authorization': `Bearer ${token}` }
		});

		const requiredNonAssessmentCount = (formData.interviewRoundOrder || []).filter(
			(key) => String(formData.interviewRoundTypes?.[key] || '').toLowerCase() !== 'assessment'
		).length;
		if (requiredNonAssessmentCount === 0) {
			return true;
		}

		const dbRounds = data?.job?.interviewRounds || [];
		const scheduledNonAssessmentCount = dbRounds.filter((round) =>
			String(round?.roundType || '').toLowerCase() !== 'assessment' && hasDbScheduleData(round)
		).length;

		return scheduledNonAssessmentCount >= requiredNonAssessmentCount;
	};


	const handleSubmitClick = async () => {
		if (isSubmitting) return;
		
		// Check for CTC format error first
		if (ctcFormatError) {
			showWarning(ctcFormatError);
			scrollToField('ctc');
			return;
		}
		
		// Validate form first
		const { valid: isValid, step1Errors, step2Errors } = validateJobForm();
		if (!isValid) {
			// Show error message to user with field label
			if (step1Errors && Object.keys(step1Errors).length > 0) {
				const firstField = Object.keys(step1Errors)[0];
				const errorMessage = step1Errors[firstField][0];
				const fieldLabel = fieldLabelMap[firstField] || firstField;
				
				showWarning(errorMessage);
				scrollToField(firstField);
			} else if (step2Errors && step2Errors.length > 0) {
				showWarning(step2Errors[0]);
				// Try to scroll to interview rounds section
				const interviewSection = document.querySelector('[data-step="2"]') || 
										 document.querySelector('[id*="interview"]');
				if (interviewSection) {
					interviewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
				} else {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}
			} else {
				showWarning('Please fill all required fields correctly before submitting.');
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
			return;
		}

		try {
			const hasScheduledDataInDb = await verifyDbInterviewScheduling();
			if (!hasScheduledDataInDb) {
				showWarning('Kindly complete the interview scheduling process before posting the job.');
				return;
			}
		} catch (error) {
			showError('Unable to verify interview schedule. Please try again.');
			return;
		}
		
		setShowConfirmModal(true);
	};
	
	const handlePrevious = () => {
		setCurrentStep(1);
		setSearchParams({ step: '1' });
		window.scrollTo(0, 0);
	};

	const handleNext = async () => {
		if (isSubmitting) return;

		// Validate step 1 fields
		const { valid: isStep1Valid, errors: step1Errors } = validateStep1();
		if (!isStep1Valid) {
			// Find first error field and scroll to it
			const errorFields = Object.keys(step1Errors);
			if (errorFields.length > 0) {
				const firstErrorField = errorFields[0];
				const errorMessage = step1Errors[firstErrorField]?.[0] || 'Invalid entry';
				const fieldLabel = fieldLabelMap[firstErrorField] || firstErrorField;
				
				showWarning(errorMessage);
				scrollToField(firstErrorField);
			} else {
				showWarning('Please fill all required fields correctly before moving to the next step.');
			}
			return;
		}

		try {
			const token = localStorage.getItem('employerToken');
			if (!token) {
				showWarning('Please login first');
				return;
			}

			setIsSubmitting(true);

			const jobData = {
				title: formData.jobTitle,
				location: formData.jobLocation,
				jobType: formData.jobType ? formData.jobType.toLowerCase().replace(/\s+/g, '-') : '',
				ctc: formData.ctc,
				netSalary: formData.netSalary,
				vacancies: parseInt(formData.vacancies) || 0,
				applicationLimit: parseInt(formData.applicationLimit) || 0,
				description: formData.jobDescription || 'Job description to be updated',
				rolesAndResponsibilities: formData.rolesAndResponsibilities || '',
				requiredSkills: formData.requiredSkills,
				preferredLanguages: formData.preferredLanguages,
				experienceLevel: formData.experienceLevel,
				minExperience: formData.minExperience ? parseInt(formData.minExperience) : 0,
				maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : 0,
				education: formData.education,
				educationSpecializations: normalizeJobEducationSpecializations(
					formData.educationSpecializations,
					formData.education
				),
				backlogsAllowed: formData.backlogsAllowed,
				offerLetterDate: formData.offerLetterDate || null,
				joiningDate: formData.joiningDate || null,
				lastDateOfApplication: formData.lastDateOfApplication || null,
				lastDateOfApplicationTime: null,
				transportation: formData.transportation,
				category: formData.category,
				shift: formData.shift,
				workMode: formData.workMode
			};

			if (employerType === 'consultant') {
				jobData.companyLogo = formData.companyLogo;
				jobData.companyBanner = formData.companyBanner;
				jobData.companyName = formData.companyName;
				jobData.companyDescription = formData.companyDescription;
				jobData.aboutCompany = formData.aboutCompany;
			}

			const url = isEditMode 
				? `http://localhost:5000/api/employer/jobs/${id}`
				: 'http://localhost:5000/api/employer/jobs';
			
			const method = isEditMode ? 'PUT' : 'POST';

			const data = await safeApiCall(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(jobData)
			});

			if (data.success) {
				const jobId = data.job?._id || data.jobId || id;
				setCurrentJobId(jobId);
				showSuccess(isEditMode ? 'Job information updated!' : 'Job information saved! Now set up the interview process.');
				
				// Move to step 2 and update URL if it's a new job
				if (!isEditMode) {
					navigate(`/employer/edit-job/${jobId}?step=2`);
				} else {
					setCurrentStep(2);
					setSearchParams({ step: '2' });
				}
				window.scrollTo(0, 0);
			} else {
				showError(data.message || `Failed to save job information`);
			}
		} catch (error) {
			const errorMessage = getErrorMessage(error, 'profile');
			showError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const submitNext = async () => {
		setShowConfirmModal(false);
		
		try {
			const token = localStorage.getItem('employerToken');
			if (!token) {
				showWarning('Please login first');
				return;
			}

			setIsSubmitting(true);

			// Extract the first assessment round for legacy top-level fields
			const assessmentRoundKeys = formData.interviewRoundOrder.filter(key => formData.interviewRoundTypes[key] === 'assessment');
			const assessmentRoundKey = assessmentRoundKeys[0] || null;
			const assessmentDetails = assessmentRoundKey ? formData.interviewRoundDetails[assessmentRoundKey] : null;
			
			// Map interview round details from unique keys to base round types
			const mappedInterviewRoundDetails = {};
			formData.interviewRoundOrder.forEach(uniqueKey => {
				const roundType = formData.interviewRoundTypes[uniqueKey];
				const details = formData.interviewRoundDetails[uniqueKey];
				if (roundType && details) {
					mappedInterviewRoundDetails[uniqueKey] = details;
				}
			});

			const jobData = {
				title: formData.jobTitle,
				location: formData.jobLocation,
				jobType: formData.jobType ? formData.jobType.toLowerCase().replace(/\s+/g, '-') : '',
				ctc: formData.ctc,
				netSalary: formData.netSalary,
				vacancies: parseInt(formData.vacancies) || 0,
				applicationLimit: parseInt(formData.applicationLimit) || 0,
				description: formData.jobDescription || 'Job description to be updated',
				rolesAndResponsibilities: formData.rolesAndResponsibilities || '',
				requiredSkills: formData.requiredSkills,
				preferredLanguages: formData.preferredLanguages,
				experienceLevel: formData.experienceLevel,
				minExperience: formData.minExperience ? parseInt(formData.minExperience) : 0,
				maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : 0,
				education: formData.education,
				educationSpecializations: normalizeJobEducationSpecializations(
					formData.educationSpecializations,
					formData.education
				),
				backlogsAllowed: formData.backlogsAllowed,
				interviewRoundsCount: parseInt(formData.interviewRoundsCount) || 0,
				interviewRoundTypes: formData.interviewRoundTypes,
				interviewRoundDetails: mappedInterviewRoundDetails,
				interviewRoundOrder: formData.interviewRoundOrder || [],
				assignedAssessment: assessmentRoundKeys.length === 1 ? (assessmentDetails?.assessmentId || selectedAssessment || null) : null,
				assessmentStartDate: assessmentDetails?.fromDate || null,
				assessmentEndDate: assessmentDetails?.fromDate || null,
				assessmentStartTime: assessmentDetails?.startTime || null,
				assessmentEndTime: assessmentDetails?.endTime || null,
				offerLetterDate: formData.offerLetterDate || null,
				lastDateOfApplication: formData.lastDateOfApplication || null,
				lastDateOfApplicationTime: null,
				transportation: formData.transportation,
				category: formData.category,
				shift: formData.shift,
				workMode: formData.workMode,
				companyLogo: formData.companyLogo,
				companyBanner: formData.companyBanner,
				companyName: formData.companyName,
				companyDescription: formData.companyDescription,
				status: 'active' // Set to active when posting job on Step 2
			};

			// Add consultant-specific fields if employer is consultant
			if (employerType === 'consultant') {
				console.log('Adding consultant fields:', {
					companyLogo: formData.companyLogo,
					companyBanner: formData.companyBanner,
					companyName: formData.companyName,
					companyDescription: formData.companyDescription,
					aboutCompany: formData.aboutCompany
				});
				jobData.companyLogo = formData.companyLogo;
				jobData.companyBanner = formData.companyBanner;
				jobData.companyName = formData.companyName;
				jobData.companyDescription = formData.companyDescription;
				jobData.aboutCompany = formData.aboutCompany;
			}

			

			const url = isEditMode 
				? `http://localhost:5000/api/employer/jobs/${id}`
				: 'http://localhost:5000/api/employer/jobs';
			
			const method = isEditMode ? 'PUT' : 'POST';

			const data = await safeApiCall(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(jobData)
			});

			if (data.success) {
				// Clear saved CTC from localStorage after successful submission
				localStorage.removeItem('draft_ctc');
				const jobId = data.job?._id || data.jobId || id;

				const successMsg = isEditMode ? 'Job updated successfully!' : 'Job posted successfully!';
				showSuccess(successMsg);
				
				setTimeout(() => {
					navigate('/employer/manage-jobs');
				}, 2000);
			} else {
				showError(data.message || `Failed to ${isEditMode ? 'update' : 'post'} job`);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			
			const errorMessage = getErrorMessage(error, 'profile');
			showError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	/* Inline style objects */
	const page = {
		padding: isMobile ? "10px 10px 15px 10px" : "10px 20px 30px 20px",
		maxWidth: 1200,
		margin: "0 auto",
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		background: "#f8f9fa",
		minHeight: "100vh",
	};
	const card = {
		background: "#fff",
		padding: isMobile ? "16px" : "32px",
		borderRadius: isMobile ? 8 : 12,
		boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
		marginBottom: isMobile ? 16 : 24,
	};
	const heading = {
		margin: 0,
		marginBottom: 8,
		fontSize: 24,
		color: "#1d1d1d",
		fontWeight: 600,
	};
	const sub = { 
		color: "#6b7280", 
		marginBottom: 24, 
		fontSize: 14,
		lineHeight: 1.5,
	};

	const grid = {
		display: "grid",
		gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
		gap: isMobile ? 16 : 24,
		alignItems: "start",
	};
	const fullRow = { gridColumn: "1 / -1" };
	const label = {
		display: "block",
		fontSize: 14,
		color: "#374151",
		marginBottom: 8,
		fontWeight: 500,
	};
	
	// Style for making asterisks red
	const redAsterisk = {
		color: "#dc2626", // Red color for asterisks
		fontWeight: "bold"
	};
	const input = {
		width: "100%",
		padding: isMobile ? "10px 12px" : "12px 14px",
		borderRadius: isMobile ? 6 : 8,
		border: "1px solid #d1d5db",
		background: "#fff",
		outline: "none",
		fontSize: isMobile ? 16 : 14, // Prevents zoom on iOS
		boxSizing: "border-box",
		transition: "all 0.2s ease",
	};
	const inputFocus = {
		borderColor: "#ff6b35",
		boxShadow: "0 0 0 3px rgba(255,107,53,0.1)",
	};
	const smallInput = { ...input, width: 180 };
	const plusBtn = {
		marginLeft: 10,
		width: 42,
		height: 42,
		borderRadius: 8,
		border: "none",
		background: "#ff6b35",
		color: "#fff",
		cursor: "pointer",
		fontSize: 20,
		lineHeight: 1,
		transition: "all 0.2s ease",
		fontWeight: 600,
	};
	const chip = {
		padding: "8px 14px",
		background: "#e7f3ff",
		borderRadius: 20,
		display: "inline-flex",
		gap: 8,
		alignItems: "center",
		fontSize: 13,
		fontWeight: 500,
		color: "#0066cc",
		border: "1px solid #b3d9ff",
	};
	const chipX = {
		marginLeft: 6,
		cursor: "pointer",
		color: "#ef4444",
		fontWeight: 700,
		fontSize: 16,
	};
	const sectionHeader = {
		margin: "40px 0 24px 0",
		fontSize: 20,
		color: "#1f2937",
		fontWeight: 700,
		paddingBottom: 16,
		display: "flex",
		alignItems: "center",
		gap: 12,
		letterSpacing: "-0.025em",
	};
	const compactSectionHeader = {
		...sectionHeader,
		margin: "40px 0 6px 0",
		paddingBottom: 0,
	};

	const gatePostJob = !isEditMode;
	const overTicketLimit = postJobAccess.candidateSupportTicketsCount > POST_JOB_TICKET_LIMIT;
	const needsPostingAccess = !postJobAccess.canPostJobs;
	const hasAccessError = Boolean(postJobAccess.error);
	const accessMessage = hasAccessError
		? postJobAccess.error
		: overTicketLimit
			? `Cannot post job: You have ${postJobAccess.candidateSupportTicketsCount} candidate support tickets. Please resolve them to below ${POST_JOB_TICKET_LIMIT}.`
			: postJobAccess.message || 'Account verification is in progress. Job posting will be available after approval requirements are complete.';

	if (gatePostJob && postJobAccess.loading) {
		return (
			<div style={page}>
				<div style={{ maxWidth: 620, margin: "120px auto", textAlign: "center", background: "#fff", padding: "32px", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
					<i className="fa fa-spinner fa-spin" style={{ fontSize: 32, color: "#ff6b35", marginBottom: 16 }}></i>
					<h3 style={{ margin: 0, color: "#1f2937" }}>Checking account status...</h3>
					<p style={{ marginTop: 8, color: "#6b7280" }}>Please wait while we verify your access.</p>
				</div>
			</div>
		);
	}

	if (gatePostJob && (hasAccessError || overTicketLimit || needsPostingAccess)) {
		return (
			<div style={page}>
				<div style={{ maxWidth: 720, margin: "100px auto", background: "#fff", padding: "32px", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
					<div style={{ textAlign: "center", marginBottom: 20 }}>
						<div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff4ee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
							<i className="fa fa-lock" style={{ fontSize: 28, color: "#ff6b35" }}></i>
						</div>
						<h2 style={{ margin: 0, color: "#1f2937", fontWeight: 700 }}>Job Posting Unavailable</h2>
						<p style={{ marginTop: 10, color: "#4b5563", lineHeight: 1.6 }}>{accessMessage}</p>
					</div>

					<div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
						{needsPostingAccess && (
							<button
								type="button"
								className="site-button"
								onClick={() => navigate(empRoute(employer.PROFILE))}
							>
								Go to Company Profile
							</button>
						)}
						{!needsPostingAccess && (
							<button
								type="button"
								className="site-button"
								onClick={() => navigate(empRoute(employer.MANAGE_JOBS))}
							>
								Back to Manage Interview
							</button>
						)}
						{overTicketLimit && (
							<button
								type="button"
								className="site-button"
								style={{ background: "#1f2937" }}
								onClick={() => navigate(empRoute(employer.SUPPORT_TICKETS))}
							>
								View Support Tickets
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={page}>
			{/* Header */}
			<div style={{marginBottom: 24}}>
				<h1 style={heading}>
					{currentStep === 2 ? (
						<><i className="fa fa-calendar-check" style={{color: '#ff6b35', marginRight: 12}}></i>Set Up Interview Process</>
					) : isEditMode ? (
						<><i className="fa fa-edit" style={{color: '#ff6b35', marginRight: 12}}></i>Edit Job Posting</>
					) : (
						<><i className="fa fa-plus-circle" style={{color: '#ff6b35', marginRight: 12}}></i>Post a New Job</>
					)}
				</h1>
				<p style={sub}>
					{currentStep === 2 
						? 'Define the interview rounds and schedule for this job posting.'
						: isEditMode 
							? 'Update your job posting details below. All fields marked with * are mandatory.'
							: 'Fill in the details below to create a new job posting. All fields marked with * are mandatory.'}
				</p>
			</div>

			{/* Step Indicator */}
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				marginBottom: 32,
				gap: 16
			}}>
				<div 
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '8px 16px',
						borderRadius: 30,
						background: currentStep === 1 ? '#ff6b35' : '#fff',
						color: currentStep === 1 ? '#fff' : '#6b7280',
						border: '2px solid',
						borderColor: currentStep === 1 ? '#ff6b35' : '#e5e7eb',
						cursor: 'default',
						fontWeight: 600,
						transition: 'all 0.2s ease',
						boxShadow: currentStep === 1 ? '0 4px 12px rgba(255,107,53,0.2)' : 'none'
					}}
				>
					<span style={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						background: currentStep === 1 ? '#fff' : (id ? '#10b981' : '#e5e7eb'),
						color: currentStep === 1 ? '#ff6b35' : '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 12
					}}>
						{id && currentStep === 2 ? <i className="fa fa-check"></i> : '1'}
					</span>
					Job Information
				</div>
				<div data-step-indicator-connector style={{ width: isMobile ? 20 : 40, height: 2, background: '#e5e7eb' }}></div>
				<div 
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						padding: '8px 16px',
						borderRadius: 30,
						background: currentStep === 2 ? '#ff6b35' : '#fff',
						color: currentStep === 2 ? '#fff' : '#6b7280',
						border: '2px solid',
						borderColor: currentStep === 2 ? '#ff6b35' : '#e5e7eb',
						cursor: 'default',
						fontWeight: 600,
						transition: 'all 0.2s ease',
						boxShadow: currentStep === 2 ? '0 4px 12px rgba(255,107,53,0.2)' : 'none'
					}}
				>
					<span style={{
						width: 24,
						height: 24,
						borderRadius: '50%',
						background: currentStep === 2 ? '#fff' : '#e5e7eb',
						color: currentStep === 2 ? '#ff6b35' : '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 12
					}}>2</span>
					Interview Process
				</div>
			</div>

			{/* Card */}
			<div style={card}>
				<div style={grid}>
					{globalErrors.length > 0 && (
						<div style={fullRow}>
							<GlobalErrorDisplay errors={globalErrors} />
						</div>
					)}
					{currentStep === 1 && (
						<>
						{/* Consultant Fields */}
					{employerType === 'consultant' && (
						<>
							<div style={fullRow}>
								<div style={{
									background: 'linear-gradient(135deg, #ee9f27 0%, #ffffff 100%)',
									padding: '16px 20px',
									borderRadius: 10,
									color: '#333',
									marginBottom: 8,
								}}>
									<h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
										<i className="fa fa-briefcase"></i>
										Approved Company Information (Consultant Mode)
									</h4>
									<p style={{margin: '6px 0 0 0', fontSize: 13, opacity: 0.9}}>
										Select from your approved authorization companies
									</p>
								</div>
								<div style={{
									display: 'flex',
									justifyContent: 'flex-start',
									marginBottom: 16
								}}>
									<button
										type="button"
										style={{
											background: '#ff6b35',
											color: 'white',
											border: 'none',
											padding: '10px 20px',
											borderRadius: 8,
											cursor: 'pointer',
											fontSize: 14,
											fontWeight: 600,
											transition: 'all 0.2s ease',
											display: 'flex',
											alignItems: 'center',
											gap: 8
										}}
										onClick={() => {
											window.location.href = '/employer/profile#hiring-companies';
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = '#e55a2b';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = '#ff6b35';
										}}
									>
										<i className="fa fa-plus"></i>
										Add New Company
									</button>
								</div>
							</div>
							<div style={fullRow}>
								<div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
									{/* Company Logo */}
									<div style={{ flex: 1, minWidth: 200 }}>
										<label style={label}>
											<i className="fa fa-image" style={{marginRight: '8px', color: '#ff6b35'}}></i>
											Company Logo
										</label>
										<input
											style={{...input, padding: '10px'}}
											type="file"
											accept=".jpg,.jpeg,.png"
											onChange={handleLogoUpload}
										/>
										<p style={{color: '#64748b', fontSize: 12, margin: '6px 0 0 0'}}>
											Upload opens the crop and resize editor before saving. Click the uploaded logo to preview it.
										</p>
										{formData.companyLogo && (
											<div style={{marginTop: 12}}>
												<button
													type="button"
													onClick={() => openImagePreview(getImagePreviewSrc(formData.companyLogo), 'Company Logo')}
													title="Preview company logo"
													aria-label="Preview company logo"
													style={{
														padding: 0,
														border: 'none',
														background: 'transparent',
														cursor: 'zoom-in',
														lineHeight: 0
													}}
												>
													<img
														src={getImagePreviewSrc(formData.companyLogo)}
														alt="Company Logo"
														style={{
															width: '80px',
															height: '80px',
															borderRadius: 8,
															objectFit: 'cover',
															boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
														}}
													/>
												</button>
												<div style={{marginTop: 10}}>
													<button
														type="button"
														onClick={() => openLogoResizer(getImagePreviewSrc(formData.companyLogo), (processedImage) => {
															update({ companyLogo: processedImage });
														})}
														style={{
															border: 'none',
															borderRadius: 8,
															background: '#fff7ed',
															color: '#c2410c',
															padding: '8px 12px',
															fontSize: 12,
															fontWeight: 600,
															cursor: 'pointer'
														}}
													>
														<i className="fa fa-crop" style={{marginRight: 6}}></i>
														Resize & Crop
													</button>
												</div>
											</div>
										)}
									</div>
									{/* Company Banner */}
									<div style={{ flex: 1, minWidth: 200 }}>
										<label style={label}>
											<i className="fa fa-picture-o" style={{marginRight: '8px', color: '#ff6b35'}}></i>
											Company Banner(1128x191px)
										</label>
										<input
											style={{...input, padding: '10px'}}
											type="file"
											accept=".jpg,.jpeg,.png"
											onChange={handleBannerUpload}
										/>
										<p style={{color: '#64748b', fontSize: 12, margin: '6px 0 0 0'}}>
											Upload opens the crop and resize editor before saving. Click the uploaded banner to preview it.
										</p>
										{formData.companyBanner && (
											<div style={{marginTop: 12}}>
												<button
													type="button"
													onClick={() => openImagePreview(getImagePreviewSrc(formData.companyBanner), 'Company Banner')}
													title="Preview company banner"
													aria-label="Preview company banner"
													style={{
														padding: 0,
														border: 'none',
														background: 'transparent',
														cursor: 'zoom-in',
														lineHeight: 0
													}}
												>
													<div
														style={{
															width: '320px',
															maxWidth: '100%',
															aspectRatio: '1128 / 191'
														}}
													>
														<img
															src={getImagePreviewSrc(formData.companyBanner)}
															alt="Company Banner"
															style={{
																width: '100%',
																height: '100%',
																display: 'block'
															}}
														/>
													</div>
												</button>
												<div style={{marginTop: 10}}>
													<button
														type="button"
														onClick={() => openBannerResizer(getImagePreviewSrc(formData.companyBanner), (processedImage) => {
															update({ companyBanner: processedImage });
														})}
														style={{
															border: 'none',
															borderRadius: 8,
															background: '#fff7ed',
															color: '#c2410c',
															padding: '8px 12px',
															fontSize: 12,
															fontWeight: 600,
															cursor: 'pointer'
														}}
													>
														<i className="fa fa-crop" style={{marginRight: 6}}></i>
														Resize & Crop
													</button>
												</div>
											</div>
										)}
										<p style={{color: '#64748b', fontSize: 12, margin: '6px 0 0 0'}}>
											This banner will be displayed on the public job details page. Please upload a vertical image.
										</p>
									</div>
								</div>
							</div>
							<div>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-building" style={{marginRight: '8px'}}></i>
									Company Name <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}></span>
								</label>
								{approvedCompanies.length > 0 ? (
									<select
										style={{
											...input, 
											borderColor: formData.companyName ? '#10b981' : '#dc2626',
											borderWidth: 2,
											cursor: 'pointer'
										}}
										value={formData.companyName}
										onChange={(e) => update({ companyName: e.target.value })}
										required
									>
										<option value="" disabled>Select Approved Company</option>
										{approvedCompanies.map((company, index) => (
											<option key={index} value={company}>
												{company}
											</option>
										))}
									</select>
								) : (
									<input
										style={{
											...input, 
											borderColor: formData.companyName ? '#10b981' : '#dc2626',
											borderWidth: 2,
										}}
										placeholder="e.g., Tech Solutions Inc."
										value={formData.companyName}
										onChange={(e) => update({ companyName: e.target.value })}
										required
									/>
								)}
								{!formData.companyName && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										{approvedCompanies.length > 0 ? 'Please select an approved company' : 'Please enter company name'}
									</p>
								)}
								{approvedCompanies.length > 0 && (
									<p style={{color: '#10b981', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-check-circle"></i>
										Showing {approvedCompanies.length} approved authorization companies
									</p>
								)}
							</div>
							<div style={fullRow}>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-building" style={{marginRight: '8px'}}></i>
									About Company <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}></span>
								</label>
								<textarea
									style={{
										...input, 
										minHeight: '100px',
										borderColor: formData.aboutCompany ? '#10b981' : '#dc2626',
										borderWidth: 2,
									}}
									placeholder="Brief description about the company, its history, mission, and what it does..."
									value={formData.aboutCompany}
									onChange={(e) => update({ aboutCompany: e.target.value })}
									required
								/>
								{!formData.aboutCompany && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										Please enter about company information
									</p>
								)}
							</div>
							<div style={fullRow}>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-info-circle" style={{marginRight: '8px'}}></i>
									Why Join Us <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}></span>
								</label>
								<textarea
									style={{
										...input, 
										minHeight: '100px',
										borderColor: formData.companyDescription ? '#10b981' : '#dc2626',
										borderWidth: 2,
									}}
									placeholder="Describe the company culture, benefits, growth opportunities, and what makes it unique..."
									value={formData.companyDescription}
									onChange={(e) => update({ companyDescription: e.target.value })}
									required
								/>
								{!formData.companyDescription && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										Please enter why join us information
									</p>
								)}
							</div>
						</>
					)}

					{/* Basic Job Information Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-info-circle" style={{color: '#ff6b35'}}></i>
							Basic Job Information
						</h3>
					</div>

					{/* Row 1 */}
					<div>
						<label style={label}>
							<i className="fa fa-briefcase" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Title / Designation <span style={redAsterisk}>*</span>
						</label>
						<div style={{position: 'relative'}}>
							<select
								style={{
									...input,
									borderColor: errors.jobTitle ? '#dc2626' : '#d1d5db',
									cursor: 'pointer'
								}}
								className={errors.jobTitle ? 'is-invalid' : ''}
								value={PREDEFINED_JOB_TITLES.includes(formData.jobTitle) ? formData.jobTitle : (formData.jobTitle === '' ? '' : 'Other - Specify')}
								onChange={(e) => {
									if (e.target.value === 'Other - Specify') {
										update({ jobTitle: 'Other - Specify' });
									} else {
										update({ jobTitle: e.target.value });
									}
								}}
							>
								<option value="" disabled>Select Job Title</option>
								{PREDEFINED_JOB_TITLES.map(title => (
									<option key={title} value={title}>{title}</option>
								))}
								<option value="Other - Specify">Other - Specify</option>
							</select>
						</div>
						{(formData.jobTitle === 'Other - Specify' || (formData.jobTitle !== '' && !PREDEFINED_JOB_TITLES.includes(formData.jobTitle))) && (
							<div style={{marginTop: 8}}>
								<input
									style={{
										...input,
										borderColor: '#ff6b35',
										background: '#fff5f2'
									}}
									type="text"
									placeholder="Please enter your custom job title"
									value={formData.jobTitle === 'Other - Specify' ? '' : formData.jobTitle}
									onChange={(e) => update({ jobTitle: e.target.value })}
								/>
								<small style={{color: '#ff6b35', fontSize: 12, marginTop: 4, display: 'block'}}>
									<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
									Enter your custom job title above
								</small>
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Select from common job titles or choose "Other - Specify" to enter a custom title
						</small>
						{errors.jobTitle && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobTitle[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-tags" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Category <span style={redAsterisk}>*</span>
						</label>
						<select
							style={{ 
								...input, 
								cursor: 'pointer',
								borderColor: errors.category ? '#dc2626' : '#d1d5db'
							}}
							className={errors.category ? 'is-invalid' : ''}
							value={PREDEFINED_CATEGORIES.includes(formData.category) ? formData.category : (formData.category === '' ? '' : 'Other - Specify')}
							onChange={(e) => {
								if (e.target.value === 'Other - Specify') {
									update({ category: 'Other - Specify' });
								} else {
									update({ category: e.target.value });
								}
							}}
						>
							<option value="" disabled>Select Category</option>
							{PREDEFINED_CATEGORIES.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
							<option value="Other - Specify">Other - Specify</option>
						</select>
						{(formData.category === 'Other - Specify' || (formData.category !== '' && !PREDEFINED_CATEGORIES.includes(formData.category))) && (
							<div style={{marginTop: 8}}>
								<input
									style={{
										...input,
										borderColor: '#ff6b35',
										background: '#fff5f2'
									}}
									type="text"
									placeholder="Please enter your custom job category"
									value={formData.category === 'Other - Specify' ? '' : formData.category}
									onChange={(e) => update({ category: e.target.value })}
								/>
								<small style={{color: '#ff6b35', fontSize: 12, marginTop: 4, display: 'block'}}>
									<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
									Enter your custom job category above
								</small>
							</div>
						)}
						{errors.category && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.category[0]}
							</div>
						)}
					</div>

					{/* Preferred Languages */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-language" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Preferred Languages
							<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
								({formData.preferredLanguages.length} selected)
							</span>
						</label>
						{(() => {
							const LANGUAGES = [
								'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
								'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu',
								'Assamese', 'Maithili', 'Sanskrit', 'Konkani', 'Sindhi',
								'Nepali', 'Manipuri', 'Bodo', 'Dogri', 'Kashmiri', 'Santhali'
							];
							return (
								<>
									<select
										style={{ ...input, cursor: 'pointer' }}
										value=""
										onChange={(e) => {
											const lang = e.target.value;
											if (lang === 'Other - Specify') {
												update({ _langOtherMode: true });
											} else if (lang && !formData.preferredLanguages.includes(lang)) {
												update({ preferredLanguages: [...formData.preferredLanguages, lang] });
											}
										}}
									>
										<option value="">-- Select Language --</option>
										{LANGUAGES.filter(l => !formData.preferredLanguages.includes(l)).map(lang => (
											<option key={lang} value={lang}>{lang}</option>
										))}
										<option value="Other - Specify">Other - Specify</option>
									</select>
									{formData._langOtherMode && (
										<div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
											<input
												style={{ ...input, borderColor: '#ff6b35', background: '#fff5f2', flex: 1 }}
												type="text"
												placeholder="Enter custom language..."
												value={formData._langOtherInput || ''}
												onChange={(e) => update({ _langOtherInput: e.target.value })}
												onKeyPress={(e) => {
													if (e.key === 'Enter' && formData._langOtherInput?.trim()) {
														e.preventDefault();
														const custom = formData._langOtherInput.trim();
														if (!formData.preferredLanguages.includes(custom)) {
															update({ preferredLanguages: [...formData.preferredLanguages, custom], _langOtherInput: '', _langOtherMode: false });
														}
													}
												}}
											/>
											<button
												style={{ background: '#ff6b35', color: '#fff', border: 'none', padding: '0 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
												onClick={() => {
													const custom = (formData._langOtherInput || '').trim();
													if (custom && !formData.preferredLanguages.includes(custom)) {
														update({ preferredLanguages: [...formData.preferredLanguages, custom], _langOtherInput: '', _langOtherMode: false });
													}
												}}
											>Add</button>
											<button
												style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '0 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
												onClick={() => update({ _langOtherMode: false, _langOtherInput: '' })}
											>Cancel</button>
										</div>
									)}
									{formData.preferredLanguages.length > 0 && (
										<div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
											{formData.preferredLanguages.map((lang, i) => (
												<div key={i} style={chip}>
													<span>{lang}</span>
													<span
														style={chipX}
														onClick={() => update({ preferredLanguages: formData.preferredLanguages.filter(l => l !== lang) })}
													>×</span>
												</div>
											))}
										</div>
									)}
								</>
							);
						})()}
					</div>

					<div style={fullRow} data-field="workMode">
						<label style={label}>
							<i className="fa fa-home" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Work Mode <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
							gap: 8,
							padding: 12,
							border: errors.workMode ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							{[
								{ value: 'work-from-home', label: 'Work from Home' },
								{ value: 'work-from-office', label: 'Work from Office' },
								{ value: 'hybrid', label: 'Hybrid' }
							].map(workMode => (
								<label key={workMode.value} style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									cursor: 'pointer',
									fontSize: 13,
									padding: '6px 8px',
									borderRadius: 4,
									transition: 'background 0.2s',
									background: formData.workMode === workMode.value ? '#fff5f2' : 'transparent'
								}}>
									<input
										type="radio"
										name="workMode"
										value={workMode.value}
										checked={formData.workMode === workMode.value}
										onChange={(e) => update({ workMode: e.target.value })}
										style={{cursor: 'pointer'}}
									/>
									<span>{workMode.label}</span>
								</label>
							))}
						</div>
						{errors.workMode && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.workMode[0]}
							</div>
						)}
					</div>

					{/* Transportation */}
					<div style={fullRow} data-field="transportation">
						<label style={label}>
							<i className="fa fa-car" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Transportation Options <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: "grid",
							gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
							gap: 12,
							padding: 12,
							border: errors.transportation ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.oneWay ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="oneWay"
									checked={formData.transportation.oneWay}
									onChange={() => update({ transportation: { oneWay: true, twoWay: false, noCab: false } })}
									style={{cursor: 'pointer'}}
								/>
								<span>One-way Cab</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.twoWay ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="twoWay"
									checked={formData.transportation.twoWay}
									onChange={() => update({ transportation: { oneWay: false, twoWay: true, noCab: false } })}
									style={{cursor: 'pointer'}}
								/>
								<span>Two-way Cab</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.noCab ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="noCab"
									checked={formData.transportation.noCab}
									onChange={() => update({ transportation: { oneWay: false, twoWay: false, noCab: true } })}
									style={{cursor: 'pointer'}}
								/>
								<span>No Cab Facility</span>
							</label>
						</div>
						{errors.transportation && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.transportation[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-clock" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Type <span style={redAsterisk}>*</span>
						</label>
						<select
							style={{ 
								...input, 
								cursor: 'pointer',
								borderColor: errors.jobType ? '#dc2626' : '#d1d5db'
							}}
							className={errors.jobType ? 'is-invalid' : ''}
							value={formData.jobType}
							onChange={(e) => update({ jobType: e.target.value })}
						>
							<option value="" disabled>Select Job Type</option>
							<option>Full-Time</option>
							<option>Part-Time</option>
							<option>Remote</option>
							<option>Contract</option>
							<option>Freelance</option>
							<option>Temporary</option>
							<option>Permanent</option>
							<option>Apprenticeship</option>
						</select>
						{errors.jobType && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobType[0]}
							</div>
						)}
					</div>

					<div style={fullRow} data-field="shift">
						<label style={label}>
							<i className="fa fa-clock" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Work Shift <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
							gap: 8,
							padding: 12,
							border: errors.shift ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							{[
								{ value: 'day-shift', label: 'Day Shift' },
								{ value: 'night-shift', label: 'Night Shift' },
								{ value: 'rotational', label: 'Rotational' }
							].map(shift => (
								<label key={shift.value} style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									cursor: 'pointer',
									fontSize: 13,
									padding: '6px 8px',
									borderRadius: 4,
									transition: 'background 0.2s',
									background: formData.shift === shift.value ? '#fff5f2' : 'transparent'
								}}>
									<input
										type="radio"
										name="shift"
										value={shift.value}
										checked={formData.shift === shift.value}
										onChange={(e) => update({ shift: e.target.value })}
										style={{cursor: 'pointer'}}
									/>
									<span>{shift.label}</span>
								</label>
							))}
						</div>
						{errors.shift && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.shift[0]}
							</div>
						)}
					</div>

					{/* Row 2 */}
					<div style={fullRow} data-field="jobLocation">
						<label style={label}>
							<i className="fa fa-map-marker-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Location <span style={redAsterisk}>*</span>
						</label>
						<LocationSearchInput
							value={formData.jobLocation}
							onChange={(value) => update({ jobLocation: value })}
							error={errors.jobLocation}
							style={{
								...input,
								borderColor: errors.jobLocation ? '#dc2626' : '#d1d5db'
							}}
						/>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
							Start typing to search locations or select from dropdown. You can also enter custom locations.
						</small>
						{errors.jobLocation && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobLocation[0]}
							</div>
						)}
					</div>

					{/* Compensation Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-money-bill-wave" style={{color: '#ff6b35'}}></i>
							Compensation & Openings
						</h3>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-rupee-sign" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							CTC (Annual) <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.ctc || ctcFormatError ? '#dc2626' : '#d1d5db'
							}}
							className={errors.ctc || ctcFormatError ? 'is-invalid' : ''}
							placeholder="e.g., 8 or 6-8"
							value={formData.ctc || ''}
							onChange={(e) => {
								const value = e.target.value;
								let error = '';
								
								if (value.trim()) {
									// Check for invalid characters like commas
									if (/[,]/.test(value)) {
										error = 'Commas are not allowed. Use format: 8 or 6-8';
									} else {
										// Check for valid format
										const ctcPattern = /^(\d+(?:\.\d+)?|\d+(?:\.\d+)?-\d+(?:\.\d+)?)$/;
										if (!ctcPattern.test(value)) {
											error = 'Enter CTC as number (e.g., 8) or range (e.g., 6-8)';
										} else {
											// Validate the actual values
											if (value.includes('-')) {
												const [minStr, maxStr] = value.split('-');
												const minVal = parseFloat(minStr);
												const maxVal = parseFloat(maxStr);
												
												// Check for unrealistic numbers (numbers > 500 are likely in rupees not lakhs)
												if (minVal > 500 || maxVal > 500) {
													error = 'CTC must be in lakhs (e.g., 8 = 8 L.P.A). Numbers > 500 are not allowed.';
												}
												// Check min < max
												else if (minVal >= maxVal) {
													error = 'Minimum CTC must be less than maximum CTC';
												}
												// Check reasonable range
												else if (minVal < 0.5 || maxVal < 0.5) {
													error = 'CTC must be at least 0.5 lakhs';
												}
											} else {
												const ctcVal = parseFloat(value);
												
												// Check for unrealistic numbers (numbers > 500 are likely in rupees not lakhs)
												if (ctcVal > 500) {
													error = 'CTC must be in lakhs (e.g., 8 = 8 L.P.A). Numbers > 500 are not allowed.';
												}
												// Check minimum
												else if (ctcVal < 0.5) {
													error = 'CTC must be at least 0.5 lakhs';
												}
											}
										}
									}
								}
								
								setCtcFormatError(error);
								update({ ctc: value });
								
								// Trigger auto-calculation immediately only if no error
								if (value.trim() && !error) {
									autoSaveCTC(value);
								} else if (!value.trim()) {
									// Clear net salary when CTC is cleared
									setFormData(prev => ({ ...prev, netSalary: '' }));
								}
							}}
						/>
						{(errors.ctc || ctcFormatError) && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{ctcFormatError || errors.ctc?.[0] || 'Invalid CTC format'}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Enter CTC in lakhs only (e.g., 8 = 8 LPA, 6-8 = 6-8 LPA). Do not enter: 800000, 12,00,000, etc. Max value: 500
						</small>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-money-bill-wave" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Net Salary (Monthly) <span style={redAsterisk}>*</span>
							{formData.netSalary && (
								<span style={{
									fontSize: 11, 
									color: '#10b981', 
									fontWeight: 500,
									marginLeft: 8,
									background: '#d1fae5',
									padding: '2px 8px',
									borderRadius: 4,
								}}>
									✓ Auto-calculated
								</span>
							)}
						</label>
						<input
							style={{
								...input,
								borderColor: errors.netSalary ? '#dc2626' : (formData.netSalary ? '#10b981' : '#d1d5db'),
								background: formData.netSalary ? '#f0fdf4' : '#fff'
							}}
							className={errors.netSalary ? 'is-invalid' : ''}
							placeholder="Auto-calculated from CTC or enter manually"
							value={formData.netSalary || ''}
							onChange={(e) => update({ netSalary: e.target.value })}
						/>
						{errors.netSalary && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.netSalary[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Auto-calculated as CTC divided by 12 months. You can edit if needed.
						</small>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-users" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Number of Vacancies <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.vacancies ? '#dc2626' : '#d1d5db'
							}}
							className={errors.vacancies ? 'is-invalid' : ''}
							type="number"
							min="1"
							placeholder="e.g., 5"
							value={formData.vacancies}
							onChange={(e) => {
								const vacancies = e.target.value;
								const applicationLimit = vacancies ? (parseInt(vacancies) + 1).toString() : '';
								update({ vacancies, applicationLimit });
							}}
						/>
						{errors.vacancies && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.vacancies[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-file-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Application Limit <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.applicationLimit || applicationLimitWarning ? '#dc2626' : '#d1d5db'
							}}
							className={errors.applicationLimit ? 'is-invalid' : ''}
							type="number"
							min="1"
							placeholder="e.g., 100"
							value={formData.applicationLimit}
							onChange={(e) => {
								const value = e.target.value;
								const applicationLimit = parseInt(value) || 0;
								const vacancies = parseInt(formData.vacancies) || 0;
								
								// Clear error if value is valid
								if (value && applicationLimit > 0) {
									if (errors.applicationLimit) {
										setErrors(prev => {
											const newErrors = { ...prev };
											delete newErrors.applicationLimit;
											return newErrors;
										});
									}
								}
								
								// Set warning if application limit is less than vacancies
								if (applicationLimit > 0 && vacancies > 0 && applicationLimit < vacancies) {
									setApplicationLimitWarning(`Warning: Application limit (${applicationLimit}) is less than number of vacancies (${vacancies}). Consider setting it to at least ${vacancies} for better hiring outcomes.`);
								} else {
									setApplicationLimitWarning('');
								}
								
								update({ applicationLimit: value });
							}}
						/>
						{errors.applicationLimit && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.applicationLimit[0]}
							</div>
						)}
						{applicationLimitWarning && !errors.applicationLimit && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{applicationLimitWarning}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Maximum number of applications can be set and changed if needed.
						</small>
					</div>

					{/* Requirements Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-clipboard-check" style={{color: '#ff6b35'}}></i>
							Requirements & Qualifications
						</h3>
					</div>

					<div style={{ position: 'relative' }} data-field="education">
						<label style={label}>
							<i className="fa fa-graduation-cap" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Required Educational Background <span style={redAsterisk}>*</span>
						</label>
						<div 
							onClick={() => setShowEducationDropdown(!showEducationDropdown)}
							style={{
								...input,
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								cursor: 'pointer',
								minHeight: '45px',
								height: 'auto',
								padding: '8px 12px'
							}}
						>
							<div style={{ 
								display: 'flex', 
								flexWrap: 'wrap', 
								gap: '4px',
								fontSize: '14px',
								color: formData.education.length > 0 ? '#111827' : '#9ca3af'
							}}>
								{formData.education.length > 0 
									? formatJobEducationDisplay(formData.education, formData.educationSpecializations)
									: "Select educational background..."}
							</div>
							<i className={`fa fa-chevron-${showEducationDropdown ? 'up' : 'down'}`} style={{ color: '#6b7280', fontSize: '12px' }}></i>
						</div>

						{showEducationDropdown && (
							<>
								<div 
									style={{
										position: 'fixed',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										zIndex: 999
									}}
									onClick={() => setShowEducationDropdown(false)}
								/>
								<div style={{
									position: 'absolute',
									top: '100%',
									left: 0,
									right: 0,
									zIndex: 1000,
									marginTop: '4px',
									display: 'flex',
									flexDirection: 'column',
									gap: '4px',
									padding: '12px',
									background: '#fff',
									borderRadius: '8px',
									border: '1px solid #d1d5db',
									boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
									maxHeight: '300px',
									overflowY: 'auto'
								}}>
									{JOB_EDUCATION_LEVELS.map(level => (
										<label key={level} style={{
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											cursor: 'pointer',
											fontSize: '14px',
											color: '#374151',
											margin: 0,
											padding: '8px 4px',
											borderRadius: '4px',
											transition: 'background 0.2s'
										}}
										onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
										onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
										>
											<input
												type="checkbox"
												name="education_checkbox"
												checked={formData.education.includes(level)}
												onChange={(e) => {
													const isChecked = e.target.checked;
													let newEducation;
													if (level === "Any") {
														newEducation = isChecked ? ["Any"] : [];
													} else {
														newEducation = isChecked 
															? [...formData.education.filter(edu => edu !== "Any"), level]
															: formData.education.filter(edu => edu !== level);
													}
													syncEducationSelection(newEducation);
												}}
												style={{ 
													width: '18px', 
													height: '18px', 
													cursor: 'pointer',
													accentColor: '#ff6b35'
												}}
											/>
											{level}
										</label>
									))}
								</div>
							</>
						)}
						{formData.education.filter(level => level !== 'Any').length > 0 && (
							<div style={{
								marginTop: '16px',
								display: 'grid',
								gap: '12px'
							}}>
								{formData.education
									.filter(level => level !== 'Any')
									.map((qualification) => {
										const specializationOptions = getJobEducationSpecializationOptions(qualification);
										return (
											<div key={`specialization-${qualification}`}>
												<label style={label}>
													<i className="fa fa-graduation-cap" style={{marginRight: '8px', color: '#ff6b35'}}></i>
													{qualification} Specialization / Stream
												</label>
												<select
													style={{ ...input, cursor: 'pointer' }}
													value={getSelectedEducationSpecialization(qualification)}
													onChange={(event) => handleEducationSpecializationChange(qualification, event.target.value)}
												>
													{specializationOptions.map((option) => (
														<option key={`${qualification}-${option}`} value={option}>
															{option}
														</option>
													))}
												</select>
											</div>
										);
									})}
							</div>
						)}
						{errors.education && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.education[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-question-circle" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Are Backlogs Allowed?
						</label>
						<select
							style={{ ...input, cursor: 'pointer' }}
							value={formData.backlogsAllowed ? "Yes" : "No"}
							onChange={(e) =>
								update({ backlogsAllowed: e.target.value === "Yes" })
							}
						>
							<option value="No">No</option>
							<option value="Yes">Yes</option>
						</select>
					</div>

					{/* Skills (full width) */}
					<div style={fullRow} data-field="requiredSkills">
						<label style={label}>
							<i className="fa fa-cogs" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Required Skills <span style={redAsterisk}>*</span>
							<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
								({formData.requiredSkills.length} skills selected)
							</span>
						</label>
						<div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
							<div style={{position: 'relative', flex: 1}}>
								<input
									style={input}
									type="text"
									placeholder="Type to search or add custom skill..."
									value={formData.skillInput}
									onChange={(e) => update({ skillInput: e.target.value })}
									onFocus={() => update({ skillInput: formData.skillInput || '' })}
									onKeyPress={(e) => {
										if (e.key === 'Enter' && formData.skillInput.trim()) {
											e.preventDefault();
											const newSkill = formData.skillInput.trim();
											if (!formData.requiredSkills.includes(newSkill)) {
												update({ 
													requiredSkills: [...formData.requiredSkills, newSkill],
													skillInput: ''
												});
											}
										}
									}}
								/>
							{formData.skillInput && (() => {
								const allSkills = [
									"React", "Vue.js", "Angular", "Node.js", "Python", "Java", "C++", "C#", "PHP", "Ruby",
									"Go", "Rust", "Swift", "Kotlin", "TypeScript", "JavaScript", "HTML", "CSS", "SASS", "LESS",
									"SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Oracle", "SQLite",
									"AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab",
									"REST API", "GraphQL", "SOAP", "Microservices", "Spring Boot", "Django", "Flask", "Express.js",
									"Machine Learning", "Deep Learning", "Data Science", "AI", "TensorFlow", "PyTorch", "Pandas", "NumPy",
									"DevOps", "CI/CD", "Agile", "Scrum", "Jira", "Confluence", "Linux", "Unix", "Windows Server",
									"Networking", "Security", "Cybersecurity", "Penetration Testing", "Ethical Hacking",
									"Salesforce", "SAP", "Oracle ERP", "Power BI", "Tableau", "Excel", "Data Analysis",
									"UI/UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign",
									"Digital Marketing", "SEO", "SEM", "Content Writing", "Social Media Marketing", "Email Marketing",
									"Project Management", "Product Management", "Business Analysis", "Financial Analysis",
									"Communication", "Leadership", "Team Management", "Problem Solving", "Critical Thinking"
								];
								const filtered = allSkills.filter(skill => 
									skill.toLowerCase().includes(formData.skillInput.toLowerCase()) &&
									!formData.requiredSkills.includes(skill)
								);
								return filtered.length > 0 ? (
									<div style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										background: '#fff',
										border: '1px solid #d1d5db',
										borderTop: 'none',
										borderRadius: '0 0 8px 8px',
										maxHeight: '200px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
									}}>
										{filtered.slice(0, 10).map((skill, index) => (
											<div
												key={index}
												style={{
													padding: '10px 12px',
													cursor: 'pointer',
													borderBottom: index < Math.min(filtered.length, 10) - 1 ? '1px solid #f3f4f6' : 'none',
													transition: 'background-color 0.2s'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
												onClick={() => {
													update({ 
														requiredSkills: [...formData.requiredSkills, skill],
														skillInput: ''
													});
												}}
											>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<i className="fa fa-plus-circle" style={{ color: '#ff6b35', fontSize: '12px' }}></i>
													<span style={{ fontSize: '14px', color: '#374151' }}>{skill}</span>
												</div>
											</div>
										))}
										{filtered.length > 10 && (
											<div style={{
												padding: '8px 12px',
												background: '#f9fafb',
												color: '#6b7280',
												fontSize: '12px',
												textAlign: 'center',
												borderTop: '1px solid #e5e7eb'
											}}>
												+{filtered.length - 10} more skills. Keep typing to narrow down...
											</div>
										)}
									</div>
								) : null;
							})()}
							</div>
							<button
								style={{
									background: '#ff6b35',
									color: '#fff',
									border: 'none',
									padding: '12px 16px',
									borderRadius: 8,
									cursor: formData.skillInput.trim() ? 'pointer' : 'not-allowed',
									fontSize: '14px',
									fontWeight: 600,
									opacity: formData.skillInput.trim() ? 1 : 0.5,
									transition: 'all 0.2s',
									whiteSpace: 'nowrap'
								}}
								onClick={() => {
									if (formData.skillInput.trim()) {
										const newSkill = formData.skillInput.trim();
										if (!formData.requiredSkills.includes(newSkill)) {
											update({ 
												requiredSkills: [...formData.requiredSkills, newSkill],
												skillInput: ''
											});
										}
									}
								}}
								onMouseEnter={(e) => {
									if (formData.skillInput.trim()) {
										e.currentTarget.style.background = '#e55a2b';
									}
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = '#ff6b35';
								}}
							>
								<i className="fa fa-plus" style={{marginRight: 4}}></i>
								Add
							</button>
						</div>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
							Type to search from 90+ skills, select from dropdown, or press Enter/click Add button to add custom skills
						</small>
						{formData.requiredSkills.length > 0 && (
							<div
								style={{
									marginTop: 14,
									display: "flex",
									gap: 10,
									flexWrap: "wrap",
									padding: 12,
									background: '#f9fafb',
									borderRadius: 8,
									border: '1px solid #e5e7eb',
								}}
							>
								{formData.requiredSkills.map((s, i) => (
									<div key={i} style={chip}>
										<span>{s}</span>
										<span 
											style={chipX} 
											onClick={() => removeSkill(s)}
											title="Remove skill"
										>
											×
										</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Experience Level */}
					<div style={{
						padding: 20,
						background: '#fff',
						border: '2px solid #e5e7eb',
						borderRadius: 12,
						boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
					}}>
						<label style={{
							...label,
							fontSize: 16,
							fontWeight: 600,
							marginBottom: 16,
							color: '#1f2937'
						}}>
							<i className="fa fa-chart-line" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Experience Level
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
							gap: 16,
							marginBottom: 16
						}}>
							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "freshers" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "freshers" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "freshers" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "freshers", minExperience: "", maxExperience: "" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "freshers" ? '#1f2937' : '#6b7280'
								}}>Fresher</h4>
							</div>

							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "minimum" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "minimum" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "minimum" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "minimum" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "minimum" ? '#1f2937' : '#6b7280'
								}}>Experienced</h4>
							</div>

							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "both" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "both" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "both" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "both", minExperience: "", maxExperience: "" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "both" ? '#1f2937' : '#6b7280'
								}}>Both</h4>
							</div>
						</div>

						{formData.experienceLevel === "minimum" && (
							<div style={{
								padding: 16,
								background: '#f0f9ff',
								border: '1px solid #0ea5e9',
								borderRadius: 8,
								display: 'grid',
								gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
								gap: 16
							}}>
								<div>
									<label style={{
										display: 'block',
										fontSize: 14,
										color: '#0f172a',
										fontWeight: 600,
										marginBottom: 8
									}}>Minimum Years</label>
									<input
										style={{
											...input,
											width: '100%',
											marginBottom: 0,
											border: '2px solid #0ea5e9',
											fontWeight: 600,
											fontSize: 16
										}}
										type="number"
										min="0"
										step="1"
										inputMode="numeric"
										placeholder="e.g., 2"
										value={formData.minExperience}
										onKeyDown={blockInvalidNumberKeys}
										onChange={(e) => update({ minExperience: sanitizeNonNegativeIntegerInput(e.target.value) })}
									/>
								</div>
								<div>
									<label style={{
										display: 'block',
										fontSize: 14,
										color: '#0f172a',
										fontWeight: 600,
										marginBottom: 8
									}}>Maximum Years</label>
									<input
										style={{
											...input,
											width: '100%',
											marginBottom: 0,
											border: '2px solid #0ea5e9',
											fontWeight: 600,
											fontSize: 16
										}}
										type="number"
										min="0"
										step="1"
										inputMode="numeric"
										placeholder="e.g., 5"
										value={formData.maxExperience}
										onKeyDown={blockInvalidNumberKeys}
										onChange={(e) => update({ maxExperience: sanitizeNonNegativeIntegerInput(e.target.value) })}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Additional Details Section */}
					<div style={fullRow}>
						<h3 style={compactSectionHeader}>
							<i className="fa fa-file-alt" style={{color: '#ff6b35'}}></i>
							Additional Details
						</h3>
					</div>

					{/* Job Description */}
					<div style={fullRow} data-field="jobDescription">
						<label style={label}>
							<i className="fa fa-align-left" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Description <span style={redAsterisk}>*</span>
						</label>
						<div style={errors.jobDescription ? {border: '1px solid #dc2626', borderRadius: 8} : {}}>
							<RichTextEditor
								value={formData.jobDescription}
								onChange={(value) => update({ jobDescription: value })}
								placeholder="Provide a detailed description of the job role, responsibilities, and expectations..."
								className="form-control-editor"
							/>
						</div>
						{errors.jobDescription && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobDescription[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 8, display: 'block'}}>
							Must be at least 50 characters. Use the toolbar to format with bold, italic, lists, and alignment options
						</small>
					</div>

					{/* Roles and Responsibilities */}
					<div style={fullRow} data-field="rolesAndResponsibilities">
						<label style={label}>
							<i className="fa fa-tasks" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Roles and Responsibilities <span style={redAsterisk}>*</span>
						</label>
						<RichTextEditor
							value={formData.rolesAndResponsibilities || ''}
							onChange={(value) => update({ rolesAndResponsibilities: value })}
							placeholder="List the key roles and responsibilities for this position..."
							className="form-control-editor"
						/>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 8, display: 'block'}}>
							Use bullet points or numbered lists to clearly outline the main responsibilities
						</small>
					</div>
					</>
					)}

					{currentStep === 2 && (
						<>
					{/* Interview Process Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-clipboard-list" style={{color: '#ff6b35'}}></i>
							Interview Process
						</h3>
					</div>

					{/* Application Timeline */}
					<div>
						<label style={label}>
							<i className="fa fa-calendar-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Offer Letter Release Date <span style={redAsterisk}>*</span>
						</label>
						<input
							style={input}
							type="date"
							min={today}
							value={formData.offerLetterDate || ''}
							onChange={async (e) => {
								const selectedDate = e.target.value;
								if (!selectedDate) {
									update({ offerLetterDate: '' });
									return;
								}
								await confirmHolidayDate(selectedDate, () => {
									const normalized = normalizeToYMD(selectedDate) || selectedDate;
									update({ offerLetterDate: normalized });
								}, 'offer letter release date');
							}}
							placeholder="DD/MM/YYYY"
						/>
						{errors.offerLetterDate && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.offerLetterDate[0]}
							</div>
						)}
						<HolidayIndicator date={formData.offerLetterDate} />
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-calendar-times" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Last Date of Application <span style={redAsterisk}>*</span>
						</label>
						<div style={{display: 'flex', gap: 12, alignItems: 'flex-end'}}>
							<div style={{flex: 1}}>
								<input
									style={{
										...input,
										borderColor: formData.lastDateOfApplication ? '#10b981' : '#d1d5db',
										background: formData.lastDateOfApplication ? '#f0fdf4' : '#fff'
									}}
									type="date"
									min={today}
									value={formData.lastDateOfApplication || ''}
									onChange={async (e) => {
										const selectedDate = e.target.value;
										if (!selectedDate) {
											update({ lastDateOfApplication: '', lastDateOfApplicationTime: '' });
											return;
										}
										await confirmHolidayDate(selectedDate, () => {
											const normalized = normalizeToYMD(selectedDate) || selectedDate;
											update({ lastDateOfApplication: normalized, lastDateOfApplicationTime: '' });
										}, 'last date of application');
									}}
									placeholder="DD/MM/YYYY"
								/>
							</div>
						</div>
						<small style={{color: '#6b7280', fontSize: 11, marginTop: 4, display: 'block'}}>
							Applications will automatically close on the selected date at 11:59 PM.
						</small>
						{errors.lastDateOfApplication && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.lastDateOfApplication[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Select the last date candidates can apply for this job.
						</small>
						<HolidayIndicator date={formData.lastDateOfApplication} />
					</div>

					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-comments" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Number of Interview Rounds <span style={redAsterisk}>*</span>
							{formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 && (
								<span style={{
									fontSize: 11,
									color: parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#10b981' : '#ef4444',
									fontWeight: 500,
									marginLeft: 8,
									background: parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#d1fae5' : '#fee2e2',
									padding: '2px 8px',
									borderRadius: 4,
								}}>
									{parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length 
										? `✓ ${formData.interviewRoundOrder.length} rounds selected` 
										: `⚠ ${formData.interviewRoundOrder.length}/${formData.interviewRoundsCount} selected`
									}
								</span>
							)}
						</label>
						<input
							style={{
								...input,
								borderColor: formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 
									? (parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#10b981' : '#ef4444')
									: '#d1d5db'
							}}
							type="number"
							min="1"
							placeholder="e.g., 3"
							value={formData.interviewRoundsCount}
							onChange={(e) => {
								const newCount = e.target.value;
								update({ interviewRoundsCount: newCount });
								
								// Show validation message if there's a mismatch
								if (newCount && formData.interviewRoundOrder.length > 0) {
									const specifiedCount = parseInt(newCount);
									const selectedCount = formData.interviewRoundOrder.length;
									
									if (specifiedCount !== selectedCount) {
										showWarning(`You need to select exactly ${specifiedCount} interview rounds. Currently ${selectedCount} rounds are selected.`);
									}
								}
							}}
						/>
						{errors.interviewRoundsCount && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.interviewRoundsCount[0]}
							</div>
						)}
						{formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 && parseInt(formData.interviewRoundsCount) !== formData.interviewRoundOrder.length && (
							<div style={{color: '#ef4444', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-triangle"></i>
								Please select exactly {formData.interviewRoundsCount} interview rounds to match your specified count.
							</div>
						)}
					</div>

					{/* Interview Round Types - full row */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-list-check" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Select Interview Round Type
							<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
								(You can select the same type multiple times)
								{formData.interviewRoundsCount && (
									<span style={{color: '#ff6b35', fontWeight: 600, marginLeft: 8}}>
										- Select exactly {formData.interviewRoundsCount} rounds
									</span>
								)}
							</span>
						</label>
						<select
							style={{ ...input, cursor: 'pointer' }}
							value=""
							onChange={(e) => {
								const roundType = e.target.value;
								if (roundType) {
									// Check if adding this round would exceed the specified count
									const specifiedCount = parseInt(formData.interviewRoundsCount) || 0;
									const currentCount = formData.interviewRoundOrder.length;
									
									if (specifiedCount > 0 && currentCount >= specifiedCount) {
										showWarning(`Cannot add more rounds! You mentioned ${formatCountLabel(specifiedCount, 'interview round')} and have already selected ${formatCountLabel(currentCount, 'round')}. Please increase the "Number of Interview Rounds" field if you need more rounds.`);
										return;
									}
									
									// Generate unique key for multiple instances
									const uniqueKey = `${roundType}_${Date.now()}`;
									
									// Add to interview round order
									setFormData(s => {
										const newState = {
											...s,
											interviewRoundOrder: [...s.interviewRoundOrder, uniqueKey],
											interviewRoundTypes: {
												...s.interviewRoundTypes,
												[uniqueKey]: roundType
											},
											interviewRoundDetails: {
												...s.interviewRoundDetails,
												[uniqueKey]: { description: '', fromDate: '', startTime: '', endTime: '' }
											}
										};
										
										// Check if we've reached the specified count
										if (specifiedCount > 0 && newState.interviewRoundOrder.length === specifiedCount) {
											showSuccess(`Perfect! You have selected exactly ${formatCountLabel(specifiedCount, 'interview round')} as mentioned.`);
										}
										
										return newState;
									});
								}
							}}
						>
							<option value="">-- Select Round Type --</option>
							<option value="assessment">MCQ/Assessment</option>
							<option value="oneOnOnePanel">One-on-One / Panel</option>
							<option value="group">Group</option>
							<option value="managerial">Managerial Round</option>
							<option value="technical">Technical</option>
							<option value="hr">HR Round</option>
							<option value="situational">Situational / Behavioral</option>
							<option value="others">Others – Specify.</option>
						</select>

						{/* Others Specify Text Input */}
						{formData.interviewRoundOrder.some(key => formData.interviewRoundTypes[key] === 'others') && (
							<div style={{marginTop: 12}}>
								<label style={{...label, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1f2937'}}>
									<i className="fa fa-edit" style={{marginRight: 8, color: '#ff6b35'}}></i>
									Specify Other Interview Round Type:
								</label>
								{formData.interviewRoundOrder
									.filter(key => formData.interviewRoundTypes[key] === 'others')
									.map((othersKey, index) => {
										const stageNumber = formData.interviewRoundOrder.indexOf(othersKey) + 1;
										return (
											<div key={othersKey} style={{marginBottom: 12}}>
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: 8,
													marginBottom: 8
												}}>
													<span style={{
														fontSize: 12,
														fontWeight: 700,
														color: '#fff',
														background: '#ff6b35',
														borderRadius: '50%',
														width: '22px',
														height: '22px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center'
													}}>
														{stageNumber}
													</span>
													<span style={{fontSize: 14, fontWeight: 600, color: '#374151'}}>Stage {stageNumber} - Others:</span>
												</div>
												<input
													style={{
														...input,
														borderColor: '#ff6b35',
														background: '#fff5f2',
														borderWidth: 2
													}}
													type="text"
													placeholder="Please specify the interview round type (e.g., Coding Challenge, Portfolio Review, Case Study, etc.)"
													value={formData.interviewRoundDetails[othersKey]?.customType || ''}
													onChange={(e) => {
														setFormData(prev => ({
															...prev,
															interviewRoundDetails: {
																...prev.interviewRoundDetails,
																[othersKey]: {
																	...prev.interviewRoundDetails[othersKey],
																	customType: e.target.value
																}
															}
														}));
													}}
													required
												/>
												<small style={{color: '#ff6b35', fontSize: 12, marginTop: 4, display: 'block'}}>
													<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
													Enter a custom name for this interview round type (required)
												</small>
											</div>
										);
									})}
							</div>
						)}
						
						<div style={{marginTop: 12}}>
							<label style={{...label, marginBottom: 8, fontSize: 15, fontWeight: 600, color: '#1f2937'}}>
								<i className="fa fa-list-ol" style={{marginRight: 8, color: '#ff6b35'}}></i>
								Selected Interview Rounds (in order):
							</label>
							{formData.interviewRoundOrder.map((uniqueKey, index) => {
								const roundType = formData.interviewRoundTypes[uniqueKey];
								const roundNames = {
									technical: 'Technical',
									managerial: 'Managerial Round',
									hr: 'HR Round',
									oneOnOnePanel: 'One-on-One / Panel',
									group: 'Group',
									situational: 'Situational / Behavioral',
									assessment: 'MCQ/Assessment Schedule',
									others: 'Others – Specify.'
								};
								
								// Get custom type for "others" rounds
								const customType = roundType === 'others' ? formData.interviewRoundDetails[uniqueKey]?.customType : null;
								const displayName = (roundType === 'others' && customType && customType.trim()) ? customType : (roundNames[roundType] || roundType);
								
								return (
									<div key={uniqueKey} style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 8,
										padding: '10px 16px',
										background: '#fff5f2',
										borderRadius: 25,
										border: '2px solid #ff6b35',
										marginRight: 10,
										marginBottom: 10,
										color: '#ff6b35',
										boxShadow: '0 2px 8px rgba(255,107,53,0.15)'
									}}>
										<span style={{
											fontSize: 12,
											fontWeight: 700,
											color: '#fff',
											background: '#ff6b35',
											borderRadius: '50%',
											width: '22px',
											height: '22px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}>
											{index + 1}
										</span>
										<span style={{fontSize: 14, fontWeight: 600, color: '#ff6b35'}}>Stage {index + 1}: {displayName}</span>
										<span 
											style={{cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 18, marginLeft: 4}}
											onClick={() => {
												setFormData(s => {
													const newState = {
														...s,
														interviewRoundOrder: s.interviewRoundOrder.filter(key => key !== uniqueKey),
														interviewRoundTypes: Object.fromEntries(
															Object.entries(s.interviewRoundTypes).filter(([key]) => key !== uniqueKey)
														),
														interviewRoundDetails: Object.fromEntries(
															Object.entries(s.interviewRoundDetails).filter(([key]) => key !== uniqueKey)
														)
													};
													
													// Show validation message after removal
													const specifiedCount = parseInt(s.interviewRoundsCount) || 0;
													if (specifiedCount > 0 && newState.interviewRoundOrder.length < specifiedCount) {
														setTimeout(() => {
															showWarning(`You have mentioned ${specifiedCount} interview rounds, but only ${newState.interviewRoundOrder.length} interview round${newState.interviewRoundOrder.length === 1 ? ' has' : 's have'} been updated. Please complete all interview rounds to proceed.`);
														}, 100);
													}
													
													return newState;
												});
											}}
											title="Remove this stage"
										>
											×
										</span>
									</div>
								);
							})}
							{formData.interviewRoundOrder.length === 0 && (
								<div style={{
									padding: '12px 16px',
									background: '#f3f4f6',
									borderRadius: 8,
									color: '#6b7280',
									fontSize: 14,
									textAlign: 'center',
									border: '1px dashed #d1d5db'
								}}>
									<i className="fa fa-info-circle" style={{marginRight: 8}}></i>
									No interview rounds selected yet. 
									{formData.interviewRoundsCount && (
										<span style={{color: '#ef4444', fontWeight: 600}}>
											You need to select {formData.interviewRoundsCount} round(s).
										</span>
									)}
									{!formData.interviewRoundsCount && (
										<span>Select from the dropdown above to add stages.</span>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Assessment selection now shown inside each assessment card */}

					<div style={fullRow}>
						<div
							style={{
								display: "none",
								gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
								gap: isMobile ? 8 : 12,
								padding: 16,
								borderRadius: 8,
							}}
						>
							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.technical ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.technical ? (formData.interviewRoundOrder || []).indexOf('technical') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.technical}
									onChange={() =>
										toggleNested("interviewRoundTypes", "technical")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Technical</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.nonTechnical ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.nonTechnical ? (formData.interviewRoundOrder || []).indexOf('nonTechnical') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.nonTechnical}
									onChange={() =>
										toggleNested("interviewRoundTypes", "nonTechnical")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Non-Technical</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.managerial ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.managerial ? (formData.interviewRoundOrder || []).indexOf('managerial') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.managerial}
									onChange={() =>
										toggleNested("interviewRoundTypes", "managerial")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Managerial Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.final ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.final ? (formData.interviewRoundOrder || []).indexOf('final') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.final}
									onChange={() => toggleNested("interviewRoundTypes", "final")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Final Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.hr ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.hr ? (formData.interviewRoundOrder || []).indexOf('hr') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.hr}
									onChange={() => toggleNested("interviewRoundTypes", "hr")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>HR Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.assessment ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.assessment ? (formData.interviewRoundOrder || []).indexOf('assessment') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.assessment}
									onChange={() => toggleNested("interviewRoundTypes", "assessment")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Assessment</span>
							</label>
						</div>
					</div>

					{/* Individual Assessment Scheduling for each Assessment instance */}
					{false && formData.interviewRoundOrder
						.filter(key => formData.interviewRoundTypes[key] === 'assessment')
						.map((assessmentKey, assessmentIndex) => {
							const stageNumber = formData.interviewRoundOrder.indexOf(assessmentKey) + 1;
							return (
								<div key={assessmentKey} style={{
									...fullRow,
									margin: "24px 0",
									background: "#fff",
									borderRadius: "12px",
									border: "1px solid #e2e8f0",
									overflow: "hidden",
									boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
								}}>
									<div style={{
										padding: "12px 16px",
										background: "#f8fafc",
										borderBottom: "1px solid #e2e8f0",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										flexWrap: isMobile ? "wrap" : "nowrap",
										gap: 12
									}}>
										<div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 auto", minWidth: 0 }}>
											<span style={{
												fontSize: 14,
												fontWeight: 700,
												color: '#334155',
												background: '#e2e8f0',
												border: '1px solid #cbd5e1',
												borderRadius: '8px',
												width: '32px',
												height: '32px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center'
											}}>
												{stageNumber}
											</span>
											<div style={{ minWidth: 0 }}>
												<h4 style={{ margin: 0, fontSize: 16, color: "#1e293b", fontWeight: 700, whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
													Stage {stageNumber}: MCQ/Assessment Schedule {assessmentIndex + 1}
												</h4>
												<div style={{ fontSize: 12, color: "#aa2c2c" }}>Set the date and time window for candidates (end time is auto-fetched).</div>
											</div>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
											{null}
											<div 
												style={{
													width: '32px',
													height: '32px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													borderRadius: '8px',
													background: '#eff6ff',
													color: '#3b82f6',
													cursor: 'pointer',
													transition: 'all 0.2s'
												}}
												onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
												onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
												title="View in timeline"
												onClick={() => {
													const assessmentSection = document.querySelector(`[data-assessment-key="${assessmentKey}"]`);
													if (assessmentSection) {
														assessmentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
														const parent = assessmentSection.parentElement;
														if (parent) {
															parent.style.borderColor = '#3b82f6';
															parent.style.ring = '2px solid #3b82f6';
															setTimeout(() => {
																parent.style.borderColor = '#e2e8f0';
																parent.style.ring = 'none';
															}, 2000);
														}
													}
												}}
											>
											</div>
										</div>
									</div>
									<div 
										data-assessment-key={assessmentKey}
										style={{ 
											display: 'grid', 
											gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
											gap: 20,
											padding: 20,
											background: '#fff',
										}}>
										<div style={{
											display: 'flex',
											flexDirection: 'column',
											gap: 8
										}}>
											<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
												<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
													<i className="fa fa-calendar" style={{marginRight: 8, color: '#ff6b35'}}></i>
													Assessment Date
												</label>
												{formData.interviewRoundDetails[assessmentKey]?.fromDate && (
													<div style={{fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0'}}>
														<i className="fa fa-check"></i>
														Saved
													</div>
												)}
											</div>
											<input
												style={{
													...input, 
													fontSize: 14, 
													padding: '10px 12px',
													borderRadius: '8px',
													border: '1px solid #cbd5e1',
													background: '#f8fafc'
												}}
												type="date"
												min={getMinDateForRound(assessmentKey)}
												value={formData.interviewRoundDetails[assessmentKey]?.fromDate || ''}
												onChange={(e) => updateRoundDetails(assessmentKey, 'fromDate', e.target.value)}
											/>
											<HolidayIndicator date={formData.interviewRoundDetails[assessmentKey]?.fromDate} />
										</div>
										<div style={{
											display: 'flex',
											flexDirection: 'column',
											gap: 8
										}}>
											<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
												<i className="fa fa-clock" style={{marginRight: 8, color: '#ff6b35'}}></i>
												Start Time
											</label>
											<input
												style={{
													...input, 
													fontSize: 14, 
													padding: '10px 12px',
													borderRadius: '8px',
													border: '1px solid #cbd5e1',
													background: '#f8fafc'
												}}
												type="time"
												value={formData.interviewRoundDetails[assessmentKey]?.startTime || ''}
												onChange={(e) => updateRoundDetails(assessmentKey, 'startTime', e.target.value)}
											/>
										</div>
										<div style={{
											display: 'flex',
											flexDirection: 'column',
											gap: 8
										}}>
											<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
												<i className="fa fa-hourglass-end" style={{marginRight: 8, color: '#ff6b35'}}></i>
												End Time
												<span style={{
													fontSize: 11,
													color: '#10b981',
													fontWeight: 500,
													marginLeft: 8,
													background: '#d1fae5',
													padding: '2px 8px',
													borderRadius: 4,
												}}>
													✓ Auto-calculated
												</span>
											</label>
											<input
												style={{
													...input, 
													fontSize: 14, 
													padding: '10px 12px',
													borderRadius: '8px',
													border: '1px solid #cbd5e1',
													background: '#f0fdf4',
													cursor: 'not-allowed'
												}}
												type="time"
												value={formData.interviewRoundDetails[assessmentKey]?.endTime || ''}
												readOnly
												disabled
											/>
											<small style={{color: '#10b981', fontSize: 11, marginTop: 4, display: 'block'}}>
												<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
												Auto-calculated based on assessment selection
											</small>
										</div>
									</div>
								</div>
							);
						})}

					{/* Interview Round Details - Show all selected rounds in configured order */}
					{formData.interviewRoundOrder.length > 0 && (
						<>
						<div style={fullRow}>
							<h4 style={{ margin: "16px 0 12px 0", fontSize: 15, color: "#0f172a" }}>
								Interview Round Details
							</h4>
							{formData.interviewRoundOrder
								.map((uniqueKey) => {
									const roundType = formData.interviewRoundTypes[uniqueKey];
									const roundNames = {
										technical: 'Technical',
										managerial: 'Managerial Round',
										hr: 'HR Round',
										oneOnOnePanel: 'One-on-One / Panel',
										group: 'Group',
										situational: 'Situational / Behavioral',
										assessment: 'Assessment',
										others: 'Others – Specify.'
									};
									const customType = roundType === 'others' ? formData.interviewRoundDetails[uniqueKey]?.customType : null;
									const displayName = (roundType === 'others' && customType && customType.trim()) ? customType : (roundNames[roundType] || roundType);
									const stageNumber = formData.interviewRoundOrder.indexOf(uniqueKey) + 1;
									const details = formData.interviewRoundDetails[uniqueKey] || {};
									const subStages = details.subStages || [];
									const isAssessmentRound = roundType === 'assessment';
									const selectedAssessmentForRound = details.assessmentId || '';
									const assessmentIndex = formData.interviewRoundOrder
										.filter(key => formData.interviewRoundTypes[key] === 'assessment')
										.indexOf(uniqueKey) + 1;

									if (isAssessmentRound) {
										return (
											<div key={uniqueKey} style={{
												background: '#fff',
												borderRadius: '12px',
												border: '1px solid #e2e8f0',
												overflow: 'hidden',
												marginBottom: '24px',
												boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
												width: '100%'
											}}>
										<div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14 }}>
											<div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
														<span style={{
															fontSize: 14,
															fontWeight: 700,
															color: '#334155',
															background: '#e2e8f0',
															border: '1px solid #cbd5e1',
															borderRadius: '8px',
															width: '32px',
															height: '32px',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center'
														}}>
															{stageNumber}
														</span>
										<div style={{ minWidth: 0, flex: 1 }}>
											<h4 style={{ margin: 0, fontSize: 16, color: "#1e293b", fontWeight: 700, whiteSpace: 'normal', lineHeight: 1.35 }}>
												Stage {stageNumber}: MCQ/Assessment Schedule {assessmentIndex}
											</h4>
													<div style={{ fontSize: 12, color: "#aa2c2c" }}>Set the date and time window for candidates (end time is auto-fetched).</div>
												</div>
											</div>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: isMobile ? '100%' : 'min(100%, 380px)', maxWidth: isMobile ? '100%' : '380px', alignSelf: 'flex-start' }}>
												<label style={{ ...label, marginBottom: 0, color: '#475569', fontWeight: 600 }}>
													<i className="fa fa-list-alt" style={{ marginRight: 8, color: '#ff6b35' }}></i>
													Choose Assessment
												</label>
												<AssessmentSearchSelect
													assessments={availableAssessments}
													value={selectedAssessmentForRound}
													onSelect={(newAssessmentId) => handleAssessmentRoundSelection(uniqueKey, newAssessmentId)}
													employerType={employerType}
													minWidth="100%"
													containerStyle={{
														width: '100%',
														maxWidth: '100%',
														minWidth: 0
													}}
													inputStyle={{
														...input,
														cursor: 'text',
														borderColor: selectedAssessmentForRound ? '#10b981' : '#cbd5e1',
														borderRadius: '10px',
														background: '#fff',
														fontSize: 14,
														minWidth: '100%'
													}}
												/>
											</div>
												</div>

												<div
													data-assessment-key={uniqueKey}
													style={{
														display: 'grid',
														gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
														gap: '20px',
														padding: '20px',
														background: '#fff'
													}}
												>
													<div style={{
														display: 'flex',
														flexDirection: 'column',
														gap: 8
													}}>
														<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
															<label style={{ ...label, marginBottom: 0, color: '#475569', fontWeight: 600 }}>
																<i className="fa fa-calendar" style={{ marginRight: 8, color: '#ff6b35' }}></i>
																Assessment Date
															</label>
															{details?.fromDate && (
																<div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
																	<i className="fa fa-check"></i>
																	Saved
																</div>
															)}
														</div>
														<input
															style={{
																...input,
																fontSize: 14,
																padding: '10px 12px',
																borderRadius: '8px',
																border: '1px solid #cbd5e1',
																background: '#f8fafc'
															}}
															type="date"
															min={getMinDateForRound(uniqueKey)}
															value={details.fromDate || ''}
															onChange={(e) => updateRoundDetails(uniqueKey, 'fromDate', e.target.value)}
														/>
														<HolidayIndicator date={details.fromDate} />
													</div>
													<div style={{
														display: 'flex',
														flexDirection: 'column',
														gap: 8
													}}>
														<label style={{ ...label, marginBottom: 0, color: '#475569', fontWeight: 600 }}>
															<i className="fa fa-clock" style={{ marginRight: 8, color: '#ff6b35' }}></i>
															Start Time
														</label>
														<input
															style={{
																...input,
																fontSize: 14,
																padding: '10px 12px',
																borderRadius: '8px',
																border: '1px solid #cbd5e1',
																background: '#f8fafc'
															}}
															type="time"
															value={details.startTime || ''}
															onChange={(e) => updateRoundDetails(uniqueKey, 'startTime', e.target.value)}
														/>
													</div>
													<div style={{
														display: 'flex',
														flexDirection: 'column',
														gap: 8
													}}>
														<label style={{ ...label, marginBottom: 0, color: '#475569', fontWeight: 600 }}>
															<i className="fa fa-hourglass-end" style={{ marginRight: 8, color: '#ff6b35' }}></i>
															End Time
															<span style={{
																fontSize: 11,
																color: '#10b981',
																fontWeight: 500,
																marginLeft: 8,
																background: '#d1fae5',
																padding: '2px 8px',
																borderRadius: 4,
															}}>
																Auto-calculated
															</span>
														</label>
														<input
															style={{
																...input,
																fontSize: 14,
																padding: '10px 12px',
																borderRadius: '8px',
																border: '1px solid #cbd5e1',
																background: '#f0fdf4',
																cursor: 'not-allowed'
															}}
															type="time"
															value={details.endTime || ''}
															readOnly
															disabled
														/>
														<small style={{ color: '#10b981', fontSize: 11, marginTop: 4, display: 'block' }}>
															<i className="fa fa-info-circle" style={{ marginRight: 4 }}></i>
															Auto-calculated based on assessment selection
														</small>
													</div>
												</div>

												{selectedAssessmentForRound && (
													<>
														<div style={{
															margin: '0 20px 12px',
															padding: '16px',
															background: '#fffbeb',
															borderRadius: 12,
															color: '#92400e',
															fontSize: 13,
															display: 'flex',
															alignItems: 'flex-start',
															gap: 12,
															border: '1px solid #fde68a',
															boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
														}}>
															<div style={{
																background: '#fef3c7',
																padding: '8px',
																borderRadius: '10px',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center'
															}}>
																<i className="fa fa-calendar-alt" style={{fontSize: 18, color: '#d97706'}}></i>
															</div>
															<div style={{ flex: 1 }}>
																<div style={{fontWeight: 700, marginBottom: 4, fontSize: 14, color: '#78350f'}}>Assessment Schedule</div>
																<div style={{fontSize: 13, opacity: 0.9, lineHeight: '1.5'}}>
																	{details?.fromDate && details?.startTime && details?.endTime ? (
																		<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
																			<span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
																				{formatDate(details.fromDate)}
																			</span>
																			<span>at</span>
																			<span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
																				{formatTimeToAMPM(details.startTime)} - {formatTimeToAMPM(details.endTime)}
																			</span>
																		</div>
																	) : 'Set assessment dates and times above to see the schedule'}
																</div>
															</div>
														</div>

														<div style={{
															margin: '0 20px 20px',
															padding: '16px',
															background: '#eff6ff',
															borderRadius: 12,
															color: '#1e40af',
															fontSize: 13,
															display: 'flex',
															alignItems: 'flex-start',
															gap: 12,
															border: '1px solid #bfdbfe',
															boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
														}}>
															<div style={{
																background: '#dbeafe',
																padding: '8px',
																borderRadius: '10px',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center'
															}}>
																<i className="fa fa-info-circle" style={{fontSize: 18, color: '#2563eb'}}></i>
															</div>
															<div style={{ flex: 1 }}>
																<div style={{fontWeight: 700, marginBottom: 4, fontSize: 14, color: '#1e3a8a'}}>Assessment Time Restriction</div>
																<div style={{fontSize: 13, opacity: 0.9, lineHeight: '1.5'}}>Candidates can only access the assessment during the specified date/time window you set above</div>
															</div>
														</div>
													</>
												)}
											</div>
										);
									}
									
									return (
										<div key={uniqueKey} style={{
											background: '#fff',
											borderRadius: '12px',
											border: '1px solid #e2e8f0',
											overflow: 'hidden',
											marginBottom: '24px',
											boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
											width: '100%'
										}}>
											<div style={{
												padding: "12px 16px",
												background: "#f8fafc",
												borderBottom: "1px solid #e2e8f0",
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												gap: 12,
												flexWrap: 'wrap'
											}}>
												<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
													<span style={{
														fontSize: 14,
														fontWeight: 700,
														color: '#fff',
														background: '#ff6b35',
														borderRadius: '8px',
														width: '32px',
														height: '32px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														flexShrink: 0
													}}>
														{stageNumber}
													</span>
													<h4 style={{ margin: 0, fontSize: 16, color: "#1e293b", fontWeight: 700 }}>
														Stage {stageNumber}: {displayName}
													</h4>
												</div>
											</div>

											<div style={{ padding: '20px', background: '#fff' }}>
											{/* Description + Date Range + Lunch Break Section */}
											<div data-interview-round-details style={{
												display: 'flex',
												gap: isMobile ? '12px' : '20px',
												alignItems: 'stretch',
												flexWrap: isMobile ? 'wrap' : 'nowrap'
											}}>
												{/* Description Card */}
												<div style={{
													padding: '16px',
													borderRadius: '12px',
													flex: '1',
													minWidth: '200px',
													display: 'flex',
													flexDirection: 'column',
													gap: '8px'
												}}>
													<label style={{ fontSize: '16px', color: '#9ca3af', letterSpacing: '0.5px' }}>
														Interview Process Description <span style={redAsterisk}>*</span>
													</label>
													<textarea
														data-interview-round-description="true"
														style={{
															border: '1px solid #e5e7eb',
															fontSize: '14px',
															resize: 'none',
															width: '100%',
															minHeight: '60px',
															overflow: 'hidden',
															outline: 'none',
															borderRadius: '8px',
															padding: '8px'
														}}
														rows={1}
														placeholder="Describe the interview round..."
														value={details.description || ''}
														onChange={(e) => {
															autoResizeTextarea(e.target);
															updateRoundDetails(uniqueKey, 'description', e.target.value);
														}}
													/>
												</div>

												{/* Date Range Inputs */}
												<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '200px' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
														<label style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>Date Range</label>
														<span style={{
															background: '#d1fae5',
															color: '#059669',
															padding: '2px 8px',
															borderRadius: '12px',
															fontSize: '11px',
															fontWeight: '600'
														}}>SYNCED</span>
													</div>
													<div style={{
														border: '1px solid #e5e7eb',
														borderRadius: '10px',
														padding: '12px',
														display: 'flex',
														flexDirection: 'column',
														gap: '8px'
													}}>
														{/* Note inside date range card */}
														<div style={{
															display: 'flex',
															alignItems: 'flex-start',
															gap: 8,
															padding: '8px 10px',
															background: '#eff6ff',
															border: '1px solid #bfdbfe',
															borderRadius: '8px',
														}}>
															<i className="fa fa-info-circle" style={{ color: '#2563eb', fontSize: 13, marginTop: 2, flexShrink: 0 }}></i>
															<span style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>
																<strong>Select a date range</strong> by specifying the <strong>start date</strong> and <strong>end date</strong> of the interview process.
															</span>
														</div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
															<span style={{ fontSize: '12px', color: '#9ca3af', width: isMobile ? 'auto' : '50px', minWidth: '45px' }}>START:</span>
															<input
																type="date"
																style={{
																	border: '1px solid #e5e7eb',
																	fontSize: '14px',
																	outline: 'none',
																	width: '100%',
																	padding: '8px 10px',
																	borderRadius: '6px',
																	background: '#fff'
																}}
																min={getMinDateForRound(uniqueKey)}
																value={details.fromDate || ''}
																onChange={(e) => updateRoundDetails(uniqueKey, 'fromDate', e.target.value)}
															/>
														</div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
															<span style={{ fontSize: '12px', color: '#9ca3af', width: isMobile ? 'auto' : '50px', minWidth: '45px' }}>END:</span>
															<input
																type="date"
																style={{
																	border: '1px solid #e5e7eb',
																	fontSize: '14px',
																	outline: 'none',
																	width: '100%',
																	padding: '8px 10px',
																	borderRadius: '6px',
																	background: '#fff'
																}}
																min={details.fromDate || today}
																value={details.toDate || ''}
																onChange={(e) => updateRoundDetails(uniqueKey, 'toDate', e.target.value)}
															/>
														</div>
														<div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
															<label style={{ fontSize: '14px', color: '#9ca3af', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Number of Days</label>
															<input
																type="number"
																min="1"
																max="100"
																placeholder="Enter number of days..."
																list={`days-list-${uniqueKey}`}
																value={selectedDayCount[uniqueKey] || ''}
																onChange={(e) => {
																	const dayCount = parseInt(e.target.value);
																	setSelectedDayCount(prev => ({ ...prev, [uniqueKey]: dayCount }));
																	if (dayCount > 0) {
																		generateSubStagesForDays(uniqueKey, dayCount);
																	}
																}}
																style={{
																	padding: '8px 10px',
																	borderRadius: '6px',
																	border: '1px solid #e5e7eb',
																	fontSize: '13px',
																	fontWeight: '500',
																	color: '#374151',
																	background: '#fff',
																	width: '100%',
																	outline: 'none'
																}}
															/>
															<datalist id={`days-list-${uniqueKey}`}>
																{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
																	<option key={day} value={day} />
																))}
															</datalist>
															<div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '7px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginTop: '6px' }}>
																<i className="fa fa-info-circle" style={{ color: '#d97706', fontSize: 12, marginTop: 2, flexShrink: 0 }}></i>
																<span style={{ fontSize: 11, color: '#78350f', lineHeight: 1.5 }}>Enter the number of days available for scheduling interview slots for candidates to attend.</span>
															</div>
														</div>
													</div>
												</div>


											</div>

											{/* Note for slot-based scheduling */}
											<div style={{
												marginTop: 16,
												padding: '12px 16px',
												background: '#fffbeb',
												border: '1px solid #fde68a',
												borderRadius: 10,
												display: 'flex',
												alignItems: 'flex-start',
												gap: 10
											}}>
												<i className="fa fa-info-circle" style={{ color: '#d97706', fontSize: 15, marginTop: 2, flexShrink: 0 }}></i>
												<div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
													<span style={{ fontWeight: 700, color: '#92400e' }}>Note: </span>
                                                    The date range represents the overall interview <strong>timeline</strong>, while the number of days indicates the specific days available for candidates to select and book their interview slots. The available dates and time slots will be displayed accordingly based on the configured settings.
												</div>
											</div>

											{/* Divider Line */}
											<div style={{ borderTop: '1px dashed #d1d5db', margin: '24px 0' }}></div>

											{/* Populated Stages Section */}
											<div>
												<div style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													marginBottom: '16px'
												}}>
													<label style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1px', fontWeight: 'bold', display: 'none' }}>POPULATED STAGES</label>
												</div>

												{subStages.map((subStage, subIndex) => (
													<div key={subStage.id} style={{
														background: 'white',
														padding: '16px',
														borderRadius: '12px',
														marginBottom: '16px'
													}}>
														<div style={{ marginBottom: '12px' }}>
															<div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
																<span><i className="fa fa-layer-group" style={{ marginRight: '6px', color: '#ff6b35' }}></i>Day {subIndex + 1}</span>
															</div>
														</div>
														<div data-sub-stage-flex style={{
															display: 'flex',
															gap: isMobile ? '12px' : '20px',
															flexWrap: 'wrap'
														}}>
															<div style={{ flex: 1, minWidth: isMobile ? '100%' : '150px' }}>
																<label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
																	<i className="fa fa-calendar"></i> DATE
																</label>
																<div style={{ position: 'relative' }}>
																<input
																	type="date"
																	style={{
																		background: '#f9fafb',
																			border: '1px solid #e5e7eb',
																			borderRadius: '10px',
																			padding: '10px 14px',
																			width: '100%',
																			fontSize: '14px'
																	}}
																	min={getMinDateForSubStage(uniqueKey, subIndex)}
																	value={subStage.fromDate || ''}
																	onChange={async (e) => {
																		let selectedDate = e.target.value;
																		if (!selectedDate) return;

																		const normalizedDate = normalizeToYMD(selectedDate);
																		if (normalizedDate) selectedDate = normalizedDate;

																		const minSubStageDate = getMinDateForSubStage(uniqueKey, subIndex);
																		if (minSubStageDate && selectedDate < minSubStageDate) {
																			showWarning(`Day ${subIndex + 1} must be scheduled on ${formatDate(minSubStageDate)} or later.`);
																			return;
																		}

																		const holidayCheck = await holidaysApi.checkHoliday(selectedDate);
																		const localHolidayName = getLocalHolidayName(selectedDate);
																		const isWeekend = isWeekendDate(selectedDate);
																		const isHolidayLikeFromApi = Boolean(
																			holidayCheck?.success && (holidayCheck.isHoliday || holidayCheck.isNonWorkingDay || holidayCheck.isWeekend)
																		);
																		const shouldConfirmHoliday = isHolidayLikeFromApi || Boolean(localHolidayName) || isWeekend;

																		if (shouldConfirmHoliday) {
																			showConfirmation(
																				getHolidayConfirmationMessage(
																					`Day ${subIndex + 1} interview date`,
																					{
																						scheduling: true,
																						reminder: 'Please also ensure the last date of application is updated accordingly.'
																					}
																				),
																				() => setShowSubStageConfirm({ uniqueKey, subStage, subIndex, selectedDate }),
																				null,
																				'warning',
																				{ confirmText: 'Yes, Continue', cancelText: 'No' }
																			);
																			return;
																		}

																		applySubStageDateChange(uniqueKey, subStage.id, selectedDate);
																		showSuccess(`Date set to ${formatDate(selectedDate)} for Day ${subIndex + 1}`);
																	}}
																/>
															</div>
														</div>
															<div style={{ flex: 1, minWidth: isMobile ? '100%' : '150px' }}>
																<label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
																	<i className="fa fa-clock"></i> START TIME
																</label>
																<div style={{ position: 'relative' }}>
																	<input
																		type="time"
																		style={{
																			background: '#f9fafb',
																			border: '1px solid #e5e7eb',
																			borderRadius: '10px',
																			padding: '10px 14px',
																			width: '100%',
																			fontSize: '14px'
																		}}
																		value={subStage.startTime || ''}
																		onChange={(e) => {
																			const startTime = e.target.value;
																			const endTime = subStage.endTime;
																			
																			if (startTime && endTime) {
																				const [startHour, startMin] = startTime.split(':').map(Number);
																				const [endHour, endMin] = endTime.split(':').map(Number);
																				const startMinutes = startHour * 60 + startMin;
																				const endMinutes = endHour * 60 + endMin;
																				
																				if (startMinutes >= endMinutes) {
																					showWarning('Start time must be before end time');
																					return;
																				}
																			}
																			
																			const updatedSubStages = subStages.map(s => s.id === subStage.id ? { ...s, startTime } : s);
																			setFormData(prev => ({ ...prev, interviewRoundDetails: { ...prev.interviewRoundDetails, [uniqueKey]: { ...prev.interviewRoundDetails[uniqueKey], subStages: updatedSubStages } } }));
																		}}
																	/>
																</div>
															</div>
															<div style={{ flex: 1, minWidth: isMobile ? '100%' : '150px' }}>
																<label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
																	<i className="fa fa-clock"></i> END TIME
																</label>
																<div style={{ position: 'relative' }}>
																	<input
																		type="time"
																		style={{
																			background: '#f9fafb',
																			border: '1px solid #e5e7eb',
																			borderRadius: '10px',
																			padding: '10px 14px',
																			width: '100%',
																			fontSize: '14px'
																		}}
																		value={subStage.endTime || ''}
																		onChange={(e) => {
																			const endTime = e.target.value;
																			const startTime = subStage.startTime;
																			
																			if (startTime && endTime) {
																				const [startHour, startMin] = startTime.split(':').map(Number);
																				const [endHour, endMin] = endTime.split(':').map(Number);
																				const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin) - (subStage.breakTime || 0);
																				
																				if (totalMinutes <= 0) {
																					showError('End time must be after start time (including break time)');
																					return;
																				}
																				
																				const slots = subStage.applicationLimit;
																				if (slots && slots > 0) {
																					const interviewDuration = 60;
																					const requiredMinutes = slots * interviewDuration;
																					
																					if (totalMinutes < requiredMinutes) {
																						showError(`Total interview time (${(totalMinutes/60).toFixed(1)} hours) must be ≥ ${(requiredMinutes/60).toFixed(1)} hours (${slots} slots × 1 hour per candidate)`);
																						return;
																					}
																				}
																			}
																			
																			const updatedSubStages = subStages.map(s => s.id === subStage.id ? { ...s, endTime } : s);
																			setFormData(prev => ({ ...prev, interviewRoundDetails: { ...prev.interviewRoundDetails, [uniqueKey]: { ...prev.interviewRoundDetails[uniqueKey], subStages: updatedSubStages } } }));
																		}}
																	/>
																</div>
															</div>
															<div style={{ display: 'none' }}>
																<label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
																	<i className="fa fa-coffee"></i> BREAK TIME (min)
																</label>
																<input
																	type="number"
																	min="0"
																	placeholder="e.g., 30"
																	style={{
																		background: '#f9fafb',
																		border: '1px solid #e5e7eb',
																		borderRadius: '10px',
																		padding: '10px 14px',
																		width: '100%',
																		fontSize: '14px'
																	}}
																	value={subStage.breakTime || ''}
																	onChange={(e) => {
																		const breakTime = parseInt(e.target.value) || 0;
																		const updatedSubStages = subStages.map(s => s.id === subStage.id ? { ...s, breakTime } : s);
																		setFormData(prev => ({ ...prev, interviewRoundDetails: { ...prev.interviewRoundDetails, [uniqueKey]: { ...prev.interviewRoundDetails[uniqueKey], subStages: updatedSubStages } } }));
																	}}
																/>
															</div>
														</div>
													</div>
												))}
											</div>
											<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
												<button
													disabled={roundType === 'assessment' || !subStages || subStages.length === 0}
													style={{
														background: (roundType !== 'assessment' && subStages && subStages.length > 0) ? '#ff6b35' : '#d1d5db',
														color: 'white',
														borderRadius: '8px',
														padding: '10px 18px',
														fontWeight: '600',
														border: 'none',
														cursor: (roundType !== 'assessment' && subStages && subStages.length > 0) ? 'pointer' : 'not-allowed',
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
														opacity: (roundType !== 'assessment' && subStages && subStages.length > 0) ? 1 : 0.5
													}}
													onClick={async () => {
														if (roundType === 'assessment') {
															showWarning('Schedule Interview button is not available for assessment rounds. Assessment rounds are scheduled separately.');
															return;
														}
														if (!subStages || subStages.length === 0) {
															showWarning(`Please generate days first by entering a number of days in the 'Generate Days' field for ${displayName}`);
															return;
														}
														if (!details?.fromDate) {
															showWarning(`Please set the Date Range for ${displayName}`);
															return;
														}

														const subStagesToSave = subStages.map(sub => ({
															fromDate: sub.fromDate,
															startTime: sub.startTime,
															endTime: sub.endTime,
															breakTime: sub.breakTime || 0
														}));
														const subStageDateRange = getSubStageDateRange(
															subStagesToSave,
															details.fromDate,
															details.toDate || details.fromDate
														);

														try {
															const activeJobId = currentJobId || id;
															if (!activeJobId) {
																showError('Please save the job information first (Step 1) before scheduling interviews.');
																return;
															}

															const token = localStorage.getItem('employerToken');
															const existingRoundId = interviewRoundIds[uniqueKey];
															const url = existingRoundId
																? `http://localhost:5000/api/interview-rounds/${existingRoundId}`
																: 'http://localhost:5000/api/interview-rounds';
															const method = existingRoundId ? 'PUT' : 'POST';

															const response = await fetch(url, {
																method,
																headers: {
																	'Content-Type': 'application/json',
																	'Authorization': `Bearer ${token}`
																},
																body: JSON.stringify({
																	jobId: activeJobId,
																	name: displayName,
																	roundType,
																	fromdate: subStageDateRange.fromDate || details.fromDate,
																	todate: subStageDateRange.toDate || details.toDate || details.fromDate,
																	startTime: details.startTime,
																	endTime: details.endTime,
																	description: details.description,
																	subStages: subStagesToSave,
																	days: subStagesToSave
																})
															});

															if (response.ok) {
																const interviewRound = await response.json();
																setInterviewRoundIds(prev => ({ ...prev, [uniqueKey]: interviewRound._id }));
																// Open in modal instead of new window
																setInterviewModal({
																	isOpen: true,
																	url: `https://schedule.taleglobal.net/rounds/${interviewRound._id}`,
																	title: `Schedule Interview - ${displayName}`,
																	isMaximized: false,
																	isMinimized: false
																});
															} else {
																showError('Failed to create interview round');
															}
														} catch (error) {
															showError('Error creating interview round: ' + error.message);
														}
													}}
												>
													<i className="fa fa-calendar-check"></i>
													Schedule Interview
												</button>
											</div>
											</div>
										</div>
									);
								})
							}
						</div>
						</>
					)}
					</>
					)}

							{/* Disabled duplicate assessment scheduling block */}
							{false && !isAssessmentFirst && formData.interviewRoundOrder
								.filter(key => formData.interviewRoundTypes[key] === 'assessment')
								.map((assessmentKey, assessmentIndex) => {
									const stageNumber = formData.interviewRoundOrder.indexOf(assessmentKey) + 1;
									return (
										<div key={assessmentKey} style={{
											...fullRow,
											margin: "24px 0",
											background: "#fff",
											borderRadius: "12px",
											border: "1px solid #e2e8f0",
											overflow: "hidden",
											boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
										}}>
											<div style={{
												padding: "12px 16px",
												background: "#f8fafc",
												borderBottom: "1px solid #e2e8f0",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												flexWrap: isMobile ? "wrap" : "nowrap",
												gap: 12
											}}>
												<div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 auto", minWidth: 0 }}>
													<span style={{
														fontSize: 14,
														fontWeight: 700,
														color: '#334155',
														background: '#e2e8f0',
														border: '1px solid #cbd5e1',
														borderRadius: '8px',
														width: '32px',
														height: '32px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center'
													}}>
														{stageNumber}
													</span>
													<div style={{ minWidth: 0 }}>
														<h4 style={{ margin: 0, fontSize: 16, color: "#1e293b", fontWeight: 700, whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
															Stage {stageNumber}: MCQ/Assessment Schedule {assessmentIndex + 1}
														</h4>
														<div style={{ fontSize: 12, color: "#aa2c2c" }}>Set the date and time window for candidates (end time is auto-fetched).</div>
													</div>
												</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
													<button
														style={{
															background: '#10b981',
															color: '#fff',
															border: 'none',
															padding: '8px 16px',
															borderRadius: 8,
															cursor: 'pointer',
															fontSize: 13,
															fontWeight: 600,
															display: 'flex',
															alignItems: 'center',
															gap: 6,
															transition: 'all 0.2s',
															boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
														}}
														onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
														onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
														onClick={() => {
															const assessmentDetails = formData.interviewRoundDetails[assessmentKey];
															
															if (!assessmentDetails?.assessmentId) {
																showWarning('Please select an assessment first');
																return;
															}
															
															if (!assessmentDetails?.fromDate) {
																showWarning(`Please set the Date for Assessment ${assessmentIndex + 1}`);
																return;
															}
															
															setScheduledRounds(prev => ({...prev, [assessmentKey]: true}));
															showSuccess(`Assessment ${assessmentIndex + 1} details saved locally!`);
														}}
													>
														<i className="fa fa-save"></i>
														Save Schedule
													</button>
													<div 
														style={{
															width: '32px',
															height: '32px',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															borderRadius: '8px',
															background: '#eff6ff',
															color: '#3b82f6',
															cursor: 'pointer',
															transition: 'all 0.2s'
														}}
														onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
														onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
														title="View in timeline"
														onClick={() => {
															const assessmentSection = document.querySelector(`[data-assessment-key="${assessmentKey}"]`);
															if (assessmentSection) {
																assessmentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
																const parent = assessmentSection.parentElement;
																if (parent) {
																	parent.style.borderColor = '#3b82f6';
																	parent.style.ring = '2px solid #3b82f6';
																	setTimeout(() => {
																		parent.style.borderColor = '#e2e8f0';
																		parent.style.ring = 'none';
																	}, 2000);
																}
															}
														}}
													>
													</div>
												</div>
											</div>
											<div 
												data-assessment-key={assessmentKey}
												style={{ 
													display: 'grid', 
													gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
													gap: 20,
													padding: 20,
													background: '#fff',
												}}>
												<div style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 8
												}}>
													<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
														<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
															<i className="fa fa-calendar" style={{marginRight: 8, color: '#ff6b35'}}></i>
															Assessment Date
														</label>
														{formData.interviewRoundDetails[assessmentKey]?.fromDate && (
															<div style={{fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0'}}>
																<i className="fa fa-check"></i>
																Saved
															</div>
														)}
													</div>
													<input
														style={{
															...input, 
															fontSize: 14, 
															padding: '10px 12px',
															borderRadius: '8px',
															border: '1px solid #cbd5e1',
															background: '#f8fafc'
														}}
													type="date"
													min={getMinDateForRound(assessmentKey)}
													value={formData.interviewRoundDetails[assessmentKey]?.fromDate || ''}
													onChange={(e) => updateRoundDetails(assessmentKey, 'fromDate', e.target.value)}
												/>
													<HolidayIndicator date={formData.interviewRoundDetails[assessmentKey]?.fromDate} />
												</div>
												<div style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 8
												}}>
													<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
														<i className="fa fa-clock" style={{marginRight: 8, color: '#ff6b35'}}></i>
														Start Time
													</label>
													<input
														style={{
															...input, 
															fontSize: 14, 
															padding: '10px 12px',
															borderRadius: '8px',
															border: '1px solid #cbd5e1',
															background: '#f8fafc'
														}}
														type="time"
														value={formData.interviewRoundDetails[assessmentKey]?.startTime || ''}
														onChange={(e) => updateRoundDetails(assessmentKey, 'startTime', e.target.value)}
													/>
												</div>
												<div style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 8
												}}>
													<label style={{...label, marginBottom: 0, color: '#475569', fontWeight: 600}}>
														<i className="fa fa-hourglass-end" style={{marginRight: 8, color: '#ff6b35'}}></i>
														End Time
														<span style={{
															fontSize: 11,
															color: '#10b981',
															fontWeight: 500,
															marginLeft: 8,
															background: '#d1fae5',
															padding: '2px 8px',
															borderRadius: 4,
														}}>
															✓ Auto-calculated
														</span>
													</label>
													<input
														style={{
															...input, 
															fontSize: 14, 
															padding: '10px 12px',
															borderRadius: '8px',
															border: '1px solid #cbd5e1',
															background: '#f0fdf4',
															cursor: 'not-allowed'
														}}
														type="time"
														value={formData.interviewRoundDetails[assessmentKey]?.endTime || ''}
														readOnly
														disabled
													/>
													<small style={{color: '#10b981', fontSize: 11, marginTop: 4, display: 'block'}}>
														<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
														Auto-calculated based on assessment selection
													</small>
												</div>
											</div>
										</div>
									);
								})}
					{/* Interview Schedule Summary */}
					{currentStep === 2 && formData.interviewRoundOrder.length > 0 && (
						<div style={fullRow}>
							<div style={{
								padding: 16,
								background: '#f8fafc',
								border: '2px solid #e2e8f0',
								borderRadius: 12,
								marginBottom: 16
							}}>
								<h4 style={{
									margin: '0 0 12px 0',
									fontSize: 16,
									color: '#1e293b',
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8
								}}>
									<i className="fa fa-calendar-check" style={{color: '#3b82f6'}}></i>
									Interview Schedule Summary
								</h4>
								<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12}}>
									{formData.interviewRoundOrder.map((uniqueKey, index) => {
										const roundType = formData.interviewRoundTypes[uniqueKey];
										const details = formData.interviewRoundDetails[uniqueKey];
										const roundNames = {
											technical: 'Technical',
											managerial: 'Managerial Round',
											hr: 'HR Round',
											oneOnOnePanel: 'One-on-One / Panel',
											group: 'Group',
											situational: 'Situational / Behavioral',
											assessment: 'Assessment',
											others: 'Others – Specify.'
										};
										
										const customType = roundType === 'others' ? details?.customType : null;
										const displayName = customType || roundNames[roundType];
										
										return (
											<div key={uniqueKey} style={{
												padding: 12,
												background: '#fff',
												border: '1px solid #e2e8f0',
												borderRadius: 8,
												boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
											}}>
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: 8,
													marginBottom: 8
												}}>
													<span style={{
														fontSize: 12,
														fontWeight: 700,
														color: '#fff',
														background: '#3b82f6',
														borderRadius: '50%',
														width: '20px',
														height: '20px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center'
													}}>
														{index + 1}
													</span>
													<span style={{fontSize: 14, fontWeight: 600, color: '#1e293b'}}>
														{displayName} Round
													</span>
												</div>
												{details?.fromDate ? (
													<div style={{fontSize: 13, color: '#6b7280', fontWeight: 500}}>
														<div style={{marginBottom: 4}}>
															<i className="fa fa-calendar" style={{marginRight: 6}}></i>
															{formatDate(details.fromDate)}
														</div>
														{(details.startTime || details.endTime) && (
															<div>
																<i className="fa fa-clock" style={{marginRight: 4}}></i>
																{details.startTime ? formatTimeToAMPM(details.startTime) : 'N/A'} - {details.endTime ? formatTimeToAMPM(details.endTime) : 'N/A'}
															</div>
														)}
													</div>
												) : (
													<div style={{fontSize: 13, color: '#ef4444', fontStyle: 'italic'}}>
														<i className="fa fa-exclamation-triangle" style={{marginRight: 6}}></i>
														Date not set
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
			</div>



			{/* Action Buttons */}
			<div style={{ 
				display: "flex", 
				flexDirection: isMobile ? "column" : "row",
				justifyContent: "flex-end", 
				marginTop: isMobile ? 24 : 32,
				paddingTop: isMobile ? 16 : 24,
				borderTop: '2px solid #f3f4f6',
				gap: 16,
			}}>
				{currentStep === 2 && (
					<button
						onClick={handlePrevious}
						style={{
							background: "transparent",
							color: "#64748b",
							border: "2px solid #e2e8f0",
							padding: "12px 32px",
							borderRadius: 8,
							cursor: "pointer",
							fontSize: 15,
							fontWeight: 600,
							transition: "all 0.2s ease",
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = '#f8fafc';
							e.currentTarget.style.borderColor = '#cbd5e1';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'transparent';
							e.currentTarget.style.borderColor = '#e2e8f0';
						}}
					>
						<i className="fa fa-arrow-left"></i>
						Previous Step
					</button>
				)}

				<button
					onClick={currentStep === 1 ? handleNext : handleSubmitClick}
					style={{
						background: currentStep === 1 ? "#3b82f6" : "transparent",
						color: currentStep === 1 ? "#fff" : "#ff6b35",
						border: `2px solid ${currentStep === 1 ? "#3b82f6" : "#ff6b35"}`,
						padding: "12px 32px",
						borderRadius: 8,
						cursor: "pointer",
						fontSize: 15,
						fontWeight: 600,
						transition: "all 0.2s ease",
						boxShadow: currentStep === 1 ? "0 4px 12px rgba(59,130,246,0.1)" : "0 4px 12px rgba(255,107,53,0.1)",
						display: 'flex',
						alignItems: 'center',
						gap: 8,
					}}
					onMouseEnter={(e) => {
						const primaryColor = currentStep === 1 ? '#2563eb' : '#ff6b35';
						e.currentTarget.style.background = primaryColor;
						e.currentTarget.style.color = '#fff';
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 16px ${currentStep === 1 ? 'rgba(59,130,246,0.4)' : 'rgba(255,107,53,0.4)'}`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = currentStep === 1 ? "#3b82f6" : "transparent";
						e.currentTarget.style.color = currentStep === 1 ? "#fff" : "#ff6b35";
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = currentStep === 1 ? "0 4px 12px rgba(59,130,246,0.1)" : "0 4px 12px rgba(255,107,53,0.1)";
					}}
				>
					{currentStep === 1 ? (
						<>
							Continue to Interview Process
							<i className="fa fa-arrow-right"></i>
						</>
					) : (
						<>
							<i className="fa fa-paper-plane"></i>
							Post Job
						</>
					)}
				</button>
			</div>
			
			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 9999
				}}>
					<div style={{
						background: '#fff',
						borderRadius: 12,
						padding: '24px',
						maxWidth: '420px',
						width: 'min(92vw, 420px)',
						boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
					}}>
						<div style={{textAlign: 'center', marginBottom: 24}}>
							<div style={{
								width: 60,
								height: 60,
								background: '#fff3cd',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								margin: '0 auto 16px'
							}}>
								<i className="fa fa-exclamation-triangle" style={{fontSize: 28, color: '#ff6b35'}}></i>
							</div>
							<h3 style={{margin: 0, fontSize: 22, color: '#1f2937', fontWeight: 700}}>
								Confirm Submission
							</h3>
						</div>
						<p style={{fontSize: 15, color: '#4b5563', lineHeight: 1.6, marginBottom: 24, textAlign: 'center'}}>
							{currentStep === 2 
								? "Are you sure you want to post this job? Once posted, it cannot be edited or deleted. Please review the details before confirming."
								: isEditMode 
									? "Are you sure you want to update this job? Once updated, the changes will be reflected immediately."
									: "Are you sure you want to submit this job? Please review all details carefully before proceeding."}
						</p>
						<div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
							<button
								onClick={() => setShowConfirmModal(false)}
								style={{
									background: '#e5e7eb',
									color: '#374151',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#e5e7eb'}
							>
								Cancel
							</button>
							<button
								onClick={submitNext}
								style={{
									background: '#ff6b35',
									color: '#fff',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
							>
								{currentStep === 2 ? 'Yes, Post Job' : (isEditMode ? 'Yes, Update' : 'Yes, Submit')}
							</button>
						</div>
					</div>
				</div>
			)}
			
			{/* SubStage Date Confirmation Modal */}
			{showSubStageConfirm && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 9999
				}}>
					<div style={{
						background: '#fff',
						borderRadius: 12,
						padding: '32px',
						maxWidth: '500px',
						width: '90%',
						boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
					}}>
						<div style={{textAlign: 'center', marginBottom: 24}}>
							<div style={{
								width: 60,
								height: 60,
								background: '#dbeafe',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								margin: '0 auto 16px'
							}}>
								<i className="fa fa-clock" style={{fontSize: 28, color: '#3b82f6'}}></i>
							</div>
							<h3 style={{margin: 0, fontSize: 22, color: '#1f2937', fontWeight: 700}}>
								Confirm Day Starting Time
							</h3>
						</div>
						<p style={{fontSize: 15, color: '#4b5563', lineHeight: 1.6, marginBottom: 16, textAlign: 'center'}}>
							Are you sure you want to set the date to <strong>{formatDate(showSubStageConfirm.selectedDate)}</strong> for Day {showSubStageConfirm.subIndex + 1}?
						</p>
						<div style={{fontSize: 13, color: '#dc2626', lineHeight: 1.5, marginBottom: 24, textAlign: 'left', background: '#fef2f2', padding: '12px', borderRadius: 8, border: '1px solid #fecaca'}}>
							<strong>⚠️ Important:</strong> The total interview time (start time − end time) must be greater than or equal to the total required duration.<br/><br/>
							<strong>Total required duration</strong> = total slots × interview duration per candidate.<br/><br/>
							<strong>Example:</strong> If total slots = 10 and interview duration = 1 hour, then total interview time must be ≥ 10 hours.
						</div>
						<div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
							<button
								onClick={() => {
									const { uniqueKey, subStage, subIndex, selectedDate } = showSubStageConfirm;
									applySubStageDateChange(uniqueKey, subStage.id, selectedDate);
									showSuccess(`Date set to ${formatDate(selectedDate)} for Day ${subIndex + 1}`);
									setShowSubStageConfirm(null);
								}}
								style={{
									background: '#3b82f6',
									color: '#fff',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
							>
								Yes
							</button>
							<button
								onClick={() => setShowSubStageConfirm(null)}
								style={{
									background: '#e5e7eb',
									color: '#374151',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#e5e7eb'}
							>
								No
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Interview Scheduling Modal */}
			{interviewModal.isOpen && (
				<div className={`document-modal-overlay ${interviewModal.isMinimized ? 'minimized-overlay' : ''}`} onClick={() => setInterviewModal({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false })}>
					<div className={`document-modal-container ${interviewModal.isMaximized ? 'maximized' : ''} ${interviewModal.isMinimized ? 'minimized' : ''}`} onClick={e => e.stopPropagation()}>
						<div className="document-modal-header" onClick={() => interviewModal.isMinimized && setInterviewModal(prev => ({ ...prev, isMinimized: false }))}>
							<h3>{interviewModal.title}</h3>
							<div className="modal-controls">
								<button className="modal-btn" onClick={(e) => { e.stopPropagation(); setInterviewModal(prev => ({ ...prev, isMinimized: !prev.isMinimized })); }}>
									<i className={`fas ${interviewModal.isMinimized ? 'fa-window-restore' : 'fa-minus'}`}></i>
								</button>
								<button className="modal-btn" onClick={(e) => { e.stopPropagation(); setInterviewModal(prev => ({ ...prev, isMaximized: !prev.isMaximized, isMinimized: false })); }}>
									<i className={`fas ${interviewModal.isMaximized ? 'fa-compress' : 'fa-expand'}`}></i>
								</button>
								<button className="modal-btn close" onClick={() => setInterviewModal({ isOpen: false, url: '', title: '', isMaximized: false, isMinimized: false })}>
									<i className="fas fa-times"></i>
								</button>
							</div>
						</div>
						<div className="document-modal-body">
							<iframe src={interviewModal.url} title={interviewModal.title} />
						</div>
					</div>
				</div>
			)}

			{previewImage && (
				<ImagePreviewModal
					src={previewImage}
					alt={previewAlt}
					onClose={closeImagePreview}
				/>
			)}

			<ImageResizer
				src={currentImage}
				isOpen={isResizerOpen}
				onClose={closeResizer}
				onSave={handleResizerSave}
				aspectRatio={resizeConfig.aspectRatio}
				maxWidth={resizeConfig.maxWidth}
				maxHeight={resizeConfig.maxHeight}
				lockCropArea={resizeConfig.lockCropArea}
				quality={resizeConfig.quality}
			/>
		</div>
	);
}
